import test from 'node:test';
import assert from 'node:assert/strict';
import { Policy } from '../policy.js';
import { getConfig } from '../config.js';

function config(overrides = {}) {
  const base = getConfig();
  base.agent = { ...base.agent, ...overrides };
  base.drive = { ...base.drive, workspaceFolderId: 'workspace' };
  return base;
}

test('красная зона всегда заблокирована', async () => {
  const policy = new Policy(config({ allowDangerous: true }));
  for (const name of ['drive_delete_file', 'drive_make_public', 'drive_transfer_ownership']) {
    const decision = await policy.authorize(name, { fileId: 'x' });
    assert.equal(decision.allowed, false);
    assert.match(decision.reason, /Красная зона/);
  }
});

test('новые файлы только внутри рабочей папки', async () => {
  const drive = {
    async ancestors(id) {
      return id === 'child' ? ['child', 'workspace'] : ['outside'];
    },
  };
  const policy = new Policy(config(), { drive });
  assert.equal((await policy.authorize('drive_create_document', { name: 'a', content: 'b', folderId: 'outside' })).allowed, false);
  const ok = await policy.authorize('drive_create_document', { name: 'a', content: 'b', folderId: 'child' });
  assert.equal(ok.allowed, true);
  assert.equal(ok.args.folderId, 'child');
  const defaults = await policy.authorize('drive_create_folder', { name: 'Проект' });
  assert.equal(defaults.args.parentId, 'workspace');
});

test('лимит изменяющих операций и dry-run', async () => {
  const policy = new Policy(config({ maxWriteOps: 1 }));
  assert.equal((await policy.authorize('drive_comment', { fileId: '1', content: 'ok' })).allowed, true);
  const second = await policy.authorize('tasks_add', { title: 'тест' });
  assert.equal(second.allowed, false);
  assert.match(second.reason, /Массовая операция/);

  const dry = new Policy(config({ dryRun: true }));
  const decision = await dry.authorize('drive_create_document', { name: 'x', content: 'y' });
  assert.equal(decision.allowed, false);
  assert.equal(decision.dryRun, true);
});
