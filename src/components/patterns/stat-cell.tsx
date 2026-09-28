import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/lib/utils';

type StatCellProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

// One cell of the 2×2 stat grid (R24): small label, then the value(s).
export function StatCell({ label, children, className }: StatCellProps) {
  return (
    <View className={cn('flex-1 gap-3 p-5', className)}>
      <Text className="text-label font-medium text-ink/50">{label}</Text>
      {children}
    </View>
  );
}

// "Unease  34%" row inside a cell.
export function StatLine({ value, detail }: { value: string; detail: string }) {
  return (
    <View className="flex-row items-baseline justify-between gap-2">
      <Text
        numberOfLines={1}
        className="flex-shrink font-display text-[18px] leading-[24px] text-ink"
      >
        {value}
      </Text>
      <Text className="text-meta text-ink/45">{detail}</Text>
    </View>
  );
}
