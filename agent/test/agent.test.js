import test from 'node:test';
import assert from 'node:assert/strict';
import { runAgent, formatReport } from '../agent.js';
import { createToolRuntime, TOOL_DEFINITIONS } from '../tools.js';
import { Policy } from '../policy.js';
import { getConfig } from '../config.js';

const config = getConfig();
config.drive.workspaceFolderId = 'workspace';
config.agent.maxSteps = 6;

function fakeRuntime() {
  const drive = {
    async ancestors(id) { return id === 'workspace' ? ['workspace'] : ['else']; },
    async createFile(args) { return { id: 'file-1', webViewLink: `https://drive.google.com/${args.name}`, ...args }; },
    async createFolder(args) { return { id: 'folder-1', ...args }; },
    async searchFiles() { return { files: [] }; },
    async readFileText() { return { text: 'данные' }; },
    async listChildren() { return { files: [] }; },
    async sheetsGet() { return { values: [['Задача', 'Статус']] }; },
    async sheetsUpdate() { return {}; },
    async sheetsAppend() { return {}; },
  };
  const web = { async search() { return { results: [] }; }, async fetch() { return { text: '' }; } };
  const policy = new Policy(config, { drive });
  return createToolRuntime({ config, drive, web, policy });
}

test('цикл агента: поиск → создание файла → finish_task', async () => {
  const runtime = fakeRuntime();
  let turn = 0;
  const chat = async () => {
    turn += 1;
    if (turn === 1) {
      return { content: '', toolCalls: [{ name: 'web_search', arguments: { query: 'CoffeeIT' } }] };
    }
    if (turn === 2) {
      return { content: '', toolCalls: [{ name: 'drive_create_document', arguments: { name: '2026-11-21 · Отчёт · Тест · v1', content: 'Суть', folderId: 'workspace' } }] };
    }
    return {
      content: '',
      toolCalls: [{
        name: 'finish_task',
        arguments: {
          summary: 'Отчёт готов',
          files: [{ name: 'Отчёт', url: 'https://drive.google.com/file-1' }],
          needsDecision: ['Уточнить период'],
          nextStep: 'Проверить цифры',
        },
      }],
    };
  };

  const result = await runAgent({ task: 'Подготовить отчёт', config, runtime, chat });
  assert.deepEqual(result.toolCalls.map((call) => call.name), ['web_search', 'drive_create_document', 'finish_task']);
  assert.equal(result.structured.summary, 'Отчёт готов');
  const report = formatReport(result, 'Подготовить отчёт');
  assert.match(report, /Сделано:/);
  assert.match(report, /https:\/\/drive\.google\.com\/file-1/);
  assert.match(report, /Предлагаю дальше:/);
});

test('агент не выдумывает результат, если модель ответила текстом', async () => {
  const runtime = fakeRuntime();
  const chat = async () => ({ content: 'Требуется уточнение: нет доступа к файлу.', toolCalls: [] });
  const result = await runAgent({ task: 'Сделай анализ', config, runtime, chat });
  assert.equal(result.structured, null);
  assert.match(result.text, /Требуется уточнение/);
});

test('все инструменты имеют корректную схему', () => {
  const names = TOOL_DEFINITIONS.map((tool) => tool.function.name);
  assert.equal(new Set(names).size, names.length);
  for (const tool of TOOL_DEFINITIONS) {
    assert.equal(tool.type, 'function');
    assert.ok(tool.function.name);
    assert.ok(tool.function.description.length > 10);
    assert.equal(tool.function.parameters.type, 'object');
  }
});
