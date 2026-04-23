import aiBriefs from '../data/ai-briefs.json';

type BriefId = keyof typeof aiBriefs | 'signals';
type BriefEntry = {
  text: string;
  source: 'ai' | 'rules';
  model: string | null;
  generated_at: string;
  topic: string;
};

type Options = {
  id: BriefId;
  fallback?: string;
};

/**
 * Returns a pre-generated AI brief for the given topic. Briefs are built
 * at `pnpm ai-briefs` time and committed to the repo as JSON. This means:
 *
 *  - Zero runtime LLM calls (fast, free to serve)
 *  - No API key required for forkers — the briefs are public text
 *  - Re-run the generator when data changes
 *
 * If the brief id is missing or empty, falls back to the provided string.
 */
export function useAiBrief({ id, fallback }: Options) {
  const entry = (aiBriefs as Record<string, BriefEntry>)[id];
  if (entry && entry.text && entry.text.length > 0) {
    return { text: entry.text, source: entry.source };
  }
  return { text: fallback || '', source: 'rules' as const };
}
