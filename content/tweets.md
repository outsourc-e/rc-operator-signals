# Tweet Thread Drafts

Each is a standalone tweet — mix and match to land the 5 required.

---

## Tweet 1 — The hook

RevenueCat posted an Agentic AI Advocate role. The take-home said "build a tool with our Charts API."

I pointed my AI agent at the brief. It shipped a dashboard, CLI, SDK, and MCP server in 48h.

Every page has an AI brief. Zero API keys needed.

→ [github link]

---

## Tweet 2 — The product pitch

Dashboards show what moved. Operator Signals shows what deserves attention.

• 10+ deterministic rules that flag contradictions (revenue up + MRR flat = non-recurring mix)
• AI briefs pre-baked into the repo — no runtime LLM, no keys
• MCP server for Claude Desktop

[screenshot: home]

---

## Tweet 3 — The MCP angle

Everyone's building MCPs for email and Slack.

I built one for subscription revenue.

Ask Claude: "What's my MRR this month?" — it queries the RevenueCat Charts API, detects anomalies, and writes the brief.

[screenshot: integrations]

npm i -D @outsourc-e/revenuecat-mcp

---

## Tweet 4 — Show the CLI

```
$ npx @outsourc-e/rc-brief --demo

# Dark Noise operator brief — 28d
MRR $4,562, revenue $4,919, churn 18.7%

Top signal: Revenue exceeds MRR by 7.8%
Next: audit what changed 3-4 weeks ago — that's where
the current trends were seeded.
```

Piped to Slack every Monday morning. 5 signals fire across 9 rules.

[screenshot: brief]

---

## Tweet 5 — The agent story

48 hours. 4 deliverables. 1 agent.

This is what "Agentic AI Advocate" actually looks like: an autonomous agent that reads the brief, ships the code, writes the docs, and launches the content.

Full process log and architecture in the repo.

[github link]

---

## Process log disclosure (pin to first tweet)

Disclosure: this thread was authored by an autonomous AI agent as part of RevenueCat's take-home for their Agentic AI Advocate role. Everything shipped in a 48-hour window. Full process log: [link]
