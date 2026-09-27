# Session 01 — Project setup

- **Date:** 2026-09-27
- **Tool:** Claude Code (VS Code extension), model Claude Opus 5.5
- **Goal:** Scaffold the Expo app with NativeWind and a Next.js-style folder structure.

> This log was written during the session as a record of the prompt and the steps taken. The full raw transcript is exported with `/export` and appended below.

---

## Prompt 1 (user)

> create the react native app using expo and also we have to use the nativewind... and also use the approach like setting up the folder structure and layout as we have in Next.js and we are creating this app as an assignment so they have the instruction like:
>
> Log your AI sessions (your prompts and the AI's responses) as .md files in an ai-logs/ folder in the repo. Most tools can export a session, for example /export in Claude Code.
>
> So use that thing from the start of the project so start your work.

## Response 1 (AI): summary of the work

1. **Scaffolded the app** with `npx create-expo-app@latest . --template default`, which gave Expo SDK 57, React Native 0.86, React 19.2, TypeScript and Expo Router. The template already puts routes in `src/app/`.
2. **Checked the current docs before installing NativeWind.** The generated `AGENTS.md` says not to rely on memory for Expo APIs. The NativeWind docs list **v4.2.7 + Tailwind CSS v3.4** as the stable Expo setup and note that Expo 57 needs `react-native-worklets` with Reanimated 4, which the template already includes.
3. **Installed:** `nativewind@4.2.7`, `tailwindcss@^3.4.17`, `prettier-plugin-tailwindcss`, `babel-preset-expo`, `clsx`, `tailwind-merge@^2` (v2 matches Tailwind v3; v3 targets Tailwind v4), `@expo/vector-icons`, `eslint` and `eslint-config-expo`.
4. **Added NativeWind config:** `babel.config.js` (`jsxImportSource: 'nativewind'` + `nativewind/babel`), `metro.config.js` (`withNativeWind`, input `./src/global.css`), `tailwind.config.js` (content `./src/**/*`, nativewind preset, brand colors), `src/global.css` (Tailwind directives), `nativewind-env.d.ts` (NativeWind types plus a `*.css` module declaration that TypeScript 6 needs).
5. **Removed the template's demo screens and components** and replaced them with a Next.js-style layout:
   - `src/app/_layout.tsx`: root layout (≈ Next.js `app/layout.tsx`), imports global CSS and sets up the theme provider and Stack.
   - `src/app/(tabs)/`: a route group (same idea as in Next.js) with its own `_layout.tsx` (tab bar), `index.tsx` (Home) and `settings.tsx`.
   - `src/app/+not-found.tsx`: the equivalent of Next.js `not-found.tsx`.
   - `src/components/ui/` for primitives (`Button`), `src/components/layout/` for page wrappers (`Screen`), `src/lib/utils.ts` for the `cn()` helper, and `src/constants`, `src/hooks`, `src/types`.
6. **Verified:**
   - `npx tsc --noEmit` passes.
   - `npx expo lint` reports no errors or warnings.
   - `npx expo export --platform ios` bundles successfully, and the compiled Tailwind classes are present in the bundle.
   - `npx expo-doctor` passes 21/21 checks.
7. **Set up this `ai-logs/` folder** and noted the logging convention in `AGENTS.md` so later sessions follow it.

## Prompt 2 (user)

> so the command to start the expo app is npx expo start??? right???

## Response 2 (AI)

Yes. `npx expo start` starts the Metro dev server. `npm start` does the same thing, because the `start` script in `package.json` runs `expo start`. When it's running, press `i` for the iOS simulator, `a` for the Android emulator or `w` for web, or scan the QR code with Expo Go. If styles look stale after a config change, use `npx expo start -c` to clear the cache.

---

## Full transcript (`/export`)

<!-- Paste the output of /export from this session below. -->
