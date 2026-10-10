export type Difficulty = 'easy' | 'normal' | 'hard';
export type Status = 'serve' | 'playing' | 'lost' | 'won';

/** Logical playfield size; the canvas is scaled to fit with CSS. */
export const FIELD_W = 480;
export const FIELD_H = 560;

export const BALL_R = 7;
export const PADDLE_H = 12;
/** Top edge of the paddle. */
export const PADDLE_Y = FIELD_H - 40;

export const BRICK_COLS = 10;
export const BRICK_H = 20;
export const BRICK_GAP = 6;
export const BRICK_TOP = 56;
export const SIDE_PAD = 16;
export const BRICK_W = (FIELD_W - SIDE_PAD * 2 - BRICK_GAP * (BRICK_COLS - 1)) / BRICK_COLS;

/** Steepest bounce off the paddle edge, measured from vertical. */
const MAX_BOUNCE = (60 * Math.PI) / 180;
/** Shallowest angle from vertical, so the ball can't lock into a straight up-and-down loop. */
const MIN_BOUNCE = (8 * Math.PI) / 180;
/** Each level is this much faster than the last. */
const LEVEL_SPEEDUP = 0.08;
/** Every paddle hit nudges the ball faster, up to this multiple of the level speed. */
const RALLY_SPEEDUP = 1.02;
const RALLY_CAP = 1.3;

export const BREAKOUT_CONFIG: Record<Difficulty, { paddleW: number; speed: number; paddleSpeed: number; lives: number }> = {
  easy: { paddleW: 110, speed: 300, paddleSpeed: 540, lives: 5 },
  normal: { paddleW: 88, speed: 360, paddleSpeed: 620, lives: 3 },
  hard: { paddleW: 68, speed: 430, paddleSpeed: 700, lives: 3 },
};

/** One string per brick row; `.` is empty and a digit is the brick's hit points. */
export const LEVELS: { name: string; rows: string[] }[] = [
  {
    name: 'Warm up',
    rows: ['1111111111', '1111111111', '1111111111', '1111111111'],
  },
  {
    name: 'Pyramid',
    rows: ['....22....', '...2112...', '..211112..', '.21111112.', '2111111112'],
  },
  {
    name: 'Checker',
    rows: ['2.2.2.2.2.', '.2.2.2.2.2', '1.1.1.1.1.', '.1.1.1.1.1', '2.2.2.2.2.', '.2.2.2.2.2'],
  },
  {
    name: 'Invader',
    rows: ['..1....1..', '...1..1...', '..222222..', '.22.22.22.', '2222222222', '2.222222.2', '2.2....2.2', '...22.22..'],
  },
  {
    name: 'Fortress',
    rows: ['3333333333', '3........3', '3.222222.3', '3.211112.3', '3.211112.3', '3.222222.3', '3........3'],
  },
];

export interface Brick { row: number; col: number; hp: number; maxHp: number }
export interface Ball { x: number; y: number; vx: number; vy: number }

export interface BreakoutState {
  difficulty: Difficulty;
  /** Zero-based index into LEVELS. */
  level: number;
  /** Paddle centre. */
  paddleX: number;
  ball: Ball;
  bricks: Brick[];
  score: number;
  lives: number;
  status: Status;
}

export interface BrickHit { brick: Brick; destroyed: boolean }

export interface StepEvents {
  hits: BrickHit[];
  paddleHit: boolean;
  lostLife: boolean;
  levelUp: boolean;
}

export interface StepInput {
  /** Held-key direction for the paddle. */
  dir: -1 | 0 | 1;
  /** Pointer x in field coordinates; the paddle snaps to it when set. */
  targetX: number | null;
}

export const brickRect = (b: Pick<Brick, 'row' | 'col'>) => ({
  x: SIDE_PAD + b.col * (BRICK_W + BRICK_GAP),
  y: BRICK_TOP + b.row * (BRICK_H + BRICK_GAP),
  w: BRICK_W,
  h: BRICK_H,
});

export function loadLevel(index: number): Brick[] {
  return LEVELS[index].rows.flatMap((line, row) =>
    [...line].flatMap((ch, col) => {
      const hp = Number(ch);
      return hp > 0 ? [{ row, col, hp, maxHp: hp }] : [];
    }),
  );
}

export const levelSpeed = (difficulty: Difficulty, level: number) =>
  BREAKOUT_CONFIG[difficulty].speed * (1 + LEVEL_SPEEDUP * level);

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Map -1..1 onto a bounce angle, keeping at least MIN_BOUNCE off vertical. */
const bounceAngle = (t: number) => (t < 0 ? -1 : 1) * Math.max(MIN_BOUNCE, Math.abs(t) * MAX_BOUNCE);

export const clampPaddle = (difficulty: Difficulty, x: number) => {
  const half = BREAKOUT_CONFIG[difficulty].paddleW / 2;
  return clamp(x, half, FIELD_W - half);
};

/** Ball parked on top of the paddle, waiting for a launch. */
const restingBall = (paddleX: number): Ball => ({ x: paddleX, y: PADDLE_Y - BALL_R - 1, vx: 0, vy: 0 });

export function createGame(difficulty: Difficulty): BreakoutState {
  const paddleX = FIELD_W / 2;
  return {
    difficulty,
    level: 0,
    paddleX,
    ball: restingBall(paddleX),
    bricks: loadLevel(0),
    score: 0,
    lives: BREAKOUT_CONFIG[difficulty].lives,
    status: 'serve',
  };
}

/** Send the ball up at a random angle, 8–30° off vertical. */
export function launch(state: BreakoutState, random = Math.random): BreakoutState {
  if (state.status !== 'serve') return state;
  const speed = levelSpeed(state.difficulty, state.level);
  const angle = bounceAngle((random() * 2 - 1) / 2);
  return {
    ...state,
    status: 'playing',
    ball: { ...state.ball, vx: speed * Math.sin(angle), vy: -speed * Math.cos(angle) },
  };
}

function movePaddle(state: BreakoutState, dt: number, input: StepInput): number {
  if (input.targetX !== null) return clampPaddle(state.difficulty, input.targetX);
  return clampPaddle(state.difficulty, state.paddleX + input.dir * BREAKOUT_CONFIG[state.difficulty].paddleSpeed * dt);
}

/** Advance the simulation by `dt` seconds. Pure: returns a new state plus what happened. */
export function step(prev: BreakoutState, dt: number, input: StepInput): { state: BreakoutState; events: StepEvents } {
  const events: StepEvents = { hits: [], paddleHit: false, lostLife: false, levelUp: false };
  if (prev.status === 'lost' || prev.status === 'won') return { state: prev, events };

  const paddleX = movePaddle(prev, dt, input);
  if (prev.status === 'serve') return { state: { ...prev, paddleX, ball: restingBall(paddleX) }, events };

  const { difficulty, level } = prev;
  const paddleW = BREAKOUT_CONFIG[difficulty].paddleW;
  const ball = { ...prev.ball };
  let bricks = prev.bricks;
  let score = prev.score;

  // Sub-step so the ball never travels more than half its radius per check
  // and can't tunnel through a brick or the paddle at high speed.
  const speed = Math.hypot(ball.vx, ball.vy);
  const substeps = Math.max(1, Math.ceil((speed * dt) / (BALL_R / 2)));
  const h = dt / substeps;

  for (let i = 0; i < substeps; i++) {
    ball.x += ball.vx * h;
    ball.y += ball.vy * h;

    if (ball.x < BALL_R) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx); }
    if (ball.x > FIELD_W - BALL_R) { ball.x = FIELD_W - BALL_R; ball.vx = -Math.abs(ball.vx); }
    if (ball.y < BALL_R) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy); }

    // Paddle: bounce angle depends on where along the paddle the ball lands.
    if (
      ball.vy > 0 &&
      ball.y + BALL_R >= PADDLE_Y &&
      ball.y - BALL_R <= PADDLE_Y + PADDLE_H &&
      Math.abs(ball.x - paddleX) <= paddleW / 2 + BALL_R
    ) {
      const angle = bounceAngle(clamp((ball.x - paddleX) / (paddleW / 2), -1, 1));
      const next = Math.min(Math.hypot(ball.vx, ball.vy) * RALLY_SPEEDUP, levelSpeed(difficulty, level) * RALLY_CAP);
      ball.vx = next * Math.sin(angle);
      ball.vy = -next * Math.cos(angle);
      ball.y = PADDLE_Y - BALL_R;
      events.paddleHit = true;
    }

    // Bricks: resolve at most one per sub-step, reflecting on the axis of
    // shallower penetration.
    const hitIndex = bricks.findIndex(b => {
      const r = brickRect(b);
      const cx = clamp(ball.x, r.x, r.x + r.w);
      const cy = clamp(ball.y, r.y, r.y + r.h);
      return (ball.x - cx) ** 2 + (ball.y - cy) ** 2 < BALL_R ** 2;
    });
    if (hitIndex !== -1) {
      const brick = bricks[hitIndex];
      const r = brickRect(brick);
      const overlapX = Math.min(ball.x + BALL_R - r.x, r.x + r.w - (ball.x - BALL_R));
      const overlapY = Math.min(ball.y + BALL_R - r.y, r.y + r.h - (ball.y - BALL_R));
      if (overlapX < overlapY) {
        ball.vx = ball.x < r.x + r.w / 2 ? -Math.abs(ball.vx) : Math.abs(ball.vx);
        ball.x += ball.vx > 0 ? overlapX : -overlapX;
      } else {
        ball.vy = ball.y < r.y + r.h / 2 ? -Math.abs(ball.vy) : Math.abs(ball.vy);
        ball.y += ball.vy > 0 ? overlapY : -overlapY;
      }

      const hit = { ...brick, hp: brick.hp - 1 };
      const destroyed = hit.hp <= 0;
      score += 10 * (level + 1) + (destroyed ? 15 * brick.maxHp * (level + 1) : 0);
      bricks = destroyed ? bricks.filter((_, j) => j !== hitIndex) : bricks.map((b, j) => (j === hitIndex ? hit : b));
      events.hits.push({ brick: hit, destroyed });
    }

    if (ball.y - BALL_R > FIELD_H) {
      events.lostLife = true;
      const lives = prev.lives - 1;
      return {
        state: { ...prev, paddleX, bricks, score, lives, status: lives > 0 ? 'serve' : 'lost', ball: restingBall(paddleX) },
        events,
      };
    }

    if (bricks.length === 0) {
      if (level === LEVELS.length - 1) {
        return { state: { ...prev, paddleX, ball, bricks, score, status: 'won' }, events };
      }
      events.levelUp = true;
      return {
        state: { ...prev, paddleX, bricks: loadLevel(level + 1), level: level + 1, score, status: 'serve', ball: restingBall(paddleX) },
        events,
      };
    }
  }

  return { state: { ...prev, paddleX, ball, bricks, score }, events };
}
