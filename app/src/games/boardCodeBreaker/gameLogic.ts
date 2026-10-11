export type Difficulty = 'easy' | 'medium' | 'hard';

export interface CodeConfig {
  /** Digits in the secret code. */
  length: number;
  /** Size of the digit alphabet; digits are shown 1..symbols. */
  symbols: number;
  maxGuesses: number;
  /** Whether a digit may appear more than once in the code (and in guesses). */
  repeats: boolean;
}

export const CODE_CONFIG: Record<Difficulty, CodeConfig> = {
  easy: { length: 4, symbols: 6, maxGuesses: 10, repeats: false },
  medium: { length: 4, symbols: 6, maxGuesses: 10, repeats: true },
  hard: { length: 5, symbols: 8, maxGuesses: 12, repeats: true },
};

/** Zero-based symbol indices. */
export type Code = number[];
export type Slot = number | null;

export interface Feedback {
  /** Right digit in the right slot. */
  exact: number;
  /** Right digit, wrong slot. */
  near: number;
}

export interface GuessRecord {
  guess: Code;
  feedback: Feedback;
  /** How many codes were still consistent with every clue after this guess. */
  remaining: number;
}

export function generateCode(config: CodeConfig, random = Math.random): Code {
  const pool = Array.from({ length: config.symbols }, (_, i) => i);
  return Array.from({ length: config.length }, () => {
    const pick = Math.floor(random() * pool.length);
    return config.repeats ? pool[pick] : pool.splice(pick, 1)[0];
  });
}

/** Classic Mastermind scoring: exact matches first, then leftover digit overlaps. */
export function scoreGuess(code: Code, guess: Code): Feedback {
  let exact = 0;
  const codeLeft = new Map<number, number>();
  const guessLeft = new Map<number, number>();
  code.forEach((digit, i) => {
    if (guess[i] === digit) {
      exact++;
    } else {
      codeLeft.set(digit, (codeLeft.get(digit) ?? 0) + 1);
      guessLeft.set(guess[i], (guessLeft.get(guess[i]) ?? 0) + 1);
    }
  });
  let near = 0;
  guessLeft.forEach((count, digit) => { near += Math.min(count, codeLeft.get(digit) ?? 0); });
  return { exact, near };
}

export const isCracked = (feedback: Feedback, config: CodeConfig) => feedback.exact === config.length;

export const emptySlots = (config: CodeConfig): Slot[] => Array(config.length).fill(null);

/** Why the current row can't be submitted yet, or null when it can. */
export function validateGuess(slots: Slot[], config: CodeConfig): string | null {
  if (slots.some(s => s === null)) return 'Fill every slot first';
  if (!config.repeats && new Set(slots).size !== slots.length) return 'No repeated digits on this difficulty';
  return null;
}

/** Every code the rules allow — 360 on Easy, 1,296 on Medium, 32,768 on Hard. */
export function allCodes(config: CodeConfig): Code[] {
  const out: Code[] = [];
  const build = (prefix: Code) => {
    if (prefix.length === config.length) { out.push(prefix); return; }
    for (let d = 0; d < config.symbols; d++) {
      if (!config.repeats && prefix.includes(d)) continue;
      build([...prefix, d]);
    }
  };
  build([]);
  return out;
}

/** Keep only the candidates that would have produced the same clue for this guess. */
export const filterCandidates = (candidates: Code[], guess: Code, feedback: Feedback): Code[] =>
  candidates.filter(c => {
    const f = scoreGuess(c, guess);
    return f.exact === feedback.exact && f.near === feedback.near;
  });

/** Step the digit in a slot forwards or backwards through the alphabet. */
export const cycleSymbol = (slot: Slot, delta: 1 | -1, config: CodeConfig): number =>
  slot === null ? (delta === 1 ? 0 : config.symbols - 1) : (slot + delta + config.symbols) % config.symbols;

/** Size of the code space: symbols^length with repeats, otherwise symbols!/(symbols-length)!. */
export function codeSpaceSize(config: CodeConfig): number {
  let size = 1;
  for (let i = 0; i < config.length; i++) size *= config.repeats ? config.symbols : config.symbols - i;
  return size;
}
