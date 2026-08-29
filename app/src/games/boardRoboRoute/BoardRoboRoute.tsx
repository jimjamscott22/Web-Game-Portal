import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BatteryCharging,
  Braces,
  GitBranch,
  Play,
  Repeat2,
  RotateCcw,
  Sparkles,
  Square,
  StepForward,
  Trash2,
  X,
} from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  ROBOROUTE_LEVELS,
  countBlocks,
  createCommand,
  executeProgram,
  starsForProgram,
  type CommandKind,
  type Direction,
  type ExecutionResult,
  type ProgramCommand,
  type RoboLevel,
  type RoboTier,
  type RobotState,
} from './gameLogic';
import './roboRoute.css';

type BranchName = 'root' | 'body' | 'thenBody' | 'elseBody';

interface ProgramLane {
  parentId: string | null;
  branch: BranchName;
}

interface ProgressData {
  stars: Record<string, number>;
  highestCompleted: number;
}

const EMPTY_PROGRESS: ProgressData = { stars: {}, highestCompleted: 0 };
const ROOT_LANE: ProgramLane = { parentId: null, branch: 'root' };
const MAX_BLOCKS = 12;
const TIERS: RoboTier[] = ['Sequences', 'Loops', 'Logic'];

function laneKey(lane: ProgramLane): string {
  return lane.parentId === null ? 'root' : `${lane.parentId}:${lane.branch}`;
}

function initialRobotState(level: RoboLevel): RobotState {
  return {
    position: { ...level.start.position },
    facing: level.start.facing,
    collectedBatteries: [],
  };
}

function updateLane(
  commands: ProgramCommand[],
  lane: ProgramLane,
  update: (current: ProgramCommand[]) => ProgramCommand[],
): ProgramCommand[] {
  if (lane.parentId === null) return update(commands);

  return commands.map(command => {
    if (command.id === lane.parentId) {
      if ((command.kind === 'repeat' || command.kind === 'whileGoal') && lane.branch === 'body') {
        return { ...command, body: update(command.body) };
      }
      if (command.kind === 'ifClear' && lane.branch === 'thenBody') {
        return { ...command, thenBody: update(command.thenBody) };
      }
      if (command.kind === 'ifClear' && lane.branch === 'elseBody') {
        return { ...command, elseBody: update(command.elseBody) };
      }
    }

    if (command.kind === 'repeat' || command.kind === 'whileGoal') {
      return { ...command, body: updateLane(command.body, lane, update) };
    }
    if (command.kind === 'ifClear') {
      return {
        ...command,
        thenBody: updateLane(command.thenBody, lane, update),
        elseBody: updateLane(command.elseBody, lane, update),
      };
    }
    return command;
  });
}

function removeCommand(commands: ProgramCommand[], commandId: string): ProgramCommand[] {
  return commands
    .filter(command => command.id !== commandId)
    .map(command => {
      if (command.kind === 'repeat' || command.kind === 'whileGoal') {
        return { ...command, body: removeCommand(command.body, commandId) };
      }
      if (command.kind === 'ifClear') {
        return {
          ...command,
          thenBody: removeCommand(command.thenBody, commandId),
          elseBody: removeCommand(command.elseBody, commandId),
        };
      }
      return command;
    });
}

function commandLabel(command: ProgramCommand): string {
  switch (command.kind) {
    case 'move':
      return 'move forward';
    case 'turnLeft':
      return 'turn left';
    case 'turnRight':
      return 'turn right';
    case 'repeat':
      return `repeat ${command.times} times`;
    case 'whileGoal':
      return 'while not at beacon';
    case 'ifClear':
      return 'if front is clear';
  }
}

function CommandGlyph({ kind }: { kind: CommandKind }) {
  const iconClass = 'w-4 h-4';
  switch (kind) {
    case 'move':
      return <ArrowUp className={iconClass} />;
    case 'turnLeft':
      return <ArrowLeft className={iconClass} />;
    case 'turnRight':
      return <ArrowRight className={iconClass} />;
    case 'repeat':
      return <Repeat2 className={iconClass} />;
    case 'whileGoal':
      return <Braces className={iconClass} />;
    case 'ifClear':
      return <GitBranch className={iconClass} />;
  }
}

interface ProgramLaneViewProps {
  commands: ProgramCommand[];
  lane: ProgramLane;
  selectedLane: ProgramLane;
  activeIds: string[];
  disabled: boolean;
  onSelectLane: (lane: ProgramLane) => void;
  onRemove: (commandId: string) => void;
}

function ProgramLaneView({
  commands,
  lane,
  selectedLane,
  activeIds,
  disabled,
  onSelectLane,
  onRemove,
}: ProgramLaneViewProps) {
  const selected = laneKey(lane) === laneKey(selectedLane);

  return (
    <div className={`robo-lane ${selected ? 'is-selected' : ''}`}>
      {commands.map(command => {
        const active = activeIds.includes(command.id);
        const blockClass = command.kind === 'repeat'
          ? 'is-loop'
          : command.kind === 'whileGoal'
            ? 'is-while'
            : command.kind === 'ifClear'
              ? 'is-logic'
              : 'is-action';

        return (
          <div
            key={command.id}
            className={`robo-command ${blockClass} ${active ? 'is-running' : ''}`}
          >
            <div className="robo-command-heading">
              <span className="robo-command-icon"><CommandGlyph kind={command.kind} /></span>
              <span>{commandLabel(command)}</span>
              <button
                type="button"
                className="robo-remove-command"
                onClick={() => onRemove(command.id)}
                disabled={disabled}
                aria-label={`Remove ${commandLabel(command)}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {(command.kind === 'repeat' || command.kind === 'whileGoal') && (
              <ProgramLaneView
                commands={command.body}
                lane={{ parentId: command.id, branch: 'body' }}
                selectedLane={selectedLane}
                activeIds={activeIds}
                disabled={disabled}
                onSelectLane={onSelectLane}
                onRemove={onRemove}
              />
            )}

            {command.kind === 'ifClear' && (
              <div className="robo-branches">
                <div>
                  <span className="robo-branch-label">if</span>
                  <ProgramLaneView
                    commands={command.thenBody}
                    lane={{ parentId: command.id, branch: 'thenBody' }}
                    selectedLane={selectedLane}
                    activeIds={activeIds}
                    disabled={disabled}
                    onSelectLane={onSelectLane}
                    onRemove={onRemove}
                  />
                </div>
                <div>
                  <span className="robo-branch-label">else</span>
                  <ProgramLaneView
                    commands={command.elseBody}
                    lane={{ parentId: command.id, branch: 'elseBody' }}
                    selectedLane={selectedLane}
                    activeIds={activeIds}
                    disabled={disabled}
                    onSelectLane={onSelectLane}
                    onRemove={onRemove}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        className="robo-insert-lane"
        onClick={() => onSelectLane(lane)}
        disabled={disabled}
        aria-pressed={selected}
      >
        <ArrowDownToLine className="w-3.5 h-3.5" />
        {selected ? 'Adding here' : 'Add here'}
      </button>
    </div>
  );
}

function Sprite({ type, className = '' }: { type: 'robot' | 'wall' | 'battery' | 'beacon'; className?: string }) {
  return <span aria-hidden="true" className={`robo-sprite robo-sprite-${type} ${className}`} />;
}

function directionClass(direction: Direction): string {
  return `faces-${direction}`;
}

function GameGrid({ level, state }: { level: RoboLevel; state: RobotState }) {
  const cells = Array.from({ length: level.columns * level.rows }, (_, index) => ({
    x: index % level.columns,
    y: Math.floor(index / level.columns),
  }));
  const collected = new Set(state.collectedBatteries);

  return (
    <div
      className="robo-grid"
      style={{ gridTemplateColumns: `repeat(${level.columns}, minmax(0, 1fr))` }}
      aria-label={`${level.columns} by ${level.rows} route grid`}
    >
      {cells.map(position => {
        const key = `${position.x},${position.y}`;
        const wall = level.walls.some(item => item.x === position.x && item.y === position.y);
        const battery = level.batteries.some(item => item.x === position.x && item.y === position.y);
        const beacon = level.goal.x === position.x && level.goal.y === position.y;
        const robot = state.position.x === position.x && state.position.y === position.y;

        return (
          <div key={key} className="robo-cell">
            {wall && <Sprite type="wall" />}
            {battery && !collected.has(key) && <Sprite type="battery" />}
            {beacon && <Sprite type="beacon" />}
            {robot && (
              <>
                <Sprite type="robot" />
                <ArrowUp className={`robo-direction-arrow ${directionClass(state.facing)}`} aria-hidden="true" />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface PaletteButton {
  kind: CommandKind;
  label: string;
  times?: 2 | 3 | 4;
}

const PALETTE_BUTTONS: PaletteButton[] = [
  { kind: 'move', label: 'move forward' },
  { kind: 'turnLeft', label: 'turn left' },
  { kind: 'turnRight', label: 'turn right' },
  { kind: 'repeat', label: 'repeat 2 times', times: 2 },
  { kind: 'repeat', label: 'repeat 3 times', times: 3 },
  { kind: 'repeat', label: 'repeat 4 times', times: 4 },
  { kind: 'whileGoal', label: 'while not at beacon' },
  { kind: 'ifClear', label: 'if front is clear' },
];

export default function BoardRoboRoute() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [program, setProgram] = useState<ProgramCommand[]>([]);
  const [selectedLane, setSelectedLane] = useState<ProgramLane>(ROOT_LANE);
  const [execution, setExecution] = useState<ExecutionResult | null>(null);
  const [frameIndex, setFrameIndex] = useState(-1);
  const [playback, setPlayback] = useState<'idle' | 'running' | 'paused'>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [awardedStars, setAwardedStars] = useState<1 | 2 | 3 | null>(null);
  const [progress, setProgress] = useLocalStorage<ProgressData>(
    'pixelplay-roboroute-progress-v1',
    EMPTY_PROGRESS,
  );

  const level = ROBOROUTE_LEVELS[levelIndex];
  const blockCount = useMemo(() => countBlocks(program), [program]);
  const currentFrame = frameIndex >= 0 ? execution?.trace[frameIndex] : undefined;
  const displayState = currentFrame?.state ?? initialRobotState(level);
  const activeIds = currentFrame?.activeIds ?? [];
  const tierLevels = ROBOROUTE_LEVELS.filter(item => item.tier === level.tier);
  const visiblePalette = PALETTE_BUTTONS.filter(item => level.allowedCommands.includes(item.kind));
  const editingDisabled = playback === 'running';

  const finishExecution = useCallback((result: ExecutionResult) => {
    setFeedback(result.message);
    if (result.status !== 'solved') {
      setAwardedStars(null);
      return;
    }

    const earned = starsForProgram(countBlocks(program), level.par);
    setAwardedStars(earned);
    setProgress(previous => ({
      stars: {
        ...previous.stars,
        [String(level.id)]: Math.max(previous.stars[String(level.id)] ?? 0, earned),
      },
      highestCompleted: Math.max(previous.highestCompleted, level.id),
    }));
  }, [level.id, level.par, program, setProgress]);

  useEffect(() => {
    if (playback !== 'running' || !execution) return;

    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 90 : 480;
    const timer = window.setTimeout(() => {
      const nextFrame = frameIndex + 1;
      if (nextFrame >= execution.trace.length) {
        setPlayback('idle');
        finishExecution(execution);
        return;
      }

      setFrameIndex(nextFrame);
      if (nextFrame === execution.trace.length - 1) {
        setPlayback('idle');
        finishExecution(execution);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [execution, finishExecution, frameIndex, playback]);

  const clearExecution = useCallback(() => {
    setExecution(null);
    setFrameIndex(-1);
    setPlayback('idle');
    setFeedback(null);
    setAwardedStars(null);
  }, []);

  const selectLevel = useCallback((nextIndex: number) => {
    setLevelIndex(nextIndex);
    setProgram([]);
    setSelectedLane(ROOT_LANE);
    setExecution(null);
    setFrameIndex(-1);
    setPlayback('idle');
    setFeedback(null);
    setAwardedStars(null);
  }, []);

  const selectTier = useCallback((tier: RoboTier) => {
    const nextIndex = ROBOROUTE_LEVELS.findIndex(item => item.tier === tier);
    if (nextIndex >= 0) selectLevel(nextIndex);
  }, [selectLevel]);

  const addCommand = useCallback((item: PaletteButton) => {
    if (blockCount >= MAX_BLOCKS || editingDisabled) return;
    const command = createCommand(item.kind, { times: item.times });
    setProgram(current => updateLane(current, selectedLane, lane => [...lane, command]));
    clearExecution();

    if (command.kind === 'repeat' || command.kind === 'whileGoal') {
      setSelectedLane({ parentId: command.id, branch: 'body' });
    } else if (command.kind === 'ifClear') {
      setSelectedLane({ parentId: command.id, branch: 'thenBody' });
    }
  }, [blockCount, clearExecution, editingDisabled, selectedLane]);

  const deleteCommand = useCallback((commandId: string) => {
    if (editingDisabled) return;
    setProgram(current => removeCommand(current, commandId));
    setSelectedLane(ROOT_LANE);
    clearExecution();
  }, [clearExecution, editingDisabled]);

  const runProgram = useCallback(() => {
    if (program.length === 0) {
      setFeedback('Add a command to the program first.');
      return;
    }
    const result = executeProgram(level, program);
    setExecution(result);
    setFrameIndex(-1);
    setFeedback(null);
    setAwardedStars(null);
    setPlayback('running');
  }, [level, program]);

  const stepProgram = useCallback(() => {
    if (program.length === 0) {
      setFeedback('Add a command to the program first.');
      return;
    }

    const result = execution ?? executeProgram(level, program);
    const nextFrame = Math.min(frameIndex + 1, result.trace.length - 1);
    setExecution(result);
    setPlayback('paused');

    if (result.trace.length === 0) {
      finishExecution(result);
      return;
    }

    setFrameIndex(nextFrame);
    setFeedback(result.trace[nextFrame]?.message ?? null);
    if (nextFrame === result.trace.length - 1) finishExecution(result);
  }, [execution, finishExecution, frameIndex, level, program]);

  const resetProgram = useCallback(() => {
    setProgram([]);
    setSelectedLane(ROOT_LANE);
    clearExecution();
  }, [clearExecution]);

  const selectNextLevel = useCallback(() => {
    selectLevel((levelIndex + 1) % ROBOROUTE_LEVELS.length);
  }, [levelIndex, selectLevel]);

  return (
    <div className="robo-route-shell">
      <div className="robo-tier-row" aria-label="RoboRoute learning tier">
        {TIERS.map(tier => (
          <button
            key={tier}
            type="button"
            className={tier === level.tier ? 'is-active' : ''}
            onClick={() => selectTier(tier)}
          >
            {tier}
          </button>
        ))}
      </div>

      <div className="robo-level-row" aria-label={`${level.tier} levels`}>
        {tierLevels.map(item => {
          const index = ROBOROUTE_LEVELS.indexOf(item);
          const savedStars = progress.stars[String(item.id)] ?? 0;
          return (
            <button
              key={item.id}
              type="button"
              className={index === levelIndex ? 'is-active' : ''}
              onClick={() => selectLevel(index)}
              aria-label={`Level ${item.id}: ${item.title}${savedStars ? `, ${savedStars} stars` : ''}`}
            >
              <span>{item.id}</span>
              {savedStars > 0 && <Sparkles className="w-3 h-3" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <section className="robo-workspace" aria-label="RoboRoute workspace">
        <div className="robo-board-panel">
          <div className="robo-objective-row">
            <div>
              <p className="robo-level-title">{level.title}</p>
              <p>{level.objective}</p>
            </div>
            <div className="robo-level-meta">
              <span>Level {level.id} of 12</span>
              <span className="robo-stars" aria-label={`${progress.stars[String(level.id)] ?? 0} best stars`}>
                {[1, 2, 3].map(star => (
                  <span key={star} className={star <= (awardedStars ?? progress.stars[String(level.id)] ?? 0) ? 'is-filled' : ''}>★</span>
                ))}
              </span>
            </div>
          </div>

          <GameGrid level={level} state={displayState} />

          <div className="robo-status-strip" aria-live="polite">
            <BatteryCharging className="w-4 h-4" />
            <span>
              {displayState.collectedBatteries.length} / {level.batteries.length} batteries
            </span>
            <span className="robo-status-message">{currentFrame?.message ?? feedback ?? 'Build a program, then run it.'}</span>
          </div>
        </div>

        <div className="robo-program-panel">
          <div className="robo-program-header">
            <div>
              <span className="robo-panel-label">Program</span>
              <p>Select an insertion lane, then add a command.</p>
            </div>
            <span className="robo-block-count">{blockCount} / {MAX_BLOCKS} blocks</span>
          </div>

          <div className="robo-program-scroll">
            <ProgramLaneView
              commands={program}
              lane={ROOT_LANE}
              selectedLane={selectedLane}
              activeIds={activeIds}
              disabled={editingDisabled}
              onSelectLane={setSelectedLane}
              onRemove={deleteCommand}
            />
          </div>

          <div className="robo-palette">
            <span className="robo-panel-label">Commands</span>
            <div className="robo-palette-buttons">
              {visiblePalette.map(item => (
                <button
                  key={`${item.kind}-${item.times ?? ''}`}
                  type="button"
                  onClick={() => addCommand(item)}
                  disabled={editingDisabled || blockCount >= MAX_BLOCKS}
                >
                  <CommandGlyph kind={item.kind} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="robo-controls">
            <button type="button" className="is-primary" onClick={runProgram} disabled={playback === 'running'}>
              <Play className="w-4 h-4" /> Run
            </button>
            <button type="button" onClick={stepProgram} disabled={playback === 'running'}>
              <StepForward className="w-4 h-4" /> Step
            </button>
            <button type="button" onClick={() => setPlayback('paused')} disabled={playback !== 'running'}>
              <Square className="w-3.5 h-3.5" /> Stop
            </button>
            <button type="button" onClick={resetProgram} disabled={editingDisabled && playback !== 'running'}>
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>

          {feedback && (
            <div className={`robo-feedback ${execution?.status === 'solved' ? 'is-success' : ''}`} role="status">
              <span>{feedback}</span>
              {execution?.status === 'solved' && (
                <button type="button" onClick={selectNextLevel}>Next level</button>
              )}
              {execution?.status !== 'solved' && program.length > 0 && (
                <button type="button" onClick={resetProgram} aria-label="Clear program">
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
