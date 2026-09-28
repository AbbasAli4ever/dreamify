import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Label } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

// Hairline-divided section (R05, R10).
export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <View className={cn('border-t border-paper/10 py-7', className)}>{children}</View>;
}

// Two columns: small system label on the left, stacked display-font list on the right (R05, R10).
export function LabeledList({ label, items }: { label: string; items: string[] }) {
  return (
    <View className="flex-row">
      <Label className="w-[38%] pt-1.5">{label}</Label>
      <View className="flex-1 gap-1">
        {items.map((item) => (
          <Text key={item} className="font-display text-list text-paper">
            {item}
          </Text>
        ))}
      </View>
    </View>
  );
}

// ✶ section break before a "big moment" (R04, R18).
export function StarDivider() {
  return (
    <View className="items-center py-2">
      <Text className="text-[26px] leading-[30px] text-paper">✶</Text>
    </View>
  );
}
