import { Plug, Code, Terminal, LayoutDashboard, ArrowRight } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';

const mcpConfig = `{
  "mcpServers": {
    "revenuecat": {
      "command": "npx",
      "args": ["-y", "@outsourc-e/revenuecat-mcp"],
      "env": {
        "RC_API_KEY": "sk_your_key_here"
      }
    }
  }
}`;

const sdkUsage = `import { RevenueCatCharts } from '@outsourc-e/revenuecat-charts';

const rc = new RevenueCatCharts({ apiKey: process.env.RC_API_KEY });

const overview = await rc.getOverview('project_id', '28d');
console.log(overview.metrics.mrr);`;

const cliUsage = `# Run with demo data
npx @outsourc-e/rc-brief --demo --period 28d

# With your key
RC_API_KEY=sk_... npx @outsourc-e/rc-brief --period 28d`;

const dashboardUsage = `# Clone and run locally
git clone https://github.com/outsourc-e/rc-operator-signals
cd rc-operator-signals && pnpm install
pnpm --filter dashboard dev`;

const tools = [
  'rc_get_chart',
  'rc_get_overview',
  'rc_detect_signals',
  'rc_weekly_brief',
  'rc_explain_signal',
];

export function Integrations() {
  return (
    <div className="page">
            <Breadcrumbs crumbs={[
        { label: 'RevenueCat', to: '/' },
        { label: 'Tools', to: '/' },
        { label: 'Integrations' },
      ]} />
      <div className="integrations-hero">
        <h1>Connect your agent to RevenueCat</h1>
        <p>
          Drop our MCP server into Claude Desktop, Cursor, or Cline. Query your subscription data in natural language.
          Or use the SDK, CLI, and dashboard directly.
        </p>
        <div className="integrations-hero-actions">
          <a
            href="https://github.com/outsourc-e/rc-operator-signals"
            target="_blank"
            rel="noreferrer"
            className="integrations-cta"
          >
            View on GitHub <ArrowRight size={14} />
          </a>
          <a
            href="https://github.com/outsourc-e/rc-operator-signals#quick-start"
            target="_blank"
            rel="noreferrer"
            className="integrations-cta-ghost"
          >
            Quick start →
          </a>
        </div>
      </div>

      <div className="integration-cards">
        <div className="integration-card">
          <div className="integration-card-icon">
            <Plug size={20} />
          </div>
          <h3>MCP Server</h3>
          <span className="pkg-name">@outsourc-e/revenuecat-mcp</span>
          <p>5 tools for any MCP-compatible agent. Drop into Claude Desktop config and start querying.</p>
          <pre><code>{mcpConfig}</code></pre>
          <div className="tools-list">
            {tools.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        <div className="integration-card">
          <div className="integration-card-icon">
            <Code size={20} />
          </div>
          <h3>TypeScript SDK</h3>
          <span className="pkg-name">@outsourc-e/revenuecat-charts</span>
          <p>Typed client with rate limiting and retries. Full coverage of Charts API v2 endpoints.</p>
          <pre><code>{sdkUsage}</code></pre>
        </div>

        <div className="integration-card">
          <div className="integration-card-icon">
            <Terminal size={20} />
          </div>
          <h3>CLI</h3>
          <span className="pkg-name">@outsourc-e/rc-brief</span>
          <p>Operator brief in your terminal. Signals, KPIs, and AI narration in one command.</p>
          <pre><code>{cliUsage}</code></pre>
        </div>

        <div className="integration-card">
          <div className="integration-card-icon">
            <LayoutDashboard size={20} />
          </div>
          <h3>Web Dashboard</h3>
          <span className="pkg-name">rc-operator-signals.vercel.app</span>
          <p>This dashboard. Self-hosted, open source, read-only. Deploy free on Vercel in one click.</p>
          <pre><code>{dashboardUsage}</code></pre>
        </div>
      </div>

      <div className="integrations-footer">
        <p><strong>Built for agents, useful for humans.</strong></p>
        <p>
          The MCP server exposes structured subscription intelligence to any agent that speaks the protocol.
          No dashboards needed — your agent can query revenue, detect anomalies, and generate briefs autonomously.
        </p>
      </div>
    </div>
  );
}
