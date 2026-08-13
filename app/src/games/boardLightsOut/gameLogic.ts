export type Difficulty = 'easy' | 'medium' | 'hard';
export type LightGrid = boolean[][];
export const LIGHTS_CONFIG: Record<Difficulty, { size: number; scrambles: number }> = { easy: { size: 3, scrambles: 5 }, medium: { size: 5, scrambles: 12 }, hard: { size: 7, scrambles: 24 } };
export const createGrid = (size: number): LightGrid => Array.from({ length: size }, () => Array(size).fill(false));
export function toggle(grid: LightGrid, row: number, col: number): LightGrid { const next = grid.map(line => [...line]); [[row,col],[row-1,col],[row+1,col],[row,col-1],[row,col+1]].forEach(([r,c]) => { if (r >= 0 && c >= 0 && r < next.length && c < next.length) next[r][c] = !next[r][c]; }); return next; }
export function generatePuzzle(difficulty: Difficulty, random = Math.random): LightGrid { const { size, scrambles } = LIGHTS_CONFIG[difficulty]; let grid = createGrid(size); const used = new Set<number>(); while (used.size < Math.min(scrambles, size * size)) used.add(Math.floor(random() * size * size)); used.forEach(i => { grid = toggle(grid, Math.floor(i / size), i % size); }); return isSolved(grid) ? toggle(grid, 0, 0) : grid; }
export const isSolved = (grid: LightGrid) => grid.every(row => row.every(light => !light));
