import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DreamArtTile } from '@/components/dream/dream-art-tile';
import { EchoCard } from '@/components/dream/echo-card';
import { RecordOrb } from '@/components/home/record-orb';
import { BOTTOM_BAR_HEIGHT, BottomActionBar } from '@/components/layout/bottom-action-bar';
import { NightBackground } from '@/components/layout/night-background';
import { Avatar } from '@/components/ui/avatar';
import { CircleButton } from '@/components/ui/circle-button';
import { Icon } from '@/components/ui/icon';
import { PillButton } from '@/components/ui/pill-button';
import { RichText } from '@/components/ui/rich-text';
import { Body, Label, Meta, Title } from '@/components/ui/typography';
import { useDreamRecorder } from '@/hooks/use-dream-recorder';
import { formatDuration, formatLongDate, greeting } from '@/lib/dates';
import { setOnboarded } from '@/lib/storage';
import { useDreams } from '@/providers/dreams-provider';
import { useProfile } from '@/providers/profile-provider';
import type { Dream } from '@/types/dream';

/** Shorter recordings are treated as accidental taps. */
const MIN_RECORDING_MS = 2000;

// S2 Home — docs/SCREENS.md §6. Voice capture happens here, in place:
// the mic button morphs into the orb and the user never leaves Home.
export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { dreams, latestEcho, getDream, createDream, loading, syncError } = useDreams();
  const profile = useProfile();
  const recorder = useDreamRecorder();
  const scrollRef = useRef<ScrollView>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const recording = recorder.status !== 'idle';
  const paused = recorder.status === 'paused';
  const recent = dreams.slice(0, 5);
  const related = (latestEcho?.relatedDreamIds.map(getDream).filter(Boolean) ?? []) as Dream[];

  // "Speak instead" on the Write screen comes back here with `record=1`.
  const { record, saved } = useLocalSearchParams<{ record?: string; saved?: string }>();
  useEffect(() => {
    if (record !== '1') return;
    router.setParams({ record: undefined });
    startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record]);

  function openWrite() {
    setNotice(null);
    router.push('/write');
  }

  async function startRecording() {
    setNotice(null);
    if (saved) router.setParams({ saved: undefined });
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    await recorder.start();
  }

  async function finishRecording() {
    const { uri, durationMs } = await recorder.stop();
    if (durationMs < MIN_RECORDING_MS) {
      setNotice('That was very short. Tap the mic and take your time.');
      return;
    }
    // Saved as `processing`; the Processing screen (S4) turns it into a full dream.
    setNotice('Saving your dream…');
    try {
      const id = await createDream({ inputType: 'voice', audioUri: uri ?? undefined });
      setNotice(null);
      router.push({ pathname: '/processing/[id]', params: { id } });
    } catch {
      setNotice("Couldn't save your dream. Check your connection and try again.");
    }
  }

  async function cancelRecording() {
    await recorder.cancel();
  }

  async function replayOnboarding() {
    if (!__DEV__) return;
    await setOnboarded(false);
    router.replace('/onboarding');
  }

  return (
    <View className="flex-1 bg-night-900">
      <NightBackground />

      <ScrollView
        ref={scrollRef}
        scrollEnabled={!recording}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + 24,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6">
          <View className="gap-0.5">
            <Meta>{formatLongDate()}</Meta>
            <Label className="text-body-lg text-paper">
              {greeting()}, {profile.name}
            </Label>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Your dream patterns"
            disabled={recording}
            onPress={() => router.push('/patterns')}
            onLongPress={replayOnboarding}
          >
            <Avatar source={profile.avatar} name={profile.name} size={44} />
          </Pressable>
        </View>

        {/* Hero: prompt + record button / listening orb */}
        <View
          className="items-center justify-center px-6"
          style={{
            minHeight: recording ? height - insets.top - 60 - BOTTOM_BAR_HEIGHT : height * 0.62,
          }}
        >
          <Animated.View key={recorder.status} entering={FadeIn.duration(350)}>
            <RichText className="text-center">
              {paused ? '*Paused*' : recording ? "I'm *listening*…" : 'What do you *remember*?'}
            </RichText>
          </Animated.View>

          <RecordOrb active={recording} level={recorder.level} onPress={startRecording} />

          {recording ? (
            <Animated.View entering={FadeIn.duration(400)} className="items-center">
              <View className="items-center gap-2">
                <Label className="font-display-medium text-title text-paper">
                  {formatDuration(recorder.durationMs)}
                </Label>
                <Body className="text-center">Tell me everything, even fragments.</Body>
              </View>
            </Animated.View>
          ) : (
            <View className="items-center gap-4">
              <Pressable
                accessibilityRole="button"
                onPress={() => openWrite()}
                hitSlop={12}
                className="flex-row items-center gap-2 active:opacity-60"
              >
                <Icon name="pencil" size={16} color="rgba(255,255,255,0.7)" />
                <Label className="text-paper/70">Write instead</Label>
              </Pressable>
              {recorder.error === 'permission' ? (
                <Pressable onPress={() => Linking.openSettings()} accessibilityRole="button">
                  <Body className="text-center">
                    Microphone access is off.{' '}
                    <Label className="text-paper underline">Open Settings</Label>
                  </Body>
                </Pressable>
              ) : recorder.error === 'failed' ? (
                <Body className="text-center">
                  Couldn&apos;t start recording. Please try again.
                </Body>
              ) : notice || saved ? (
                <Body className="text-center">{notice ?? 'Saved to your dream world'}</Body>
              ) : syncError ? (
                <Body className="text-center">
                  Couldn&apos;t reach your dream world. Showing what&apos;s on this device.
                </Body>
              ) : loading ? (
                <Body className="text-center">Gathering your dreams…</Body>
              ) : dreams.length === 0 ? (
                <Body className="text-center">Your first dream starts your dream world.</Body>
              ) : null}
            </View>
          )}
        </View>

        {/* Hidden while recording, so nothing competes with the orb. */}
        {!recording ? (
          <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(200)}>
            {latestEcho ? (
              <View className="px-6">
                <EchoCard
                  echo={latestEcho}
                  related={related}
                  onPress={() =>
                    router.push({ pathname: '/echo/[symbol]', params: { symbol: latestEcho.key } })
                  }
                />
              </View>
            ) : null}

            {recent.length > 0 ? (
              <View className="mt-10">
                <View className="flex-row items-end justify-between px-6">
                  <Title>Recent dreams</Title>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push('/archive')}
                    hitSlop={12}
                    className="flex-row items-center gap-1 active:opacity-60"
                  >
                    <Label>See all</Label>
                    <Icon name="chevron-right" size={14} color="rgba(255,255,255,0.6)" />
                  </Pressable>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  decelerationRate="fast"
                  snapToInterval={176 + 12}
                  contentContainerStyle={{ paddingHorizontal: 24, gap: 12, marginTop: 16 }}
                >
                  {recent.map((dream) => (
                    <DreamArtTile
                      key={dream.id}
                      dream={dream}
                      onPress={() =>
                        router.push({
                          pathname: dream.status === 'ready' ? '/dream/[id]' : '/processing/[id]',
                          params: { id: dream.id },
                        })
                      }
                    />
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </Animated.View>
        ) : null}
      </ScrollView>

      {recording ? (
        <BottomActionBar
          left={
            <CircleButton
              icon="close"
              accessibilityLabel="Discard recording"
              onPress={cancelRecording}
            />
          }
          center={
            <PillButton
              variant="ghost"
              label={paused ? 'Resume' : 'Pause'}
              icon={<Icon name={paused ? 'play' : 'pause'} size={18} />}
              onPress={paused ? recorder.resume : recorder.pause}
              disabled={recorder.status === 'starting'}
              className="w-full bg-night-900/40"
            />
          }
          right={
            <CircleButton
              icon="check"
              variant="solid"
              accessibilityLabel="Finish recording"
              onPress={finishRecording}
              disabled={recorder.status === 'starting'}
            />
          }
        />
      ) : (
        <BottomActionBar
          left={
            <CircleButton
              icon="grid"
              accessibilityLabel="Dream archive"
              onPress={() => router.push('/archive')}
            />
          }
          center={
            <PillButton
              variant="ghost"
              label="Search"
              icon={<Icon name="search" size={18} />}
              onPress={() => router.push('/search')}
              className="w-full bg-night-900/40"
            />
          }
          right={
            <CircleButton
              icon="pencil"
              accessibilityLabel="Write a dream"
              onPress={() => openWrite()}
            />
          }
        />
      )}
    </View>
  );
}
