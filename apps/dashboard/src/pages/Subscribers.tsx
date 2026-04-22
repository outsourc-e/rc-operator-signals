import { AiSummary } from '../components/AiSummary';
import { ChartCard } from '../components/ChartCard';
import { KpiPill } from '../components/KpiPill';
import { dashboard, findKpi } from '../lib/data';

export function Subscribers() {
  const aiText = `Paid base is essentially flat at 2,536 active subs (+0.1% vs prior period). New + reactivations (~132) just barely offset churn (~125), producing a net +7. Growth is fragile — small changes in churn rate move this meaningfully.`;
  const actives = dashboard.series.actives ?? [];
  const movement = dashboard.series.mrr_movement ?? [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Subscribers</h1>
          <p className="page-subtitle">Active subscriber count and the movement that produced it.</p>
        </div>
      </div>

      <AiSummary title="What this chart means" text={aiText} source="rules" />

      <section className="kpi-strip">
        <KpiPill kpi={findKpi('active_subscriptions')} label="Active subs" />
        <KpiPill kpi={findKpi('active_users')} label="Active users" />
        <KpiPill kpi={findKpi('active_trials')} label="Active trials" />
      </section>

      <ChartCard title="Active subscriptions" subtitle="Paid base over the last 90 days" series={actives} kind="line" color="#6366f1" height={300} />

      <ChartCard title="Subscription movement" subtitle="New + Resubscription − Churn, with net movement line" series={movement} kind="composed" height={320} />
    </div>
  );
}
