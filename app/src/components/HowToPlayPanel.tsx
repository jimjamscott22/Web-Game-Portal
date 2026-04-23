import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface HowToPlayPanelProps {
  title?: string;
  instructions: string;
}

export default function HowToPlayPanel({
  title = 'How to Play',
  instructions,
}: HowToPlayPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-6 border-[3px] border-dark rounded-tile overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-pixel text-lg font-semibold text-dark">{title}</span>
        <ChevronDown
          className={`w-5 h-5 text-dark transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? '200px' : '0' }}
      >
        <div className="px-4 py-3 bg-gray-50">
          <p className="font-body text-sm text-[#555555] leading-relaxed">{instructions}</p>
        </div>
      </div>
    </div>
  );
}
