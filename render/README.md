# No-Leak-MCP — Workflows plane (Render)

What must outlive the laptop. Two services + a persistent disk:

| Service | Role |
|---|---|
| `collector` (web + disk) | Owns the **durable append-only log** (`/var/data/events.jsonl`). Three ingress roles: **attacker listener** `GET /c/:id?d=` (the exfil drop), **event ingress** `POST /ingest`, **OTLP logs sink** `POST /v1/logs` (dsh telemetry mode FULL). Serves `GET /events?since=<byte>` and the worker checkpoint. |
| `detection-worker` (background) | Consumes the durable log by byte offset, detects exfil-delivered / egress-blocked / injection-flagged, and **checkpoints on the collector's disk** so a restart **resumes from the log, not from zero**. Optionally pushes to Convex. |

Write endpoints require `x-noleak-token` when `INGEST_TOKEN` is set (the blueprint generates one and shares it with the worker). The attacker drop `GET /c/:id` stays open by design.

## Deploy

Push the repo to GitHub, then Render → **New → Blueprint** → pick this repo (`render.yaml` (repo root)). Set `CONVEX_URL` on the worker in the Render dashboard. `$50` credit covers both starter services.

## Prove the recovery locally (no Render needed)

```bash
cd render
DATA_DIR=/tmp/nl PORT=10099 node collector/server.mjs &     # terminal 1
export COLLECTOR_URL=http://127.0.0.1:10099
curl -s -XPOST $COLLECTOR_URL/ingest -d '{"kind":"guard/deny","tool":"bash"}'
curl -s "$COLLECTOR_URL/c/t1?d=$(printf 'x=canary_AKIA' | base64)"
node worker/worker.mjs --once     # processes N
node worker/worker.mjs --once     # processes 0 — resumed from checkpoint
```

Append more events and re-run: the worker processes only the new bytes. Delivery is **at-least-once**: a crash between the durable write and the checkpoint reprocesses that batch on restart — but detections carry a dedupe id and Convex dedupes by key, so replays never double-count. The durable log is the source of truth; the worker is a rebuildable, idempotent consumer.

> **Requires Node 18+** (uses global fetch / AbortController / logical-assignment). `nvm use 20`. The base system Node may be older.
