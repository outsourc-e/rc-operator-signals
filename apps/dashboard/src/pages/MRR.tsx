import { AiSummary } from '../components/AiSummary';
import { ChartCard } from '../components/ChartCard';
import { KpiPill } from '../components/KpiPill';
import { dashboard, findKpi } from '../lib/data';
import { formatNumber } from '../lib/format';

export function MRR() {
  const aiText = `MRR is flat at $4,562 over the last 28 days. That's not decline, but it's not growth either — and with trials up 16%, top of funnel is healthier than MRR suggests. If trial conversion holds, MRR will move next period.`;
  const mrr = dashboard.series.mrr ?? [];

  const sub = dashboard.subscription_movement;
  const rows = [
    { label: 'Starting subscribers', value: sub.starting, tone: 'neutral', strong: true },
    { label: 'New subscriptions', value: sub.new, tone: 'positive' },
    { label: 'Reactivations', value: sub.reactivation, tone: 'positive' },
    { label: 'Churned', value: sub.churned, tone: 'negative' },
    { label: 'Net movement', value: sub.movement, tone: sub.movement >= 0 ? 'positive' : 'negative', strong: true },
    { label: 'Ending subscribers', value: sub.ending, tone: 'neutral', strong: true },
  ];
  const max = Math.max(...rows.map((r) => Math.abs(r.value)));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>MRR & Movement</h1>
          <p className="page-subtitle">Monthly recurring revenue normalized across subscription durations, plus the movement breakdown.</p>
        </div>
      </div>

      <AiSummary title="What this chart means" text={aiText} source="rules" />

      <section className="kpi-strip">
        <KpiPill kpi={findKpi('mrr')} label="MRR" />
        <KpiPill kpi={findKpi('active_subscriptions')} label="Active subs" />
        <KpiPill kpi={findKpi('churn_rate')} label="Churn (30d avg)" />
      </section>

      <ChartCard title="MRR trend" subtitle="Last 90 days · $ per day" series={mrr} kind="line" color="#0e78a6" height={320} />

      <article className="chart-card">
        <div className="chart-card-header">
          <div>
            <div className="chart-card-title">Subscription Movement Waterfall</div>
            <div className="chart-card-subtitle">How the {sub.starting.toLocaleString()} starting base became {sub.ending.toLocaleString()} ending</div>
          </div>
        </div>
        <div className="card-body">
          {rows.map((row, idx) => (
            <div key={row.label}>
              <div className="waterfall-row">
                <div className={`waterfall-label ${row.strong ? 'strong' : ''}`}>{row.label}</div>
                <div className="waterfall-bar">
                  <div className={`waterfall-fill ${row.tone}`} style={{ width: `${Math.max((Math.abs(row.value) / max) * 100, 6)}%` }} />
                </div>
                <div className={`waterfall-value ${row.tone === 'neutral' ? '' : row.tone}`}>
                  {row.value > 0 ? '+' : ''}{formatNumber(row.value)}
                </div>
              </div>
              {(idx === 0 || idx === rows.length - 2) && <div className="waterfall-divider" />}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}
