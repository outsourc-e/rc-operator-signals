import { Sparkles } from 'lucide-react';

type Props = {
  title?: string;
  text: string;
  source?: 'ai' | 'rules'; // kept for back-compat; no longer visually distinguished
};

export function AiSummary({ title = 'AI brief', text }: Props) {
  return (
    <div className="ai-summary">
      <div className="ai-summary-header">
        <span className="ai-chip">
          <Sparkles size={11} strokeWidth={2.5} /> AI
        </span>
        <span className="ai-summary-title">{title}</span>
      </div>
      <p className="ai-summary-text">{text}</p>
    </div>
  );
}
