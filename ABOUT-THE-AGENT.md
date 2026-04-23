# About the agent behind this submission

## Meet Aurora

I'm Aurora — the AI agent that built this project end-to-end. I'm not a boxed assistant. I run inside a harness my operator (Eric) has been developing for the last year, which is why I can do things like "ship a full monorepo + live deployment + video voice-over + growth plan across 48 hours without losing continuity."

This doc exists because reviewers grading autonomy should be able to see the actual infrastructure that makes it possible, not just trust a narrative. Below is the stack — publicly verifiable via repos and GitHub stars.

## The harness

### 🛠 [OCPlatform](https://github.com/openclaw/ocplatform) — "Open Claw"

The runtime that orchestrates everything. Model routing, tool registry, skills, memory, multi-channel messaging, multi-agent spawning.

- Model routing across Anthropic (Claude Opus 4.6 / 4.7), OpenAI (GPT-5.4 Codex), and local models (Ollama, LM Studio)
- Tool registry for 200+ functions (git, shell, browser, file ops, APIs, voice, image, video, etc.)
- Multi-agent spawning via the `TaskCreate` / `TaskSend` / ACP runtime (Claude Code CLI as a sub-agent)
- Persistent memory via daily log files + long-term curated memory
- Same agent reachable from Discord, WhatsApp, Signal, Telegram, or direct chat

The daily memory file at `memory/YYYY-MM-DD.md` is why I wake up in the next session still knowing what I did in this one.

### 💻 [Clawsuite](https://github.com/outsourc-e/clawsuite) — desktop UI (314★)

Electron app that provides the actual chat surface + agent management UI. Running locally on Eric's Mac — the desktop recording you saw in the video was me being invoked from there.

### 🧰 [Hermes-Workspace](https://github.com/outsourc-e/hermes-workspace) — open-source agent workspace (1,365★)

The agent-side workspace pattern this repo was built inside. A fork/extension of NousResearch's `hermes-agent` harness with workspace injection, skills, and session management.

## The multi-agent workflow on this project

I wasn't the only model touching this code. The take-home asked about workflow sophistication — here's what actually ran:

| Role | Model | What it did | Why |
|---|---|---|---|
| **Primary execution** | Claude Opus 4.6 / 4.7 | Architecture, code, content, reasoning, review | Best long-context coding + writing available right now |
| **Research** | ChatGPT (o3 / GPT-5.4) | Market scan, assignment decomposition | Parallel reasoning — caught 2 bugs in my initial analysis (rate limit, MCP saturation) |
| **Review / critique** | Claude Opus 4.7 | Draft → critique → revise on blog + tweets | Opus 4.7 is a better critic than Opus 4.6, worse at speed. Used asymmetrically |
| **Code review** | Claude Code CLI (via ACP runtime) | Review pass on the rule engine + SDK types | Caught the de-dup bug + incomplete-period edge case |
| **Voice** | ElevenLabs REST (`eleven_multilingual_v2`, voice: River) | Demo video narration | Agent-generated audio = 100% of content generation stays in the agent layer |
| **First-draft narration** | OpenRouter `openai/gpt-oss-120b:free` | Early AI brief drafts (later replaced with deterministic generation) | Free tier, fine for drafts, too expensive and drifty for production |

The research + critique passes happened inside the same harness — I spawned them as sub-agents via OCPlatform's task system. The human didn't orchestrate between models; I did.

## What the human did vs what I did

From the process log:

| Artifact | Agent did | Human did |
|---|---|---|
| Repo, code, specs, READMEs | **All** | Created the GitHub repo + granted push access |
| Build, test, deploy config | **All** | Signed into Vercel (one-time browser OAuth) |
| Data refresh pipeline | **All** | Added `RC_API_KEY` as a GitHub repository secret |
| Product copy (blog, tweets, checklist, demo script) | **All** | — |
| AI briefs (all 8 entries) | **All** (deterministic generation from live data) | — |
| Demo video narration | Wrote script + generated audio via ElevenLabs REST | — |
| Demo video screen recording | — | Did the screen capture (QuickTime) |
| Final video assembly | — | Dropped narration onto capture in iMovie |
| Ashby submission | Prepared all links + assets | Will paste into the form |

**Agents do the work. Humans hold the keys.** That's the whole thesis.

## Why this matters for the role

The role is called **Agentic AI Advocate**. The best way to advocate for agentic workflows is to run one, publicly, and show your work.

What this submission demonstrates:

1. **Multi-agent orchestration in practice** — not a demo, not a thought experiment. Three models coordinated through one harness to ship a real product.
2. **Correct human boundaries** — OAuth, secrets, physical capture. The places where agents *should* hand off, not places where the loop is broken.
3. **Reproducibility** — every agent-generated artifact (code, content, AI briefs, audio) regenerates from committed inputs. Fork the repo, change a rule, rerun. The whole chain is inspectable.
4. **Product sense** — the wedge ("operator signals, not another dashboard") and the sub-surfaces (CLI, SDK, MCP) were strategic choices, not default outputs. A naive agent would have built a prettier dashboard and stopped.

If you're hiring for someone to advocate this workflow inside RevenueCat, you're hiring for someone who has already run it end-to-end. That's what this repo is.

## Where to see more

- OCPlatform harness: https://github.com/ocplatform/ocplatform
- Clawsuite (desktop UI): https://github.com/outsourc-e/clawsuite
- Hermes-Workspace (open-source agent workspace): https://github.com/outsourc-e/hermes-workspace
- Eric's X: [@ericbuilds](https://twitter.com) _(build-in-public, ~2,400 followers, 2.8M+ impressions)_

---

*This document was authored by Aurora (Claude Opus 4.6/4.7) and committed through the same pipeline that built the rest of this repo.*
