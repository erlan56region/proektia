import { htmlToText, isPrivateUrl, parseDuckDuckGo, truncate } from './lib/util.js';

async function timedFetch(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const USER_AGENT = 'CoffeeIT-Agent/1.0 (+local autonomous assistant)';

export class WebTools {
  constructor(config, { fetchImpl = timedFetch } = {}) {
    this.config = config.web;
    this.fetchImpl = fetchImpl;
  }

  async search(query, limit = 5) {
    if (!query?.trim()) return { query, results: [], warning: 'Пустой запрос' };
    switch (this.config.provider) {
      case 'tavily':
        return this.tavily(query, limit);
      case 'brave':
        return this.brave(query, limit);
      default:
        return this.duckduckgo(query, limit);
    }
  }

  async tavily(query, limit) {
    if (!this.config.tavilyKey) throw new Error('Нужен TAVILY_API_KEY для WEB_SEARCH_PROVIDER=tavily');
    const response = await this.fetchImpl('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: this.config.tavilyKey,
        query,
        max_results: limit,
        search_depth: 'basic',
        include_answer: false,
      }),
    }, this.config.timeoutMs);
    if (!response.ok) throw new Error(`Tavily: ${response.status}`);
    const data = await response.json();
    return { query, results: (data.results || []).map((item) => ({ title: item.title, url: item.url, snippet: item.content || '' })) };
  }

  async brave(query, limit) {
    if (!this.config.braveKey) throw new Error('Нужен BRAVE_API_KEY для WEB_SEARCH_PROVIDER=brave');
    const params = new URLSearchParams({ q: query, count: String(limit) });
    const response = await this.fetchImpl(`https://api.search.brave.com/res/v1/web/search?${params}`, {
      headers: { 'Accept': 'application/json', 'X-Subscription-Token': this.config.braveKey },
    }, this.config.timeoutMs);
    if (!response.ok) throw new Error(`Brave Search: ${response.status}`);
    const data = await response.json();
    return {
      query,
      results: (data.web?.results || []).map((item) => ({ title: item.title, url: item.url, snippet: item.description || '' })),
    };
  }

  async duckduckgo(query, limit) {
    const params = new URLSearchParams({ q: query, kl: 'ru-ru' });
    const response = await this.fetchImpl(`https://html.duckduckgo.com/html/?${params}`, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'ru,en;q=0.8' },
    }, this.config.timeoutMs);
    if (!response.ok) throw new Error(`DuckDuckGo: ${response.status}`);
    const html = await response.text();
    const results = parseDuckDuckGo(html, limit);
    return {
      query,
      results,
      warning: results.length ? null : 'Провайдер не вернул результатов; попробуйте другой запрос или API-ключ',
    };
  }

  async fetch(url, maxChars = this.config.maxChars) {
    if (isPrivateUrl(url)) throw new Error('Разрешены только публичные http(s)-адреса');
    let current = url;
    let response;
    for (let redirects = 0; redirects < 4; redirects += 1) {
      response = await this.fetchImpl(current, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,text/plain,*/*' },
        redirect: 'manual',
      }, this.config.timeoutMs);
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers?.get?.('location');
      if (!location) throw new Error('Редирект без Location');
      current = new URL(location, current).toString();
      if (isPrivateUrl(current)) throw new Error('Редирект на локальный адрес заблокирован');
    }
    if (!response?.ok) throw new Error(`Загрузка страницы: ${response?.status || 'нет ответа'}`);
    const html = await response.text();
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '';
    const openGraphTitle = html.match(/<meta[^>]+(?:property|name)=["']og:title["'][^>]+content=["']([^"']+)/i)?.[1];
    return {
      url: current,
      title: htmlToText(openGraphTitle || title).slice(0, 200) || current,
      text: truncate(htmlToText(html), maxChars),
    };
  }
}
