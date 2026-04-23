import { useState, useCallback } from 'react';
import Board2048 from '@/games/board2048/Board2048';
import ScoreBox from '@/components/ScoreBox';
import PixelButton from '@/components/PixelButton';
import HowToPlayPanel from '@/components/HowToPlayPanel';
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
    <div className="min-h-screen pt-[72px] pb-12 px-4 bg-[#F5F5F5]">
      <div className="max-w-[500px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-pixel text-5xl font-bold text-game-yellow" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>
            2048
          </h1>
          <div className="flex gap-2">
            <ScoreBox label="Score" value={score} bgColor="#FCB630" />
            <ScoreBox label="Best" value={best} bgColor="#FFFFFF" />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <PixelButton variant="primary" size="sm" onClick={handleNewGame}>
            New Game
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
      </div>
    </div>
  );
}
