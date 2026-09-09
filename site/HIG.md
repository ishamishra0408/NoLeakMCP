# Apple Human Interface Guidelines — what was read, what was applied, how it was checked

> **Line numbers are valid for `site/index.html` blob
> `fce563e4644bbb85aa0ec6c2c84ec0b61d3f043a`** (1689 lines — check with
> `git hash-object site/index.html`), stamped at the Liquid Glass pass, 2026-09-08. The blob
> hash, not a commit, is what fixes the line numbers, so the blob is what to check. Every
> `file:line` below was regenerated for this blob by diff-mapping the previously stamped blob
> onto it and re-grepping by hand for every anchor the diff could not carry across. Rows that
> cite `render/arena/public/index.html` or `realtime/dashboard/index.html` are stamped the
> same way in the Liquid Glass section. If a blob hash no longer matches, the line numbers
> are stale and the anchors, not the numbers, are authoritative.

The public site (`site/index.html`) is a web page, not an Apple-platform app, so this is a
translation exercise, not a compliance one: where a guideline is expressed in points on a
touch device it is applied in CSS pixels; where it is about an Apple-only affordance it is
recorded as skipped, with the reason.

**Sources.** 24 HIG pages were requested on 2026-09-08. 23 returned content, 1 no longer
exists. On the same day three further Apple pages were read for the Liquid Glass pass and are
recorded in their own section below: `documentation/technologyoverviews/liquid-glass`,
`documentation/technologyoverviews/adopting-liquid-glass`, and HIG `materials` (re-read in
full — the first pass had only summarised it). The human-facing `developer.apple.com/design/human-interface-guidelines/<page>` URLs
are a JavaScript single-page app that serves only a title to a plain fetch; the content is
served by Apple's public DocC data endpoint at
`developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`, which is
what was actually read. Quotations are kept under 15 words; everything longer is paraphrase.

Verification methods are named in the last column and spelled out under "How each check was
run" below. All measurements were re-run against the live page at 1280×800 on 2026-09-08.

---

## Foundations

| HIG area | Guideline (quoted or closely paraphrased) | Where applied (file:line) | How verified |
|---|---|---|---|
| Accessibility | Minimum control size on iOS/iPadOS/watchOS is **44×44 pt** | `site/index.html:128` (`--hit:44px`), applied at `:238` `.skip`, `:390` `.nav__brand`, `:395` `.nav__link`, `:406` `.nav__toggle`, `:420` `.seg__b`, `:438` `.btn`, `:672` `.tabs__tab`, `:723` `.foot a` | **hit-target script** over `a, button, [role=button], input, select` — 22 visible controls at 1280, 0 under 44×44 in either axis |
| Accessibility | Contrast: **4.5:1 up to 17 pt; 3:1 at 18 pt and for bold**; WCAG AA is the same floor | Whole palette, `site/index.html:61–134` (light) / `:139–168` and `:172–200` (dark) | **contrast script** over every visible text-bearing element (435 pairs) in both themes: 0 failures; worst three light 4.64 / 4.94 / 4.94, dark 5.20 / 5.21 / 5.21 |
| Accessibility | Text must survive enlargement to **at least 200 percent** | Type scale in `rem` with a `vw` term, `site/index.html:107–113`; `--measure` in `ch` at `:115`; the 3-up card row is gated on an `em` media query at `:540`, so a larger browser font stacks it rather than shrinking the measure | **clipping script** at root font-size 16 px and 20 px: 0 clipped elements, no horizontal scroll at either size; the 3-up card row stacks rather than shrinking once the browser font passes the 70em breakpoint. Measured line lengths are in the line-length row below |
| Accessibility (typography) | Keep running body copy to a comfortable line length | `p` is capped at `--measure` (`site/index.html:220`, token at `:115`); the evidence ledger, whose cells are body copy in a table, is capped at `:658` | **line-length script** at 1280: the 27 paragraphs longer than 120 characters measure **48–78 characters** a line (worst three 78 / 77 / 77); the ledger's longest cell measures **73** (it was 99 before the `:658` cap). Nothing on the page now exceeds 78. The earlier claim of "47–74 for all body copy" was wrong in both directions and is corrected here |
| Accessibility | "Convey information with more than color alone" | Verdicts carry a glyph plus a word: `site/index.html:1194`, `:1211`, `:1227` with `.verdict__ico` at `:693`; ledger cells say "Yes" / "Not yet."; tabs carry text labels next to the dot | Visual check in both themes; every `.verdict`, `.pill`, `.yes`/`.no` inspected for a non-colour carrier |
| Accessibility | Respond to the Reduce Motion setting | `site/index.html:798–837` disables both parallax paths, stacking, ticking and reveals; the script reads the media query **live** and stops or restarts the pointer-depth loop on its `change` event (`:1338–1339`, `:1631–1650`) | **CSSOM dump** of the `prefers-reduced-motion: reduce` block plus a patched-page run: `parallaxPath: "off"`, plane inline transforms empty, computed `transform: none`. The live `change` path is code-reviewed, not emulated — the browser tool cannot toggle the OS setting mid-session |
| Color | "Avoid using the same color to mean different things" | One meaning per token: `--ok` deny, `--bad` leak, `--amber` detection-only, `--brass` brand seal (`site/index.html:72`); documented in `site/BRAND.md` | Token grep: no component reassigns a semantic token to an unrelated role |
| Color | Every custom colour needs a light **and** a dark variant | Every colour token is defined on bare `:root` and redefined in both dark blocks (`site/index.html:61–134`, `:139–168`, `:172–200`) | **token-parity script** (`python3`): the two dark blocks carry **26 identical lines / 51 declarations** each and are byte-identical after de-indentation (`diff` returns nothing); 0 tokens defined only in a dark block; 0 orphan colour tokens — the retired `--scrim` was deleted in this pass when the nav moved to the glass tokens, rather than left declared and unused |
| Color | Translucency changes how adjacent colours read | The nav material is tokens (`--glass-tint` / `--glass-tint-clear`, `site/index.html:85` light, `:154` and `:186` dark) composited over the page, and the contrast script composites alpha over the real ancestor stack rather than assuming opaque | Contrast script's `bgOf()` walks ancestors and alpha-composites; the nav's own links are included in the 435 pairs |
| Dark Mode | Use colours that adapt to the appearance; do not hardcode | Zero colour literals remain in component CSS; the only `#000` left is a **mask alpha stop**, commented at `site/index.html:498` | `grep` for `#hex`/`rgb(a)` below the token blocks returns exactly one hit, the mask stop |
| Dark Mode | "Soften the color of white backgrounds" | Light ground is `--bg:#f5f6f9` / `--bg-2:#eceff4`, not `#fff`; `#fff` is reserved for raised panels (`site/index.html:65`) | Computed `body` background in light theme: `rgb(245, 246, 249)` |
| Dark Mode | Apple advises against an app-specific appearance switch | **Deliberately not followed**, and said so: the brief requires a System / Light / Dark control. It defaults to **System**, so the platform setting still wins unless the reader opts out (`site/index.html:875–879`, JS `:1357–1412`) | Loaded with no stored value → `data-theme` absent, follows `prefers-color-scheme`; verified in both emulated schemes |
| Dark Mode | The browser chrome should match the appearance the reader is looking at | `meta[name=theme-color]` is written from the **resolved** theme inside the theme `apply()` (`site/index.html:1370–1381`, called at `:1390`), ahead of the two media-scoped no-JS fallbacks at `:9–10`; a System reader still tracks the OS via the `change` listener at `:1409–1411` | Measured in-page: Dark → `#0b0e14`, Light → `#f5f6f9`, with the pane's own `prefers-color-scheme` held at light throughout — i.e. the override, not the media query, is what answers |
| Layout | Respect margins and guides; keep the most important item leading and top | 1120 px container with a 24/16 px gutter (`site/index.html:226`), hero copy leading, primary action first (`:927`) | Layout screenshots at 320/375/768/1024/1100/1200/1280/1440/1600 |
| Layout | Test across orientations, localisations and text sizes | Breakpoints at `site/index.html:731`, `:736`, `:739`, `:753`, `:762`; the em-based ppp grid reflows on text size | `scrollWidth === innerWidth` at every width tested — no horizontal scroll anywhere, including 375 and 1600 after the ledger cap |
| Layout | Reduce column count as text size grows (Typography, applied to layout) | `@media (min-width: 70em) { .ppp__grid { repeat(3, minmax(0,1fr)) } }` at `site/index.html:540` | `em` in a media query is the browser's own font size: at the 16 px default the 3-up needs 1120 px, at 20 px it needs 1400 px, so at a 1280 px viewport the cards stack instead |
| Materials | Reserve translucent material for the control layer, not content | `backdrop-filter` is declared only inside the `.glass` family (`site/index.html:345–346` and `:360–361`, each with its `-webkit-` twin) and exactly three elements carry it: the sticky nav and the two secondary buttons. No card, table, terminal, ledger, tab panel or Slack artefact is translucent | DOM count in both themes: `.glass` = 3, `.glass-inset` = 2; every `.card`/`.table`/`.stat`/`.verdict`/`.slackcard` computes `backdrop-filter: none` |
| Materials | Thicker material = more contrast; always use vibrant colour on top | `--scrim` is a 72 % ground tint plus `saturate(1.4) blur(16px)`; nav text is `--ink`/`--dim` over it | Contrast script includes the nav links composited over the scrim: pass in both themes |
| Materials | A material needs a fallback where it is unavailable | `@supports not ((backdrop-filter…))` paints `--panel`/`--bg` solid, `site/index.html:834–837`; `prefers-reduced-transparency: reduce` does the same at `:825–833`. Both live in §19 at the very END of the stylesheet, because a fallback that loses on source order is not a fallback | Cascade resolved for `background-color`, `background-image` and `backdrop-filter` on every `.glass`/`.glass-inset` element with each condition forced active: every one resolves to `var(--panel)`/`var(--bg)` and `none` |
| Motion | "Add motion purposefully" — never decoration | Every animation explains the kill chain: depth in the scene, the reveal of a claim, the tab swap. Durations 180–320 ms (`site/index.html:123`) | CSS grep: no `transition`/`animation` duration outside 150–400 ms except the two documented exceptions below |
| Motion | "Let people cancel motion" / do not make people wait for an animation | Nothing blocks reading: reveals are opacity+14 px, panels are height-locked, the scroll parallax is scroll-linked so it is reversible by definition (`site/index.html:489–495`) | Reading the page while scrolling up and down; no content is gated behind an animation |
| Motion | "Make motion optional" — never the sole channel | No information is carried only by motion; every animated element has a static state that says the same thing | Reduced-motion run still shows every reveal target and all text |
| Typography | Prefer Regular/Medium/Semibold; "avoid light font weights" | Only 400/500/600 are loaded (`site/index.html:14`) | Font URL grep: `wght@400;500;600` for Plex Sans, `400;500` for Plex Mono |
| Typography | Minimise the number of typefaces | Three, each with one job: Instrument Serif display, IBM Plex Sans text, IBM Plex Mono code (`site/index.html:101–103`) | `--serif/--sans/--mono` are the only families declared |
| Typography | Keep truncation minimal as font size increases | Only `.frag` truncates, and it is decorative scenery inside `aria-hidden` (`site/index.html:511`); nothing else clips | Clipping script at 16 px and 20 px: 0 clipped elements |
| Typography | Custom fonts must honour Dynamic Type behaviour | The whole scale is `clamp()` in `rem`, so it tracks the browser's font-size setting (`site/index.html:107–113`) | At root 20 px, `body` computes to 21.16 px and `h1` to 88.32 px — the scale moved with the setting |
| Typography | Avoid tight leading on three or more lines | Body 1.6, terminal 1.7, lede 1.55 (`site/index.html:208`, `:467`, `:222`) | Computed line-height on every long paragraph ≥ 1.5 |
| Writing | "Be action oriented" — use a verb for button and link labels | "Launch the arena", "Watch the live feed", "Skip to main content" (`site/index.html:927–928`, `:841`) | Every `.btn` label starts with a verb; read off the DOM |
| Writing | Pick a capitalisation style and apply it consistently | Sentence case throughout: tabs are "Guard on" / "Invariant on" (`:1179–1180`), verdicts "Leaked" / "Denied by the guard" (`:1195`, `:1212`) | Grep for `!` in copy: none. Grep for shouting: only the `DENIED` seal, a deliberate stamp motif |
| Writing | Avoid "we"; use possessives sparingly | Copy is third-person and forensic ("the victim's agent", "the guard denies") | Full read of the page copy |

## Patterns

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Feedback | Integrate status feedback into the interface, near what it describes | The scorer's verdict is printed inside the control that produces it (`site/index.html:1064–1069`); the outbound argument sits directly under the message that produced it (`:1024–1032`); the ledger's "Not yet." sits in the row it qualifies (`:1162`) | Visual check at 1280/1600 in both themes. **Corrected in this pass:** the earlier wording put the scorer card under the Slack message. It moved into the defense section at commit `e3ebe94`, before this pass, and the row had not been restated |
| Feedback | Deliver feedback through more than one channel | Every state is colour **and** word **and**, for verdicts, a glyph (`:1194`, `:1211`, `:1227`) | Same check as "colour is not the only carrier" above |
| Feedback | Show that a command could not be carried out, and why | The evidence ledger states what is owed and why in the same cell as the claim (`site/index.html:1162`) | Copy compared word-for-word against `README.md:63`'s ledger row — byte-identical |
| Honesty (project rule, not a HIG page) | A recreation must say what is real and what is drawn | The Slack artefact is a recreation of the poisoned **thread reply** as the live thread carries it — parent message, reply count and poison text are what is really there, the poison is plain text with no code chrome Slack would not show, and the ids are synthetic `T0XXXXXXXXX` / `C0XXXXXXXXX` masks (`site/index.html:990–1019`), captioned at `:1020`; the drop-in screenshot slot carries its own caption at `:1021`. **Corrected in this pass:** the earlier wording still described the pre-`e3ebe94` top-level-message recreation | `tests/arena.test.mjs` asserts the served `/` matches none of the real id prefixes and carries the caption verbatim; a repo-wide grep for the real workspace and channel ids (they are not reproduced here) returns nothing |
| Loading | "Show something as soon as possible"; a blank wait reads as a bug | No async content. The one image that may exist is in a fixed `aspect-ratio` box so it cannot shift the layout (`site/index.html:596–597`, markup `:988`) | Server-side detection test (`tests/arena.test.mjs`) plus a rendered check of the reserved box |
| Entering data | *(Skipped — partly)* The page collects no data; there is no form, field, or password entry. The one applicable line, "prefer selection components over free text", is honoured by the theme control being a segmented picker rather than a text setting | `site/index.html:875` | No `input`, `textarea` or `form` exists on the page |
| Managing notifications | **Skipped.** The page sends no notifications and has no interruption levels; nothing on this page can be mapped to it without inventing a claim | — | — |

## Components

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Buttons | "a button needs a hit region of at least 44x44 pt" | `.btn` at `site/index.html:438` | Hit-target script: 0 failures |
| Buttons | "Always include a press state for a custom button" | `.btn:active` at `:446`, `.seg__b:active` at `:424`, `.tabs__tab:active` at `:676`, `.nav__toggle:active` at `:410` | CSS grep: every interactive class has `:hover`, `:active`, `:focus-visible` and, for `.btn`, a disabled state at `:453` |
| Buttons | Keep prominent buttons to one or two per view | Exactly two per call to action — one primary, one ghost (`:927–928`, `:1311–1312`) | Count of `.btn--primary` per section: 1 |
| Buttons | Distinguish the preferred option by style, not size | Both buttons are the same height and padding; only fill differs (`:438`, `:450–451`) | Measured: identical `min-height`, same padding |
| Segmented controls | "no more than about five to seven segments"; use similarly sized content | 3 segments, single words, equal padding (`site/index.html:875–879`) | DOM count |
| Segmented controls | Do not mix action segments with selection-state segments | All three segments set state; none performs an action | Read of the handler at `:1399–1405` |
| Segmented controls | *(ARIA note)* The theme control is a **radio group**, so it uses `role="radio"` + `aria-checked` — not `aria-selected`, which ARIA defines only for tabs, options and grid cells. The kill-chain **tabs** do use `role="tab"` + `aria-selected` + `aria-controls`. Both support arrow keys, Home and End | radiogroup `:875`, keys `:1400–1405`; tablist `:1176`, tabs `:1178–1180`, keys `:1676–1681` | Keyboard walk of both controls; `aria-checked`/`tabindex` read back after each key |
| Tab views | "Avoid providing more than six tabs in a tab view" | 3 tabs (`site/index.html:1178–1180`) | DOM count |
| Tab views | A pane's controls affect only that pane; panes are mutually exclusive | Panels are grid-stacked and switched by `.is-active`; the inactive ones are `visibility:hidden`, which also removes them from the accessibility tree (`:680–687`, JS `:1662–1674`) | Inactive panels return no accessible text; panel height never changes between tabs |
| Tab views | *(APG)* A tab panel is in the tab sequence, so it is reachable when it holds no focusable control | `tabindex="0"` on all three panels (`site/index.html:1183`, `:1200`, `:1217`) | DOM read: 3 of 3 `[role=tabpanel]` carry `tabindex="0"`; the only `tabindex` values anywhere on the page are `0` and `-1` |
| Tab views | Label each tab so people can predict its contents | "Attack", "Guard on", "Invariant on" | Read of the DOM |
| Toolbars (Navigation bars merged into it) | Choose items deliberately; define what collapses at narrow widths | 6 links + theme control above 1100 px; below that everything collapses behind a Menu disclosure (`site/index.html:739–752`) | Measured at 1100 px: brand and links do not overlap and do not wrap |
| Toolbars | Provide a reliable way to restore a hidden bar | The disclosure is a labelled button that toggles to "Close", is `aria-expanded`, and closes on Escape and on any link activation (`:1483–1493`) | Keyboard: Tab to Menu, Enter opens, Escape closes and returns focus |
| Labels | Use a label only for non-editable text; prefer system fonts and the system label colours | Two text roles only — `--ink` primary and `--dim` secondary — matching Apple's relative-importance label idea (`site/index.html:70`) | Contrast script covers both roles on every surface |
| Labels | "Make useful label text selectable" | Nothing on the page blocks selection; evidence paths, tool names and URLs are real selectable text, not images | `user-select` never set to `none` |
| Toggles | Use a toggle only for two opposing values | No toggle is used; theme has three states, so it is a segmented picker instead — the alternative HIG names for more than two mutually exclusive options | Design decision recorded here |

## Inputs

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Keyboards | "Respect standard keyboard shortcuts" — do not repurpose them | The page binds only Arrow, Home, End (inside a composite widget) and Escape (to dismiss). No character or modifier shortcut is claimed | Grep of every `keydown` handler: `:1400–1405`, `:1491–1493`, `:1676–1681` |
| Keyboards | Do not implement custom keyboard navigation for buttons and segmented controls where the platform already handles it | Roving `tabindex` is used only where ARIA requires it (radiogroup, tablist); every other control is a plain focusable element in DOM order | Tab order walked end-to-end: skip link → brand → links → theme → content → footer |
| Pointing devices | "about 12 points of padding around elements that include a bezel" | Bezelled controls carry ≥ 12 px of internal padding (`.btn` 20 px, `.nav__link` 12 px, `.seg__b` 12 px) and the segmented control adds a 3 px inner gutter (`:419`) | Measured padding on each control class |
| Pointing devices | "Avoid creating gratuitous pointer and content effects" | Pointer depth is capped at 22 px (the largest `data-depth`), eased at 0.08 per frame (`site/index.html:1597`), and gated to `(hover:hover) and (pointer:fine)` (`:1578`) | Touch emulation at the mobile preset: no pointer listeners attach |
| Focus and selection | "Rely on system-provided focus effects"; build custom ones only if necessary | One rule, `:focus-visible` with a 2 px ring and 3 px offset (`site/index.html:233`); nothing sets `outline: none` | Grep: `outline:none` appears zero times |
| Focus and selection | "Avoid changing focus without people's interaction" | Focus moves only on an explicit key press (arrow/Home/End inside a widget) or on Escape returning focus to the disclosure that opened the menu | Read of every `.focus()` call: `:1399`, `:1402–1404`, `:1492`, `:1672` |
| Focus and selection | Focus moves in reading order, leading to trailing, top to bottom | DOM order is visual order; no `tabindex` above 0 exists | Grep for `tabindex="` — only `0` and `-1` |
| Gestures | "Support standard gestures everywhere you can"; add custom ones only when necessary | No custom gesture, no scroll hijacking, no swipe handler. Scrolling is the browser's; the parallax rides the native scroll timeline rather than intercepting the wheel (`site/index.html:489–495`) | Grep: no `touchstart`/`wheel`/`preventDefault` on scroll |

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

## Liquid Glass — three pages read 2026-09-08, applied as a system

Read via Apple's DocC data endpoints, as above:
`developer.apple.com/tutorials/data/documentation/technologyoverviews/liquid-glass.json`,
`…/adopting-liquid-glass.json`, and
`developer.apple.com/tutorials/data/design/human-interface-guidelines/materials.json`.
The `liquid-glass` overview is thin (it is a landing page); the two others carry the rules.
The implementation and its full derivation are in `site/index.html` **§4a** (`:243–379`),
duplicated verbatim into the arena and dashboard, and summarised in `site/BRAND.md`.

Blobs these line numbers are stamped for:
`render/arena/public/index.html` `bfdbd7e2904ebb6f5e4cf4233a484c2279e56f4d` (383 lines),
`realtime/dashboard/index.html` `24e3e7c275c305c93a36b6c4f34cb7be8cece763` (311 lines).

| Apple's line (quoted ≤ 15 words) | Where applied (file:line) | How verified |
|---|---|---|
| Liquid Glass "forms a distinct functional layer for controls and navigation elements" that "floats above the content layer" | `site/index.html:385` the sticky nav; `:928` and `:1312` the secondary buttons; `render/arena/public/index.html:203` the console and `:229` the outcome banner; `realtime/dashboard/index.html:152` the header and `:160–161` the two defense controls | DOM count of `.glass` per surface: site 3, arena 2, dashboard 3 |
| "Don't use Liquid Glass in the content layer" | No `.card`, `.table`, `.stat`, `.verdict`, `.slackcard`, `.tabs__panel`, arena `.timeline`/`.step`, dashboard `.tile`/`#matrix`/`.feed` carries a glass class | Computed `backdrop-filter` over every content class on all three surfaces: `none` everywhere |
| "avoid overcrowding or layering Liquid Glass elements on top of each other" | Controls that sit **on** the bar use `.glass-inset` (`site/index.html:367–371`) — same optics, no `backdrop-filter`: `.seg` `:419`, `.nav__toggle` `:406`. The mobile nav dropdown is opaque `:740–745`. On the arena and dashboard the select, toggles and tiles under a glass surface are opaque fills | For every `.glass` element on all three surfaces, in both themes: `el.querySelectorAll('.glass').length === 0` and no `.glass` has a `.glass` ancestor. Result: 0 nested, everywhere |
| Regular variant "blurs and adjusts the luminosity of background content to maintain legibility … when components have a significant amount of text" | `.glass` `site/index.html:334–352` — the default, and everything except one case | Computed `backdrop-filter: blur(20px) saturate(1.8)` |
| Clear variant: "highly translucent … for components that float above media backgrounds" | `.glass--clear` `site/index.html:354–355`, used once: the nav at scroll 0 over the hero's parallax scene. `:1616–1625` swaps it out after 8 px | Computed at scroll 0: `blur(9px)`, tint `.16`; at scroll 20: `blur(20px)`, tint `.58`, border `--line` |
| Scroll edge effect "helps maintain sufficient legibility and contrast for controls by obscuring content that scrolls beneath them" | That Clear → Regular thickening is this effect | Contrast re-run with the page scrolled: 0 failures in either theme |
| "people … turn on accessibility settings that reduce transparency or motion" — "test your app's custom elements … with different configurations of these settings" | `prefers-reduced-transparency: reduce` `site/index.html:825–833`; `prefers-reduced-motion: reduce` `:810–814`; `initGlass` `:1443` returns before binding the pointer specular under the same query | Cascade resolved with each condition forced active, on all three surfaces: every `.glass`/`.glass-inset` element resolves to an opaque `var(--panel)`/`var(--bg)`, `background-image: none`, `backdrop-filter: none`, `transition: none` |
| "Help maintain a sense of visual continuity … using rounded shapes that are concentric to their containers" | `--glass-r-in: calc(--glass-r - --glass-pad)` `site/index.html:133`. Arena console 22 − 14 = 8, the measured radius of its select, toggles and both buttons; dashboard 18 − 10 = 8 | Computed `border-radius`: arena console 22px, its select 8px at 44px tall; dashboard input and buttons 8px |
| "Use Liquid Glass effects sparingly … Limit these effects to the most important functional elements" | At most 3 composited glass elements on any surface; no glass element carries `will-change` | `document.querySelectorAll('.glass').length` ≤ 3 per surface; computed `will-change` on every `.glass`/`.glass-inset` is `auto` |

**Departure from the brief, on Apple's authority.** The brief asked for glass on the theme
segmented control. That control lives inside the glass nav, and both Apple's line above and
the project's own rule forbid stacking the material. It is `.glass-inset` instead — same
hairline, same top specular and bottom shade, zero `backdrop-filter`. The buttons that *are*
real glass are the ones floating over content rather than over another glass layer.

**Departure recorded honestly: the refraction is not universal.** `url()` inside
`backdrop-filter` is a WebKit/Blink behaviour; Firefox ignores it, and `CSS.supports()` only
parses the value, so it reports true everywhere. `initGlass` (`site/index.html:1443–1452`)
asks the engine what it actually computed for a throwaway node and only then sets
`data-glass-refract="on"`. The material is finished with blur alone; the displacement is
additive. Measured: with the refraction forced off the page still renders correctly and the
frame rate is unchanged — 60 fps either way at 1280×800.

**A fallback that loses the cascade is not a fallback.** The first cut of this pass put both
material fallbacks inside §4a, next to the classes they override. `.btn.glass` sets its own
`background-color` in §6, *after* §4a, at equal specificity — so under Reduce Transparency the
glass buttons stayed translucent while everything else went opaque. Caught by resolving the
cascade rather than by reading a screenshot. Both blocks now live in §19 at the very end of
the stylesheet, the same reason §18 (Reduce Motion) is last.

## Two deliberate departures, stated plainly

1. **An app-specific appearance setting.** HIG says avoid one. The brief requires System /
   Light / Dark. The compromise: the default is System, the choice is stored only in
   `localStorage` inside `try/catch`, and choosing System removes the key entirely, so the
   platform setting is the resting state.
2. **Two durations outside the 150–400 ms band.** The statistic counter runs 900 ms
   (`site/index.html:1559`) because it is the figure resolving — content, not chrome — and it
   is off entirely under Reduce Motion. The scroll parallax has no duration at all: it is
   bound to scroll progress, which makes it reversible by construction, which is the property
   the duration limit exists to protect.

## How each check was run

All scripts were executed in the live page (`http://localhost:10077/`) with the browser tool,
reading `getComputedStyle` — not against the source.

- **hit-target script** — `document.querySelectorAll('a, button, [role=button], input, select')`,
  skips elements that are `display:none`/`visibility:hidden`, fails anything whose
  `getBoundingClientRect()` is under 44 in either axis. Result at 1280: **22 visible controls,
  0 failures**, in both themes.
- **contrast script** — every visible element with a direct text node; foreground from
  `color`, background composited up the ancestor chain through every translucent layer;
  WCAG relative luminance; threshold 3:1 for large text (≥ 24 px, or ≥ 18.66 px bold) and
  4.5:1 otherwise. **435 pairs, 0 failures** in each theme. Worst three: light
  4.64 / 4.94 / 4.94, dark 5.20 / 5.21 / 5.21.
- **heading-order script** — document order of `h1…h6`:
  `1,2,3,3,3,3,3,3,3,2,3,3,3,2,3,3,2,3,2,3,3,2,2`. One `h1`, **no skipped levels**.
- **landmark check** — one `body > header`, one `nav[aria-label]`, one `main`, one
  `body > footer`, **8 of 8** `section` elements carry `aria-labelledby`, skip link present.
- **clipping script** — every element whose computed overflow clips, compared against its
  scroll size, with reveals forced in. **0 clipped** at root 16 px and 20 px.
- **line-length script** — measures the real advance of each text node's **own** computed font
  on a canvas rather than assuming `1ch` (in IBM Plex Sans `1ch` is about 1.2 real characters,
  and inline `code`/`.mono` runs are wider still), then divides the element's content width by
  that mean advance. This is an upper bound on characters per rendered line. At 1280 over the
  27 paragraphs longer than 120 characters: **48–78** characters, worst three 78 / 77 / 77.
  Table cells longer than 120 characters: **73** (the ledger's "Not yet." cell, which measured
  **99** before the `.table--wrap` cap at `site/index.html:658`).
- **token-parity script** — `python3` over `site/index.html`: extracts the two dark blocks,
  asserts they parse identically (21 declaration lines each), that no colour token is defined
  in a dark block without a definition on bare `:root`, and that no colour token is declared
  without a `var()` reference anywhere in the file.
- **parallax path check** — `CSS.supports('animation-timeline: view()')` — the same condition
  the `@supports` block at `site/index.html:493` tests, so the CSS path and the JS feature
  detect can never disagree — and, after scrolling, the inline `style.transform` of all 11
  planes (0 of 11 set on the native path).
- **theme-color check** — read `meta[name=theme-color]` after driving the segmented control:
  Dark → `#0b0e14`, Light → `#f5f6f9`, with the browser's own `prefers-color-scheme` pinned to
  light for the whole run.
