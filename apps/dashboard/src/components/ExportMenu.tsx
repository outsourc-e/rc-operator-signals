import { useState, useRef, useEffect } from 'react';
import { Download, Check, FileText, MessageSquare, FileDown, ChevronDown } from 'lucide-react';

type ExportMenuProps = {
  onCopySlack: () => Promise<void> | void;
  onCopyMarkdown: () => Promise<void> | void;
  onDownload: () => void;
};

export function ExportMenu({ onCopySlack, onCopyMarkdown, onDownload }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handle = async (action: () => void | Promise<void>, label: string) => {
    await action();
    setFlash(label);
    setOpen(false);
    window.setTimeout(() => setFlash(null), 1400);
  };

  return (
    <div className="menu-wrap" ref={ref}>
      <button className="btn btn-primary" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {flash ? (
          <><Check size={14} /> {flash}</>
        ) : (
          <><Download size={14} /> Export <ChevronDown size={12} /></>
        )}
      </button>
      {open && (
        <div className="menu-panel export-panel">
          <button className="menu-item" onClick={() => handle(onCopySlack, 'Slack copied')}>
            <MessageSquare size={14} /> Copy as Slack message
          </button>
          <button className="menu-item" onClick={() => handle(onCopyMarkdown, 'Markdown copied')}>
            <FileText size={14} /> Copy as Markdown
          </button>
          <button className="menu-item" onClick={() => handle(onDownload, 'Downloaded')}>
            <FileDown size={14} /> Download brief.md
          </button>
        </div>
      )}
    </div>
  );
}
