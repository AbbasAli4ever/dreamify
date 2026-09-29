// The "agent" that reads a dream: Groq for all text (the analysis as strict JSON, the
// spoken reply, the anonymous Kindred overview) and Cloudflare Workers AI for the artwork
// and the Kindred embeddings. Model ids are secrets with defaults, so a model change needs
// no code change.

import { embed as embedText, paint } from './cloudflare.ts';
import { chat } from './groq.ts';
import { isSymbolKey, SYMBOL_KEYS } from './symbols.ts';

// Analysis wants quality: the large gpt-oss model, strict JSON schema.
const TEXT_MODEL = () => Deno.env.get('GROQ_TEXT_MODEL') ?? 'openai/gpt-oss-120b';
// The spoken reply and the one-line overview want speed (the person is waiting for the voice).
const FAST_MODEL = () => Deno.env.get('GROQ_FAST_MODEL') ?? 'openai/gpt-oss-20b';

export { EMBED_DIMS } from './cloudflare.ts';

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
      items: {
        type: 'object',
        properties: { label: { type: 'string' } },
        required: ['label'],
        additionalProperties: false,
      },
    },
    symbols: {
      type: 'array',
      items: {
        type: 'object',
        properties: { key: { type: 'string', enum: [...SYMBOL_KEYS] }, label: { type: 'string' } },
        required: ['key', 'label'],
        additionalProperties: false,
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
  additionalProperties: false,
};

export async function analyzeDream(
  transcript: string,
  history: { title: string | null; symbols: { key: string; label: string }[] }[]
): Promise<DreamAnalysis> {
  const earlier = history.length
    ? history.map((h) => `- ${h.title ?? 'Untitled'}: ${h.symbols.map((s) => s.key).join(', ')}`).join('\n')
    : '(none yet)';

  const text = await chat({
    model: TEXT_MODEL(),
    system: SYSTEM,
    user: `The dream (as spoken or written):\n"""\n${transcript}\n"""\n\nEarlier dreams and their symbol keys:\n${earlier}\n\nAllowed symbol keys: ${SYMBOL_KEYS.join(', ')}`,
    temperature: 0.8,
    schema: { name: 'dream_analysis', schema: SCHEMA },
    maxTokens: 4096,
  });
  const raw = JSON.parse(text) as DreamAnalysis;

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
  const user = `Write ${GIST_RULE}\nReply with the sentence only.\n\nThe dream${dream.title ? ` ("${dream.title}")` : ''}:\n"""\n${dream.transcript}\n"""\nFelt: ${dream.emotions.map((e) => e.label).join(', ') || 'unknown'}`;
  const text = await chat({ model: FAST_MODEL(), user, temperature: 0.4, maxTokens: 800 }).catch(() =>
    chat({ model: TEXT_MODEL(), user, temperature: 0.4, maxTokens: 800 }),
  );
  const gist = cleanGist(text);
  if (!gist) throw new Error('Empty gist');
  return gist;
}

/** Embedding for similarity search (cosine), 768 dims (Cloudflare bge-base-en-v1.5). */
export const embed = embedText;

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
  const user = `The dream:\n"""\n${transcript}\n"""\n\nSymbols in earlier dreams: ${earlier}`;
  const opts = { system: REPLY_SYSTEM, user, temperature: 0.9, maxTokens: 800 };
  let raw: string;
  try {
    raw = await chat({ model: FAST_MODEL(), ...opts });
  } catch (e) {
    // A busy or renamed fast model: use the main model.
    console.error('reply model failed, falling back', String(e).slice(0, 200));
    raw = await chat({ model: TEXT_MODEL(), ...opts });
  }
  const text = raw
    .replace(/[*_#`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) throw new Error('Empty reply');
  return text.slice(0, 400);
}

// ---------- Artwork ----------

// Same house style as docs/ARTWORK_PROMPTS.md, so generated art matches the sample art.
// FLUX.1 schnell makes square images; the app crops them to its portrait frames.
const STYLE =
  'surreal dreamscape, painterly digital art, deep midnight navy and indigo palette with soft silver moonlight, subtle cold blue glow, atmospheric haze and mist, fine film grain, quiet and calm but slightly uncanny, minimal composition with lots of negative space, subject centered, keep the bottom third calm and uncluttered, cinematic wide depth, soft focus edges, muted desaturated tones, no text, no letters, no watermark.';

export function paintDream(artPrompt: string): Promise<{ bytes: Uint8Array; mimeType: string }> {
  return paint(`${artPrompt} Style: ${STYLE}`);
}
