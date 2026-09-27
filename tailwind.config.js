/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6D5DFC',
          foreground: '#FFFFFF',
        },
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#0B0B12',
        },
        muted: {
          DEFAULT: '#6B7280',
          dark: '#9CA3AF',
        },
      },
    },
  },
  plugins: [],
};
