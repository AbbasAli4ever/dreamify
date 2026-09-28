// Stand-in for the real AI (speech-to-text, text model, image model) until the
// Supabase backend exists. It reads the words of the dream and returns the same
// shape the real analyzer will. Swap this file, not the screens.

import type { ImageSource } from 'expo-image';

import type { EmotionTag, SymbolRef } from '@/types/dream';

/** Symbol key → words that suggest it. Keys match assets/icons/symbols/. */
const SYMBOL_WORDS: Record<string, string[]> = {
  water: [
    'water',
    'river',
    'rain',
    'lake',
    'swim',
    'swimming',
    'flood',
    'flooded',
    'wave',
    'waves',
    'pool',
  ],
  ocean: ['ocean', 'sea', 'shore', 'beach', 'tide'],
  door: ['door', 'doors', 'gate', 'doorway'],
  house: ['house', 'home', 'room', 'bedroom', 'kitchen', 'hallway'],
  forest: ['forest', 'woods', 'tree', 'trees', 'jungle'],
  stairs: ['stairs', 'staircase', 'steps', 'ladder', 'elevator'],
  train: ['train', 'station', 'railway', 'tracks', 'platform'],
  mirror: ['mirror', 'reflection', 'reflecting'],
  moon: ['moon', 'night', 'dark', 'midnight'],
  sun: ['sun', 'sunlight', 'morning', 'dawn'],
  star: ['star', 'stars', 'sky'],
  fire: ['fire', 'flame', 'flames', 'burning', 'burn'],
  wolf: ['wolf', 'wolves', 'dog', 'dogs'],
  cat: ['cat', 'cats', 'kitten'],
  crow: ['crow', 'raven', 'crows'],
  bird: ['bird', 'birds', 'fly', 'flying', 'flew', 'wings'],
  snake: ['snake', 'snakes', 'serpent'],
  mountain: ['mountain', 'mountains', 'cliff', 'hill', 'climb', 'climbing'],
  desert: ['desert', 'sand', 'dunes'],
  key: ['key', 'keys', 'lock', 'locked'],
  eye: ['eye', 'eyes', 'watching', 'watched', 'staring'],
  mask: ['mask', 'masks', 'face', 'faces', 'stranger'],
  death: ['death', 'dead', 'dying', 'died', 'grave', 'skull'],
  heart: ['love', 'heart', 'kiss', 'hug'],
  light: ['light', 'glow', 'glowing', 'shining', 'bright'],
  cloud: ['cloud', 'clouds', 'fog', 'mist'],
  wind: ['wind', 'storm', 'windy'],
  snow: ['snow', 'ice', 'cold', 'frozen', 'winter'],
  grass: ['grass', 'field', 'meadow', 'garden'],
  web: ['spider', 'web', 'trapped', 'stuck'],
};

const SYMBOL_LABELS: Record<string, string> = { moon: 'Night', star: 'Stars', house: 'House' };

const EMOTION_WORDS: Record<string, string[]> = {
  Fear: ['scared', 'afraid', 'fear', 'terrified', 'panic', 'chased', 'chasing'],
  Unease: ['strange', 'weird', 'uneasy', 'lost', 'wrong', 'uncomfortable'],
  Calm: ['calm', 'peaceful', 'quiet', 'still', 'safe', 'slow'],
  Wonder: ['beautiful', 'glowing', 'magical', 'amazing', 'floating', 'huge'],
  Sadness: ['sad', 'crying', 'cried', 'tears', 'alone', 'lonely'],
  Joy: ['happy', 'laughing', 'laughed', 'joy', 'smiling'],
  Longing: ['miss', 'missed', 'missing', 'wanted', 'searching', 'looking'],
  Anxiety: ['late', 'falling', 'fell', 'running', 'hurry', 'exam'],
  Curiosity: ['curious', 'wondered', 'explore', 'exploring', 'opened', 'found'],
};

const THEMES: Record<string, string> = {
  water: 'Emotions',
  ocean: 'The unconscious',
  door: 'Transition',
  house: 'The self',
  forest: 'The unknown',
  stairs: 'Growth',
  train: 'Life direction',
  mirror: 'Self-reflection',
  mountain: 'Ambition',
  death: 'Endings',
  wolf: 'Instinct',
  key: 'Answers',
  bird: 'Freedom',
  fire: 'Change',
};

const QUESTIONS: Record<string, string> = {
  water: 'What *feeling* has been rising in you lately, like water?',
  ocean: 'What feels as *vast* as that ocean in your life right now?',
  door: 'Is there a *door* in your life you are hesitating to open?',
  house: 'The house felt *familiar*. Does it remind you of somewhere from your *childhood*?',
  forest: 'Where in your life do you feel a little *lost*, but curious?',
  stairs: 'What are you *climbing* toward right now?',
  train: 'Are you *waiting* for something that may never arrive?',
  mirror: 'What did you *see* in yourself this week that surprised you?',
  wolf: 'What part of yourself have you *feared*, but may now be ready to *hear*?',
  mountain: 'What *summit* are you quietly working toward?',
  death: 'What in your life might be *ending*, to make room for something new?',
};

/** Which sample artwork best fits a symbol (docs/ARTWORK_PROMPTS.md). */
const ARTWORK_FOR_SYMBOL: Record<string, number> = {
  door: 1,
  desert: 1,
  ocean: 2,
  forest: 3,
  light: 3,
  wolf: 4,
  house: 4,
  mirror: 5,
  star: 5,
  stairs: 6,
  mountain: 6,
  cloud: 6,
  train: 7,
  water: 8,
};

const ARTWORKS: Record<number, { source: ImageSource | number; color: string }> = {
  1: { source: require('@/assets/images/dreams/dream-01.jpg'), color: '#C98A4B' },
  2: { source: require('@/assets/images/dreams/dream-02.jpg'), color: '#8FA3D9' },
  3: { source: require('@/assets/images/dreams/dream-03.jpg'), color: '#A7B8E8' },
  4: { source: require('@/assets/images/dreams/dream-04.jpg'), color: '#9AA5C4' },
  5: { source: require('@/assets/images/dreams/dream-05.jpg'), color: '#7F95D6' },
  6: { source: require('@/assets/images/dreams/dream-06.jpg'), color: '#B7C3E0' },
  7: { source: require('@/assets/images/dreams/dream-07.jpg'), color: '#D9A45B' },
  8: { source: require('@/assets/images/dreams/dream-08.jpg'), color: '#6FA2F2' },
};

/** Stand-in "speech-to-text" for voice dreams until real transcription exists. */
const SAMPLE_TRANSCRIPTS = [
  "I was in a house I didn't know, but it felt like home. Every door opened onto a different season, and in the last room there was snow falling indoors. I wasn't cold. I felt calm, like someone was watching over me.",
  'I was swimming in a dark lake at night and the water was warm. The moon was huge and when I looked down I could see a city under the water with lights still on. I wanted to go down there but I woke up.',
  'I was climbing stairs inside a mountain and every floor had a window looking at the same forest. A crow followed me the whole way up. I kept thinking I was late for something.',
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function tokens(text: string) {
  return text.toLowerCase().match(/[a-z']+/g) ?? [];
}

function hash(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function transcribe(seed: string) {
  return SAMPLE_TRANSCRIPTS[hash(seed) % SAMPLE_TRANSCRIPTS.length];
}

export function findSymbols(text: string): SymbolRef[] {
  const words = tokens(text);
  const scored = Object.entries(SYMBOL_WORDS)
    .map(([key, list]) => ({ key, score: words.filter((w) => list.includes(w)).length }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  const symbols = scored.map(({ key }) => ({ key, label: SYMBOL_LABELS[key] ?? cap(key) }));
  return symbols.length ? symbols : [{ key: 'star', label: 'Stars' }];
}

export function findEmotions(text: string): EmotionTag[] {
  const words = tokens(text);
  const found = Object.entries(EMOTION_WORDS)
    .map(([label, list]) => ({ label, score: words.filter((w) => list.includes(w)).length }))
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ label }) => ({ label }));
  return found.length ? found : [{ label: 'Curiosity' }, { label: 'Wonder' }];
}

export function makeTitle(symbols: SymbolRef[], text: string) {
  const [a, b] = symbols.filter((s) => s.key !== 'star');
  if (a && b) return `The ${a.label} and the ${b.label}`;
  if (a) return `The ${a.label} in the Dream`;
  return cap(tokens(text).slice(0, 5).join(' ')) || 'An Untitled Dream';
}

export function makeThemes(symbols: SymbolRef[]) {
  const themes = symbols.map((s) => THEMES[s.key]).filter(Boolean);
  return [...new Set(themes)].slice(0, 3);
}

export function makeInterpretation(symbols: SymbolRef[], emotions: EmotionTag[]) {
  const [a, b] = symbols;
  const feeling = emotions[0]?.label.toLowerCase() ?? 'curiosity';
  const pair = b ? `${a.label.toLowerCase()} and ${b.label.toLowerCase()}` : a.label.toLowerCase();
  return `Your dream moves through ${pair}, held by a sense of ${feeling}. Symbols like these often appear when something inside you is asking for attention, not to alarm you, but to be noticed.`;
}

export function makeQuestion(symbols: SymbolRef[]) {
  const q = symbols.map((s) => QUESTIONS[s.key]).find(Boolean);
  return q ?? 'What part of this dream is still *with you* now that you are awake?';
}

export function paint(symbols: SymbolRef[], text: string) {
  const n = symbols.map((s) => ARTWORK_FOR_SYMBOL[s.key]).find(Boolean) ?? (hash(text) % 8) + 1;
  return ARTWORKS[n];
}
