import briefData from '../data/brief.json';
import dashboardData from '../data/dashboard.json';

export type Severity = 'info' | 'warning' | 'critical' | 'positive';

export type Evidence = { metric: string; value: number; period?: string };

export type Signal = {
  id: string;
  severity: Severity;
  kind: string;
  title: string;
  detail: string;
  evidence: Evidence[];
  followup?: string;
  caveat?: string;
};

export type Brief = {
  generated_at: string;
  project_name: string;
  period: { start: string; end: string };
  snapshot: Array<{
    id: string;
    name: string;
    value: number;
    unit: string;
    period: string;
    description: string;
  }>;
  signals: Signal[];
  contradictions: Signal[];
  watchlist: Signal[];
  caveats: string[];
};

export type KPI = {
  id: string;
  name: string;
  value: number;
  unit: string;
  period: string;
  delta?: {
    recent: number;
    prior: number;
    pct: number;
  } | null;
  sparkline?: number[];
};

export type SeriesPoint = Record<string, string | number | boolean>;

export type Dashboard = {
  generated_at: string;
  project: { id: string; name: string; stores: string };
  period: {
    start: string;
    end: string;
    days: number;
    prior_start: string;
    prior_end: string;
  };
  kpis: KPI[];
  series: Record<string, SeriesPoint[]>;
  subscription_movement: {
    starting: number;
    ending: number;
    new: number;
    reactivation: number;
    churned: number;
    movement: number;
  };
  trial_funnel: {
    active_users: number;
    new_trials_28d: number;
    active_trials: number;
    converted_estimated: number;
  };
  incomplete_charts: string[];
  all_time: {
    revenue: number;
    transactions: number;
    earliest_date: string;
  };
};

export const brief = briefData as Brief;
export const dashboard = dashboardData as Dashboard;

export const severityIcon: Record<Severity, string> = {
  info: '💡',
  warning: '⚠️',
  critical: '🚨',
  positive: '✅',
};

export function findKpi(id: string): KPI | undefined {
  return dashboard.kpis.find((kpi) => kpi.id === id);
}

export function topSignals(limit = 3): Signal[] {
  return [...new Map([...brief.signals, ...brief.contradictions].map((s) => [s.id, s])).values()].slice(0, limit);
}

export function allSignals(): Signal[] {
  return [...new Map([...brief.signals, ...brief.contradictions].map((s) => [s.id, s])).values()];
}

export function watchlist(): Signal[] {
  return [...new Map(brief.watchlist.map((s) => [s.id, s])).values()];
}
