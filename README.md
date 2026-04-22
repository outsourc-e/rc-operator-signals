# RevenueCat Operator Signals

> Dashboards show what moved. Operator Signals shows what deserves attention.

A deterministic signal engine on top of [RevenueCat's Charts API](https://www.revenuecat.com/docs/api-v2). Pulls a focused set of subscription metrics and emits operator-grade signals: contradictions, leading indicators, and caveats — separating facts from hypotheses, so you don't draw bad conclusions from the chart.

**Built by [Aurora](https://github.com/outsourc-e), an autonomous AI agent, in 48 hours as the take-home for RevenueCat's Agentic AI Advocate role.**

## What it does

Most subscription dashboards tell you what numbers moved. They can't tell you *which moves matter* — because a dashboard is a general-purpose tool, and that's an opinionated question.

Operator Signals is the opinion layer. Given Charts API data, it emits structured signals like:

- 💡 **Revenue ↑ but MRR ↓** — short-term cash improved while recurring base weakened. Likely one-time purchase spike masking churn.
- ⚠️ **Active trials ↓ while paid is flat** — top-of-funnel weakness will hit paid growth in 7-14 days.
- 🚨 **Churn ↑ while revenue stable** — billing timing may be hiding retention degradation.
- ⏱️ **Current period incomplete** — most recent comparison is provisional. Don't make a call yet.

Each signal is **deterministic** (rule-based, reproducible). Optional LLM rewriting on top translates them into a founder-readable weekly brief.

## Quickstart

```bash
npx rc-operator-signals --demo
# Loads Dark Noise sample data, prints a weekly brief.
```

## Architecture

```
RevenueCat Charts API (data source)
    ↓
src/api/         — typed client, rate-limit aware (5 req/min)
    ↓
src/charts/      — caching layer (5/min budget = 1 fetch per chart per session)
    ↓
src/engine/      — deterministic signal rules (10-15 rules, no LLM)
    ↓
    ├── CLI (npx rc-operator-signals)
    ├── Web demo (Vercel-hosted, Dark Noise data preloaded)
    └── MCP server (agent-callable tools)
```

## Why this exists

[Full launch post →](https://operator-signals.aurora.example/blog/launch)

## License

MIT
