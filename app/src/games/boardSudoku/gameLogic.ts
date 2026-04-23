export interface SudokuCell {
  value: number | null;
  isGiven: boolean;
  notes: Set<number>;
}

export type DifficultyName = 'Easy' | 'Medium' | 'Hard';

export const DIFFICULTY_CELLS: Record<DifficultyName, number> = {
  Easy: 40,
  Medium: 30,
  Hard: 22,
};

function isValid(board: (number | null)[][], row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) if (c !== col && board[row][c] === num) return false;
  for (let r = 0; r < 9; r++) if (r !== row && board[r][col] === num) return false;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === num) return false;
    }
  }
  return true;
}

function solve(board: (number | null)[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function generatePuzzle(difficulty: DifficultyName): SudokuCell[][] {
  const board: (number | null)[][] = Array.from({ length: 9 }, () => Array(9).fill(null));
  solve(board);

  const cellsToRemove = 81 - DIFFICULTY_CELLS[difficulty];
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) positions.push([r, c]);
  }
  positions.sort(() => Math.random() - 0.5);

  let removed = 0;
  for (const [r, c] of positions) {
    if (removed >= cellsToRemove) break;
    board[r][c] = null;
    removed++;
  }

  return board.map(row =>
    row.map(val => ({
      value: val,
      isGiven: val !== null,
      notes: new Set<number>(),
    }))
  );
}

export function isValidPlacement(board: SudokuCell[][], row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) if (c !== col && board[row][c].value === num) return false;
  for (let r = 0; r < 9; r++) if (r !== row && board[r][col].value === num) return false;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c].value === num) return false;
    }
  }
  return true;
}

export function isComplete(board: SudokuCell[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c].value === null) return false;
      if (!isValidPlacement(board, r, c, board[r][c].value!)) return false;
    }
  }
  return true;
}

export function getConflicts(board: SudokuCell[][]): Set<string> {
  const conflicts = new Set<string>();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c].value;
      if (val === null) continue;
      if (!isValidPlacement(board, r, c, val)) {
        conflicts.add(`${r},${c}`);
      }
    }
  }
  return conflicts;
}
