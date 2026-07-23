import assert from 'node:assert/strict';
import test from 'node:test';
import { hasMoves, type Tile } from '../src/games/board2048/gameLogic.ts';

function boardFromValues(values: (number | null)[][]): (Tile | null)[][] {
  return values.map((row, rowIndex) =>
    row.map((value, colIndex) =>
      value === null
        ? null
        : {
            id: `tile-${rowIndex}-${colIndex}`,
            value,
            row: rowIndex,
            col: colIndex,
          },
    ),
  );
}

test('a sparse board still has moves', () => {
  const board = boardFromValues([
    [2, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ]);

  assert.equal(hasMoves(board), true);
});

test('a full board without matching neighbors has no moves', () => {
  const board = boardFromValues([
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ]);

  assert.equal(hasMoves(board), false);
});

test('a full board with matching neighbors still has moves', () => {
  const board = boardFromValues([
    [2, 2, 4, 8],
    [4, 8, 16, 32],
    [8, 16, 32, 64],
    [16, 32, 64, 128],
  ]);

  assert.equal(hasMoves(board), true);
});
