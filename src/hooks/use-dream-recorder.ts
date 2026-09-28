import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';

export type RecorderStatus = 'idle' | 'starting' | 'recording' | 'paused';
export type RecorderError = 'permission' | 'failed';

/** Metering is in dBFS. Map quiet room → 0 and loud speech → 1. */
const QUIET_DB = -55;
const LOUD_DB = -12;

const OPTIONS = { ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true };

// Voice capture for dreams: permission, start/pause/resume/stop, and a live
// 0–1 `level` shared value that drives the DreamOrb.
export function useDreamRecorder() {
  const recorder = useAudioRecorder(OPTIONS);
  const state = useAudioRecorderState(recorder, 100);
  const [status, setStatus] = useState<RecorderStatus>('idle');
  const [error, setError] = useState<RecorderError | null>(null);
  const level = useSharedValue(0);

  useEffect(() => {
    if (status !== 'recording') {
      level.set(withTiming(0, { duration: 300 }));
      return;
    }
    const db = state.metering ?? -160;
    const v = Math.min(1, Math.max(0, (db - QUIET_DB) / (LOUD_DB - QUIET_DB)));
    // Eased over a few metering ticks so the orb glides instead of twitching.
    level.set(withTiming(v, { duration: 280 }));
  }, [state.metering, status, level]);

  async function start() {
    setError(null);
    setStatus('starting');
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('permission');
        setStatus('idle');
        return false;
      }
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setStatus('recording');
      return true;
    } catch {
      setError('failed');
      setStatus('idle');
      return false;
    }
  }

  function pause() {
    recorder.pause();
    setStatus('paused');
  }

  function resume() {
    recorder.record();
    setStatus('recording');
  }

  /** Stops and returns the recording. */
  async function stop() {
    // Read from the recorder itself, not render state, which can be a stale snapshot.
    const durationMs = recorder.getStatus().durationMillis;
    try {
      await recorder.stop();
    } finally {
      setStatus('idle');
      await setAudioModeAsync({ allowsRecording: false }).catch(() => {});
    }
    return { uri: recorder.uri, durationMs };
  }

  /** Stops and throws the recording away. */
  async function cancel() {
    await stop().catch(() => {});
  }

  return {
    status,
    durationMs: state.durationMillis,
    level,
    error,
    start,
    pause,
    resume,
    stop,
    cancel,
  };
}
