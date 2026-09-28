import { Pressable, Text } from 'react-native';

import { SymbolIcon } from '@/components/ui/symbol-icon';

type SymbolChipProps = {
  symbolKey: string;
  label: string;
  count: number;
  onPress: () => void;
};

// Pill: symbol icon · name · count (R22).
export function SymbolChip({ symbolKey, label, count, onPress }: SymbolChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${count} ${count === 1 ? 'dream' : 'dreams'}`}
      onPress={onPress}
      className="h-12 flex-row items-center gap-2.5 rounded-full border border-paper/10 bg-night-900/60 pl-1.5 pr-4 active:opacity-70"
    >
      <SymbolIcon symbol={symbolKey} size={36} />
      <Text className="font-display-medium text-[15px] text-paper">{label}</Text>
      <Text className="text-meta text-paper/50">{count}</Text>
    </Pressable>
  );
}
