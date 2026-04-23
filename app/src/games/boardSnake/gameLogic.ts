export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export const GRID_SIZE = 20;

export const SPEEDS: Record<string, number> = {
  Slow: 150,
  Normal: 100,
  Fast: 60,
};

export function createSnake(): Position[] {
  const startX = Math.floor(GRID_SIZE / 2);
  const startY = Math.floor(GRID_SIZE / 2);
  return [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];
}

export function randomFood(snake: Position[]): Position {
  const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (occupied.has(`${pos.x},${pos.y}`));
  return pos;
}

export function moveSnake(snake: Position[], direction: Direction, food: Position): {
  newSnake: Position[];
  ate: boolean;
  died: boolean;
} {
  const head = { ...snake[0] };
  switch (direction) {
    case 'up': head.y -= 1; break;
    case 'down': head.y += 1; break;
    case 'left': head.x -= 1; break;
    case 'right': head.x += 1; break;
  }

  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    return { newSnake: snake, ate: false, died: true };
  }

  if (snake.some((seg, i) => i > 0 && seg.x === head.x && seg.y === head.y)) {
    return { newSnake: snake, ate: false, died: true };
  }

  const ate = head.x === food.x && head.y === food.y;
  const newSnake = [head, ...snake];
  if (!ate) newSnake.pop();

  return { newSnake, ate, died: false };
}

export function getOpposite(direction: Direction): Direction {
  switch (direction) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
}
