# Dreamify

A React Native app built with **Expo** (SDK 57), **Expo Router** and **NativeWind** (Tailwind CSS for React Native).

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
│   ├── _layout.tsx         # Root layout      (Next.js: app/layout.tsx)
│   ├── +not-found.tsx      # 404 screen       (Next.js: app/not-found.tsx)
│   └── (tabs)/             # Route group — no URL segment
│       ├── _layout.tsx     # Tab bar layout for the group
│       ├── index.tsx       # "/"          (Next.js: page.tsx)
│       └── settings.tsx    # "/settings"
├── components/
│   ├── ui/                 # Reusable primitives (Button, …)
│   └── layout/             # Page wrappers (Screen, …)
├── constants/              # Static values (colors for non-className APIs)
├── hooks/                  # Custom hooks
├── lib/                    # Helpers (cn() class merger, …)
├── types/                  # Shared TypeScript types
└── global.css              # Tailwind directives
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

Use Tailwind classes through `className` on React Native components. Brand colors are defined in `tailwind.config.js`. `dark:` variants follow the system color scheme. Use `cn()` from `@/lib/utils` to merge conditional classes.

## AI usage

AI sessions are logged in [`ai-logs/`](./ai-logs), as the assignment requires.
