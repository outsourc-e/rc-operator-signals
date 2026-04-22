import { NavLink, Outlet } from 'react-router-dom';
import { dashboard } from '../lib/data';

const navItems: Array<{ to: string; label: string; end?: boolean }> = [
  { to: '/', label: 'Overview', end: true },
  { to: '/revenue', label: 'Revenue' },
  { to: '/mrr', label: 'MRR' },
  { to: '/subscribers', label: 'Subscribers' },
  { to: '/churn', label: 'Churn' },
  { to: '/trials', label: 'Trials' },
  { to: '/brief', label: 'AI Brief' },
];

export function Layout() {
  return (
    <div className="app-shell">
      <div className="disclosure">
        <span>
          Built by <strong>Aurora</strong>, an autonomous AI agent, on top of RevenueCat's Charts API. Full agent disclosure.
        </span>
        <a href="https://github.com/outsourc-e/rc-operator-signals" target="_blank" rel="noreferrer">View source ↗</a>
      </div>

      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <div className="brand">
              <span className="brand-logo">R</span>
              <span className="brand-name">RC Operator Signals</span>
            </div>
            <div className="project-pill">
              <span className="project-name">{dashboard.project.name}</span>
              <span className="project-caret">▾</span>
            </div>
            <div className="live-pill"><span className="live-dot" />Live · {dashboard.project.stores}</div>
          </div>
          <div className="topbar-right">
            <div className="period-picker">
              <button className="period-active">28d</button>
              <button disabled title="Coming soon">7d</button>
              <button disabled title="Coming soon">90d</button>
            </div>
            <a className="btn btn-ghost" href="https://github.com/outsourc-e/rc-operator-signals" target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
        </div>
      </header>

      <div className="main-grid">
        <aside className="sidebar">
          <nav>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="sidebar-period">
              <div className="sidebar-label">Period</div>
              <div className="sidebar-value">{dashboard.period.start} → {dashboard.period.end}</div>
              <div className="sidebar-sub">{dashboard.period.days} days · vs prior {dashboard.period.prior_start} → {dashboard.period.prior_end}</div>
            </div>
          </div>
        </aside>

        <main className="content">
          <Outlet />
        </main>
      </div>

      <footer className="footer">
        <div>
          All-time revenue analyzed: <strong>${dashboard.all_time.revenue.toLocaleString()}</strong> across <strong>{dashboard.all_time.transactions.toLocaleString()}</strong> transactions since {dashboard.all_time.earliest_date}.
        </div>
        <div className="footer-links">
          <a href="https://github.com/outsourc-e/rc-operator-signals" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://github.com/outsourc-e/rc-operator-signals/blob/main/PROGRESS.md" target="_blank" rel="noreferrer">Process log</a>
          <a href="https://www.revenuecat.com/docs/api-v2" target="_blank" rel="noreferrer">RevenueCat API</a>
        </div>
      </footer>
    </div>
  );
}
