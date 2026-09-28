# Dream Artwork Prompts

These prompts produce the **sample dream artworks** used for mock data on Home, Dream Reveal and the Archive. The **house style** below is also the fixed style suffix the backend will add to every AI-generated artwork, so the real art and the samples look like one collection.

## Output settings

- **Aspect ratio:** portrait **4:5** (e.g. 1024 × 1280). If the tool only offers 3:4 or 2:3, that works too; the app crops with `cover`.
- **Format:** JPG, quality around 85.
- **Save as:** `assets/images/dreams/dream-01.jpg` … `dream-08.jpg` (the numbers match the list below).

## House style

Every prompt below is **complete and ready to paste**. Each one is built as:

1. **Format:** `Vertical portrait image, 4:5 aspect ratio, 1024 x 1280 pixels, full-bleed with no border.` The ratio and size are written into the prompt because tools like ChatGPT and Gemini have no ratio setting.
2. **Scene:** the dream itself.
3. **Style:** `surreal dreamscape, painterly digital art, deep midnight navy and indigo palette with soft silver moonlight, subtle cold blue glow, atmospheric haze and mist, fine film grain, quiet and calm but slightly uncanny, minimal composition with lots of negative space, keep the bottom third calm and uncluttered, cinematic wide depth, soft focus edges, muted desaturated tones, no text.`

For the backend, parts 1 and 3 are the fixed wrapper around the AI-generated scene description.

**Negative prompt** (if your tool supports one):

```
text, letters, watermark, logo, signature, bright saturated colors, neon, cartoon, anime, 3d render look, harsh lighting, close-up faces, gore, horror, blood, clutter, frame, border
```

---

## The 8 dreams

The symbols are chosen so the sample data demonstrates **Dream Echo**: `water` appears in 4 dreams, `door` in 2, and `moon` in 3.

| # | Title | Symbols (keys) | Emotions |
| --- | --- | --- | --- |
| 01 | The Door in the Black Desert | desert, door, moon | Unease, Recognition |
| 02 | The Ocean That Disappeared | ocean, water, moon | Loss, Calm |
| 03 | A Glass Elevator in the Forest | forest, light, stairs | Wonder, Anticipation |
| 04 | The Wolf in My Childhood Room | wolf, house, moon | Fear, Recognition |
| 05 | The Mirror on the Floor | mirror, water, star | Curiosity, Unease |
| 06 | The Staircase Inside the Mountain | stairs, mountain, cloud | Longing, Determination |
| 07 | The Station With No Tracks | train, water, door | Uncertainty, Waiting |
| 08 | Jellyfish Over the Sleeping City | water, light, house | Peace, Wonder |

### 01 — The Door in the Black Desert
```
Vertical portrait image, 4:5 aspect ratio, 1024 x 1280 pixels, full-bleed with no border. A single wooden door standing upright alone in an endless desert of black sand dunes, no walls around it, the door slightly open with a faint warm light behind it, ash-grey sky with a pale full moon, long soft shadows, a tiny lone figure in the distance walking toward it. Style: surreal dreamscape, painterly digital art, deep midnight navy and indigo palette with soft silver moonlight, subtle cold blue glow, atmospheric haze and mist, fine film grain, quiet and calm but slightly uncanny, minimal composition with lots of negative space, keep the bottom third calm and uncluttered, cinematic wide depth, soft focus edges, muted desaturated tones, no text.
```

### 02 — The Ocean That Disappeared
```
Vertical portrait image, 4:5 aspect ratio, 1024 x 1280 pixels, full-bleed with no border. A vast dry seabed at night where the ocean has vanished, old wooden boats stranded and tilted on cracked sand, shallow puddles reflecting a huge pale moon, distant thin line of water on the horizon, mist drifting low. Style: surreal dreamscape, painterly digital art, deep midnight navy and indigo palette with soft silver moonlight, subtle cold blue glow, atmospheric haze and mist, fine film grain, quiet and calm but slightly uncanny, minimal composition with lots of negative space, keep the bottom third calm and uncluttered, cinematic wide depth, soft focus edges, muted desaturated tones, no text.
```

### 03 — A Glass Elevator in the Forest
```
Vertical portrait image, 4:5 aspect ratio, 1024 x 1280 pixels, full-bleed with no border. A transparent glass elevator rising silently through a dark pine forest at night, softly glowing from inside, fog between tall black tree trunks, fireflies of cold light floating, a staircase of light trailing below it. Style: surreal dreamscape, painterly digital art, deep midnight navy and indigo palette with soft silver moonlight, subtle cold blue glow, atmospheric haze and mist, fine film grain, quiet and calm but slightly uncanny, minimal composition with lots of negative space, keep the bottom third calm and uncluttered, cinematic wide depth, soft focus edges, muted desaturated tones, no text.
```

### 04 — The Wolf in My Childhood Room
```
Vertical portrait image, 4:5 aspect ratio, 1024 x 1280 pixels, full-bleed with no border. A quiet childhood bedroom at night, moonlight through a tall window, a large grey wolf sitting calmly on a small bed staring forward, not threatening, toys and a small lamp in shadow, dust particles floating in the moonbeam. Style: surreal dreamscape, painterly digital art, deep midnight navy and indigo palette with soft silver moonlight, subtle cold blue glow, atmospheric haze and mist, fine film grain, quiet and calm but slightly uncanny, minimal composition with lots of negative space, keep the bottom third calm and uncluttered, cinematic wide depth, soft focus edges, muted desaturated tones, no text.
```

### 05 — The Mirror on the Floor
```
Vertical portrait image, 4:5 aspect ratio, 1024 x 1280 pixels, full-bleed with no border. A tall antique mirror lying flat on a wet stone floor, its surface reflecting a starry night sky with thin silver fractures across it, shallow water around the mirror catching the starlight, empty dark room fading into mist. Style: surreal dreamscape, painterly digital art, deep midnight navy and indigo palette with soft silver moonlight, subtle cold blue glow, atmospheric haze and mist, fine film grain, quiet and calm but slightly uncanny, minimal composition with lots of negative space, keep the bottom third calm and uncluttered, cinematic wide depth, soft focus edges, muted desaturated tones, no text.
```

### 06 — The Staircase Inside the Mountain
```
Vertical portrait image, 4:5 aspect ratio, 1024 x 1280 pixels, full-bleed with no border. A narrow staircase carved into the side of a massive dark mountain, spiraling upward into low clouds, a small lone figure climbing halfway up, faint moonlight on the stone steps, snow dust in the air. Style: surreal dreamscape, painterly digital art, deep midnight navy and indigo palette with soft silver moonlight, subtle cold blue glow, atmospheric haze and mist, fine film grain, quiet and calm but slightly uncanny, minimal composition with lots of negative space, keep the bottom third calm and uncluttered, cinematic wide depth, soft focus edges, muted desaturated tones, no text.
```

### 07 — The Station With No Tracks
```
Vertical portrait image, 4:5 aspect ratio, 1024 x 1280 pixels, full-bleed with no border. An old empty train station platform at night, a few silhouetted people waiting with their backs turned, where the tracks should be there is only still black water reflecting the platform lamps, a single open door in the station wall glowing softly, thick mist. Style: surreal dreamscape, painterly digital art, deep midnight navy and indigo palette with soft silver moonlight, subtle cold blue glow, atmospheric haze and mist, fine film grain, quiet and calm but slightly uncanny, minimal composition with lots of negative space, keep the bottom third calm and uncluttered, cinematic wide depth, soft focus edges, muted desaturated tones, no text.
```

### 08 — Jellyfish Over the Sleeping City
```
Vertical portrait image, 4:5 aspect ratio, 1024 x 1280 pixels, full-bleed with no border. Giant translucent glowing jellyfish drifting slowly through the night sky above a quiet sleeping city of small houses, soft blue bioluminescent light, the streets gently flooded with still water mirroring the jellyfish, peaceful and dreamlike. Style: surreal dreamscape, painterly digital art, deep midnight navy and indigo palette with soft silver moonlight, subtle cold blue glow, atmospheric haze and mist, fine film grain, quiet and calm but slightly uncanny, minimal composition with lots of negative space, keep the bottom third calm and uncluttered, cinematic wide depth, soft focus edges, muted desaturated tones, no text.
```

---

## Tips

- If a result is too bright or colorful, add **"underexposed, low key lighting"**.
- Keep any people **small and faceless**. Silhouettes suit the style and avoid uncanny faces.
- Generate 2–4 variations per dream and pick the one with the most negative space at the **bottom**, because the app overlays the title there.
- In Midjourney, also add `--ar 4:5 --style raw` at the end, because it ignores ratios written in text. Other suggested tools:, DALL·E / ChatGPT image, Ideogram, Leonardo, or Firefly. Any tool works.
