type Props = {
  title?: string;
  text: string;
  source?: 'ai' | 'rules';
};

export function AiSummary({ title = 'AI analysis', text, source = 'rules' }: Props) {
  return (
    <div className="ai-summary">
      <div className="ai-summary-header">
        <span className="ai-chip">{source === 'ai' ? '✨ AI' : '⚙ Rules'}</span>
        <span className="ai-summary-title">{title}</span>
      </div>
      <p className="ai-summary-text">{text}</p>
    </div>
  );
}
