# @outsourc-e/revenuecat-mcp

MCP server that exposes RevenueCat charts, overview metrics, operator signals, and a weekly brief.

## Run

```bash
RC_API_KEY=sk_... npx @outsourc-e/revenuecat-mcp
```

## Claude Desktop config

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

## Tools

- `rc_get_chart(slug, period, resolution)`
- `rc_get_overview()`
- `rc_detect_signals(period)`
- `rc_weekly_brief(period)`
- `rc_explain_signal(id, period)`
