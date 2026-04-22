import type { OverviewMetric, Signal } from '../../packages/charts-sdk/src/index.js';
import { deterministicNarrative } from './deterministic.js';
import { openRouterNarrative } from './openrouter.js';

export type NarrativeProvider = 'deterministic' | 'openrouter';

export async function narrate(
  signals: Signal[],
  kpis: OverviewMetric[],
  period: string,
  options?: { provider?: NarrativeProvider; projectName?: string },
): Promise<string> {
  const provider = options?.provider ?? (process.env.OPENROUTER_API_KEY ? 'openrouter' : 'deterministic');
  if (provider === 'openrouter') {
    return openRouterNarrative(signals, kpis, period, options?.projectName);
  }
  return deterministicNarrative(signals, kpis, period, options?.projectName);
}
