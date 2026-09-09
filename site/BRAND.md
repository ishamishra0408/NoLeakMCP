# No-Leak-MCP — brand guidelines (site/)

**Name.** No-Leak-MCP (always hyphenated, never "NoLeak").
**Positioning.** Silent-egress observability and governance for the MCP Slack surface — three registrations into dsh, zero agent-loop edits, the leak denied at assembly.
**Voice.** Forensic, plain, numerate. Every number carries its denominator (5/5, 7 of 8). Claims and owed evidence are stated in the same breath. No exclamation marks, no emoji, no "revolutionary".

## Palette — two themes, one token set

The site ships **light and dark**, and the reader can override the system setting with the
System / Light / Dark segmented control in the nav (stored in `localStorage` under
`nlm-theme`; choosing System removes the key, so the platform setting is the resting state).

The colour architecture is a rule the stylesheet states and a script checks:

1. **Every colour token gets its full value on bare `:root`** — that block *is* the light palette.
2. The dark palette is declared **twice, byte-identical**: once inside
   `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { … } }` and once
   under `:root[data-theme="dark"] { … }`. The `:not([data-theme="light"])` guard is what lets
   an explicit Light choice win over a dark system preference.
3. **No colour has its only definition inside a media query or a `[data-theme]` block.**
4. Components reference tokens, never literals. The one `#000` left in component CSS is a
   **mask alpha stop**, commented as such.
5. `body` gets an explicit token background (`--bg`) — it never borrows the host's ground.

`--line` is a *decorative* hairline (separators, table rules). `--line-strong` bounds a
**control** and is held to ≥ 3:1 against its own surface.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f5f6f9` | `#0b0e14` | page ground (dark value shared with arena + dashboard) |
| `--bg-2` | `#eceff4` | `#0d1119` | alternating section ground |
| `--panel` / `--panel-2` | `#ffffff` / `#f4f6fa` | `#141925` / `#0f1420` | cards, terminals |
| `--line` | `#c9d0da` | `#232b3a` | decorative hairlines |
| `--line-strong` | `#7b8695` | `#6b788c` | control boundaries (≥ 3:1) |
| `--ink` / `--dim` | `#101620` / `#525d6d` | `#e6edf3` / `#8b98a9` | text / secondary text |
| `--on-ink` / `--ink-hover` | `#ffffff` / `#2a3546` | `#0b0e14` / `#ffffff` | text on an `--ink` fill; primary-button hover |
| `--accent` | `#0b5fd0` | `#58a6ff` | links, tool names, the "agent" colour |
| `--ok` / `--bad` / `--amber` | `#136b36` / `#b3251a` / `#7a5200` | `#2ea043` / `#f85149` / `#d29922` | deny / leak / detection-only |
| `--brass` | `#7d5f1e` | `#c8a96a` | **the one warm accent**: logo stroke, eyebrows, the seal, the focus ring. A stamp is brass, not blue. Never a large fill |
| `--focus` | `#7d5f1e` | `#c8a96a` | `:focus-visible` ring |
| `--accent-soft` | `rgba(11,95,208,.07)` | `rgba(88,166,255,.10)` | inline `code` ground, nav hover |
| `--ok-line` / `--bad-line` / `--amber-line` / `--brass-line` | same hue at .8 / .8 / .8 / .75 alpha | same hue at .8 / .8 / .8 / .7 | tinted status borders, each ≥ 3:1 on its surface |
| `--scrim` | `rgba(245,246,249,.72)` | `rgba(11,14,20,.72)` | the sticky-nav material, under `backdrop-filter` |
| `--grid-ink`, `--glow-a/b`, `--wall-ink`, `--wall-bad`, `--frag-bg`, `--seal-bg` | light values | dark values | the parallax scenery |
| `--shadow-1/-2/-3/-seg` | ink-tinted | black | elevation |
| `--slack-*` (14 tokens) | Slack's own **light** theme | Slack's own **dark** theme | the recreated thread, so it reads true in either appearance |

Measured with an in-page script over every visible text-bearing element (372 pairs per theme):
**0 pairs below 4.5:1** for body text (3:1 for large text) in either theme; worst pair 4.64:1
light, 5.20:1 dark. Control borders bottom out at 3.20:1 light and 3.78:1 dark.

Non-colour tokens (type scale, space scale, motion, radius, `--hit:44px`) are theme-independent
and live only on `:root`.

## Type
- Display: **Instrument Serif** (400, italic for the emphasised phrase). Headlines only.
- Text: **IBM Plex Sans** (400/500/600). Body, UI, tables.
- Code: **IBM Plex Mono** (400/500). Tool names, seats, URLs, evidence paths.
- Scale (all `clamp()` in `rem`, so it tracks the browser's font-size setting; column counts are `em`-based so they drop as text grows): display `clamp(2.5rem, 6vw, 4.75rem)/1.02`; h2 `clamp(1.85rem, 3.4vw, 2.75rem)/1.1`; body `1.0625rem/1.6`; small `.875rem`; mono `.8125rem`. Eyebrows: Plex Sans 600, `.75rem`, tracking `.14em`, uppercase, brass.

## Spacing, radius, motion
- Space scale (px): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Section padding 96 desktop / 64 mobile. Container 1120px, gutter 24 / 16.
- Radius: 6 (buttons, code chips), 14 (cards), 999 (pills). No radius above 14 except pills.
- Motion (HIG: purposeful, brief, reversible): micro 180ms, enter 320ms, leave 200ms, indicator move 280ms — every UI transition inside 150–400ms. Entering uses `--ease-out cubic-bezier(0,0,.2,1)`, leaving `--ease-in cubic-bezier(.4,0,1,1)`, standard `--ease cubic-bezier(.2,.7,.2,1)`. Two documented exceptions: the statistic counter (900ms, content not chrome) and the scroll parallax (no duration — it is bound to scroll progress). A theme change suppresses every transition for that frame. Parallax plane rates 0.04 / 0.06 / 0.10 / 0.18 / 0.28 / 0.40 (far→front). The **scroll** offset is native — `animation-timeline: view(block)` behind `@supports (animation-timeline: view())` — with the JS `translate3d` loop as the fallback only where `CSS.supports('animation-timeline: view()')` is false; the script skips the plane transform entirely on the native path, so the two never fight. The **pointer** depth (4–22px, `(hover:hover) and (pointer:fine)` only) rides a separate `.layers__depth` child in both paths. Every effect is a `transform`/`opacity` change — never layout. `prefers-reduced-motion`: **both** parallax paths (the native scroll timeline and the JS fallback), ticking and stacking are off; reveals become 200ms opacity fades.
- Layer blending: layered sections end in a 200px gradient to the next ground — no hard cuts.

## Liquid Glass — the material, and where it is allowed

One material, three surfaces. The canonical implementation and its full derivation from
Apple's documentation live in **`site/index.html` §4a**; the block is copied verbatim into
`render/arena/public/index.html` and `realtime/dashboard/index.html`, which have to stay
self-contained single files. Same tokens, same class names, same rules everywhere, so a
judge moving between the site, the arena and the dashboard sees one product.

**Sources read 2026-09-08** (Apple's human URLs are a JavaScript SPA; the DocC data
endpoints are what was actually fetched):
`technologyoverviews/liquid-glass`, `technologyoverviews/adopting-liquid-glass`, and
HIG `materials` via `developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json`.

**The five rules taken from those pages, and what each one costs us**

| Apple's rule | What this project does |
|---|---|
| "Liquid Glass forms a distinct functional layer for controls and navigation elements … that floats above the content layer" | Glass only on: the site nav, the site's secondary buttons, the arena console, the arena outcome banner, the dashboard header, the dashboard's two defense controls. Nothing else. |
| "Don't use Liquid Glass in the content layer" | `.card`, `.table`, `.stat`, `.verdict`, `.slackcard`, `.tabs__panel`, the arena step timeline and terminal output, the dashboard stat tiles, ASR matrix and event feed are all solid. Grep for `class="glass` — there are 3 on the site, 2 on the arena, 3 on the dashboard. |
| "avoid overcrowding or layering Liquid Glass elements on top of each other" | Nothing inside a `.glass` element is also `.glass`. Controls that sit **on** the bar use `.glass-inset`: identical optics, zero `backdrop-filter`. There is exactly one `backdrop-filter` between the eye and the page at any point on any surface. The mobile nav dropdown is deliberately opaque for the same reason. |
| Regular variant: "blurs and adjusts the luminosity of background content to maintain legibility … when components have a significant amount of text" | `.glass` — the default and almost everything. |
| Clear variant: "highly translucent … for components that float above media backgrounds" | `.glass--clear` — one use only: the site nav while the page is at scroll 0, over the hero's parallax scene. Eight pixels of scroll and it thickens into Regular, which is Apple's own scroll edge effect. |

**Tokens** (colour tokens obey the same two-theme rule as the rest of the palette):
`--glass-tint` `--glass-tint-thin` `--glass-tint-clear` (material body) ·
`--glass-edge` `--glass-edge-lo` `--glass-spec` (specular top, shaded bottom, moving sheen) ·
`--glass-line` `--glass-fill` `--glass-shadow` (hairline, on-glass fill, float) ·
`--glass-blur` 20 / `--glass-blur-thin` 12 / `--glass-blur-clear` 9, `--glass-sat` 1.8 ·
`--glass-r` / `--glass-pad` / `--glass-r-in`.

**Classes**: `.glass` `.glass--thin` `.glass--clear` `.glass--refract` `.glass-inset`.

**Concentric radii.** `--glass-r-in: calc(--glass-r - --glass-pad)`. The arena console is
radius 22 with 14 of padding, so every control inside it — select, toggles, both buttons —
is radius 8. The dashboard is 18 with 10, so its input and buttons are 8. The site's
segmented control is a capsule inside a capsule, which is concentric at any padding.

**The refraction (the SVG layer).** `backdrop-filter: blur() saturate()` reflects and dims
but does not bend, so the bend is an SVG filter — `feTurbulence` at a base frequency wide
enough that the noise field is larger than the element (so it reads as uneven glass
thickness, not frost), smoothed by `feGaussianBlur`, into `feDisplacementMap` at scale 9 —
chained onto the same `backdrop-filter`. The filter lives in **one hidden `<svg>` per page**
holding nothing but `<defs>`, with one id, `#nlmGlassRefract`, reused by every element that
opts in. No element carries an inline filter.

It is an **enhancement, never a dependency**. `url()` inside `backdrop-filter` is honoured
by WebKit and Blink; **Firefox does not honour it**, and `CSS.supports()` only parses, so a
runtime probe asks the engine what it actually computed for a throwaway node and only then
sets `data-glass-refract="on"` on `<html>`. The design is finished with blur alone — delete
the filter and all three surfaces still look right. Only three elements page-wide opt in
(site nav, arena console, dashboard header), because a displaced backdrop is the most
expensive thing on any of these pages.

**Motion.** The pointer moves the specular: `--mx`/`--my` are written on the hovered glass
element only, coalesced into one `requestAnimationFrame`, never bound under Reduce Motion or
on a coarse pointer. Press collapses the float shadow (200ms in, 180ms back). The nav
thickens Clear → Regular over 280ms `--ease-out`. No glass element carries `will-change`.

**Accessibility, all three surfaces.**
- `prefers-reduced-transparency: reduce` → every glass class collapses to an opaque surface
  built from the existing `--panel` / `--bg` tokens, and the refraction is removed.
- `prefers-reduced-motion: reduce` → transitions off; the specular is never bound. The
  Clear → Regular swap still happens, instantly: it is a legibility mechanism, not decoration.
- `@supports not (backdrop-filter: blur(1px))` → the same opaque surface.
- No glass element sets a text colour, and every glass **control** keeps `--line-strong` as
  its border, so the 3:1 control-boundary floor is met by the border, not by the material.

**Apple's dimming layer.** HIG specifies "a dark dimming layer of 35% opacity" behind clear
glass over bright content. That is written for light foregrounds over bright media; here the
foreground on clear glass is dark ink over a light ground, so the veil runs the other way —
`--glass-tint-clear` is 16% white in light and 22% ink in dark. Same mechanism: a fixed
opacity floor that holds no matter what scrolls underneath.

## Adding the real Slack screenshot

The attack section shows a **recreation** of the planted message: Slack's own chrome, the
`POISON` text copied verbatim from `eval/slack/plant.mjs` as plain text (Slack applies no code
chrome to it), the drop URL in its real shape with the collector host elided
(`…/c/slack-health?d=<base64>`), and `ops-bot` with an `APP` badge in `#eng-channel`.

Two rules the recreation obeys, and any replacement must too:

- **It is a top-level channel message, not a thread.** `eval/slack/plant.mjs` posts one
  `chat.postMessage` with no `thread_ts`. No parent message, no reply count, no wall-clock
  timestamp — none of that exists in any repo source, so none of it is drawn.
- **The ids are synthetic, not truncated.** `T0XXXXXXXXX` / `C0XXXXXXXXX` are placeholders.
  A prefix of a real id is still part of a real id; the real workspace and channel ids are
  not in this repo and must not come back.

There is a drop-in slot for the genuine article:

1. Take a screenshot of the planted thread and **redact the workspace, channel and user ids
   and any real message bodies** before it leaves your machine.
2. Save it as **`site/assets/slack-thread.png`**. Nothing else needs editing.
3. `render/arena/server.mjs` checks for that file on every request for `/`. When it exists the
   server marks the page `<body data-slack-shot="1">`, which hides the recreation, shows the
   image, and swaps the caption from *"Recreation of the planted thread…"* to *"Redacted
   screenshot of the planted thread…"*. The image request is only ever made when the server
   said the file is there, so a site without it never fires a 404.
4. The slot is a fixed `aspect-ratio: 16/10` box, so dropping the file in cannot shift the
   layout while the image decodes. A landscape image around 1600×1000 fits without letterboxing.
5. Both directions are covered by `tests/arena.test.mjs` ("the Slack screenshot drop-in slot is
   detected server-side, both ways"), which writes a 1×1 PNG, asserts the marker appears, then
   deletes it and asserts it clears.

Only `.svg`, `.png`, `.ico` and `.webp` are servable from `site/assets/`, by basename only.

## Human Interface Guidelines

`site/HIG.md` records the 24 Apple HIG pages consulted, 2–5 testable guidelines taken from
each, the `file:line` where each is applied, and how it was verified — plus the pages skipped
and why, and the two places the page deliberately departs from HIG.

## Logo mark
`site/assets/mark.svg`: a shield outline in brass with a vertical conduit inside that stops at a horizontal bar — the flow, interrupted. 32×32 grid, 1.75px strokes, no fill. Replaces the 🛡️ emoji in the arena header. Wordmark: "No-Leak-MCP" in Plex Sans 600.

## References consulted (2026-09-08)
- **awwwards.com/websites/technology** (fetched): dark neutral grounds with one accent; geometric text faces; motion as scroll + microinteractions, "restraint with strategic motion". Taken: single warm accent, hairline discipline, motion only where it explains something.
- **21st.dev** (landing fetched; component pages 404): "animated heroes", "cards & grids", "footers" as the reusable-block vocabulary. Taken: build the page from named blocks (`.card .stack .reveal .tabs .stat .pill .btn`).
- **godly.website** → recent.design (403) and **fora.co** (now redirects to an unrelated site): not reachable. The layered hero, stacking cards and container-scroll behaviour follow the transcript's description instead.
