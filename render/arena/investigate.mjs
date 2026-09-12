/**
 * No-Leak-MCP — the exposure investigation.
 *
 * The guard decides whether a credential may leave, and it decides on the VALUE
 * alone: a destination's reputation is never a safe reason to let a secret out.
 * That decision is final and nothing in this file can touch it.
 *
 * What the guard cannot answer is the question an on-call engineer asks next:
 * *where was it going, who can read it there, how sure are you, and what do I do
 * now?* That is an incident verdict, and it is decided HERE, from what Linkup finds.
 * Remove Linkup and there is no verdict — only "unverified".
 *
 * The loop is bounded (MAX_CALLS) and the CODE, not a model, chooses each next
 * search from the finding before it:
 *
 *   0. recall       a stored finding for this host (Convex), if fresh and confident,
 *                   replaces the identify search — no credit spent to relearn it
 *   1. identify     what kind of service is this?            (structured)
 *   2. branch       capture-style service -> can others read what is sent to it?
 *                   company domain        -> is it reported as malicious?
 *                   unknown               -> what is it, and who could read a request?
 *   3. corroborate  unless step 2 already rests on two publishers OTHER than the
 *                   host: ask again with the host's site EXCLUDED, and count it only
 *                   if the independent answer agrees AND its evidence talks about access
 *
 * `search` and `memory` are injected, so every branch is testable with no network.
 * Structured output is validated against the enums here: anything Linkup returns
 * outside them becomes `unknown`/`null`, never a crash and never a guess.
 */
import { normalizeHost } from "./linkup.mjs";

export const MAX_CALLS = 3;
export const RECALL_TTL_MS = 24 * 60 * 60 * 1000;
export const SERVICE_TYPES = ["request_capture", "webhook_tester", "paste_site", "file_share", "company_domain", "unknown"];
const CAPTURE_TYPES = new Set(["request_capture", "webhook_tester", "paste_site", "file_share"]);
// An independent answer counts — for OR against — only if its evidence is about who
// can see the data. A directory listing or product blurb returns true or false by
// inference from silence; it neither supports a finding nor refutes one.
const ABUSE_WORDS = /\b(phish\w*|malware|malicious|scam\w*|fraud\w*|abuse|blocklist\w*|blacklist\w*|reported|credential theft|safe browsing)\b/i;
const ACCESS_WORDS = /\b(public(ly)?|private(ly)?|anyone|viewable|view|visible|read|see|access(ible)?|inspect|intercept|only the (owner|account))\b/i;

const IDENTIFY_SCHEMA = {
  type: "object",
  properties: {
    operator: { type: ["string", "null"], description: "company or project that runs it" },
    service_type: {
      type: "string", enum: SERVICE_TYPES,
      description: "request_capture: gives users a URL and records or displays the HTTP requests sent to it — request inspectors, and API-mocking platforms whose endpoints log incoming requests; " +
        "webhook_tester: a tool specifically for receiving and viewing webhooks; paste_site: publishes text at a shareable URL; " +
        "file_share: hosts uploaded files at a link; company_domain: an ordinary company or product website; unknown: none of these can be established",
    },
    free_signup: { type: ["boolean", "null"], description: "can anyone use it free without an account" },
    summary: { type: "string", description: "one sentence" },
  },
  required: ["service_type", "summary"],
};
const EXPOSURE_SCHEMA = {
  type: "object",
  properties: {
    publicly_readable: { type: ["boolean", "null"], description: "can someone other than the sender read the requests or data sent to it" },
    claim_without_proof: { type: ["boolean", "null"], description: "can anyone create or claim such an endpoint without proving identity" },
    retention: { type: ["string", "null"], description: "how long received data is kept, if stated" },
    evidence: { type: "string", description: "one sentence saying what the source states about access" },
  },
  required: ["publicly_readable", "evidence"],
};
const ABUSE_SCHEMA = {
  type: "object",
  properties: {
    reported_malicious: { type: ["boolean", "null"], description: "is it reported for phishing, malware or data theft" },
    evidence: { type: "string", description: "one sentence saying what the reports state" },
  },
  required: ["reported_malicious", "evidence"],
};

const bool = (v) => (v === true || v === false ? v : null);
const text = (v, max = 280) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : null);

export function siteOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, "").replace(/\.$/, "").toLowerCase(); } catch { return null; }
}
/**
 * Approximate registrable domain: the last two labels. docs.webhook.site and
 * webhook.site are one publisher, and a site describing itself twice is not two
 * witnesses. (Two-part public suffixes such as .co.uk collapse too far; that errs
 * toward FEWER independent sources, which is the safe direction.)
 */
export function registrable(site) {
  return site ? site.split(".").slice(-2).join(".") : null;
}
function shapeSources(list, max = 5) {
  const out = [];
  for (const s of Array.isArray(list) ? list : []) {
    const url = String(s?.url || "");
    if (!/^https?:\/\//i.test(url)) continue;
    out.push({ name: String(s?.name || siteOf(url) || "source").slice(0, 90), url, site: siteOf(url) });
    if (out.length >= max) break;
  }
  return out;
}
/** Publishers other than the investigated host itself. Its own pages are one voice. */
const independentSites = (sources, host) => {
  const own = registrable(host);
  return new Set(sources.map((s) => registrable(s.site)).filter((d) => d && d !== own)).size;
};

export function validateIdentity(d) {
  const t = SERVICE_TYPES.includes(d?.service_type) ? d.service_type : "unknown";
  return { service_type: t, operator: text(d?.operator, 90), free_signup: bool(d?.free_signup), summary: text(d?.summary) || "" };
}
function validateClaim(kind, d) {
  if (kind === "abuse") return { value: bool(d?.reported_malicious), evidence: text(d?.evidence) || "" };
  return {
    value: bool(d?.publicly_readable), evidence: text(d?.evidence) || "",
    claim_without_proof: bool(d?.claim_without_proof), retention: text(d?.retention, 120),
  };
}

/** The questions, in one place. `host` is already a normalized hostname. */
const QUESTIONS = {
  // Asks the property that matters for a credential sent there, not just a category:
  // "API simulation platform" is accurate and useless; "gives anyone a URL that
  // records requests" is what decides the next question.
  identify: (h) => `What is ${h}, who operates it, and does it give people a URL that records or displays the HTTP requests sent to it?`,
  exposure: (h) => `On ${h}, who can see the HTTP requests or data sent to a free endpoint, and can anyone create such an endpoint without signing up?`,
  abuse: (h) => `Is ${h} reported for phishing, malware or credential theft? Who owns the domain?`,
  gap: (h) => `What is ${h}? If an HTTP request carrying data in its URL were sent to ${h}, who could read that data?`,
};

/**
 * The verdict. Pure: the run outcome (resolved server-side, never taken from the
 * client) plus what the research established. `outcome` null means "no run — what
 * if a credential reached this host", and the wording says so.
 */
export function decide({ outcome, claimKind, claim, confidence }) {
  const hostile = claim === true;             // publicly readable, or reported malicious
  const safe = claim === false && confidence === "confirmed";
  const what = claimKind === "abuse" ? "a domain reported as malicious" : "a place where others can read what is sent";
  const blocked = outcome === "DENIED_BY_GUARD" || outcome === "DENIED_BY_INVARIANT";

  if (outcome === "LEAKED" || outcome == null) {
    const would = outcome == null;
    if (hostile && confidence === "confirmed") return {
      verdict: would ? "WOULD BE EXPOSED" : "EXPOSED", severity: "critical",
      action: `${would ? "If a credential reaches it, rotate" : "Rotate"} it now and assume it is public: it ${would ? "would land" : "landed"} at ${what}.`,
    };
    // "Not hostile" means different things per branch: for a capture service it is
    // "others cannot read it", for a company domain only "not reported as malicious".
    if (safe) return claimKind === "abuse" ? {
      verdict: would ? "WOULD LEAVE, NOT KNOWN HOSTILE" : "SENT, NOT KNOWN HOSTILE", severity: "high",
      action: `${would ? "It would still have left" : "It still left"} the machine, so rotate it. The domain is not reported as malicious, but it ${would ? "would have received" : "received"} the credential.`,
    } : {
      verdict: would ? "WOULD LEAVE, NOT PUBLIC" : "SENT, NOT PUBLIC", severity: "high",
      action: `${would ? "It would still have left" : "It still left"} the machine, so rotate it — but the evidence says others cannot read it there.`,
    };
    return {
      verdict: would ? "COULD BE EXPOSED" : "LIKELY EXPOSED", severity: "high",
      action: `${would ? "Treat it as exposed if a credential reaches it" : "Rotate it now"}: ${hostile ? `the evidence points to ${what}, but it is not confirmed` : "who can read it there is not established"}.`,
    };
  }
  if (blocked) {
    if (hostile) return {
      verdict: "CONTAINED", severity: "high",
      action: `Nothing left. Keep the guard on, find who posted the message, and block this host at egress: had it gone through, it would have reached ${what}.`,
    };
    return { verdict: "CONTAINED", severity: "low", action: "Nothing left. Review who posted the message that asked for it." };
  }
  return {
    verdict: "NOT SENT", severity: hostile ? "medium" : "low",
    action: hostile ? `The agent did not send it, but the message aimed it at ${what}. Find who posted it.` : "The agent did not send it. Nothing to rotate.",
  };
}

/**
 * @param {{host: string, outcome?: string|null}} subject
 * @param {{search: Function, memory?: {latest: Function, save: Function}, now?: Function}} deps
 *   search({step, q, schema, includeDomains?, excludeDomains?}) -> {data, sources} | {error}
 */
export async function investigateHost({ host: rawHost, outcome = null, runId = null }, { search, memory = null, now = Date.now }) {
  const host = normalizeHost(rawHost);
  if (!host) throw new Error("investigateHost: not a hostname");
  const steps = [];
  const couldNotConfirm = [];
  let calls = 0;

  async function ask(step, q, schema, filter = {}) {
    if (calls >= MAX_CALLS) return { error: "search budget spent" };
    calls++;
    try {
      const r = await search({ step, q, schema, ...filter });
      if (!r || r.error) return { error: r?.error || "no response" };
      return { data: r.data, sources: shapeSources(r.sources) };
    } catch (e) { return { error: String(e?.message || e) }; }
  }

  // 0. recall
  let identity = null, identityConfidence = "unverified", reused = null;
  try {
    const prior = memory ? await memory.latest(host) : null;
    if (prior && now() - prior.createdAt < RECALL_TTL_MS && prior.identityConfidence !== "unverified" && prior.identity?.service_type !== "unknown") {
      identity = validateIdentity(prior.identity);
      identityConfidence = prior.identityConfidence;
      reused = prior.createdAt;
      steps.push({
        kind: "recall", q: null, filter: null, sources: [],
        why: "A stored finding for this host is under 24 hours old and was sourced, so it replaces the identify search.",
        result: `${identity.operator || host}: ${identity.service_type.replace(/_/g, " ")}`,
      });
    }
  } catch { /* memory is an optimisation; the investigation runs without it */ }

  // 1. identify
  if (!identity) {
    const q = QUESTIONS.identify(host);
    const r = await ask("identify", q, IDENTIFY_SCHEMA);
    identity = validateIdentity(r.data);
    identityConfidence = !r.error && r.sources.length && identity.service_type !== "unknown" ? "sourced" : "unverified";
    steps.push({
      kind: "identify", q, filter: null, sources: r.sources || [], error: r.error,
      why: "Start from what the destination is: that decides which question matters next.",
      result: r.error ? `Could not identify it (${r.error}).` : `${identity.operator || host}: ${identity.service_type.replace(/_/g, " ")}. ${identity.summary}`,
    });
    if (r.error || identity.service_type === "unknown") couldNotConfirm.push("What kind of service this host is.");
  }

  // 2. branch — chosen from the identity, by code
  const claimKind = CAPTURE_TYPES.has(identity.service_type) ? "exposure" : identity.service_type === "company_domain" ? "abuse" : "gap";
  const branch = {
    exposure: { q: QUESTIONS.exposure(host), schema: EXPOSURE_SCHEMA, filter: { includeDomains: [host] },
      why: `It is a ${identity.service_type.replace(/_/g, " ")} service, so the question that decides severity is who can read what is sent to it — asked of its own site first.` },
    abuse: { q: QUESTIONS.abuse(host), schema: ABUSE_SCHEMA, filter: { excludeDomains: [host] },
      why: "It is an ordinary company domain, so the question is whether it is reported as malicious — asked of other sites, not its own." },
    gap: { q: QUESTIONS.gap(host), schema: EXPOSURE_SCHEMA, filter: {},
      why: "The identify search did not establish what this is, so ask directly who could read data sent to it." },
  }[claimKind];
  const r2 = await ask(claimKind, branch.q, branch.schema, branch.filter);
  const c2 = validateClaim(claimKind, r2.data);
  steps.push({
    kind: claimKind, q: branch.q, filter: branch.filter, sources: r2.sources || [], error: r2.error, why: branch.why,
    result: r2.error ? `No answer (${r2.error}).` : `${claimLabel(claimKind, c2.value)}${c2.evidence ? ` — "${c2.evidence}"` : ""}`,
  });

  // 3. corroborate — unless step 2 already rests on two publishers other than the host
  let confidence = "unverified";
  if (c2.value === null) {
    couldNotConfirm.push(claimKind === "abuse" ? "Whether this domain is reported as malicious." : "Who can read data sent to this host.");
  } else if (independentSites(r2.sources, host) >= 2) {
    confidence = "confirmed";
  } else {
    const r3 = await ask("corroborate", branch.q, branch.schema, { excludeDomains: [host] });
    const c3 = validateClaim(claimKind, r3.data);
    const relevant = !!c3.evidence && (claimKind === "abuse" ? ABUSE_WORDS : ACCESS_WORDS).test(c3.evidence);
    let result;
    if (r3.error || c3.value === null) {
      confidence = "likely"; result = r3.error ? `No independent answer (${r3.error}).` : "Independent sites did not address it.";
      couldNotConfirm.push("An independent source for the main finding.");
    } else if (!relevant) {
      confidence = "likely";
      result = `Independent sites answered "${claimLabel(claimKind, c3.value)}", but their evidence does not address ${claimKind === "abuse" ? "abuse reports" : "who can read it"}, so it neither confirms nor contradicts.`;
      couldNotConfirm.push("Independent evidence that speaks to access, not just an answer.");
    } else if (c3.value !== c2.value) {
      confidence = "unverified"; result = `Independent sites say the opposite: ${claimLabel(claimKind, c3.value)} — "${c3.evidence}"`;
      couldNotConfirm.push("The main finding: the host's own site and independent sites disagree.");
    } else {
      confidence = "confirmed"; result = `Agrees: ${claimLabel(claimKind, c3.value)} — "${c3.evidence}"`;
    }
    steps.push({
      kind: "corroborate", q: branch.q, filter: { excludeDomains: [host] }, sources: r3.sources || [], error: r3.error, result,
      why: "The finding rests on the host's own pages or a single other site, so ask the same question with the host's site excluded.",
    });
  }
  if (claimKind !== "abuse" && c2.value !== null && c2.retention === null) couldNotConfirm.push("How long received data is kept.");

  let { verdict, severity, action } = decide({ outcome, claimKind, claim: c2.value, confidence });
  // Every search failed: there is no evidence, so there is no verdict to give. Say
  // so plainly rather than let `decide` word a guess, and do not store it.
  const asked = steps.filter((s) => s.q);
  const allFailed = asked.length > 0 && asked.every((s) => s.error);
  if (allFailed) {
    verdict = "UNVERIFIED"; confidence = "unverified";
    severity = outcome === "LEAKED" ? "high" : "low";
    action = outcome === "LEAKED"
      ? "Linkup could not be reached, so exposure is not assessed. The credential left the machine: rotate it."
      : "Linkup could not be reached, so exposure is not assessed. The block decision never depended on it.";
  }
  const seen = new Set();
  const sources = steps.flatMap((s) => s.sources).filter((s) => (seen.has(s.url) ? false : seen.add(s.url))).slice(0, 6);
  const finding = {
    host, outcome, runId, identity, identityConfidence, claimKind, claim: c2.value,
    verdict, severity, confidence, action, couldNotConfirm, steps, sources, calls, reused, at: now(),
  };
  try { if (memory && !allFailed) await memory.save(finding); } catch { /* storage failure must not lose the answer */ }
  return finding;
}

function claimLabel(kind, v) {
  if (kind === "abuse") return v === true ? "reported as malicious" : v === false ? "not reported as malicious" : "not established";
  return v === true ? "others can read what is sent" : v === false ? "others cannot read what is sent" : "not established";
}
