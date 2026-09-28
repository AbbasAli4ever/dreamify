import { Text, type TextProps } from 'react-native';

import { cn } from '@/lib/utils';

// Type scale from docs/SCREENS.md §2.2.
// Bricolage Grotesque for headings and important text; System UI (no fontFamily) for paragraphs.
type Props = TextProps & { className?: string };

function make(base: string) {
  function Typography({ className, ...props }: Props) {
    return <Text className={cn(base, className)} {...props} />;
  }
  return Typography;
}

export const DisplayXL = make('font-display-semibold text-display-xl text-paper');
export const Display = make('font-display-semibold text-display text-paper');
export const Title = make('font-display-semibold text-title text-paper');
export const Lead = make('font-display text-lead text-paper');
export const ListItem = make('font-display text-list text-paper');
export const BodyLarge = make('text-body-lg text-paper');
export const Body = make('text-body text-paper/70');
export const Label = make('text-label font-medium text-paper/60');
export const Meta = make('text-meta text-paper/60');
