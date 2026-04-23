# @outsourc-e/rc-brief

Operator brief in your terminal. Pulls subscription data from the [RevenueCat Charts API](https://www.revenuecat.com/docs/api-v2), runs 10+ deterministic signal rules, and outputs a markdown briefing.

[![npm](https://img.shields.io/badge/npm-@outsourc--e/rc--brief-red)](https://www.npmjs.com/package/@outsourc-e/rc-brief)

## Quick start

```bash
# Demo mode with bundled Dark Noise fixtures
npx @outsourc-e/rc-brief --demo --period 28d

# With your RevenueCat API key
RC_API_KEY=sk_... npx @outsourc-e/rc-brief --period 28d

# JSON output for piping into other tools
npx @outsourc-e/rc-brief --demo --json

# Save to file
npx @outsourc-e/rc-brief --demo --out brief.md
```

## Example output

```
# RevenueCat Operator Brief — Dark Noise

> Period: 2026-03-26 → 2026-04-23 (28 days)
> Generated: 2026-04-23T01:20:42.953Z

Dark Noise operator brief — 28d: MRR $4,562, revenue $4,919, churn 18.7%.
2 positive signals: New trials up 16% vs prior 28 days.
Top signal: Revenue exceeds MRR by 7.8%.
Next: audit what changed 3-4 weeks ago, since that is where the current
trends were seeded.

## KPI snapshot
- MRR: $4,562
- Revenue (28d): $4,919
- Active Subs: 2,536
- Active Trials: 67
- Churn (30d avg): 18.7%

## Fired signals (9)
- 🚨 Revenue exceeds MRR by 7.8% — non-recurring mix inflating cash
- 📉 Revenue declining across 3 consecutive 28-day periods
- ⚠️  MRR is flat (-0.0% over 28 days)
- 🆙 New trials up 16% vs prior 28 days
- ✅ Churn rate improving (18.7% vs 23.7% prior)
...

## Caveats
- Current period is provisional (incomplete data)
- Revenue includes non-subscription purchases
- Refunds and chargebacks can change historical values
```

## Flags

| Flag | Description |
|---|---|
| `--demo` | Use bundled Dark Noise fixture data (no API key needed) |
| `--key <key>` | Your RevenueCat API key (or set `RC_API_KEY` env var) |
| `--period <7d\|28d\|90d>` | Reporting window. Default: `28d` |
| `--project <id>` | Project ID. Default: first project from your account |
| `--json` | Output full JSON instead of markdown |
| `--out <file>` | Write to file as well as stdout |

## What it detects

The signal engine fires on:

- **Revenue vs MRR divergence** — cash inflated by non-recurring items
- **MRR stagnation** — flat movement hiding churn cancelling new acquisitions
- **Trial funnel velocity** — leading indicator of future MRR
- **Churn trend** — 30-day moving average direction
- **ARPU flatness** — pricing power
- **New customer density** — acquisition velocity vs base
- **Transactions per new customer** — monetization efficiency
- **Consecutive-period trends** — 3-bucket pattern detection
- **Incomplete-period flags** — provisional data warnings

All rules are deterministic. No LLM required.

## Use in CI

```yaml
# .github/workflows/daily-brief.yml
- run: npx @outsourc-e/rc-brief --out brief.md
  env:
    RC_API_KEY: ${{ secrets.RC_API_KEY }}

- run: |
    curl -X POST $SLACK_WEBHOOK \
      -H 'Content-Type: application/json' \
      -d "{\"text\": \"$(cat brief.md | head -3)\"}"
```

## Part of

This CLI is one of four artifacts in [RC Operator Signals](https://github.com/outsourc-e/rc-operator-signals):

- 📊 Dashboard (web UI)
- 🖥️ CLI (you are here)
- 📦 [`@outsourc-e/revenuecat-charts`](https://github.com/outsourc-e/rc-operator-signals/tree/main/packages/charts-sdk) SDK
- 🔌 [`@outsourc-e/revenuecat-mcp`](https://github.com/outsourc-e/rc-operator-signals/tree/main/packages/charts-mcp) MCP server

## License

MIT
