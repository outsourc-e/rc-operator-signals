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

// ---------------------------------------------------------------------------
// Rebuild ai-briefs.json from live numbers on every refresh.
//
// These are deterministic briefs (source: 'rules') grounded in the current
// dashboard + brief state. No LLM call, no drift, no API key required, and
// the text always matches the numbers the user sees.
// ---------------------------------------------------------------------------
try {
  const briefsPath = './src/data/ai-briefs.json';
  const b = briefOutput.brief;
  const generated = b?.generated_at ?? new Date().toISOString();

  const kpi = (id) => dashboardData.kpis.find((k) => k.id === id);
  const fmtUsd = (n) => `$${Math.round(n).toLocaleString()}`;
  const fmtPct = (n) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;

  const mrr = kpi('mrr');
  const rev = kpi('revenue');
  const subs = kpi('active_subscriptions');
  const trials = kpi('active_trials');
  const newCust = kpi('new_customers');
  const tx = kpi('num_tx_last_28_days');

  const mov = dashboardData.subscription_movement;
  const funnel = dashboardData.trial_funnel;

  // Movement sometimes comes back without a proper starting value (level
  // deltas). Recompute from new/reactivation/churn so the text stays honest.
  const movEnding = mov?.ending ?? subs?.value ?? 0;
  const movNetChange = (mov?.new ?? 0) + (mov?.reactivation ?? 0) - Math.abs(mov?.churned ?? 0);
  const movStarting = movEnding - movNetChange;
  const movGainers = (mov?.new ?? 0) + (mov?.reactivation ?? 0);

  const revVsMrrPct = mrr?.value ? ((rev?.value - mrr?.value) / mrr.value) * 100 : 0;
  const txPerNew = newCust?.value ? tx?.value / newCust.value : 0;
  const newCustPct = subs?.value ? (newCust?.value / subs.value) * 100 : 0;
  const trialsChange = trials?.delta?.pct ?? 0;
  const trialsPriorSum = trials?.delta?.prior ?? 0;
  // `new_trials_28d` is the count of trials started in the last 28 days.
  // Active trials (trials?.value) is the current snapshot, not a 28d count.
  const newTrials28d = funnel?.new_trials_28d ?? 0;

  const overview = `${projectName}'s recurring base is MRR ${fmtUsd(mrr?.value ?? 0)} against 28d revenue of ${fmtUsd(rev?.value ?? 0)} (${revVsMrrPct > 0 ? 'revenue exceeds MRR' : 'MRR exceeds revenue'} by ${Math.abs(revVsMrrPct).toFixed(1)}%, which usually means one-time or non-recurring receipts are in the mix). Active subs: ${(subs?.value ?? 0).toLocaleString()}. Active trials: ${trials?.value ?? 0}. Top-of-funnel: ${(newCust?.value ?? 0).toLocaleString()} new customers in 28d at ${txPerNew.toFixed(2)} transactions each — ${txPerNew < 0.5 ? 'conversion density is thin' : 'conversion density is healthy'}.`;

  const revenue = `Revenue for the last 28 days is ${fmtUsd(rev?.value ?? 0)}. That is ${revVsMrrPct > 5 ? `${revVsMrrPct.toFixed(1)}% above MRR (${fmtUsd(mrr?.value ?? 0)}), meaning roughly ${fmtUsd((rev?.value ?? 0) - (mrr?.value ?? 0))} of this period's receipts are non-recurring` : `within ${Math.abs(revVsMrrPct).toFixed(1)}% of MRR, so the mix is mostly recurring`}. Revenue can be misleading in isolation; MRR is the recurring story.`;

  const mrrBrief = `MRR sits at ${fmtUsd(mrr?.value ?? 0)}. Across the last 28 days the subscriber base moved from ${movStarting.toLocaleString()} to ${movEnding.toLocaleString()}, a net change of ${movNetChange >= 0 ? '+' : ''}${movNetChange}, driven by ${mov?.new ?? 0} new and ${mov?.reactivation ?? 0} reactivations against ${Math.abs(mov?.churned ?? 0)} churned. The two sides are approximately balancing, which is why MRR is moving slowly rather than compounding.`;

  const churn = `${Math.abs(mov?.churned ?? 0)} subscriptions churned in the last 28 days against ${movGainers} new + reactivations, yielding a net ${movNetChange >= 0 ? '+' : ''}${movNetChange}. Retention is the highest-leverage lever right now — at this scale each point of churn improvement directly lifts MRR.`;

  const subscribers = `Paid base: ${(subs?.value ?? 0).toLocaleString()} active subscriptions. New customers are ${newCustPct.toFixed(0)}% of the paid base (${(newCust?.value ?? 0).toLocaleString()} of ${(subs?.value ?? 0).toLocaleString()}) in the last 28 days — ${newCustPct > 30 ? 'healthy acquisition, but the high ratio suggests conversion to paid is where money is being left' : 'balanced acquisition-to-base ratio'}. Transaction density: ${txPerNew.toFixed(2)} transactions per new customer.`;

  const trialsBrief = `Top-of-funnel: ${newTrials28d.toLocaleString()} new trials in the last 28 days${trialsPriorSum > 0 ? ` vs ${trialsPriorSum.toLocaleString()} prior (${fmtPct(trialsChange)})` : ''}. Active trials right now: ${trials?.value ?? 0}. Funnel estimate: ~${funnel?.converted_estimated ?? 0} trial conversions this period from ${newTrials28d} new trials. Watch trial-to-paid conversion over the next 7–14 days — that is the leading indicator for next period's MRR.`;

  const sigsList = b?.signals ?? [];
  const wlList = b?.watchlist ?? [];
  const sigTitles = sigsList.map((s) => s.title);
  const wlNote = wlList.some((s) => s.id === 'incomplete_period_active')
    ? ' Watchlist flags that some charts still have incomplete current-period data, so do not over-trust the newest bucket.'
    : '';
  const signals = sigsList.length === 0
    ? `The engine evaluated all 10 rules against ${projectName}'s live 28-day window and none of them tripped. The business is healthy on every dimension the engine checks — revenue, MRR, churn, trial velocity, ARPU, and transaction density.${wlNote}`
    : `The engine fired ${sigsList.length} signal${sigsList.length === 1 ? '' : 's'} against ${projectName}'s live 28-day window. ${sigTitles.join('; ')}. Together these show where the engine thinks attention is warranted right now — strong signals get a follow-up action; info-level signals surface context rather than alarm.${wlNote}`;

  const exec = `${projectName} over the last 28 days: MRR ${fmtUsd(mrr?.value ?? 0)}, revenue ${fmtUsd(rev?.value ?? 0)}, ${(subs?.value ?? 0).toLocaleString()} active subs, ${trials?.value ?? 0} active trials. ${sigsList.length > 0 ? `Top signal: ${sigsList[0].title}.` : 'No signals fired — the business is healthy on the dimensions the engine checks.'} Next action: audit what changed in the product or marketing 3–4 weeks ago — that is where the current trends were seeded.`;

  const briefs = {
    overview: { text: overview, source: 'rules', model: null, generated_at: generated, topic: 'overall subscription business health' },
    revenue: { text: revenue, source: 'rules', model: null, generated_at: generated, topic: 'revenue trends and non-recurring mix' },
    mrr: { text: mrrBrief, source: 'rules', model: null, generated_at: generated, topic: 'MRR and subscription movement' },
    churn: { text: churn, source: 'rules', model: null, generated_at: generated, topic: 'churn and retention trends' },
    subscribers: { text: subscribers, source: 'rules', model: null, generated_at: generated, topic: 'paid subscriber base' },
    trials: { text: trialsBrief, source: 'rules', model: null, generated_at: generated, topic: 'trial funnel and conversion' },
    signals: { text: signals, source: 'rules', model: null, generated_at: generated, topic: 'signal engine output this period' },
    brief: { text: exec, source: 'rules', model: null, generated_at: generated, topic: 'executive summary of the period' },
  };

  writeFileSync(briefsPath, JSON.stringify(briefs, null, 2));
} catch (err) {
  console.warn('Could not rebuild ai-briefs.json:', err?.message ?? err);
}

console.log(`Pre-rendered dashboard.json, brief.json, brief-today.md (mode=${liveMode ? 'live' : 'demo'})`);
