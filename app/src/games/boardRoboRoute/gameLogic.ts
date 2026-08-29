export type Direction = 'north' | 'east' | 'south' | 'west';
export type RoboTier = 'Sequences' | 'Loops' | 'Logic';
export type CommandKind =
  | 'move'
  | 'turnLeft'
  | 'turnRight'
  | 'repeat'
  | 'whileGoal'
  | 'ifClear';

export interface Position {
  x: number;
  y: number;
}

interface BaseCommand {
  id: string;
}

export interface MoveCommand extends BaseCommand {
  kind: 'move';
}

export interface TurnLeftCommand extends BaseCommand {
  kind: 'turnLeft';
}

export interface TurnRightCommand extends BaseCommand {
  kind: 'turnRight';
}

export interface RepeatCommand extends BaseCommand {
  kind: 'repeat';
  times: 2 | 3 | 4;
  body: ProgramCommand[];
}

export interface WhileGoalCommand extends BaseCommand {
  kind: 'whileGoal';
  body: ProgramCommand[];
}

export interface IfClearCommand extends BaseCommand {
  kind: 'ifClear';
  thenBody: ProgramCommand[];
  elseBody: ProgramCommand[];
}

export type ProgramCommand =
  | MoveCommand
  | TurnLeftCommand
  | TurnRightCommand
  | RepeatCommand
  | WhileGoalCommand
  | IfClearCommand;

export interface RoboLevel {
  id: number;
  title: string;
  tier: RoboTier;
  columns: number;
  rows: number;
  start: {
    position: Position;
    facing: Direction;
  };
  walls: Position[];
  batteries: Position[];
  goal: Position;
  objective: string;
  allowedCommands: CommandKind[];
  par: number;
}

export interface RobotState {
  position: Position;
  facing: Direction;
  collectedBatteries: string[];
}

export interface TraceFrame {
  event: 'move' | 'turn' | 'condition' | 'error';
  activeIds: string[];
  state: RobotState;
  message: string;
}

export interface ExecutionResult {
  status: 'solved' | 'incomplete' | 'collision' | 'limit';
  finalState: RobotState;
  trace: TraceFrame[];
  operations: number;
  message: string;
}

const DEFAULT_OPERATION_LIMIT = 80;
const DIRECTIONS: Direction[] = ['north', 'east', 'south', 'west'];
let commandSequence = 0;

function positionKey(position: Position): string {
  return `${position.x},${position.y}`;
}

function samePosition(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function cloneState(state: RobotState): RobotState {
  return {
    position: { ...state.position },
    facing: state.facing,
    collectedBatteries: [...state.collectedBatteries],
  };
}

function nextPosition(position: Position, facing: Direction): Position {
  switch (facing) {
    case 'north':
      return { x: position.x, y: position.y - 1 };
    case 'east':
      return { x: position.x + 1, y: position.y };
    case 'south':
      return { x: position.x, y: position.y + 1 };
    case 'west':
      return { x: position.x - 1, y: position.y };
  }
}

function turn(facing: Direction, amount: -1 | 1): Direction {
  const index = DIRECTIONS.indexOf(facing);
  return DIRECTIONS[(index + amount + DIRECTIONS.length) % DIRECTIONS.length];
}

function isOpen(level: RoboLevel, position: Position): boolean {
  if (
    position.x < 0
    || position.y < 0
    || position.x >= level.columns
    || position.y >= level.rows
  ) {
    return false;
  }
  return !level.walls.some(wall => samePosition(wall, position));
}

export function createCommand(
  kind: CommandKind,
  options: { times?: 2 | 3 | 4 } = {},
): ProgramCommand {
  commandSequence += 1;
  const id = `robo-command-${commandSequence}`;
  switch (kind) {
    case 'move':
      return { id, kind };
    case 'turnLeft':
      return { id, kind };
    case 'turnRight':
      return { id, kind };
    case 'repeat':
      return { id, kind, times: options.times ?? 3, body: [] };
    case 'whileGoal':
      return { id, kind, body: [] };
    case 'ifClear':
      return { id, kind, thenBody: [], elseBody: [] };
  }
}

export function executeProgram(
  level: RoboLevel,
  program: ProgramCommand[],
  maxOperations = DEFAULT_OPERATION_LIMIT,
): ExecutionResult {
  let state: RobotState = {
    position: { ...level.start.position },
    facing: level.start.facing,
    collectedBatteries: [],
  };
  const trace: TraceFrame[] = [];
  let operations = 0;
  let terminalStatus: 'collision' | 'limit' | null = null;
  let terminalMessage = '';

  const record = (
    event: TraceFrame['event'],
    activeIds: string[],
    message: string,
  ) => {
    trace.push({ event, activeIds, state: cloneState(state), message });
  };

  const stopAtLimit = (activeIds: string[]) => {
    terminalStatus = 'limit';
    terminalMessage = `Program stopped at the ${maxOperations}-operation limit.`;
    record('error', activeIds, terminalMessage);
  };

  const beginOperation = (activeIds: string[]): boolean => {
    if (operations >= maxOperations) {
      stopAtLimit(activeIds);
      return false;
    }
    operations += 1;
    return true;
  };

  const runCommands = (commands: ProgramCommand[], parentIds: string[]) => {
    for (const command of commands) {
      if (terminalStatus) return;
      const activeIds = [...parentIds, command.id];

      switch (command.kind) {
        case 'move': {
          if (!beginOperation(activeIds)) return;
          const destination = nextPosition(state.position, state.facing);
          if (!isOpen(level, destination)) {
            terminalStatus = 'collision';
            terminalMessage = 'Route blocked. The robot bumped into a wall.';
            record('error', activeIds, terminalMessage);
            return;
          }
          const battery = level.batteries.find(item => samePosition(item, destination));
          const collectedBatteries = battery
            ? Array.from(new Set([...state.collectedBatteries, positionKey(battery)]))
            : state.collectedBatteries;
          state = { ...state, position: destination, collectedBatteries };
          record(
            'move',
            activeIds,
            battery ? 'Battery collected.' : 'Moved forward.',
          );
          break;
        }
        case 'turnLeft':
          if (!beginOperation(activeIds)) return;
          state = { ...state, facing: turn(state.facing, -1) };
          record('turn', activeIds, 'Turned left.');
          break;
        case 'turnRight':
          if (!beginOperation(activeIds)) return;
          state = { ...state, facing: turn(state.facing, 1) };
          record('turn', activeIds, 'Turned right.');
          break;
        case 'repeat':
          for (let iteration = 0; iteration < command.times; iteration += 1) {
            runCommands(command.body, activeIds);
            if (terminalStatus) return;
          }
          break;
        case 'whileGoal':
          while (!samePosition(state.position, level.goal)) {
            const operationsBeforeBody = operations;
            runCommands(command.body, activeIds);
            if (terminalStatus) return;
            if (operations === operationsBeforeBody) {
              stopAtLimit(activeIds);
              return;
            }
          }
          break;
        case 'ifClear': {
          const clear = isOpen(level, nextPosition(state.position, state.facing));
          record(
            'condition',
            activeIds,
            clear ? 'Front is clear: running if.' : 'Front is blocked: running else.',
          );
          runCommands(clear ? command.thenBody : command.elseBody, activeIds);
          break;
        }
      }
    }
  };

  runCommands(program, []);

  if (terminalStatus) {
    return {
      status: terminalStatus,
      finalState: cloneState(state),
      trace,
      operations,
      message: terminalMessage,
    };
  }

  const hasEveryBattery = level.batteries.every(battery =>
    state.collectedBatteries.includes(positionKey(battery)),
  );
  const atGoal = samePosition(state.position, level.goal);
  const solved = hasEveryBattery && atGoal;
  const message = solved
    ? 'Route complete. Every battery is charged.'
    : atGoal
      ? 'The beacon is reached, but a battery is still missing.'
      : 'Program finished before the robot reached the beacon.';

  return {
    status: solved ? 'solved' : 'incomplete',
    finalState: cloneState(state),
    trace,
    operations,
    message,
  };
}

export function countBlocks(program: ProgramCommand[]): number {
  return program.reduce((total, command) => {
    switch (command.kind) {
      case 'repeat':
      case 'whileGoal':
        return total + 1 + countBlocks(command.body);
      case 'ifClear':
        return total + 1 + countBlocks(command.thenBody) + countBlocks(command.elseBody);
      default:
        return total + 1;
    }
  }, 0);
}

export function starsForProgram(blocks: number, par: number): 1 | 2 | 3 {
  if (blocks <= par) return 3;
  if (blocks <= par + 2) return 2;
  return 1;
}

export const ROBOROUTE_LEVELS: RoboLevel[] = [
  {
    id: 1,
    title: 'First Steps',
    tier: 'Sequences',
    columns: 5,
    rows: 5,
    start: { position: { x: 0, y: 2 }, facing: 'east' },
    walls: [],
    batteries: [{ x: 2, y: 2 }],
    goal: { x: 3, y: 2 },
    objective: 'Collect the battery, then reach the beacon.',
    allowedCommands: ['move'],
    par: 3,
  },
  {
    id: 2,
    title: 'Turn the Corner',
    tier: 'Sequences',
    columns: 5,
    rows: 5,
    start: { position: { x: 1, y: 4 }, facing: 'north' },
    walls: [],
    batteries: [{ x: 1, y: 2 }],
    goal: { x: 3, y: 2 },
    objective: 'Climb the lane, turn right, and find the beacon.',
    allowedCommands: ['move', 'turnRight'],
    par: 5,
  },
  {
    id: 3,
    title: 'Double Back',
    tier: 'Sequences',
    columns: 5,
    rows: 5,
    start: { position: { x: 4, y: 4 }, facing: 'west' },
    walls: [{ x: 3, y: 2 }],
    batteries: [{ x: 2, y: 4 }],
    goal: { x: 2, y: 2 },
    objective: 'Head west, then turn north to the beacon.',
    allowedCommands: ['move', 'turnRight'],
    par: 5,
  },
  {
    id: 4,
    title: 'Around the Block',
    tier: 'Sequences',
    columns: 5,
    rows: 5,
    start: { position: { x: 0, y: 3 }, facing: 'east' },
    walls: [{ x: 2, y: 3 }, { x: 2, y: 2 }],
    batteries: [{ x: 1, y: 3 }, { x: 2, y: 1 }],
    goal: { x: 3, y: 1 },
    objective: 'Route around the stone blocks and collect both batteries.',
    allowedCommands: ['move', 'turnLeft', 'turnRight'],
    par: 7,
  },
  {
    id: 5,
    title: 'Repeat Run',
    tier: 'Loops',
    columns: 6,
    rows: 5,
    start: { position: { x: 0, y: 2 }, facing: 'east' },
    walls: [],
    batteries: [{ x: 3, y: 2 }],
    goal: { x: 4, y: 2 },
    objective: 'Use one repeat block to cross the long lane.',
    allowedCommands: ['move', 'repeat'],
    par: 2,
  },
  {
    id: 6,
    title: 'Square Corner',
    tier: 'Loops',
    columns: 5,
    rows: 5,
    start: { position: { x: 0, y: 4 }, facing: 'north' },
    walls: [{ x: 2, y: 3 }, { x: 3, y: 3 }],
    batteries: [{ x: 0, y: 2 }, { x: 2, y: 1 }],
    goal: { x: 3, y: 1 },
    objective: 'Reuse a short move sequence on both sides of the corner.',
    allowedCommands: ['move', 'turnRight', 'repeat'],
    par: 5,
  },
  {
    id: 7,
    title: 'Until the Beacon',
    tier: 'Loops',
    columns: 6,
    rows: 4,
    start: { position: { x: 0, y: 1 }, facing: 'east' },
    walls: [],
    batteries: [{ x: 2, y: 1 }, { x: 4, y: 1 }],
    goal: { x: 5, y: 1 },
    objective: 'Keep moving while the robot has not reached the beacon.',
    allowedCommands: ['move', 'whileGoal'],
    par: 2,
  },
  {
    id: 8,
    title: 'Battery Bend',
    tier: 'Loops',
    columns: 5,
    rows: 5,
    start: { position: { x: 4, y: 4 }, facing: 'west' },
    walls: [{ x: 2, y: 2 }, { x: 3, y: 2 }],
    batteries: [{ x: 2, y: 4 }, { x: 1, y: 2 }],
    goal: { x: 1, y: 1 },
    objective: 'Combine repeat blocks to trace an L-shaped route.',
    allowedCommands: ['move', 'turnRight', 'repeat'],
    par: 5,
  },
  {
    id: 9,
    title: 'Blocked Route',
    tier: 'Logic',
    columns: 5,
    rows: 5,
    start: { position: { x: 0, y: 2 }, facing: 'east' },
    walls: [{ x: 1, y: 2 }, { x: 1, y: 1 }],
    batteries: [{ x: 0, y: 1 }],
    goal: { x: 0, y: 0 },
    objective: 'Check the path and turn left when the front is blocked.',
    allowedCommands: ['move', 'turnLeft', 'whileGoal', 'ifClear'],
    par: 4,
  },
  {
    id: 10,
    title: 'Right Answer',
    tier: 'Logic',
    columns: 5,
    rows: 5,
    start: { position: { x: 0, y: 4 }, facing: 'north' },
    walls: [{ x: 0, y: 3 }, { x: 1, y: 3 }, { x: 2, y: 3 }],
    batteries: [{ x: 2, y: 4 }],
    goal: { x: 3, y: 4 },
    objective: 'Use an else branch to turn right around the barrier.',
    allowedCommands: ['move', 'turnRight', 'whileGoal', 'ifClear'],
    par: 4,
  },
  {
    id: 11,
    title: 'Two Corridors',
    tier: 'Logic',
    columns: 5,
    rows: 5,
    start: { position: { x: 4, y: 4 }, facing: 'west' },
    walls: [{ x: 0, y: 4 }, { x: 0, y: 3 }, { x: 2, y: 3 }],
    batteries: [{ x: 2, y: 4 }, { x: 1, y: 2 }],
    goal: { x: 1, y: 1 },
    objective: 'Let the same condition guide the robot through both corridors.',
    allowedCommands: ['move', 'turnRight', 'whileGoal', 'ifClear'],
    par: 4,
  },
  {
    id: 12,
    title: 'Logic Labyrinth',
    tier: 'Logic',
    columns: 6,
    rows: 6,
    start: { position: { x: 0, y: 0 }, facing: 'east' },
    walls: [
      { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 },
      { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 },
      { x: 5, y: 0 },
    ],
    batteries: [{ x: 2, y: 0 }, { x: 4, y: 3 }],
    goal: { x: 4, y: 5 },
    objective: 'Nest a condition in a loop and guide the robot to the final beacon.',
    allowedCommands: ['move', 'turnRight', 'whileGoal', 'ifClear'],
    par: 4,
  },
];
