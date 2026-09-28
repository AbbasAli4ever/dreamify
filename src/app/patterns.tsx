import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MistBackground } from '@/components/layout/mist-background';
import { RhythmChart } from '@/components/patterns/rhythm-chart';
import { StatCell, StatLine } from '@/components/patterns/stat-cell';
import { Avatar } from '@/components/ui/avatar';
import { CircleButton } from '@/components/ui/circle-button';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { colors } from '@/constants/theme';
import { dreamPatterns } from '@/lib/patterns';
import { useDreams } from '@/providers/dreams-provider';
import { useProfile } from '@/providers/profile-provider';

const MIN_DREAMS = 3;

const pct = (share: number) => `${Math.round(share * 100)}%`;

function monthYear(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// S9 Dream Patterns — docs/SCREENS.md §6. A simple personal summary on the light Mist theme.
export default function PatternsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { dreams } = useDreams();
  const profile = useProfile();
  const p = dreamPatterns(dreams);
  const monthName = new Date().toLocaleDateString('en-GB', { month: 'long' });

  const enter = (i: number) => FadeInDown.delay(120 + i * 90).duration(500);

  return (
    <View className="flex-1 bg-paper">
      <StatusBar style="dark" />
      <MistBackground />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 24,
        }}
      >
        {/* Header */}
        <View className="h-12 flex-row items-center justify-between">
          <CircleButton
            icon="back"
            size="sm"
            variant="ink"
            accessibilityLabel="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          />
          <Text className="text-label font-medium text-ink/60">Your patterns</Text>
          <CircleButton
            icon="settings"
            size="sm"
            variant="ink"
            accessibilityLabel="Settings"
            onPress={() => router.push('/settings')}
          />
        </View>

        {/* Profile */}
        <View className="mt-8 items-center gap-3">
          <Avatar source={profile.avatar} name={profile.name} size={96} />
          <Text className="font-display-semibold text-title text-ink">{profile.name}</Text>
        </View>

        {p.total < MIN_DREAMS ? (
          <View className="mt-16 items-center px-4">
            <Text className="text-center font-display text-lead text-ink/70">
              Patterns appear after a few dreams. Keep going.
            </Text>
          </View>
        ) : (
          <>
            {/* 2×2 stat grid */}
            <Animated.View entering={enter(0)}>
              <View className="mt-10 overflow-hidden rounded-card border border-ink/10 bg-paper/60">
                <View className="flex-row border-b border-ink/10">
                  <StatCell label="Most felt" className="border-r border-ink/10">
                    {p.emotions.map((e) => (
                      <StatLine key={e.key} value={e.label} detail={pct(e.share)} />
                    ))}
                  </StatCell>
                  <StatCell label="Most recurring symbol">
                    {p.symbols.map((s) => (
                      <Pressable
                        key={s.key}
                        accessibilityRole="button"
                        accessibilityLabel={`${s.label}, in ${s.count} dreams`}
                        onPress={() =>
                          router.push({ pathname: '/echo/[symbol]', params: { symbol: s.key } })
                        }
                        className="flex-row items-center gap-2 active:opacity-60"
                      >
                        <SymbolIcon symbol={s.key} size={26} color={colors.ink} />
                        <View className="flex-1">
                          <StatLine value={s.label} detail={`×${s.count}`} />
                        </View>
                      </Pressable>
                    ))}
                  </StatCell>
                </View>
                <View className="flex-row">
                  <StatCell label="Theme in focus" className="border-r border-ink/10">
                    <Text className="font-display-medium text-[22px] leading-[27px] text-ink">
                      {p.theme?.label ?? '—'}
                    </Text>
                    {p.theme ? (
                      <Text className="text-meta text-ink/45">in {p.theme.count} dreams</Text>
                    ) : null}
                  </StatCell>
                  <StatCell label={`Dreams in ${monthName}`}>
                    <Text className="font-display-semibold text-[48px] leading-[50px] tracking-[-1px] text-ink">
                      {p.thisMonth}
                    </Text>
                  </StatCell>
                </View>
              </View>
            </Animated.View>

            {/* Dream rhythm */}
            <Animated.View entering={enter(1)}>
              <View className="mt-10 gap-4">
                <View className="flex-row items-baseline justify-between">
                  <Text className="font-display-semibold text-[22px] text-ink">Dream rhythm</Text>
                  <Text className="text-meta text-ink/45">{monthName}</Text>
                </View>
                <RhythmChart perDay={p.perDay} today={p.today} width={width - 48} />
              </View>
            </Animated.View>

            {/* Totals */}
            <Animated.View entering={enter(2)}>
              <View className="mt-12 items-center gap-1">
                <Text className="text-center font-display text-lead text-ink">
                  {p.total} dreams remembered
                  {p.firstDream ? ` since ${monthYear(p.firstDream)}` : ''}
                </Text>
                <Text className="text-meta text-ink/45">
                  {p.answered} {p.answered === 1 ? 'reflection' : 'reflections'} written
                </Text>
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
