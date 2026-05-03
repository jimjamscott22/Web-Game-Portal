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
    color: '#FCB630',
    bgColor: '#FCB630',
    route: '/2048',
    previewImage: '/assets/card-preview-2048.png',
    difficulties: ['Easy', 'Medium', 'Hard'],
    defaultDifficulty: 'Easy',
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    description: 'Uncover all safe squares without detonating any hidden mines. Use the numbers as clues.',
    color: '#8ABAC5',
    bgColor: '#8ABAC5',
    route: '/minesweeper',
    previewImage: '/assets/card-preview-minesweeper.png',
    difficulties: ['Beginner', 'Intermediate', 'Expert'],
    defaultDifficulty: 'Beginner',
  },
  {
    id: 'snake',
    title: 'Snake',
    description: "Guide the hungry snake to eat binary bits and grow longer. The bits you eat form your score! Don't crash into the walls or yourself!",
    color: '#8CC298',
    bgColor: '#8CC298',
    route: '/snake',
    previewImage: '/assets/card-preview-snake.png',
    difficulties: ['Slow', 'Normal', 'Fast'],
    defaultDifficulty: 'Normal',
  },
  {
    id: 'tetris',
    title: 'Tetris',
    description: 'Rotate and drop falling blocks to create complete rows. Clear lines and keep the stack low.',
    color: '#F76CA5',
    bgColor: '#F76CA5',
    route: '/tetris',
    previewImage: '/assets/card-preview-tetris.png',
    difficulties: ['Easy', 'Normal', 'Hard'],
    defaultDifficulty: 'Normal',
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'Fill the 9×9 grid so that each row, column, and 3×3 box contains all digits from 1 to 9.',
    color: '#E66A2C',
    bgColor: '#E66A2C',
    route: '/sudoku',
    previewImage: '/assets/card-preview-sudoku.png',
    difficulties: ['Easy', 'Medium', 'Hard'],
    defaultDifficulty: 'Easy',
  },
  {
    id: 'binairo',
    title: 'Binairo',
    description: 'Place 0s and 1s on the grid — no three alike in a row, equal counts per line, every row and column unique.',
    color: '#7C4DFF',
    bgColor: '#7C4DFF',
    route: '/binairo',
    previewImage: '/assets/card-preview-binairo.svg',
    difficulties: ['Easy', 'Medium', 'Hard'],
    defaultDifficulty: 'Easy',
  },
];

export const NAV_GAMES: NavGame[] = GAMES.map(g => ({
  id: g.id,
  title: g.title,
  color: g.color,
  route: g.route,
}));
