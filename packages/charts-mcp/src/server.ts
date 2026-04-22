import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { detectSignals, explainOneSignal, getChart, getOverview, weeklyBrief } from './tools.js';

export async function startServer(): Promise<void> {
  const server = new Server(
    { name: 'revenuecat-mcp', version: '0.2.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'rc_get_chart',
        description: 'Fetch a RevenueCat chart for a given slug, period, and resolution.',
        inputSchema: {
          type: 'object',
          properties: {
            slug: { type: 'string' },
            period: { type: 'string', enum: ['7d', '28d', '90d'], default: '28d' },
            resolution: { type: 'string', enum: ['day', 'week', 'month'], default: 'day' },
          },
          required: ['slug'],
        },
      },
      {
        name: 'rc_get_overview',
        description: 'Fetch RevenueCat overview metrics.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'rc_detect_signals',
        description: 'Run the deterministic operator signal engine over RevenueCat data.',
        inputSchema: {
          type: 'object',
          properties: {
            period: { type: 'string', enum: ['7d', '28d', '90d'], default: '28d' },
          },
        },
      },
      {
        name: 'rc_weekly_brief',
        description: 'Generate a weekly markdown brief. Uses deterministic narrative unless OPENROUTER_API_KEY is set.',
        inputSchema: {
          type: 'object',
          properties: {
            period: { type: 'string', enum: ['7d', '28d', '90d'], default: '28d' },
          },
        },
      },
      {
        name: 'rc_explain_signal',
        description: 'Explain a specific signal by id for the selected period.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            period: { type: 'string', enum: ['7d', '28d', '90d'], default: '28d' },
          },
          required: ['id'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      switch (name) {
        case 'rc_get_chart':
          return { content: [{ type: 'text', text: await getChart(String(args?.slug), (args?.period as '7d' | '28d' | '90d' | undefined) ?? '28d', (args?.resolution as 'day' | 'week' | 'month' | undefined) ?? 'day') }] };
        case 'rc_get_overview':
          return { content: [{ type: 'text', text: await getOverview() }] };
        case 'rc_detect_signals':
          return { content: [{ type: 'text', text: await detectSignals((args?.period as '7d' | '28d' | '90d' | undefined) ?? '28d') }] };
        case 'rc_weekly_brief':
          return { content: [{ type: 'text', text: await weeklyBrief((args?.period as '7d' | '28d' | '90d' | undefined) ?? '28d') }] };
        case 'rc_explain_signal':
          return { content: [{ type: 'text', text: await explainOneSignal(String(args?.id), (args?.period as '7d' | '28d' | '90d' | undefined) ?? '28d') }] };
        default:
          return { isError: true, content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
      }
    } catch (error) {
      return {
        isError: true,
        content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }],
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
