import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ComingSoon } from '@/components/layout/coming-soon';
import { NightBackground } from '@/components/layout/night-background';
import { DreamOrb } from '@/components/orb/dream-orb';
import { StageChecklist, stageUi } from '@/components/processing/stage-checklist';
import { Glow } from '@/components/ui/glow';
import { PillButton } from '@/components/ui/pill-button';
import { RichText } from '@/components/ui/rich-text';
import { Body, Meta, Title } from '@/components/ui/typography';
import { useDreams } from '@/providers/dreams-provider';

const VISUAL = 300;

// S4 Processing — docs/SCREENS.md §6. The pipeline runs in DreamsProvider, so
// "Continue in background" doesn't stop it.
export default function ProcessingScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDream, dreams, startProcessing } = useDreams();
  const dream = getDream(id);

  useEffect(() => {
    if (dream?.status === 'processing') startProcessing(dream);
  }, [dream, startProcessing]);

  if (!dream) return <ComingSoon title="Dream not found" spec="S4" />;

  const done = dream.status === 'ready';
  const failed = dream.status === 'failed';
  const ui = stageUi(dream);

  return (
    <View className="flex-1 bg-night-900">
      <NightBackground
        glowColor={dream.artworkColor ?? '#3B4A8C'}
        glowPosition={{ x: 0.5, y: 0.22 }}
      />

      <View className="flex-1 px-6" style={{ paddingTop: insets.top + 16 }}>
        {/* Orb (while working) → artwork (when done) */}
        <View className="items-center justify-center" style={{ height: VISUAL }}>
          {done && dream.artwork ? (
            <Animated.View entering={ZoomIn.duration(600)}>
              <Image
                source={dream.artwork}
                contentFit="cover"
                transition={400}
                style={{
                  width: VISUAL * 0.8,
                  height: VISUAL,
                  borderRadius: 28,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.15)',
                }}
              />
            </Animated.View>
          ) : (
            <Animated.View exiting={FadeOut.duration(250)} className="items-center justify-center">
              <Glow size={VISUAL} color="#C9D4FF" opacity={0.2} />
              <Image
                source={require('@/assets/images/moon.png')}
                style={{ position: 'absolute', width: 250, height: 250, opacity: 0.1 }}
              />
              <DreamOrb state={ui.orb} size={200} accessibilityLabel={ui.label} />
            </Animated.View>
          )}
        </View>

        {/* Headline */}
        <View className="mt-4 items-center">
          {done ? (
            <Animated.View entering={FadeIn.duration(500)}>
              <Title className="text-center">{dream.title}</Title>
            </Animated.View>
          ) : failed ? (
            <Title className="text-center">Something went quiet.</Title>
          ) : (
            <RichText className="text-center text-title">Remembering your *dream*…</RichText>
          )}
        </View>

        {/* Stages */}
        <StageChecklist dream={dream} dreams={dreams} className="mt-8 gap-5" />
      </View>

      {/* Actions */}
      <View className="gap-3 px-6" style={{ paddingBottom: insets.bottom + 16 }}>
        {done ? (
          <Animated.View entering={FadeIn.delay(300).duration(500)}>
            <PillButton
              label="Reveal your dream"
              onPress={() =>
                router.replace({ pathname: '/dream/[id]', params: { id: dream.id, fresh: '1' } })
              }
            />
          </Animated.View>
        ) : failed ? (
          <>
            <Body className="text-center">
              We couldn&apos;t finish this one. Your words are safe.
            </Body>
            {__DEV__ && dream.error ? (
              <Meta className="text-center text-paper/50">{dream.error}</Meta>
            ) : null}
            <PillButton
              label="Try again"
              onPress={() => startProcessing({ ...dream, status: 'processing' })}
            />
          </>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.dismissTo('/home')}
            hitSlop={12}
            className="items-center py-2 active:opacity-60"
          >
            <Meta className="text-label">Continue in background</Meta>
          </Pressable>
        )}
      </View>
    </View>
  );
}
