# No-Leak-MCP — realtime plane (Convex)

The live attack-success-rate view (Multiplayer track). Per **adrs-convex**, the
dsh session log stays the source of truth; this is a **projection**, rebuildable
from it, that pushes to every viewer at once — two people watch ASR flip **1 → 0**
in the same instant.

## Parts

| Path | Role |
|------|------|
| `convex/schema.ts` | `events` (live feed) + `asrCells` (the ASR matrix) |
| `convex/ingest.ts` | `ingestEvent`, `ingestTrial`, `reset` mutations (write side) |
| `convex/metrics.ts` | `feed`, `cells`, `summary` reactive queries (read side) |
| `bridge/tail-to-convex.mjs` | tails the dsh JSONL logs → Convex |
| `dashboard/index.html` | subscribes to the queries; renders the matrix + feed |

## Setup

```bash
cd realtime
npm install
npx convex dev        # opens browser login; provisions a deployment; writes .env.local (CONVEX_URL)
```

Leave `npx convex dev` running (it deploys functions + hot-reloads). Then in another shell:

```bash
npm run backfill      # push existing log lines once
npm run bridge        # stream new guard/scorer/trial events live
```

Open the dashboard (`npm run dashboard` → http://127.0.0.1:8080) and paste your
`CONVEX_URL` when prompted, or open `dashboard/index.html?url=<CONVEX_URL>`.

## Data flow

```
dsh headless/web  ──▶  ~/.dsh/mcp-guard.log.jsonl      (guard/deny)
                  ──▶  ~/.dsh/mcp-guard.scores.jsonl   (scorer/verdict)
eval/run.mjs      ──▶  eval/out/trials.jsonl           (trial outcomes)
                          │  tail-to-convex.mjs
                          ▼
                     Convex (events, asrCells)  ──push──▶  every dashboard viewer
```

The bridge is stateless over the logs: delete the Convex data (`reset` mutation)
and re-run `npm run backfill` to rebuild the projection from the authoritative log.

> **Schema change (2026-09-08):** `events` gained optional `source` (`"arena"` | `"dsh"`)
> and `runId`, mapped in `ingestEvent` / `ingestTrial`, so the dashboard can tag each row
> and render the arena's `exfil/hit` LEAK rows. **The owner must run `cd realtime && npx
> convex deploy`** for this to take effect on the live deployment. Both fields are optional,
> so existing rows and the dsh bridge keep working unchanged; the arena server falls back to
> the legacy trial shape if the deployment has not been updated yet.

> **Requires Node 18+** (uses global fetch / AbortController / logical-assignment). `nvm use 20`. The base system Node may be older.
