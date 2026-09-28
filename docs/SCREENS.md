# Dream Echo — Screen Specification

> **Status:** v1 draft, derived from the 27 reference screenshots in [`reference/`](./reference) and the product brief in [`PRODUCT.md`](./PRODUCT.md).
> **Use:** this is the blueprint for building the frontend screen by screen. Update it whenever the design or the assets change. Each screen section has a checklist we tick as we build.

Reference screenshots are cited as **R01–R27** (files `docs/reference/RNN.jpg`, in the order they were captured).

---

## 0. Contents

1. [Reference analysis](#1-reference-analysis): what the reference app is and what we take from it
2. [Design system](#2-design-system): colors, type, spacing, radii, motion, icons
3. [App map & navigation](#3-app-map--navigation): routes, flow diagram, how screens connect
4. [Data model](#4-data-model): the `Dream` object that flows through every screen
5. [Shared components](#5-shared-component-inventory): everything we build once and reuse
6. [Screens](#6-screens): the detailed spec for each screen
7. [Assets checklist](#7-assets-checklist)
8. [Build order](#8-build-order)
9. [Open questions](#9-open-questions)

---

## 1. Reference analysis

### 1.1 What each reference screenshot shows

| Ref | What it shows | Use in our app |
| --- | --- | --- |
| R01 | "Your dream". A full transcript set in large serif text on dark navy. Bottom bar: ✕ · big white circle · mic. A small archive card peeks in from the right. | **Write / review** state of Record |
| R02 | Same screen while recording: text streams in word by word (the newest words blurred), rock landscape background, bottom bar ✕ · live waveform · ✓ | **Recording** state of Record |
| R03 | Full-moon photo on near-black | Onboarding / processing visual asset |
| R04 | "Interpretation ✦": horizontal symbol cards (icon + name + `x2` count badge), interpretation paragraph, ✶ + big serif question with italic emphasis | **Dream Reveal**: symbols + interpretation + reflection question |
| R05 | Close-up of the question, then a hairline divider and a two-column "Emotions · Unease / Recognition / Sacred Fear" block | **Dream Reveal**: emotions block |
| R06–R07 | Bottom bar: ✕ · "Pull to add an insight" pill with ^ handle · ✓. Pulling up reveals a white Insight card. | **Reflection** answer (pull-up sheet) |
| R08–R09 | White Insight card: "Insight" header + feather icon, serif answer text, timestamp, mic or waveform, ✓ button. Keyboard open. | **Reflection** answer card |
| R10 | Symbol detail "Mirror": back button + "Symbol" label, huge serif title, circled icon, a subtitle, a sans paragraph, a two-column "Themes it reflects" list, segmented control **Personal / Collective / Cultural**. Faint artwork behind. | **Dream Echo / Symbol** screen |
| R11 | Symbol "Desert" on the Cultural tab: `x2` badge, a cultural reference, a large italic serif quote, and a source chip | Pattern for the Echo hero stat |
| R12 | Symbol "Wolf" on the Collective tab: psychological interpretation plus an "Associated Archetypes" card carousel | Carousel pattern, reused for related dreams |
| R13, R15, R23 | "Dream Archive" with a superscript count (32), a "This Month ⌄" filter and the avatar. Stacked white cards (date · serif excerpt · symbol icons · feather if the dream has an insight). Bottom bar: ✕ · Search pill · sort. | **Dream History** (list view) |
| R14 | Dark jellyfish illustration on navy | Onboarding / empty-state visual asset |
| R16 | Archive grid view: dark tiles, with white tiles for dreams that have an insight, bleeding off both edges | **Dream History** (gallery view) |
| R17 | Symbol constellation: circled icons sized by frequency and linked by thin lines (Wolves, Door, Water, Desert…) | **Dream World** map, our Echo visual |
| R18–R21 | Archetype detail (Seeker / Trickster / Shadow): `x4` badge, description, "Dreams with…" list, a big serif quote, and a "Seeking Heroes" carousel of film characters | ⚠️ Out of scope (dictionary-like). We borrow only the layout. |
| R22 | Search sheet with a grab handle. Symbol chips with counts and "All Symbols", archetype cards, and a search field ("Search symbols, emotions, dates…"). | **Search** sheet |
| R24 | Profile on a light lavender gradient: avatar, name, a 2×2 grid (most recurring emotion % · most recurring symbol ×N · archetype in focus · dream count this month), and a bar chart of dream frequency | **Dream Patterns** (optional) |
| R25 | Settings on the lavender gradient: serif row labels, icons, chevrons, version number at the bottom | Minimal settings (optional) |
| R26 | Home-screen widgets | ⚠️ Out of scope |
| R27 | Overview composition of the app | Overall mood reference |

### 1.2 What we keep from the reference

- **Editorial typography carries the design.** The reference uses a large condensed serif for everything important. **We translate this to Bricolage Grotesque** (see §2.2): large, tightly set, with the same hierarchy. Plain paragraphs use the system font. The reference sets key words in italic. Bricolage has no italic, so we emphasize key words through **weight and brightness contrast** instead ("what have you **feared**").
- **Dark navy night gradient** everywhere, with a second light mode (a lavender-to-white gradient) reserved for "personal / about me" surfaces.
- **White cards on dark backgrounds** mark user-authored content (dreams and insights). Translucent dark tiles hold system content (symbols, archetypes).
- **A three-slot floating bottom action bar** instead of a tab bar: ghost circle · center control · ghost or solid circle. It's used on every main screen.
- **Hairline-divided sections** in two columns: a small sans label on the left, a stacked list in the display font on the right.
- **✶ star glyph** as a section break before the "big moment" text.
- **Line-art symbol icons in circles**, with a solid white `xN` badge when a symbol recurs. This badge already *is* the Dream Echo idea. We push it much further.
- Sparse layouts, generous spacing, one idea per screen section.

### 1.3 What we change or add (our product vs. the reference)

| Area | Reference | Dream Echo (ours) |
| --- | --- | --- |
| Artwork | None. The reference is text-only. | **AI artwork is the hero.** Full-bleed image at the top of Dream Reveal. Archive tiles use artwork. |
| Dream Echo | Only a small `x2` badge | Dedicated **Echo card** on Reveal and Home, plus an **Echo / Symbol screen** listing related dreams |
| AI processing | Not shown | Dedicated **Processing** screen with staged copy and the moon visual |
| Home | Opens straight into recording | **Home** with the "What do you remember?" CTA, recent dreams and the latest Echo |
| Onboarding | Not shown | 3-slide onboarding using the moon and jellyfish assets |
| Archetypes, cultural quotes, film heroes | Major feature | **Dropped.** The brief says no dream dictionary. |
| Widgets, devices, passcode, language | Present | **Dropped** |
| Atmosphere | Flat navy | Navy plus subtle **surreal glow** (a soft blurred color bloom sampled from the dream's artwork), star specks and slow drift motion |

---

## 2. Design system

> These values are measured from the screenshots. Confirm the fonts once assets arrive (see §9).

### 2.1 Color tokens

| Token | Value | Use |
| --- | --- | --- |
| `night-900` | `#07080C` | Bottom of the background gradient, pure-dark areas |
| `night-800` | `#0E1018` | Mid background |
| `night-700` | `#1A1E2C` | Top of the background gradient (R04, R10) |
| `night-600` | `#262B3D` | Raised dark tiles (symbol cards, archive grid) = `white/6` on the gradient |
| `ink` | `#0B0B0F` | Text on white cards |
| `paper` | `#FFFFFF` | Dream and insight cards, primary action circle |
| `mist` | `#C9CEF6` | Top of the lavender gradient (R24, R25) |
| `text-primary` | `#FFFFFF` | Headings and emphasized text on dark |
| `text-secondary` | `white/60` | Sans labels ("Emotions", "Symbol", dates) |
| `text-tertiary` | `white/35` | Placeholders, version number |
| `hairline` | `white/10` (dark) · `black/8` (light) | Section dividers, ghost-button borders |
| `glow` | from the artwork's dominant color | Blurred background bloom on Reveal and Echo |

Gradients:
- **Night:** the photo `assets/images/bg.png` (starry sky + rocks at the bottom) is the background of every dark screen, with a scrim fading to `rgba(7,8,12,0.5)` at the bottom. The `night-700` → `night-900` gradient is the fallback (`NightBackground image={false}`).
- **Mist:** `mist` → `#FFFFFF`, top to bottom, used on Patterns and Settings.

### 2.2 Typography

**Fonts (decided):**
- **Display: [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque)** (Google Fonts, via `@expo-google-fonts/bricolage-grotesque`). Used for headings and **everything important**: titles, questions, dream titles, Echo messages, list values, card excerpts, buttons.
  Weights we load: **300 Light, 400 Regular, 500 Medium, 600 SemiBold, 700 Bold**. At large sizes set it tight: letter-spacing −0.5 to −1.5 and leading about 1.05×.
- **Body: System UI** (SF Pro on iOS, Roboto on Android). Used for normal paragraphs, labels, dates and meta text. In code this means *no* `fontFamily`, which is the React Native default.

| Role | Font | Weight | Size / leading | Tracking | Where |
| --- | --- | --- | --- | --- | --- |
| `display-xl` | Bricolage | 600 | 56 / 56 | −1.5 | Symbol / Echo title ("Water"), onboarding headline |
| `display` | Bricolage | 300 + **600** emphasis | 40 / 44 | −1 | "Dream Archive", reflection question, Echo statement, Home prompt |
| `title` | Bricolage | 600 | 28 / 32 | −0.5 | Dream title on Reveal, section heads ("Symbols"), Processing headline |
| `lead` | Bricolage | 400 | 22 / 28 | −0.3 | Card excerpts, Echo card message, symbol subtitle |
| `list` | Bricolage | 400 | 24 / 32 | −0.3 | Right-column lists (emotions, themes), Patterns values |
| `button` | Bricolage | 500 | 16 / 20 | 0 | Pill and text buttons |
| `body-lg` | System | 400 | 20 / 29 | 0 | Transcript, interpretation, insight answer (the dream's own words) |
| `body` | System | 400 | 15 / 22 | 0 | Explanatory paragraphs (e.g. "What it may mean") |
| `label` | System | 500 | 14 / 18 | 0 | "Your dream", "Emotions", nav titles |
| `meta` | System | 400 | 12 / 16 | 0.2 | Dates, counts, version |

**Emphasis rule** (this replaces the reference's italics): in `display` text, the base words are **Light 300 at `white/70`** and the emphasized words (`*marked*` in AI output) are **SemiBold 600 at full white**. Example: "What part of yourself have you **feared**, but may now be ready to **hear**?" The `RichText` component renders this.

### 2.3 Spacing, radii, elevation

- Screen side padding **24**. Section gap **32–40**. Hairline sections have **24** vertical padding.
- Radii: cards **28**, tiles **24**, pills and chips **999**, circle buttons are fully round (56–64 ghost, 72–96 primary).
- Stacked-card effect (R13): the last card shows 2 ghost layers under it (translate y +8/+16, scale 0.96/0.92, opacity 0.6/0.3).
- No drop shadows on dark screens. Depth comes from contrast and blur.

### 2.4 Iconography

- **Symbol icons:** 1.25px white line art inside a 1px circle (R04, R17). Sizes are 28 (on cards), 44 (on tiles), 56 (on the Echo screen) and 64–88 (Dream World nodes, scaled by frequency).
- **Count badge:** a solid white circle with ink `xN` text, overlapping the icon's top-right.
- **UI icons:** thin-line (✕, ✓, mic, search, sort, back chevron, settings). Use `@expo/vector-icons` Ionicons "outline" as a stand-in until the SVGs arrive.
- **Feather icon:** marks "has insight / reflection answered".
- **✶** four- or six-point star glyph used as a section break.

### 2.5 Motion

- Screen transitions: fade plus a slight rise (Reanimated, 250–350 ms, ease-out).
- Recording: live waveform bars, and transcript words fading in from blurred to sharp (R02).
- Processing: stage text cross-fades, and the moon slowly breathes (scale 1 → 1.04).
- Reveal: the artwork fades in from blur. Sections stagger in on scroll.
- Pull-to-add-insight: sheet drag with a spring (Gesture Handler plus Reanimated).
- Background: very slow star drift. Respect the OS reduced-motion setting.

### 2.6 The Dream Orb

The app's "AI presence" is one animated dotted orb (`DreamOrb`, built on [thinking-orbs](https://github.com/Jakubantalik/thinking-orbs), MIT). Its **state** changes with the moment, and its **level** input makes it react to voice:

| Moment | Orb state | Behaviour |
| --- | --- | --- |
| S2 Home · idle | — | Hidden. The white mic button is shown; tapping it morphs into the orb. |
| Recent tile (processing) | `working` | Small orb on a dream that is still being processed |
| S2 Home · recording | `listening` | `level` bound to mic metering: spins up to 4× faster and swells up to +14% while you speak. |
| S4 Processing: understanding the story | `working` | Particles on orbits |
| S4 Processing: finding emotions | `composing` | Undulating band |
| S4 Processing: finding symbols / echoes | `connecting` | Constellation wiring itself (ties to Dream Echo) |
| S4 Processing: painting | `weaving` | Strands plaiting |
| S5 Reflection (voice answer) | `listening` | Same as recording |

Reduced motion shows a static frame. The loop pauses when the app is backgrounded.

---

## 3. App map & navigation

### 3.1 Core flow

```text
            ┌──────────────┐
 first run  │  Onboarding  │  (3 slides)
 ─────────▶ │  S1          │ ─────────────┐
            └──────────────┘              ▼
                                   ┌──────────────┐
                    ┌──────────────│    Home      │◀──────────────────────┐
                    │  tap orb     │    S2        │  tap recent dream     │
                    │  "Write      └──────────────┘  or echo card         │
                    │   instead"      │        │                          │
                    ▼                 │        │ archive icon             │
             ┌──────────────┐         │        ▼                          │
             │ Record/Write │         │  ┌──────────────┐    ┌──────────┐ │
             │  S3          │         │  │ Dream History│───▶│  Search  │ │
             └──────┬───────┘         │  │  S7          │    │  S8      │ │
                    │ ✓ finish        │  └──────┬───────┘    └────┬─────┘ │
                    ▼                 │         │ tap dream       │       │
             ┌──────────────┐         │         ▼                 │       │
             │ AI Processing│         │  ┌──────────────┐         │       │
             │  S4          │────────────▶│ Dream Reveal │◀────────┘       │
             └──────────────┘ auto    │  │  S5 (+ S5b   │                 │
                                      │  │  Reflection) │                 │
                                      │  └──────┬───────┘                 │
                                      │         │ tap symbol / echo card  │
                                      │         ▼                         │
                                      │  ┌──────────────┐                 │
                                      │  │ Dream Echo / │── related dream─┘
                                      │  │ Symbol  S6   │
                                      │  └──────────────┘
                                      │ avatar
                                      ▼
                               ┌──────────────┐     ┌──────────────┐
                               │ Patterns S9  │────▶│ Settings S10 │   (optional)
                               └──────────────┘     └──────────────┘
```

Brief-to-screen mapping: **Speak** (S2 recording, or S3 Write) → **Visualize** (S4, S5) → **Reflect** (S5b) → **Connect** (S6, S7).

### 3.2 Route table (Expo Router, Next.js-style)

The reference uses **no tab bar**. Navigation happens through the floating bottom action bar and the avatar. So we replace the starter `(tabs)` group with a single stack.

```text
src/app/
├── _layout.tsx                 # Root Stack, fonts, providers, global.css
├── index.tsx                   # Redirect: onboarding (first run) or /home
├── onboarding.tsx              # S1
├── home.tsx                    # S2
├── write.tsx                   # S3  (fullScreenModal)
├── processing/[id].tsx         # S4  (fade, no back gesture)
├── dream/[id].tsx              # S5 + S5b reflection sheet
├── echo/[symbol].tsx           # S6  ?from=<dreamId>
├── archive.tsx                 # S7  ?view=list|grid
├── search.tsx                  # S8  (formSheet / modal)
├── patterns.tsx                # S9  (optional)
├── settings.tsx                # S10 (optional)
└── +not-found.tsx
```

| Screen | Route | Presentation | Params |
| --- | --- | --- | --- |
| S1 Onboarding | `/onboarding` | stack, no header | — |
| S2 Home | `/home` | stack root after onboarding | — |
| S3 Write | `/write` | `fullScreenModal` | — |
| S4 Processing | `/processing/[id]` | stack, `gestureEnabled: false`, fade | `id` (draft dream) |
| S5 Dream Reveal | `/dream/[id]` | stack (replaces S4 via `router.replace`) | `id`, `fresh?: '1'` |
| S6 Dream Echo / Symbol | `/echo/[symbol]` | stack push | `symbol` key, `from?` dreamId |
| S7 History | `/archive` | stack push | `view?`, `range?` |
| S8 Search | `/search` | `formSheet` / modal | — |
| S9 Patterns | `/patterns` | stack push | — |
| S10 Settings | `/settings` | stack push | — |

Navigation rules:
- After S4 finishes, call `router.replace('/dream/[id]?fresh=1')` so that back from Reveal goes to Home, not to Processing.
- ✕ on S3 discards the draft, after a confirmation if there is content.
- On Reveal, `fresh=1` plays the full reveal animation and shows ✓ **Save**. Opening an existing dream shows no save step.

---

## 4. Data model

Screens are built on mock data first (`src/lib/mock/`). Later the same shapes come from Supabase.

```ts
// src/types/dream.ts
type EmotionTag = { label: string; intensity?: number };          // "Unease"

type SymbolRef = {
  key: string;          // 'water' | 'door' | 'wolf' | ... (fixed vocabulary → icon)
  label: string;        // "Water"
  echoCount: number;    // times seen in *previous* dreams (0 = new)
};

type Dream = {
  id: string;
  createdAt: string;               // ISO
  inputType: 'voice' | 'text';
  audioUri?: string;               // original recording
  transcript: string;              // raw text (STT or typed)
  status: 'draft' | 'processing' | 'ready' | 'failed';

  // AI outputs
  title?: string;                  // "The Door in the Black Desert"
  summary?: string;                // 1–2 lines for cards
  interpretation?: string;         // short paragraph (R04)
  emotions: EmotionTag[];          // max 3 shown
  symbols: SymbolRef[];            // max ~5
  themes: string[];                // "Inner quest", "Childhood"
  artworkUrl?: string;
  artworkColor?: string;           // dominant hex → glow
  reflection?: {
    question: string;              // may contain *emphasis* markers
    answerText?: string;
    answerAudioUri?: string;
    answeredAt?: string;
  };
  echo?: DreamEcho;                // strongest recurring link, if any
};

type DreamEcho = {
  kind: 'symbol' | 'emotion' | 'theme' | 'person' | 'place';
  key: string;                     // 'water'
  label: string;                   // "Water"
  count: number;                   // appearances in previous dreams
  relatedDreamIds: string[];
  message: string;                 // "Water has appeared in 3 of your previous dreams."
};
```

How the data moves through the screens:

```text
S2 Home (voice) / S3 Write (text) ── audioUri / transcript ─▶ create Dream{status:'processing'}
S4 Processing ── runs pipeline, updates status per stage:
     transcribe (audio AI) → analyze (text AI: title, emotions, symbols, themes, interpretation, question)
     → compute echo (DB query over previous dreams) → paint (image AI) → status:'ready'
S5 Reveal ── reads Dream; user answers reflection → updates reflection.*
S6 Echo ── reads symbol key → previous dreams containing it
S7 Archive / S8 Search / S9 Patterns ── read the dream list plus aggregates
```

Client state: a single `DreamsProvider` (React context) over mock data now, swapped for Supabase queries later. Screens stay unchanged when the data source changes.

---

## 5. Shared component inventory

Build these in `src/components/` first, since every screen reuses them.

### Layout — `src/components/layout/`
| Component | Description | Refs |
| --- | --- | --- |
| `NightBackground` | Night gradient plus optional `glowColor` bloom plus optional star specks plus optional faint artwork image (`imageOpacity`) | all dark screens, R10 |
| `MistBackground` | Lavender-to-white gradient | R24, R25 |
| `Screen` | SafeArea + background + side padding + optional scroll | all |
| `ScreenHeader` | Back ghost circle · centered small label · optional right slot (avatar / settings) | R10, R18 |
| `BottomActionBar` | Floating 3-slot bar (`left`, `center`, `right`) pinned above the home indicator, with a gradient fade behind it | R01, R06, R13 |
| `Section` | Hairline top border + 24 vertical padding | R05, R10 |
| `LabeledList` | Two columns: system `label` on the left, stacked Bricolage `list` items on the right | R05, R10, R18 |
| `StarDivider` | Centered ✶ glyph with spacing | R04, R18 |

### UI — `src/components/ui/`
| Component | Description | Refs |
| --- | --- | --- |
| `Text` variants | `DisplayXL`, `Display`, `Title`, `Lead`, `BodyLarge`, `Body`, `Label`, `Meta`. Wraps Bricolage / System per §2.2. | — |
| `RichText` | Renders `*word*` as emphasis (Bricolage SemiBold, full white) against Light 300 at `white/70` (questions, Echo statements, headlines) | R04, R11 |
| `CircleButton` | `ghost` (hairline ring) or `solid` (white fill, ink icon), sizes sm / md / lg | R01, R02 |
| `PillButton` | Dark translucent pill with icon + label ("Search", "Pull to add an insight") | R06, R13 |
| `SegmentedControl` | Pill group with a sliding highlight | R10 |
| `Avatar` | Round photo or initials | R13 |
| `CountBadge` | Solid white circle with `xN` | R04, R11 |
| `SymbolIcon` | Line icon in a circle, looked up by `key`, optional `CountBadge` | R04, R17 |
| `SymbolTile` | Dark tile: icon (+ badge) + label, used in horizontal scroll | R04 |
| `SymbolChip` | Pill: icon + label (+ badge) | R22 |
| `Waveform` | Animated bars (live from mic metering, or static from a saved clip) | R02, R08 |
| `DreamOrb` | Animated dotted orb from [thinking-orbs](https://github.com/Jakubantalik/thinking-orbs) (engine from npm; Skia renderer on native, canvas on web). Props: `state`, `size`, `level` (live audio 0–1 → faster spin + swell). See §2.6 for which state goes where. | new |
| `DreamCard` | White card: date · `lead` excerpt · symbol icon row · feather if the dream has an insight. `variant: 'light' \| 'dark'`, `stacked` ghost layers | R13, R16 |
| `DreamArtTile` | Artwork tile for the gallery: image + date + title on a bottom scrim | new |
| `EchoCard` | **USP.** Symbol icon + `xN` · "Dream Echo" label · `lead` message · related-dream thumbnails · → | new (derived from R04 badge + R11 layout) |
| `InsightCard` | White card: "Insight" + feather header · `body-lg` input · date · mic or waveform · ✓ | R08, R09 |
| `SearchField` | Dark pill input with search icon and clear ✕ | R22 |
| `BarChart` | Minimal vertical bars (only for S9) | R24 |

---

## 6. Screens

Each screen lists: **Purpose · Route · Layout (top→bottom) · Components · Data · States · Interactions & navigation · Build checklist**.

---

### S1 — Onboarding

**Purpose:** introduce the app in 3 calm slides: remember → understand → discover. Shown only on first launch.
**Route:** `/onboarding` · **Refs:** R03 (moon), R14 (jellyfish), R27 (mood)

**Layout** (horizontal pager, 3 slides, shared background):
1. **Top-right:** "Skip" (label, `text-secondary`).
2. **Visual** (upper ~55%): a large centered asset, slowly floating.
   - Slide 1: moon (R03)
   - Slide 2: jellyfish (R14)
   - Slide 3: a small constellation of symbol icons (a mini R17)
3. **Headline** (`display`, left-aligned, with `RichText` emphasis):
   - 1: "Catch your dreams *before* they fade."
   - 2: "See what your mind keeps *returning* to."
   - 3: "Discover your *dream world*."
4. **Sub copy** (`body`, `text-secondary`, max 2 lines):
   - 1: "Speak it the moment you wake. We'll transcribe it for you."
   - 2: "Emotions, symbols and themes, found for you in every dream."
   - 3: "Dream Echo remembers every dream and connects them over time."
5. **Page dots** (3; the active one is a wider pill).
6. **BottomActionBar:** center = solid pill "Continue" (on the last slide: "Begin").

**Components:** `NightBackground`, `PillButton` (solid variant), page dots, `RichText`.
**Data:** none. Store an `onboarded = true` flag locally (AsyncStorage).
**States:** default only.
**Interactions:** swipe or Continue to go forward. Begin or Skip → `router.replace('/home')`. Later, sign-in (Supabase anonymous or email) can slot in before Home.

- [x] Pager with 3 slides
- [x] Assets float and parallax on swipe
- [x] Persist the onboarded flag and redirect in `index.tsx`

**Built** (2026-09-27): [`src/app/onboarding.tsx`](../src/app/onboarding.tsx), [`src/components/onboarding/`](../src/components/onboarding). Screenshots: [`screens/s1-onboarding-1.jpg`](./screens/s1-onboarding-1.jpg), [`-2`](./screens/s1-onboarding-2.jpg), [`-3`](./screens/s1-onboarding-3.jpg).

---

### S2 — Home

**Purpose:** a voice-first entry point. One obvious action, plus a light sense of continuity.
**Route:** `/home` · **Refs:** R01 (bottom bar), R13 (header, cards), R26 ("Write your dream" widget = two actions)

**Layout** (top→bottom, scrollable):
1. **Header row:** greeting label on the left ("Good morning, Zaeem", `label`, `text-secondary`) · `Avatar` on the right (→ S9 Patterns).
2. **Hero** (roughly the first viewport):
   - Date line (`meta`): "Saturday, 27 September"
   - Prompt (`display`, centered, `RichText`): "What do you *remember*?"
   - **Record button → orb (recording happens on Home)**: a solid white circle (120 dp) with a mic glyph and two slow ripple rings. Tapping it asks for the mic, starts recording **in place** and morphs the button into the animated `DreamOrb` (state `listening`, 210 dp, 650 ms). **The user never leaves Home.** See *Recording mode* below.
   - "Write instead" text button under the orb (`label`, underline on press).
3. **Dream Echo** (only when an echo exists): `EchoCard` with the latest recurring pattern, e.g. **Dream Echo**, "Water has appeared in 3 of your dreams."
4. **Recent dreams** section:
   - Header: "Recent dreams" (`title`) · "See all" (→ S7)
   - A horizontal carousel of 3–5 `DreamArtTile`s (artwork, date, title).
5. Spacer above the bottom bar.
6. **BottomActionBar:** left = ghost circle **archive** (grid icon → S7) · center = `PillButton` **Search** (→ S8) · right = ghost circle **pencil** (→ S3 Write).

**Recording mode** (decided 2026-09-28: voice capture lives on Home, not on a separate screen):
- The headline cross-fades to "I'm **listening**…" ("**Paused**" when paused). The orb's `level` follows mic metering (dBFS −55 → 0, −12 → 1), so it spins faster and swells with the voice.
- A timer (`00:14`) and the hint "Tell me everything, even fragments." sit under the orb.
- The Echo card and Recent dreams fade out, and scrolling is locked with the view at the top.
- Bottom bar: ✕ discard · **Pause / Resume** pill · ✓ finish (solid).
- ✓ saves the recording as a dream with `status: 'processing'` (it shows in Recent with a small `working` orb) and shows "Dream saved · 00:42". Recordings under 2 s are treated as accidental taps. *Next step: ✓ goes to S4 Processing.*
- Mic permission denied → "Microphone access is off. Open Settings" under the button.
- Hook: `src/hooks/use-dream-recorder.ts` (expo-audio, metering on, 100 ms polling).
- Screenshots: [`screens/s2-home-recording.jpg`](./screens/s2-home-recording.jpg), iOS simulator frames [`screens/s2-home-recording-ios.jpg`](./screens/s2-home-recording-ios.jpg).

**Components:** `NightBackground` (+ stars), `Avatar`, `RichText`, `RecordOrb` + `DreamOrb`, `EchoCard`, `DreamArtTile`, `BottomActionBar`, `CircleButton`, `PillButton`.
**Data:** user's first name, `dreams.slice(0, 5)`, latest `echo`.
**States:**
- **Empty** (no dreams yet): hide Echo and Recent. Show a quiet line under the orb: "Your first dream starts your dream world." Jellyfish art at low opacity.
- **Processing in progress** (a dream still generating): a small "Painting your dream…" tile at the start of Recent, which opens S4.
- **Loaded** (default).

**Interactions & navigation:**
- Orb → `/record?mode=voice` (asks for mic permission on first use).
- Write instead / pencil → `/record?mode=text`.
- Echo card → `/echo/[symbol]`.
- Recent tile → `/dream/[id]`. "See all" or the archive button → `/archive`.
- Avatar → `/patterns`.

- [x] Header + hero with the breathing orb
- [x] Echo card (with mock data)
- [x] Recent carousel
- [x] Empty state (code path only; not visually checked yet, because mock data always has dreams)
- [x] Bottom action bar

**Built** (2026-09-27): [`src/app/home.tsx`](../src/app/home.tsx), [`src/components/home/`](../src/components/home), [`src/components/dream/`](../src/components/dream). Data: [`src/lib/mock/dreams.ts`](../src/lib/mock/dreams.ts) (8 sample dreams), [`src/lib/echo.ts`](../src/lib/echo.ts), [`src/providers/dreams-provider.tsx`](../src/providers/dreams-provider.tsx). Screenshots: [`screens/s2-home-1.jpg`](./screens/s2-home-1.jpg), [`-2`](./screens/s2-home-2.jpg).
Routes linked from Home that aren't built yet (`/record`, `/dream/[id]`, `/echo/[symbol]`, `/archive`, `/search`, `/patterns`) show a temporary `ComingSoon` screen.

---

### S3 — Write

> **Update 2026-09-28:** voice recording lives on **Home** (see S2 *Recording mode*). S3 is the typed alternative, reached from "Write instead" and the ✎ button on Home.

**Purpose:** distraction-free typing for when the user can't or doesn't want to speak.
**Route:** `/write` (full-screen modal) · **Refs:** R01 (full-bleed dream text + 3-slot bar), R08 (insight card writing)

**Layout** (top → bottom, keyboard-aware):
1. **Header:** date + time (`meta`, e.g. "Monday 28 September at 07:12") and "Your dream" + feather icon on the left · live word count on the right.
2. **Writing area:** a multiline `TextInput` filling the screen, auto-focused, 22/32 system font, white caret. Placeholder: "Start with anything you remember… a place, a feeling, a face." The night background uses a stronger bottom scrim (0.75) so the text stays readable.
3. **Starter chips** (shown until 12 words): "I was in… · There was… · I felt… · Someone… · Then… · I woke up…". Tapping one appends the sentence starter and refocuses the input.
4. **Bottom bar** (in the normal layout flow, so it sits above the keyboard): ✕ close · 🎙 speak instead · ✓ save (solid; dimmed and disabled under 3 words).

**Behaviour:**
- **Draft autosave:** the text is saved to AsyncStorage (400 ms debounce) and restored when Write opens again. It is cleared on save or discard.
- ✕ with text → "Discard this dream?" (native `Alert`; `confirm()` on web). ✕ with no text just closes.
- 🎙 keeps the draft and returns to Home with `record=1`, which starts recording there.
- ✓ saves the dream as `status: 'processing'`, `inputType: 'text'` and returns to Home with `saved=1`, which shows "Dream saved". *Next step: ✓ goes to S4 Processing.*

**Components:** `NightBackground`, `Meta`, `Label`, `Icon`, `StarterChips`, `BottomActionBar` (`floating={false}`), `CircleButton`.
**Files:** [`src/app/write.tsx`](../src/app/write.tsx), [`src/components/write/starter-chips.tsx`](../src/components/write/starter-chips.tsx), draft helpers in [`src/lib/storage.ts`](../src/lib/storage.ts).
**Screenshots:** [`screens/s3-write-web.jpg`](./screens/s3-write-web.jpg), [`screens/s3-write-ios.jpg`](./screens/s3-write-ios.jpg).

- [x] Auto-focused writing area with placeholder and word count
- [x] Starter chips
- [x] Draft autosave / restore
- [x] Discard confirmation
- [x] Speak instead → recording on Home
- [x] Save → processing dream + "Dream saved" on Home
- [ ] Keyboard avoidance checked on a real device (the simulator used the hardware keyboard)

---

### S4 — AI Processing

**Purpose:** turn waiting into anticipation. This is the bridge between speaking or writing and the reveal.
**Route:** `/processing/[id]` (fade, no back gesture) · **Refs:** R03 (moon), R02 (blur-in text)
**Entered from:** ✓ after recording on Home, ✓ on Write, or tapping a processing tile in Recent.

**Layout** (non-scrolling):
1. **Visual** (300 dp): the `DreamOrb` (200 dp) inside a faint moon (10% opacity) over a glow. **Its state changes with each stage** (§2.6): `working` → `composing` → `connecting` → `weaving`. The background glow takes the artwork color once it's known.
2. **Headline:** "Remembering your **dream**…" (`RichText`, title size).
3. **Stage list:** 4 `StageRow`s. The status dot goes ○ pending → pulsing dot active → ✓ done. Labels go dim → white → 60%.
   1. Understanding the story → reveal: “title”
   2. Finding emotions → reveal: "Unease · Calm · Wonder"
   3. Finding symbols → reveal: symbol icons + **"Water echoes 4 of your dreams"** (Dream Echo, via `findEcho`)
   4. Painting your dream → reveal: "Your dream is ready"
4. **Bottom:** "Continue in background" (→ Home; processing keeps going there).

**Done state** (decided 2026-09-28, replacing auto-advance): the orb fades out and the **artwork card** zooms in (240×300, radius 28), the headline becomes the dream title, and a solid **"Reveal your dream"** button appears → `router.replace('/dream/[id]?fresh=1')`. The user chooses when to see the reveal.
**Failed state:** "Something went quiet." + "We couldn't finish this one. Your words are safe." + **Try again** (restarts the pipeline).

**Data & pipeline**
- The pipeline runs in `DreamsProvider.startProcessing()` (once per dream, tracked in a ref), so it survives leaving the screen. It updates `dream.processingStage` (0–4) and fills in fields as each stage completes.
- [`src/lib/ai/process-dream.ts`](../src/lib/ai/process-dream.ts): the stages and their order. Mock timings: 1.8 s · 1.5 s · 1.9 s · 2.6 s (~8 s total).
- [`src/lib/ai/mock-analyzer.ts`](../src/lib/ai/mock-analyzer.ts): stand-in AI. Keyword lexicons map text → symbol keys (fixed icon vocabulary) and emotions; templates build the title, themes, interpretation and reflection question; artwork is the best-matching sample image. Voice dreams get a sample transcript until real speech-to-text exists. **The backend replaces this file; screens don't change.**

**Components:** `NightBackground`, `DreamOrb`, `Glow`, `StageRow` ([`src/components/processing/stage-row.tsx`](../src/components/processing/stage-row.tsx)), `SymbolIcon`, `PillButton`.
**Screenshots:** [`screens/s4-processing-1.jpg`](./screens/s4-processing-1.jpg) (mid-way), [`-2`](./screens/s4-processing-2.jpg) (done), iOS simulator frames [`s4-processing-ios.jpg`](./screens/s4-processing-ios.jpg).

- [x] Moon + orb visual, orb state per stage
- [x] Stage list driven by the pipeline
- [x] Micro-reveals (incl. Dream Echo)
- [x] Failure / retry (UI + restart; the mock never fails, so it's untested)
- [x] Done state with artwork + "Reveal your dream"
- [x] Continue in background

---

### S5 — Dream Reveal (Dream Detail)

**Purpose:** the **wow screen**. Artwork first, then meaning, one question, and the echo.
**Route:** `/dream/[id]` · **Refs:** R04, R05, R06, R10 (faint art), R11 (big quote), R01 (transcript)

**Layout** (one long vertical scroll with a pinned bottom bar):

1. **Artwork hero** (full-bleed, about 60% of the screen height, under the status bar):
   - The AI image, fading in from blur. It fades at the bottom into the night gradient.
   - Floating top bar over the image: back ghost circle (left) · share / more ghost circle (right).
   - Overlaid at the bottom-left of the hero: date (`meta`, e.g. "March 27 · 6:42 AM") and the **dream title** (`display-xl` at 44/46, Bricolage 600, max 2 lines).
2. **Emotions** — `Section` + `LabeledList`: "Emotions" | Unease / Recognition / Sacred Fear. (R05)
3. **Symbols** — header "Symbols ✦" + a horizontal scroll of `SymbolTile`s (icon + label + `xN` badge when it recurs). Tapping one opens S6. (R04)
4. **Interpretation** — a short paragraph (`body-lg`, 3–5 sentences). (R04)
5. **Themes** — `LabeledList`: "Themes" | Inner quest / Childhood / Transition. (R10 style)
6. **Dream Echo** — the `EchoCard` (only if `echo` exists):
   - Symbol icon + `x3` badge, the "Dream Echo" label, and the message in `lead` with `RichText` ("*Water* has appeared in 3 of your previous dreams.")
   - A row of 2–3 related dream thumbnails with dates → S6.
7. **Reflection question** — `StarDivider` ✶ + the question in `display`, centered, with `RichText` emphasis. (R04/R05)
   - "The house felt *familiar*. Does it remind you of somewhere from your *childhood*?"
   - If already answered: the `InsightCard` (read-only, white) under it.
8. **Your dream** — collapsible: "Your dream" label + the full transcript (`body-lg`, `white/80`) + a play button for the original audio if it was recorded by voice.
9. Bottom spacer.

**BottomActionBar:**
- Fresh dream (`fresh=1`): ✕ ghost (back Home without saving → confirm) · **"Pull to add an insight"** pill with ^ handle · **✓ solid** (save → Home, toast "Saved to your dream world").
- Existing dream: back ghost · "Add insight" / "Edit insight" pill · share ghost.

**Background:** `NightBackground` with the `glowColor` taken from the artwork.
**Components:** `DreamHero`, `Section`, `LabeledList`, `SymbolTile`, `CountBadge`, `BodyLarge`, `EchoCard`, `StarDivider`, `RichText`, `InsightCard`, `BottomActionBar`, `PillButton`.
**Data:** the full `Dream`.
**States:** fresh (animated stagger-in, save step) · existing · artwork missing (gradient + large symbol icon placeholder; "Retry painting" in the ⋯ menu) · no echo (hide section 6) · answered / unanswered reflection.

- [x] Artwork hero with the title overlay and blur-in (+ parallax on scroll, stretch on pull)
- [x] Emotions, symbols, interpretation, themes sections
- [x] Echo card
- [x] Reflection question with `RichText` emphasis
- [x] Transcript collapsible + audio playback (`AudioPlayButton`, voice dreams only)
- [x] Fresh vs. existing bottom bar

**Built** (2026-09-28): [`src/app/dream/[id].tsx`](../src/app/dream/[id].tsx) + [`src/components/dream/`](../src/components/dream) (`DreamHero`, `SymbolTile`, `InsightCard`, `InsightSheet`, `AudioPlayButton`) + [`src/components/layout/section.tsx`](../src/components/layout/section.tsx) (`Section`, `LabeledList`, `StarDivider`).
**As built, differences from the plan above:**
- Controls: back + share float at the top (a dark fade appears behind them once the art scrolls away). Bottom bar for a fresh dream: ✕ discard (confirm, then removes the dream) · **Add an insight** · ✓ save (→ Home, "Saved to your dream world"). For an existing dream: just the insight pill (**Add an insight** / **Edit insight**).
- Symbol tiles show `xN` = the number of *earlier* dreams with that symbol (`countEarlier`), and open S6.
- Fresh dreams reveal their sections with a staggered fade-up. Revisited dreams show them at once.
- Hero blur-in = a blurred copy of the art (`blurRadius` 30) fading out over 1.2 s.
Screenshots: [`screens/s5-reveal-existing.jpg`](./screens/s5-reveal-existing.jpg), [`s5-reveal-fresh-insight.jpg`](./screens/s5-reveal-fresh-insight.jpg), iOS [`s5-reveal-ios.jpg`](./screens/s5-reveal-ios.jpg), [`s5-insight-ios.jpg`](./screens/s5-insight-ios.jpg).

#### S5b — Reflection (pull-up insight sheet on S5)

**Refs:** R06, R07, R08, R09
**Behavior:**
1. The user drags the "Pull to add an insight" handle up, or taps it. The white `InsightCard` rises from behind the bottom bar (blurred → sharp, R07 → R09) and the page dims.
2. `InsightCard` layout: "Insight" header + feather icon (top) · hairline · `body-lg` input (placeholder "What does it bring up for you?") · footer: date/time (left) · mic ghost button (voice answer, turns into a live `Waveform` while recording) · ✓ solid ink circle (save).
3. Keyboard-aware: the card sits right above the keyboard (R08).
4. Save → the card settles in under the question as read-only, the feather icon appears on this dream in the Archive, and the haptic plays.
5. A voice answer is transcribed into the same field (the audio AI again).

- [x] Drag gesture + spring (opens with a tap on the pill; the card springs up; drag it down or tap the dimmed page to close)
- [x] Keyboard avoidance (`KeyboardAvoidingView`; not yet checked with an on-screen keyboard)
- [x] Voice answer: records a **voice note** (a small ink-on-paper orb reacts while recording, then a play button). Transcribing it into text comes with the backend.
- [x] Persist `reflection.answerText` / `answerAudioUri` / `answeredAt` (`updateDream`); the card then shows read-only under the question with an **Edit** link. Success haptic on save.

---

### S6 — Dream Echo / Symbol

**Purpose:** **the USP screen.** It shows how one element keeps returning across the dream world.
**Route:** `/echo/[symbol]?from=<dreamId>` · **Refs:** R10, R11, R12, R17

**Layout:**
1. **ScreenHeader:** back · "Dream Echo" label (centered).
2. **Title row:** symbol name in `display-xl` ("Water") on the left · a large `SymbolIcon` with a `xN` badge on the right. Hairline below. (R10/R11)
3. **Echo statement** (the hero moment, centered, `display` with `RichText` emphasis, R11 quote style):
   - ✶
   - "*Water* has appeared in **3** of your dreams since *March*."
   - A meta chip under it: "First seen · March 12" (R11 source chip style).
4. **What it may mean** — `Section`: a `lead` one-liner subtitle ("A symbol of emotion, the unconscious, and change.") + a short `body` paragraph that is **personal**, generated from the user's own dreams ("In your dreams water shows up when you're facing something unfamiliar…").
5. **Felt alongside** — `LabeledList`: "Emotions with Water" | Calm / Unease / Longing (aggregated across the related dreams).
6. **Dreams with Water** — a vertical list of compact `DreamCard`s (dark variant, with a small artwork thumbnail at the left, date, title, symbol row). Newest first. Tap → `/dream/[id]`. The dream the user came `from` is highlighted.
7. **Often appears with** — a small constellation (R17 style, max ~6 nodes): this symbol at the center, linked to the symbols it most often co-occurs with. Tap a node → that symbol's Echo screen. *(Keep it simple: static positions, no physics.)*
8. **Background:** faint related artwork (the latest dream's art, ~12% opacity) behind the title, as in R10.

**Components:** `ScreenHeader`, `SymbolIcon`, `CountBadge`, `StarDivider`, `RichText`, `Section`, `LabeledList`, `DreamCard`, `MiniConstellation`.
**Data:** `symbol` → `{ label, meaning, personalNote, count, firstSeen, relatedDreams[], coEmotions[], coSymbols[] }`.
**States:** count = 1 (first appearance: "This is the first time *Water* has appeared. We'll let you know if it returns.") · loaded.
**Interactions:** related dream → S5 · constellation node → S6 (push) · back.

> Note: the reference's Personal / Collective / Cultural tabs are dropped on purpose (dictionary-like). If we want some depth later, a two-tab `SegmentedControl` "Your dreams / Meaning" could reuse the R10 pattern.

- [x] Title row + badge (`xN` = total dreams with the symbol, shown from 2)
- [x] Echo statement (0 / 1 / many variants)
- [x] Meaning + personal note
- [x] Co-emotions list ("Felt with water")
- [x] Related dreams list (`DreamRow`, the `from` dream marked "this dream")
- [x] Mini constellation (`EchoConstellation`: companions placed around a ring, sized and linked by how often they co-occur; tap → that symbol's Echo)

**Built** (2026-09-28): [`src/app/echo/[symbol].tsx`](../src/app/echo/[symbol].tsx), data from `symbolProfile()` + `personalNote()` in [`src/lib/echo.ts`](../src/lib/echo.ts), one-line meanings in [`src/constants/symbol-meanings.ts`](../src/constants/symbol-meanings.ts), components `ScreenHeader`, `DreamRow`, `EchoConstellation`.
**Notes:** counts use *ready* dreams only. Home's echo line counts *previous* dreams ("in 3 of your previous dreams"), while S6 counts all of them ("in 4 of your dreams"), so the two agree. The personal note is a template for now; the backend's text model will write it later. The page is solid night-900 so the faint art behind the title fades without a seam.
Screenshots: [`screens/s6-echo.jpg`](./screens/s6-echo.jpg), iOS [`s6-echo-ios.jpg`](./screens/s6-echo-ios.jpg).

---

### S7 — Dream History (Archive)

**Purpose:** a visual gallery of the dream world, with artwork as the main element.
**Route:** `/archive?view=list|grid` · **Refs:** R13, R15, R16, R17, R23

**Layout:**
1. **Top row:** range filter "This Month ⌄" (label + chevron → a sheet with This Week / This Month / All Time) on the left · `Avatar` on the right.
2. **Title:** "Dream Archive" in `display` (Bricolage 600) with a superscript count `³²` (R13).
3. **View toggle** (small pill segmented, right-aligned under the title): **Gallery** | **List** | **World**.
4. **Content by view:**
   - **Gallery** (default, our addition): a 2-column masonry of `DreamArtTile`s (artwork fills the tile, date + title on a scrim, a feather badge if answered). Tiles alternate heights for rhythm.
   - **List** (R13/R23): stacked white `DreamCard`s: date · `lead` excerpt (2 lines) · symbol icon row · feather. The last card shows the stacked ghost layers.
   - **World** (R17): the full symbol constellation for the selected range. Node size = frequency. Tap a node → S6. *This is the Dream Echo overview. Keep it static and simple.*
5. Month section headers in Gallery/List when range = All Time ("March", `label`).
6. **BottomActionBar:** ✕ ghost (back Home) · `PillButton` **Search** (→ S8) · ⇅ ghost (sort: Newest / Oldest).

**Components:** `Avatar`, `Display` with superscript, `SegmentedControl` (small), `DreamArtTile`, `DreamCard`, `DreamWorldMap`, `BottomActionBar`, range sheet.
**Data:** dreams filtered by range + sorted; symbol frequencies for World.
**States:** empty ("No dreams this month yet" + "Record a dream" button) · loading skeleton tiles · loaded.
**Interactions:** tile/card → S5 · node → S6 · Search → S8 · range sheet · sort toggle.

- [x] Header with count + range filter (dropdown: This Week / This Month / All Time)
- [x] Gallery view (2-column masonry, alternating 1.4 / 1.1 tile heights)
- [x] List view (white `DreamCard`s with title + 2-line excerpt; the last card has the stacked paper layers)
- [x] World view (`DreamWorldMap`: top 16 symbols, sunflower layout on an oval, size = dream count, lines = shared dreams; tap → S6)
- [x] Empty state ("No dreams this week yet." + Record a dream)

**Built** (2026-09-28): [`src/app/archive.tsx`](../src/app/archive.tsx), [`src/components/archive/`](../src/components/archive) (`DreamWorldMap`, `RangeMenu`), `SegmentedControl` (sliding highlight), `DreamCard`; `DreamArtTile` gained a `height` prop.
**Notes:** the range is a small dropdown rather than a sheet. Month headers appear with All Time. Sort ⇅ toggles Newest/Oldest first (shown as a caption). Processing dreams open S4. `?view=` works for deep links and when the screen is already open. No loading skeleton yet (the data is local); add one with Supabase.
Screenshots: [`screens/s7-archive.jpg`](./screens/s7-archive.jpg), [`s7-archive-world.jpg`](./screens/s7-archive-world.jpg), iOS [`s7-archive-ios.jpg`](./screens/s7-archive-ios.jpg).

---

### S8 — Search

**Purpose:** find dreams by symbol, emotion, word or date.
**Route:** `/search` (form sheet with a grab handle) · **Refs:** R22

**Layout:**
1. Grab handle.
2. **Symbols** — title "Symbols" (`title`) · "All" link on the right → a horizontal row of `SymbolChip`s with count badges, most frequent first. (R22)
3. **Emotions** — title "Emotions" → a wrap row of text pills (Unease, Calm, Longing…).
4. **Results** (replaces 2–3 while typing): `DreamCard` list (dark variant), with the matching words highlighted (Bricolage SemiBold, full white).
5. **SearchField** pinned above the keyboard: "Search symbols, emotions, dates…" + clear ✕. (R22)

**Data:** symbol and emotion aggregates · full-text match over title/transcript/themes (client-side on mock data; Postgres full-text later).
**States:** idle (chips) · typing (results) · no results ("Nothing yet. Maybe you haven't dreamt it *yet*.").
**Interactions:** chip → S6 (symbol) or filtered results (emotion) · result → S5 · swipe down to dismiss.

- [x] Sheet presentation (iOS modal sheet, swipe down; "Done" for Android/web)
- [x] Chips (symbols with icon + count, first 8 then "All N"; emotions with counts)
- [x] Live filtering (every word must match; `useDeferredValue` keeps typing smooth)
- [x] No-results state

**Built** (2026-09-28): [`src/app/search.tsx`](../src/app/search.tsx), [`src/lib/search.ts`](../src/lib/search.ts) (`searchDreams`, `symbolCounts`, `emotionCounts`), `SearchField` + `SymbolChip` in [`src/components/search/`](../src/components/search), `HighlightText` (matches in white SemiBold).
**Searches:** title, symbol names (and their keys, e.g. "moon" finds Night), emotions, themes, transcript, insight answer, and dates ("september", "monday", "24 sep"). Each result says where it matched ("Symbol", "Your dream", …) with a highlighted snippet. Emotion chips fill the search box; symbol chips open S6; results open S5.
Screenshots: [`screens/s8-search.jpg`](./screens/s8-search.jpg), iOS [`s8-search-ios.jpg`](./screens/s8-search-ios.jpg).

---

### S9 — Dream Patterns (optional)

**Purpose:** a simple personal summary. **Not** an analytics dashboard.
**Route:** `/patterns` · **Refs:** R24

**Layout** (light **Mist** theme; the switch to light mode signals "this is about you"):
1. **ScreenHeader:** back · settings gear (→ S10).
2. `Avatar` (large, centered) + name (`title`).
3. **2×2 stat grid** with hairline dividers (R24):
   - Most recurring emotion: top 3 with % (Bricolage `list` value, system `meta` %)
   - Most recurring symbol: top 3 with `×N` (tap → S6)
   - Most recurring theme: the top one
   - Dreams this month: a big number
4. **Dream rhythm**: a minimal bar chart (dreams per day for the month), ink bars, no gridlines. *Only if there's time.*
5. Total dreams line at the bottom: "32 dreams remembered since March".

**States:** fewer than 3 dreams → a single message: "Patterns appear after a few dreams. Keep going."

- [x] Stat grid (Most felt with % of dreams · Most recurring symbol with ×N, tap → S6 · Theme in focus · Dreams this month)
- [x] Bar chart ("Dream rhythm": one bar per day this month, scaled against at least 3/day; future days faint)

**Built** (2026-09-28): [`src/app/patterns.tsx`](../src/app/patterns.tsx), stats in [`src/lib/patterns.ts`](../src/lib/patterns.ts) (`dreamPatterns`, ready dreams only), `MistBackground`, `StatCell`/`StatLine`, `RhythmChart`, and a new `ink` variant of `CircleButton` for light screens. The status bar switches to dark while this screen is open. The footer shows "8 dreams remembered since September 2026 · 2 reflections written". The gear opens `/settings` (S10 placeholder).
Screenshots: [`screens/s9-patterns.jpg`](./screens/s9-patterns.jpg), iOS [`s9-patterns-ios.jpg`](./screens/s9-patterns-ios.jpg).

---

### S10 — Settings (optional, minimal)

**Route:** `/settings` · **Refs:** R25 (Mist theme, Bricolage `lead` row labels, chevrons)
Rows: **Profile** (name) · **Reminders** (morning notification time) · **Export my dreams** · **About** · **Sign out**. The version number at the bottom (`meta`, `text-tertiary`).
Dropped from the reference: Devices, Language, Passcode & Face ID, Support.

- [x] Rows, working (not stubs)

**Built** (2026-09-28): [`src/app/settings.tsx`](../src/app/settings.tsx), `SettingsGroup`/`SettingsRow` in [`src/components/settings/`](../src/components/settings), [`src/providers/profile-provider.tsx`](../src/providers/profile-provider.tsx) (name + reminder saved in AsyncStorage; replaces the hard-coded `USER.name` on Home/Archive/Patterns), [`src/lib/reminders.ts`](../src/lib/reminders.ts) (expo-notifications, local, works in Expo Go).
- **Profile:** tap the name → inline edit → Save. The greeting updates everywhere and the name is kept across restarts.
- **Morning reminder:** Switch + time chips 06:00–08:30 → a daily local notification "What do you remember?". Asks for permission first (Android: creates a channel first). If denied, it shows a message and the switch stays off. On web: "Reminders work in the mobile app."
- **Export my dreams:** the share sheet with every ready dream as plain text (title, date, emotions, symbols, transcript, insight).
- **About Dreamify:** expands a short description + orb credit.
- **Sign out:** confirm → clears the reminder, resets the profile, clears the onboarding flag → onboarding. *(Placeholder until Supabase auth.)*
- Version from `expo-constants` at the bottom.
**Verified:** Chrome (rename → greeting "Zaeem", persists across reload; web reminder message; About; Sign out → `/onboarding` and name back to Abbas). iOS: turning the reminder on raised the native permission prompt. **Not verified:** the scheduled notification itself (scripted taps can't press Allow).
Screenshots: [`screens/s10-settings.jpg`](./screens/s10-settings.jpg), [`s10-settings-ios-permission.jpg`](./screens/s10-settings-ios-permission.jpg).

---

## 7. Assets checklist

Fill in paths when the files arrive. Target folders: `assets/images/`, `assets/icons/symbols/`, `assets/fonts/`.

| Asset | Used on | Status |
| --- | --- | --- |
| Moon image (R03) | S1 slide 1, S4 | ✅ `assets/images/moon.png` (1254², transparent) |
| Jellyfish image (R14) | S1 slide 2, empty states | ✅ `assets/images/jelly.png` (1086×1448, transparent) |
| Logo (white wordmark + bird) | S1, splash | ✅ `assets/images/logo.png` |
| Night-sky background with rocks (R02 style) | **All dark screens** via `NightBackground` | ✅ `assets/images/bg.png` (941×1672), anchored to the bottom, with a bottom scrim for readability |
| Star / noise texture | NightBackground | ✅ not needed: stars are in `bg.png` (code-drawn stars remain as an option) |
| Bricolage Grotesque 300–700 (Google Fonts package, no files needed) | headings, important text | ✅ decided |
| System UI (built in) | paragraphs, labels, meta | ✅ decided |
| Symbol line icons (SVG), 30 keys, `star` = fallback | S1, S2, S5, S6, S7, S8 | ✅ `assets/icons/symbols/*.svg`, see its README + `reference/symbols-preview.jpg` |
| UI icons (20): mic, pencil, search, grid, close, check, keyboard, sort, back, chevron-right, chevron-down, settings, feather, share, play, pause, plus, sparkle, more, trash | all | ✅ `assets/icons/ui/*.svg`, see its README + `reference/ui-icons-preview.jpg` |
| App icon + splash | app.json | ⬜ |
| Sample dream artworks (8) for mock data | S2, S5, S7 | ✅ `assets/images/dreams/dream-01…08.jpg` (1024×1280, generated with ChatGPT from [`ARTWORK_PROMPTS.md`](./ARTWORK_PROMPTS.md); numbers match the prompts) |
| Profile photo | S2 header, S7, S9 | ✅ `assets/images/profile.png` (user name: **Abbas**) |

> The AI must return symbol `key`s from the **fixed icon vocabulary** (the file names in `assets/icons/symbols/`), so that every symbol has an icon. Anything unknown maps to `star`.

---

## 8. Build order

Frontend first, all screens on mock data, then the backend.

1. ✅ **Foundation** *(done 2026-09-27)*: install `@expo-google-fonts/bricolage-grotesque` and load it in the root layout, color tokens in `tailwind.config.js`, `NightBackground`, `Screen`, text components, `CircleButton`, `PillButton`, `BottomActionBar`. Replace `(tabs)` with the stack routes. Mock data + `DreamsProvider`.
2. ✅ **S2 Home** *(done 2026-09-27)*.
3. ✅ **S3 Write** *(done 2026-09-28; voice recording moved to S2)*.
4. ✅ **S4 Processing** *(done 2026-09-28; mock AI pipeline)*.
5. ✅ **S5 Dream Reveal + S5b Reflection** *(done 2026-09-28)*.
6. ✅ **S6 Dream Echo** *(done 2026-09-28)*.
7. ✅ **S7 Archive** *(done 2026-09-28; Gallery, List, World)*.
8. ✅ **S1 Onboarding** *(built first, done 2026-09-27)*.
9. ✅ **S8 Search** *(done 2026-09-28)*.
10. ✅ **S9 Patterns** *(done 2026-09-28)* · ✅ **S10 Settings** *(done 2026-09-28)*.
11. **Backend:** Supabase schema + storage (audio, artwork) → AI edge functions (STT → analysis → echo → image) → swap the mock provider for real queries.

---

## 9. Open questions

- [x] **Fonts:** Bricolage Grotesque for headings and important text, System UI for paragraphs. *(Decided 2026-09-27.)*
- [ ] **Name:** the logo provided says **Dreamify**, so the app is Dreamify and **Dream Echo** is the name of the feature (USP). *(Assumed; confirm.)*
- [ ] **Live transcription during recording** (R02 streaming text) vs. transcribing after finishing. Streaming needs a realtime STT API, so v1 proposal: transcribe after.
- [ ] **Audio AI beyond STT:** do we also read the reflection question aloud (TTS) on Reveal? This would strengthen the "uses AI for audio" requirement.
- [ ] **Auth:** Supabase anonymous sign-in for the demo, or email magic link?
- [ ] **Art style prompt:** one fixed house style (e.g. "surreal, dark navy, soft film grain, dreamlike") so the gallery feels cohesive?
