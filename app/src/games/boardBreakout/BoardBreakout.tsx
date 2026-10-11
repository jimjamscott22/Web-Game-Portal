import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import {
  BALL_R,
  BREAKOUT_CONFIG,
  FIELD_H,
  FIELD_W,
  LEVELS,
  PADDLE_H,
  PADDLE_Y,
  brickRect,
  clampPaddle,
  createGame,
  launch,
  step,
  type Brick,
  type BreakoutState,
  type Difficulty,
  type Status,
} from './gameLogic';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useHeldKeys } from '@/hooks/useHeldKeys';
import { useSwipe } from '@/hooks/useSwipe';
import { useGameLoop } from '@/hooks/useGameLoop';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import MobileControls from '@/components/MobileControls';
import { cn } from '@/lib/utils';
import { inkOn, useSkinTokens } from '@/theme/tokens';

/** Brick rows cycle through the piece palette, top to bottom. */
const ROW_TOKENS = ['--t-p3', '--t-p2', '--t-p1', '--t-p6', '--t-p5', '--t-p4'] as const;
const CANVAS_TOKENS = ['--t-board', '--t-ink', '--t-accent', '--t-accent-deep', '--t-on-light', '--t-on-dark', ...ROW_TOKENS] as const;
const HELD_KEYS = ['arrowleft', 'arrowright', 'a', 'd'];
const NO_REPEAT = [' ', 'p', 'escape'];
/** How far one tap of an on-screen arrow moves the paddle. */
const NUDGE = 56;
const TRAIL_LENGTH = 6;

interface Particle { x: number; y: number; vx: number; vy: number; life: number; size: number; token: (typeof ROW_TOKENS)[number] }

const rowToken = (row: number) => ROW_TOKENS[row % ROW_TOKENS.length];

interface BoardBreakoutProps {
  difficulty: Difficulty;
  onScoreChange: (score: number) => void;
  onGameOver: (score: number) => void;
  onWin: (score: number) => void;
}

export default function BoardBreakout({ difficulty, onScoreChange, onGameOver, onWin }: BoardBreakoutProps) {
  const tokens = useSkinTokens(CANVAS_TOKENS);
  const reducedMotion = usePrefersReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [initial] = useState(() => createGame(difficulty));
  // The simulation lives in a ref so the 120 Hz loop doesn't re-render React;
  // only the HUD fields below are mirrored into state.
  const gameRef = useRef<BreakoutState>(initial);
  const [hud, setHud] = useState<{ level: number; lives: number; status: Status }>({ level: initial.level, lives: initial.lives, status: initial.status });
  const [paused, setPaused] = useState(false);
  const held = useHeldKeys(HELD_KEYS);
  const targetXRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const tokensRef = useRef(tokens);
  const reducedMotionRef = useRef(reducedMotion);

  useEffect(() => { tokensRef.current = tokens; }, [tokens]);
  useEffect(() => { reducedMotionRef.current = reducedMotion; }, [reducedMotion]);

  const syncHud = useCallback((s: BreakoutState) => {
    setHud(h => (h.level === s.level && h.lives === s.lives && h.status === s.status ? h : { level: s.level, lives: s.lives, status: s.status }));
  }, []);

  const serve = useCallback(() => {
    if (gameRef.current.status !== 'serve') return;
    gameRef.current = launch(gameRef.current);
    setPaused(false);
    syncHud(gameRef.current);
  }, [syncHud]);

  const togglePause = useCallback(() => {
    if (gameRef.current.status === 'playing') setPaused(p => !p);
  }, []);

  const launchOrPause = useCallback(() => {
    if (gameRef.current.status === 'serve') serve();
    else togglePause();
  }, [serve, togglePause]);

  const nudge = useCallback((dir: -1 | 1) => {
    const s = gameRef.current;
    targetXRef.current = clampPaddle(s.difficulty, (targetXRef.current ?? s.paddleX) + dir * NUDGE);
  }, []);

  useKeyboard({
    ' ': launchOrPause,
    arrowup: serve,
    w: serve,
    p: togglePause,
    escape: togglePause,
  }, [launchOrPause, serve, togglePause], { noRepeat: NO_REPEAT });

  const swipeHandlers = useSwipe({ onSwipeUp: serve });

  // A tab switch stops rAF; pause so the loop doesn't fast-forward on return.
  useEffect(() => {
    const onVisibility = () => { if (document.hidden && gameRef.current.status === 'playing') setPaused(true); };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const burst = useCallback((brick: Brick, destroyed: boolean) => {
    if (reducedMotionRef.current) return;
    const r = brickRect(brick);
    for (let i = 0; i < (destroyed ? 12 : 4); i++) {
      particlesRef.current.push({
        x: r.x + Math.random() * r.w,
        y: r.y + Math.random() * r.h,
        vx: (Math.random() - 0.5) * 180,
        vy: -Math.random() * 140 - 20,
        life: 1,
        size: 3 + Math.random() * 3,
        token: rowToken(brick.row),
      });
    }
  }, []);

  const running = !paused && (hud.status === 'serve' || hud.status === 'playing');

  useGameLoop((ms) => {
    const keys = held.current;
    const dir = (Number(keys.has('arrowright') || keys.has('d')) - Number(keys.has('arrowleft') || keys.has('a'))) as -1 | 0 | 1;
    if (dir !== 0) targetXRef.current = null;

    const prev = gameRef.current;
    const { state, events } = step(prev, ms / 1000, { dir, targetX: targetXRef.current });
    gameRef.current = state;

    events.hits.forEach(hit => burst(hit.brick, hit.destroyed));
    if (events.lostLife || events.levelUp) trailRef.current = [];
    if (state.score !== prev.score) onScoreChange(state.score);
    syncHud(state);
    if (state.status !== prev.status) {
      if (state.status === 'lost') onGameOver(state.score);
      if (state.status === 'won') onWin(state.score);
    }
  }, running, 120);

  // Continuous draw loop, decoupled from the simulation tick.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Back the canvas at device resolution so the pixel edges stay crisp.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = FIELD_W * dpr;
    canvas.height = FIELD_H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const fillRound = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fill();
    };

    let last = performance.now();
    let animId = 0;
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const tk = tokensRef.current;
      const s = gameRef.current;
      const still = reducedMotionRef.current;

      ctx.globalAlpha = 1;
      ctx.fillStyle = tk['--t-board'];
      ctx.fillRect(0, 0, FIELD_W, FIELD_H);

      // Bricks: a chunky offset drop under each, fading as they take damage.
      for (const b of s.bricks) {
        const r = brickRect(b);
        const fill = tk[rowToken(b.row)];
        const health = 0.45 + 0.55 * (b.hp / b.maxHp);
        ctx.globalAlpha = 0.16 * health;
        ctx.fillStyle = tk['--t-ink'];
        fillRound(r.x, r.y + 3, r.w, r.h, 6);
        ctx.globalAlpha = health;
        ctx.fillStyle = fill;
        fillRound(r.x, r.y, r.w, r.h, 6);
        if (b.maxHp > 1) {
          // One pip per remaining hit point.
          ctx.globalAlpha = 0.7;
          ctx.fillStyle = tk[inkOn(fill)];
          const pip = 4, gap = 3;
          const start = r.x + r.w / 2 - (b.hp * pip + (b.hp - 1) * gap) / 2;
          for (let k = 0; k < b.hp; k++) ctx.fillRect(start + k * (pip + gap), r.y + r.h / 2 - pip / 2, pip, pip);
        }
      }

      // Brick-break particles.
      ctx.globalAlpha = 1;
      particlesRef.current = particlesRef.current.filter(p => {
        p.life -= dt * 1.8;
        if (p.life <= 0) return false;
        p.vy += 420 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = tk[p.token];
        ctx.fillRect(p.x, p.y, p.size, p.size);
        return true;
      });

      // Paddle.
      const paddleW = BREAKOUT_CONFIG[s.difficulty].paddleW;
      const px = s.paddleX - paddleW / 2;
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = tk['--t-ink'];
      fillRound(px, PADDLE_Y + 4, paddleW, PADDLE_H, 6);
      ctx.globalAlpha = 1;
      ctx.fillStyle = tk['--t-accent-deep'];
      fillRound(px, PADDLE_Y, paddleW, PADDLE_H, 6);

      // Ball, with a short fading trail while it's in flight.
      const trail = trailRef.current;
      if (s.status === 'playing' && !still) {
        trail.unshift({ x: s.ball.x, y: s.ball.y });
        trail.length = Math.min(trail.length, TRAIL_LENGTH);
      } else if (s.status !== 'playing') {
        trail.length = 0;
      }
      ctx.fillStyle = tk['--t-accent'];
      trail.forEach((pt, i) => {
        ctx.globalAlpha = 0.25 * (1 - i / TRAIL_LENGTH);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, BALL_R * (1 - i / (TRAIL_LENGTH * 1.5)), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  const toField = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return ((e.clientX - rect.left) * FIELD_W) / rect.width;
  };

  const maxLives = BREAKOUT_CONFIG[difficulty].lives;
  const level = LEVELS[hud.level];

  return (
    <div className="mx-auto" style={{ maxWidth: FIELD_W }}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="font-body text-sm text-muted-foreground">
          Level <span className="font-pixel text-base font-bold text-ink">{hud.level + 1}</span>/{LEVELS.length} · {level.name}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" role="img" aria-label={`${hud.lives} of ${maxLives} lives left`}>
            {Array.from({ length: maxLives }, (_, i) => (
              <span key={i} className={cn('w-3 h-3 rounded-[3px]', i < hud.lives ? 'bg-accent' : 'bg-cell border border-line')} />
            ))}
          </div>
          <button
            onClick={togglePause}
            disabled={hud.status !== 'playing'}
            aria-label={paused ? 'Resume' : 'Pause'}
            className="w-11 h-11 rounded-full border border-line flex items-center justify-center text-ink hover:bg-panel transition-colors disabled:opacity-40"
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div
        className="relative rounded-card overflow-hidden touch-none select-none"
        onPointerMove={e => { if (!paused) targetXRef.current = toField(e); }}
        onPointerDown={e => {
          if (paused) return;
          targetXRef.current = toField(e);
          serve();
        }}
        {...swipeHandlers}
      >
        <canvas
          ref={canvasRef}
          width={FIELD_W}
          height={FIELD_H}
          className="block w-full h-auto"
          style={{ aspectRatio: `${FIELD_W} / ${FIELD_H}` }}
          role="img"
          aria-label={`Breakout playfield, level ${hud.level + 1}, ${hud.lives} lives`}
        />

        {hud.status === 'serve' && !paused && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[72px] flex justify-center px-4">
            <div className="rounded-card border border-line bg-surface px-6 py-3 text-center shadow-card">
              <p className="font-display text-xl text-ink">Level {hud.level + 1} · {level.name}</p>
              <p className="font-body text-xs text-muted-foreground mt-0.5">Press Space or tap to launch</p>
            </div>
          </div>
        )}

        {paused && (
          <div className="absolute inset-0 flex items-center justify-center bg-scrim backdrop-blur-[2px]">
            <button onClick={togglePause} className="rounded-card border border-line bg-surface px-7 py-6 text-center shadow-card">
              <span className="block font-display text-2xl text-ink mb-1">Paused</span>
              <span className="block font-body text-sm text-muted-foreground">Press P or tap to resume</span>
            </button>
          </div>
        )}
      </div>

      <MobileControls
        color="var(--t-s13)"
        onLeft={() => nudge(-1)}
        onRight={() => nudge(1)}
        onUp={serve}
        onDown={togglePause}
      />
    </div>
  );
}
