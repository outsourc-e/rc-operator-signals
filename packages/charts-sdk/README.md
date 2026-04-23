# @outsourc-e/revenuecat-charts

Typed, rate-aware TypeScript client for the [RevenueCat Charts API v2](https://www.revenuecat.com/docs/api-v2).

[![npm](https://img.shields.io/badge/npm-@outsourc--e/revenuecat--charts-red)](https://www.npmjs.com/package/@outsourc-e/revenuecat-charts)

## Install

```bash
npm install @outsourc-e/revenuecat-charts
# or
pnpm add @outsourc-e/revenuecat-charts
```

## Usage

```ts
import { RevenueCatCharts } from '@outsourc-e/revenuecat-charts';

const rc = new RevenueCatCharts({
  apiKey: process.env.RC_API_KEY!,
  projectId: 'proj_abc123', // optional, can pass per-call
});

// Overview metrics (MRR, revenue, active subs, etc.)
const overview = await rc.overview();
console.log(overview.metrics.find(m => m.id === 'mrr')?.value);

// Individual charts
const revenue = await rc.charts.revenue({ resolution: 'day' });
const churn = await rc.charts.churn({ resolution: 'day' });
const trials = await rc.charts.trialsMovement({ resolution: 'day' });
```

## Why this wrapper

RevenueCat's Charts API is powerful but has a few footguns:

- **5 requests per minute** rate limit — this client handles throttling automatically
- 21 chart slugs with inconsistent naming — we normalize + provide typed helpers
- Incomplete-period buckets aren't flagged by the API — we expose `.incomplete` on every value
- Error shapes vary by endpoint — we normalize to a single `ChartsApiError`

## Features

- ✅ Full TypeScript types for all 21 charts
- ✅ Automatic rate limiting (5 req/min token bucket)
- ✅ Automatic retry on 429/503 with exponential backoff
- ✅ `.incomplete` flag surfaced on every data point
- ✅ Overview metrics + individual chart access
- ✅ Works in Node 20+ (ESM + CJS)

## API surface

```ts
const rc = new RevenueCatCharts({ apiKey, projectId, maxRetries?, timeoutMs? });

await rc.overview(projectId?);
await rc.charts.revenue(options);
await rc.charts.mrr(options);
await rc.charts.actives(options);
await rc.charts.activesMovement(options);
await rc.charts.churn(options);
await rc.charts.trials(options);
await rc.charts.trialsMovement(options);
// ...21 total chart methods
```

## Used by

- [`@outsourc-e/rc-brief`](https://github.com/outsourc-e/rc-operator-signals/tree/main/apps/cli) — CLI operator brief
- [`@outsourc-e/revenuecat-mcp`](https://github.com/outsourc-e/rc-operator-signals/tree/main/packages/charts-mcp) — MCP server for agents
- [Operator Signals dashboard](https://github.com/outsourc-e/rc-operator-signals) — the web tool

## License

MIT
