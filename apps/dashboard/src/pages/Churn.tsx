import { Clock } from 'lucide-react';
import { AiSummary } from '../components/AiSummary';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ChartCard } from '../components/ChartCard';
import { KpiPill } from '../components/KpiPill';
import { useAiBrief } from '../hooks/useAiBrief';
import { dashboard, findKpi } from '../lib/data';

const FALLBACK = `Churn is the best signal this period — 23.7% → 18.7% on 30d average, a 5-point improvement. This is the metric that's actually getting better. If trials convert at the current rate and churn stays here, MRR will move up next period.`;

export function Churn() {
  const { text, source } = useAiBrief({ id: 'churn', fallback: FALLBACK });
  const churn = dashboard.series.churn_rate ?? [];

  return (
    <div className="page">
            <Breadcrumbs crumbs={[
        { label: 'RevenueCat', to: '/' },
        { label: 'Charts', to: '/' },
        { label: 'Churn rate' },
      ]} />
      <div className="page-header">
        <div>
          <h1>Churn</h1>
          <p className="page-subtitle">Rate of paid subscribers canceling or failing renewal.</p>
        </div>
        <div className="page-meta">
          <Clock size={13} /> Updated {new Date(dashboard.generated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>

      <AiSummary title="Churn brief" text={text} source={source} />

      <section className="kpi-strip">
        <KpiPill kpi={findKpi('churn_rate')} label="Churn" accent="orange" context="30-day avg" hint="Rolling 30-day churn rate" />
        <KpiPill kpi={findKpi('active_subscriptions')} label="Active subs" accent="green" context="Current" hint="Currently paying subscribers" />
        <KpiPill kpi={findKpi('mrr')} label="MRR" accent="pink" context="Current" hint="Monthly recurring revenue" />
      </section>

      <ChartCard title="Churn rate" subtitle="30-day moving average, %" series={churn} kind="area" color="#ef4444" height={340} />

      <div className="note-card">
        <strong>Why churn lags.</strong> Churn rate is a moving average, so improvements show up 2–4 weeks after whatever caused them. If this is dropping, the causes happened last month — check what shipped or changed in that window.
      </div>
    </div>
  );
}
