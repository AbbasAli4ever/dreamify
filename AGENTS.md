This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Project conventions

- **Styling:** NativeWind v4 (Tailwind v3). Style with `className`, not `StyleSheet`. Merge classes with `cn()` from `@/lib/utils`. Design tokens live in `tailwind.config.js` (mirrored in `src/constants/theme.ts`). When adding a custom font-size or font-family token, also register it in the `extendTailwindMerge` config in `src/lib/utils.ts`, or `cn()` will drop it.
- **Reanimated views:** `className` is not applied to Reanimated `Animated.View`s. Put animated styles on the `Animated.View` via `style` and layout classes on an inner `View`.
- **Worklet callbacks:** never navigate or schedule timers from a Reanimated animation callback (`withTiming(..., cb)`). It runs on the UI thread, where globals like `setTimeout` belong to the UI runtime; passing them to `scheduleOnRN` throws, and an error on the UI thread aborts the app on native (web won't show it, since everything runs on one thread there). Schedule follow-ups with a plain JS `setTimeout` instead.
- **Skia animation:** pass per-frame `SkPicture`s to `<Picture>` through a shared value, not React state, so the component doesn't re-render every frame.
- **Verify native behaviour on the iOS simulator** (Expo Go), not only the web export.
- **Design spec:** build screens from `docs/SCREENS.md` and tick its checklists when done.
- **Structure:** Next.js-style. Only routes go in `src/app/`; shared UI goes in `src/components/{ui,layout}`, helpers in `src/lib`.
- **AI logs (assignment requirement):** every AI session must be saved as a Markdown file in `ai-logs/` (`YYYY-MM-DD-NN-topic.md`) and listed in `ai-logs/README.md`. Remind the user to run `/export` at the end of each session.
- **Backend:** Supabase + Gemini + Deepgram, documented in `docs/BACKEND.md`. Screens only use `useDreams()`; Supabase calls live in `src/lib/backend/`. Edge Functions in `supabase/functions` are Deno: check them with `npx deno check` / `npx deno lint` (they're excluded from the app's tsc and ESLint). AI keys are Supabase secrets only; never put them in `EXPO_PUBLIC_*` vars, code or logs.
