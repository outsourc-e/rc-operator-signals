import type {
  CanonicalChartSlug,
  ChartOptionsResponse,
  ChartQuery,
  ChartResponse,
  ChartsApiError,
  ChartSlug,
  ClientOptions,
  OverviewMetricsResponse,
  ProjectListResponse,
} from './types.js';

const BASE_URL = 'https://api.revenuecat.com/v2';
const DEFAULT_CHART_SPACING_MS = 13_000;

const CHART_ALIASES: Record<ChartSlug, CanonicalChartSlug> = {
  revenue: 'revenue',
  mrr: 'mrr',
  mrr_movement: 'mrr_movement',
  monthly_recurring_revenue: 'mrr',
  monthly_recurring_revenue_movement: 'mrr_movement',
  arr: 'arr',
  annual_recurring_revenue: 'arr',
  actives: 'actives',
  active_subscriptions: 'actives',
  actives_movement: 'actives_movement',
  active_subscriptions_movement: 'actives_movement',
  active_trials: 'active_trials',
  trials_movement: 'trials_movement',
  active_trials_movement: 'trials_movement',
  new_trials: 'new_trials',
  new_customers: 'new_customers',
  new_paid_subscriptions: 'new_paid_subscriptions',
  churn: 'churn',
  trial_conversion: 'trial_conversion',
  initial_conversion: 'initial_conversion',
  conversion_to_paying: 'conversion_to_paying',
  conversion_to_paid: 'conversion_to_paying',
  subscription_retention: 'subscription_retention',
  subscription_status: 'subscription_status',
  refund_rate: 'refund_rate',
  app_store_refund_requests: 'app_store_refund_requests',
  cohort_explorer: 'cohort_explorer',
  prediction_explorer: 'prediction_explorer',
  realized_ltv_per_customer: 'realized_ltv_per_customer',
  realized_ltv_per_paying_customer: 'realized_ltv_per_paying_customer',
  non_subscription_purchases: 'non_subscription_purchases',
  play_store_cancel_reasons: 'play_store_cancel_reasons'
};

const CHART_METHOD_SPECS = {
  revenue: 'revenue',
  mrr: 'mrr',
  mrrMovement: 'mrr_movement',
  arr: 'arr',
  activeSubscriptions: 'actives',
  activeSubscriptionsMovement: 'actives_movement',
  activeTrials: 'active_trials',
  activeTrialsMovement: 'trials_movement',
  newTrials: 'new_trials',
  newCustomers: 'new_customers',
  newPaidSubscriptions: 'new_paid_subscriptions',
  churn: 'churn',
  trialConversion: 'trial_conversion',
  initialConversion: 'initial_conversion',
  conversionToPaying: 'conversion_to_paying',
  subscriptionRetention: 'subscription_retention',
  subscriptionStatus: 'subscription_status',
  refundRate: 'refund_rate',
  appStoreRefundRequests: 'app_store_refund_requests',
  cohortExplorer: 'cohort_explorer',
  predictionExplorer: 'prediction_explorer',
  realizedLtvPerCustomer: 'realized_ltv_per_customer',
  realizedLtvPerPayingCustomer: 'realized_ltv_per_paying_customer',
  nonSubscriptionPurchases: 'non_subscription_purchases',
  playStoreCancelReasons: 'play_store_cancel_reasons',
} as const satisfies Record<string, CanonicalChartSlug>;

export type ChartMethodName = keyof typeof CHART_METHOD_SPECS;

export function normalizeChartSlug(slug: ChartSlug): CanonicalChartSlug {
  return CHART_ALIASES[slug] ?? slug;
}

export function buildQuery(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null);
  if (entries.length === 0) return '';
  return `?${entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class RevenueCatCharts {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly chartSpacing: number;
  private projectId?: string;
  private lastChartRequestAt = 0;

  public readonly charts: Record<ChartMethodName, (opts?: ChartQuery) => Promise<ChartResponse>>;

  constructor(opts: ClientOptions) {
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl ?? BASE_URL;
    this.projectId = opts.projectId;
    this.chartSpacing = opts.chartRequestSpacingMs ?? DEFAULT_CHART_SPACING_MS;

    this.charts = Object.fromEntries(
      Object.entries(CHART_METHOD_SPECS).map(([methodName, slug]) => [
        methodName,
        (opts?: ChartQuery) => this.chart(slug, opts ?? {}),
      ]),
    ) as Record<ChartMethodName, (opts?: ChartQuery) => Promise<ChartResponse>>;
  }

  async listProjects(): Promise<ProjectListResponse> {
    return this.rawFetch('/projects');
  }

  async overview(): Promise<OverviewMetricsResponse> {
    const projectId = await this.resolveProjectId();
    return this.chartFetch(`/projects/${projectId}/metrics/overview`);
  }

  async chart<S extends ChartSlug>(slug: S, opts: ChartQuery = {}): Promise<ChartResponse<CanonicalChartSlug>> {
    const projectId = opts.projectId ?? (await this.resolveProjectId());
    const canonicalSlug = normalizeChartSlug(slug);
    const query = buildQuery({
      start_date: opts.start_date,
      end_date: opts.end_date,
      resolution: opts.resolution,
      realtime: opts.realtime,
      filters: opts.filters,
      selectors: opts.selectors,
      aggregate: opts.aggregate,
      currency: opts.currency,
      segment: opts.segment,
      limit_num_segments: opts.limit_num_segments,
    });
    const response = await this.chartFetch<ChartResponse<CanonicalChartSlug>>(
      `/projects/${projectId}/charts/${canonicalSlug}${query}`,
    );
    response.slug = canonicalSlug;
    return response;
  }

  async chartOptions(slug: ChartSlug, projectId?: string): Promise<ChartOptionsResponse> {
    const resolvedProjectId = projectId ?? (await this.resolveProjectId());
    const canonicalSlug = normalizeChartSlug(slug);
    return this.chartFetch(`/projects/${resolvedProjectId}/charts/${canonicalSlug}/options`);
  }

  private async resolveProjectId(): Promise<string> {
    if (this.projectId) return this.projectId;
    const projects = await this.listProjects();
    if (projects.items.length === 0) {
      throw new Error('No RevenueCat projects available for this API key.');
    }
    this.projectId = projects.items[0].id;
    return this.projectId;
  }

  private async chartFetch<T>(path: string): Promise<T> {
    const elapsed = Date.now() - this.lastChartRequestAt;
    if (this.lastChartRequestAt > 0 && elapsed < this.chartSpacing) {
      await sleep(this.chartSpacing - elapsed);
    }
    this.lastChartRequestAt = Date.now();
    return this.rawFetch<T>(path);
  }

  private async rawFetch<T>(path: string, attempt = 0): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      let body: ChartsApiError | undefined;
      try {
        body = (await response.json()) as ChartsApiError;
      } catch {
        body = undefined;
      }

      const retryAfterHeader = response.headers.get('retry-after');
      const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : undefined;
      const backoffMs = body?.backoff_ms ?? retryAfterMs ?? Math.min(30_000, 1_000 * (attempt + 1) * 2);
      const canRetry = response.status === 429 || response.status >= 500;

      if (canRetry && attempt < 2) {
        await sleep(backoffMs);
        return this.rawFetch<T>(path, attempt + 1);
      }

      throw new Error(`RevenueCat API ${response.status}: ${body?.message ?? response.statusText}`);
    }

    return (await response.json()) as T;
  }
}
