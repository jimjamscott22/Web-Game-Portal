import { useCallback, useState } from 'react';
import { createDeck, flipCard, isWon, resolvePair, MEMORY_SIZES, type Card, type Difficulty } from './gameLogic';
import { useKeyboard } from '@/hooks/useKeyboard';
import MobileControls from '@/components/MobileControls';

export default function BoardMemoryMatch({ difficulty, onMove, onWin, resetKey }: { difficulty: Difficulty; onMove: () => void; onWin: () => void; resetKey: number }) {
  const [deck, setDeck] = useState<Card[]>(() => createDeck(difficulty)); const [open, setOpen] = useState<number[]>([]); const [cursor, setCursor] = useState(0); const [locked, setLocked] = useState(false); const { cols } = MEMORY_SIZES[difficulty];
  void resetKey;
  const choose = useCallback((id: number) => { if (locked) return; const card = deck.find(c => c.id === id); if (!card || card.faceUp || card.matched || open.includes(id)) return; const next = flipCard(deck, id); setDeck(next); if (!open.length) return setOpen([id]); onMove(); setLocked(true); const ids: [number, number] = [open[0], id]; window.setTimeout(() => { const resolved = resolvePair(next, ids); setDeck(resolved.deck); setOpen([]); setLocked(false); if (isWon(resolved.deck)) onWin(); }, 650); }, [deck, locked, onMove, onWin, open]);
  const move = useCallback((delta: number) => setCursor(c => Math.max(0, Math.min(deck.length - 1, c + delta))), [deck.length]);
  useKeyboard({ arrowup: () => move(-cols), arrowdown: () => move(cols), arrowleft: () => move(-1), arrowright: () => move(1), enter: () => choose(deck[cursor]?.id), ' ': () => choose(deck[cursor]?.id) }, [move, choose, cursor, deck, cols]);
  // Face-down cards take the game hue; flipped cards go to --t-card with the
  // symbol in --t-accent-deep. Matched pairs fade to the DS disabled state.
  return <><div className="grid gap-2 p-3.5 bg-board rounded-card mx-auto" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: cols === 6 ? 560 : 430 }} role="grid">{deck.map((card, index) => { const revealed = card.faceUp || card.matched; return <button key={card.id} onClick={() => { setCursor(index); choose(card.id); }} className={`memory-card aspect-square min-h-12 rounded-tile font-pixel text-2xl sm:text-3xl transition-opacity ${revealed ? 'is-revealed bg-surface text-accent-deep' : 'bg-game-7 text-transparent'} ${card.matched ? 'opacity-45' : ''} ${cursor === index ? 'ring-2 ring-accent ring-offset-2 ring-offset-board' : ''}`} aria-label={revealed ? card.symbol : 'Hidden card'} aria-pressed={revealed}>{revealed ? card.symbol : '?'}</button>; })}</div><MobileControls color="var(--t-s7)" onUp={() => move(-cols)} onDown={() => move(cols)} onLeft={() => move(-1)} onRight={() => move(1)} /></>;
}
