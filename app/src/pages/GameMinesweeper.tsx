import { useState } from 'react';
import BoardMinesweeper from '@/games/boardMinesweeper/BoardMinesweeper';
import HowToPlayPanel from '@/components/HowToPlayPanel';
import PixelButton from '@/components/PixelButton';
import GamePageLayout from '@/components/GamePageLayout';
import GameHeader from '@/components/GameHeader';

export default function GameMinesweeper() {
  const [resetKey, setResetKey] = useState(0);

  const handleNewGame = () => {
    setResetKey(k => k + 1);
  };

  return (
    <GamePageLayout width="760px">
      <GameHeader title="Minesweeper" kicker="Deduction">
        <PixelButton variant="primary" size="sm" onClick={handleNewGame}>
          New game
        </PixelButton>
      </GameHeader>

      <div className="flex justify-center">
        <BoardMinesweeper key={resetKey} />
      </div>

      <div className="max-w-[520px] mx-auto">
        <HowToPlayPanel
          instructions="Left-click to reveal a cell. Right-click to place a flag. Numbers indicate how many mines are adjacent. Flag all mines to win! Use Flag Mode on mobile to place flags with taps."
        />
      </div>
    </GamePageLayout>
  );
}
