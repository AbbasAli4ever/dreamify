import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export type Range = 'week' | 'month' | 'all';

export const RANGE_LABELS: Record<Range, string> = {
  week: 'This Week',
  month: 'This Month',
  all: 'All Time',
};

type RangeMenuProps = {
  value: Range;
  onChange: (range: Range) => void;
  onClose: () => void;
  top: number;
};

// Small dropdown under the "This Month ⌄" filter.
export function RangeMenu({ value, onChange, onClose, top }: RangeMenuProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={onClose}
        accessibilityLabel="Close menu"
      />
      <View
        className="absolute left-6 w-48 overflow-hidden rounded-tile border border-paper/10 bg-night-800"
        style={{ top }}
      >
        {(Object.keys(RANGE_LABELS) as Range[]).map((r) => (
          <Pressable
            key={r}
            accessibilityRole="menuitem"
            accessibilityState={{ selected: r === value }}
            onPress={() => {
              onChange(r);
              onClose();
            }}
            className="flex-row items-center justify-between px-4 py-3.5 active:bg-paper/10"
          >
            <Text className={cn('text-body', r === value ? 'text-paper' : 'text-paper/60')}>
              {RANGE_LABELS[r]}
            </Text>
            {r === value ? <Icon name="check" size={16} /> : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
