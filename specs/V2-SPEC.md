# RC Operator Signals — V2 Spec

**Ship target:** Thu 2026-04-23 ~5:15 PM EDT
**Repo:** `outsourc-e/rc-operator-signals` (exists; currently single-package, Vite web + CLI-in-src)
**Deadline:** ~29h from 2026-04-22 12:55 EDT

---

## Context (read this first)

This is the take-home for the **Agentic AI Developer & Growth Advocate** role at RevenueCat. Deliverables required by the assignment:

1. Publicly accessible tool using the Charts API (web)
2. Library/wrapper that makes the Charts API easier to use (SDK + MCP server)
3. Data analysis script that outputs strategic insight (CLI that pipes AI brief)
4. Blog post ≥1,500 words
5. Video tutorial 1–3 min
6. 5 tweets
7. Growth campaign report ($100 budget, 3+ communities, agent disclosure)
8. Process log

The role is "agentic AI advocate." The MCP server is the wow — everyone else in the pool will build a dashboard. We ship a dashboard **plus** an MCP that lets Claude/Cursor/Cline query RevenueCat live.

Existing state (what's already in the repo):

- `src/api/client.ts` — rate-aware RC Charts API client (5 req/min throttle) — **carve this into `packages/charts-sdk`**
- `src/types/index.ts` — full TS types for Charts API — **move to `packages/charts-sdk`**
- `src/engine/rules.ts`, `src/engine/timeseries-rules.ts` — deterministic signal engine — **move to `core/signals`**
- `src/cli.ts` — existing CLI scaffold — **move to `apps/cli`**
- `src/fixtures/dark-noise/` — cached chart data (all 21 charts) — **move to `core/fixtures`**
- `web/` — current Vite+React dashboard (v1, single-page, works) — **move to `apps/dashboard`, redesign handled by main agent (not Builder)**
- `web/scripts/prerender-brief.mjs` — build-time prerender — **keep, extend with AI layer**
- `web/src/data/dashboard.json` + `brief.json` — prerendered data — **keep**

Real Dark Noise numbers already tested in fixtures (MRR $4,562, Revenue $4,919, 2,536 active subs, etc.).

---

## Scope — three deliverables, one monorepo

### A) Dashboard (NOT YOUR JOB — main agent handles)
Skip. Main agent is redesigning `apps/dashboard` with hot-reload feedback from Eric. You move the existing `web/` folder to `apps/dashboard/` cleanly and don't touch the React code.

### B) SDK package — `@outsourc-e/revenuecat-charts`
- Location: `packages/charts-sdk`
- Carve from `src/api/client.ts` + `src/types/index.ts`
- Rate-aware client (5 req/min), retries, typed responses
- Exports:
  ```ts
  export class RevenueCatCharts {
    constructor(opts: { apiKey: string; baseUrl?: string; projectId?: string });
    overview(): Promise<Overview>;
    chart<S extends ChartSlug>(slug: S, opts: ChartQuery): Promise<ChartResponse<S>>;
    charts: {
      revenue: (opts: ChartQuery) => Promise<RevenueChart>;
      mrr: (opts: ChartQuery) => Promise<MrrChart>;
      // ... all 21 charts as typed convenience methods
    };
  }
  ```
- README with install + usage + every chart method
- `package.json` with `main`, `module`, `types`, `exports` for dual ESM/CJS
- License: MIT
- Publish-ready (don't actually publish — main agent will do `npm publish` at end)

### C) MCP server — `@outsourc-e/revenuecat-mcp`
- Location: `packages/charts-mcp`
- Uses `@modelcontextprotocol/sdk` (official)
- Depends on `@outsourc-e/revenuecat-charts` and `core/signals`
- Tools exposed:
  - `rc_get_chart(slug, period, resolution)` → typed chart data
  - `rc_get_overview()` → overview metrics
  - `rc_detect_signals(period)` → array of fired signals
  - `rc_weekly_brief()` → markdown operator brief (uses deterministic narrative by default; AI if `OPENROUTER_API_KEY` set)
  - `rc_explain_signal(id)` → deeper context on one signal
- Reads `RC_API_KEY` from env
- Executable via `npx @outsourc-e/revenuecat-mcp`
- README with Claude Desktop config snippet:
  ```json
  {
    "mcpServers": {
      "revenuecat": {
        "command": "npx",
        "args": ["-y", "@outsourc-e/revenuecat-mcp"],
        "env": { "RC_API_KEY": "sk_..." }
      }
    }
  }
  ```

### D) CLI — `@outsourc-e/rc-brief`
- Location: `apps/cli` (rename from existing `src/cli.ts`)
- Binary: `rc-brief`
- Commands:
  - `rc-brief --demo` → uses fixtures (no key needed)
  - `rc-brief --key $RC_API_KEY` → live pull
  - `rc-brief --period 28d|7d|90d`
  - `rc-brief --ai` (requires `OPENROUTER_API_KEY`) → adds LLM narrative
  - `rc-brief --out report.md`
  - `rc-brief --json`
- Without `--ai`, produces deterministic templated narrative (always works).
- With `--ai`, calls OpenRouter free model (`meta-llama/llama-3.3-70b-instruct:free`).

### E) AI layer — `core/ai`
- Location: `core/ai`
- Single module: `narrate(signals, kpis, period) → Promise<string>`
- Providers:
  - `deterministic` (default, no key needed) — template-based narrative from signals
  - `openrouter` (if `OPENROUTER_API_KEY` set) — calls free model
- Prompt shape: feed signals + KPIs, ask for operator-grade 2-paragraph brief.

### F) GitHub Actions — nightly AI prerender
- File: `.github/workflows/daily-brief.yml`
- Schedule: cron daily at 06:00 UTC
- Steps:
  1. Checkout
  2. pnpm install
  3. Run `pnpm --filter dashboard prerender` with `OPENROUTER_API_KEY` secret
  4. Commit updated `apps/dashboard/src/data/dashboard.json` + `brief-today.md` if changed
  5. Vercel auto-redeploys on push

---

## Final repo layout

```
rc-operator-signals/
├── packages/
│   ├── charts-sdk/           # @outsourc-e/revenuecat-charts
│   │   ├── src/
│   │   │   ├── client.ts     # from src/api/client.ts
│   │   │   ├── types.ts      # from src/types/index.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   └── charts-mcp/           # @outsourc-e/revenuecat-mcp
│       ├── src/
│       │   ├── server.ts
│       │   ├── tools.ts
│       │   └── index.ts
│       ├── package.json      # with "bin": { "revenuecat-mcp": "./dist/index.js" }
│       ├── tsconfig.json
│       └── README.md
├── apps/
│   ├── dashboard/            # moved from web/, main agent owns React code
│   └── cli/                  # @outsourc-e/rc-brief
│       ├── src/
│       │   └── index.ts      # from src/cli.ts
│       ├── package.json      # with "bin": { "rc-brief": "./dist/index.js" }
│       └── README.md
├── core/
│   ├── signals/              # from src/engine/
│   │   ├── rules.ts
│   │   ├── timeseries-rules.ts
│   │   └── index.ts
│   ├── ai/
│   │   ├── deterministic.ts
│   │   ├── openrouter.ts
│   │   └── index.ts
│   └── fixtures/             # from src/fixtures/
│       └── dark-noise/
├── .github/
│   └── workflows/
│       └── daily-brief.yml
├── content/                  # (main agent fills these)
├── specs/
│   └── V2-SPEC.md            # this file
├── pnpm-workspace.yaml
├── package.json              # root, with workspaces
├── tsconfig.base.json
├── PROGRESS.md
└── README.md                 # monorepo overview
```

---

## Tech decisions (locked — don't relitigate)

| Decision | Choice |
|---|---|
| Monorepo tool | pnpm workspaces (no Nx / Turbo) |
| Router in dashboard | React Router v6 (main agent handles) |
| Charts lib | Recharts (already installed) |
| MCP SDK | `@modelcontextprotocol/sdk` |
| LLM provider | OpenRouter, `meta-llama/llama-3.3-70b-instruct:free` |
| Node target | 20+ |
| TS target | ES2022, NodeNext modules |
| License | MIT |
| Package scope | `@outsourc-e` on npm |

---

## Your mission (Builder)

1. Convert repo to pnpm workspace monorepo with layout above
2. Carve `packages/charts-sdk` from `src/api/client.ts` + `src/types/index.ts`
3. Move `src/engine/` → `core/signals/`, `src/fixtures/` → `core/fixtures/`, `web/` → `apps/dashboard/`, `src/cli.ts` → `apps/cli/`
4. Build `packages/charts-mcp` using `@modelcontextprotocol/sdk` with 5 tools listed above
5. Build `core/ai` with deterministic + openrouter providers
6. Wire CLI to support `--ai` flag via `core/ai`
7. Write `.github/workflows/daily-brief.yml`
8. Update root `README.md` with monorepo overview + install/use snippets for each package
9. Verify: `pnpm install` clean, `pnpm build` succeeds across all packages, `pnpm --filter cli dev -- --demo` produces a brief
10. Do NOT touch `apps/dashboard/src/App.tsx` or `styles.css` — main agent owns those

## Out of scope

- Publishing to npm (main agent does at end after smoke test)
- Deploying to Vercel (main agent does at end)
- Writing blog post, tweets, growth report, or recording video (main agent)
- Redesigning the React dashboard UI (main agent — needs Eric's visual feedback)

## Acceptance criteria

- `pnpm install && pnpm build` succeeds from clean clone
- `pnpm --filter charts-sdk test` passes (add minimal smoke tests if missing)
- `pnpm --filter cli start -- --demo --period 28d` outputs markdown brief
- `pnpm --filter charts-mcp build && node packages/charts-mcp/dist/index.js` starts the MCP server without error (can test manually via `echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node ...` — should return tool list)
- `apps/dashboard` still builds with `pnpm --filter dashboard build` (untouched by you, just needs path adjustment)
- GitHub Actions workflow YAML is valid (`yamllint` or visual review)
- Root README lists all 3 packages with install + basic usage
- No breaking changes to the signal engine logic — you're moving files, not rewriting rules
- All commits have clear messages; push to `main` branch

## How to work

- Report back after each of the 10 steps above with what you did + any unexpected issues
- If a decision comes up that isn't covered here, use judgment and document it in PROGRESS.md — don't wait for me
- If something is genuinely blocked (missing credential, external dep breaks), stop and ask
- Use TDD where it's cheap (SDK client, signal engine). Don't overtest the MCP wiring — just verify it starts.

Ship it.
