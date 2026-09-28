// Kindred dreamers — docs/SCREENS.md S11. Other people whose dreams were alike within
// 10 days. Only an anonymous overview of their dream is ever shown, never the dream itself.

/** One other dreamer, matched to one of your dreams. */
export type KindredMatch = {
  /** Opaque, stable id for the person (not their account id). */
  person: string;
  /** First name only. */
  name: string;
  avatarUrl?: string;
  /** Anonymous one-line overview of their dream (Gemini). */
  gist: string;
  /** Symbol keys in their dream. */
  symbols: string[];
  sharedSymbols: string[];
  /** Lower-case emotion words you both felt. */
  sharedEmotions: string[];
  color?: string;
  /** Their dream minus yours, in days: negative = before you. */
  daysApart: number;
  /** 52–99. */
  match: number;
  /** Demo data (no backend, or a sample dream). */
  sample?: boolean;
};

/** A match together with which of your dreams it belongs to. */
export type KindredLink = KindredMatch & { dreamId: string; dreamtAt: string };

/** One person in your circle, across all your dreams. */
export type KindredPerson = {
  person: string;
  name: string;
  avatarUrl?: string;
  color?: string;
  /** Their closest match to any of your dreams. */
  best: KindredLink;
  /** Every one of your dreams they connect to, best first. */
  links: KindredLink[];
  /** Symbol keys shared across all links, most frequent first. */
  sharedSymbols: string[];
};

/** How many dreamers (people) around a dream's night had each of its symbols. */
export type SymbolPulse = { key: string; dreamers: number; total: number };
