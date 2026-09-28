# Backend: Supabase + Gemini + Deepgram

Dreamify's backend lives in [`supabase/`](../supabase). Without it configured, the app runs on local sample data and a mock AI (see [`src/lib/ai/mock-analyzer.ts`](../src/lib/ai/mock-analyzer.ts)), so it always works for a demo.

## How it works

```text
App (Expo)                           Supabase                                   AI
─────────                            ────────                                   ──
signInAnonymously() ───────────────▶ Auth (anonymous user, private data)
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
poll the row every 1.5 s ◀────────── processing_stage 0 → 4 drives the Processing screen
insight voice note → transcribe ───▶ Edge Function → Deepgram nova-3 → { text }
```

| AI requirement | Where |
| --- | --- |
| **Text** | Gemini analysis: title, emotions, symbols, themes, interpretation, reflection question |
| **Images** | Gemini image model: the dream artwork |
| **Audio** | Deepgram: speech-to-text for dreams and voice insights; text-to-speech for the "Listen" button on the question |

Files:
- [`supabase/migrations/…_init_dreams.sql`](../supabase/migrations): the `dreams` table, row-level security, private `dream-audio` and `dream-art` buckets.
- [`supabase/functions/process-dream`](../supabase/functions/process-dream/index.ts), [`transcribe`](../supabase/functions/transcribe/index.ts), shared [`gemini.ts`](../supabase/functions/_shared/gemini.ts) / [`deepgram.ts`](../supabase/functions/_shared/deepgram.ts).
- App side: [`src/lib/backend/`](../src/lib/backend) (client, data access) and [`src/providers/dreams-provider.tsx`](../src/providers/dreams-provider.tsx).

**API keys never reach the app.** Gemini and Deepgram keys are Supabase secrets used only inside Edge Functions. The app only has the Supabase URL and the *publishable* key, which is safe to ship because RLS protects the data.

## Setup (about 10 minutes)

1. **Create the project:** [supabase.com/dashboard](https://supabase.com/dashboard) → New project (the free plan is fine). Note the **project ref** (in the URL), the **Project URL** and the **publishable key** (Project Settings → API Keys).
2. **Allow anonymous sign-ins:** Authentication → Sign In / Providers → **Anonymous sign-ins: on**.
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
   npx supabase functions deploy process-dream transcribe
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

**Still unverified:** the real Gemini and Deepgram APIs (they need your keys) and the hosted Supabase project.

## Troubleshooting

- **A dream shows "We couldn't finish this one":** in development builds the Processing screen shows the backend error underneath. Also check `npx supabase functions logs process-dream` or the dashboard → Edge Functions → Logs.
- **Artwork or "Listen" is missing but the dream is ready:** image or TTS failed. This isn't fatal; the reason is stored in `dreams.error`.
- **"Couldn't reach your dream world" on Home:** the URL or key in `.env` is wrong, or anonymous sign-ins are off.
- **Keys:** never commit `.env` or `supabase/functions/.env`. Both are git-ignored. Remove keys from AI logs before pushing.
