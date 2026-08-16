import { useState, useCallback, useRef, useEffect } from 'react';
import {
  randomPiece,
  rotatePiece,
  isValidPosition,
  lockPiece,
  clearLines,
  getDropSpeed,
  calculateScore,
  COLS,
  ROWS,
  type Piece,
} from './gameLogic';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useGameLoop } from '@/hooks/useGameLoop';
import GameOverOverlay from '@/components/GameOverOverlay';
import MobileControls from '@/components/MobileControls';
import ScoreBox from '@/components/ScoreBox';
import { useSkinTokens } from '@/theme/tokens';

interface BoardTetrisProps {
  onScoreChange: (score: number) => void;
  onLevelChange: (level: number) => void;
  onLinesChange: (lines: number) => void;
}

const CANVAS_TOKENS = [
  '--t-board', '--t-cell', '--t-accent-soft', '--t-line',
  '--t-p1', '--t-p2', '--t-p3', '--t-p4', '--t-p5', '--t-p6', '--t-p7',
] as const;

export default function BoardTetris({ onScoreChange, onLevelChange, onLinesChange }: BoardTetrisProps) {
  const tokens = useSkinTokens(CANVAS_TOKENS);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);

  const [board, setBoard] = useState<(string | null)[][]>(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  );
  const [piece, setPiece] = useState<Piece>(randomPiece);
  const [nextPiece, setNextPiece] = useState<Piece>(randomPiece);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [flashLines, setFlashLines] = useState<number[]>([]);

  const pieceRef = useRef(piece);
  const boardRef = useRef(board);
  const gameStateRef = useRef(gameState);
  const scoreRef = useRef(score);
  const levelRef = useRef(level);
  const linesRef = useRef(lines);
  const dropAccumulator = useRef(0);

  useEffect(() => { pieceRef.current = piece; }, [piece]);
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { linesRef.current = lines; }, [lines]);

  const CELL = 26;
  const CANVAS_W = COLS * CELL;
  const CANVAS_H = ROWS * CELL;

  /** `color` is a token name from TETROMINOES; resolve it for the live skin. */
  const drawBlock = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size = CELL) => {
    const px = x * size;
    const py = y * size;
    ctx.fillStyle = tokens[color as keyof typeof tokens] ?? color;
    ctx.beginPath();
    ctx.roundRect(px + 1, py + 1, size - 2, size - 2, Math.min(6, size / 4));
    ctx.fill();
  }, [tokens]);

  const spawnPiece = useCallback(() => {
    const p = nextPiece;
    setNextPiece(randomPiece());
    if (!isValidPosition(boardRef.current, p)) {
      setGameState('lost');
      return;
    }
    setPiece(p);
  }, [nextPiece]);

  const lockAndClear = useCallback(() => {
    let newBoard = lockPiece(boardRef.current, pieceRef.current);
    const { newBoard: cleared, linesCleared } = clearLines(newBoard);

    if (linesCleared > 0) {
      setFlashLines(
        Array.from({ length: ROWS }, (_, i) => i).filter(i => newBoard[i].every(c => c !== null))
      );
      setTimeout(() => setFlashLines([]), 150);

      const newScore = scoreRef.current + calculateScore(linesCleared) * levelRef.current;
      const newLines = linesRef.current + linesCleared;
      const newLevel = Math.floor(newLines / 10) + 1;
      setScore(newScore);
      setLines(newLines);
      setLevel(newLevel);
      onScoreChange(newScore);
      onLinesChange(newLines);
      onLevelChange(newLevel);
      newBoard = cleared;
    }

    setBoard(newBoard);
    spawnPiece();
  }, [spawnPiece, onScoreChange, onLinesChange, onLevelChange]);

  const move = useCallback((dx: number, dy: number) => {
    if (gameStateRef.current !== 'playing') return;
    setPiece(p => {
      if (isValidPosition(boardRef.current, p, dx, dy)) {
        return { ...p, x: p.x + dx, y: p.y + dy };
      }
      if (dy > 0 && !isValidPosition(boardRef.current, p, 0, 1)) {
        setTimeout(() => lockAndClear(), 0);
      }
      return p;
    });
  }, [lockAndClear]);

  const rotate = useCallback(() => {
    if (gameStateRef.current !== 'playing') return;
    setPiece(p => {
      const rotated = rotatePiece(p);
      if (isValidPosition(boardRef.current, rotated)) return rotated;
      for (const offset of [-1, 1, -2, 2]) {
        const test = { ...rotated, x: rotated.x + offset };
        if (isValidPosition(boardRef.current, test)) return test;
      }
      return p;
    });
  }, []);

  useKeyboard({
    arrowleft: () => move(-1, 0),
    arrowright: () => move(1, 0),
    arrowdown: () => move(0, 1),
    arrowup: rotate,
    ' ': rotate,
  }, [move, rotate]);

  useGameLoop((delta) => {
    if (gameStateRef.current !== 'playing') return;
    dropAccumulator.current += delta;
    const dropInterval = getDropSpeed(levelRef.current);
    if (dropAccumulator.current >= dropInterval) {
      dropAccumulator.current = 0;
      move(0, 1);
    }
  }, gameState === 'playing');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Board sits on --t-board with --t-cell holes.
    ctx.fillStyle = tokens['--t-board'];
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = tokens['--t-cell'];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.beginPath();
        ctx.roundRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2, 4);
        ctx.fill();
      }
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (flashLines.includes(r)) {
          ctx.fillStyle = tokens['--t-accent-soft'];
          ctx.beginPath();
          ctx.roundRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2, 4);
          ctx.fill();
          continue;
        }
        if (board[r][c]) {
          drawBlock(ctx, c, r, board[r][c]!);
        }
      }
    }

    const p = pieceRef.current;
    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[r].length; c++) {
        if (p.shape[r][c]) {
          drawBlock(ctx, p.x + c, p.y + r, p.color);
        }
      }
    }
  });

  useEffect(() => {
    const canvas = nextCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 120, 120);
    ctx.fillStyle = tokens['--t-board'];
    ctx.beginPath();
    ctx.roundRect(0, 0, 120, 120, 16);
    ctx.fill();

    const np = nextPiece;
    const offX = Math.floor((4 - np.shape[0].length) / 2);
    const offY = Math.floor((4 - np.shape.length) / 2);
    for (let r = 0; r < np.shape.length; r++) {
      for (let c = 0; c < np.shape[r].length; c++) {
        if (np.shape[r][c]) {
          drawBlock(ctx, offX + c, offY + r, np.color, 30);
        }
      }
    }
  }, [nextPiece, tokens, drawBlock]);


  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="rounded-card block"
        />
        {gameState === 'lost' && (
          <GameOverOverlay
            title="Stack topped out"
            score={score}
            onTryAgain={() => {
              setBoard(Array.from({ length: ROWS }, () => Array(COLS).fill(null)));
              setPiece(randomPiece());
              setNextPiece(randomPiece());
              setGameState('playing');
              setScore(0);
              setLevel(1);
              setLines(0);
              onScoreChange(0);
              onLevelChange(1);
              onLinesChange(0);
              dropAccumulator.current = 0;
            }}
          />
        )}
      </div>

      <div className="flex flex-col gap-4 min-w-[140px]">
        <div className="card p-4">
          <p className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-2">Next</p>
          <canvas ref={nextCanvasRef} width={120} height={120} className="rounded-tile" />
        </div>

        <ScoreBox label="Score" value={score} className="w-full" />
        <ScoreBox label="Level" value={level} tone="surface" className="w-full" />
        <ScoreBox label="Lines" value={lines} tone="surface" className="w-full" />

        <div className="font-body text-xs text-muted-foreground space-y-1">
          <p>Left/Right: move</p>
          <p>Down: soft drop</p>
          <p>Up/Space: rotate</p>
        </div>

        <MobileControls
          onLeft={() => move(-1, 0)}
          onRight={() => move(1, 0)}
          onDown={() => move(0, 1)}
          onRotate={rotate}
          showRotate
          color="var(--t-s4)"
        />
      </div>
    </div>
  );
}
