import { Link } from 'react-router-dom';
import { AiSummary } from '../components/AiSummary';
import { HeroChart } from '../components/HeroChart';
import { KpiPill } from '../components/KpiPill';
import { SignalCard } from '../components/SignalCard';
import { WelcomeCard } from '../components/WelcomeCard';
import { useAiBrief } from '../hooks/useAiBrief';
import { dashboard, findKpi, topSignals } from '../lib/data';
import { shortDate } from '../lib/format';

const severityOrder = { critical: 0, warning: 1, info: 2, positive: 3 } as const;
const FALLBACK = `Dark Noise is in "improving quality, shrinking top" mode — churn dropping fast (23.7% → 18.7%) but revenue slightly down this period. Trials are up 16% while MRR sits flat — watch trial conversion next week, it's the leading indicator that will decide next month's MRR.`;

export function Overview() {
  const signals = topSignals(3)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const { text, source } = useAiBrief({ id: 'overview', fallback: FALLBACK });

  return (
    <div className="page">
      <WelcomeCard />

      <AiSummary title="Today's operator brief" text={text} source={source} />

      <section className="hero-section">
        <div className="hero-section-header">
          <div>
            <h2>Revenue vs MRR</h2>
            <div className="section-subtitle">
              The two are drifting apart — revenue spiked Apr 21 with flat MRR, likely non-recurring purchases. MRR is the recurring-revenue story.
            </div>
          </div>
          <div className="hero-section-controls">
            <div className="period-select">
              <button className="period-select-btn" disabled title="Custom periods coming soon">7d</button>
              <button className="period-select-btn active">28d</button>
              <button className="period-select-btn" disabled title="Custom periods coming soon">90d</button>
            </div>
            <span className="hero-date-range">
              {shortDate(dashboard.period.start)} – {shortDate(dashboard.period.end)}
            </span>
          </div>
        </div>
        <HeroChart />
        <div className="hero-section-footer">
          <Link className="btn btn-ghost" to="/revenue">Revenue drill-down →</Link>
        </div>
      </section>

      <section className="kpi-strip">
        <KpiPill kpi={findKpi('mrr')} label="MRR" hint="Monthly recurring revenue" accent="pink" context="Current" />
        <KpiPill kpi={findKpi('revenue')} label={`Revenue`} hint="Total revenue in period" accent="blue" context="Last 28 days" />
        <KpiPill kpi={findKpi('active_subscriptions')} label="Active subs" hint="Currently paying subscribers" accent="green" context="In total" />
        <KpiPill kpi={findKpi('churn_rate')} label="Churn" hint="Rolling 30-day churn rate" accent="orange" context="30-day avg" />
      </section>

      <section className="signals-section">
        <div className="section-header">
          <div>
            <h2>Top signals</h2>
            <div className="section-subtitle">Deterministic detection from the signal engine</div>
          </div>
          <Link className="btn btn-ghost" to="/signals">All signals →</Link>
        </div>
        <div className="signals-grid">
          {signals.map((s) => <SignalCard key={s.id} signal={s} />)}
        </div>
      </section>
    </div>
  );
}
