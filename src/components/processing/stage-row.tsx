import { useEffect, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { colors } from '@/constants/theme';
import { cn } from '@/lib/utils';

export type StageStatus = 'pending' | 'active' | 'done';

function PulsingDot() {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduceMotion) t.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [reduceMotion, t]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + t.value * 0.65,
    transform: [{ scale: 0.8 + t.value * 0.3 }],
  }));
  return (
    <Animated.View
      style={[{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.paper }, style]}
    />
  );
}

function StatusDot({ status }: { status: StageStatus }) {
  return (
    <View className="h-6 w-6 items-center justify-center">
      {status === 'done' ? (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-paper">
          <Icon name="check" size={14} color={colors.ink} strokeWidth={2} />
        </View>
      ) : status === 'active' ? (
        <PulsingDot />
      ) : (
        <View className="h-2.5 w-2.5 rounded-full border border-paper/30" />
      )}
    </View>
  );
}

type StageRowProps = {
  label: string;
  status: StageStatus;
  /** The stage's result, faded in once it's done ("micro-reveal"). */
  children?: ReactNode;
};

// One step of the Processing screen (S4): status dot, label, result.
export function StageRow({ label, status, children }: StageRowProps) {
  return (
    <View className="flex-row gap-4">
      <StatusDot status={status} />
      <View className="flex-1 gap-1.5">
        <Text
          className={cn(
            'font-display-medium text-[17px] leading-6',
            status === 'pending' && 'text-paper/35',
            status === 'active' && 'text-paper',
            status === 'done' && 'text-paper/60',
          )}
        >
          {label}
        </Text>
        {status === 'done' && children ? (
          <Animated.View entering={FadeIn.duration(500)}>{children}</Animated.View>
        ) : null}
      </View>
    </View>
  );
}
