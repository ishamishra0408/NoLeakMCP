/**
 * Arena live-run rate limiter (owner decision): per-IP N / window, global M / day.
 * In-memory; optionally persisted to `<dataDir>/arena-runs.jsonl` so a restart
 * keeps the day's global count. Replay never touches this — it makes no Nebius call.
 *
 * Pure-ish factory so tests can inject the clock.
 */

import { readFileSync, existsSync, mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";

export function createRateLimiter({
  perIpMax = 6,
  windowMs = 10 * 60 * 1000,
  globalDayMax = 200,
  now = Date.now,
  dataDir = "",
} = {}) {
  const ipHits = new Map(); // ip -> [ts,...]
  const today = () => new Date(now()).toISOString().slice(0, 10);
  let dayStamp = today();
  let dayCount = 0;

  if (dataDir) {
    try { mkdirSync(dataDir, { recursive: true }); } catch {}
    // Rebuild today's global counter from the persisted log so a restart doesn't reset the cap.
    try {
      const f = join(dataDir, "arena-runs.jsonl");
      if (existsSync(f)) for (const l of readFileSync(f, "utf8").split("\n")) {
        const s = l.trim(); if (!s) continue;
        try { const o = JSON.parse(s); if (o.day === dayStamp) dayCount++; } catch {}
      }
    } catch {}
  }

  function rollDay() { const t = today(); if (t !== dayStamp) { dayStamp = t; dayCount = 0; } }
  function recent(ip) { const t = now(); return (ipHits.get(ip) || []).filter((x) => t - x < windowMs); }

  /** Can this IP start a live run now? Does NOT consume a slot (see commit). */
  function check(ip) {
    rollDay();
    if (dayCount >= globalDayMax) return { ok: false, reason: `Global live-run cap reached (${globalDayMax}/day). Use Replay — it plays instantly.` };
    const arr = recent(ip);
    if (arr.length >= perIpMax) {
      const wait = Math.ceil((windowMs - (now() - arr[0])) / 60000);
      return { ok: false, reason: `Per-IP limit reached (${perIpMax} live runs / ${Math.round(windowMs / 60000)} min). Try again in ~${wait} min, or use Replay.` };
    }
    return { ok: true, arr };
  }
  /** Consume one slot (call right after a successful check, before spending tokens). */
  function commit(ip, arr) { arr = arr || recent(ip); arr.push(now()); ipHits.set(ip, arr); dayCount++; if (ipHits.size > 5000) ipHits.delete(ipHits.keys().next().value); }
  function state(ip) { rollDay(); return { perIpUsed: recent(ip).length, perIpMax, globalUsed: dayCount, globalMax: globalDayMax }; }
  function reset() { ipHits.clear(); dayCount = 0; }
  function persist(ip, meta) {
    if (!dataDir) return;
    try { appendFileSync(join(dataDir, "arena-runs.jsonl"), JSON.stringify({ ts: now(), day: dayStamp, ip, ...meta }) + "\n"); } catch {}
  }
  return { check, commit, state, reset, persist, get day() { rollDay(); return dayStamp; }, get dayCount() { rollDay(); return dayCount; } };
}
