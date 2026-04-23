import { Clock } from 'lucide-react';
import { AiSummary } from '../components/AiSummary';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ChartCard } from '../components/ChartCard';
import { KpiPill } from '../components/KpiPill';
import { useAiBrief } from '../hooks/useAiBrief';
import { dashboard, findKpi } from '../lib/data';

const FALLBACK = `Revenue is drifting slightly (-0.9% vs prior 28d, $4,919 → $4,939 → $4,984 → $5,148 across the last 4 periods). This is running ahead of MRR ($4,562), which means ~$357 of this period's revenue is non-recurring — consumables, one-time unlocks, or non-renewing subs. Revenue can be misleading in isolation; MRR is the recurring story.`;

export function Revenue() {
  const { text, source } = useAiBrief({ id: 'revenue', fallback: FALLBACK });
  const series = dashboard.series.revenue ?? [];

  return (
    <div className="page">
      <Breadcrumbs crumbs={[
        { label: 'RevenueCat', to: '/' },
        { label: 'Charts', to: '/' },
        { label: 'Revenue' },
      ]} />
      <div className="page-header">
        <div>
          <h1>Revenue</h1>
          <p className="page-subtitle">Total revenue recognized in the period, credited on the transaction date.</p>
        </div>
        <div className="page-meta">
          <Clock size={13} /> Updated {new Date(dashboard.generated_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>

      <AiSummary title="Revenue brief" text={text} source={source} />

      <section className="kpi-strip">
        <KpiPill kpi={findKpi('revenue')} label={`Revenue (${dashboard.period.days}d)`} hint="Total revenue in period" accent="pink" context="Last 28 days" />
        <KpiPill kpi={findKpi('mrr')} label="MRR" hint="Monthly recurring revenue" accent="blue" context="Last 28 days" />
        <KpiPill kpi={findKpi('transactions_count')} label="Transactions" hint="Total transactions recorded" accent="green" context="Last 28 days" />
      </section>

      <ChartCard title="Daily revenue" subtitle="Last 90 days · $ per day" series={series} kind="area" color="#EE5A60" height={360} />

      <div className="note-card">
        <strong>Why revenue ≠ MRR.</strong> RevenueCat credits revenue to the period when a transaction occurred. MRR normalizes across subscription duration. A revenue spike with flat MRR usually means non-recurring items (consumables or refunds) — not growth. Use both together.
      </div>
    </div>
  );
}
