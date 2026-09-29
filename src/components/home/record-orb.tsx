import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Animated as NativeAnimated,
  Easing as NativeEasing,
  Platform,
  Pressable,
  View,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { DreamOrb } from '@/components/orb/dream-orb';
import type { OrbState } from '@/components/orb/use-orb-animation';
import { Glow } from '@/components/ui/glow';
import { Icon } from '@/components/ui/icon';
import { colors } from '@/constants/theme';

const BUTTON = 120;
const ORB = 210;
const BOX = ORB * 1.45;
const MORPH_MS = 650;
/** Home's big orb turns slower than the engine default, so it feels calm and smooth. */
const ORB_SPEED = 0.55;

/**
 * An expanding ring around the idle mic button. It loops forever, so it runs on React Native's
 * native driver: no per-frame work in React. (Looping Reanimated styles re-committed Home's
 * whole tree every frame, which made scrolling lag.) Pauses while Home isn't on top.
 */
function Ripple({
  delay,
  morph,
  paused,
}: {
  delay: number;
  morph: SharedValue<number>;
  paused?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const [t] = useState(() => new NativeAnimated.Value(0));

  useFocusEffect(
    useCallback(() => {
      if (reduceMotion || paused) return;
      const loop = NativeAnimated.loop(
        NativeAnimated.timing(t, {
          toValue: 1,
          duration: 3200,
          easing: NativeEasing.out(NativeEasing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      );
      const start = setTimeout(() => loop.start(), delay);
      return () => {
        clearTimeout(start);
        loop.stop();
        t.setValue(0);
      };
    }, [reduceMotion, paused, delay, t]),
  );

  // Fades away as the button morphs into the orb (changes only during the morph).
  const hide = useAnimatedStyle(() => ({ opacity: 1 - morph.value }));

  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, hide]}>
      <NativeAnimated.View
        style={{
          width: BUTTON,
          height: BUTTON,
          borderRadius: BUTTON / 2,
          borderWidth: 1,
          borderColor: colors.paper,
          opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
          transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] }) }],
        }}
      />
    </Animated.View>
  );
}

type RecordOrbProps = {
  /** true while recording or while the agent answers: shows the orb; false: the mic button. */
  active: boolean;
  /** Live level 0–1 (your voice, or the agent's), drives the orb. */
  level: SharedValue<number>;
  /** Orb shape: `listening` while you speak, others while the agent thinks and talks. */
  state?: OrbState;
  /** Screen-reader name for the orb. */
  label?: string;
  onPress: () => void;
  /** Hold the ripples still (while Home scrolls). */
  paused?: boolean;
};

// Home's record control. Idle: the white mic button with ripples. Active: the
// button morphs into the animated DreamOrb, which reacts to the voice level.
export function RecordOrb({
  active,
  level,
  state = 'listening',
  label = 'Listening',
  onPress,
  paused,
}: RecordOrbProps) {
  const morph = useSharedValue(0); // 0 = button, 1 = orb
  const pressed = useSharedValue(1);
  // Keep the orb mounted while it morphs back, then unmount it so an idle Home costs nothing.
  const [orbMounted, setOrbMounted] = useState(active);
  if (active && !orbMounted) setOrbMounted(true); // mount as soon as recording starts

  useEffect(() => {
    morph.set(withTiming(active ? 1 : 0, { duration: MORPH_MS, easing: Easing.out(Easing.cubic) }));
    if (active) return;
    const t = setTimeout(() => setOrbMounted(false), MORPH_MS);
    return () => clearTimeout(t);
  }, [active, morph]);

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 0.55], [1, 0], 'clamp'),
    transform: [{ scale: pressed.value * interpolate(morph.value, [0, 0.6], [1, 0.45], 'clamp') }],
  }));

  const orbStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0.2, 0.8], [0, 1], 'clamp'),
    transform: [{ scale: interpolate(morph.value, [0, 1], [0.5, 1]) }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 1], [0.8, 1]),
    transform: [{ scale: interpolate(morph.value, [0, 1], [0.85, 1.05]) }],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={active ? label : 'Record a dream'}
      disabled={active}
      onPressIn={() => pressed.set(withSpring(0.94))}
      onPressOut={() => pressed.set(withSpring(1))}
      onPress={onPress}
    >
      <View className="items-center justify-center" style={{ width: BOX, height: BOX }}>
        <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, glowStyle]}>
          <Glow size={BOX} color="#C9D4FF" opacity={0.26} />
        </Animated.View>

        {orbMounted ? (
          <Animated.View pointerEvents="none" style={[{ position: 'absolute' }, orbStyle]}>
            <DreamOrb
              state={state}
              size={ORB}
              speed={ORB_SPEED}
              level={level}
              accessibilityLabel={label}
            />
          </Animated.View>
        ) : null}

        {/* Hidden under the orb anyway, so they stop while it's up. */}
        <Ripple delay={0} morph={morph} paused={paused || active} />
        <Ripple delay={1600} morph={morph} paused={paused || active} />
        <Animated.View
          style={[
            {
              width: BUTTON,
              height: BUTTON,
              borderRadius: BUTTON / 2,
              backgroundColor: colors.paper,
              alignItems: 'center',
              justifyContent: 'center',
            },
            buttonStyle,
          ]}
        >
          <Icon name="mic" size={34} color={colors.ink} />
        </Animated.View>
      </View>
    </Pressable>
  );
}
