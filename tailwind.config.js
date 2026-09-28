/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Design tokens — see docs/SCREENS.md §2. Keep in sync with src/constants/theme.ts.
      colors: {
        night: {
          600: '#262B3D',
          700: '#1A1E2C',
          800: '#0E1018',
          900: '#07080C',
        },
        ink: '#0B0B0F',
        paper: '#FFFFFF',
        mist: '#C9CEF6',
      },
      fontFamily: {
        // Bricolage Grotesque: one family per weight (required on native).
        'display-light': ['BricolageGrotesque_300Light'],
        display: ['BricolageGrotesque_400Regular'],
        'display-medium': ['BricolageGrotesque_500Medium'],
        'display-semibold': ['BricolageGrotesque_600SemiBold'],
        'display-bold': ['BricolageGrotesque_700Bold'],
      },
      fontSize: {
        'display-xl': ['56px', { lineHeight: '56px', letterSpacing: '-1.5px' }],
        display: ['40px', { lineHeight: '44px', letterSpacing: '-1px' }],
        title: ['28px', { lineHeight: '32px', letterSpacing: '-0.5px' }],
        lead: ['22px', { lineHeight: '28px', letterSpacing: '-0.3px' }],
        list: ['24px', { lineHeight: '32px', letterSpacing: '-0.3px' }],
        button: ['16px', { lineHeight: '20px' }],
        'body-lg': ['20px', { lineHeight: '29px' }],
        body: ['15px', { lineHeight: '22px' }],
        label: ['14px', { lineHeight: '18px' }],
        meta: ['12px', { lineHeight: '16px', letterSpacing: '0.2px' }],
      },
      borderRadius: {
        card: '28px',
        tile: '24px',
      },
    },
  },
  plugins: [],
};
