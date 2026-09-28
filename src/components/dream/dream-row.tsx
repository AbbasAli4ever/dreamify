import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { SymbolIcon } from '@/components/ui/symbol-icon';
import { Meta } from '@/components/ui/typography';
import { formatShortDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { Dream } from '@/types/dream';

type DreamRowProps = {
  dream: Dream;
  /** Highlight (e.g. the dream the user came from). */
  current?: boolean;
  onPress?: () => void;
};

// Compact dark dream card: thumbnail · date · title · symbols (S6 list).
export function DreamRow({ dream, current, onPress }: DreamRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={dream.title ?? 'Dream'}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-4 rounded-tile border p-3 active:opacity-80',
        current ? 'border-paper/35 bg-paper/10' : 'border-paper/10 bg-night-900/55',
      )}
    >
      {dream.artwork ? (
        <Image
          source={dream.artwork}
          contentFit="cover"
          style={{ width: 60, height: 75, borderRadius: 14 }}
        />
      ) : (
        <View className="h-[75px] w-[60px] rounded-[14px] bg-night-800" />
      )}
      <View className="flex-1 gap-1">
        <Meta>
          {formatShortDate(dream.createdAt)}
          {current ? ' · this dream' : ''}
        </Meta>
        <Text
          numberOfLines={2}
          className="font-display-medium text-[17px] leading-[21px] text-paper"
        >
          {dream.title}
        </Text>
        <View className="mt-1 flex-row gap-1.5">
          {dream.symbols.slice(0, 4).map((s) => (
            <SymbolIcon key={s.key} symbol={s.key} size={22} />
          ))}
        </View>
      </View>
    </Pressable>
  );
}
