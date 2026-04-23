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
        <div
          className="grid border-[4px] border-dark rounded-lg overflow-hidden bg-white"
          style={{ gridTemplateColumns: 'repeat(9, 44px)' }}
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
                  className={`w-[44px] h-[44px] flex items-center justify-center relative transition-colors duration-100 ${
                    isSelected
                      ? 'bg-[#FEF1CD] border-[3px] border-[#FDC846] z-10'
                      : isRelated
                      ? 'bg-[#FFF8E1]'
                      : hasConflict
                      ? 'bg-[#FFEBEE]'
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    borderRight: isThickRight ? '3px solid #151515' : '1px solid #CCCCCC',
                    borderBottom: isThickBottom ? '3px solid #151515' : '1px solid #CCCCCC',
                  }}
                >
                  {cell.value !== null ? (
                    <span
                      className={`font-pixel text-xl ${
                        cell.isGiven ? 'font-bold text-dark' : 'font-normal text-[#2196F3]'
                      }`}
                    >
                      {cell.value}
                    </span>
                  ) : cell.notes.size > 0 ? (
                    <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <span key={n} className="text-[8px] font-body text-[#888888] text-center leading-tight">
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
          <div className="absolute inset-0 bg-dark/60 flex items-center justify-center rounded-lg z-10">
            <div className="bg-white rounded-card border-[4px] border-dark p-6 text-center shadow-card">
              <h3 className="font-pixel text-3xl font-bold text-game-orange mb-2">Puzzle Solved!</h3>
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
        <div className="bg-game-orange rounded-xl border-[3px] border-dark p-3 text-center">
          <p className="font-body text-[10px] uppercase tracking-wider text-white/70">Time</p>
          <p className="font-pixel text-2xl font-bold text-white">{formatTime(timerSeconds)}</p>
        </div>

        <div>
          <p className="font-pixel text-sm text-dark mb-2">Difficulty</p>
          <div className="flex gap-2">
            {(['Easy', 'Medium', 'Hard'] as DifficultyName[]).map(diff => (
              <button
                key={diff}
                onClick={() => newPuzzle(diff)}
                className={`font-pixel text-xs px-3 py-1.5 rounded-pill border-[2px] border-dark transition-all ${
                  difficulty === diff ? 'bg-game-orange text-white' : 'bg-white text-dark hover:bg-gray-100'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="font-pixel text-sm text-dark mb-2">Numbers</p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => handleNumberInput(num)}
                className="w-12 h-12 bg-white border-[3px] border-dark rounded-tile font-pixel text-lg text-dark flex items-center justify-center shadow-game-tile hover:bg-gray-100 active:shadow-none active:translate-y-1 btn-bounce"
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleNumberInput(null)}
            className="flex-1 h-10 bg-white border-[3px] border-dark rounded-pill font-pixel text-sm text-dark flex items-center justify-center hover:bg-gray-100 active:translate-y-0.5"
          >
            Erase
          </button>
          <button
            onClick={() => setNotesMode(!notesMode)}
            className={`flex-1 h-10 rounded-pill font-pixel text-sm border-[3px] border-dark transition-all ${
              notesMode ? 'bg-game-orange text-white' : 'bg-white text-dark hover:bg-gray-100'
            }`}
          >
            Notes {notesMode ? 'ON' : 'OFF'}
          </button>
        </div>

        <PixelButton variant="primary" size="sm" onClick={() => newPuzzle(difficulty)}>
          New Puzzle
        </PixelButton>
      </div>
    </div>
  );
}
