// Groq (groq.com): OpenAI-compatible chat completions on fast open models.
// Used for all text: the dream analysis (strict JSON schema), the spoken reply and the
// Kindred overview. Model ids are secrets with defaults, so a model change needs no code change.

const API = 'https://api.groq.com/openai/v1/chat/completions';

function apiKey() {
  const key = Deno.env.get('GROQ_API_KEY');
  if (!key) throw new Error('GROQ_API_KEY is not set');
  return key;
}

type ChatOptions = {
  model: string;
  system?: string;
  user: string;
  temperature?: number;
  /** gpt-oss models think before answering; "low" keeps that short (and fast). */
  reasoningEffort?: 'low' | 'medium' | 'high';
  /** Strict structured output: the reply is guaranteed to match this JSON schema. */
  schema?: { name: string; schema: Record<string, unknown> };
  maxTokens?: number;
};

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** One chat completion; returns the assistant's text (reasoning is never included). */
export async function chat(o: ChatOptions): Promise<string> {
  const body = {
    model: o.model,
    messages: [
      ...(o.system ? [{ role: 'system', content: o.system }] : []),
      { role: 'user', content: o.user },
    ],
    temperature: o.temperature ?? 0.7,
    max_completion_tokens: o.maxTokens ?? 2048,
    ...(o.model.startsWith('openai/gpt-oss')
      ? { reasoning_effort: o.reasoningEffort ?? 'low', include_reasoning: false }
      : null),
    ...(o.schema
      ? {
          response_format: {
            type: 'json_schema',
            json_schema: { name: o.schema.name, strict: true, schema: o.schema.schema },
          },
        }
      : null),
  };

  // One retry on rate limits and server hiccups (the free tier has per-minute limits).
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey()}` },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const json = await res.json();
      const text: string | undefined = json?.choices?.[0]?.message?.content;
      if (!text?.trim()) throw new Error(`Groq ${o.model}: empty response`);
      return text;
    }
    const detail = (await res.text()).slice(0, 400);
    if (attempt === 0 && (res.status === 429 || res.status >= 500)) {
      await pause(Number(res.headers.get('retry-after') ?? 0) * 1000 || 1500);
      continue;
    }
    throw new Error(`Groq ${o.model} ${res.status}: ${detail}`);
  }
}
