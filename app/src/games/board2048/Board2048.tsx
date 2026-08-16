import { useCallback, useState } from 'react';
import {
  createBoard,
  move,
  addRandomTile,
  hasMoves,
  hasWon,
  getTileColor,
  getTileFontSize,
  resetIdCounter,
  type Direction,
  type Tile,
} from './gameLogic';
import { useSwipe } from '@/hooks/useSwipe';
import { useKeyboard } from '@/hooks/useKeyboard';
import WinOverlay from '@/components/WinOverlay';
import GameOverOverlay from '@/components/GameOverOverlay';

interface Board2048Props {
  score: number;
  best: number;
  onScoreChange: (delta: number) => void;
  onGameOver: () => void;
}

export default function Board2048({ score, best, onScoreChange, onGameOver }: Board2048Props) {
  const [board, setBoard] = useState<(Tile | null)[][]>(() => {
    resetIdCounter();
    return createBoard();
  });
  const [won, setWon] = useState(false);
  const [wonDisplayed, setWonDisplayed] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [keepGoing, setKeepGoing] = useState(false);
  const [shake, setShake] = useState(false);

  const reset = useCallback(() => {
    resetIdCounter();
    setBoard(createBoard());
    setWon(false);
    setWonDisplayed(false);
    setGameOver(false);
    setKeepGoing(false);
    setShake(false);
    onScoreChange(-score);
  }, [score, onScoreChange]);

  const handleMove = useCallback((direction: Direction) => {
    if (gameOver || (won && !keepGoing)) return;

    const { newBoard, scoreDelta, moved } = move(board, direction);
    if (!moved) return;

    addRandomTile(newBoard);
    setBoard(newBoard);
    onScoreChange(scoreDelta);

    // A move can hit 2048 and exhaust the board at the same time. Let the
    // win overlay take priority; game-over is (re)checked once it's dismissed.
    const justWon = hasWon(newBoard) && !wonDisplayed;

    if (!justWon && !hasMoves(newBoard)) {
      setTimeout(() => {
        setShake(true);
        setGameOver(true);
        onGameOver();
        setTimeout(() => setShake(false), 400);
      }, 200);
    }

    if (justWon) {
      setWon(true);
    }
  }, [board, gameOver, won, keepGoing, onScoreChange, onGameOver, wonDisplayed]);

  const handleKeepGoing = useCallback(() => {
    setWonDisplayed(true);
    setKeepGoing(true);

    if (!hasMoves(board)) {
      setShake(true);
      setGameOver(true);
      onGameOver();
      setTimeout(() => setShake(false), 400);
    }
  }, [board, onGameOver]);

  useKeyboard({
    arrowup: () => handleMove('up'),
    arrowdown: () => handleMove('down'),
    arrowleft: () => handleMove('left'),
    arrowright: () => handleMove('right'),
    w: () => handleMove('up'),
    s: () => handleMove('down'),
    a: () => handleMove('left'),
    d: () => handleMove('right'),
  }, [handleMove]);

  const swipeHandlers = useSwipe({
    onSwipeUp: () => handleMove('up'),
    onSwipeDown: () => handleMove('down'),
    onSwipeLeft: () => handleMove('left'),
    onSwipeRight: () => handleMove('right'),
  });

  const tiles: Tile[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c]) tiles.push(board[r][c]!);
    }
  }

  return (
    <div
      className={`relative w-full max-w-[400px] mx-auto aspect-square bg-board rounded-card p-3.5 select-none ${shake ? 'animate-shake' : ''}`}
      {...swipeHandlers}
    >
      <div className="grid grid-cols-4 grid-rows-4 gap-3 w-full h-full">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="rounded-tile bg-cell" />
        ))}
      </div>

      <div className="absolute inset-3.5">
        {tiles.map((tile) => {
          const color = getTileColor(tile.value);
          const fontSize = getTileFontSize(tile.value);
          return (
            <div
              key={tile.id}
              className={`absolute w-[calc(25%-9px)] h-[calc(25%-9px)] rounded-tile flex items-center justify-center font-pixel font-bold shadow-game-tile transition-all duration-150 snap-ease ${
                tile.isNew ? 'animate-tile-spawn' : ''
              } ${tile.isMerged ? 'animate-tile-merge' : ''} ${
                tile.value >= 128 ? 'animate-pulse' : ''
              }`}
              style={{
                left: `calc(${tile.col * 25}% + ${tile.col * 3}px)`,
                top: `calc(${tile.row * 25}% + ${tile.row * 3}px)`,
                backgroundColor: color.bg,
                color: color.text,
                fontSize,
              }}
            >
              {tile.value}
            </div>
          );
        })}
      </div>

      {won && !wonDisplayed && (
        <WinOverlay
          title="You win!"
          score={score}
          best={best}
          onKeepGoing={handleKeepGoing}
          onNewGame={reset}
        />
      )}

      {gameOver && (
        <GameOverOverlay title="Out of moves" score={score} best={best} onTryAgain={reset} />
      )}
    </div>
  );
}
