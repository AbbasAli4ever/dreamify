import type { ImageSource } from 'expo-image';

// Data model — docs/SCREENS.md §4.

export type EmotionTag = { label: string; intensity?: number };

export type SymbolRef = {
  /** Fixed vocabulary key → icon in assets/icons/symbols/. */
  key: string;
  label: string;
};

export type DreamStatus = 'draft' | 'processing' | 'ready' | 'failed';

export type Dream = {
  id: string;
  createdAt: string; // ISO
  inputType: 'voice' | 'text';
  audioUri?: string;
  transcript: string;
  status: DreamStatus;
  /** While processing: index of the stage in progress (see lib/ai/process-dream.ts). */
  processingStage?: number;
  /** Why processing failed (or partly failed), from the backend. */
  error?: string;
  /** Sample dreams are local-only and never sent to the backend. */
  sample?: boolean;

  /**
   * The agent's short spoken reaction to a voice dream (Gemini), voiced on Home by
   * Deepgram TTS through the `speak` function. undefined = not ready yet; '' = none (the dream carries on).
   */
  reply?: { text: string };

  // AI outputs
  title?: string;
  summary?: string;
  interpretation?: string;
  emotions: EmotionTag[];
  symbols: SymbolRef[];
  themes: string[];
  /** Local require() for mock data, remote URL once generated. */
  artwork?: ImageSource | number;
  artworkColor?: string;
  reflection?: {
    question: string; // may contain *emphasis* markers
    /** The question read aloud (Deepgram TTS). */
    questionAudioUri?: string;
    answerText?: string;
    answerAudioUri?: string;
    answeredAt?: string;
  };
};

export type DreamEcho = {
  kind: 'symbol' | 'emotion' | 'theme' | 'person' | 'place';
  key: string;
  label: string;
  /** Appearances in *previous* dreams. */
  count: number;
  relatedDreamIds: string[];
  /** Uses *emphasis* markers, e.g. "*Water* has appeared in 3 of your previous dreams." */
  message: string;
};
