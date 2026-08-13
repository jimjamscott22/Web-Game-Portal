export type Difficulty = 'easy' | 'medium' | 'hard';
export type SimonPhase = 'idle' | 'playback' | 'input' | 'gameover';
export const SIMON_CONFIG: Record<Difficulty, { panels: number; flashMs: number; pauseMs: number }> = { easy: { panels: 4, flashMs: 520, pauseMs: 250 }, medium: { panels: 4, flashMs: 360, pauseMs: 180 }, hard: { panels: 6, flashMs: 240, pauseMs: 110 } };
export function appendStep(sequence: number[], panels: number, random = Math.random): number[] { return [...sequence, Math.floor(random() * panels)]; }
export function compareInput(sequence: number[], input: number[]): 'correct' | 'incomplete' | 'wrong' { if (input.some((value, i) => value !== sequence[i])) return 'wrong'; return input.length === sequence.length ? 'correct' : 'incomplete'; }
export function playbackAt(sequence: number[], elapsed: number, flashMs: number, pauseMs: number): { active: number | null; complete: boolean } { const stepMs = flashMs + pauseMs; const index = Math.floor(elapsed / stepMs); return { active: index < sequence.length && elapsed % stepMs < flashMs ? sequence[index] : null, complete: index >= sequence.length }; }
