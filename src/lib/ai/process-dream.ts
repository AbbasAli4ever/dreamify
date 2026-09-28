// The dream-processing pipeline behind S4. Each stage reports its result as soon
// as it's ready, so the Processing screen can reveal it step by step.
// Mock timings + mock analyzer for now; the real backend replaces the stage
// bodies (Supabase edge functions: transcribe → analyze → paint).

import * as mock from '@/lib/ai/mock-analyzer';
import type { Dream } from '@/types/dream';

export const STAGES = ['story', 'emotions', 'symbols', 'painting'] as const;
export type StageKey = (typeof STAGES)[number];

/** How long each mock stage takes, in ms. Painting is the slowest, as with a real image model. */
const MOCK_DURATION: Record<StageKey, number> = {
  story: 1800,
  emotions: 1500,
  symbols: 1900,
  painting: 2600,
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Runs every stage for `dream`, calling `update` with each partial result.
 * `processingStage` is the index of the stage in progress (STAGES.length = done).
 */
export async function processDream(dream: Dream, update: (patch: Partial<Dream>) => void) {
  update({ status: 'processing', processingStage: 0 });

  // 1. Understand the story (speech-to-text for voice dreams) + title.
  await wait(MOCK_DURATION.story);
  const transcript = dream.transcript || mock.transcribe(dream.id);
  const symbols = mock.findSymbols(transcript);
  update({ transcript, title: mock.makeTitle(symbols, transcript), processingStage: 1 });
  if (dream.inputType === 'voice' && !dream.reply)
    update({ reply: { text: mock.makeReply(symbols, mock.findEmotions(transcript)) } });

  // 2. Emotions.
  await wait(MOCK_DURATION.emotions);
  const emotions = mock.findEmotions(transcript);
  update({ emotions, processingStage: 2 });

  // 3. Symbols + themes (Dream Echo is computed from these against earlier dreams).
  await wait(MOCK_DURATION.symbols);
  update({ symbols, themes: mock.makeThemes(symbols), processingStage: 3 });

  // 4. Artwork, interpretation and the reflection question.
  await wait(MOCK_DURATION.painting);
  const art = mock.paint(symbols, transcript);
  update({
    artwork: art.source,
    artworkColor: art.color,
    interpretation: mock.makeInterpretation(symbols, emotions),
    reflection: { question: mock.makeQuestion(symbols) },
    processingStage: STAGES.length,
    status: 'ready',
  });
}
