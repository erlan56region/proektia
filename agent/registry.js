import { parseCsv, rowsToObjects, columnLetter } from './lib/csv.js';

const FIELD_ALIASES = {
  title: ['задача', 'task', 'название', 'title', 'что сделать'],
  status: ['статус', 'status', 'состояние'],
  context: ['контекст', 'context', 'описание', 'комментарий'],
  format: ['формат', 'format'],
  due: ['срок', 'due', 'deadline', 'дата'],
  link: ['ссылка', 'link', 'файл', 'file'],
  notes: ['заметки', 'notes', 'итог', 'результат', 'note'],
};

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function mapHeaders(headers = []) {
  const normalized = headers.map(normalize);
  const map = {};
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    const index = normalized.findIndex((header) => aliases.includes(header));
    if (index >= 0) map[field] = index;
  }
  return map;
}

export function isOpenStatus(status = '') {
  const value = normalize(status);
  return ['', 'открыта', 'открыт', 'новая', 'новый', 'open', 'todo', 'к выполнению'].includes(value);
}

export class TaskRegistry {
  constructor(drive, config) {
    this.drive = drive;
    this.sheetId = config.drive.tasksSheetId;
  }

  async read() {
    let headers;
    let dataRows;
    if (this.sheetId) {
      const response = await this.drive.sheetsGet(this.sheetId, 'A:Z');
      const values = response.values || [];
      if (!values.length) return { headers: [], rows: [], fieldMap: {} };
      [headers, ...dataRows] = values;
    } else {
      const found = await this.drive.findByName('Реестр задач');
      if (!found) return { headers: [], rows: [], fieldMap: {} };
      const file = await this.drive.readFileText(found.id, 200000);
      const rows = parseCsv(file.text);
      [headers, ...dataRows] = rows;
    }
    const fieldMap = mapHeaders(headers);
    const rows = dataRows.map((cells, index) => {
      const row = { __row: index + 2 };
      for (const [field, column] of Object.entries(fieldMap)) row[field] = cells[column] ?? '';
      row.raw = cells;
      return row;
    }).filter((row) => row.title || row.context);
    return { headers, rows, fieldMap };
  }

  async openTasks(limit = 10) {
    const { rows } = await this.read();
    return rows.filter((row) => isOpenStatus(row.status)).slice(0, limit);
  }

  async markDone(row, status = 'выполнено', note = '') {
    const { headers, fieldMap } = await this.read();
    if (!this.sheetId) throw new Error('Для обновления статуса нужен Google Sheet (DRIVE_TASKS_SHEET_ID)');
    const updates = [];
    if (fieldMap.status !== undefined) {
      updates.push({ range: `${columnLetter(fieldMap.status)}${row.__row}`, value: status });
    }
    if (note && fieldMap.notes !== undefined) {
      updates.push({ range: `${columnLetter(fieldMap.notes)}${row.__row}`, value: note });
    }
    for (const update of updates) {
      await this.drive.sheetsUpdate(this.sheetId, update.range, [[update.value]]);
    }
    return { updated: updates.length, row: row.__row };
  }

  async addTask({ title, context = '', format = '', due = '', constraints = '' }) {
    if (!this.sheetId) throw new Error('Для записи задачи нужен Google Sheet (DRIVE_TASKS_SHEET_ID)');
    const { headers } = await this.read();
    const values = [title, 'открыта', context, format, due, '', constraints].slice(0, Math.max(headers.length, 7));
    await this.drive.sheetsAppend(this.sheetId, [values]);
    return { added: true, title };
  }
}

export { parseCsv, rowsToObjects };
