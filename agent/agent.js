import { loadPrompts } from './config.js';
import { ollamaChat } from './brain.js';
import { safeJsonParse, todayStamp } from './lib/util.js';

const OUTPUT_CONTRACT = `
ПРАВИЛА ИНСТРУМЕНТОВ (исполняются в коде, не в тексте):
- Ответ только на русском, если в задаче не указано иное.
- Сначала собери контекст: 2–3 поиска по Drive и/или интернету, затем пиши.
- Новые файлы создавай только внутри рабочего пространства агента через drive_create_document/drive_create_folder.
- Никогда не меняй оригиналы владельца: для правок используй drive_save_copy.
- Удаление, публикация и смена прав недоступны — если задача требует этого, верни план и запрос подтверждения.
- Если данных не хватает, помечай их как [нужны данные: ...] и не выдумывай.
- Когда результат готов, ВСЕГДА вызови finish_task со структурированным блоком.
- Формат финального блока: «Сделано / Файлы / Требует решения / Предлагаю дальше».
`;

function runtimePrompt(config) {
  const folders = [
    `Рабочая папка: ${config.drive.workspaceFolderId}`,
    `Отчёты: ${config.drive.reportsFolderId || 'папка 06 · Отчёты внутри рабочего пространства'}`,
    `Реестр задач: ${config.drive.tasksSheetId || 'не подключён'}`,
  ].join('\n');
  return `${OUTPUT_CONTRACT}\nТЕКУЩАЯ ДАТА: ${todayStamp()}\n${folders}`;
}

export function buildSystemPrompt(config) {
  const { system, scenarios } = loadPrompts();
  return [system, '\n\n---\n\n', scenarios, '\n\n---\n\n', runtimePrompt(config)].join('');
}

function extractCalls(message) {
  if (message.toolCalls?.length) return message.toolCalls;
  if (!message.content?.trim().startsWith('{')) return [];
  const parsed = safeJsonParse(message.content, null);
  if (!parsed || !Array.isArray(parsed.tool_calls)) return [];
  return parsed.tool_calls.map((call) => {
    const fn = call.function || call;
    return { name: fn.name || call.name, arguments: safeJsonParse(fn.arguments, {}) };
  }).filter((call) => call.name);
}

export async function runAgent({
  task,
  config,
  runtime,
  signal = null,
  onEvent = () => {},
  chat = ollamaChat,
}) {
  const messages = [
    { role: 'system', content: buildSystemPrompt(config) },
    { role: 'user', content: `Задача: ${task}` },
  ];
  const events = [];
  const emit = async (event) => {
    events.push(event);
    await onEvent(event);
  };
  let finalText = '';

  for (let step = 0; step < config.agent.maxSteps; step += 1) {
    const message = await chat({ config, messages, tools: runtime.tools, signal });
    const calls = extractCalls(message);
    if (message.content?.trim()) await emit({ type: 'text', text: message.content.trim() });

    if (!calls.length) {
      finalText = message.content.trim();
      break;
    }

    for (const call of calls) {
      await emit({ type: 'tool_call', name: call.name, args: call.arguments });
      const result = await runtime.execute(call.name, call.arguments);
      await emit({ type: 'tool_result', name: call.name, result });
      messages.push({
        role: 'tool',
        name: call.name,
        content: JSON.stringify({ name: call.name, result }),
      });
      if (call.name === 'finish_task' && result.ok) break;
    }
    if (runtime.state.finished) break;
  }

  if (!runtime.state.finished && !finalText) {
    messages.push({
      role: 'user',
      content: 'Лимит шагов исчерпан. Сформируй финальный блок «Сделано / Файлы / Требует решения / Предлагаю дальше» по имеющимся результатам, не вызывая инструменты.',
    });
    const message = await chat({ config, messages, tools: [], signal });
    finalText = message.content.trim();
  }

  return {
    text: finalText,
    structured: runtime.state.finished,
    toolCalls: runtime.state.calls,
    events,
  };
}

export function formatReport(result, task) {
  const s = result.structured;
  if (!s) return `Задача: ${task}\n\n${result.text || 'Ответ не получен.'}`;
  const files = s.files?.length
    ? s.files.map((file) => `— ${file.name}: ${file.url || 'ссылка не получена'}`).join('\n')
    : '— нет';
  const decisions = s.needsDecision?.length ? s.needsDecision.map((item) => `— ${item}`).join('\n') : '— нет';
  return [
    `Задача: ${task}`,
    '',
    'Сделано:',
    s.summary,
    '',
    'Файлы:',
    files,
    '',
    'Требует решения:',
    decisions,
    '',
    'Предлагаю дальше:',
    s.nextStep || '—',
  ].join('\n');
}
