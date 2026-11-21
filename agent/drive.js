import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { DRIVE_SCOPES } from './config.js';
import { escapeDriveQuery, truncate } from './lib/util.js';

const API_ROOT = 'https://www.googleapis.com';
const b64url = (value) => Buffer.from(value).toString('base64url');

function serviceAccountAssertion(account, impersonate) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: account.private_key_id }));
  const payload = {
    iss: account.client_email,
    scope: DRIVE_SCOPES.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  if (impersonate) payload.sub = impersonate;
  const unsigned = `${header}.${b64url(JSON.stringify(payload))}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(account.private_key);
  return `${unsigned}.${signature.toString('base64url')}`;
}

export class DriveClient {
  constructor(config, { fetchImpl = fetch } = {}) {
    this.config = config;
    this.fetchImpl = fetchImpl;
    this.tokenCache = null;
  }

  async token(force = false) {
    if (!force && this.tokenCache && this.tokenCache.expiresAt > Date.now() + 60000) {
      return this.tokenCache.accessToken;
    }
    const d = this.config.drive;
    if (d.accessToken) {
      this.tokenCache = { accessToken: d.accessToken, expiresAt: Date.now() + 3500000 };
      return d.accessToken;
    }
    let body;
    if (d.serviceAccountFile) {
      const account = JSON.parse(readFileSync(d.serviceAccountFile, 'utf8'));
      const form = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: serviceAccountAssertion(account, d.impersonate),
      });
      body = { form };
    } else if (d.refreshToken && d.clientId && d.clientSecret) {
      body = {
        form: new URLSearchParams({
          client_id: d.clientId,
          client_secret: d.clientSecret,
          refresh_token: d.refreshToken,
          grant_type: 'refresh_token',
        }),
      };
    } else {
      throw new Error('Нет данных для авторизации в Google Drive');
    }
    const response = await this.fetchImpl('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.form,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) {
      throw new Error(`Не удалось получить токен Drive: ${data.error_description || data.error || response.status}`);
    }
    this.tokenCache = {
      accessToken: data.access_token,
      expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
    };
    return this.tokenCache.accessToken;
  }

  async request(path, { method = 'GET', body, headers = {}, raw = false, retry = true, isGoogleApi = true } = {}) {
    const token = await this.token();
    const response = await this.fetchImpl(`${isGoogleApi ? API_ROOT : ''}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, ...headers },
      body,
    });
    if (response.status === 401 && retry) {
      await this.token(true);
      return this.request(path, { method, body, headers, raw, retry: false, isGoogleApi });
    }
    if (!response.ok) {
      const details = await response.text().catch(() => '');
      throw new Error(`Drive API ${method} ${path}: ${response.status} ${details.slice(0, 500)}`);
    }
    if (raw) return response.text();
    return response.json().catch(() => ({}));
  }

  async searchFiles(query, { pageSize = 50, pageToken = null } = {}) {
    const params = new URLSearchParams({
      q: query,
      pageSize: String(Math.min(pageSize, 1000)),
      fields: 'files(id,name,mimeType,parents,modifiedTime,webViewLink,size),nextPageToken',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    });
    if (pageToken) params.set('pageToken', pageToken);
    return this.request(`/drive/v3/files?${params}`);
  }

  async findByName(name, parentId = null) {
    const parts = [`name = '${escapeDriveQuery(name)}'`, 'trashed = false'];
    if (parentId) parts.push(`'${escapeDriveQuery(parentId)}' in parents`);
    const result = await this.searchFiles(parts.join(' and '), { pageSize: 10 });
    return result.files?.[0] || null;
  }

  async getFile(fileId, fields = 'id,name,mimeType,parents,webViewLink,modifiedTime') {
    const params = new URLSearchParams({ fields, supportsAllDrives: 'true' });
    return this.request(`/drive/v3/files/${encodeURIComponent(fileId)}?${params}`);
  }

  async readFileText(fileId, maxChars = 20000) {
    const meta = await this.getFile(fileId);
    const mime = meta.mimeType || '';
    let text;
    if (mime.startsWith('application/vnd.google-apps.')) {
      const exportMime = mime.includes('spreadsheet') ? 'text/csv' : 'text/plain';
      const params = new URLSearchParams({ mimeType: exportMime });
      text = await this.request(`/drive/v3/files/${encodeURIComponent(fileId)}/export?${params}`, { raw: true });
    } else {
      text = await this.request(`/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`, { raw: true });
    }
    return {
      id: fileId,
      name: meta.name,
      mimeType: mime,
      link: meta.webViewLink,
      text: truncate(text, maxChars),
      truncated: text.length > maxChars,
    };
  }

  async listChildren(folderId, pageSize = 100) {
    const params = new URLSearchParams({
      q: `'${escapeDriveQuery(folderId)}' in parents and trashed = false`,
      pageSize: String(Math.min(pageSize, 1000)),
      fields: 'files(id,name,mimeType,parents,modifiedTime,webViewLink,size),nextPageToken',
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
    });
    return this.request(`/drive/v3/files?${params}`);
  }

  async createFile({ name, content = '', mimeType = 'text/plain', parents = [], targetMimeType = null }) {
    const boundary = `agentBoundary${Date.now()}${Math.random().toString(16).slice(2)}`;
    const metadata = { name, parents, mimeType: targetMimeType || mimeType };
    const parts = [
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
      `--${boundary}\r\nContent-Type: ${mimeType}; charset=UTF-8\r\n\r\n${content}\r\n`,
      `--${boundary}--\r\n`,
    ];
    const params = new URLSearchParams({ uploadType: 'multipart', supportsAllDrives: 'true', fields: 'id,name,mimeType,webViewLink' });
    return this.request(`/upload/drive/v3/files?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body: parts.join(''),
    });
  }

  async createFolder(name, parents = []) {
    const params = new URLSearchParams({ supportsAllDrives: 'true', fields: 'id,name,mimeType,webViewLink' });
    return this.request(`/drive/v3/files?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', parents }),
    });
  }

  async copyFile(fileId, { name, parents = [] }) {
    const params = new URLSearchParams({ supportsAllDrives: 'true', fields: 'id,name,mimeType,webViewLink' });
    return this.request(`/drive/v3/files/${encodeURIComponent(fileId)}/copy?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, parents }),
    });
  }

  async createComment(fileId, content) {
    const params = new URLSearchParams({ fields: 'id,content,author' });
    return this.request(`/drive/v3/files/${encodeURIComponent(fileId)}/comments?${params}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
  }

  async ancestors(fileId) {
    const chain = [];
    let current = fileId;
    const seen = new Set();
    while (current && !seen.has(current)) {
      seen.add(current);
      const meta = await this.getFile(current, 'id,name,parents');
      chain.push(meta.id);
      current = meta.parents?.[0] || null;
    }
    return chain;
  }

  async sheetsGet(spreadsheetId, range = 'A:Z') {
    const encoded = encodeURIComponent(range);
    return this.request(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encoded}`, { isGoogleApi: false });
  }

  async sheetsUpdate(spreadsheetId, range, values) {
    const params = new URLSearchParams({ valueInputOption: 'RAW' });
    return this.request(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?${params}`, {
      method: 'PUT',
      isGoogleApi: false,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    });
  }

  async sheetsAppend(spreadsheetId, values) {
    const params = new URLSearchParams({ valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS' });
    return this.request(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent('A:Z')}:append?${params}`, {
      method: 'POST',
      isGoogleApi: false,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    });
  }
}
