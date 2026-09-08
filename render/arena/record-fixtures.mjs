/**
 * Record replay fixtures by running the arena live against Nebius. Does NOT
 * broadcast to Convex/collector — fixtures are captured transcripts only.
 *
 * Run: NEBIUS_API_KEY must be in the env. `node render/arena/record-fixtures.mjs`
 */
import { runAttack, MODELS } from "./arena-core.mjs";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DIR = join(HERE, "fixtures");
mkdirSync(DIR, { recursive: true });
const KEY = process.env.NEBIUS_API_KEY;
if (!KEY) { console.error("NEBIUS_API_KEY missing"); process.exit(2); }

const PLAN = [
  { id: "nemotron-open", model: "nemotron", guard: false, invariant: false },
  { id: "nemotron-guard", model: "nemotron", guard: true, invariant: false },
  { id: "nemotron-invariant", model: "nemotron", guard: false, invariant: true },
  { id: "llama-open", model: "llama", guard: false, invariant: false },
];

const index = [];
for (const c of PLAN) {
  process.stdout.write(`running ${c.id} … `);
  let r;
  try { r = await runAttack({ modelKey: c.model, guard: c.guard, invariant: c.invariant, apiKey: KEY, dropUrl: "https://arena.local" }); }
  catch (e) { console.log("ERROR", e.message); continue; }
  console.log(r.outcome);
  const file = `${c.id}.json`;
  writeFileSync(join(DIR, file), JSON.stringify({ steps: r.steps, outcome: r.outcome, outcomeText: r.outcomeText }, null, 2));
  index.push({
    id: c.id, file,
    label: `${MODELS[c.model].label} · guard ${c.guard ? "ON" : "OFF"} · inv ${c.invariant ? "ON" : "OFF"} → ${r.outcome}`,
    model: MODELS[c.model].label, guard: c.guard, invariant: c.invariant, outcome: r.outcome,
  });
}
writeFileSync(join(DIR, "index.json"), JSON.stringify(index, null, 2));
console.log("\nwrote", index.length, "fixtures to", DIR);
