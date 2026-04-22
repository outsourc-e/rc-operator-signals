import { Link } from 'react-router-dom';
import { AiSummary } from '../components/AiSummary';
import { HeroChart } from '../components/HeroChart';
import { KpiPill } from '../components/KpiPill';
import { SignalCard } from '../components/SignalCard';
import { dashboard, findKpi, topSignals } from '../lib/data';

export function Overview() {
  const signals = topSignals(3);

  const aiText = `Dark Noise is in "improving quality, shrinking top" mode — churn dropping fast (23.7% → 18.7%) but revenue slightly down this period. Trials are up 16% while MRR sits flat — watch trial conversion next week, it's the leading indicator that will decide next month's MRR.`;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Overview</h1>
          <p className="page-subtitle">
            {dashboard.period.days}-day operator view for <strong>{dashboard.project.name}</strong>. What changed, what matters, what to fix.
          </p>
        </div>
      </div>

      <AiSummary title="Today's operator brief" text={aiText} source="rules" />

      <section className="hero-section">
        <div className="hero-section-header">
          <div>
            <h2>Revenue vs MRR</h2>
            <div className="section-subtitle">The two are drifting apart — that's usually a story worth reading.</div>
          </div>
          <Link className="btn btn-ghost" to="/revenue">Revenue drill-down →</Link>
        </div>
        <HeroChart />
      </section>

      <section className="kpi-strip">
        <KpiPill kpi={findKpi('mrr')} label="MRR" />
        <KpiPill kpi={findKpi('revenue')} label="Revenue (28d)" />
        <KpiPill kpi={findKpi('active_subscriptions')} label="Active subs" />
        <KpiPill kpi={findKpi('churn_rate')} label="Churn (30d avg)" />
      </section>

      <section className="signals-section">
        <div className="section-header">
          <div>
            <h2>Top signals</h2>
            <div className="section-subtitle">Deterministic detection from the signal engine</div>
          </div>
          <Link className="btn btn-ghost" to="/brief">Full AI brief →</Link>
        </div>
        <div className="signals-grid">
          {signals.map((s) => <SignalCard key={s.id} signal={s} />)}
        </div>
      </section>

      <section className="drill-grid">
        <Link to="/revenue" className="drill-card">
          <div className="drill-title">Revenue</div>
          <div className="drill-sub">Period breakdown, trends, cohorts</div>
        </Link>
        <Link to="/mrr" className="drill-card">
          <div className="drill-title">MRR & Movement</div>
          <div className="drill-sub">Waterfall of net subscriber motion</div>
        </Link>
        <Link to="/subscribers" className="drill-card">
          <div className="drill-title">Subscribers</div>
          <div className="drill-sub">Actives, new, reactivated, churned</div>
        </Link>
        <Link to="/churn" className="drill-card">
          <div className="drill-title">Churn</div>
          <div className="drill-sub">Trend + what's moving it</div>
        </Link>
        <Link to="/trials" className="drill-card">
          <div className="drill-title">Trials</div>
          <div className="drill-sub">Funnel, conversion, new trials</div>
        </Link>
        <Link to="/brief" className="drill-card">
          <div className="drill-title">Today's AI brief</div>
          <div className="drill-sub">Full signals, exports, markdown</div>
        </Link>
      </section>
    </div>
  );
}
