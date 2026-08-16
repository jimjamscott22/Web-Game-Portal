import { useState, useCallback } from 'react';
import BoardSnake from '@/games/boardSnake/BoardSnake';
import ScoreBox from '@/components/ScoreBox';
import HowToPlayPanel from '@/components/HowToPlayPanel';
import GamePageLayout from '@/components/GamePageLayout';
import GameHeader from '@/components/GameHeader';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function GameSnake() {
  const [score, setScore] = useState(0);
  const [best, setBest] = useLocalStorage('pixelplay-snake-best', 0);

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore);
    setBest(b => Math.max(b, newScore));
  }, [setBest]);

  return (
    <GamePageLayout width="620px">
      <GameHeader title="Snake" kicker="Arcade">
        <ScoreBox label="Score" value={score} />
        <ScoreBox label="Best" value={best} tone="surface" />
      </GameHeader>

      <BoardSnake onScoreChange={handleScoreChange} />

      <div className="max-w-[520px] mx-auto">
        <HowToPlayPanel
          instructions="Use arrow keys or WASD to guide the snake. Eat the 1 and 0 foods to grow. The bits you eat form a binary number that becomes your score! Don't hit the walls or yourself."
        />
      </div>
    </GamePageLayout>
  );
}
