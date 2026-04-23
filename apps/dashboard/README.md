# RC Operator Signals — Dashboard

The web dashboard. Vite + React + Recharts + Stripe-inspired layout with RevenueCat-native styling.

![Home](../../docs/screenshots/home.png)

## What's inside

- **9 pages**: Home, Revenue, MRR, Subscribers, Churn, Trials, Signals, AI Brief, Integrations
- **Operator welcome card** with clickable stats toggle (all-time revenue / transactions / tracking since)
- **Hero chart** with 4 view modes (Combined / Revenue / MRR / Indexed)
- **KPI strip** with category-coded accent bars (pink MRR, blue revenue, green subs, orange churn)
- **AI briefs** pre-generated and committed to repo (zero runtime LLM calls)
- **Signal engine UI** with filters and severity-sorted list view
- **Chat widget** — "Ask AI" floating pill, grounded in live data
- **Export menu** — Slack, Markdown, or file download
- **Dark mode** — full theme swap via `data-theme` attribute
- **Breadcrumbs, page meta, collapsible sidebar** — RevenueCat-native design cues

## Dev

```bash
pnpm install
pnpm --filter dashboard dev
# → http://localhost:5180
```

## Build

```bash
pnpm --filter dashboard build
# → dist/ ready for static hosting
```

Output: ~99 KB main JS + 160 KB React + 400 KB Recharts (vendor-split), 68 KB CSS. Gzipped ~215 KB total.

## Refresh data

The dashboard reads from committed JSON files in `src/data/`. To refresh:

```bash
pnpm --filter dashboard prerender
```

This pulls from `core/fixtures/dark-noise/` via the signal engine and rebuilds:

- `src/data/dashboard.json` — KPIs, series, subscription movement, trial funnel
- `src/data/brief.json` — fired signals with evidence
- `src/data/ai-briefs.json` — pre-written briefs per page topic

## Deploy

### Vercel (recommended)

```bash
vercel --cwd apps/dashboard
```

Or click the [Deploy button](https://vercel.com/new/clone?repository-url=https://github.com/outsourc-e/rc-operator-signals) on the root README.

### Any static host

`apps/dashboard/dist/` is a plain SPA. Deploy to Netlify, Cloudflare Pages, GitHub Pages, or any static host. Add a rewrite rule to send all routes to `index.html`.

## Tech stack

- Vite 6
- React 18
- React Router 6
- Recharts 3
- Lucide icons
- TypeScript strict mode
- Inter + JetBrains Mono fonts

## Not included

- No backend — fully static
- No auth — anyone with the URL can view
- No live API calls — all data is prerendered at build time

If you want live data, wire up the [SDK](../../packages/charts-sdk) and update `scripts/prerender-brief.mjs` to call the API instead of reading fixtures.

## License

MIT
