import type { Dream } from '@/types/dream';
import type { KindredLink, KindredMatch, KindredPerson, SymbolPulse } from '@/types/kindred';

/** Kindred dreamers are matched within this many days of your dream (see the migration). */
export const KINDRED_WINDOW_DAYS = 10;

/** The label a symbol has in this dream, else its key in words ("Rain"). */
export function symbolLabel(key: string, dream?: Dream) {
  return (
    dream?.symbols.find((s) => s.key === key)?.label ??
    key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ')
  );
}

/** "the same night", "4 days before you", "1 day after you". */
export function whenLabel(daysApart: number) {
  const n = Math.round(Math.abs(daysApart));
  if (n === 0) return 'the same night';
  return `${n} ${n === 1 ? 'day' : 'days'} ${daysApart < 0 ? 'before' : 'after'} you`;
}

/**
 * The lines written into the dream's description (RichText, *emphasis*):
 * "*3 dreamers* saw something like this within 10 days." and one about the closest.
 */
export function kindredLines(matches: KindredMatch[], dream: Dream): string[] {
  const top = matches[0];
  if (!top) return [];
  const n = matches.length;
  const lead =
    n === 1
      ? `*One dreamer* saw something like this within ${KINDRED_WINDOW_DAYS} days of you.`
      : `*${n} dreamers* saw something like this within ${KINDRED_WINDOW_DAYS} days of you.`;
  const shared = top.sharedSymbols.slice(0, 2).map((k) => symbolLabel(k, dream).toLowerCase());
  const feeling = top.sharedEmotions[0];
  const closest = shared.length
    ? `*${top.name}* dreamt of *${shared.join('* and *')}* ${whenLabel(top.daysApart)}.`
    : feeling
      ? `*${top.name}* felt the same *${feeling}* in a dream ${whenLabel(top.daysApart)}.`
      : `*${top.name}*'s dream had the same feel, ${whenLabel(top.daysApart)}.`;
  return [lead, closest];
}

/** "*2 of 3* dreamers" for a small crowd, "*12%* of dreamers" once there are enough. */
export function pulseLine(p: SymbolPulse, label: string) {
  const who =
    p.total < 20
      ? `*${p.dreamers} of ${p.total}* dreamers`
      : `*${Math.round((p.dreamers / p.total) * 100)}%* of dreamers`;
  return `${who} dreamt of *${label.toLowerCase()}* around this night.`;
}

/** Your circle: one entry per person across all your dreams, closest first. */
export function groupPeople(links: KindredLink[]): KindredPerson[] {
  const map = new Map<string, KindredLink[]>();
  for (const l of links) map.set(l.person, [...(map.get(l.person) ?? []), l]);
  return [...map.values()]
    .map((all) => {
      const sorted = [...all].sort((a, b) => b.match - a.match);
      const best = sorted[0];
      const tally = new Map<string, number>();
      for (const l of sorted)
        for (const k of l.sharedSymbols) tally.set(k, (tally.get(k) ?? 0) + 1);
      return {
        person: best.person,
        name: best.name,
        avatarUrl: best.avatarUrl,
        color: best.color,
        best,
        links: sorted,
        sharedSymbols: [...tally.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k),
      };
    })
    .sort((a, b) => b.best.match - a.best.match || b.links.length - a.links.length);
}

/**
 * Threads between the people around you who dreamt of the same things (the mesh in the
 * graph), as index pairs into `people`.
 */
export function meshPairs(people: { symbols: string[] }[], max = 12): [number, number][] {
  const pairs: [number, number][] = [];
  for (let i = 0; i < people.length; i++)
    for (let j = i + 1; j < people.length; j++)
      if (people[i].symbols.some((k) => people[j].symbols.includes(k))) pairs.push([i, j]);
  return pairs.slice(0, max);
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/**
 * Dream streak: nights in a row with a remembered dream, ending today (or yesterday, so
 * the streak isn't "lost" before this morning's dream is told). Also the longest ever.
 */
export function dreamStreak(dreams: Dream[], now = new Date()) {
  const days = new Set(
    dreams.filter((d) => d.status !== 'failed').map((d) => dayKey(new Date(d.createdAt))),
  );
  const cursor = new Date(now);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let current = 0;
  while (days.has(dayKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const sorted = [
    ...new Set(
      dreams
        .filter((d) => d.status !== 'failed')
        .map((d) => {
          const t = new Date(d.createdAt);
          return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
        }),
    ),
  ].sort((a, b) => a - b);
  let longest = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    // Calendar-day gap (rounded, so a DST change doesn't break a run).
    run = i > 0 && Math.round((sorted[i] - sorted[i - 1]) / 86400000) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  return { current, longest: Math.max(longest, current), today: days.has(dayKey(now)) };
}
