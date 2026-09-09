# Apple Human Interface Guidelines — what was read, what was applied, how it was checked

> **Line numbers are valid for `site/index.html` blob
> `90ffc249e9c86812b5c3108bd46324fc0c616664`** (1868 lines — check with
> `git hash-object site/index.html`), stamped at the colour-wheel and plain-copy pass,
> 2026-09-08. The blob hash, not a commit, is what fixes the line numbers, so the blob is what
> to check. Every `file:line` below was regenerated for this blob by locating the anchor the
> row names (the selector, id, token, label or function) in the new file — an unchanged line
> by its identical content, a rewritten line by its anchor — with 0 left unresolved. Rows
> that cite `render/arena/public/index.html` (blob
> `640030d850b421e31abd9f948f3efad991def845`, 434 lines) or `realtime/dashboard/index.html`
> (blob `c9a107db16bce6a04d84aede195bbede3968a7cb`, 334 lines) are stamped the same way. If a
> blob hash no longer matches, the line numbers are stale and the anchors, not the numbers,
> are authoritative.

The public site (`site/index.html`) is a web page, not an Apple-platform app, so this is a
translation exercise, not a compliance one: where a guideline is expressed in points on a
touch device it is applied in CSS pixels; where it is about an Apple-only affordance it is
recorded as skipped, with the reason.

**What changed in this pass (2026-09-08, colour wheel + plain copy).** Two things, no
redesign. (1) The palette is now the cybersecurity colour wheel: seven hues, one meaning each
(red attack, blue defence, purple arena, yellow code, green automated checks, orange
awareness/limits, white governance), the role tokens aliased onto them, each section declaring
its team, and the mapping stated in one line in the footer — `site/BRAND.md` has the table.
Denied moved from green to blue, the focus ring from brass to blue on all three surfaces, and
inline `code` from blue to ink. (2) The reader-facing copy was rewritten so a first-time reader
gets the problem, the stakes and the fix in one scan, with every term of art following the
plain sentence that explains it; no number changed. Rows the pass touched are marked
**Updated**; the previous pass's **Rewritten** marks are kept.

**What changed in the pass before (2026-09-08, hero-as-product).** The hero is now the product: a
victim-model picker, guard/invariant toggles and two actions (Replay, the default; Run live)
wired to the arena's own API, with the verdict rendered inline in reserved space. The parallax
scenery planes, the stacking cards and the standalone CTA were cut. The attack is told in
three Slack beats. The theme control was demoted to icons on the bar. Every row below that
the rework made false was rewritten, not softened; the rows that changed most are marked
**Rewritten**.

**Sources.** 24 HIG pages were requested on 2026-09-08. 23 returned content, 1 no longer
exists. On the same day three further Apple pages were read for the Liquid Glass pass and are
recorded in their own section below: `documentation/technologyoverviews/liquid-glass`,
`documentation/technologyoverviews/adopting-liquid-glass`, and HIG `materials`. The
human-facing `developer.apple.com/design/human-interface-guidelines/<page>` URLs are a
JavaScript single-page app that serves only a title to a plain fetch; the content is served by
Apple's public DocC data endpoint at
`developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`, which is
what was actually read. Quotations are kept under 15 words; everything longer is paraphrase.

Verification methods are named in the last column and spelled out under "How each check was
run" below. All measurements were re-run against the live page at 1280×800 and the 375×812
mobile preset, in both colour schemes, on 2026-09-08 after the colour-wheel and copy pass
(the 1600×900 figures quoted in a few rows are from the hero-as-product pass and were not
re-run; where a row gives one number it is the 1280 measurement from this pass).

---

## Foundations

| HIG area | Guideline (quoted or closely paraphrased) | Where applied (file:line) | How verified |
|---|---|---|---|
| Accessibility | Minimum control size on iOS/iPadOS/watchOS is **44×44 pt** | `site/index.html:132` (`--hit:44px`), applied at `:238` `.skip`, `:407` `.nav__brand`, `:412` `.nav__link`, `:423` `.nav__toggle`, `:441` `.seg__b`, `:463` `.btn`, `:566` `.sel`, `:569` `.tog`, `:771` `.tabs__tab`, `:806` `.foot a`. The one inline link in running copy (`.hero__scope a`, `:547`) gets `padding-block:13px`: block padding on an inline box does not move the line but does extend the hit region, 19 → 45 px. **Rewritten:** the rework introduced that link and it measured 62×19 before this fix. **Updated:** the footer legend's link to the colour wheel is an inline `a` inside `.foot`, whose `.foot a` rule already gives it the 44 px box | **hit-target script** over `a, button, [role=button], select` — 23 visible controls at 1280 (15 at 375, where the nav links sit behind the disclosure), **0 under 44×44** in either axis, both themes |
| Accessibility | Contrast: **4.5:1 up to 17 pt; 3:1 at 18 pt and for bold**; WCAG AA is the same floor | Whole palette, `site/index.html:61–138` (light) / `:143–169` and `:173–208` (dark) | **contrast script** over every visible text-bearing element (329 pairs per theme at 1280, 321 at 375) in both themes: 0 failures. **Updated:** worst three light 5.12 / 5.12 / 5.12 (the defence heading's blue italic on `--bg-2`, large text, floor 3:1), dark 5.24 / 5.24 / 5.24 (red "Leaked" and the OFF-column cells on `--panel`); the old worst pair, inline `code` on blue at 4.94, is gone because `code` is now ink on `--code-soft`. Text on glass is measured on the composite (see below): worst 5.66 light / 5.86 dark |
| Accessibility | Text must survive enlargement to **at least 200 percent** | Type scale in `rem` with a `vw` term, `site/index.html:108–114`; `--measure` in `ch` at `:119`; the 3-up control row is gated on an `em` media query at `:712`, so a larger browser font stacks it rather than shrinking the measure | **clipping script**: 0 elements whose scroll size exceeds a clipping box, no horizontal scroll at 375 / 1023 / 1280 / 1600 (`scrollWidth === innerWidth` at each) |
| Accessibility (typography) | Keep running body copy to a comfortable line length | `p` is capped at `--measure` (`site/index.html:217`, token at `:119`); the ledger's wide column at `:757`; the arena intro at `render/arena/public/index.html:60`, the dashboard note at `realtime/dashboard/index.html:138`. **Rewritten:** `--measure` moved 57ch → 54ch this pass. `ch` is the advance of "0"; in IBM Plex Sans running text averages ~1.35 characters per ch, so 57ch measured 78 and 54ch measures 73. The 3-up cards got a 16px gutter and 20px side padding (`:719`) and their `dl` went term-above-value (`:729`) because 28px padding and a side-by-side `dl` left 43 and 30 characters a line. **Updated:** the new footer legend (`.wheel`, `:827`) is capped at 50ch — its mono span widens the mean advance, so 54ch measured 78 there — and the arena's transcript lines (`.step .body`) went 80ch → 56ch so a replayed run reads at the same measure as the intro | **line-length script** at 1280 (the element's own font advance measured on a canvas, an upper bound): after the rewrite every paragraph, list item, caption and cell longer than 120 characters measures **46–74** characters a line (the `.wheel` legend measured 213 uncapped, 78 at 54ch, 72 at 50ch; 69 at 375). Arena intro 75, transcript lines 73–75 with a run on screen; dashboard note 74. The dashboard's event-feed rows are single-line log entries in a full-width `td` (154–157) and are not body copy — recorded, not hidden. At 375 the three `.ctl__limits` paragraphs measure 43–48 (a 343px column, not a layout choice) and the two-column ledger's wide cells 28 |
| Accessibility | "Convey information with more than color alone" | Verdicts carry a glyph plus a word: the three static verdict cards `site/index.html:1125`, `:1142`, `:1158` with `.verdict__ico` at `:792`; the live console verdict `:1758` (word) and `:1761–1765` (glyph per tone, `ICO`); the console legend `:1005` names Leaked / Denied / Declined in words beside the dots; ledger cells say "Yes" / "Not yet."; tabs carry text labels next to the dot; the two toggles carry a checkbox state, not only the blue border. **Updated:** the footer's palette legend pairs every swatch with its word; the arena badges and the dashboard feed keywords (DENY / LEAK / TRIAL / POISONED) and switch labels ("Guard is off — turn it on") carry the state in words, with no emoji left anywhere | Visual check in both themes; every `.verdict`, `.run__v`, `.pill`, `.yes`/`.no`, arena `.badge` and dashboard `.k`/`.ctl` inspected for a non-colour carrier |
| Accessibility | Respond to the Reduce Motion setting | `site/index.html:864–904` disables both parallax paths, the reveals' translate, the spinner (`:873`) and the glass transitions; the script reads the media query **live** and stops or restarts the pointer-depth loop on its `change` event (`:1349`, `:1698–1707`) | **CSSOM dump** of the `prefers-reduced-motion: reduce` block (13 rules, listed in "How each check was run") plus code review of the live `change` path — the browser tool cannot toggle the OS setting mid-session, and no frame rate is claimed for a state that was not observed |
| Color | "Avoid using the same color to mean different things" | **Updated.** The palette is the cybersecurity colour wheel, one meaning per hue, declared at `site/index.html:80` and aliased by role: red = the attack (`--bad`), blue = the defence and the product (`--ok`, `--accent`, `--focus`), purple = the arena, yellow = the code (`--brass`), green = the automated checks, orange = awareness and limits (`--amber`), white = governance (a swatch, never text). Each section declares its team (`.team-*`, `:238–240`) and its eyebrow, italic, numbers and dashes read `--team`; inline `code` and tool names are neutral ink (`:226`, `:495`) so blue means only "defence"; the console tones `:1759` map outcomes onto red / blue / orange. The footer states the mapping (`:1355`); `site/BRAND.md` carries the table | Token grep: every chroma-carrying rule resolves to one of the seven wheel tokens or an alias of one; the computed eyebrow colours read back per section as red, blue, green, orange and ink; no component reassigns a token to an unrelated role |
| Color | Every custom colour needs a light **and** a dark variant | Every colour token is defined on bare `:root` and redefined in both dark blocks (`site/index.html:61–138`, `:143–169`, `:173–208`) | **token-parity script**: the two dark blocks are byte-identical after de-indentation (24 declaration lines, 53 tokens each); 0 tokens defined only in a dark block; 0 orphan colour tokens. **Updated:** the role aliases (`--ok --bad --amber --accent --brass --focus`) are `var()` references declared once on bare `:root`, so they follow whichever theme the wheel tokens resolve in. The parallax-scenery tokens (`--wall-*`, `--frag-bg`, `--seal-bg`, `--shadow-2/-3`) were deleted with the planes they painted rather than left declared and unused |
| Color | Translucency changes how adjacent colours read | The nav and the console are tokens (`--glass-tint` / `--glass-tint-clear`, `site/index.html:87` light, `:156` and `:185` dark) composited over the page | Contrast script's `bgBehind()` walks ancestors and alpha-composites (`alpha·tint + (1−alpha)·backdrop`) rather than reading the element's own token. Worst composite pairs this pass, light: `.seg__t` 5.66, `.nav__link` 6.26; dark: `.seg__t` 5.86, the toggles' `small` 5.99; control borders on the bar and console 3.46 light (`.seg`, `.nav__toggle`) / 4.09 dark (`.sel`). Arena, with a verdict badge on its wash over the glass banner: 4.96 light (blue Denied) / 4.64 dark (red Leaked) |
| Dark Mode | Use colours that adapt to the appearance; do not hardcode | Zero colour literals remain in component CSS; the only `#000` left is a **mask alpha stop**, commented at `site/index.html:523` | `grep` for `#hex`/`rgb(a)` below the token blocks returns exactly one hit, the mask stop |
| Dark Mode | "Soften the color of white backgrounds" | Light ground is `--bg:#f5f6f9` / `--bg-2:#eceff4`, not `#fff`; `#fff` is reserved for raised panels (`site/index.html:65`) | Computed `body` background in light theme: `rgb(245, 246, 249)` |
| Dark Mode | Apple advises against an app-specific appearance switch | **Deliberately not followed**, and said so: the brief requires a System / Light / Dark control. It defaults to **System**, so the platform setting still wins unless the reader opts out (`site/index.html:945–972`, JS `:1367–1435`) | Loaded with no stored value → `data-theme` absent, follows `prefers-color-scheme`; verified in both emulated schemes; Home key restores System and removes the stored key |
| Dark Mode | The browser chrome should match the appearance the reader is looking at | `meta[name=theme-color]` is written from the **resolved** theme inside `apply()` (`site/index.html:1381–1407`, called at `:1400`), ahead of the two media-scoped no-JS fallbacks at `:9–10`; a System reader still tracks the OS via the `change` listener at `:1419–1421` | Measured in-page: ArrowRight to Light → `#f5f6f9` with the pane's own scheme held at dark — the override, not the media query, answers |
| Layout | Respect margins and guides; keep the most important item leading and top | 1120 px container with a 24/16 px gutter (`site/index.html:226`); the hero is a two-column grid above 1024 (`:537`): the situation statement leads, the working console sits beside it, the primary action first (`:999`) | Screenshots at 375, 1023, 1280, 1600 in both themes; JS geometry at each |
| Layout | Test across orientations, localisations and text sizes | Breakpoints at `site/index.html:537` (hero two-up), `:712` (3-up), `:814`, `:818`, `:834`, `:838` | `scrollWidth === innerWidth` at every width tested |
| Layout | Reduce column count as text size grows (Typography, applied to layout) | `@media (min-width: 70em) { .trio { repeat(3, …) } }` at `site/index.html:712` | `em` in a media query is the browser's own font size: at 16 px the 3-up needs 1120 px, at 20 px it needs 1400 px, so at 1280 the cards stack instead |
| Materials | Reserve translucent material for the control layer, not content | `backdrop-filter` is declared only inside the `.glass` family (`site/index.html:345–346` and `:360–361`, each with its `-webkit-` twin) and exactly two elements carry it: the sticky nav (`:926`) and the hero console (`:999`) — the console is a control surface, not content. No card, table, terminal, ledger, tab panel or Slack artefact is translucent. **Rewritten:** the two secondary buttons that were glass are gone with the CTA; the console's live button sits ON the console and is `.glass-inset` (`:1000`) | DOM count in both themes: `.glass` = 2 on the site (arena 2, dashboard 3), `.glass .glass` = 0; every `.card`/`.table`/`.stat`/`.verdict`/`.slackcard` computes `backdrop-filter: none` |
| Materials | Thicker material = more contrast; always use vibrant colour on top | The nav is Clear at scroll 0 and thickens to Regular after 8 px (`site/index.html:398–404`, `:1678–1652?`); once detached its links go to full `--ink`. **Rewritten:** the earlier `--scrim` token no longer exists | Contrast on the composite: nav links over the darkest content that can pass under the bar ≥ 9.9:1 light; over white (the Slack PNG) 6.3:1 dark |
| Materials | A material needs a fallback where it is unavailable | `@supports not ((backdrop-filter…))` paints `--panel`/`--bg` solid, `site/index.html:901–904`; `prefers-reduced-transparency: reduce` does the same at `:892–904`. Both live in §19 at the very END of the stylesheet, because a fallback that loses on source order is not a fallback | CSSOM dump of both blocks (listed below): every `.glass`/`.glass-inset`/`.btn.glass` rule resolves to `var(--panel)`/`var(--bg)`, `background-image: none`, `backdrop-filter: none` |
| Motion | "Add motion purposefully" — never decoration | Every animation explains something: the reveal of a claim, the tab swap, the spinner that says a live run is in flight (`:612`, content not chrome). Durations 180–320 ms (`site/index.html:127`) | CSS grep: no `transition`/`animation` duration outside 150–400 ms except the three documented exceptions below |
| Motion | "Let people cancel motion" / do not make people wait for an animation | Nothing blocks reading: reveals are opacity+14 px, tab panels are grid-stacked so height never changes, the scroll parallax is scroll-linked so it is reversible by definition (`site/index.html:514–520`). A live run is the one real wait and it says so up front ("Usually 20–60 s", `:1844`) with Replay offered as the instant path | Reading the page while scrolling; no content is gated behind an animation |
| Motion | "Make motion optional" — never the sole channel | The spinner is paired with the words "Loading…" / "Running live…" (`:1833`, `:1844`); under Reduce Motion it stops and the words remain (`:873`) | Reduced-motion CSSOM dump; the loading copy read off the DOM |
| Typography | Prefer Regular/Medium/Semibold; "avoid light font weights" | Only 400/500/600 are loaded (`site/index.html:14`), and the same URL on the arena (`render/arena/public/index.html:14`) and the dashboard (`realtime/dashboard/index.html:14`) | Font URL grep on all three: `wght@400;500;600` for Plex Sans, `400;500` for Plex Mono, one request each |
| Typography | Minimise the number of typefaces | Three, each with one job, on all three surfaces: Instrument Serif display, IBM Plex Sans text, IBM Plex Mono code (`site/index.html:102–104`; `render/arena/public/index.html:49–51`; `realtime/dashboard/index.html:48–50`). **Rewritten:** the arena and dashboard were on the system stack before this pass | `--serif/--sans/--mono` are the only families declared; computed `font-family` on `body` and `h1` of each surface read back as Plex Sans / Instrument Serif; `tests/arena.test.mjs` asserts no leftover `ui-sans-serif,system-ui` body stack |
| Typography | Keep truncation minimal as font size increases | Nothing truncates. **Rewritten:** the `.frag` scenery that truncated was cut with the planes | Clipping script: 0 clipped elements |
| Typography | Custom fonts must honour Dynamic Type behaviour | The whole scale is `clamp()` in `rem`, so it tracks the browser's font-size setting (`site/index.html:108–114`); the hero `h1` has its own cap so it shares a row with the console (`:542`) | **Updated:** the plainer headline is longer (three sentences); measured `h1` at 1280: five lines beside the console, the copy column still shorter than the console; console 268 px reserved |
| Typography | Avoid tight leading on three or more lines | Body 1.6, terminal 1.7, lede 1.55 (`site/index.html:206`, `:492`, `:223`) | Computed line-height on every long paragraph ≥ 1.5 |
| Writing | "Be action oriented" — use a verb for button and link labels | "Replay a recorded run", "Run live on Nebius", "Turn the guard on and replay", "Run this one live on Nebius", "Skip to main content" (`site/index.html:999–1000`, `:1787–1788`, `:908`). **Updated:** the arena's buttons are now "Run the attack live" / "Replay a recorded run" (`render/arena/public/index.html:260`, `:264`) and the dashboard's switches read "Guard is on — turn it off" / "Guard is off — turn it on"; the emoji that led every label and verdict are gone | Every `.btn`, arena `button` and dashboard `.ctl` label carries a verb; read off the DOM on all three surfaces |
| Writing | Pick a capitalisation style and apply it consistently | Sentence case throughout: tabs are "Guard on" / "Invariant on" (`:1109–1110`), verdicts "Leaked" / "Denied by the guard" / "Denied by the invariant" / "Model declined" / "Attempted, not delivered" (`:1125`, `:1142`, `:1158`, `:1758–1759`). **Updated:** the arena's outcome words and mode pills ("Live — a real run on Nebius", "Replay — a recorded run") and the dashboard's headings follow the same case | Grep for `!` in copy on all three surfaces: none |
| Writing | Use plain language; explain a term the first time it appears | **Updated (the copy pass).** The plain sentence comes first and the term of art follows once, in brackets or after a dash, never instead: "the harness that runs the assistant (`@deepseek-ai/dsh 0.1.1-rc.2`)" (`:971`); "stopped before it was sent (the harness's `tools/pre-execute` hook)"; "Slack would have fetched it itself to build a link preview (an 'unfurl')" (`:1107`); "a planted decoy (a canary)"; "attack success rate (ASR) is the share of runs in which the decoy actually reached the attacker's server". The stakes are stated in human terms once (`:1173`: a stolen credential is a working login). No factual claim or number changed; the ledger's "Not yet." row and the honest-scope section stand in full | Full read of the three surfaces against `README.md` and `eval/out/results.md`; every number on the page located in one of the two |
| Writing | Avoid "we"; use possessives sparingly | Copy is second-person for the reader's situation ("Your AI assistant reads it, believes it, and hands over your keys") and third-person, forensic, for the mechanism; "we" does not appear | Full read of the page copy |

## Patterns

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Feedback | Integrate status feedback into the interface, near what it describes | **Rewritten.** The verdict renders inside the console that produced it, in a reserved box (`.run__out`, `site/index.html:582`, markup `:1003`), under the controls that were set; the scorer's static verdict is printed inside the terminal card it belongs to (`:1118–1127`); the ledger's "Not yet." sits in the row it qualifies (`:1293`) | Live at 1280/375 in both themes: replay, live, rate-limited, live-off, error states all paint into the same box; `#attack`'s top edge did not move by a pixel across any state (871.72 px at 1280 this pass — the longer headline moved the hero, not the states) |
| Feedback | Deliver feedback through more than one channel | Every console state is colour (`data-tone`) **and** a word **and** a glyph (`:1809–1811`); the box is `role="status" aria-live="polite"` (`:1003`) so the verdict is announced | Same check as "colour is not the only carrier" above; attributes read off the DOM after each state |
| Feedback | Show that a command could not be carried out, and why | The console says why and what to do instead: 429 → the allowance used, "Replay is instant and unlimited" (`:1846–1850`); 503 → "Live runs are off on this deployment (no API key)" and the live button relabelled and disabled (`:1852`, `:1864`); 5xx / network → "Replay still works" (`:1837–1857`); no matching recording → "run it live" (`:1831`). The ledger states what is owed in the same cell as the claim (`:1293`) | Each state exercised in the browser (429/500/503/network by substituting `fetch`; live-off for real against a second arena booted without a key); ledger copy compared against `README.md:64` |
| Loading | "Show something as soon as possible"; a blank wait reads as a bug | **Rewritten.** The console box reserves the height of its tallest state (`--out-h`, `:582–587`, 272 px at ≤767) so no verdict shifts the page; the cost line reserves two lines (`:579`) so the `/api/config` rewrite cannot move the console either; the loading state paints immediately with a spinner and a sentence that states the expected wait (`:1833`, `:1844`); the Slack screenshot slot is a fixed `aspect-ratio` box (`:667–668`, markup `:1042`) | Measured: tallest replay state 266 px content in a 268 px box at 1280, 270 in 272 at 375; live run: loading painted synchronously on click, verdict at 20 s, layout unchanged |
| Entering data | Prefer selection components over free text; ask only for what is needed | **Rewritten.** The page now has one form (`:999`): a `select` for the victim (`:985`) and two labelled checkboxes (`:993–994`) — no free text anywhere. It is a real `<form action="/arena" method="get">`, so without JavaScript it submits the same three fields to the arena, which pre-selects them (`render/arena/public/index.html:508–511`); `<noscript>` says so (`:1032`) | Submitted to `/arena?model=llama&guard=on&invariant=on`: the arena loaded with Llama and both toggles on. `tests/arena.test.mjs` asserts the form, its fields and the button labels |
| Honesty (project rule, not a HIG page) | A recreation must say what is real and what is drawn | The first beat shows the **redacted screenshot** when `site/assets/slack-thread.png` exists (it does) and the hand-built recreation of the thread reply otherwise (`:1042–1075`), each with its own caption saying exactly what was cropped, blurred or elided (`:1074`, `:1075`); the third beat quotes the recap verbatim from the same screenshot and says so (`:1198`); ids are synthetic `T0XXXXXXXXX` / `C0XXXXXXXXX` (`:1048`, `:1178`) | Both ways verified: server-side by `tests/arena.test.mjs` (writes a 1×1 PNG, asserts the marker, deletes it, asserts it clears) and in the browser by toggling `body[data-slack-shot]`: recreation `display:block`, image `none`, captions swap |
| Managing notifications | **Skipped.** The page sends no notifications and has no interruption levels | — | — |

## Components

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Buttons | "a button needs a hit region of at least 44x44 pt" | `.btn` at `site/index.html:463`; `.sel` `:566`; `.tog` `:569` | Hit-target script: 0 failures |
| Buttons | "Always include a press state for a custom button" | `.btn:active` at `:471`, `.seg__b:active` at `:447`, `.tabs__tab:active` at `:775`, `.nav__toggle:active` at `:427` | CSS grep: every interactive class has `:hover`, `:active`, `:focus-visible` and, for `.btn`, a disabled state at `:478` |
| Buttons | Keep prominent buttons to one or two per view | One primary and one secondary in the console (`:999–1000`); the verdict adds at most **one** follow-up button, tied to what was just seen (`:1785–1789`) | Count of `.btn--primary` on the page: 1 |
| Buttons | Distinguish the preferred option by style, not size | Both console buttons are the same height and padding; only fill differs (`:463`, `:475`) | Measured: identical `min-height` 44, same padding |
| Buttons | Disabling a control must not strand keyboard focus | Both buttons are disabled while a run is in flight; when it ends, focus returns to the button that started it if it fell to `<body>` (`:1781–1753?`, `lastBtn` set at `:1867` and `:1874`) | Keyboard: focus Replay, run, verdict painted, `document.activeElement` is Replay again and `:focus-visible` matches |
| Segmented controls | "no more than about five to seven segments"; use similarly sized content | 3 segments, equal padding (`site/index.html:945–972`). **Rewritten:** icon-only on the bar, each with a visually hidden text name (`.seg__t`, `:445`) that returns inside the mobile disclosure (`:832`) | DOM count; at 375 with the menu open the three names render (`position: static`, width 49 px) |
| Segmented controls | Do not mix action segments with selection-state segments | All three segments set state; none performs an action | Read of the handler at `:1408–1416` |
| Segmented controls | *(ARIA note)* The theme control is a **radio group** (`role="radio"` + `aria-checked`); the kill-chain **tabs** use `role="tab"` + `aria-selected` + `aria-controls`. Both support arrow keys, Home and End | radiogroup `:945`, keys `:1410–1416`; tablist `:1106`, tabs `:1108–1110`, keys `:1733–1707?` | Keyboard walk of both controls in the browser: ArrowRight moved the radio to Light (`aria-checked`, `tabindex`, `data-theme`, stored key all read back), Home restored System; ArrowRight/End/Home moved the tabs and the active panel |
| Tab views | "Avoid providing more than six tabs in a tab view" | 3 tabs (`site/index.html:1108–1110`) | DOM count |
| Tab views | A pane's controls affect only that pane; panes are mutually exclusive | Panels are grid-stacked and switched by `.is-active`; the inactive ones are `visibility:hidden` (`:780–783`, JS `:1719–1699?`) | Inactive panels compute `visibility: hidden`; all three panels measure 239 px at 1280, so the height never changes between tabs |
| Tab views | *(APG)* A tab panel is in the tab sequence, so it is reachable when it holds no focusable control | `tabindex="0"` on all three panels (`site/index.html:1113`, `:1130`, `:1147`) | DOM read: 3 of 3 `[role=tabpanel]` carry `tabindex="0"`; the only `tabindex` values on the page are `0` and `-1` |
| Tab views | Label each tab so people can predict its contents | "Attack", "Guard on", "Invariant on" | Read of the DOM |
| Toolbars (Navigation bars merged into it) | Choose items deliberately; define what collapses at narrow widths | 6 links + icon theme control above 1100 px; below that everything collapses behind a Menu disclosure (`site/index.html:818–857`) | Measured at 1023 and 375: brand and Menu only on the bar; disclosure holds 6 links at 44 px tall and the full-width segmented control |
| Toolbars | Provide a reliable way to restore a hidden bar | The disclosure is a labelled button that toggles to "Close", is `aria-expanded`, and closes on Escape and on any link activation (`:1551–1529?`) | Keyboard: open, Escape closes and focus returns to the Menu button (read back) |
| Labels | Use a label only for non-editable text; prefer system fonts and the system label colours | Two text roles only — `--ink` primary and `--dim` secondary (`site/index.html:70`); the console's field labels are `--dim` small caps (`.fld__l`, `:561`) | Contrast script covers both roles on every surface |
| Labels | "Make useful label text selectable" | Nothing on the page blocks selection except the toggle labels (`user-select:none` on `.tog`, `:569`, so a click toggles rather than selects) | `user-select` grep: one hit, the toggle |
| Toggles | Use a toggle only for two opposing values | The two defence toggles are exactly that: guard on/off, invariant on/off, native checkboxes with `accent-color:--ok` (`:571`); the theme has three states, so it stays a segmented picker | Design decision recorded here |
| Pickers | Use a picker for a short list of mutually exclusive options | The victim model is a native `select` (`:985`), repopulated from `/api/config` (`:1880–1855?`) so the page cannot list a model the arena does not have | DOM read after config: two options, the same two the arena serves |

## Inputs

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Keyboards | "Respect standard keyboard shortcuts" — do not repurpose them | The page binds only Arrow, Home, End (inside a composite widget) and Escape (to dismiss). No character or modifier shortcut is claimed, and nothing intercepts Enter or Space on a button | Grep of every `keydown` handler: `:1410–1416`, `:1558–1529?`, `:1733–1707?` |
| Keyboards | Do not implement custom keyboard navigation for buttons and segmented controls where the platform already handles it | Roving `tabindex` is used only where ARIA requires it (radiogroup, tablist); every other control is a plain focusable element in DOM order | Tab order walked: skip link → brand → links → theme → console (select, two checkboxes, two buttons) → content → footer |
| Pointing devices | "about 12 points of padding around elements that include a bezel" | Bezelled controls carry ≥ 12 px of internal padding (`.btn` 20 px, `.sel` 12 px, `.tog` 12 px, `.nav__link` 12 px) and the segmented control adds a 3 px inner gutter (`:440`) | Measured padding on each control class |
| Pointing devices | "Avoid creating gratuitous pointer and content effects" | Pointer depth is capped at 6 px (the largest `data-depth` left after the planes were cut, `:962`), eased at 0.08 per frame (`site/index.html:1663`), and gated to `(hover:hover) and (pointer:fine)` (`:1351`) | Touch emulation at the mobile preset: no pointer listeners attach |
| Focus and selection | "Rely on system-provided focus effects"; build custom ones only if necessary | One rule, `:focus-visible` with a 2 px ring and 3 px offset (`site/index.html:233`); nothing sets `outline: none`. **Updated:** the ring is `--focus`, now an alias of `--blue` (`:80`), which is also what the arena and dashboard rings use, so the three surfaces focus in the same colour | CSSOM grep: 0 rules set `outline: none`/`0`; the `:focus-visible` rule reads `2px solid var(--focus)`; controls focused in keyboard modality match it with a `solid 2px` outline |
| Focus and selection | "Avoid changing focus without people's interaction" | Focus moves only on an explicit key press (arrow/Home/End inside a widget), on Escape returning focus to the disclosure, or back to the button the reader pressed once its run ends | Read of every `.focus()` call: `:1409`, `:1412–1414`, `:1559`, `:1729`, `:1783` |
| Focus and selection | Focus moves in reading order, leading to trailing, top to bottom | DOM order is visual order; no `tabindex` above 0 exists | Grep for `tabindex="` — only `0` and `-1` |
| Gestures | "Support standard gestures everywhere you can"; add custom ones only when necessary | No custom gesture, no scroll hijacking, no swipe handler (`site/index.html:514–520`) | Grep: no `touchstart`/`wheel`/`preventDefault` on scroll |

## Technologies — read the index, applied nothing

| Technology area | Why it was skipped |
|---|---|
| SF Symbols | Requires Apple's licensed symbol set and system font; the page ships three web fonts and hand-drawn inline SVG (the theme icons at `:946–948`, the verdict glyphs) instead |
| Always On, Live Activities, Widgets, App Clips, CarPlay, watchOS complications | No app target exists; a web page has no such surface |
| Machine learning, Apple Pay, Sign in with Apple, HealthKit, HomeKit, Game Center | No such capability is offered, and inventing one to satisfy a checklist would be dishonest |
| App icons | A favicon is shipped (`site/assets/mark.svg`), but Apple's icon grid, layering and platform sizes do not apply to a single SVG favicon |

## The one page that could not be fetched

| Page | Result |
|---|---|
| `navigation-bars` | **Not available.** The URL returns HTTP 301 to `.../toolbars`, and the data endpoint returns 404. Apple merged navigation-bar guidance into the Toolbars page. No guidance was invented for it; the surviving guidance is applied in the Toolbars rows above |

## Liquid Glass — three pages read 2026-09-08, applied as a system

Read via Apple's DocC data endpoints, as above:
`developer.apple.com/tutorials/data/documentation/technologyoverviews/liquid-glass.json`,
`…/adopting-liquid-glass.json`, and
`developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json`.
The implementation and its full derivation are in `site/index.html` **§4a** (`:244–332`),
duplicated verbatim into the arena and dashboard, and summarised in `site/BRAND.md`.

| Apple's line (quoted ≤ 15 words) | Where applied (file:line) | How verified |
|---|---|---|
| Liquid Glass "forms a distinct functional layer for controls and navigation elements" that "floats above the content layer" | `site/index.html:926` the sticky nav and `:999` the hero console; `render/arena/public/index.html:245` the console and `:271` the outcome banner; `realtime/dashboard/index.html:173` the header and `:307–308` the two defense controls | DOM count of `.glass` per surface: site 2, arena 2, dashboard 3 |
| "Don't use Liquid Glass in the content layer" | No `.card`, `.table`, `.stat`, `.verdict`, `.slackcard`, `.tabs__panel`, `.run__out`, arena `.timeline`/`.step`, dashboard `.tile`/`#matrix`/`.feed` carries a glass class | Computed `backdrop-filter` over every content class on all three surfaces: `none` everywhere |
| "avoid overcrowding or layering Liquid Glass elements on top of each other" | Controls that sit **on** a glass surface use `.glass-inset` (`site/index.html:367`) — same optics, no `backdrop-filter`: `.seg` `:440`, `.nav__toggle` `:423`, the console's live button `:1000`; the console's select and toggles are opaque `--panel` fills (`:566`, `:569`). The mobile nav dropdown is opaque `:822–823` | For every `.glass` element on all three surfaces, in both themes: `el.querySelectorAll('.glass').length === 0`. Result: 0 nested, everywhere |
| Regular variant "blurs and adjusts the luminosity of background content to maintain legibility … when components have a significant amount of text" | `.glass` `site/index.html:334–371` — the default, and everything except one case | Computed `backdrop-filter: blur(20px) saturate(1.8)` |
| Clear variant: "highly translucent … for components that float above media backgrounds" | `.glass--clear` `site/index.html:354–355`, used once: the nav at scroll 0 over the hero scene. `:1678–1652?` swaps it out after 8 px | Computed at scroll 0: `blur(9px)`, tint `.16`; at scroll 40: class `is-scrolled`, tint `.42` composite reported by the engine, links `--ink` |
| Scroll edge effect "helps maintain sufficient legibility and contrast for controls by obscuring content that scrolls beneath them" | That Clear → Regular thickening is this effect | Contrast on the composite, page scrolled: pass in either theme |
| "people … turn on accessibility settings that reduce transparency or motion" — "test your app's custom elements … with different configurations of these settings" | `prefers-reduced-transparency: reduce` `site/index.html:892–904`; `prefers-reduced-motion: reduce` `:864–904`; `initGlass` `:1510` returns before binding the pointer specular under the same query | CSSOM dump of each block on all three surfaces (site rules listed below): every `.glass`/`.glass-inset` element resolves to an opaque `var(--panel)`/`var(--bg)`, `background-image: none`, `backdrop-filter: none` |
| "Help maintain a sense of visual continuity … using rounded shapes that are concentric to their containers" | `--glass-r-in: calc(--glass-r - --glass-pad)` `site/index.html:137`; the hero console overrides to 22 − 14 = 8 (`:555`) and its select, toggles, buttons and outcome box all take `--glass-r-in` (`:566`, `:569`, `:576`, `:582`). Arena console 22 − 14 = 8 (`render/arena/public/index.html:64`); dashboard 18 − 10 = 8 (`realtime/dashboard/index.html:63`) | Computed `border-radius`: console 22px, its controls 8px |
| "Use Liquid Glass effects sparingly … Limit these effects to the most important functional elements" | At most 3 composited glass elements on any surface; no glass element carries `will-change` | `document.querySelectorAll('.glass').length` ≤ 3 per surface; computed `will-change` on every `.glass`/`.glass-inset` is `auto` |

**Departure from the brief, on Apple's authority.** The brief asked for glass on the theme
segmented control. That control lives inside the glass nav, and both Apple's line above and
the project's own rule forbid stacking the material. It is `.glass-inset` instead. The same
rule put the console's live button on `.glass-inset`: it sits on the glass console.

**Departure recorded honestly: the refraction is not universal.** `url()` inside
`backdrop-filter` is a WebKit/Blink behaviour; Firefox ignores it, and `CSS.supports()` only
parses the value, so it reports true everywhere. `initGlass` (`site/index.html:1510–1521`)
asks the engine what it actually computed for a throwaway node and only then sets
`data-glass-refract="on"`. The material is finished with blur alone; the displacement is
additive. No frame-rate figure is claimed in this pass: the browser pane reported
`document.visibilityState === "hidden"` for the whole session, which pauses
`requestAnimationFrame`, so none was observed.

**A fallback that loses the cascade is not a fallback.** Both material fallbacks live in §19
at the very end of the stylesheet, after `.btn.glass` (§6) and after the console (§9), for the
reason stated there.

## Three deliberate departures, stated plainly

1. **An app-specific appearance setting.** HIG says avoid one. The brief requires System /
   Light / Dark. The compromise: the default is System, the choice is stored only in
   `localStorage` inside `try/catch`, and choosing System removes the key entirely, so the
   platform setting is the resting state.
2. **Three durations outside the 150–400 ms band.** The statistic counter runs 900 ms
   (`site/index.html:1626`) because it is the figure resolving — content, not chrome — and it
   is off entirely under Reduce Motion. The live-run spinner loops at 900 ms (`:612`) for the
   same reason and is stopped by the same query (`:873`). The scroll parallax has no duration
   at all: it is bound to scroll progress, which makes it reversible by construction.
3. **A wait of 20–60 s exists.** A live Nebius run is a real wait. HIG says show progress and
   say how long; the console does both, and the default action is the instant replay so a
   reader is never made to wait to see a verdict.

## How each check was run

All scripts were executed in the live page (`http://localhost:10077/`, `/arena`, `/dashboard`)
with the browser tool, reading `getComputedStyle` — not against the source — at 1280×800,
1600×900 and 375×812, `prefers-color-scheme` emulated light and dark.

- **hit-target script** — `document.querySelectorAll('a, button, [role=button], select')`,
  skips elements that are `display:none`/`visibility:hidden`, fails anything whose
  `getBoundingClientRect()` is under 44 in either axis. Result this pass: site **23 controls
  at 1280, 15 at 375, 0 failures** in both themes; arena 6, 0; dashboard 3, 0. The two
  inline-link fixes from the previous pass (`site/index.html:547`,
  `render/arena/public/index.html:63`) still hold; the footer's new colour-wheel link sits in
  `.foot a`, which already carries the 44 px box.
- **contrast script** — every visible element with a direct text node; foreground from
  `color`, background composited up the ancestor chain through every translucent layer
  (`alpha·tint + (1−alpha)·backdrop`, down to `body`); WCAG relative luminance; threshold 3:1 for
  large text (≥ 24 px, or ≥ 18.66 px at weight 700) and 4.5:1 otherwise. Site **329 pairs at
  1280 (321 at 375), 0 failures** per theme; worst three light 5.12 / 5.12 / 5.12 (the
  defence heading's blue italic, large text), dark 5.24 / 5.24 / 5.24 (red on `--panel`).
  Arena, measured with a replayed run on screen (36 pairs): light 4.96 / 5.22 / 5.22 (the
  Denied badge on its wash over the glass banner, then the step headings), dark 4.64 / 4.76 /
  4.76 (the Leaked badge, likewise). Dashboard 260 pairs: light 5.74 ×3, dark 5.24 ×3.
  Control borders (same composite, 3:1 floor): site 3.42 light (`.skip`, `.tabs__list`) /
  4.09 dark (`.sel` on the console); arena 3.60 / 4.09; dashboard 3.47 (the two switches) /
  4.09. 0 failures.
- **heading-order script** — document order of `h1…h6` on the site, visible headings only:
  `1,2,3,3,3,3,2,3,3,3,2,3,3,2,3,3,2` (the two verdict `h3`s inside the inactive tab panels
  are `visibility:hidden`; counting them too gives the previous pass's
  `1,2,3,3,3,3,3,3,2,3,3,3,2,3,3,2,3,3,2`). One `h1`, **no skipped levels** either way. Arena
  `1`; dashboard `1,2,2`.
- **landmark check** — one `body > header`, one `nav[aria-label]`, one `main`, one
  `body > footer`, **6 of 6** `section` elements carry `aria-labelledby`, skip link first in
  the tab order (verified by pressing Tab: `a.skip` at `left: 8px`, `:focus-visible` true).
- **keyboard walk** — Tab, ArrowRight/Home/End on the radiogroup and the tablist, Escape on
  the disclosure, all read back from `aria-checked`/`aria-selected`/`tabindex`/`aria-expanded`
  and `document.activeElement`. Enter/Space on the console buttons could not be exercised by
  the pane's key dispatch (a trusted `keydown`/`keyup` arrived, no `keypress` was synthesised,
  so the browser's own activation did not fire); no handler on the page intercepts either key,
  so native activation stands. Runs were started by click and by `.click()`.
- **layout-shift check** — `getBoundingClientRect()` of `#runOut`, `#heroRun` and `#attack`
  before and after every console state. **0 px** movement at 1280 across idle → loading →
  Leaked (Nemotron, guard off) → the "Turn the guard on and replay" nudge → Denied by the
  guard → both defences on (nearest recording, with its note — the tallest state) → Llama,
  guard off → live loading → 429 → 500 → network error → 503; `#attack` stayed at 871.72 px
  and `#runOut` at 268 px throughout. The one shift found in the previous pass (20 px when
  `/api/config` shortened the cost line) stays fixed by the `min-height:3.2em` at `:579`.
- **live path** — **no live Nebius run was spent in this pass**; replay is free and exercises
  the same render path. The previous pass spent one (Nemotron 3 Super 120B, guard ON,
  invariant OFF: loading painted synchronously, verdict `DENIED_BY_GUARD` at 20.1 s, links to
  the arena transcript and to `/api/drop/<runId>`, which answered `received: false`). This
  pass drove the 429, 500, network-failure and 503 states by substituting `window.fetch` in
  the page and read each verdict word, tone and follow-up button back off the DOM: "Live
  limit reached" with "6 of 6 live runs used from this address in the last 10 minutes",
  "The live run failed … Replay still works" twice, and "Live is off" with the live button
  relabelled "Live runs unavailable" and disabled. The live-off-at-load path (a second arena
  without `NEBIUS_API_KEY`) was verified in the previous pass and its code did not change.
  After the nudge, focus returned to the Replay button (`document.activeElement.id ===
  "runReplay"`).
- **clipping script** — every element whose computed overflow clips, compared against its
  scroll size. **0 clipped** at 375 / 1023 / 1280 / 1600.
- **line-length script** — measures the real advance of each text node's **own** computed font
  on a canvas rather than assuming `1ch`, then divides the element's content width by that
  mean advance: an upper bound on characters per rendered line. At 1280 after the rewrite,
  every `p`, `li`, `td`, `th`, `dd` and `figcaption` longer than 120 characters: **46–74**
  (33 blocks measured); the footer legend, which measured 213 uncapped and 78 at `--measure`
  (its mono span widens the mean advance), is capped at 50ch and measures 72. The `.tl li` rows are grid containers holding a `p` and
  are measured through the `p`. Arena: intro 75, transcript lines 73–75 (after `.step .body`
  went 80ch → 56ch). Dashboard: note 74; the event-feed `td`s are one-line log rows at
  154–157 and are recorded as such, not as body copy.
- **token-parity script** — `python3` over `site/index.html`: extracts the two dark blocks,
  asserts they parse identically, that no colour token is defined in a dark block without a
  definition on bare `:root`, and that no colour token is declared without a `var()` reference.
  Result for this blob: the two dark blocks carry 24 identical declaration lines / 53 tokens
  each (the seven wheel tokens, `--code-soft`, `--purple-line` and `--green-line` are new;
  `--accent`, `--ok`, `--bad`, `--amber`, `--brass` and `--focus` left the dark blocks because
  they are now `var()` aliases declared once on `:root`); 0 dark-only tokens; 0 unreferenced
  colour tokens; literals outside the token blocks are the same three as before (the
  scrolled-nav tint overrides and the mask stop). Two non-colour tokens (`--ease`, `--s-9`)
  are declared for the documented motion and space scales and currently have no consumer.
- **reduced-motion / reduced-transparency / no-backdrop-filter** — CSSOM dump of the three
  conditional blocks in the live page. `prefers-reduced-motion: reduce` holds 13 rules
  (`scroll-behavior:auto`; reveals to opacity only; `.layers__plane`/`.layers__depth`
  `transform:none !important`, `animation:none !important`; `.spin` `animation:none`; tabs,
  buttons and segments to opacity transitions; glass `transition:none`).
  `prefers-reduced-transparency: reduce` holds 3 rules (every glass class →
  `background-color:var(--panel)`, `background-image:none`, `backdrop-filter:none`; the
  refract selector → `none`; the header → `var(--bg)`). The `@supports not` block mirrors the
  second. The setting itself cannot be toggled from the browser tool, so the cascade, not a
  screenshot, is the evidence.
- **theme-color check** — read `meta#themeColorResolved` after driving the segmented control
  by keyboard: Light → `#f5f6f9` with the pane's scheme held at dark.
- **console** — read after every navigation on all three surfaces, both schemes, 1280 and
  375: nothing logged on the site, the arena or the dashboard in this pass (the previous
  pass's one-off WebSocket `1006` on the dashboard's first Convex connect did not recur).
- **horizontal overflow** — `scrollWidth === innerWidth` on all three surfaces at 1280 and
  375, both schemes. One finding, fixed: at 375 the dashboard's six-column ASR matrix was 400 px
  wide and pushed the layout viewport to 421 px; it now scrolls inside its own
  `overflow-x:auto` box (`realtime/dashboard/index.html:197`) and the page measures 375.
- **screenshots** — the pane composites a frame only on navigation and reported
  `visibilityState === "hidden"` throughout, so the first viewport of each surface was
  captured at 1280×800 and 375×812 in both schemes, and the whole site page once at
  1000×9999 to check the section colours in sequence; everything below the fold was verified
  by the scripts above, not by eye. No frame-rate figure is claimed.
