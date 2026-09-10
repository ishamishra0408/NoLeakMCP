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

// MERGE, never rebuild, and re-read at WRITE time rather than at start.
//
// Two bugs, both of which cost this repo real fixtures:
//
//   1. It used to write a fresh index from whatever succeeded THIS run and
//      `continue` past failures, so one slow model dropped working fixtures out
//      of the index and off the live site.
//   2. Reading the index once at startup and writing it at the end is a
//      read-modify-write race. Two overlapping runs — easy to cause, since a
//      Llama recording takes minutes and the command is one click — both read
//      the same snapshot and the LAST to finish silently discards the other's
//      work. That is what removed both Llama entries on 2026-09-09 at 19:43,
//      four minutes after they were recorded.
//
// So the merge happens against the index as it is on disk at the moment of
// writing, not as it was when this process started.
const readIndex = () => {
  try { return existsSync(join(DIR, "index.json")) ? JSON.parse(readFileSync(join(DIR, "index.json"), "utf8")) : []; }
  catch { return []; }
};
const recorded = new Map();   // only what THIS run produced

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
  recorded.set(c.id, {
    id: c.id, file,
    label: `${MODELS[c.model].label} · guard ${c.guard ? "ON" : "OFF"} · inv ${c.invariant ? "ON" : "OFF"} → ${r.outcome}`,
    model: MODELS[c.model].label, guard: c.guard, invariant: c.invariant, outcome: r.outcome,
    recorded: new Date().toISOString().slice(0, 10),
  });
}
// Re-read now, so anything another run wrote while this one was working survives.
const byId = new Map(readIndex().map((e) => [e.id, e]));
for (const [id, entry] of recorded) byId.set(id, entry);
// stable order: the PLAN's order, then anything else that was already there
const order = new Map(PLAN.map((c, i) => [c.id, i]));
const index = [...byId.values()].sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
writeFileSync(join(DIR, "index.json"), JSON.stringify(index, null, 2));
console.log("\nrecorded this run:", [...recorded.keys()].join(", ") || "(none)");
console.log("index now holds", index.length, "fixtures:", index.map((e) => e.id).join(", "));
drop.close();
