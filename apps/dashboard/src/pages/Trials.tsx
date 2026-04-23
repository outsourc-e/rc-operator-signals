import { Clock } from 'lucide-react';
import { AiSummary } from '../components/AiSummary';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ChartCard } from '../components/ChartCard';
import { KpiPill } from '../components/KpiPill';
import { useAiBrief } from '../hooks/useAiBrief';
import { dashboard, findKpi } from '../lib/data';
import { formatCompact } from '../lib/format';

const FALLBACK = `Top-of-funnel is expanding: 281 new trials vs 242 prior period (+16%). This is the leading indicator — if conversion holds, MRR grows. Watch the trial → paid conversion rate over the next 7–14 days.`;

export function Trials() {
  const { text, source } = useAiBrief({ id: 'trials', fallback: FALLBACK });
  const trialsMovement = dashboard.series.trials_movement ?? [];
  const funnel = dashboard.trial_funnel;
  const rows = [
    { label: 'Active users', value: funnel.active_users, pct: 100 },
    { label: 'New trials (28d)', value: funnel.new_trials_28d, pct: (funnel.new_trials_28d / funnel.active_users) * 100 },
    { label: 'Active trials', value: funnel.active_trials, pct: (funnel.active_trials / funnel.active_users) * 100 },
    { label: 'Est. converted', value: funnel.converted_estimated, pct: (funnel.converted_estimated / funnel.active_users) * 100 },
  ];

  return (
    <div className="page">
            <Breadcrumbs crumbs={[
        { label: 'RevenueCat', to: '/' },
        { label: 'Charts', to: '/' },
        { label: 'Trials' },
      ]} />
      <div className="page-header">
        <div>
          <h1>Trials</h1>
          <p className="page-subtitle">The leading indicator of next period's MRR.</p>
        </div>
        <div className="page-meta">
          <Clock size={13} /> Updated {new Date(dashboard.generated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>

      <AiSummary title="Trials brief" text={text} source={source} />

      <section className="kpi-strip">
        <KpiPill kpi={findKpi('active_trials')} label="Active trials" accent="orange" context="Current" hint="Users currently on trial" />
        <KpiPill kpi={findKpi('new_customers')} label="New customers" accent="blue" context="Last 28 days" hint="First-time purchasers" />
        <KpiPill kpi={findKpi('active_users')} label="Active users" accent="green" context="Current" hint="Total app users" />
      </section>

      <ChartCard title="Trial movement" subtitle="New vs expired trials, with net movement" series={trialsMovement} kind="bar" height={320} />

      <article className="chart-card">
        <div className="chart-card-header">
          <div>
            <div className="chart-card-title">Trial funnel</div>
            <div className="chart-card-subtitle">Active users → new trials → active trials → estimated converted</div>
          </div>
        </div>
        <div className="card-body">
          {rows.map((row) => (
            <div key={row.label} className="funnel-row">
              <div className="funnel-label">{row.label}</div>
              <div className="funnel-bar">
                <div className="funnel-fill" style={{ width: `${Math.max(row.pct, 6)}%` }}>
                  {row.pct >= 18 ? `${row.pct.toFixed(1)}%` : ''}
                </div>
              </div>
              <div className="funnel-meta">
                <strong>{formatCompact(row.value)}</strong>
                {row.pct.toFixed(1)}% of active users
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
