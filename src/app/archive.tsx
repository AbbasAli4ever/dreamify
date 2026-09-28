import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DreamWorldMap } from '@/components/archive/dream-world-map';
import { RANGE_LABELS, RangeMenu, type Range } from '@/components/archive/range-menu';
import { DreamArtTile } from '@/components/dream/dream-art-tile';
import { DreamCard } from '@/components/dream/dream-card';
import { BOTTOM_BAR_HEIGHT, BottomActionBar } from '@/components/layout/bottom-action-bar';
import { NightBackground } from '@/components/layout/night-background';
import { Avatar } from '@/components/ui/avatar';
import { CircleButton } from '@/components/ui/circle-button';
import { Icon } from '@/components/ui/icon';
import { PillButton } from '@/components/ui/pill-button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Body, Label, Meta } from '@/components/ui/typography';
import { useDreams } from '@/providers/dreams-provider';
import { useProfile } from '@/providers/profile-provider';
import type { Dream } from '@/types/dream';

type ArchiveView = 'gallery' | 'list' | 'world';

const DAY = 24 * 60 * 60 * 1000;

function inRange(dream: Dream, range: Range, now = new Date()) {
  const d = new Date(dream.createdAt);
  if (range === 'all') return true;
  if (range === 'month')
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  return now.getTime() - d.getTime() < 7 * DAY;
}

function monthLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/** Group consecutive dreams by month (only used for All Time). */
function byMonth(dreams: Dream[]) {
  const groups: { label: string; dreams: Dream[] }[] = [];
  for (const d of dreams) {
    const label = monthLabel(d.createdAt);
    const last = groups.at(-1);
    if (last?.label === label) last.dreams.push(d);
    else groups.push({ label, dreams: [d] });
  }
  return groups;
}

// S7 Dream Archive — docs/SCREENS.md §6.
export default function ArchiveScreen() {
  const params = useLocalSearchParams<{ view?: ArchiveView }>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { dreams } = useDreams();
  const profile = useProfile();

  const [view, setView] = useState<ArchiveView>(params.view ?? 'gallery');
  // Follow `?view=` when the screen is already open and the link changes.
  const [lastParam, setLastParam] = useState(params.view);
  if (params.view !== lastParam) {
    setLastParam(params.view);
    if (params.view) setView(params.view);
  }
  const [range, setRange] = useState<Range>('month');
  const [newestFirst, setNewestFirst] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const shown = dreams.filter((d) => inRange(d, range));
  const sorted = newestFirst ? shown : [...shown].reverse();
  const groups = range === 'all' ? byMonth(sorted) : [{ label: '', dreams: sorted }];

  function open(dream: Dream) {
    router.push({
      pathname: dream.status === 'ready' ? '/dream/[id]' : '/processing/[id]',
      params: { id: dream.id },
    });
  }

  const colWidth = (width - 48 - 12) / 2;

  function gallery(list: Dream[]) {
    // Two columns with alternating heights for a masonry rhythm.
    const cols: Dream[][] = [[], []];
    list.forEach((d, i) => cols[i % 2].push(d));
    return (
      <View className="flex-row gap-3">
        {cols.map((col, c) => (
          <View key={c} className="flex-1 gap-3">
            {col.map((d, i) => (
              <DreamArtTile
                key={d.id}
                dream={d}
                width={colWidth}
                height={colWidth * ((i + c) % 2 === 0 ? 1.4 : 1.1)}
                onPress={() => open(d)}
              />
            ))}
          </View>
        ))}
      </View>
    );
  }

  function list(items: Dream[]) {
    return (
      <View className="gap-3">
        {items.map((d, i) => (
          <DreamCard
            key={d.id}
            dream={d}
            stacked={i === items.length - 1}
            onPress={() => open(d)}
          />
        ))}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-night-900">
      <NightBackground scrim={0.8} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + BOTTOM_BAR_HEIGHT + 24,
          paddingHorizontal: 24,
        }}
      >
        {/* Top row: range filter · avatar */}
        <View className="h-12 flex-row items-center justify-between">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Showing ${RANGE_LABELS[range]}. Change range`}
            onPress={() => setMenuOpen(true)}
            hitSlop={10}
            className="flex-row items-center gap-1.5 active:opacity-60"
          >
            <Label className="text-paper/80">{RANGE_LABELS[range]}</Label>
            <Icon name="chevron-down" size={16} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Your dream patterns"
            onPress={() => router.push('/patterns')}
          >
            <Avatar source={profile.avatar} name={profile.name} size={40} />
          </Pressable>
        </View>

        {/* Title with superscript count */}
        <View className="mt-6 flex-row items-start">
          <Text className="font-display-semibold text-[44px] leading-[48px] tracking-[-1px] text-paper">
            Dream Archive
          </Text>
          <Meta className="ml-1 mt-1">{shown.length}</Meta>
        </View>

        {/* View toggle + sort state */}
        <View className="mt-6 flex-row items-center gap-3">
          <SegmentedControl
            className="flex-1"
            value={view}
            onChange={setView}
            options={[
              { value: 'gallery', label: 'Gallery' },
              { value: 'list', label: 'List' },
              { value: 'world', label: 'World' },
            ]}
          />
        </View>
        {view !== 'world' && shown.length > 1 ? (
          <Meta className="mt-3">{newestFirst ? 'Newest first' : 'Oldest first'}</Meta>
        ) : null}

        {/* Content */}
        <Animated.View
          key={`${view}-${range}-${newestFirst}`}
          entering={FadeIn.duration(300)}
          className="mt-5"
        >
          {shown.length === 0 ? (
            <View className="items-center gap-5 py-16">
              <Body className="text-center">
                No dreams {range === 'week' ? 'this week' : range === 'month' ? 'this month' : ''}{' '}
                yet.
              </Body>
              <PillButton label="Record a dream" onPress={() => router.dismissTo('/home')} />
            </View>
          ) : view === 'world' ? (
            <View className="items-center">
              <DreamWorldMap
                dreams={shown.filter((d) => d.status === 'ready')}
                width={width - 48}
                onPressSymbol={(key) =>
                  router.push({ pathname: '/echo/[symbol]', params: { symbol: key } })
                }
              />
              <Meta className="mt-2 text-center">
                Bigger means more dreams. Lines join symbols that share a dream.
              </Meta>
            </View>
          ) : (
            <View className="gap-8">
              {groups.map((g) => (
                <View key={g.label || 'all'} className="gap-4">
                  {g.label ? <Label className="text-paper/80">{g.label}</Label> : null}
                  {view === 'gallery' ? gallery(g.dreams) : list(g.dreams)}
                </View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <BottomActionBar
        left={
          <CircleButton
            icon="close"
            accessibilityLabel="Back to home"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
          />
        }
        center={
          <PillButton
            variant="ghost"
            label="Search"
            icon={<Icon name="search" size={18} />}
            onPress={() => router.push('/search')}
            className="w-full bg-night-900/60"
          />
        }
        right={
          <CircleButton
            icon="sort"
            accessibilityLabel={newestFirst ? 'Sort oldest first' : 'Sort newest first'}
            onPress={() => setNewestFirst((v) => !v)}
          />
        }
      />

      {menuOpen ? (
        <RangeMenu
          value={range}
          onChange={setRange}
          onClose={() => setMenuOpen(false)}
          top={insets.top + 56}
        />
      ) : null}
    </View>
  );
}
