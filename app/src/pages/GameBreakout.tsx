import { useCallback, useState } from 'react';
import BoardBreakout from '@/games/boardBreakout/BoardBreakout';
import { LEVELS, type Difficulty } from '@/games/boardBreakout/gameLogic';
import GamePageLayout from '@/components/GamePageLayout';
import GameHeader from '@/components/GameHeader';
import ScoreBox from '@/components/ScoreBox';
import DifficultyPills from '@/components/DifficultyPills';
import HowToPlayPanel from '@/components/HowToPlayPanel';
import WinOverlay from '@/components/WinOverlay';
import GameOverOverlay from '@/components/GameOverOverlay';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const options: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy · 5 lives' },
  { value: 'normal', label: 'Normal · 3 lives' },
  { value: 'hard', label: 'Hard · 3 lives' },
];

export default function GameBreakout() {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<'won' | 'lost' | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const bestEasy = useLocalStorage('pixelplay-breakout-best-easy', 0);
  const bestNormal = useLocalStorage('pixelplay-breakout-best-normal', 0);
  const bestHard = useLocalStorage('pixelplay-breakout-best-hard', 0);
  const [best, setBest] = { easy: bestEasy, normal: bestNormal, hard: bestHard }[difficulty];

  const reset = useCallback((next = difficulty) => {
    setDifficulty(next);
    setScore(0);
    setResult(null);
    setResetKey(k => k + 1);
  }, [difficulty]);

  const handleScore = useCallback((next: number) => {
    setScore(next);
    setBest(b => Math.max(b, next));
  }, [setBest]);

  return (
    <GamePageLayout width="620px">
      <GameHeader title="Breakout" kicker="Arcade">
        <ScoreBox label="Score" value={score} />
        <ScoreBox label="Best" value={best} tone="surface" />
      </GameHeader>

      <DifficultyPills options={options} value={difficulty} onChange={reset} color="var(--t-s13)" />

      <div className="relative mt-5">
        <BoardBreakout
          key={`${difficulty}-${resetKey}`}
          difficulty={difficulty}
          onScoreChange={handleScore}
          onGameOver={() => setResult('lost')}
          onWin={() => setResult('won')}
        />
        {result === 'won' && (
          <WinOverlay title="Wall cleared!" subtitle={`All ${LEVELS.length} levels smashed`} score={score} best={best} onNewGame={() => reset()} />
        )}
        {result === 'lost' && (
          <GameOverOverlay title="Out of balls" score={score} best={best} onTryAgain={() => reset()} />
        )}
      </div>

      <div className="max-w-[480px] mx-auto">
        <HowToPlayPanel instructions={`Bounce the ball off your paddle to smash every brick across ${LEVELS.length} levels. Where the ball lands on the paddle sets its angle — hit it near the edge for a sharp shot. Pips on a brick show how many more hits it can take. Move with the arrow keys or A/D, the mouse, or by dragging on the field. Press Space or tap to launch, and P to pause.`} />
      </div>
    </GamePageLayout>
  );
}
