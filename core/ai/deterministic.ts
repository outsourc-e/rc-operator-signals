import type { OverviewMetric, Signal } from '../../packages/charts-sdk/src/index.js';

function formatMetric(metric: OverviewMetric): string {
  if (metric.unit === '$') return `$${metric.value.toLocaleString()}`;
  if (metric.unit === '%') return `${metric.value.toFixed(1)}%`;
  return metric.value.toLocaleString();
}

export function deterministicNarrative(
  signals: Signal[],
  kpis: OverviewMetric[],
  period: string,
  projectName = 'RevenueCat project',
): string {
  const topSignals = signals.slice(0, 3);
  const metricMap = Object.fromEntries(kpis.map((metric) => [metric.id, metric]));
  const headline = [metricMap.revenue, metricMap.mrr, metricMap.active_subscriptions]
    .filter(Boolean)
    .map((metric) => `${metric?.name}: ${formatMetric(metric!)}`)
    .join(' · ');

  const paragraphOne = `${projectName} for ${period}: ${headline}. ${
    topSignals[0]?.detail ?? 'No major deterministic signals fired in this window, which usually means the business is stable rather than accelerating.'
  }`;

  const paragraphTwo = topSignals.length > 1
    ? topSignals
        .slice(1)
        .map((signal) => `${signal.title}: ${signal.followup ?? signal.detail}`)
        .join(' ')
    : 'Primary recommendation: validate the latest chart bucket before making a directional call, because the current RevenueCat period is still incomplete.';

  return `${paragraphOne}\n\n${paragraphTwo}`;
}
