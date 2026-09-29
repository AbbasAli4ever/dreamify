import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

export const PORTAL_MS = 1600;
const FADE_MS = 500;
export const PORTAL_REVEAL_MS = PORTAL_MS - 200;

// Web has no Skia here (see dream-orb.web.tsx), so the flight into the dream is a simpler
// swelling glow on navy that fades into the page.
export function DreamPortal({ onDone }: { onDone: () => void }) {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const grow = useSharedValue(0);
  const opacity = useSharedValue(1);
  const size = Math.max(width, height) * 1.6;

  useEffect(() => {
    if (reduceMotion) {
      onDone();
      return;
    }
    grow.set(withTiming(1, { duration: PORTAL_MS, easing: Easing.in(Easing.cubic) }));
    opacity.set(withDelay(PORTAL_MS - FADE_MS + 150, withTiming(0, { duration: FADE_MS })));
    const done = setTimeout(onDone, PORTAL_MS + 200);
    return () => clearTimeout(done);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  const fade = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const light = useAnimatedStyle(() => ({
    opacity: 0.25 + grow.value * 0.75,
    transform: [{ scale: 0.08 + grow.value * 1.1 }],
  }));

  if (reduceMotion) return null;

  return (
    <Animated.View
      pointerEvents="box-only"
      style={[StyleSheet.absoluteFill, { backgroundColor: '#0D1233', overflow: 'hidden' }, fade]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            left: (width - size) / 2,
            top: (height - size) / 2,
            borderRadius: size / 2,
            experimental_backgroundImage:
              'radial-gradient(circle, #E6EBFF 0%, #8F9BDE 30%, #3A4488 55%, rgba(13,18,51,0) 72%)',
          },
          light,
        ]}
      />
    </Animated.View>
  );
}
