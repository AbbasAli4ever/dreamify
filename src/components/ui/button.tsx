import { Pressable, Text, type PressableProps } from 'react-native';

import { cn } from '@/lib/utils';

type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'outline';
  className?: string;
};

export function Button({ title, variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <Pressable
      className={cn(
        'items-center rounded-xl px-5 py-3 active:opacity-80',
        variant === 'primary' && 'bg-primary',
        variant === 'outline' && 'border border-primary',
        className
      )}
      {...props}>
      <Text
        className={cn(
          'text-base font-semibold',
          variant === 'primary' ? 'text-primary-foreground' : 'text-primary'
        )}>
        {title}
      </Text>
    </Pressable>
  );
}
