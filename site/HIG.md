# Apple Human Interface Guidelines — what was read, what was applied, how it was checked

The public site (`site/index.html`) is a web page, not an Apple-platform app, so this is a
translation exercise, not a compliance one: where a guideline is expressed in points on a
touch device it is applied in CSS pixels; where it is about an Apple-only affordance it is
recorded as skipped, with the reason.

**Sources.** 24 HIG pages were requested on 2026-09-08. 23 returned content, 1 no longer
exists. The human-facing `developer.apple.com/design/human-interface-guidelines/<page>` URLs
are a JavaScript single-page app that serves only a title to a plain fetch; the content is
served by Apple's public DocC data endpoint at
`developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`, which is
what was actually read. Quotations are kept under 15 words; everything longer is paraphrase.

**Line numbers** refer to `site/index.html` at the commit that adds this file. Verification
methods are named in the last column and spelled out under "How each check was run" below.

---

## Foundations

| HIG area | Guideline (quoted or closely paraphrased) | Where applied (file:line) | How verified |
|---|---|---|---|
| Accessibility | Minimum control size on iOS/iPadOS/watchOS is **44×44 pt** | `site/index.html:121` (`--hit:44px`), applied at `:216` `.skip`, `:234` `.nav__brand`, `:239` `.nav__link`, `:248` `.nav__toggle`, `:258` `.seg__b`, `:269` `.btn`, `:482` `.tabs__tab`, `:533` `.foot a` | **hit-target script** over `a, button, [role=button], input, select` — 23 controls, 0 under 44×44, at 1280 and at 375 with the menu open |
| Accessibility | Contrast: **4.5:1 up to 17 pt; 3:1 at 18 pt and for bold**; WCAG AA is the same floor | Whole palette, `site/index.html:61–121` (light) / `:127–151` and `:155–178` (dark) | **contrast script** over every visible text-bearing element (372 pairs) in both themes: 0 failures; worst pair 4.64:1 light, 5.20:1 dark |
| Accessibility | Text must survive enlargement to **at least 200 percent** | Type scale in `rem` with a `vw` term, `site/index.html:100–107`; `--measure` in `ch` at `:108`; the 3-up card row is gated on an `em` media query at `:365`, so a larger browser font stacks it rather than shrinking the measure | **clipping script** at root font-size 16 px and 20 px: 0 clipped elements, no horizontal scroll at either size; line length stays inside 47–74 characters at 16 px, and the 3-up card row stacks rather than shrinking once the browser font passes the 70em breakpoint |
| Accessibility | "Convey information with more than color alone" | Verdicts carry a glyph plus a word: `site/index.html:962`, `:979`, `:995` with `.verdict__ico` at `:503`; ledger cells say "Yes" / "Not yet."; tabs carry text labels next to the dot | Visual check in both themes; every `.verdict`, `.pill`, `.yes`/`.no` inspected for a non-colour carrier |
| Accessibility | Respond to the Reduce Motion setting | `site/index.html:603–615` disables both parallax paths, stacking, ticking and reveals | **CSSOM dump** of the `prefers-reduced-motion: reduce` block plus a patched-page run: `parallaxPath: "off"`, plane inline transforms empty, computed `transform: none` |
| Color | "Avoid using the same color to mean different things" | One meaning per token: `--ok` deny, `--bad` leak, `--amber` detection-only, `--brass` brand seal (`site/index.html:71–74`); documented in `site/BRAND.md` | Token grep: no component reassigns a semantic token to an unrelated role |
| Color | Every custom colour needs a light **and** a dark variant | Every colour token is defined on bare `:root` and redefined in both dark blocks (`site/index.html:61–121`, `:127–151`, `:155–178`) | **token-parity script** (`python3`): 21 declarations in each dark block, byte-identical; 0 tokens defined only in a dark block |
| Color | Translucency changes how adjacent colours read | The nav material is a token (`--scrim`) composited over the page, and the contrast script composites alpha over the real ancestor stack rather than assuming opaque | Contrast script's `bgOf()` walks ancestors and alpha-composites; the nav's own links are included in the 372 pairs |
| Dark Mode | Use colours that adapt to the appearance; do not hardcode | Zero colour literals remain in component CSS; the only `#000` left is a **mask alpha stop**, commented at `site/index.html:323` | `grep` for `#hex`/`rgb(a)` below the token blocks returns exactly one hit, the mask stop |
| Dark Mode | "Soften the color of white backgrounds" | Light ground is `--bg:#f5f6f9` / `--bg-2:#eceff4`, not `#fff`; `#fff` is reserved for raised panels (`site/index.html:65`) | Computed `body` background in light theme: `rgb(245, 246, 249)` |
| Dark Mode | Apple advises against an app-specific appearance switch | **Deliberately not followed**, and said so: the brief requires a System / Light / Dark control. It defaults to **System**, so the platform setting still wins unless the reader opts out (`site/index.html:638–642`, JS `:1119–1147`) | Loaded with no stored value → `data-theme` absent, follows `prefers-color-scheme`; verified in both emulated schemes |
| Layout | Respect margins and guides; keep the most important item leading and top | 1120 px container with a 24/16 px gutter (`site/index.html:202`), hero copy leading, primary action first (`:690`) | Layout screenshots at 320/375/768/1024/1100/1200/1280/1440/1600 |
| Layout | Test across orientations, localisations and text sizes | Breakpoints at 1279/1199/1099/1023/767 (`site/index.html:540–602`); the em-based ppp grid reflows on text size | `scrollWidth === innerWidth` at all eight widths tested — no horizontal scroll anywhere |
| Layout | Reduce column count as text size grows (Typography, applied to layout) | `@media (min-width: 70em) { .ppp__grid { repeat(3, minmax(0,1fr)) } }` at `site/index.html:365` | `em` in a media query is the browser's own font size: at the 16 px default the 3-up needs 1120 px, at 20 px it needs 1400 px, so at a 1280 px viewport the cards stack instead. Measured columns at 1280/16 px: `372px 372px 372px`, 47 characters a line |
| Materials | Reserve translucent material for the control layer, not content | Only the sticky header uses `backdrop-filter` (`site/index.html:225`); no card, table or terminal is translucent | CSS grep: `backdrop-filter` appears once, on `.site-header` |
| Materials | Thicker material = more contrast; always use vibrant colour on top | `--scrim` is a 72 % ground tint plus `saturate(1.4) blur(16px)`; nav text is `--ink`/`--dim` over it | Contrast script includes the nav links composited over the scrim: pass in both themes |
| Materials | A material needs a fallback where it is unavailable | `@supports not ((backdrop-filter…))` paints `--bg` solid, `site/index.html:228–230` | CSSOM dump lists the `@supports not (…)` rule and its declaration |
| Motion | "Add motion purposefully" — never decoration | Every animation explains the kill chain: depth in the scene, the reveal of a claim, the tab swap. Durations 180–320 ms (`site/index.html:116`) | CSS grep: no `transition`/`animation` duration outside 150–400 ms except the two documented exceptions below |
| Motion | "Let people cancel motion" / do not make people wait for an animation | Nothing blocks reading: reveals are opacity+14 px, panels are height-locked, the scroll parallax is scroll-linked so it is reversible by definition (`site/index.html:314–320`) | Reading the page while scrolling up and down; no content is gated behind an animation |
| Motion | "Make motion optional" — never the sole channel | No information is carried only by motion; every animated element has a static state that says the same thing | Reduced-motion run still shows all 47 reveal targets and all text |
| Typography | Prefer Regular/Medium/Semibold; "avoid light font weights" | Only 400/500/600 are loaded (`site/index.html:13`) | Font URL grep: `wght@400;500;600` for Plex Sans, `400;500` for Plex Mono |
| Typography | Minimise the number of typefaces | Three, each with one job: Instrument Serif display, IBM Plex Sans text, IBM Plex Mono code (`site/index.html:95–97`) | `--serif/--sans/--mono` are the only families declared |
| Typography | Keep truncation minimal as font size increases | Only `.frag` truncates, and it is decorative scenery inside `aria-hidden` (`site/index.html:336`); nothing else clips | Clipping script at 16 px and 20 px: 0 clipped elements |
| Typography | Custom fonts must honour Dynamic Type behaviour | The whole scale is `clamp()` in `rem`, so it tracks the browser's font-size setting (`site/index.html:100–107`) | At root 20 px, `body` computes to 21.16 px and `h1` to 88.32 px — the scale moved with the setting |
| Typography | Avoid tight leading on three or more lines | Body 1.6, terminal 1.7, lede 1.55 (`site/index.html:186`, `:292`, `:200`) | Computed line-height on every long paragraph ≥ 1.5 |
| Writing | "Be action oriented" — use a verb for button and link labels | "Launch the arena", "Watch the live feed", "Skip to main content" (`site/index.html:690–691`, `:619`) | Every `.btn` label starts with a verb; read off the DOM |
| Writing | Pick a capitalisation style and apply it consistently | Sentence case throughout: tabs are "Guard on" / "Invariant on" (`:947–948`), verdicts "Leaked" / "Denied by the guard" (`:963`, `:980`) | Grep for `!` in copy: none. Grep for shouting: only the `DENIED` seal, a deliberate stamp motif |
| Writing | Avoid "we"; use possessives sparingly | Copy is third-person and forensic ("the victim's agent", "the guard denies") | Full read of the page copy |

## Patterns

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Feedback | Integrate status feedback into the interface, near what it describes | The scorer verdict sits directly under the thread it scored (`site/index.html:780–790`); the ledger's "Not yet." sits in the row it qualifies (`:930`) | Visual check at 1280/1600 in both themes |
| Feedback | Deliver feedback through more than one channel | Every state is colour **and** word **and**, for verdicts, a glyph (`:962`, `:979`, `:995`) | Same check as "colour is not the only carrier" above |
| Feedback | Show that a command could not be carried out, and why | The evidence ledger states what is owed and why in the same cell as the claim (`site/index.html:930`) | Copy compared word-for-word against `README.md`'s ledger |
| Loading | "Show something as soon as possible"; a blank wait reads as a bug | No async content. The one image that may exist is in a fixed `aspect-ratio` box so it cannot shift the layout (`site/index.html:415–416`, markup `:743`) | Server-side detection test (`tests/arena.test.mjs`) plus a rendered check of the reserved box |
| Entering data | *(Skipped — partly)* The page collects no data; there is no form, field, or password entry. The one applicable line, "prefer selection components over free text", is honoured by the theme control being a segmented picker rather than a text setting | `site/index.html:638` | No `input`, `textarea` or `form` exists on the page |
| Managing notifications | **Skipped.** The page sends no notifications and has no interruption levels; nothing on this page can be mapped to it without inventing a claim | — | — |

## Components

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Buttons | "a button needs a hit region of at least 44x44 pt" | `.btn` at `site/index.html:269` | Hit-target script: 0 failures |
| Buttons | "Always include a press state for a custom button" | `.btn:active` at `:274`, `.seg__b:active` at `:262`, `.tabs__tab:active` at `:486`, `.nav__toggle:active` at `:252` | CSS grep: every interactive class has `:hover`, `:active`, `:focus-visible` and, for `.btn`, a disabled state at `:278` |
| Buttons | Keep prominent buttons to one or two per view | Exactly two per call to action — one primary, one ghost (`:690–691`, `:1079–1080`) | Count of `.btn--primary` per section: 1 |
| Buttons | Distinguish the preferred option by style, not size | Both buttons are the same height and padding; only fill differs (`:269`, `:275–276`) | Measured: identical `min-height`, same padding |
| Segmented controls | "no more than about five to seven segments"; use similarly sized content | 3 segments, single words, equal padding (`site/index.html:638–642`) | DOM count |
| Segmented controls | Do not mix action segments with selection-state segments | All three segments set state; none performs an action | Read of the handler at `:1138–1146` |
| Segmented controls | *(ARIA note)* The theme control is a **radio group**, so it uses `role="radio"` + `aria-checked` — not `aria-selected`, which ARIA defines only for tabs, options and grid cells. Applying `aria-selected` to a radio would be invalid and would fail an accessibility audit. The kill-chain **tabs** do use `role="tab"` + `aria-selected` + `aria-controls`. Both support arrow keys, Home and End | radiogroup `:638`, keys `:1140–1145`; tablist `:944–948`, keys `:1331–1336` | Keyboard walk of both controls; `aria-checked`/`tabindex` read back after each key: `["system:false:-1","light:true:0","dark:false:-1"]` |
| Tab views | "Avoid providing more than six tabs in a tab view" | 3 tabs (`site/index.html:946–948`) | DOM count |
| Tab views | A pane's controls affect only that pane; panes are mutually exclusive | Panels are grid-stacked and switched by `.is-active`; the inactive ones are `visibility:hidden`, which also removes them from the accessibility tree (`:491–495`, JS `:1320–1326`) | Inactive panels return no accessible text; panel height never changes between tabs |
| Tab views | Label each tab so people can predict its contents | "Attack", "Guard on", "Invariant on" | Read of the DOM |
| Toolbars (Navigation bars merged into it) | Choose items deliberately; define what collapses at narrow widths | 6 links + theme control above 1100 px; below that everything collapses behind a Menu disclosure (`site/index.html:549–563`) | Measured at 1100 px: brand ends at x=170, links start at x=471 — no overlap, no wrap |
| Toolbars | Provide a reliable way to restore a hidden bar | The disclosure is a labelled button that toggles to "Close", is `aria-expanded`, and closes on Escape and on any link activation (`:1171–1180`) | Keyboard: Tab to Menu, Enter opens, Escape closes and returns focus |
| Labels | Use a label only for non-editable text; prefer system fonts and the system label colours | Two text roles only — `--ink` primary and `--dim` secondary — matching Apple's relative-importance label idea (`site/index.html:70`) | Contrast script covers both roles on every surface |
| Labels | "Make useful label text selectable" | Nothing on the page blocks selection; evidence paths, tool names and URLs are real selectable text, not images | `user-select` never set to `none` |
| Toggles | Use a toggle only for two opposing values | No toggle is used; theme has three states, so it is a segmented picker instead — the alternative HIG names for more than two mutually exclusive options | Design decision recorded here |

## Inputs

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Keyboards | "Respect standard keyboard shortcuts" — do not repurpose them | The page binds only Arrow, Home, End (inside a composite widget) and Escape (to dismiss). No character or modifier shortcut is claimed | Grep of every `keydown` handler: `:1140–1145`, `:1178–1180`, `:1331–1336` |
| Keyboards | Do not implement custom keyboard navigation for buttons and segmented controls where the platform already handles it | Roving `tabindex` is used only where ARIA requires it (radiogroup, tablist); every other control is a plain focusable element in DOM order | Tab order walked end-to-end: skip link → brand → links → theme → content → footer |
| Pointing devices | "about 12 points of padding around elements that include a bezel" | Bezelled controls carry ≥ 12 px of internal padding (`.btn` 20 px, `.nav__link` 12 px, `.seg__b` 12 px) and the segmented control adds a 3 px inner gutter (`:257`) | Measured padding on each control class |
| Pointing devices | "Avoid creating gratuitous pointer and content effects" | Pointer depth is capped at 22 px, eased at 0.08 per frame, and gated to `(hover:hover) and (pointer:fine)` (`site/index.html:1265–1272`) | Touch emulation at the mobile preset: no pointer listeners attach |
| Focus and selection | "Rely on system-provided focus effects"; build custom ones only if necessary | One rule, `:focus-visible` with a 2 px ring and 3 px offset (`site/index.html:211`); nothing sets `outline: none` | Grep: `outline:none` appears zero times |
| Focus and selection | "Avoid changing focus without people's interaction" | Focus moves only on an explicit key press (arrow/Home/End inside a widget) or on Escape returning focus to the disclosure that opened the menu | Read of every `.focus()` call: `:1139`, `:1143–1144`, `:1179`, `:1327` |
| Focus and selection | Focus moves in reading order, leading to trailing, top to bottom | DOM order is visual order; no `tabindex` above 0 exists | Grep for `tabindex="` — only `0` and `-1`, used for roving focus |
| Gestures | "Support standard gestures everywhere you can"; add custom ones only when necessary | No custom gesture, no scroll hijacking, no swipe handler. Scrolling is the browser's; the parallax rides the native scroll timeline rather than intercepting the wheel (`site/index.html:314–320`) | Grep: no `touchstart`/`wheel`/`preventDefault` on scroll |

## Technologies — read the index, applied nothing

The Technologies section is Apple-framework territory. Each was assessed against a static web
page and skipped, with the reason:

| Technology area | Why it was skipped |
|---|---|
| SF Symbols | Requires Apple's licensed symbol set and system font; the page ships three web fonts and hand-drawn inline SVG instead |
| Always On, Live Activities, Widgets, App Clips, CarPlay, watchOS complications | No app target exists; a web page has no such surface |
| Machine learning, Apple Pay, Sign in with Apple, HealthKit, HomeKit, Game Center | No such capability is offered, and inventing one to satisfy a checklist would be dishonest |
| App icons | A favicon is shipped (`site/assets/mark.svg`), but Apple's icon grid, layering and platform sizes do not apply to a single SVG favicon |

## The one page that could not be fetched

| Page | Result |
|---|---|
| `navigation-bars` | **Not available.** The URL returns HTTP 301 to `.../toolbars`, and the data endpoint returns 404. Apple merged navigation-bar guidance into the Toolbars page. No guidance was invented for it; the surviving guidance is applied in the Toolbars rows above |

## Two deliberate departures, stated plainly

1. **An app-specific appearance setting.** HIG says avoid one. The brief requires System /
   Light / Dark. The compromise: the default is System, the choice is stored only in
   `localStorage` inside `try/catch`, and choosing System removes the key entirely, so the
   platform setting is the resting state.
2. **Two durations outside the 150–400 ms band.** The statistic counter runs 900 ms
   (`site/index.html:1246`) because it is the figure resolving — content, not chrome — and it
   is off entirely under Reduce Motion. The scroll parallax has no duration at all: it is
   bound to scroll progress, which makes it reversible by construction, which is the property
   the duration limit exists to protect.

## How each check was run

All scripts were executed in the live page (`http://localhost:10077/`) with the browser tool,
reading `getComputedStyle` — not against the source.

- **hit-target script** — `document.querySelectorAll('a, button, [role=button], input, select')`,
  skips elements that are `display:none`/`visibility:hidden`, fails anything whose
  `getBoundingClientRect()` is under 44 in either axis. Run at 1280 px and at 375 px with the
  disclosure menu open. Result: 23 controls checked, **0 failures** in both themes.
- **contrast script** — every visible element with a direct text node; foreground from
  `color`, background composited up the ancestor chain through every translucent layer;
  WCAG relative luminance; threshold 3:1 for large text (≥ 24 px, or ≥ 18.66 px bold) and
  4.5:1 otherwise. **372 pairs, 0 failures** in each theme. Worst three per theme are in the
  build report. UI borders are measured separately against their own surface; the minimum is
  3.20:1 (light) and 3.78:1 (dark).
- **heading-order script** — document order of `h1…h6`: `1,2,3,3,3,3,3,3,3,2,3,3,3,2,3,3,2,3,2,3,3,2,2`.
  One `h1`, **no skipped levels**.
- **landmark check** — one `body > header`, one `nav[aria-label]`, one `main`, one
  `body > footer`, **8 of 8** `section` elements carry `aria-labelledby`, skip link present.
- **clipping script** — every element whose computed overflow clips, compared against its
  scroll size, with reveals forced in. **0 clipped** at root 16 px and 20 px.
- **line-length script** — measures the real average advance of the element's own computed
  font on a canvas rather than assuming `1ch` (in IBM Plex Sans `1ch` is about 1.2 real
  characters, so a `ch` cap alone would overshoot). Over the 34 paragraphs longer than 120
  characters, running body copy lands between **47 and 74 characters**; **nothing falls
  outside 45–75**.
- **token-parity script** — `python3` over `site/index.html`: extracts the two dark blocks and
  asserts they are byte-identical (21 declarations each), and that no colour token is defined
  in a dark block without a definition on bare `:root`.
- **parallax path check** — `CSS.supports('animation-timeline: scroll()')` and, after
  scrolling through six positions, the inline `style.transform` of all 11 planes.
