import { useState, useMemo } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { evaluateRules, type RuleCategory, type RuleStatus, type Severity } from '../lib/data';
import { formatNumber } from '../lib/format';

type StatusFilter = 'all' | RuleStatus;
type SeverityFilter = 'all' | Severity;
type CategoryFilter = 'all' | RuleCategory;

const statusOrder: Record<RuleStatus, number> = { fired: 0, watchlist: 1, cleared: 2 };
const severityOrder: Record<Severity, number> = { critical: 0, warning: 1, info: 2, positive: 3 };

const categories: CategoryFilter[] = ['all', 'Monetization', 'Acquisition', 'Retention', 'Data Quality'];

export function Signals() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const rules = useMemo(() => {
    const evaluations = evaluateRules();
    return evaluations.sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      if (a.signal && b.signal) {
        return severityOrder[a.signal.severity] - severityOrder[b.signal.severity];
      }
      return a.name.localeCompare(b.name);
    });
  }, []);

  const counts = useMemo(() => {
    const firedSigs = rules.filter((r) => r.status === 'fired');
    return {
      total: rules.length,
      fired: firedSigs.length,
      cleared: rules.filter((r) => r.status === 'cleared').length,
      watchlist: rules.filter((r) => r.status === 'watchlist').length,
      critical: firedSigs.filter((r) => r.signal?.severity === 'critical').length,
      warning: firedSigs.filter((r) => r.signal?.severity === 'warning').length,
      info: firedSigs.filter((r) => r.signal?.severity === 'info').length,
      positive: firedSigs.filter((r) => r.signal?.severity === 'positive').length,
      categories: {
        Monetization: rules.filter((r) => r.category === 'Monetization').length,
        Acquisition: rules.filter((r) => r.category === 'Acquisition').length,
        Retention: rules.filter((r) => r.category === 'Retention').length,
        'Data Quality': rules.filter((r) => r.category === 'Data Quality').length,
      },
    };
  }, [rules]);

  const filtered = useMemo(() => {
    return rules.filter((rule) => {
      if (statusFilter !== 'all' && rule.status !== statusFilter) return false;
      if (severityFilter !== 'all') {
        if (!rule.signal || rule.signal.severity !== severityFilter) return false;
      }
      if (categoryFilter !== 'all' && rule.category !== categoryFilter) return false;
      return true;
    });
  }, [rules, statusFilter, severityFilter, categoryFilter]);

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
            {counts.fired} of {counts.total} rules fired against the live 28-day window. Cleared rules evaluated the same data and found nothing anomalous.
          </p>
        </div>
      </div>

      <div className="signals-layout">
        <aside className="signals-rail">
          <div className="signals-rail-group">
            <div className="signals-rail-heading">Status</div>
            {(['all', 'fired', 'watchlist', 'cleared'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                className={`rail-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                <span className="rail-btn-label">
                  {status === 'all' ? 'All rules' : status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <span className="rail-btn-count">
                  {status === 'all' ? counts.total : counts[status]}
                </span>
              </button>
            ))}
          </div>

          <div className="signals-rail-group">
            <div className="signals-rail-heading">Severity (fired only)</div>
            {(['all', 'critical', 'warning', 'info', 'positive'] as SeverityFilter[]).map((sev) => (
              <button
                key={sev}
                className={`rail-btn ${severityFilter === sev ? 'active' : ''}`}
                onClick={() => setSeverityFilter(sev)}
              >
                <span className="rail-btn-label">
                  {sev === 'all' ? 'All severities' : sev.charAt(0).toUpperCase() + sev.slice(1)}
                </span>
                <span className="rail-btn-count">
                  {sev === 'all' ? counts.fired : counts[sev]}
                </span>
              </button>
            ))}
          </div>

          <div className="signals-rail-group">
            <div className="signals-rail-heading">Category</div>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`rail-btn ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                <span className="rail-btn-label">
                  {cat === 'all' ? 'All categories' : cat}
                </span>
                <span className="rail-btn-count">
                  {cat === 'all' ? counts.total : counts.categories[cat]}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="signals-main">
          <div className="signals-summary">
            <div className="signals-summary-stat">
              <div className="signals-summary-value">{counts.total}</div>
              <div className="signals-summary-label">Rules evaluated</div>
            </div>
            <div className="signals-summary-stat">
              <div className="signals-summary-value" style={{ color: 'var(--rc-pink, #EE5A60)' }}>{counts.fired}</div>
              <div className="signals-summary-label">Fired</div>
            </div>
            <div className="signals-summary-stat">
              <div className="signals-summary-value" style={{ color: 'var(--warn, #E5A400)' }}>{counts.watchlist}</div>
              <div className="signals-summary-label">Watchlist</div>
            </div>
            <div className="signals-summary-stat">
              <div className="signals-summary-value" style={{ color: 'var(--text-muted, #8a8f98)' }}>{counts.cleared}</div>
              <div className="signals-summary-label">Cleared</div>
            </div>
          </div>

          <div className="brief-list">
            {filtered.map((rule) => (
              <article key={rule.id} className={`brief-item rule-item rule-${rule.status}`}>
                <div className="brief-item-left">
                  <span className={`status-pill ${rule.status}`}>
                    {rule.status === 'fired' && '● FIRED'}
                    {rule.status === 'watchlist' && '◆ WATCH'}
                    {rule.status === 'cleared' && '○ CLEAR'}
                  </span>
                  {rule.signal && (
                    <span className={`severity-pill ${rule.signal.severity}`}>{rule.signal.severity}</span>
                  )}
                  <span className="rule-category-chip">{rule.category}</span>
                </div>
                <div className="brief-item-body">
                  <div className="brief-item-title">
                    {rule.signal ? rule.signal.title : rule.name}
                  </div>
                  <div className="brief-item-detail">
                    {rule.signal ? rule.signal.detail : rule.description}
                  </div>
                  <div className="rule-trigger">
                    <span className="rule-trigger-label">Trigger</span>
                    <code>{rule.trigger}</code>
                  </div>
                  {rule.signal?.evidence && rule.signal.evidence.length > 0 && (
                    <div className="brief-item-evidence">
                      {rule.signal.evidence.map((e, i) => (
                        <span key={`${rule.id}-${i}`} className="evidence-chip">
                          {e.metric}: {formatNumber(e.value)}{e.period ? ` · ${e.period}` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {rule.signal?.followup && (
                  <div className="brief-item-followup">
                    <span className="brief-item-followup-label">Next action</span>
                    <span className="brief-item-followup-text">{rule.signal.followup}</span>
                  </div>
                )}
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="note-card" style={{ textAlign: 'center', padding: '32px' }}>
              No rules match the current filters.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
