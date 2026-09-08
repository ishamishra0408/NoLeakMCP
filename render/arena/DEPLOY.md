# Deploy the Arena — owner runbook

Click-by-click to put the public, judge-runnable arena online. ~10 minutes.
Prereqs: the repo is on GitHub; you have a Convex deployment (`good-firefly-220`)
and a Nebius (Token Factory) API key.

## 1. Render — deploy the Blueprint

1. Push `main` to GitHub (this repo already contains `render.yaml`).
2. Render dashboard → **New** → **Blueprint** → pick this repo → **Apply**.
   It creates three services: `noleak-collector` (web+disk), `noleak-detection-worker`,
   and **`noleak-arena`** (the public build). Plan: **Starter** ($7/mo each) or Free
   (Free web services sleep after 15 min idle and cold-start on the next hit — fine for
   judging, slower first click). The arena has **zero dependencies**, so no build step.
3. Wired automatically from the blueprint (do not set by hand): `COLLECTOR_URL`,
   `INGEST_TOKEN` (from the collector), and `ARENA_PUBLIC_URL` (the arena's own public
   host — used to build the verifiable drop URL `…/c/<runId>`).
4. Set the three `sync:false` secrets on the **`noleak-arena`** service → **Environment**:
   - `NEBIUS_API_KEY` — victim + scorer inference. **Required** for live runs (Replay works without it).
   - `CONVEX_URL` — `https://good-firefly-220.convex.cloud` (same deployment the dashboard reads).
   - `NOLEAK_SECRET` — any long random string; gates `POST /api/admin/reset-limits`.
   Save → the service redeploys.

> `ARENA_PUBLIC_URL` is set by the blueprint from the arena's `host`. If you ever run the
> service outside the blueprint, set it (or rely on Render's `RENDER_EXTERNAL_URL`) so the
> drop URL is the public origin — otherwise a LEAK can't be confirmed.

## 2. Verify the deploy

Replace `ARENA` with the arena's public URL (e.g. `https://noleak-arena.onrender.com`).

```bash
curl -s $ARENA/health        # {"ok":true,"live":true,"convex":true,"collector":true,...}
open  $ARENA/                # UI loads; click Replay → a recorded transcript animates + outcome banner
# one live run (OFF) — costs a few Nebius calls:
curl -s -X POST $ARENA/api/attack -H 'content-type: application/json' \
     -d '{"model":"nemotron","guard":false,"invariant":false}' | tee /tmp/run.json
# outcome LEAKED, drop.received:true, drop.canary:true. Independently verify:
RID=$(node -e 'console.log(require("/tmp/run.json").transcriptId)')
curl -s $ARENA/api/drop/$RID # {"received":true,"canary":true,...}
```

In the Convex dashboard feed (or `$ARENA/dashboard`) confirm rows tagged **`source=arena`**:
a `scorer/verdict`, an `exfil/hit` (LEAK), and a `trial`.

## 3. Convex — publish the schema change

The `source`/`runId` fields on `events` and the two ingest mutations need a deploy:

```bash
cd realtime && npx convex deploy      # owner-only; requires Convex login
```

Older rows keep working (both fields are optional); the arena falls back to the
legacy trial shape if the deployment hasn't been updated yet.

## 4. Dashboard — link back to the arena

Set the arena URL in `realtime/dashboard/index.html` (`const ARENA_URL = "https://…"`),
or just open the dashboard with `?arena=<ARENA_URL>` — the "Try the arena →" header
link appears. The arena also serves the dashboard at `$ARENA/dashboard` (one public URL
for judges).

## Rollback

Render → `noleak-arena` → **Suspend** (stops serving; keeps config). Resume to restore.
Rate limits (6/IP/10 min, 200/day) are in-memory + persisted under `DATA_DIR`; a redeploy
resets the per-IP window but keeps the day's global count if a disk is attached.
