import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AudioPlayButton } from '@/components/dream/audio-play-button';
import { DreamHero } from '@/components/dream/dream-hero';
import { DreamPortal, PORTAL_REVEAL_MS } from '@/components/dream/dream-portal';
import { EchoCard } from '@/components/dream/echo-card';
import { InsightCard } from '@/components/dream/insight-card';
import { InsightSheet } from '@/components/dream/insight-sheet';
import { KindredSection } from '@/components/kindred/kindred-section';
import { SymbolTile } from '@/components/dream/symbol-tile';
import { BOTTOM_BAR_HEIGHT, BottomActionBar } from '@/components/layout/bottom-action-bar';
import { ComingSoon } from '@/components/layout/coming-soon';
import { NightBackground } from '@/components/layout/night-background';
import { LabeledList, Section, StarDivider } from '@/components/layout/section';
import { CircleButton } from '@/components/ui/circle-button';
import { Icon } from '@/components/ui/icon';
import { PillButton } from '@/components/ui/pill-button';
import { RichText } from '@/components/ui/rich-text';
import { BodyLarge, Label } from '@/components/ui/typography';
import { formatDateTime } from '@/lib/dates';
import { countEarlier, findEcho } from '@/lib/echo';
import { useDreams } from '@/providers/dreams-provider';
import type { Dream } from '@/types/dream';

// S5 Dream Reveal + S5b Reflection — docs/SCREENS.md §6.
export default function DreamScreen() {
  const { id, fresh } = useLocalSearchParams<{ id: string; fresh?: string }>();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { getDream, dreams, saveReflection, removeDream, transcribeVoiceNote } = useDreams();
  const [saveError, setSaveError] = useState<string | null>(null);
  const dream = getDream(id);
  const isFresh = fresh === '1';

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  // Dark fade behind the floating top buttons once the artwork has scrolled away.
  const topFade = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [height * 0.35, height * 0.55], [0, 1], 'clamp'),
  }));
  const [sheetOpen, setSheetOpen] = useState(false);
  // Bumped on each open so the sheet starts fresh, without remounting it on close
  // (which would cut its slide-down animation).
  const [sheetKey, setSheetKey] = useState(0);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  /** A fresh dream opens with the flight into it; the insights come in behind it. */
  const [inPortal, setInPortal] = useState(isFresh);

  if (!dream) return <ComingSoon title="Dream not found" spec="S5" />;

  const echo = findEcho(dream, dreams);
  const related = (echo?.relatedDreamIds.map(getDream).filter(Boolean) ?? []) as Dream[];
  const answered = !!(dream.reflection?.answerText || dream.reflection?.answerAudioUri);
  const heroHeight = height * 0.62;

  // Fresh dreams arrive with a staggered reveal; revisited ones appear at once.
  let step = 0;
  const reveal = (children: ReactNode) => (
    <Animated.View
      entering={
        isFresh ? FadeInDown.delay(PORTAL_REVEAL_MS + step++ * 140).duration(600) : undefined
      }
    >
      {children}
    </Animated.View>
  );

  function goHome(params?: Record<string, string>) {
    router.dismissTo({ pathname: '/home', params });
  }

  function discard() {
    const confirmDiscard = () => {
      removeDream(dream!.id).catch(() => {});
      goHome();
    };
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Discard this dream? It will be removed from your dream world.'))
        confirmDiscard();
      return;
    }
    Alert.alert('Discard this dream?', 'It will be removed from your dream world.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: confirmDiscard },
    ]);
  }

  function openSheet() {
    setSheetKey((k) => k + 1);
    setSheetOpen(true);
  }

  function share() {
    Share.share({ message: `${dream!.title}\n\n${dream!.transcript}` }).catch(() => {});
  }

  function saveInsight({ text, audioUri }: { text: string; audioUri?: string }) {
    setSheetOpen(false);
    setSaveError(null);
    saveReflection(dream!.id, { text: text || undefined, audioUri }).catch(() =>
      setSaveError("Your insight is shown here but didn't sync. Check your connection."),
    );
  }

  return (
    <View className="flex-1 bg-night-900">
      <NightBackground
        image={false}
        glowColor={dream.artworkColor}
        glowPosition={{ x: 0.5, y: 0.75 }}
      />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + 40 }}
      >
        <DreamHero
          dream={dream}
          height={heroHeight}
          scrollY={scrollY}
          dateLabel={formatDateTime(dream.createdAt)}
        />

        <View className="px-6">
          {/* Emotions */}
          {dream.emotions.length
            ? reveal(
                <Section className="border-t-0">
                  <LabeledList label="Emotions" items={dream.emotions.map((e) => e.label)} />
                </Section>,
              )
            : null}

          {/* Symbols */}
          {dream.symbols.length
            ? reveal(
                <Section>
                  <View className="mb-4 flex-row items-center gap-2">
                    <Label>Symbols</Label>
                    <Icon name="sparkle" size={14} color="rgba(255,255,255,0.6)" />
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginHorizontal: -24, flexGrow: 0 }}
                    contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}
                  >
                    {dream.symbols.map((s) => (
                      <SymbolTile
                        key={s.key}
                        symbolKey={s.key}
                        label={s.label}
                        count={countEarlier(dream, dreams, s.key)}
                        onPress={() =>
                          router.push({
                            pathname: '/echo/[symbol]',
                            params: { symbol: s.key, from: dream.id },
                          })
                        }
                      />
                    ))}
                  </ScrollView>
                </Section>,
              )
            : null}

          {/* Interpretation */}
          {dream.interpretation
            ? reveal(
                <Section>
                  <Label className="mb-3">Interpretation</Label>
                  <BodyLarge className="text-paper/85">{dream.interpretation}</BodyLarge>
                </Section>,
              )
            : null}

          {/* Themes */}
          {dream.themes.length
            ? reveal(
                <Section>
                  <LabeledList label="Themes" items={dream.themes} />
                </Section>,
              )
            : null}

          {/* Dream Echo */}
          {echo
            ? reveal(
                <View className="pb-2 pt-2">
                  <EchoCard
                    echo={echo}
                    related={related}
                    onPress={() =>
                      router.push({
                        pathname: '/echo/[symbol]',
                        params: { symbol: echo.key, from: dream.id },
                      })
                    }
                  />
                </View>,
              )
            : null}

          {/* Kindred dreamers: other people whose dreams were alike */}
          {dream.status === 'ready' ? reveal(<KindredSection dream={dream} />) : null}

          {/* Reflection */}
          {dream.reflection?.question
            ? reveal(
                <View className="pb-4 pt-10">
                  <StarDivider />
                  <RichText className="mt-3 text-center">{dream.reflection.question}</RichText>
                  {dream.reflection.questionAudioUri ? (
                    <View className="mt-5 items-center">
                      <AudioPlayButton uri={dream.reflection.questionAudioUri} label="Listen" />
                    </View>
                  ) : null}
                  {saveError ? (
                    <Text className="mt-4 text-center text-meta text-paper/60">{saveError}</Text>
                  ) : null}
                  {answered ? (
                    <InsightCard
                      className="mt-8"
                      text={dream.reflection.answerText}
                      audioUri={dream.reflection.answerAudioUri}
                      dateLabel={formatDateTime(dream.reflection.answeredAt ?? dream.createdAt)}
                      onEdit={openSheet}
                    />
                  ) : null}
                </View>,
              )
            : null}

          {/* Your dream (transcript) */}
          {dream.transcript
            ? reveal(
                <Section className="mt-6">
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: transcriptOpen }}
                    onPress={() => setTranscriptOpen((v) => !v)}
                    className="flex-row items-center justify-between active:opacity-70"
                  >
                    <Label>Your dream</Label>
                    <View style={{ transform: [{ rotate: transcriptOpen ? '180deg' : '0deg' }] }}>
                      <Icon name="chevron-down" size={18} color="rgba(255,255,255,0.6)" />
                    </View>
                  </Pressable>
                  <Text
                    numberOfLines={transcriptOpen ? undefined : 3}
                    className="mt-3 text-body-lg text-paper/80"
                  >
                    {dream.transcript}
                  </Text>
                  {dream.audioUri ? (
                    <View className="mt-4">
                      <AudioPlayButton uri={dream.audioUri} label="Play recording" />
                    </View>
                  ) : null}
                </Section>,
              )
            : null}
        </View>
      </Animated.ScrollView>

      <Animated.View
        pointerEvents="none"
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 72 },
          topFade,
        ]}
      >
        <LinearGradient colors={['rgba(7,8,12,0.95)', 'rgba(7,8,12,0)']} style={{ flex: 1 }} />
      </Animated.View>

      {/* Floating top bar over the artwork */}
      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 flex-row justify-between px-6"
        style={{ top: insets.top + 8 }}
      >
        {isFresh ? (
          <View />
        ) : (
          <CircleButton
            icon="back"
            size="sm"
            accessibilityLabel="Back"
            onPress={() => (router.canGoBack() ? router.back() : goHome())}
          />
        )}
        <CircleButton icon="share" size="sm" accessibilityLabel="Share dream" onPress={share} />
      </View>

      <BottomActionBar
        left={
          isFresh ? (
            <CircleButton icon="close" accessibilityLabel="Discard dream" onPress={discard} />
          ) : null
        }
        center={
          dream.reflection?.question ? (
            <PillButton
              variant="ghost"
              label={answered ? 'Edit insight' : 'Add an insight'}
              icon={<Icon name={answered ? 'feather' : 'plus'} size={18} />}
              onPress={openSheet}
              className="w-full bg-night-900/60"
            />
          ) : null
        }
        right={
          isFresh ? (
            <CircleButton
              icon="check"
              variant="solid"
              accessibilityLabel="Save to your dream world"
              onPress={() => goHome({ saved: '1' })}
            />
          ) : null
        }
      />

      <InsightSheet
        key={sheetKey}
        visible={sheetOpen}
        initialText={dream.reflection?.answerText ?? ''}
        initialAudioUri={dream.reflection?.answerAudioUri}
        dateLabel={formatDateTime(new Date().toISOString())}
        onClose={() => setSheetOpen(false)}
        onSave={saveInsight}
        transcribe={transcribeVoiceNote}
      />

      {inPortal ? <DreamPortal onDone={() => setInPortal(false)} /> : null}
    </View>
  );
}
