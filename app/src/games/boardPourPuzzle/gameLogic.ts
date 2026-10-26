// Pour Puzzle — measure exact amounts of water with unmarked jugs.
// Pure rules + solver. No React imports.

export type Tier = 'tap' | 'closed' | 'trio';

export interface PourLevel {
  id: string;
  name: string;
  capacities: number[];
  start: number[];
  /** Tap levels allow Fill/Empty from an endless supply; closed levels only pour. */
  tap: boolean;
  /** Win when at least `count` jugs each hold exactly `amount`. */
  goal: { amount: number; count: number };
  /** Short "why it works" note shown after solving. */
  insight: string;
}

export type Move =
  | { type: 'fill'; jug: number }
  | { type: 'empty'; jug: number }
  | { type: 'pour'; from: number; to: number };

export const TIERS: { value: Tier; label: string }[] = [
  { value: 'tap', label: 'Two jugs' },
  { value: 'closed', label: 'No tap' },
  { value: 'trio', label: 'Three jugs' },
];

export const LEVELS: Record<Tier, PourLevel[]> = {
  tap: [
    {
      id: 'tap-1', name: 'Warm-up', capacities: [5, 2], start: [0, 0], tap: true,
      goal: { amount: 3, count: 1 },
      insight: 'Pouring a full jug into a smaller one leaves the difference behind: 5 − 2 = 3.',
    },
    {
      id: 'tap-2', name: 'The classic', capacities: [5, 3], start: [0, 0], tap: true,
      goal: { amount: 4, count: 1 },
      insight: 'Every amount you make is 5a − 3b for whole numbers a and b. Here 4 = 2·5 − 2·3.',
    },
    {
      id: 'tap-3', name: 'Overflow', capacities: [7, 4], start: [0, 0], tap: true,
      goal: { amount: 6, count: 1 },
      insight: 'Use the 4 as a scoop: 7 − 4 leaves 3. Move that 3 into the 4, and the next full 7 can only give away 1 more: 7 − 1 = 6.',
    },
    {
      id: 'tap-4', name: 'Odd one out', capacities: [9, 4], start: [0, 0], tap: true,
      goal: { amount: 7, count: 1 },
      insight: 'Because gcd(9, 4) = 1, every amount from 1 to 9 is reachable. Try both directions — one route is much shorter.',
    },
    {
      id: 'tap-5', name: 'Long way round', capacities: [11, 6], start: [0, 0], tap: true,
      goal: { amount: 8, count: 1 },
      insight: 'Two strategies exist: repeatedly fill the big jug, or repeatedly fill the small one. Counting steps for each is a good habit.',
    },
  ],
  closed: [
    {
      id: 'closed-1', name: 'Share the milk', capacities: [8, 5, 3], start: [8, 0, 0], tap: false,
      goal: { amount: 4, count: 2 },
      insight: "With no tap the total is always 8. Drain the 5 through the 3 back into the 8, and only refill the 5 from the 8 once it's empty.",
    },
    {
      id: 'closed-2', name: 'Even split', capacities: [10, 7, 3], start: [10, 0, 0], tap: false,
      goal: { amount: 5, count: 2 },
      insight: "Same rule: keep draining the 7 through the 3 back into the 10, and refill the 7 only when it's empty. Following it walks you straight to two 5s.",
    },
    {
      id: 'closed-3', name: 'Dozen', capacities: [12, 7, 5], start: [12, 0, 0], tap: false,
      goal: { amount: 6, count: 2 },
      insight: "Same rule, longer: drain the 7 through the 5 back into the 12, refilling the 7 only when it's empty. The total stays 12, so two 6s leave the third jug empty.",
    },
    {
      id: 'closed-4', name: 'Pick one', capacities: [8, 5, 3], start: [8, 0, 0], tap: false,
      goal: { amount: 1, count: 1 },
      insight: 'Small goals can still be deep: 1 = 3 + 3 − 5. The quick route uses the 3-jug twice.',
    },
  ],
  trio: [
    {
      id: 'trio-2', name: 'Even steven', capacities: [4, 6, 10], start: [0, 0, 0], tap: true,
      goal: { amount: 2, count: 1 },
      insight: 'All capacities are even, so only even amounts are possible. 2 is the smallest — gcd(4, 6, 10).',
    },
    {
      id: 'trio-4', name: 'Fine tuning', capacities: [6, 9, 13], start: [0, 0, 0], tap: true,
      goal: { amount: 1, count: 1 },
      insight: '6 and 9 alone only make multiples of 3. The 13 breaks the pattern: 13 − 6 − 6 = 1.',
    },
    {
      id: 'trio-1', name: 'Triple threat', capacities: [3, 5, 8], start: [0, 0, 0], tap: true,
      goal: { amount: 7, count: 1 },
      insight: 'A third jug lets you add as well as subtract: 7 = 5 + (5 − 3).',
    },
    {
      id: 'trio-3', name: 'Twin targets', capacities: [3, 7, 10], start: [0, 0, 0], tap: true,
      goal: { amount: 5, count: 2 },
      insight: 'Two targets at once means planning where each portion ends up, not just how to make it.',
    },
  ],
};

export function isLegal(level: PourLevel, state: number[], move: Move): boolean {
  switch (move.type) {
    case 'fill':
      return level.tap && state[move.jug] < level.capacities[move.jug];
    case 'empty':
      return level.tap && state[move.jug] > 0;
    case 'pour':
      return move.from !== move.to && state[move.from] > 0 && state[move.to] < level.capacities[move.to];
  }
}

/** Returns the next state, or null if the move does nothing / isn't allowed. */
export function applyMove(level: PourLevel, state: number[], move: Move): number[] | null {
  if (!isLegal(level, state, move)) return null;
  const next = [...state];
  switch (move.type) {
    case 'fill':
      next[move.jug] = level.capacities[move.jug];
      break;
    case 'empty':
      next[move.jug] = 0;
      break;
    case 'pour': {
      const amount = Math.min(state[move.from], level.capacities[move.to] - state[move.to]);
      next[move.from] -= amount;
      next[move.to] += amount;
      break;
    }
  }
  return next;
}

export function isSolved(level: PourLevel, state: number[]): boolean {
  return state.filter(v => v === level.goal.amount).length >= level.goal.count;
}

export function allMoves(level: PourLevel): Move[] {
  const n = level.capacities.length;
  const moves: Move[] = [];
  for (let i = 0; i < n; i++) {
    if (level.tap) moves.push({ type: 'fill', jug: i }, { type: 'empty', jug: i });
    for (let j = 0; j < n; j++) if (i !== j) moves.push({ type: 'pour', from: i, to: j });
  }
  return moves;
}

/** Shortest move sequence from `from` to any solved state (BFS), or null if impossible. */
export function solve(level: PourLevel, from: number[] = level.start): Move[] | null {
  const key = (s: number[]) => s.join(',');
  if (isSolved(level, from)) return [];
  const moves = allMoves(level);
  const prev = new Map<string, { parent: string; move: Move } | null>([[key(from), null]]);
  const states = new Map<string, number[]>([[key(from), from]]);
  const queue: number[][] = [from];
  for (let head = 0; head < queue.length; head++) {
    const state = queue[head];
    for (const move of moves) {
      const next = applyMove(level, state, move);
      if (!next) continue;
      const k = key(next);
      if (prev.has(k)) continue;
      prev.set(k, { parent: key(state), move });
      states.set(k, next);
      if (isSolved(level, next)) {
        const path: Move[] = [];
        for (let cur = prev.get(k); cur; cur = prev.get(cur.parent)) path.unshift(cur.move);
        return path;
      }
      queue.push(next);
    }
  }
  return null;
}

/** Par = length of the optimal solution from the start. */
export function par(level: PourLevel): number {
  return solve(level)?.length ?? Infinity;
}

/** 3 stars at par, 2 within par + 3, else 1. Using a hint caps the result at 2. */
export function starsFor(moves: number, parMoves: number, usedHint: boolean): 1 | 2 | 3 {
  const raw = moves <= parMoves ? 3 : moves <= parMoves + 3 ? 2 : 1;
  return (usedHint ? Math.min(raw, 2) : raw) as 1 | 2 | 3;
}

export function describeMove(level: PourLevel, move: Move): string {
  const name = (i: number) => `the ${level.capacities[i]}`;
  switch (move.type) {
    case 'fill': return `Fill ${name(move.jug)}`;
    case 'empty': return `Empty ${name(move.jug)}`;
    case 'pour': return `Pour ${name(move.from)} into ${name(move.to)}`;
  }
}

export function goalText(level: PourLevel): string {
  const { amount, count } = level.goal;
  return count === 1
    ? `Get exactly ${amount} in any jug`
    : `Get exactly ${amount} in ${count} jugs`;
}
