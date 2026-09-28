import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
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
  /** Page scroll offset, for the pull-down stretch. */
  scrollY: SharedValue<number>;
  dateLabel: string;
};

// Full-bleed artwork with the title over it (S5 §1). The art fades in from blur.
export function DreamHero({ dream, height, scrollY, dateLabel }: DreamHeroProps) {
  const sharp = useSharedValue(0);

  useEffect(() => {
    sharp.set(withTiming(1, { duration: 1200 }));
  }, [sharp]);

  // Scrolling up moves the art and title together with the page (no parallax, so the
  // text never slides over the image). Only pulling down past the top stretches the art.
  const artStyle = useAnimatedStyle(() => {
    const y = Math.min(0, scrollY.value);
    return { transform: [{ translateY: y / 2 }, { scale: 1 + -y / height }] };
  });
  const blurStyle = useAnimatedStyle(() => ({ opacity: 1 - sharp.value }));

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

      <View className="flex-1 justify-end">
        <View className="px-6 pb-4">
          <Meta className="text-paper/70">{dateLabel}</Meta>
          <Text
            numberOfLines={3}
            className="mt-2 font-display-semibold text-[42px] leading-[44px] tracking-[-1px] text-paper"
          >
            {dream.title}
          </Text>
        </View>
      </View>
    </View>
  );
}
