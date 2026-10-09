export type CellState = 'hidden' | 'revealed' | 'flagged' | 'question';

export interface Cell {
  isMine: boolean;
  state: CellState;
  adjacentMines: number;
  /** Stagger step for the reveal animation (BFS / ring distance). */
  revealDelay?: number;
}

export interface Difficulty {
  name: string;
  rows: number;
  cols: number;
  mines: number;
}

export const DIFFICULTIES: Difficulty[] = [
  { name: 'Beginner', rows: 9, cols: 9, mines: 10 },
  { name: 'Intermediate', rows: 16, cols: 16, mines: 40 },
  { name: 'Expert', rows: 16, cols: 30, mines: 99 },
];

export function createBoard(difficulty: Difficulty): Cell[][] {
  const { rows, cols } = difficulty;
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      state: 'hidden' as CellState,
      adjacentMines: 0,
    }))
  );
}

export function placeMines(board: Cell[][], difficulty: Difficulty, excludeRow: number, excludeCol: number): void {
  const { rows, cols, mines } = difficulty;
  let placed = 0;

  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    if (board[r][c].isMine) continue;
    if (r === excludeRow && c === excludeCol) continue;
    if (Math.abs(r - excludeRow) <= 1 && Math.abs(c - excludeCol) <= 1) continue;

    board[r][c].isMine = true;
    placed++;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
            count++;
          }
        }
      }
      board[r][c].adjacentMines = count;
    }
  }
}

/**
 * Flood-reveal from (row, col) breadth-first. Each newly revealed cell gets
 * `revealDelay` = its BFS distance from the click, so the board can stagger
 * the cascade outward. Returns the number of cells revealed.
 */
export function revealCell(board: Cell[][], row: number, col: number, difficulty: Difficulty): number {
  const { rows, cols } = difficulty;
  if (row < 0 || row >= rows || col < 0 || col >= cols) return 0;
  if (board[row][col].state !== 'hidden') return 0;

  const queue: [number, number, number][] = [[row, col, 0]];
  board[row][col].state = 'revealed';
  board[row][col].revealDelay = 0;
  let revealed = 1;

  for (let head = 0; head < queue.length; head++) {
    const [r, c, dist] = queue[head];
    const cell = board[r][c];
    if (cell.isMine || cell.adjacentMines !== 0) continue;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const next = board[nr][nc];
        if (next.state !== 'hidden') continue;
        next.state = 'revealed';
        next.revealDelay = dist + 1;
        revealed++;
        queue.push([nr, nc, dist + 1]);
      }
    }
  }
  return revealed;
}

/**
 * Reveal every mine after a loss. `revealDelay` is the Chebyshev distance
 * from the mine that was hit, so detonations ripple out from it. Returns the
 * largest delay assigned.
 */
export function revealMines(board: Cell[][], row: number, col: number): number {
  let maxDelay = 0;
  board.forEach((line, r) => line.forEach((cell, c) => {
    if (!cell.isMine) return;
    cell.state = 'revealed';
    cell.revealDelay = Math.max(Math.abs(r - row), Math.abs(c - col));
    maxDelay = Math.max(maxDelay, cell.revealDelay);
  }));
  return maxDelay;
}

export function countFlags(board: Cell[][]): number {
  return board.reduce((n, line) => n + line.filter(cell => cell.state === 'flagged').length, 0);
}

export function checkWin(board: Cell[][], difficulty: Difficulty): boolean {
  const { rows, cols } = difficulty;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (!cell.isMine && cell.state !== 'revealed') return false;
    }
  }
  return true;
}

// Clue colours are ramp steps of the skin rather than the seven classic
// primaries — see `--t-num*` in src/index.css.
export function getNumberColor(n: number): string {
  return n >= 1 && n <= 8 ? `var(--t-num${n})` : 'var(--t-muted)';
}
