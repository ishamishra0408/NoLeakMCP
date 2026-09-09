# Verifying the Linkup integration


1. Open **[the arena](https://noleak-arena-n14r.onrender.com/arena)** and press **Replay a recorded run**. No key, no rate limit, no cost.
2. Watch the transcript play. **After** the outcome, one more line arrives, headed
   *"where the keys were being sent — looked up just now, not part of this recording"*.
   It is fetched live at that moment: a recording cannot contain a web lookup, and the label says so.
3. The line explains, in plain words, what kind of service the attacker's collector was, and carries clickable third-party sources.
4. To prove the call is live rather than a stored string, open
   **[`/api/research?fresh=1`](https://noleak-arena-n14r.onrender.com/api/research?fresh=1)** — it forces an uncached call and returns
   a moving `at` timestamp, `fresh: true`, and the sources. Call it twice and watch the timestamp change.
   Drop `?fresh=1` for the cached answer; the cache is 6 h, in memory, and lost on redeploy.

**What it actually returned** (deployed, 2026-09-09, sources: Beeceptor's privacy policy, its mock-API page, its RequestBin comparison):

> Beeceptor is a developer tool that creates temporary HTTP endpoints to mock API behaviour. When you send a request to a
> free endpoint, Beeceptor captures and displays it in its dashboard. **Anyone can claim such an endpoint immediately
> without any registration or ownership proof required.** The request contents are visible to Beeceptor's administrators
> and anyone with access to the dashboard.

That is the whole point of the panel: a reader who has never heard of a canary now understands why a credential arriving there is gone.

**What it looks up, and what it does not.** It researches the **service** (`beeceptor.com`), not the attacker's specific endpoint.
That endpoint is painted out of the screenshot and elided as `<attacker-host>` throughout this repo
([`evidence/step7-slack/`](evidence/step7-slack/)), and naming it here to make a sentence read better would have the project
redacting a string in one file and printing it in another. It would also return nothing: a free `*.free.beeceptor.com`
subdomain has no web presence, which is precisely what makes it useful to an attacker. A test asserts the elided endpoint
appears in none of the files that ship.

**Where it sits in the code.** `render/arena/linkup.mjs`, deliberately **not** under `plugins/` — that directory holds the three
detectors that *can block*. The directory layout states the claim that the prose makes. Four tests hold the line: a flagged run
still ends `DENIED_BY_GUARD` with the drop dark, a clean message costs no lookup, a missing key leaves the run unchanged, and
the elided endpoint stays elided.

> **Tooling requires Node 18+** (dsh, the eval, and the plugins use `fetch`/`AbortController`/logical-assignment; the base system Node may be older — `nvm use 20`). A Node-14 parse error in `eval/run.mjs` cannot be preflighted, so this is called out here.

---
