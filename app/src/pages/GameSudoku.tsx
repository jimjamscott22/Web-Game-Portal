import { useState, useCallback } from 'react';
import BoardSudoku from '@/games/boardSudoku/BoardSudoku';
import HowToPlayPanel from '@/components/HowToPlayPanel';
import GamePageLayout from '@/components/GamePageLayout';
import GameHeader from '@/components/GameHeader';

export default function GameSudoku() {
  const [timerSeconds, setTimerSeconds] = useState(0);

  const handleTimerTick = useCallback(() => {
    setTimerSeconds(s => s + 1);
  }, []);

  return (
    <GamePageLayout width="760px">
      <GameHeader title="Sudoku" kicker="Logic grid" />

      <BoardSudoku onTimerTick={handleTimerTick} timerSeconds={timerSeconds} />

      <div className="max-w-[520px] mx-auto">
          <HowToPlayPanel
            instructions="Click a cell to select it, then click a number to fill it. Fill the 9×9 grid so each row, column, and 3×3 box contains digits 1-9. Use Notes mode to pencil in possibilities. Press 1-9 on keyboard to enter numbers."
          />
      </div>
    </GamePageLayout>
  );
}
