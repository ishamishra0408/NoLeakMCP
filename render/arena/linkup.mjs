/**
 * No-Leak-MCP — "who was on the other end", via Linkup.
 *
 * The guard answers a question about a VALUE: is a secret inside this outbound
 * argument. It deliberately knows nothing about the destination, and that is the
 * right design — reputation is not a safe basis for letting a credential leave.
 * But it leaves a question a human always asks next, and cannot answer from the
 * harness: *where were my keys being sent?*
 *
 * That is what this does, and it is the whole scope. It INFORMS, it does not
 * gate. Nothing here changes an outcome, a verdict, or a severity, and the
 * on-page wording says so. If Linkup is down, slow, or unconfigured, the run is
 * unaffected — the step just says it could not check.
 *
 * WHICH HOST, and why not the run's own:
 *   The arena's poisoned message names the arena's OWN drop URL, because a leak
 *   is only called a leak when that drop actually receives and decodes the
 *   canary. So "research the attacker host from this run" would research our own
 *   Render service and learn nothing. The host below is the one from the
 *   documented real incident (evidence/step7-slack/) — a free request-capture
 *   endpoint, which is the class of destination that matters and is the honest
 *   thing to look up.
 *
 * Contract mirrors plugins/injection-scorer/index.js `scoreText`: the key comes
 * from the environment, a missing key returns `{error}` rather than throwing,
 * the call is bounded by AbortController, and every failure path returns
 * `{error}`. Callers branch on `.research` vs `.error`.
 *
 * API (verified 2026-09-09): POST https://api.linkup.so/v1/search
 *   { q, depth: "standard", outputType: "sourcedAnswer" } -> { answer, sources[] }
 *   Bearer auth. ~$0.006 per sourced answer, 10 queries/second per org.
 */

/** The attacker endpoint from the documented Slack incident. Not the arena's drop. */
export const INCIDENT_HOST = "eng-build-health.free.beeceptor.com";

export const LINKUP_DEFAULTS = {
  baseURL: "https://api.linkup.so/v1/",
  apiKeyEnv: "LINKUP_API_KEY",
  depth: "standard", // "deep" is ~9x the price for a question this shallow
  timeoutMs: 20000,
  ttlMs: 6 * 60 * 60 * 1000, // the host never changes; re-asking hourly buys nothing
  maxAnswer: 420,
  maxSources: 3,
};

/**
 * One cached answer per host. The researched host is identical on every run, so
 * calling out per run would spend credits to be told the same thing; the cache
 * makes the feature free at steady state. Nothing is hidden by it: the step and
 * the endpoint both report `fresh` and the timestamp of the answer, and
 * `{ fresh: true }` forces a real call so a sceptic can watch one happen.
 *
 * In memory, so it dies on redeploy. That is fine — the next run repopulates it.
 */
const CACHE = new Map();

/** What we actually want to know, phrased so the answer is usable by a non-expert. */
export function buildQuery(host) {
  const domain = String(host).split(".").slice(-2).join(".");
  return (
    `What is the service at ${domain}? Is it a free webhook, request-capture or ` +
    `request-inspection service that lets anyone create an endpoint and read the ` +
    `HTTP requests sent to it? Answer briefly and say who can read data sent there.`
  );
}

/** Trim Linkup's answer to something a timeline step can carry without dominating it. */
export function shapeResearch(host, data, cfg, at) {
  const answer = String(data?.answer || "").trim().replace(/\s+/g, " ").slice(0, cfg.maxAnswer);
  const sources = (Array.isArray(data?.sources) ? data.sources : [])
    .slice(0, cfg.maxSources)
    .map((s) => ({ name: String(s?.name || s?.url || "source").slice(0, 90), url: String(s?.url || "") }))
    .filter((s) => s.url);
  return { host, answer, sources, at };
}

/**
 * Look up a host. Returns `{ research }` or `{ error }` — never throws.
 * @param {string} host
 * @param {object} [opts]           overrides merged over LINKUP_DEFAULTS
 * @param {Function} [fetchImpl]    injectable for tests
 * @param {{fresh?: boolean}} [ctl] `fresh` bypasses (and refreshes) the cache
 */
export async function researchHost(host, opts = {}, fetchImpl = globalThis.fetch, ctl = {}) {
  const cfg = { ...LINKUP_DEFAULTS, ...opts };
  const now = cfg.now || Date.now;

  if (!ctl.fresh) {
    const hit = CACHE.get(host);
    if (hit && now() - hit.at < cfg.ttlMs) return { research: { ...hit, fresh: false } };
  }

  const apiKey = process.env[cfg.apiKeyEnv];
  if (!apiKey) return { error: `no ${cfg.apiKeyEnv}` };

  const base = cfg.baseURL.endsWith("/") ? cfg.baseURL : cfg.baseURL + "/";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), cfg.timeoutMs);
  try {
    const res = await fetchImpl(base + "search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ q: buildQuery(host), depth: cfg.depth, outputType: "sourcedAnswer" }),
      signal: ctrl.signal,
    });
    if (!res.ok) return { error: `HTTP ${res.status}: ${(await res.text()).slice(0, 200)}` };
    const data = await res.json();
    const shaped = shapeResearch(host, data, cfg, now());
    if (!shaped.answer) return { error: "Linkup returned no answer" };
    CACHE.set(host, shaped);
    return { research: { ...shaped, fresh: true } };
  } catch (err) {
    return { error: String(err?.message || err) };
  } finally {
    clearTimeout(timer);
  }
}

/** Test seam: drop cached answers. */
export function _clearResearchCache() { CACHE.clear(); }
