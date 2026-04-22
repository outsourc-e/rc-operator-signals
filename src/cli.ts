// CLI entry — `npx rc-operator-signals --demo` or with --key
import { RevenueCatClient } from './api/client.js';
import { buildBrief, type ChartCache } from './engine/rules.js';
import type { Signal } from './types/index.js';

const SEVERITY_ICON: Record<Signal['severity'], string> = {
  critical: '🚨',
  warning: '⚠️ ',
  info: '💡',
  positive: '✅',
};

interface Args {
  demo: boolean;
  key?: string;
  json: boolean;
  projectId?: string;
}

function parseArgs(argv: string[]): Args {
  const out: Args = { demo: false, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--demo') out.demo = true;
    else if (a === '--json') out.json = true;
    else if (a === '--key' && argv[i + 1]) out.key = argv[++i];
    else if (a === '--project' && argv[i + 1]) out.projectId = argv[++i];
  }
  return out;
}

function fmt(value: number, unit: string): string {
  if (unit === '$') return `$${value.toLocaleString()}`;
  if (unit === '%') return `${value.toFixed(1)}%`;
  return value.toLocaleString();
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  const apiKey =
    args.key ??
    (args.demo ? 'sk_qdnvkjsVGhoVVNGiajqNHYIypcjgs' : process.env.REVENUECAT_API_KEY);

  if (!apiKey) {
    console.error('Missing API key. Use --demo, --key sk_..., or set REVENUECAT_API_KEY env var.');
    process.exit(1);
  }

  const client = new RevenueCatClient({ apiKey });

  // Resolve project ID
  let projectId = args.projectId;
  let projectName = 'Unknown';
  if (!projectId) {
    const projects = await client.listProjects();
    if (projects.items.length === 0) {
      console.error('No projects found for this API key.');
      process.exit(1);
    }
    projectId = projects.items[0].id;
    projectName = projects.items[0].name;
  }

  const overview = await client.getOverview(projectId);

  const cache: ChartCache = {
    overview: overview.metrics,
    charts: {},
  };

  const now = new Date();
  const start = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
  const brief = buildBrief(cache, {
    project_name: projectName,
    period: {
      start: start.toISOString().slice(0, 10),
      end: now.toISOString().slice(0, 10),
    },
  });

  if (args.json) {
    console.log(JSON.stringify(brief, null, 2));
    return;
  }

  // Pretty print
  console.log('');
  console.log(`📊 RevenueCat Operator Signals — ${brief.project_name}`);
  console.log(`   ${brief.period.start} → ${brief.period.end} (last 28 days)`);
  console.log('');

  console.log('SNAPSHOT');
  for (const m of brief.snapshot) {
    console.log(`  ${m.name.padEnd(40)} ${fmt(m.value, m.unit).padStart(12)}`);
  }
  console.log('');

  if (brief.signals.length > 0) {
    console.log('SIGNALS');
    for (const s of brief.signals) {
      console.log(`  ${SEVERITY_ICON[s.severity]} ${s.title}`);
      console.log(`     ${s.detail}`);
      if (s.followup) console.log(`     → ${s.followup}`);
      console.log('');
    }
  }

  if (brief.watchlist.length > 0) {
    console.log('WATCHLIST');
    for (const s of brief.watchlist) {
      console.log(`  ${SEVERITY_ICON[s.severity]} ${s.title}`);
      console.log(`     ${s.detail}`);
      console.log('');
    }
  }

  console.log('CAVEATS');
  for (const c of brief.caveats) console.log(`  • ${c}`);
  console.log('');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
