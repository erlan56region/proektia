import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AGENT_DIR = fileURLToPath(new URL('.', import.meta.url));

/** Minimal .env reader: real environment variables always win. */
export function loadEnv(path = '.env') {
  const file = resolve(path);
  if (!existsSync(file)) return;
  for (const rawLine of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
];

const int = (value, fallback) => {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function getConfig() {
  return {
    ollama: {
      baseUrl: (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/$/, ''),
      model: process.env.OLLAMA_MODEL || 'qwen2.5:7b',
      numCtx: int(process.env.OLLAMA_NUM_CTX, 16384),
      timeoutMs: int(process.env.OLLAMA_TIMEOUT_MS, 180000),
    },
    drive: {
      accessToken: process.env.GOOGLE_ACCESS_TOKEN || null,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN || null,
      clientId: process.env.GOOGLE_CLIENT_ID || null,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || null,
      serviceAccountFile: process.env.GOOGLE_SERVICE_ACCOUNT_FILE || null,
      impersonate: process.env.GOOGLE_IMPERSONATE || null,
      redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4321/oauth2callback',
      workspaceFolderId: process.env.DRIVE_WORKSPACE_FOLDER_ID || '1txbPb1oZfEijx67rDzgadeVgTzjPwZdg',
      reportsFolderId: process.env.DRIVE_REPORTS_FOLDER_ID || null,
      tasksSheetId: process.env.DRIVE_TASKS_SHEET_ID || '1pchl2sUyXToxJsme6246Kgv1w0vMl2cAHItEIEppLDA',
    },
    web: {
      provider: (process.env.WEB_SEARCH_PROVIDER || 'duckduckgo').toLowerCase(),
      tavilyKey: process.env.TAVILY_API_KEY || null,
      braveKey: process.env.BRAVE_API_KEY || null,
      timeoutMs: int(process.env.WEB_TIMEOUT_MS, 15000),
      maxChars: int(process.env.WEB_MAX_CHARS, 12000),
    },
    agent: {
      maxSteps: int(process.env.AGENT_MAX_STEPS, 14),
      maxWriteOps: int(process.env.AGENT_MAX_WRITE_OPS, 5),
      pollIntervalMs: int(process.env.AGENT_POLL_INTERVAL_MS, 900000),
      dryRun: process.env.AGENT_DRY_RUN === '1',
      allowDangerous: process.env.AGENT_ALLOW_DANGEROUS === '1',
      stateFile: resolve(process.env.AGENT_STATE_FILE || '.agent-state/processed.json'),
    },
  };
}

export function loadPrompts() {
  const system = readFileSync(resolve(AGENT_DIR, 'prompts/system.md'), 'utf8');
  const scenarios = readFileSync(resolve(AGENT_DIR, 'prompts/scenarios.md'), 'utf8');
  return { system, scenarios };
}

export function assertOllamaConfig(config) {
  if (!config.ollama.model) throw new Error('Не задан OLLAMA_MODEL');
}

export function assertDriveConfig(config) {
  const d = config.drive;
  const hasAuth = d.accessToken || (d.refreshToken && d.clientId && d.clientSecret) || d.serviceAccountFile;
  if (!hasAuth) {
    throw new Error('Нет данных для входа в Google Drive. См. agent/README.md → «Подключение Drive»');
  }
}
