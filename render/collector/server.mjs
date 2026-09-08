/**
 * No-Leak-MCP collector — the durable ingress that outlives the laptop (Render
 * web service + persistent disk; not the Render Workflows product). It owns the DURABLE APPEND-ONLY LOG on a persistent disk and
 * plays three roles the threat model needs off-box:
 *
 *   1. Attacker listener   GET  /c/:trialId?d=<base64>   (the exfil drop — "does the
 *                          canary escape?"). Every hit is recorded as an event.
 *   2. Event ingress       POST /ingest                  (guard denials, scorer
 *                          verdicts, trial outcomes shipped from dsh).
 *   3. OTLP logs sink       POST /v1/logs                 (dsh session telemetry;
 *                          mode FULL exports here). Best-effort, counted.
 *
 * The detection worker (../worker/worker.mjs) consumes the durable log by byte
 * offset and checkpoints here, so a worker restart RESUMES from the log rather
 * than restarting from zero. All durable state lives on this service's disk.
 *
 * Zero dependencies — Node http only.
 */

import http from "node:http";
import { appendFileSync, readFileSync, writeFileSync, existsSync, mkdirSync, statSync, openSync, readSync, closeSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const PORT = Number(process.env.PORT || 10000);
const DATA_DIR = process.env.DATA_DIR || join(tmpdir(), "noleak-data"); // Render sets /var/data via render.yaml; locally defaults to a writable tmp dir
try { mkdirSync(DATA_DIR, { recursive: true }); } catch (err) { console.error(`cannot create DATA_DIR ${DATA_DIR}: ${err.message}. Set DATA_DIR to a writable path.`); process.exit(1); }
const INGEST_TOKEN = process.env.INGEST_TOKEN || ""; // if set, write endpoints require x-noleak-token
function authed(req) { return !INGEST_TOKEN || req.headers["x-noleak-token"] === INGEST_TOKEN; }

const EVENTS = join(DATA_DIR, "events.jsonl"); // the durable log
const HITS = join(DATA_DIR, "hits.jsonl");
const OTLP = join(DATA_DIR, "otlp.jsonl");
const DETECTIONS = join(DATA_DIR, "detections.jsonl");
const CHECKPOINT = join(DATA_DIR, "worker.checkpoint.json");

function appendEvent(obj) {
  const line = JSON.stringify({ ts: Date.now(), ...obj }) + "\n";
  appendFileSync(EVENTS, line);
  return statSync(EVENTS).size; // new end offset
}
function fileSize(p) { return existsSync(p) ? statSync(p).size : 0; }
const MAX_BODY = 2 * 1024 * 1024; // 2 MB cap on POST bodies
function readBody(req) {
  return new Promise((resolve, reject) => {
    let b = "", n = 0;
    req.on("data", (d) => { n += d.length; if (n > MAX_BODY) { req.destroy(); reject(new Error("body too large")); return; } b += d; });
    req.on("end", () => resolve(b));
    req.on("error", reject);
  });
}
// Idempotent detections: skip ids already recorded (survives worker at-least-once replays).
let seenDet = null;
function detSet() {
  if (seenDet) return seenDet;
  seenDet = new Set();
  if (existsSync(DETECTIONS)) for (const l of readFileSync(DETECTIONS, "utf8").split("\n")) { const t = l.trim(); if (t) { try { const o = JSON.parse(t); if (o.id) seenDet.add(o.id); } catch {} } }
  return seenDet;
}
function json(res, code, obj) { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); }

const server = http.createServer(async (req, res) => {
  try {
    const u = new URL(req.url, `http://localhost:${PORT}`);
    const p = u.pathname;

    if (p === "/health") return json(res, 200, { ok: true, events: fileSize(EVENTS) });

    // 1. Attacker listener — the exfil drop.
    const hit = p.match(/^\/c\/([A-Za-z0-9_.:-]+)/);
    if (hit && req.method === "GET") {
      const d = u.searchParams.get("d") || "";
      let decoded = ""; try { decoded = Buffer.from(d, "base64").toString("utf8"); } catch {}
      const canary = /canary/i.test(decoded);
      appendFileSync(HITS, JSON.stringify({ ts: Date.now(), trialId: hit[1], canary }) + "\n");
      appendEvent({ kind: "exfil/hit", trialId: hit[1], canary, sample: decoded.slice(0, 80) });
      return json(res, 200, { ok: true, received: true }); // the attacker always says 200
    }

    // 2. Event ingress.
    if (p === "/ingest" && req.method === "POST") {
      if (!authed(req)) return json(res, 401, { error: "unauthorized" });
      const body = await readBody(req);
      let payload; try { payload = JSON.parse(body); } catch { return json(res, 400, { error: "bad json" }); }
      const events = Array.isArray(payload) ? payload : Array.isArray(payload.events) ? payload.events : [payload];
      let offset = 0;
      for (const e of events) offset = appendEvent(e);
      return json(res, 200, { ok: true, count: events.length, offset });
    }

    // 3. OTLP logs sink (dsh telemetry mode FULL). Best-effort; keep the exporter happy.
    if (p === "/v1/logs" && req.method === "POST") {
      if (!authed(req)) return json(res, 401, { error: "unauthorized" });
      const body = await readBody(req);
      appendFileSync(OTLP, JSON.stringify({ ts: Date.now(), bytes: body.length }) + "\n");
      return json(res, 200, { partialSuccess: {} });
    }

    // Worker: read the durable log from a byte offset (auth-gated — the log is not public).
    if (p === "/events" && req.method === "GET") {
      if (!authed(req)) return json(res, 401, { error: "unauthorized" });
      const since = Number(u.searchParams.get("since") || 0);
      const size = fileSize(EVENTS);
      let start = since; if (start > size || start < 0) start = 0; // truncated/rotated
      const out = [];
      if (start < size) {
        const fd = openSync(EVENTS, "r");
        try { const len = size - start; const b = Buffer.allocUnsafe(len); readSync(fd, b, 0, len, start); // read ONLY the new bytes
          for (const line of b.toString("utf8").split("\n")) { const s = line.trim(); if (s) { try { out.push(JSON.parse(s)); } catch {} } }
        } finally { closeSync(fd); }
      }
      return json(res, 200, { events: out, next: size });
    }

    // Worker checkpoint (durable, on this disk) — the recovery anchor.
    if (p === "/checkpoint" && req.method === "GET") {
      if (!authed(req)) return json(res, 401, { error: "unauthorized" });
      const cp = existsSync(CHECKPOINT) ? JSON.parse(readFileSync(CHECKPOINT, "utf8")) : { offset: 0 };
      return json(res, 200, cp);
    }
    if (p === "/checkpoint" && req.method === "POST") {
      if (!authed(req)) return json(res, 401, { error: "unauthorized" });
      const body = await readBody(req); let cp; try { cp = JSON.parse(body); } catch { return json(res, 400, { error: "bad json" }); }
      writeFileSync(CHECKPOINT, JSON.stringify({ offset: Number(cp.offset) || 0, at: Date.now() }));
      return json(res, 200, { ok: true });
    }

    // Worker publishes detections back to the durable store (idempotent by detection id).
    if (p === "/detections" && req.method === "POST") {
      if (!authed(req)) return json(res, 401, { error: "unauthorized" });
      const body = await readBody(req); let d; try { d = JSON.parse(body); } catch { return json(res, 400, { error: "bad json" }); }
      const set = detSet();
      const batch = Array.isArray(d.batch) ? d.batch : [];
      let added = 0;
      for (const det of batch) { if (det.id && set.has(det.id)) continue; if (det.id) set.add(det.id); appendFileSync(DETECTIONS, JSON.stringify({ ts: Date.now(), ...det }) + "\n"); added++; }
      if (!batch.length) appendFileSync(DETECTIONS, JSON.stringify({ ts: Date.now(), ...d }) + "\n");
      return json(res, 200, { ok: true, added });
    }

    if (p === "/stats") {
      if (!authed(req)) return json(res, 401, { error: "unauthorized" });
      return json(res, 200, {
        eventsBytes: fileSize(EVENTS), hits: fileSize(HITS), otlp: fileSize(OTLP),
        detections: fileSize(DETECTIONS),
        checkpoint: existsSync(CHECKPOINT) ? JSON.parse(readFileSync(CHECKPOINT, "utf8")) : null,
      });
    }

    return json(res, 404, { error: "not found" });
  } catch (err) {
    return json(res, 500, { error: String(err?.message || err) });
  }
});

server.listen(PORT, () => console.log(`collector on :${PORT}  data=${DATA_DIR}`));
