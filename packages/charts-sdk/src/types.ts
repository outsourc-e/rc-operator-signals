export type ChartResolution = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type CanonicalChartSlug =
  | 'revenue'
  | 'mrr'
  | 'mrr_movement'
  | 'arr'
  | 'actives'
  | 'actives_movement'
  | 'active_trials'
  | 'trials_movement'
  | 'new_trials'
  | 'new_customers'
  | 'new_paid_subscriptions'
  | 'churn'
  | 'trial_conversion'
  | 'initial_conversion'
  | 'conversion_to_paying'
  | 'subscription_retention'
  | 'subscription_status'
  | 'refund_rate'
  | 'app_store_refund_requests'
  | 'cohort_explorer'
  | 'prediction_explorer'
  | 'realized_ltv_per_customer'
  | 'realized_ltv_per_paying_customer'
  | 'non_subscription_purchases'
  | 'play_store_cancel_reasons';

export type ChartSlug =
  | CanonicalChartSlug
  | 'active_subscriptions'
  | 'active_subscriptions_movement'
  | 'active_trials_movement'
  | 'monthly_recurring_revenue'
  | 'monthly_recurring_revenue_movement'
  | 'annual_recurring_revenue'
  | 'conversion_to_paid';

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

export type OverviewMetricId =
  | 'active_trials'
  | 'active_subscriptions'
  | 'mrr'
  | 'revenue'
  | 'new_customers'
  | 'active_users'
  | 'num_tx_last_28_days';

export interface OverviewMetric {
  object: 'overview_metric';
  id: OverviewMetricId;
  name: string;
  description: string;
  value: number;
  unit: '#' | '$' | '%';
  period: string;
  last_updated_at: number | null;
  last_updated_at_iso8601: string | null;
}

export interface OverviewMetricsResponse {
  object: 'overview_metrics';
  metrics: OverviewMetric[];
}

export interface ChartMeasure {
  chartable?: boolean;
  decimal_precision?: number;
  description?: string;
  display_name: string;
  tabulable?: boolean;
  unit: string;
}

export interface ChartSegment {
  id?: string;
  name?: string;
  display_name?: string;
}

export interface ChartSelectorOption {
  id: string;
  name: string;
}

export interface ChartSelector {
  id: string;
  name: string;
  options?: ChartSelectorOption[];
}

export interface ChartValue {
  cohort: number;
  measure: number;
  value: number;
  incomplete: boolean;
}

export interface ChartSummaryTotals {
  [group: string]: Record<string, number>;
}

export interface ChartResponse<S extends string = CanonicalChartSlug> {
  object: 'chart';
  slug?: S;
  category: string;
  display_type: string;
  display_name: string;
  description?: string;
  documentation_link?: string;
  last_computed_at: number | null;
  start_date: number;
  end_date: number;
  yaxis_currency?: string;
  filtering_allowed: boolean;
  segmenting_allowed: boolean;
  resolution: ChartResolution;
  values: ChartValue[];
  summary?: ChartSummaryTotals;
  yaxis: { label: string };
  segments?: ChartSegment[];
  segments_limit?: number;
  measures: ChartMeasure[];
  user_selectors?: ChartSelector[];
  unsupported_params?: string[];
}

export interface ChartOptionsResponse {
  object: 'chart_options';
  chart: string;
  filters: unknown[];
  segments: unknown[];
  selectors: unknown[];
  resolutions: ChartResolution[];
}

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

export interface ChartQuery {
  projectId?: string;
  start_date?: string;
  end_date?: string;
  resolution?: ChartResolution;
  realtime?: boolean;
  filters?: string;
  selectors?: string;
  aggregate?: string;
  currency?: string;
  segment?: string;
  limit_num_segments?: number;
}

export interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  projectId?: string;
  chartRequestSpacingMs?: number;
}

export interface ChartsApiError {
  type?: string;
  message?: string;
  retryable?: boolean;
  doc_url?: string;
  backoff_ms?: number;
}

export type RevenueChart = ChartResponse<'revenue'>;
export type MrrChart = ChartResponse<'mrr'>;
export type MrrMovementChart = ChartResponse<'mrr_movement'>;
export type ArrChart = ChartResponse<'arr'>;
export type ActivesChart = ChartResponse<'actives'>;
export type ActivesMovementChart = ChartResponse<'actives_movement'>;
export type ActiveTrialsChart = ChartResponse<'active_trials'>;
export type TrialsMovementChart = ChartResponse<'trials_movement'>;
export type NewTrialsChart = ChartResponse<'new_trials'>;
export type NewCustomersChart = ChartResponse<'new_customers'>;
export type NewPaidSubscriptionsChart = ChartResponse<'new_paid_subscriptions'>;
export type ChurnChart = ChartResponse<'churn'>;
export type TrialConversionChart = ChartResponse<'trial_conversion'>;
export type InitialConversionChart = ChartResponse<'initial_conversion'>;
export type ConversionToPayingChart = ChartResponse<'conversion_to_paying'>;
export type SubscriptionRetentionChart = ChartResponse<'subscription_retention'>;
export type SubscriptionStatusChart = ChartResponse<'subscription_status'>;
export type RefundRateChart = ChartResponse<'refund_rate'>;
export type AppStoreRefundRequestsChart = ChartResponse<'app_store_refund_requests'>;
export type CohortExplorerChart = ChartResponse<'cohort_explorer'>;
export type PredictionExplorerChart = ChartResponse<'prediction_explorer'>;
export type RealizedLtvPerCustomerChart = ChartResponse<'realized_ltv_per_customer'>;
export type RealizedLtvPerPayingCustomerChart = ChartResponse<'realized_ltv_per_paying_customer'>;
export type NonSubscriptionPurchasesChart = ChartResponse<'non_subscription_purchases'>;
export type PlayStoreCancelReasonsChart = ChartResponse<'play_store_cancel_reasons'>;
