import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ROBOROUTE_LEVELS,
  countBlocks,
  executeProgram,
  starsForProgram,
  type ProgramCommand,
  type RoboLevel,
} from '../src/games/boardRoboRoute/gameLogic.ts';

function level(overrides: Partial<RoboLevel> = {}): RoboLevel {
  return {
    id: 99,
    title: 'Test route',
    tier: 'Sequences',
    columns: 5,
    rows: 5,
    start: { position: { x: 0, y: 2 }, facing: 'east' },
    walls: [],
    batteries: [{ x: 2, y: 2 }],
    goal: { x: 3, y: 2 },
    objective: 'Collect the battery, then reach the beacon.',
    allowedCommands: ['move', 'turnLeft', 'turnRight'],
    par: 3,
    ...overrides,
  };
}

const move = (id: string): ProgramCommand => ({ id, kind: 'move' });
const turnLeft = (id: string): ProgramCommand => ({ id, kind: 'turnLeft' });
const turnRight = (id: string): ProgramCommand => ({ id, kind: 'turnRight' });

test('moves forward, collects batteries, and solves at the beacon', () => {
  const result = executeProgram(level(), [move('a'), move('b'), move('c')]);

  assert.equal(result.status, 'solved');
  assert.deepEqual(result.finalState.position, { x: 3, y: 2 });
  assert.deepEqual(result.finalState.collectedBatteries, ['2,2']);
  assert.equal(result.operations, 3);
});

test('turns change the direction used by later moves', () => {
  const result = executeProgram(
    level({ batteries: [], goal: { x: 1, y: 1 } }),
    [move('a'), turnLeft('b'), move('c')],
  );

  assert.equal(result.status, 'solved');
  assert.deepEqual(result.finalState.position, { x: 1, y: 1 });
  assert.equal(result.finalState.facing, 'north');
});

test('repeat executes its body the requested number of times', () => {
  const program: ProgramCommand[] = [
    { id: 'loop', kind: 'repeat', times: 3, body: [move('inside')] },
  ];
  const result = executeProgram(level({ batteries: [], goal: { x: 3, y: 2 } }), program);

  assert.equal(result.status, 'solved');
  assert.equal(result.operations, 3);
  assert.ok(result.trace.every(frame => frame.activeIds.includes('loop')));
});

test('whileGoal re-evaluates after every body execution', () => {
  const program: ProgramCommand[] = [
    { id: 'while', kind: 'whileGoal', body: [move('inside')] },
  ];
  const result = executeProgram(level({ batteries: [], goal: { x: 4, y: 2 } }), program);

  assert.equal(result.status, 'solved');
  assert.equal(result.operations, 4);
});

test('ifClear chooses its else branch when a wall is ahead', () => {
  const program: ProgramCommand[] = [
    {
      id: 'condition',
      kind: 'ifClear',
      thenBody: [move('then-move')],
      elseBody: [turnLeft('else-turn')],
    },
    move('finish'),
  ];
  const result = executeProgram(
    level({
      start: { position: { x: 1, y: 2 }, facing: 'east' },
      walls: [{ x: 2, y: 2 }],
      batteries: [],
      goal: { x: 1, y: 1 },
    }),
    program,
  );

  assert.equal(result.status, 'solved');
  assert.ok(result.trace.some(frame => frame.event === 'condition' && frame.message.includes('blocked')));
  assert.ok(result.trace.some(frame => frame.activeIds.includes('else-turn')));
  assert.ok(result.trace.every(frame => !frame.activeIds.includes('then-move')));
});

test('moving into a wall stops with collision feedback', () => {
  const result = executeProgram(
    level({ walls: [{ x: 1, y: 2 }], batteries: [], goal: { x: 4, y: 2 } }),
    [move('crash')],
  );

  assert.equal(result.status, 'collision');
  assert.equal(result.operations, 1);
  assert.match(result.message, /blocked/i);
  assert.deepEqual(result.finalState.position, { x: 0, y: 2 });
});

test('a non-progressing loop stops at the operation limit', () => {
  const program: ProgramCommand[] = [
    { id: 'while', kind: 'whileGoal', body: [turnLeft('spin')] },
  ];
  const result = executeProgram(level({ batteries: [], goal: { x: 4, y: 4 } }), program, 8);

  assert.equal(result.status, 'limit');
  assert.equal(result.operations, 8);
  assert.match(result.message, /operation limit/i);
});

test('counts nested blocks and awards stars against par', () => {
  const program: ProgramCommand[] = [
    {
      id: 'while',
      kind: 'whileGoal',
      body: [
        {
          id: 'condition',
          kind: 'ifClear',
          thenBody: [move('move')],
          elseBody: [turnRight('turn')],
        },
      ],
    },
  ];

  assert.equal(countBlocks(program), 4);
  assert.equal(starsForProgram(4, 4), 3);
  assert.equal(starsForProgram(6, 4), 2);
  assert.equal(starsForProgram(7, 4), 1);
});

test('ships twelve levels in a four-four-four learning progression', () => {
  assert.equal(ROBOROUTE_LEVELS.length, 12);
  assert.deepEqual(
    ROBOROUTE_LEVELS.map(item => item.tier),
    [
      'Sequences', 'Sequences', 'Sequences', 'Sequences',
      'Loops', 'Loops', 'Loops', 'Loops',
      'Logic', 'Logic', 'Logic', 'Logic',
    ],
  );
});

test('representative sequence, loop, and logic levels have known solutions', () => {
  const sequence = executeProgram(ROBOROUTE_LEVELS[0], [move('1'), move('2'), move('3')]);
  const loop = executeProgram(ROBOROUTE_LEVELS[4], [
    { id: 'repeat', kind: 'repeat', times: 4, body: [move('move')] },
  ]);
  const logic = executeProgram(ROBOROUTE_LEVELS[8], [
    {
      id: 'while',
      kind: 'whileGoal',
      body: [
        {
          id: 'if',
          kind: 'ifClear',
          thenBody: [move('move')],
          elseBody: [turnLeft('turn')],
        },
      ],
    },
  ]);

  assert.equal(sequence.status, 'solved');
  assert.equal(loop.status, 'solved');
  assert.equal(logic.status, 'solved');
});
