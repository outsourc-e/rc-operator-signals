import { AiSummary } from '../components/AiSummary';
import { ChartCard } from '../components/ChartCard';
import { KpiPill } from '../components/KpiPill';
import { dashboard, findKpi } from '../lib/data';

export function Churn() {
  const aiText = `Churn is the best signal this period — 23.7% → 18.7% on 30d average, a 5-point improvement. This is the metric that's actually getting better. If trials convert at the current rate and churn stays here, MRR will move up next period.`;
  const churn = dashboard.series.churn_rate ?? [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Churn</h1>
          <p className="page-subtitle">Rate of paid subscribers canceling or failing renewal.</p>
        </div>
      </div>

      <AiSummary title="What this chart means" text={aiText} source="rules" />

      <section className="kpi-strip">
        <KpiPill kpi={findKpi('churn_rate')} label="Churn (30d avg)" />
        <KpiPill kpi={findKpi('active_subscriptions')} label="Active subs" />
        <KpiPill kpi={findKpi('mrr')} label="MRR" />
      </section>

      <ChartCard title="Churn rate" subtitle="30-day moving average, %" series={churn} kind="area" color="#ef4444" height={340} />

      <div className="note-card">
        <strong>Why churn lags.</strong> Churn rate is a moving average, so improvements show up 2–4 weeks after whatever caused them. If this is dropping, the causes happened last month — check what shipped or changed in that window.
      </div>
    </div>
  );
}
