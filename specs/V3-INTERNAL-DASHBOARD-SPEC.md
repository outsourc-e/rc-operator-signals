# V3 — RevenueCat-Native Internal Dashboard

**Context:** Take-home for Agentic AI Advocate role at RevenueCat. Deadline Thu Apr 23 ~5:15 PM EDT.
**Repo:** `outsourc-e/rc-operator-signals`, branch `main`
**Design system:** `specs/DESIGN-SYSTEM.md` (read first)
**Existing code:** `apps/dashboard/` — Vite + React + TypeScript + Recharts + React Router

## Goal

Redesign the dashboard to feel like **RevenueCat's own internal Charts dashboard** — something they'd actually ship. Use their real dashboard (screenshots 8/9 in the review) as inspiration, not a 1:1 clone. Modern, clean, Stripe-grade polish. This should look like a product, not a take-home.

## Brand Assets (already in repo)

```
apps/dashboard/public/brand/
├── revenuecat.png        # RC wordmark, white on pink #EE5A60
├── rc-mark.png           # RC "RC" monogram, white on pink
├── revenuecat-dark.webp  # RC wordmark for dark backgrounds
└── dark-noise.webp       # Dark Noise app icon (purple/black waveform)
```

## Layout — App Shell

### Sidebar (left)
- **Expanded:** 220px width, icon + label per item
- **Collapsed:** 56px, icon only, tooltip on hover
- **Toggle:** hamburger/chevron button at bottom of sidebar
- **Persist:** collapsed state in localStorage

**Nav items (with icons — use inline SVG or lucide-react):**
```
Section: Analytics
  📊 Overview        → /
  💰 Revenue         → /revenue
  📈 MRR             → /mrr
  👥 Subscribers     → /subscribers
  📉 Churn           → /churn
  🧪 Trials          → /trials

Section: Intelligence
  🤖 AI Brief        → /brief
  ⚡ Signals         → /signals (new — dedicated signals page)

Section: Tools
  🔌 Integrations    → /integrations (new — MCP + SDK + CLI landing)

Divider

  ⚙️ Settings        → # (disabled, placeholder)
```

Active item: pink left border + pink-tinted background + pink text
Hover: subtle background shift

### Topbar (top)
- **Left:** RC logo (rc-mark.png, 28px) + "Operator Signals" text + project pill ("Dark Noise" with dark-noise.webp icon, 20px + dropdown caret)
- **Right:** period picker (7d/28d/90d toggle pills) + dark mode toggle (sun/moon icon) + notification bell (with red dot) + user avatar circle ("DN" initials or dark-noise.webp, 32px)
- Height: ~52px
- Border-bottom in light mode, subtle shadow in dark mode

### Content area
- Fills remaining space right of sidebar
- Padding: 32px 40px
- Max-width: 1100px for readability
- Background: var(--bg)

### Footer
- Minimal: "Built by Aurora · All-time revenue: $201,374 across 13,054 transactions"
- Links: GitHub, Process log, RevenueCat API docs

## New Pages

### `/signals` — Dedicated Signals Page
- All signals from engine in a filterable grid
- Filters: severity (info/warning/critical/positive), kind
- Each signal card: severity pill, title, detail, evidence chips, follow-up action
- Sort by severity (critical first)

### `/integrations` — MCP + SDK + CLI Landing
This is the wow page. It shows that our tool is agent-ready.

**Hero section:**
- Headline: "Connect your agent to RevenueCat"
- Subtitle: "Drop our MCP server into Claude Desktop, Cursor, or Cline. Query your subscription data in natural language."
- CTA button: "Get started →" links to GitHub README

**Three cards:**
1. **MCP Server** — `@outsourc-e/revenuecat-mcp`
   - Icon: plug/connection icon
   - Description: "5 tools for any MCP-compatible agent"
   - Code block: Claude Desktop config JSON snippet
   - Tools list: rc_get_chart, rc_get_overview, rc_detect_signals, rc_weekly_brief, rc_explain_signal

2. **TypeScript SDK** — `@outsourc-e/revenuecat-charts`
   - Icon: code/brackets icon
   - Description: "Typed client with rate limiting and retries"
   - Code block: `import { RevenueCatCharts } from '...'` usage snippet

3. **CLI** — `@outsourc-e/rc-brief`
   - Icon: terminal icon
   - Description: "Operator brief in your terminal"
   - Code block: `npx @outsourc-e/rc-brief --demo`

**Bottom section:**
- "Built for agents, useful for humans" tagline
- Link to blog post (placeholder href)

## Dark Mode

- Toggle button in topbar (sun/moon icon)
- `<html data-theme="dark">` sets all CSS vars
- Default: respect `prefers-color-scheme`, manual toggle overrides, persisted in localStorage
- Charts: use lighter strokes, darker grids, adjusted fill opacities
- All colors via CSS custom properties from DESIGN-SYSTEM.md

## Chart Improvements (apply to all chart pages)

### Y-axis domain
- Never start at 0 for line/area charts of flat metrics
- Use `domain={['dataMin - 5%', 'dataMax + 5%']}` pattern
- Bar charts keep 0 baseline

### Hero chart (Overview)
- Dual-axis: left = Revenue (RC pink), right = MRR (blue)
- Axis labels: "Revenue ($)" and "MRR ($)" with matching colors
- Divergence dot annotation stays

### All charts
- Grid lines: subtle (`#eef0f3` light, `#1E293B` dark)
- Tooltip: card with shadow, matches theme
- Legend: small, below chart, circle markers

## Design Tokens → CSS Custom Properties

All values from DESIGN-SYSTEM.md must be implemented as CSS custom properties on `:root` and `[data-theme="dark"]`. Components use ONLY variables, never hardcoded colors.

## What NOT to change

- Do NOT rewrite the signal engine logic (core/signals/)
- Do NOT change the data layer (dashboard.json, brief.json, prerender script)
- Do NOT touch packages/charts-sdk or packages/charts-mcp
- Do NOT change the CLI
- Keep all existing routes working

## What TO change

- `apps/dashboard/src/App.tsx` — keep router, update Layout import
- `apps/dashboard/src/components/Layout.tsx` — full rewrite (new sidebar, topbar, footer)
- `apps/dashboard/src/styles.css` — full rewrite using design tokens
- `apps/dashboard/src/components/*.tsx` — update to use design tokens, fix chart Y-axis
- `apps/dashboard/src/pages/*.tsx` — minor updates (use new components, add /signals and /integrations pages)
- Add: `apps/dashboard/src/pages/Signals.tsx`
- Add: `apps/dashboard/src/pages/Integrations.tsx`
- Add: `apps/dashboard/src/hooks/useTheme.ts` — dark mode toggle hook
- Add: `apps/dashboard/src/hooks/useSidebar.ts` — collapse toggle hook
- Install: `lucide-react` for icons

## Acceptance Criteria

- `pnpm --filter dashboard build` passes
- All routes render (/, /revenue, /mrr, /subscribers, /churn, /trials, /brief, /signals, /integrations)
- Sidebar collapses/expands with animation, persists in localStorage
- Dark mode toggles, persists in localStorage, respects prefers-color-scheme default
- RC pink (#EE5A60) is the primary accent throughout
- Dark Noise logo appears in project pill and user avatar
- Chart Y-axes are zoomed to data range (not starting at 0 for flat line charts)
- Integrations page shows MCP + SDK + CLI with code snippets
- No hardcoded colors — everything via CSS custom properties
- Mobile responsive: sidebar collapses to hamburger below 900px

## Priority order for implementation

1. CSS custom properties + dark mode infrastructure (tokens, theme toggle, hook)
2. Sidebar rewrite (collapsible, icons, sections, dividers)
3. Topbar rewrite (logo, project pill, dark mode toggle, avatar)
4. Apply design tokens to all existing components
5. Chart Y-axis fix across all chart pages
6. New `/signals` page
7. New `/integrations` page
8. Polish pass (hover states, transitions, focus rings, responsive)
