import type { KPI } from '../lib/data';
import { formatDelta, formatValue } from '../lib/format';
import { Info } from 'lucide-react';

type Accent = 'blue' | 'pink' | 'green' | 'orange' | 'purple';

type Props = {
  kpi: KPI | undefined;
  label?: string;
  hint?: string;
  accent?: Accent;
  context?: string; // "Last 28 days" / "In total"
};

export function KpiPill({ kpi, label, hint, accent = 'blue', context }: Props) {
  if (!kpi) return null;
  const delta = formatDelta(kpi.delta);
  const arrow = delta.className === 'up' ? '↑' : delta.className === 'down' ? '↓' : '•';

  return (
    <div className={`kpi-pill kpi-pill-${accent}`}>
      <div className="kpi-pill-accent-bar" />
      <div className="kpi-pill-body">
        <div className="kpi-pill-header">
          <span className="kpi-pill-label">{label ?? kpi.name}</span>
          {hint && (
            <span className="kpi-pill-hint" title={hint}>
              <Info size={12} strokeWidth={1.75} />
            </span>
          )}
        </div>
        <div className="kpi-pill-value">{formatValue(kpi.value, kpi.unit)}</div>
        <div className="kpi-pill-footer">
          {context && <span className="kpi-pill-context">{context}</span>}
          <span className={`kpi-pill-delta ${delta.className}`}>
            {arrow} {delta.text}
          </span>
          {kpi.delta && delta.className !== 'flat' && (
            <span className="kpi-pill-period">vs prior</span>
          )}
        </div>
      </div>
    </div>
  );
}
