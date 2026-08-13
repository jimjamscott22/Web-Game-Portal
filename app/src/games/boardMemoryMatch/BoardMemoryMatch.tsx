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
  return <><div className="grid gap-2 p-3 bg-white border-4 border-dark rounded-2xl mx-auto" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: cols === 6 ? 560 : 430 }} role="grid">{deck.map((card, index) => <button key={card.id} onClick={() => { setCursor(index); choose(card.id); }} className={`memory-card aspect-square min-h-12 rounded-lg border-[3px] border-dark font-pixel text-2xl sm:text-3xl ${card.faceUp || card.matched ? 'is-revealed bg-[#FFF1BA]' : 'bg-[#8ABAC5]'} ${cursor === index ? 'ring-4 ring-accent ring-offset-1' : ''}`} aria-label={card.faceUp || card.matched ? card.symbol : 'Hidden card'} aria-pressed={card.faceUp || card.matched}>{(card.faceUp || card.matched) ? card.symbol : '?'}</button>)}</div><MobileControls color="#8ABAC5" onUp={() => move(-cols)} onDown={() => move(cols)} onLeft={() => move(-1)} onRight={() => move(1)} /></>;
}
