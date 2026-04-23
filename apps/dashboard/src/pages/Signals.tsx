import { useState, useMemo, useEffect } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { allSignals as getAll, brief, type Severity } from '../lib/data';
import { formatNumber } from '../lib/format';

const severities: Array<Severity | 'all'> = ['all', 'critical', 'warning', 'info', 'positive'];
const severityOrder: Record<Severity, number> = { critical: 0, warning: 1, info: 2, positive: 3 };
const PAGE_SIZE = 5;

export function Signals() {
  const [filter, setFilter] = useState<Severity | 'all'>('all');
  const [page, setPage] = useState(1);

  const allSignals = useMemo(() => {
    const combined = [...getAll(), ...brief.watchlist];
    const seen = new Set<string>();
    const deduped = combined.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
    return deduped.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return allSignals;
    return allSignals.filter((s) => s.severity === filter);
  }, [allSignals, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filter]);

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
            Fired by the signal engine this period, sorted by severity.
          </p>
        </div>
        <div className="page-indicator">
          <button
            className="page-indicator-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            ←
          </button>
          <span className="page-indicator-label">
            Page <strong>{currentPage}</strong> of {totalPages}
          </span>
          <button
            className="page-indicator-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
          >
            →
          </button>
        </div>
      </div>

      <div className="signals-layout">
        <aside className="signals-rail">
          <div className="signals-rail-heading">Severity</div>
          {severities.map((s) => {
            const count = s === 'all' ? allSignals.length : allSignals.filter((sig) => sig.severity === s).length;
            return (
              <button
                key={s}
                className={`rail-btn ${filter === s ? 'active' : ''}`}
                onClick={() => setFilter(s)}
              >
                <span className="rail-btn-label">
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
                <span className="rail-btn-count">{count}</span>
              </button>
            );
          })}
        </aside>

        <section className="signals-main">
          <div className="brief-list">
            {paged.map((s) => (
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
        </section>
      </div>
    </div>
  );
}
