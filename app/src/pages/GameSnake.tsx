import { useState, useCallback } from 'react';
import BoardSnake from '@/games/boardSnake/BoardSnake';
import ScoreBox from '@/components/ScoreBox';
import HowToPlayPanel from '@/components/HowToPlayPanel';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function GameSnake() {
  const [score, setScore] = useState(0);
  const [best, setBest] = useLocalStorage('pixelplay-snake-best', 0);

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore);
    setBest(b => Math.max(b, newScore));
  }, [setBest]);

  return (
    <div className="min-h-screen pt-[72px] pb-12 px-4 bg-[#F5F5F5]">
      <div className="max-w-[600px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-pixel text-5xl font-bold text-game-green" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>
            Snake
          </h1>
          <div className="flex gap-2">
            <ScoreBox label="Score" value={score} bgColor="#8CC298" />
            <ScoreBox label="Best" value={best} bgColor="#FFFFFF" />
          </div>
        </div>

        <BoardSnake onScoreChange={handleScoreChange} />

        <div className="max-w-[500px] mx-auto mt-6">
          <HowToPlayPanel
            instructions="Use arrow keys or WASD to guide the snake. Eat the 1 and 0 foods to grow. The bits you eat form a binary number that becomes your score! Don't hit the walls or yourself!."
          />
        </div>
      </div>
    </div>
  );
}
