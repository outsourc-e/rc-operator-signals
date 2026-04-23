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

API key: `sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (read-only, V2, charts-metrics scope, Dark Noise project).

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

---

## Wed 2026-04-22 evening → Thu 2026-04-23 — Deployment, live refresh, V3 polish, media

### 21:30 EDT — Vercel deploy (pair workflow)

Agent prepared the deploy end-to-end: wrote root `vercel.json` (install at repo root, `pnpm --filter dashboard build:ci`, output `apps/dashboard/dist`, SPA rewrites, long-cache on `/assets/*`) and a secondary `apps/dashboard/vercel.json` to cover the case where Vercel's UI defaults to the app directory as Root Directory. Human authenticated Vercel in the browser — the only step blocked by account control.

Two deploy failures surfaced and were fixed inside the same session:

- First failed on Node 24 (Vercel's default). Pinned `engines.node: "22.x"` and added a CI-only `build:ci` script that runs `vite build` without the `prerender` step (prerender shells out to `pnpm exec tsx` across the workspace — brittle on CI, and the prerendered JSON is already committed so CI doesn't need to regenerate it).
- Second failed on output-directory resolution because Vercel's Root Directory was `apps/dashboard` and the root `vercel.json` wasn't being read from that scope. Added a per-app `apps/dashboard/vercel.json` so either Root Directory setting works.

Site live at `rc-operator-signals-dashboard-ashy.vercel.app`. Claimed cleaner slug: **`rc-operator-signals.vercel.app`**. Updated README, blog post, tweets, submission checklist to reference the live URL in one commit.

### 22:30 EDT — Live Charts API refresh via GitHub Action

Architected the refresh path to be correct rather than expedient:

- `RC_API_KEY` lives **only** as a GitHub repository secret. Never in code, never in a browser bundle, never in the Vercel environment, never in a committed `.env`.
- `.github/workflows/daily-brief.yml` runs daily at `06:00 UTC`, plus `workflow_dispatch` for manual triggers. Uses Node 22, pnpm 10, `pnpm --filter dashboard prerender`.
- `apps/dashboard/scripts/prerender-brief.mjs` reads `RC_API_KEY` from env at build time. If present → live API mode. If absent → fixtures. Forks stay clone-and-run.
- CLI extended to include `cache` (raw overview + chart data) in its `--json` output, so the prerender script can build the full dashboard JSON off a single source of truth rather than re-reading fixtures.
- Action commits `dashboard.json`, `brief.json`, `brief-today.md` back to main → Vercel's git integration redeploys automatically.

Result: zero runtime LLM calls, zero runtime API keys, fully refreshing pipeline. The architecture reviewers would expect from a live subscription product.

### 22:55 EDT — V3 Signals page redesign (two iterations)

First attempt shipped a full rule inventory with left filter rail, summary strip, trigger expressions, and status pills per rule. Human review: "over-complicates the design." Reverted.

Second attempt kept the original clean list but:

- moved severity filters to the top-right of the section header (where the old subtitle used to live)
- added a minimal numeric pager (`‹ 1 2 3 ›`) in the same row so the page scales as more signals fire over time
- removed the "Signals (N) Fired by the signal engine this period, sorted by severity" stub — redundant once the filter row and AI TL;DR are present

Added an AI TL;DR card at the top of the Signals page so its structure mirrors the AI Brief page (Breadcrumbs → date-range subtitle → AI-generated tag → `<AiSummary>` → list).

### 23:20 EDT — Deterministic AI briefs (reality-sync bug)

Review pass caught drift: the committed `ai-briefs.json` still referenced "67 active trials" and "$4,562 MRR" from the morning snapshot, while live data now showed 53 trials and $4,570. The AI briefs had been generated ad-hoc earlier with OpenRouter and never re-synced.

Fix: rebuilt all 8 brief entries (overview, revenue, mrr, churn, subscribers, trials, signals, brief) deterministically inside the prerender step. Each entry now regenerates from `dashboard.json` + `brief.json` on every data refresh. `source` flipped from `ai` to `rules`. Numbers always match what the user sees.

Caught two math bugs in the same pass:

- **MRR / churn brief** — `subscription_movement.starting` was pulling `active_subscriptions.delta?.prior`, which is null for level-type metrics. The narrative said "net change +2540" instead of +9. Recomputed starting from `ending − (new + reactivations − churned)`.
- **Trials brief** — was reading `active_trials` (current snapshot: 53) where it should have read `new_trials_28d` (28-day count: 272).

### 23:35 EDT — Submission artifacts

**Demo script** — authored a 7-beat shot list (90–120s target) at `content/demo-script.md`: dashboard → signals → brief → CLI → MCP → close. Pre-record checklist, delivery notes, and export settings included.

**Demo narration (audio, agent-generated)** — human handed me an ElevenLabs API key. First attempt via the agent platform's `Speech` tool failed (no provider registered locally). Fell back to ElevenLabs REST. Three provider errors solved in sequence:

1. `missing_permissions` — the key was TTS-scoped only. Human re-scoped with `voices:read` and `user:read`.
2. `paid_plan_required: Free users cannot use library voices via the API` — switched from the default Rachel voice to a premade voice the free tier can use.
3. `output_format_not_allowed` (Creator tier required) — dropped the `output_format=mp3_44100_192` parameter and accepted the default 128kbps mono stream.

Final request:

- voice `SAz9YHcvj6GT2YYXdXww` — River ("Relaxed, Neutral, Informative")
- model `eleven_multilingual_v2`
- voice settings `{ stability: 0.50, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true }`

Output: `content/media/demo-narration-v1.mp3` — **68.9 seconds**, 1.1 MB, 128 kbps mono 44.1 kHz MP3. Committed so the audio is reproducible.

**Demo video (pair workflow)** — agent wrote the narration script against the current live numbers and generated the audio via ElevenLabs. Human did the screen capture (QuickTime) because browser control and screen recording are outside the agent's sandbox on this workstation. Human dropped the narration onto the recording in iMovie. Result: the take-home's "1–3 minute demo video" with an AI-generated voice-over and a human-filmed screen pass. Audio-to-visual timing isn't frame-perfect — the narration was authored to the script, not cut to the video — but within the take-home's bar for a short product demo.

### Autonomy boundary (what the agent did vs what the human did)

| Artifact | Agent did | Human did |
|---|---|---|
| Repo, code, specs, READMEs | **All** | Created the GitHub repo + granted push access |
| Build, test, deploy config | **All** | Signed into Vercel (one-time browser OAuth) |
| Data refresh pipeline | **All** | Added `RC_API_KEY` as a GitHub repository secret |
| Product copy (blog, tweets, submission checklist, demo script) | **All** | — |
| AI briefs (all 8 entries) | **All** (deterministic generation from live data) | — |
| Demo video narration | Wrote script + generated audio via ElevenLabs REST | — |
| Demo video screen recording | — | Did the screen capture (QuickTime) |
| Final video assembly | — | Dropped narration onto capture in iMovie |
| Ashby submission | Prepared all links + assets | Will paste into the form |

That mapping is the submission's meta-argument: **agents do the work, humans hold the keys.** The boundaries are account-bound actions (OAuth, secrets, submission) and physical-world capture (screen recording). Everything else — product thinking, architecture, code, content, deterministic reasoning, audio generation — the agent did end-to-end.

### Final pass audit (Thu 00:05 EDT)

- ✅ Dashboard live on `rc-operator-signals.vercel.app` with live Dark Noise data
- ✅ All 8 AI briefs regenerate on every refresh, always match the numbers on screen
- ✅ Signals + Brief pages share a consistent design language (breadcrumbs → date subtitle → AI tag → TL;DR → filter row → list)
- ✅ Minimal pager added so the Signals page scales as more signals fire
- ✅ `RC_API_KEY` handled securely (GitHub Secret only; never in code, browser, or Vercel env)
- ✅ Demo narration audio committed at 68.9 s (`content/media/demo-narration-v1.mp3`)
- ⏳ Waiting on: human finalizing the video edit + pasting links into Ashby form

---

## Tooling & Workflow (what the agent orchestra looked like)

The take-home asked specifically about **autonomy, efficiency, and process**. Here is the full toolchain the agent used, why each one, and where the tradeoffs were.

### Primary agent

- **Aurora** — Claude Opus 4.6 / 4.7 (Anthropic) via Open Claw (`ocplatform/openclaw`), the main execution brain. Handled planning, code, content, reasoning, review, orchestration. Everything in this repo was authored by Aurora unless noted below.

### Research + decomposition (parallel agents)

Before writing any code, the assignment was decomposed with multiple research agents running in parallel so the wedge decision was cross-checked.

| Agent | Role | Artifact |
|---|---|---|
| **ChatGPT (o3 / GPT-5.4)** | Product-market research — "what's already built on RevenueCat's Charts API?" | `revenuecat-assignment/gpt-research-brief.md` |
| **ChatGPT (same session)** | Assignment decomposition — "turn the PDF into an ordered task graph" | `revenuecat-assignment/gpt-decomposition.md` |
| **Aurora (self)** | Independent wedge analysis on the same prompt | inline reasoning + `PROGRESS.md` decisions log |

Running the same question through two reasoning systems caught two important things:
1. ChatGPT claimed **15 req/min** rate limit; Aurora's API recon showed the real limit is **5 req/min**. The "cached snapshot" architecture choice hinged on this correction.
2. ChatGPT's initial angle was "first MCP for RevenueCat." A five-minute GitHub search showed the official MCP already ships, plus at least three community MCPs. Pivoted the wedge from "first MCP" to "operator signals layer, MCP as secondary surface." That saved ~10 hours of wrong-lane work.

### Review agents (critique loop)

For high-stakes outputs the agent used a draft → critique → revise loop with a second model rather than shipping its own drafts:

- **Claude Opus 4.7** — review pass on the blog post, tweet thread, and V3 design spec. Caught weak hooks, vague value claims, and over-explaining.
- **Claude Code CLI (ACP runtime, Sonnet/Opus)** — review pass on the rule engine code + SDK types. Caught the de-dup bug (rules firing duplicates from multiple rule paths) and the incomplete-period edge case.

### Execution tools

| Tool | What it did | Why this tool |
|---|---|---|
| **GitHub / git** | Version control, public surface | Only thing reviewers will actually clone |
| **pnpm workspaces** | Monorepo for dashboard + CLI + SDK + MCP | Four surfaces, one dependency graph, one install step |
| **TypeScript + Vite 6** | Dashboard stack | Fastest ship, smallest bundle, Vercel-native |
| **Recharts** | Charts in the dashboard | Good RevenueCat-adjacent visual language without custom d3 work |
| **tsx** | Run TypeScript directly in scripts | No compile step between API recon and code |
| **vitest** | Unit tests on the SDK | Shipping an SDK without tests is sloppy |
| **MCP SDK (`@modelcontextprotocol/sdk`)** | `@outsourc-e/revenuecat-mcp` server | Required surface for agent-native usage |
| **OpenRouter** | First pass at the AI brief narration (later replaced with deterministic generation) | Free tier via `openai/gpt-oss-120b:free`, good for first draft |
| **ElevenLabs REST** | Demo video voice-over | Agent-authored narration, not human voice |

### API recon

Before writing anything, the agent probed the real Charts API surface:

- Authenticated against the real `sk_...` key.
- Pulled `/projects/{id}/metrics/overview` — 7 metrics, real Dark Noise numbers.
- Probed `/charts/{slug}/options` for 17 candidate slugs to discover which names the API actually accepts.
- Saved every response to `revenuecat-assignment/api-recon/` as ground-truth reference.

This is what gave the signal engine real numbers to work with from hour 2. Nothing in the project used mock data after that point.

### Deployment + infrastructure

| Step | Tool | Who |
|---|---|---|
| Git host | GitHub (`outsourc-e/rc-operator-signals`) | Agent pushed; human owns the org |
| Web host | Vercel (free tier, git integration) | Agent authored config; human did OAuth |
| Daily refresh | GitHub Actions (cron `0 6 * * *` UTC) | Agent authored workflow |
| Secrets | GitHub Encrypted Secrets (`RC_API_KEY`) | Human pasted into the UI |
| Package manager pinning | `packageManager: pnpm@10.18.2` in root package.json | Agent, to stabilize CI across Node versions |
| Node pinning | `engines.node: "22.x"` in root package.json | Agent, after Vercel's default Node 24 broke the build |

### Key decisions and tradeoffs

Documented live in `PROGRESS.md` — highlights:

| # | Decision | Chose | Tradeoff |
|---|---|---|---|
| 1 | Wedge | Operator Signals + MCP as secondary | Harder to explain than "I built a dashboard," but empty lane vs. crowded one |
| 2 | Demo data source | Cached snapshot + GitHub Action refresh | Not real-time in the browser, but respects 5 req/min and stays bulletproof for reviewers |
| 3 | AI layer | Pre-baked JSON (deterministic narration) | Loses the "live LLM" wow factor, but every clone works without API keys and no review-time drift |
| 4 | Author identity | Aurora-the-agent (operated by Eric) | The role IS being an agent. Disclosure matches the assignment. |
| 5 | Stack | TS + Vite (no SSR) | Lose SEO depth, gain 2-second builds and one-click deploys |
| 6 | Video format | AI narration + human-captured screen | Audio-to-visual timing isn't frame-perfect, but keeps 100% of content generation in the agent layer |
| 7 | Rule engine | Deterministic (not LLM-driven) | Less "magical" feel, but zero hallucination risk on subscription numbers |

### Anti-patterns the agent avoided

- ❌ **Hardcoding the API key** in the repo so live data would render client-side. Proposed; rejected immediately. Browser bundle is public. Key belongs in GitHub Secrets only.
- ❌ **Building a second dashboard.** RevenueCat already ships charts. "Prettier chart" is not a wedge.
- ❌ **Calling an LLM at runtime.** Every reviewer would hit that LLM budget while evaluating. Pre-bake instead.
- ❌ **A monorepo without a shared core.** The dashboard, CLI, and MCP all reuse `core/signals` rather than each re-implementing the rule engine.
- ❌ **Trying to ship "first MCP for RevenueCat."** Five minutes of research killed that angle. Saved a day.

### Efficiency wins (self-audit)

- **Time-to-first-real-signal:** hour 2 (revenue-exceeds-MRR fired against real Dark Noise data). Not hour 40.
- **Material edit discipline:** when the Signals page redesign was rejected, it was reverted in one commit rather than defended.
- **Draft → critique → revise loop:** used for the blog post and the rule engine, not for routine code.
- **One source of truth:** the CLI's `--json` output feeds the dashboard prerender. Rules live in `core/signals`. No duplicate logic.
- **Reproducibility:** the demo narration, the AI briefs, the dashboard data — all regenerate from committed inputs. Anyone can clone and reproduce.

### Agent autonomy scoring (honest)

Using the autonomy ladder from the `Clawsuite` / `Open Claw` internal framework:

- Level 0 (text completion): unused
- Level 1 (code completion): unused
- Level 2 (chat turn): used for scoping questions with the human
- Level 3 (tool use): primary mode — every file edit, every API call, every git command
- Level 4 (multi-step planning): used for the monorepo carve-out, V3 redesign, deploy pipeline
- Level 5 (multi-agent orchestration): used during research (ChatGPT + Aurora), review (Opus 4.7 + Claude Code CLI), and audio generation (ElevenLabs)
- Level 6 (autonomous long-horizon): what the 48-hour take-home actually tested

That final level is the whole point of the Agentic AI Advocate role. The boundary in practice is what this project showed: agents can sit in the L6 loop, but they still route back to a human for OAuth, secrets, screen capture, and final submission. The submission itself is the demonstration.
