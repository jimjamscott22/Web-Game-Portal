export interface GameConfig {
  id: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
  route: string;
  previewImage: string;
  difficulties: string[];
  defaultDifficulty: string;
}

export interface ScoreData {
  score: number;
  best: number;
}

export interface NavGame {
  id: string;
  title: string;
  color: string;
  route: string;
}

export const GAMES: GameConfig[] = [
  {
    id: '2048',
    title: '2048',
    description: 'Slide numbered tiles on a grid to combine them and create a tile with the number 2048.',
    color: 'var(--t-s1)',
    bgColor: 'var(--t-s1)',
    route: '/2048',
    previewImage: '/assets/card-preview-2048.png',
    difficulties: ['Easy', 'Medium', 'Hard'],
    defaultDifficulty: 'Easy',
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    description: 'Uncover all safe squares without detonating any hidden mines. Use the numbers as clues.',
    color: 'var(--t-s2)',
    bgColor: 'var(--t-s2)',
    route: '/minesweeper',
    previewImage: '/assets/card-preview-minesweeper.png',
    difficulties: ['Beginner', 'Intermediate', 'Expert'],
    defaultDifficulty: 'Beginner',
  },
  {
    id: 'snake',
    title: 'Snake',
    description: "Guide the hungry snake to eat binary bits and grow longer. The bits you eat form your score! Don't crash into the walls or yourself!",
    color: 'var(--t-s3)',
    bgColor: 'var(--t-s3)',
    route: '/snake',
    previewImage: '/assets/card-preview-snake.png',
    difficulties: ['Slow', 'Normal', 'Fast'],
    defaultDifficulty: 'Normal',
  },
  {
    id: 'tetris',
    title: 'Tetris',
    description: 'Rotate and drop falling blocks to create complete rows. Clear lines and keep the stack low.',
    color: 'var(--t-s4)',
    bgColor: 'var(--t-s4)',
    route: '/tetris',
    previewImage: '/assets/card-preview-tetris.png',
    difficulties: ['Easy', 'Normal', 'Hard'],
    defaultDifficulty: 'Normal',
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'Fill the 9×9 grid so that each row, column, and 3×3 box contains all digits from 1 to 9.',
    color: 'var(--t-s5)',
    bgColor: 'var(--t-s5)',
    route: '/sudoku',
    previewImage: '/assets/card-preview-sudoku.png',
    difficulties: ['Easy', 'Medium', 'Hard'],
    defaultDifficulty: 'Easy',
  },
  {
    id: 'binairo',
    title: 'Binairo',
    description: 'Place 0s and 1s on the grid — no three alike in a row, equal counts per line, every row and column unique.',
    color: 'var(--t-s6)',
    bgColor: 'var(--t-s6)',
    route: '/binairo',
    previewImage: '/assets/card-preview-binairo.svg',
    difficulties: ['Easy', 'Medium', 'Hard'],
    defaultDifficulty: 'Easy',
  },
  {
    id: 'gate-grid',
    title: 'Gate Grid',
    description: 'Assign AND, OR, XOR, NAND, and NOR gates into a fixed circuit and toggle wire inverters until your truth table matches the target.',
    color: 'var(--t-s10)',
    bgColor: 'var(--t-s10)',
    route: '/gate-grid',
    previewImage: '/assets/card-preview-gate-grid.svg',
    difficulties: ['Beginner', 'Intermediate', 'Expert'],
    defaultDifficulty: 'Beginner',
  },
  {
    id: 'roboroute',
    title: 'RoboRoute',
    description: 'Build readable programs with sequences, loops, and conditions to guide a robot through twelve handcrafted routes.',
    color: 'var(--t-s11)',
    bgColor: 'var(--t-s11)',
    route: '/roboroute',
    previewImage: '/assets/card-preview-roboroute.png',
    difficulties: ['Sequences', 'Loops', 'Logic'],
    defaultDifficulty: 'Sequences',
  },
  { id: 'memory-match', title: 'Memory Match', description: 'Flip pixel cards, remember their symbols, and match every pair.', color: 'var(--t-s7)', bgColor: 'var(--t-s7)', route: '/memory-match', previewImage: '/assets/card-preview-memory-match.svg', difficulties: ['Easy','Medium','Hard'], defaultDifficulty: 'Easy' },
  { id: 'lights-out', title: 'Lights Out', description: 'Toggle each light and its neighbors until the whole grid goes dark.', color: 'var(--t-s8)', bgColor: 'var(--t-s8)', route: '/lights-out', previewImage: '/assets/card-preview-lights-out.svg', difficulties: ['Easy','Medium','Hard'], defaultDifficulty: 'Easy' },
  { id: 'simon-says', title: 'Simon Says', description: 'Watch the colorful sequence grow, then repeat every flash from memory.', color: 'var(--t-s9)', bgColor: 'var(--t-s9)', route: '/simon-says', previewImage: '/assets/card-preview-simon-says.svg', difficulties: ['Easy','Medium','Hard'], defaultDifficulty: 'Easy' },
  { id: 'nonogram', title: 'Nonogram', description: 'Use the numeric clues to fill in the grid and reveal a hidden pixel-art picture.', color: 'var(--t-s12)', bgColor: 'var(--t-s12)', route: '/nonogram', previewImage: '/assets/card-preview-nonogram.svg', difficulties: ['5x5', '10x10', '15x15'], defaultDifficulty: '5x5' },
];

export const NAV_GAMES: NavGame[] = GAMES.map(g => ({
  id: g.id,
  title: g.title,
  color: g.color,
  route: g.route,
}));
