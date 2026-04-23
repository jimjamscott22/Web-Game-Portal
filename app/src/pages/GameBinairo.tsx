import { useState, useCallback } from 'react';
import BoardBinairo from '@/games/boardBinairo/BoardBinairo';
import HowToPlayPanel from '@/components/HowToPlayPanel';

export default function GameBinairo() {
  const [timerSeconds, setTimerSeconds] = useState(0);

  const handleTimerTick = useCallback(() => {
    setTimerSeconds(s => s + 1);
  }, []);

  return (
    <div className="min-h-screen pt-[72px] pb-12 px-4 bg-[#F5F5F5]">
      <div className="max-w-[820px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1
            className="font-pixel text-5xl font-bold"
            style={{ color: '#7C4DFF', textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}
          >
            Binairo
          </h1>
        </div>

        <BoardBinairo onTimerTick={handleTimerTick} timerSeconds={timerSeconds} />

        <div className="max-w-[560px] mx-auto mt-6">
          <HowToPlayPanel
            instructions="Fill every cell with a 0 or a 1 so that: (1) no three of the same digit appear consecutively in any row or column, (2) each row and column has an equal count of 0s and 1s, and (3) no two rows or columns are identical. Tap a cell to cycle empty → 0 → 1. On keyboard, arrow keys move, 0/1 set, Backspace clears. Turn Decimal ON to see each row and column interpreted as a binary number."
          />
        </div>
      </div>
    </div>
  );
}
