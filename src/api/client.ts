// RevenueCat Charts API client — rate-limit aware, typed, retry-capable.
// Charts & Metrics domain rate limit: 5 req/min (per docs).
// We track Retry-After + RevenueCat-Rate-Limit-* headers and back off.

import type {
  ChartOptionsResponse,
  ChartResponse,
  OverviewMetricsResponse,
  ProjectListResponse,
} from '../types/index.js';

const BASE_URL = 'https://api.revenuecat.com/v2';

export interface ClientOptions {
  apiKey: string;
  baseUrl?: string;
  /** Min ms between requests to Charts & Metrics endpoints. Default 13000 (= 4.6 rpm, safe under 5). */
  chartRequestSpacingMs?: number;
}

export interface ChartsApiError {
  type: string;
  message: string;
  retryable: boolean;
  doc_url?: string;
  backoff_ms?: number;
}

export class RevenueCatClient {
  private apiKey: string;
  private baseUrl: string;
  private chartSpacing: number;
  private lastChartRequestAt = 0;

  constructor(opts: ClientOptions) {
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl ?? BASE_URL;
    this.chartSpacing = opts.chartRequestSpacingMs ?? 13_000;
  }

  private async chartFetch<T>(path: string): Promise<T> {
    // Throttle to respect 5/min on Charts & Metrics domain
    const elapsed = Date.now() - this.lastChartRequestAt;
    if (this.lastChartRequestAt > 0 && elapsed < this.chartSpacing) {
      await sleep(this.chartSpacing - elapsed);
    }
    this.lastChartRequestAt = Date.now();
    return this.rawFetch<T>(path);
  }

  private async rawFetch<T>(path: string): Promise<T> {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      let body: ChartsApiError | undefined;
      try {
        body = (await res.json()) as ChartsApiError;
      } catch {
        // ignore JSON parse failures
      }
      if (res.status === 429 && body?.backoff_ms) {
        await sleep(body.backoff_ms);
        return this.rawFetch<T>(path);
      }
      throw new Error(
        `RevenueCat API ${res.status}: ${body?.message ?? res.statusText}`,
      );
    }

    return (await res.json()) as T;
  }

  // ===== Project endpoints (Project Configuration domain, 60 rpm) =====
  async listProjects(): Promise<ProjectListResponse> {
    return this.rawFetch('/projects');
  }

  // ===== Charts & Metrics (5 rpm) =====
  async getOverview(projectId: string): Promise<OverviewMetricsResponse> {
    return this.chartFetch(`/projects/${projectId}/metrics/overview`);
  }

  async getChart(
    projectId: string,
    chartName: string,
    params: ChartParams = {},
  ): Promise<ChartResponse> {
    const query = buildQuery(params);
    return this.chartFetch(
      `/projects/${projectId}/charts/${chartName}${query}`,
    );
  }

  async getChartOptions(
    projectId: string,
    chartName: string,
  ): Promise<ChartOptionsResponse> {
    return this.chartFetch(
      `/projects/${projectId}/charts/${chartName}/options`,
    );
  }
}

export interface ChartParams {
  start_date?: string;
  end_date?: string;
  resolution?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  realtime?: boolean;
  filters?: string;
  selectors?: string;
  aggregate?: string;
  currency?: string;
  segment?: string;
  limit_num_segments?: number;
}

function buildQuery(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `?${qs}`;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
