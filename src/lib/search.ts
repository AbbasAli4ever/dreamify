import type { Dream } from '@/types/dream';

export type SearchHit = {
  dream: Dream;
  /** Where it matched, e.g. "Symbol" or "Your dream". */
  field: string;
  /** Short text around the match, to show under the title. */
  snippet: string;
};

const normalize = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');

function snippetAround(text: string, term: string, radius = 48) {
  const i = normalize(text).indexOf(term);
  if (i < 0) return text.slice(0, radius * 2);
  const start = Math.max(0, i - radius);
  const end = Math.min(text.length, i + term.length + radius);
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`;
}

function dateText(iso: string) {
  const d = new Date(iso);
  return [
    d.toLocaleDateString('en-GB', { weekday: 'long' }),
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }),
    d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
  ].join(' ');
}

/**
 * Client-side search over the dream world: title, symbols, emotions, themes,
 * transcript, insight and date. Every word must match somewhere.
 * (Postgres full-text search replaces this with Supabase.)
 */
export function searchDreams(dreams: Dream[], query: string): SearchHit[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  const hits: SearchHit[] = [];
  for (const dream of dreams) {
    if (dream.status !== 'ready') continue;
    const fields: [string, string][] = [
      ['Title', dream.title ?? ''],
      ['Symbol', dream.symbols.map((s) => s.label).join(' · ')],
      ['Emotion', dream.emotions.map((e) => e.label).join(' · ')],
      ['Theme', dream.themes.join(' · ')],
      ['Your dream', dream.transcript],
      ['Your insight', dream.reflection?.answerText ?? ''],
      ['Date', dateText(dream.createdAt)],
    ];
    // Symbol keys are searchable too (e.g. "moon" finds "Night"), but never shown.
    const keys = dream.symbols.map((s) => s.key).join(' ');
    const all = normalize(`${fields.map(([, v]) => v).join(' ')} ${keys}`);
    if (!terms.every((t) => all.includes(t))) continue;

    // Show the most meaningful field that contains the first word.
    const [field, value] =
      fields.find(([name, v]) => name !== 'Title' && normalize(v).includes(terms[0])) ??
      fields.find(([, v]) => normalize(v).includes(terms[0])) ??
      (dream.symbols.some((s) => normalize(s.key).includes(terms[0])) ? fields[1] : fields[4]);
    const snippet =
      field === 'Your dream' || field === 'Your insight' ? snippetAround(value, terms[0]) : value;
    hits.push({ dream, field, snippet });
  }
  return hits;
}

/** Symbols across ready dreams, most frequent first. */
export function symbolCounts(dreams: Dream[]) {
  const map = new Map<string, { key: string; label: string; count: number }>();
  for (const d of dreams)
    if (d.status === 'ready')
      for (const s of d.symbols) map.set(s.key, { ...s, count: (map.get(s.key)?.count ?? 0) + 1 });
  return [...map.values()].sort((a, b) => b.count - a.count);
}

/** Emotions across ready dreams, most frequent first. */
export function emotionCounts(dreams: Dream[]) {
  const map = new Map<string, number>();
  for (const d of dreams)
    if (d.status === 'ready')
      for (const e of d.emotions) map.set(e.label, (map.get(e.label) ?? 0) + 1);
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}
