import { Text, type TextProps } from 'react-native';

import { cn } from '@/lib/utils';

type RichTextProps = Omit<TextProps, 'children'> & {
  /** Text where `*marked*` words are emphasized, e.g. "What do you *remember*?" */
  children: string;
  className?: string;
};

// Emphasis rule (docs/SCREENS.md §2.2): Bricolage has no italic, so base words are
// Light at 70% white and `*marked*` words are SemiBold at full white.
export function RichText({ children, className, ...props }: RichTextProps) {
  const parts = children.split(/(\*[^*]+\*)/g).filter(Boolean);

  return (
    <Text className={cn('font-display-light text-display text-paper/70', className)} {...props}>
      {parts.map((part, i) =>
        part.startsWith('*') && part.endsWith('*') ? (
          <Text key={i} className="font-display-semibold text-paper">
            {part.slice(1, -1)}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}
