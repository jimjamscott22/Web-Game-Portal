import { useState, useCallback } from 'react';
import BoardSudoku from '@/games/boardSudoku/BoardSudoku';
import HowToPlayPanel from '@/components/HowToPlayPanel';

export default function GameSudoku() {
  const [timerSeconds, setTimerSeconds] = useState(0);

  const handleTimerTick = useCallback(() => {
    setTimerSeconds(s => s + 1);
  }, []);

  return (
    <div className="min-h-screen pt-[72px] pb-12 px-4 bg-[#F5F5F5]">
      <div className="max-w-[700px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-pixel text-5xl font-bold text-game-orange" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>
            Sudoku
          </h1>
        </div>

        <BoardSudoku onTimerTick={handleTimerTick} timerSeconds={timerSeconds} />

        <div className="max-w-[500px] mx-auto mt-6">
          <HowToPlayPanel
            instructions="Click a cell to select it, then click a number to fill it. Fill the 9×9 grid so each row, column, and 3×3 box contains digits 1-9. Use Notes mode to pencil in possibilities. Press 1-9 on keyboard to enter numbers."
          />
        </div>
      </div>
    </div>
  );
}
