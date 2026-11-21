import { assertDriveConfig } from './config.js';
import { todayStamp } from './lib/util.js';
import { TaskRegistry } from './registry.js';

const string = (description) => ({ type: 'string', description });
const arrayOfStrings = (description) => ({ type: 'array', items: { type: 'string' }, description });

export const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'drive_search',
      description: 'Искать файлы и папки в Google Drive по имени или содержимому. Запрос — в синтаксисе Drive (например: name contains «Отчёт»).',
      parameters: {
        type: 'object',
        properties: {
          query: string('Drive-запрос, например: name contains "CoffeeIT" and trashed = false'),
          maxResults: { type: 'integer', description: 'Сколько результатов вернуть (по умолчанию 20)' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'drive_read',
      description: 'Прочитать текст файла из Drive. Для Google Docs/Sheets/Slides содержимое экспортируется в текст/CSV. Всегда читай файл, а не догадывайся по названию.',
      parameters: {
        type: 'object',
        properties: {
          fileId: string('ID файла Google Drive'),
          maxChars: { type: 'integer', description: 'Ограничение длины текста (по умолчанию 20000)' },
        },
        required: ['fileId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'drive_list_folder',
      description: 'Перечислить содержимое папки Drive.',
      parameters: {
        type: 'object',
        properties: { folderId: string('ID папки') },
        required: ['folderId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'drive_create_document',
      description: 'Создать новый документ/таблицу/markdown-файл внутри рабочей структуры агента. Оригиналы не трогает.',
      parameters: {
        type: 'object',
        properties: {
          name: string('Имя вида «ГГГГ-ММ-ДД · Тип · Тема · версия»'),
          content: string('Содержимое файла'),
          format: { type: 'string', enum: ['doc', 'md', 'csv'], description: 'Формат результата' },
          folderId: string('ID папки внутри рабочего пространства; по умолчанию корень агента'),
        },
        required: ['name', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'drive_create_folder',
      description: 'Создать папку внутри рабочего пространства агента.',
      parameters: {
        type: 'object',
        properties: {
          name: string('Название папки'),
          parentId: string('ID родительской папки внутри рабочего пространства'),
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'drive_save_copy',
      description: 'Сохранить отредактированную версию существующего файла: оригинал остаётся нетронутым, создаётся новый документ с пометкой «ред. AI».',
      parameters: {
        type: 'object',
        properties: {
          sourceFileId: string('ID исходного файла'),
          name: string('Имя копии'),
          content: string('Новое содержимое'),
          folderId: string('Куда сохранить копию'),
        },
        required: ['sourceFileId', 'name', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'drive_comment',
      description: 'Добавить комментарий к файлу. Не меняет содержимое файла.',
      parameters: {
        type: 'object',
        properties: {
          fileId: string('ID файла'),
          content: string('Текст комментария'),
        },
        required: ['fileId', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'tasks_list',
      description: 'Показать открытые задачи из реестра задач (Google Sheets).',
      parameters: {
        type: 'object',
        properties: { limit: { type: 'integer', description: 'Максимум задач (по умолчанию 20)' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'tasks_add',
      description: 'Добавить задачу в реестр со статусом «открыта».',
      parameters: {
        type: 'object',
        properties: {
          title: string('Краткая формулировка задачи'),
          context: string('Контекст, файлы, ссылки'),
          format: string('Ожидаемый формат результата'),
          due: string('Срок'),
          constraints: string('Ограничения'),
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'tasks_update',
      description: 'Обновить статус и итог задачи в реестре по номеру строки.',
      parameters: {
        type: 'object',
        properties: {
          row: { type: 'integer', description: 'Номер строки в таблице (с 1)' },
          status: string('Новый статус, например «выполнено»'),
          note: string('Короткая заметка о результате'),
        },
        required: ['row', 'status'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: 'Поиск в интернете. Возвращает заголовки, ссылки и краткие описания. Используй для актуальных фактов, дат и внешних данных.',
      parameters: {
        type: 'object',
        properties: {
          query: string('Поисковый запрос'),
          limit: { type: 'integer', description: 'Число результатов (по умолчанию 5)' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'web_fetch',
      description: 'Открыть публичную страницу по URL и получить её текст. Не работает с локальными адресами.',
      parameters: {
        type: 'object',
        properties: {
          url: string('Публичный http(s)-URL'),
          maxChars: { type: 'integer', description: 'Ограничение длины текста' },
        },
        required: ['url'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'finish_task',
      description: 'Завершить задачу структурированным отчётом. Вызывай один раз, когда результат готов.',
      parameters: {
        type: 'object',
        properties: {
          summary: string('Сделано: 1–3 строки'),
          files: { type: 'array', items: { type: 'object', properties: { name: string('Название файла'), url: string('Ссылка') } }, description: 'Файлы: название и ссылка' },
          needsDecision: arrayOfStrings('Требует решения: вопросы, риски, допущения'),
          nextStep: string('Предлагаю дальше: один конкретный шаг'),
          status: string('Итоговый статус: выполнено или требует уточнения'),
        },
        required: ['summary'],
      },
    },
  },
];

export function createToolRuntime({ config, drive, web, policy, registry = null, signal = null }) {
  const state = { finished: null, calls: [] };
  const tasks = registry || new TaskRegistry(drive, config);

  const handlers = {
    async drive_search({ query, maxResults = 20 }) {
      const data = await drive.searchFiles(query, { pageSize: Math.min(maxResults, 100) });
      return { files: data.files || [], nextPageToken: data.nextPageToken || null };
    },
    async drive_read({ fileId, maxChars = 20000 }) {
      return drive.readFileText(fileId, maxChars);
    },
    async drive_list_folder({ folderId }) {
      const data = await drive.listChildren(folderId);
      return { files: data.files || [] };
    },
    async drive_create_document({ name, content, format = 'doc', folderId }) {
      const targetMimeType = format === 'doc' ? 'application/vnd.google-apps.document' : null;
      const mimeType = format === 'csv' ? 'text/csv' : 'text/markdown';
      const file = await drive.createFile({
        name,
        content,
        mimeType: format === 'doc' ? 'text/plain' : mimeType,
        targetMimeType,
        parents: [folderId],
      });
      policy.trackFile(file.id);
      return { file, note: 'Создан новый файл; исходные файлы не изменены.' };
    },
    async drive_create_folder({ name, parentId }) {
      const folder = await drive.createFolder(name, [parentId]);
      policy.trackFile(folder.id);
      return { folder };
    },
    async drive_save_copy({ sourceFileId, name, content, folderId }) {
      const finalName = name.includes('ред. AI') ? name : `${name.replace(/\s*·\s*v\d+$/, '')} · ред. AI · ${todayStamp()}`;
      const file = await drive.createFile({
        name: finalName,
        content,
        mimeType: 'text/plain',
        targetMimeType: 'application/vnd.google-apps.document',
        parents: [folderId],
      });
      policy.trackFile(file.id);
      return {
        file,
        original: sourceFileId,
        note: 'Оригинал не изменён: создана отдельная версия с пометкой «ред. AI».',
      };
    },
    async drive_comment({ fileId, content }) {
      return drive.createComment(fileId, content);
    },
    async tasks_list({ limit = 20 }) {
      return { tasks: await tasks.openTasks(Math.min(limit, 50)) };
    },
    async tasks_add(args) {
      return tasks.addTask(args);
    },
    async tasks_update({ row, status, note = '' }) {
      return tasks.markDone({ __row: Number(row) }, status, note);
    },
    async web_search({ query, limit = 5 }) {
      return web.search(query, Math.min(limit, 10));
    },
    async web_fetch({ url, maxChars }) {
      return web.fetch(url, maxChars);
    },
    async finish_task(args) {
      state.finished = {
        summary: args.summary || '',
        files: args.files || [],
        needsDecision: args.needsDecision || [],
        nextStep: args.nextStep || '',
        status: args.status || 'выполнено',
      };
      return { accepted: true };
    },
  };

  async function execute(name, args = {}) {
    state.calls.push({ name, args });
    if (!handlers[name]) return { ok: false, error: `Неизвестный инструмент: ${name}` };
    let decision;
    try {
      decision = await policy.authorize(name, args);
    } catch (error) {
      return { ok: false, error: `Ошибка проверки политики: ${error.message}` };
    }
    if (!decision.allowed) {
      return { ok: false, blocked: true, reason: decision.reason };
    }
    try {
      if (signal?.aborted) throw new Error('Выполнение отменено');
      const result = await handlers[name](decision.args || args);
      return { ok: true, ...result };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  return { tools: TOOL_DEFINITIONS, execute, state, tasks };
}

export { assertDriveConfig };
