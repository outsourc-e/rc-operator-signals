// RevenueCat Charts API v2 — type definitions
// Source: https://www.revenuecat.com/docs/api-v2

export interface ProjectListResponse {
  object: 'list';
  items: Project[];
  next_page: string | null;
  url: string;
}

export interface Project {
  object: 'project';
  id: string;
  name: string;
  created_at: number;
  icon_url?: string;
  icon_url_large?: string;
}

export interface OverviewMetric {
  object: 'overview_metric';
  id: OverviewMetricId;
  name: string;
  description: string;
  value: number;
  unit: '#' | '$' | '%';
  period: string; // ISO 8601 duration, e.g. "P28D", "P0D"
  last_updated_at: number | null;
  last_updated_at_iso8601: string | null;
}

export type OverviewMetricId =
  | 'active_trials'
  | 'active_subscriptions'
  | 'mrr'
  | 'revenue'
  | 'new_customers'
  | 'active_users'
  | 'num_tx_last_28_days';

export interface OverviewMetricsResponse {
  object: 'overview_metrics';
  metrics: OverviewMetric[];
}

// Chart endpoint types
export interface ChartResponse {
  object: 'chart';
  category: string;
  display_type: string;
  display_name: string;
  description?: string;
  documentation_link?: string;
  last_computed_at: number | null;
  start_date: string;
  end_date: string;
  yaxis_currency?: string;
  filtering_allowed: boolean;
  segmenting_allowed: boolean;
  resolution: ChartResolution;
  values: ChartValue[];
  summary?: Record<string, number>;
  yaxis: { label: string };
  segments?: ChartSegment[];
  segments_limit?: number;
  measures: ChartMeasure[];
  user_selectors?: ChartSelector[];
  unsupported_params?: string[];
}

export type ChartResolution = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface ChartValue {
  date: string;
  values: Record<string, number>;
  is_complete?: boolean; // KEY: incomplete-period flag we need to verify
}

export interface ChartMeasure {
  id: string;
  name: string;
  unit: string;
}

export interface ChartSegment {
  id: string;
  name: string;
}

export interface ChartSelector {
  id: string;
  name: string;
  options: Array<{ id: string; name: string }>;
}

export interface ChartOptionsResponse {
  object: 'chart_options';
  chart: string;
  filters: unknown[];
  segments: unknown[];
  selectors: unknown[];
  resolutions: ChartResolution[];
  // exact shape TBD pending live response — will refine after probe lands
}

// Signal engine types
export type SignalSeverity = 'critical' | 'warning' | 'info' | 'positive';
export type SignalKind = 'fact' | 'interpretation' | 'caution' | 'question';

export interface Signal {
  id: string;
  severity: SignalSeverity;
  kind: SignalKind;
  title: string;
  detail: string;
  evidence: Array<{ metric: string; value: number; period?: string }>;
  caveat?: string;
  followup?: string;
}

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
