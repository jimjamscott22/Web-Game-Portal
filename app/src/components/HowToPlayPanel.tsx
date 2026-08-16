import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface HowToPlayPanelProps {
  title?: string;
  instructions: string;
}

export default function HowToPlayPanel({
  title = 'How to play',
  instructions,
}: HowToPlayPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 rounded-card border border-line bg-surface overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-[22px] py-[18px] hover:bg-panel transition-colors"
      >
        <span className="font-display text-[19px] text-ink">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? '260px' : '0' }}>
        <div className="px-[22px] pb-5 pt-1">
          <p className="font-body text-sm text-muted-foreground leading-relaxed">{instructions}</p>
        </div>
      </div>
    </div>
  );
}
