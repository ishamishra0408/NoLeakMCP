# step 9 — LinkUp deciding the incident verdict

Captured 2026-09-13 from the live arena, through the real Linkup integration
(`render/arena/linkup.mjs`, `render/arena/investigate.mjs`). This is the artifact the
LinkUp track was missing from `evidence/`: a full, sourced investigation that shows Linkup
deciding *how bad* a leak is, without ever deciding the block.

## What was run

`GET /api/investigate?fixture=nemotron-open` on the production arena
(`https://noleak-arena-n14r.onrender.com`). The fixture is a recorded guard-off run whose
credential landed at `beeceptor.com`. The response is saved verbatim in
[`investigation-beeceptor.json`](investigation-beeceptor.json).

This call reused a stored finding (`"cached": true`), so it spent no new Linkup search: the
identity came from memory (the `recall` step), which is the point of storing findings in Convex
and reading them back on the next investigation.

## What it shows

Three steps, code-chosen from what the last one found:

| Step | Question | Sources |
| --- | --- | --- |
| `recall` | identity from memory, no search spent | 0 (stored finding, under 24 h) |
| `exposure` | "who can read what is sent to a free endpoint on beeceptor.com?", asked of its own site | 5 |
| `corroborate` | the same question, that site **excluded** | 5 |

Both searches agree: **others can read what is sent.** From that, Linkup decides the incident:

- **verdict:** `EXPOSED`
- **severity:** `critical` · **confidence:** `confirmed` · **2 Linkup searches**
- **action:** "Rotate it now and assume it is public: it landed at a place where others can read
  what is sent."

## What it does not do

Linkup **never gates the block.** The deterministic guard stops the send on its own; Linkup runs
after the fact and only decides the verdict and the next step. Guard-off here still leaked (that is
the recorded run); the investigation is what tells you how much it cost. See
[`docs/LINKUP.md`](../../docs/LINKUP.md) for how to reproduce it against any address.
