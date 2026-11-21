import { safeJsonParse } from './lib/util.js';

/**
 * Minimal Ollama /api/chat client. Works with tool-capable local models
 * (qwen2.5, llama3.1, mistral-nemo and newer).
 */
export async function ollamaChat({ config, messages, tools = [], signal = null, fetchImpl = fetch }) {
  const body = {
    model: config.ollama.model,
    messages,
    stream: false,
    tools,
    options: { temperature: 0.2, num_ctx: config.ollama.numCtx },
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.ollama.timeoutMs);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);
  let response;
  try {
    response = await fetchImpl(`${config.ollama.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw new Error(`Ollama не ответил за ${config.ollama.timeoutMs} мс`);
    throw new Error(`Не удалось подключиться к Ollama (${config.ollama.baseUrl}): ${error.message}. Запустите ollama serve.`);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
  if (!response.ok) {
    const details = await response.text().catch(() => '');
    throw new Error(`Ollama ${response.status}: ${details.slice(0, 400)}`);
  }
  const data = await response.json();
  const message = data.message || {};
  const toolCalls = (message.tool_calls || []).map((call) => {
    const fn = call.function || call;
    return {
      name: fn.name || call.name,
      arguments: safeJsonParse(fn.arguments ?? fn.parameters ?? call.arguments, {}),
    };
  }).filter((call) => call.name);
  return {
    content: typeof message.content === 'string' ? message.content : '',
    toolCalls,
    done: Boolean(data.done),
  };
}
