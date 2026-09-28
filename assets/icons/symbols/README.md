# Symbol icons

Line-art icons for dream symbols. The **file name is the symbol `key`** the AI must return (see `docs/SCREENS.md` §4 and §7).

- 48×48 `viewBox`, `fill="none"`, **white** stroke (`stroke="#FFFFFF"`), stroke width 1.5, round caps and joins.
- They have no circle around them. The `SymbolIcon` component draws the circle and the `xN` badge.
- The stroke is set only on the root `<svg>`, so they can be recolored in code by passing a `stroke` prop (e.g. ink on the light Patterns and Settings screens).
- `star.svg` is the **fallback** for any symbol the AI returns that isn't in this list.

Preview: [`docs/reference/symbols-preview.jpg`](../../../docs/reference/symbols-preview.jpg)

## Keys (30)

| Nature | Creatures | Places & things | Abstract |
| --- | --- | --- | --- |
| `water` | `wolf` | `door` | `light` |
| `ocean` | `crow` | `house` | `heart` |
| `fire` | `cat` | `stairs` | `death` |
| `desert` | `snake` | `train` | `eye` |
| `forest` | `bird` | `mirror` | `mask` |
| `mountain` | `web` | `key` | `star` (fallback) |
| `grass` | | | |
| `cloud` | | | |
| `wind` | | | |
| `snow` | | | |
| `sun` | | | |
| `moon` | | | |
