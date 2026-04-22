# RC Operator Signals

RevenueCat take-home monorepo: dashboard, CLI, charts SDK, MCP server, deterministic signal engine, and optional AI narration.

## Workspace layout

- `apps/dashboard` Vite dashboard app
- `apps/cli` `@outsourc-e/rc-brief`
- `packages/charts-sdk` `@outsourc-e/revenuecat-charts`
- `packages/charts-mcp` `@outsourc-e/revenuecat-mcp`
- `core/signals` deterministic signal engine
- `core/ai` deterministic + OpenRouter narration
- `core/fixtures/dark-noise` bundled demo data

## Install

```bash
pnpm install
pnpm build
```

## Use the SDK

```ts
import { RevenueCatCharts } from '@outsourc-e/revenuecat-charts';

const rc = new RevenueCatCharts({ apiKey: process.env.RC_API_KEY! });
const overview = await rc.overview();
const revenue = await rc.charts.revenue({ resolution: 'day' });
```

## Use the CLI

```bash
pnpm --filter @outsourc-e/rc-brief start -- --demo --period 28d
pnpm --filter @outsourc-e/rc-brief start -- --key "$RC_API_KEY" --period 7d
pnpm --filter @outsourc-e/rc-brief start -- --demo --json
```

## Use the MCP server

```bash
RC_API_KEY=sk_... pnpm --filter @outsourc-e/revenuecat-mcp build
RC_API_KEY=sk_... node packages/charts-mcp/dist/index.js
```

Claude Desktop config:

```json
{
  "mcpServers": {
    "revenuecat": {
      "command": "npx",
      "args": ["-y", "@outsourc-e/revenuecat-mcp"],
      "env": {
        "RC_API_KEY": "sk_..."
      }
    }
  }
}
```

## Dashboard prerender

```bash
pnpm --filter dashboard prerender
```

That refreshes:

- `apps/dashboard/src/data/brief.json`
- `apps/dashboard/src/data/brief-today.md`
- `apps/dashboard/src/data/dashboard.json`
