import { useCallback, useState } from 'react';
import { generatePuzzle, isSolved, LIGHTS_CONFIG, toggle, type Difficulty, type LightGrid } from './gameLogic';
import { useKeyboard } from '@/hooks/useKeyboard';
import MobileControls from '@/components/MobileControls';

export default function BoardLightsOut({ difficulty, onMove, onWin, resetKey }: { difficulty: Difficulty; onMove: () => void; onWin: () => void; resetKey: number }) {
  const [grid, setGrid] = useState<LightGrid>(() => generatePuzzle(difficulty)); const [cursor, setCursor] = useState(0); const size = LIGHTS_CONFIG[difficulty].size;
  void resetKey;
  const choose = useCallback((index: number) => { setGrid(current => { const next = toggle(current, Math.floor(index / size), index % size); onMove(); if (isSolved(next)) window.setTimeout(onWin, 0); return next; }); }, [onMove, onWin, size]);
  const move = useCallback((delta: number) => setCursor(c => Math.max(0, Math.min(size * size - 1, c + delta))), [size]);
  useKeyboard({ arrowup: () => move(-size), arrowdown: () => move(size), arrowleft: () => move(-1), arrowright: () => move(1), enter: () => choose(cursor), ' ': () => choose(cursor) }, [move, choose, cursor, size]);
  // Lit cells are --t-accent with the accent-tinted glow from `.is-lit`;
  // dark cells are --t-cell holes on the board.
  return <><div className="grid gap-2 p-3.5 bg-board rounded-card mx-auto" style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, maxWidth: 520 }}>{grid.flatMap((row, r) => row.map((lit, c) => { const i = r * size + c; return <button key={i} onClick={() => { setCursor(i); choose(i); }} className={`lights-cell aspect-square min-h-11 rounded-tile ${lit ? 'is-lit bg-accent' : 'bg-cell'} ${cursor === i ? 'ring-2 ring-accent-deep ring-offset-2 ring-offset-board' : ''}`} aria-label={`Light ${r + 1}, ${c + 1}, ${lit ? 'on' : 'off'}`} aria-pressed={lit} />; }))}</div><MobileControls color="var(--t-s8)" onUp={() => move(-size)} onDown={() => move(size)} onLeft={() => move(-1)} onRight={() => move(1)} /></>;
}
