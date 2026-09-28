import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useDeferredValue, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NightBackground } from '@/components/layout/night-background';
import { SearchField } from '@/components/search/search-field';
import { SymbolChip } from '@/components/search/symbol-chip';
import { HighlightText } from '@/components/ui/highlight-text';
import { RichText } from '@/components/ui/rich-text';
import { Label, Meta, Title } from '@/components/ui/typography';
import { formatShortDate } from '@/lib/dates';
import { emotionCounts, searchDreams, symbolCounts } from '@/lib/search';
import { useDreams } from '@/providers/dreams-provider';

const SYMBOLS_COLLAPSED = 8;

// S8 Search — docs/SCREENS.md §6. A modal sheet: swipe down to close.
export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { dreams } = useDreams();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [showAllSymbols, setShowAllSymbols] = useState(false);
  const deferred = useDeferredValue(query);

  const symbols = symbolCounts(dreams);
  const emotions = emotionCounts(dreams);
  const hits = searchDreams(dreams, deferred);
  const searching = deferred.trim().length > 0;
  const shownSymbols = showAllSymbols ? symbols : symbols.slice(0, SYMBOLS_COLLAPSED);

  function close() {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }

  return (
    <View className="flex-1 bg-night-900">
      <NightBackground image={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Grab handle + close (Android / web have no swipe-down) */}
        <View
          className="items-center pb-2"
          style={{ paddingTop: Platform.OS === 'ios' ? 10 : insets.top + 10 }}
        >
          <View className="h-1 w-10 rounded-full bg-paper/30" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close search"
            onPress={close}
            hitSlop={12}
            className="absolute right-6"
            style={{ top: Platform.OS === 'ios' ? 10 : insets.top + 6 }}
          >
            <Label>Done</Label>
          </Pressable>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}
        >
          {searching ? (
            <Animated.View entering={FadeIn.duration(200)}>
              <View className="gap-3">
                {hits.length ? (
                  <Meta>
                    {hits.length} {hits.length === 1 ? 'dream' : 'dreams'}
                  </Meta>
                ) : null}
                {hits.length === 0 ? (
                  <View className="items-center py-16">
                    <RichText className="text-center text-title">
                      Nothing yet. Maybe you haven&apos;t dreamt it *yet*.
                    </RichText>
                  </View>
                ) : (
                  hits.map(({ dream, field, snippet }) => (
                    <Pressable
                      key={dream.id}
                      accessibilityRole="button"
                      accessibilityLabel={dream.title ?? 'Dream'}
                      onPress={() =>
                        router.push({ pathname: '/dream/[id]', params: { id: dream.id } })
                      }
                      className="flex-row gap-4 rounded-tile border border-paper/10 bg-night-800/80 p-3 active:opacity-80"
                    >
                      {dream.artwork ? (
                        <Image
                          source={dream.artwork}
                          contentFit="cover"
                          style={{ width: 60, height: 75, borderRadius: 14 }}
                        />
                      ) : null}
                      <View className="flex-1 gap-1">
                        <Meta>
                          {formatShortDate(dream.createdAt)} · {field}
                        </Meta>
                        <HighlightText
                          text={dream.title ?? ''}
                          query={deferred}
                          numberOfLines={2}
                          className="font-display-medium text-[17px] leading-[21px] text-paper"
                        />
                        {field !== 'Title' ? (
                          <HighlightText text={snippet} query={deferred} numberOfLines={2} />
                        ) : null}
                      </View>
                    </Pressable>
                  ))
                )}
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeIn.duration(200)}>
              <View className="gap-10">
                {/* Symbols */}
                {symbols.length ? (
                  <View className="gap-4">
                    <View className="flex-row items-end justify-between">
                      <Title>Symbols</Title>
                      {symbols.length > SYMBOLS_COLLAPSED ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => setShowAllSymbols((v) => !v)}
                          hitSlop={10}
                        >
                          <Label>{showAllSymbols ? 'Less' : `All ${symbols.length}`}</Label>
                        </Pressable>
                      ) : null}
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                      {shownSymbols.map((s) => (
                        <SymbolChip
                          key={s.key}
                          symbolKey={s.key}
                          label={s.label}
                          count={s.count}
                          onPress={() =>
                            router.push({ pathname: '/echo/[symbol]', params: { symbol: s.key } })
                          }
                        />
                      ))}
                    </View>
                  </View>
                ) : null}

                {/* Emotions */}
                {emotions.length ? (
                  <View className="gap-4">
                    <Title>Emotions</Title>
                    <View className="flex-row flex-wrap gap-2">
                      {emotions.map((e) => (
                        <Pressable
                          key={e.label}
                          accessibilityRole="button"
                          accessibilityLabel={`Search ${e.label}`}
                          onPress={() => setQuery(e.label)}
                          className="h-10 flex-row items-center gap-2 rounded-full border border-paper/15 px-4 active:opacity-70"
                        >
                          <Text className="font-display text-[15px] text-paper">{e.label}</Text>
                          <Text className="text-meta text-paper/50">{e.count}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* Search field, pinned above the keyboard */}
        <View className="px-4 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          <SearchField ref={inputRef} value={query} onChangeText={setQuery} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
