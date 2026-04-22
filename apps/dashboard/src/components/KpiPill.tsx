import type { KPI } from '../lib/data';
import { formatDelta, formatValue } from '../lib/format';

export function KpiPill({ kpi, label }: { kpi: KPI | undefined; label?: string }) {
  if (!kpi) return null;
  const delta = formatDelta(kpi.delta);
  return (
    <div className="kpi-pill">
      <div className="kpi-pill-label">{label ?? kpi.name}</div>
      <div className="kpi-pill-value">{formatValue(kpi.value, kpi.unit)}</div>
      <div className={`kpi-pill-delta ${delta.className}`}>
        {delta.className === 'up' ? '↑' : delta.className === 'down' ? '↓' : '•'} {delta.text}
      </div>
    </div>
  );
}
