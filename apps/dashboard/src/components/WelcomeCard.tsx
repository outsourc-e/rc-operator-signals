import { useState } from 'react';
import { dashboard } from '../lib/data';
import { shortDate } from '../lib/format';

type StatMode = 'revenue' | 'transactions' | 'since';

const labels: Record<StatMode, string> = {
  revenue: 'All-time revenue',
  transactions: 'All-time transactions',
  since: 'Tracking since',
};

function formatAllTime(revenue: number): string {
  if (revenue >= 1_000_000) return `$${(revenue / 1_000_000).toFixed(2)}M`;
  if (revenue >= 1_000) return `$${Math.round(revenue / 1_000)}K`;
  return `$${revenue}`;
}
function formatTxCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}K`;
  return String(count);
}

export function WelcomeCard({ subtitle }: { subtitle?: string }) {
  const { project, all_time } = dashboard;
  const [mode, setMode] = useState<StatMode>('revenue');

  const cycle = () => {
    setMode((m) => (m === 'revenue' ? 'transactions' : m === 'transactions' ? 'since' : 'revenue'));
  };

  const value =
    mode === 'revenue' ? formatAllTime(all_time.revenue)
    : mode === 'transactions' ? formatTxCount(all_time.transactions)
    : shortDate(all_time.earliest_date);

  const sub =
    mode === 'revenue' ? `${formatTxCount(all_time.transactions)} transactions`
    : mode === 'transactions' ? `${formatAllTime(all_time.revenue)} lifetime`
    : `${new Date(all_time.earliest_date).getFullYear()} · ${Math.floor((Date.now() - new Date(all_time.earliest_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years`;

  return (
    <div className="welcome-card">
      <div className="welcome-card-bg" aria-hidden />
      <div className="welcome-card-inner">
        <img
          src="/brand/dark-noise.webp"
          alt={project.name}
          className="welcome-logo"
        />
        <div className="welcome-body">
          <div className="welcome-header">
            <span className="welcome-greeting">Welcome back, <strong>{project.name}</strong></span>
          </div>
          {subtitle && <div className="welcome-subtitle">{subtitle}</div>}
        </div>
        <button
          className="welcome-stat-toggle"
          onClick={cycle}
          aria-label="Cycle stat view"
          title="Click to cycle"
        >
          <span className="welcome-stat-label">{labels[mode]}</span>
          <span className="welcome-stat-value">{value}</span>
          <span className="welcome-stat-sub">{sub}</span>
          <span className="welcome-stat-dots" aria-hidden>
            <span className={mode === 'revenue' ? 'on' : ''} />
            <span className={mode === 'transactions' ? 'on' : ''} />
            <span className={mode === 'since' ? 'on' : ''} />
          </span>
        </button>
      </div>
    </div>
  );
}
