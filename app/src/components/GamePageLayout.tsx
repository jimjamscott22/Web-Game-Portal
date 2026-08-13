import type { ReactNode } from 'react';

export default function GamePageLayout({ children, width = '800px' }: { children: ReactNode; width?: string }) {
  return <main className="min-h-screen pt-[72px] pb-12 px-4 bg-[#F5F5F5]"><div className="mx-auto" style={{ maxWidth: width }}>{children}</div></main>;
}
