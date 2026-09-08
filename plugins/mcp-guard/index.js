/**
 * No-Leak-MCP compose guard — a CANARY TRIPWIRE on the egress path.
 *
 * SCOPE (be honest — see architecture/no-leak-mcp/adrs-invariant): this is a
 * tripwire, NOT a general secret detector. It denies any tool call whose
 * arguments carry a TAGGED canary value (the decoy keyring) in raw, base64,
 * hex, base32, gzip/deflate/brotli, url-encoded, whitespace-broken, nested,
 * byte-array (incl. typed arrays), char-split, and object-key form. It does NOT detect an arbitrary UNTAGGED secret, and a single-shot
 * transform it doesn't decode, or a payload chunked across multiple calls,
 * can still slip past. The general, tagless defence is the exfiltration-chain
 * INVARIANT (provenance across a read-then-post window); this tripwire is the
 * cheap, deterministic complement that makes the demo's decoy un-exfiltratable.
 *
 * Hooks `tools/pre-execute`; returns {kind:'deny'}. Denials append to a JSONL
 * audit log. Runtime toggle: config `enabled:false` or env MCPGUARD_ENABLED.
 *
 * @module no-leak-mcp-guard
 */

import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { gunzipSync, inflateSync, inflateRawSync, brotliDecompressSync } from "node:zlib";

export const name = "mcp-guard";
export const inject = ["tools"];

const DEFAULTS = {
  enabled: true,
  tags: ["canary"],
  extraNeedles: [],
  minEncodedRun: 16,
  logPath: "",
  // Live control: when MCPGUARD_ENABLED is UNSET, the guard polls this URL for
  // {enabled} and follows it (flip it from the Convex dashboard). Fail-safe: any
  // error keeps the last known state, defaulting to ON. An explicit
  // MCPGUARD_ENABLED (0/1) overrides this and is static.
  controlUrl: "",
  controlPollMs: 2000,
};

// ---------------------------------------------------------------------------
// Detection core (pure, exported for the eval harness + tests)
// ---------------------------------------------------------------------------

export function buildNeedles(tags, extra) {
  const raw = [...(tags || []), ...(extra || [])].filter((s) => typeof s === "string" && s.length > 0);
  const rawLower = raw.map((s) => s.toLowerCase());
  const encoded = [];
  for (const n of raw) {
    const b = Buffer.from(n, "utf8");
    encoded.push({ how: "base64", marker: n, enc: b.toString("base64") });
    encoded.push({ how: "hex", marker: n, enc: b.toString("hex") });
  }
  return { raw, rawLower, encoded };
}

/** RFC4648 base32 decode (no deps). Returns a Buffer; tolerant of padding/case. */
function base32Decode(str) {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = str.replace(/=+$/g, "").toUpperCase();
  let bits = 0, val = 0; const out = [];
  for (const c of clean) {
    const idx = A.indexOf(c);
    if (idx < 0) continue;
    val = (val << 5) | idx; bits += 5;
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return Buffer.from(out);
}

// Bounds so a benign large blob can't stall the agent loop and a decompression
// bomb can't OOM/throw inside the synchronous pre-execute hook.
const MAX_DECODE_INPUT = 64 * 1024; // only decompress buffers up to this size
const MAX_DECOMP_OUT = 4 * 1024 * 1024; // decompressor output cap (bomb guard)
const MAX_SCAN_STRING = 512 * 1024; // skip decode-and-scan on strings larger than this
const MAX_RUNS = 64; // cap encoded runs scanned per view

/** Scan a decoded buffer for any raw needle; recurse through common wrappers (bomb-safe). */
function scanBuffer(buf, needles, depth = 0) {
  if (!buf || !buf.length || depth > 3) return null;
  // Raw substring first (cheap); toString of an enormous buffer can throw — guard it.
  let txt = "";
  try { txt = buf.toString("latin1").toLowerCase(); } catch { txt = ""; }
  for (let i = 0; i < needles.rawLower.length; i++) {
    if (txt && txt.includes(needles.rawLower[i])) return { how: "decoded", marker: needles.raw[i], sample: snippet(txt, needles.rawLower[i]) };
  }
  // Only attempt decompression on SMALL buffers, with an output cap (bomb-safe).
  if (buf.length <= MAX_DECODE_INPUT) {
    const opt = { maxOutputLength: MAX_DECOMP_OUT };
    const decomp = [
      ["gzip", () => (buf[0] === 0x1f && buf[1] === 0x8b ? gunzipSync(buf, opt) : null)],
      ["deflate", () => inflateSync(buf, opt)],
      ["deflate-raw", () => inflateRawSync(buf, opt)],
      ["brotli", () => brotliDecompressSync(buf, opt)],
    ];
    for (const [tag, fn] of decomp) {
      let un = null; try { un = fn(); } catch { un = null; }
      if (un && un.length && !un.equals(buf)) {
        const hit = scanBuffer(un, needles, depth + 1);
        if (hit) return { ...hit, how: tag + "-" + hit.how };
      }
    }
    // Nested encoding: the decoded bytes are themselves an encoded run (base64(base64(x))).
    // Use ORIGINAL case here — base64/base32 decoding is case-sensitive.
    if (depth < 2) {
      let raw = ""; try { raw = buf.toString("latin1"); } catch { raw = ""; }
      if (raw && /^[\sA-Za-z0-9+/=_-]+$/.test(raw) && raw.replace(/\s/g, "").length >= 16) {
        const hit = scanString(raw, needles, 16, depth + 1);
        if (hit) return { how: "nested-" + hit.how, marker: hit.marker, sample: hit.sample };
      }
    }
  }
  return null;
}

export function scanString(s, needles, minRun, depth = 0) {
  if (typeof s !== "string" || s.length === 0 || depth > 3) return null;

  // Views: original, percent-decoded, and whitespace-stripped (breaks split base64).
  const views = new Set([s]);
  try { const dec = decodeURIComponent(s.replace(/\+/g, "%20")); if (dec !== s) views.add(dec); } catch {}
  const stripped = s.replace(/\s+/g, ""); if (stripped !== s) views.add(stripped);

  for (const view of views) {
    const lower = view.toLowerCase();

    // 1. Raw tag verbatim.
    for (let i = 0; i < needles.rawLower.length; i++) {
      if (lower.includes(needles.rawLower[i])) return { how: "raw", marker: needles.raw[i], sample: snippet(view, needles.rawLower[i]) };
    }
    // 2. Aligned base64/hex of a tag verbatim.
    for (const e of needles.encoded) {
      const hay = e.how === "hex" ? lower : view;
      const ndl = e.how === "hex" ? e.enc.toLowerCase() : e.enc;
      if (ndl.length >= 4 && hay.includes(ndl)) return { how: e.how, marker: e.marker, sample: snippet(hay, ndl) };
    }
    // 3. Decode-and-scan long runs: base64 (+gzip), hex, base32.
    //    Skipped for very large views (raw + aligned-needle already cover verbatim
    //    secrets); run count is capped so a big blob can't fragment into thousands
    //    of base32 runs and stall the synchronous hook.
    if (view.length > MAX_SCAN_STRING) continue;
    let runs = 0;
    for (const run of view.match(new RegExp(`[A-Za-z0-9+/]{${minRun},}={0,2}`, "g")) || []) {
      if (++runs > MAX_RUNS) break;
      let buf; try { buf = Buffer.from(run, "base64"); } catch { buf = null; }
      const hit = buf && scanBuffer(buf, needles);
      if (hit) return { how: hit.how === "decoded" ? "base64-decoded" : hit.how, marker: hit.marker, sample: hit.sample };
    }
    for (const run of view.match(new RegExp(`[0-9a-fA-F]{${minRun},}`, "g")) || []) {
      if (++runs > MAX_RUNS) break;
      if (run.length % 2) continue;
      let buf; try { buf = Buffer.from(run, "hex"); } catch { buf = null; }
      const hit = buf && scanBuffer(buf, needles);
      if (hit) return { how: hit.how === "decoded" ? "hex-decoded" : hit.how, marker: hit.marker, sample: hit.sample };
    }
    for (const run of view.match(new RegExp(`[A-Za-z2-7]{${minRun},}={0,}`, "g")) || []) {
      if (++runs > MAX_RUNS) break;
      const buf = base32Decode(run);
      const hit = buf && scanBuffer(buf, needles);
      if (hit) return { how: hit.how === "decoded" ? "base32-decoded" : hit.how, marker: hit.marker, sample: hit.sample };
    }
  }
  return null;
}

function snippet(hay, needle) {
  const at = hay.indexOf(needle);
  const start = Math.max(0, at - 12), end = Math.min(hay.length, at + needle.length + 12);
  return (start > 0 ? "…" : "") + hay.slice(start, end).replace(/\s+/g, " ") + (end < hay.length ? "…" : "");
}

/** True if arr is a byte array (all ints 0..255). */
function asByteBuffer(arr) {
  if (ArrayBuffer.isView(arr) && arr.length >= 8) return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
  if (!Array.isArray(arr) || arr.length < 8) return null;
  if (!arr.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) return null;
  return Buffer.from(arr);
}
/** Join an array of 1-char strings (char-split evasion). */
function asCharJoin(arr) {
  if (!Array.isArray(arr) || arr.length < 4) return null;
  if (!arr.every((c) => typeof c === "string" && c.length <= 8)) return null;
  const joined = arr.join("");
  return joined.length >= 8 ? joined : null;
}

export function scanArguments(args, opts = {}) {
  const cfg = { ...DEFAULTS, ...opts };
  const needles = buildNeedles(cfg.tags, cfg.extraNeedles);
  const stack = [{ v: args, p: "$" }];
  while (stack.length) {
    const { v, p } = stack.pop();
    if (typeof v === "string") {
      const hit = scanString(v, needles, cfg.minEncodedRun);
      if (hit) return { ...hit, path: p };
    } else if (Array.isArray(v) || ArrayBuffer.isView(v)) {
      // byte-array / char-split evasion: reconstruct and scan the whole array.
      const bb = asByteBuffer(v);
      if (bb) { const h = scanBuffer(bb, needles); if (h) return { how: "byte-array", marker: h.marker, sample: h.sample, path: p }; }
      if (Array.isArray(v)) {
        const cj = asCharJoin(v);
        if (cj) { const h = scanString(cj, needles, cfg.minEncodedRun); if (h) return { ...h, how: "char-split-" + h.how, path: p }; }
        for (let i = 0; i < v.length; i++) stack.push({ v: v[i], p: `${p}[${i}]` });
      }
    } else if (v && typeof v === "object") {
      for (const k of Object.keys(v)) {
        const hk = scanString(k, needles, cfg.minEncodedRun); // secret hidden in a KEY
        if (hk) return { ...hk, how: "key-" + hk.how, path: `${p}.<key>` };
        stack.push({ v: v[k], p: `${p}.${k}` });
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Plugin lifecycle
// ---------------------------------------------------------------------------

export async function apply(ctx, config) {
  const cfg = { ...DEFAULTS, ...(config || {}) };
  const logger = ctx.logger?.("mcp-guard");

  const envToggle = (process.env.MCPGUARD_ENABLED ?? "").trim().toLowerCase();
  const envSet = envToggle !== "";
  // Static OFF: explicit env off, or config disabled.
  if (cfg.enabled === false || ["0", "false", "off", "no"].includes(envToggle)) {
    logger?.warn?.("DISABLED — tool-call args are NOT scanned");
    return;
  }
  logger?.info?.("armed (canary tripwire) — tags [%s]; raw+base64+hex+base32+gzip/deflate/brotli+url+nested+byte/char-array+keys", cfg.tags.join(", "));

  // Live control (only when env is UNSET): poll the control URL in the background;
  // the listener reads `dynamicEnabled` synchronously. Fail-safe: default ON, and
  // a fetch error keeps the last known value.
  let dynamicEnabled = true;
  if (!envSet && cfg.controlUrl) {
    const poll = async () => {
      try {
        const res = await fetch(cfg.controlUrl, { signal: AbortSignal.timeout(1500) });
        if (res.ok) { const j = await res.json(); if (typeof j.enabled === "boolean") dynamicEnabled = j.enabled; }
      } catch { /* keep last known (fail-safe) */ }
    };
    poll();
    const timer = setInterval(poll, Math.max(500, cfg.controlPollMs));
    timer.unref?.();
    ctx.on?.("dispose", () => clearInterval(timer));
    logger?.info?.("live control: polling %s every %dms (fail-safe ON)", cfg.controlUrl, cfg.controlPollMs);
  }

  async function audit(entry) {
    if (!cfg.logPath) return;
    try { await mkdir(dirname(cfg.logPath), { recursive: true }); await appendFile(cfg.logPath, JSON.stringify(entry) + "\n"); }
    catch (err) { logger?.warn?.("audit write failed: %s", err?.message || err); }
  }

  ctx.on("tools/pre-execute", async (exec, next) => {
    if (!envSet && !dynamicEnabled) return next(); // live-disabled via the control plane
    const hit = scanArguments(exec.arguments, cfg);
    if (hit) {
      logger?.warn?.("DENY %s — canary via %s at %s (%s)", exec.name, hit.how, hit.path, hit.sample);
      await audit({ ts: new Date().toISOString(), event: "guard/deny", tool: exec.name, how: hit.how, marker: hit.marker, path: hit.path, sample: hit.sample, agent: exec.agent?.id ?? null, callId: exec.callId ?? null });
      return { kind: "deny", reason: `No-Leak-MCP guard blocked '${exec.name}': argument ${hit.path} carries a credential canary (${hit.how}). This request was not sent.` };
    }
    return next();
  });
}
