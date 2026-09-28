import { createElement } from 'react';
import { View } from 'react-native';

import { getSymbolIcon } from '@/constants/symbols';
import { cn } from '@/lib/utils';

type SymbolIconProps = {
  symbol: string;
  /** Outer diameter of the ring. The glyph scales with it. */
  size?: number;
  color?: string;
  ring?: boolean;
  className?: string;
};

// Line-art symbol inside a hairline circle (R04, R17).
export function SymbolIcon({
  symbol,
  size = 44,
  color = '#FFFFFF',
  ring = true,
  className,
}: SymbolIconProps) {
  const glyph = Math.round(size * 0.72);

  return (
    <View
      className={cn('items-center justify-center rounded-full', ring && 'border', className)}
      style={{ width: size, height: size, borderColor: ring ? `${color}CC` : undefined }}
    >
      {createElement(getSymbolIcon(symbol), { width: glyph, height: glyph, stroke: color })}
    </View>
  );
}
