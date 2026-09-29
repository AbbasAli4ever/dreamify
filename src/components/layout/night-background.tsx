import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { NightClouds } from '@/components/layout/night-clouds';
import { colors, gradients } from '@/constants/theme';

type NightBackgroundProps = {
  /** Use the night-sky photo (assets/images/bg.png). Off = plain night gradient. */
  image?: boolean;
  /** Draw extra star specks in code (the photo already has stars). */
  stars?: boolean;
  /** Soft color bloom, e.g. sampled from a dream's artwork. */
  glowColor?: string;
  /** Glow center as a fraction of the screen (0–1). */
  glowPosition?: { x: number; y: number };
  /** Darken the bottom so text over the rocks stays readable (0–1). */
  scrim?: number;
  /** Clouds drifting right to left across the sky (Home). */
  clouds?: boolean;
  /** Hold the clouds still (while the screen scrolls, so scrolling stays smooth). */
  cloudsPaused?: boolean;
};

// Deterministic pseudo-random so stars don't jump between renders.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

// Night sky photo (or gradient) + optional stars, glow and bottom scrim —
// the base of every dark screen (docs/SCREENS.md §2.1).
export function NightBackground({
  image = true,
  stars = false,
  glowColor,
  glowPosition = { x: 0.5, y: 0.3 },
  scrim = 0.5,
  clouds = false,
  cloudsPaused = false,
}: NightBackgroundProps) {
  const { width, height } = useWindowDimensions();

  const specks = useMemo(() => {
    const rand = seeded(7);
    return Array.from({ length: 70 }, () => ({
      x: rand() * width,
      y: rand() * height * 0.85,
      r: 0.4 + rand() * 1.1,
      o: 0.15 + rand() * 0.55,
    }));
  }, [width, height]);

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.night900 }]}
    >
      {image ? (
        <Image
          source={require('@/assets/images/bg.png')}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          // Keep the rocks on screen whatever the aspect ratio.
          contentPosition="bottom"
        />
      ) : (
        <LinearGradient colors={gradients.night} style={StyleSheet.absoluteFill} />
      )}

      {clouds ? <NightClouds paused={cloudsPaused} /> : null}

      {scrim > 0 ? (
        <LinearGradient
          colors={['transparent', `rgba(7, 8, 12, ${scrim})`]}
          locations={[0.45, 1]}
          style={StyleSheet.absoluteFill}
        />
      ) : null}

      {glowColor || stars ? (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          {glowColor ? (
            <>
              <Defs>
                <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={glowColor} stopOpacity={0.35} />
                  <Stop offset="1" stopColor={glowColor} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle
                cx={width * glowPosition.x}
                cy={height * glowPosition.y}
                r={width * 0.8}
                fill="url(#glow)"
              />
            </>
          ) : null}
          {stars
            ? specks.map((s, i) => (
                <Circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={s.o} />
              ))
            : null}
        </Svg>
      ) : null}
    </View>
  );
}
