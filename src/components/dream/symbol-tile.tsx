import { Pressable, Text, View } from 'react-native';

import { CountBadge } from '@/components/ui/count-badge';
import { SymbolIcon } from '@/components/ui/symbol-icon';

type SymbolTileProps = {
  symbolKey: string;
  label: string;
  /** Appearances in earlier dreams; shows an `xN` badge when > 0. */
  count: number;
  onPress?: () => void;
};

// Dark tile with a symbol icon and name, used in the Symbols row (R04).
export function SymbolTile({ symbolKey, label, count, onPress }: SymbolTileProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={count ? `${label}, seen in ${count} earlier dreams` : label}
      onPress={onPress}
      className="h-[132px] w-[124px] justify-between rounded-tile border border-paper/10 bg-night-900/55 p-4 active:opacity-80"
    >
      <View className="self-start">
        <SymbolIcon symbol={symbolKey} size={52} />
        {count > 0 ? <CountBadge count={count} className="absolute -right-3 -top-1" /> : null}
      </View>
      <Text className="font-display-medium text-[16px] text-paper">{label}</Text>
    </Pressable>
  );
}
