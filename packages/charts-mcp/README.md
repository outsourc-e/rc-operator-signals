# @outsourc-e/revenuecat-mcp

[MCP server](https://modelcontextprotocol.io) for the [RevenueCat Charts API](https://www.revenuecat.com/docs/api-v2). Drop into Claude Desktop, Cursor, or Cline and ask natural-language questions about your subscription data.

[![npm](https://img.shields.io/badge/npm-@outsourc--e/revenuecat--mcp-red)](https://www.npmjs.com/package/@outsourc-e/revenuecat-mcp)

## Install (Claude Desktop)

Edit your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

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

Restart Claude Desktop. You should see a 🔌 plug icon indicating the server is connected.

## Install (Cursor / Cline)

Same config pattern. Add to your MCP settings file with `command: "npx"`, `args: ["-y", "@outsourc-e/revenuecat-mcp"]`, and set `RC_API_KEY` in the env block.

## Available tools

| Tool | Description |
|---|---|
| `rc_get_overview` | Get current period KPIs (MRR, revenue, active subs, churn) |
| `rc_get_chart` | Fetch any chart by name (revenue, mrr, churn, trials, etc.) |
| `rc_detect_signals` | Run the deterministic signal engine on current data |
| `rc_weekly_brief` | Generate a markdown operator brief for the period |
| `rc_explain_signal` | Explain a specific signal with context and next actions |

## Example queries

Once connected, ask Claude:

- *"What's my MRR for Dark Noise this month?"*
- *"Any churn anomalies in the last 28 days?"*
- *"Give me a weekly operator brief."*
- *"Is my trial funnel getting better or worse?"*
- *"Explain why revenue might be higher than MRR."*

Claude will call the MCP tools automatically, reason over the results, and respond with data-grounded answers.

## Get your RevenueCat API key

1. Go to [RevenueCat Dashboard → Projects → API Keys](https://app.revenuecat.com/projects)
2. Create a V2 key with `charts_metrics` read scope
3. Paste it into the `RC_API_KEY` env value above

Keys are per-project. This server reads only — no write scopes needed.

## Local development

```bash
git clone https://github.com/outsourc-e/rc-operator-signals
cd rc-operator-signals
pnpm install
pnpm --filter @outsourc-e/revenuecat-mcp build
# Dist file: packages/charts-mcp/dist/index.js
```

To test locally, point Claude Desktop at your local build:

```json
{
  "mcpServers": {
    "revenuecat-dev": {
      "command": "node",
      "args": ["/absolute/path/to/packages/charts-mcp/dist/index.js"],
      "env": {
        "RC_API_KEY": "sk_..."
      }
    }
  }
}
```

## Architecture

- Uses [`@modelcontextprotocol/sdk`](https://github.com/modelcontextprotocol/sdk) for protocol handling
- Wraps [`@outsourc-e/revenuecat-charts`](https://github.com/outsourc-e/rc-operator-signals/tree/main/packages/charts-sdk) for API access
- Deterministic narratives grounded in the signal engine — no LLM dependency
- Respects the 5 req/min Charts API rate limit automatically

## License

MIT
