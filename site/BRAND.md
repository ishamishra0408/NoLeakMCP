# No-Leak-MCP — brand guidelines (site/)

**Name.** No-Leak-MCP (always hyphenated, never "NoLeak").
**Positioning.** Silent-egress observability and governance for the MCP Slack surface — three registrations into dsh, zero agent-loop edits, the leak denied at assembly. *Said plainly, which is how the page says it first:* an AI assistant reads one poisoned Slack message and hands over your keys without anyone seeing; No-Leak-MCP watches what the assistant is about to send and stops the message if a secret is inside.
**Voice.** Forensic, plain, numerate. Every number carries its denominator (5/5, 7 of 8). Claims and owed evidence are stated in the same breath. No exclamation marks, no emoji, no "revolutionary".

## One product, three pages (consistency pass, 2026-09-08)

The site (`site/index.html`), the arena (`render/arena/public/index.html`) and the dashboard
(`realtime/dashboard/index.html`) are three pages of one product, and a judge moving between
them must not feel a seam. The rules, all of them checkable by reading the three files side by
side:

- **One token block.** All three declare the same colour tokens with the same values, in the
  same architecture (full light palette on bare `:root`, dark declared twice — see the palette
  section), the same type tokens and scale (`--fs-xs … --fs-h2`), the same space scale
  (`--s-1 … --s-8`), the same `--r 14` / `--r-s 6` / `--hit 44` / `--nav-h 64` / `--gutter 24`
  / `--measure 54ch`, and the same motion tokens. The arena and dashboard used to be dark-first
  with their own light neutrals (`#f6f8fa`, `#1f2328`, `#59636e`, `#d0d7de`) and fixed 13–14px
  type; they now use the site's values and scale.
- **The theme choice travels.** The site's System / Light / Dark control stores `nlm-theme`;
  the arena and the dashboard read the same key before first paint, so a reader who chose Dark
  on the site lands on a dark arena. The control itself lives on the site only.
- **One bar.** Every page opens with the same sticky glass bar (`.site-header` › `.nav`):
  mark + wordmark on the left linking home, links on the right, 64px tall (56 on phones), the
  current page underlined in brass. The arena and dashboard bars carry Site · Arena ·
  Dashboard; the site's carries its sections plus Arena, Dashboard, GitHub and the theme
  control. The bar is the only refracting element on each page.
- **One page-head.** Under the bar, every page states what it is for the same way: an
  `.eyebrow` (small caps, brass), a serif `h1` with one brass italic, a `.lede` in `--dim` at
  `--fs-lg`, then one paragraph of scope at `--fs-sm`. The site's hero is this pattern with the
  console beside it.
- **One console.** The arena's console is the site's hero console: the same `.run` glass pane
  (radius 22, pad 14, controls at 8), the same `.fld__l` labels, `.sel` select with the drawn
  chevron, `.tog` toggles, `.btn--primary` (ink fill) for Replay and `.btn.glass-inset` for
  Live, the same cost line under the buttons. Replay is the default on both.
- **One verdict.** The arena's verdict is the site's `.verdict` card: a solid `--panel` card
  whose border takes the tone (`--ok-line` / `--bad-line` / `--amber-line`), the verdict word
  in Instrument Serif with the same glyph the site's console uses, the fact line in `--ink`,
  then the meta line. The words are the site's: Leaked · Denied by the guard · Denied by the
  invariant · Model declined · Attempted, not delivered · Error. The glass banner is gone.
- **One card, one table, one stat.** `.card`/`.panel` are `--panel` on a `--line` hairline at
  radius 14 with 24–28px padding; `.table` is the site's wrapper (radius 14, `th` in `--dim`
  small caps, 12×16 cells); the dashboard's totals are the site's `.stats` (a 1px `--line`
  grid of `--panel` cells, serif number, `--dim` label). The dashboard's section headings are
  `h2.eyebrow`, so the outline holds (one `h1`, then `h2`s) and the label style matches the
  site's section eyebrows.
- **One footer.** Brand, GitHub, the other two pages, the licence line.
- **Glass only where it floats:** the bar on every page, the console on the site and the
  arena. Nothing else. Site 2, arena 2, dashboard 1; nothing nested. The dashboard's two
  defence switches are opaque `.switch` buttons in the `.tog` idiom (a dot, a tone border, the
  state in words) — they sit on the page ground as content-layer controls and an opaque
  control never buys its contrast down.
- **Density is the same.** Body `--fs-base`/1.6 everywhere; the arena's transcript and the
  dashboard's tables run at `--fs-sm`, the same step down the site uses for captions, table
  cells and the console's labels. No page has its own smaller world.

## Copy voice — plain first, term of art second (rewrite, 2026-09-08)

The owner's brief: a first-time reader must get **what goes wrong, why it is bad, and what we do
about it** in one scan, and each page must say what it is for in one line at the top. The rules
the copy obeys on all three surfaces:

- **Each page opens with its purpose, in one line.** Site: "No-Leak-MCP stops that message
  before it leaves" (the first sentence of the lede, under a headline that states the reader's
  situation). Arena: "Run the attack yourself, and watch the guard stop it." Dashboard: "What
  the defences are doing right now."
- **The plain sentence comes first; the term of art may follow once, in brackets or after a
  dash, never instead.** "Slack would have fetched it to build a link preview (an 'unfurl')".
  "stopped before it was sent (the harness's `tools/pre-execute` hook)". "the harness that runs
  the assistant (`@deepseek-ai/dsh 0.1.1-rc.2`)".
- **Jargon expanded on first use, everywhere it appears:** MCP → "the Slack connection (MCP)";
  dsh / harness → "the harness that runs the assistant"; plugin → "small plugins … the
  assistant's own loop is untouched"; canary → "a planted decoy (a canary)"; provenance →
  "anything the agent read earlier"; invariant → "stops anything the agent read from going
  out"; ASR → "attack success rate (ASR), the share of runs in which the decoy actually reached
  the attacker's server"; `tools/pre-execute` → "before any tool call leaves the harness";
  kill-chain "#4" → "kill-chain step 4"; "the drop" → "the attacker's server"; "exfil" → "send
  the secret".
- **Nothing is said twice.** The scope line ("three small plugins for dsh … the assistant's own
  loop is untouched … not a Slack app") lives in the hero; the defence section no longer
  repeats it in a second sentence. The arena's intro no longer explains itself twice ("where
  the attack meets the defence" went). The "Built during the event" section went — provenance
  lives in `README.md`, `CHANGELOG.md` and the `pre-event` / `event-start` tags, and the footer
  says so in six words.
- **The stakes are stated in human terms once, in the attack's third beat:** a stolen credential
  is a working login; whoever holds it can read the repositories, cloud accounts and services
  it opens, as your team, until someone notices and rotates it. The CVE is cited as support
  ("reported as CVE-2025-34072"), not as the explanation.
- **Buttons and labels are plain verbs in sentence case, identical on the site and the arena:**
  Replay a recorded run · Run live on Nebius · Turn the guard on and replay · Guard is on —
  turn it off · Open the arena. No emoji on any control or verdict; the word carries the state.
- **Simpler is not vaguer.** Every number on the page still matches `README.md` and
  `eval/out/results.md` (1.00 → 0.00; 5/5; 0.40 (2/5) and 1/1; 0.60 (3/5) and 3/4; 7 of 8 at
  0.95; 0 of 25; N=5; six live runs per address per 10 minutes; 20–60 s). The evidence ledger's
  "Not yet." row and the honest-scope section ("What it does not catch — before a judge asks")
  are kept in full, word for word.
- **We do not claim to be unhackable.** The page says what is stopped (a demonstrated attack,
  at a named hook) and exactly where the boundary is (the unfurl fetch and DNS are outside the
  harness; untagged secrets are the invariant's job and it is opt-in).

## The hero is the product (design review, 2026-09-08)

The first screen is not a poster for the arena; it **is** the arena's front door. Left: the
reader's situation in three short sentences ("A teammate posts one message. Your AI assistant
reads it, believes it, and hands over your keys. The channel looks normal."), the fix in one
("No-Leak-MCP stops that message before it leaves") and the scope in two ("three small plugins
for `dsh`, the harness that runs the assistant … the assistant's own loop is untouched; it
guards the Slack connection (MCP), it is not a Slack app"). Right: a working console —
victim-model picker, guard and invariant toggles, **Replay a recorded run** (primary) and **Run
live on Nebius** (secondary) — wired to the arena's own API (`GET /api/config`,
`POST /api/replay`, `POST /api/attack`), with the verdict rendered inline in a box whose height
is reserved so nothing below ever moves.

Rules the console obeys, and any change to it must too:

- **Replay is the default.** It is instant, free, never rate-limited and always works; a judge
  who lands on a spinner or a 429 is worse off than one who reads an honest recording. Live is
  the second button and states its cost ("about six model calls, 20–60 s; six live runs per
  address per 10 minutes").
- **It is a real form.** `<form action="/arena" method="get">` with `model`, `guard`,
  `invariant`; without JavaScript it submits to the arena, which pre-selects the same choice.
- **Every state has a word, a glyph and a tone, never colour alone:** Leaked (`--bad`, red),
  Denied by the guard / by the invariant (`--ok`, green), Model declined / Attempted, not
  delivered / limit reached / live off / error (`--amber`). The legend under the idle box names
  the three outcomes before anything is run, and says in plain words what each means ("the
  decoy reached the attacker's server", "the attacker got nothing", "the victim model refused
  on its own").
- **The verdict states the one fact that matters** — did the attacker's drop receive and decode
  the canary — and links to the arena transcript and, for a live run, to the public
  `/api/drop/<runId>` receipt. Both links are 44px targets (block padding on the inline box).
- **A replay that is not the exact selection says so** ("No recording for … — nearest shown.
  Run live for the exact one"). It never passes a neighbouring recording off as the requested
  one.
- **At most one follow-up button**, tied to what was just seen ("Turn the guard on and replay").

What was cut to make room: the parallax scenery planes (terminal, hex fragment, seal — "dense,
hints at hacking, users scan and guess"), the sticky stacking cards, the standalone CTA
section. The scene is now the grid and the glow only.

**The attack is told in three Slack beats**, each in Slack's own frame where it happened in
Slack: (1) the message that arrived — the redacted screenshot, or the recreation when the file
is absent; (2) what the agent did — the demo footage when it exists (see "Adding the demo
footage"), then the harness log, one toggle apart, which never was in Slack; (3) the recap that
never mentioned it — the victim agent's standup summary, quoted verbatim from the screenshot.
`.slackcard` and `.slackcard--recap` are the same component.

**The theme control is demoted, not removed.** Icon-only on the bar (monitor / sun / moon),
each radio keeping a text name that is visually hidden there and shown inside the mobile
disclosure, so the accessible name, the tooltip and the label agree. Radiogroup semantics,
roving `tabindex`, arrow/Home/End keys and persistence are unchanged.

## Palette — two themes, one token set

The site ships **light and dark**, and the reader can override the system setting with the
System / Light / Dark segmented control in the nav (stored in `localStorage` under
`nlm-theme`; choosing System removes the key, so the platform setting is the resting state).
The arena and the dashboard read the same key.

The colour architecture is a rule the stylesheet states and a script checks, on all three files:

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

### The five role tokens (restored 2026-09-08)

A "cybersecurity colour wheel" mapping (seven hues, one security-team meaning each) was tried
in `279361d` and **reverted** the same day at the owner's request; the palette below is the
one from `d690856`, byte for byte, and its token names are the real definitions again, not
aliases. The plain-language copy from that commit stayed. Colour is never the only carrier:
every state also has its word and, on the verdicts, a glyph.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f5f6f9` | `#0b0e14` | page ground, all three surfaces |
| `--bg-2` | `#eceff4` | `#0d1119` | alternating section ground |
| `--panel` / `--panel-2` | `#ffffff` / `#f4f6fa` | `#141925` / `#0f1420` | cards, tables, terminals, the console's controls |
| `--line` | `#c9d0da` | `#232b3a` | decorative hairlines |
| `--line-strong` | `#7b8695` | `#6b788c` | control boundaries (≥ 3:1) |
| `--ink` / `--dim` | `#101620` / `#525d6d` | `#e6edf3` / `#8b98a9` | text / secondary text |
| `--on-ink` / `--ink-hover` | `#ffffff` / `#2a3546` | `#0b0e14` / `#ffffff` | text on an `--ink` fill; primary-button hover |
| `--accent` | `#0b5fd0` | `#58a6ff` | links, inline `code`, tool names in the terminal cards and the transcript, the spinner, the dashboard's TRIAL rows and `arena` source pill |
| `--ok` | `#136b36` | `#2ea043` | a defence that held: Denied verdicts, `guard/deny` / `invariant/deny`, the ON-column ASR, "Yes" in the ledger, checked toggles, the dashboard's DENY rows, the connected pill |
| `--bad` | `#b3251a` | `#f85149` | a leak: Leaked verdicts, `exfil/hit`, the OFF-column ASR, LEAK rows, the "off" state of a defence switch |
| `--amber` | `#7a5200` | `#d29922` | a caveat: Model declined / Attempted / limit reached / live off / error, "opt-in, default OFF", "Not yet." in the ledger, scorer verdicts (detection only) |
| `--brass` | `#7d5f1e` | `#c8a96a` | the editorial voice: eyebrows, the one italic in each heading, beat and card numbers, list dashes, the mark's shield, the current-page underline on the bar, the hook pills, the `dsh` source pill |
| `--focus` | `#7d5f1e` | `#c8a96a` | the focus ring on all three surfaces (2px, 3px offset) |
| `--accent-soft` | `rgba(11,95,208,.07)` | `rgba(88,166,255,.10)` | nav hover, inline `code` ground, the transcript's arrival flash |
| `--ok-line` / `--bad-line` / `--amber-line` / `--brass-line` | the hue at .8 (brass .75) alpha | the hue at .8 (brass .7) | tinted status borders, each ≥ 3:1 on its surface |
| `--glass-*` (12 tokens) | white tints and ink hairlines | ink tints and white hairlines | the Liquid Glass material — see its own section |
| `--bar-tint` | `rgba(255,255,255,.72)` | `rgba(20,25,37,.74)` | the bar's Regular tint (the site's detached-nav tint, used at rest on the arena and dashboard) |
| `--grid-ink`, `--glow-a/b` | light values | dark values | the hero scene (site) and the fixed soft field behind the arena and dashboard |
| `--shadow-1`, `--shadow-seg`, `--glass-shadow` | ink-tinted | black | elevation |
| `--slack-*` (19 tokens, site only) | Slack's own **light** theme | Slack's own **dark** theme | the Slack window's neutrals: ground, hairlines, text, timestamps, badges, mention text |
| `--sk-*` (11 tokens, **component-scoped**, declared on `.slackcard` — not in this block) | aubergine rail `#3f0e40` and top bar `#350d36`, active channel `#1164a3`, link `#1264a3`, hover `#f8f8f8`, mention ground `#e8f5fa` | rail, top bar and active channel **unchanged** (Slack keeps the sidebar theme in dark mode); link `#1d9bd1`, hover `#222529`, mention ground `rgba(29,155,209,.10)` | Slack's signature hues, and only inside the Slack window. The one sanctioned exception to rule 1 — see "The Slack window" below |

Measured 2026-09-09 after the demo-pair and Slack-window pass, in headless Chrome over CDP
with an in-page script over every visible element that owns a text node (379 pairs on the
site at 1280 and 361 at 375, 33 on the arena at rest, 276 on the dashboard), compositing every
translucent layer over the real backdrop (`alpha·tint + (1−alpha)·backdrop`, down to `body`):
**0 pairs below 4.5:1** (3:1 for large text) in either theme on any surface, at 1280×800 and
at the 375×812 mobile preset. Worst three — site light 4.94 ×3 (inline `code`, `--accent` on
`--accent-soft` over `--panel`), site dark 4.70 ×3 (the Slack window's `@mention` chips,
`#1d9bd1` on the scoped `--sk-mention-bg` over Slack's `#1a1d21`; they measured 4.28 on the
palette's `.16` ground, which is why the scoped token exists); arena light 4.94 / 5.46 / 5.51
(`code`; the dashboard link; the eyebrow), arena dark 5.99 / 5.99 / 6.25 (the toggles' small
text; the console note); dashboard light 5.51 ×3 (the eyebrows and the brass italic), dashboard
dark 5.21 ×3 (green ON-column cells on `--panel`). Inside the Slack window the worst pairs are
those chips (dark 4.70, light 5.59); everything on the aubergine rail is ≥ 6.2 (the active
channel, white on `#1164a3`) and the rail is `aria-hidden`. The avatars are solid fills
(`--slack-av-a`, `--slack-app-b`) because the previous gradients' light ends fell to 3.8–4.1
under their initials. Control borders bottom out at 3.42 light (the skip link and the tab
list) / 4.09 dark (the console's select and toggles); the Slack window's own hairline is a
container edge, not a control boundary, and is not counted. Hit targets: 0 under 44×44 on any
surface at 1280 or 375 (22 controls on the site at 1280, 14 at 375; the two native checkboxes
live inside their 44px `.tog` labels, which are the targets).

Non-colour tokens (type scale, space scale, motion, radius, `--hit:44px`) are theme-independent
and live only on `:root`.

## Type — one system on all three surfaces

The site, the arena and the dashboard load the **same** Google Fonts stylesheet — the only
external font origin — and declare the same three family tokens **and the same scale**.
`tests/arena.test.mjs` asserts the stylesheet is loaded once per surface and that no
system-font body stack is left.

- Display: **Instrument Serif** (400, italic for the emphasised phrase). Headlines, the
  console's and the arena's verdict word, the arena and dashboard `h1`, the stat numbers.
- Text: **IBM Plex Sans** (400/500/600). Body, UI, tables, the console's controls.
- Code: **IBM Plex Mono** (400/500). Tool names, seats, URLs, evidence paths, the transcript's
  key/value lines.
- Tokens: `--serif:"Instrument Serif", "Iowan Old Style", Georgia, serif`;
  `--sans:"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`;
  `--mono:"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace`.
- Scale (all `clamp()` in `rem`, so it tracks the browser's font-size setting; column counts
  are `em`-based so they drop as text grows): display `clamp(2.5rem, …, 4.75rem)/1.02`, capped
  in the hero to `clamp(2.25rem, …, 3.75rem)` so it shares the row with the console; h2 (and
  the arena and dashboard `h1`) `clamp(1.75rem, …, 2.75rem)/1.1`; body `1rem–1.0625rem/1.6`;
  small `.875rem`; mono `.75–.8125rem`. Eyebrows: Plex Sans 600, `.75rem`, tracking `.14em`,
  uppercase, brass — the section labels on the site, the `h2`s on the dashboard, the console's
  "Run the attack" on both consoles.
- Measure: `--measure:54ch` for every paragraph, lede, caption, list item and transcript line
  on all three surfaces. `ch` is the advance of "0"; in Plex Sans running text averages ~1.35
  characters per ch, so 54ch is ~73 characters a line — inside the 45–75 band. Measured at
  1280: site 64–73, arena 71–74, dashboard 73–74 (its event-feed rows are one-line log entries,
  142–156, recorded as such, not body copy). On phones the lede steps down to 1.05rem so a
  343px column still holds 47+ characters.

## Spacing, radius, motion
- Space scale (px): 4 · 8 · 16 · 24 · 32 · 48 · 64 · 96 (`--s-1 … --s-8`), the same tokens on
  all three surfaces. Site section padding 96 desktop / 64 mobile; the arena and dashboard
  page-head 48 above / 32 below, blocks 24 apart, footer 32/48. Container 1120px, gutter 24 / 16.
- Radius: 6 (buttons, code chips, the dashboard's switches and input), 14 (cards, tables,
  the stats grid, the verdict, the transcript panel, the demo boxes), 999 (pills). No radius
  above 14 except pills.
- Radius, consoles: concentric — 22 outer, 14 pad, 8 inner (`--glass-r-in`) on the site and the
  arena, the same numbers.
- Motion (HIG: purposeful, brief, reversible): micro 180ms, enter 320ms, leave 200ms, indicator move 280ms — every UI transition inside 150–400ms. Entering uses `--ease-out cubic-bezier(0,0,.2,1)`, leaving `--ease-in cubic-bezier(.4,0,1,1)`, standard `--ease cubic-bezier(.2,.7,.2,1)`. Three documented exceptions: the statistic counter (900ms, content not chrome), the live-run spinner (900ms loop, content not chrome, stopped under Reduce Motion while the word "Running" stays) and the scroll parallax (no duration — it is bound to scroll progress). A theme change suppresses every transition for that frame. Parallax plane rates 0.04 / 0.06 (the grid and the glow; the four scenery planes were cut). The **scroll** offset is native — `animation-timeline: view(block)` behind `@supports (animation-timeline: view())` — with the JS `translate3d` loop as the fallback only where `CSS.supports('animation-timeline: view()')` is false; the script skips the plane transform entirely on the native path, so the two never fight. The **pointer** depth (4–6px, `(hover:hover) and (pointer:fine)` only) rides a separate `.layers__depth` child in both paths. Every effect is a `transform`/`opacity` change — never layout. `prefers-reduced-motion`: **both** parallax paths, ticking, the spinner and the arena's step-by-step arrival are off; reveals become 200ms opacity fades; the demo footage does not autoplay.
- Loading: the console's outcome box reserves the height of its tallest state (268px desktop, 272px mobile) and its cost line reserves two lines, so no verdict, error or `/api/config` answer moves anything on the page. Measured: 0px shift across every state. The screenshot slot and the two demo slots are fixed `aspect-ratio: 16/10` boxes for the same reason.
- Layer blending: the hero ends in a 160px gradient to the next ground — no hard cuts.

## Liquid Glass — the material, and where it is allowed

One material, three surfaces. The canonical implementation and its full derivation from
Apple's documentation live in **`site/index.html` §4a**; the block is copied into
`render/arena/public/index.html` and `realtime/dashboard/index.html`, which have to stay
self-contained single files. Same tokens, same class names, same rules everywhere.

**Sources read 2026-09-08** (Apple's human URLs are a JavaScript SPA; the DocC data
endpoints are what was actually fetched):
`technologyoverviews/liquid-glass`, `technologyoverviews/adopting-liquid-glass`, and
HIG `materials` via `developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json`.

**The five rules taken from those pages, and what each one costs us**

| Apple's rule | What this project does |
|---|---|
| "Liquid Glass forms a distinct functional layer for controls and navigation elements … that floats above the content layer" | Glass only on: the bar on every page (site nav, arena bar, dashboard bar), the site's hero console and the arena's console (control surfaces, not content). Nothing else. |
| "Don't use Liquid Glass in the content layer" | `.card`, `.panel`, `.table`, `.stats`, `.verdict`, `.slackcard`, `.tabs__panel`, the demo boxes, the console's outcome box, the arena transcript, the dashboard's switches, tables and totals are all solid. Grep for `class="glass` / count `.glass` in the DOM — 2 on the site, 2 on the arena, 1 on the dashboard. (The arena's glass verdict banner and the dashboard's two glass switches were retired in the consistency pass: the banner floated over nothing, and a switch is a content-layer control.) |
| "avoid overcrowding or layering Liquid Glass elements on top of each other" | Nothing inside a `.glass` element is also `.glass`. Controls that sit **on** a glass surface use `.glass-inset`: identical optics, zero `backdrop-filter` — the theme segmented control and the Menu button on the site's bar, the Live button on both consoles. The consoles' selects, toggles and outcome box are opaque `--panel` fills. There is exactly one `backdrop-filter` between the eye and the page at any point on any surface. The mobile nav dropdown is deliberately opaque for the same reason. |
| Regular variant: "blurs and adjusts the luminosity of background content to maintain legibility … when components have a significant amount of text" | `.glass` — the default and almost everything. The arena and dashboard bars carry the site's detached-nav tint (`--bar-tint`) from the start, because there is no hero scene under them. |
| Clear variant: "highly translucent … for components that float above media backgrounds" | `.glass--clear` — one use only: the site nav while the page is at scroll 0, over the hero's parallax scene. Eight pixels of scroll and it thickens into Regular, which is Apple's own scroll edge effect. |

**Tokens** (colour tokens obey the same two-theme rule as the rest of the palette):
`--glass-tint` `--glass-tint-thin` `--glass-tint-clear` (material body) ·
`--glass-edge` `--glass-edge-lo` `--glass-spec` (specular top, shaded bottom, moving sheen) ·
`--glass-line` `--glass-fill` `--glass-shadow` (hairline, on-glass fill, float) ·
`--glass-blur` 20 / `--glass-blur-thin` 12 / `--glass-blur-clear` 9, `--glass-sat` 1.8 ·
`--glass-r` / `--glass-pad` / `--glass-r-in`.

**Classes**: `.glass` `.glass--thin` `.glass--clear` `.glass--refract` `.glass-inset`.

**Concentric radii.** `--glass-r-in: calc(--glass-r - --glass-pad)`. Both consoles are radius
22 with 14 of padding, so every control inside them — select, toggles, both buttons, the
outcome box — is radius 8. The site's segmented control is a capsule inside a capsule, which
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
the filter and all three surfaces still look right. **Only the bar opts in, on each page**
(site nav, arena bar, dashboard bar); the consoles do not, because a displaced backdrop is the
most expensive thing on any of these pages and the rule is easier to keep when it is the same
on every page.

**Motion.** The pointer moves the specular: `--mx`/`--my` are written on the hovered glass
element only, coalesced into one `requestAnimationFrame`, never bound under Reduce Motion or
on a coarse pointer. Press collapses the float shadow (200ms in, 180ms back). The site's nav
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
always the recreation; there is no separate drop-in for it. (Until 2026-09-09 the screenshot
rule `body[data-slack-shot] .slackcard { display:none }` hid this card too, so with the
screenshot in place beat 3 was a caption with nothing above it. The rule now hides only beat
1's recreated pane, `.slackcard--thread .slackcard__pane`; the frame and beat 3 stay.)

### The Slack window (2026-09-09) — the one component allowed to look like another product

The owner asked for the Slack moments to **pop**, so a judge recognises the surface at a
glance and then sees the guard stop what it tried to do. Both Slack beats, and the frame
around the real screenshot, are one component, `.slackcard`, drawn as a Slack window:

- **Chrome.** An aubergine top bar (`--sk-top`, `#350d36`) holding Slack's search pill; an
  aubergine rail (`--sk-rail`, `#3f0e40`) with Slack's generic items — Threads, Mentions &
  reactions, Drafts & sent, a Channels label and `# eng-channel` as the active item in Slack's
  blue (`--sk-active`, `#1164a3`). Nothing on the rail is workspace data; both bar and rail
  are `aria-hidden`, and the rail leaves below 640px. The rail keeps its aubergine in dark,
  as Slack's sidebar theme does; only the message pane follows the theme.
- **Pane.** Bold `# eng-channel` header, message rows with Slack's hover wash (`--sk-hover`),
  bold names, the `2 replies` count in Slack's link blue with a hairline, the drop URL as a
  Slack link (`--sk-link`, underlined on hover), the `APP` badge and the `@mention` chips.
  Message text is plain, as Slack renders it, capped at `--measure` because the thread pane
  in the screenshot is that wide.
- **Tokens.** Slack's neutrals stay the palette's `--slack-*` tokens. Slack's signature hues
  are eleven `--sk-*` tokens **declared on `.slackcard` itself**, light on the class and dark
  in two scoped blocks that mirror §2a/§2b byte for byte
  (`:root:not([data-theme="light"]) .slackcard` / `:root[data-theme="dark"] .slackcard`).
  They are the sanctioned exception to "every colour token on bare `:root`": nothing outside
  the component can reach them, the palette blocks are byte-identical to `9d6bf9e`, and no
  other component may borrow them. The page's own palette is not restyled to match Slack.
- **With the screenshot present** the same frame wraps the PNG (`.slackshot` inside
  `.slackcard__main`), so beat 1 and beat 3 read as the same window whichever way the slot
  resolves; the caption says the rail and top bar are drawn, not captured.
- **Then the guard.** Directly under the Slack window, beat 2 opens with the before-and-after
  pair (below): the same send, Leaked on the left, Denied by the guard on the right, each with
  its verdict band and its `5/5`; beat 3 closes with the recap that shows nothing happened in
  the channel. Slack, then denial, then "nothing showed" — in that order, without a click.

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

## Adding the demo footage

The second beat of the attack section ("What the agent did") opens with a **before-and-after
pair** — `#demoAttack` (guard off) and `#demoBlocked` (guard on) — above the harness-log tabs,
so the reader sees the contrast first and reads the full log second.

### How the pair presents (rules, 2026-09-09; reference: cluely.com's demo sections)

The owner named cluely.com as the model — "obvious design and explanation". What was taken from
it, and is now the rule for any demo on the page:

1. **Each clip is its own full-width beat.** Side by side from 900px (the two halves of one
   argument), stacked below, with generous space between beats. Never a carousel, never a tab.
2. **Media in a soft-shadowed rounded box — no device bezel, no fake browser chrome.**
   `.demo__box`: `--r` corners, a `--line` hairline, `--shadow-1`, fixed **16/10** so a clip
   dropping in cannot move the page.
3. **A short, action-focused caption sits directly above the media**, 20–50 characters, written
   as what happens, not as a label: *The keys leave through one link* · *The same send, denied
   before it leaves*. A tone tag (`Guard off` / `Guard on`, dot + word) sits above it.
4. **One bold stat under each box, with its denominator, drawn from `eval/out/results.md` and
   `README.md` only:** `5/5` runs delivered the decoy with the guard off · `5/5` attempts denied
   with the guard on — direct arm, both victims. A shared line under the pair carries the
   headline, `1.00 → 0.00`, N=5 per cell. No number may appear here that is not in those two
   files.
5. **The page is complete while the footage is absent.** Each box holds a **still** until a
   clip exists: the tail of the harness log (the thread read, the scorer flag, `read_file`, the
   `http_get`, the outcome line) and a **verdict band** — Leaked in `--bad`, Denied by the guard
   in `--ok`, the existing verdict treatment (serif word, glyph, tone) with a 12% wash and a
   4px rule so it carries next to the Slack window. There is no grey "video goes here" box and
   no empty frame. When a clip arrives it replaces the still in the same box and the source
   line under the caption swaps from "The last lines of the harness log…" to "Screen
   recording: …".
6. The pair never replaces the tabs: the full log, one control at a time, follows under the
   eyebrow "The full harness log, one control at a time".

| Slot | File | Shows |
|---|---|---|
| `#demoAttack` | `site/assets/demo-attack.mp4` (or `.webm`, or `.gif`) | guard **off**: the poisoned message is posted, the assistant reads it, the keys leave through the link |
| `#demoBlocked` | `site/assets/demo-blocked.mp4` (or `.webm`, or `.gif`) | guard **on**: the same message, the same assistant, the send is denied before it leaves |
| poster (optional) | `site/assets/demo-attack-poster.png` / `demo-blocked-poster.png` | the frame shown before play, and the whole of what a Reduce-Motion reader sees until they press play |

Exact filenames matter: `demo-attack` and `demo-blocked`, lowercase, plus one of the three
extensions. **Prefer video.** A muted, looping, `playsinline`, `preload="metadata"` `<video>`
is a fraction of a gif's size at far better quality; `.mp4` (H.264, yuv420p) plays everywhere,
`.webm` is smaller where it plays. When more than one exists for a slot the server picks
`.mp4`, then `.webm`, then `.gif`. Recommended dimensions **1600×1000 (16:10)** to match the
reserved box and the screenshot; 16:9 letterboxes inside it (`object-fit: contain` on
`--panel-2`) and still cannot shift the layout. Keep the recording to 10–20 s and under a few
MB; no audio track is needed (the element is muted).

How it behaves:

1. `render/arena/server.mjs` checks for the files on every request for `/` (the cache keys on
   the set of files found, so a drop-in takes effect on the next request without a restart).
   It writes the filename it found into `<body data-demo-attack="demo-attack.mp4">` /
   `data-demo-blocked="…"` and, when present, `data-demo-attack-poster="demo-attack-poster.png"`.
2. The page's `demo()` script builds the `<video>` (or the `<img>` for a gif) **only** from
   those attributes, so a site without the files never requests them and never logs a 404. It
   then sets `data-media` on the slot, which retires the still and swaps the source line under
   the caption; the tag, the caption and the stat do not change.
3. With motion allowed, a video autoplays muted and looped, and a click on it pauses or
   resumes; a gif simply plays. If the browser refuses autoplay, a **Play** control appears
   over the box (a `.btn`, 44px). Under `prefers-reduced-motion: reduce` nothing autoplays: a
   video shows its poster (or first frame) with the Play control and native controls; a gif —
   which cannot be paused — is only fetched once Play is pressed, and until then the poster,
   or the still itself, is the frame under the control.
4. Both slots are always on the page (still or clip). They sit side by side from 900px and
   stack below; the box is 16/10 at every width and on a phone grows to fit the still
   (`overflow:clip`, not `hidden`, so the aspect box keeps a content-based minimum height).
5. On a load error (a static host that sets the attribute but cannot serve the file) the slot
   removes its own body attribute and `data-media`, drops the broken element, and the still
   returns — the beat never goes blank.
6. The server serves the files by basename only (no separators survive the allowlist regex),
   with `Accept-Ranges: bytes` and single-range `206` answers — Safari refuses to play a video
   from a server that cannot answer a range request.
7. Covered by `tests/arena.test.mjs` ("the demo footage drop-in slots are detected
   server-side, both ways, and served with ranges"): no marker while absent; a gif is found and
   named; a `.webm` beside it wins and the poster is named; `200` whole, `206` partial with the
   right `Content-Range`, `416` out of range, traversal `404`; the marker clears when the files
   go. The test skips its absent half if real footage is already in place.

Servable from `site/assets/`, by basename only: `.svg`, `.png`, `.ico`, `.webp`, `.mp4`,
`.webm`, `.gif`.

## Human Interface Guidelines

`site/HIG.md` records the 24 Apple HIG pages consulted, 2–5 testable guidelines taken from
each, the `file:line` where each is applied (stamped to a blob hash of each of the three
files), and how it was verified — plus the pages skipped and why, and the three places the
page deliberately departs from HIG.

## Logo mark
`site/assets/mark.svg`: a shield outline in brass with a vertical conduit inside that stops at a horizontal bar — the flow, interrupted. 32×32 grid, 1.75px strokes, no fill. The same mark, inline, on all three bars and footers. Wordmark: "No-Leak-MCP" in Plex Sans 600.

## References consulted (2026-09-08)
- **awwwards.com/websites/technology** (fetched): dark neutral grounds with one accent; geometric text faces; motion as scroll + microinteractions, "restraint with strategic motion". Taken: single warm accent, hairline discipline, motion only where it explains something.
- **21st.dev** (landing fetched; component pages 404): "animated heroes", "cards & grids", "footers" as the reusable-block vocabulary. Taken: build the page from named blocks (`.card .stack .reveal .tabs .stat .pill .btn`).
- **godly.website** → recent.design (403) and **fora.co** (now redirects to an unrelated site): not reachable. The layered hero followed the transcript's description; the stacking cards and the scenery planes it also described were cut in the 2026-09-08 design review in favour of the product itself in the hero.
