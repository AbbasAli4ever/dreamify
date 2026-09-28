import { useEffect, type ReactNode } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type FloatingProps = {
  children: ReactNode;
  /** Vertical travel in px. */
  distance?: number;
  duration?: number;
  delay?: number;
};

// Slow, endless up-and-down drift for dreamy visuals. Disabled under reduced motion.
export function Floating({ children, distance = 10, duration = 3200, delay = 0 }: FloatingProps) {
  const reduceMotion = useReducedMotion();
  const offset = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    offset.value = withDelay(
      delay,
      withRepeat(withTiming(-distance, { duration, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [reduceMotion, distance, duration, delay, offset]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
