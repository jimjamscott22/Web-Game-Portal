import { useState, useCallback } from 'react';
import {
  createBoard,
  placeMines,
  revealCell,
  checkWin,
  getNumberColor,
  DIFFICULTIES,
  type Cell,
} from './gameLogic';
import WinOverlay from '@/components/WinOverlay';
import GameOverOverlay from '@/components/GameOverOverlay';

export default function BoardMinesweeper() {
  const [difficultyIndex, setDifficultyIndex] = useState(0);
  const difficulty = DIFFICULTIES[difficultyIndex];
  const [board, setBoard] = useState<Cell[][]>(() => createBoard(difficulty));
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [, setMinesLeft] = useState(difficulty.mines);
  const [firstClick, setFirstClick] = useState(true);
  const [flagMode, setFlagMode] = useState(false);

  const reset = useCallback((diffIdx?: number) => {
    const idx = diffIdx !== undefined ? diffIdx : difficultyIndex;
    const diff = DIFFICULTIES[idx];
    setBoard(createBoard(diff));
    setGameState('playing');
    setMinesLeft(diff.mines);
    setFirstClick(true);
    setFlagMode(false);
  }, [difficultyIndex]);

  const handleDifficultyChange = useCallback((idx: number) => {
    setDifficultyIndex(idx);
    reset(idx);
  }, [reset]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing') return;

    setBoard(prev => {
      const newBoard = prev.map(r => r.map(c => ({ ...c })));
      const cell = newBoard[row][col];

      if (firstClick) {
        placeMines(newBoard, difficulty, row, col);
        setFirstClick(false);
        revealCell(newBoard, row, col, difficulty);
        setBoard(newBoard);
        return newBoard;
      }

      if (flagMode) {
        if (cell.state === 'hidden') {
          cell.state = 'flagged';
          setMinesLeft(m => m - 1);
        } else if (cell.state === 'flagged') {
          cell.state = 'question';
          setMinesLeft(m => m + 1);
        } else if (cell.state === 'question') {
          cell.state = 'hidden';
        }
        return newBoard;
      }

      if (cell.state === 'flagged' || cell.state === 'question') return prev;

      if (cell.isMine) {
        cell.state = 'revealed';
        for (let r = 0; r < difficulty.rows; r++) {
          for (let c = 0; c < difficulty.cols; c++) {
            if (newBoard[r][c].isMine) newBoard[r][c].state = 'revealed';
          }
        }
        setGameState('lost');
        return newBoard;
      }

      revealCell(newBoard, row, col, difficulty);

      if (checkWin(newBoard, difficulty)) {
        setGameState('won');
      }

      return newBoard;
    });
  }, [gameState, firstClick, flagMode, difficulty]);

  const handleRightClick = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameState !== 'playing') return;

    setBoard(prev => {
      const newBoard = prev.map(r => r.map(c => ({ ...c })));
      const cell = newBoard[row][col];
      if (cell.state === 'hidden') {
        cell.state = 'flagged';
        setMinesLeft(m => m - 1);
      } else if (cell.state === 'flagged') {
        cell.state = 'question';
        setMinesLeft(m => m + 1);
      } else if (cell.state === 'question') {
        cell.state = 'hidden';
      }
      return newBoard;
    });
  }, [gameState]);

  const cellSize = difficulty.cols > 16 ? 28 : difficulty.cols > 9 ? 34 : 42;

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {DIFFICULTIES.map((diff, idx) => (
          <button
            key={diff.name}
            onClick={() => handleDifficultyChange(idx)}
            className={`font-pixel text-xs px-3 py-1.5 rounded-pill border-[2px] border-dark transition-all ${
              idx === difficultyIndex
                ? 'bg-game-blue text-white'
                : 'bg-white text-dark hover:bg-gray-100'
            }`}
          >
            {diff.name}
          </button>
        ))}
        <button
          onClick={() => setFlagMode(!flagMode)}
          className={`font-pixel text-xs px-3 py-1.5 rounded-pill border-[2px] border-dark transition-all ${
            flagMode ? 'bg-game-orange text-white' : 'bg-white text-dark hover:bg-gray-100'
          }`}
        >
          Flag Mode {flagMode ? 'ON' : 'OFF'}
        </button>
      </div>

      <div
        className="inline-grid gap-0 border-[3px] border-dark rounded-lg overflow-hidden select-none"
        style={{
          gridTemplateColumns: `repeat(${difficulty.cols}, ${cellSize}px)`,
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isRevealed = cell.state === 'revealed';
            const isMine = cell.isMine && isRevealed;
            const isFlagged = cell.state === 'flagged';
            const isQuestion = cell.state === 'question';

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                onContextMenu={(e) => handleRightClick(e, r, c)}
                className={`flex items-center justify-center font-pixel font-bold transition-all duration-100 ${
                  isRevealed
                    ? isMine
                      ? 'bg-red-500 text-white'
                      : 'bg-[#E8F4F6] border border-[#CCCCCC]'
                    : isFlagged
                    ? 'bg-[#FDC846]/30 border-2 border-dark'
                    : 'bg-game-blue border-2 border-[#A8D0D8] active:translate-y-0.5 active:shadow-inner hover:bg-[#9BC5D0]'
                }`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  fontSize: isRevealed && !isMine && cell.adjacentMines > 0 ? 16 : 14,
                  color: isRevealed && !isMine ? getNumberColor(cell.adjacentMines) : undefined,
                  cursor: isRevealed ? 'default' : 'pointer',
                }}
              >
                {isRevealed && cell.isMine && (
                  <span className="text-lg">💣</span>
                )}
                {isRevealed && !cell.isMine && cell.adjacentMines > 0 && cell.adjacentMines}
                {isFlagged && <span className="text-sm">🚩</span>}
                {isQuestion && <span className="text-dark/60">?</span>}
              </button>
            );
          })
        )}
      </div>

      {gameState === 'won' && (
        <WinOverlay
          title="You Win!"
          color="#8ABAC5"
          onKeepGoing={() => setGameState('playing')}
          onNewGame={() => reset()}
        />
      )}
      {gameState === 'lost' && (
        <GameOverOverlay
          title="BOOM!"
          color="#E66A2C"
          onTryAgain={() => reset()}
        />
      )}
    </div>
  );
}
