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

// Dedupe signals by title (rule engine can fire the same insight from different rule paths)
function dedupeByTitle(signals: Signal[]): Signal[] {
  const seen = new Set<string>();
  return signals.filter((s) => {
    if (seen.has(s.title)) return false;
    seen.add(s.title);
    return true;
  });
}

export function topSignals(limit = 3): Signal[] {
  return dedupeByTitle([...brief.signals, ...brief.contradictions]).slice(0, limit);
}

export function allSignals(): Signal[] {
  return dedupeByTitle([...brief.signals, ...brief.contradictions]);
}

export function watchlist(): Signal[] {
  return [...new Map(brief.watchlist.map((s) => [s.id, s])).values()];
}

// ---------------------------------------------------------------------------
// Rule registry
//
// The signal engine has 10 rules. On any given evaluation, some fire and some
// stay silent because the data doesn't meet the trigger condition. A silent
// rule is still a real output -- it's the engine telling you "we checked this
// dimension and nothing anomalous is happening." Reviewers should see the full
// picture, not just the subset that fired.
// ---------------------------------------------------------------------------

export type RuleCategory = 'Monetization' | 'Acquisition' | 'Retention' | 'Data Quality';

export type RuleStatus = 'fired' | 'cleared' | 'watchlist';

export type RuleDefinition = {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  trigger: string;
};

export type RuleEvaluation = RuleDefinition & {
  status: RuleStatus;
  signal?: Signal;
};

export const RULE_REGISTRY: RuleDefinition[] = [
  {
    id: 'revenue_mrr_divergence',
    name: 'Revenue vs MRR divergence',
    description: 'Flags when recognized revenue outpaces or trails recurring MRR, which usually means one-time purchases or refunds are skewing cash vs run-rate.',
    category: 'Monetization',
    trigger: 'abs(revenue - mrr) / mrr > 5%',
  },
  {
    id: 'trial_funnel_thin',
    name: 'Trial funnel health',
    description: 'Flags when active trials are unusually thin or swollen relative to active subs, which signals near-term paid pipeline risk.',
    category: 'Acquisition',
    trigger: 'trials/subs < 1% (thin) or > 15% (swollen)',
  },
  {
    id: 'acquisition_outpacing_monetization',
    name: 'Acquisition vs monetization',
    description: 'Flags when new customers are a high fraction of the paid base, meaning growth is healthy but conversion may be leaving money on the table.',
    category: 'Acquisition',
    trigger: 'new_customers / active_subs > 30%',
  },
  {
    id: 'low_transaction_density',
    name: 'Transaction density',
    description: 'Flags when transactions per new customer are low, indicating most new users have not monetized yet.',
    category: 'Monetization',
    trigger: 'transactions / new_customers < 0.5',
  },
  {
    id: 'revenue_declining_3_periods',
    name: 'Revenue trend (3 periods)',
    description: 'Flags sustained revenue decline across three consecutive 28-day periods, distinguishing structural decline from a single-period dip.',
    category: 'Monetization',
    trigger: 'rev_p3 < rev_p2 < rev_p1 over 84 days',
  },
  {
    id: 'mrr_stagnation',
    name: 'MRR stagnation',
    description: 'Flags when average daily MRR is flat across periods, usually because new subscriptions and churn are cancelling each other.',
    category: 'Monetization',
    trigger: 'abs(mrr_avg change over 28d) < 1%',
  },
  {
    id: 'trials_surging',
    name: 'Trial velocity',
    description: 'Flags meaningful shifts in new-trial velocity vs the prior 28-day window, a leading indicator for future paid MRR.',
    category: 'Acquisition',
    trigger: 'abs(new_trials change vs prior 28d) > 10-15%',
  },
  {
    id: 'churn_improving',
    name: 'Churn trend',
    description: 'Flags when the 30-day average churn rate moves meaningfully vs the prior 30 days, positively or negatively.',
    category: 'Retention',
    trigger: 'abs(churn_avg change over 30d) > 15%',
  },
  {
    id: 'arpu_flat',
    name: 'ARPU pricing power',
    description: 'Flags when revenue per subscriber is flat across three consecutive periods, meaning pricing power is not improving.',
    category: 'Monetization',
    trigger: 'abs(arpu change) < 3% for 3 consecutive 28d windows',
  },
  {
    id: 'incomplete_period_active',
    name: 'Incomplete current period',
    description: 'Flags charts whose latest bucket is provisional, so reviewers do not over-trust the newest data point.',
    category: 'Data Quality',
    trigger: 'any chart has incomplete values in last 4 buckets',
  },
];

// Rule groups with sibling IDs: one registry entry can be fired under several
// different specific signal IDs (e.g. trial_funnel_thin or trial_funnel_swollen).
const RULE_ID_ALIASES: Record<string, string[]> = {
  trial_funnel_thin: ['trial_funnel_thin', 'trial_funnel_swollen'],
  trials_surging: ['trials_surging', 'trials_declining'],
  churn_improving: ['churn_improving', 'churn_worsening'],
};

export function evaluateRules(): RuleEvaluation[] {
  const firedById = new Map<string, Signal>();
  for (const signal of brief.signals) firedById.set(signal.id, signal);
  for (const signal of brief.contradictions) firedById.set(signal.id, signal);
  for (const signal of brief.watchlist) firedById.set(signal.id, signal);

  const watchlistIds = new Set(brief.watchlist.map((s) => s.id));

  return RULE_REGISTRY.map((rule) => {
    const siblingIds = RULE_ID_ALIASES[rule.id] ?? [rule.id];
    const matched = siblingIds.map((id) => firedById.get(id)).find(Boolean);
    if (matched) {
      const status: RuleStatus = watchlistIds.has(matched.id) && !brief.signals.some((s) => s.id === matched.id)
        ? 'watchlist'
        : 'fired';
      return { ...rule, status, signal: matched };
    }
    return { ...rule, status: 'cleared' as RuleStatus };
  });
}
