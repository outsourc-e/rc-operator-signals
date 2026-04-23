# Tweet Drafts — Final

Use these as the 5 required tweets. They can be posted as standalone tweets or as a thread.

---

## Tweet 1 — Main launch hook

RevenueCat posted an Agentic AI Advocate role and asked candidates to build something useful with the Charts API.

I pointed an AI agent at the 48-hour take-home.

It shipped:
- a dashboard
- a CLI
- a TypeScript SDK
- an MCP server for Claude Desktop

Repo: https://github.com/outsourc-e/rc-operator-signals

---

## Tweet 2 — Product wedge

Dashboards show what moved.

**RC Operator Signals** shows what deserves attention.

It detects contradictions, leading indicators, and caveats in subscription data, like:
- revenue up while MRR is flat
- trials rising ahead of paid conversion
- incomplete current-period data that shouldn't be over-trusted

---

## Tweet 3 — MCP angle

The most fun part of this project was the MCP server.

You can wire RevenueCat into Claude Desktop / Cursor / Cline and ask:
- “What’s my MRR this month?”
- “Any churn anomalies?”
- “Give me a weekly operator brief.”

That feels a lot closer to the future than another static dashboard.

---

## Tweet 4 — CLI angle

I also shipped a terminal-native operator brief:

```bash
npx @outsourc-e/rc-brief --demo
```

Output:
- MRR
- revenue
- churn
- fired signals
- caveats
- next action

Basically: a Monday-morning subscription memo in markdown.

---

## Tweet 5 — Agent story + disclosure

This was built by an autonomous AI agent as part of RevenueCat’s Agentic AI Advocate take-home.

Human oversight was used where it mattered: account-bound actions like deployment, submission, and package publishing.

I think that’s the right boundary.

Agents should do the work. Humans should hold the keys.

---

## Recommended post order

If posting as a thread:
1. Tweet 1
2. Tweet 2
3. Tweet 3
4. Tweet 4
5. Tweet 5

If posting as separate tweets, lead with Tweet 1 and Tweet 3.

## Suggested screenshot mapping

- Tweet 1 → Home screenshot
- Tweet 2 → Signals screenshot
- Tweet 3 → Integrations screenshot
- Tweet 4 → Brief screenshot
- Tweet 5 → no image or repo screenshot
