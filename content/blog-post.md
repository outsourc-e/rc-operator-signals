# I set my AI agent loose on RevenueCat's 48-hour take-home. Here's what it shipped.

48 hours. 4 deliverables. 1 agent.

RevenueCat posted a role called **Agentic AI Advocate**. The take-home was unusually well-designed because it didn't just ask for code. It asked for the whole loop: build a public tool, write the launch post, create content, propose a growth plan, and document the process.

In other words, the assignment wasn't "can you call an API?" It was closer to: **can an agent identify a wedge, ship a product, explain it clearly, and turn it into distribution?**

So I did the obvious thing. I pointed my AI agent at the brief and let it work.

What came out of that process is **RC Operator Signals**, a small product built on top of RevenueCat's Charts API. It includes:

- a web dashboard,
- a CLI,
- a TypeScript SDK,
- and an MCP server for Claude Desktop, Cursor, and Cline.

The core idea is simple:

> **Dashboards show what moved. Operator Signals shows what deserves attention.**

That became the wedge.

---

## The real problem wasn't "build a dashboard"

The prompt was intentionally open-ended. RevenueCat suggested a few valid lanes: build a boilerplate, build a public tool, build a wrapper library, or build something else genuinely useful for subscription app operators.

The obvious move would have been to make a nice dashboard and stop there.

That would have been fine, but not especially interesting.

RevenueCat already has charts. Founders already have dashboards. And there are already adjacent projects in the wild doing some version of "AI summary for subscription metrics." If the output is just another surface that mirrors existing charts, it's hard to argue that it meaningfully advances the product or teaches the community something new.

The more interesting problem is what happens **after** someone looks at the dashboard.

Subscription operators don't usually struggle with seeing the number. They struggle with deciding what the number means.

A few examples:

- Revenue is up, but MRR is flat. Is that good, or is one-time revenue masking recurring weakness?
- Trials are rising, but paid subscriptions haven't moved yet. Is that momentum, or just noise?
- Churn improved this month, but the current period is incomplete. Can you trust that trend yet?

These are operator questions, not charting questions.

That distinction shaped the whole project.

Instead of building a prettier dashboard, the agent built a system that:

1. reads chart data,
2. detects contradictions, leading indicators, and caveats,
3. writes a structured brief,
4. and exposes the same logic across web, CLI, SDK, and MCP.

That is a more interesting product surface because it sits one layer above raw data. It's not replacing RevenueCat's charts. It's helping someone decide what they should do next.

---

## What shipped

The final repo is a pnpm monorepo with four user-facing artifacts.

### 1. The dashboard

The dashboard is the most visible piece.

It's a React + Vite app with nine pages:

- Home
- Revenue
- MRR
- Subscribers
- Churn
- Trials
- Signals
- AI Brief
- Integrations

It uses RevenueCat-adjacent visual language, but the interaction model is deliberately more operator-focused than chart-focused.

A few examples:

- a welcome card with project context,
- KPI cards with directional deltas,
- a hero chart with combined vs isolated views,
- a dedicated Signals page with severity sorting,
- an AI Brief page that converts the data into a readable weekly memo,
- and an Integrations page that makes the tool feel like a platform, not just a demo.

The important detail is that the dashboard doesn't depend on a live LLM at runtime. The briefs are pre-generated and committed as JSON, so anyone can clone the repo, run it locally, and understand the product without adding an API key.

That turned out to matter a lot.

It makes the project dramatically easier to review, easier to fork, and more believable as a public artifact. It also avoids the common trap where the "AI" layer is the most fragile part of the demo.

### 2. The CLI

The CLI is published as `@outsourc-e/rc-brief`.

Its job is to answer a very different use case than the dashboard.

Some founders don't want a UI. They want a briefing in the terminal, or a markdown file they can drop into Slack every Monday morning.

Example:

```bash
npx @outsourc-e/rc-brief --demo --period 28d
```

That outputs a report like:

```md
# RevenueCat Operator Brief — Dark Noise

> Period: 2026-03-26 → 2026-04-23
> Generated: 2026-04-23T01:20:42.953Z

Dark Noise operator brief — 28d: MRR $4,562, revenue $4,919, churn 18.7%.
2 positive signals: New trials up 16% vs prior 28 days.
Top signal: Revenue exceeds MRR by 7.8%.
Next: audit what changed 3-4 weeks ago, since that is where the current trends were seeded.
```

The CLI supports demo mode, JSON output, markdown output, file writing, and live API mode with a RevenueCat key.

It's the most practical artifact in the repo because it already fits into existing operator habits: cron, Slack, email digests, and weekly review workflows.

### 3. The TypeScript SDK

The SDK exists because the Charts API is useful, but not especially ergonomic if you're trying to build on top of it quickly.

It provides:

- typed chart accessors,
- overview helpers,
- automatic rate limiting,
- retries,
- and normalization around the Charts API response shape.

This matters because the binding constraint for the RevenueCat Charts API isn't code generation. It's the **5 requests per minute** rate limit.

A thin wrapper that ignores that limit isn't actually that helpful. A wrapper that respects it, normalizes endpoints, and makes downstream composition easier is much more useful.

So the SDK became the foundation layer underneath the rest of the project.

### 4. The MCP server

This was the bonus lane, but maybe the most on-theme one.

If the role is literally called **Agentic AI Advocate**, then it should be possible to use RevenueCat data directly inside agent-native workflows.

So the project includes `@outsourc-e/revenuecat-mcp`, an MCP server that exposes five tools:

- `rc_get_overview`
- `rc_get_chart`
- `rc_detect_signals`
- `rc_weekly_brief`
- `rc_explain_signal`

That means a user can connect RevenueCat to Claude Desktop and ask questions like:

- "What's my MRR this month?"
- "Any churn anomalies in the last 28 days?"
- "Give me a weekly operator brief."
- "Why is revenue higher than MRR?"

That's a much more compelling demonstration of the assignment than simply saying "AI could be useful here." It makes RevenueCat feel native to the workflows people are already building around agents.

---

## How the signal engine works

The heart of the project is not the dashboard. It's the signal engine.

The architecture is intentionally simple:

```text
core/fixtures        → sample RevenueCat chart data
core/signals         → deterministic rules
src/data/*.json      → pre-baked dashboard + brief state
apps/dashboard       → reads JSON and renders UI
apps/cli             → generates operator brief
packages/charts-sdk  → typed API access
packages/charts-mcp  → agent-native tool layer
```

The engine consumes recent chart series plus overview metrics and emits structured signals.

Each signal has:

- an id,
- a severity,
- a title,
- a detail string,
- evidence,
- and a recommended follow-up.

One simplified example looks like this:

```ts
if (revenue.value > mrr.value * 1.05) {
  signals.push({
    id: 'revenue_exceeds_mrr',
    severity: 'info',
    title: `Revenue exceeds MRR by ${pct}%`,
    detail:
      '28-day revenue is higher than MRR. That usually means one-time purchases or annual upfront recognition are inflating cash above the recurring base.',
    followup:
      'Break out revenue by entitlement type or billing interval to confirm.'
  });
}
```

The rules currently cover:

- revenue vs MRR divergence,
- new customer density,
- transactions per new customer,
- consecutive-period revenue decline,
- MRR stagnation,
- trial growth,
- churn improvement or deterioration,
- ARPU flatness,
- and incomplete-period caveats.

That last one matters more than people think.

One of the easiest ways to hallucinate confidence in subscription analytics is to over-trust the latest bucket. RevenueCat's current period is often incomplete. If the newest point is provisional, the product should say that loudly.

So the signal engine explicitly flags incomplete data rather than pretending the chart is final.

That design choice reflects the broader philosophy of the project:

> AI should help explain the data, not fabricate certainty.

---

## What the agent got right

A few things worked unusually well.

### It found a wedge instead of just implementing the prompt

The biggest win was reframing the assignment around operator decision-making, not around chart rendering.

That gave the project a clearer identity.

Without that wedge, the repo would have been another competent demo. With it, the whole thing feels more like a product thesis.

### It reused the same core logic across four surfaces

The dashboard, CLI, SDK, and MCP server are different interfaces, but they all derive from the same core data model and rule engine.

That gave the repo more leverage per hour of work.

Instead of four unrelated demos, it became one idea expressed four ways.

### It removed runtime dependencies where possible

Pre-baking the AI briefs into committed files was the right move.

That made the project easier to run, easier to review, and less fragile under time pressure.

If someone clones the repo at 2am before a deadline, it still works.

That is a very underrated quality in AI demos.

---

## Where the agent got stuck

Not everything was elegant.

The session had a few very normal agent failure modes.

### 1. UI iteration threatened to eat the whole project

The dashboard got significantly better over time, but there was definitely a period where visual polish was consuming attention that should have gone to distribution assets.

That is a common trap. Agents can be very productive inside a local hill-climbing loop, especially when the feedback is visual. The danger is that the loop feels like progress even when the marginal gains are getting smaller.

### 2. A few signal outputs were duplicated

At one point the UI showed duplicate signals like "MRR is flat" because the same insight fired from different rule paths.

That got fixed by de-duplicating on title before rendering.

Small bug, but a good reminder: when you're building explanation layers on top of rules, deduplication is not optional.

### 3. Surface polish exposed real product questions

During screenshot review, a few subtle issues showed up:

- axis labels were rendering ugly decimal precision,
- some comparative language like "vs prior" was too faint,
- and a few pages still felt denser than they should.

That was actually useful. The vision audit was less about cosmetics and more about whether the output looked like a product someone would trust.

### 4. Deploy still depends on human auth

The product is build-complete, but Vercel deployment is blocked on login.

That is the honest boundary between autonomous execution and real-world account control. An agent can prep the repo, harden the product, write the launch materials, and make the deployment almost trivial. But if the account isn't authenticated, a human still has to turn the key.

That's not a failure. That's just reality.

---

## What I would do next if this were shipping for real

If this were moving beyond take-home territory, the roadmap is straightforward.

### 1. Live API mode in the dashboard

Right now the dashboard is intentionally static at runtime. That's the right move for a public demo, but a real product should support project auth and live refresh.

### 2. Role-based briefs

The CLI and AI Brief page could support different report modes:

- founder,
- growth,
- finance,
- or product.

Those personas care about the same metrics, but not in the same order.

### 3. Scheduled delivery

The most natural next feature is scheduled Slack, Discord, or email delivery.

A good operator brief shouldn't require someone to remember to open a dashboard.

### 4. Deeper segmentation

The current wedge is strong, but it gets stronger if you can segment by entitlement, product, country, billing interval, or acquisition channel.

The signal engine becomes much more useful when it can say not just "revenue exceeds MRR," but **where** the mismatch is coming from.

### 5. Publish the packages properly

The repo includes package-level READMEs and package structure, but the final publish step still needs to happen.

That would make the SDK, CLI, and MCP server much easier to adopt independently.

---

## Why this assignment was a good test

What I liked about this take-home is that it tests a real modern skill stack.

Not just coding.

Not just writing.

Not just prompt engineering.

It tests whether someone, or something, can:

- identify a real wedge,
- turn it into software,
- make it legible,
- package it for other developers,
- and then create the distribution assets around it.

That is much closer to how useful AI work actually feels in practice.

The interesting part of agentic work is not that the agent can autocomplete code. It's that it can help close the loop between research, product, content, and iteration.

That is what this repo is trying to demonstrate.

---

## Try it

If you want to inspect the project yourself:

- Clone the repo
- Run the dashboard locally
- Try the CLI in demo mode
- Drop the MCP server into Claude Desktop

Repo: `https://github.com/outsourc-e/rc-operator-signals`

Quick start:

```bash
git clone https://github.com/outsourc-e/rc-operator-signals
cd rc-operator-signals
pnpm install
pnpm build
pnpm --filter dashboard dev
```

Then open `http://localhost:5180`.

If you prefer the terminal:

```bash
pnpm --filter @outsourc-e/rc-brief start -- --demo
```

And if you want the agent-native route, wire up the MCP server and ask Claude for a weekly operator brief.

---

## Disclosure

This post was authored as part of an autonomous build workflow for RevenueCat's Agentic AI Advocate take-home. The project, docs, and launch materials were produced by an AI agent with human oversight at the account and submission boundaries.

That feels fitting.

The role is about advocating for agentic workflows. The best way to argue for them is to ship one.
