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
import PixelButton from '@/components/PixelButton';

const BINAIRO_COLOR = '#7C4DFF';

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
          <div
            className="grid border-[4px] border-dark rounded-lg overflow-hidden bg-white"
            style={{ gridTemplateColumns: `repeat(${N}, ${cellSize}px)` }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
                const isRowRelated = selectedCell?.[0] === r && !isSelected;
                const isColRelated = selectedCell?.[1] === c && !isSelected;
                const hasConflict = conflicts.has(`${r},${c}`);

                const bg = isSelected
                  ? 'bg-[#E7DCFF]'
                  : hasConflict
                  ? 'bg-[#FFEBEE]'
                  : isRowRelated || isColRelated
                  ? 'bg-[#F4EEFF]'
                  : 'hover:bg-gray-50';

                const textColor =
                  cell.value === null
                    ? ''
                    : cell.isGiven
                    ? 'text-dark'
                    : cell.value === 1
                    ? 'text-[#7C4DFF]'
                    : 'text-[#F76CA5]';

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`flex items-center justify-center transition-colors duration-100 ${bg}`}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      borderRight: c < N - 1 ? '1px solid #CCCCCC' : 'none',
                      borderBottom: r < N - 1 ? '1px solid #CCCCCC' : 'none',
                    }}
                    aria-label={`row ${r + 1} column ${c + 1}${cell.value === null ? ' empty' : ` value ${cell.value}`}`}
                  >
                    {cell.value !== null && (
                      <span
                        className={`font-pixel font-bold ${textColor}`}
                        style={{ fontSize: cellSize * 0.5 }}
                      >
                        {cell.value}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {showDecimal && (
            <div
              className="flex flex-col ml-2 border-[3px] border-dark rounded-lg overflow-hidden bg-white"
              style={{ width: 52 }}
            >
              {rowDecimals.map((dec, r) => (
                <div
                  key={r}
                  className={`flex items-center justify-center border-b border-[#EEEEEE] ${decimalFontSize} font-pixel ${
                    dec === null ? 'text-[#BBBBBB]' : 'text-dark font-bold'
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
            className="grid mt-2 border-[3px] border-dark rounded-lg overflow-hidden bg-white"
            style={{ gridTemplateColumns: `repeat(${N}, ${cellSize}px)`, width: N * cellSize }}
          >
            {colDecimals.map((dec, c) => (
              <div
                key={c}
                className={`flex items-center justify-center border-r border-[#EEEEEE] ${decimalFontSize} font-pixel ${
                  dec === null ? 'text-[#BBBBBB]' : 'text-dark font-bold'
                }`}
                style={{ height: 28 }}
              >
                {dec === null ? '—' : dec}
              </div>
            ))}
          </div>
        )}

        {generating && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
            <p className="font-pixel text-lg text-dark animate-pulse">Generating...</p>
          </div>
        )}

        {solved && (
          <div className="absolute inset-0 bg-dark/60 flex items-center justify-center rounded-lg z-20">
            <div className="bg-white rounded-card border-[4px] border-dark p-6 text-center shadow-card">
              <h3 className="font-pixel text-3xl font-bold mb-2" style={{ color: BINAIRO_COLOR }}>
                Puzzle Solved!
              </h3>
              <p className="font-pixel text-lg text-dark">Time: {formatTime(timerSeconds)}</p>
              <div className="mt-4">
                <PixelButton variant="primary" size="sm" onClick={() => newPuzzle(difficulty)}>
                  New Puzzle
                </PixelButton>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 min-w-[200px]">
        <div
          className="rounded-xl border-[3px] border-dark p-3 text-center"
          style={{ backgroundColor: BINAIRO_COLOR }}
        >
          <p className="font-body text-[10px] uppercase tracking-wider text-white/70">Time</p>
          <p className="font-pixel text-2xl font-bold text-white">{formatTime(timerSeconds)}</p>
        </div>

        <div>
          <p className="font-pixel text-sm text-dark mb-2">Size</p>
          <div className="flex gap-2">
            {(['Easy', 'Medium', 'Hard'] as DifficultyName[]).map(diff => (
              <button
                key={diff}
                onClick={() => newPuzzle(diff)}
                className={`font-pixel text-xs px-3 py-1.5 rounded-pill border-[2px] border-dark transition-all ${
                  difficulty === diff ? 'text-white' : 'bg-white text-dark hover:bg-gray-100'
                }`}
                style={difficulty === diff ? { backgroundColor: BINAIRO_COLOR } : {}}
              >
                {diff} {DIFFICULTY_SIZE[diff]}×{DIFFICULTY_SIZE[diff]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-pixel text-sm text-dark mb-2">Set Cell</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                if (selectedCell) setCellValue(selectedCell[0], selectedCell[1], 0);
              }}
              className="w-12 h-12 bg-white border-[3px] border-dark rounded-tile font-pixel text-xl flex items-center justify-center shadow-game-tile hover:bg-gray-100 active:shadow-none active:translate-y-1 btn-bounce"
              style={{ color: '#F76CA5' }}
            >
              0
            </button>
            <button
              onClick={() => {
                if (selectedCell) setCellValue(selectedCell[0], selectedCell[1], 1);
              }}
              className="w-12 h-12 bg-white border-[3px] border-dark rounded-tile font-pixel text-xl flex items-center justify-center shadow-game-tile hover:bg-gray-100 active:shadow-none active:translate-y-1 btn-bounce"
              style={{ color: BINAIRO_COLOR }}
            >
              1
            </button>
            <button
              onClick={() => {
                if (selectedCell) setCellValue(selectedCell[0], selectedCell[1], null);
              }}
              className="w-12 h-12 bg-white border-[3px] border-dark rounded-tile font-pixel text-xs text-dark flex items-center justify-center shadow-game-tile hover:bg-gray-100 active:shadow-none active:translate-y-1 btn-bounce"
            >
              Clear
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowDecimal(v => !v)}
          className={`h-10 rounded-pill font-pixel text-sm border-[3px] border-dark transition-all ${
            showDecimal ? 'text-white' : 'bg-white text-dark hover:bg-gray-100'
          }`}
          style={showDecimal ? { backgroundColor: BINAIRO_COLOR } : {}}
        >
          Decimal {showDecimal ? 'ON' : 'OFF'}
        </button>

        <PixelButton variant="primary" size="sm" onClick={() => newPuzzle(difficulty)}>
          New Puzzle
        </PixelButton>
      </div>
    </div>
  );
}
