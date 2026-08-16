import type { ReactNode } from 'react';

export default function GamePageLayout({ children, width = '800px' }: { children: ReactNode; width?: string }) {
  return (
    <main className="min-h-screen pt-[96px] pb-14 px-4 bg-ground">
      <div className="mx-auto" style={{ maxWidth: width }}>{children}</div>
    </main>
  );
}
