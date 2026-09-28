import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge our custom tokens (tailwind.config.js) so e.g. `text-display`
// is treated as a font size, not a color, and isn't dropped next to `text-paper`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-xl',
            'display',
            'title',
            'lead',
            'list',
            'button',
            'body-lg',
            'body',
            'label',
            'meta',
          ],
        },
      ],
      'font-family': [
        {
          font: ['display-light', 'display', 'display-medium', 'display-semibold', 'display-bold'],
        },
      ],
    },
  },
});

// Merge Tailwind class names, letting later classes override earlier ones.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
