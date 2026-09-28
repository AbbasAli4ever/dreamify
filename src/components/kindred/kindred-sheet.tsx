import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { KindredAvatar } from '@/components/kindred/kindred-avatar';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Label, Meta } from '@/components/ui/typography';
import { symbolLabel, whenLabel } from '@/lib/kindred';
import type { Dream } from '@/types/dream';
import type { KindredMatch } from '@/types/kindred';

type KindredSheetProps = {
  /** The dreamer to show; null hides the sheet. */
  match: KindredMatch | null;
  /** Your dream they matched (for symbol labels and "before/after you"). */
  dream?: Dream;
  /** How many of your dreams this person connects to (the circle). */
  connections?: number;
  onClose: () => void;
};

// Pop-up for one kindred dreamer: who, when, how alike, and the anonymous overview of
// their dream. Never their dream itself.
export function KindredSheet({ match, dream, connections, onClose }: KindredSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={!!match} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        className="flex-1 bg-black/60"
      />
      {match ? (
        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
        >
          <View
            className="rounded-t-[32px] border border-paper/10 bg-night-900 px-6 pt-3"
            style={{ paddingBottom: insets.bottom + 24 }}
          >
            <View className="mb-6 h-1 w-10 self-center rounded-full bg-paper/20" />
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              {/* Who */}
              <View className="flex-row items-center gap-4">
                <KindredAvatar
                  name={match.name}
                  avatarUrl={match.avatarUrl}
                  color={match.color}
                  size={68}
                />
                <View className="flex-1 gap-1">
                  <Text className="font-display-semibold text-title text-paper">{match.name}</Text>
                  <Meta>
                    Dreamt {whenLabel(match.daysApart)}
                    {match.sample ? ' · sample dreamer' : ''}
                  </Meta>
                </View>
                <View className="items-center">
                  <Text className="font-display-semibold text-[28px] leading-[32px] text-paper">
                    {match.match}%
                  </Text>
                  <Meta>alike</Meta>
                </View>
              </View>

              {/* Their dream, as an overview */}
              <View className="mt-7 rounded-card border border-paper/10 bg-paper/5 p-5">
                <Label className="mb-2">Their dream, in a line</Label>
                <Text className="font-display-light text-lead text-paper/90">“{match.gist}”</Text>
              </View>

              {match.sharedSymbols.length ? (
                <View className="mt-7">
                  <Label className="mb-3">You both dreamt of</Label>
                  <View className="flex-row flex-wrap gap-4">
                    {match.sharedSymbols.map((k) => (
                      <View key={k} className="items-center gap-1.5">
                        <SymbolIcon symbol={k} size={48} />
                        <Meta className="text-paper/75">{symbolLabel(k, dream)}</Meta>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {match.sharedEmotions.length ? (
                <View className="mt-6">
                  <Label className="mb-3">You both felt</Label>
                  <View className="flex-row flex-wrap gap-2">
                    {match.sharedEmotions.map((e) => (
                      <View key={e} className="rounded-full border border-paper/15 px-4 py-1.5">
                        <Text className="text-label capitalize text-paper/85">{e}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {!match.sharedSymbols.length && !match.sharedEmotions.length ? (
                <Text className="mt-6 text-body text-paper/70">
                  Different images, but the same feel: the whole of the dream was alike.
                </Text>
              ) : null}

              {connections && connections > 1 ? (
                <Text className="mt-6 text-body text-paper/70">
                  {match.name} is connected to {connections} of your dreams.
                </Text>
              ) : null}

              <Meta className="mt-8 text-paper/40">
                Only a one-line, anonymous overview is ever shared. Never the dream itself.
              </Meta>
            </ScrollView>
          </View>
        </Animated.View>
      ) : null}
    </Modal>
  );
}
