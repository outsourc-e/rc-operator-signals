import { Clock } from 'lucide-react';
import { AiSummary } from '../components/AiSummary';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ChartCard } from '../components/ChartCard';
import { KpiPill } from '../components/KpiPill';
import { useAiBrief } from '../hooks/useAiBrief';
import { dashboard, findKpi } from '../lib/data';

const FALLBACK = `Paid base is essentially flat at 2,536 active subs (+0.1% vs prior period). New + reactivations (~132) just barely offset churn (~125), producing a net +7. Growth is fragile — small changes in churn rate move this meaningfully.`;

export function Subscribers() {
  const { text, source } = useAiBrief({ id: 'subscribers', fallback: FALLBACK });
  const actives = dashboard.series.actives ?? [];
  const movement = dashboard.series.mrr_movement ?? [];

  return (
    <div className="page">
            <Breadcrumbs crumbs={[
        { label: 'RevenueCat', to: '/' },
        { label: 'Charts', to: '/' },
        { label: 'Subscribers' },
      ]} />
      <div className="page-header">
        <div>
          <h1>Subscribers</h1>
          <p className="page-subtitle">Active subscriber count and the movement that produced it.</p>
        </div>
        <div className="page-meta">
          <Clock size={13} /> Updated {new Date(dashboard.generated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>

      <AiSummary title="Subscribers brief" text={text} source={source} />

      <section className="kpi-strip">
        <KpiPill kpi={findKpi('active_subscriptions')} label="Active subs" accent="green" context="Current" hint="Currently paying subscribers" />
        <KpiPill kpi={findKpi('active_users')} label="Active users" accent="blue" context="Current" hint="Total app users" />
        <KpiPill kpi={findKpi('active_trials')} label="Active trials" accent="orange" context="Current" hint="Users currently on trial" />
      </section>

      <ChartCard title="Active subscriptions" subtitle="Paid base over the last 90 days" series={actives} kind="line" color="#0e78a6" height={300} />

      <ChartCard title="Subscription movement" subtitle="New + Resubscription − Churn, with net movement line" series={movement} kind="composed" height={320} />
    </div>
  );
}
