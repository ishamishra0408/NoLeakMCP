# Apple Human Interface Guidelines — what was read, what was applied, how it was checked

> **Line numbers are valid for `site/index.html` blob
> `a45897415437f91822fb5a1e9e21ee238117a6c3`** (2024 lines — check with
> `git hash-object site/index.html`), stamped at the demo-pair and Slack-window pass,
> 2026-09-09. The blob hash, not a commit, is what fixes the line numbers, so the blob is what
> to check. Every `file:line` below was regenerated for this blob by locating the anchor the
> row names (the selector, id, token, label or function) in the new file — an unchanged line
> by its identical content, a rewritten line by its anchor — with 0 left unresolved. Rows
> that cite `render/arena/public/index.html` (blob
> `bf662cc2e2c3035f57d949ec3467bdd03e249728`, 551 lines) or `realtime/dashboard/index.html`
> (blob `aa4a5534aa744c27e0864a862434871cc5f04486`, 471 lines) are stamped the same way. If a
> blob hash no longer matches, the line numbers are stale and the anchors, not the numbers,
> are authoritative.

The public site (`site/index.html`) is a web page, not an Apple-platform app, so this is a
translation exercise, not a compliance one: where a guideline is expressed in points on a
touch device it is applied in CSS pixels; where it is about an Apple-only affordance it is
recorded as skipped, with the reason.

**What changed in this pass (2026-09-09, the before-and-after pair and the Slack window).**
No palette change — the token blocks are byte-identical to `9d6bf9e`, checked by diff. (1) Beat 2
of the attack section opens with a before-and-after pair, `#demoAttack` / `#demoBlocked`: a tone
tag, a short action caption above the media, a 16/10 soft-shadowed box, one bold stat with its
denominator under it, and a shared `1.00 → 0.00` line. The box holds the screen recording when
`site/assets/demo-<slot>.*` exists and otherwise a still — the tail of the harness log and the
verdict band — so the beat is complete either way. (2) Both Slack beats and the frame around the
real screenshot are one component drawn as a Slack window: aubergine top bar and rail, Slack's
link blue, hover wash, bold channel name, `APP` badge, `@mention` chips. Slack's hues are eleven
`--sk-*` tokens scoped to `.slackcard`, light on the class and dark in two byte-identical scoped
blocks, so the page palette is untouched. (3) A defect fixed in passing: the screenshot rule hid
every `.slackcard`, so with `slack-thread.png` in place beat 3's recap was a caption with nothing
above it; the rule now hides only beat 1's recreated pane. Rows this pass touched are marked
**Pair/Slack**. The measurements below were re-run on 2026-09-09 at 1280×800 and 375×812 in both
schemes on all three surfaces; where a row still quotes a 2026-09-08 figure it did not change.

**What changed in the pass before (2026-09-08, colour wheel + plain copy — the wheel was
reverted the same day in `9d6bf9e`; the copy stayed).** Two things, no
redesign. (1) The palette was briefly the cybersecurity colour wheel: seven hues, one meaning each
(red attack, blue defence, purple arena, yellow code, green automated checks, orange
awareness/limits, white governance), the role tokens aliased onto them, each section declaring
its team, and the mapping stated in one line in the footer — `site/BRAND.md` has the table.
Denied moved from green to blue, the focus ring from brass to blue on all three surfaces, and
inline `code` from blue to ink. (2) The reader-facing copy was rewritten so a first-time reader
gets the problem, the stakes and the fix in one scan, with every term of art following the
plain sentence that explains it; no number changed. The five role tokens (`--accent --ok --bad
--amber --brass`, `--focus` brass) are the real definitions again. Rows that pass touched are
marked **Updated**; the earlier **Rewritten** marks are kept.

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
mobile preset, in both colour schemes, on 2026-09-09 after the demo-pair and Slack-window pass
(the 1600×900 figures quoted in a few rows are from the hero-as-product pass and were not
re-run; where a row gives one number it is the 1280 measurement from this pass).

---

## Foundations

| HIG area | Guideline (quoted or closely paraphrased) | Where applied (file:line) | How verified |
|---|---|---|---|
| Accessibility | Minimum control size on iOS/iPadOS/watchOS is **44×44 pt** | `site/index.html:136` (`--hit:44px`), applied at `:242` `.skip`, `:411` `.nav__brand`, `:416` `.nav__link`, `:427` `.nav__toggle`, `:445` `.seg__b`, `:467` `.btn`, `:570` `.sel`, `:573` `.tog`, `:835` `.tabs__tab`, `:870` `.foot a`. The one inline link in running copy (`.hero__scope a`, `:551`) gets `padding-block:13px`: block padding on an inline box does not move the line but does extend the hit region, 19 → 45 px. **Rewritten:** the rework introduced that link and it measured 62×19 before this fix. **Pair/Slack:** the pair adds no control while the stills are up; when a clip cannot autoplay its Play control is a `.btn` (`.demo__ctl`, `:763`), and the Slack window's rail and top bar are `aria-hidden` decoration, not controls | **hit-target script** over `a, button, [role=button], select` — 22 visible controls at 1280 (14 at 375, where the nav links sit behind the disclosure), **0 under 44×44** in either axis, both themes, 2026-09-09; the two native checkboxes are inside their 44 px `.tog` labels |
| Accessibility | Contrast: **4.5:1 up to 17 pt; 3:1 at 18 pt and for bold**; WCAG AA is the same floor | Whole palette, `site/index.html:65–142` (light) / `:147–173` and `:177–212` (dark) | **contrast script** over every visible text-bearing element (329 pairs per theme at 1280, 321 at 375) in both themes: 0 failures. **Pair/Slack (2026-09-09):** 379 pairs at 1280, 361 at 375; worst three light 4.94 ×3 (inline `code`, `--accent` on `--accent-soft`), dark 4.70 ×3 (the Slack window's `@mention` chips on the scoped `--sk-mention-bg`; on the palette's `.16` ground they measured 4.28, which is why the scoped token exists). Inside the pair the worst is the `Guard on` tag at 5.73 dark / 6.08 light; the verdict bands (serif word at 24–30 px, floor 3:1) measure ≥ 5.5. Text on glass is measured on the composite (see below): worst 5.66 light / 5.86 dark |
| Accessibility | Text must survive enlargement to **at least 200 percent** | Type scale in `rem` with a `vw` term, `site/index.html:112–118`; `--measure` in `ch` at `:123`; the 3-up control row is gated on an `em` media query at `:776`, so a larger browser font stacks it rather than shrinking the measure | **clipping script**: 0 elements whose scroll size exceeds a clipping box, no horizontal scroll at 375 / 1023 / 1280 / 1600 (`scrollWidth === innerWidth` at each) |
| Accessibility (typography) | Keep running body copy to a comfortable line length | `p` is capped at `--measure` (`site/index.html:221`, token at `:123`); the ledger's wide column at `:821`; the arena intro at `render/arena/public/index.html:126`, the dashboard note at `realtime/dashboard/index.html:124`. **Rewritten:** `--measure` moved 57ch → 54ch this pass. `ch` is the advance of "0"; in IBM Plex Sans running text averages ~1.35 characters per ch, so 57ch measured 78 and 54ch measures 73. The 3-up cards got a 16px gutter and 20px side padding (`:783`) and their `dl` went term-above-value (`:793`) because 28px padding and a side-by-side `dl` left 43 and 30 characters a line. **Pair/Slack:** the pair's captions and stats are capped at `--measure` (`.demo__cap`, `.demo__stat`) and so is the Slack message text (`.slackcard__text`) — the thread pane in the screenshot is that wide, so the cap is also the honest width; the arena's transcript lines (`.step .body`) run at 56ch | **line-length script** at 1280 (the element's own font advance measured on a canvas, an upper bound), 2026-09-09 with IBM Plex Sans confirmed loaded: every paragraph, list item, caption, cell and pair caption longer than 120 characters measures **47–74** characters a line (33 blocks). Arena intro 75, transcript lines 73–75 with a run on screen; dashboard note 74. The dashboard's event-feed rows are single-line log entries in a full-width `td` (154–157) and are not body copy — recorded, not hidden. At 375 the three `.ctl__limits` paragraphs measure 43–48 (a 343px column, not a layout choice) and the two-column ledger's wide cells 28 |
| Accessibility | "Convey information with more than color alone" | Verdicts carry a glyph plus a word: the three static verdict cards `site/index.html:1230`, `:1247`, `:1263` with `.verdict__ico` at `:856`; the live console verdict `:1883` (word) and `:1886–1890` (glyph per tone, `ICO`); the console legend `:1069` names Leaked / Denied / Declined in words beside the dots; ledger cells say "Yes" / "Not yet."; tabs carry text labels next to the dot; the two toggles carry a checkbox state, not only the blue border. **Pair/Slack:** the pair's tone tags carry the words `Guard off` / `Guard on` beside their dots and the verdict bands carry the word and the glyph (`:743`); the arena badges and the dashboard feed keywords (DENY / LEAK / TRIAL / POISONED) and switch labels ("Guard is off — turn it on") carry the state in words, with no emoji left anywhere | Visual check in both themes; every `.verdict`, `.run__v`, `.pill`, `.yes`/`.no`, arena `.badge` and dashboard `.k`/`.ctl` inspected for a non-colour carrier |
| Accessibility | Respond to the Reduce Motion setting | `site/index.html:928–968` disables both parallax paths, the reveals' translate, the spinner (`:937`) and the glass transitions; the script reads the media query **live** and stops or restarts the pointer-depth loop on its `change` event (`:1466`, `:1823–1832`) | **CSSOM dump** of the `prefers-reduced-motion: reduce` block (13 rules, listed in "How each check was run") plus code review of the live `change` path — the browser tool cannot toggle the OS setting mid-session, and no frame rate is claimed for a state that was not observed |
| Color | "Avoid using the same color to mean different things" | Five role tokens, one job each, restored in `9d6bf9e` and declared at `site/index.html:84`: `--accent` links and identifiers, `--ok` a defence that held, `--bad` a leak, `--amber` a caveat, `--brass` the editorial voice; the console tones (`:1885`) map outcomes onto ok / bad / amber. **Pair/Slack:** the pair's `Guard off` / `Guard on` tags, bands and log lines use only `--bad`, `--ok`, `--amber`, `--accent` (`:725–748`). Slack's own hues appear only inside the Slack window, as `--sk-*` tokens scoped to `.slackcard` (`:652–658`), so aubergine and Slack blue never acquire a meaning elsewhere on the page; `site/BRAND.md` carries both tables | Token grep: every chroma-carrying rule outside `.slackcard` resolves to one of the five role tokens or a `--*-line` tint of one; the `--sk-*` tokens have no consumer outside `.slackcard__*` selectors; no component reassigns a token to an unrelated role |
| Color | Every custom colour needs a light **and** a dark variant | Every colour token is defined on bare `:root` and redefined in both dark blocks (`site/index.html:65–142`, `:147–173`, `:177–212`) | **token-parity script**: the two dark blocks are byte-identical after de-indentation (24 declaration lines, 53 tokens each); 0 tokens defined only in a dark block; 0 orphan colour tokens. **Pair/Slack:** the component-scoped `--sk-*` tokens obey the same rule at component scope — all eleven declared on `.slackcard` (`:652–655`), the three that change redefined in two scoped dark blocks that are byte-identical (`:657`, `:658`); 0 scoped tokens defined only in a dark block |
| Color | Translucency changes how adjacent colours read | The nav and the console are tokens (`--glass-tint` / `--glass-tint-clear`, `site/index.html:91` light, `:160` and `:189` dark) composited over the page | Contrast script's `bgBehind()` walks ancestors and alpha-composites (`alpha·tint + (1−alpha)·backdrop`) rather than reading the element's own token. Worst composite pairs this pass, light: `.seg__t` 5.66, `.nav__link` 6.26; dark: `.seg__t` 5.86, the toggles' `small` 5.99; control borders on the bar and console 3.46 light (`.seg`, `.nav__toggle`) / 4.09 dark (`.sel`). Arena, with a verdict badge on its wash over the glass banner: 4.96 light (blue Denied) / 4.64 dark (red Leaked) |
| Dark Mode | Use colours that adapt to the appearance; do not hardcode | Zero colour literals in component CSS; the `#000` at `site/index.html:527` is a **mask alpha stop**. **Pair/Slack:** the eleven `--sk-*` values on `.slackcard` (`:652–658`) are token *definitions* at component scope, each with a dark redefinition where Slack's own value changes | `grep` for `#hex`/`rgb(a)` below the token blocks returns the mask stop, the two scrolled-nav tint overrides recorded in the previous pass, and the `--sk-*` definitions — every one of them a declaration of a token, not a use |
| Dark Mode | "Soften the color of white backgrounds" | Light ground is `--bg:#f5f6f9` / `--bg-2:#eceff4`, not `#fff`; `#fff` is reserved for raised panels (`site/index.html:69`) | Computed `body` background in light theme: `rgb(245, 246, 249)` |
| Dark Mode | Apple advises against an app-specific appearance switch | **Deliberately not followed**, and said so: the brief requires a System / Light / Dark control. It defaults to **System**, so the platform setting still wins unless the reader opts out (`site/index.html:1009–1036`, JS `:1484–1552`) | Loaded with no stored value → `data-theme` absent, follows `prefers-color-scheme`; verified in both emulated schemes; Home key restores System and removes the stored key |
| Dark Mode | The browser chrome should match the appearance the reader is looking at | `meta[name=theme-color]` is written from the **resolved** theme inside `apply()` (`site/index.html:1498–1524`, called at `:1517`), ahead of the two media-scoped no-JS fallbacks at `:9–10`; a System reader still tracks the OS via the `change` listener at `:1536–1538` | Measured in-page: ArrowRight to Light → `#f5f6f9` with the pane's own scheme held at dark — the override, not the media query, answers |
| Layout | Respect margins and guides; keep the most important item leading and top | 1120 px container with a 24/16 px gutter (`site/index.html:230`); the hero is a two-column grid above 1024 (`:541`): the situation statement leads, the working console sits beside it, the primary action first (`:1063`) | Screenshots at 375, 1023, 1280, 1600 in both themes; JS geometry at each |
| Layout | Test across orientations, localisations and text sizes | Breakpoints at `site/index.html:541` (hero two-up), `:776` (3-up), `:878`, `:882`, `:898`, `:902` | `scrollWidth === innerWidth` at every width tested |
| Layout | Reduce column count as text size grows (Typography, applied to layout) | `@media (min-width: 70em) { .trio { repeat(3, …) } }` at `site/index.html:776` | `em` in a media query is the browser's own font size: at 16 px the 3-up needs 1120 px, at 20 px it needs 1400 px, so at 1280 the cards stack instead |
| Materials | Reserve translucent material for the control layer, not content | `backdrop-filter` is declared only inside the `.glass` family (`site/index.html:349–350` and `:364–365`, each with its `-webkit-` twin) and exactly two elements carry it: the sticky nav (`:990`) and the hero console (`:1063`) — the console is a control surface, not content. No card, table, terminal, ledger, tab panel, demo box or Slack window is translucent. **Rewritten:** the two secondary buttons that were glass are gone with the CTA; the console's live button sits ON the console and is `.glass-inset` (`:1064`) | DOM count in both themes: `.glass` = 2 on the site (arena 2, dashboard 1), `.glass .glass` = 0; every `.card`/`.table`/`.stat`/`.verdict`/`.slackcard`/`.demo__box`/`.tabs__panel` computes `backdrop-filter: none` (2026-09-09) |
| Materials | Thicker material = more contrast; always use vibrant colour on top | The nav is Clear at scroll 0 and thickens to Regular after 8 px (`site/index.html:402–408`, `:1803–1777`); once detached its links go to full `--ink`. **Rewritten:** the earlier `--scrim` token no longer exists | Contrast on the composite: nav links over the darkest content that can pass under the bar ≥ 9.9:1 light; over white (the Slack PNG) 6.3:1 dark |
| Materials | A material needs a fallback where it is unavailable | `@supports not ((backdrop-filter…))` paints `--panel`/`--bg` solid, `site/index.html:965–968`; `prefers-reduced-transparency: reduce` does the same at `:956–968`. Both live in §19 at the very END of the stylesheet, because a fallback that loses on source order is not a fallback | CSSOM dump of both blocks (listed below): every `.glass`/`.glass-inset`/`.btn.glass` rule resolves to `var(--panel)`/`var(--bg)`, `background-image: none`, `backdrop-filter: none` |
| Motion | "Add motion purposefully" — never decoration | Every animation explains something: the reveal of a claim, the tab swap, the spinner that says a live run is in flight (`:616`, content not chrome). Durations 180–320 ms (`site/index.html:131`) | CSS grep: no `transition`/`animation` duration outside 150–400 ms except the three documented exceptions below |
| Motion | "Let people cancel motion" / do not make people wait for an animation | Nothing blocks reading: reveals are opacity+14 px, tab panels are grid-stacked so height never changes, the scroll parallax is scroll-linked so it is reversible by definition (`site/index.html:518–524`). A live run is the one real wait and it says so up front ("Usually 20–60 s", `:1969`) with Replay offered as the instant path | Reading the page while scrolling; no content is gated behind an animation |
| Motion | "Make motion optional" — never the sole channel | The spinner is paired with the words "Loading…" / "Running live…" (`:1958`, `:1969`); under Reduce Motion it stops and the words remain (`:937`) | Reduced-motion CSSOM dump; the loading copy read off the DOM |
| Typography | Prefer Regular/Medium/Semibold; "avoid light font weights" | Only 400/500/600 are loaded (`site/index.html:14`), and the same URL on the arena (`render/arena/public/index.html:14`) and the dashboard (`realtime/dashboard/index.html:14`) | Font URL grep on all three: `wght@400;500;600` for Plex Sans, `400;500` for Plex Mono, one request each |
| Typography | Minimise the number of typefaces | Three, each with one job, on all three surfaces: Instrument Serif display, IBM Plex Sans text, IBM Plex Mono code (`site/index.html:106–108`; `render/arena/public/index.html:49–51`; `realtime/dashboard/index.html:48–50`). **Rewritten:** the arena and dashboard were on the system stack before this pass | `--serif/--sans/--mono` are the only families declared; computed `font-family` on `body` and `h1` of each surface read back as Plex Sans / Instrument Serif; `tests/arena.test.mjs` asserts no leftover `ui-sans-serif,system-ui` body stack |
| Typography | Keep truncation minimal as font size increases | Nothing truncates. **Rewritten:** the `.frag` scenery that truncated was cut with the planes | Clipping script: 0 clipped elements |
| Typography | Custom fonts must honour Dynamic Type behaviour | The whole scale is `clamp()` in `rem`, so it tracks the browser's font-size setting (`site/index.html:112–118`); the hero `h1` has its own cap so it shares a row with the console (`:546`) | **Updated:** the plainer headline is longer (three sentences); measured `h1` at 1280: five lines beside the console, the copy column still shorter than the console; console 268 px reserved |
| Typography | Avoid tight leading on three or more lines | Body 1.6, terminal 1.7, lede 1.55 (`site/index.html:210`, `:496`, `:227`) | Computed line-height on every long paragraph ≥ 1.5 |
| Writing | "Be action oriented" — use a verb for button and link labels | "Replay a recorded run", "Run live on Nebius", "Turn the guard on and replay", "Run this one live on Nebius", "Skip to main content" (`site/index.html:1063–1064`, `:1912–1913`, `:972`). **Updated:** the arena's buttons are now "Run the attack live" / "Replay a recorded run" (`render/arena/public/index.html:360`, `:359`) and the dashboard's switches read "Guard is on — turn it off" / "Guard is off — turn it on"; the emoji that led every label and verdict are gone | Every `.btn`, arena `button` and dashboard `.ctl` label carries a verb; read off the DOM on all three surfaces |
| Writing | Pick a capitalisation style and apply it consistently | Sentence case throughout: tabs are "Guard on" / "Invariant on" (`:1214–1215`), verdicts "Leaked" / "Denied by the guard" / "Denied by the invariant" / "Model declined" / "Attempted, not delivered" (`:1230`, `:1247`, `:1263`, `:1883–1884`). **Updated:** the arena's outcome words and mode pills ("Live — a real run on Nebius", "Replay — a recorded run") and the dashboard's headings follow the same case | Grep for `!` in copy on all three surfaces: none |
| Writing | Use plain language; explain a term the first time it appears | **Updated (the copy pass).** The plain sentence comes first and the term of art follows once, in brackets or after a dash, never instead: "the harness that runs the assistant (`@deepseek-ai/dsh 0.1.1-rc.2`)" (`:1035`); "stopped before it was sent (the harness's `tools/pre-execute` hook)"; "Slack would have fetched it itself to build a link preview (an 'unfurl')" (`:1156`); "a planted decoy (a canary)"; "attack success rate (ASR) is the share of runs in which the decoy actually reached the attacker's server". The stakes are stated in human terms once (`:1278`: a stolen credential is a working login). No factual claim or number changed; the ledger's "Not yet." row and the honest-scope section stand in full | Full read of the three surfaces against `README.md` and `eval/out/results.md`; every number on the page located in one of the two |
| Writing | Avoid "we"; use possessives sparingly | Copy is second-person for the reader's situation ("Your AI assistant reads it, believes it, and hands over your keys") and third-person, forensic, for the mechanism; "we" does not appear | Full read of the page copy |

## Patterns

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Feedback | Integrate status feedback into the interface, near what it describes | **Rewritten.** The verdict renders inside the console that produced it, in a reserved box (`.run__out`, `site/index.html:586`, markup `:1067`), under the controls that were set; the scorer's static verdict is printed inside the terminal card it belongs to (`:1221–1228`); the ledger's "Not yet." sits in the row it qualifies (`:1410`) | Live at 1280/375 in both themes: replay, live, rate-limited, live-off, error states all paint into the same box; `#attack`'s top edge did not move by a pixel across any state (871.72 px at 1280 this pass — the longer headline moved the hero, not the states) |
| Feedback | Deliver feedback through more than one channel | Every console state is colour (`data-tone`) **and** a word **and** a glyph (`:1934–1936`); the box is `role="status" aria-live="polite"` (`:1067`) so the verdict is announced | Same check as "colour is not the only carrier" above; attributes read off the DOM after each state |
| Feedback | Show that a command could not be carried out, and why | The console says why and what to do instead: 429 → the allowance used, "Replay is instant and unlimited" (`:1971–1975`); 503 → "Live runs are off on this deployment (no API key)" and the live button relabelled and disabled (`:1977`, `:1989`); 5xx / network → "Replay still works" (`:1962–1982`); no matching recording → "run it live" (`:1956`). The ledger states what is owed in the same cell as the claim (`:1410`) | Each state exercised in the browser (429/500/503/network by substituting `fetch`; live-off for real against a second arena booted without a key); ledger copy compared against `README.md:68` |
| Loading | "Show something as soon as possible"; a blank wait reads as a bug | **Rewritten.** The console box reserves the height of its tallest state (`--out-h`, `:586–591`, 272 px at ≤767) so no verdict shifts the page; the cost line reserves two lines (`:583`) so the `/api/config` rewrite cannot move the console either; the loading state paints immediately with a spinner and a sentence that states the expected wait (`:1958`, `:1969`); the Slack screenshot slot is a fixed `aspect-ratio` box (`:703–704`, markup `:1111`); **Pair/Slack:** each demo box is a fixed 16/10 (`.demo__box`, `:733`) that holds the still until a clip exists, so footage dropping in cannot move the page — measured 518×324 at 1280 with the still and 518×325 with a clip; on a phone the box grows to fit the still (`overflow:clip`, 343×285 at 375) and returns to 16/10 (343×215) once a clip is in | Measured: tallest replay state 266 px content in a 268 px box at 1280, 270 in 272 at 375; live run: loading painted synchronously on click, verdict at 20 s, layout unchanged |
| Entering data | Prefer selection components over free text; ask only for what is needed | **Rewritten.** The page now has one form (`:1063`): a `select` for the victim (`:1049`) and two labelled checkboxes (`:1057–1058`) — no free text anywhere. It is a real `<form action="/arena" method="get">`, so without JavaScript it submits the same three fields to the arena, which pre-selects them (`render/arena/public/index.html:508–511`); `<noscript>` says so (`:1074`) | Submitted to `/arena?model=llama&guard=on&invariant=on`: the arena loaded with Llama and both toggles on. `tests/arena.test.mjs` asserts the form, its fields and the button labels |
| Honesty (project rule, not a HIG page) | A recreation must say what is real and what is drawn | **Pair/Slack.** The first beat shows the **redacted screenshot** when `site/assets/slack-thread.png` exists (it does), inside a drawn Slack frame (`.slackcard--thread`, `:1100`; the image at `:1111`), and the hand-built recreation of the thread reply otherwise (`.slackcard__pane`, `:1112–1143`); each caption says exactly what was cropped, blurred, elided or drawn (`:1145`, `:1146` — both now say the rail and top bar are Slack's generic chrome, not the capture). The third beat quotes the recap verbatim from the same screenshot and says so (`:1315`); ids are synthetic `T0XXXXXXXXX` / `C0XXXXXXXXX` (`:1116`, `:1293`). The pair's stills say what they are ("The last lines of the harness log, then the verdict", `:1167`) and the line swaps to "Screen recording: …" only when a clip is in the box (`:1168`, CSS `:758–759`); every number on the pair is from `eval/out/results.md` (`5/5`, `5/5`, `1.00 → 0.00`, `:1183`, `:1205`, `:1207`). Defect fixed: the screenshot rule used to hide every `.slackcard`, so beat 3 was a caption with nothing above it; it now hides only beat 1's pane (`:706`) | Both ways verified: server-side by `tests/arena.test.mjs` (writes a 1×1 PNG, asserts the marker, deletes it, asserts it clears) and in the browser by toggling `body[data-slack-shot]`: pane `display:block`, image `none`, captions swap, and `.slackcard--recap` stays `display:block` either way. The demo slots both ways: with throwaway clips copied in, both `<video>`s built and autoplaying, `data-media` set, stills `none`, box 518×324 unchanged; a forced load error removed the clip and restored the still; with the files deleted no attribute, no request, stills back |
| Managing notifications | **Skipped.** The page sends no notifications and has no interruption levels | — | — |

## Components

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Buttons | "a button needs a hit region of at least 44x44 pt" | `.btn` at `site/index.html:467`; `.sel` `:570`; `.tog` `:573` | Hit-target script: 0 failures |
| Buttons | "Always include a press state for a custom button" | `.btn:active` at `:475`, `.seg__b:active` at `:451`, `.tabs__tab:active` at `:839`, `.nav__toggle:active` at `:431` | CSS grep: every interactive class has `:hover`, `:active`, `:focus-visible` and, for `.btn`, a disabled state at `:482` |
| Buttons | Keep prominent buttons to one or two per view | One primary and one secondary in the console (`:1063–1064`); the verdict adds at most **one** follow-up button, tied to what was just seen (`:1910–1914`) | Count of `.btn--primary` on the page: 1 |
| Buttons | Distinguish the preferred option by style, not size | Both console buttons are the same height and padding; only fill differs (`:467`, `:479`) | Measured: identical `min-height` 44, same padding |
| Buttons | Disabling a control must not strand keyboard focus | Both buttons are disabled while a run is in flight; when it ends, focus returns to the button that started it if it fell to `<body>` (`:1906–1878`, `lastBtn` set at `:1992` and `:1999`) | Keyboard: focus Replay, run, verdict painted, `document.activeElement` is Replay again and `:focus-visible` matches |
| Segmented controls | "no more than about five to seven segments"; use similarly sized content | 3 segments, equal padding (`site/index.html:1009–1036`). **Rewritten:** icon-only on the bar, each with a visually hidden text name (`.seg__t`, `:449`) that returns inside the mobile disclosure (`:896`) | DOM count; at 375 with the menu open the three names render (`position: static`, width 49 px) |
| Segmented controls | Do not mix action segments with selection-state segments | All three segments set state; none performs an action | Read of the handler at `:1525–1533` |
| Segmented controls | *(ARIA note)* The theme control is a **radio group** (`role="radio"` + `aria-checked`); the kill-chain **tabs** use `role="tab"` + `aria-selected` + `aria-controls`. Both support arrow keys, Home and End | radiogroup `:1009`, keys `:1527–1533`; tablist `:1211`, tabs `:1213–1215`, keys `:1858–1832` | Keyboard walk of both controls in the browser: ArrowRight moved the radio to Light (`aria-checked`, `tabindex`, `data-theme`, stored key all read back), Home restored System; ArrowRight/End/Home moved the tabs and the active panel |
| Tab views | "Avoid providing more than six tabs in a tab view" | 3 tabs (`site/index.html:1213–1215`) | DOM count |
| Tab views | A pane's controls affect only that pane; panes are mutually exclusive | Panels are grid-stacked and switched by `.is-active`; the inactive ones are `visibility:hidden` (`:844–847`, JS `:1844–1824`) | Inactive panels compute `visibility: hidden`; all three panels measure 239 px at 1280, so the height never changes between tabs |
| Tab views | *(APG)* A tab panel is in the tab sequence, so it is reachable when it holds no focusable control | `tabindex="0"` on all three panels (`site/index.html:1218`, `:1235`, `:1252`) | DOM read: 3 of 3 `[role=tabpanel]` carry `tabindex="0"`; the only `tabindex` values on the page are `0` and `-1` |
| Tab views | Label each tab so people can predict its contents | "Attack", "Guard on", "Invariant on" | Read of the DOM |
| Toolbars (Navigation bars merged into it) | Choose items deliberately; define what collapses at narrow widths | 6 links + icon theme control above 1100 px; below that everything collapses behind a Menu disclosure (`site/index.html:882–921`) | Measured at 1023 and 375: brand and Menu only on the bar; disclosure holds 6 links at 44 px tall and the full-width segmented control |
| Toolbars | Provide a reliable way to restore a hidden bar | The disclosure is a labelled button that toggles to "Close", is `aria-expanded`, and closes on Escape and on any link activation (`:1676–1654`) | Keyboard: open, Escape closes and focus returns to the Menu button (read back) |
| Labels | Use a label only for non-editable text; prefer system fonts and the system label colours | Two text roles only — `--ink` primary and `--dim` secondary (`site/index.html:74`); the console's field labels are `--dim` small caps (`.fld__l`, `:565`) | Contrast script covers both roles on every surface |
| Labels | "Make useful label text selectable" | Nothing on the page blocks selection except the toggle labels (`user-select:none` on `.tog`, `:573`, so a click toggles rather than selects) | `user-select` grep: one hit, the toggle |
| Toggles | Use a toggle only for two opposing values | The two defence toggles are exactly that: guard on/off, invariant on/off, native checkboxes with `accent-color:--ok` (`:575`); the theme has three states, so it stays a segmented picker | Design decision recorded here |
| Pickers | Use a picker for a short list of mutually exclusive options | The victim model is a native `select` (`:1049`), repopulated from `/api/config` (`:2005–1980`) so the page cannot list a model the arena does not have | DOM read after config: two options, the same two the arena serves |

## Inputs

| HIG area | Guideline | Where applied (file:line) | How verified |
|---|---|---|---|
| Keyboards | "Respect standard keyboard shortcuts" — do not repurpose them | The page binds only Arrow, Home, End (inside a composite widget) and Escape (to dismiss). No character or modifier shortcut is claimed, and nothing intercepts Enter or Space on a button | Grep of every `keydown` handler: `:1527–1533`, `:1683–1654`, `:1858–1832` |
| Keyboards | Do not implement custom keyboard navigation for buttons and segmented controls where the platform already handles it | Roving `tabindex` is used only where ARIA requires it (radiogroup, tablist); every other control is a plain focusable element in DOM order | Tab order walked: skip link → brand → links → theme → console (select, two checkboxes, two buttons) → content → footer |
| Pointing devices | "about 12 points of padding around elements that include a bezel" | Bezelled controls carry ≥ 12 px of internal padding (`.btn` 20 px, `.sel` 12 px, `.tog` 12 px, `.nav__link` 12 px) and the segmented control adds a 3 px inner gutter (`:444`) | Measured padding on each control class |
| Pointing devices | "Avoid creating gratuitous pointer and content effects" | Pointer depth is capped at 6 px (the largest `data-depth` left after the planes were cut, `:1026`), eased at 0.08 per frame (`site/index.html:1788`), and gated to `(hover:hover) and (pointer:fine)` (`:1468`) | Touch emulation at the mobile preset: no pointer listeners attach |
| Focus and selection | "Rely on system-provided focus effects"; build custom ones only if necessary | One rule, `:focus-visible` with a 2 px ring and 3 px offset (`site/index.html:237`); nothing sets `outline: none`. The ring is `--focus`, brass (`#7d5f1e` light / `#c8a96a` dark, `:84`) on all three surfaces, so they focus in the same colour | CSSOM grep: 0 rules set `outline: none`/`0`; the `:focus-visible` rule reads `2px solid var(--focus)`; controls focused in keyboard modality match it with a `solid 2px` outline |
| Focus and selection | "Avoid changing focus without people's interaction" | Focus moves only on an explicit key press (arrow/Home/End inside a widget), on Escape returning focus to the disclosure, or back to the button the reader pressed once its run ends | Read of every `.focus()` call: `:1526`, `:1529–1531`, `:1684`, `:1854`, `:1908` |
| Focus and selection | Focus moves in reading order, leading to trailing, top to bottom | DOM order is visual order; no `tabindex` above 0 exists | Grep for `tabindex="` — only `0` and `-1` |
| Gestures | "Support standard gestures everywhere you can"; add custom ones only when necessary | No custom gesture, no scroll hijacking, no swipe handler (`site/index.html:518–524`) | Grep: no `touchstart`/`wheel`/`preventDefault` on scroll |

## Technologies — read the index, applied nothing

| Technology area | Why it was skipped |
|---|---|
| SF Symbols | Requires Apple's licensed symbol set and system font; the page ships three web fonts and hand-drawn inline SVG (the theme icons at `:1010–1012`, the verdict glyphs) instead |
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
The implementation and its full derivation are in `site/index.html` **§4a** (`:248–336`),
duplicated verbatim into the arena and dashboard, and summarised in `site/BRAND.md`.

| Apple's line (quoted ≤ 15 words) | Where applied (file:line) | How verified |
|---|---|---|
| Liquid Glass "forms a distinct functional layer for controls and navigation elements" that "floats above the content layer" | `site/index.html:990` the sticky nav and `:1063` the hero console; `render/arena/public/index.html:336` the console (the arena's verdict, `:367`, is an opaque `.verdict` card since `9d6bf9e`; its second glass element is its bar); `realtime/dashboard/index.html:280` the header (its two defence switches, `:307–308`, are opaque `.switch` buttons since `9d6bf9e`) | DOM count of `.glass` per surface: site 2, arena 2, dashboard 1 (2026-09-09) |
| "Don't use Liquid Glass in the content layer" | No `.card`, `.table`, `.stat`, `.verdict`, `.slackcard`, `.tabs__panel`, `.run__out`, arena `.timeline`/`.step`, dashboard `.tile`/`#matrix`/`.feed` carries a glass class | Computed `backdrop-filter` over every content class on all three surfaces: `none` everywhere |
| "avoid overcrowding or layering Liquid Glass elements on top of each other" | Controls that sit **on** a glass surface use `.glass-inset` (`site/index.html:371`) — same optics, no `backdrop-filter`: `.seg` `:444`, `.nav__toggle` `:427`, the console's live button `:1064`; the console's select and toggles are opaque `--panel` fills (`:570`, `:573`). The mobile nav dropdown is opaque `:886–887` | For every `.glass` element on all three surfaces, in both themes: `el.querySelectorAll('.glass').length === 0`. Result: 0 nested, everywhere |
| Regular variant "blurs and adjusts the luminosity of background content to maintain legibility … when components have a significant amount of text" | `.glass` `site/index.html:338–375` — the default, and everything except one case | Computed `backdrop-filter: blur(20px) saturate(1.8)` |
| Clear variant: "highly translucent … for components that float above media backgrounds" | `.glass--clear` `site/index.html:358–359`, used once: the nav at scroll 0 over the hero scene. `:1803–1777` swaps it out after 8 px | Computed at scroll 0: `blur(9px)`, tint `.16`; at scroll 40: class `is-scrolled`, tint `.42` composite reported by the engine, links `--ink` |
| Scroll edge effect "helps maintain sufficient legibility and contrast for controls by obscuring content that scrolls beneath them" | That Clear → Regular thickening is this effect | Contrast on the composite, page scrolled: pass in either theme |
| "people … turn on accessibility settings that reduce transparency or motion" — "test your app's custom elements … with different configurations of these settings" | `prefers-reduced-transparency: reduce` `site/index.html:956–968`; `prefers-reduced-motion: reduce` `:928–968`; `initGlass` `:1635` returns before binding the pointer specular under the same query | CSSOM dump of each block on all three surfaces (site rules listed below): every `.glass`/`.glass-inset` element resolves to an opaque `var(--panel)`/`var(--bg)`, `background-image: none`, `backdrop-filter: none` |
| "Help maintain a sense of visual continuity … using rounded shapes that are concentric to their containers" | `--glass-r-in: calc(--glass-r - --glass-pad)` `site/index.html:141`; the hero console overrides to 22 − 14 = 8 (`:559`) and its select, toggles, buttons and outcome box all take `--glass-r-in` (`:570`, `:573`, `:580`, `:586`). Arena console 22 − 14 = 8 (`render/arena/public/index.html:64`); dashboard 18 − 10 = 8 (`realtime/dashboard/index.html:63`) | Computed `border-radius`: console 22px, its controls 8px |
| "Use Liquid Glass effects sparingly … Limit these effects to the most important functional elements" | At most 3 composited glass elements on any surface; no glass element carries `will-change` | `document.querySelectorAll('.glass').length` ≤ 3 per surface; computed `will-change` on every `.glass`/`.glass-inset` is `auto` |

**Departure from the brief, on Apple's authority.** The brief asked for glass on the theme
segmented control. That control lives inside the glass nav, and both Apple's line above and
the project's own rule forbid stacking the material. It is `.glass-inset` instead. The same
rule put the console's live button on `.glass-inset`: it sits on the glass console.

**Departure recorded honestly: the refraction is not universal.** `url()` inside
`backdrop-filter` is a WebKit/Blink behaviour; Firefox ignores it, and `CSS.supports()` only
parses the value, so it reports true everywhere. `initGlass` (`site/index.html:1635–1646`)
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
   (`site/index.html:1751`) because it is the figure resolving — content, not chrome — and it
   is off entirely under Reduce Motion. The live-run spinner loops at 900 ms (`:616`) for the
   same reason and is stopped by the same query (`:937`). The scroll parallax has no duration
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
  `getBoundingClientRect()` is under 44 in either axis. Result this pass (2026-09-09): site **22 controls
  at 1280, 14 at 375, 0 failures** in both themes; arena 14, 0; dashboard 11, 0. The two
  inline-link fixes from the previous pass (`site/index.html:551`,
  `render/arena/public/index.html:180`) still hold.
- **contrast script** — every visible element with a direct text node; foreground from
  `color`, background composited up the ancestor chain through every translucent layer
  (`alpha·tint + (1−alpha)·backdrop`, down to `body`); WCAG relative luminance; threshold 3:1 for
  large text (≥ 24 px, or ≥ 18.66 px at weight 700) and 4.5:1 otherwise. Site **379 pairs at
  1280 (361 at 375), 0 failures** per theme (2026-09-09); worst three light 4.94 ×3 (inline
  `code` on `--accent-soft`), dark 4.70 ×3 (the Slack window's `@mention` chips on the scoped
  `--sk-mention-bg`). Slack window alone: dark 4.70 (chips), light 5.59 (chips). Pair alone:
  dark 5.73 / 5.76 / 6.59 (the two tags, the source line), light 6.08 / 6.10 / 6.18. Arena at
  rest (33 pairs): light 4.94 / 5.46 / 5.51, dark 5.99 / 5.99 / 6.25. Dashboard 276 pairs:
  light 5.51 ×3, dark 5.21 ×3. Control borders (same composite, 3:1 floor): site 3.42 light
  (`.skip`, `.tabs__list`) / 4.09 dark (`.sel`, `.tog` on the console); arena 3.42 / 4.09;
  dashboard 3.42 (the skip link) / 4.01 (a switch). 0 failures. Gradients are measured at
  their worst stop: the Slack avatars went solid this pass because their light ends measured
  3.8–4.1 under the initials.
- **heading-order script** — document order of `h1…h6` on the site, visible headings only:
  `1,2,3,3,3,3,2,3,3,3,2,3,3,2,3,3` (2026-09-09; the two verdict `h3`s inside the inactive
  tab panels are `visibility:hidden`). The pair's captions are `span`s inside a `figcaption`,
  not headings, so the outline is unchanged. One `h1`, **no skipped levels**. Arena
  `1`; dashboard `1,2,2`.
- **landmark check** — one `body > header`, one `nav[aria-label]`, one `main`, one
  `body > footer`, **6 of 6** `section` elements carry `aria-labelledby`, skip link first in
  the tab order (verified by pressing Tab: `a.skip` at `left: 8px`, `:focus-visible` true).
- **keyboard walk** — Tab, ArrowRight/Home/End on the radiogroup and the tablist, Escape on
  the disclosure, all read back (re-run 2026-09-09: ArrowRight moved the tabs to `tab-guard`
  with its panel active, End to `tab-inv`, Home back; ArrowRight moved the radio to Light and
  wrote `data-theme`, Home restored System and removed the key; the skip link is first) from `aria-checked`/`aria-selected`/`tabindex`/`aria-expanded`
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
  `/api/config` shortened the cost line) stays fixed by the `min-height:3.2em` at `:583`.
- **live path** — **no live Nebius run was spent in this pass** (2026-09-09 included); replay is
  free and exercises the same render path. Re-run 2026-09-09 over CDP: Replay → `Leaked` in
  202 ms with focus back on the Replay button; guard on → `Denied by the guard`; a substituted
  503 on `/api/attack` → `Live is off`, the live button relabelled "Live runs unavailable" and
  disabled; `#attack` stayed at 871.72 px and `#runOut` at 268 px through all four states. The previous pass spent one (Nemotron 3 Super 120B, guard ON,
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
  Result for this blob: the two dark blocks are byte-identical to `9d6bf9e` (a `diff` of the
  region from `1. LIGHT PALETTE` to `3. BASE` against `HEAD` is empty) and to each other, 24
  declaration lines / 49 tokens each; 0 dark-only tokens. The two scoped `.slackcard` dark
  blocks are byte-identical to each other (`--sk-link`, `--sk-hover`, `--sk-mention-bg`) and
  every `--sk-*` token has its light value on `.slackcard`; 0 scoped dark-only tokens.
  Literals outside the token blocks: the scrolled-nav tint overrides, the mask stop, and the
  `--sk-*` definitions. Two non-colour tokens (`--ease`, `--s-9`)
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
  375: nothing logged on the site, the arena or the dashboard (2026-09-09), with and without
  the throwaway clips in place.
- **horizontal overflow** — `scrollWidth === innerWidth` on all three surfaces at 1280 and
  375, both schemes (2026-09-09). One finding this pass, fixed before commit: while the demo
  box was `overflow:visible` its long mono line widened it and pushed the site's layout
  viewport to 505 px at 375; `min-width:0` on the box plus `overflow:clip` (`:733`) holds it
  at 375 and still lets the still grow the box vertically. One finding, fixed: at 375 the dashboard's six-column ASR matrix was 400 px
  wide and pushed the layout viewport to 421 px; it now scrolls inside its own
  `overflow-x:auto` box (`realtime/dashboard/index.html:219`) and the page measures 375.
- **screenshots** — the pane composites a frame only on navigation and reported
  `visibilityState === "hidden"` throughout (which also pauses `IntersectionObserver`, so
  anything below the first viewport stays at `opacity:0` in its frames). Below-the-fold frames
  this pass were therefore taken from a **headless Chrome driven over CDP** against the same
  server, with `prefers-color-scheme` emulated and the viewport set to 1280×800 and 375×812:
  beats 1–3 in both schemes at both widths, the recreation with the screenshot attribute
  removed, the pair with throwaway clips copied in and then deleted, and the hero after a
  replay. The pane's own scripts (contrast, hit targets, keyboard, console) ran in the live
  tab. No frame-rate figure is claimed.
