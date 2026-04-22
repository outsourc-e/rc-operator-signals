import { AiSummary } from '../components/AiSummary';
import { ChartCard } from '../components/ChartCard';
import { KpiPill } from '../components/KpiPill';
import { dashboard, findKpi } from '../lib/data';

export function Revenue() {
  const aiText = `Revenue is drifting slightly (-0.9% vs prior 28d, $4,919 → $4,939 → $4,984 → $5,148 across the last 4 periods). This is running ahead of MRR ($4,562), which means ~$357 of this period's revenue is non-recurring — consumables, one-time unlocks, or non-renewing subs. Revenue can be misleading in isolation; MRR is the recurring story.`;
  const series = dashboard.series.revenue ?? [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Revenue</h1>
          <p className="page-subtitle">Total revenue recognized in the period, credited on the transaction date.</p>
        </div>
      </div>

      <AiSummary title="What this chart means" text={aiText} source="rules" />

      <section className="kpi-strip">
        <KpiPill kpi={findKpi('revenue')} label="Revenue (28d)" />
        <KpiPill kpi={findKpi('mrr')} label="MRR" />
        <KpiPill kpi={findKpi('transactions_count')} label="Transactions" />
      </section>

      <ChartCard title="Daily revenue" subtitle="Last 90 days · $ per day" series={series} kind="area" color="#F4813F" height={360} />

      <div className="note-card">
        <strong>Why revenue ≠ MRR.</strong> RevenueCat credits revenue to the period when a transaction occurred. MRR normalizes across subscription duration. A revenue spike with flat MRR usually means non-recurring items (consumables or refunds) — not growth. Use both together.
      </div>
    </div>
  );
}
