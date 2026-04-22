import { describe, expect, it } from 'vitest';
import { RevenueCatCharts, normalizeChartSlug } from '../src/index.js';

describe('charts-sdk', () => {
  it('normalizes common chart aliases', () => {
    expect(normalizeChartSlug('active_subscriptions')).toBe('actives');
    expect(normalizeChartSlug('active_trials_movement')).toBe('trials_movement');
    expect(normalizeChartSlug('mrr')).toBe('mrr');
  });

  it('exposes typed convenience methods', () => {
    const client = new RevenueCatCharts({ apiKey: 'sk_test' });
    expect(typeof client.charts.revenue).toBe('function');
    expect(typeof client.charts.churn).toBe('function');
  });
});
