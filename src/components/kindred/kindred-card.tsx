import { Pressable, View } from 'react-native';

import { KindredAvatar } from '@/components/kindred/kindred-avatar';
import { Icon } from '@/components/ui/icon';
import { RichText } from '@/components/ui/rich-text';
import { Label, Meta } from '@/components/ui/typography';
import type { KindredPerson } from '@/types/kindred';

type KindredCardProps = {
  people: KindredPerson[];
  /** Nights in a row with a remembered dream. */
  streak: number;
  onPress: () => void;
};

// Home: the way into Kindred dreamers — who dreamt like you lately, and your dream streak.
export function KindredCard({ people, streak, onPress }: KindredCardProps) {
  const faces = people.slice(0, 4);
  const n = people.length;
  const message = n
    ? `*${n} ${n === 1 ? 'dreamer' : 'dreamers'}* dreamt like you lately.`
    : 'When someone dreams *like you*, they’ll appear here.';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Kindred dreamers: ${message.replaceAll('*', '')}`}
      onPress={onPress}
      className="rounded-card border border-paper/10 bg-night-900/55 p-5 active:opacity-80"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icon name="sparkle" size={16} color="rgba(255,255,255,0.7)" />
          <Label>Kindred dreamers</Label>
        </View>
        <Icon name="chevron-right" size={18} color="rgba(255,255,255,0.5)" />
      </View>

      <View className="mt-5 flex-row items-center gap-4">
        {faces.length ? (
          <View className="flex-row">
            {faces.map((p, i) => (
              <View
                key={p.person}
                style={{ marginLeft: i === 0 ? 0 : -12, zIndex: faces.length - i }}
              >
                <KindredAvatar name={p.name} avatarUrl={p.avatarUrl} color={p.color} size={40} />
              </View>
            ))}
          </View>
        ) : null}
        <RichText className="flex-1 text-lead">{message}</RichText>
      </View>

      {streak > 1 ? (
        <View className="mt-4 flex-row items-center gap-2 border-t border-paper/10 pt-4">
          <Icon name="sparkle" size={13} color="rgba(255,255,255,0.55)" />
          <Meta className="text-paper/70">{streak}-night dream streak</Meta>
        </View>
      ) : null}
    </Pressable>
  );
}
