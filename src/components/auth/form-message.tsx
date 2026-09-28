import { Text } from 'react-native';

import { cn } from '@/lib/utils';

// Inline error (soft red) or notice under a form. Announced to screen readers.
export function FormMessage({ children, tone = 'error' }: { children?: string | null; tone?: 'error' | 'info' }) {
  if (!children) return null;
  return (
    <Text
      accessibilityLiveRegion="polite"
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      className={cn('px-1 text-body leading-[21px]', tone === 'error' ? 'text-[#F2A7A7]' : 'text-paper/70')}
    >
      {children}
    </Text>
  );
}
