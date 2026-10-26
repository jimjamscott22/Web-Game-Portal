import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LEVELS,
  applyMove,
  isSolved,
  par,
  solve,
  starsFor,
  type PourLevel,
} from '../src/games/boardPourPuzzle/gameLogic.ts';

const classic: PourLevel = LEVELS.tap.find(l => l.id === 'tap-2')!;
const closed: PourLevel = LEVELS.closed.find(l => l.id === 'closed-1')!;

test('pour moves only as much as fits', () => {
  assert.deepEqual(applyMove(classic, [5, 1], { type: 'pour', from: 0, to: 1 }), [3, 3]);
  assert.deepEqual(applyMove(classic, [2, 0], { type: 'pour', from: 0, to: 1 }), [0, 2]);
});

test('no-op and disallowed moves return null', () => {
  assert.equal(applyMove(classic, [0, 0], { type: 'pour', from: 0, to: 1 }), null);
  assert.equal(applyMove(classic, [5, 0], { type: 'fill', jug: 0 }), null);
  assert.equal(applyMove(classic, [0, 0], { type: 'empty', jug: 1 }), null);
  assert.equal(applyMove(closed, [8, 0, 0], { type: 'empty', jug: 0 }), null);
  assert.equal(applyMove(closed, [3, 5, 0], { type: 'fill', jug: 2 }), null);
});

test('closed levels conserve water', () => {
  let state = closed.start;
  for (const move of solve(closed)!) {
    state = applyMove(closed, state, move)!;
    assert.equal(state.reduce((a, b) => a + b, 0), 8);
  }
  assert.ok(isSolved(closed, state));
});

test('the refill-only-when-empty rule from the insights solves the share levels', () => {
  // Jugs are [big, middle, small]. Pour small → big when small is full,
  // big → middle when middle is empty, otherwise middle → small.
  for (const id of ['closed-1', 'closed-2', 'closed-3']) {
    const level = LEVELS.closed.find(l => l.id === id)!;
    const small = level.capacities[2];
    let state = level.start;
    for (let step = 0; step < 50 && !isSolved(level, state); step++) {
      const move = state[2] === small
        ? { type: 'pour' as const, from: 2, to: 0 }
        : state[1] === 0
          ? { type: 'pour' as const, from: 0, to: 1 }
          : { type: 'pour' as const, from: 1, to: 2 };
      state = applyMove(level, state, move)!;
      assert.ok(state, `${id}: rule produced a no-op`);
    }
    assert.ok(isSolved(level, state), `${id}: rule should reach the goal`);
  }
});

test('goal count requires that many matching jugs', () => {
  assert.equal(isSolved(closed, [4, 1, 3]), false);
  assert.equal(isSolved(closed, [4, 4, 0]), true);
});

test('every level is solvable and its solution replays to a win', () => {
  for (const level of Object.values(LEVELS).flat()) {
    const path = solve(level);
    assert.ok(path && path.length > 0, `${level.id} should be solvable`);
    let state = level.start;
    for (const move of path) {
      const next = applyMove(level, state, move);
      assert.ok(next, `${level.id}: solver produced an illegal move`);
      state = next;
    }
    assert.ok(isSolved(level, state), `${level.id}: solution should end solved`);
  }
});

test('known pars match the textbook answers', () => {
  assert.equal(par(classic), 6);
  assert.equal(par(closed), 7);
});

test('solve reports impossible goals', () => {
  const evenOnly: PourLevel = { ...classic, capacities: [4, 6], goal: { amount: 3, count: 1 } };
  assert.equal(solve(evenOnly), null);
});

test('stars reward hitting par and cap hinted runs', () => {
  assert.equal(starsFor(6, 6, false), 3);
  assert.equal(starsFor(9, 6, false), 2);
  assert.equal(starsFor(10, 6, false), 1);
  assert.equal(starsFor(6, 6, true), 2);
});

test('level ids are unique', () => {
  const ids = Object.values(LEVELS).flat().map(l => l.id);
  assert.equal(new Set(ids).size, ids.length);
});
