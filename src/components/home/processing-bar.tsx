import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { currentStage, stageUi } from '@/components/processing/stage-checklist';
import { Meta } from '@/components/ui/typography';
import { STAGES } from '@/lib/ai/process-dream';
import type { Dream } from '@/types/dream';

const SEGMENT = { width: 40, height: 3 };

function Segment({ state }: { state: 'done' | 'active' | 'pending' }) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (state === 'active' && !reduceMotion)
      t.set(withRepeat(withTiming(1, { duration: 900 }), -1, true));
    else t.set(0);
  }, [state, reduceMotion, t]);

  const style = useAnimatedStyle(() => ({
    opacity: state === 'done' ? 1 : state === 'active' ? 0.35 + t.value * 0.55 : 0.15,
  }));

  return (
    <Animated.View
      style={[{ ...SEGMENT, borderRadius: SEGMENT.height, backgroundColor: '#FFFFFF' }, style]}
    />
  );
}

type ProcessingBarProps = {
  /** The dream being processed (undefined while it's still being saved). */
  dream?: Dream;
  onRetry: () => void;
  onClose: () => void;
};

// The only UI under the orb after ✓ on Home: the current step and four thin segments.
// On failure it offers Try again / Close instead.
export function ProcessingBar({ dream, onRetry, onClose }: ProcessingBarProps) {
  const failed = dream?.status === 'failed';
  const ready = dream?.status === 'ready';
  const stage = dream ? currentStage(dream) : 0;

  const label = !dream
    ? 'Saving your dream…'
    : ready
      ? 'Your dream is ready'
      : failed
        ? dream.error?.includes("Couldn't hear")
          ? "I couldn't hear any words"
          : "Couldn't finish this dream"
        : `${stageUi(dream).label}…`;

  return (
    <Animated.View entering={FadeIn.duration(400)} className="items-center gap-3">
      <Text
        accessibilityLiveRegion="polite"
        className="text-label font-medium text-paper/70"
      >
        {label}
      </Text>

      {failed ? (
        <View className="flex-row items-center gap-6">
          <Pressable accessibilityRole="button" onPress={onRetry} hitSlop={10}>
            <Text className="font-display-medium text-button text-paper">Try again</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={10}>
            <Meta className="text-label">Close</Meta>
          </Pressable>
        </View>
      ) : (
        <View
          className="flex-row gap-1.5"
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: STAGES.length, now: stage }}
        >
          {STAGES.map((key, i) => (
            <Segment key={key} state={i < stage ? 'done' : i === stage ? 'active' : 'pending'} />
          ))}
        </View>
      )}
    </Animated.View>
  );
}
