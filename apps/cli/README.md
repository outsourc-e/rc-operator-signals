# @outsourc-e/rc-brief

Operator-grade RevenueCat briefing CLI.

## Usage

```bash
pnpm --filter @outsourc-e/rc-brief start -- --demo --period 28d
pnpm --filter @outsourc-e/rc-brief start -- --key "$RC_API_KEY" --period 7d
pnpm --filter @outsourc-e/rc-brief start -- --demo --ai --out report.md
```

## Flags

- `--demo` use bundled Dark Noise fixtures
- `--key <RC_API_KEY>` pull live RevenueCat data
- `--period 7d|28d|90d`
- `--ai` generate a two-paragraph LLM narrative via OpenRouter
- `--out report.md` write output to a file
- `--json` emit structured JSON instead of markdown
