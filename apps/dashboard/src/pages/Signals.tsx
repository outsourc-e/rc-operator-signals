import { useState, useMemo } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { allSignals as getAll, brief, type Severity } from '../lib/data';
import { formatNumber } from '../lib/format';

const severities: Array<Severity | 'all'> = ['all', 'critical', 'warning', 'info', 'positive'];
const severityOrder: Record<Severity, number> = { critical: 0, warning: 1, info: 2, positive: 3 };

export function Signals() {
  const [filter, setFilter] = useState<Severity | 'all'>('all');

  const allSignals = useMemo(() => {
    const combined = [...getAll(), ...brief.watchlist];
    const seen = new Set<string>();
    const deduped = combined.filter((s) => {
      if (seen.has(s.title)) return false;
      seen.add(s.title);
      return true;
    });
    return deduped.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return allSignals;
    return allSignals.filter((s) => s.severity === filter);
  }, [allSignals, filter]);

  return (
    <div className="page">
            <Breadcrumbs crumbs={[
        { label: 'RevenueCat', to: '/' },
        { label: 'Charts', to: '/' },
        { label: 'Signals' },
      ]} />
      <div className="page-header">
        <div>
          <h1>Signals</h1>
          <p className="page-subtitle">
            Deterministic anomaly detection. {allSignals.length} fired this period, sorted by severity.
          </p>
        </div>
        <div className="signals-filters signals-filters-inline">
          {severities.map((s) => {
            const count = s === 'all' ? allSignals.length : allSignals.filter((sig) => sig.severity === s).length;
            return (
              <button
                key={s}
                className={`filter-btn ${filter === s ? 'active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                <span className="filter-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="brief-list">
        {filtered.map((s) => (
          <article key={s.id} className="brief-item">
            <div className="brief-item-left">
              <span className={`severity-pill ${s.severity}`}>{s.severity}</span>
            </div>
            <div className="brief-item-body">
              <div className="brief-item-title">{s.title}</div>
              <div className="brief-item-detail">{s.detail}</div>
              {s.evidence?.length > 0 && (
                <div className="brief-item-evidence">
                  {s.evidence.map((e, i) => (
                    <span key={`${s.id}-${i}`} className="evidence-chip">
                      {e.metric}: {formatNumber(e.value)}{e.period ? ` · ${e.period}` : ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {s.followup && (
              <div className="brief-item-followup">
                <span className="brief-item-followup-label">Next action</span>
                <span className="brief-item-followup-text">{s.followup}</span>
              </div>
            )}
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="note-card" style={{ textAlign: 'center', padding: '32px' }}>
          No signals match the current filter.
        </div>
      )}
    </div>
  );
}
