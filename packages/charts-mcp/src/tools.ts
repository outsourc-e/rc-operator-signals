import { RevenueCatCharts, type ChartResponse } from '@outsourc-e/revenuecat-charts';
// Deterministic narrative inline (no LLM dependency)
function narrate(signals: any[], snapshot: any[], period: string, projectName: string): string {
  const mrr = snapshot.find((m) => String(m.id) === 'mrr');
  const rev = snapshot.find((m) => String(m.id) === 'revenue');
  const churn = snapshot.find((m) => String(m.id) === 'churn_rate');
  const critical = signals.filter((s) => s.severity === 'critical');
  const positive = signals.filter((s) => s.severity === 'positive');
  const lines = [`${projectName} operator brief — ${period}:`];
  if (mrr) lines.push(`MRR $${mrr.value.toLocaleString()}, revenue $${rev?.value?.toLocaleString() ?? '?'}, churn ${churn?.value?.toFixed(1) ?? '?'}%.`);
  if (positive.length > 0) lines.push(`${positive.length} positive signal${positive.length > 1 ? 's' : ''}: ${positive[0].title}.`);
  if (critical.length > 0) lines.push(`Critical attention: ${critical[0].title} — ${critical[0].detail}`);
  else if (signals.length > 0) lines.push(`Top signal: ${signals[0].title}`);
  lines.push('Next: audit what changed 3-4 weeks ago.');
  return lines.join(' ');
}
import { buildBrief, explainSignal, type ChartCache } from '../../../core/signals/index.js';

const REQUIRED_CHARTS = ['revenue', 'mrr', 'actives', 'actives_movement', 'trials_movement', 'churn'] as const;

export type PeriodFlag = '7d' | '28d' | '90d';

function client(): RevenueCatCharts {
  const apiKey = process.env.RC_API_KEY;
  if (!apiKey) {
    throw new Error('RC_API_KEY is required to start the RevenueCat MCP server.');
  }
  return new RevenueCatCharts({ apiKey });
}

function dateRange(period: PeriodFlag = '28d'): { start: string; end: string } {
  const days = Number(period.replace('d', ''));
  const end = new Date();
  const start = new Date(end.getTime() - days * 86_400_000);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

async function loadChartCache(period: PeriodFlag = '28d'): Promise<ChartCache> {
  const rc = client();
  const overview = await rc.overview();
  const { start, end } = dateRange(period);
  const charts: Record<string, ChartResponse> = {};
  for (const slug of REQUIRED_CHARTS) {
    charts[slug] = await rc.chart(slug, { start_date: start, end_date: end, resolution: 'day' });
  }
  return { overview: overview.metrics, charts };
}

export async function getOverview(): Promise<string> {
  const rc = client();
  const overview = await rc.overview();
  return JSON.stringify(overview, null, 2);
}

export async function getChart(slug: string, period: PeriodFlag = '28d', resolution: 'day' | 'week' | 'month' = 'day'): Promise<string> {
  const rc = client();
  const { start, end } = dateRange(period);
  const chart = await rc.chart(slug as Parameters<typeof rc.chart>[0], {
    start_date: start,
    end_date: end,
    resolution,
  });
  return JSON.stringify(chart, null, 2);
}

export async function detectSignals(period: PeriodFlag = '28d'): Promise<string> {
  const cache = await loadChartCache(period);
  const brief = buildBrief(cache, { project_name: 'RevenueCat Project', period: dateRange(period) });
  return JSON.stringify(brief.signals, null, 2);
}

export async function weeklyBrief(period: PeriodFlag = '28d'): Promise<string> {
  const cache = await loadChartCache(period);
  const brief = buildBrief(cache, { project_name: 'RevenueCat Project', period: dateRange(period) });
  const narrative = narrate(brief.signals, brief.snapshot, period, brief.project_name);
  return [
    `# Weekly Operator Brief (${period})`,
    '',
    narrative,
    '',
    '## Signals',
    ...brief.signals.map((signal) => `- **${signal.id}** ${signal.title}`),
  ].join('\n');
}

export async function explainOneSignal(id: string, period: PeriodFlag = '28d'): Promise<string> {
  const cache = await loadChartCache(period);
  const signal = explainSignal(cache, id);
  if (!signal) {
    return `Signal \"${id}\" did not fire for ${period}.`;
  }
  return JSON.stringify(signal, null, 2);
}
