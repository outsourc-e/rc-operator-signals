import type { OverviewMetric, Signal } from '../../packages/charts-sdk/src/index.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

export async function openRouterNarrative(
  signals: Signal[],
  kpis: OverviewMetric[],
  period: string,
  projectName = 'RevenueCat project',
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is required for AI narration.');
  }

  const prompt = [
    'You are writing an operator-grade weekly brief for a subscription app.',
    'Return exactly 2 concise paragraphs in markdown.',
    `Project: ${projectName}`,
    `Period: ${period}`,
    `KPIs: ${JSON.stringify(kpis)}`,
    `Signals: ${JSON.stringify(signals)}`,
    'Focus on what changed, what matters, and what the operator should check next.',
  ].join('\n');

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/outsourc-e/rc-operator-signals',
      'X-Title': 'RC Operator Signals',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: 'Write crisp investor/operator quality updates. No preamble.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${text}`);
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return json.choices?.[0]?.message?.content?.trim() ?? '';
}
