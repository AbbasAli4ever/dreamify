import { createElement } from 'react';

import { UI_ICONS, type IconName } from '@/constants/icons';

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

// Thin line UI icon from assets/icons/ui/.
export function Icon({ name, size = 24, color = '#FFFFFF', strokeWidth }: IconProps) {
  return createElement(UI_ICONS[name], {
    width: size,
    height: size,
    stroke: color,
    ...(strokeWidth ? { strokeWidth } : null),
  });
}
