// Time-series rules — operate on cached chart data, not just overview snapshot.
// These rules detect period-over-period trends and contradictions.

import type { ChartResponse, Signal } from '../types/index.js';
import type { ChartCache } from './rules.js';

// =============================================================================
// Helpers
// =============================================================================

interface PeriodValues {
  recent: number[];
  prior: number[];
  recentSum: number;
  priorSum: number;
  pctChange: number;
  recentIncompleteCount: number;
}

/**
 * Extract measure values for a given measure index, split into two 28-day windows.
 * Skips incomplete values by default.
 */
function extractPeriods(
  chart: ChartResponse,
  measureIdx: number,
  windowDays = 28,
  skipIncomplete = true,
): PeriodValues | null {
  const vals = (chart.values ?? []).filter(
    (v) => v.measure === measureIdx && (skipIncomplete ? !v.incomplete : true),
  );
  if (vals.length < windowDays * 2) return null;

  const recent = vals.slice(-windowDays).map((v) => v.value);
  const prior = vals.slice(-windowDays * 2, -windowDays).map((v) => v.value);
  const recentSum = recent.reduce((a, b) => a + b, 0);
  const priorSum = prior.reduce((a, b) => a + b, 0);
  const pctChange = priorSum === 0 ? 0 : ((recentSum - priorSum) / Math.abs(priorSum)) * 100;

  // Count how many of the most recent raw values are incomplete
  const rawRecent = (chart.values ?? [])
    .filter((v) => v.measure === measureIdx)
    .slice(-windowDays);
  const recentIncompleteCount = rawRecent.filter((v) => v.incomplete).length;

  return { recent, prior, recentSum, priorSum, pctChange, recentIncompleteCount };
}

// =============================================================================
// Rules
// =============================================================================

/**
 * Rule 5: Revenue declining across 3 consecutive periods
 */
export function ruleRevenueTrend(cache: ChartCache): Signal[] {
  const chart = cache.charts['revenue'];
  if (!chart) return [];

  const vals = (chart.values ?? []).filter((v) => v.measure === 0 && !v.incomplete);
  if (vals.length < 84) return []; // need 3x 28-day windows

  const p1 = vals.slice(-28).reduce((a, v) => a + v.value, 0);
  const p2 = vals.slice(-56, -28).reduce((a, v) => a + v.value, 0);
  const p3 = vals.slice(-84, -56).reduce((a, v) => a + v.value, 0);

  if (p1 < p2 && p2 < p3) {
    return [{
      id: 'revenue_declining_3_periods',
      severity: 'warning',
      kind: 'fact',
      title: `Revenue declining across 3 consecutive 28-day periods`,
      detail: `Revenue: $${p3.toFixed(0)} → $${p2.toFixed(0)} → $${p1.toFixed(0)}. Sustained downtrend across 84 days. Not a single-period dip — this is structural.`,
      evidence: [
        { metric: 'revenue_period_1', value: p3, period: '84-56d ago' },
        { metric: 'revenue_period_2', value: p2, period: '56-28d ago' },
        { metric: 'revenue_period_3', value: p1, period: 'last 28d' },
      ],
      followup: 'Segment revenue by product and store to identify which stream is declining.',
    }];
  }

  return [];
}

/**
 * Rule 6: MRR flat (stagnation detection)
 * If MRR moves <1% over 28 days, flag stagnation.
 */
export function ruleMrrStagnation(cache: ChartCache): Signal[] {
  const chart = cache.charts['mrr'];
  if (!chart) return [];

  const periods = extractPeriods(chart, 0, 28);
  if (!periods) return [];

  const recentAvg = periods.recentSum / periods.recent.length;
  const priorAvg = periods.priorSum / periods.prior.length;
  const pct = priorAvg === 0 ? 0 : ((recentAvg - priorAvg) / Math.abs(priorAvg)) * 100;

  if (Math.abs(pct) < 1) {
    return [{
      id: 'mrr_stagnation',
      severity: 'warning',
      kind: 'interpretation',
      title: `MRR is flat (${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% over 28 days)`,
      detail: `Average daily MRR moved from $${priorAvg.toFixed(0)} to $${recentAvg.toFixed(0)} — effectively no change. New subscriptions and churn are likely cancelling each other out. Stagnation this long usually requires a deliberate growth lever (pricing change, new acquisition channel, or conversion optimization).`,
      evidence: [
        { metric: 'mrr_avg_recent_28d', value: Math.round(recentAvg) },
        { metric: 'mrr_avg_prior_28d', value: Math.round(priorAvg) },
      ],
      followup: 'Pull MRR Movement chart to see if new vs churned are balancing.',
    }];
  }

  return [];
}

/**
 * Rule 7: New trials period-over-period change
 * Detects significant increases or decreases in trial starts.
 */
export function ruleTrialsTrend(cache: ChartCache): Signal[] {
  const chart = cache.charts['trials_movement'];
  if (!chart) return [];

  // measure 0 = New Trials
  const periods = extractPeriods(chart, 0, 28);
  if (!periods) return [];

  if (periods.pctChange < -10) {
    return [{
      id: 'trials_declining',
      severity: 'warning',
      kind: 'fact',
      title: `New trials down ${Math.abs(periods.pctChange).toFixed(0)}% vs prior 28 days`,
      detail: `${periods.recentSum.toFixed(0)} new trials in the last 28 days vs ${periods.priorSum.toFixed(0)} in the prior 28 days. Top-of-funnel is contracting — expect downstream impact on paid conversions in 7-14 days.`,
      evidence: [
        { metric: 'new_trials_recent_28d', value: periods.recentSum },
        { metric: 'new_trials_prior_28d', value: periods.priorSum },
      ],
      followup: 'Check if app store impressions or ad spend changed in the same window.',
    }];
  }

  if (periods.pctChange > 15) {
    return [{
      id: 'trials_surging',
      severity: 'positive',
      kind: 'fact',
      title: `New trials up ${periods.pctChange.toFixed(0)}% vs prior 28 days`,
      detail: `${periods.recentSum.toFixed(0)} new trials in the last 28 days vs ${periods.priorSum.toFixed(0)} prior. Top-of-funnel is expanding. Watch conversion-to-paying to see if this translates to revenue.`,
      evidence: [
        { metric: 'new_trials_recent_28d', value: periods.recentSum },
        { metric: 'new_trials_prior_28d', value: periods.priorSum },
      ],
    }];
  }

  return [];
}

/**
 * Rule 8: Churn rate trend
 * Compares 30-day average churn rate across two windows.
 */
export function ruleChurnTrend(cache: ChartCache): Signal[] {
  const chart = cache.charts['churn'];
  if (!chart) return [];

  // measure 2 = Churn Rate
  const vals = (chart.values ?? []).filter((v) => v.measure === 2 && !v.incomplete);
  if (vals.length < 60) return [];

  const recent = vals.slice(-30);
  const prior = vals.slice(-60, -30);
  const recentAvg = recent.reduce((a, v) => a + v.value, 0) / recent.length;
  const priorAvg = prior.reduce((a, v) => a + v.value, 0) / prior.length;

  if (recentAvg > priorAvg * 1.15) {
    // Churn worsening by 15%+
    return [{
      id: 'churn_worsening',
      severity: 'critical',
      kind: 'fact',
      title: `Churn rate elevated (${(recentAvg * 100).toFixed(1)}% vs ${(priorAvg * 100).toFixed(1)}% prior)`,
      detail: `30-day average churn rate increased from ${(priorAvg * 100).toFixed(1)}% to ${(recentAvg * 100).toFixed(1)}%. Retention is degrading. If unchecked, this compounds quickly against new-subscriber growth.`,
      evidence: [
        { metric: 'churn_rate_recent_30d', value: Number((recentAvg * 100).toFixed(1)) },
        { metric: 'churn_rate_prior_30d', value: Number((priorAvg * 100).toFixed(1)) },
      ],
      followup: 'Pull Subscription Retention chart and segment by product to isolate which plans are churning.',
    }];
  }

  if (recentAvg < priorAvg * 0.85) {
    // Churn improving by 15%+
    return [{
      id: 'churn_improving',
      severity: 'positive',
      kind: 'fact',
      title: `Churn rate improving (${(recentAvg * 100).toFixed(1)}% vs ${(priorAvg * 100).toFixed(1)}% prior)`,
      detail: `30-day average churn rate decreased from ${(priorAvg * 100).toFixed(1)}% to ${(recentAvg * 100).toFixed(1)}%. Retention is strengthening. Good sign — but verify it's not just seasonal.`,
      evidence: [
        { metric: 'churn_rate_recent_30d', value: Number((recentAvg * 100).toFixed(1)) },
        { metric: 'churn_rate_prior_30d', value: Number((priorAvg * 100).toFixed(1)) },
      ],
    }];
  }

  return [];
}

/**
 * Rule 9: Revenue-per-subscriber (ARPU proxy) stagnation
 * Derived: revenue / active_subs across 3 periods.
 */
export function ruleArpuFlat(cache: ChartCache): Signal[] {
  const revChart = cache.charts['revenue'];
  const actChart = cache.charts['actives'];
  if (!revChart || !actChart) return [];

  const revVals = (revChart.values ?? []).filter((v) => v.measure === 0 && !v.incomplete);
  const actVals = (actChart.values ?? []).filter((v) => v.measure === 0 && !v.incomplete);

  if (revVals.length < 84 || actVals.length < 84) return [];

  const arpu = (revSlice: typeof revVals, actSlice: typeof actVals) => {
    const rev = revSlice.reduce((a, v) => a + v.value, 0);
    const act = actSlice.reduce((a, v) => a + v.value, 0) / actSlice.length;
    return act > 0 ? rev / act : 0;
  };

  const a1 = arpu(revVals.slice(-28), actVals.slice(-28));
  const a2 = arpu(revVals.slice(-56, -28), actVals.slice(-56, -28));
  const a3 = arpu(revVals.slice(-84, -56), actVals.slice(-84, -56));

  const d12 = a2 > 0 ? Math.abs((a1 - a2) / a2 * 100) : 0;
  const d23 = a3 > 0 ? Math.abs((a2 - a3) / a3 * 100) : 0;

  if (d12 < 3 && d23 < 3) {
    return [{
      id: 'arpu_flat',
      severity: 'info',
      kind: 'interpretation',
      title: `Revenue per subscriber flat for 3 consecutive periods`,
      detail: `ARPU (28d revenue / avg active subs): $${a3.toFixed(2)} → $${a2.toFixed(2)} → $${a1.toFixed(2)}. Less than 3% movement across 84 days. Pricing power isn't growing. Consider pricing experiments or upsell strategies.`,
      evidence: [
        { metric: 'arpu_period_1', value: Number(a3.toFixed(2)), period: '84-56d ago' },
        { metric: 'arpu_period_2', value: Number(a2.toFixed(2)), period: '56-28d ago' },
        { metric: 'arpu_period_3', value: Number(a1.toFixed(2)), period: 'last 28d' },
      ],
      followup: 'Segment by product duration (monthly vs annual) to check if mix shift is masking ARPU movement.',
    }];
  }

  return [];
}

/**
 * Rule 10: Incomplete period warning
 * Flags if the most recent values in key charts are marked incomplete.
 */
export function ruleIncompletePeriod(cache: ChartCache): Signal[] {
  const charts = Object.entries(cache.charts);
  const incompleteCharts: string[] = [];

  for (const [name, chart] of charts) {
    const vals = chart.values ?? [];
    const lastFew = vals.slice(-4);
    if (lastFew.some((v) => v.incomplete)) {
      incompleteCharts.push(chart.display_name ?? name);
    }
  }

  if (incompleteCharts.length > 0) {
    return [{
      id: 'incomplete_period_active',
      severity: 'info',
      kind: 'caution',
      title: `${incompleteCharts.length} chart(s) have incomplete current-period data`,
      detail: `Charts with incomplete recent values: ${incompleteCharts.join(', ')}. The most recent data points in these charts are provisional — they will change as more receipts are processed. Do not base critical decisions on the latest bucket alone.`,
      evidence: incompleteCharts.map((name) => ({ metric: name, value: 0 })),
      caveat: 'This is standard RevenueCat behavior. The current period is always incomplete until fully elapsed.',
    }];
  }

  return [];
}

// =============================================================================
// Export all time-series rules
// =============================================================================

export const TIMESERIES_RULES = [
  ruleRevenueTrend,
  ruleMrrStagnation,
  ruleTrialsTrend,
  ruleChurnTrend,
  ruleArpuFlat,
  ruleIncompletePeriod,
];
