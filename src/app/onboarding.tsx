import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { NightBackground } from '@/components/layout/night-background';
import {
  OnboardingSlide,
  type OnboardingSlideData,
} from '@/components/onboarding/onboarding-slide';
import { PageDots } from '@/components/onboarding/page-dots';
import { PillButton } from '@/components/ui/pill-button';
import { Label } from '@/components/ui/typography';
import { setOnboarded } from '@/lib/storage';

// S1 — docs/SCREENS.md §6.
const SLIDES: OnboardingSlideData[] = [
  {
    key: 'remember',
    visual: 'moon',
    title: 'Catch your dreams *before* they fade.',
    body: "Speak it the moment you wake. We'll write it down for you.",
  },
  {
    key: 'patterns',
    visual: 'jelly',
    title: 'See what your mind keeps *returning* to.',
    body: 'Emotions, symbols and themes, found for you in every dream.',
  },
  {
    key: 'world',
    visual: 'constellation',
    title: 'Discover your *dream world*.',
    body: 'Dream Echo remembers every dream and connects them over time.',
  },
];

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const progress = useSharedValue(0);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;
  const visualHeight = height * 0.44;

  const onScroll = useAnimatedScrollHandler((e) => {
    progress.value = e.contentOffset.x / width;
  });

  useAnimatedReaction(
    () => Math.round(progress.value),
    (page, prev) => {
      if (page !== prev) scheduleOnRN(setIndex, page);
    },
  );

  async function finish() {
    await setOnboarded(true);
    router.replace('/home');
  }

  function next() {
    if (isLast) finish();
    else scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
  }

  return (
    <View className="flex-1 bg-night-900">
      <NightBackground glowColor="#3B4A8C" glowPosition={{ x: 0.5, y: 0.25 }} />

      <View
        style={{ paddingTop: insets.top }}
        className="h-14 flex-row items-center justify-between px-6"
      >
        <Image
          source={require('@/assets/images/logo.png')}
          style={{ width: 72, height: 36 }}
          contentFit="contain"
          accessibilityLabel="Dreamify"
        />
        <Pressable
          onPress={finish}
          hitSlop={12}
          disabled={isLast}
          style={{ opacity: isLast ? 0 : 1 }}
          accessibilityRole="button"
        >
          <Label>Skip</Label>
        </Pressable>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1, marginTop: insets.top ? 16 : 0 }}
      >
        {SLIDES.map((slide, i) => (
          <OnboardingSlide
            key={slide.key}
            slide={slide}
            index={i}
            progress={progress}
            width={width}
            visualHeight={visualHeight}
          />
        ))}
      </Animated.ScrollView>

      <View className="gap-7 px-6 pt-8" style={{ paddingBottom: insets.bottom + 16 }}>
        <PageDots count={SLIDES.length} progress={progress} />
        <PillButton label={isLast ? 'Begin' : 'Continue'} onPress={next} />
      </View>
    </View>
  );
}
