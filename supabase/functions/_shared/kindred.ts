// Kindred dreamers: the anonymous share row for a dream (see the kindred migration).
// Only the gist, symbol keys, emotions and colour are shared, never the dream itself.

import type { SupabaseClient } from '@supabase/supabase-js';

import { embed } from './ai.ts';

export type ShareInput = {
  dream_id: string;
  user_id: string;
  dreamt_at: string;
  gist: string;
  symbols: { key: string }[];
  emotions: { label: string }[];
  color: string | null;
};

/** What gets embedded: the overview plus its symbol keys and feelings. */
const embeddingText = (gist: string, symbols: string[], emotions: string[]) =>
  `${gist} Symbols: ${symbols.join(', ') || 'none'}. Felt: ${emotions.join(', ') || 'unknown'}.`;

/**
 * Upserts the share row (service role). The embedding is optional: without it the dream
 * is still matched by symbols and feelings.
 */
export async function shareDream(admin: SupabaseClient, input: ShareInput) {
  const symbols = [...new Set(input.symbols.map((s) => s.key))];
  const emotions = [...new Set(input.emotions.map((e) => e.label.trim().toLowerCase()).filter(Boolean))];
  const embedding = await embed(embeddingText(input.gist, symbols, emotions)).catch((e) => {
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

/**
 * Fills in missing embeddings (a failed embed, or rows cleared when the embedding model
 * changed), newest first, for anyone's shares: vectors from different models can't be
 * compared, so every row must be re-embedded with the current one. Returns how many it did.
 */
export async function reembedShares(admin: SupabaseClient, limit: number) {
  const { data } = await admin
    .from('dream_shares')
    .select('dream_id, gist, symbols, emotions')
    .is('embedding', null)
    .order('dreamt_at', { ascending: false })
    .limit(limit);
  let done = 0;
  await Promise.all(
    (data ?? []).map(async (r: { dream_id: string; gist: string; symbols: string[]; emotions: string[] }) => {
      try {
        const vector = await embed(embeddingText(r.gist, r.symbols ?? [], r.emotions ?? []));
        const { error } = await admin
          .from('dream_shares')
          .update({ embedding: JSON.stringify(vector) })
          .eq('dream_id', r.dream_id);
        if (!error) done++;
      } catch (e) {
        console.error('kindred re-embed failed', r.dream_id, String(e).slice(0, 200));
      }
    }),
  );
  return done;
}
