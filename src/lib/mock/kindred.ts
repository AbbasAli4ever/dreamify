// Sample Kindred dreamers for demo mode (no Supabase) and the local sample dreams, so the
// feature can be seen without other accounts. Always flagged `sample` and labelled in the UI.
import { symbolLabel } from '@/lib/kindred';
import type { Dream } from '@/types/dream';
import type { KindredLink, KindredMatch, SymbolPulse } from '@/types/kindred';

const DREAMERS = [
  { name: 'Maya', color: '#8FA3D9' },
  { name: 'Leo', color: '#C98A4B' },
  { name: 'Sana', color: '#9B7FD1' },
  { name: 'Jonas', color: '#6FA2F2' },
  { name: 'Amara', color: '#D98FA8' },
  { name: 'Kai', color: '#7FC4B0' },
  { name: 'Noor', color: '#B8A46A' },
  { name: 'Theo', color: '#8C9BB5' },
];

const GISTS: Record<string, string> = {
  water: 'Wading through still, dark water that rose without a sound, calm more than afraid.',
  ocean: 'Standing at the edge of an endless ocean at night, feeling small but strangely safe.',
  rain: 'Walking through warm rain on an empty street at night, calm but a little lonely.',
  moon: 'A huge low moon lighting a silent landscape, everything waiting for something to begin.',
  door: 'A door standing on its own with light behind it, too curious to walk away.',
  desert: 'Crossing a quiet desert under a grey sky, searching for something just out of sight.',
  house: 'Wandering a familiar house that kept growing new rooms, half nostalgic, half uneasy.',
  forest: 'Lost between tall trees in blue light, following a sound that kept moving away.',
  flying: 'Lifting off the ground over rooftops at dusk, light and free for a moment.',
  falling: 'Falling slowly through soft darkness, strangely calm before waking.',
  stairs: 'Climbing stairs that never reached the top, patient but tired.',
  city: 'An empty city at night with every window lit and no one inside.',
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** 2–4 sample dreamers for a dream, stable per dream. */
export function sampleKindred(dream: Dream): KindredMatch[] {
  if (dream.status !== 'ready' || !dream.symbols.length) return [];
  const h = hash(dream.id);
  const count = 2 + (h % 3);
  const daysSince = Math.floor((Date.now() - new Date(dream.createdAt).getTime()) / 86400000);
  return Array.from({ length: count }, (_, i) => {
    const who = DREAMERS[(h + i * 3) % DREAMERS.length];
    const symbol = dream.symbols[i % dream.symbols.length];
    const shared = i === count - 1 ? [] : [symbol.key]; // the last one matches on feeling only
    const feeling = dream.emotions[i % Math.max(1, dream.emotions.length)]?.label.toLowerCase();
    const r = hash(`${dream.id}:${i}`);
    return {
      person: `sample-${who.name}`,
      name: who.name,
      gist:
        GISTS[symbol.key] ??
        `A dream full of ${symbolLabel(symbol.key, dream).toLowerCase()}, quiet and hard to shake off.`,
      symbols: [symbol.key],
      sharedSymbols: shared,
      sharedEmotions: feeling ? [feeling] : [],
      color: who.color,
      // Never "after you" beyond today.
      daysApart: Math.min((r % 19) - 9 || 1, daysSince),
      match: 90 - i * 11 - (r % 7),
      sample: true,
    };
  });
}

export function samplePulse(dream: Dream): SymbolPulse[] {
  return dream.symbols.map((s) => {
    const r = hash(`${dream.id}:${s.key}`);
    return { key: s.key, dreamers: 3 + (r % 9), total: 48 };
  });
}

export function sampleWeb(dreams: Dream[], days = 60): KindredLink[] {
  const since = Date.now() - days * 86400000;
  return dreams
    .filter((d) => new Date(d.createdAt).getTime() > since)
    .flatMap((d) => sampleKindred(d).map((m) => ({ ...m, dreamId: d.id, dreamtAt: d.createdAt })));
}
