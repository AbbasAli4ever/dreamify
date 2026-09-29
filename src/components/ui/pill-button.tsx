import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';

import { Frost } from '@/components/ui/frost';
import { cn } from '@/lib/utils';

type PillButtonProps = PressableProps & {
  label: string;
  icon?: ReactNode;
  variant?: 'solid' | 'ghost';
  /** Shows a spinner and ignores presses. */
  busy?: boolean;
  className?: string;
};

// Solid = white pill with ink text (primary action). Ghost = translucent dark pill (R06, R13).
export function PillButton({
  label,
  icon,
  variant = 'solid',
  busy,
  className,
  disabled,
  ...props
}: PillButtonProps) {
  const solid = variant === 'solid';
  const inactive = disabled || busy;

  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        'h-14 flex-row items-center justify-center gap-2 rounded-full px-7 active:opacity-80',
        solid ? 'bg-paper' : 'overflow-hidden border border-paper/15',
        disabled && !busy && 'opacity-50',
        className,
      )}
      disabled={inactive}
      accessibilityState={{ disabled: !!disabled, busy: !!busy }}
      {...props}
    >
      {solid ? null : <Frost />}
      {busy ? (
        <ActivityIndicator color={solid ? '#0B0B0F' : '#FFFFFF'} />
      ) : (
        <>
          {icon ? <View>{icon}</View> : null}
          <Text
            className={cn('font-display-medium text-button', solid ? 'text-ink' : 'text-paper')}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
