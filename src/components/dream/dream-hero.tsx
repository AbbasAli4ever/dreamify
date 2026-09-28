import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Meta } from '@/components/ui/typography';
import type { Dream } from '@/types/dream';

type DreamHeroProps = {
  dream: Dream;
  height: number;
  /** Page scroll offset, for parallax and pull-to-stretch. */
  scrollY: SharedValue<number>;
  dateLabel: string;
};

// Full-bleed artwork with the title over it (S5 §1). The art fades in from blur.
export function DreamHero({ dream, height, scrollY, dateLabel }: DreamHeroProps) {
  const sharp = useSharedValue(0);

  useEffect(() => {
    sharp.set(withTiming(1, { duration: 1200 }));
  }, [sharp]);

  // Scroll up: art moves at half speed. Pull down: art stretches.
  const artStyle = useAnimatedStyle(() => {
    const y = scrollY.value;
    return {
      transform: [{ translateY: y < 0 ? y / 2 : y * 0.45 }, { scale: y < 0 ? 1 + -y / height : 1 }],
    };
  });
  const blurStyle = useAnimatedStyle(() => ({ opacity: 1 - sharp.value }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, height * 0.5], [1, 0], 'clamp'),
  }));

  return (
    <View style={{ height }}>
      <Animated.View style={[StyleSheet.absoluteFill, artStyle]}>
        {dream.artwork ? (
          <>
            <Image source={dream.artwork} style={StyleSheet.absoluteFill} contentFit="cover" />
            <Animated.View style={[StyleSheet.absoluteFill, blurStyle]}>
              <Image
                source={dream.artwork}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                blurRadius={30}
              />
            </Animated.View>
          </>
        ) : (
          // No artwork yet: a quiet gradient with the main symbol.
          <View
            style={StyleSheet.absoluteFill}
            className="items-center justify-center bg-night-800"
          >
            <SymbolIcon symbol={dream.symbols[0]?.key ?? 'star'} size={120} />
          </View>
        )}
        <LinearGradient
          colors={['rgba(7,8,12,0.35)', 'rgba(7,8,12,0)', 'rgba(7,8,12,0.55)', '#07080C']}
          locations={[0, 0.25, 0.7, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View style={[{ flex: 1, justifyContent: 'flex-end' }, titleStyle]}>
        <View className="px-6 pb-4">
          <Meta className="text-paper/70">{dateLabel}</Meta>
          <Text
            numberOfLines={3}
            className="mt-2 font-display-semibold text-[42px] leading-[44px] tracking-[-1px] text-paper"
          >
            {dream.title}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
