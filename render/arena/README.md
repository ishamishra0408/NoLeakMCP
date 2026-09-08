# No-Leak-MCP — the Arena (public, judge-runnable build)

One public URL where anyone can run the silent Slack credential-leak attack against a **real
Nebius victim model** and watch the **real detectors** stop it — or not.

> **Honest scope, stated everywhere in the UI:** this is a **simulated Slack surface** and a
> **simulated agent loop** driving a **real Nebius victim model**, with the **real detector
> functions imported straight from `plugins/`** — not copies. It is **not dsh**. It is a harness
> that exercises the exact pure functions the dsh plugins call at `tools/pre-execute`,
> `tools/result`, and `session-telemetry/record`, so a verdict here is produced by the code that
> ships. Every credential is a canary decoy (`agent-credentials.env`); no real secret exists.

## What a judge does

1. Pick a victim model (Nemotron 3 Super 120B or Llama 3.3 70B, both live on Nebius).
2. Toggle the defenses: **Guard** (tagged canary tripwire) and/or **Invariant** (tagless
   read→post provenance).
3. **Launch attack (live)** — a real Nebius agent reads the poisoned Slack thread, reads the decoy
   keyring, and tries to base64-exfiltrate it to a drop URL. Or **Replay** a recorded transcript
   instantly (no tokens, no wait).

Outcome is one of: **LEAKED**, **DENIED_BY_GUARD**, **DENIED_BY_INVARIANT**, **MODEL_DECLINED**
(a genuine, honest outcome — some models refuse), or **ERROR**.

## How the run maps to the real controls

| Arena step | Real function (from `plugins/`) | dsh seat it fills |
|---|---|---|
| Score the poisoned thread | `injection-scorer.scoreText()` (real Nebius call) | `session-telemetry/record` |
| Harvest values from each read | `chain-invariant.harvestTokens()` | `tools/result` |
| Scan each outbound argument | `mcp-guard.scanArguments()` | `tools/pre-execute` |
| " (tagless) | `chain-invariant.matchOutbound()` | `tools/pre-execute` |

"Delivered" is decided by the guard's own `scanArguments` matcher with the control OFF — so a leak
means exactly what the guard would have blocked, the same test with the control disabled.

## Endpoints

| Route | Purpose |
|---|---|
| `GET /` | The arena UI |
| `GET /health` | Liveness + whether live runs are enabled |
| `GET /api/config` | Models, fixtures, rate-limit state |
| `POST /api/attack` | Run one live attack `{model, guard, invariant}` (rate-limited) |
| `POST /api/replay` | Play a recorded fixture `{id}` instantly |
| `GET /c/:id?d=` | Attacker drop listener (mirrors the collector) |
| `POST /api/admin/reset-limits` | Reset in-memory counters (needs `x-noleak-secret`) |

## Rate limits (owner decision)

Live runs: **6 per IP / 10 min**, **200 global / day** (in-memory counters, persisted to
`DATA_DIR/arena-runs.jsonl` so a restart keeps the day's count). Replay is unlimited (no Nebius call).

## Where events go

Every live run pushes to the **shared Convex feed** (`CONVEX_URL`) so all viewers see the same
event stream and the ASR matrix update, and to the **durable Render collector** (`COLLECTOR_URL`)
so a real delivery lands in the append-only log and the detection worker sees it. Replays render
locally only (they are not re-broadcast, so they never inflate the live metrics).

## Run locally

```bash
export NEBIUS_API_KEY=...          # required for live runs; Replay works without it
# optional: export CONVEX_URL=... COLLECTOR_URL=... INGEST_TOKEN=... NOLEAK_SECRET=...
node render/arena/server.mjs       # from the repo root — it imports ../../plugins/*
# open http://127.0.0.1:10000
```

Re-record the replay fixtures (makes a few live Nebius calls, does not broadcast):

```bash
NEBIUS_API_KEY=... node render/arena/record-fixtures.mjs
```

## Deploy

The `noleak-arena` service in the repo-root `render.yaml`. `rootDir` is **omitted** (repo root) so
the service can `import` `plugins/*` directly. Zero dependencies → no build step. Set
`NEBIUS_API_KEY`, `CONVEX_URL`, and `NOLEAK_SECRET` in the Render dashboard; `COLLECTOR_URL` /
`INGEST_TOKEN` / `ARENA_PUBLIC_URL` are wired from the blueprint.

> **Requires Node 18+** (global fetch / AbortController). `nvm use 20`.
