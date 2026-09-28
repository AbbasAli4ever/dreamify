import { Text, type TextProps } from 'react-native';

import { cn } from '@/lib/utils';

type HighlightTextProps = Omit<TextProps, 'children'> & {
  text: string;
  query: string;
  className?: string;
};

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Dims the text and brightens words that match the search (R22).
export function HighlightText({ text, query, className, ...props }: HighlightTextProps) {
  const terms = query.trim().split(/\s+/).filter(Boolean).map(escape);
  const parts = terms.length ? text.split(new RegExp(`(${terms.join('|')})`, 'gi')) : [text];

  return (
    <Text className={cn('text-body text-paper/55', className)} {...props}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} className="font-display-semibold text-paper">
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}
