import type {
  ChartResponse,
  OverviewMetric,
  Signal,
} from '../../packages/charts-sdk/src/index.js';
import { TIMESERIES_RULES } from './timeseries-rules.js';

export interface ChartCache {
  overview: OverviewMetric[];
  charts: Record<string, ChartResponse>;
}

export type SignalSeverity = 'critical' | 'warning' | 'info' | 'positive';
export type SignalKind = 'fact' | 'interpretation' | 'caution' | 'question';

export interface OperatorBrief {
  generated_at: string;
  project_name: string;
  period: { start: string; end: string };
  snapshot: OverviewMetric[];
  signals: Signal[];
  contradictions: Signal[];
  watchlist: Signal[];
  caveats: string[];
}

export type Rule = (cache: ChartCache) => Signal[];

function getOverview(cache: ChartCache, id: string): OverviewMetric | undefined {
  return cache.overview.find((metric) => metric.id === id);
}

export const ruleRevenueMrrDivergence: Rule = (cache) => {
  const revenue = getOverview(cache, 'revenue');
  const mrr = getOverview(cache, 'mrr');
  if (!revenue || !mrr) return [];

  const gap = revenue.value - mrr.value;
  const gapPct = mrr.value > 0 ? (gap / mrr.value) * 100 : 0;
  if (Math.abs(gapPct) < 5) return [];

  return [{
    id: 'revenue_mrr_divergence',
    severity: gapPct > 20 ? 'warning' : 'info',
    kind: 'interpretation',
    title:
      gap > 0
        ? `Revenue exceeds MRR by ${gapPct.toFixed(1)}%`
        : `MRR exceeds Revenue by ${Math.abs(gapPct).toFixed(1)}%`,
    detail:
      gap > 0
        ? `28-day revenue ($${revenue.value.toLocaleString()}) is higher than MRR ($${mrr.value.toLocaleString()}). That usually means one-time purchases or annual upfront recognition are inflating cash above the recurring base.`
        : `MRR ($${mrr.value.toLocaleString()}) exceeds 28-day revenue ($${revenue.value.toLocaleString()}). Refunds, churn, or collection timing may be depressing cash below the run-rate.`,
    evidence: [
      { metric: 'revenue', value: revenue.value, period: revenue.period },
      { metric: 'mrr', value: mrr.value, period: mrr.period },
    ],
    caveat: 'Compare the gap across multiple periods before making a pricing call.',
    followup: 'Segment Revenue by product or store to identify the non-recurring contributor.',
  }];
};

export const ruleTrialFunnel: Rule = (cache) => {
  const trials = getOverview(cache, 'active_trials');
  const subs = getOverview(cache, 'active_subscriptions');
  if (!trials || !subs || subs.value === 0) return [];

  const ratio = (trials.value / subs.value) * 100;
  if (ratio < 1) {
    return [{
      id: 'trial_funnel_thin',
      severity: 'warning',
      kind: 'caution',
      title: `Active trial pool is thin (${ratio.toFixed(2)}% of active subs)`,
      detail: `Only ${trials.value} active trials against ${subs.value.toLocaleString()} active subscriptions. That weakens the near-term paid pipeline.`,
      evidence: [
        { metric: 'active_trials', value: trials.value },
        { metric: 'active_subscriptions', value: subs.value },
      ],
      followup: 'Pull the New Trials chart over the last 28 days to confirm the slowdown source.',
    }];
  }
  if (ratio > 15) {
    return [{
      id: 'trial_funnel_swollen',
      severity: 'info',
      kind: 'interpretation',
      title: `Trial pool is unusually large (${ratio.toFixed(1)}% of active subs)`,
      detail: `${trials.value} active trials against ${subs.value.toLocaleString()} active subscriptions. Either acquisition recently spiked or conversion is stalling.`,
      evidence: [
        { metric: 'active_trials', value: trials.value },
        { metric: 'active_subscriptions', value: subs.value },
      ],
    }];
  }
  return [];
};

export const ruleAcquisitionToMonetization: Rule = (cache) => {
  const newCustomers = getOverview(cache, 'new_customers');
  const subs = getOverview(cache, 'active_subscriptions');
  if (!newCustomers || !subs || subs.value === 0) return [];

  const ratio = (newCustomers.value / subs.value) * 100;
  if (ratio > 30) {
    return [{
      id: 'acquisition_outpacing_monetization',
      severity: 'info',
      kind: 'question',
      title: `New customers are ${ratio.toFixed(0)}% of active subs in 28d`,
      detail: `${newCustomers.value.toLocaleString()} new customers arrived against a paid base of ${subs.value.toLocaleString()}. Growth is healthy, but conversion to paying may still be leaving money on the table.`,
      evidence: [
        { metric: 'new_customers', value: newCustomers.value, period: '28d' },
        { metric: 'active_subscriptions', value: subs.value },
      ],
      followup: 'Check Conversion to Paying for the same window.',
    }];
  }
  return [];
};

export const ruleTransactionDensity: Rule = (cache) => {
  const transactions = getOverview(cache, 'num_tx_last_28_days');
  const newCustomers = getOverview(cache, 'new_customers');
  if (!transactions || !newCustomers || newCustomers.value === 0) return [];

  const txPerNewCustomer = transactions.value / newCustomers.value;
  if (txPerNewCustomer < 0.5) {
    return [{
      id: 'low_transaction_density',
      severity: 'info',
      kind: 'interpretation',
      title: `Only ${txPerNewCustomer.toFixed(2)} transactions per new customer in 28d`,
      detail: `${transactions.value} transactions against ${newCustomers.value.toLocaleString()} new customers. Most new users have not monetized yet.`,
      evidence: [
        { metric: 'num_tx_last_28_days', value: transactions.value },
        { metric: 'new_customers', value: newCustomers.value },
      ],
    }];
  }
  return [];
};

export const OVERVIEW_RULES: Rule[] = [
  ruleRevenueMrrDivergence,
  ruleTrialFunnel,
  ruleAcquisitionToMonetization,
  ruleTransactionDensity,
];

export const ALL_RULES: Rule[] = [...OVERVIEW_RULES, ...TIMESERIES_RULES];

export function buildBrief(
  cache: ChartCache,
  meta: { project_name: string; period: { start: string; end: string } },
): OperatorBrief {
  const allSignals = ALL_RULES.flatMap((rule) => rule(cache));

  return {
    generated_at: new Date().toISOString(),
    project_name: meta.project_name,
    period: meta.period,
    snapshot: cache.overview,
    signals: allSignals.filter((signal) => signal.kind !== 'caution'),
    contradictions: allSignals.filter(
      (signal) => signal.kind === 'interpretation' && signal.severity !== 'info',
    ),
    watchlist: allSignals.filter(
      (signal) => signal.kind === 'caution' || signal.kind === 'question',
    ),
    caveats: [
      'Charts API data is regenerated from the current snapshot of receipts. Historical values can move when refunds or chargebacks land.',
      'The current period is always incomplete, so the newest bucket is provisional.',
      'Revenue includes one-time purchases and non-renewing subscriptions. It is not a pure proxy for recurring health.',
    ],
  };
}

export function explainSignal(cache: ChartCache, signalId: string): Signal | undefined {
  return ALL_RULES.flatMap((rule) => rule(cache)).find((signal) => signal.id === signalId);
}
