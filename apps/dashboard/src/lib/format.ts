import type { KPI } from './data';

export function formatNumber(value: number): string {
  if (Math.abs(value) >= 1000) return value.toLocaleString();
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
}

export function formatValue(value: number, unit?: string): string {
  if (unit === '$') return `$${Math.round(value).toLocaleString()}`;
  if (unit === '%') return `${value.toFixed(1)}%`;
  return formatNumber(value);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function formatDelta(delta?: KPI['delta'] | null): { text: string; className: 'up' | 'down' | 'flat' } {
  if (!delta || typeof delta.pct !== 'number' || Number.isNaN(delta.pct)) {
    return { text: 'No prior comparison', className: 'flat' };
  }
  const rounded = Math.round(delta.pct * 10) / 10;
  if (Math.abs(rounded) < 0.05) return { text: 'Flat vs prior', className: 'flat' };
  if (rounded > 0) return { text: `+${rounded.toFixed(1)}%`, className: 'up' };
  return { text: `${rounded.toFixed(1)}%`, className: 'down' };
}

export function shortDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
