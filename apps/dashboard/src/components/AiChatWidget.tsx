import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { brief, dashboard, findKpi } from '../lib/data';
import aiBriefs from '../data/ai-briefs.json';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

const suggestions = [
  'Why is revenue down?',
  'What should I act on first?',
  'How is churn trending?',
  'Explain the trial funnel',
];

/**
 * Canned response generator. Matches keywords in the prompt and returns
 * data-grounded answers using KPIs + pre-generated AI briefs. No API key
 * required. For real agent-style Q&A, the MCP server covers that case —
 * this chat exists to demonstrate the UX pattern inside the dashboard.
 */
function respond(prompt: string): string {
  const p = prompt.toLowerCase();
  const mrr = findKpi('mrr');
  const rev = findKpi('revenue');
  const churn = findKpi('churn_rate');
  const trials = findKpi('active_trials');
  const subs = findKpi('active_subscriptions');

  // Prefer AI-brief answers when the user asks about a known topic
  if (/overview|summary|overall|business health|how.*doing/.test(p)) {
    return aiBriefs.overview.text;
  }
  if (/why.*revenue|revenue.*down|revenue.*trend|revenue.*drop|what.*revenue/.test(p)) {
    return aiBriefs.revenue.text;
  }
  if (/mrr|recurring revenue/.test(p)) {
    return aiBriefs.mrr.text;
  }
  if (/churn|retention|cancel/.test(p)) {
    return aiBriefs.churn.text;
  }
  if (/trial|funnel|conversion/.test(p)) {
    return aiBriefs.trials.text;
  }
  if (/subscriber|active.*sub|paid base/.test(p)) {
    return aiBriefs.subscribers.text;
  }
  if (/signal|act.*first|prioritize|what.*fix|what.*do/.test(p)) {
    const top = [...brief.signals, ...brief.contradictions].slice(0, 3);
    return `Top 3 signals to act on:\n${top.map((s, i) => `${i + 1}. ${s.title} — ${s.detail}`).join('\n')}\n\nOpen the Signals page for the full list.`;
  }
  if (/active user|dau|mau/.test(p)) {
    return `Active users: ${(findKpi('active_users')?.value ?? 0).toLocaleString()}. Active subs: ${subs?.value?.toLocaleString() ?? '2,536'}. Active trials: ${trials?.value ?? 67}. ~${Math.round((subs?.value ?? 2536) / (findKpi('active_users')?.value ?? 1) * 100)}% of users are paying.`;
  }
  if (/compare|period|prior|vs/.test(p)) {
    return `vs prior 28d: MRR ${mrr?.delta?.pct?.toFixed(1) ?? '0.0'}%, Revenue ${rev?.delta?.pct?.toFixed(1) ?? '-0.9'}%, Active subs ${subs?.delta?.pct?.toFixed(1) ?? '0.1'}%, Churn ${churn?.delta?.pct?.toFixed(1) ?? 'improving'}%. The story: top of funnel up, retention improving, recurring flat.`;
  }

  // Default: help message
  return `I can answer from the current dashboard data. Try:\n• "Why is revenue down?"\n• "How is churn trending?"\n• "What should I act on first?"\n• "Explain the trial funnel"\n\nFor deeper queries, connect our MCP server to Claude Desktop — see Integrations.`;
}

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'greeting',
      role: 'assistant',
      text: `Hey — I'm your operator assistant. Ask me about ${dashboard.project.name}'s numbers, signals, or what to fix next.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  function send(text: string) {
    if (!text.trim() || sending) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setSending(true);
    // small delay for natural feel
    window.setTimeout(() => {
      const reply = respond(text);
      setMessages((m) => [...m, { id: `a-${Date.now()}`, role: 'assistant', text: reply }]);
      setSending(false);
    }, 450);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      {!open && (
        <button
          className="chat-fab"
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant"
        >
          <MessageCircle size={20} strokeWidth={2} />
          <span className="chat-fab-label">Ask AI</span>
          <span className="chat-fab-pulse" aria-hidden />
        </button>
      )}

      {open && (
        <div className="chat-widget" role="dialog" aria-label="AI assistant">
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">
                <Sparkles size={14} />
              </div>
              <div>
                <div className="chat-title">Operator AI</div>
                <div className="chat-subtitle">
                  <span className="chat-status-dot" /> Grounded in your live data
                </div>
              </div>
            </div>
            <button
              className="chat-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          <div className="chat-messages" ref={scrollRef}>
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg chat-msg-${m.role}`}>
                {m.role === 'assistant' && (
                  <div className="chat-msg-avatar">
                    <Sparkles size={11} />
                  </div>
                )}
                <div className="chat-msg-bubble">
                  {m.text.split('\n').map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            ))}
            {sending && (
              <div className="chat-msg chat-msg-assistant">
                <div className="chat-msg-avatar">
                  <Sparkles size={11} />
                </div>
                <div className="chat-msg-bubble chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="chat-suggestions">
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="chat-suggestion"
                  onClick={() => send(s)}
                  disabled={sending}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form className="chat-input" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your metrics..."
              aria-label="Message"
              disabled={sending}
            />
            <button type="submit" disabled={!input.trim() || sending} aria-label="Send">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
