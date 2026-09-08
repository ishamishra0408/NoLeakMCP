/**
 * No-Leak-MCP chain invariant — the tagless, provenance egress control.
 *
 * The guard (mcp-guard) is a TAG tripwire: it only catches a value it already
 * knows (the "canary" decoy). This invariant needs no tag. It watches the
 * exfiltration CHAIN: a secret-shaped value that came OUT of an earlier tool
 * RESULT (a read) reappearing in a later tool-call ARGUMENT (an outbound URL/
 * post) — with no human approval between. No single call is anomalous; only the
 * pair is. It catches a REAL, untagged secret the tripwire would miss.
 *
 * How it works (adrs-invariant):
 *   - `tools/result`  → harvest secret-shaped tokens from what the tool returned
 *                       (file contents, message bodies, …) into a bounded set.
 *   - `tools/pre-execute` → if an outbound argument carries any harvested value
 *                       (raw or base64/hex/… — it reuses the guard's decoder),
 *                       DENY at assembly, before the request leaves.
 *
 * SCOPE / honesty: this is a per-session reappearance heuristic. It matches on
 * value identity through common encodings; a value transformed by something it
 * cannot decode still slips, and "no approval between" is not yet modelled
 * (any read→post reappearance is treated as a leak). The window is polled here;
 * pushing it (adrs-windows) is the timeliness upgrade.
 *
 * Runtime toggle mirrors the guard: env CHAIN_INVARIANT_ENABLED, or a control
 * URL it polls (fail-safe: default OFF — this is opt-in, proposed control).
 *
 * @module no-leak-mcp-chain-invariant
 */

import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { scanArguments } from "../mcp-guard/index.js"; // reuse the decode-aware matcher

export const name = "chain-invariant";
export const inject = ["tools"];

const DEFAULTS = {
  enabled: false, // opt-in (proposed control); flip via env or control URL
  minTokenLen: 10, // ignore short/common tokens to avoid false positives
  maxTracked: 300, // bound the harvested-value set
  logPath: "",
  controlUrl: "",
  controlPollMs: 2000,
};

// ---------------------------------------------------------------------------
// Pure helpers (exported for tests)
// ---------------------------------------------------------------------------

/** Concatenate text from a list of content blocks (tool-result shape). */
export function textFromBlocks(blocks) {
  if (!Array.isArray(blocks)) return "";
  return blocks.filter((b) => b && b.type === "text" && typeof b.text === "string").map((b) => b.text).join("\n");
}

/**
 * Harvest SECRET-SHAPED tokens from text: values on the right of `KEY=VALUE`,
 * and long mixed-alphanumeric runs. Deliberately narrow — arbitrary English is
 * not tracked, so a public id the agent legitimately echoes won't trip it.
 */
export function harvestTokens(text, minLen = DEFAULTS.minTokenLen) {
  const out = new Set();
  if (typeof text !== "string" || !text) return out;
  for (const m of text.matchAll(/[A-Za-z0-9_.\-]+=([^\s"'`]+)/g)) {
    const v = m[1];
    if (v.length >= minLen) out.add(v);
  }
  for (const m of text.matchAll(/[A-Za-z0-9_\-+/=.]{12,}/g)) {
    const t = m[0];
    if (t.length >= minLen && /[A-Za-z]/.test(t) && /[0-9]/.test(t)) out.add(t);
  }
  return out;
}

/** Does an outbound argument object carry any of the tracked read-values? */
export function matchOutbound(args, readValues, minEncodedRun = 12) {
  if (!readValues || readValues.size === 0) return null;
  return scanArguments(args, { tags: [], extraNeedles: [...readValues], minEncodedRun });
}

// ---------------------------------------------------------------------------
// Plugin lifecycle
// ---------------------------------------------------------------------------

export async function apply(ctx, config) {
  const cfg = { ...DEFAULTS, ...(config || {}) };
  const logger = ctx.logger?.("chain-invariant");

  // Toggle: explicit env wins; else follow the control URL (fail-safe OFF).
  const envToggle = (process.env.CHAIN_INVARIANT_ENABLED ?? "").trim().toLowerCase();
  const envSet = envToggle !== "";
  const envOn = ["1", "true", "on", "yes"].includes(envToggle);
  if (envSet && !envOn) { logger?.warn?.("DISABLED (env) — chain not checked"); return; }

  // envSet here implies env is ON (we returned above otherwise). Else follow config/control.
  let dynamicEnabled = envSet ? true : (cfg.enabled === true);
  if (!envSet && cfg.controlUrl) {
    const poll = async () => {
      try {
        const res = await fetch(cfg.controlUrl, { signal: AbortSignal.timeout(1500) });
        if (res.ok) { const j = await res.json(); if (typeof j.enabled === "boolean") dynamicEnabled = j.enabled; }
      } catch { /* keep last known */ }
    };
    poll();
    const timer = setInterval(poll, Math.max(500, cfg.controlPollMs));
    timer.unref?.();
    ctx.on?.("dispose", () => clearInterval(timer));
    logger?.info?.("live control: polling %s every %dms (fail-safe OFF)", cfg.controlUrl, cfg.controlPollMs);
  }
  logger?.info?.("armed (provenance) — harvests read-values (min %d chars), blocks their reappearance in outbound args", cfg.minTokenLen);

  // Session-scoped provenance memory: values that came out of tool results.
  const readValues = new Set();
  const remember = (text) => {
    for (const t of harvestTokens(text, cfg.minTokenLen)) {
      readValues.add(t);
      if (readValues.size > cfg.maxTracked) readValues.delete(readValues.values().next().value);
    }
  };

  async function audit(entry) {
    if (!cfg.logPath) return;
    try { await mkdir(dirname(cfg.logPath), { recursive: true }); await appendFile(cfg.logPath, JSON.stringify(entry) + "\n"); }
    catch (err) { logger?.warn?.("audit write failed: %s", err?.message || err); }
  }

  // Harvest: every tool RESULT feeds the provenance set (emit-mode, contained).
  ctx.on("tools/result", (exec, result) => {
    try {
      if (!dynamicEnabled) return;
      // A tool result's model-facing content is result.content (ContentBlock[]).
      const text = textFromBlocks(result?.content);
      if (text) remember(text);
    } catch (err) { logger?.warn?.("harvest error: %s", err?.message || err); }
  });

  // Enforce: an outbound argument carrying a harvested read-value is the exfil pair.
  ctx.on("tools/pre-execute", async (exec, next) => {
    if (!dynamicEnabled) return next();
    const hit = matchOutbound(exec.arguments, readValues);
    if (hit) {
      logger?.warn?.("DENY %s — a value from an earlier read is leaving at %s (%s)", exec.name, hit.path, hit.how);
      await audit({ ts: new Date().toISOString(), event: "invariant/deny", tool: exec.name, how: hit.how, path: hit.path, sample: hit.sample, agent: exec.agent?.id ?? null, callId: exec.callId ?? null });
      return {
        kind: "deny",
        reason: `No-Leak-MCP chain invariant blocked '${exec.name}': argument ${hit.path} carries a value that came from an earlier tool result (${hit.how}) — a secret is leaving with no human approval in the window. This request was not sent.`,
      };
    }
    return next();
  });
}
