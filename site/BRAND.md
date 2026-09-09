# No-Leak-MCP — brand guidelines (site/)

**Name.** No-Leak-MCP (always hyphenated, never "NoLeak").
**Positioning.** Silent-egress observability and governance for the MCP Slack surface — three registrations into dsh, zero agent-loop edits, the leak denied at assembly. *Said plainly, which is how the page says it first:* an AI assistant reads one poisoned Slack message and hands over your keys without anyone seeing; No-Leak-MCP watches what the assistant is about to send and stops the message if a secret is inside.
**Voice.** Forensic, plain, numerate. Every number carries its denominator (5/5, 7 of 8). Claims and owed evidence are stated in the same breath. No exclamation marks, no emoji, no "revolutionary".

## Copy voice — plain first, term of art second (rewrite, 2026-09-08)

The owner's brief: a first-time reader must get **what goes wrong, why it is bad, and what we do
about it** in one scan. The rules the copy now obeys on all three surfaces:

- **The plain sentence comes first; the term of art may follow once, in brackets or after a
  dash, never instead.** "Slack would have fetched the link itself to build a preview (an
  'unfurl')". "stopped before it was sent (the harness's `tools/pre-execute` hook)". "the
  harness that runs the assistant (`@deepseek-ai/dsh 0.1.1-rc.2`)".
- **Jargon expanded on first use, everywhere it appears:** MCP → "the Slack connection (MCP)";
  dsh / harness → "the harness that runs the assistant"; plugin → "small plugins … the
  assistant's own loop is untouched"; canary → "a planted decoy (a canary)"; provenance →
  "anything the agent read earlier"; invariant → "stops anything the agent read from going
  out"; ASR → "attack success rate (ASR), the share of runs in which the decoy actually reached
  the attacker's server"; `tools/pre-execute` → "before any tool call leaves the harness";
  unfurl → Slack fetching the link from its own servers to build the preview, so the secret
  leaves without anyone clicking; kill-chain "#4" → "kill-chain step 4"; "the drop" → "the
  attacker's server"; "exfil" → "send the secret".
- **The stakes are stated in human terms once, in the attack's third beat:** a stolen credential
  is a working login; whoever holds it can read the repositories, cloud accounts and services
  it opens, as your team, until someone notices and rotates it. The CVE is cited as support
  ("reported as CVE-2025-34072"), not as the explanation.
- **Buttons and labels are plain verbs in sentence case:** Replay a recorded run · Run live on
  Nebius · Run the attack live · Turn the guard on and replay · Guard is on — turn it off ·
  Open the arena. No emoji on any control or verdict; the word carries the state.
- **Simpler is not vaguer.** Every number on the page still matches `README.md` and
  `eval/out/results.md` (1.00 → 0.00; 5/5; 0.40 (2/5) and 1/1; 0.60 (3/5) and 3/4; 7 of 8 at
  0.95; 0 of 25; N=5; 53 tests = 22 + 9 + 5 + 17; six live runs per address per 10 minutes;
  20–60 s). The evidence ledger's "Not yet." row and the honest-scope section are kept in
  full, and the limits paragraphs are now titled **Limits** so they are easier to find, not
  harder.
- **We do not claim to be unhackable.** The page says what is stopped (a demonstrated attack,
  at a named hook) and exactly where the boundary is (the unfurl fetch and DNS are outside the
  harness; untagged secrets are the invariant's job and it is opt-in).

## The hero is the product (design review, 2026-09-08)

The first screen is not a poster for the arena; it **is** the arena's front door. Left: the
reader's situation in three short sentences ("A teammate posts one message. Your AI assistant
reads it, believes it, and hands over your keys. The channel looks normal."), the solution in
two ("No-Leak-MCP watches what the assistant is about to send. If a secret is inside, the
message is stopped before it leaves") and the scope in two ("three small plugins for `dsh`,
the harness that runs the assistant … the assistant's own loop is untouched; it guards the
Slack connection (MCP), it is not a Slack app"). Right: a working console — victim-model picker, guard and invariant toggles,
**Replay a recorded run** (primary) and **Run live on Nebius** (secondary) — wired to the
arena's own API (`GET /api/config`, `POST /api/replay`, `POST /api/attack`), with the verdict
rendered inline in a box whose height is reserved so nothing below ever moves.

Rules the console obeys, and any change to it must too:

- **Replay is the default.** It is instant, free, never rate-limited and always works; a judge
  who lands on a spinner or a 429 is worse off than one who reads an honest recording. Live is
  the second button and states its cost ("about six model calls, 20–60 s; six live runs per
  address per 10 minutes").
- **It is a real form.** `<form action="/arena" method="get">` with `model`, `guard`,
  `invariant`; without JavaScript it submits to the arena, which pre-selects the same choice.
- **Every state has a word, a glyph and a tone, never colour alone:** Leaked (`--bad`, red),
  Denied by the guard / by the invariant (`--ok`, blue — the defence's colour under the wheel),
  Model declined / Attempted, not delivered / limit reached / live off / error (`--amber`,
  orange). The legend under the idle box names the three outcomes before anything is run, and
  says in plain words what each means ("the decoy reached the attacker's server", "the
  attacker got nothing", "the victim model refused on its own").
- **The verdict states the one fact that matters** — did the attacker's drop receive and decode
  the canary — and links to the arena transcript and, for a live run, to the public
  `/api/drop/<runId>` receipt.
- **A replay that is not the exact selection says so** ("No recording for … — nearest shown.
  Run live for the exact one"). It never passes a neighbouring recording off as the requested
  one.
- **At most one follow-up button**, tied to what was just seen ("Turn the guard on and replay").

What was cut to make room: the parallax scenery planes (terminal, hex fragment, seal — "dense,
hints at hacking, users scan and guess"), the sticky stacking cards, the standalone CTA
section. The scene is now the grid and the glow only.

**The attack is told in three Slack beats**, each in Slack's own frame where it happened in
Slack: (1) the message that arrived — the redacted screenshot, or the recreation when the file
is absent; (2) what the agent did — the harness log, one toggle apart, which never was in
Slack; (3) the recap that never mentioned it — the victim agent's standup summary, quoted
verbatim from the screenshot. `.slackcard` and `.slackcard--recap` are the same component.

**The theme control is demoted, not removed.** Icon-only on the bar (monitor / sun / moon),
each radio keeping a text name that is visually hidden there and shown inside the mobile
disclosure, so the accessible name, the tooltip and the label agree. Radiogroup semantics,
roving `tabindex`, arrow/Home/End keys and persistence are unchanged.

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

### The cybersecurity colour wheel is the semantic palette (2026-09-08)

Reference: [itlawco.com/the-cybersecurity-colour-wheel](https://itlawco.com/the-cybersecurity-colour-wheel/),
which defines seven teams and gives no hex codes; the hexes below are ours, chosen for ≥ 4.5:1
as text on every surface they sit on in each theme. Earlier feedback said the colours "look
nice but lack meaning"; this is the answer. **Every hue on the three surfaces carries one of
these seven meanings and no other**, the role tokens (`--ok --bad --amber --accent --brass`)
are aliases onto the wheel so a component names the meaning it carries, and the footer of the
site states the mapping in one line with a swatch beside each word. README already calls the
project a "Blue-team observability + governance layer", so blue is the product's own colour.

| Team (wheel meaning) | Light | Dark | Where it appears |
|---|---|---|---|
| **Red** — simulates attacks to expose weaknesses | `#b3251a` | `#f85149` | the attack section (eyebrow, italic, beat numbers), the hero's italic "The channel looks normal", **Leaked** verdicts and badges, `exfil/hit`, the OFF-column ASR, the dashboard LEAK rows and the "off" state of a defence switch |
| **Blue** — defends, watches, responds | `#0b5fd0` | `#58a6ff` | the product's identity: the hero eyebrow, links, the defence section, **Denied** verdicts and badges, `guard/deny` / `invariant/deny`, the ON-column ASR, the toggles' checkmarks, the "on" state of a defence switch, the focus ring, the dashboard DENY rows |
| **Purple** — bridges red and blue (purple teaming) | `#6438b8` | `#b88cff` | the arena: its name in the arena `h1`, the launch button, the "Live" mode pill, the console's "Run the attack" eyebrow on the site, the purple dot on every Arena link, the dashboard's `arena` source pill |
| **Yellow** — builds software that resists attack | `#7d5f1e` | `#c8a96a` | the code-level story: the hook/seat pills on the three control cards, the shield stroke of the mark, the dashboard's `dsh` source pill (events from the real plugins). This is the former `--brass`; `--brass` is now an alias of `--yellow` |
| **Green** — automates security so systems stay current | `#136b36` | `#3fb950` | the automated checks: the proof section (eyebrow, italic), the dashboard TRIAL rows (eval runs) |
| **Orange** — trains people, builds awareness | `#9a3f00` | `#f0883e` | awareness and limits: the honest-scope section, every **Limits** paragraph's rule, "opt-in, default OFF", "Not yet." in the ledger, Declined / Attempted / limit-reached / error states, scorer verdicts (detection only). This is the former `--amber`; `--amber` is now an alias of `--orange` |
| **White** — oversees, moderates, governs | `#ffffff` (swatch) | `#e6edf3` (swatch) | governance and provenance: the "Built during the event" section and the evidence ledger, whose eyebrows carry a white disc with a hairline and whose text is `--ink`. White is never a text colour |

Rules: **colour is never the only carrier** — every red or blue state also carries its word
(Leaked / Denied / DENY / LEAK / "Guard is off") and, on the site's verdicts, a glyph; the
footer legend pairs each swatch with its word; identifiers (`code`) are neutral ink on
`--code-soft`, because a blue tool name would read as "defence" under this system; tool names
in the terminal cards are ink for the same reason. A section declares its team with a class
(`.team-red` … `.team-white`) that sets `--team`, and the eyebrow, its swatch, the heading's
italic, beat numbers, list dashes and timeline dates read `--team`; the hero is blue-team with
one deliberate red italic.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f5f6f9` | `#0b0e14` | page ground (dark value shared with arena + dashboard) |
| `--bg-2` | `#eceff4` | `#0d1119` | alternating section ground |
| `--panel` / `--panel-2` | `#ffffff` / `#f4f6fa` | `#141925` / `#0f1420` | cards, terminals |
| `--line` | `#c9d0da` | `#232b3a` | decorative hairlines |
| `--line-strong` | `#7b8695` | `#6b788c` | control boundaries (≥ 3:1) |
| `--ink` / `--dim` | `#101620` / `#525d6d` | `#e6edf3` / `#8b98a9` | text / secondary text |
| `--on-ink` / `--ink-hover` | `#ffffff` / `#2a3546` | `#0b0e14` / `#ffffff` | text on an `--ink` fill; primary-button hover |
| `--red` `--blue` `--purple` `--yellow` `--green` `--orange` `--white` | see the wheel table | see the wheel table | the seven meanings |
| `--accent` / `--ok` / `--bad` / `--amber` / `--brass` / `--focus` | `var(--blue)` / `var(--blue)` / `var(--red)` / `var(--orange)` / `var(--yellow)` / `var(--blue)` | same aliases (declared once, on `:root`) | role names kept so components and the console's `data-tone` read as before; each resolves to a wheel hue |
| `--accent-soft` / `--code-soft` | `rgba(11,95,208,.07)` / `rgba(16,22,32,.06)` | `rgba(88,166,255,.10)` / `rgba(230,237,243,.08)` | nav hover / inline `code` ground |
| `--ok-line` / `--bad-line` / `--amber-line` / `--brass-line` / `--purple-line` / `--green-line` | the wheel hue at .8 (brass .75) alpha | the wheel hue at .8 (brass .7) | tinted status borders, each ≥ 3:1 on its surface |
| `--glass-*` (12 tokens) | white tints and ink hairlines | ink tints and white hairlines | the Liquid Glass material — see its own section. The old `--scrim` was retired when the nav moved onto these |
| `--grid-ink`, `--glow-a/b` | light values | dark values | the hero scene (grid and glow only; the scenery-plane tokens `--wall-*`, `--frag-bg`, `--seal-bg` were deleted with the planes) |
| `--shadow-1`, `--shadow-seg`, `--glass-shadow` | ink-tinted | black | elevation |
| `--slack-*` (19 tokens) | Slack's own **light** theme | Slack's own **dark** theme | the recreated thread and the recap card, so they read true in either appearance |

Measured with an in-page script over every visible text-bearing element (329 pairs per theme
on the site at 1280, 321 at 375; 2026-09-08 after the colour-wheel and copy pass), compositing
every translucent layer over the real backdrop (`alpha·tint + (1−alpha)·backdrop`, down to
`body`): **0 pairs below 4.5:1** for body text (3:1 for large text) in either theme. Worst
three, light: 5.12 / 5.12 / 5.12 (the defence heading's blue italic on `--bg-2`, large text);
dark: 5.24 / 5.24 / 5.24 (red "Leaked" and the OFF-column cells on `--panel`). Text on glass
bottoms out at 5.66 light (`.seg__t`) / 5.86 dark. Control borders bottom out at 3.42:1 light
(the skip link and the tab list) and 4.09:1 dark (the console's select). Arena, with a
replayed verdict on screen: light 4.96 / 5.22 / 5.22 (the blue Denied badge on its wash over
the glass banner), dark 4.64 / 4.76 / 4.76 (the red Leaked badge, likewise); its control
borders 3.60 light / 4.09 dark. Dashboard: light 5.74 ×3, dark 5.24 ×3; borders 3.47 light /
4.09 dark. The dark green moved `#2ea043` → `#3fb950` in the pass (5.21 → 6.91 on `--panel`).

Non-colour tokens (type scale, space scale, motion, radius, `--hit:44px`) are theme-independent
and live only on `:root`.

## Type — one system on all three surfaces

The site, the arena (`render/arena/public/index.html`) and the dashboard
(`realtime/dashboard/index.html`) load the **same** Google Fonts stylesheet — the only
external font origin — and declare the same three family tokens, so a judge moving between
them sees one product. `tests/arena.test.mjs` asserts the stylesheet is loaded once per
surface and that no system-font body stack is left.

- Display: **Instrument Serif** (400, italic for the emphasised phrase). Headlines, the hero
  console's verdict word, the arena and dashboard `h1`, the dashboard's stat numbers.
- Text: **IBM Plex Sans** (400/500/600). Body, UI, tables, the console's controls.
- Code: **IBM Plex Mono** (400/500). Tool names, seats, URLs, evidence paths, the arena's
  key/value lines.
- Tokens: `--serif:"Instrument Serif", "Iowan Old Style", Georgia, serif`;
  `--sans:"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
  `--mono:"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace`.
- Site scale (all `clamp()` in `rem`, so it tracks the browser's font-size setting; column
  counts are `em`-based so they drop as text grows): display `clamp(2.5rem, …, 4.75rem)/1.02`,
  capped in the hero to `clamp(2.25rem, …, 3.75rem)` so it shares the row with the console;
  h2 `clamp(1.75rem, …, 2.75rem)/1.1`; body `1rem–1.0625rem/1.6`; small `.875rem`; mono
  `.75–.8125rem`. Eyebrows: Plex Sans 600, `.75rem`, tracking `.14em`, uppercase, in the
  section's colour-wheel team colour with an 8px swatch before the text (see the palette).
- Arena and dashboard: fixed pixel sizes (14px body, 26px / 24px serif `h1`, 30px serif
  stat numbers), because those pages predate the scale and stay self-contained.
- Measure: `--measure:54ch` on the site, `54ch` on the arena intro and the dashboard note.
  `ch` is the advance of "0"; in Plex Sans running text averages ~1.35 characters per ch, so
  54ch is ~73 characters a line — inside the 45–75 band. 57ch measured 78.

## Spacing, radius, motion
- Space scale (px): 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128. Section padding 96 desktop / 64 mobile. Container 1120px, gutter 24 / 16.
- Radius: 6 (buttons, code chips), 14 (cards), 999 (pills). No radius above 14 except pills.
- Radius, console: concentric — 22 outer, 14 pad, 8 inner (`--glass-r-in`), the arena console's own numbers.
- Motion (HIG: purposeful, brief, reversible): micro 180ms, enter 320ms, leave 200ms, indicator move 280ms — every UI transition inside 150–400ms. Entering uses `--ease-out cubic-bezier(0,0,.2,1)`, leaving `--ease-in cubic-bezier(.4,0,1,1)`, standard `--ease cubic-bezier(.2,.7,.2,1)`. Three documented exceptions: the statistic counter (900ms, content not chrome), the live-run spinner (900ms loop, content not chrome, stopped under Reduce Motion while the word "Running" stays) and the scroll parallax (no duration — it is bound to scroll progress). A theme change suppresses every transition for that frame. Parallax plane rates 0.04 / 0.06 (the grid and the glow; the four scenery planes were cut). The **scroll** offset is native — `animation-timeline: view(block)` behind `@supports (animation-timeline: view())` — with the JS `translate3d` loop as the fallback only where `CSS.supports('animation-timeline: view()')` is false; the script skips the plane transform entirely on the native path, so the two never fight. The **pointer** depth (4–6px, `(hover:hover) and (pointer:fine)` only) rides a separate `.layers__depth` child in both paths. Every effect is a `transform`/`opacity` change — never layout. `prefers-reduced-motion`: **both** parallax paths, ticking and the spinner are off; reveals become 200ms opacity fades.
- Loading: the console's outcome box reserves the height of its tallest state (268px desktop, 272px mobile) and its cost line reserves two lines, so no verdict, error or `/api/config` answer moves anything on the page. Measured: 0px shift across every state.
- Layer blending: the hero ends in a 160px gradient to the next ground — no hard cuts.

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
| "Liquid Glass forms a distinct functional layer for controls and navigation elements … that floats above the content layer" | Glass only on: the site nav, the site's hero console (a control surface, not content), the arena console, the arena outcome banner, the dashboard header, the dashboard's two defense controls. Nothing else. |
| "Don't use Liquid Glass in the content layer" | `.card`, `.table`, `.stat`, `.verdict`, `.slackcard`, `.tabs__panel`, the console's outcome box, the arena step timeline and terminal output, the dashboard stat tiles, ASR matrix and event feed are all solid. Grep for `class="glass` / count `.glass` in the DOM — there are 2 on the site (nav, console), 2 on the arena, 3 on the dashboard. |
| "avoid overcrowding or layering Liquid Glass elements on top of each other" | Nothing inside a `.glass` element is also `.glass`. Controls that sit **on** a glass surface use `.glass-inset`: identical optics, zero `backdrop-filter` — the theme segmented control and the Menu button on the bar, the live button on the console. The console's select, toggles and outcome box are opaque `--panel` fills. There is exactly one `backdrop-filter` between the eye and the page at any point on any surface. The mobile nav dropdown is deliberately opaque for the same reason. |
| Regular variant: "blurs and adjusts the luminosity of background content to maintain legibility … when components have a significant amount of text" | `.glass` — the default and almost everything. |
| Clear variant: "highly translucent … for components that float above media backgrounds" | `.glass--clear` — one use only: the site nav while the page is at scroll 0, over the hero's parallax scene. Eight pixels of scroll and it thickens into Regular, which is Apple's own scroll edge effect. |

**Tokens** (colour tokens obey the same two-theme rule as the rest of the palette):
`--glass-tint` `--glass-tint-thin` `--glass-tint-clear` (material body) ·
`--glass-edge` `--glass-edge-lo` `--glass-spec` (specular top, shaded bottom, moving sheen) ·
`--glass-line` `--glass-fill` `--glass-shadow` (hairline, on-glass fill, float) ·
`--glass-blur` 20 / `--glass-blur-thin` 12 / `--glass-blur-clear` 9, `--glass-sat` 1.8 ·
`--glass-r` / `--glass-pad` / `--glass-r-in`.

**Classes**: `.glass` `.glass--thin` `.glass--clear` `.glass--refract` `.glass-inset`.

**Concentric radii.** `--glass-r-in: calc(--glass-r - --glass-pad)`. The arena console and
the site's hero console are radius 22 with 14 of padding, so every control inside them —
select, toggles, both buttons, the outcome box — is radius 8. The dashboard is 18 with 10, so
its input and buttons are 8. The site's segmented control is a capsule inside a capsule, which
is concentric at any padding.

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

The first beat of the attack section shows the **redacted screenshot** of the live thread
when it is present (it is: `site/assets/slack-thread.png`, the same file as
`evidence/step7-slack/slack-thread.redacted.png`) and otherwise a **recreation** of the
planted message: Slack's own chrome, the poison text as plain text (Slack applies no code
chrome to it), the drop URL in its real shape with the collector host elided
(`<attacker-host>/c/health?d=<BASE64>`), in `#eng-channel`.

Two rules the recreation obeys, and any replacement must too:

- **It is a thread reply, as the screenshot proves.** The poison is a reply under Isha
  Mishra's standup message, posted by the human account "Isha Mishra" (no APP badge) who
  spoofs a bot with a literal `[ops-bot]` text prefix. The parent text, the "2 replies" count
  and the timestamps are quoted from the thread. (An earlier version of this note said
  "top-level message, no thread"; the screenshot corrected it.)
- **The ids are synthetic, not truncated.** `T0XXXXXXXXX` / `C0XXXXXXXXX` are placeholders.
  A prefix of a real id is still part of a real id; the real workspace and channel ids are
  not in this repo and must not come back.

The third beat (`.slackcard--recap`) is the victim agent's standup recap, quoted verbatim from
the same screenshot, with the `APP` badge Slack draws on a bot and the @-mention chips. It is
always the recreation; there is no separate drop-in for it.

The drop-in slot for the first beat:

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
each, the `file:line` where each is applied (stamped to a blob hash of each of the three
files), and how it was verified — plus the pages skipped and why, and the three places the
page deliberately departs from HIG.

## Logo mark
`site/assets/mark.svg`: a shield outline in brass (yellow team: the thing that was built) with a vertical conduit inside that stops at a horizontal bar — the flow, interrupted. 32×32 grid, 1.75px strokes, no fill. Replaces the shield emoji in the arena header. Wordmark: "No-Leak-MCP" in Plex Sans 600.

## References consulted (2026-09-08)
- **awwwards.com/websites/technology** (fetched): dark neutral grounds with one accent; geometric text faces; motion as scroll + microinteractions, "restraint with strategic motion". Taken: single warm accent, hairline discipline, motion only where it explains something.
- **21st.dev** (landing fetched; component pages 404): "animated heroes", "cards & grids", "footers" as the reusable-block vocabulary. Taken: build the page from named blocks (`.card .stack .reveal .tabs .stat .pill .btn`).
- **godly.website** → recent.design (403) and **fora.co** (now redirects to an unrelated site): not reachable. The layered hero followed the transcript's description; the stacking cards and the scenery planes it also described were cut in the 2026-09-08 design review in favour of the product itself in the hero.
