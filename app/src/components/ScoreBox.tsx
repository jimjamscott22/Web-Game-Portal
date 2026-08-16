import { cn } from '@/lib/utils';

interface ScoreBoxProps {
  label: string;
  value: number | string;
  /** `accent` is the live score, `surface` the personal best. */
  tone?: 'accent' | 'surface';
  className?: string;
}

export default function ScoreBox({ label, value, tone = 'accent', className }: ScoreBoxProps) {
  const accent = tone === 'accent';

  return (
    <div
      className={cn(
        'rounded-tile px-[18px] py-[9px] min-w-[86px] text-center',
        accent
          ? 'bg-accent shadow-button'
          : 'bg-surface border border-line',
        className
      )}
    >
      <div
        className={cn(
          'font-body text-[10px] font-semibold uppercase tracking-[0.12em]',
          accent ? 'text-accent-foreground opacity-85' : 'text-muted-foreground'
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          'font-pixel text-2xl font-bold leading-[1.2]',
          accent ? 'text-accent-foreground' : 'text-ink'
        )}
      >
        {value}
      </div>
    </div>
  );
}
