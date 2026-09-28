import { Image } from 'expo-image';
import { View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { SymbolConstellation } from '@/components/onboarding/symbol-constellation';
import { Floating } from '@/components/ui/floating';
import { Glow } from '@/components/ui/glow';
import { RichText } from '@/components/ui/rich-text';
import { Body } from '@/components/ui/typography';

export type OnboardingSlideData = {
  key: string;
  visual: 'moon' | 'jelly' | 'constellation';
  title: string;
  body: string;
};

type OnboardingSlideProps = {
  slide: OnboardingSlideData;
  index: number;
  /** Scroll position in pages. */
  progress: SharedValue<number>;
  width: number;
  visualHeight: number;
};

function Visual({
  visual,
  width,
  height,
}: {
  visual: OnboardingSlideData['visual'];
  width: number;
  height: number;
}) {
  if (visual === 'moon') {
    const size = Math.min(width * 0.68, height * 0.8);
    return (
      <View
        className="items-center justify-center"
        style={{ width: size * 1.8, height: size * 1.8 }}
      >
        <Glow size={size * 1.8} color="#B8C6F5" opacity={0.3} />
        <Floating distance={8} duration={4000}>
          <Image
            source={require('@/assets/images/moon.png')}
            style={{ width: size, height: size }}
          />
        </Floating>
      </View>
    );
  }

  if (visual === 'jelly') {
    const h = height * 0.98;
    return (
      <View className="items-center justify-center" style={{ width: h, height: h }}>
        <Glow size={h} color="#5B6FD6" opacity={0.28} />
        <Floating distance={14} duration={3600}>
          <Image
            source={require('@/assets/images/jelly.png')}
            style={{ width: h * 0.75, height: h }}
            contentFit="contain"
          />
        </Floating>
      </View>
    );
  }

  return (
    <Floating distance={6} duration={4200}>
      <SymbolConstellation size={Math.min(width - 64, height * 0.9)} />
    </Floating>
  );
}

// One onboarding page: floating visual on top, headline + copy below, with swipe parallax.
export function OnboardingSlide({
  slide,
  index,
  progress,
  width,
  visualHeight,
}: OnboardingSlideProps) {
  const visualStyle = useAnimatedStyle(() => {
    const t = progress.value - index; // -1 → 0 → 1 as the page passes
    return {
      opacity: interpolate(Math.abs(t), [0, 0.8], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: interpolate(t, [-1, 0, 1], [width * 0.35, 0, -width * 0.35]) },
        { scale: interpolate(Math.abs(t), [0, 1], [1, 0.85], Extrapolation.CLAMP) },
      ],
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const t = progress.value - index;
    return {
      opacity: interpolate(Math.abs(t), [0, 0.6], [1, 0], Extrapolation.CLAMP),
      transform: [{ translateX: interpolate(t, [-1, 0, 1], [width * 0.15, 0, -width * 0.15]) }],
    };
  });

  return (
    <View style={{ width }} className="flex-1">
      <Animated.View
        style={[
          { height: visualHeight, alignItems: 'center', justifyContent: 'center' },
          visualStyle,
        ]}
      >
        <Visual visual={slide.visual} width={width} height={visualHeight} />
      </Animated.View>

      {/* className isn't applied to Reanimated views, so layout lives on an inner View. */}
      <Animated.View style={[{ flex: 1 }, textStyle]}>
        <View className="flex-1 justify-end px-6 pb-2">
          <RichText>{slide.title}</RichText>
          <Body className="mt-4 max-w-[320px] text-body-lg text-paper/60">{slide.body}</Body>
        </View>
      </Animated.View>
    </View>
  );
}
