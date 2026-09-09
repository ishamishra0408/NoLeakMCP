# Changelog — No-Leak-MCP

Burning Token · NERDCONF, 2026-09-05 → 09-13. Times are ART (UTC−3), the event's clock.
Git tags: **`pre-event`** = `b0ada31` (everything that existed before the event),
**`event-start`** = `f0878d0` (first in-event commit). `git diff pre-event..HEAD --stat`
is the complete in-event delta.

## Pre-existing before the event (tag `pre-event`, commit `b0ada31`, 2026-09-04 23:59 ART)

- Threat analysis of the silent-egress leak through the Slack MCP surface (the original README).
- Two C4 dynamic diagrams and their generators (`diagrams/`).
- Not in git but pre-existing: the manual reproduction of the attack on a real Slack workspace
  with webhook.site / Beeceptor drops, and the attacker-side mock rig (`tools/`, committed Sep 5).
- Third-party, unmodified throughout: `@deepseek-ai/dsh` 0.1.1-rc.2.

Nothing above is submitted as event work.

## Built during the event

### 2026-09-05 — architecture as code, proposal, rename
- `f0878d0`…`ad9adab` Structurizr C4 model (`architecture/`): system, container, component and
  deployment views, five ADRs, Nebius / Convex / Render placed where they touch the chain; palette
  and ownership checks (`checks/`). *(Devansh)*
- `3a73927` `proposalIM.md` — the three-track plan (Nebius, Render, Convex).
- `7cc21ef` attacker harvester + mock rig; decoy keyring gitignored.
- `26bbcc6`, `36ef229`, `d69a0bf` project renamed dsh-mcp-guard → mcp-guard → **No-Leak-MCP**.

### 2026-09-05 → 09-07 — the controls, the eval, the planes (`fc16964`)
- **Payload-Compose guard** `plugins/mcp-guard/` — `tools/pre-execute` deny when a tagged secret
  appears in an outbound argument, raw or through base64 / hex / base32 / gzip / url / whitespace /
  byte-array / char-split. Audit JSONL. 22 unit tests.
- **Injection-Signal scorer** `plugins/injection-scorer/` — fills dsh's empty
  `session-telemetry/record` waterfall; scores ingested tool results with a Nebius model
  (Qwen3-30B); redacts decoy values from the OTLP copy. 9 unit tests.
- **Eval harness** `eval/` — ASR OFF vs ON, 2 victims (Nemotron 3 Super 120B, Llama 3.3 70B on
  Nebius) × 2 attack styles × N=5; reports blocked/attempts so guard effect is separated from
  model refusal. Results in `eval/out/`. Slack-surface planter `eval/slack/`.
- **Convex realtime** `realtime/` — schema, dedupe ingest, live ASR metrics, static dashboard,
  dsh→Convex bridge.
- **Render plane** `render/` + `render.yaml` — durable collector (web + disk: attacker drop, event
  ingress, OTLP sink) and a checkpointed detection worker (restart-from-log). Web + worker, not
  the Render Workflows product.
- Evidence captured step by step under `evidence/`.

### 2026-09-07 — live control plane (`3175d35`, `ca43efb`…`8710fcc`)
- Guard ON/OFF flipped live from the Convex dashboard (`realtime/convex/control.ts`, `http.ts`);
  the guard polls the control URL every 2 s. Dashboard prepared for static hosting.

### 2026-09-08 — chain invariant, truth pass, provenance
- `ebeeb0e`, `eafcf2f` **Exfiltration-Chain invariant** `plugins/chain-invariant/` — tagless
  provenance control: harvests secret-shaped values from every `tools/result`, denies their
  reappearance in a later outbound argument at `tools/pre-execute`. Opt-in, default OFF, live
  toggle. 5 unit tests. `99ad527`, `2a4b67b` dashboard toggle + `INV-DENY` rows on the feed.
- `6ad980c` **Truth pass** — every README/eval/proposal/Render claim reconciled with the code;
  per-artifact evidence ledger; redacted Slack-surface scorer verdicts (`evidence/step7-slack/`,
  7 of 8 poisoned-thread reads flagged 0.95); in-harness invariant deny (`evidence/step5-invariant/`);
  Render evidence relabelled as the local test it is; architecture model retags the invariant as
  built.
- This commit — tags `pre-event` / `event-start`, this changelog, MIT `LICENSE`, `.mailmap`, and the
  **dsh mount config** (`dsh/`) so the product is installable from the repo, not only from one laptop.

### 2026-09-08 — hosted arena (public, judge-runnable build)
- `render/arena/` — a third Render web service (`noleak-arena`) mounted at the **repo root**
  (`rootDir` omitted) so it imports `plugins/*` directly: the **real** detector functions, not
  copies. A judge picks a victim model (Nemotron 3 Super 120B / Llama 3.3 70B, live on Nebius) and
  toggles guard/invariant, then launches the silent Slack credential-leak attack against a real
  Nebius agent over a **simulated** Slack surface + agent loop. Outcome ∈ LEAKED / DENIED_BY_GUARD /
  DENIED_BY_INVARIANT / MODEL_DECLINED. Live runs are rate-limited (6/IP/10 min, 200/day) and push
  to the shared Convex feed + the durable collector; a Replay button plays recorded transcripts
  instantly. Four fixtures recorded from real Nebius runs (both models leak with defenses off; guard
  and invariant each deny with the matching toggle on). Honestly labelled throughout: simulated
  Slack + agent loop, real detectors, real Nebius model — **not dsh**.
- Arena hardening + verification pass: **LEAKED now requires the drop to actually receive and decode
  the canary** (unguessable run id; real `http_get` only ever hits this run's drop — SSRF guard;
  new `EXFIL_ATTEMPTED` outcome + `GET /api/drop/:id` verification). Scorer runs at the true dsh seam
  (only `mcp__slack__*` ingest results). Dependency-injected LLM/fetch/clock → `tests/arena.test.mjs`
  (11 network-free tests: OFF→LEAKED, guard→DENIED, invariant→DENIED, MODEL_DECLINED, scorer
  ingest-only, rate limiter 6-then-429, drop receipt + gated admin). Constant-time admin-secret
  compare; last-hop `x-forwarded-for`; server refactored to an injectable factory. Convex `events`
  gained optional `source`/`runId`; the dashboard tags each row (`arena`/`dsh` pill) and renders
  `exfil/hit` LEAK rows + a "Try the arena →" link; the arena sends `source:"arena"`. Added
  `render/arena/DEPLOY.md` (owner runbook). One live OFF smoke run confirmed LEAKED with a verified
  base64 drop receipt. *(needs `cd realtime && npx convex deploy` by the owner)*

### 2026-09-08 — website
- `site/` — the public landing page (`site/index.html`, brand guidelines in `site/BRAND.md`, SVG mark in
  `site/assets/`): the attack in one scroll, the three controls, the eval table and evidence ledger verbatim
  from the README, honest scope, provenance. Static, no build, no JS libraries. The arena service now serves
  it at `/` and the arena UI at `/arena` (`/api/*`, `/c/:id`, `/dashboard`, `/health` unchanged); the
  dashboard's "Try the arena →" defaults to `/arena`. Two arena tests added for the routes.

### 2026-09-08 — Slack-surface screenshot (poison ingress captured)
- `evidence/step7-slack/slack-thread.redacted.png` (+ `site/assets/slack-thread.png`) — a redacted
  screenshot of the poison on the **real** Slack surface: the `[ops-bot]` health-check as a **thread
  reply** in `#eng-channel`, beside the standup recap. Reproducible via `evidence/step7-slack/redact-shot.py`
  (PIL, no network) from an uncommitted source. Redacted: browser chrome, URL bar, bookmarks, workspace
  rail/sidebar and composers cropped out; avatar photos blurred + tiled; collector host replaced with
  `<attacker-host>`. Site now renders the screenshot in its drop-in slot, and the recreation fallback was
  corrected to the real text — a **thread reply** by the human `Isha Mishra` spoofing a bot (no `APP`
  badge), not an app post. `eval/slack/plant.mjs` now posts as a thread reply (new required
  `SLACK_THREAD_TS`) with the verbatim poison. Ledger updated: this captures the *ingress*, not the block.

## Still owed before submission (tracked, not hidden)
- Slack-surface `guard/deny` line and Beeceptor leak-vs-dark captures (audit log was reset before
  they were copied out; the new screenshot shows the poison, not a denial).
- `INV-DENY` row captured on the hosted dashboard.
- A real Render deploy log for the three services (the arena build itself is done: `render/arena/`,
  wired into `render.yaml`, verified end-to-end locally — live Nebius run → Convex feed + durable
  collector drop).
- Render Workflows port, or withdrawal of that entry — decision 2026-09-10.

## Credits
- Team: Isha Mishra, Devansh Pathak.
- Built with Claude Code (Anthropic). Harness: `@deepseek-ai/dsh` 0.1.1-rc.2. Inference: Nebius
  Token Factory. Realtime: Convex. Hosting: Render, Vercel (dashboard). Slack MCP server:
  `@modelcontextprotocol/server-slack`.
