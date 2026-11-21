import { todayStamp } from './lib/util.js';

/** Tools that must never be callable by an autonomous loop. */
export const RED_ZONE_TOOLS = new Set([
  'drive_delete_file',
  'drive_trash_file',
  'drive_empty_trash',
  'drive_make_public',
  'drive_create_permission',
  'drive_update_permission',
  'drive_delete_permission',
  'drive_transfer_ownership',
  'drive_purge',
]);

const WRITE_TOOLS = new Set([
  'drive_create_document',
  'drive_create_folder',
  'drive_save_copy',
  'drive_comment',
  'tasks_add',
  'tasks_update',
]);

export class Policy {
  constructor(config, { drive = null } = {}) {
    this.config = config;
    this.limits = config.agent;
    this.drive = drive;
    this.writeCount = 0;
    this.sessionFiles = new Set();
  }

  isOwnFile(fileId) {
    return this.sessionFiles.has(fileId);
  }

  trackFile(fileId) {
    if (fileId) this.sessionFiles.add(fileId);
  }

  async authorize(name, args = {}) {
    if (RED_ZONE_TOOLS.has(name)) {
      return { allowed: false, reason: 'Красная зона: удаление, публикация и смена прав доступны только после явного подтверждения владельца.' };
    }
    if (this.limits.dryRun && WRITE_TOOLS.has(name)) {
      return { allowed: false, reason: 'Режим dry-run: изменительные действия отключены.', dryRun: true };
    }
    if (WRITE_TOOLS.has(name)) {
      this.writeCount += 1;
      if (this.writeCount > this.limits.maxWriteOps) {
        return {
          allowed: false,
          reason: `Массовая операция: более ${this.limits.maxWriteOps} изменений за один проход требует подтверждения владельца.`,
        };
      }
    }
    if (['drive_create_document', 'drive_create_folder', 'drive_save_copy'].includes(name)) {
      const parent = args.folderId || args.parentId || this.config.drive.workspaceFolderId;
      if (!parent) {
        return { allowed: false, reason: 'Не задана папка назначения; создавать файлы в корне My Drive запрещено.' };
      }
      if (this.drive) {
        const inside = await this.isInsideWorkspace(parent);
        if (!inside) {
          return {
            allowed: false,
            reason: 'Папка назначения вне «AI-Агент · Рабочее пространство». Создавать файлы можно только внутри рабочей структуры.',
          };
        }
      }
      return { allowed: true, args: { ...args, folderId: parent, parentId: parent } };
    }
    return { allowed: true, args };
  }

  async isInsideWorkspace(folderId) {
    const workspace = this.config.drive.workspaceFolderId;
    if (!workspace) return true;
    if (folderId === workspace) return true;
    if (!this.drive) return false;
    try {
      const chain = await this.drive.ancestors(folderId);
      return chain.includes(workspace);
    } catch {
      return false;
    }
  }

  namingSuggestion(type = 'Анализ') {
    return `${todayStamp()} · ${type} · Тема · draft`;
  }
}
