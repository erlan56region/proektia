#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  assertDriveConfig,
  assertOllamaConfig,
  DRIVE_SCOPES,
  getConfig,
  loadEnv,
  loadPrompts,
} from './config.js';
import { DriveClient } from './drive.js';
import { WebTools } from './web.js';
import { Policy } from './policy.js';
import { createToolRuntime } from './tools.js';
import { runAgent, formatReport } from './agent.js';
import { sleep, todayStamp } from './lib/util.js';
import { TaskRegistry } from './registry.js';

loadEnv();

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (!arg.includes('=') && (argv[i + 1] === undefined || argv[i + 1].startsWith('--'))) {
      flags[key] = true;
    } else if (arg.includes('=')) {
      const index = arg.indexOf('=');
      flags[arg.slice(2, index)] = arg.slice(index + 1);
    } else {
      flags[key] = argv[++i];
    }
  }
  return { command: positional[0], rest: positional.slice(1), flags };
}

function applyFlags(config, flags) {
  if (flags.model) config.ollama.model = flags.model;
  if (flags['max-steps']) config.agent.maxSteps = Number(flags['max-steps']);
  if (flags['dry-run']) config.agent.dryRun = true;
  if (flags['state-file']) config.agent.stateFile = flags['state-file'];
  return config;
}

function makeClients(config) {
  const drive = new DriveClient(config);
  const web = new WebTools(config);
  const policy = new Policy(config, { drive });
  const registry = new TaskRegistry(drive, config);
  const runtime = createToolRuntime({ config, drive, web, policy, registry });
  return { drive, web, policy, registry, runtime };
}

async function resolveReportsFolder(drive, config, create = true) {
  if (config.drive.reportsFolderId) return config.drive.reportsFolderId;
  const found = await drive.findByName('06 · Отчёты', config.drive.workspaceFolderId);
  if (found) return found.id;
  if (!create) return config.drive.workspaceFolderId;
  const folder = await drive.createFolder('06 · Отчёты', [config.drive.workspaceFolderId]);
  return folder.id;
}

async function saveReport(drive, config, title, text) {
  const folderId = await resolveReportsFolder(drive, config);
  const file = await drive.createFile({
    name: title,
    content: text,
    mimeType: 'text/plain',
    targetMimeType: 'application/vnd.google-apps.document',
    parents: [folderId],
  });
  return file;
}

function loadState(path) {
  try {
    const data = JSON.parse(readFileSync(path, 'utf8'));
    return new Set(Array.isArray(data.processed) ? data.processed : []);
  } catch {
    return new Set();
  }
}

function saveState(path, processed) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify({ processed: [...processed] }, null, 2)}\n`);
}

function taskText(row) {
  return [
    row.title,
    row.context ? `\nКонтекст: ${row.context}` : '',
    row.format ? `\nФормат: ${row.format}` : '',
    row.due ? `\nСрок: ${row.due}` : '',
    row.constraints ? `\nОграничения: ${row.constraints}` : '',
  ].join('');
}

function printEvents(events) {
  for (const event of events) {
    if (event.type === 'tool_call') process.stderr.write(`  → ${event.name}\n`);
    if (event.type === 'tool_result' && !event.result.ok) {
      process.stderr.write(`    ! ${event.result.reason || event.result.error}\n`);
    }
  }
}

async function cmdAsk(rest, flags, config) {
  const task = rest.join(' ').trim();
  if (!task) throw new Error('Укажите задачу: npm run agent -- ask "..."');
  assertOllamaConfig(config);
  const { drive, runtime } = makeClients(config);
  if (flags['need-drive'] || flags.save) assertDriveConfig(config);

  const controller = new AbortController();
  process.on('SIGINT', () => controller.abort());
  const result = await runAgent({
    task,
    config,
    runtime,
    signal: controller.signal,
    onEvent: async (event) => {
      if (process.stderr.isTTY || flags.verbose) {
        process.stderr.write(`${event.type}: ${event.name || event.text || ''}\n`);
      }
    },
  });
  const report = formatReport(result, task);
  process.stdout.write(`${report}\n`);
  if (flags.save) {
    const file = await saveReport(drive, config, `${todayStamp()} · Отчёт · Запрос пользователя · v1`, report);
    process.stdout.write(`\nФайл: ${file.webViewLink || file.id}\n`);
  }
}

async function cmdRun(flags, config) {
  assertOllamaConfig(config);
  assertDriveConfig(config);
  const { drive, registry, runtime } = makeClients(config);
  const processed = loadState(config.agent.stateFile);
  const limit = Number(flags.limit) || 3;
  const interval = Number(flags.interval) || 0;
  const once = Boolean(flags.once) || !interval;

  do {
    const tasks = await registry.openTasks(limit);
    const pending = tasks.filter((row) => !processed.has(`${row.__row}:${row.title}`));
    process.stderr.write(`Открытых задач: ${tasks.length}, к выполнению: ${pending.length}\n`);

    for (const row of pending) {
      const task = taskText(row);
      process.stderr.write(`\nЗадача #${row.__row}: ${row.title}\n`);
      let result;
      try {
        result = await runAgent({ task, config, runtime, onEvent: async () => {} });
      } catch (error) {
        process.stderr.write(`Ошибка агента: ${error.message}\n`);
        continue;
      }
      printEvents(result.events);
      const report = formatReport(result, row.title);
      process.stdout.write(`\n${report}\n`);
      if (!config.agent.dryRun) {
        const file = await saveReport(drive, config, `${todayStamp()} · Отчёт · ${row.title.slice(0, 70)} · v1`, report);
        const note = `Отчёт: ${file.webViewLink || file.id}`;
        await registry.markDone(row, result.structured?.status || 'выполнено', note);
        processed.add(`${row.__row}:${row.title}`);
        saveState(config.agent.stateFile, processed);
      }
    }
    if (!once) {
      await sleep(interval);
    }
  } while (!once);
}

async function cmdAuth(rest, config) {
  const d = config.drive;
  if (!d.clientId || !d.clientSecret) throw new Error('Нужны GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET');
  if (rest[0] === 'code') {
    const code = rest[1];
    if (!code) throw new Error('Укажите код: npm run agent -- auth code <код>');
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: d.clientId,
        client_secret: d.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: d.redirectUri,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(`Обмен кода: ${data.error_description || data.error}`);
    process.stdout.write([
      'Добавьте в .env:',
      `GOOGLE_REFRESH_TOKEN=${data.refresh_token}`,
      '',
      'Затем проверьте: npm run agent -- doctor',
      '',
    ].join('\n'));
    return;
  }
  const params = new URLSearchParams({
    client_id: d.clientId,
    redirect_uri: d.redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: DRIVE_SCOPES.join(' '),
    state: randomBytes(8).toString('hex'),
  });
  process.stdout.write([
    'Откройте ссылку, разрешите доступ, скопируйте код из адресной строки (параметр code):',
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
    '',
    'Затем: npm run agent -- auth code <код>',
    '',
  ].join('\n'));
}

async function cmdDoctor(config) {
  const checks = [];
  try {
    const { system, scenarios } = loadPrompts();
    checks.push(`[ok] Инструкции агента загружены (${system.length} + ${scenarios.length} символов)`);
  } catch (error) {
    checks.push(`[error] Инструкции: ${error.message}`);
  }
  try {
    const response = await fetch(`${config.ollama.baseUrl}/api/tags`);
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    const models = (data.models || []).map((model) => model.name);
    const has = models.some((name) => name.startsWith(config.ollama.model));
    checks.push(`${has ? '[ok]' : '[warn]'} Ollama доступен, модель ${config.ollama.model} ${has ? 'найдена' : 'не найдена; выполните ollama pull'}`);
  } catch (error) {
    checks.push(`[error] Ollama: ${error.message}`);
  }
  try {
    assertDriveConfig(config);
    const drive = new DriveClient(config);
    const folder = await drive.getFile(config.drive.workspaceFolderId, 'id,name');
    checks.push(`[ok] Drive: ${folder.name} (${folder.id})`);
    try {
      await drive.sheetsGet(config.drive.tasksSheetId, 'A1:B1');
      checks.push('[ok] Реестр задач доступен через Sheets API');
    } catch (error) {
      checks.push(`[warn] Реестр задач: ${error.message}`);
    }
  } catch (error) {
    checks.push(`[error] Drive: ${error.message}`);
  }
  const provider = config.web.provider;
  const keyRequired = (provider === 'tavily' && !config.web.tavilyKey) || (provider === 'brave' && !config.web.braveKey);
  checks.push(keyRequired ? `[error] Поиск: нет ключа для ${provider}` : `[ok] Поиск: ${provider}`);
  process.stdout.write(`${checks.join('\n')}\n`);
}

function help() {
  process.stdout.write(`Агент CoffeeIT — локальный автономный помощник с Ollama и Google Drive.

Команды:
  doctor                         Проверить настройки и доступы
  auth url                       Ссылка для подключения Google Drive
  auth code <код>                Обменять код на refresh token
  ask "задача" [--save]          Выполнить одну задачу
  run [--once] [--limit N]       Взять открытые задачи из реестра и отчитаться в Drive
  run --interval 900000          Непрерывный режим опроса реестра

Флаги: --dry-run, --model NAME, --max-steps N, --verbose, --state-file PATH
`);
}

async function main() {
  const { command, rest, flags } = parseArgs(process.argv.slice(2));
  const config = applyFlags(getConfig(), flags);
  switch (command) {
    case 'doctor':
      return cmdDoctor(config);
    case 'auth':
      return cmdAuth(rest, config);
    case 'ask':
      return cmdAsk(rest, flags, config);
    case 'run':
      return cmdRun(flags, config);
    default:
      return help();
  }
}

main().catch((error) => {
  process.stderr.write(`Ошибка: ${error.message}\n`);
  process.exitCode = 1;
});
