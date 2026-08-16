import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  generatePuzzle,
  isComplete,
  getConflicts,
  rowDecimal,
  colDecimal,
  DIFFICULTY_SIZE,
  type BinairoCell,
  type Bit,
  type DifficultyName,
} from './gameLogic';
import { useKeyboard } from '@/hooks/useKeyboard';
import ConfettiEffect from '@/components/ConfettiEffect';
import WinOverlay from '@/components/WinOverlay';
import ScoreBox from '@/components/ScoreBox';
import PixelButton from '@/components/PixelButton';


interface BoardBinairoProps {
  onTimerTick: () => void;
  timerSeconds: number;
}

export default function BoardBinairo({ onTimerTick, timerSeconds }: BoardBinairoProps) {
  const [difficulty, setDifficulty] = useState<DifficultyName>('Easy');
  const [board, setBoard] = useState<BinairoCell[][]>(() => generatePuzzle('Easy'));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [solved, setSolved] = useState(false);
  const [showDecimal, setShowDecimal] = useState(true);
  const [generating, setGenerating] = useState(false);

  const N = board.length;

  useEffect(() => {
    const interval = setInterval(() => {
      if (!solved) onTimerTick();
    }, 1000);
    return () => clearInterval(interval);
  }, [solved, onTimerTick]);

  const conflicts = useMemo(() => getConflicts(board), [board]);

  const newPuzzle = useCallback((diff: DifficultyName) => {
    setGenerating(true);
    setDifficulty(diff);
    setSelectedCell(null);
    setSolved(false);
    setTimeout(() => {
      setBoard(generatePuzzle(diff));
      setGenerating(false);
    }, 20);
  }, []);

  const setCellValue = useCallback((row: number, col: number, value: Bit | null) => {
    setBoard(prev => {
      if (prev[row][col].isGiven) return prev;
      const next = prev.map(r => r.map(c => ({ ...c })));
      next[row][col].value = value;
      if (isComplete(next)) setSolved(true);
      return next;
    });
  }, []);

  const cycleCell = useCallback((row: number, col: number) => {
    setBoard(prev => {
      if (prev[row][col].isGiven) return prev;
      const current = prev[row][col].value;
      const nextValue: Bit | null = current === null ? 0 : current === 0 ? 1 : null;
      const next = prev.map(r => r.map(c => ({ ...c })));
      next[row][col].value = nextValue;
      if (isComplete(next)) setSolved(true);
      return next;
    });
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    setSelectedCell([row, col]);
    cycleCell(row, col);
  }, [cycleCell]);

  useKeyboard({
    '0': () => {
      if (selectedCell) setCellValue(selectedCell[0], selectedCell[1], 0);
    },
    '1': () => {
      if (selectedCell) setCellValue(selectedCell[0], selectedCell[1], 1);
    },
    backspace: () => {
      if (selectedCell) setCellValue(selectedCell[0], selectedCell[1], null);
    },
    delete: () => {
      if (selectedCell) setCellValue(selectedCell[0], selectedCell[1], null);
    },
    arrowup: () => {
      setSelectedCell(prev => prev ? [Math.max(0, prev[0] - 1), prev[1]] : [0, 0]);
    },
    arrowdown: () => {
      setSelectedCell(prev => prev ? [Math.min(N - 1, prev[0] + 1), prev[1]] : [0, 0]);
    },
    arrowleft: () => {
      setSelectedCell(prev => prev ? [prev[0], Math.max(0, prev[1] - 1)] : [0, 0]);
    },
    arrowright: () => {
      setSelectedCell(prev => prev ? [prev[0], Math.min(N - 1, prev[1] + 1)] : [0, 0]);
    },
  }, [selectedCell, setCellValue, N]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const cellSize = N <= 6 ? 52 : N <= 8 ? 44 : 38;
  const decimalFontSize = N <= 6 ? 'text-sm' : N <= 8 ? 'text-xs' : 'text-[10px]';

  const rowDecimals = useMemo(
    () => Array.from({ length: N }, (_, r) => rowDecimal(board, r)),
    [board, N]
  );
  const colDecimals = useMemo(
    () => Array.from({ length: N }, (_, c) => colDecimal(board, c)),
    [board, N]
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      <ConfettiEffect active={solved} />

      <div className="relative">
        <div className="flex">
          {/* 0 and 1 are filled discs — surface and accent — so the board
              reads as pattern. Locked clues carry a --t-drop ring. */}
          <div
            className="grid gap-px rounded-card bg-board p-2.5"
            style={{ gridTemplateColumns: `repeat(${N}, ${cellSize}px)` }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                const isRowRelated = selectedCell?.[0] === r && !isSelected;
                const isColRelated = selectedCell?.[1] === c && !isSelected;
                const hasConflict = conflicts.has(`${r},${c}`);

                const bg = isSelected
                  ? 'bg-accent-soft ring-2 ring-accent z-10'
                  : hasConflict
                  ? 'bg-err'
                  : isRowRelated || isColRelated
                  ? 'bg-panel'
                  : 'bg-cell hover:bg-panel';

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`flex items-center justify-center rounded-sm transition-colors duration-100 ${bg}`}
                    style={{ width: cellSize, height: cellSize }}
                    aria-label={`row ${r + 1} column ${c + 1}${cell.value === null ? ' empty' : ` value ${cell.value}`}`}
                  >
                    {cell.value !== null && (
                      <span
                        className={`block rounded-full ${cell.value === 1 ? 'bg-accent' : 'bg-surface'} ${
                          cell.isGiven ? 'ring-2 ring-drop' : ''
                        }`}
                        style={{ width: cellSize * 0.62, height: cellSize * 0.62 }}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {showDecimal && (
            <div
              className="flex flex-col ml-2 rounded-card border border-line bg-surface overflow-hidden"
              style={{ width: 52 }}
            >
              {rowDecimals.map((dec, r) => (
                <div
                  key={r}
                  className={`flex items-center justify-center border-b border-line ${decimalFontSize} font-pixel ${
                    dec === null ? 'text-muted-foreground' : 'text-ink font-bold'
                  }`}
                  style={{ height: cellSize }}
                >
                  {dec === null ? '—' : dec}
                </div>
              ))}
            </div>
          )}
        </div>

        {showDecimal && (
          <div
            className="grid mt-2 rounded-card border border-line bg-surface overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${N}, ${cellSize}px)`, width: N * cellSize }}
          >
            {colDecimals.map((dec, c) => (
              <div
                key={c}
                className={`flex items-center justify-center border-r border-line ${decimalFontSize} font-pixel ${
                  dec === null ? 'text-muted-foreground' : 'text-ink font-bold'
                }`}
                style={{ height: 28 }}
              >
                {dec === null ? '—' : dec}
              </div>
            ))}
          </div>
        )}

        {generating && (
          <div className="absolute inset-0 bg-scrim flex items-center justify-center rounded-card z-10">
            <p className="font-display text-lg text-ink animate-pulse rounded-pill bg-surface px-5 py-2">Generating…</p>
          </div>
        )}

        {solved && (
          <WinOverlay
            title="Puzzle solved"
            subtitle={`Time ${formatTime(timerSeconds)}`}
            onNewGame={() => newPuzzle(difficulty)}
          />
        )}
      </div>

      <div className="flex flex-col gap-4 min-w-[200px]">
        <ScoreBox label="Time" value={formatTime(timerSeconds)} className="w-full" />

        <div>
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">Size</p>
          <div className="flex flex-wrap gap-2">
            {(['Easy', 'Medium', 'Hard'] as DifficultyName[]).map(diff => (
              <button
                key={diff}
                onClick={() => newPuzzle(diff)}
                className={`font-body text-[13px] px-3.5 py-2 rounded-pill transition-colors ${
                  difficulty === diff
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'border border-line text-muted-foreground hover:bg-panel'
                }`}
              >
                {diff} {DIFFICULTY_SIZE[diff]}×{DIFFICULTY_SIZE[diff]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">Set cell</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                if (selectedCell) setCellValue(selectedCell[0], selectedCell[1], 0);
              }}
              aria-label="Set selected cell to 0"
              className="w-12 h-12 bg-surface border border-line rounded-tile flex items-center justify-center shadow-game-tile hover:bg-panel active:shadow-none active:translate-y-1 btn-bounce"
            >
              <span className="block w-6 h-6 rounded-full bg-surface ring-1 ring-line" />
            </button>
            <button
              onClick={() => {
                if (selectedCell) setCellValue(selectedCell[0], selectedCell[1], 1);
              }}
              aria-label="Set selected cell to 1"
              className="w-12 h-12 bg-surface border border-line rounded-tile flex items-center justify-center shadow-game-tile hover:bg-panel active:shadow-none active:translate-y-1 btn-bounce"
            >
              <span className="block w-6 h-6 rounded-full bg-accent" />
            </button>
            <button
              onClick={() => {
                if (selectedCell) setCellValue(selectedCell[0], selectedCell[1], null);
              }}
              className="w-12 h-12 bg-surface border border-line rounded-tile font-body text-xs text-muted-foreground flex items-center justify-center shadow-game-tile hover:bg-panel active:shadow-none active:translate-y-1 btn-bounce"
            >
              Clear
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowDecimal(v => !v)}
          aria-pressed={showDecimal}
          className={`btn h-10 text-sm ${showDecimal ? 'btn-primary' : 'btn-secondary'}`}
        >
          Decimal {showDecimal ? 'on' : 'off'}
        </button>

        <PixelButton variant="primary" size="sm" onClick={() => newPuzzle(difficulty)}>
          New puzzle
        </PixelButton>
      </div>
    </div>
  );
}
