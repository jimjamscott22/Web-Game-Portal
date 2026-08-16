import { useState, useCallback } from 'react';
import BoardTetris from '@/games/boardTetris/BoardTetris';
import ScoreBox from '@/components/ScoreBox';
import HowToPlayPanel from '@/components/HowToPlayPanel';
import GamePageLayout from '@/components/GamePageLayout';
import GameHeader from '@/components/GameHeader';
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
    <GamePageLayout width="820px">
      <GameHeader title="Tetris" kicker="Falling blocks">
        <ScoreBox label="Best" value={best} tone="surface" />
      </GameHeader>

      <BoardTetris
        onScoreChange={handleScoreChange}
        onLevelChange={setLevel}
        onLinesChange={setLines}
      />

      <div className="max-w-[520px] mx-auto">
        <HowToPlayPanel
          instructions="Use arrow keys to move and rotate pieces. Clear complete rows to score points. The game speeds up as you level up. Stack pieces strategically to avoid filling the board!"
        />
      </div>
    </GamePageLayout>
  );
}
