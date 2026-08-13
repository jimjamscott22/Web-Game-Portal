export type Difficulty = 'easy' | 'medium' | 'hard';
export type Card = { id: number; pairId: number; symbol: string; faceUp: boolean; matched: boolean };
export const MEMORY_SIZES: Record<Difficulty, { rows: number; cols: number }> = { easy: { rows: 4, cols: 4 }, medium: { rows: 4, cols: 6 }, hard: { rows: 6, cols: 6 } };
export const SYMBOLS = ['★','♥','◆','●','▲','☀','☂','♫','⚡','☕','✿','☁','♣','♛','☯','✈','⌁','✦'];
export function shuffle<T>(items: T[], random = Math.random): T[] { const result = [...items]; for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; }
export function createDeck(difficulty: Difficulty, random = Math.random): Card[] { const pairs = MEMORY_SIZES[difficulty].rows * MEMORY_SIZES[difficulty].cols / 2; return shuffle(Array.from({ length: pairs }, (_, pairId) => [0, 1].map(copy => ({ id: pairId * 2 + copy, pairId, symbol: SYMBOLS[pairId], faceUp: false, matched: false }))).flat(), random); }
export function flipCard(deck: Card[], id: number): Card[] { return deck.map(card => card.id === id && !card.matched ? { ...card, faceUp: true } : card); }
export function resolvePair(deck: Card[], ids: [number, number]): { deck: Card[]; match: boolean } { const [a,b] = ids.map(id => deck.find(card => card.id === id)); const match = Boolean(a && b && a.pairId === b.pairId); return { match, deck: deck.map(card => ids.includes(card.id) ? { ...card, faceUp: match, matched: match } : card) }; }
export const isWon = (deck: Card[]) => deck.length > 0 && deck.every(card => card.matched);
