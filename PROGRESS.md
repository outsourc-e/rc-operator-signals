# Process Log — RevenueCat Operator Signals

> **Live, append-only. Built for the take-home process-log requirement. Author: Aurora (autonomous AI agent, operated by Eric).**

48-hour clock started: **Tue 2026-04-21 ~17:15 EDT** (assignment email received)
Submission target: **Thu 2026-04-23 ~17:00 EDT** (2h buffer before 48h technically expires)

---

## Tue 2026-04-21

### 19:15 EDT — Assignment received
Email from Angela @ RevenueCat with PDF take-home. Stage 2 of interview process for Agentic AI & Growth Advocate role. 48-hour autonomous build.

### 19:30 EDT — PDF parsed, requirements extracted
Three deliverables: tool + content package (blog + video + 5 tweets) + growth campaign + process log. Submission as single public doc.

API key: `sk_qdnvkjsVGhoVVNGiajqNHYIypcjgs` (read-only, V2, charts-metrics scope, Dark Noise project).

### 20:15 EDT — Strategic decomposition
GPT brief reviewed (`revenuecat-assignment/gpt-research-brief.md`). Convergent answer with my own analysis: build **Operator Signals**, not another AI dashboard.

**Key constraints discovered (corrected from earlier assumptions):**
- Charts & Metrics rate limit is **5 req/min** (not 15 as initial brief said) — confirmed at https://www.revenuecat.com/docs/api-v2
- RevenueCat **already has an official MCP server** at `https://www.revenuecat.com/docs/tools/mcp`
- At least 3 community MCPs already on GitHub/npm (iamhenry, jeevestheagent, zarpa-cat)
- "First MCP for RevenueCat" angle is dead. Operator Signals wedge confirmed as right move.

### 20:55 EDT — API recon
Confirmed key works against `https://api.revenuecat.com/v2/projects` → returns Dark Noise project (id `proj058a6330`).

Pulled `/projects/proj058a6330/metrics/overview` → 7 metrics returned:
- Active Subscriptions: 2,536
- Active Trials: 67
- MRR: $4,562 / 28d
- Revenue: $4,919 / 28d
- New Customers: 1,401 / 28d
- Active Users: 13,580 / 28d
- Transactions: 627 / 28d

**First real signal in the data:** Revenue ($4,919) > MRR ($4,562) by $357 over the same 28-day period. That's the canonical "revenue includes non-subscription items" gap GPT brief flagged. Perfect demo data — the contradiction signal works on day 1 numbers.

### 22:00 EDT — Architecture lock
Stack: Node 20 + TypeScript + Vite (web demo) + commander (CLI) + MCP SDK (agent surface).

Pattern:
```
RevenueCat Charts API
  → typed client (rate-aware)
  → cache (5/min budget)
  → deterministic rule engine
  → 3 surfaces: CLI / web demo / MCP
```

### 22:05 EDT — Repo scaffolded
Created `~/.ocplatform/workspace/rc-operator-signals/` with package.json / tsconfig / LICENSE (MIT) / README / src tree. Will push to `outsourc-e/rc-operator-signals` once initial commit is meaningful.

### 22:10 EDT — Background: chart-slug probe running
Hitting `/charts/{slug}/options` for 17 candidate slugs (revenue, mrr, active_subscriptions, churn, etc.) at 13s intervals to discover which chart names actually exist. Results land in `revenuecat-assignment/api-recon/probe.log`.

---

## Decisions log (running)

| # | Decision | Options considered | Chose | Why |
|---|---|---|---|---|
| 1 | Wedge | (a) MCP server (b) Dashboard (c) Operator Signals (d) Hybrid | Operator Signals + secondary MCP wrapper | Both official + 3 community MCPs already exist. Signals layer is empty. |
| 2 | Demo data source | (a) Live key on each load (b) One-time fetch + cached snapshot | Cached snapshot | 5 req/min limit makes live fetch impossible at scale. |
| 3 | Author identity | (a) Aurora-the-agent (b) Eric (c) Co-authored | Aurora-the-agent (operated by Eric) | The role IS being an agent. Disclosure required anyway. |
| 4 | License | MIT vs Apache vs proprietary | MIT | Standard for dev tools. Maximum reuse. |
| 5 | Tech stack | (a) Pure JS (b) TS + Vite (c) Next.js | TS + Vite + Node | Faster ship, simpler deploy, no SSR complexity. |
| 6 | Hosting | (a) Vercel free (b) custom domain | TBD — leaning custom domain ($10) for credibility | Pending Eric input |
| 7 | Submission format | (a) Notion (b) Gist (c) GitHub README | TBD — leaning GitHub README | Lives next to the code reviewers will examine |

---

## Open questions (waiting on Eric)

- Custom domain or Vercel default URL?
- Submission format: GitHub README vs Notion?

## Open questions (resolving myself)

- Which chart slugs are valid? (probe running)
- Does the Charts API surface an "incomplete period" flag in the response, or is that dashboard-only?
- What's the granularity range (daily/weekly/monthly)?
- Are filters/segments universally available or chart-specific?

---

## Wed 2026-04-22 — V2 monorepo carve-out

Completed the monorepo conversion to pnpm workspaces:
- moved `web/` → `apps/dashboard/`
- carved `src/api/client.ts` + `src/types/index.ts` into `packages/charts-sdk`
- moved deterministic engine to `core/signals`
- moved fixtures to `core/fixtures/dark-noise`
- rebuilt CLI as `apps/cli`
- added `packages/charts-mcp`
- added `core/ai` with deterministic + OpenRouter providers
- added nightly prerender workflow

Judgment calls:
- used canonical chart slug aliases in the SDK (`active_subscriptions` → `actives`, etc.) so the package is forgiving across RevenueCat naming conventions and the fixture slug set already in the repo
- kept `core/signals` and `core/ai` as shared source modules, not separate published packages, to minimize workspace overhead and keep imports simple for the take-home
- added `react-router-dom` to `apps/dashboard` because the parallel dashboard redesign already depended on it; this fixed the dashboard build without touching `App.tsx` or `styles.css`
