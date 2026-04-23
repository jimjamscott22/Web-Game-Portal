import { useState, useCallback } from 'react';
import BoardTetris from '@/games/boardTetris/BoardTetris';
import ScoreBox from '@/components/ScoreBox';
import HowToPlayPanel from '@/components/HowToPlayPanel';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function GameTetris() {
  const [, setScore] = useState(0);
  const [, setLevel] = useState(1);
  const [, setLines] = useState(0);
  const [best, setBest] = useLocalStorage('pixelplay-tetris-best', 0);

  const handleScoreChange = useCallback((newScore: number) => {
    setScore(newScore);
    setBest(b => Math.max(b, newScore));
  }, [setBest]);

  return (
    <div className="min-h-screen pt-[72px] pb-12 px-4 bg-[#F5F5F5]">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-pixel text-5xl font-bold text-game-pink" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>
            Tetris
          </h1>
          <ScoreBox label="Best" value={best} bgColor="#FFFFFF" />
        </div>

        <BoardTetris
          onScoreChange={handleScoreChange}
          onLevelChange={setLevel}
          onLinesChange={setLines}
        />

        <div className="max-w-[500px] mx-auto mt-6">
          <HowToPlayPanel
            instructions="Use arrow keys to move and rotate pieces. Clear complete rows to score points. The game speeds up as you level up. Stack pieces strategically to avoid filling the board!"
          />
        </div>
      </div>
    </div>
  );
}
