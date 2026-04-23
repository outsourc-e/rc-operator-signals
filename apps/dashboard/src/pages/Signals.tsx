import { useState, useMemo, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { AiSummary } from '../components/AiSummary';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { allSignals as getAll, brief, type Severity } from '../lib/data';
import { formatNumber } from '../lib/format';
import { useAiBrief } from '../hooks/useAiBrief';

const severities: Array<Severity | 'all'> = ['all', 'critical', 'warning', 'info', 'positive'];
const severityOrder: Record<Severity, number> = { critical: 0, warning: 1, info: 2, positive: 3 };
const PAGE_SIZE = 5;

const DEFAULT_SIGNALS_BRIEF = 'The engine evaluated 10 rules against the live 28-day window and surfaced what deserves attention, sorted by severity.';

export function Signals() {
  const { text, source } = useAiBrief({ id: 'signals', fallback: DEFAULT_SIGNALS_BRIEF });
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
            {brief.period.start} → {brief.period.end}. Regenerates on every data refresh.
          </p>
        </div>
        <div className="page-actions">
          <span className="brief-ai-tag">
            <Sparkles size={12} /> AI-generated
          </span>
        </div>
      </div>

      <AiSummary title="TL;DR" text={text} source={source} />

      <section className="brief-list-section">
        <div className="section-header">
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
          {totalPages > 1 && (
            <nav className="pager" aria-label="Pagination">
              <button
                type="button"
                className="pager-arrow"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`pager-dot ${n === currentPage ? 'active' : ''}`}
                  onClick={() => setPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === currentPage ? 'page' : undefined}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="pager-arrow"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
              >
                ›
              </button>
            </nav>
          )}
        </div>

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
  );
}
