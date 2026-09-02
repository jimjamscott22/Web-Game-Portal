export type Difficulty = '5x5' | '10x10' | '15x15';

export const CellState = {
  Empty: 0,
  Filled: 1,
  Marked: 2,
} as const;
export type CellState = typeof CellState[keyof typeof CellState];

export type TargetGrid = boolean[][];
export type PlayerGrid = CellState[][];

export interface Clues {
  rows: number[][];
  cols: number[][];
}

export const NONOGRAM_CONFIG: Record<Difficulty, { size: number }> = {
  '5x5': { size: 5 },
  '10x10': { size: 10 },
  '15x15': { size: 15 },
};

export function createPlayerGrid(size: number): PlayerGrid {
  return Array.from({ length: size }, () => Array(size).fill(CellState.Empty));
}

export function generatePuzzle(difficulty: Difficulty): { target: TargetGrid; clues: Clues } {
  const { size } = NONOGRAM_CONFIG[difficulty];
  const target: TargetGrid = Array.from({ length: size }, () => Array(size).fill(false));
  
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (Math.random() > 0.45) {
        target[r][c] = true;
      }
    }
  }

  for (let i = 0; i < size; i++) {
    if (target[i].every(val => !val)) target[i][Math.floor(Math.random() * size)] = true;
    if (target.every(row => !row[i])) target[Math.floor(Math.random() * size)][i] = true;
  }

  const clues = calculateClues(target);
  return { target, clues };
}

export function calculateClues(target: TargetGrid): Clues {
  const size = target.length;
  const rows: number[][] = [];
  const cols: number[][] = [];

  for (let r = 0; r < size; r++) {
    const rowClue: number[] = [];
    let currentRun = 0;
    for (let c = 0; c < size; c++) {
      if (target[r][c]) {
        currentRun++;
      } else if (currentRun > 0) {
        rowClue.push(currentRun);
        currentRun = 0;
      }
    }
    if (currentRun > 0) rowClue.push(currentRun);
    if (rowClue.length === 0) rowClue.push(0);
    rows.push(rowClue);
  }

  for (let c = 0; c < size; c++) {
    const colClue: number[] = [];
    let currentRun = 0;
    for (let r = 0; r < size; r++) {
      if (target[r][c]) {
        currentRun++;
      } else if (currentRun > 0) {
        colClue.push(currentRun);
        currentRun = 0;
      }
    }
    if (currentRun > 0) colClue.push(currentRun);
    if (colClue.length === 0) colClue.push(0);
    cols.push(colClue);
  }

  return { rows, cols };
}

export function isSolved(player: PlayerGrid, target: TargetGrid): boolean {
  for (let r = 0; r < target.length; r++) {
    for (let c = 0; c < target.length; c++) {
      const isTargetFilled = target[r][c];
      const isPlayerFilled = player[r][c] === CellState.Filled;
      if (isTargetFilled !== isPlayerFilled) {
        return false;
      }
    }
  }
  return true;
}

export function toggleCell(player: PlayerGrid, r: number, c: number, type: 'fill' | 'mark'): PlayerGrid {
  const next = player.map(row => [...row]);
  const current = next[r][c];
  
  if (type === 'fill') {
    next[r][c] = current === CellState.Filled ? CellState.Empty : CellState.Filled;
  } else if (type === 'mark') {
    next[r][c] = current === CellState.Marked ? CellState.Empty : CellState.Marked;
  }
  return next;
}
