import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

mkdirSync('./src/data', { recursive: true });

// Live mode vs demo mode:
// - If RC_API_KEY is set, CLI pulls live chart data from the Charts API
// - Otherwise, CLI reads ./core/fixtures/dark-noise (safe for forkers/CI without secrets)
// The CLI returns both `brief` and `cache` (raw chart + overview data), so we can
// build the full dashboard JSON off the same source without re-reading fixtures.
const liveMode = Boolean(process.env.RC_API_KEY) && process.env.PRERENDER_MODE !== 'demo';
const cliArgs = liveMode ? '--period 28d --json' : '--demo --json';
const briefJson = execSync(`cd ../.. && pnpm exec tsx apps/cli/src/index.ts ${cliArgs}`, {
  encoding: 'utf-8',
  env: { ...process.env },
  maxBuffer: 64 * 1024 * 1024,
});
const briefOutput = JSON.parse(briefJson);

writeFileSync('./src/data/brief.json', JSON.stringify(briefOutput.brief, null, 2));
writeFileSync('./src/data/brief-today.md', briefOutput.markdown);

const projectName = briefOutput.project_name || 'Dark Noise';
const cache = briefOutput.cache;

let overview;
let charts;

if (cache) {
  // Live or demo via CLI-provided cache (single source of truth)
  overview = { metrics: cache.overview };
  charts = cache.charts;
} else {
  // Fallback: read fixtures directly (older CLI output, shouldn't hit normally)
  const fixtureDir = resolve('../../core/fixtures/dark-noise');
  const load = (file) => JSON.parse(readFileSync(`${fixtureDir}/${file}`, 'utf8'));
  overview = load('overview.json');
  charts = {
    revenue: load('revenue.json'),
    mrr: load('mrr.json'),
    actives: load('actives.json'),
    actives_movement: load('actives_movement.json'),
    trials_movement: load('trials_movement.json'),
    churn: load('churn.json'),
  };
}

function valuesFor(chart, measure, opts = {}) {
  const { skipIncomplete = true, lastN = null } = opts;
  let vals = (chart.values || []).filter((v) => v.measure === measure);
  if (skipIncomplete) vals = vals.filter((v) => !v.incomplete);
  if (lastN) vals = vals.slice(-lastN);
  return vals.map((v) => ({
    date: new Date(v.cohort * 1000).toISOString().slice(0, 10),
    value: v.value,
    incomplete: !!v.incomplete,
  }));
}

function deltaFor(chart, measure = 0, days = 28) {
  const allVals = (chart.values || []).filter((v) => v.measure === measure && !v.incomplete);
  if (allVals.length < days * 2) return null;
  const recent = allVals.slice(-days).reduce((a, v) => a + v.value, 0);
  const prior = allVals.slice(-days * 2, -days).reduce((a, v) => a + v.value, 0);
  if (prior === 0) return null;
  return { recent, prior, pct: ((recent - prior) / Math.abs(prior)) * 100 };
}

function levelDelta(chart, measure = 0, days = 28) {
  const allVals = (chart.values || []).filter((v) => v.measure === measure && !v.incomplete);
  if (allVals.length < days * 2) return null;
  const recent = allVals.slice(-days).reduce((a, v) => a + v.value, 0) / days;
  const prior = allVals.slice(-days * 2, -days).reduce((a, v) => a + v.value, 0) / days;
  if (prior === 0) return null;
  return { recent: Math.round(recent), prior: Math.round(prior), pct: ((recent - prior) / Math.abs(prior)) * 100 };
}

function sparklineFor(metricId) {
  const map = {
    mrr: { chart: charts.mrr, measure: 0 },
    revenue: { chart: charts.revenue, measure: 0 },
    active_subscriptions: { chart: charts.actives, measure: 0 },
    active_trials: { chart: charts.trials_movement, measure: 0 },
    new_customers: { chart: charts.actives_movement, measure: 0 },
    num_tx_last_28_days: { chart: charts.revenue, measure: 1 },
  };
  const cfg = map[metricId];
  if (!cfg) return [];
  return valuesFor(cfg.chart, cfg.measure, { lastN: 30 }).map((point) => point.value);
}

const kpis = overview.metrics.map((metric) => {
  let delta = null;
  switch (metric.id) {
    case 'mrr': delta = levelDelta(charts.mrr, 0); break;
    case 'revenue': delta = deltaFor(charts.revenue, 0); break;
    case 'active_subscriptions': delta = levelDelta(charts.actives, 0); break;
    case 'active_trials': delta = deltaFor(charts.trials_movement, 0); break;
    case 'new_customers': delta = deltaFor(charts.actives_movement, 0); break;
    case 'num_tx_last_28_days': delta = deltaFor(charts.revenue, 1); break;
    default: delta = null;
  }
  return {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    unit: metric.unit,
    period: metric.period,
    delta,
    sparkline: sparklineFor(metric.id),
  };
});

function sumMeasure(chart, measure, days = 28) {
  return (chart.values || [])
    .filter((v) => v.measure === measure && !v.incomplete)
    .slice(-days)
    .reduce((a, v) => a + v.value, 0);
}

function stackedSeries(chart, lastN = 28) {
  const measures = (chart.measures || []).map((measure, idx) => ({ idx, name: measure.display_name }));
  const buckets = {};
  for (const measure of measures) {
    for (const value of valuesFor(chart, measure.idx, { lastN })) {
      if (!buckets[value.date]) buckets[value.date] = { date: value.date };
      buckets[value.date][measure.name] = value.value;
    }
  }
  return Object.values(buckets);
}

const dashboardData = {
  generated_at: new Date().toISOString(),
  data_mode: liveMode ? 'live' : 'demo',
  project: {
    id: 'proj058a6330',
    name: projectName,
    stores: 'App Store · Play Store',
  },
  period: {
    end: new Date().toISOString().slice(0, 10),
    start: new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10),
    days: 28,
    prior_end: new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10),
    prior_start: new Date(Date.now() - 56 * 86400000).toISOString().slice(0, 10),
  },
  kpis,
  series: {
    revenue: valuesFor(charts.revenue, 0, { lastN: 90 }),
    mrr: valuesFor(charts.mrr, 0, { lastN: 90 }),
    actives: valuesFor(charts.actives, 0, { lastN: 90 }),
    churn_rate: valuesFor(charts.churn, 2, { lastN: 90 }).map((point) => ({ ...point, value: point.value * 100 })),
    mrr_movement: stackedSeries(charts.actives_movement),
    trials_movement: stackedSeries(charts.trials_movement),
  },
  subscription_movement: {
    starting: kpis.find((kpi) => kpi.id === 'active_subscriptions')?.delta?.prior ?? 0,
    ending: kpis.find((kpi) => kpi.id === 'active_subscriptions')?.value ?? 0,
    new: sumMeasure(charts.actives_movement, 0),
    reactivation: sumMeasure(charts.actives_movement, 1),
    churned: -Math.abs(sumMeasure(charts.actives_movement, 2)),
    movement: sumMeasure(charts.actives_movement, 3),
  },
  trial_funnel: {
    active_users: overview.metrics.find((metric) => metric.id === 'active_users')?.value ?? 0,
    new_trials_28d: sumMeasure(charts.trials_movement, 0),
    active_trials: overview.metrics.find((metric) => metric.id === 'active_trials')?.value ?? 0,
    converted_estimated: Math.round(sumMeasure(charts.trials_movement, 1) * 0.65),
  },
  incomplete_charts: Object.entries(charts)
    .filter(([, chart]) => (chart.values || []).slice(-3).some((value) => value.incomplete))
    .map(([name]) => name),
  all_time: {
    revenue: charts.revenue.summary?.total?.Revenue ?? 0,
    transactions: charts.revenue.summary?.total?.Transactions ?? 0,
    earliest_date: charts.revenue.start_date
      ? new Date(charts.revenue.start_date * 1000).toISOString().slice(0, 10)
      : null,
  },
};

writeFileSync('./src/data/dashboard.json', JSON.stringify(dashboardData, null, 2));
console.log(`Pre-rendered dashboard.json, brief.json, brief-today.md (mode=${liveMode ? 'live' : 'demo'})`);
