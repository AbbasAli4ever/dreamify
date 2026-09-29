// The fixed symbol vocabulary. Keys match assets/icons/symbols/*.svg in the app,
// so every symbol the AI picks has an icon. Keep in sync with src/constants/symbols.ts.
export const SYMBOL_KEYS = [
  'bird', 'cat', 'cloud', 'crow', 'death', 'desert', 'door', 'eye', 'fire', 'forest',
  'grass', 'heart', 'house', 'key', 'light', 'mask', 'mirror', 'moon', 'mountain', 'ocean',
  'snake', 'snow', 'stairs', 'star', 'sun', 'train', 'water', 'web', 'wind', 'wolf',
] as const;

export type SymbolKey = (typeof SYMBOL_KEYS)[number];

export const isSymbolKey = (k: string): k is SymbolKey =>
  (SYMBOL_KEYS as readonly string[]).includes(k);
