import type { ReactNode } from 'react';

export default function GameHeader({ title, color, children }: { title: string; color: string; children?: ReactNode }) {
  return <header className="flex flex-wrap items-center justify-between gap-3 mb-5"><h1 className="font-pixel text-4xl sm:text-5xl font-bold" style={{ color, textShadow: '3px 3px 0 rgba(0,0,0,.1)' }}>{title}</h1><div className="flex gap-2">{children}</div></header>;
}
