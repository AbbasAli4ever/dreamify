import { View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

type PageDotsProps = {
  count: number;
  /** Scroll position in pages (0 → count - 1). */
  progress: SharedValue<number>;
};

function Dot({ index, progress }: { index: number; progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const active = interpolate(
      progress.value,
      [index - 1, index, index + 1],
      [0, 1, 0],
      Extrapolation.CLAMP,
    );
    return { width: 6 + active * 18, opacity: 0.3 + active * 0.7 };
  });

  return (
    <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' }, style]} />
  );
}

// The active dot stretches into a pill as you swipe.
export function PageDots({ count, progress }: PageDotsProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} index={i} progress={progress} />
      ))}
    </View>
  );
}
