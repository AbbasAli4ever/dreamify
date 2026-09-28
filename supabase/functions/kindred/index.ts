// kindred: makes sure the caller's dreams are shared with Kindred dreamers.
// POST with the user's JWT → { added, remaining }.
// New dreams are shared by process-dream. This catches up dreams analysed before Kindred
// existed (or whose share failed): Gemini writes their anonymous overview, then the
// embedding is stored. A few per call, newest first; the app calls it once per session.
// Matching itself happens in Postgres (kindred_for_dream / kindred_web / dream_pulse).

import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

import { gistDream } from '../_shared/gemini.ts';
import { shareDream } from '../_shared/kindred.ts';

const PER_CALL = 8;
const LOOKBACK = 40;

type Row = {
  id: string;
  user_id: string;
  created_at: string;
  transcript: string;
  title: string | null;
  symbols: { key: string }[];
  emotions: { label: string }[];
  artwork_color: string | null;
};

export default {
  fetch: withSupabase({ auth: 'user' }, async (_req, ctx) => {
    const admin = ctx.supabaseAdmin as unknown as SupabaseClient;

    // RLS-scoped: only the caller's own dreams.
    const { data: dreams, error } = await ctx.supabase
      .from('dreams')
      .select('id, user_id, created_at, transcript, title, symbols, emotions, artwork_color')
      .eq('status', 'ready')
      .neq('transcript', '')
      .order('created_at', { ascending: false })
      .limit(LOOKBACK);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    if (!dreams?.length) return Response.json({ added: 0, remaining: 0 });

    const { data: shared } = await admin
      .from('dream_shares')
      .select('dream_id')
      .in('dream_id', dreams.map((d) => d.id));
    const done = new Set((shared ?? []).map((s) => s.dream_id));
    const missing = (dreams as Row[]).filter((d) => !done.has(d.id));
    const batch = missing.slice(0, PER_CALL);

    const results = await Promise.allSettled(
      batch.map(async (d) =>
        shareDream(admin, {
          dream_id: d.id,
          user_id: d.user_id,
          dreamt_at: d.created_at,
          gist: await gistDream(d),
          symbols: d.symbols ?? [],
          emotions: d.emotions ?? [],
          color: d.artwork_color,
        }),
      ),
    );
    const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
    if (failed.length) console.error('kindred backfill', failed.map((r) => String(r.reason).slice(0, 200)));

    return Response.json({
      added: batch.length - failed.length,
      remaining: missing.length - batch.length + failed.length,
    });
  }),
};
