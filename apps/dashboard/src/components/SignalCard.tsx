import { severityIcon, type Signal } from '../lib/data';
import { formatNumber } from '../lib/format';

export function SignalCard({ signal, compact = false }: { signal: Signal; compact?: boolean }) {
  return (
    <div className={`signal-card ${compact ? 'compact' : ''}`}>
      <div className="signal-header">
        <span className={`severity-pill ${signal.severity}`}>{severityIcon[signal.severity]} {signal.severity}</span>
        <span className="signal-kind">{signal.kind}</span>
      </div>
      <div className="signal-title">{signal.title}</div>
      <div className="signal-detail">{signal.detail}</div>
      {!compact && signal.evidence?.length > 0 && (
        <div className="signal-evidence">
          {signal.evidence.map((e, i) => (
            <span key={`${signal.id}-${i}`} className="evidence-chip">
              {e.metric}: {formatNumber(e.value)}{e.period ? ` (${e.period})` : ''}
            </span>
          ))}
        </div>
      )}
      {!compact && signal.followup && <div className="signal-followup">→ {signal.followup}</div>}
    </div>
  );
}
