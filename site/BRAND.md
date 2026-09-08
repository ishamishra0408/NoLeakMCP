# No-Leak-MCP — brand guidelines (site/)

**Name.** No-Leak-MCP (always hyphenated, never "NoLeak").
**Positioning.** Silent-egress observability and governance for the MCP Slack surface — three registrations into dsh, zero agent-loop edits, the leak denied at assembly.
**Voice.** Forensic, plain, numerate. Every number carries its denominator (5/5, 7 of 8). Claims and owed evidence are stated in the same breath. No exclamation marks, no emoji, no "revolutionary".

## Palette (dark only — painted explicitly, `color-scheme: dark`)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b0e14` | page ground (shared with arena + dashboard) |
| `--bg-2` | `#0d1119` | alternating section ground |
| `--panel` / `--panel-2` | `#141925` / `#0f1420` | cards, terminals |
| `--line` | `#232b3a` | hairlines |
| `--ink` / `--dim` | `#e6edf3` / `#8b98a9` | text / secondary text |
| `--accent` | `#58a6ff` | links, tool names, the "agent" colour |
| `--ok` / `--bad` / `--amber` | `#2ea043` / `#f85149` / `#d29922` | deny / leak / detection-only |
| `--brass` | `#c8a96a` | **the one warm accent**: logo stroke, eyebrows, the seal. Justified as the "seal" of a deny — a stamp is brass, not blue. Never used for large fills. |

## Type
- Display: **Instrument Serif** (400, italic for the emphasised phrase). Headlines only.
- Text: **IBM Plex Sans** (400/500/600). Body, UI, tables.
- Code: **IBM Plex Mono** (400/500). Tool names, seats, URLs, evidence paths.
- Scale: display `clamp(2.5rem, 6vw, 4.75rem)/1.02`; h2 `clamp(1.85rem, 3.4vw, 2.75rem)/1.1`; body `1.0625rem/1.6`; small `.875rem`; mono `.8125rem`. Eyebrows: Plex Sans 600, `.75rem`, tracking `.14em`, uppercase, brass.

## Spacing, radius, motion
- Space scale (px): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Section padding 96 desktop / 64 mobile. Container 1120px, gutter 24 / 16.
- Radius: 6 (buttons, code chips), 14 (cards), 999 (pills). No radius above 14 except pills.
- Motion: micro 200ms, reveals 700ms, ease `cubic-bezier(.2,.7,.2,1)`. Parallax plane rates 0.04 / 0.10 / 0.18 / 0.28 / 0.40 (far→front); pointer depth 4–22px, `(hover:hover) and (pointer:fine)` only. Every effect is a `transform`/`opacity` change — never layout. `prefers-reduced-motion`: parallax, ticking and stacking are off; reveals become 300ms opacity fades.
- Layer blending: layered sections end in a 200px gradient to the next ground — no hard cuts.

## Logo mark
`site/assets/mark.svg`: a shield outline in brass with a vertical conduit inside that stops at a horizontal bar — the flow, interrupted. 32×32 grid, 1.75px strokes, no fill. Replaces the 🛡️ emoji in the arena header. Wordmark: "No-Leak-MCP" in Plex Sans 600.

## References consulted (2026-09-08)
- **awwwards.com/websites/technology** (fetched): dark neutral grounds with one accent; geometric text faces; motion as scroll + microinteractions, "restraint with strategic motion". Taken: single warm accent, hairline discipline, motion only where it explains something.
- **21st.dev** (landing fetched; component pages 404): "animated heroes", "cards & grids", "footers" as the reusable-block vocabulary. Taken: build the page from named blocks (`.card .stack .reveal .tabs .stat .pill .btn`).
- **godly.website** → recent.design (403) and **fora.co** (now redirects to an unrelated site): not reachable. The layered hero, stacking cards and container-scroll behaviour follow the transcript's description instead.
