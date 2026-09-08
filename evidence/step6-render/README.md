# step 6 — LOCAL recovery test of the Render collector + worker (not a Render deploy log)

Both files here come from running `render/collector/server.mjs` and `render/worker/worker.mjs` on the
laptop (`data=/tmp/noleak-render-test`, port 10099), per the "Prove the recovery locally" recipe in
`render/README.md`. They prove the checkpoint/resume behaviour of the worker. They do **not** prove a
Render deployment; a real Render deploy log / service URL is owed and will be added when the blueprint
is deployed for judging. This plane is Render hosting (web + worker), not the Render Workflows product.
