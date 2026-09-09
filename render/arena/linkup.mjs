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
 * WHAT IS LOOKED UP, and why it is neither the run's host nor the attacker's:
 *   The arena's poisoned message names the arena's OWN drop, because a leak only
 *   counts when that drop receives and decodes the canary — so researching "the
 *   attacker host from this run" would research our own Render service. And the
 *   real attacker endpoint is elided everywhere in this project on purpose, so
 *   republishing it here to make a sentence read better would have the repo
 *   redacting a string in one file and printing it in another. What is looked up
 *   is the SERVICE, which is public, documented, and the thing a reader actually
 *   needs to understand. See RESEARCH_SUBJECT below.
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

/**
 * WHAT IS LOOKED UP, and why it is not the endpoint itself.
 *
 * The attacker's actual endpoint is deliberately painted out everywhere in this
 * project — `evidence/step7-slack/README.md` records the redaction and a test
 * asserts the site still shows `<attacker-host>` in its place. Naming it here to
 * make a research line read better would have this repo redacting a string in one
 * file and publishing it in another, which is the kind of contradiction a judge
 * finds with one grep, on a project whose whole argument is that it does not
 * overstate.
 *
 * It also would not work. A free `*.free.beeceptor.com` subdomain has no web
 * presence — that is the point of the service — so a search for it returns
 * nothing. What a reader needs to know is not which endpoint it was, it is what
 * KIND of thing it was, and that is a documented, searchable service.
 */
export const RESEARCH_SUBJECT = "beeceptor.com";

/** How the endpoint is referred to in prose, matching the site's own elision. */
export const ATTACKER_HOST_LABEL = "<attacker-host>";

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
export function buildQuery(subject) {
  return (
    `What is ${subject}, and what happens to an HTTP request sent to a free ` +
    `endpoint on it? In plain language: who can read the request and its contents, ` +
    `how quickly can anyone claim such an endpoint, and does that require proving ` +
    `ownership? Answer briefly.`
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
