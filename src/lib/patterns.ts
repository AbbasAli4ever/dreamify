import type { Dream } from '@/types/dream';

export type Ranked = { key: string; label: string; count: number; share: number };

function rank(items: { key: string; label: string }[], total: number): Ranked[] {
  const map = new Map<string, Ranked>();
  for (const i of items) {
    const prev = map.get(i.key);
    map.set(i.key, { ...i, count: (prev?.count ?? 0) + 1, share: 0 });
  }
  return [...map.values()]
    .map((r) => ({ ...r, share: total ? r.count / total : 0 }))
    .sort((a, b) => b.count - a.count);
}

/** The simple personal summary behind S9. Only *ready* dreams count. */
export function dreamPatterns(all: Dream[], now = new Date()) {
  const dreams = all.filter((d) => d.status === 'ready');
  const total = dreams.length;
  const inThisMonth = (d: Dream) => {
    const t = new Date(d.createdAt);
    return t.getFullYear() === now.getFullYear() && t.getMonth() === now.getMonth();
  };

  const emotions = rank(
    dreams.flatMap((d) => d.emotions.map((e) => ({ key: e.label, label: e.label }))),
    total,
  );
  const symbols = rank(
    dreams.flatMap((d) => d.symbols),
    total,
  );
  const themes = rank(
    dreams.flatMap((d) => d.themes.map((t) => ({ key: t, label: t }))),
    total,
  );

  // Dreams per day for the current month (the "dream rhythm").
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const perDay = Array.from({ length: daysInMonth }, () => 0);
  for (const d of dreams.filter(inThisMonth)) perDay[new Date(d.createdAt).getDate() - 1]++;

  const first = dreams.map((d) => d.createdAt).sort()[0];
  const answered = dreams.filter(
    (d) => d.reflection?.answerText || d.reflection?.answerAudioUri,
  ).length;

  return {
    total,
    thisMonth: dreams.filter(inThisMonth).length,
    firstDream: first,
    answered,
    emotions: emotions.slice(0, 3),
    symbols: symbols.slice(0, 3),
    theme: themes[0],
    perDay,
    today: now.getDate(),
  };
}
