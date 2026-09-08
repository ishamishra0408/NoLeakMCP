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

## Still owed before submission (tracked, not hidden)
- Slack-surface `guard/deny` line and Beeceptor leak-vs-dark captures (audit log was reset before
  they were copied out).
- `INV-DENY` row captured on the hosted dashboard.
- A public, judge-runnable build (planned: hosted arena on Render) and a real Render deploy log.
- Render Workflows port, or withdrawal of that entry — decision 2026-09-10.

## Credits
- Team: Isha Mishra, Devansh Pathak.
- Built with Claude Code (Anthropic). Harness: `@deepseek-ai/dsh` 0.1.1-rc.2. Inference: Nebius
  Token Factory. Realtime: Convex. Hosting: Render, Vercel (dashboard). Slack MCP server:
  `@modelcontextprotocol/server-slack`.
