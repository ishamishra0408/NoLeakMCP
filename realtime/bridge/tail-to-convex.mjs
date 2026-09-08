/**
 * dsh → Convex bridge. Tails the harness JSONL logs (the authoritative local
 * record) and ships each new line to the Convex projection, so every dashboard
 * viewer is pushed the same moment (adrs-convex: the log stays the source of
 * truth; Convex is a rebuildable projection).
 *
 * Sources:
 *   ~/.dsh/mcp-guard.log.jsonl      guard denials      -> ingest.ingestEvent
 *   ~/.dsh/mcp-guard.scores.jsonl   scorer verdicts    -> ingest.ingestEvent
 *   ../eval/out/trials.jsonl        eval trial outcomes-> ingest.ingestTrial
 *
 * Setup: `npm i` in realtime/, then `npx convex dev` (writes CONVEX_URL into
 * .env.local). Run: `npm run bridge`  (add --backfill to send existing lines,
 * --once to exit after backfill).
 */

import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";
import { readFileSync, existsSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
// Stable identity for cross-source dedupe (bridge and Render worker derive the SAME key).
function keyOf(e){ const kind=e.event??e.kind??""; return createHash("sha1").update([kind,e.callId||"",e.marker||"",e.how||"",e.tool||"",(e.sample||"").slice(0,60)].join("|")).digest("hex"); }
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REALTIME = join(HERE, "..");
const HOME = homedir();

function convexUrl() {
  if (process.env.CONVEX_URL) return process.env.CONVEX_URL;
  if (process.env.VITE_CONVEX_URL) return process.env.VITE_CONVEX_URL;
  const envLocal = join(REALTIME, ".env.local");
  if (existsSync(envLocal)) {
    for (const line of readFileSync(envLocal, "utf8").split("\n")) {
      const m = line.match(/^(?:VITE_)?CONVEX_URL=(.+)$/);
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return null;
}

const URL = convexUrl();
if (!URL) {
  console.error("No CONVEX_URL. Run `npx convex dev` in realtime/ first (it writes .env.local), or export CONVEX_URL.");
  process.exit(2);
}
const client = new ConvexHttpClient(URL);
// Optional: also ship to the Render collector's durable log (feeds the detection worker).
const COLLECTOR = (process.env.COLLECTOR_URL || "").replace(/\/+$/, "");
const COLLECTOR_TOKEN = process.env.INGEST_TOKEN || "";
async function toCollector(e) {
  if (!COLLECTOR) return;
  try { await fetch(COLLECTOR + "/ingest", { method: "POST", headers: { "content-type": "application/json", ...(COLLECTOR_TOKEN ? { "x-noleak-token": COLLECTOR_TOKEN } : {}) }, body: JSON.stringify(e) }); }
  catch (err) { /* collector optional */ }
}
const args = new Set(process.argv.slice(2));
const BACKFILL = args.has("--backfill");
const ONCE = args.has("--once");

async function sendEvent(e, key) {
  await toCollector(e);
  try { await client.mutation(anyApi.ingest.ingestEvent, { e, key }); }
  catch (err) { console.error("ingestEvent failed:", err?.message || err); }
}
async function sendTrial(t) {
  if (!t.model || !t.guard) return;
  try {
    await client.mutation(anyApi.ingest.ingestTrial, {
      model: String(t.model), style: String(t.style ?? "?"), guard: String(t.guard),
      delivered: !!t.delivered, denied: !!t.denied, unevaluable: !!t.unevaluable,
      trialId: t.trialId ? String(t.trialId) : undefined,
    });
  } catch (err) { console.error("ingestTrial failed:", err?.message || err); }
}

const SOURCES = [
  { path: join(HOME, ".dsh/mcp-guard.log.jsonl"), handler: sendEvent, label: "guard" },
  { path: join(HOME, ".dsh/mcp-guard.scores.jsonl"), handler: sendEvent, label: "scorer" },
  { path: join(REALTIME, "..", "eval", "out", "trials.jsonl"), handler: sendTrial, label: "trials" },
];

const offsets = new Map(); // path -> bytes consumed

async function drain(src, fromZero) {
  if (!existsSync(src.path)) return;
  const size = statSync(src.path).size;
  let start = fromZero ? 0 : offsets.get(src.path) ?? size;
  if (start > size) start = 0; // file was truncated/rotated
  if (start >= size) { offsets.set(src.path, size); return; }
  const buf = readFileSync(src.path);
  const chunk = buf.subarray(start).toString("utf8");
  offsets.set(src.path, size);
  for (const line of chunk.split("\n")) {
    const s = line.trim();
    if (!s) continue;
    let obj; try { obj = JSON.parse(s); } catch { continue; }
    const key = keyOf(obj);
    await src.handler(obj, key);
    process.stdout.write(".");
  }
}

async function main() {
  console.log(`bridge -> ${URL}`);
  if (BACKFILL) {
    for (const src of SOURCES) { console.log(`\nbackfill ${src.label}: ${src.path}`); await drain(src, true); }
    console.log("\nbackfill done");
    if (ONCE) return;
  } else {
    // start at current EOF so we only stream new lines
    for (const src of SOURCES) offsets.set(src.path, existsSync(src.path) ? statSync(src.path).size : 0);
  }
  console.log("\ntailing (Ctrl+C to stop)…");
  setInterval(() => { for (const src of SOURCES) drain(src, false); }, 1000);
}

main().catch((e) => { console.error(e); process.exit(1); });
