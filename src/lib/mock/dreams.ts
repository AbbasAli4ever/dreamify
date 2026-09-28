// Sample dreams for building the UI before Supabase exists (docs/SCREENS.md §4).
// Artworks come from docs/ARTWORK_PROMPTS.md; numbers match.
import type { Dream } from '@/types/dream';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Dates relative to now so the data always feels recent. */
function daysAgo(days: number, hour = 7) {
  const d = new Date(Date.now() - days * DAY);
  d.setHours(hour, 12, 0, 0);
  // Never in the future (e.g. "today at 8am" when it's just past midnight),
  // so a dream recorded now always sorts first.
  const latest = Date.now() - HOUR;
  return new Date(Math.min(d.getTime(), latest)).toISOString();
}

export const MOCK_DREAMS: Dream[] = [
  {
    id: 'dream-01',
    createdAt: daysAgo(9, 7),
    inputType: 'voice',
    status: 'ready',
    title: 'The Door in the Black Desert',
    transcript:
      'I was walking through an endless desert. The sand was black, and the sky was ash-grey. In the middle of the desert stood a door. No walls, no house, just a door. I opened it and there was light behind it, warm, like a kitchen at night.',
    interpretation:
      "An empty landscape with a single threshold. Something in you is ready to move on, even if you can't see where the door leads yet.",
    emotions: [{ label: 'Unease' }, { label: 'Recognition' }],
    symbols: [
      { key: 'desert', label: 'Desert' },
      { key: 'door', label: 'Door' },
      { key: 'moon', label: 'Night' },
    ],
    themes: ['Inner quest', 'Transition'],
    artwork: require('@/assets/images/dreams/dream-01.jpg'),
    artworkColor: '#C98A4B',
    reflection: {
      question: 'The door stood alone in the *emptiness*. What are you *waiting* to walk through?',
    },
  },
  {
    id: 'dream-02',
    createdAt: daysAgo(7, 8),
    inputType: 'voice',
    status: 'ready',
    title: 'The Ocean That Disappeared',
    transcript:
      "The ocean disappeared overnight and only the boats remained, stranded on cracked sand. I walked between them. It wasn't scary, just very quiet, and the moon was huge.",
    interpretation:
      "Something that once held you up has pulled back. The calm suggests you're more ready for this change than you think.",
    emotions: [{ label: 'Loss' }, { label: 'Calm' }],
    symbols: [
      { key: 'ocean', label: 'Ocean' },
      { key: 'water', label: 'Water' },
      { key: 'moon', label: 'Night' },
    ],
    themes: ['Change', 'Letting go'],
    artwork: require('@/assets/images/dreams/dream-02.jpg'),
    artworkColor: '#8FA3D9',
    reflection: {
      question: 'What has *pulled away* recently that you once relied on?',
      answerText: "Maybe my old routine. I miss it, but I don't think I need it anymore.",
      answeredAt: daysAgo(7, 9),
    },
  },
  {
    id: 'dream-03',
    createdAt: daysAgo(6, 6),
    inputType: 'text',
    status: 'ready',
    title: 'A Glass Elevator in the Forest',
    transcript:
      'A glass elevator in the middle of the forest. It rose without sound. I could see everything through the walls, the trees, the fog, and it kept going up.',
    interpretation:
      "You're rising through something without effort. Transparency hints that you want to see clearly where you're heading.",
    emotions: [{ label: 'Wonder' }, { label: 'Anticipation' }],
    symbols: [
      { key: 'forest', label: 'Forest' },
      { key: 'light', label: 'Light' },
      { key: 'stairs', label: 'Stairs' },
    ],
    themes: ['Growth', 'Rising'],
    artwork: require('@/assets/images/dreams/dream-03.jpg'),
    artworkColor: '#A7B8E8',
    reflection: { question: 'Where in your life are you rising *without trying*?' },
  },
  {
    id: 'dream-04',
    createdAt: daysAgo(4, 7),
    inputType: 'voice',
    status: 'ready',
    title: 'The Wolf in My Childhood Room',
    transcript:
      "I found myself in a room that looked like my childhood bedroom. A wolf sat on the bed, staring at me. It didn't move. I stepped closer and it said: you are searching for what has always been with you.",
    interpretation:
      "The wolf is a part of you that you've kept at a distance. It doesn't threaten, it waits, in the place where you were most yourself.",
    emotions: [{ label: 'Fear' }, { label: 'Recognition' }, { label: 'Calm' }],
    symbols: [
      { key: 'wolf', label: 'Wolf' },
      { key: 'house', label: 'House' },
      { key: 'moon', label: 'Night' },
    ],
    themes: ['Childhood', 'Shadow'],
    artwork: require('@/assets/images/dreams/dream-04.jpg'),
    artworkColor: '#9AA5C4',
    reflection: {
      question: 'What part of yourself have you *feared*, but may now be ready to *hear*?',
      answerText:
        "The wolf didn't scare me, it watched. Maybe it's the strength I've kept hidden for too long.",
      answeredAt: daysAgo(4, 9),
    },
  },
  {
    id: 'dream-05',
    createdAt: daysAgo(3, 8),
    inputType: 'text',
    status: 'ready',
    title: 'The Mirror on the Floor',
    transcript:
      "A mirror on the floor, reflecting a sky that wasn't there, full of fractured stars. Water all around it. I was afraid to step on it.",
    interpretation:
      "You're looking at yourself from an unusual angle. The cracks aren't damage, they're where the light gets in.",
    emotions: [{ label: 'Curiosity' }, { label: 'Unease' }],
    symbols: [
      { key: 'mirror', label: 'Mirror' },
      { key: 'water', label: 'Water' },
      { key: 'star', label: 'Stars' },
    ],
    themes: ['Self-reflection', 'Hidden truths'],
    artwork: require('@/assets/images/dreams/dream-05.jpg'),
    artworkColor: '#7F95D6',
    reflection: { question: 'What did you see in yourself this week that *surprised* you?' },
  },
  {
    id: 'dream-06',
    createdAt: daysAgo(2, 6),
    inputType: 'voice',
    status: 'ready',
    title: 'The Staircase Inside the Mountain',
    transcript:
      "A staircase carved into the mountain, going up into the clouds. I kept climbing and I couldn't see the top, but I didn't want to stop.",
    interpretation:
      'A long climb, taken alone and willingly. The hidden summit asks whether the path itself is the point.',
    emotions: [{ label: 'Longing' }, { label: 'Determination' }],
    symbols: [
      { key: 'stairs', label: 'Stairs' },
      { key: 'mountain', label: 'Mountain' },
      { key: 'cloud', label: 'Clouds' },
    ],
    themes: ['Ambition', 'Solitude'],
    artwork: require('@/assets/images/dreams/dream-06.jpg'),
    artworkColor: '#B7C3E0',
    reflection: { question: "What are you climbing toward that you *can't see yet*?" },
  },
  {
    id: 'dream-07',
    createdAt: daysAgo(1, 7),
    inputType: 'voice',
    status: 'ready',
    title: 'The Station With No Tracks',
    transcript:
      'A train station with no tracks, but people waiting anyway. Where the tracks should be there was just black water. A door in the wall was glowing.',
    interpretation:
      "You're waiting for a way forward that doesn't exist yet, while a quieter door is already open.",
    emotions: [{ label: 'Uncertainty' }, { label: 'Waiting' }],
    symbols: [
      { key: 'train', label: 'Train' },
      { key: 'water', label: 'Water' },
      { key: 'door', label: 'Door' },
    ],
    themes: ['Transition', 'Patience'],
    artwork: require('@/assets/images/dreams/dream-07.jpg'),
    artworkColor: '#D9A45B',
    reflection: {
      question: "Is there a *door* you've been ignoring while you *wait* for the train?",
    },
  },
  {
    id: 'dream-08',
    createdAt: daysAgo(0, 8),
    inputType: 'voice',
    status: 'ready',
    title: 'Jellyfish Over the Sleeping City',
    transcript:
      'Giant jellyfish were floating over the city while everyone slept. The streets were flooded but it was peaceful. Their light reflected in the water and I just watched.',
    interpretation:
      "Your emotions are drifting above the everyday, glowing, not drowning anything. There's peace in simply watching them.",
    emotions: [{ label: 'Peace' }, { label: 'Wonder' }],
    symbols: [
      { key: 'water', label: 'Water' },
      { key: 'light', label: 'Light' },
      { key: 'house', label: 'Houses' },
    ],
    themes: ['Calm', 'Emotions'],
    artwork: require('@/assets/images/dreams/dream-08.jpg'),
    artworkColor: '#6FA2F2',
    reflection: { question: 'What feeling have you been *watching* lately instead of *feeling*?' },
  },
];
