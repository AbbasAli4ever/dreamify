import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import { CountBadge } from '@/components/ui/count-badge';
import { Icon } from '@/components/ui/icon';
import { RichText } from '@/components/ui/rich-text';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Label } from '@/components/ui/typography';
import type { Dream, DreamEcho } from '@/types/dream';

type EchoCardProps = {
  echo: DreamEcho;
  /** Related dreams, for the thumbnail row. */
  related: Dream[];
  onPress?: () => void;
};

// The USP moment: "Water has appeared in 3 of your previous dreams." (docs/SCREENS.md §5)
export function EchoCard({ echo, related, onPress }: EchoCardProps) {
  const thumbs = related.filter((d) => d.artwork).slice(0, 3);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Dream Echo: ${echo.message.replaceAll('*', '')}`}
      onPress={onPress}
      className="rounded-card border border-paper/10 bg-night-900/55 p-5 active:opacity-80"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Icon name="sparkle" size={16} color="rgba(255,255,255,0.7)" />
          <Label>Dream Echo</Label>
        </View>
        <Icon name="chevron-right" size={18} color="rgba(255,255,255,0.5)" />
      </View>

      <View className="mt-5 flex-row items-center gap-5">
        <View>
          <SymbolIcon symbol={echo.key} size={64} />
          <CountBadge count={echo.count} className="absolute -right-2 -top-1" />
        </View>
        <RichText className="flex-1 text-lead">{echo.message}</RichText>
      </View>

      {thumbs.length > 0 ? (
        <View className="mt-5 flex-row items-center">
          {thumbs.map((d, i) => (
            <Image
              key={d.id}
              source={d.artwork}
              contentFit="cover"
              style={{
                width: 36,
                height: 45,
                borderRadius: 8,
                marginLeft: i === 0 ? 0 : -8,
                borderWidth: 2,
                borderColor: '#07080C',
                transform: [{ rotate: `${(i - 1) * 6}deg` }],
              }}
            />
          ))}
          <Label className="ml-3">
            {thumbs.length === 1 ? '1 related dream' : `${related.length} related dreams`}
          </Label>
        </View>
      ) : null}
    </Pressable>
  );
}
