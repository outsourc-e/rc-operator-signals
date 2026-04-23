import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AiSummary } from '../components/AiSummary';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ExportMenu } from '../components/ExportMenu';
import { allSignals, brief, dashboard, watchlist } from '../lib/data';
import type { Severity } from '../lib/data';
import { formatNumber } from '../lib/format';
import { buildMarkdown, buildSlack } from '../lib/markdown';
import { useAiBrief } from '../hooks/useAiBrief';

const DEFAULT_BRIEF = `Dark Noise: improving quality, fragile top. MRR flat, churn improving fast (23.7% → 18.7%), trials up 16%. Revenue drifting slightly — watch for non-recurring mix. Next action: audit what changed in the product or marketing 3-4 weeks ago, since that's when the churn improvement was seeded. Don't change anything that worked.`;

const severities: Array<Severity | 'all'> = ['all', 'critical', 'warning', 'info', 'positive'];

export function Brief() {
  const { text, source } = useAiBrief({ id: 'brief', fallback: DEFAULT_BRIEF });
  const [filter, setFilter] = useState<Severity | 'all'>('all');
  const signalsAll = allSignals();
  const signals = useMemo(
    () => filter === 'all' ? signalsAll : signalsAll.filter((s) => s.severity === filter),
    [signalsAll, filter],
  );
  const watch = watchlist();

  const copy = async (t: string) => {
    await navigator.clipboard.writeText(t);
  };

  const download = () => {
    const blob = new Blob([buildMarkdown()], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rc-operator-signals-${dashboard.project.name.toLowerCase().replace(/\s+/g, '-')}-${dashboard.period.end}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page">
            <Breadcrumbs crumbs={[
        { label: 'RevenueCat', to: '/' },
        { label: 'Intelligence', to: '/' },
        { label: 'AI operator brief' },
      ]} />
      <div className="page-header">
        <div>
          <h1>AI operator brief</h1>
          <p className="page-subtitle">
            {dashboard.period.start} → {dashboard.period.end}. Regenerates on every data refresh.
          </p>
        </div>
        <div className="page-actions">
          <span className="brief-ai-tag">
            <Sparkles size={12} /> AI-generated
          </span>
          <ExportMenu
            onCopySlack={() => copy(buildSlack())}
            onCopyMarkdown={() => copy(buildMarkdown())}
            onDownload={download}
          />
        </div>
      </div>

      <AiSummary title="TL;DR" text={text} source={source} />

      <section className="brief-list-section">
        <div className="section-header">
          <div className="signals-filters signals-filters-inline">
            {severities.map((s) => {
              const count = s === 'all' ? signalsAll.length : signalsAll.filter((sig) => sig.severity === s).length;
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
          {signals.map((s) => (
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
      </section>

      {watch.length > 0 && (
        <section className="brief-list-section">
          <div className="section-header">
            <div>
              <h2>Watchlist</h2>
              <div className="section-subtitle">Monitor before acting</div>
            </div>
          </div>
          <div className="brief-list">
            {watch.map((s) => (
              <article key={s.id} className="brief-item brief-item-compact">
                <div className="brief-item-left">
                  <span className={`severity-pill ${s.severity}`}>{s.severity}</span>
                </div>
                <div className="brief-item-body">
                  <div className="brief-item-title">{s.title}</div>
                  <div className="brief-item-detail">{s.detail}</div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {brief.caveats?.length > 0 && (
        <section className="note-card">
          <strong>Caveats.</strong>
          <ul>
            {brief.caveats.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
