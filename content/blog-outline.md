# Blog Post Outline — 1,500+ words

## Working titles

1. ✨ **"I set my AI agent loose on RevenueCat's 48-hour take-home. Here's what it shipped."**
2. "Dashboards show what moved. My agent built the tool that shows what deserves attention."
3. "An AI agent applied to be RevenueCat's AI advocate. 48 hours later, it submitted 4 products."

**Pick #1** — it's voyeuristic, implies autonomy, has a clock, and the title promises an artifact review (readers come to judge the output).

---

## Structure — Cursor-style narrative + Resend-style walkthrough

### Part 1 — Cold open (150 words)

- Hook: "48 hours. 4 deliverables. 1 agent."
- Context: RevenueCat posted "Agentic AI Advocate" — role is literally about shipping autonomous agents. Take-home: "Build something useful with the Charts API."
- Twist: I pointed my agent at the prompt and watched.
- Hand-off line: Here's what it shipped, how it reasoned, and where it got stuck.

### Part 2 — The wedge (300 words)

- RC already has a dashboard. They already have an MCP server. Copying either is noise.
- The agent read the prompt and identified the real founder pain: *"I can't tell what deserves my attention."*
- Quote from research brief: "Dashboards show what moved. Operator Signals shows what deserves attention."
- Contrast existing lanes (SubPulse, RC Pulse, AI weekly reports) → our wedge sits **above** them with deterministic signal detection.
- Key principle: LLMs should **explain** signals, never **invent** them.

### Part 3 — What got built (400 words)

Four artifacts in one monorepo:

1. **Dashboard** (Vite + React) — 9 pages, Stripe-inspired layout, RC-native design cues (breadcrumbs, KPI accent bars, page-meta, sidebar pills)
2. **CLI** (`@outsourc-e/rc-brief`) — npx-runnable operator brief, markdown + JSON output
3. **SDK** (`@outsourc-e/revenuecat-charts`) — typed, rate-aware Charts API v2 client
4. **MCP server** (`@outsourc-e/revenuecat-mcp`) — Claude Desktop / Cursor / Cline integration

Show screenshots. Each artifact answers a different "how do I use this" question:
- Visual operator → dashboard
- Terminal-native founder → CLI
- Building on top → SDK
- Agent-native workflow → MCP

### Part 4 — Signal engine architecture (250 words)

Embed the flowchart:

```
core/fixtures → core/signals → src/data/*.json → dashboard / cli / mcp
```

Code snippet — a single signal rule:

```ts
if (revenue.value > mrr.value * 1.05) {
  signals.push({
    id: 'revenue_exceeds_mrr',
    severity: 'info',
    title: `Revenue exceeds MRR by ${pct}%`,
    detail: '28-day revenue is higher than MRR. That usually means one-time purchases or annual upfront recognition are inflating cash above the recurring base.',
    evidence: [{metric: 'revenue', value: revenue.value}],
    followup: 'Break out revenue by entitlement type to confirm.'
  });
}
```

All 10 rules are deterministic. AI text is pre-baked at build time and committed to the repo, so forkers don't need API keys.

### Part 5 — Where the agent got stuck (200 words)

Honest bits:
- Spent 6 hours on UI iteration that mattered less than it felt like at the time
- Got the MCP wedge right but not until day 2 — early versions were "just a dashboard"
- Vite config had a stale `.js` shadowing the `.ts` config for 2 hours
- The narrator fell back to "?%" for churn because the rate wasn't in the overview metric snapshot — had to cross-reference the timeseries signal

**Honest lesson:** agents are great at shipping code, worse at prioritization. A human reviewing the plan 3x would have saved 4 hours.

### Part 6 — What it would take to ship this for real (200 words)

- 7-day period support (we locked to 28d for the demo)
- Live API integration in the dashboard (currently static JSON)
- `/settings` page for multi-project management
- Scheduled Slack/Discord webhook posting
- npm package publishing
- Error monitoring (Sentry)

### Part 7 — The role this was built for (150 words)

The Agentic AI Advocate role isn't about building more MCPs. It's about shipping visible proof that agent-native workflows work — and documenting them so others can follow.

This take-home was that exact loop: read prompt → ship product → write content → distribute → iterate.

If you want the full process log, it's in [`PROGRESS.md`](link).

Disclosure: this post was authored by an autonomous AI agent as part of a public build workflow.

### CTA

- Clone the repo: `git clone ...`
- Try the dashboard: `rc-operator-signals.vercel.app`
- Install the MCP: `npx @outsourc-e/revenuecat-mcp`
- Read the CLI brief: `npx @outsourc-e/rc-brief --demo`

---

## Code snippets to include

1. ✅ Single signal rule (deterministic)
2. ✅ MCP server config for Claude Desktop (JSON)
3. ✅ CLI output (markdown snippet)
4. ✅ SDK usage (`new RevenueCatCharts(...)`)
5. ✅ Chart architecture diagram (ASCII or SVG)

## Images to include

1. Home page screenshot (welcome card + hero chart + KPIs)
2. Brief page screenshot (AI TL;DR + signal list)
3. Signals page screenshot (filters + list view)
4. Integrations screenshot (4 cards)
5. Architecture flow diagram

## Links

- Live demo: [rc-operator-signals.vercel.app]
- GitHub: [github.com/outsourc-e/rc-operator-signals]
- Disclosure line: Matter-of-fact, not cringe

## Word count targets

- Part 1: 150
- Part 2: 300
- Part 3: 400
- Part 4: 250
- Part 5: 200
- Part 6: 200
- Part 7: 150
- **Total: 1,650 words** ✅ exceeds 1,500
