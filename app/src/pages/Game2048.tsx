import { useState, useCallback } from 'react';
import Board2048 from '@/games/board2048/Board2048';
import ScoreBox from '@/components/ScoreBox';
import PixelButton from '@/components/PixelButton';
import HowToPlayPanel from '@/components/HowToPlayPanel';
import GamePageLayout from '@/components/GamePageLayout';
import GameHeader from '@/components/GameHeader';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function Game2048() {
  const [score, setScore] = useState(0);
  const [best, setBest] = useLocalStorage('pixelplay-2048-best', 0);

  const handleScoreChange = useCallback((delta: number) => {
    setScore(prev => {
      const newScore = Math.max(0, prev + delta);
      setBest(b => Math.max(b, newScore));
      return newScore;
    });
  }, [setBest]);

  const handleGameOver = useCallback(() => {
    setBest(b => Math.max(b, score));
  }, [score, setBest]);

  const handleNewGame = useCallback(() => {
    setScore(0);
    window.location.reload();
  }, []);

  return (
    <GamePageLayout width="520px">
      <GameHeader title="2048" kicker="Sliding puzzle">
        <ScoreBox label="Score" value={score} />
        <ScoreBox label="Best" value={best} tone="surface" />
      </GameHeader>

      <div className="flex items-center gap-2.5 mb-6">
        <PixelButton variant="primary" size="sm" onClick={handleNewGame}>
          New game
        </PixelButton>
      </div>

      <Board2048
        score={score}
        best={best}
        onScoreChange={handleScoreChange}
        onGameOver={handleGameOver}
      />

      <HowToPlayPanel
        instructions="Use arrow keys or swipe to slide tiles. When two tiles with the same number touch, they merge into one! Reach 2048 to win."
      />
    </GamePageLayout>
  );
}
