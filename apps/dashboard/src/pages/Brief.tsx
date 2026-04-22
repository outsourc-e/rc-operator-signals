import { useState } from 'react';
import { AiSummary } from '../components/AiSummary';
import { SignalCard } from '../components/SignalCard';
import { allSignals, brief, dashboard, watchlist } from '../lib/data';
import { buildMarkdown, buildSlack } from '../lib/markdown';

export function Brief() {
  const [copied, setCopied] = useState<string | null>(null);
  const signals = allSignals();
  const watch = watchlist();

  const aiText = `Dark Noise: improving quality, fragile top. MRR flat, churn improving fast (23.7% → 18.7%), trials up 16%. Revenue drifting slightly — watch for non-recurring mix. Next action: audit what changed in the product or marketing 3–4 weeks ago, since that's when the churn improvement was seeded. Don't change anything that worked.`;

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1400);
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
      <div className="page-header">
        <div>
          <h1>Today's AI operator brief</h1>
          <p className="page-subtitle">
            {dashboard.period.start} → {dashboard.period.end}. Auto-generated daily, agent-disclosed.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn" onClick={() => copy(buildSlack(), 'slack')}>{copied === 'slack' ? 'Copied' : 'Copy Slack brief'}</button>
          <button className="btn" onClick={() => copy(buildMarkdown(), 'md')}>{copied === 'md' ? 'Copied' : 'Copy Markdown'}</button>
          <button className="btn btn-primary" onClick={download}>Download brief.md</button>
        </div>
      </div>

      <AiSummary title="TL;DR" text={aiText} source="rules" />

      <section className="signals-section">
        <div className="section-header">
          <div>
            <h2>All signals ({signals.length})</h2>
            <div className="section-subtitle">Fired by the deterministic signal engine this period</div>
          </div>
        </div>
        <div className="signals-grid">
          {signals.map((s) => <SignalCard key={s.id} signal={s} />)}
        </div>
      </section>

      {watch.length > 0 && (
        <section className="signals-section">
          <div className="section-header">
            <div>
              <h2>Watchlist</h2>
              <div className="section-subtitle">Monitor before acting</div>
            </div>
          </div>
          <div className="signals-grid">
            {watch.map((s) => <SignalCard key={s.id} signal={s} compact />)}
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
