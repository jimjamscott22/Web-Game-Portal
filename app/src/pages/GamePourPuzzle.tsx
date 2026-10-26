import { useCallback, useState } from 'react';
import { Star } from 'lucide-react';
import BoardPourPuzzle from '@/games/boardPourPuzzle/BoardPourPuzzle';
import { LEVELS, TIERS, par, starsFor, type Tier } from '@/games/boardPourPuzzle/gameLogic';
import GamePageLayout from '@/components/GamePageLayout';
import GameHeader from '@/components/GameHeader';
import ScoreBox from '@/components/ScoreBox';
import DifficultyPills from '@/components/DifficultyPills';
import HowToPlayPanel from '@/components/HowToPlayPanel';
import WinOverlay from '@/components/WinOverlay';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';

function Stars({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cn('inline-flex gap-0.5', className)} aria-label={`${count} of 3 stars`}>
      {[0, 1, 2].map(i => (
        <Star key={i} className={cn('w-3.5 h-3.5', i < count ? 'fill-current text-accent' : 'text-line')} />
      ))}
    </span>
  );
}

export default function GamePourPuzzle() {
  const [tier, setTier] = useState<Tier>('tap');
  const [levelIndex, setLevelIndex] = useState(0);
  const [moves, setMoves] = useState(0);
  const [result, setResult] = useState<{ moves: number; stars: number } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [stars, setStars] = useLocalStorage<Record<string, number>>('pixelplay-pour-puzzle-stars', {});

  const levels = LEVELS[tier];
  const level = levels[levelIndex];
  const levelPar = par(level);
  const hasNext = levelIndex < levels.length - 1;

  const goTo = useCallback((nextTier: Tier, index: number) => {
    setTier(nextTier);
    setLevelIndex(index);
    setMoves(0);
    setResult(null);
    setResetKey(k => k + 1);
  }, []);

  const win = useCallback(({ moves: count, usedHint }: { moves: number; usedHint: boolean }) => {
    const earned = starsFor(count, levelPar, usedHint);
    setResult({ moves: count, stars: earned });
    setStars(prev => ({ ...prev, [level.id]: Math.max(prev[level.id] ?? 0, earned) }));
  }, [levelPar, level.id, setStars]);

  const nextTierIndex = TIERS.findIndex(t => t.value === tier) + 1;
  const nextTier = TIERS[nextTierIndex]?.value;

  return (
    <GamePageLayout width="680px">
      <GameHeader title="Pour Puzzle" kicker="Logic puzzle">
        <ScoreBox label="Moves" value={moves} />
        <ScoreBox label="Par" value={levelPar} tone="surface" />
      </GameHeader>

      <DifficultyPills options={TIERS} value={tier} onChange={t => goTo(t, 0)} color="var(--t-s15)" />

      <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Levels">
        {levels.map((l, i) => (
          <button
            key={l.id}
            onClick={() => goTo(tier, i)}
            aria-pressed={i === levelIndex}
            className={cn(
              'min-h-11 px-3 rounded-tile border border-line flex flex-col items-center justify-center font-body text-xs',
              i === levelIndex ? 'bg-surface text-ink font-semibold shadow-card' : 'text-muted-foreground hover:bg-panel',
            )}
          >
            <span>{i + 1}. {l.name}</span>
            <Stars count={stars[l.id] ?? 0} />
          </button>
        ))}
      </div>

      <div className="relative mt-5">
        <BoardPourPuzzle key={`${level.id}-${resetKey}`} level={level} onMove={setMoves} onWin={win} />
        {result && (
          <WinOverlay
            title={result.stars === 3 ? 'Perfect pour!' : 'Measured!'}
            subtitle={`${'★'.repeat(result.stars)}${'☆'.repeat(3 - result.stars)} · ${result.moves} moves (par ${levelPar}). ${level.insight}`}
            onKeepGoing={hasNext ? () => goTo(tier, levelIndex + 1) : nextTier ? () => goTo(nextTier, 0) : undefined}
            keepGoingLabel={hasNext ? 'Next level' : 'Next set'}
            onNewGame={() => goTo(tier, levelIndex)}
            newGameLabel="Replay"
          />
        )}
      </div>

      <HowToPlayPanel instructions="Measure out the goal amount using jugs with no markings. Tap a jug to pick it up, then tap another to pour — water flows until the source is empty or the target is full. On tap levels you can also fill a jug to the brim or empty it out. 'No tap' levels start with a fixed amount of water you can only move around. Match the par (the fewest possible moves) for three stars; a hint shows the best next move but caps you at two. Keyboard: 1–3 pick/pour, ←/→ + Enter, F fill, E empty, Z undo, R restart, H hint." />
    </GamePageLayout>
  );
}
