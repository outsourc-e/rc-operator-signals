import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { brief, dashboard } from '../lib/data';
import { useTheme } from '../hooks/useTheme';
import { useSidebar } from '../hooks/useSidebar';
import {
  Home, DollarSign, TrendingUp, Users, TrendingDown,
  FlaskConical, Brain, Zap, Plug, PanelLeftClose, PanelLeftOpen,
  Sun, Moon, Bell, Menu, LogOut, Settings, UserCircle2, ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { AiChatWidget } from './AiChatWidget';

const navSections = [
  {
    label: null,
    items: [
      { to: '/', label: 'Home', icon: Home, end: true },
      { to: '/revenue', label: 'Revenue', icon: DollarSign },
      { to: '/mrr', label: 'MRR', icon: TrendingUp },
      { to: '/subscribers', label: 'Subscribers', icon: Users },
      { to: '/churn', label: 'Churn', icon: TrendingDown },
      { to: '/trials', label: 'Trials', icon: FlaskConical },
    ],
  },
  {
    label: 'Shortcuts',
    items: [
      { to: '/signals', label: 'Signals', icon: Zap },
      { to: '/brief', label: 'AI Brief', icon: Brain },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/integrations', label: 'Integrations', icon: Plug },
    ],
  },
];

function useClickOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', esc);
    };
  }, [onClose]);
  return ref;
}

function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  const notifications = [...brief.signals, ...brief.contradictions].slice(0, 4);

  return (
    <div className="menu-wrap" ref={ref}>
      <button
        className="icon-btn notification-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={16} strokeWidth={1.75} />
        {notifications.length > 0 && <span className="notification-dot" />}
      </button>
      {open && (
        <div className="menu-panel notifications-panel">
          <div className="menu-head">
            <span>Signals</span>
            <span className="menu-head-count">{notifications.length}</span>
          </div>
          <div className="menu-list">
            {notifications.map((n) => (
              <div key={n.id} className="menu-item notification-item">
                <span className={`notification-severity ${n.severity}`} />
                <div className="notification-body">
                  <div className="notification-title">{n.title}</div>
                  <div className="notification-detail">{n.detail}</div>
                </div>
              </div>
            ))}
          </div>
          <NavLink to="/signals" className="menu-footer" onClick={() => setOpen(false)}>
            View all signals →
          </NavLink>
        </div>
      )}
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  return (
    <div className="menu-wrap" ref={ref}>
      <button
        className="user-avatar"
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        aria-expanded={open}
      >
        <span className="avatar-initials">EO</span>
      </button>
      {open && (
        <div className="menu-panel user-panel">
          <div className="user-panel-head">
            <span className="user-panel-avatar">EO</span>
            <div>
              <div className="user-panel-name">Eric (Operator)</div>
              <div className="user-panel-email">operator@darknoise.app</div>
            </div>
          </div>
          <div className="menu-list">
            <button className="menu-item">
              <UserCircle2 size={15} /> Profile
            </button>
            <button className="menu-item">
              <Settings size={15} /> Settings
            </button>
            <a
              href="https://github.com/outsourc-e/rc-operator-signals"
              target="_blank"
              rel="noreferrer"
              className="menu-item"
            >
              <ExternalLink size={15} /> View source
            </a>
          </div>
          <div className="menu-divider" />
          <button className="menu-item danger">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function Layout() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { collapsed, toggle: toggleSidebar } = useSidebar();

  return (
    <div className="app-shell" data-sidebar={collapsed ? 'collapsed' : 'expanded'}>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-brand-col">
            <button className="icon-btn sidebar-toggle-mobile" onClick={toggleSidebar} aria-label="Toggle sidebar">
              <Menu size={18} />
            </button>
            <div className="brand">
              <img src="/brand/rc-mark.png" alt="RevenueCat" className="brand-logo" />
              {!collapsed && <span className="brand-name">Operator Signals</span>}
            </div>
          </div>

          <div className="topbar-actions">
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
              {theme === 'dark' ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
            </button>
            <button className="icon-btn" aria-label="Help" title="Help & docs">
              <HelpCircle size={16} strokeWidth={1.75} />
            </button>
            <NotificationsMenu />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="main-grid">
        <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
          {!collapsed && (
            <div className="sidebar-head">
              <button
                className="sidebar-collapse-btn"
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={16} />
              </button>
            </div>
          )}

          {collapsed && (
            <button
              className="sidebar-collapse-btn sidebar-collapse-btn-full"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              title="Expand sidebar"
            >
              <PanelLeftOpen size={16} />
            </button>
          )}

          <nav>
            {navSections.map((section, si) => (
              <div key={section.label ?? `s-${si}`} className="nav-section">
                {!collapsed && section.label && (
                  <div className="nav-section-label">{section.label}</div>
                )}
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={16} strokeWidth={1.75} />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {!collapsed && (
            <div className="sidebar-footer-meta">
              <div className="sidebar-status-card">
                <div className="sidebar-status-row">
                  <span className="sidebar-status-dot connected" />
                  <span className="sidebar-status-label">Charts API connected</span>
                </div>
                <div className="sidebar-status-row">
                  <span className="sidebar-status-meta">Last sync</span>
                  <span className="sidebar-status-value">
                    {new Date(dashboard.generated_at).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
                    })}
                  </span>
                </div>
                <div className="sidebar-status-row">
                  <span className="sidebar-status-meta">Data points</span>
                  <span className="sidebar-status-value">
                    {dashboard.kpis.length} KPIs · {dashboard.period.days}d window
                  </span>
                </div>
              </div>
            </div>
          )}
        </aside>

        <main className="content">
          <Outlet />
        </main>
      </div>

      <AiChatWidget />
    </div>
  );
}
