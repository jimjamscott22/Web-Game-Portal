import { useState, useCallback, useRef, useEffect } from 'react';
import {
  createSnake,
  spawnFoods,
  moveSnake,
  getOpposite,
  GRID_SIZE,
  SPEEDS,
  type Direction,
  type Position,
  type Food,
} from './gameLogic';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useSwipe } from '@/hooks/useSwipe';
import { useGameLoop } from '@/hooks/useGameLoop';
import WinOverlay from '@/components/WinOverlay';
import GameOverOverlay from '@/components/GameOverOverlay';
import MobileControls from '@/components/MobileControls';
import { useSkinTokens } from '@/theme/tokens';

const CANVAS_TOKENS = ['--t-board', '--t-accent', '--t-second', '--t-on-accent', '--t-accent-deep', '--t-s3'] as const;

interface BoardSnakeProps {
  onScoreChange: (score: number) => void;
}

export default function BoardSnake({ onScoreChange }: BoardSnakeProps) {
  const tokens = useSkinTokens(CANVAS_TOKENS);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>(createSnake);
  const [foods, setFoods] = useState<Food[]>(() => spawnFoods(createSnake()));
  const [direction, setDirection] = useState<Direction>('right');
  const [nextDirection, setNextDirection] = useState<Direction>('right');
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState('Normal');
  const directionRef = useRef(direction);
  const nextDirRef = useRef(nextDirection);
  const snakeRef = useRef(snake);
  const foodsRef = useRef(foods);
  const gameStateRef = useRef(gameState);
  const scoreRef = useRef(score);

  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { nextDirRef.current = nextDirection; }, [nextDirection]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodsRef.current = foods; }, [foods]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const CELL = 24;
  const CANVAS_SIZE = GRID_SIZE * CELL;

  const reset = useCallback(() => {
    const s = createSnake();
    setSnake(s);
    setFoods(spawnFoods(s));
    setDirection('right');
    setNextDirection('right');
    setGameState('waiting');
    setScore(0);
    onScoreChange(0);
  }, [onScoreChange]);

  const changeDirection = useCallback((dir: Direction) => {
    if (gameStateRef.current === 'waiting') {
      setGameState('playing');
      setDirection(dir);
      setNextDirection(dir);
      return;
    }
    if (gameStateRef.current !== 'playing') return;
    if (dir !== getOpposite(directionRef.current)) {
      setNextDirection(dir);
    }
  }, []);

  useKeyboard({
    arrowup: () => changeDirection('up'),
    arrowdown: () => changeDirection('down'),
    arrowleft: () => changeDirection('left'),
    arrowright: () => changeDirection('right'),
    w: () => changeDirection('up'),
    s: () => changeDirection('down'),
    a: () => changeDirection('left'),
    d: () => changeDirection('right'),
  }, [changeDirection]);

  const swipeHandlers = useSwipe({
    onSwipeUp: () => changeDirection('up'),
    onSwipeDown: () => changeDirection('down'),
    onSwipeLeft: () => changeDirection('left'),
    onSwipeRight: () => changeDirection('right'),
  });

  useGameLoop(() => {
    if (gameStateRef.current !== 'playing') return;

    setDirection(nextDirRef.current);

    setSnake(prev => {
      const { newSnake, ateBit, died } = moveSnake(prev, nextDirRef.current, foodsRef.current);
      if (died) {
        setGameState('lost');
        return prev;
      }
      if (ateBit !== null) {
        setFoods(spawnFoods(newSnake));
        setScore(s => {
          const newScore = (s << 1) | ateBit;
          scoreRef.current = newScore;
          onScoreChange(newScore);
          return newScore;
        });
      }
      return newSnake;
    });
  }, gameState === 'playing', 1000 / SPEEDS[speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
    };

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Playfield is --t-board with no gridlines.
    ctx.fillStyle = tokens['--t-board'];
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const pulse = Math.sin(Date.now() / 200) * 0.05 + 1;
    const foodSize = CELL * 0.7 * pulse;
    foodsRef.current.forEach(f => {
      // Two accents only: the 1-bit takes the accent, the 0-bit the secondary.
      ctx.fillStyle = f.bit === 1 ? tokens['--t-accent'] : tokens['--t-second'];
      ctx.beginPath();
      ctx.arc(f.pos.x * CELL + CELL / 2, f.pos.y * CELL + CELL / 2, foodSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = tokens['--t-on-accent'];
      ctx.font = `bold ${Math.floor(CELL * 0.5)}px 'Pixelify Sans', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.bit.toString(), f.pos.x * CELL + CELL / 2, f.pos.y * CELL + CELL / 2 + 1);
    });

    const lastIndex = snake.length - 1;
    snake.forEach((seg, i) => {
      const x = seg.x * CELL;
      const y = seg.y * CELL;
      const isHead = i === 0;
      const isTail = i === lastIndex && lastIndex > 0;

      // 16px radius on head and tail only; the body stays hard-edged.
      ctx.fillStyle = isHead ? tokens['--t-s3'] : tokens['--t-accent-deep'];
      const radius = isHead || isTail ? Math.min(16, CELL / 2) : 0;
      roundRect(x + 1, y + 1, CELL - 2, CELL - 2, radius);

      if (!isHead) {
        const bit = ((seg.x * 31 + seg.y * 17 + i * 7) & 1).toString();
        ctx.fillStyle = tokens['--t-on-accent'];
        ctx.font = `bold ${Math.floor(CELL * 0.6)}px 'Pixelify Sans', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bit, x + CELL / 2, y + CELL / 2 + 1);
      }

      if (isHead) {
        ctx.fillStyle = tokens['--t-on-accent'];
        const eyeSize = 3;
        const eyeOffset = 5;
        let ex1 = x + eyeOffset, ey1 = y + eyeOffset;
        let ex2 = x + CELL - eyeOffset - eyeSize, ey2 = y + eyeOffset;

        switch (directionRef.current) {
          case 'up':
            ex1 = x + eyeOffset; ey1 = y + eyeOffset;
            ex2 = x + CELL - eyeOffset - eyeSize; ey2 = y + eyeOffset;
            break;
          case 'down':
            ex1 = x + eyeOffset; ey1 = y + CELL - eyeOffset - eyeSize;
            ex2 = x + CELL - eyeOffset - eyeSize; ey2 = y + CELL - eyeOffset - eyeSize;
            break;
          case 'left':
            ex1 = x + eyeOffset; ey1 = y + eyeOffset;
            ex2 = x + eyeOffset; ey2 = y + CELL - eyeOffset - eyeSize;
            break;
          case 'right':
            ex1 = x + CELL - eyeOffset - eyeSize; ey1 = y + eyeOffset;
            ex2 = x + CELL - eyeOffset - eyeSize; ey2 = y + CELL - eyeOffset - eyeSize;
            break;
        }

        ctx.fillRect(ex1, ey1, eyeSize, eyeSize);
        ctx.fillRect(ex2, ey2, eyeSize, eyeSize);
      }
    });

    const animId = requestAnimationFrame(() => { });
    return () => cancelAnimationFrame(animId);
  }, [snake, foods, direction, CANVAS_SIZE, CELL, tokens]);

  return (
    <div className="relative">
      <div
        className="relative rounded-card overflow-hidden mx-auto"
        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
        {...swipeHandlers}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="block"
        />

        {gameState === 'waiting' && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
            <div className="rounded-card border border-line bg-surface px-7 py-6 text-center shadow-card">
              <p className="font-display text-2xl text-ink mb-1">Snake</p>
              <p className="font-body text-sm text-muted-foreground">Press any arrow key or swipe to start</p>
            </div>
          </div>
        )}

        {gameState === 'won' && (
          <WinOverlay title="You win!" score={score} onNewGame={reset} />
        )}
        {gameState === 'lost' && (
          <GameOverOverlay title="Crashed" score={score} onTryAgain={reset} />
        )}
      </div>

      <div className="flex justify-center gap-2 mt-3">
        {Object.keys(SPEEDS).map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`font-body text-[13px] px-4 py-2 rounded-pill transition-colors ${
              speed === s
                ? 'bg-accent text-accent-foreground font-semibold'
                : 'border border-line text-muted-foreground hover:bg-panel'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <MobileControls
        onUp={() => changeDirection('up')}
        onDown={() => changeDirection('down')}
        onLeft={() => changeDirection('left')}
        onRight={() => changeDirection('right')}
        color="var(--t-s3)"
      />
    </div>
  );
}
