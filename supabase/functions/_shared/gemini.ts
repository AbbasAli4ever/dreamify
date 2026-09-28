// Gemini: the "agent" that reads a dream (structured JSON) and paints it (image).
// Uses the generateContent REST API (documented as fully supported).
// Model ids are secrets with defaults, so a model rename needs no code change.

import { isSymbolKey, SYMBOL_KEYS } from './symbols.ts';

// Base URL override exists only for local end-to-end tests against a fake server.
const API = `${Deno.env.get('GEMINI_API_BASE') ?? 'https://generativelanguage.googleapis.com'}/v1beta/models`;
const TEXT_MODEL = () => Deno.env.get('GEMINI_TEXT_MODEL') ?? 'gemini-3.8-flash';
// The spoken reply wants speed over depth (the person is waiting for the voice): a lite model
// with minimal thinking answered in ~1.4 s vs 2–5 s for the full model. Overridable.
const REPLY_MODEL = () => Deno.env.get('GEMINI_REPLY_MODEL') ?? 'gemini-3.1-flash-lite';
const REPLY_THINKING = () => Deno.env.get('GEMINI_REPLY_THINKING') ?? 'minimal';
const IMAGE_MODEL = () => Deno.env.get('GEMINI_IMAGE_MODEL') ?? 'gemini-3.1-flash-image';
// Kindred dreamers: 768-dim embeddings of each dream's anonymous overview (the SQL scoring in
// the kindred migration is calibrated for this model, so change both together).
const EMBED_MODEL = () => Deno.env.get('GEMINI_EMBED_MODEL') ?? 'gemini-embedding-001';
export const EMBED_DIMS = 768;

function apiKey() {
  const key = Deno.env.get('GEMINI_API_KEY');
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  return key;
}

type Part = { text?: string; inlineData?: { mimeType: string; data: string }; inline_data?: { mime_type: string; data: string } };

async function generate(model: string, body: unknown): Promise<Part[]> {
  const res = await fetch(`${API}/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Gemini ${model} ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const json = await res.json();
  const parts: Part[] | undefined = json?.candidates?.[0]?.content?.parts;
  if (!parts?.length) throw new Error(`Gemini ${model}: empty response ${JSON.stringify(json).slice(0, 300)}`);
  return parts;
}

// ---------- Analysis ----------

export type DreamAnalysis = {
  title: string;
  emotions: { label: string }[];
  symbols: { key: string; label: string }[];
  themes: string[];
  interpretation: string;
  question: string;
  art_prompt: string;
  color: string;
  gist: string;
};

// Shown to *other* people whose dreams were alike (Kindred dreamers), so it must never
// identify the dreamer or anyone in the dream.
const GIST_RULE = `an anonymous overview of the dream for strangers who had a similar dream: ONE sentence of 10–22 words with the core image and the feeling, as a fragment without "I" or "you" (e.g. "Walking through warm rain on an empty street at night, calm but a little lonely."). Never include names, places, jobs, relationships that identify someone (use "someone", "a friend", "family"), health details, or anything private.`;

const SYSTEM = `You are the quiet, perceptive voice inside Dreamify, a dream journal.
You read one dream the person just woke up from and help them understand it gently.

Rules:
- Speak to the person as "you". Warm, calm, curious. Never clinical, never a dream dictionary, never certain.
- Title: 3–7 evocative words, like a short story title (e.g. "The Door in the Black Desert").
- Emotions: 1–3 single words for what the dreamer felt (e.g. Unease, Wonder, Longing).
- Symbols: 1–4 key images from the dream. Each "key" MUST be one of the allowed keys; "label" is the natural word for it in this dream (e.g. key "house" with label "Childhood home", key "moon" with label "Night").
- Themes: 1–3 short themes (e.g. Transition, Childhood, Letting go).
- Interpretation: 2–4 sentences, grounded in concrete details of this dream. Offer possibilities, not verdicts. If a symbol also appears in the person's earlier dreams, you may gently note that it keeps returning.
- Question: ONE reflective question that references a concrete detail of the dream. Wrap the 1–2 most important words in *asterisks* for emphasis, e.g. "The house felt *familiar*. Does it remind you of somewhere from your *childhood*?"
- art_prompt: one vivid sentence describing a single surreal, calm scene from the dream for an illustrator. No text in the image, faces small or hidden.
- color: the dominant hex color of that scene, muted and dreamy (e.g. "#6FA2F2").
- gist: ${GIST_RULE}`;

const SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    emotions: {
      type: 'array',
      items: { type: 'object', properties: { label: { type: 'string' } }, required: ['label'] },
    },
    symbols: {
      type: 'array',
      items: {
        type: 'object',
        properties: { key: { type: 'string', enum: [...SYMBOL_KEYS] }, label: { type: 'string' } },
        required: ['key', 'label'],
      },
    },
    themes: { type: 'array', items: { type: 'string' } },
    interpretation: { type: 'string' },
    question: { type: 'string' },
    art_prompt: { type: 'string' },
    color: { type: 'string' },
    gist: { type: 'string' },
  },
  required: ['title', 'emotions', 'symbols', 'themes', 'interpretation', 'question', 'art_prompt', 'color', 'gist'],
};

export async function analyzeDream(
  transcript: string,
  history: { title: string | null; symbols: { key: string; label: string }[] }[]
): Promise<DreamAnalysis> {
  const earlier = history.length
    ? history.map((h) => `- ${h.title ?? 'Untitled'}: ${h.symbols.map((s) => s.key).join(', ')}`).join('\n')
    : '(none yet)';

  const parts = await generate(TEXT_MODEL(), {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `The dream (as spoken or written):\n"""\n${transcript}\n"""\n\nEarlier dreams and their symbol keys:\n${earlier}\n\nAllowed symbol keys: ${SYMBOL_KEYS.join(', ')}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.8,
      responseMimeType: 'application/json',
      responseJsonSchema: SCHEMA,
    },
  });

  const raw = JSON.parse(parts.map((p) => p.text ?? '').join('')) as DreamAnalysis;

  // Never trust model output blindly: clamp sizes and enforce the icon vocabulary.
  const seen = new Set<string>();
  const symbols = (raw.symbols ?? [])
    .filter((s) => isSymbolKey(s.key) && !seen.has(s.key) && seen.add(s.key))
    .slice(0, 4);
  return {
    title: (raw.title ?? 'An Untitled Dream').trim().slice(0, 80),
    emotions: (raw.emotions ?? []).filter((e) => e.label?.trim()).slice(0, 3),
    symbols: symbols.length ? symbols : [{ key: 'star', label: 'Stars' }],
    themes: (raw.themes ?? []).filter(Boolean).slice(0, 3),
    interpretation: (raw.interpretation ?? '').trim(),
    question: (raw.question ?? 'What part of this dream is still *with you* now that you are awake?').trim(),
    art_prompt: (raw.art_prompt ?? transcript).trim(),
    color: /^#[0-9a-f]{6}$/i.test(raw.color ?? '') ? raw.color : '#6F82C9',
    gist: cleanGist(raw.gist),
  };
}

const cleanGist = (s?: string) => (s ?? '').replace(/[*_#`"]/g, '').replace(/\s+/g, ' ').trim().slice(0, 200);

// ---------- Kindred dreamers ----------

/**
 * The anonymous overview for a dream analysed before Kindred existed (its analysis has no
 * gist). Uses the fast reply model: one short sentence needs no depth.
 */
export async function gistDream(dream: {
  transcript: string;
  title: string | null;
  emotions: { label: string }[];
}): Promise<string> {
  const body = (thinking: string | null) => ({
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Write ${GIST_RULE}\nReply with the sentence only.\n\nThe dream${dream.title ? ` ("${dream.title}")` : ''}:\n"""\n${dream.transcript}\n"""\nFelt: ${dream.emotions.map((e) => e.label).join(', ') || 'unknown'}`,
          },
        ],
      },
    ],
    generationConfig: { temperature: 0.4, ...(thinking ? { thinkingConfig: { thinkingLevel: thinking } } : null) },
  });
  let parts: Part[];
  try {
    parts = await generate(REPLY_MODEL(), body(REPLY_THINKING()));
  } catch {
    parts = await generate(TEXT_MODEL(), body(null));
  }
  const gist = cleanGist(
    parts
      .filter((p) => !('thought' in p && (p as { thought?: boolean }).thought))
      .map((p) => p.text ?? '')
      .join(''),
  );
  if (!gist) throw new Error('Gemini returned an empty gist');
  return gist;
}

/** Embedding for similarity search (cosine), 768 dims. */
export async function embed(text: string): Promise<number[]> {
  const model = EMBED_MODEL();
  const res = await fetch(`${API}/${model}:embedContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey() },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      taskType: 'SEMANTIC_SIMILARITY',
      outputDimensionality: EMBED_DIMS,
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${model} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const values: number[] | undefined = (await res.json())?.embedding?.values;
  if (values?.length !== EMBED_DIMS) throw new Error(`Gemini ${model}: unexpected embedding`);
  return values;
}

// ---------- Spoken reply ----------

const REPLY_SYSTEM = `You are the voice of Dreamify, a dream journal. The person has just told you their dream out loud, and your words will be read aloud to them.

Reply the way a calm, perceptive friend would, right after listening, in exactly three sentences:
1. A very short first reaction to the most striking image, 2 to 5 words (e.g. "Snow, falling indoors..." or "Water again...").
2. One sentence of 10 to 18 words reflecting a vivid, concrete detail you heard and gently naming the feeling you sense. If one of the earlier dreams' symbols clearly returns, you may say so here.
3. One sentence of 8 to 14 words saying you'll paint the dream and gather what it might be telling them.
- No interpretation yet, no questions, no advice, no greetings, no names.
- Plain spoken English: no markdown, no asterisks, no emojis, no lists. Commas and ellipses for natural pauses.`;

/** A short, warm spoken reaction to a dream, for Deepgram to read aloud. */
export async function replyToDream(
  transcript: string,
  history: { title: string | null; symbols: { key: string; label: string }[] }[],
): Promise<string> {
  const earlier = history.length
    ? history.slice(0, 10).map((h) => h.symbols.map((s) => s.key).join(', ')).join('; ')
    : '(none yet)';
  const body = (thinking: string | null) => ({
    systemInstruction: { parts: [{ text: REPLY_SYSTEM }] },
    contents: [
      {
        role: 'user',
        parts: [{ text: `The dream:\n"""\n${transcript}\n"""\n\nSymbols in earlier dreams: ${earlier}` }],
      },
    ],
    generationConfig: { temperature: 0.9, ...(thinking ? { thinkingConfig: { thinkingLevel: thinking } } : null) },
  });

  let parts: Part[];
  try {
    parts = await generate(REPLY_MODEL(), body(REPLY_THINKING()));
  } catch (e) {
    // Unknown model, unsupported thinking level or a busy model: use the main model as is.
    console.error('reply model failed, falling back', String(e).slice(0, 200));
    parts = await generate(TEXT_MODEL(), body(null));
  }
  const text = parts
    .filter((p) => !('thought' in p && (p as { thought?: boolean }).thought))
    .map((p) => p.text ?? '')
    .join('')
    .replace(/[*_#`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) throw new Error('Gemini returned an empty reply');
  return text.slice(0, 400);
}

// ---------- Artwork ----------

// Same house style as docs/ARTWORK_PROMPTS.md, so generated art matches the sample art.
const FORMAT = 'Vertical portrait image, 4:5 aspect ratio, full-bleed with no border.';
const STYLE =
  'surreal dreamscape, painterly digital art, deep midnight navy and indigo palette with soft silver moonlight, subtle cold blue glow, atmospheric haze and mist, fine film grain, quiet and calm but slightly uncanny, minimal composition with lots of negative space, keep the bottom third calm and uncluttered, cinematic wide depth, soft focus edges, muted desaturated tones, no text, no letters, no watermark.';

export async function paintDream(artPrompt: string): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const parts = await generate(IMAGE_MODEL(), {
    contents: [{ role: 'user', parts: [{ text: `${FORMAT} ${artPrompt} Style: ${STYLE}` }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: '4:5' },
    },
  });

  for (const p of parts) {
    const data = p.inlineData?.data ?? p.inline_data?.data;
    const mimeType = p.inlineData?.mimeType ?? p.inline_data?.mime_type ?? 'image/png';
    if (data) return { bytes: Uint8Array.from(atob(data), (c) => c.charCodeAt(0)), mimeType };
  }
  throw new Error('Gemini returned no image');
}
