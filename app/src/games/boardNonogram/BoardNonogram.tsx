import { useCallback, useState } from 'react';
import { generatePuzzle, isSolved, toggleCell, createPlayerGrid, NONOGRAM_CONFIG, CellState, type Difficulty, type PlayerGrid } from './gameLogic';
import { useKeyboard } from '@/hooks/useKeyboard';
import MobileControls from '@/components/MobileControls';

interface BoardNonogramProps {
  difficulty: Difficulty;
  onMove: () => void;
  onWin: () => void;
  resetKey: number;
}

export default function BoardNonogram({ difficulty, onMove, onWin, resetKey }: BoardNonogramProps) {
  const size = NONOGRAM_CONFIG[difficulty].size;
  void resetKey;

  
  const [puzzle] = useState(() => generatePuzzle(difficulty));
  const { target, clues } = puzzle;
  const [playerGrid, setPlayerGrid] = useState<PlayerGrid>(() => createPlayerGrid(size));
  const [cursor, setCursor] = useState({ r: 0, c: 0 });

  const handleAction = useCallback((type: 'fill' | 'mark', r?: number, c?: number) => {
    if (target.length === 0) return;
    const row = r ?? cursor.r;
    const col = c ?? cursor.c;
    
    setPlayerGrid(current => {
      const next = toggleCell(current, row, col, type);
      onMove();
      if (isSolved(next, target)) {
        window.setTimeout(onWin, 0);
      }
      return next;
    });
  }, [cursor, onMove, onWin, target]);

  const moveCursor = useCallback((dr: number, dc: number) => {
    setCursor(curr => ({
      r: Math.max(0, Math.min(size - 1, curr.r + dr)),
      c: Math.max(0, Math.min(size - 1, curr.c + dc))
    }));
  }, [size]);

  useKeyboard({
    arrowup: () => moveCursor(-1, 0),
    arrowdown: () => moveCursor(1, 0),
    arrowleft: () => moveCursor(0, -1),
    arrowright: () => moveCursor(0, 1),
    enter: () => handleAction('fill'),
    ' ': () => handleAction('fill'),
    x: () => handleAction('mark'),
  }, [moveCursor, handleAction]);

  if (target.length === 0) return null;

  return (
    <>
      <div className="flex flex-col items-center justify-center font-pixel text-sm">
        <div className="flex flex-col bg-board p-3 rounded-card">
          {/* Top Clues Row */}
          <div className="flex">
            {/* Empty top-left corner */}
            <div className="w-16 md:w-24 shrink-0"></div>
            {/* Top Clues */}
            <div className="flex gap-[2px]">
              {clues.cols.map((colClue, c) => (
                <div key={c} className="flex flex-col justify-end items-center text-muted-foreground w-6 md:w-8 h-24 pb-1">
                  {colClue.map((num, i) => <div key={i}>{num}</div>)}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex">
            {/* Side Clues */}
            <div className="flex flex-col gap-[2px] w-16 md:w-24 pr-2 shrink-0">
              {clues.rows.map((rowClue, r) => (
                <div key={r} className="flex justify-end items-center text-muted-foreground h-6 md:h-8 gap-1.5">
                  {rowClue.map((num, i) => <div key={i}>{num}</div>)}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div 
              className="grid gap-[2px] bg-line border-2 border-line"
              style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
            >
              {playerGrid.flatMap((row, r) => row.map((cellState, c) => {
                const isCursor = cursor.r === r && cursor.c === c;
                return (
                  <button
                    key={`${r}-${c}`}
                    className={`
                      w-6 h-6 md:w-8 md:h-8 flex items-center justify-center transition-colors
                      ${cellState === CellState.Filled ? 'bg-accent' : 'bg-cell'}
                      ${isCursor ? 'ring-2 ring-accent-deep ring-inset z-10' : ''}
                    `}
                    onClick={() => { setCursor({r, c}); handleAction('fill', r, c); }}
                    onContextMenu={(e) => { e.preventDefault(); setCursor({r, c}); handleAction('mark', r, c); }}
                  >
                    {cellState === CellState.Marked && (
                      <div className="text-muted-foreground font-bold">X</div>
                    )}
                  </button>
                );
              }))}
            </div>
          </div>
        </div>
      </div>
      <MobileControls color="var(--t-s12)" onUp={() => moveCursor(-1, 0)} onDown={() => moveCursor(1, 0)} onLeft={() => moveCursor(0, -1)} onRight={() => moveCursor(0, 1)} />
      <div className="text-center mt-4 text-sm text-muted-foreground font-body">
        Left click / Space to Fill. Right click / X to Mark.
      </div>
    </>
  );
}
