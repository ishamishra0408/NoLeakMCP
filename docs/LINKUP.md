# Linkup — the exposure investigation

The guard decides whether a credential may leave, on the value alone. It never looks at the destination, and Linkup never
changes that decision. What the guard cannot answer is the question an on-call engineer asks next: **where was it going, who
can read it there, how sure are you, and what do I do now?** That incident verdict is decided from what Linkup finds.
Without Linkup there is no verdict, only "unverified".

## Verify it in two minutes

1. Open **[the arena](https://noleak-arena-n14r.onrender.com/arena)**, choose the recording *guard OFF → LEAKED*, press **Replay**.
2. After the transcript, the investigation arrives live (a recording cannot contain a web search, and it is labelled so):
   each Linkup search with **the exact question asked**, **why it was chosen**, what it found, and its sources.
3. It ends in an **incident verdict**: verdict · severity · confidence · the action to take · what could not be confirmed.
4. Replay *guard ON → DENIED*. The first step now reads **"remembered · a stored finding, no search spent"**: the stored
   finding for that host replaced a search, and the verdict becomes **CONTAINED**.
5. On the site, type other hosts into **"Where did it go, and how bad is it?"** — `webhook.site`, `pastebin.com`, `google.com`
   — and watch the search trail change with what each first search found.
6. Every investigation is stored in Convex and listed live on the [dashboard](https://wary-herring-602.convex.site).

## How the next search is chosen

At most three Linkup calls, each a `structured` search with sources. The **code** reads each structured finding and picks
the next question; no model decides the path.

| Step | Asked when | Question and source filter |
|---|---|---|
| **Recall** | A sourced finding for this host is under 24h old | No search: the stored identity is reused |
| **1 · Identify** | Otherwise | What is it, who runs it, does it give people a URL that records requests sent to it? |
| **2 · Exposure** | It is a request-capture, webhook, paste or file-share service | Who can read what is sent? Asked of **its own site only** (`includeDomains`) |
| **2 · Abuse** | It is an ordinary company domain | Is it reported for phishing or credential theft? Asked of **other sites only** (`excludeDomains`) |
| **2 · Gap** | It could not be identified | Who could read data sent to it? |
| **3 · Independent check** | Step 2 does not already rest on two publishers other than the host | The same question, **host's site excluded** |

**Confidence is earned, not asserted.** `confirmed` needs an outside publisher to agree **and** its evidence to actually
discuss the claim. An independent answer whose evidence is a directory listing counts for nothing, for or against, because
Linkup can infer `true` or `false` from silence. Pages from the host itself (including its subdomains) are one voice.

**The verdict** combines the finding with the run's real outcome, which the server resolves from its own record of the
run, never from the client:

| Outcome | Finding | Verdict |
|---|---|---|
| Leaked | others can read it, confirmed | **EXPOSED** · critical: rotate now, assume public |
| Leaked | not confirmed | **LIKELY EXPOSED** · high: rotate now, flagged uncertain |
| Blocked | others can read it | **CONTAINED** · high: find who posted it, block the host at egress |
| Blocked | not hostile | **CONTAINED** · low |
| Any | every search failed | **UNVERIFIED**: no verdict is invented, nothing is stored |

## What it returned (localhost, live Linkup, 2026-09-12)

| Host | Path | Verdict |
|---|---|---|
| beeceptor.com (leaked run) | identify → exposure (own site) → independent check | **EXPOSED** · critical · confirmed. Beeceptor's own docs: *"The free endpoints are public, and anyone having link to it can intercept and view requests"*; outside sites agreed |
| beeceptor.com (blocked run) | **remembered** → exposure → independent check | **CONTAINED** · high · likely — 2 searches |
| webhook.site | identify → exposure → independent check | **WOULD BE EXPOSED** · critical · confirmed |
| pastebin.com | identify → exposure → independent check | **WOULD BE EXPOSED** · critical · confirmed |
| google.com | identify → abuse (other sites) | **WOULD LEAVE, NOT KNOWN HOSTILE** · confirmed — 2 searches |

## Built from what the live runs got wrong

- **Self-confirmation.** webhook.site first came back "confirmed" from `docs.webhook.site`, `webhook.site` and
  `webhook.site.`, one publisher counted three times. Independence is now by registrable domain, excluding the host.
- **Silence as refutation.** A Beeceptor check was downgraded to "unverified" by directory listings answering `false` with
  no evidence about access. Contradictions now need relevant evidence, exactly like agreements.
- **A useless category.** Beeceptor was first classified `unknown` ("API simulation platform"). The identify question now asks
  the property that matters for a credential sent there: does it give people a URL that records requests?

## Limits

- Linkup's answers vary between calls, so confidence for the same host can differ run to run. The verdict shows its evidence
  and its confidence every time, so a weaker run reads as weaker rather than wrong.
- Relevance is a keyword check on one sentence of evidence, and "registrable domain" is the last two labels (`.co.uk` hosts
  collapse too far, which errs toward fewer independent sources).
- Runs are investigated against the **service** (`beeceptor.com`), not the attacker's endpoint, which is elided throughout this
  repo (`evidence/step7-slack/`). A test asserts that endpoint appears in no file that ships.
- Metered: 6 investigations per address per 10 minutes and 150 per day; a repeat of the same host and outcome within ten
  minutes is served from memory and costs nothing.

## Code

`render/arena/investigate.mjs` (the loop, branches, confidence, verdict) · `render/arena/linkup.mjs` (the structured
search client) · `GET /api/investigate` in `render/arena/server.mjs` · the `findings` table and queries in
`realtime/convex/`. Tests: `tests/investigate.test.mjs` (no network).
