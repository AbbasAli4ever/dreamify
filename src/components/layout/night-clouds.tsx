import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
  type ViewStyle,
} from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

// Clouds drifting right to left. Each layer is a pre-rendered, seamlessly tiling image
// (scripts/generate-clouds.js) shown twice side by side and slid left by one tile, forever.
// The slide runs on React Native's native driver, so no per-frame work happens in React:
// a looping Reanimated style re-committed the whole screen every frame and made Home lag
// (and drawing the clouds live with a shader was heavier still).

type CloudDriftProps = {
  source: number;
  /** Width of one tile (the image is stretched to it). */
  tile: number;
  height: number;
  /** Time to drift one tile to the left. */
  seconds: number;
  /** Where the band sits (absolute position within the parent). */
  style?: ViewStyle;
  /** Hold still (e.g. while the screen scrolls); resumes where it stopped. */
  paused?: boolean;
};

/** One drifting cloud layer. Drifts only while its screen is on top, resuming where it stopped. */
export function CloudDrift({
  source,
  tile: rawTile,
  height,
  seconds,
  style,
  paused,
}: CloudDriftProps) {
  // Whole points, and the copies overlap by one, so no hairline shows where they meet.
  const tile = Math.round(rawTile);
  const [x] = useState(() => new Animated.Value(0));
  const reduceMotion = useReducedMotion();

  useFocusEffect(
    useCallback(() => {
      if (reduceMotion || paused || !tile) return;
      const full = seconds * 1000;
      const native = Platform.OS !== 'web';
      const slide = (duration: number) =>
        Animated.timing(x, {
          toValue: -tile,
          duration,
          easing: Easing.linear,
          useNativeDriver: native,
        });
      const loop = Animated.loop(slide(full));
      let current: Animated.CompositeAnimation | null = null;
      let stopped = false;
      // Finish the tile it was on, then loop whole tiles from the start.
      x.stopAnimation((value) => {
        if (stopped) return;
        current = slide(Math.max(0, (1 + value / tile) * full));
        current.start(({ finished }) => {
          if (!finished || stopped) return;
          x.setValue(0);
          current = loop;
          loop.start();
        });
      });
      return () => {
        stopped = true;
        current?.stop();
      };
    }, [reduceMotion, paused, tile, seconds, x]),
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: 'absolute', top: 0, left: 0, height, width: tile * 2, flexDirection: 'row' },
        style,
        { transform: [{ translateX: x }] },
      ]}
    >
      <Image source={source} style={{ width: tile + 1, height }} contentFit="fill" />
      <Image
        source={source}
        style={{ width: tile + 1, height, marginLeft: -1 }}
        contentFit="fill"
      />
    </Animated.View>
  );
}

/** Share of the screen height Home's clouds cover (they fade out before the rocks). */
const SKY = 0.8;
/** Home's cloud images are 2:1. */
const ASPECT = 2;

/** Home's sky: slow banks behind, smaller wisps in front moving faster (depth). */
export function NightClouds({ paused }: { paused?: boolean }) {
  const { height } = useWindowDimensions();
  const h = Math.round(height * SKY);
  const tile = h * ASPECT;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
      <CloudDrift
        source={require('@/assets/images/clouds-back.png')}
        tile={tile}
        height={h}
        seconds={150}
        paused={paused}
      />
      <CloudDrift
        source={require('@/assets/images/clouds-front.png')}
        tile={tile}
        height={h}
        seconds={85}
        paused={paused}
      />
    </View>
  );
}
