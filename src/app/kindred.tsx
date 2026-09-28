import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KindredAvatar } from '@/components/kindred/kindred-avatar';
import { KindredGraph } from '@/components/kindred/kindred-graph';
import { KindredSheet } from '@/components/kindred/kindred-sheet';
import { NightBackground } from '@/components/layout/night-background';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Section } from '@/components/layout/section';
import { Avatar } from '@/components/ui/avatar';
import { PillButton } from '@/components/ui/pill-button';
import { RichText } from '@/components/ui/rich-text';
import { Body, Label, Meta } from '@/components/ui/typography';
import { clearKindredCache, useKindredCircle } from '@/hooks/use-kindred';
import { dreamStreak, KINDRED_WINDOW_DAYS, symbolLabel, whenLabel } from '@/lib/kindred';
import { useAuth } from '@/providers/auth-provider';
import { useDreams } from '@/providers/dreams-provider';
import { useProfile } from '@/providers/profile-provider';
import type { KindredPerson } from '@/types/kindred';

const CENTER = 76;

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View className="flex-1 items-center gap-1 py-4">
      <Text className="font-display-semibold text-[30px] leading-[34px] text-paper">{value}</Text>
      <Meta className="text-center">{label}</Meta>
    </View>
  );
}

// S11 Kindred dreamers — docs/SCREENS.md §6. Everyone whose dreams were alike to yours in
// the last 60 days, as one mesh, with your dream streak.
export default function KindredScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const profile = useProfile();
  const { setShareDreams } = useAuth();
  const { dreams, getDream } = useDreams();
  const { status, people, links, sample } = useKindredCircle();
  const [open, setOpen] = useState<KindredPerson | null>(null);
  const [turningOn, setTurningOn] = useState(false);

  const streak = dreamStreak(dreams);
  const nights = new Set(links.map((l) => l.dreamId)).size;
  const graphWidth = Math.min(width - 48, 400);

  async function turnOn() {
    setTurningOn(true);
    clearKindredCache();
    await setShareDreams(true).catch(() => {});
    setTurningOn(false);
  }

  const enter = (i: number) => FadeInDown.delay(100 + i * 90).duration(500);

  return (
    <View className="flex-1 bg-night-900">
      <NightBackground image={false} stars />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 48 }}
      >
        <View className="px-6">
          <ScreenHeader title="Kindred dreamers" />

          {status === 'off' ? (
            <View className="mt-16 items-center gap-6">
              <RichText className="text-center">Meet people who *dream like you*.</RichText>
              <Body className="text-center">
                Dreamify connects you with people whose dreams were alike within{' '}
                {KINDRED_WINDOW_DAYS} days of yours. They see a one-line, anonymous overview of your
                dream, your first name and photo, never the dream itself. You see theirs the same
                way.
              </Body>
              <PillButton label="Turn on Kindred dreamers" busy={turningOn} onPress={turnOn} />
            </View>
          ) : (
            <>
              <Animated.View entering={enter(0)}>
                <View className="items-center pb-2 pt-8">
                  <RichText className="text-center">
                    {status === 'loading'
                      ? 'Finding your *kindred dreamers*…'
                      : people.length
                        ? `*${people.length} ${people.length === 1 ? 'dreamer' : 'dreamers'}* dreamt like you in the last two months.`
                        : status === 'error'
                          ? "Couldn't reach your *dream circle*."
                          : 'Your *dream circle* is still forming.'}
                  </RichText>
                  {sample ? (
                    <Meta className="mt-3 text-paper/40">Sample dreamers (demo mode)</Meta>
                  ) : null}
                </View>
              </Animated.View>

              {/* The mesh */}
              <View className="items-center">
                <KindredGraph
                  width={graphWidth}
                  height={graphWidth * 1.05}
                  centerSize={CENTER}
                  center={<Avatar source={profile.avatar} name={profile.name} size={CENTER} />}
                  nodes={people.map((p) => ({
                    id: p.person,
                    name: p.name,
                    avatarUrl: p.avatarUrl,
                    color: p.color,
                    match: p.best.match,
                    symbols: p.sharedSymbols.length ? p.sharedSymbols : p.best.symbols,
                    vibeOnly: !p.sharedSymbols.length,
                  }))}
                  onPressNode={(id) => setOpen(people.find((p) => p.person === id) ?? null)}
                />
              </View>

              {/* Numbers */}
              <Animated.View entering={enter(1)}>
                <View className="mt-2 flex-row rounded-card border border-paper/10 bg-night-900/55">
                  <Stat value={String(people.length)} label="Kindred dreamers" />
                  <View className="my-4 w-px bg-paper/10" />
                  <Stat value={String(nights)} label="Dreams shared" />
                  <View className="my-4 w-px bg-paper/10" />
                  <Stat
                    value={String(streak.current)}
                    label={streak.current === 1 ? 'Night streak' : 'Nights in a row'}
                  />
                </View>
              </Animated.View>
              {streak.longest > streak.current ? (
                <Meta className="mt-3 text-center">Longest streak: {streak.longest} nights</Meta>
              ) : !streak.today && streak.current > 0 ? (
                <Meta className="mt-3 text-center">
                  Tell today&apos;s dream to keep your streak.
                </Meta>
              ) : null}

              {/* Everyone, closest first */}
              {people.length ? (
                <Section className="mt-6">
                  <Label className="mb-4">Your circle</Label>
                  <View className="gap-2">
                    {people.map((p) => {
                      const top = p.sharedSymbols[0];
                      const dream = getDream(p.best.dreamId);
                      return (
                        <Pressable
                          key={p.person}
                          accessibilityRole="button"
                          onPress={() => setOpen(p)}
                          className="flex-row items-center gap-4 rounded-card border border-paper/10 bg-paper/5 px-4 py-3 active:opacity-70"
                        >
                          <KindredAvatar
                            name={p.name}
                            avatarUrl={p.avatarUrl}
                            color={p.color}
                            size={44}
                          />
                          <View className="flex-1 gap-0.5">
                            <Text className="font-display-medium text-button text-paper">
                              {p.name}
                            </Text>
                            <Meta numberOfLines={2}>
                              {top
                                ? `Dreamt of ${symbolLabel(top, dream).toLowerCase()}`
                                : 'Same feel'}{' '}
                              · {whenLabel(p.best.daysApart)}
                              {p.links.length > 1 ? ` · ${p.links.length} dreams` : ''}
                            </Meta>
                          </View>
                          <Text className="w-11 text-right font-display-semibold text-label text-paper">
                            {p.best.match}%
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </Section>
              ) : status === 'error' ? (
                <Body className="mt-8 text-center">
                  Check your connection. If this keeps happening, the Kindred backend isn&apos;t
                  deployed yet (see docs/BACKEND.md).
                </Body>
              ) : status === 'ready' ? (
                <Body className="mt-8 text-center">
                  When someone dreams something like yours within {KINDRED_WINDOW_DAYS} days, they
                  appear here, and you appear in theirs. Keep telling your dreams.
                </Body>
              ) : null}

              <Pressable
                accessibilityRole="link"
                onPress={() => router.push('/settings')}
                className="mt-10 active:opacity-60"
              >
                <Meta className="text-center text-paper/40">
                  Only a one-line, anonymous overview of each dream is shared: never the dream, its
                  title or artwork. You can turn this off in Settings.
                </Meta>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>

      <KindredSheet
        match={open?.best ?? null}
        dream={open ? getDream(open.best.dreamId) : undefined}
        connections={open?.links.length}
        onClose={() => setOpen(null)}
      />
    </View>
  );
}
