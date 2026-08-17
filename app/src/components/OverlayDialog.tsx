import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OverlayDialogProps {
  icon: string;
  title: string;
  subtitle?: string;
  score?: number | string;
  best?: number | string;
  className?: string;
  children: ReactNode;
}

export default function OverlayDialog({
  icon,
  title,
  subtitle,
  score,
  best,
  className,
  children,
}: OverlayDialogProps) {
  const titleId = useId();
  const showScores = score !== undefined || best !== undefined;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center rounded-[inherit] bg-scrim p-4 backdrop-blur-[2px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'w-full max-w-[300px] rounded-card border border-line bg-surface px-8 py-[30px] text-center shadow-card',
          className,
        )}
      >
        <div
          className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft font-pixel text-[22px] font-bold text-accent-deep"
          aria-hidden="true"
        >
          {icon}
        </div>
        <h2 id={titleId} className="font-display text-[32px] leading-none text-ink">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1.5 font-body text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        ) : null}

        {showScores ? (
          <div className="my-5 flex justify-center gap-[22px]">
            {score !== undefined ? (
              <div>
                <div className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Score
                </div>
                <div className="font-pixel text-[26px] font-bold leading-tight text-ink">{score}</div>
              </div>
            ) : null}
            {best !== undefined ? (
              <div>
                <div className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Best
                </div>
                <div className="font-pixel text-[26px] font-bold leading-tight text-accent">{best}</div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className={cn('flex flex-col gap-2', showScores ? '' : 'mt-5')}>
          {children}
        </div>
      </section>
    </div>
  );
}
