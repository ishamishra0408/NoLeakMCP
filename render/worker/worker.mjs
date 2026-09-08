import { createHash } from "node:crypto";
// Stable identity for cross-source dedupe (must match realtime/bridge keyOf()).
function keyOf(e){ const kind=e.event??e.kind??""; return createHash("sha1").update([kind,e.callId||"",e.marker||"",e.how||"",e.tool||"",(e.sample||"").slice(0,60)].join("|")).digest("hex"); }
/**
 * No-Leak-MCP detection worker (Render, Workflows track).
 *
 * Consumes the collector's DURABLE LOG by byte offset and RECOVERS from a
 * checkpoint on restart — restart-from-log, not restart-from-zero. Each pass:
 *   1. GET /checkpoint            (durable offset on the collector's disk)
 *   2. GET /events?since=offset   (only new events)
 *   3. detect over them           (exfil delivered? blocked? injection flagged?)
 *   4. POST /detections           (durable verdicts)
 *   5. POST /checkpoint {next}     (advance — the recovery anchor)
 *   6. optionally push to Convex   (the realtime projection)
 *
 * Delivery is AT-LEAST-ONCE: a crash between the durable write (step 4) and the
 * checkpoint (step 5) reprocesses that batch on restart. Consumers are made
 * idempotent — each detection carries a stable id the collector dedupes, and
 * Convex dedupes by key — so a replay never double-counts. It resumes from the
 * checkpoint (not from zero) and loses nothing. Testable locally (see README.md).
 *
 * Env: COLLECTOR_URL (required), CONVEX_URL (optional), INTERVAL_MS, --once
 * NOTE: run ONE Convex pusher per deployment (this worker OR the local bridge, not both).
 */

let COLLECTOR = process.env.COLLECTOR_URL || "http://127.0.0.1:10000";
if (!/^https?:\/\//i.test(COLLECTOR)) COLLECTOR = "http://" + COLLECTOR; // Render fromService hostport is scheme-less; private network is plain HTTP
COLLECTOR = COLLECTOR.replace(/\/+$/, "");
const CONVEX_URL = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL || "";
const INTERVAL_MS = Number(process.env.INTERVAL_MS || 1500);
const TOKEN = process.env.INGEST_TOKEN || "";
const hdr = TOKEN ? { "x-noleak-token": TOKEN } : {};
const ONCE = process.argv.includes("--once");

let convex = null, anyApi = null;
async function initConvex() {
  if (!CONVEX_URL) return;
  try {
    const b = await import("convex/browser");
    const s = await import("convex/server");
    convex = new b.ConvexHttpClient(CONVEX_URL); anyApi = s.anyApi;
    console.log("convex push enabled →", CONVEX_URL);
  } catch (e) { console.warn("convex disabled (install `convex` to enable):", e?.message || e); }
}

async function get(path) { const r = await fetch(COLLECTOR + path, { headers: hdr }); if (!r.ok) throw new Error(`GET ${path} ${r.status}`); return r.json(); }
async function post(path, body) { const r = await fetch(COLLECTOR + path, { method: "POST", headers: { "content-type": "application/json", ...hdr }, body: JSON.stringify(body) }); if (!r.ok) throw new Error(`POST ${path} ${r.status}`); return r.json(); }

// Cumulative counters are ephemeral; the DURABLE facts are the collector's
// events.jsonl + detections.jsonl. On restart we resume from the checkpoint.
const totals = { processed: 0, exfilsDelivered: 0, blocked: 0, injectionsFlagged: 0, trials: 0 };

function detect(e) {
  const out = [];
  if (e.kind === "exfil/hit") {
    if (e.canary) { totals.exfilsDelivered++; out.push({ type: "EXFIL_DELIVERED", severity: "critical", trialId: e.trialId, note: "canary reached the attacker listener" }); }
  } else if (e.kind === "guard/deny") {
    totals.blocked++; out.push({ type: "EGRESS_BLOCKED", severity: "info", tool: e.tool, how: e.how });
  } else if (e.kind === "scorer/verdict") {
    if (e.injection) { totals.injectionsFlagged++; out.push({ type: "INJECTION_FLAGGED", severity: "warn", tool: e.tool, score: e.score }); }
  } else if (e.kind === "trial") {
    totals.trials++;
  }
  return out;
}

async function pushConvex(e) {
  if (!convex) return;
  try {
    if (e.kind === "trial" && e.model && e.guard) {
      await convex.mutation(anyApi.ingest.ingestTrial, { model: String(e.model), style: String(e.style ?? "?"), guard: String(e.guard), delivered: !!e.delivered, denied: !!e.denied, unevaluable: !!e.unevaluable, trialId: e.trialId ? String(e.trialId) : undefined });
    } else {
      const key = keyOf(e);
      await convex.mutation(anyApi.ingest.ingestEvent, { e, key });
    }
  } catch (err) { console.warn("convex push failed:", err?.message || err); }
}

async function pass() {
  const { offset } = await get("/checkpoint");
  const { events, next } = await get(`/events?since=${offset}`);
  if (!events.length) return { processed: 0, offset, next };
  const detections = [];
  for (const e of events) {
    totals.processed++;
    for (const d of detect(e)) {
      const id = createHash("sha1").update(`${d.type}|${e.ts}|` + JSON.stringify(e)).digest("hex"); // full event content → distinct ids for same-ms distinct events
      detections.push({ ...d, id, sourceTs: e.ts });
    }
    await pushConvex(e);
  }
  if (detections.length) await post("/detections", { batch: detections, totals });
  await post("/checkpoint", { offset: next }); // advance only AFTER durable work
  return { processed: events.length, offset, next, detections: detections.length };
}

async function main() {
  await initConvex();
  console.log(`worker → ${COLLECTOR}  (once=${ONCE})`);
  let running = true;
  process.on("SIGTERM", () => { running = false; });
  process.on("SIGINT", () => { running = false; });
  do {
    try {
      const r = await pass();
      if (r.processed) console.log(`processed ${r.processed} (offset ${r.offset}→${r.next}), detections ${r.detections}; totals`, totals);
    } catch (err) { console.warn("pass failed (will retry):", err?.message || err); }
    if (ONCE) break;
    await new Promise((s) => setTimeout(s, INTERVAL_MS));
  } while (running);
  console.log("worker stopped; checkpoint is durable — restart resumes from it.");
}

main().catch((e) => { console.error(e); process.exit(1); });
