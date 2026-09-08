/**
 * No-Leak-MCP hosted arena — HTTP server (Render web service, repo-root rootDir
 * so it can import plugins/* directly). Zero dependencies (Node http only).
 *
 * One public URL. A judge picks a victim model and toggles the guard / chain
 * invariant, clicks Launch attack, and watches a REAL Nebius victim agent read a
 * poisoned Slack thread (simulated Slack tools), read the decoy keyring, and try
 * to exfiltrate it — every outbound tool call scanned by the REAL detector
 * functions imported from plugins/. Outcome: LEAKED, DENIED_BY_GUARD,
 * DENIED_BY_INVARIANT, or MODEL_DECLINED. Live events are pushed to the existing
 * Convex deployment (shared live feed) and the durable Render collector.
 *
 * Honest label, everywhere: simulated Slack surface + simulated agent loop, REAL
 * detectors, REAL Nebius model. Not dsh — a harness over the same pure functions.
 *
 * Rate limits (owner decision): live runs per-IP 6 / 10 min, global 200 / day
 * (in-memory + persisted to a JSONL under DATA_DIR). The Replay button plays a
 * recorded transcript instantly and is NOT rate-limited (no Nebius call).
 *
 * Env: NEBIUS_API_KEY (required for live), CONVEX_URL, COLLECTOR_URL,
 *      INGEST_TOKEN, NOLEAK_SECRET (admin reset header), ARENA_PUBLIC_URL,
 *      DATA_DIR, PORT.
 */

import http from "node:http";
import { readFileSync, existsSync, mkdirSync, appendFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { runAttack, MODELS } from "./arena-core.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 10000);
const NEBIUS_KEY = process.env.NEBIUS_API_KEY || "";
const CONVEX_URL = (process.env.CONVEX_URL || "").replace(/\/+$/, "");
let COLLECTOR = (process.env.COLLECTOR_URL || "").trim();
if (COLLECTOR && !/^https?:\/\//i.test(COLLECTOR)) COLLECTOR = "http://" + COLLECTOR; // Render hostport is scheme-less
COLLECTOR = COLLECTOR.replace(/\/+$/, "");
const INGEST_TOKEN = process.env.INGEST_TOKEN || "";
const NOLEAK_SECRET = process.env.NOLEAK_SECRET || "";
const ARENA_PUBLIC_URL = (process.env.ARENA_PUBLIC_URL || "").replace(/\/+$/, "");
const DATA_DIR = process.env.DATA_DIR || "";

// The drop base: prefer the durable Render collector so a real leak lands in the
// durable log and the detection worker sees it; else the arena stands in as its
// own drop (still verifiable — we decode the payload and confirm the canary).
const DROP_BASE = COLLECTOR || ARENA_PUBLIC_URL || `http://127.0.0.1:${PORT}`;

// ---------------------------------------------------------------------------
// Rate limiting (in-memory; persisted to DATA_DIR/arena-runs.jsonl if set)
// ---------------------------------------------------------------------------

const PER_IP_MAX = 6;
const PER_IP_WINDOW_MS = 10 * 60 * 1000;
const GLOBAL_DAY_MAX = 200;
const ipHits = new Map(); // ip -> [ts,...]
let dayStamp = today();
let dayCount = 0;

function today() { return new Date().toISOString().slice(0, 10); }
function rollDay() { const t = today(); if (t !== dayStamp) { dayStamp = t; dayCount = 0; } }

if (DATA_DIR) {
  try { mkdirSync(DATA_DIR, { recursive: true }); } catch {}
  // Rebuild today's global counter from the persisted log so a restart doesn't reset the cap.
  try {
    const f = join(DATA_DIR, "arena-runs.jsonl");
    if (existsSync(f)) for (const l of readFileSync(f, "utf8").split("\n")) {
      const s = l.trim(); if (!s) continue; try { const o = JSON.parse(s); if (o.day === dayStamp) dayCount++; } catch {}
    }
  } catch {}
}

function persistRun(ip, meta) {
  if (!DATA_DIR) return;
  try { appendFileSync(join(DATA_DIR, "arena-runs.jsonl"), JSON.stringify({ ts: Date.now(), day: dayStamp, ip, ...meta }) + "\n"); } catch {}
}

function rateCheck(ip) {
  rollDay();
  if (dayCount >= GLOBAL_DAY_MAX) return { ok: false, reason: `Global live-run cap reached (${GLOBAL_DAY_MAX}/day). Use Replay — it plays instantly.` };
  const now = Date.now();
  const arr = (ipHits.get(ip) || []).filter((t) => now - t < PER_IP_WINDOW_MS);
  if (arr.length >= PER_IP_MAX) {
    const wait = Math.ceil((PER_IP_WINDOW_MS - (now - arr[0])) / 60000);
    return { ok: false, reason: `Per-IP limit reached (${PER_IP_MAX} live runs / 10 min). Try again in ~${wait} min, or use Replay.` };
  }
  return { ok: true, arr };
}
function rateCommit(ip, arr) { arr.push(Date.now()); ipHits.set(ip, arr); dayCount++; }
function rateState(ip) {
  rollDay();
  const now = Date.now();
  const arr = (ipHits.get(ip) || []).filter((t) => now - t < PER_IP_WINDOW_MS);
  return { perIpUsed: arr.length, perIpMax: PER_IP_MAX, globalUsed: dayCount, globalMax: GLOBAL_DAY_MAX };
}

// ---------------------------------------------------------------------------
// Push events to the shared planes (best-effort, never blocks the response)
// ---------------------------------------------------------------------------

function keyOf(e) {
  const kind = e.event ?? e.kind ?? "";
  return createHash("sha1").update([kind, e.callId || "", e.marker || "", e.how || "", e.tool || "", (e.sample || "").slice(0, 60)].join("|")).digest("hex");
}

async function convexMutation(path, args) {
  if (!CONVEX_URL) return;
  try {
    await fetch(CONVEX_URL + "/api/mutation", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ path, args, format: "json" }),
    });
  } catch { /* projection is best-effort */ }
}
async function toCollector(e) {
  if (!COLLECTOR) return;
  try {
    await fetch(COLLECTOR + "/ingest", {
      method: "POST", headers: { "content-type": "application/json", ...(INGEST_TOKEN ? { "x-noleak-token": INGEST_TOKEN } : {}) },
      body: JSON.stringify({ ...e, ts: e.ts || new Date().toISOString() }),
    });
  } catch { /* durable plane optional */ }
}

// Broadcast one run's events to Convex + collector. exfil/hit also pings the
// collector drop so the durable log + worker see a real delivery.
async function broadcast(result) {
  const jobs = [];
  for (const e of result.events) {
    if (e.event === "exfil/hit") {
      // Fire the collector drop listener (GET /c/:id?d=) so the leak is durable.
      // URL-encode the base64 — a raw '+' in a query string decodes back to a space.
      if (COLLECTOR && result.leakedSample) {
        const d = encodeURIComponent(Buffer.from(result.leakedSample, "utf8").toString("base64"));
        jobs.push(fetch(`${COLLECTOR}/c/${result.transcriptId}?d=${d}`).catch(() => {}));
      }
      continue; // exfil/hit is not an events-table kind; the drop hit records it durably
    }
    jobs.push(convexMutation("ingest:ingestEvent", { e, key: keyOf(e) }));
    jobs.push(toCollector(e));
  }
  const t = result.trial;
  jobs.push(convexMutation("ingest:ingestTrial", {
    model: t.model, style: t.style, guard: t.guard,
    delivered: !!t.delivered, denied: !!t.denied, unevaluable: !!t.unevaluable, trialId: t.trialId,
  }));
  jobs.push(toCollector({ kind: "trial", ...t }));
  await Promise.allSettled(jobs);
}

// ---------------------------------------------------------------------------
// Replay fixtures (recorded live transcripts; instant playback)
// ---------------------------------------------------------------------------

const FIXTURES_DIR = join(HERE, "fixtures");
function loadFixtures() {
  const out = [];
  try {
    const idx = join(FIXTURES_DIR, "index.json");
    if (existsSync(idx)) {
      const list = JSON.parse(readFileSync(idx, "utf8"));
      for (const f of list) {
        const p = join(FIXTURES_DIR, f.file);
        if (existsSync(p)) out.push({ ...f, transcript: JSON.parse(readFileSync(p, "utf8")) });
      }
    }
  } catch { /* no fixtures yet */ }
  return out;
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

function json(res, code, obj) { res.writeHead(code, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify(obj)); }
function clientIp(req) {
  const xf = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return xf || req.socket.remoteAddress || "unknown";
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = "", n = 0;
    req.on("data", (d) => { n += d.length; if (n > 256 * 1024) { req.destroy(); reject(new Error("body too large")); } b += d; });
    req.on("end", () => resolve(b));
    req.on("error", reject);
  });
}

const INDEX_HTML = (() => {
  try { return readFileSync(join(HERE, "public", "index.html")); } catch { return Buffer.from("<h1>arena</h1>"); }
})();

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, `http://localhost:${PORT}`);
    const p = u.pathname;

    if (p === "/" || p === "/index.html") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      return res.end(INDEX_HTML);
    }
    if (p === "/health") {
      return json(res, 200, { ok: true, live: !!NEBIUS_KEY, convex: !!CONVEX_URL, collector: !!COLLECTOR, day: dayStamp, dayCount });
    }

    if (p === "/api/config") {
      const fixtures = loadFixtures().map((f) => ({ id: f.id, label: f.label, model: f.model, guard: f.guard, invariant: f.invariant, outcome: f.outcome }));
      return json(res, 200, {
        models: Object.entries(MODELS).map(([k, v]) => ({ key: k, label: v.label })),
        liveEnabled: !!NEBIUS_KEY,
        rate: rateState(clientIp(req)),
        fixtures,
        publicUrl: ARENA_PUBLIC_URL || null,
        note: "Simulated Slack surface + simulated agent loop. Real detectors (imported from plugins/). Real Nebius victim model. Not dsh.",
      });
    }

    // The attacker drop listener — mirrors the collector's /c/:id so a leak is
    // verifiable even when no external collector is configured.
    const hit = p.match(/^\/c\/([A-Za-z0-9_.:-]+)/);
    if (hit && req.method === "GET") {
      return json(res, 200, { ok: true, received: true });
    }

    if (p === "/api/replay" && req.method === "POST") {
      const body = await readBody(req).catch(() => "");
      let id = ""; try { id = JSON.parse(body || "{}").id || ""; } catch {}
      const fx = loadFixtures().find((f) => f.id === id) || loadFixtures()[0];
      if (!fx) return json(res, 404, { error: "no fixtures recorded" });
      return json(res, 200, { replay: true, id: fx.id, label: fx.label, model: fx.model, guard: fx.guard, invariant: fx.invariant, outcome: fx.outcome, steps: fx.transcript.steps, outcomeText: fx.transcript.outcomeText });
    }

    if (p === "/api/attack" && req.method === "POST") {
      if (!NEBIUS_KEY) return json(res, 503, { error: "Live runs unavailable (NEBIUS_API_KEY not set). Use Replay." });
      const ip = clientIp(req);
      const rc = rateCheck(ip);
      if (!rc.ok) return json(res, 429, { error: rc.reason, rate: rateState(ip) });

      let body; try { body = JSON.parse((await readBody(req)) || "{}"); } catch { return json(res, 400, { error: "bad json" }); }
      const modelKey = MODELS[body.model] ? body.model : "nemotron";
      const guard = !!body.guard;
      const invariant = !!body.invariant;

      rateCommit(ip, rc.arr); // count the run before we spend the tokens
      let result;
      try {
        result = await runAttack({ modelKey, guard, invariant, apiKey: NEBIUS_KEY, dropUrl: DROP_BASE });
      } catch (err) {
        persistRun(ip, { model: modelKey, guard, invariant, outcome: "ERROR", error: String(err?.message || err) });
        return json(res, 500, { error: String(err?.message || err) });
      }
      persistRun(ip, { model: modelKey, guard, invariant, outcome: result.outcome, transcriptId: result.transcriptId });
      broadcast(result); // fire-and-forget to the shared planes
      return json(res, 200, {
        live: true, model: result.modelLabel, guard, invariant,
        outcome: result.outcome, outcomeText: result.outcomeText,
        steps: result.steps, transcriptId: result.transcriptId, rate: rateState(ip),
      });
    }

    // Admin: reset in-memory counters (NOLEAK_SECRET-gated). Convenience only.
    if (p === "/api/admin/reset-limits" && req.method === "POST") {
      if (!NOLEAK_SECRET || req.headers["x-noleak-secret"] !== NOLEAK_SECRET) return json(res, 401, { error: "unauthorized" });
      ipHits.clear(); dayCount = 0;
      return json(res, 200, { ok: true, reset: true });
    }

    return json(res, 404, { error: "not found" });
  } catch (err) {
    return json(res, 500, { error: String(err?.message || err) });
  }
});

server.listen(PORT, () => {
  console.log(`arena on :${PORT}  live=${!!NEBIUS_KEY} convex=${!!CONVEX_URL} collector=${COLLECTOR || "(none)"} drop=${DROP_BASE}`);
});
