export interface Tile {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

let nextId = 1;
function genId() { return `tile-${nextId++}`; }

export function createBoard(): (Tile | null)[][] {
  const board: (Tile | null)[][] = Array.from({ length: 4 }, () => Array(4).fill(null));
  addRandomTile(board);
  addRandomTile(board);
  return board;
}

export function resetIdCounter() { nextId = 1; }

function getEmptyCells(board: (Tile | null)[][]): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!board[r][c]) cells.push([r, c]);
    }
  }
  return cells;
}

export function addRandomTile(board: (Tile | null)[][]): boolean {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return false;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  board[r][c] = { id: genId(), value: Math.random() < 0.9 ? 2 : 4, row: r, col: c, isNew: true };
  return true;
}

function cloneBoard(board: (Tile | null)[][]): (Tile | null)[][] {
  return board.map(row => row.map(tile => tile ? { ...tile } : null));
}

function slideLine(line: (Tile | null)[], scoreRef: { value: number }): (Tile | null)[] {
  const filtered = line.filter((t): t is Tile => t !== null);
  const result: (Tile | null)[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i].value === filtered[i + 1].value) {
      const merged: Tile = {
        id: genId(),
        value: filtered[i].value * 2,
        row: 0, col: 0, isMerged: true,
      };
      scoreRef.value += merged.value;
      result.push(merged);
      i += 2;
    } else {
      result.push({ ...filtered[i] });
      i++;
    }
  }
  while (result.length < 4) result.push(null);
  return result;
}

export function move(board: (Tile | null)[][], direction: Direction): {
  newBoard: (Tile | null)[][];
  scoreDelta: number;
  moved: boolean;
} {
  const newBoard = cloneBoard(board);
  const scoreRef = { value: 0 };
  let moved = false;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (newBoard[r][c]) {
        delete newBoard[r][c]!.isNew;
        delete newBoard[r][c]!.isMerged;
      }
    }
  }

  if (direction === 'left' || direction === 'right') {
    for (let r = 0; r < 4; r++) {
      let line = newBoard[r].slice();
      if (direction === 'right') line = line.reverse();
      const slid = slideLine(line, scoreRef);
      if (direction === 'right') slid.reverse();
      for (let c = 0; c < 4; c++) {
        if (newBoard[r][c]?.id !== slid[c]?.id || newBoard[r][c]?.value !== slid[c]?.value) moved = true;
        newBoard[r][c] = slid[c];
        if (newBoard[r][c]) { newBoard[r][c]!.row = r; newBoard[r][c]!.col = c; }
      }
    }
  } else {
    for (let c = 0; c < 4; c++) {
      let line: (Tile | null)[] = [];
      for (let r = 0; r < 4; r++) line.push(newBoard[r][c]);
      if (direction === 'down') line = line.reverse();
      const slid = slideLine(line, scoreRef);
      if (direction === 'down') slid.reverse();
      for (let r = 0; r < 4; r++) {
        if (newBoard[r][c]?.id !== slid[r]?.id || newBoard[r][c]?.value !== slid[r]?.value) moved = true;
        newBoard[r][c] = slid[r];
        if (newBoard[r][c]) { newBoard[r][c]!.row = r; newBoard[r][c]!.col = c; }
      }
    }
  }

  return { newBoard, scoreDelta: scoreRef.value, moved };
}

export function hasMoves(board: (Tile | null)[][]): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const tile = board[r][c];
      if (!tile) return true;
      if (c < 3 && tile.value === board[r][c + 1]?.value) return true;
      if (r < 3 && tile.value === board[r + 1][c]?.value) return true;
    }
  }
  return false;
}

export function hasWon(board: (Tile | null)[][]): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c]?.value === 2048) return true;
    }
  }
  return false;
}

// The Organic tile ladder. Every step is a skin token so the board re-themes
// with the rest of the portal — see `--t-t*` in src/index.css.
export const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: 'var(--t-t2)', text: 'var(--t-t2f)' },
  4: { bg: 'var(--t-t4)', text: 'var(--t-t4f)' },
  8: { bg: 'var(--t-t8)', text: 'var(--t-t8f)' },
  16: { bg: 'var(--t-t16)', text: 'var(--t-t16f)' },
  32: { bg: 'var(--t-t32)', text: 'var(--t-t32f)' },
  64: { bg: 'var(--t-t64)', text: 'var(--t-t64f)' },
  128: { bg: 'var(--t-t128)', text: 'var(--t-t128f)' },
  256: { bg: 'var(--t-t256)', text: 'var(--t-t256f)' },
  512: { bg: 'var(--t-t512)', text: 'var(--t-t512f)' },
  1024: { bg: 'var(--t-t1024)', text: 'var(--t-t1024f)' },
  2048: { bg: 'var(--t-t2048)', text: 'var(--t-t2048f)' },
};

export function getTileColor(value: number): { bg: string; text: string } {
  return TILE_COLORS[value] || { bg: 'var(--t-t2048)', text: 'var(--t-t2048f)' };
}

export function getTileFontSize(value: number): string {
  if (value <= 4) return '28px';
  if (value <= 64) return '24px';
  return '20px';
}
