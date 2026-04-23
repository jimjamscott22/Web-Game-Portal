import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';

interface MobileControlsProps {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onRotate?: () => void;
  showRotate?: boolean;
  color?: string;
}

export default function MobileControls({
  onUp,
  onDown,
  onLeft,
  onRight,
  onRotate,
  showRotate = false,
  color = '#8CC298',
}: MobileControlsProps) {
  const btnClass = 'w-14 h-14 rounded-full border-[3px] border-dark flex items-center justify-center text-white shadow-button active:shadow-button-active active:translate-y-1 btn-bounce select-none touch-manipulation';

  return (
    <div className="flex items-center justify-center gap-4 mt-4 md:hidden select-none">
      {showRotate && onRotate && (
        <button
          className={btnClass}
          style={{ backgroundColor: color }}
          onTouchStart={(e) => { e.preventDefault(); onRotate(); }}
        >
          <RotateCw className="w-6 h-6" />
        </button>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div />
        <button
          className={btnClass}
          style={{ backgroundColor: color }}
          onTouchStart={(e) => { e.preventDefault(); onUp?.(); }}
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div />

        <button
          className={btnClass}
          style={{ backgroundColor: color }}
          onTouchStart={(e) => { e.preventDefault(); onLeft?.(); }}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          className={btnClass}
          style={{ backgroundColor: color }}
          onTouchStart={(e) => { e.preventDefault(); onDown?.(); }}
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <button
          className={btnClass}
          style={{ backgroundColor: color }}
          onTouchStart={(e) => { e.preventDefault(); onRight?.(); }}
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
