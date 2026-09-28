# Dreamify

A voice-first AI dream journal. See [`docs/PRODUCT.md`](./docs/PRODUCT.md) and the screen spec in [`docs/SCREENS.md`](./docs/SCREENS.md).

Built with **Expo** (SDK 57), **Expo Router** and **NativeWind** (Tailwind CSS for React Native).

## Getting started

```bash
npm install
npm start        # then press i (iOS), a (Android) or w (web)
```

Other scripts: `npm run lint`, `npm run typecheck`.

## Folder structure (Next.js-style)

Routing is file-based, the same way the Next.js App Router works:

```
src/
├── app/                    # Routes only — every file is a screen
│   ├── _layout.tsx         # Root layout: fonts, providers, Stack  (Next.js: app/layout.tsx)
│   ├── index.tsx           # Entry: redirects to onboarding or home
│   ├── onboarding.tsx      # "/onboarding"  (S1)
│   ├── home.tsx            # "/home"        (S2)
│   ├── write.tsx           # "/write"       (S3)
│   ├── processing/[id].tsx # "/processing/:id" (S4)
│   ├── dream/[id].tsx      # "/dream/:id"   (S5)  (Next.js: dream/[id]/page.tsx)
│   ├── echo/[symbol].tsx   # "/echo/:symbol" (S6)
│   ├── archive.tsx         # "/archive"     (S7)
│   ├── search.tsx          # "/search"      (S8, modal sheet)
│   ├── patterns.tsx        # "/patterns"    (S9, light Mist theme)
│   ├── settings.tsx        # "/settings"    (S10, light Mist theme)
│   └── +not-found.tsx      # 404 screen  (Next.js: app/not-found.tsx)
├── components/
│   ├── ui/                 # Primitives: typography, RichText, Icon, CircleButton, PillButton, SegmentedControl, SymbolIcon, CountBadge, Avatar, Glow, Floating
│   ├── layout/             # Screen, ScreenHeader, NightBackground, MistBackground, BottomActionBar, Section/LabeledList/StarDivider, ComingSoon
│   ├── dream/              # Dream pieces: DreamHero, EchoCard, EchoConstellation, DreamArtTile, DreamCard, DreamRow, SymbolTile, InsightCard, InsightSheet, AudioPlayButton
│   ├── write/              # Write-only pieces: StarterChips
│   ├── processing/         # Processing-only pieces: StageRow
│   ├── archive/            # Archive-only pieces: DreamWorldMap, RangeMenu
│   ├── search/             # Search-only pieces: SearchField, SymbolChip
│   ├── patterns/           # Patterns-only pieces: StatCell, RhythmChart
│   ├── settings/           # Settings-only pieces: SettingsGroup, SettingsRow
│   ├── orb/                # DreamOrb: animated dotted orb (Skia on native, canvas on web)
│   ├── home/               # Home-only pieces: RecordOrb
│   └── onboarding/         # Onboarding-only pieces
├── constants/              # Design tokens (theme.ts), icon registries (icons.ts, symbols.ts), symbol-meanings.ts, user.ts
├── hooks/                  # Custom hooks (useDreamRecorder)
├── lib/                    # Helpers: cn(), storage, dates, Dream Echo logic (echo.ts), search.ts, patterns.ts, reminders.ts, mock data
│   ├── ai/                 # Mock pipeline + mock analyzer (used when Supabase isn't configured)
│   └── backend/            # Supabase client + dreams API (real pipeline)
├── providers/              # React context providers (DreamsProvider, ProfileProvider)
├── types/                  # Dream types, *.svg module declaration
└── global.css              # Tailwind directives

supabase/                   # Backend (see docs/BACKEND.md)
├── migrations/             # dreams table, RLS, private storage buckets
└── functions/              # Edge Functions (Deno): process-dream, transcribe, _shared (Gemini, Deepgram)
```

| Next.js           | Expo Router        |
| ----------------- | ------------------ |
| `layout.tsx`      | `_layout.tsx`      |
| `page.tsx`        | `index.tsx`        |
| `not-found.tsx`   | `+not-found.tsx`   |
| `(group)/`        | `(group)/`         |
| `[id]/page.tsx`   | `[id].tsx`         |

Import from `src/` with the `@/` alias, for example `import { Button } from '@/components/ui/button'`.

## Styling

Use Tailwind classes through `className` on React Native components. Design tokens (colors, type scale, radii) are defined in `tailwind.config.js`, with raw values in `src/constants/theme.ts`. Headings use **Bricolage Grotesque** (`font-display-*`), paragraphs use the system font. Use `cn()` from `@/lib/utils` to merge classes. Symbol icons are SVGs in `assets/icons/symbols/`, imported as components.

## Backend

Supabase (Postgres, Storage, anonymous Auth, Edge Functions) with **Gemini** for dream analysis and artwork and **Deepgram** for speech-to-text and text-to-speech. Setup and architecture: [`docs/BACKEND.md`](./docs/BACKEND.md). Without a `.env`, the app runs on local sample data with a mock AI.

## Credits

- Orb animation: [thinking-orbs](https://github.com/Jakubantalik/thinking-orbs) by Jakub Antalik (MIT). The geometry engine comes from the `thinking-orbs` npm package; the React Native renderer in `src/components/orb/` is adapted from the repo's `thinking-orbs-native` port.

## AI usage

AI sessions are logged in [`ai-logs/`](./ai-logs), as the assignment requires.
