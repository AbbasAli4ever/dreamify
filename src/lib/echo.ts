import type { Dream, DreamEcho } from '@/types/dream';

const byNewest = (a: Dream, b: Dream) => b.createdAt.localeCompare(a.createdAt);

/**
 * Dream Echo: the strongest recurring symbol between `dream` and the dreams before it.
 * Returns null when nothing in this dream has appeared before.
 */
export function findEcho(dream: Dream, all: Dream[]): DreamEcho | null {
  const previous = all
    .filter((d) => d.id !== dream.id && d.createdAt < dream.createdAt)
    .sort(byNewest);

  let best: DreamEcho | null = null;
  for (const symbol of dream.symbols) {
    const related = previous.filter((d) => d.symbols.some((s) => s.key === symbol.key));
    if (related.length === 0 || (best && related.length <= best.count)) continue;

    const n = related.length;
    best = {
      kind: 'symbol',
      key: symbol.key,
      label: symbol.label,
      count: n,
      relatedDreamIds: related.map((d) => d.id),
      message: `*${symbol.label}* has appeared in ${n} of your previous ${n === 1 ? 'dream' : 'dreams'}.`,
    };
  }
  return best;
}

/** The echo shown on Home: from the most recent ready dream. */
export function latestEcho(all: Dream[]): DreamEcho | null {
  const latest = all.filter((d) => d.status === 'ready').sort(byNewest)[0];
  return latest ? findEcho(latest, all) : null;
}

export function sortNewest(dreams: Dream[]) {
  return [...dreams].sort(byNewest);
}

/** How many dreams before `dream` contain the symbol `key` (the `xN` badge). */
export function countEarlier(dream: Dream, all: Dream[], key: string) {
  return all.filter(
    (d) =>
      d.id !== dream.id && d.createdAt < dream.createdAt && d.symbols.some((s) => s.key === key),
  ).length;
}

export type SymbolProfile = {
  key: string;
  label: string;
  /** Ready dreams containing the symbol, newest first. */
  dreams: Dream[];
  firstSeen?: string;
  /** Emotions felt in those dreams, most frequent first. */
  coEmotions: { label: string; count: number }[];
  /** Other symbols that appear in the same dreams, most frequent first. */
  coSymbols: { key: string; label: string; count: number }[];
};

function tally<T extends { key: string }>(items: T[]) {
  const map = new Map<string, T & { count: number }>();
  for (const item of items) {
    const prev = map.get(item.key);
    map.set(item.key, { ...item, count: (prev?.count ?? 0) + 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

/** Everything S6 needs about one symbol across the dream world. */
export function symbolProfile(key: string, all: Dream[]): SymbolProfile {
  const dreams = sortNewest(
    all.filter((d) => d.status === 'ready' && d.symbols.some((s) => s.key === key)),
  );
  const label =
    dreams[0]?.symbols.find((s) => s.key === key)?.label ??
    key.charAt(0).toUpperCase() + key.slice(1);

  const coEmotions = tally(
    dreams.flatMap((d) => d.emotions.map((e) => ({ key: e.label, label: e.label }))),
  )
    .slice(0, 4)
    .map(({ label: l, count }) => ({ label: l, count }));
  const coSymbols = tally(dreams.flatMap((d) => d.symbols.filter((s) => s.key !== key)))
    .slice(0, 6)
    .map(({ key: k, label: l, count }) => ({ key: k, label: l, count }));

  return { key, label, dreams, firstSeen: dreams.at(-1)?.createdAt, coEmotions, coSymbols };
}

/**
 * A short note written from the user's own dreams (not a dictionary entry).
 * Mock wording for now; the backend's text model will write this later.
 */
export function personalNote(profile: SymbolProfile) {
  const { label, dreams, coEmotions, coSymbols } = profile;
  const name = label.toLowerCase();
  if (dreams.length === 0) return `${label} hasn't appeared in your dreams yet.`;
  const feelings = coEmotions.slice(0, 2).map((e) => e.label.toLowerCase());
  const feelingText =
    feelings.length === 2
      ? `${feelings[0]} and ${feelings[1]}`
      : (feelings[0] ?? 'quiet curiosity');
  const latest = dreams[0].title ? `, most recently in “${dreams[0].title}”` : '';
  const companion = coSymbols[0]
    ? ` It often arrives together with ${coSymbols[0].label.toLowerCase()}.`
    : '';
  if (dreams.length === 1)
    return `So far ${name} has appeared once${latest}, carrying a feeling of ${feelingText}.${companion}`;
  return `In your dreams, ${name} tends to arrive with ${feelingText}${latest}.${companion} Notice what was happening in your days around those nights.`;
}
