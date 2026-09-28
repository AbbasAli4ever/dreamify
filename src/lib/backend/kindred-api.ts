// Kindred dreamers over Supabase. Matching runs in Postgres (security-definer functions in
// supabase/migrations/*_kindred.sql); the app never reads other people's rows directly.

import { supabase } from '@/lib/backend/supabase';
import type { KindredLink, KindredMatch, SymbolPulse } from '@/types/kindred';

type MatchRow = {
  person: string;
  name: string;
  avatar_url: string | null;
  gist: string;
  symbols: string[] | null;
  shared_symbols: string[] | null;
  shared_emotions: string[] | null;
  color: string | null;
  days_apart: number | string;
  match: number;
};

function db() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

const toMatch = (r: MatchRow): KindredMatch => ({
  person: r.person,
  name: r.name,
  avatarUrl: r.avatar_url ?? undefined,
  gist: r.gist,
  symbols: r.symbols ?? [],
  sharedSymbols: r.shared_symbols ?? [],
  sharedEmotions: r.shared_emotions ?? [],
  color: r.color ?? undefined,
  daysApart: Number(r.days_apart),
  match: r.match,
});

/** Kindred dreamers for one of your dreams, best first. */
export async function fetchKindred(dreamId: string): Promise<KindredMatch[]> {
  const { data, error } = await db().rpc('kindred_for_dream', { p_dream: dreamId, p_limit: 12 });
  if (error) throw error;
  return ((data ?? []) as MatchRow[]).map(toMatch);
}

/** Everyone connected to your dreams of the last `days` days (one row per dream × person). */
export async function fetchKindredWeb(days = 60): Promise<KindredLink[]> {
  const { data, error } = await db().rpc('kindred_web', { p_days: days, p_per_dream: 6 });
  if (error) throw error;
  return ((data ?? []) as (MatchRow & { dream_id: string; dreamt_at: string })[]).map((r) => ({
    ...toMatch(r),
    dreamId: r.dream_id,
    dreamtAt: r.dreamt_at,
  }));
}

/** How common each of the dream's symbols was among dreamers in the 10 days around it. */
export async function fetchPulse(dreamId: string): Promise<SymbolPulse[]> {
  const { data, error } = await db().rpc('dream_pulse', { p_dream: dreamId });
  if (error) throw error;
  return (data ?? []) as SymbolPulse[];
}

/** Shares any of your dreams that aren't shared yet (older dreams); see the `kindred` function. */
export async function syncKindred() {
  const { error } = await db().functions.invoke('kindred', { body: {} });
  if (error) throw error;
}

/** Turns sharing with Kindred dreamers on or off (both ways) for this account. */
export async function setShareDreams(on: boolean) {
  const { error } = await db().auth.updateUser({ data: { share_dreams: on } });
  if (error) throw error;
}
