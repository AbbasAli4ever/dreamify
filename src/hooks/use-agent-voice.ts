import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioSampleListener,
  type AudioPlayer,
  type AudioSample,
} from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { useEffect, useRef, useState } from 'react';
import {
  cancelAnimation,
  Easing,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/** RMS of speech is small; this maps a normal voice to roughly 0.4–0.9. */
const LEVEL_GAIN = 4;
/** Reading pace for a reply that has no audio (ms per word), and its bounds. */
const MS_PER_WORD = 380;
const MIN_TEXT_MS = 3500;
const MAX_TEXT_MS = 14000;
/** Safety net: stop waiting for "finished" this long after the reply's expected length. */
const GRACE_MS = 10000;

type Reply = { text: string };
type Source = { uri: string; headers?: Record<string, string> };

// The agent's voice on Home: plays the spoken reply and turns the playback into a live
// 0–1 `level` so the DreamOrb moves with the voice. The reply comes in up to three parts
// (voiced in parallel by the backend), each downloaded to a local file: iOS only reports
// audio samples (the level) for local files, not for a URL. Playback starts as soon as the
// first part lands; the others load meanwhile, one player each.
// Without audio (demo mode, web, or the voice failed) the orb "speaks" silently for the
// text's reading time.
export function useAgentVoice() {
  const first = useAudioPlayer(null);
  const second = useAudioPlayer(null);
  const third = useAudioPlayer(null);
  const level = useSharedValue(0);
  const [speaking, setSpeaking] = useState(false);
  /** Which reply (dream id) was last started, so it's never spoken twice. */
  const [key, setKey] = useState<string | null>(null);
  const onDone = useRef<(() => void) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Parts still to play, in order, each with a promise that resolves once it's loaded. */
  const queue = useRef<{ player: AudioPlayer; ready: Promise<boolean> }[]>([]);

  function finish() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    queue.current = [];
    cancelAnimation(level);
    level.set(withTiming(0, { duration: 250 }));
    setSpeaking(false);
    const done = onDone.current;
    onDone.current = null;
    done?.();
  }

  // Live level from the part that's playing (the waiting players are ignored).
  const listen = (player: AudioPlayer) => (sample: AudioSample) => {
    const frames = sample.channels[0]?.frames;
    if (!frames?.length || queue.current[0]?.player !== player) return;
    let sum = 0;
    for (const f of frames) sum += f * f;
    const v = Math.min(1, Math.sqrt(sum / frames.length) * LEVEL_GAIN);
    level.set(withTiming(v, { duration: 90 }));
  };
  useAudioSampleListener(first, listen(first));
  useAudioSampleListener(second, listen(second));
  useAudioSampleListener(third, listen(third));

  useEffect(() => {
    const subs = [first, second, third].map((player) =>
      player.addListener('playbackStatusUpdate', (status) => {
        if (!onDone.current || queue.current[0]?.player !== player) return;
        // A part that fails to play is skipped rather than leaving the orb hanging.
        if (status.didJustFinish || status.error) {
          queue.current.shift();
          playNext();
        }
      }),
    );
    return () => subs.forEach((s) => s.remove());
    // finish only touches refs, a shared value and a state setter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first, second, third]);

  /** Plays the next part once it has downloaded; skips parts that failed; ends after the last. */
  function playNext() {
    const next = queue.current[0];
    if (!next) {
      if (onDone.current) finish();
      return;
    }
    next.ready.then((ok) => {
      if (queue.current[0] !== next || !onDone.current) return; // stopped meanwhile
      if (ok) next.player.play();
      else {
        queue.current.shift();
        playNext();
      }
    });
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  /**
   * Speaks `reply` for dream `id` from `sources` (one per part), or silently for its reading
   * time when there are none. `done` runs when it ends or is stopped.
   */
  async function speak(id: string, reply: Reply, sources: Source[] | null, done: () => void) {
    setKey(id);
    setSpeaking(true);
    onDone.current = done;
    const words = reply.text.split(/\s+/).length;
    const readMs = Math.min(MAX_TEXT_MS, Math.max(MIN_TEXT_MS, words * MS_PER_WORD));

    if (sources?.length) {
      try {
        await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
        const players = [first, second, third].slice(0, sources.length);
        // Fetch every part at once (the backend voices them in parallel).
        queue.current = players.map((player, n) => ({
          player,
          ready: File.downloadFileAsync(
            sources[n].uri,
            new File(Paths.cache, `reply-${id}-${n}.mp3`),
            { headers: sources[n].headers, idempotent: true },
          ).then(
            (file) => {
              player.replace({ uri: file.uri });
              return true;
            },
            () => false,
          ),
        }));
        playNext();
        timer.current = setTimeout(finish, readMs + GRACE_MS);
        return;
      } catch {
        // Fall through to the silent version.
      }
    }
    // No audio: a gentle, speech-like pulse for the reading time.
    level.set(
      withRepeat(
        withSequence(
          withTiming(0.7, { duration: 180, easing: Easing.out(Easing.quad) }),
          withTiming(0.25, { duration: 220 }),
          withTiming(0.55, { duration: 160 }),
          withTiming(0.15, { duration: 260 }),
        ),
        -1,
      ),
    );
    timer.current = setTimeout(finish, readMs);
  }

  /** Stops early (Skip). */
  function stop() {
    queue.current = [];
    [first, second, third].forEach((p) => p.pause());
    if (onDone.current) finish();
  }

  return { speaking, key, level, speak, stop };
}
