export type CellState = 'hidden' | 'revealed' | 'flagged' | 'question';

export interface Cell {
  isMine: boolean;
  state: CellState;
  adjacentMines: number;
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

export function revealCell(board: Cell[][], row: number, col: number, difficulty: Difficulty): void {
  const { rows, cols } = difficulty;
  if (row < 0 || row >= rows || col < 0 || col >= cols) return;
  const cell = board[row][col];
  if (cell.state !== 'hidden') return;

  cell.state = 'revealed';

  if (cell.adjacentMines === 0 && !cell.isMine) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        revealCell(board, row + dr, col + dc, difficulty);
      }
    }
  }
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

export function getNumberColor(n: number): string {
  const colors = ['', '#2196F3', '#4CAF50', '#F44336', '#9C27B0', '#FF9800', '#00BCD4', '#333333', '#999999'];
  return colors[n] || '#333333';
}
