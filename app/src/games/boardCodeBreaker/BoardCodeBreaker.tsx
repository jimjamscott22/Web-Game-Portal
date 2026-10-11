import { useCallback, useState } from 'react';
import { Delete, Lock, LockOpen } from 'lucide-react';
import {
  CODE_CONFIG,
  allCodes,
  codeSpaceSize,
  cycleSymbol,
  emptySlots,
  filterCandidates,
  generateCode,
  isCracked,
  scoreGuess,
  validateGuess,
  type Code,
  type Difficulty,
  type Feedback,
  type GuessRecord,
  type Slot,
} from './gameLogic';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useSwipe } from '@/hooks/useSwipe';
import MobileControls from '@/components/MobileControls';
import { cn } from '@/lib/utils';
import { inkOn, useSkinTokens } from '@/theme/tokens';

/** One fill per digit, so a code reads as a colour pattern as well as a number. */
const SYMBOL_TOKENS = ['--t-p2', '--t-p5', '--t-p1', '--t-p6', '--t-p3', '--t-p4', '--t-p7', '--t-ink'] as const;
/** Stagger between pegs when a submitted row lands. */
const REVEAL_STEP_MS = 70;

const pegClass = 'w-9 h-9 sm:w-11 sm:h-11 shrink-0 rounded-tile flex items-center justify-center font-pixel text-lg sm:text-xl font-bold';

function Peg({ symbol, tokens, className, style }: { symbol: number; tokens: Record<(typeof SYMBOL_TOKENS)[number], string>; className?: string; style?: React.CSSProperties }) {
  const token = SYMBOL_TOKENS[symbol];
  return (
    <span
      className={cn(pegClass, 'shadow-button', className)}
      style={{ backgroundColor: `var(${token})`, color: `var(${inkOn(tokens[token])})`, ...style }}
    >
      {symbol + 1}
    </span>
  );
}

/** Solid pip: right digit, right slot. Hollow pip: right digit, wrong slot. */
function Pips({ feedback, length }: { feedback: Feedback; length: number }) {
  const kinds = Array.from({ length }, (_, i) => (i < feedback.exact ? 'exact' : i < feedback.exact + feedback.near ? 'near' : 'none'));
  return (
    <div
      role="img"
      aria-label={`${feedback.exact} exact, ${feedback.near} near`}
      title={`${feedback.exact} exact · ${feedback.near} near`}
      className="grid gap-[3px] shrink-0 ml-auto"
      style={{ gridTemplateColumns: `repeat(${Math.ceil(length / 2)}, 10px)` }}
    >
      {kinds.map((kind, i) => (
        <span
          key={i}
          className={cn(
            'w-2.5 h-2.5 rounded-[3px]',
            kind === 'exact' && 'bg-accent',
            kind === 'near' && 'bg-surface ring-2 ring-inset ring-accent',
            kind === 'none' && 'bg-cell',
          )}
        />
      ))}
    </div>
  );
}

interface BoardCodeBreakerProps {
  difficulty: Difficulty;
  onGuess: (count: number) => void;
  onWin: (guesses: number) => void;
  onLose: (code: Code) => void;
}

export default function BoardCodeBreaker({ difficulty, onGuess, onWin, onLose }: BoardCodeBreakerProps) {
  const config = CODE_CONFIG[difficulty];
  const tokens = useSkinTokens(SYMBOL_TOKENS);
  const [secret] = useState(() => generateCode(config));
  const [candidates, setCandidates] = useState(() => allCodes(config));
  const [history, setHistory] = useState<GuessRecord[]>([]);
  const [slots, setSlots] = useState<Slot[]>(() => emptySlots(config));
  const [cursor, setCursor] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Bumped on every rejected submit so the active row remounts and re-shakes.
  const [shake, setShake] = useState(0);

  const last = history.at(-1);
  const cracked = last ? isCracked(last.feedback, config) : false;
  const finished = cracked || history.length >= config.maxGuesses;
  const total = codeSpaceSize(config);

  const place = useCallback((symbol: number) => {
    if (finished) return;
    const next = slots.map((s, i) => (i === cursor ? symbol : s));
    setSlots(next);
    setError(null);
    // Jump to the next empty slot to the right, else just step right.
    const ahead = next.findIndex((s, i) => i > cursor && s === null);
    setCursor(ahead !== -1 ? ahead : Math.min(cursor + 1, config.length - 1));
  }, [finished, slots, cursor, config.length]);

  const erase = useCallback(() => {
    if (finished) return;
    setError(null);
    if (slots[cursor] !== null) {
      setSlots(slots.map((s, i) => (i === cursor ? null : s)));
      return;
    }
    const prev = Math.max(0, cursor - 1);
    setSlots(slots.map((s, i) => (i === prev ? null : s)));
    setCursor(prev);
  }, [finished, slots, cursor]);

  const move = useCallback((delta: number) => {
    setCursor(c => Math.max(0, Math.min(config.length - 1, c + delta)));
  }, [config.length]);

  const cycle = useCallback((delta: 1 | -1) => {
    if (finished) return;
    setError(null);
    setSlots(slots.map((s, i) => (i === cursor ? cycleSymbol(s, delta, config) : s)));
  }, [finished, slots, cursor, config]);

  const submit = useCallback(() => {
    if (finished) return;
    const problem = validateGuess(slots, config);
    if (problem) {
      setError(problem);
      setShake(n => n + 1);
      return;
    }
    const guess = slots as Code;
    const feedback = scoreGuess(secret, guess);
    const remaining = filterCandidates(candidates, guess, feedback);
    const count = history.length + 1;
    setCandidates(remaining);
    setHistory([...history, { guess, feedback, remaining: remaining.length }]);
    setSlots(emptySlots(config));
    setCursor(0);
    onGuess(count);
    if (isCracked(feedback, config)) onWin(count);
    else if (count >= config.maxGuesses) onLose(secret);
  }, [finished, slots, config, secret, candidates, history, onGuess, onWin, onLose]);

  const digitKeys = Object.fromEntries(Array.from({ length: config.symbols }, (_, i) => [String(i + 1), () => place(i)]));
  useKeyboard({
    ...digitKeys,
    backspace: erase,
    delete: erase,
    enter: submit,
    arrowleft: () => move(-1),
    arrowright: () => move(1),
    arrowup: () => cycle(1),
    arrowdown: () => cycle(-1),
  }, [place, erase, submit, move, cycle]);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => move(-1),
    onSwipeRight: () => move(1),
    onSwipeUp: () => cycle(1),
    onSwipeDown: () => cycle(-1),
  });

  // Log scale, so each guess's share of the narrowing is visible even when
  // the first clue cuts thousands of codes and the last cuts two.
  const narrowed = total > 1 ? 1 - Math.log(Math.max(1, candidates.length)) / Math.log(total) : 1;
  const guessesLeft = config.maxGuesses - history.length;

  return (
    <div className="mx-auto" style={{ maxWidth: 520 }}>
      <div className="rounded-card bg-board p-3.5 sm:p-5">
        <div className="flex items-center gap-2 sm:gap-3 pb-3 mb-3 border-b border-line">
          <span className="w-6 sm:w-8 shrink-0 flex justify-end text-muted-foreground" aria-hidden="true">
            {finished ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </span>
          <div className="flex gap-1.5 sm:gap-2" aria-label={finished ? `Secret code ${secret.map(d => d + 1).join(' ')}` : 'Secret code hidden'}>
            {secret.map((d, i) =>
              finished ? (
                <Peg key={i} symbol={d} tokens={tokens} className="ms-reveal" style={{ animationDelay: `${i * REVEAL_STEP_MS}ms` }} />
              ) : (
                <span key={i} className={cn(pegClass, 'bg-cell text-muted-foreground')}>?</span>
              ),
            )}
          </div>
          <span className="ml-auto font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Secret</span>
        </div>

        <ol className="flex flex-col gap-2">
          {history.map((rec, row) => (
            <li key={row} className="flex items-center gap-2 sm:gap-3 px-0">
              <span className="w-6 sm:w-8 shrink-0 text-right font-pixel text-sm text-muted-foreground">{row + 1}</span>
              <div className="flex gap-1.5 sm:gap-2">
                {rec.guess.map((d, i) => (
                  <Peg
                    key={i}
                    symbol={d}
                    tokens={tokens}
                    className={row === history.length - 1 ? 'ms-reveal' : undefined}
                    style={row === history.length - 1 ? { animationDelay: `${i * REVEAL_STEP_MS}ms` } : undefined}
                  />
                ))}
              </div>
              <Pips feedback={rec.feedback} length={config.length} />
            </li>
          ))}

          {!finished && (
            <li
              key={`active-${shake}`}
              className={cn('flex items-center gap-2 sm:gap-3 rounded-tile -mx-1.5 px-1.5 py-1.5 bg-cell', shake > 0 && 'animate-shake')}
              {...swipeHandlers}
            >
              <span className="w-6 sm:w-8 shrink-0 text-right font-pixel text-sm text-ink">{history.length + 1}</span>
              <div className="flex gap-1.5 sm:gap-2">
                {slots.map((s, i) => {
                  const selected = i === cursor;
                  const label = `Slot ${i + 1}, ${s === null ? 'empty' : `digit ${s + 1}`}`;
                  return (
                    <button
                      key={i}
                      onClick={() => setCursor(i)}
                      aria-label={label}
                      aria-pressed={selected}
                      className={cn('rounded-tile', selected && 'ring-2 ring-accent-deep ring-offset-2 ring-offset-board')}
                    >
                      {s === null ? (
                        <span className={cn(pegClass, 'border-2 border-dashed border-line text-muted-foreground')} />
                      ) : (
                        <Peg symbol={s} tokens={tokens} />
                      )}
                    </button>
                  );
                })}
              </div>
              <span className="ml-auto shrink-0 font-body text-xs text-muted-foreground">{guessesLeft} left</span>
            </li>
          )}
        </ol>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Digits">
        {Array.from({ length: config.symbols }, (_, d) => (
          <button
            key={d}
            onClick={() => place(d)}
            disabled={finished}
            aria-label={`Digit ${d + 1}`}
            className="group rounded-tile btn-bounce active:translate-y-[3px] disabled:opacity-40"
          >
            <Peg symbol={d} tokens={tokens} className="w-11 h-11 text-xl group-active:shadow-button-active" />
          </button>
        ))}
      </div>

      <div className="mt-3 flex justify-center gap-2">
        <button className="btn btn-secondary min-h-11 px-5 text-base" onClick={erase} disabled={finished}>
          <Delete className="w-4 h-4" />
          Delete
        </button>
        <button className="btn btn-primary min-h-11 px-7 text-base" onClick={submit} disabled={finished}>
          Check
        </button>
      </div>

      <p role="alert" className="min-h-5 mt-2 text-center font-body text-sm text-err">{error}</p>

      <div className="mt-2 rounded-tile border border-line bg-surface px-4 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-body text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Codes still possible</span>
          <span className="font-pixel text-lg font-bold text-ink">
            {candidates.length.toLocaleString()}
            <span className="font-body text-xs font-normal text-muted-foreground"> / {total.toLocaleString()}</span>
          </span>
        </div>
        <div
          className="mt-2 h-2 rounded-pill bg-cell overflow-hidden"
          role="progressbar"
          aria-label="Deduction progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(narrowed * 100)}
        >
          <div className="h-full bg-second transition-[width] duration-500 snap-ease" style={{ width: `${narrowed * 100}%` }} />
        </div>
      </div>

      <MobileControls
        color="var(--t-s14)"
        onLeft={() => move(-1)}
        onRight={() => move(1)}
        onUp={() => cycle(1)}
        onDown={() => cycle(-1)}
      />
    </div>
  );
}
