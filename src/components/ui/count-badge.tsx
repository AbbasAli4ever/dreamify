import { Text, View } from 'react-native';

import { cn } from '@/lib/utils';

// Solid white `xN` bubble that overlaps a symbol icon when it recurs (R04, R11).
export function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <View
      className={cn(
        'h-7 min-w-7 items-center justify-center rounded-full bg-paper px-1.5',
        className,
      )}
    >
      <Text className="font-display-semibold text-meta text-ink">x{count}</Text>
    </View>
  );
}
