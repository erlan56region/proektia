export function decodeEntities(value = '') {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&laquo;/gi, '«')
    .replace(/&raquo;/gi, '»');
}

export function htmlToText(html = '') {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  );
}

export function truncate(text, maxChars) {
  if (!maxChars || typeof text !== 'string' || text.length <= maxChars) return text;
  return `${text.slice(0, maxChars)}\n… [обрезано: ${text.length - maxChars} символов]`;
}

export function safeJsonParse(value, fallback = {}) {
  if (typeof value === 'object' && value !== null) return value;
  try {
    return JSON.parse(String(value ?? '').replace(/^```(?:json)?\s*|\s*```$/g, ''));
  } catch {
    return fallback;
  }
}

export function todayStamp(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function escapeDriveQuery(value = '') {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

const PRIVATE_HOSTS = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|::1$)/i;

export function isPrivateUrl(url) {
  try {
    const parsed = new URL(url);
    return !['http:', 'https:'].includes(parsed.protocol) || PRIVATE_HOSTS.test(parsed.hostname);
  } catch {
    return true;
  }
}

export function findAttr(tag, name) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return match ? decodeEntities(match[1]) : null;
}

/** Parse DuckDuckGo HTML results without adding an HTML parser dependency. */
export function parseDuckDuckGo(html, limit = 5) {
  const results = [];
  const blocks = html.split(/<div[^>]+class="[^"]*result[^"]*"/i).slice(1);
  for (const block of blocks) {
    const linkTag = block.match(/<a\b[^>]*class="[^"]*result__a[^"]*"[^>]*>/i)?.[0];
    if (!linkTag) continue;
    let url = findAttr(linkTag, 'href') || '';
    if (url.includes('uddg=')) {
      try {
        url = new URL(url, 'https://duckduckgo.com').searchParams.get('uddg') || url;
      } catch {
        /* keep original */
      }
    }
    const afterLink = block.slice(block.indexOf(linkTag) + linkTag.length);
    const title = htmlToText(afterLink.match(/^[\s\S]*?<\/a>/i)?.[0] || '').trim();
    const snippet = htmlToText(
      block.match(/<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>[\s\S]*?<\/a>/i)?.[0] || '',
    ).trim();
    if (!url || !title) continue;
    results.push({ title, url, snippet });
    if (results.length >= limit) break;
  }
  return results;
}
