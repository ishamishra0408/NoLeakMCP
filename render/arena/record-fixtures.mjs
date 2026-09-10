/**
 * Record replay fixtures by running the arena live against Nebius. Does NOT
 * broadcast to Convex/collector — fixtures are captured transcripts only.
 *
 * A LEAK now requires the drop to actually receive the canary, so we spin up a
 * throwaway local drop (GET /c/:id) and point the runs at it. Nothing else
 * leaves this process.
 *
 * Run: NEBIUS_API_KEY must be in the env. `node render/arena/record-fixtures.mjs`
 */
import http from "node:http";
import { runAttack, MODELS, inspectDrop, DROP_PATH_RE } from "./arena-core.mjs";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = join(HERE, "fixtures");
mkdirSync(DIR, { recursive: true });
const KEY = process.env.NEBIUS_API_KEY;
if (!KEY) { console.error("NEBIUS_API_KEY missing"); process.exit(2); }

// Throwaway drop: mirrors the arena server's /c/:id so LEAKED is verifiable.
const drop = http.createServer((req, res) => {
  if (DROP_PATH_RE.test(new URL(req.url, "http://x").pathname) && req.method === "GET") {
    const insp = inspectDrop(req.url);
    res.writeHead(200, { "content-type": "application/json" });
    return res.end(JSON.stringify({ ok: true, received: true, canary: insp.canary, how: insp.how }));
  }
  res.writeHead(404); res.end("{}");
});
await new Promise((r) => drop.listen(0, r));
const DROP_URL = `http://127.0.0.1:${drop.address().port}`;

const PLAN = [
  { id: "nemotron-open", model: "nemotron", guard: false, invariant: false },
  { id: "nemotron-guard", model: "nemotron", guard: true, invariant: false },
  { id: "nemotron-invariant", model: "nemotron", guard: false, invariant: true },
  { id: "llama-open", model: "llama", guard: false, invariant: false },
  { id: "llama-guard", model: "llama", guard: true, invariant: false },
  { id: "llama-invariant", model: "llama", guard: false, invariant: true },
];

// MERGE, never rebuild. This script used to write a fresh index from whatever
// succeeded THIS run, so one failed model dropped working fixtures out of the
// index and off the site — which happened twice, and Llama fails often enough on
// Nebius to make it likely. Existing entries are now carried forward and only
// replaced by a run that actually produced a transcript.
const existing = existsSync(join(DIR, "index.json"))
  ? JSON.parse(readFileSync(join(DIR, "index.json"), "utf8"))
  : [];
const byId = new Map(existing.map((e) => [e.id, e]));

// `node record-fixtures.mjs llama-guard llama-invariant` records only those and
// leaves every other fixture untouched.
const only = process.argv.slice(2);
const todo = only.length ? PLAN.filter((c) => only.includes(c.id)) : PLAN;
if (only.length) console.log("recording only:", todo.map((c) => c.id).join(", ") || "(nothing matched)");

for (const c of todo) {
  process.stdout.write(`running ${c.id} … `);
  let r;
  try { r = await runAttack({ modelKey: c.model, guard: c.guard, invariant: c.invariant, apiKey: KEY, dropUrl: DROP_URL }); }
  catch (e) { console.log("ERROR", e.message, "— keeping any existing fixture"); continue; }
  console.log(r.outcome);
  if (r.outcome === "ERROR") { console.log("   not recording an ERROR — keeping any existing fixture"); continue; }
  const file = `${c.id}.json`;
  writeFileSync(join(DIR, file), JSON.stringify({ steps: r.steps, outcome: r.outcome, outcomeText: r.outcomeText }, null, 2));
  byId.set(c.id, {
    id: c.id, file,
    label: `${MODELS[c.model].label} · guard ${c.guard ? "ON" : "OFF"} · inv ${c.invariant ? "ON" : "OFF"} → ${r.outcome}`,
    model: MODELS[c.model].label, guard: c.guard, invariant: c.invariant, outcome: r.outcome,
    recorded: new Date().toISOString().slice(0, 10),
  });
}
// stable order: the PLAN's order, then anything else that was already there
const order = new Map(PLAN.map((c, i) => [c.id, i]));
const index = [...byId.values()].sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
writeFileSync(join(DIR, "index.json"), JSON.stringify(index, null, 2));
console.log("\nindex now holds", index.length, "fixtures:", index.map((e) => e.id).join(", "));
drop.close();
