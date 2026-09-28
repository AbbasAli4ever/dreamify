// Native renderer: records each engine frame into an SkPicture and lets Skia
// rasterise it on the UI thread. Adapted from thinking-orbs-native
// (MIT © Jakub Antalik, https://github.com/Jakubantalik/thinking-orbs).

import {
  Canvas,
  PaintStyle,
  Picture,
  Skia,
  createPicture,
  type SkPicture,
} from '@shopify/react-native-skia';
import { useMemo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import {
  PRESET_SIZE,
  inkGrey,
  useOrbAnimation,
  type OrbState,
} from '@/components/orb/use-orb-animation';

export type DreamOrbProps = {
  state?: OrbState;
  /** Rendered size in dp. The 64 px design is scaled up crisply. */
  size?: number;
  speed?: number;
  /** Live audio level 0–1: the orb spins faster and swells while you speak. */
  level?: SharedValue<number>;
  paused?: boolean;
  /** Draw dark dots for a white surface (e.g. the insight card). */
  onPaper?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const EMPTY_PICTURE = createPicture(() => {});

/** How much the orb swells at full level. */
const LEVEL_SCALE = 0.14;

// The animated dotted orb (thinking-orbs) used on Home, Record and Processing.
export function DreamOrb({
  state = 'listening',
  size = 200,
  speed,
  level,
  paused,
  onPaper = false,
  accessibilityLabel,
  style,
}: DreamOrbProps) {
  // Frames go to Skia through a shared value, so drawing a new frame doesn't
  // re-render this component 60 times a second.
  const picture = useSharedValue<SkPicture>(EMPTY_PICTURE);
  // One paint per kind, mutated per dot: allocating ~600 SkPaints a frame hurts on Android.
  const paints = useMemo(() => {
    const fill = Skia.Paint();
    fill.setAntiAlias(true);
    const stroke = Skia.Paint();
    stroke.setAntiAlias(true);
    stroke.setStyle(PaintStyle.Stroke);
    return { fill, stroke };
  }, []);

  useOrbAnimation(state, { speed, level, paused }, (frame) => {
    const { fill, stroke } = paints;
    const k = size / PRESET_SIZE;
    const setInk = (paint: typeof fill, white: number, alpha = 1) => {
      const g = inkGrey(white, onPaper) / 255;
      paint.setColor(Skia.Color([g, g, g, alpha]));
    };

    picture.set(
      createPicture(
        (canvas) => {
          canvas.scale(k, k);
          for (const l of frame.lines) {
            setInk(stroke, l.white, l.a);
            stroke.setStrokeWidth(l.w);
            canvas.drawLine(l.x1, l.y1, l.x2, l.y2, stroke);
          }
          for (const d of frame.dots) {
            setInk(fill, d.white, d.a);
            canvas.drawCircle(d.x, d.y, d.r, fill);
          }
        },
        Skia.XYWHRect(0, 0, size, size),
      ),
    );
  });

  const pulse = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + (level ? level.value : 0) * LEVEL_SCALE }],
  }));

  return (
    <Animated.View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? state}
      style={[{ width: size, height: size }, pulse, style]}
    >
      <Canvas style={{ width: size, height: size }}>
        <Picture picture={picture} />
      </Canvas>
    </Animated.View>
  );
}
