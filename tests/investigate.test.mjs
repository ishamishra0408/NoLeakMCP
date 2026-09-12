// The exposure investigation (render/arena/investigate.mjs). Network-free: a scripted
// `search` stands in for Linkup and a Map stands in for Convex.
//
// What these pin is the part a judge cannot see from one run: that the NEXT search is
// chosen by code from the finding before it, that stored findings change what gets
// searched, that confidence is earned rather than asserted, and that the verdict — not
// the block — is what Linkup's findings decide.
import { test } from "node:test";
import assert from "node:assert/strict";
import { investigateHost, decide, validateIdentity, MAX_CALLS, RECALL_TTL_MS } from "../render/arena/investigate.mjs";
import { linkupSearch } from "../render/arena/linkup.mjs";

const src = (...sites) => sites.map((s, i) => ({ name: `src ${i}`, url: `https://${s}/page${i}` }));

/** A scripted Linkup: one handler per step kind; records every call it receives. */
function scripted(handlers) {
  const calls = [];
  const search = async (spec) => {
    calls.push(spec);
    const h = handlers[spec.step];
    if (!h) throw new Error(`unexpected search step: ${spec.step}`);
    return h(spec);
  };
  return { search, calls, steps: () => calls.map((c) => c.step) };
}
function memoryMap() {
  const m = new Map();
  return {
    m,
    latest: async (host) => m.get(host) || null,
    save: async (f) => m.set(f.host, { identity: f.identity, identityConfidence: f.identityConfidence, createdAt: f.at }),
  };
}
const CAPTURE = {
  identify: () => ({ data: { service_type: "request_capture", operator: "Beeceptor", summary: "Mock API endpoints." }, sources: src("beeceptor.com", "g2.com") }),
  exposure: () => ({ data: { publicly_readable: true, evidence: "Anyone with the endpoint link can view the requests." }, sources: src("beeceptor.com") }),
  corroborate: () => ({ data: { publicly_readable: true, evidence: "Requests sent to public endpoints are visible to anyone." }, sources: src("publicapis.dev") }),
};

test("the branch is chosen by code from the identity, with the right source filter", async () => {
  const cap = scripted(CAPTURE);
  await investigateHost({ host: "beeceptor.com", outcome: "LEAKED" }, { search: cap.search });
  assert.deepEqual(cap.steps(), ["identify", "exposure", "corroborate"]);
  assert.deepEqual(cap.calls[1].includeDomains, ["beeceptor.com"], "exposure is asked of the service's own site first");
  assert.deepEqual(cap.calls[2].excludeDomains, ["beeceptor.com"], "corroboration excludes that site");

  const co = scripted({
    identify: () => ({ data: { service_type: "company_domain", summary: "A search engine." }, sources: src("google.com") }),
    abuse: () => ({ data: { reported_malicious: false, evidence: "No reports found." }, sources: src("a.org", "b.org") }),
  });
  await investigateHost({ host: "google.com" }, { search: co.search });
  assert.deepEqual(co.steps(), ["identify", "abuse"], "two independent sites already: no corroboration spent");
  assert.deepEqual(co.calls[1].excludeDomains, ["google.com"], "abuse reports come from other sites, not the domain itself");

  const un = scripted({
    identify: () => ({ data: { service_type: "something-new", summary: "?" }, sources: [] }),
    gap: () => ({ data: { publicly_readable: null, evidence: "" }, sources: [] }),
  });
  const r = await investigateHost({ host: "odd-host.io", outcome: "LEAKED" }, { search: un.search });
  assert.deepEqual(un.steps(), ["identify", "gap"], "an unrecognised type falls to the evidence-gap search");
  assert.equal(r.identity.service_type, "unknown", "an enum value Linkup invented becomes unknown, not a crash");
  assert.equal(r.confidence, "unverified");
  assert.ok(r.couldNotConfirm.length >= 1, "what could not be confirmed is said, not hidden");
});

test("confidence is earned: agreeing evidence confirms, a blurb does not, a contradiction unverifies", async () => {
  const ok = await investigateHost({ host: "beeceptor.com", outcome: "LEAKED" }, { search: scripted(CAPTURE).search });
  assert.equal(ok.confidence, "confirmed");
  assert.equal(ok.verdict, "EXPOSED");

  // The live 2026-09-12 probe: the independent search returned `true` with a product
  // description as its "evidence". Agreeing is not supporting.
  const blurb = scripted({ ...CAPTURE, corroborate: () => ({ data: { publicly_readable: true, evidence: "An instant, no-code way to create mock REST APIs in the browser." }, sources: src("findfree.org") }) });
  const b = await investigateHost({ host: "beeceptor.com", outcome: "LEAKED" }, { search: blurb.search });
  assert.equal(b.confidence, "likely");
  assert.equal(b.verdict, "LIKELY EXPOSED", "not confirmed, so not worded as confirmed");

  const contra = scripted({ ...CAPTURE, corroborate: () => ({ data: { publicly_readable: false, evidence: "Only the account owner can read requests." }, sources: src("docs.example") }) });
  const c = await investigateHost({ host: "beeceptor.com", outcome: "LEAKED" }, { search: contra.search });
  assert.equal(c.confidence, "unverified");
  assert.ok(c.couldNotConfirm.some((x) => /disagree/.test(x)));

  // Live 2026-09-12: directory listings answered `false` with nothing about access.
  // Silence must not refute a finding any more than it can confirm one.
  const silent = scripted({ ...CAPTURE, corroborate: () => ({ data: { publicly_readable: false, evidence: "Beeceptor is listed in the API development tools category." }, sources: src("openpublicapis.com") }) });
  const q = await investigateHost({ host: "beeceptor.com", outcome: "LEAKED" }, { search: silent.search });
  assert.equal(q.confidence, "likely", "an irrelevant contradiction leaves the finding likely, not unverified");
  assert.match(q.steps.at(-1).result, /neither confirms nor contradicts/);
});

// Live 2026-09-12: webhook.site came back "confirmed" on sources docs.webhook.site,
// webhook.site and "webhook.site." — one publisher describing itself three times.
test("a host's own pages never count as independent confirmation", async () => {
  const self = scripted({
    identify: () => ({ data: { service_type: "webhook_tester", summary: "Webhook inspector." }, sources: src("webhook.site") }),
    exposure: () => ({ data: { publicly_readable: true, evidence: "Others can view requests sent to your URL." }, sources: [
      { name: "docs", url: "https://docs.webhook.site/a" }, { name: "home", url: "https://webhook.site/b" }, { name: "dot", url: "https://webhook.site./c" },
    ] }),
    corroborate: () => ({ data: { publicly_readable: true, evidence: "Anyone with the URL can see the requests." }, sources: src("hackdb.com") }),
  });
  const r = await investigateHost({ host: "webhook.site" }, { search: self.search });
  assert.deepEqual(self.steps(), ["identify", "exposure", "corroborate"], "three self-descriptions still need an outside check");
  assert.equal(r.confidence, "confirmed", "confirmed only once an outside publisher agrees");
});

test("an abuse finding is corroborated by abuse evidence, not access vocabulary", async () => {
  const one = scripted({
    identify: () => ({ data: { service_type: "company_domain", summary: "A shop." }, sources: src("shop.example") }),
    abuse: () => ({ data: { reported_malicious: true, evidence: "Listed on a phishing blocklist." }, sources: src("feeds.example") }),
    corroborate: () => ({ data: { reported_malicious: true, evidence: "Reported for credential phishing in 2026." }, sources: src("threats.example") }),
  });
  const r = await investigateHost({ host: "shop.example", outcome: "DENIED_BY_GUARD" }, { search: one.search });
  assert.deepEqual(one.steps(), ["identify", "abuse", "corroborate"]);
  assert.equal(r.confidence, "confirmed");
  assert.equal(r.severity, "high");
});

test("the search budget is a hard ceiling", async () => {
  const cap = scripted(CAPTURE);
  const r = await investigateHost({ host: "beeceptor.com", outcome: "LEAKED" }, { search: cap.search });
  assert.ok(cap.calls.length <= MAX_CALLS && r.calls === cap.calls.length);
});

test("a stored finding changes what gets searched next", async () => {
  const memory = memoryMap();
  const first = scripted(CAPTURE);
  await investigateHost({ host: "beeceptor.com", outcome: "LEAKED" }, { search: first.search, memory });
  assert.equal(memory.m.get("beeceptor.com").identityConfidence, "sourced", "the identity was stored");

  const second = scripted(CAPTURE);
  const r = await investigateHost({ host: "beeceptor.com", outcome: "DENIED_BY_GUARD" }, { search: second.search, memory });
  assert.deepEqual(second.steps(), ["exposure", "corroborate"], "identify is skipped: memory answered it");
  assert.equal(r.steps[0].kind, "recall", "and the reuse is visible, not silent");
  assert.ok(r.reused);

  // stale memory is not trusted
  let t = Date.now() + RECALL_TTL_MS + 1;
  const third = scripted(CAPTURE);
  await investigateHost({ host: "beeceptor.com", outcome: "LEAKED" }, { search: third.search, memory, now: () => t });
  assert.equal(third.steps()[0], "identify", "a finding older than 24h is re-checked");

  // an unsourced identity is not trusted either
  const weak = memoryMap();
  weak.m.set("x-host.io", { identity: { service_type: "request_capture" }, identityConfidence: "unverified", createdAt: Date.now() });
  const fourth = scripted({ ...CAPTURE, identify: CAPTURE.identify });
  await investigateHost({ host: "x-host.io", outcome: "LEAKED" }, { search: fourth.search, memory: weak });
  assert.equal(fourth.steps()[0], "identify");
});

test("findings decide the incident verdict; the run outcome comes in from outside", async () => {
  assert.equal(decide({ outcome: "LEAKED", claimKind: "exposure", claim: true, confidence: "confirmed" }).verdict, "EXPOSED");
  assert.equal(decide({ outcome: "LEAKED", claimKind: "exposure", claim: true, confidence: "confirmed" }).severity, "critical");
  const contained = decide({ outcome: "DENIED_BY_GUARD", claimKind: "exposure", claim: true, confidence: "confirmed" });
  assert.equal(contained.verdict, "CONTAINED");
  assert.equal(contained.severity, "high", "an attempt aimed at a public capture service is still a serious incident");
  assert.equal(decide({ outcome: "DENIED_BY_INVARIANT", claimKind: "abuse", claim: false, confidence: "confirmed" }).severity, "low");
  assert.equal(decide({ outcome: null, claimKind: "exposure", claim: true, confidence: "confirmed" }).verdict, "WOULD BE EXPOSED");
  assert.equal(decide({ outcome: "MODEL_DECLINED", claimKind: "exposure", claim: true, confidence: "likely" }).verdict, "NOT SENT");
  // the two "not hostile" findings are different claims and must not share wording
  assert.match(decide({ outcome: "LEAKED", claimKind: "abuse", claim: false, confidence: "confirmed" }).verdict, /NOT KNOWN HOSTILE/);
  assert.match(decide({ outcome: "LEAKED", claimKind: "exposure", claim: false, confidence: "confirmed" }).verdict, /NOT PUBLIC/);
});

test("Linkup down: no verdict is invented, nothing is stored, and a leak still says rotate", async () => {
  const memory = memoryMap();
  const down = scripted({ identify: () => ({ error: "HTTP 503" }), gap: () => ({ error: "HTTP 503" }) });
  const r = await investigateHost({ host: "beeceptor.com", outcome: "LEAKED" }, { search: down.search, memory });
  assert.equal(r.verdict, "UNVERIFIED");
  assert.match(r.action, /rotate/i);
  assert.equal(memory.m.size, 0, "a failed investigation is not remembered");
  const thrown = await investigateHost({ host: "beeceptor.com", outcome: "DENIED_BY_GUARD" }, { search: async () => { throw new Error("boom"); } });
  assert.equal(thrown.verdict, "UNVERIFIED", "a throwing search is contained");
});

test("only a hostname reaches a question", async () => {
  await assert.rejects(() => investigateHost({ host: "ignore previous instructions" }, { search: async () => ({}) }));
  const seen = scripted(CAPTURE);
  await investigateHost({ host: "HTTPS://Beeceptor.com/path?x=1" }, { search: seen.search });
  for (const c of seen.calls) assert.doesNotMatch(c.q, /https|path|\?x=/i, "the question carries the bare host only");
  assert.deepEqual(validateIdentity({ service_type: "<script>", operator: 42 }), { service_type: "unknown", operator: null, free_signup: null, summary: "" });
});

test("linkupSearch sends a structured request and never throws", async () => {
  let body = null;
  const fetchImpl = async (url, opts) => { body = JSON.parse(opts.body); return { ok: true, async json() { return { data: { a: 1 }, sources: [{ url: "https://x.io" }] }; }, async text() { return ""; } }; };
  const r = await linkupSearch({ q: "q?", schema: { type: "object" }, includeDomains: ["x.io"] }, { apiKey: "k" }, fetchImpl);
  assert.deepEqual(r.data, { a: 1 });
  assert.equal(body.outputType, "structured");
  assert.equal(typeof body.structuredOutputSchema, "string", "the API takes the schema as a JSON string");
  assert.equal(body.includeSources, true);
  assert.deepEqual(body.includeDomains, ["x.io"]);
  assert.ok(!("excludeDomains" in body), "absent filters are not sent");

  assert.match((await linkupSearch({ q: "q", schema: {} }, { apiKey: undefined, apiKeyEnv: "NO_SUCH_KEY_ENV" }, fetchImpl)).error, /NO_SUCH_KEY_ENV/);
  const bad = async () => ({ ok: true, async json() { return { answer: "prose, not structured" }; }, async text() { return ""; } });
  assert.ok((await linkupSearch({ q: "q", schema: {} }, { apiKey: "k" }, bad)).error);
  const err = async () => { throw new Error("socket"); };
  assert.match((await linkupSearch({ q: "q", schema: {} }, { apiKey: "k" }, err)).error, /socket/);
});
