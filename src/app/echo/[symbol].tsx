import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DreamRow } from '@/components/dream/dream-row';
import { EchoConstellation } from '@/components/dream/echo-constellation';
import { ScreenHeader } from '@/components/layout/screen-header';
import { LabeledList, Section, StarDivider } from '@/components/layout/section';
import { CountBadge } from '@/components/ui/count-badge';
import { RichText } from '@/components/ui/rich-text';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Body, Label, Lead, Meta } from '@/components/ui/typography';
import { SYMBOL_MEANINGS } from '@/constants/symbol-meanings';
import { personalNote, symbolProfile } from '@/lib/echo';
import { useDreams } from '@/providers/dreams-provider';

function monthOf(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long' });
}

function dayMonth(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
}

// S6 Dream Echo — docs/SCREENS.md §6. How one symbol keeps returning across the dream world.
export default function EchoScreen() {
  const { symbol, from } = useLocalSearchParams<{ symbol: string; from?: string }>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { dreams } = useDreams();

  const profile = symbolProfile(symbol, dreams);
  const { label, firstSeen } = profile;
  const count = profile.dreams.length;
  const art = profile.dreams.find((d) => d.artwork)?.artwork;

  const statement =
    count === 0
      ? `*${label}* hasn't appeared in your dreams yet.`
      : count === 1
        ? `This is the first time *${label}* has appeared. I'll let you know if it returns.`
        : `*${label}* has appeared in *${count}* of your dreams since *${monthOf(firstSeen!)}*.`;

  return (
    <View className="flex-1 bg-night-900">
      {/* Faint artwork from the latest dream with this symbol, behind the title (R10).
          The page is solid night-900 so the art's fade has no seam. */}
      {art ? (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { height: 460 }]}>
          <Image
            source={art}
            style={[StyleSheet.absoluteFill, { opacity: 0.22 }]}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(7,8,12,0.2)', '#07080C']}
            locations={[0.2, 1]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      ) : null}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 48 }}
      >
        <View className="px-6">
          <ScreenHeader title="Dream Echo" />

          {/* Title row */}
          <View className="mt-10 flex-row items-center justify-between border-b border-paper/10 pb-7">
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              className="flex-1 font-display-semibold text-display-xl text-paper"
            >
              {label}
            </Text>
            <View>
              <SymbolIcon symbol={symbol} size={72} />
              {count > 1 ? <CountBadge count={count} className="absolute -right-2 -top-1" /> : null}
            </View>
          </View>

          {/* Echo statement: the hero moment */}
          <View className="items-center py-10">
            <StarDivider />
            <RichText className="mt-3 text-center">{statement}</RichText>
            {firstSeen && count > 1 ? (
              <View className="mt-6 rounded-full border border-paper/15 px-4 py-2">
                <Meta>First seen · {dayMonth(firstSeen)}</Meta>
              </View>
            ) : null}
          </View>

          {/* What it may mean */}
          <Section>
            <Label className="mb-3">What it may mean</Label>
            <Lead>{SYMBOL_MEANINGS[symbol] ?? 'A symbol your mind keeps choosing.'}</Lead>
            <Body className="mt-3 text-body-lg text-paper/75">{personalNote(profile)}</Body>
          </Section>

          {/* Felt alongside */}
          {profile.coEmotions.length ? (
            <Section>
              <LabeledList
                label={`Felt with ${label.toLowerCase()}`}
                items={profile.coEmotions.map((e) => e.label)}
              />
            </Section>
          ) : null}

          {/* Dreams with this symbol */}
          {count ? (
            <Section>
              <Label className="mb-4">Dreams with {label.toLowerCase()}</Label>
              <View className="gap-3">
                {profile.dreams.map((d) => (
                  <DreamRow
                    key={d.id}
                    dream={d}
                    current={d.id === from}
                    onPress={() => router.push({ pathname: '/dream/[id]', params: { id: d.id } })}
                  />
                ))}
              </View>
            </Section>
          ) : null}

          {/* Often appears with */}
          {profile.coSymbols.length ? (
            <Section>
              <Label className="mb-2">Often appears with</Label>
              <View className="items-center">
                <EchoConstellation
                  center={{ key: symbol, label }}
                  nodes={profile.coSymbols}
                  size={Math.min(width - 48, 360)}
                  onPressNode={(key) =>
                    router.push({ pathname: '/echo/[symbol]', params: { symbol: key } })
                  }
                />
              </View>
            </Section>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
