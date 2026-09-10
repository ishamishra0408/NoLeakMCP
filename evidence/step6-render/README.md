# step 6 — LOCAL recovery test of the Render collector + worker (not a Render deploy log)

Both files here come from running `render/collector/server.mjs` and `render/worker/worker.mjs` on the
laptop (`data=/tmp/noleak-render-test`, port 10099), per the "Prove the recovery locally" recipe in
`render/README.md`. They prove the checkpoint/resume behaviour of the worker. They do **not** prove a
Render deployment — they are a local recovery test and nothing more.

The blueprint **is** deployed and serving publicly as of 2026-09-10:
`https://noleak-arena-n14r.onrender.com` (site, arena, dashboard, attacker drop) and
`https://noleak-collector-n14r.onrender.com` (collector + disk), with `noleak-detection-worker` running
the loop these files test. Those URLs are the live proof; no deploy log is committed here. This plane is
Render hosting (web + worker), not the Render Workflows product.
