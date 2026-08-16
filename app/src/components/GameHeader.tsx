import type { ReactNode } from 'react';

export default function GameHeader({
  title,
  kicker,
  children,
}: {
  title: string;
  /** Small uppercase category line above the title, e.g. "Sliding puzzle". */
  kicker?: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        {kicker && (
          <div className="mb-2 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {kicker}
          </div>
        )}
        <h1 className="font-display text-4xl sm:text-[46px] leading-none text-ink">{title}</h1>
      </div>
      <div className="flex gap-2.5">{children}</div>
    </header>
  );
}
