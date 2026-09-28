import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { processDream as mockProcess } from '@/lib/ai/process-dream';
import * as api from '@/lib/backend/dreams-api';
import { backendEnabled, ensureSession, supabase } from '@/lib/backend/supabase';
import { latestEcho, sortNewest } from '@/lib/echo';
import { MOCK_DREAMS } from '@/lib/mock/dreams';
import type { Dream, DreamEcho } from '@/types/dream';

export type NewDream = { inputType: 'voice' | 'text'; transcript?: string; audioUri?: string };

type DreamsContextValue = {
  /** Newest first. */
  dreams: Dream[];
  /** True while the first load from Supabase is running. */
  loading: boolean;
  /** Supabase + real AI (true) or local sample data + mock AI (false). */
  backend: boolean;
  syncError: string | null;
  latestEcho: DreamEcho | null;
  getDream: (id: string) => Dream | undefined;
  /** Saves a new dream (status `processing`) and returns its id. */
  createDream: (input: NewDream) => Promise<string>;
  /** Local-only patch (UI state). */
  updateDream: (id: string, patch: Partial<Dream>) => void;
  saveReflection: (id: string, answer: { text?: string; audioUri?: string }) => Promise<void>;
  removeDream: (id: string) => Promise<void>;
  /** Runs the AI pipeline for a dream once, app-wide (survives leaving the screen). */
  startProcessing: (dream: Dream) => void;
  /** Speech-to-text for a voice note; null when there's no backend. */
  transcribeVoiceNote: (uri: string) => Promise<string | null>;
  /** Clears local data and the Supabase session (Sign out). */
  signOut: () => Promise<void>;
};

const DreamsContext = createContext<DreamsContextValue | null>(null);

const POLL_MS = 1500;
const POLL_TIMEOUT_MS = 3 * 60 * 1000;
const SAMPLES = MOCK_DREAMS.map((d) => ({ ...d, sample: true }));
const SHOW_SAMPLES = process.env.EXPO_PUBLIC_SHOW_SAMPLE_DREAMS === '1';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

// Single source of dream data (docs/SCREENS.md §4). Screens never talk to Supabase directly.
export function DreamsProvider({ children }: { children: ReactNode }) {
  const [raw, setDreams] = useState<Dream[]>(
    backendEnabled ? (SHOW_SAMPLES ? SAMPLES : []) : MOCK_DREAMS,
  );
  const [loading, setLoading] = useState(backendEnabled);
  const [syncError, setSyncError] = useState<string | null>(null);
  const running = useRef(new Set<string>());

  const patch = useCallback(
    (id: string, p: Partial<Dream>) =>
      setDreams((prev) => prev.map((d) => (d.id === id ? { ...d, ...p } : d))),
    [],
  );

  /** Signs in (anonymously if needed) and fetches the user's dreams from Supabase. */
  const fetchRemote = useCallback(async () => {
    await ensureSession();
    const remote = await api.fetchDreams();
    return SHOW_SAMPLES ? [...remote, ...SAMPLES] : remote;
  }, []);

  const applyRemote = useCallback((promise: Promise<Dream[]>) => {
    promise
      .then((list) => {
        setDreams(list);
        setSyncError(null);
      })
      .catch((e) => setSyncError(message(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (backendEnabled) applyRemote(fetchRemote());
  }, [applyRemote, fetchRemote]);

  const value = useMemo<DreamsContextValue>(() => {
    const dreams = sortNewest(raw);
    const find = (id: string) => dreams.find((d) => d.id === id);
    const isLocal = (d?: Dream) => !backendEnabled || !!d?.sample;

    async function pollUntilDone(id: string) {
      const started = Date.now();
      while (Date.now() - started < POLL_TIMEOUT_MS) {
        await wait(POLL_MS);
        const fresh = await api.fetchDream(id).catch(() => null);
        if (!fresh) continue;
        setDreams((prev) => prev.map((d) => (d.id === id ? fresh : d)));
        if (fresh.status === 'ready' || fresh.status === 'failed') return;
      }
      patch(id, { status: 'failed', error: 'This is taking too long. Try again.' });
    }

    return {
      dreams,
      loading,
      backend: backendEnabled,
      syncError,
      latestEcho: latestEcho(dreams),
      getDream: find,

      createDream: async (input) => {
        if (!backendEnabled) {
          const id = `dream-${Date.now()}`;
          setDreams((prev) => [
            {
              id,
              createdAt: new Date().toISOString(),
              inputType: input.inputType,
              audioUri: input.audioUri,
              transcript: input.transcript ?? '',
              status: 'processing',
              emotions: [],
              symbols: [],
              themes: [],
            },
            ...prev,
          ]);
          return id;
        }
        await ensureSession();
        const created = await api.createDream(input);
        setDreams((prev) => [created, ...prev]);
        return created.id;
      },

      updateDream: patch,

      saveReflection: async (id, answer) => {
        const dream = find(id);
        const answeredAt = new Date().toISOString();
        patch(id, {
          reflection: {
            question: dream?.reflection?.question ?? '',
            questionAudioUri: dream?.reflection?.questionAudioUri,
            answerText: answer.text || undefined,
            answerAudioUri: answer.audioUri,
            answeredAt,
          },
        });
        if (!isLocal(dream)) await api.saveReflection(id, { ...answer, answeredAt });
      },

      removeDream: async (id) => {
        const dream = find(id);
        setDreams((prev) => prev.filter((d) => d.id !== id));
        if (dream && !isLocal(dream)) await api.deleteDream(dream);
      },

      startProcessing: (dream) => {
        if (running.current.has(dream.id)) return;
        running.current.add(dream.id);
        patch(dream.id, { status: 'processing', error: undefined });
        const job = isLocal(dream)
          ? mockProcess(dream, (p) => patch(dream.id, p))
          : api.startProcessing(dream.id).then(() => pollUntilDone(dream.id));
        job
          .catch((e) => patch(dream.id, { status: 'failed', error: message(e) }))
          .finally(() => running.current.delete(dream.id));
      },

      transcribeVoiceNote: async (uri) => (backendEnabled ? api.transcribeVoiceNote(uri) : null),

      signOut: async () => {
        if (supabase) await supabase.auth.signOut().catch(() => {});
        setDreams(backendEnabled ? (SHOW_SAMPLES ? SAMPLES : []) : MOCK_DREAMS);
        if (backendEnabled) {
          setLoading(true);
          applyRemote(fetchRemote());
        }
      },
    };
  }, [raw, loading, syncError, patch, applyRemote, fetchRemote]);

  return <DreamsContext value={value}>{children}</DreamsContext>;
}

export function useDreams() {
  const ctx = use(DreamsContext);
  if (!ctx) throw new Error('useDreams must be used inside <DreamsProvider>');
  return ctx;
}
