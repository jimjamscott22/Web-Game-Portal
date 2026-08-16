import { useState, useCallback } from 'react';
import BoardBinairo from '@/games/boardBinairo/BoardBinairo';
import HowToPlayPanel from '@/components/HowToPlayPanel';
import GamePageLayout from '@/components/GamePageLayout';
import GameHeader from '@/components/GameHeader';

export default function GameBinairo() {
  const [timerSeconds, setTimerSeconds] = useState(0);

  const handleTimerTick = useCallback(() => {
    setTimerSeconds(s => s + 1);
  }, []);

  return (
    <GamePageLayout width="860px">
      <GameHeader title="Binairo" kicker="Binary logic" />

      <BoardBinairo onTimerTick={handleTimerTick} timerSeconds={timerSeconds} />

      <div className="max-w-[560px] mx-auto">
          <HowToPlayPanel
            instructions="Fill every cell with a 0 or a 1 so that: (1) no three of the same digit appear consecutively in any row or column, (2) each row and column has an equal count of 0s and 1s, and (3) no two rows or columns are identical. Tap a cell to cycle empty → 0 → 1. On keyboard, arrow keys move, 0/1 set, Backspace clears. Turn Decimal ON to see each row and column interpreted as a binary number."
          />
      </div>
    </GamePageLayout>
  );
}
