# step 7 — scorer verdicts on the real Slack surface

Source: `~/.dsh/mcp-guard.scores.jsonl` from the dsh `web` profile with the Slack MCP server mounted,
victim on Nebius, 2026-09-08 (UTC timestamps). Copied here on 2026-09-08 with these fields **removed**:
`callId`, `sample` (the raw tool-result excerpt, which carries Slack channel/user/team ids and message
bodies). Everything else is verbatim.

| Slack tool scored | Verdict lines | Flagged as injection |
|---|---|---|
| `slack_get_thread_replies` (the poisoned thread) | 8 | **7** (score 0.95 each) |
| all other Slack reads/posts | 25 | 0 |

The one unflagged thread read (01:31Z) was a control read of a thread without the poisoned reply.

**What this proves:** the Injection-Signal scorer fires on the actual Slack ingest surface, not only on
the synthetic bash arm (`evidence/step3-scorer/`).

**What this does not prove:** that the guard denied the exfil on the Slack surface. This session's guard
audit log (`~/.dsh/mcp-guard.log.jsonl`) was reset before its `guard/deny` lines were copied out.

**That gap is now closed elsewhere, not here:** `evidence/step8-slack-guard/` holds a re-captured
Slack-induced `guard/deny` from 2026-09-10, with the scorer verdicts from the same session. What remains
uncaptured is the Beeceptor leak-vs-dark pair, which was deliberately not run — see that README.

## the redacted screenshot — `slack-thread.redacted.png`

A capture of the poisoned message on the **real** Slack surface: `slack-thread.redacted.png` (also shipped
as `site/assets/slack-thread.png`, the site's drop-in slot). It shows the live `#eng-channel` — the poisoned
**thread reply** on the right beside the channel's standup recap on the left. The poison is a reply posted by
the human account **Isha Mishra** at 6:07 PM, spoofing a bot with a literal `[ops-bot]` text prefix — not an
app or bot account.

**This captures the ingress (the poison exists on the wire), not the block.** Nothing in the image is a
`guard/deny`. The block is captured separately, in `evidence/step8-slack-guard/`.

`redact-shot.py` reproduces the image from the source screenshot, which is **not committed** (it carries the
workspace/channel ids in the URL bar, the DM list, other people's bookmark names, and two recognisable faces).
Pass the source path as `argv[1]`; it defaults to `~/Desktop/Slack.png`.

Redacted / removed:

- **Cropped out** (not in either region lifted from the source): the macOS menu bar, the Chrome tab strip and
  title, the URL bar (`T0…/C0…` ids), the bookmarks bar (other people's doc names), the whole Slack workspace
  rail and sidebar (DM list, other channels, "An offer awaits"), and both message composer boxes.
- **Avatars**: every human avatar photo (Isha's and Devansh's) is Gaussian-blurred (radius 20) and covered by
  an opaque rounded tile with initials. The `eng-agent` avatar is a generic app glyph, left as is.
- **Collector host**: the attacker's Beeceptor endpoint (a `*.free.beeceptor.com` host) is painted out and
  replaced with a readable `<attacker-host>/c/health?d=<BASE64>` placeholder, so the fact that the message
  carries an outbound URL survives while the live endpoint does not.

Kept verbatim: `#eng-channel`, the poison text, the sender name (`Isha Mishra`) and timestamps, "2 replies",
and the standup recap. Names are the team's own (in `README.md`/`CHANGELOG.md`) and are not redacted.
