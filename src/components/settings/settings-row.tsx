import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/constants/icons';
import { cn } from '@/lib/utils';

type SettingsRowProps = {
  icon: IconName;
  label: string;
  /** Small grey text under the label. */
  detail?: string;
  /** Replaces the chevron (e.g. a Switch). */
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  last?: boolean;
};

// One settings row (R25): ink icon · display-font label · chevron.
export function SettingsRow({
  icon,
  label,
  detail,
  right,
  onPress,
  destructive,
  last,
}: SettingsRowProps) {
  const color = destructive ? '#B3261E' : '#0B0B0F';
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      disabled={!onPress}
      onPress={onPress}
      className={cn(
        'min-h-16 flex-row items-center gap-4 px-5 py-3 active:bg-ink/5',
        !last && 'border-b border-ink/10',
      )}
    >
      <Icon name={icon} size={22} color={color} />
      <View className="flex-1 gap-0.5">
        <Text className="font-display text-[19px] leading-[24px]" style={{ color }}>
          {label}
        </Text>
        {detail ? <Text className="text-meta text-ink/45">{detail}</Text> : null}
      </View>
      {right ??
        (onPress ? <Icon name="chevron-right" size={18} color="rgba(11,11,15,0.35)" /> : null)}
    </Pressable>
  );
}

// White rounded group of rows.
export function SettingsGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      {title ? <Text className="px-1 text-label font-medium text-ink/50">{title}</Text> : null}
      <View className="overflow-hidden rounded-card border border-ink/10 bg-paper/70">
        {children}
      </View>
    </View>
  );
}
