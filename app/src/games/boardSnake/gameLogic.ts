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

export interface Food {
  pos: Position;
  bit: 0 | 1;
}

export function randomFood(snake: Position[]): Food {
  const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (occupied.has(`${pos.x},${pos.y}`));
  return { pos, bit: Math.random() < 0.5 ? 0 : 1 };
}

export function spawnFoods(snake: Position[]): [Food, Food] {
  const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
  const getPos = () => {
    let pos: Position;
    do {
      pos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (occupied.has(`${pos.x},${pos.y}`));
    occupied.add(`${pos.x},${pos.y}`);
    return pos;
  };
  return [
    { pos: getPos(), bit: 0 },
    { pos: getPos(), bit: 1 },
  ];
}

export function moveSnake(snake: Position[], direction: Direction, foods: Food[]): {
  newSnake: Position[];
  ateBit: 0 | 1 | null;
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
    return { newSnake: snake, ateBit: null, died: true };
  }

  if (snake.some((seg, i) => i > 0 && seg.x === head.x && seg.y === head.y)) {
    return { newSnake: snake, ateBit: null, died: true };
  }

  const eatenFood = foods.find(f => head.x === f.pos.x && head.y === f.pos.y);
  const newSnake = [head, ...snake];
  if (!eatenFood) newSnake.pop();

  return { newSnake, ateBit: eatenFood ? eatenFood.bit : null, died: false };
}

export function getOpposite(direction: Direction): Direction {
  switch (direction) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
}
