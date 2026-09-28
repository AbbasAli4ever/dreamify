import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { formatShortDate } from '@/lib/dates';
import type { Dream } from '@/types/dream';

type DreamCardProps = {
  dream: Dream;
  /** Paper layers peeking out underneath (the end of the stack, R13). */
  stacked?: boolean;
  onPress?: () => void;
};

// White dream card for the Archive list (R13, R23): date · title · excerpt · symbols · feather.
export function DreamCard({ dream, stacked, onPress }: DreamCardProps) {
  const answered = !!(dream.reflection?.answerText || dream.reflection?.answerAudioUri);

  return (
    <View style={{ paddingBottom: stacked ? 16 : 0 }}>
      {stacked ? (
        <>
          <View
            pointerEvents="none"
            className="absolute bottom-0 left-6 right-6 h-20 rounded-card bg-paper/30"
          />
          <View
            pointerEvents="none"
            className="absolute bottom-2 left-3 right-3 h-20 rounded-card bg-paper/60"
          />
        </>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={dream.title ?? 'Dream'}
        onPress={onPress}
        className="gap-2 rounded-card bg-paper p-5 active:opacity-90"
      >
        <Text className="text-meta text-ink/50">{formatShortDate(dream.createdAt)}</Text>
        <Text numberOfLines={2} className="font-display-medium text-[22px] leading-[27px] text-ink">
          {dream.status === 'ready' ? dream.title : 'Painting your dream…'}
        </Text>
        {dream.transcript ? (
          <Text numberOfLines={2} className="text-body leading-[21px] text-ink/60">
            {dream.transcript}
          </Text>
        ) : null}
        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row gap-1.5">
            {dream.symbols.slice(0, 4).map((s) => (
              <SymbolIcon key={s.key} symbol={s.key} size={30} color="#0B0B0F" />
            ))}
          </View>
          {answered ? <Icon name="feather" size={20} color="#0B0B0F" /> : null}
        </View>
      </Pressable>
    </View>
  );
}
