// Raw design tokens for APIs that don't accept `className` (gradients, SVG, navigator options).
// Keep in sync with `theme.extend` in tailwind.config.js — see docs/SCREENS.md §2.
export const colors = {
  night600: '#262B3D',
  night700: '#1A1E2C',
  night800: '#0E1018',
  night900: '#07080C',
  ink: '#0B0B0F',
  paper: '#FFFFFF',
  mist: '#C9CEF6',
} as const;

export const gradients = {
  night: [colors.night700, colors.night800, colors.night900] as const,
  mist: [colors.mist, colors.paper] as const,
};
