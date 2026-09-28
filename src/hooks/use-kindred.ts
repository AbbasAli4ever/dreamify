import { useEffect, useMemo, useState } from 'react';

import * as api from '@/lib/backend/kindred-api';
import { groupPeople } from '@/lib/kindred';
import { sampleKindred, samplePulse, sampleWeb } from '@/lib/mock/kindred';
import { useAuth } from '@/providers/auth-provider';
import { useDreams } from '@/providers/dreams-provider';
import type { Dream } from '@/types/dream';
import type { KindredLink, KindredMatch, SymbolPulse } from '@/types/kindred';

export type KindredStatus = 'off' | 'loading' | 'ready' | 'error';

/** Results are reused for a minute, so going back and forth doesn't refetch. */
const FRESH_MS = 60_000;
const cache = new Map<string, { at: number; value: unknown }>();
let synced: { uid: string; job: Promise<void> } | null = null;

/** Once per account per app session: share older dreams that aren't shared yet. */
function ensureSynced(uid: string) {
  if (synced?.uid !== uid) synced = { uid, job: api.syncKindred().catch(() => {}) };
  return synced.job;
}

/** Fetches through the cache; `key` includes the account, so accounts never mix. */
function useCached<T>(key: string | null, load: () => Promise<T>) {
  const [state, setState] = useState<{ key: string; value?: T; error?: boolean } | null>(null);
  useEffect(() => {
    if (!key) return;
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < FRESH_MS) {
      Promise.resolve().then(() => setState({ key, value: hit.value as T }));
      return;
    }
    let live = true;
    load()
      .then((value) => {
        cache.set(key, { at: Date.now(), value });
        if (live) setState({ key, value });
      })
      .catch(() => live && setState({ key, error: true }));
    return () => {
      live = false;
    };
    // `load` is rebuilt every render; the key says when to fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const current = state?.key === key ? state : null;
  return { value: current?.value, error: !!current?.error, loaded: !!current };
}

/** Kindred dreamers and the symbol pulse for one dream (S5). */
export function useDreamKindred(dream?: Dream): {
  status: KindredStatus;
  matches: KindredMatch[];
  pulse: SymbolPulse[];
} {
  const { user, backend } = useAuth();
  const on = user?.shareDreams !== false;
  const ready = dream?.status === 'ready';
  const local = !backend || !!dream?.sample;
  const uid = user?.id;

  const remote = useCached(
    on && ready && !local && uid && dream ? `${uid}:dream:${dream.id}` : null,
    async () => {
      await ensureSynced(uid!);
      const [matches, pulse] = await Promise.all([
        api.fetchKindred(dream!.id),
        api.fetchPulse(dream!.id).catch(() => []),
      ]);
      return { matches, pulse };
    },
  );
  const sample = useMemo(
    () =>
      local && ready && dream ? { matches: sampleKindred(dream), pulse: samplePulse(dream) } : null,
    [local, ready, dream],
  );

  if (!on) return { status: 'off', matches: [], pulse: [] };
  if (sample) return { status: 'ready', ...sample };
  if (remote.error) return { status: 'error', matches: [], pulse: [] };
  if (!remote.value) return { status: 'loading', matches: [], pulse: [] };
  return { status: 'ready', ...remote.value };
}

/** Everyone connected to your recent dreams (S11 and the Home card). */
export function useKindredCircle() {
  const { user, backend } = useAuth();
  const { dreams } = useDreams();
  const on = user?.shareDreams !== false;
  const uid = user?.id;
  const readyCount = dreams.filter((d) => d.status === 'ready' && !d.sample).length;

  const remote = useCached<KindredLink[]>(
    on && backend && uid && readyCount ? `${uid}:web:${readyCount}` : null,
    async () => {
      await ensureSynced(uid!);
      return api.fetchKindredWeb();
    },
  );
  const links = useMemo<KindredLink[]>(
    () => (backend ? (remote.value ?? []) : sampleWeb(dreams)),
    [backend, remote.value, dreams],
  );
  const people = useMemo(() => groupPeople(links), [links]);

  const status: KindredStatus = !on
    ? 'off'
    : !backend || readyCount === 0
      ? 'ready'
      : remote.error
        ? 'error'
        : remote.loaded
          ? 'ready'
          : 'loading';
  return { status, links, people, sample: !backend };
}

/** Forget cached results (after sharing is switched on or off). */
export function clearKindredCache() {
  cache.clear();
}
