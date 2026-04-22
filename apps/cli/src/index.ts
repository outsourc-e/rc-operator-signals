#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RevenueCatCharts, type ChartResponse, type OverviewMetric } from '@outsourc-e/revenuecat-charts';
import { narrate } from '../../../core/ai/index.js';
import { buildBrief, type ChartCache, type OperatorBrief } from '../../../core/signals/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = join(__dirname, '../../../core/fixtures/dark-noise');
const REQUIRED_CHARTS = ['revenue', 'mrr', 'actives', 'actives_movement', 'trials_movement', 'churn'] as const;

type PeriodFlag = '7d' | '28d' | '90d';

interface Args {
  demo: boolean;
  key?: string;
  period: PeriodFlag;
  ai: boolean;
  out?: string;
  json: boolean;
  projectId?: string;
}

interface BriefOutput {
  brief: OperatorBrief;
  narrative: string;
  markdown: string;
}

function parseArgs(argv: string[]): Args {
  const out: Args = { demo: false, period: '28d', ai: false, json: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--demo') out.demo = true;
    else if (arg === '--key' && argv[i + 1]) out.key = argv[++i];
    else if (arg === '--period' && argv[i + 1]) out.period = argv[++i] as PeriodFlag;
    else if (arg === '--ai') out.ai = true;
    else if (arg === '--out' && argv[i + 1]) out.out = argv[++i];
    else if (arg === '--json') out.json = true;
    else if (arg === '--project' && argv[i + 1]) out.projectId = argv[++i];
  }
  return out;
}

function formatMetric(metric: OverviewMetric): string {
  if (metric.unit === '$') return `$${metric.value.toLocaleString()}`;
  if (metric.unit === '%') return `${metric.value.toFixed(1)}%`;
  return metric.value.toLocaleString();
}

function dateRangeFromPeriod(period: PeriodFlag): { start: string; end: string } {
  const end = new Date();
  const days = Number(period.replace('d', ''));
  const start = new Date(end.getTime() - days * 86_400_000);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

async function loadFixture<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(join(FIXTURE_DIR, file), 'utf8')) as T;
}

async function loadDemoCache(): Promise<{ projectName: string; cache: ChartCache }> {
  const overview = await loadFixture<{ metrics: OverviewMetric[] }>('overview.json');
  const charts: Record<string, ChartResponse> = {};
  for (const slug of REQUIRED_CHARTS) {
    charts[slug] = await loadFixture<ChartResponse>(`${slug}.json`);
  }
  return {
    projectName: 'Dark Noise',
    cache: { overview: overview.metrics, charts },
  };
}

async function loadLiveCache(args: Args): Promise<{ projectName: string; cache: ChartCache }> {
  const apiKey = args.key ?? process.env.RC_API_KEY;
  if (!apiKey) {
    throw new Error('Missing API key. Use --demo, --key, or set RC_API_KEY.');
  }

  const client = new RevenueCatCharts({ apiKey, projectId: args.projectId });
  const projects = await client.listProjects();
  const selectedProject = args.projectId
    ? projects.items.find((project) => project.id === args.projectId)
    : projects.items[0];
  const projectId = selectedProject?.id ?? args.projectId;
  if (!projectId) {
    throw new Error('No RevenueCat project available for this API key.');
  }

  const projectName = selectedProject?.name ?? 'RevenueCat Project';
  const overview = await client.overview();

  const { start, end } = dateRangeFromPeriod(args.period);
  const charts: Record<string, ChartResponse> = {};
  for (const slug of REQUIRED_CHARTS) {
    charts[slug] = await client.chart(slug, { projectId, start_date: start, end_date: end, resolution: 'day' });
  }

  return {
    projectName,
    cache: { overview: overview.metrics, charts },
  };
}

function renderMarkdown(brief: OperatorBrief, narrative: string): string {
  const lines: string[] = [];
  const uniqueSignals = [...new Map([...brief.signals, ...brief.watchlist].map((signal) => [signal.id, signal])).values()];
  lines.push(`# RevenueCat Operator Brief — ${brief.project_name}`);
  lines.push('');
  lines.push(`> Period: ${brief.period.start} → ${brief.period.end}`);
  lines.push(`> Generated: ${brief.generated_at}`);
  lines.push('');
  lines.push(narrative.trim());
  lines.push('');
  lines.push('## KPI snapshot');
  for (const metric of brief.snapshot) {
    lines.push(`- **${metric.name}**: ${formatMetric(metric)}`);
  }
  lines.push('');
  lines.push('## Fired signals');
  for (const signal of uniqueSignals) {
    lines.push(`- **${signal.title}**: ${signal.detail}`);
  }
  lines.push('');
  lines.push('## Caveats');
  for (const caveat of brief.caveats) {
    lines.push(`- ${caveat}`);
  }
  return lines.join('\n');
}

async function buildOutput(args: Args): Promise<BriefOutput> {
  const source = args.demo ? await loadDemoCache() : await loadLiveCache(args);
  if (args.ai && !process.env.OPENROUTER_API_KEY) {
    throw new Error('--ai requires OPENROUTER_API_KEY.');
  }

  const periodRange = dateRangeFromPeriod(args.period);
  const brief = buildBrief(source.cache, {
    project_name: source.projectName,
    period: periodRange,
  });

  const narrative = await narrate(brief.signals, brief.snapshot, args.period, {
    provider: args.ai ? 'openrouter' : 'deterministic',
    projectName: brief.project_name,
  });

  return {
    brief,
    narrative,
    markdown: renderMarkdown(brief, narrative),
  };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv);
  const output = await buildOutput(args);
  const rendered = args.json ? JSON.stringify(output, null, 2) : output.markdown;

  if (args.out) {
    await writeFile(args.out, rendered, 'utf8');
  }

  process.stdout.write(`${rendered}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
