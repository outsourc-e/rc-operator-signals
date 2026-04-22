// Deterministic signal rules. NO LLM. Pure functions.
// Each rule reads cached chart data + overview, returns Signal[] or [].

import type {
  ChartResponse,
  OperatorBrief,
  OverviewMetric,
  Signal,
} from '../types/index.js';

export interface ChartCache {
  overview: OverviewMetric[];
  charts: Record<string, ChartResponse>;
}

export type Rule = (cache: ChartCache) => Signal[];

// =============================================================================
// Helpers
// =============================================================================

function getOverview(cache: ChartCache, id: string): OverviewMetric | undefined {
  return cache.overview.find((m) => m.id === id);
}

function pctChange(curr: number, prev: number): number {
  if (prev === 0) return curr === 0 ? 0 : Infinity;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

// =============================================================================
// Rules — operator-grade signals
// =============================================================================

/**
 * Rule 1: Revenue ↑ but MRR ↓ (or vice versa)
 * Detects when one-time/non-renewing items mask recurring trend.
 */
export const ruleRevenueMrrDivergence: Rule = (cache) => {
  const rev = getOverview(cache, 'revenue');
  const mrr = getOverview(cache, 'mrr');
  if (!rev || !mrr) return [];

  // For overview snapshot we don't have prior period directly — this rule
  // becomes powerful when we have time-series. For now flag the *level* gap:
  const gap = rev.value - mrr.value;
  const gapPct = mrr.value > 0 ? (gap / mrr.value) * 100 : 0;
  if (Math.abs(gapPct) < 5) return [];

  return [
    {
      id: 'revenue_mrr_divergence',
      severity: gapPct > 20 ? 'warning' : 'info',
      kind: 'interpretation',
      title:
        gap > 0
          ? `Revenue exceeds MRR by ${gapPct.toFixed(1)}% — non-recurring items in the mix`
          : `MRR exceeds Revenue by ${Math.abs(gapPct).toFixed(1)}% — bookings vs cash gap`,
      detail:
        gap > 0
          ? `28-day revenue ($${rev.value.toLocaleString()}) is higher than MRR ($${mrr.value.toLocaleString()}). Likely cause: one-time purchases, non-renewing subscriptions, or annual plan upfront recognition. Be careful — strong revenue here doesn't mean strong recurring base.`
          : `MRR ($${mrr.value.toLocaleString()}) exceeds 28-day revenue ($${rev.value.toLocaleString()}). Possible cause: refunds, downgrades, or churn pulling cash below the recurring run-rate.`,
      evidence: [
        { metric: 'revenue', value: rev.value, period: rev.period },
        { metric: 'mrr', value: mrr.value, period: mrr.period },
      ],
      caveat: 'Compare gap over multiple periods to confirm trend.',
      followup: 'Pull the Revenue chart segmented by product type to identify the non-recurring contributor.',
    },
  ];
};

/**
 * Rule 2: Trial-to-active ratio anomaly
 * Healthy indie iOS app: typically 2-8% trials/active.
 * Very low: top-of-funnel weakness. Very high: conversion problem ahead.
 */
export const ruleTrialFunnel: Rule = (cache) => {
  const trials = getOverview(cache, 'active_trials');
  const subs = getOverview(cache, 'active_subscriptions');
  if (!trials || !subs || subs.value === 0) return [];

  const ratio = (trials.value / subs.value) * 100;
  if (ratio < 1) {
    return [
      {
        id: 'trial_funnel_thin',
        severity: 'warning',
        kind: 'caution',
        title: `Active trial pool is thin (${ratio.toFixed(2)}% of active subs)`,
        detail: `Only ${trials.value} active trials against ${subs.value.toLocaleString()} active subs. New paid subscriptions in 7-14 days are likely to come in below recent run-rate. This is a leading indicator, not a lagging one.`,
        evidence: [
          { metric: 'active_trials', value: trials.value },
          { metric: 'active_subscriptions', value: subs.value },
        ],
        followup: 'Pull New Trials chart over last 28 days to confirm slowdown source.',
      },
    ];
  }
  if (ratio > 15) {
    return [
      {
        id: 'trial_funnel_swollen',
        severity: 'info',
        kind: 'interpretation',
        title: `Trial pool is unusually large (${ratio.toFixed(1)}% of active subs)`,
        detail: `${trials.value} active trials against ${subs.value.toLocaleString()} active subs. Either acquisition spiked recently or trial-to-paid conversion has stalled. The next 14 days will tell which.`,
        evidence: [
          { metric: 'active_trials', value: trials.value },
          { metric: 'active_subscriptions', value: subs.value },
        ],
      },
    ];
  }
  return [];
};

/**
 * Rule 3: New customer acquisition vs paid base ratio
 * If new customers >> active paid, monetization conversion may be weak.
 */
export const ruleAcquisitionToMonetization: Rule = (cache) => {
  const newCustomers = getOverview(cache, 'new_customers');
  const subs = getOverview(cache, 'active_subscriptions');
  if (!newCustomers || !subs || subs.value === 0) return [];

  const ratio = (newCustomers.value / subs.value) * 100;
  if (ratio > 30) {
    return [
      {
        id: 'acquisition_outpacing_monetization',
        severity: 'info',
        kind: 'question',
        title: `New customers are ${ratio.toFixed(0)}% of active subs in 28d — high acquisition velocity`,
        detail: `${newCustomers.value.toLocaleString()} new customers in 28 days against a paid base of ${subs.value.toLocaleString()}. Either you're growing fast or the paid conversion rate from new → paid is below where it could be. Worth checking conversion-to-paying.`,
        evidence: [
          { metric: 'new_customers', value: newCustomers.value, period: '28d' },
          { metric: 'active_subscriptions', value: subs.value },
        ],
        followup: 'Pull Conversion to Paying chart for the same window.',
      },
    ];
  }
  return [];
};

/**
 * Rule 4: Transactions vs new customers — repeat purchase signal
 */
export const ruleTransactionDensity: Rule = (cache) => {
  const tx = getOverview(cache, 'num_tx_last_28_days');
  const newCust = getOverview(cache, 'new_customers');
  if (!tx || !newCust || newCust.value === 0) return [];

  const txPerNewCustomer = tx.value / newCust.value;
  if (txPerNewCustomer < 0.5) {
    return [
      {
        id: 'low_transaction_density',
        severity: 'info',
        kind: 'interpretation',
        title: `Only ${txPerNewCustomer.toFixed(2)} transactions per new customer in 28d`,
        detail: `${tx.value} transactions against ${newCust.value.toLocaleString()} new customers. Most new customers haven't transacted yet — they're free users. That's expected for freemium, but track conversion-to-paying carefully.`,
        evidence: [
          { metric: 'num_tx_last_28_days', value: tx.value },
          { metric: 'new_customers', value: newCust.value },
        ],
      },
    ];
  }
  return [];
};

import { TIMESERIES_RULES } from './timeseries-rules.js';

// =============================================================================
// Rule registry
// =============================================================================

export const OVERVIEW_RULES: Rule[] = [
  ruleRevenueMrrDivergence,
  ruleTrialFunnel,
  ruleAcquisitionToMonetization,
  ruleTransactionDensity,
];

export const ALL_RULES: Rule[] = [
  ...OVERVIEW_RULES,
  ...TIMESERIES_RULES,
];

// =============================================================================
// Brief generator
// =============================================================================

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
    signals: allSignals.filter((s) => s.kind !== 'caution'),
    contradictions: allSignals.filter(
      (s) => s.kind === 'interpretation' && s.severity !== 'info',
    ),
    watchlist: allSignals.filter((s) => s.kind === 'caution' || s.kind === 'question'),
    caveats: [
      'Charts API data is regenerated from the current snapshot of receipts. Historical values can change when refunds or chargebacks happen.',
      'The current period is always incomplete — comparisons against the most recent bucket are provisional.',
      'Revenue includes one-time purchases and non-renewing subscriptions. It is not a pure proxy for subscription health.',
    ],
  };
}
