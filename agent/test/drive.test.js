import test from 'node:test';
import assert from 'node:assert/strict';
import { DriveClient } from '../drive.js';
import { getConfig } from '../config.js';

function mockFetch(handler) {
  const calls = [];
  const impl = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return handler(String(url), options, calls);
  };
  return { impl, calls };
}

function config() {
  const base = getConfig();
  base.drive = {
    ...base.drive,
    accessToken: null,
    refreshToken: 'refresh',
    clientId: 'client',
    clientSecret: 'secret',
  };
  return base;
}

const jsonResponse = (data, ok = true) => ({
  ok,
  status: ok ? 200 : 401,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

test('DriveClient обновляет refresh token и кэширует его', async () => {
  const { impl, calls } = mockFetch(async (url) => {
    if (url.includes('oauth2.googleapis.com/token')) return jsonResponse({ access_token: 'abc', expires_in: 3600 });
    return jsonResponse({ id: 'root', name: 'AI-Агент' });
  });
  const drive = new DriveClient(config(), { fetchImpl: impl });
  assert.equal(await drive.token(), 'abc');
  assert.equal(await drive.token(), 'abc');
  assert.equal(calls.filter((call) => call.url.includes('oauth2.googleapis.com')).length, 1);
});

test('Sheets API использует отдельный хост и bearer-токен', async () => {
  const { impl, calls } = mockFetch(async () => jsonResponse({ values: [['Задача']] }));
  const drive = new DriveClient({ ...config(), drive: { ...config().drive, accessToken: 'token' } }, { fetchImpl: impl });
  await drive.sheetsGet('sheet-1', 'A1:B2');
  const call = calls[0];
  assert.match(call.url, /^https:\/\/sheets\.googleapis\.com\/v4\/spreadsheets\/sheet-1\/values\/A1%3AB2$/);
  assert.equal(call.options.headers.Authorization, 'Bearer token');
});

test('чтение Google Doc экспортируется в text/plain', async () => {
  const { impl, calls } = mockFetch(async (url) => {
    if (url.includes('/export')) return { ok: true, status: 200, text: async () => 'Текст документа' };
    return jsonResponse({ id: 'doc-1', name: 'Отчёт', mimeType: 'application/vnd.google-apps.document' });
  });
  const drive = new DriveClient({ ...config(), drive: { ...config().drive, accessToken: 'token' } }, { fetchImpl: impl });
  const file = await drive.readFileText('doc-1', 100);
  assert.equal(file.text, 'Текст документа');
  assert.match(calls[1].url, /mimeType=text%2Fplain/);
});
