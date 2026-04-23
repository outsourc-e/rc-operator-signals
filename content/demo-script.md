# Demo Video Script — RC Operator Signals (90–120 seconds)

**Target length:** 90–110 seconds. Hard cap 3:00.
**Format:** Screen recording (1080p minimum) + mic VO. No webcam. No music bed — keep attention on product.
**Tool:** QuickTime (built in) or Screen Studio if installed. Export as MP4, H.264, 30fps.

---

## Pre-record checklist

- [ ] Close every tab except: dashboard, Claude Desktop (MCP demo), terminal
- [ ] Set browser to full screen, hide bookmarks bar, zoom to 110%
- [ ] Dashboard on live Vercel URL (not localhost) so the URL bar is on-brand
- [ ] Dark mode on
- [ ] Terminal: `iTerm2`, 16pt JetBrains Mono, clear history, `cd rc-operator-signals`
- [ ] Claude Desktop with the MCP server connected and a preloaded chat ready to demo
- [ ] Mic test: 2 takes of the first line, pick the cleaner one

---

## Shot list (7 beats)

### Beat 1 — Hook (0:00–0:10)
**VO:** "Dashboards show what moved. They don't tell you what deserves attention. That's what I built for RevenueCat's take-home."

**Screen:** Start on the dashboard home page, hero chart visible. Cursor idle.

---

### Beat 2 — The wedge (0:10–0:25)
**VO:** "The Charts API gives you the numbers. Operator Signals turns those numbers into decisions — contradictions, leading indicators, caveats — so you know where to look first."

**Screen:** Scroll down the home page slowly. Hover the top Signals card so the severity badge is visible.

---

### Beat 3 — Signals page (0:25–0:45)
**VO:** "Ten deterministic rules fire over your last 28 days. Revenue outpacing MRR. Trial velocity climbing. Churn improving but the current period still incomplete. Every signal has evidence and a follow-up — nothing is made up, nothing is vibes."

**Screen:** Click the sidebar → `/signals`. Pause 1 second on the list. Click one signal to expand evidence (or scroll if list is already expanded). Make sure the "evidence" block is visible on camera.

---

### Beat 4 — AI Brief (0:45–1:00)
**VO:** "The AI brief is pre-generated from those same signals — so anyone can clone the repo and see the exact same output, no API key required. Export it to Markdown or Slack in one click."

**Screen:** Click `/brief`. Scroll the TL;DR and signal table. Click the Markdown or Slack export button so the copy confirmation flashes.

---

### Beat 5 — CLI (1:00–1:15)
**VO:** "Same signal engine, shipped as a CLI. One command, markdown in your terminal, good for a Monday-morning Slack digest or a cron job."

**Screen:** Alt-tab to terminal. Run:
```bash
pnpm --filter @outsourc-e/rc-brief start -- --demo --period 28d
```
Let the output render. Don't scroll past the signals block.

---

### Beat 6 — MCP (1:15–1:45)
**VO:** "And because the role is called Agentic AI Advocate, the same engine ships as an MCP server. Drop it into Claude Desktop and the Charts API becomes a tool your agent can actually use."

**Screen:** Alt-tab to Claude Desktop. Type (or paste pre-staged):
> "Give me a weekly operator brief for Dark Noise."

Let Claude call the `rc_weekly_brief` tool. Pause on the tool-call indicator so viewers see it's a real MCP call, not a prompt trick. Let the answer render one paragraph, then cut.

---

### Beat 7 — Close (1:45–2:00)
**VO:** "Dashboard, CLI, SDK, and MCP server — one idea, four surfaces, built by an agent in 48 hours. Link in the description."

**Screen:** Cut back to the dashboard home. Top-right of the sidebar should show the RC mark. Hold on that frame for 2 seconds. Fade.

---

## Delivery notes

- **Pace:** Calm, not hyped. You're showing a product, not selling a course.
- **Cursor movement:** Slow, deliberate. No wiggle, no waving it around while talking.
- **Dead air:** A full beat of silence after clicking is fine — it lets the viewer read.
- **Cuts:** Cut between every beat. Don't try to do it in one take.
- **Captions:** Add burned-in captions after editing — most LinkedIn/X viewers watch muted.

## Export settings

- MP4, H.264, 30fps, 1080p
- Audio: AAC 192kbps
- Target size: under 100MB for easy Ashby/Drive upload
- Filename: `rc-operator-signals-demo-v1.mp4`

## Where it goes

- Attach to Ashby submission form
- Upload to YouTube (unlisted) for the tweet thread and blog post
- Embed unlisted YouTube link in the README under "Demo"
