import { useState, useCallback, useEffect, useRef } from 'react';
import {
  createBoard,
  placeMines,
  revealCell,
  revealMines,
  countFlags,
  checkWin,
  getNumberColor,
  DIFFICULTIES,
  type Cell,
} from './gameLogic';
import WinOverlay from '@/components/WinOverlay';
import GameOverOverlay from '@/components/GameOverOverlay';
import ScoreBox from '@/components/ScoreBox';

/** Per-step stagger for the flood-fill ripple and the mine detonations. */
const CASCADE_STEP_MS = 14;
const DETONATE_STEP_MS = 45;

const cloneBoard = (board: Cell[][]) => board.map(r => r.map(c => ({ ...c })));

export default function BoardMinesweeper() {
  const [difficultyIndex, setDifficultyIndex] = useState(0);
  const difficulty = DIFFICULTIES[difficultyIndex];
  const [board, setBoard] = useState<Cell[][]>(() => createBoard(difficulty));
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showLoss, setShowLoss] = useState(false);
  const [shake, setShake] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const [flagMode, setFlagMode] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef<number[]>([]);

  const minesLeft = difficulty.mines - countFlags(board);

  const clearTimers = () => { timers.current.forEach(id => window.clearTimeout(id)); timers.current = []; };
  useEffect(() => clearTimers, []);

  // Clock runs from the first reveal until the game ends.
  useEffect(() => {
    if (startedAt === null || gameState !== 'playing') return;
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 250);
    return () => window.clearInterval(id);
  }, [startedAt, gameState]);

  const reset = useCallback((diffIdx?: number) => {
    const idx = diffIdx !== undefined ? diffIdx : difficultyIndex;
    const diff = DIFFICULTIES[idx];
    clearTimers();
    setBoard(createBoard(diff));
    setGameState('playing');
    setShowLoss(false);
    setShake(false);
    setFirstClick(true);
    setFlagMode(false);
    setStartedAt(null);
    setElapsed(0);
  }, [difficultyIndex]);

  const handleDifficultyChange = useCallback((idx: number) => {
    setDifficultyIndex(idx);
    reset(idx);
  }, [reset]);

  const cycleMark = useCallback((row: number, col: number) => {
    const newBoard = cloneBoard(board);
    const cell = newBoard[row][col];
    if (cell.state === 'hidden') cell.state = 'flagged';
    else if (cell.state === 'flagged') cell.state = 'question';
    else if (cell.state === 'question') cell.state = 'hidden';
    else return;
    setBoard(newBoard);
  }, [board]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== 'playing') return;

    if (firstClick) {
      const newBoard = cloneBoard(board);
      placeMines(newBoard, difficulty, row, col);
      revealCell(newBoard, row, col, difficulty);
      setFirstClick(false);
      setStartedAt(Date.now());
      setBoard(newBoard);
      if (checkWin(newBoard, difficulty)) setGameState('won');
      return;
    }

    if (flagMode) return cycleMark(row, col);

    const cell = board[row][col];
    if (cell.state !== 'hidden') return;

    const newBoard = cloneBoard(board);

    if (cell.isMine) {
      const maxDelay = revealMines(newBoard, row, col);
      setBoard(newBoard);
      setGameState('lost');
      setShake(true);
      timers.current.push(
        window.setTimeout(() => setShake(false), 400),
        // Let the detonation ripple finish before the overlay covers it.
        window.setTimeout(() => setShowLoss(true), maxDelay * DETONATE_STEP_MS + 450),
      );
      return;
    }

    revealCell(newBoard, row, col, difficulty);
    setBoard(newBoard);
    if (checkWin(newBoard, difficulty)) setGameState('won');
  }, [board, gameState, firstClick, flagMode, difficulty, cycleMark]);

  const handleRightClick = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameState !== 'playing') return;
    cycleMark(row, col);
  }, [gameState, cycleMark]);

  const cellSize = difficulty.cols > 16 ? 28 : difficulty.cols > 9 ? 34 : 42;

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {DIFFICULTIES.map((diff, idx) => (
          <button
            key={diff.name}
            onClick={() => handleDifficultyChange(idx)}
            className={`font-body text-[13px] px-4 py-2 rounded-pill transition-colors ${
              idx === difficultyIndex
                ? 'bg-accent text-accent-foreground font-semibold'
                : 'border border-line text-muted-foreground hover:bg-panel'
            }`}
          >
            {diff.name}
          </button>
        ))}
        <button
          onClick={() => setFlagMode(!flagMode)}
          aria-pressed={flagMode}
          className={`font-body text-[13px] px-4 py-2 rounded-pill transition-colors ${
            flagMode
              ? 'bg-second text-accent-foreground font-semibold'
              : 'border border-line text-muted-foreground hover:bg-panel'
          }`}
        >
          Flag mode {flagMode ? 'on' : 'off'}
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <ScoreBox label="Mines" value={minesLeft} />
        <ScoreBox label="Time" value={elapsed} tone="surface" />
      </div>

      <div
        className={`inline-grid gap-[2px] rounded-card bg-board p-3 overflow-hidden select-none ${shake ? 'animate-shake' : ''}`}
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
                className={`flex items-center justify-center rounded-sm font-pixel font-bold transition-colors duration-100 ${
                  isRevealed ? (isMine ? 'ms-detonate' : 'ms-reveal') : ''
                } ${
                  isRevealed
                    ? isMine
                      ? 'bg-err'
                      : 'bg-surface'
                    : isFlagged
                    ? 'bg-accent-soft'
                    : 'bg-cell hover:bg-panel active:translate-y-px'
                }`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  fontSize: isRevealed && !isMine && cell.adjacentMines > 0 ? 16 : 14,
                  color: isRevealed && !isMine ? getNumberColor(cell.adjacentMines) : undefined,
                  cursor: isRevealed ? 'default' : 'pointer',
                  animationDelay: isRevealed
                    ? `${(cell.revealDelay ?? 0) * (isMine ? DETONATE_STEP_MS : CASCADE_STEP_MS)}ms`
                    : undefined,
                }}
              >
                {/* Mines and flags are accent discs, not glyphs. */}
                {isRevealed && cell.isMine && (
                  <span className="block rounded-full bg-accent-foreground" style={{ width: cellSize * 0.4, height: cellSize * 0.4 }} />
                )}
                {isRevealed && !cell.isMine && cell.adjacentMines > 0 && cell.adjacentMines}
                {isFlagged && (
                  <span className="block rounded-full bg-accent" style={{ width: cellSize * 0.36, height: cellSize * 0.36 }} />
                )}
                {isQuestion && <span className="text-muted-foreground">?</span>}
              </button>
            );
          })
        )}
      </div>

      {gameState === 'won' && (
        <WinOverlay title="Field cleared" onNewGame={() => reset()} />
      )}
      {gameState === 'lost' && showLoss && (
        <GameOverOverlay title="Boom" subtitle="You hit a mine." onTryAgain={() => reset()} />
      )}
    </div>
  );
}
