import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AudioPlayButton } from '@/components/dream/audio-play-button';
import { InsightCard } from '@/components/dream/insight-card';
import { DreamOrb } from '@/components/orb/dream-orb';
import { Icon } from '@/components/ui/icon';
import { useDreamRecorder } from '@/hooks/use-dream-recorder';
import { formatDuration } from '@/lib/dates';

type InsightSheetProps = {
  visible: boolean;
  initialText: string;
  initialAudioUri?: string;
  dateLabel: string;
  onClose: () => void;
  onSave: (answer: { text: string; audioUri?: string }) => void;
  /** Speech-to-text for a voice note (Deepgram). Returns null when unavailable. */
  transcribe?: (uri: string) => Promise<string | null>;
};

const OFFSCREEN = 520;

// S5b: the white Insight card rising over a dimmed page (R06 → R09).
// Answer by typing or with a short voice note. Drag the card down to close.
export function InsightSheet({
  visible,
  initialText,
  initialAudioUri,
  dateLabel,
  onClose,
  onSave,
  transcribe,
}: InsightSheetProps) {
  const insets = useSafeAreaInsets();
  const recorder = useDreamRecorder();
  const [text, setText] = useState(initialText);
  const [audioUri, setAudioUri] = useState(initialAudioUri);
  const [transcribing, setTranscribing] = useState(false);
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);

  const open = useSharedValue(0);
  const drag = useSharedValue(0);

  useEffect(() => {
    open.set(
      visible ? withSpring(1, { damping: 18, stiffness: 160 }) : withTiming(0, { duration: 220 }),
    );
    drag.set(0);
    if (visible) return;
    const t = setTimeout(() => setMounted(false), 240);
    return () => clearTimeout(t);
  }, [visible, open, drag]);

  // Runs on the JS thread (runOnJS), so calling onClose here is safe.
  const pan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetY(8)
    .onUpdate((e) => drag.set(Math.max(0, e.translationY)))
    .onEnd((e) => {
      if (e.translationY > 110 || e.velocityY > 900) onClose();
      else drag.set(withSpring(0));
    });

  const backdrop = useAnimatedStyle(() => ({ opacity: open.value * 0.65 }));
  const card = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(open.value, [0, 1], [OFFSCREEN, 0]) + drag.value }],
  }));

  if (!mounted) return null;

  const recording = recorder.status === 'recording' || recorder.status === 'starting';
  const canSave = (!!text.trim() || !!audioUri) && !transcribing;

  async function toggleVoice() {
    if (recording) {
      const { uri, durationMs } = await recorder.stop();
      if (!uri || durationMs <= 800) return;
      setAudioUri(uri);
      // Turn the voice note into text too, so the insight can be read and searched.
      if (transcribe) {
        setTranscribing(true);
        try {
          const spoken = (await transcribe(uri))?.trim();
          if (spoken) setText((prev) => (prev.trim() ? `${prev.trim()} ${spoken}` : spoken));
        } catch {
          // Keep the audio; the text just stays as typed.
        } finally {
          setTranscribing(false);
        }
      }
      return;
    }
    await recorder.start();
  }

  async function save() {
    if (recording) await recorder.stop();
    if (!canSave) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onSave({ text: text.trim(), audioUri });
  }

  const footer = (
    <View className="flex-row items-center gap-2">
      {recording ? (
        <View className="flex-row items-center gap-2">
          <DreamOrb state="listening" size={36} level={recorder.level} onPaper />
          <Text className="text-meta text-ink/60">{formatDuration(recorder.durationMs)}</Text>
        </View>
      ) : transcribing ? (
        <Text className="text-meta text-ink/60">Listening back…</Text>
      ) : audioUri ? (
        <AudioPlayButton uri={audioUri} label="Voice note" onPaper />
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={recording ? 'Stop voice note' : 'Answer with your voice'}
        onPress={toggleVoice}
        className="h-11 w-11 items-center justify-center rounded-full border border-ink/15 active:opacity-70"
      >
        <Icon name={recording ? 'pause' : 'mic'} size={20} color="#0B0B0F" />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Save insight"
        disabled={!canSave}
        onPress={save}
        className={`h-11 w-11 items-center justify-center rounded-full bg-ink active:opacity-80 ${canSave ? '' : 'opacity-30'}`}
      >
        <Icon name="check" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, backdrop]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close insight"
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, justifyContent: 'flex-end' }}
        pointerEvents="box-none"
      >
        <GestureDetector gesture={pan}>
          <Animated.View
            style={[{ paddingHorizontal: 16, paddingBottom: insets.bottom + 12 }, card]}
          >
            <View className="mb-2 items-center">
              <View className="h-1 w-10 rounded-full bg-paper/50" />
            </View>
            <InsightCard
              editable
              value={text}
              onChangeText={setText}
              dateLabel={dateLabel}
              footer={footer}
            />
          </Animated.View>
        </GestureDetector>
      </KeyboardAvoidingView>
    </View>
  );
}
