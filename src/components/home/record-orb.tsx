import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
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

function Ripple({ delay, morph }: { delay: number; morph: SharedValue<number> }) {
  const reduceMotion = useReducedMotion();
  const t = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    t.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 3200, easing: Easing.out(Easing.quad) }), -1, false),
    );
  }, [reduceMotion, delay, t]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - t.value) * (1 - morph.value),
    transform: [{ scale: 1 + t.value * 0.6 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: BUTTON,
          height: BUTTON,
          borderRadius: BUTTON / 2,
          borderWidth: 1,
          borderColor: colors.paper,
        },
        style,
      ]}
    />
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
};

// Home's record control. Idle: the white mic button with ripples. Active: the
// button morphs into the animated DreamOrb, which reacts to the voice level.
export function RecordOrb({
  active,
  level,
  state = 'listening',
  label = 'Listening',
  onPress,
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
            <DreamOrb state={state} size={ORB} level={level} accessibilityLabel={label} />
          </Animated.View>
        ) : null}

        <Ripple delay={0} morph={morph} />
        <Ripple delay={1600} morph={morph} />
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
