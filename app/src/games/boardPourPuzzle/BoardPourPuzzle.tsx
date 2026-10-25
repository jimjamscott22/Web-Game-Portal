import { useCallback, useState } from 'react';
import { Droplet, Lightbulb, RotateCcw, Trash2, Undo2 } from 'lucide-react';
import {
  applyMove,
  describeMove,
  goalText,
  isLegal,
  isSolved,
  solve,
  type Move,
  type PourLevel,
} from './gameLogic';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useSwipe } from '@/hooks/useSwipe';
import MobileControls from '@/components/MobileControls';
import { cn } from '@/lib/utils';

interface BoardPourPuzzleProps {
  level: PourLevel;
  onMove: (moves: number) => void;
  onWin: (result: { moves: number; usedHint: boolean }) => void;
}

const MAX_JUG_HEIGHT = 220;

export default function BoardPourPuzzle({ level, onMove, onWin }: BoardPourPuzzleProps) {
  const [history, setHistory] = useState<number[][]>(() => [level.start]);
  const [selected, setSelected] = useState<number | null>(null);
  const [cursor, setCursor] = useState(0);
  const [hint, setHint] = useState<Move | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const state = history[history.length - 1];
  const moves = history.length - 1;
  const solved = isSolved(level, state);
  const jugCount = level.capacities.length;
  const maxCap = Math.max(...level.capacities);

  const play = useCallback((move: Move) => {
    if (solved) return;
    const next = applyMove(level, state, move);
    setSelected(null);
    if (!next) {
      setMessage('That move would not change anything.');
      return;
    }
    const nextHistory = [...history, next];
    setHistory(nextHistory);
    setHint(null);
    setMessage(null);
    onMove(nextHistory.length - 1);
    if (isSolved(level, next)) onWin({ moves: nextHistory.length - 1, usedHint });
  }, [solved, level, state, history, onMove, onWin, usedHint]);

  // Tap a jug to pick it up, tap another to pour into it, tap again to put it down.
  const tapJug = useCallback((jug: number) => {
    if (solved) return;
    setCursor(jug);
    setMessage(null);
    if (selected === null) {
      if (state[jug] === 0) {
        setMessage(level.tap ? 'That jug is empty — fill it first.' : 'That jug is empty.');
        return;
      }
      setSelected(jug);
    } else if (selected === jug) {
      setSelected(null);
    } else {
      play({ type: 'pour', from: selected, to: jug });
    }
  }, [solved, selected, state, level.tap, play]);

  const undo = useCallback(() => {
    if (history.length <= 1 || solved) return;
    const nextHistory = history.slice(0, -1);
    setHistory(nextHistory);
    setSelected(null);
    setHint(null);
    setMessage(null);
    onMove(nextHistory.length - 1);
  }, [history, solved, onMove]);

  const restart = useCallback(() => {
    if (solved) return;
    setHistory([level.start]);
    setSelected(null);
    setHint(null);
    setMessage(null);
    onMove(0);
  }, [solved, level.start, onMove]);

  const showHint = useCallback(() => {
    if (solved) return;
    const path = solve(level, state);
    setSelected(null);
    if (!path || path.length === 0) {
      setHint(null);
      setMessage('No solution from here — undo or restart.');
      return;
    }
    setHint(path[0]);
    setUsedHint(true);
    setMessage(`Hint: ${describeMove(level, path[0])}.`);
  }, [solved, level, state]);

  const moveCursor = useCallback((delta: number) => {
    setCursor(c => (c + delta + jugCount) % jugCount);
  }, [jugCount]);

  const jugKeys = Object.fromEntries(
    level.capacities.map((_, i) => [String(i + 1), () => tapJug(i)]),
  );
  useKeyboard({
    ...jugKeys,
    arrowleft: () => moveCursor(-1),
    arrowright: () => moveCursor(1),
    enter: () => tapJug(cursor),
    ' ': () => tapJug(cursor),
    f: () => level.tap && play({ type: 'fill', jug: selected ?? cursor }),
    e: () => level.tap && play({ type: 'empty', jug: selected ?? cursor }),
    escape: () => setSelected(null),
    z: undo,
    u: undo,
    backspace: undo,
    r: restart,
    h: showHint,
  }, [tapJug, moveCursor, play, undo, restart, showHint]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => moveCursor(-1),
    onSwipeRight: () => moveCursor(1),
  });

  return (
    <div className="mx-auto" style={{ maxWidth: 560 }}>
      <div className="rounded-card bg-board p-4 sm:p-6" {...swipeHandlers}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Goal</div>
            <div className="font-display text-xl text-ink leading-tight">{goalText(level)}</div>
          </div>
          <span
            className={cn(
              'tag px-3 py-1.5 font-body text-xs font-semibold',
              level.tap ? 'text-ink' : 'tag-outline text-muted-foreground',
            )}
            style={level.tap ? { background: 'color-mix(in srgb, var(--t-s15) 40%, transparent)' } : undefined}
          >
            {level.tap ? 'Tap: unlimited water' : `No tap · ${state.reduce((a, b) => a + b, 0)} total`}
          </span>
        </div>

        <div className="flex items-end justify-center gap-4 sm:gap-8" style={{ minHeight: MAX_JUG_HEIGHT + 30 }}>
          {level.capacities.map((cap, i) => {
            const height = Math.max(70, (cap / maxCap) * MAX_JUG_HEIGHT);
            const pct = (state[i] / cap) * 100;
            const goalPct = level.goal.amount <= cap ? (level.goal.amount / cap) * 100 : null;
            const isSelected = selected === i;
            const atGoal = state[i] === level.goal.amount;
            const hinted = hint && (
              (hint.type === 'pour' && (hint.from === i || hint.to === i)) ||
              (hint.type !== 'pour' && hint.jug === i)
            );
            const canPourHere = selected !== null && selected !== i &&
              isLegal(level, state, { type: 'pour', from: selected, to: i });
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className={cn('font-pixel text-lg font-bold', atGoal ? 'text-ok' : 'text-ink')}>
                  {state[i]}<span className="text-sm text-muted-foreground">/{cap}</span>
                </div>
                <button
                  onClick={() => tapJug(i)}
                  disabled={solved}
                  aria-label={`Jug ${i + 1}: ${state[i]} of ${cap}${isSelected ? ', selected' : ''}`}
                  aria-pressed={isSelected}
                  className={cn(
                    'relative w-16 sm:w-20 rounded-b-tile rounded-t-md border-[3px] border-ink/70 bg-cell overflow-hidden',
                    'transition-transform duration-200 snap-ease touch-manipulation',
                    isSelected && '-translate-y-3 ring-2 ring-accent-deep ring-offset-2 ring-offset-board',
                    cursor === i && !isSelected && 'ring-2 ring-line ring-offset-2 ring-offset-board',
                    canPourHere && 'border-dashed',
                    hinted && 'animate-pulse',
                  )}
                  style={{ height }}
                >
                  <div
                    className={cn('absolute inset-x-0 bottom-0 transition-[height] duration-500 snap-ease', atGoal ? 'bg-ok' : 'bg-second')}
                    style={{ height: `${pct}%`, opacity: 0.85 }}
                  />
                  {goalPct !== null && (
                    <div
                      className="absolute inset-x-0 border-t-2 border-dashed border-ink/40 pointer-events-none"
                      style={{ bottom: `${goalPct}%` }}
                      aria-hidden="true"
                    />
                  )}
                </button>
                <div className="font-body text-xs text-muted-foreground">Jug {i + 1}</div>
                {level.tap && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => play({ type: 'fill', jug: i })}
                      disabled={solved || state[i] === cap}
                      aria-label={`Fill jug ${i + 1}`}
                      title="Fill"
                      className={cn(
                        'w-9 h-9 rounded-full border border-line bg-surface flex items-center justify-center hover:bg-panel disabled:opacity-35',
                        hint?.type === 'fill' && hint.jug === i && 'ring-2 ring-accent',
                      )}
                    >
                      <Droplet className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => play({ type: 'empty', jug: i })}
                      disabled={solved || state[i] === 0}
                      aria-label={`Empty jug ${i + 1}`}
                      title="Empty"
                      className={cn(
                        'w-9 h-9 rounded-full border border-line bg-surface flex items-center justify-center hover:bg-panel disabled:opacity-35',
                        hint?.type === 'empty' && hint.jug === i && 'ring-2 ring-accent',
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p role="status" className="min-h-5 mt-3 text-center font-body text-sm text-muted-foreground">
        {message ?? (selected !== null ? `Pouring from jug ${selected + 1} — tap where it goes.` : 'Tap a jug to pick it up, then tap another to pour.')}
      </p>

      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <button className="btn btn-secondary min-h-11 px-5 text-base" onClick={undo} disabled={solved || moves === 0}>
          <Undo2 className="w-4 h-4" />
          Undo
        </button>
        <button className="btn btn-secondary min-h-11 px-5 text-base" onClick={restart} disabled={solved || moves === 0}>
          <RotateCcw className="w-4 h-4" />
          Restart
        </button>
        <button className="btn btn-primary min-h-11 px-5 text-base" onClick={showHint} disabled={solved}>
          <Lightbulb className="w-4 h-4" />
          Hint
        </button>
      </div>

      <MobileControls
        color="var(--t-s15)"
        onLeft={() => moveCursor(-1)}
        onRight={() => moveCursor(1)}
        onUp={() => tapJug(cursor)}
        onDown={undo}
      />
    </div>
  );
}
