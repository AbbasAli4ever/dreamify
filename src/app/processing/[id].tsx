import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ComingSoon } from '@/components/layout/coming-soon';
import { NightBackground } from '@/components/layout/night-background';
import { DreamOrb } from '@/components/orb/dream-orb';
import type { OrbState } from '@/components/orb/use-orb-animation';
import { StageRow, type StageStatus } from '@/components/processing/stage-row';
import { Glow } from '@/components/ui/glow';
import { PillButton } from '@/components/ui/pill-button';
import { RichText } from '@/components/ui/rich-text';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Body, Label, Meta, Title } from '@/components/ui/typography';
import { STAGES, type StageKey } from '@/lib/ai/process-dream';
import { findEcho } from '@/lib/echo';
import { useDreams } from '@/providers/dreams-provider';

/** Label + orb shape per stage (docs/SCREENS.md §2.6). */
const STAGE_UI: Record<StageKey, { label: string; orb: OrbState }> = {
  story: { label: 'Understanding the story', orb: 'working' },
  emotions: { label: 'Finding emotions', orb: 'composing' },
  symbols: { label: 'Finding symbols', orb: 'connecting' },
  painting: { label: 'Painting your dream', orb: 'weaving' },
};

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
  const stage = done ? STAGES.length : (dream.processingStage ?? 0);
  const orbState = STAGE_UI[STAGES[Math.min(stage, STAGES.length - 1)]].orb;
  const echo = stage > 2 ? findEcho(dream, dreams) : null;

  const statusOf = (i: number): StageStatus =>
    i < stage ? 'done' : i === stage && !failed ? 'active' : 'pending';

  const reveals: Record<StageKey, ReactNode> = {
    story: dream.title ? <Label className="text-paper/80">“{dream.title}”</Label> : null,
    emotions: dream.emotions.length ? (
      <Label className="text-paper/80">{dream.emotions.map((e) => e.label).join(' · ')}</Label>
    ) : null,
    symbols: dream.symbols.length ? (
      <View className="gap-2">
        <View className="flex-row gap-2">
          {dream.symbols.map((s) => (
            <SymbolIcon key={s.key} symbol={s.key} size={30} />
          ))}
        </View>
        {echo ? (
          <Label className="text-paper/80">
            {echo.label} echoes {echo.count} of your dreams
          </Label>
        ) : null}
      </View>
    ) : null,
    painting: <Label className="text-paper/80">Your dream is ready</Label>,
  };

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
              <DreamOrb
                state={orbState}
                size={200}
                accessibilityLabel={STAGE_UI[STAGES[Math.min(stage, 3)]].label}
              />
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
        <View className="mt-8 gap-5">
          {STAGES.map((key, i) => (
            <StageRow key={key} label={STAGE_UI[key].label} status={statusOf(i)}>
              {reveals[key]}
            </StageRow>
          ))}
        </View>
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
