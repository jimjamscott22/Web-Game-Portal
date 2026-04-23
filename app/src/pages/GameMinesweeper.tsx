import { useState } from 'react';
import BoardMinesweeper from '@/games/boardMinesweeper/BoardMinesweeper';
import HowToPlayPanel from '@/components/HowToPlayPanel';
import PixelButton from '@/components/PixelButton';

export default function GameMinesweeper() {
  const [resetKey, setResetKey] = useState(0);

  const handleNewGame = () => {
    setResetKey(k => k + 1);
  };

  return (
    <div className="min-h-screen pt-[72px] pb-12 px-4 bg-[#F5F5F5]">
      <div className="max-w-[700px] mx-auto">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h1 className="font-pixel text-5xl font-bold text-game-blue" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.1)' }}>
            Minesweeper
          </h1>
          <PixelButton variant="primary" size="sm" onClick={handleNewGame}>
            New Game
          </PixelButton>
        </div>

        <div className="flex justify-center">
          <BoardMinesweeper key={resetKey} />
        </div>

        <div className="max-w-[500px] mx-auto mt-6">
          <HowToPlayPanel
            instructions="Left-click to reveal a cell. Right-click to place a flag. Numbers indicate how many mines are adjacent. Flag all mines to win! Use Flag Mode on mobile to place flags with taps."
          />
        </div>
      </div>
    </div>
  );
}
