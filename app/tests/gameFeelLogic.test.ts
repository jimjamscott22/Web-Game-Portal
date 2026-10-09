import assert from 'node:assert/strict';
import test from 'node:test';
import {
  dropDistance,
  ghostPiece,
  isValidPosition,
  type Piece,
} from '../src/games/boardTetris/gameLogic.ts';
import {
  revealCell,
  revealMines,
  countFlags,
  createBoard,
  type Cell,
  DIFFICULTIES,
} from '../src/games/boardMinesweeper/gameLogic.ts';
import { interpolateSnake } from '../src/games/boardSnake/gameLogic.ts';

function emptyTetrisBoard(rows = 20, cols = 10): (string | null)[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

function pieceAt(x: number, y: number): Piece {
  return {
    shape: [[1, 1], [1, 1]],
    color: '--t-p2',
    x,
    y,
  };
}

test('dropDistance counts empty cells below until collision', () => {
  const board = emptyTetrisBoard();
  board[6][4] = '--t-p1';
  board[6][5] = '--t-p1';
  const p = pieceAt(4, 2);
  assert.equal(dropDistance(board, p), 2);
  assert.equal(isValidPosition(board, p, 0, 2), true);
  assert.equal(isValidPosition(board, p, 0, 3), false);
});

test('ghostPiece lands on the floor of the well', () => {
  const board = emptyTetrisBoard();
  const p = pieceAt(4, 0);
  const ghost = ghostPiece(board, p);
  assert.equal(ghost.y, p.y + dropDistance(board, p));
  assert.equal(ghost.x, p.x);
});

test('revealCell BFS assigns increasing revealDelay for the cascade', () => {
  const difficulty = { name: 'Tiny', rows: 3, cols: 3, mines: 0 };
  const board = createBoard(difficulty);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      board[r][c].adjacentMines = 0;
    }
  }

  revealCell(board, 1, 1, difficulty);
  assert.equal(board[1][1].revealDelay, 0);
  assert.equal(board[0][1].revealDelay, 1);
  assert.equal(board[2][1].revealDelay, 1);
  assert.equal(board[1][0].revealDelay, 1);
  assert.equal(board[1][2].revealDelay, 1);
  assert.equal(board[0][0].revealDelay, 1);
});

test('revealMines uses Chebyshev distance from the hit cell', () => {
  const board = createBoard(DIFFICULTIES[0]);
  board[2][2].isMine = true;
  board[0][0].isMine = true;
  board[4][4].isMine = true;

  const maxDelay = revealMines(board, 2, 2);
  assert.equal(board[2][2].revealDelay, 0);
  assert.equal(board[0][0].revealDelay, 2);
  assert.equal(board[4][4].revealDelay, 2);
  assert.equal(maxDelay, 2);
});

test('countFlags tallies only flagged cells', () => {
  const board = createBoard(DIFFICULTIES[0]);
  board[0][0].state = 'flagged';
  board[0][1].state = 'flagged';
  board[1][0].state = 'revealed';
  assert.equal(countFlags(board), 2);
});

test('interpolateSnake blends segment positions and keeps new tail still', () => {
  const prev = [{ x: 0, y: 0 }, { x: 1, y: 0 }];
  const current = [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }];
  const mid = interpolateSnake(prev, current, 0.5);
  assert.deepEqual(mid[0], { x: 0.5, y: 0 });
  assert.deepEqual(mid[1], { x: 1.5, y: 0 });
  assert.deepEqual(mid[2], { x: 2, y: 1 });
});
