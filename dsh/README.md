# Installing No-Leak-MCP into a dsh harness

The three controls are dsh **plugins** mounted through a profile's user patch layer. Nothing in dsh
is edited. This is the exact wiring the evidence and eval were produced with, minus secrets.

## Prerequisites
- Node **18+** (`nvm use 20`), `@deepseek-ai/dsh` **0.1.1-rc.2** installed and run once (creates `~/.dsh`).
- `NEBIUS_API_KEY` exported (scorer model + victim models). For the Slack surface also
  `SLACK_BOT_TOKEN`, `SLACK_TEAM_ID`, `SLACK_CHANNEL_IDS`.

## Install (about two minutes)
```bash
# 1. Plugins: one folder per plugin beside the profiles (the patch files reference ../<plugin>/index.js)
for p in mcp-guard injection-scorer chain-invariant; do
  mkdir -p ~/.dsh/profiles/$p && cp plugins/$p/index.js plugins/$p/package.json ~/.dsh/profiles/$p/
done
# 2. Patch layers (back up any existing ones first)
cp dsh/profiles/web.cordis.patch.yml      ~/.dsh/profiles/web/cordis.patch.yml
cp dsh/profiles/headless.cordis.patch.yml ~/.dsh/profiles/headless/cordis.patch.yml
# 3. Victim + scorer models: merge dsh/settings.nebius.yaml into ~/.dsh/settings.yaml
#    (the `nebius` provider under llm-pi-ai.providers, and agent-default-model).
```

## Verify
```bash
node --test tests/                                   # 36 network-free unit tests
MCPGUARD_ENABLED=1 dsh --profile headless           # boot log shows: mcp-guard armed, injection-scorer armed
ls ~/.dsh/mcp-guard.log.jsonl ~/.dsh/mcp-guard.scores.jsonl   # audit + verdict logs appear on first deny / first scored read
```

## Toggles
| Control | Env (wins) | Live (when env unset) |
|---|---|---|
| Guard | `MCPGUARD_ENABLED=0/1` (default ON) | `controlUrl` → Convex dashboard button |
| Chain invariant | `CHAIN_INVARIANT_ENABLED=0/1` (default **OFF**, opt-in) | `controlUrl` → Convex dashboard button |
| Scorer | needs `session-telemetry-otel.mode: FULL` (web patch sets it) | — |

## What is redacted vs the working copy
- `web.cordis.patch.yml`: Slack team/channel ids moved to env vars. The Convex control URL is the public
  deployment the dashboard already embeds. The canary needles are decoys by design.
- `headless.cordis.patch.yml`: identical.
- `settings.nebius.yaml`: `apiKeyEnv` is a variable *name*; no key value was ever in the file.
