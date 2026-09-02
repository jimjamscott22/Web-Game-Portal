import { useCallback, useEffect, useState } from 'react';
import BoardNonogram from '@/games/boardNonogram/BoardNonogram';
import type { Difficulty } from '@/games/boardNonogram/gameLogic';
import GamePageLayout from '@/components/GamePageLayout';
import GameHeader from '@/components/GameHeader';
import ScoreBox from '@/components/ScoreBox';
import DifficultyPills from '@/components/DifficultyPills';
import HowToPlayPanel from '@/components/HowToPlayPanel';
import WinOverlay from '@/components/WinOverlay';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const options: { value: Difficulty; label: string }[] = [
  { value: '5x5', label: '5x5 Grid' },
  { value: '10x10', label: '10x10 Grid' },
  { value: '15x15', label: '15x15 Grid' }
];

export default function GameNonogram() {
  const [difficulty, setDifficulty] = useState<Difficulty>('5x5');
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [won, setWon] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const bestTimeEasy = useLocalStorage('pixelplay-nonogram-best-time-5x5', 0);
  const bestTimeMedium = useLocalStorage('pixelplay-nonogram-best-time-10x10', 0);
  const bestTimeHard = useLocalStorage('pixelplay-nonogram-best-time-15x15', 0);
  
  const [bestTime, setBestTime] = {
    '5x5': bestTimeEasy,
    '10x10': bestTimeMedium,
    '15x15': bestTimeHard
  }[difficulty];

  useEffect(() => {
    if (won) return;
    const id = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [won, resetKey, difficulty]);

  const reset = useCallback((next = difficulty) => {
    setDifficulty(next);
    setMoves(0);
    setTime(0);
    setWon(false);
    setResetKey(k => k + 1);
  }, [difficulty]);

  const win = useCallback(() => {
    setWon(true);
    setBestTime(b => !b || time < b ? time : b);
  }, [time, setBestTime]);

  return (
    <GamePageLayout width="800px">
      <GameHeader title="Nonogram" kicker="Pixel puzzle">
        <ScoreBox label="Time" value={time} />
        <ScoreBox label="Moves" value={moves} tone="surface" />
      </GameHeader>
      
      <DifficultyPills 
        options={options} 
        value={difficulty} 
        onChange={reset} 
        color="var(--t-s12)" 
      />
      
      <div className="relative mt-5">
        <BoardNonogram 
          key={`${difficulty}-${resetKey}`} 
          difficulty={difficulty} 
          onMove={() => setMoves(m => m + 1)} 
          onWin={win} 
          resetKey={resetKey} 
        />
        {won && (
          <WinOverlay 
            title="Picture revealed!" 
            subtitle={`Finished in ${time}s`} 
            onNewGame={() => reset()} 
          />
        )}
      </div>
      
      <p className="text-center font-body text-sm mt-3 text-muted-foreground">
        Best: {bestTime || '—'} seconds
      </p>
      
      <HowToPlayPanel instructions="Use the numbers on the side and top of the grid as clues to fill in the correct squares. Each number indicates a contiguous line of filled squares. Between two lines, there must be at least one empty space. Left click to fill, Right click to mark an X for empty." />
    </GamePageLayout>
  );
}
