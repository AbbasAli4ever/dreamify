import { Pressable, type PressableProps } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { colors } from '@/constants/theme';
import type { IconName } from '@/constants/icons';
import { cn } from '@/lib/utils';

type CircleButtonProps = PressableProps & {
  icon: IconName;
  /** ghost = hairline ring on dark, solid = white fill with ink icon, ink = hairline ring on light. */
  variant?: 'ghost' | 'solid' | 'ink';
  size?: 'sm' | 'md' | 'lg';
  accessibilityLabel: string;
  className?: string;
};

const SIZES = { sm: { box: 44, icon: 20 }, md: { box: 56, icon: 22 }, lg: { box: 72, icon: 26 } };

// Round icon button used in headers and the bottom action bar (R01, R02, R13).
export function CircleButton({
  icon,
  variant = 'ghost',
  size = 'md',
  className,
  ...props
}: CircleButtonProps) {
  const s = SIZES[size];
  const solid = variant === 'solid';
  const ink = variant === 'ink';

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      className={cn(
        'items-center justify-center rounded-full active:opacity-70',
        solid && 'bg-paper',
        ink && 'border border-ink/15 bg-paper/50',
        !solid && !ink && 'border border-paper/15 bg-night-900/40',
        className,
      )}
      style={{ width: s.box, height: s.box }}
      {...props}
    >
      <Icon name={icon} size={s.icon} color={solid || ink ? colors.ink : colors.paper} />
    </Pressable>
  );
}
