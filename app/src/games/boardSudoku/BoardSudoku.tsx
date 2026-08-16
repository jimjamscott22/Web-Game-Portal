import { useState, useCallback, useEffect } from 'react';
import {
  generatePuzzle,
  isComplete,
  getConflicts,
  type SudokuCell,
  type DifficultyName,
} from './gameLogic';
import { useKeyboard } from '@/hooks/useKeyboard';
import ConfettiEffect from '@/components/ConfettiEffect';
import WinOverlay from '@/components/WinOverlay';
import ScoreBox from '@/components/ScoreBox';
import PixelButton from '@/components/PixelButton';

interface BoardSudokuProps {
  onTimerTick: () => void;
  timerSeconds: number;
}

export default function BoardSudoku({ onTimerTick, timerSeconds }: BoardSudokuProps) {
  const [difficulty, setDifficulty] = useState<DifficultyName>('Easy');
  const [board, setBoard] = useState<SudokuCell[][]>(() => generatePuzzle('Easy'));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [solved, setSolved] = useState(false);
  const [conflicts, setConflicts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      if (!solved) onTimerTick();
    }, 1000);
    return () => clearInterval(interval);
  }, [solved, onTimerTick]);

  useEffect(() => {
    setConflicts(getConflicts(board));
  }, [board]);

  const newPuzzle = useCallback((diff: DifficultyName) => {
    setDifficulty(diff);
    setBoard(generatePuzzle(diff));
    setSelectedCell(null);
    setSolved(false);
    setNotesMode(false);
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (board[row][col].isGiven) {
      setSelectedCell([row, col]);
      return;
    }
    setSelectedCell([row, col]);
  }, [board]);

  const handleNumberInput = useCallback((num: number | null) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    if (board[row][col].isGiven) return;

    setBoard(prev => {
      const newBoard = prev.map(r => r.map(c => ({ ...c, notes: new Set(c.notes) })));
      if (notesMode && num !== null) {
        if (newBoard[row][col].notes.has(num)) {
          newBoard[row][col].notes.delete(num);
        } else {
          newBoard[row][col].notes.add(num);
        }
        newBoard[row][col].value = null;
      } else {
        newBoard[row][col].value = num;
        newBoard[row][col].notes.clear();
      }
      return newBoard;
    });

    setTimeout(() => {
      setBoard(current => {
        if (isComplete(current)) {
          setSolved(true);
        }
        return current;
      });
    }, 50);
  }, [selectedCell, board, notesMode]);

  useKeyboard({
    '1': () => handleNumberInput(1),
    '2': () => handleNumberInput(2),
    '3': () => handleNumberInput(3),
    '4': () => handleNumberInput(4),
    '5': () => handleNumberInput(5),
    '6': () => handleNumberInput(6),
    '7': () => handleNumberInput(7),
    '8': () => handleNumberInput(8),
    '9': () => handleNumberInput(9),
    backspace: () => handleNumberInput(null),
    delete: () => handleNumberInput(null),
    arrowup: () => {
      setSelectedCell(prev => prev ? [Math.max(0, prev[0] - 1), prev[1]] : [0, 0]);
    },
    arrowdown: () => {
      setSelectedCell(prev => prev ? [Math.min(8, prev[0] + 1), prev[1]] : [0, 0]);
    },
    arrowleft: () => {
      setSelectedCell(prev => prev ? [prev[0], Math.max(0, prev[1] - 1)] : [0, 0]);
    },
    arrowright: () => {
      setSelectedCell(prev => prev ? [prev[0], Math.min(8, prev[1] + 1)] : [0, 0]);
    },
  }, [handleNumberInput]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isRelatedCell = (r: number, c: number): boolean => {
    if (!selectedCell) return false;
    const [sr, sc] = selectedCell;
    if (r === sr && c === sc) return false;
    if (r === sr || c === sc) return true;
    if (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3)) return true;
    return false;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      <ConfettiEffect active={solved} />

      <div className="relative">
        {/* Cells sit on --t-board; 3×3 boxes are separated by 2px board gaps
            rather than dark rules. */}
        <div
          className="grid gap-px rounded-card bg-board p-2.5"
          style={{ gridTemplateColumns: 'repeat(9, auto)' }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;
              const isRelated = isRelatedCell(r, c);
              const hasConflict = conflicts.has(`${r},${c}`);
              const isThickRight = (c + 1) % 3 === 0 && c < 8;
              const isThickBottom = (r + 1) % 3 === 0 && r < 8;

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-[42px] h-[42px] rounded-sm flex items-center justify-center relative transition-colors duration-100 ${
                    isSelected
                      ? 'bg-accent-soft ring-2 ring-accent z-10'
                      : hasConflict
                      ? 'bg-err'
                      : isRelated
                      ? 'bg-panel'
                      : 'bg-surface hover:bg-panel'
                  }`}
                  style={{
                    marginRight: isThickRight ? 2 : undefined,
                    marginBottom: isThickBottom ? 2 : undefined,
                  }}
                >
                  {cell.value !== null ? (
                    <span
                      className={`font-pixel text-xl ${
                        hasConflict
                          ? 'font-bold text-accent-foreground'
                          : cell.isGiven
                          ? 'font-bold text-ink'
                          : 'font-normal text-accent'
                      }`}
                    >
                      {cell.value}
                    </span>
                  ) : cell.notes.size > 0 ? (
                    <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <span key={n} className="text-[8px] font-pixel text-muted-foreground text-center leading-tight">
                          {cell.notes.has(n) ? n : ''}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </button>
              );
            })
          )}
        </div>

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
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">Difficulty</p>
          <div className="flex gap-2">
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
                {diff}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">Numbers</p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                className="w-12 h-12 bg-surface border border-line rounded-tile font-pixel text-lg text-ink flex items-center justify-center shadow-game-tile hover:bg-panel active:shadow-none active:translate-y-1 btn-bounce"
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleNumberInput(null)}
            className="btn btn-secondary flex-1 h-10 text-sm"
          >
            Erase
          </button>
          <button
            onClick={() => setNotesMode(!notesMode)}
            aria-pressed={notesMode}
            className={`btn flex-1 h-10 text-sm ${notesMode ? 'btn-primary' : 'btn-secondary'}`}
          >
            Notes {notesMode ? 'on' : 'off'}
          </button>
        </div>

        <PixelButton variant="primary" size="sm" onClick={() => newPuzzle(difficulty)}>
          New puzzle
        </PixelButton>
      </div>
    </div>
  );
}
