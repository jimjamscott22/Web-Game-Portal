import { useState, useCallback, useRef, useEffect } from 'react';
import {
  createSnake,
  randomFood,
  moveSnake,
  getOpposite,
  GRID_SIZE,
  SPEEDS,
  type Direction,
  type Position,
} from './gameLogic';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useSwipe } from '@/hooks/useSwipe';
import { useGameLoop } from '@/hooks/useGameLoop';
import WinOverlay from '@/components/WinOverlay';
import GameOverOverlay from '@/components/GameOverOverlay';
import MobileControls from '@/components/MobileControls';

interface BoardSnakeProps {
  onScoreChange: (score: number) => void;
}

export default function BoardSnake({ onScoreChange }: BoardSnakeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>(createSnake);
  const [food, setFood] = useState<Position>(() => randomFood(createSnake()));
  const [direction, setDirection] = useState<Direction>('right');
  const [nextDirection, setNextDirection] = useState<Direction>('right');
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'won' | 'lost'>('waiting');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState('Normal');
  const directionRef = useRef(direction);
  const nextDirRef = useRef(nextDirection);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const gameStateRef = useRef(gameState);
  const scoreRef = useRef(score);

  useEffect(() => { directionRef.current = direction; }, [direction]);
  useEffect(() => { nextDirRef.current = nextDirection; }, [nextDirection]);
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodRef.current = food; }, [food]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  const CELL = 24;
  const CANVAS_SIZE = GRID_SIZE * CELL;

  const reset = useCallback(() => {
    const s = createSnake();
    setSnake(s);
    setFood(randomFood(s));
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
      const { newSnake, ate, died } = moveSnake(prev, nextDirRef.current, foodRef.current);
      if (died) {
        setGameState('lost');
        return prev;
      }
      if (ate) {
        setFood(randomFood(newSnake));
        setScore(s => {
          const newScore = s + 10;
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

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    ctx.fillStyle = '#E8F5E9';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (let x = 0; x <= GRID_SIZE; x++) {
      ctx.strokeStyle = 'rgba(0,0,0,0.03)';
      ctx.beginPath();
      ctx.moveTo(x * CELL, 0);
      ctx.lineTo(x * CELL, CANVAS_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_SIZE; y++) {
      ctx.strokeStyle = 'rgba(0,0,0,0.03)';
      ctx.beginPath();
      ctx.moveTo(0, y * CELL);
      ctx.lineTo(CANVAS_SIZE, y * CELL);
      ctx.stroke();
    }

    const f = foodRef.current;
    const pulse = Math.sin(Date.now() / 200) * 0.05 + 1;
    const foodSize = CELL * 0.7 * pulse;
    ctx.fillStyle = '#E66A2C';
    ctx.beginPath();
    ctx.arc(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, foodSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#151515';
    ctx.lineWidth = 2;
    ctx.stroke();

    snake.forEach((seg, i) => {
      const x = seg.x * CELL;
      const y = seg.y * CELL;
      const isHead = i === 0;

      ctx.fillStyle = isHead ? '#7BB883' : '#8CC298';
      ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);
      ctx.strokeStyle = '#151515';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);

      if (isHead) {
        ctx.fillStyle = '#151515';
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
  }, [snake, food, direction, CANVAS_SIZE]);

  return (
    <div className="relative">
      <div
        className="relative rounded-xl border-[4px] border-dark overflow-hidden mx-auto"
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
          <div className="absolute inset-0 bg-dark/50 flex items-center justify-center">
            <div className="text-center">
              <p className="font-pixel text-2xl text-white mb-2">Snake</p>
              <p className="font-body text-sm text-white/80">Press any arrow key or swipe to start</p>
            </div>
          </div>
        )}

        {gameState === 'won' && (
          <WinOverlay
            title="You Win!"
            color="#8CC298"
            onKeepGoing={() => setGameState('playing')}
            onNewGame={reset}
          />
        )}
        {gameState === 'lost' && (
          <GameOverOverlay
            title="Game Over!"
            subtitle={`Score: ${score}`}
            color="#E66A2C"
            onTryAgain={reset}
          />
        )}
      </div>

      <div className="flex justify-center gap-2 mt-3">
        {Object.keys(SPEEDS).map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`font-pixel text-xs px-3 py-1.5 rounded-pill border-[2px] border-dark transition-all ${
              speed === s ? 'bg-game-green text-white' : 'bg-white text-dark hover:bg-gray-100'
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
        color="#8CC298"
      />
    </div>
  );
}
