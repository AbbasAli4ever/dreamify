// Kindred dreamers: the anonymous share row for a dream (see the kindred migration).
// Only the gist, symbol keys, emotions and colour are shared, never the dream itself.

import type { SupabaseClient } from '@supabase/supabase-js';

import { embed } from './gemini.ts';

export type ShareInput = {
  dream_id: string;
  user_id: string;
  dreamt_at: string;
  gist: string;
  symbols: { key: string }[];
  emotions: { label: string }[];
  color: string | null;
};

/**
 * Upserts the share row (service role). The embedding is optional: without it the dream
 * is still matched by symbols and feelings.
 */
export async function shareDream(admin: SupabaseClient, input: ShareInput) {
  const symbols = [...new Set(input.symbols.map((s) => s.key))];
  const emotions = [...new Set(input.emotions.map((e) => e.label.trim().toLowerCase()).filter(Boolean))];
  const embedding = await embed(
    `${input.gist} Symbols: ${symbols.join(', ') || 'none'}. Felt: ${emotions.join(', ') || 'unknown'}.`,
  ).catch((e) => {
    console.error('kindred embed failed', input.dream_id, String(e).slice(0, 200));
    return null;
  });

  const { error } = await admin.from('dream_shares').upsert({
    dream_id: input.dream_id,
    user_id: input.user_id,
    dreamt_at: input.dreamt_at,
    gist: input.gist,
    symbols,
    emotions,
    color: input.color,
    // pgvector reads the text form "[0.1,0.2,…]".
    embedding: embedding ? JSON.stringify(embedding) : null,
  });
  if (error) throw new Error(`share failed: ${error.message}`);
}
