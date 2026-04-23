export type Bit = 0 | 1;
export type Cell = Bit | null;
export type Grid = Cell[][];

export interface BinairoCell {
  value: Cell;
  isGiven: boolean;
}

export type DifficultyName = 'Easy' | 'Medium' | 'Hard';

export const DIFFICULTY_SIZE: Record<DifficultyName, number> = {
  Easy: 6,
  Medium: 8,
  Hard: 10,
};

const DIFFICULTY_CLUE_RATIO: Record<DifficultyName, number> = {
  Easy: 0.58,
  Medium: 0.5,
  Hard: 0.44,
};

function canPlace(grid: Grid, r: number, c: number, v: Bit): boolean {
  const N = grid.length;
  const half = N / 2;
  let cntR = 0;
  let cntC = 0;
  for (let i = 0; i < N; i++) {
    if (grid[r][i] === v) cntR++;
    if (grid[i][c] === v) cntC++;
  }
  if (cntR + 1 > half) return false;
  if (cntC + 1 > half) return false;

  grid[r][c] = v;
  try {
    for (let i = Math.max(0, c - 2); i <= Math.min(N - 3, c); i++) {
      if (grid[r][i] === v && grid[r][i + 1] === v && grid[r][i + 2] === v) return false;
    }
    for (let i = Math.max(0, r - 2); i <= Math.min(N - 3, r); i++) {
      if (grid[i][c] === v && grid[i + 1][c] === v && grid[i + 2][c] === v) return false;
    }
  } finally {
    grid[r][c] = null;
  }
  return true;
}

function findEmpty(grid: Grid): [number, number] | null {
  const N = grid.length;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (grid[r][c] === null) return [r, c];
    }
  }
  return null;
}

function rowComplete(grid: Grid, r: number): boolean {
  for (const v of grid[r]) if (v === null) return false;
  return true;
}

function colComplete(grid: Grid, c: number): boolean {
  const N = grid.length;
  for (let r = 0; r < N; r++) if (grid[r][c] === null) return false;
  return true;
}

function rowsIdentical(grid: Grid, r1: number, r2: number): boolean {
  const N = grid.length;
  for (let c = 0; c < N; c++) if (grid[r1][c] !== grid[r2][c]) return false;
  return true;
}

function colsIdentical(grid: Grid, c1: number, c2: number): boolean {
  const N = grid.length;
  for (let r = 0; r < N; r++) if (grid[r][c1] !== grid[r][c2]) return false;
  return true;
}

function duplicatePresent(grid: Grid, r: number, c: number): boolean {
  const N = grid.length;
  if (rowComplete(grid, r)) {
    for (let r2 = 0; r2 < N; r2++) {
      if (r2 !== r && rowComplete(grid, r2) && rowsIdentical(grid, r, r2)) return true;
    }
  }
  if (colComplete(grid, c)) {
    for (let c2 = 0; c2 < N; c2++) {
      if (c2 !== c && colComplete(grid, c2) && colsIdentical(grid, c, c2)) return true;
    }
  }
  return false;
}

function solveCount(grid: Grid, limit: number, randomize: boolean): number {
  const empty = findEmpty(grid);
  if (!empty) return 1;
  const [r, c] = empty;
  const order: Bit[] = randomize && Math.random() < 0.5 ? [1, 0] : [0, 1];
  let count = 0;
  for (const v of order) {
    if (!canPlace(grid, r, c, v)) continue;
    grid[r][c] = v;
    if (!duplicatePresent(grid, r, c)) {
      count += solveCount(grid, limit - count, randomize);
      if (count >= limit) {
        grid[r][c] = null;
        return count;
      }
    }
    grid[r][c] = null;
  }
  return count;
}

function emptyGrid(N: number): Grid {
  return Array.from({ length: N }, () => Array<Cell>(N).fill(null));
}

function fillRandom(grid: Grid): boolean {
  const empty = findEmpty(grid);
  if (!empty) return true;
  const [r, c] = empty;
  const order: Bit[] = Math.random() < 0.5 ? [0, 1] : [1, 0];
  for (const v of order) {
    if (!canPlace(grid, r, c, v)) continue;
    grid[r][c] = v;
    if (!duplicatePresent(grid, r, c)) {
      if (fillRandom(grid)) return true;
    }
    grid[r][c] = null;
  }
  return false;
}

export function generatePuzzle(difficulty: DifficultyName): BinairoCell[][] {
  const N = DIFFICULTY_SIZE[difficulty];
  const solved = emptyGrid(N);
  fillRandom(solved);

  const puzzle: Grid = solved.map(row => row.slice());

  const positions: [number, number][] = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) positions.push([r, c]);
  }
  positions.sort(() => Math.random() - 0.5);

  const targetClues = Math.round(DIFFICULTY_CLUE_RATIO[difficulty] * N * N);
  const toRemove = N * N - targetClues;

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= toRemove) break;
    const saved = puzzle[r][c];
    puzzle[r][c] = null;
    const test: Grid = puzzle.map(row => row.slice());
    if (solveCount(test, 2, false) !== 1) {
      puzzle[r][c] = saved;
    } else {
      removed++;
    }
  }

  return puzzle.map(row =>
    row.map(val => ({ value: val, isGiven: val !== null }))
  );
}

export function getConflicts(board: BinairoCell[][]): Set<string> {
  const N = board.length;
  const half = N / 2;
  const conflicts = new Set<string>();

  for (let r = 0; r < N; r++) {
    for (let c = 0; c <= N - 3; c++) {
      const a = board[r][c].value;
      const b = board[r][c + 1].value;
      const d = board[r][c + 2].value;
      if (a !== null && a === b && b === d) {
        conflicts.add(`${r},${c}`);
        conflicts.add(`${r},${c + 1}`);
        conflicts.add(`${r},${c + 2}`);
      }
    }
  }
  for (let c = 0; c < N; c++) {
    for (let r = 0; r <= N - 3; r++) {
      const a = board[r][c].value;
      const b = board[r + 1][c].value;
      const d = board[r + 2][c].value;
      if (a !== null && a === b && b === d) {
        conflicts.add(`${r},${c}`);
        conflicts.add(`${r + 1},${c}`);
        conflicts.add(`${r + 2},${c}`);
      }
    }
  }

  for (let r = 0; r < N; r++) {
    let zeros = 0;
    let ones = 0;
    for (let c = 0; c < N; c++) {
      if (board[r][c].value === 0) zeros++;
      else if (board[r][c].value === 1) ones++;
    }
    if (zeros > half || ones > half) {
      const bad: Bit = zeros > half ? 0 : 1;
      for (let c = 0; c < N; c++) {
        if (board[r][c].value === bad) conflicts.add(`${r},${c}`);
      }
    }
  }
  for (let c = 0; c < N; c++) {
    let zeros = 0;
    let ones = 0;
    for (let r = 0; r < N; r++) {
      if (board[r][c].value === 0) zeros++;
      else if (board[r][c].value === 1) ones++;
    }
    if (zeros > half || ones > half) {
      const bad: Bit = zeros > half ? 0 : 1;
      for (let r = 0; r < N; r++) {
        if (board[r][c].value === bad) conflicts.add(`${r},${c}`);
      }
    }
  }

  const isRowFull = (r: number) => board[r].every(x => x.value !== null);
  const isColFull = (c: number) => {
    for (let r = 0; r < N; r++) if (board[r][c].value === null) return false;
    return true;
  };

  for (let r1 = 0; r1 < N; r1++) {
    if (!isRowFull(r1)) continue;
    for (let r2 = r1 + 1; r2 < N; r2++) {
      if (!isRowFull(r2)) continue;
      let same = true;
      for (let c = 0; c < N; c++) {
        if (board[r1][c].value !== board[r2][c].value) { same = false; break; }
      }
      if (same) {
        for (let c = 0; c < N; c++) {
          conflicts.add(`${r1},${c}`);
          conflicts.add(`${r2},${c}`);
        }
      }
    }
  }
  for (let c1 = 0; c1 < N; c1++) {
    if (!isColFull(c1)) continue;
    for (let c2 = c1 + 1; c2 < N; c2++) {
      if (!isColFull(c2)) continue;
      let same = true;
      for (let r = 0; r < N; r++) {
        if (board[r][c1].value !== board[r][c2].value) { same = false; break; }
      }
      if (same) {
        for (let r = 0; r < N; r++) {
          conflicts.add(`${r},${c1}`);
          conflicts.add(`${r},${c2}`);
        }
      }
    }
  }

  return conflicts;
}

export function isComplete(board: BinairoCell[][]): boolean {
  const N = board.length;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (board[r][c].value === null) return false;
    }
  }
  return getConflicts(board).size === 0;
}

export function rowDecimal(board: BinairoCell[][], r: number): number | null {
  const N = board.length;
  let out = 0;
  for (let c = 0; c < N; c++) {
    const v = board[r][c].value;
    if (v === null) return null;
    out = out * 2 + v;
  }
  return out;
}

export function colDecimal(board: BinairoCell[][], c: number): number | null {
  const N = board.length;
  let out = 0;
  for (let r = 0; r < N; r++) {
    const v = board[r][c].value;
    if (v === null) return null;
    out = out * 2 + v;
  }
  return out;
}
