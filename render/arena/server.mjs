/**
 * No-Leak-MCP hosted arena — HTTP server (Render web service, repo-root rootDir
 * so it can import plugins/* directly). Zero dependencies (Node http only).
 *
 * One public URL: `/` is the website (site/index.html), `/arena` is the arena
 * UI. A judge picks a victim model and toggles the guard / chain
 * invariant, clicks Launch attack, and watches a REAL Nebius victim agent read a
 * poisoned Slack thread (simulated Slack tools), read the decoy keyring, and try
 * to exfiltrate it — every outbound tool call scanned by the REAL detector
 * functions imported from plugins/. Outcome: LEAKED, DENIED_BY_GUARD,
 * DENIED_BY_INVARIANT, EXFIL_ATTEMPTED, or MODEL_DECLINED. Live events are pushed
 * to the existing Convex deployment (shared live feed) and the durable Render
 * collector.
 *
 * Honest label, everywhere: simulated Slack surface + simulated agent loop, REAL
 * detectors, REAL Nebius model. Not dsh — a harness over the same pure functions.
 *
 * The arena is its OWN attacker drop: the victim's http_get is a real request to
 * `<ARENA_PUBLIC_URL>/c/<runId>?d=…`; GET /c/:id records what arrived (decoded
 * with the guard's matcher, control OFF) and LEAKED requires that receipt.
 * GET /api/drop/:id lets anyone verify a run's receipt independently.
 *
 * Rate limits (owner decision): live runs per-IP 6 / 10 min, global 200 / day
 * (in-memory + persisted to a JSONL under DATA_DIR). The Replay button plays a
 * recorded transcript instantly and is NOT rate-limited (no Nebius call).
 *
 * Env: NEBIUS_API_KEY (required for live), CONVEX_URL, COLLECTOR_URL,
 *      INGEST_TOKEN, NOLEAK_SECRET (admin reset header), ARENA_PUBLIC_URL
 *      (falls back to Render's RENDER_EXTERNAL_URL), DATA_DIR, PORT.
 */

import http from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash, timingSafeEqual } from "node:crypto";
import { runAttack as realRunAttack, MODELS, DROP_PATH_RE, inspectDrop, normalizeBase, pickPublicBase } from "./arena-core.mjs";
import { createRateLimiter } from "./rate-limit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, "..", "..");
const SOURCE = "arena";

/**
 * Build the arena server. Everything external is injectable for tests:
 * @param {object} o
 * @param {object} [o.env]        process.env-like
 * @param {Function} [o.runAttack]  arena-core runAttack (fake in tests)
 * @param {Function} [o.fetchImpl]  fetch for Convex/collector pushes
 * @param {Function} [o.now]
 */
export function createArenaServer(o = {}) {
  const env = o.env || process.env;
  const runAttack = o.runAttack || realRunAttack;
  const fetchImpl = o.fetchImpl || globalThis.fetch;
  const now = o.now || Date.now;

  const PORT = Number(env.PORT || 10000);
  const NEBIUS_KEY = env.NEBIUS_API_KEY || "";
  const CONVEX_URL = (env.CONVEX_URL || "").replace(/\/+$/, "");
  let COLLECTOR = (env.COLLECTOR_URL || "").trim();
  if (COLLECTOR && !/^https?:\/\//i.test(COLLECTOR)) COLLECTOR = "http://" + COLLECTOR; // Render hostport is scheme-less
  COLLECTOR = COLLECTOR.replace(/\/+$/, "");
  const INGEST_TOKEN = env.INGEST_TOKEN || "";
  const NOLEAK_SECRET = env.NOLEAK_SECRET || "";
  // The public base has to be a REACHABLE host, because the victim fetches the drop
  // over the open internet and the leak verdict is the drop's receipt. Render's
  // `fromService.property: host` yields the bare service name ("noleak-arena-n14r"),
  // not the FQDN, and a first deploy took ARENA_PUBLIC_URL from it and shadowed the
  // correct RENDER_EXTERNAL_URL: the drop base became https://noleak-arena-n14r,
  // which does not resolve, so a guard-off run could never be shown to leak. So the
  // candidates are ranked by whether they can actually be reached, not by order.
  const ARENA_PUBLIC_URL = pickPublicBase([env.ARENA_PUBLIC_URL, env.RENDER_EXTERNAL_URL]);
  const DATA_DIR = env.DATA_DIR || "";

  // The drop base is THIS service: GET /c/:id records the receipt the verdict needs.
  const DROP_BASE = ARENA_PUBLIC_URL || `http://127.0.0.1:${PORT}`;

  const limiter = createRateLimiter({ perIpMax: 6, windowMs: 10 * 60 * 1000, globalDayMax: 200, now, dataDir: DATA_DIR });

  // -------------------------------------------------------------------------
  // Drop receipts (bounded, in-memory): runId -> { at, canary, how, sample }
  // -------------------------------------------------------------------------
  const DROP_HITS = new Map();
  const DROP_MAX = 2000;
  function recordDrop(id, rawUrl) {
    const insp = inspectDrop(rawUrl);
    const rec = { at: now(), canary: insp.canary, how: insp.how, sample: insp.canary ? String(insp.sample).slice(0, 60) : null };
    if (!DROP_HITS.has(id) && DROP_HITS.size >= DROP_MAX) DROP_HITS.delete(DROP_HITS.keys().next().value);
    // First canary receipt wins; a later non-canary ping must not erase it.
    const prev = DROP_HITS.get(id);
    if (!prev || (!prev.canary && rec.canary)) DROP_HITS.set(id, rec);
    return DROP_HITS.get(id);
  }

  // -------------------------------------------------------------------------
  // Push events to the shared planes (best-effort, never blocks the response)
  // -------------------------------------------------------------------------
  function keyOf(e) {
    const kind = e.event ?? e.kind ?? "";
    return createHash("sha1").update([kind, e.callId || e.trialId || "", e.marker || "", e.how || "", e.tool || "", (e.sample || "").slice(0, 60)].join("|")).digest("hex");
  }
  async function convexMutation(path, args) {
    if (!CONVEX_URL) return { skipped: true };
    try {
      const res = await fetchImpl(CONVEX_URL + "/api/mutation", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ path, args, format: "json" }),
      });
      return { ok: res.ok, status: res.status };
    } catch { return { ok: false }; } // projection is best-effort
  }
  async function toCollector(e) {
    if (!COLLECTOR) return;
    try {
      await fetchImpl(COLLECTOR + "/ingest", {
        method: "POST", headers: { "content-type": "application/json", ...(INGEST_TOKEN ? { "x-noleak-token": INGEST_TOKEN } : {}) },
        body: JSON.stringify({ ...e, ts: e.ts || new Date(now()).toISOString() }),
      });
    } catch { /* durable plane optional */ }
  }

  // Broadcast one run's events to Convex + collector, tagged source=arena + runId.
  async function broadcast(result) {
    const jobs = [];
    const runId = result.transcriptId;
    for (const e0 of result.events) {
      const e = { ...e0, source: SOURCE, runId };
      jobs.push(convexMutation("ingest:ingestEvent", { e, key: keyOf(e) }));
      if (e.event === "exfil/hit") {
        // Forward the confirmed delivery to the durable collector drop (its own
        // /c/:id appends exfil/hit to the append-only log) — not to /ingest twice.
        if (COLLECTOR && result.leakedSample) {
          const d = encodeURIComponent(Buffer.from(result.leakedSample, "utf8").toString("base64"));
          jobs.push(fetchImpl(`${COLLECTOR}/c/${runId}?d=${d}`).catch(() => {}));
        }
        continue;
      }
      jobs.push(toCollector(e));
    }
    const t = result.trial;
    const trialArgs = {
      model: t.model, style: t.style, guard: t.guard,
      delivered: !!t.delivered, denied: !!t.denied, unevaluable: !!t.unevaluable, trialId: t.trialId,
    };
    // New deployments accept source/runId; an older Convex deployment rejects unknown
    // args, so fall back to the legacy shape rather than dropping the trial.
    jobs.push((async () => {
      const r = await convexMutation("ingest:ingestTrial", { ...trialArgs, source: SOURCE, runId });
      if (r && r.ok === false) await convexMutation("ingest:ingestTrial", trialArgs);
    })());
    jobs.push(toCollector({ kind: "trial", ...t, source: SOURCE, runId }));
    await Promise.allSettled(jobs);
  }

  // -------------------------------------------------------------------------
  // Replay fixtures (recorded live transcripts; loaded once, instant playback)
  // -------------------------------------------------------------------------
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
  const FIXTURES = loadFixtures();
  const FIXTURE_LIST = FIXTURES.map((f) => ({ id: f.id, label: f.label, model: f.model, guard: f.guard, invariant: f.invariant, outcome: f.outcome, recorded: f.recorded || null }));

  // -------------------------------------------------------------------------
  // HTTP
  // -------------------------------------------------------------------------
  function json(res, code, obj) { res.writeHead(code, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify(obj)); }
  function clientIp(req) {
    // Behind Render's proxy the LAST x-forwarded-for entry is the one the proxy
    // appended (the real peer); earlier entries are client-supplied and spoofable.
    const parts = String(req.headers["x-forwarded-for"] || "").split(",").map((s) => s.trim()).filter(Boolean);
    return parts.length ? parts[parts.length - 1] : (req.socket.remoteAddress || "unknown");
  }
  function readBody(req) {
    return new Promise((resolve, reject) => {
      let b = "", n = 0;
      req.on("data", (d) => { n += d.length; if (n > 256 * 1024) { req.destroy(); reject(new Error("body too large")); } b += d; });
      req.on("end", () => resolve(b));
      req.on("error", reject);
    });
  }
  function secretOk(given) {
    if (!NOLEAK_SECRET || typeof given !== "string") return false;
    const a = Buffer.from(given), b = Buffer.from(NOLEAK_SECRET);
    return a.length === b.length && timingSafeEqual(a, b);
  }

  const INDEX_HTML = (() => {
    try { return readFileSync(join(HERE, "public", "index.html")); } catch { return Buffer.from("<h1>arena</h1>"); }
  })();
  // The public website (site/index.html) is served at `/`; the arena UI moved to
  // `/arena`. site/assets/* (the logo mark) is served under /assets/ — a fixed
  // allowlist of extensions and a basename-only lookup, so no path traversal.
  const SITE_DIR = join(REPO_ROOT, "site");
  // Re-read when the file's mtime changes (one stat per request) so an edit to
  // the site never needs a restart; the arena UI keeps its boot-time cache.
  //
  // The site has three drop-in slots, all detected HERE, server-side, and
  // signalled as attributes on <body>, so a page without a file never issues a
  // request for it (no 404 in the console):
  //   site/assets/slack-thread.png            -> <body data-slack-shot="1">
  //   site/assets/demo-attack.{mp4|webm|gif}  -> data-demo-attack="<filename>"
  //   site/assets/demo-blocked.{mp4|webm|gif} -> data-demo-blocked="<filename>"
  //   site/assets/demo-<slot>-poster.png      -> data-demo-<slot>-poster="<filename>"
  // Video is preferred over a gif when both exist (mp4, then webm, then gif).
  // The cache keys on the site's mtime AND the set of files found, so dropping
  // a file in (or out) takes effect on the next request without a restart.
  // See site/BRAND.md, "Adding the real Slack screenshot" / "Adding the demo footage".
  const DEMO_EXTS = [".mp4", ".webm", ".gif"];
  function demoSlots() {
    const attrs = [];
    if (existsSync(join(SITE_DIR, "assets", "slack-thread.png"))) attrs.push('data-slack-shot="1"');
    for (const slot of ["attack", "blocked"]) {
      const ext = DEMO_EXTS.find((e) => existsSync(join(SITE_DIR, "assets", `demo-${slot}${e}`)));
      if (!ext) continue;
      attrs.push(`data-demo-${slot}="demo-${slot}${ext}"`);
      if (existsSync(join(SITE_DIR, "assets", `demo-${slot}-poster.png`))) attrs.push(`data-demo-${slot}-poster="demo-${slot}-poster.png"`);
    }
    return attrs.join(" ");
  }
  let siteCache = { mtime: 0, slots: null, body: null };
  function siteHtml() {
    try {
      const f = join(SITE_DIR, "index.html");
      const m = statSync(f).mtimeMs;
      const slots = demoSlots();
      if (m !== siteCache.mtime || slots !== siteCache.slots) {
        let s = readFileSync(f, "utf8");
        if (slots) s = s.replace("<body>", "<body " + slots + ">");
        siteCache = { mtime: m, slots, body: Buffer.from(s, "utf8") };
      }
      return siteCache.body;
    } catch { return null; }
  }
  // Servable asset types, by basename only (no separators survive the regex,
  // so no traversal). The video types are here for the demo slots; a video
  // needs byte-range answers (Safari refuses to play without them), which the
  // /assets/ handler provides for every type.
  const ASSET_TYPES = { ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".webp": "image/webp",
    ".mp4": "video/mp4", ".webm": "video/webm", ".gif": "image/gif" };
  function siteAsset(name) {
    if (!/^[A-Za-z0-9_.-]+$/.test(name) || name.startsWith(".")) return null;
    const ext = name.slice(name.lastIndexOf("."));
    if (!ASSET_TYPES[ext]) return null;
    try { return { body: readFileSync(join(SITE_DIR, "assets", name)), type: ASSET_TYPES[ext] }; } catch { return null; }
  }
  // One range only (`bytes=a-b`, `bytes=a-`, `bytes=-n`); anything else is
  // answered whole. Returns null when the range is unsatisfiable.
  function sliceRange(body, header) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(String(header || "").trim());
    if (!m || (m[1] === "" && m[2] === "")) return { start: 0, end: body.length - 1, partial: false };
    const size = body.length;
    let start, end;
    if (m[1] === "") { const n = Number(m[2]); start = Math.max(0, size - n); end = size - 1; }
    else { start = Number(m[1]); end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1); }
    if (!(start <= end) || start >= size) return null;
    return { start, end, partial: true };
  }
  // The shared live dashboard (realtime/dashboard/index.html) served from the
  // same origin so judges get one public URL for both. It reads Convex directly.
  const DASHBOARD_HTML = (() => {
    try { return readFileSync(join(REPO_ROOT, "realtime", "dashboard", "index.html")); } catch { return null; }
  })();

  const server = http.createServer(async (req, res) => {
    try {
      const u = new URL(req.url, `http://localhost:${PORT}`);
      const p = u.pathname;

      if (p === "/" || p === "/index.html") {
        // Website at the root; falls back to the arena UI if site/ is not bundled.
        const site = siteHtml();
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        return res.end(site || INDEX_HTML);
      }
      if (p === "/arena" || p === "/arena/" || p === "/arena/index.html") {
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        return res.end(INDEX_HTML);
      }
      if (p.startsWith("/assets/") && (req.method === "GET" || req.method === "HEAD")) {
        const a = siteAsset(p.slice("/assets/".length));
        if (!a) return json(res, 404, { error: "not found" });
        const r = req.headers.range ? sliceRange(a.body, req.headers.range) : { start: 0, end: a.body.length - 1, partial: false };
        if (!r) { res.writeHead(416, { "content-range": `bytes */${a.body.length}` }); return res.end(); }
        const headers = { "content-type": a.type, "cache-control": "public, max-age=86400", "accept-ranges": "bytes", "content-length": r.end - r.start + 1 };
        if (r.partial) headers["content-range"] = `bytes ${r.start}-${r.end}/${a.body.length}`;
        res.writeHead(r.partial ? 206 : 200, headers);
        return res.end(req.method === "HEAD" ? undefined : a.body.subarray(r.start, r.end + 1));
      }
      if (p === "/dashboard" || p === "/dashboard/") {
        if (!DASHBOARD_HTML) return json(res, 404, { error: "dashboard not bundled" });
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        return res.end(DASHBOARD_HTML);
      }
      if (p === "/health") {
        // keyLen + keyFp exist because "live: true" only means the variable is
        // non-empty, which is exactly how a truncated key hides: the service looks
        // healthy and every run dies on a 401 from the provider. The fingerprint is
        // the first 8 hex of sha256 over a 200+ char high-entropy secret, so it
        // identifies the value without revealing it, and can be compared against the
        // key you meant to deploy. Never log or return the key itself.
        return json(res, 200, {
          ok: true, live: !!NEBIUS_KEY, convex: !!CONVEX_URL, collector: !!COLLECTOR, drop: DROP_BASE,
          keyLen: NEBIUS_KEY.length,
          keyFp: NEBIUS_KEY ? createHash("sha256").update(NEBIUS_KEY).digest("hex").slice(0, 8) : null,
          day: limiter.day, dayCount: limiter.dayCount, fixtures: FIXTURE_LIST.length,
        });
      }

      if (p === "/api/config") {
        return json(res, 200, {
          models: Object.entries(MODELS).map(([k, v]) => ({ key: k, label: v.label })),
          liveEnabled: !!NEBIUS_KEY,
          rate: limiter.state(clientIp(req)),
          fixtures: FIXTURE_LIST,
          publicUrl: ARENA_PUBLIC_URL || null,
          dropBase: DROP_BASE,
          dashboard: DASHBOARD_HTML ? "/dashboard" : null,
          note: "Simulated Slack surface + simulated agent loop. Real detectors (imported from plugins/). Real Nebius victim model. Not dsh. LEAKED requires this server's /c/:id drop to receive and decode the canary.",
        });
      }

      // The attacker drop listener. Records the receipt the LEAKED verdict needs.
      const hit = p.match(DROP_PATH_RE);
      if (hit && req.method === "GET") {
        const rec = recordDrop(hit[1], req.url);
        return json(res, 200, { ok: true, received: true, canary: rec.canary, how: rec.how });
      }
      // Public verification: did the drop receive the canary for this run?
      const dq = p.match(/^\/api\/drop\/([A-Za-z0-9_.:-]+)$/);
      if (dq && req.method === "GET") {
        const rec = DROP_HITS.get(dq[1]);
        return json(res, 200, rec ? { runId: dq[1], received: true, ...rec } : { runId: dq[1], received: false });
      }

      if (p === "/api/replay" && req.method === "POST") {
        const body = await readBody(req).catch(() => "");
        let id = ""; try { id = JSON.parse(body || "{}").id || ""; } catch {}
        const fx = FIXTURES.find((f) => f.id === id) || FIXTURES[0];
        if (!fx) return json(res, 404, { error: "no fixtures recorded" });
        return json(res, 200, { replay: true, id: fx.id, label: fx.label, model: fx.model, guard: fx.guard, invariant: fx.invariant, outcome: fx.outcome, recorded: fx.recorded || null, steps: fx.transcript.steps, outcomeText: fx.transcript.outcomeText });
      }

      if (p === "/api/attack" && req.method === "POST") {
        if (!NEBIUS_KEY) return json(res, 503, { error: "Live runs unavailable (NEBIUS_API_KEY not set). Use Replay." });
        const ip = clientIp(req);
        const rc = limiter.check(ip);
        if (!rc.ok) return json(res, 429, { error: rc.reason, rate: limiter.state(ip) });

        let body; try { body = JSON.parse((await readBody(req)) || "{}"); } catch { return json(res, 400, { error: "bad json" }); }
        const modelKey = MODELS[body.model] ? body.model : "nemotron";
        const guard = !!body.guard;
        const invariant = !!body.invariant;

        limiter.commit(ip, rc.arr); // count the run before we spend the tokens
        let result;
        try {
          result = await runAttack({ modelKey, guard, invariant, apiKey: NEBIUS_KEY, dropUrl: DROP_BASE, fetchImpl, now });
        } catch (err) {
          limiter.persist(ip, { model: modelKey, guard, invariant, outcome: "ERROR", error: String(err?.message || err) });
          return json(res, 500, { error: String(err?.message || err) });
        }
        limiter.persist(ip, { model: modelKey, guard, invariant, outcome: result.outcome, transcriptId: result.transcriptId });
        broadcast(result); // fire-and-forget to the shared planes
        const drop = DROP_HITS.get(result.transcriptId) || null;
        return json(res, 200, {
          live: true, model: result.modelLabel, guard, invariant,
          outcome: result.outcome, outcomeText: result.outcomeText,
          steps: result.steps, transcriptId: result.transcriptId, rate: limiter.state(ip),
          drop: drop ? { received: true, canary: drop.canary, how: drop.how } : { received: false },
          verify: `/api/drop/${result.transcriptId}`,
          usage: result.usage,
        });
      }

      // Admin: reset in-memory counters (NOLEAK_SECRET-gated). Convenience only.
      if (p === "/api/admin/reset-limits" && req.method === "POST") {
        if (!secretOk(req.headers["x-noleak-secret"])) return json(res, 401, { error: "unauthorized" });
        limiter.reset();
        return json(res, 200, { ok: true, reset: true });
      }

      return json(res, 404, { error: "not found" });
    } catch (err) {
      return json(res, 500, { error: String(err?.message || err) });
    }
  });

  return {
    server, port: PORT, dropBase: DROP_BASE, limiter, dropHits: DROP_HITS,
    listen(port = PORT) { return new Promise((r) => server.listen(port, () => r(server.address()))); },
    close() { return new Promise((r) => server.close(() => r())); },
    describe() { return `arena on :${PORT}  live=${!!NEBIUS_KEY} convex=${!!CONVEX_URL} collector=${COLLECTOR || "(none)"} drop=${DROP_BASE} fixtures=${FIXTURE_LIST.length}`; },
  };
}

// Run directly (`node render/arena/server.mjs`); tests import createArenaServer instead.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const app = createArenaServer();
  app.listen().then(() => console.log(app.describe()));
}
