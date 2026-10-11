import { useCallback, useEffect, useState } from 'react';
import BoardCodeBreaker from '@/games/boardCodeBreaker/BoardCodeBreaker';
import { CODE_CONFIG, type Code, type Difficulty } from '@/games/boardCodeBreaker/gameLogic';
import GamePageLayout from '@/components/GamePageLayout';
import GameHeader from '@/components/GameHeader';
import ScoreBox from '@/components/ScoreBox';
import DifficultyPills from '@/components/DifficultyPills';
import HowToPlayPanel from '@/components/HowToPlayPanel';
import WinOverlay from '@/components/WinOverlay';
import GameOverOverlay from '@/components/GameOverOverlay';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const options: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy · 4 unique' },
  { value: 'medium', label: 'Medium · repeats' },
  { value: 'hard', label: 'Hard · 5 of 8' },
];

export default function GameCodeBreaker() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [guesses, setGuesses] = useState(0);
  const [time, setTime] = useState(0);
  const [result, setResult] = useState<{ won: true } | { won: false; code: Code } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const config = CODE_CONFIG[difficulty];

  const bestEasy = useLocalStorage('pixelplay-code-breaker-best-guesses-easy', 0);
  const bestMedium = useLocalStorage('pixelplay-code-breaker-best-guesses-medium', 0);
  const bestHard = useLocalStorage('pixelplay-code-breaker-best-guesses-hard', 0);
  const [best, setBest] = { easy: bestEasy, medium: bestMedium, hard: bestHard }[difficulty];

  useEffect(() => {
    if (result) return;
    const id = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [result, resetKey, difficulty]);

  const reset = useCallback((next = difficulty) => {
    setDifficulty(next);
    setGuesses(0);
    setTime(0);
    setResult(null);
    setResetKey(k => k + 1);
  }, [difficulty]);

  const win = useCallback((count: number) => {
    setResult({ won: true });
    setBest(b => (!b || count < b ? count : b));
  }, [setBest]);

  return (
    <GamePageLayout width="620px">
      <GameHeader title="Code Breaker" kicker="Logic puzzle">
        <ScoreBox label="Guesses" value={`${guesses}/${config.maxGuesses}`} />
        <ScoreBox label="Time" value={time} tone="surface" />
      </GameHeader>

      <DifficultyPills options={options} value={difficulty} onChange={reset} color="var(--t-s14)" />

      <div className="relative mt-5">
        <BoardCodeBreaker
          key={`${difficulty}-${resetKey}`}
          difficulty={difficulty}
          onGuess={setGuesses}
          onWin={win}
          onLose={code => setResult({ won: false, code })}
        />
        {result?.won === true && (
          <WinOverlay title="Code cracked!" subtitle={`${guesses} ${guesses === 1 ? 'guess' : 'guesses'} · ${time}s`} onNewGame={() => reset()} />
        )}
        {result?.won === false && (
          <GameOverOverlay title="Locked out" subtitle={`The code was ${result.code.map(d => d + 1).join(' ')}`} onTryAgain={() => reset()} />
        )}
      </div>

      <p className="text-center font-body text-sm mt-3 text-muted-foreground">Best: {best || '—'} guesses</p>

      <HowToPlayPanel instructions={`Crack the hidden ${config.length}-digit code in ${config.maxGuesses} guesses or fewer. After each guess, a solid pip means a digit is right and in the right slot; a hollow pip means the digit is in the code but somewhere else. Pips don't say which digit they belong to — that's the puzzle. The meter counts how many codes still fit every clue so far. Type digits 1–${config.symbols}, use ←/→ to pick a slot and ↑/↓ to cycle it, Backspace to delete, and Enter to check — or tap the palette below the board.`} />
    </GamePageLayout>
  );
}
