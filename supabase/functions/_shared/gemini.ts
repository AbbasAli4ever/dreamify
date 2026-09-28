// Gemini: the "agent" that reads a dream (structured JSON) and paints it (image).
// Uses the generateContent REST API (documented as fully supported).
// Model ids are secrets with defaults, so a model rename needs no code change.

import { isSymbolKey, SYMBOL_KEYS } from './symbols.ts';

// Base URL override exists only for local end-to-end tests against a fake server.
const API = `${Deno.env.get('GEMINI_API_BASE') ?? 'https://generativelanguage.googleapis.com'}/v1beta/models`;
const TEXT_MODEL = () => Deno.env.get('GEMINI_TEXT_MODEL') ?? 'gemini-3.8-flash';
const IMAGE_MODEL = () => Deno.env.get('GEMINI_IMAGE_MODEL') ?? 'gemini-3.1-flash-image';

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
};

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
- color: the dominant hex color of that scene, muted and dreamy (e.g. "#6FA2F2").`;

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
  },
  required: ['title', 'emotions', 'symbols', 'themes', 'interpretation', 'question', 'art_prompt', 'color'],
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
  };
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
