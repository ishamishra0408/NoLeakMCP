# Apple Human Interface Guidelines — what was read, what was applied, how it was checked

> **Line numbers are valid for `site/index.html` blob
> `a9c018bc6042a589ecf09fbe092e569e5735abbc`** (1811 lines — check with
> `git hash-object site/index.html`), stamped at the hero-as-product pass, 2026-09-08. The blob
> hash, not a commit, is what fixes the line numbers, so the blob is what to check. Every
> `file:line` below was regenerated for this blob by grepping for the anchor the row names
> (the selector, id, token or function), not by diff-mapping. Rows that cite
> `render/arena/public/index.html` (blob `2b856d3ee4d6fdbf3d8386de353217ab68abdd8a`, 414 lines)
> or `realtime/dashboard/index.html` (blob `2d561f00a9a307138e5dd9b6f2548604271c7aff`, 323 lines)
> are stamped the same way. If a blob hash no longer matches, the line numbers are stale and
> the anchors, not the numbers, are authoritative.

The public site (`site/index.html`) is a web page, not an Apple-platform app, so this is a
translation exercise, not a compliance one: where a guideline is expressed in points on a
touch device it is applied in CSS pixels; where it is about an Apple-only affordance it is
recorded as skipped, with the reason.

**What changed in this pass (2026-09-08, hero-as-product).** The hero is now the product: a
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
run" below. All measurements were re-run against the live page at 1280×800, 1600×900 and the
375×812 mobile preset, in both colour schemes, on 2026-09-08, after the rework.

---

## Foundations

| HIG area | Guideline (quoted or closely paraphrased) | Where applied (file:line) | How verified |
|---|---|---|---|
| Accessibility | Minimum control size on iOS/iPadOS/watchOS is **44×44 pt** | `site/index.html:128` (`--hit:44px`), applied at `:232` `.skip`, `:401` `.nav__brand`, `:406` `.nav__link`, `:417` `.nav__toggle`, `:435` `.seg__b`, `:457` `.btn`, `:560` `.sel`, `:563` `.tog`, `:741` `.tabs__tab`, `:781` `.foot a`. The one inline link in running copy (`.hero__scope a`, `:541`) gets `padding-block:13px`: block padding on an inline box does not move the line but does extend the hit region, 19 → 45 px. **Rewritten:** the rework introduced that link and it measured 62×19 before this fix | **hit-target script** over `a, button, [role=button], select` — 22 visible controls at 1280 (14 at 375, where the nav links sit behind the disclosure), **0 under 44×44** in either axis, both themes |
| Accessibility | Contrast: **4.5:1 up to 17 pt; 3:1 at 18 pt and for bold**; WCAG AA is the same floor | Whole palette, `site/index.html:61–134` (light) / `:139–165` and `:169–193` (dark) | **contrast script** over every visible text-bearing element (297 pairs per theme) in both themes, at 1280, 1600 and 375: 0 failures; worst three light 4.94 / 4.94 / 4.94 (inline `code` chips on `--accent-soft`), dark 5.21 / 5.21 / 5.21 (`--ok` on `--panel`). Text on glass is measured on the composite (see below): worst 5.66 light / 5.86 dark |
| Accessibility | Text must survive enlargement to **at least 200 percent** | Type scale in `rem` with a `vw` term, `site/index.html:104–110`; `--measure` in `ch` at `:115`; the 3-up control row is gated on an `em` media query at `:684`, so a larger browser font stacks it rather than shrinking the measure | **clipping script**: 0 elements whose scroll size exceeds a clipping box, no horizontal scroll at 375 / 1023 / 1280 / 1600 (`scrollWidth === innerWidth` at each) |
| Accessibility (typography) | Keep running body copy to a comfortable line length | `p` is capped at `--measure` (`site/index.html:214`, token at `:115`); the ledger's wide column at `:727`; the arena intro at `render/arena/public/index.html:52`, the dashboard note at `realtime/dashboard/index.html:128`. **Rewritten:** `--measure` moved 57ch → 54ch this pass. `ch` is the advance of "0"; in IBM Plex Sans running text averages ~1.35 characters per ch, so 57ch measured 78 and 54ch measures 73. The 3-up cards got a 16px gutter and 20px side padding (`:684`) and their `dl` went term-above-value (`:692`) because 28px padding and a side-by-side `dl` left 43 and 30 characters a line | **line-length script** at 1280 (the element's own font advance measured on a canvas, an upper bound): every paragraph, list item, caption and cell longer than 120 characters measures **46–74** characters a line; the ledger's four wide cells 66–69. Arena intro 74, dashboard note ≤ 75. At 375 the three `.ctl__limits` paragraphs and two scope list items measure 43–44 (a 343px column, not a layout choice) and the two-column ledger's wide cells 28 — recorded, not hidden |
| Accessibility | "Convey information with more than color alone" | Verdicts carry a glyph plus a word: the three static verdict cards `site/index.html:1082`, `:1099`, `:1115` with `.verdict__ico` at `:762`; the live console verdict `:1670` (word) and `:1673–1677` (glyph per tone, `ICO`); the console legend `:981` names Leaked / Denied / Declined in words beside the dots; ledger cells say "Yes" / "Not yet."; tabs carry text labels next to the dot; the two toggles carry a checkbox state, not only the green border | Visual check in both themes; every `.verdict`, `.run__v`, `.pill`, `.yes`/`.no` inspected for a non-colour carrier |
| Accessibility | Respond to the Reduce Motion setting | `site/index.html:840–858` disables both parallax paths, the reveals' translate, the spinner (`:851`) and the glass transitions; the script reads the media query **live** and stops or restarts the pointer-depth loop on its `change` event (`:1318`, `:1610–1619`) | **CSSOM dump** of the `prefers-reduced-motion: reduce` block (13 rules, listed in "How each check was run") plus code review of the live `change` path — the browser tool cannot toggle the OS setting mid-session, and no frame rate is claimed for a state that was not observed |
| Color | "Avoid using the same color to mean different things" | One meaning per token: `--ok` deny, `--bad` leak, `--amber` detection-only / declined / unavailable, `--brass` brand seal (`site/index.html:72`); the console tones `:1671` map outcomes onto the same three | Token grep: no component reassigns a semantic token to an unrelated role |
| Color | Every custom colour needs a light **and** a dark variant | Every colour token is defined on bare `:root` and redefined in both dark blocks (`site/index.html:61–134`, `:139–165`, `:169–193`) | **token-parity script**: the two dark blocks are byte-identical after de-indentation; 0 tokens defined only in a dark block; 0 orphan colour tokens. The parallax-scenery tokens (`--wall-*`, `--frag-bg`, `--seal-bg`, `--shadow-2/-3`) were deleted with the planes they painted rather than left declared and unused |
| Color | Translucency changes how adjacent colours read | The nav and the console are tokens (`--glass-tint` / `--glass-tint-clear`, `site/index.html:83` light, `:152` and `:181` dark) composited over the page | Contrast script's `bgBehind()` walks ancestors and alpha-composites (`alpha·tint + (1−alpha)·backdrop`) rather than reading the element's own token. Worst composite pairs, light: `.seg__t` 5.66, `.run__k` 5.76; dark: `.seg__t` 5.86, `.run__note` 6.25; control borders on the console 3.58 light / 4.09 dark |
| Dark Mode | Use colours that adapt to the appearance; do not hardcode | Zero colour literals remain in component CSS; the only `#000` left is a **mask alpha stop**, commented at `site/index.html:517` | `grep` for `#hex`/`rgb(a)` below the token blocks returns exactly one hit, the mask stop |
| Dark Mode | "Soften the color of white backgrounds" | Light ground is `--bg:#f5f6f9` / `--bg-2:#eceff4`, not `#fff`; `#fff` is reserved for raised panels (`site/index.html:65`) | Computed `body` background in light theme: `rgb(245, 246, 249)` |
| Dark Mode | Apple advises against an app-specific appearance switch | **Deliberately not followed**, and said so: the brief requires a System / Light / Dark control. It defaults to **System**, so the platform setting still wins unless the reader opts out (`site/index.html:921–925`, JS `:1336–1391`) | Loaded with no stored value → `data-theme` absent, follows `prefers-color-scheme`; verified in both emulated schemes; Home key restores System and removes the stored key |
| Dark Mode | The browser chrome should match the appearance the reader is looking at | `meta[name=theme-color]` is written from the **resolved** theme inside `apply()` (`site/index.html:1350–1360`, called at `:1369`), ahead of the two media-scoped no-JS fallbacks at `:9–10`; a System reader still tracks the OS via the `change` listener at `:1388–1390` | Measured in-page: ArrowRight to Light → `#f5f6f9` with the pane's own scheme held at dark — the override, not the media query, answers |
| Layout | Respect margins and guides; keep the most important item leading and top | 1120 px container with a 24/16 px gutter (`site/index.html:220`); the hero is a two-column grid above 1024 (`:531`): the situation statement leads, the working console sits beside it, the primary action first (`:975`) | Screenshots at 375, 1023, 1280, 1600 in both themes; JS geometry at each |
| Layout | Test across orientations, localisations and text sizes | Breakpoints at `site/index.html:531` (hero two-up), `:684` (3-up), `:789`, `:793`, `:809`, `:813` | `scrollWidth === innerWidth` at every width tested |
| Layout | Reduce column count as text size grows (Typography, applied to layout) | `@media (min-width: 70em) { .trio { repeat(3, …) } }` at `site/index.html:684` | `em` in a media query is the browser's own font size: at 16 px the 3-up needs 1120 px, at 20 px it needs 1400 px, so at 1280 the cards stack instead |
| Materials | Reserve translucent material for the control layer, not content | `backdrop-filter` is declared only inside the `.glass` family (`site/index.html:339–340` and `:354–355`, each with its `-webkit-` twin) and exactly two elements carry it: the sticky nav (`:902`) and the hero console (`:953`) — the console is a control surface, not content. No card, table, terminal, ledger, tab panel or Slack artefact is translucent. **Rewritten:** the two secondary buttons that were glass are gone with the CTA; the console's live button sits ON the console and is `.glass-inset` (`:976`) | DOM count in both themes: `.glass` = 2 on the site (arena 2, dashboard 3), `.glass .glass` = 0; every `.card`/`.table`/`.stat`/`.verdict`/`.slackcard` computes `backdrop-filter: none` |
| Materials | Thicker material = more contrast; always use vibrant colour on top | The nav is Clear at scroll 0 and thickens to Regular after 8 px (`site/index.html:392–398`, `:1590–1595`); once detached its links go to full `--ink`. **Rewritten:** the earlier `--scrim` token no longer exists | Contrast on the composite: nav links over the darkest content that can pass under the bar ≥ 9.9:1 light; over white (the Slack PNG) 6.3:1 dark |
| Materials | A material needs a fallback where it is unavailable | `@supports not ((backdrop-filter…))` paints `--panel`/`--bg` solid, `site/index.html:877–880`; `prefers-reduced-transparency: reduce` does the same at `:868–876`. Both live in §19 at the very END of the stylesheet, because a fallback that loses on source order is not a fallback | CSSOM dump of both blocks (listed below): every `.glass`/`.glass-inset`/`.btn.glass` rule resolves to `var(--panel)`/`var(--bg)`, `background-image: none`, `backdrop-filter: none` |
| Motion | "Add motion purposefully" — never decoration | Every animation explains something: the reveal of a claim, the tab swap, the spinner that says a live run is in flight (`:604`, content not chrome). Durations 180–320 ms (`site/index.html:123`) | CSS grep: no `transition`/`animation` duration outside 150–400 ms except the three documented exceptions below |
| Motion | "Let people cancel motion" / do not make people wait for an animation | Nothing blocks reading: reveals are opacity+14 px, tab panels are grid-stacked so height never changes, the scroll parallax is scroll-linked so it is reversible by definition (`site/index.html:508–514`). A live run is the one real wait and it says so up front ("Usually 20–60 s", `:1756`) with Replay offered as the instant path | Reading the page while scrolling; no content is gated behind an animation |
| Motion | "Make motion optional" — never the sole channel | The spinner is paired with the words "Loading…" / "Running live…" (`:1745`, `:1756`); under Reduce Motion it stops and the words remain (`:851`) | Reduced-motion CSSOM dump; the loading copy read off the DOM |
| Typography | Prefer Regular/Medium/Semibold; "avoid light font weights" | Only 400/500/600 are loaded (`site/index.html:14`), and the same URL on the arena (`render/arena/public/index.html:9`) and the dashboard (`realtime/dashboard/index.html:9`) | Font URL grep on all three: `wght@400;500;600` for Plex Sans, `400;500` for Plex Mono, one request each |
| Typography | Minimise the number of typefaces | Three, each with one job, on all three surfaces: Instrument Serif display, IBM Plex Sans text, IBM Plex Mono code (`site/index.html:98–100`; `render/arena/public/index.html:36–38`; `realtime/dashboard/index.html:30–32`). **Rewritten:** the arena and dashboard were on the system stack before this pass | `--serif/--sans/--mono` are the only families declared; computed `font-family` on `body` and `h1` of each surface read back as Plex Sans / Instrument Serif; `tests/arena.test.mjs` asserts no leftover `ui-sans-serif,system-ui` body stack |
| Typography | Keep truncation minimal as font size increases | Nothing truncates. **Rewritten:** the `.frag` scenery that truncated was cut with the planes | Clipping script: 0 clipped elements |
| Typography | Custom fonts must honour Dynamic Type behaviour | The whole scale is `clamp()` in `rem`, so it tracks the browser's font-size setting (`site/index.html:104–110`); the hero `h1` has its own cap so it shares a row with the console (`:536`) | Measured `h1` at 1280: four lines beside the console; at 1600: four lines, console 268 px reserved |
| Typography | Avoid tight leading on three or more lines | Body 1.6, terminal 1.7, lede 1.55 (`site/index.html:202`, `:486`, `:216`) | Computed line-height on every long paragraph ≥ 1.5 |
| Writing | "Be action oriented" — use a verb for button and link labels | "Replay a recorded run", "Run live on Nebius", "Turn the guard on and replay", "Run this one live on Nebius", "Skip to main content" (`site/index.html:975–976`, `:1699–1700`, `:884`) | Every `.btn` label starts with a verb; read off the DOM |
| Writing | Pick a capitalisation style and apply it consistently | Sentence case throughout: tabs are "Guard on" / "Invariant on" (`:1066–1067`), verdicts "Leaked" / "Denied by the guard" / "Denied by the invariant" / "Model declined" (`:1082`, `:1099`, `:1115`, `:1670`) | Grep for `!` in copy: none |
| Writing | Avoid "we"; use possessives sparingly | Copy is second-person for the reader's situation ("Your agent reads one poisoned Slack reply") and third-person, forensic, for the mechanism | Full read of the page copy |

## Patterns

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Feedback | Integrate status feedback into the interface, near what it describes | **Rewritten.** The verdict renders inside the console that produced it, in a reserved box (`.run__out`, `site/index.html:576`, markup `:979`), under the controls that were set; the scorer's static verdict is printed inside the terminal card it belongs to (`:1075–1080`); the ledger's "Not yet." sits in the row it qualifies (`:1247`) | Live at 1280/1600/375 in both themes: replay, live, rate-limited, live-off, error states all paint into the same box; `#attack`'s top edge did not move by a pixel across any state (847.06 px at 1280) |
| Feedback | Deliver feedback through more than one channel | Every console state is colour (`data-tone`) **and** a word **and** a glyph (`:1721–1723`); the box is `role="status" aria-live="polite"` (`:979`) so the verdict is announced | Same check as "colour is not the only carrier" above; attributes read off the DOM after each state |
| Feedback | Show that a command could not be carried out, and why | The console says why and what to do instead: 429 → the allowance used, "Replay is instant and unlimited" (`:1758–1762`); 503 → "Live runs are off on this deployment (no API key)" and the live button relabelled and disabled (`:1764`, `:1776`); 5xx / network → "Replay still works" (`:1768–1769`); no matching recording → "run it live" (`:1743`). The ledger states what is owed in the same cell as the claim (`:1247`) | Each state exercised in the browser (429/500/503/network by substituting `fetch`; live-off for real against a second arena booted without a key); ledger copy compared against `README.md:64` |
| Loading | "Show something as soon as possible"; a blank wait reads as a bug | **Rewritten.** The console box reserves the height of its tallest state (`--out-h`, `:576–581`, 272 px at ≤767) so no verdict shifts the page; the cost line reserves two lines (`:573`) so the `/api/config` rewrite cannot move the console either; the loading state paints immediately with a spinner and a sentence that states the expected wait (`:1745`, `:1756`); the Slack screenshot slot is a fixed `aspect-ratio` box (`:659–660`, markup `:1018`) | Measured: tallest replay state 266 px content in a 268 px box at 1280, 270 in 272 at 375; live run: loading painted synchronously on click, verdict at 20 s, layout unchanged |
| Entering data | Prefer selection components over free text; ask only for what is needed | **Rewritten.** The page now has one form (`:953`): a `select` for the victim (`:961`) and two labelled checkboxes (`:969–970`) — no free text anywhere. It is a real `<form action="/arena" method="get">`, so without JavaScript it submits the same three fields to the arena, which pre-selects them (`render/arena/public/index.html:374–377`); `<noscript>` says so (`:986`) | Submitted to `/arena?model=llama&guard=on&invariant=on`: the arena loaded with Llama and both toggles on. `tests/arena.test.mjs` asserts the form, its fields and the button labels |
| Honesty (project rule, not a HIG page) | A recreation must say what is real and what is drawn | The first beat shows the **redacted screenshot** when `site/assets/slack-thread.png` exists (it does) and the hand-built recreation of the thread reply otherwise (`:1018–1051`), each with its own caption saying exactly what was cropped, blurred or elided (`:1050`, `:1051`); the third beat quotes the recap verbatim from the same screenshot and says so (`:1155`); ids are synthetic `T0XXXXXXXXX` / `C0XXXXXXXXX` (`:1024`, `:1135`) | Both ways verified: server-side by `tests/arena.test.mjs` (writes a 1×1 PNG, asserts the marker, deletes it, asserts it clears) and in the browser by toggling `body[data-slack-shot]`: recreation `display:block`, image `none`, captions swap |
| Managing notifications | **Skipped.** The page sends no notifications and has no interruption levels | — | — |

## Components

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Buttons | "a button needs a hit region of at least 44x44 pt" | `.btn` at `site/index.html:457`; `.sel` `:560`; `.tog` `:563` | Hit-target script: 0 failures |
| Buttons | "Always include a press state for a custom button" | `.btn:active` at `:465`, `.seg__b:active` at `:441`, `.tabs__tab:active` at `:745`, `.nav__toggle:active` at `:421` | CSS grep: every interactive class has `:hover`, `:active`, `:focus-visible` and, for `.btn`, a disabled state at `:472` |
| Buttons | Keep prominent buttons to one or two per view | One primary and one secondary in the console (`:975–976`); the verdict adds at most **one** follow-up button, tied to what was just seen (`:1697–1701`) | Count of `.btn--primary` on the page: 1 |
| Buttons | Distinguish the preferred option by style, not size | Both console buttons are the same height and padding; only fill differs (`:457`, `:469`) | Measured: identical `min-height` 44, same padding |
| Buttons | Disabling a control must not strand keyboard focus | Both buttons are disabled while a run is in flight; when it ends, focus returns to the button that started it if it fell to `<body>` (`:1693–1696`, `lastBtn` set at `:1779` and `:1786`) | Keyboard: focus Replay, run, verdict painted, `document.activeElement` is Replay again and `:focus-visible` matches |
| Segmented controls | "no more than about five to seven segments"; use similarly sized content | 3 segments, equal padding (`site/index.html:921–925`). **Rewritten:** icon-only on the bar, each with a visually hidden text name (`.seg__t`, `:439`) that returns inside the mobile disclosure (`:807`) | DOM count; at 375 with the menu open the three names render (`position: static`, width 49 px) |
| Segmented controls | Do not mix action segments with selection-state segments | All three segments set state; none performs an action | Read of the handler at `:1377–1385` |
| Segmented controls | *(ARIA note)* The theme control is a **radio group** (`role="radio"` + `aria-checked`); the kill-chain **tabs** use `role="tab"` + `aria-selected` + `aria-controls`. Both support arrow keys, Home and End | radiogroup `:921`, keys `:1379–1384`; tablist `:1063`, tabs `:1065–1067`, keys `:1645–1650` | Keyboard walk of both controls in the browser: ArrowRight moved the radio to Light (`aria-checked`, `tabindex`, `data-theme`, stored key all read back), Home restored System; ArrowRight/End/Home moved the tabs and the active panel |
| Tab views | "Avoid providing more than six tabs in a tab view" | 3 tabs (`site/index.html:1065–1067`) | DOM count |
| Tab views | A pane's controls affect only that pane; panes are mutually exclusive | Panels are grid-stacked and switched by `.is-active`; the inactive ones are `visibility:hidden` (`:750–753`, JS `:1631–1642`) | Inactive panels compute `visibility: hidden`; all three panels measure 239 px at 1280, so the height never changes between tabs |
| Tab views | *(APG)* A tab panel is in the tab sequence, so it is reachable when it holds no focusable control | `tabindex="0"` on all three panels (`site/index.html:1070`, `:1087`, `:1104`) | DOM read: 3 of 3 `[role=tabpanel]` carry `tabindex="0"`; the only `tabindex` values on the page are `0` and `-1` |
| Tab views | Label each tab so people can predict its contents | "Attack", "Guard on", "Invariant on" | Read of the DOM |
| Toolbars (Navigation bars merged into it) | Choose items deliberately; define what collapses at narrow widths | 6 links + icon theme control above 1100 px; below that everything collapses behind a Menu disclosure (`site/index.html:793–808`) | Measured at 1023 and 375: brand and Menu only on the bar; disclosure holds 6 links at 44 px tall and the full-width segmented control |
| Toolbars | Provide a reliable way to restore a hidden bar | The disclosure is a labelled button that toggles to "Close", is `aria-expanded`, and closes on Escape and on any link activation (`:1463–1472`) | Keyboard: open, Escape closes and focus returns to the Menu button (read back) |
| Labels | Use a label only for non-editable text; prefer system fonts and the system label colours | Two text roles only — `--ink` primary and `--dim` secondary (`site/index.html:70`); the console's field labels are `--dim` small caps (`.fld__l`, `:555`) | Contrast script covers both roles on every surface |
| Labels | "Make useful label text selectable" | Nothing on the page blocks selection except the toggle labels (`user-select:none` on `.tog`, `:563`, so a click toggles rather than selects) | `user-select` grep: one hit, the toggle |
| Toggles | Use a toggle only for two opposing values | The two defence toggles are exactly that: guard on/off, invariant on/off, native checkboxes with `accent-color:--ok` (`:565`); the theme has three states, so it stays a segmented picker | Design decision recorded here |
| Pickers | Use a picker for a short list of mutually exclusive options | The victim model is a native `select` (`:961`), repopulated from `/api/config` (`:1792–1798`) so the page cannot list a model the arena does not have | DOM read after config: two options, the same two the arena serves |

## Inputs

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Keyboards | "Respect standard keyboard shortcuts" — do not repurpose them | The page binds only Arrow, Home, End (inside a composite widget) and Escape (to dismiss). No character or modifier shortcut is claimed, and nothing intercepts Enter or Space on a button | Grep of every `keydown` handler: `:1379–1384`, `:1470–1472`, `:1645–1650` |
| Keyboards | Do not implement custom keyboard navigation for buttons and segmented controls where the platform already handles it | Roving `tabindex` is used only where ARIA requires it (radiogroup, tablist); every other control is a plain focusable element in DOM order | Tab order walked: skip link → brand → links → theme → console (select, two checkboxes, two buttons) → content → footer |
| Pointing devices | "about 12 points of padding around elements that include a bezel" | Bezelled controls carry ≥ 12 px of internal padding (`.btn` 20 px, `.sel` 12 px, `.tog` 12 px, `.nav__link` 12 px) and the segmented control adds a 3 px inner gutter (`:434`) | Measured padding on each control class |
| Pointing devices | "Avoid creating gratuitous pointer and content effects" | Pointer depth is capped at 6 px (the largest `data-depth` left after the planes were cut, `:938`), eased at 0.08 per frame (`site/index.html:1575`), and gated to `(hover:hover) and (pointer:fine)` (`:1320`) | Touch emulation at the mobile preset: no pointer listeners attach |
| Focus and selection | "Rely on system-provided focus effects"; build custom ones only if necessary | One rule, `:focus-visible` with a 2 px ring and 3 px offset (`site/index.html:227`); nothing sets `outline: none` | CSSOM grep: 0 rules set `outline: none`/`0`; 24 controls focused in keyboard modality all match `:focus-visible` with a `solid 2px` outline |
| Focus and selection | "Avoid changing focus without people's interaction" | Focus moves only on an explicit key press (arrow/Home/End inside a widget), on Escape returning focus to the disclosure, or back to the button the reader pressed once its run ends | Read of every `.focus()` call: `:1378`, `:1381–1383`, `:1471`, `:1641`, `:1695` |
| Focus and selection | Focus moves in reading order, leading to trailing, top to bottom | DOM order is visual order; no `tabindex` above 0 exists | Grep for `tabindex="` — only `0` and `-1` |
| Gestures | "Support standard gestures everywhere you can"; add custom ones only when necessary | No custom gesture, no scroll hijacking, no swipe handler (`site/index.html:508–514`) | Grep: no `touchstart`/`wheel`/`preventDefault` on scroll |

## Technologies — read the index, applied nothing

| Technology area | Why it was skipped |
|---|---|
| SF Symbols | Requires Apple's licensed symbol set and system font; the page ships three web fonts and hand-drawn inline SVG (the theme icons at `:922–924`, the verdict glyphs) instead |
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
The implementation and its full derivation are in `site/index.html` **§4a** (`:238–326`),
duplicated verbatim into the arena and dashboard, and summarised in `site/BRAND.md`.

| Apple's line (quoted ≤ 15 words) | Where applied (file:line) | How verified |
|---|---|---|
| Liquid Glass "forms a distinct functional layer for controls and navigation elements" that "floats above the content layer" | `site/index.html:902` the sticky nav and `:953` the hero console; `render/arena/public/index.html:227` the console and `:253` the outcome banner; `realtime/dashboard/index.html:163` the header and `:172–173` the two defense controls | DOM count of `.glass` per surface: site 2, arena 2, dashboard 3 |
| "Don't use Liquid Glass in the content layer" | No `.card`, `.table`, `.stat`, `.verdict`, `.slackcard`, `.tabs__panel`, `.run__out`, arena `.timeline`/`.step`, dashboard `.tile`/`#matrix`/`.feed` carries a glass class | Computed `backdrop-filter` over every content class on all three surfaces: `none` everywhere |
| "avoid overcrowding or layering Liquid Glass elements on top of each other" | Controls that sit **on** a glass surface use `.glass-inset` (`site/index.html:361`) — same optics, no `backdrop-filter`: `.seg` `:434`, `.nav__toggle` `:417`, the console's live button `:976`; the console's select and toggles are opaque `--panel` fills (`:560`, `:563`). The mobile nav dropdown is opaque `:797–798` | For every `.glass` element on all three surfaces, in both themes: `el.querySelectorAll('.glass').length === 0`. Result: 0 nested, everywhere |
| Regular variant "blurs and adjusts the luminosity of background content to maintain legibility … when components have a significant amount of text" | `.glass` `site/index.html:328–346` — the default, and everything except one case | Computed `backdrop-filter: blur(20px) saturate(1.8)` |
| Clear variant: "highly translucent … for components that float above media backgrounds" | `.glass--clear` `site/index.html:348–349`, used once: the nav at scroll 0 over the hero scene. `:1590–1595` swaps it out after 8 px | Computed at scroll 0: `blur(9px)`, tint `.16`; at scroll 40: class `is-scrolled`, tint `.42` composite reported by the engine, links `--ink` |
| Scroll edge effect "helps maintain sufficient legibility and contrast for controls by obscuring content that scrolls beneath them" | That Clear → Regular thickening is this effect | Contrast on the composite, page scrolled: pass in either theme |
| "people … turn on accessibility settings that reduce transparency or motion" — "test your app's custom elements … with different configurations of these settings" | `prefers-reduced-transparency: reduce` `site/index.html:868–876`; `prefers-reduced-motion: reduce` `:840–858`; `initGlass` `:1422` returns before binding the pointer specular under the same query | CSSOM dump of each block on all three surfaces (site rules listed below): every `.glass`/`.glass-inset` element resolves to an opaque `var(--panel)`/`var(--bg)`, `background-image: none`, `backdrop-filter: none` |
| "Help maintain a sense of visual continuity … using rounded shapes that are concentric to their containers" | `--glass-r-in: calc(--glass-r - --glass-pad)` `site/index.html:133`; the hero console overrides to 22 − 14 = 8 (`:549`) and its select, toggles, buttons and outcome box all take `--glass-r-in` (`:560`, `:563`, `:570`, `:576`). Arena console 22 − 14 = 8 (`render/arena/public/index.html:32`); dashboard 18 − 10 = 8 (`realtime/dashboard/index.html:27`) | Computed `border-radius`: console 22px, its controls 8px |
| "Use Liquid Glass effects sparingly … Limit these effects to the most important functional elements" | At most 3 composited glass elements on any surface; no glass element carries `will-change` | `document.querySelectorAll('.glass').length` ≤ 3 per surface; computed `will-change` on every `.glass`/`.glass-inset` is `auto` |

**Departure from the brief, on Apple's authority.** The brief asked for glass on the theme
segmented control. That control lives inside the glass nav, and both Apple's line above and
the project's own rule forbid stacking the material. It is `.glass-inset` instead. The same
rule put the console's live button on `.glass-inset`: it sits on the glass console.

**Departure recorded honestly: the refraction is not universal.** `url()` inside
`backdrop-filter` is a WebKit/Blink behaviour; Firefox ignores it, and `CSS.supports()` only
parses the value, so it reports true everywhere. `initGlass` (`site/index.html:1422–1433`)
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
   (`site/index.html:1538`) because it is the figure resolving — content, not chrome — and it
   is off entirely under Reduce Motion. The live-run spinner loops at 900 ms (`:604`) for the
   same reason and is stopped by the same query (`:851`). The scroll parallax has no duration
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
  `getBoundingClientRect()` is under 44 in either axis. Result: site **22 controls at 1280,
  14 at 375, 0 failures**; arena 6, 0; dashboard 3, 0 — after the two inline-link fixes
  (`site/index.html:541`, `render/arena/public/index.html:55`), which had measured 19 and 17 px tall.
- **contrast script** — every visible element with a direct text node; foreground from
  `color`, background composited up the ancestor chain through every translucent layer
  (`alpha·tint + (1−alpha)·backdrop`, down to `body`); WCAG relative luminance; threshold 3:1 for
  large text (≥ 24 px, or ≥ 18.66 px at weight 700) and 4.5:1 otherwise. Site **297 pairs, 0
  failures** per theme; worst three light 4.94 / 4.94 / 4.94, dark 5.21 / 5.21 / 5.21. Arena 18
  pairs: light worst 5.49 / 5.49 / 5.54, dark 6.25 ×3. Dashboard 260 pairs: light 5.74 ×3, dark
  5.21 ×3. Control borders (same composite, 3:1 floor): site 3.42 light (`.skip`) / 4.09 dark
  (`.sel` on the console); arena 3.60 / 4.09; dashboard 6.17 / 4.31. 0 failures.
- **heading-order script** — document order of `h1…h6` on the site:
  `1,2,3,3,3,3,3,3,2,3,3,3,2,3,3,2,3,3,2`. One `h1`, **no skipped levels**. Arena `1`;
  dashboard `1,2,2`.
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
  Leaked → Denied (nearest recording, the tallest state) → live → 429 → 500 → network error →
  503. The one shift found (20 px when `/api/config` shortened the cost line) is fixed by the
  `min-height:3.2em` at `:573`.
- **live path** — two live Nebius runs are the budget; **one** was spent: Nemotron 3 Super
  120B, guard ON, invariant OFF, at 1280 dark. Loading painted synchronously on click
  (spinner + "Running live on Nebius — … Usually 20–60 s"), verdict `DENIED_BY_GUARD` at
  20.1 s, `Live · … · guard ON · invariant OFF`, links to the arena transcript and to
  `/api/drop/<runId>` (which answered `received: false`); the cost line then read "1 of 6
  live runs used". The 429, 500, network-failure and 503 states were driven by substituting
  `window.fetch` in the page; the live-off-at-load state was driven for real by booting a
  second arena on :10078 without `NEBIUS_API_KEY` (button relabelled "Live runs unavailable",
  disabled, Replay working).
- **clipping script** — every element whose computed overflow clips, compared against its
  scroll size. **0 clipped** at 375 / 1023 / 1280 / 1600.
- **line-length script** — measures the real advance of each text node's **own** computed font
  on a canvas rather than assuming `1ch`, then divides the element's content width by that
  mean advance: an upper bound on characters per rendered line. At 1280, every `p`, `li`,
  `td`, `dd` and `figcaption` longer than 120 characters: **46–74**; ledger cells 66–69. The
  `.tl li` rows are grid containers holding a `p` and are measured through the `p`.
- **token-parity script** — `python3` over `site/index.html`: extracts the two dark blocks,
  asserts they parse identically, that no colour token is defined in a dark block without a
  definition on bare `:root`, and that no colour token is declared without a `var()` reference.
  Result for this blob: the two dark blocks carry 23 identical lines / 49 tokens each; 0 dark-only
  tokens; 0 unreferenced colour tokens. Two non-colour tokens (`--ease`, `--s-9`) are declared for
  the documented motion and space scales and currently have no consumer.
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
- **console** — read after every navigation on all three surfaces: the site and the arena
  logged nothing. The dashboard logged one WebSocket `1006` on its first connect to Convex,
  followed 96 ms later by "WebSocket reconnected"; it did not recur.
