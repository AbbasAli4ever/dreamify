# Backend: Supabase + Gemini + Deepgram

Dreamify's backend lives in [`supabase/`](../supabase). Without it configured, the app runs on local sample data and a mock AI (see [`src/lib/ai/mock-analyzer.ts`](../src/lib/ai/mock-analyzer.ts)), so it always works for a demo.

## How it works

```text
App (Expo)                           Supabase                                   AI
─────────                            ────────                                   ──
sign up / sign in ─────────────────▶ Auth: email + password, or Google (OAuth, PKCE) → JWT session
record → upload .m4a ──────────────▶ Storage  dream-audio/<user>/<dream>.m4a
insert dreams row (processing) ────▶ Postgres public.dreams  (RLS: own rows only)
invoke process-dream ──────────────▶ Edge Function (replies 202, keeps working):
                                       1. download audio ──────────────────────▶ Deepgram nova-3 (STT)
                                       2. transcript + earlier symbols ────────▶ Gemini (JSON analysis)
                                          → title, emotions, symbols (30-key icon vocabulary),
                                            themes, interpretation, question, art prompt, colour
                                       3. in parallel:
                                          art prompt + house style ────────────▶ Gemini image model (4:5)
                                          question ────────────────────────────▶ Deepgram Aura-2 (TTS)
                                       4. upload art + question audio, status = ready
                                       (voice dreams, right after STT, alongside step 2:)
                                       transcript ─────────────────────────────▶ Gemini lite (3-sentence reply)
                                       → dreams.reply_text
poll the row (0.7 s, then 1.5 s) ◀── processing_stage 0 → 4, reply_text
reply parts ⇄ speak (Edge Function) ─▶ Deepgram Aura-2, one call per sentence, in parallel
insight voice note → transcribe ───▶ Edge Function → Deepgram nova-3 → { text }
```

| AI requirement | Where |
| --- | --- |
| **Text** | Gemini analysis: title, emotions, symbols, themes, interpretation, reflection question |
| **Images** | Gemini image model: the dream artwork |
| **Audio** | Deepgram: speech-to-text for dreams and voice insights; text-to-speech for the agent's spoken reply on Home and the "Listen" button on the question |

Files:
- [`supabase/migrations/…_init_dreams.sql`](../supabase/migrations): the `dreams` table, row-level security, private `dream-audio` and `dream-art` buckets.
- [`supabase/functions/process-dream`](../supabase/functions/process-dream/index.ts), [`transcribe`](../supabase/functions/transcribe/index.ts), [`speak`](../supabase/functions/speak/index.ts) (voices one part of the reply; RLS-checked, 401 without a JWT, 404 for someone else's dream), shared [`reply.ts`](../supabase/functions/_shared/reply.ts) (sentence split, mirrored in `src/lib/reply.ts`), [`gemini.ts`](../supabase/functions/_shared/gemini.ts) / [`deepgram.ts`](../supabase/functions/_shared/deepgram.ts).
- App side: [`src/lib/backend/`](../src/lib/backend) (client, data access) and [`src/providers/dreams-provider.tsx`](../src/providers/dreams-provider.tsx).

## Accounts (Supabase Auth)

Every user has a real account. Supabase Auth issues a **JWT** (access token, 1 h, refreshed automatically) that the app sends with every request, so Postgres RLS, Storage policies and the Edge Functions (`withSupabase({ auth: 'user' })`) all act as that user. Nobody sees anyone else's dreams.

| Flow | How |
| --- | --- |
| **Email + password** | `signUp` (name saved as `user_metadata.display_name`) / `signInWithPassword`. With "Confirm email" on, sign-up shows "Check your inbox"; the link opens `/auth/callback` in the app. |
| **Google** | `signInWithOAuth({ provider: 'google', skipBrowserRedirect })` → `expo-web-browser` `openAuthSessionAsync` → Google → Supabase → `dreamifyapp://auth/callback?code=…` → `exchangeCodeForSession` (PKCE). Works in Expo Go on iOS (the auth session catches the scheme itself); no native Google SDK. On web the page redirects to `/auth/callback` instead. |
| **Forgot password** | `resetPasswordForEmail` → email link → `/auth/callback?next=reset-password` → `/reset-password` → `updateUser({ password })`. Settings → Change password uses the same screen. |
| **Onboarding** | Shown once per **account** (`user_metadata.onboarded`), so it follows the user to a new phone. |
| **Sign out** | `signOut({ scope: 'local' })`: this device only. Dreams stay in the account. |

On iOS/Android, Hermes has no WebCrypto, so [`crypto-polyfill.ts`](../src/lib/backend/crypto-polyfill.ts) supplies `getRandomValues` and SHA-256 from `expo-crypto`; without it Supabase would fall back to a `Math.random` verifier and the weaker `plain` PKCE method.

Routing ([`src/app/_layout.tsx`](../src/app/_layout.tsx)) uses Expo Router's `Stack.Protected`: signed out → `/welcome`, `/sign-in`, `/sign-up`, `/forgot-password`; signed in, not onboarded → `/onboarding`; otherwise the app. Code: [`src/lib/backend/auth.ts`](../src/lib/backend/auth.ts), [`src/providers/auth-provider.tsx`](../src/providers/auth-provider.tsx). The redirect URL is `Linking.createURL('/auth/callback')`: `exp://<ip>:8081/--/auth/callback` in Expo Go, `dreamifyapp://auth/callback` in a build.

**API keys never reach the app.** Gemini and Deepgram keys are Supabase secrets used only inside Edge Functions. The app only has the Supabase URL and the *publishable* key, which is safe to ship because RLS protects the data.

## Setup (about 10 minutes)

1. **Create the project:** [supabase.com/dashboard](https://supabase.com/dashboard) → New project (the free plan is fine). Note the **project ref** (in the URL), the **Project URL** and the **publishable key** (Project Settings → API Keys).
2. **Set up sign-in** (Authentication in the dashboard):
   - **Sign In / Providers → Email:** on. **Confirm email:** off for a quick demo. Supabase's built-in mailer only delivers to your team's addresses (2 emails/hour), so leave it on only if you set up custom SMTP (Authentication → Emails → SMTP, e.g. Resend).
   - **Anonymous sign-ins:** off (the app no longer uses them).
   - **URL Configuration → Redirect URLs:** add `exp://**`, `dreamifyapp://**` and `http://localhost:8081/**`. Set the Site URL to `dreamifyapp://`.
   - **Google:** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Create credentials → OAuth client ID → **Web application**, with the authorized redirect URI `https://<ref>.supabase.co/auth/v1/callback` (configure the OAuth consent screen first if asked). Paste the **Client ID** and **Client secret** into Sign In / Providers → **Google** and enable it.
3. **Get the AI keys:**
   - Gemini: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - Deepgram: [console.deepgram.com](https://console.deepgram.com) → API Keys
4. **Put the keys in the secrets file:**
   ```bash
   cp supabase/functions/.env.example supabase/functions/.env   # git-ignored
   # fill in GEMINI_API_KEY and DEEPGRAM_API_KEY
   ```
5. **Link the project, create the database, set secrets and deploy the functions:**
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   npx supabase secrets set --env-file supabase/functions/.env
   npx supabase functions deploy process-dream transcribe speak
   ```
6. **Connect the app:**
   ```bash
   cp .env.example .env    # git-ignored
   # EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   # EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   npx expo start -c
   ```
   Optional: `EXPO_PUBLIC_SHOW_SAMPLE_DREAMS=1` also shows the 8 sample dreams (read-only), so Dream Echo has history on a fresh account.

## Models

Defaults come from the current docs (checked 2026-09-28) and can be changed without code changes:

| Secret | Default |
| --- | --- |
| `GEMINI_TEXT_MODEL` | `gemini-3.8-flash` |
| `GEMINI_IMAGE_MODEL` | `gemini-3.1-flash-image` |
| `DEEPGRAM_STT_MODEL` | `nova-3` |
| `DEEPGRAM_TTS_VOICE` | `aura-2-athena-en` (calm, smooth) |

Gemini is called through the `generateContent` REST API (documented as legacy but fully supported). Analysis uses `responseJsonSchema`, so the reply is validated JSON. Symbols are restricted to the 30 icon keys.

## Local development

Needs Docker Desktop running.

```bash
npx supabase start -x vector,logflare,imgproxy,supavisor   # applies the migration
npx supabase functions serve --env-file supabase/functions/.env
# App → local backend: put the printed API_URL and PUBLISHABLE_KEY in .env, then
npx expo start -c        # -c matters: EXPO_PUBLIC_* values are baked in at bundle time
npx supabase stop         # when done (data is kept)
```

`GEMINI_API_BASE` / `DEEPGRAM_API_BASE` can point the functions at a fake AI server for tests (they default to the real APIs).

### Verified locally (2026-09-28)

Tested against the full local stack (Postgres 17, Auth, Storage, Edge Runtime 1.76) with a fake Gemini/Deepgram server that returns responses in the documented shapes and records every request:
- **Without keys, 9/9 checks passed:** anonymous sign-in; RLS (another user can't read, update or insert as you); `process-dream` returns 401 without a token and 404 for someone else's dream; 202 accepted; a missing key ends as `failed` with "GEMINI_API_KEY is not set".
- **Full pipeline, 28/28 checks passed:** text and voice dreams reach `ready`; stages are reported in order; Gemini fields are saved; invalid symbol keys are dropped; artwork and question audio are stored in the user's folder and served through signed URLs; storage RLS blocks other users; `transcribe` works and is private; reflections save; deletes work. Outgoing requests were checked: Gemini model ids, API key header, JSON schema and system prompt, image modality with 4:5; Deepgram nova-3 with smart_format and Token auth, Aura-2 voice with mp3, and `*` markers stripped before TTS.
- **App UI against the local backend (Chrome):** empty Home for a new anonymous user → write a dream → live stages → Reveal with the stored artwork and the **Listen** button → insight → Archive still shows the dream after a full reload. Screenshot: [`screens/backend-e2e-local.jpg`](./screens/backend-e2e-local.jpg).

### Accounts verified locally (2026-09-28)

- **Auth API, 30/30 checks:** anonymous sign-in refused; sign-up returns a JWT (`role: authenticated`, `sub` = user id) and saves `display_name`; short password (< 8) and duplicate email rejected; wrong password → "Invalid login credentials"; `onboarded` persists across sign-ins; RLS: user B and signed-out requests see none of A's dreams; `process-dream` accepts A's JWT, returns 401 without one and 404 for B; **password reset via the Mailpit email**: the link redirects to `exp://…/auth/callback?code=…&next=reset-password`, the code exchanges once (single use), the new password works and the old one doesn't; a non-allow-listed `redirectTo` is ignored; Google OAuth URL carries a PKCE `code_challenge`.
- **App in Chrome:** signed out `/` and `/home` → Welcome; sign up → Onboarding → Home ("Good afternoon, Abbas"); reload keeps the session; Settings shows the account + Change password; sign out → Welcome; wrong password message; returning user → Home with no onboarding; `/sign-in` while signed in → Home; Forgot password → "Check your inbox"; Google button → Supabase `/authorize?provider=google`. No console errors.
- **iOS simulator (Expo Go):** Welcome renders natively; sign-up → onboarding → Home with the account's name and initials avatar; sign out → Welcome; **reset email link opened with `simctl openurl` → `/auth/callback` exchanged the code → "Set a new password"**, and Supabase recorded the challenge as `s256` (after adding the crypto polyfill).
- Screenshots: [`auth-welcome`](./screens/auth-welcome.jpg), [`auth-sign-up`](./screens/auth-sign-up.jpg), [`auth-sign-in-error`](./screens/auth-sign-in-error.jpg), [`auth-forgot-sent`](./screens/auth-forgot-sent.jpg), iOS [`home after sign-up`](./screens/auth-ios-home-after-signup.jpg), iOS [`reset from email link`](./screens/auth-ios-reset-from-email-link.jpg).
- **Not verified yet:** Google end to end (needs the Google OAuth client in the dashboard) and the hosted confirmation email.

### Spoken reply: design and timing (hosted, real AI, 2026-09-28)

Goal: the orb answers soon after ✓. What was measured and changed:

| Version | Reply text after transcript | Voice starts after text | Notes |
| --- | --- | --- | --- |
| 1. `gemini-3.8-flash`, whole MP3 stored in Storage | ~9 s | ~7 s (TTS + upload + poll + download) | too slow |
| 2. Text only, `speak` streams Deepgram through | 5–6 s | 1.7 s | stream sometimes cut mid-sentence / reset: dropped |
| 3. `gemini-3.1-flash-lite` (minimal thinking), `speak` returns the whole MP3 | 1.5 s | 4.6–5.8 s | long first sentence dominates TTS time |
| **4. Short first sentence, 3 parts voiced in parallel** | **1.3–2 s** | **2.6–2.8 s (warm), no gaps** | current |

`GEMINI_REPLY_MODEL` / `GEMINI_REPLY_THINKING` override the reply model (it falls back to `GEMINI_TEXT_MODEL` if the lite model fails). The app downloads each part to a local file before playing, because iOS only reports audio samples (the orb's level) for local files.

### Verified on the hosted project with real AI (2026-09-28)

Project `zrzjfegznzmtdputfpjr`: migration pushed, `GEMINI_API_KEY` + `DEEPGRAM_API_KEY` set as secrets, `process-dream` + `transcribe` deployed. **All hosted checks passed:**
- Anonymous sign-in, RLS (another user can't read your dream or process it: 404).
- **Typed dream → ready in ~21 s** (stages at 7 s / 8 s / 9 s / 21 s). Gemini returned: *"The Glowing Door on the Water"*; Unease, Curiosity; symbols train, water, door (valid keys with natural labels such as "Black lake"); themes Transition, Hesitation; a grounded interpretation; and the question *"Were you waiting for the train to halt out of careful \*patience\*, or was it a quiet hesitation to leap into the \*unknown\*?"*. **Artwork:** a 4:5 928×1152 JPEG (~600 KB) in the house style. **Question audio:** Deepgram Aura-2 MP3, ~6 s.
- **Voice dream (a spoken .m4a) → ready in ~31 s:** Deepgram nova-3 transcribed it word for word ("…my grandmother's house… snowing indoors… a white owl sat on the piano…"), then Gemini titled it *"Snow Falling on the Piano Keys"* with symbols house, door, snow, bird.
- `transcribe` returned the same text for an insight voice note.
- Generated artworks: [`screens/backend-real-ai-artwork.jpg`](./screens/backend-real-ai-artwork.jpg).

Timing: the analysis takes ~7 s; the artwork is the slowest step (~12–20 s), in parallel with TTS.

## Troubleshooting

- **A dream shows "We couldn't finish this one":** in development builds the Processing screen shows the backend error underneath. Also check `npx supabase functions logs process-dream` or the dashboard → Edge Functions → Logs.
- **Artwork or "Listen" is missing but the dream is ready:** image or TTS failed. This isn't fatal; the reason is stored in `dreams.error`.
- **"Couldn't reach your dream world" on Home:** the URL or key in `.env` is wrong.
- **Google sheet keeps loading after picking an account:** Supabase rejected the redirect and fell back to the Site URL. Supabase refuses redirect URLs whose host is a LAN IP (`exp://192.168.x.x:8081/…`) even when `exp://**` is allow-listed, so Google returns to `dreamifyapp://auth/callback` instead (fixed 2026-09-28). The same limit affects **email links in Expo Go** on a real phone: they only return to the app from a simulator started with `npx expo start --localhost`, or in a development build.
- **Android + Expo Go + Google:** Chrome can't open `dreamifyapp://` because Expo Go doesn't register the scheme. Use iOS, or a development build (`npx expo run:android`).
- **Google: "Google sign-in is not set up"**: the Google provider is off in the dashboard. **Google returns to a browser page instead of the app:** the redirect URL isn't allow-listed (add `exp://**`).
- **"This project can't send email to that address"** or no email arrives: the built-in mailer only sends to team members. Turn off Confirm email or add SMTP.
- **Email link opens but says "That link didn't work"**: links are single-use and must be opened on the phone that asked for them (PKCE). The email is still confirmed, so sign in normally.
- **Keys:** never commit `.env` or `supabase/functions/.env`. Both are git-ignored. Remove keys from AI logs before pushing.
