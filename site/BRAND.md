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
- Motion (HIG: purposeful, brief, reversible): micro 180ms, enter 320ms, leave 200ms, indicator move 280ms — every UI transition inside 150–400ms. Entering uses `--ease-out cubic-bezier(0,0,.2,1)`, leaving `--ease-in cubic-bezier(.4,0,1,1)`, standard `--ease cubic-bezier(.2,.7,.2,1)`. Two documented exceptions: the statistic counter (900ms, content not chrome) and the scroll parallax (no duration — it is bound to scroll progress). A theme change suppresses every transition for that frame. Parallax plane rates 0.04 / 0.06 / 0.10 / 0.18 / 0.28 / 0.40 (far→front). The **scroll** offset is native — `animation-timeline: view(block)` behind `@supports (animation-timeline: scroll())` — with the JS `translate3d` loop as the fallback only where `CSS.supports('animation-timeline: scroll()')` is false; the script skips the plane transform entirely on the native path, so the two never fight. The **pointer** depth (4–22px, `(hover:hover) and (pointer:fine)` only) rides a separate `.layers__depth` child in both paths. Every effect is a `transform`/`opacity` change — never layout. `prefers-reduced-motion`: **both** parallax paths (the native scroll timeline and the JS fallback), ticking and stacking are off; reveals become 200ms opacity fades.
- Layer blending: layered sections end in a 200px gradient to the next ground — no hard cuts.

## Adding the real Slack screenshot

The attack section shows a **recreation** of the planted thread: Slack's own chrome, the
`POISON` text copied verbatim from `eval/slack/plant.mjs`, the drop URL in its real shape
(`…/c/slack-health?d=<base64>`), `ops-bot` with an `APP` badge in `#eng-channel`, and the
workspace/channel ids masked as `T0BV…` / `C0BV…` — the repo's redaction removed the real ids
on purpose and they must not come back.

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
