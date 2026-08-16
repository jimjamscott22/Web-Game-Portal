export const COLS = 10;
export const ROWS = 20;

export interface Piece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
}

/**
 * `color` is a skin token *name*, not a literal — the seven pieces map onto
 * seven ramp steps (accent 300/500/700, accent-2 300/500/700, neutral 600)
 * and the board resolves them at draw time so pieces follow the active skin.
 */
export const TETROMINOES: { shape: number[][]; color: string }[] = [
  { shape: [[1, 1, 1, 1]], color: '--t-p1' },
  { shape: [[1, 1], [1, 1]], color: '--t-p2' },
  { shape: [[0, 1, 0], [1, 1, 1]], color: '--t-p3' },
  { shape: [[0, 1, 1], [1, 1, 0]], color: '--t-p4' },
  { shape: [[1, 1, 0], [0, 1, 1]], color: '--t-p5' },
  { shape: [[1, 0, 0], [1, 1, 1]], color: '--t-p6' },
  { shape: [[0, 0, 1], [1, 1, 1]], color: '--t-p7' },
];

export function randomPiece(): Piece {
  const t = TETROMINOES[Math.floor(Math.random() * TETROMINOES.length)];
  return {
    shape: t.shape.map(row => [...row]),
    color: t.color,
    x: Math.floor(COLS / 2) - Math.floor(t.shape[0].length / 2),
    y: 0,
  };
}

export function rotatePiece(piece: Piece): Piece {
  const rows = piece.shape.length;
  const cols = piece.shape[0].length;
  const rotated: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = piece.shape[r][c];
    }
  }
  return { ...piece, shape: rotated };
}

export function isValidPosition(board: (string | null)[][], piece: Piece, offsetX = 0, offsetY = 0): boolean {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const nr = piece.y + r + offsetY;
        const nc = piece.x + c + offsetX;
        if (nc < 0 || nc >= COLS || nr >= ROWS) return false;
        if (nr >= 0 && board[nr][nc]) return false;
      }
    }
  }
  return true;
}

export function lockPiece(board: (string | null)[][], piece: Piece): (string | null)[][] {
  const newBoard = board.map(row => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        const nr = piece.y + r;
        const nc = piece.x + c;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          newBoard[nr][nc] = piece.color;
        }
      }
    }
  }
  return newBoard;
}

export function clearLines(board: (string | null)[][]): {
  newBoard: (string | null)[][];
  linesCleared: number;
} {
  const newBoard = board.filter(row => row.some(cell => cell === null));
  const linesCleared = ROWS - newBoard.length;
  while (newBoard.length < ROWS) {
    newBoard.unshift(Array(COLS).fill(null));
  }
  return { newBoard, linesCleared };
}

export function getDropSpeed(level: number): number {
  return Math.max(50, 800 - level * 80);
}

export function calculateScore(lines: number): number {
  const scores = [0, 100, 300, 500, 800];
  return scores[lines] || 0;
}
