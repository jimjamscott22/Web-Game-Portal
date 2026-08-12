# Web Game Portal

A retro-pixel arcade portal built by **Kimi-OKComputer** that bundles five classic games into a single React + TypeScript + Vite app: **2048**, **Minesweeper**, **Snake**, **Sudoku**, and **Tetris**.

## Tech Stack

- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS 3.4** with the **shadcn/ui** theme (40+ Radix-based UI primitives in [src/components/ui/](src/components/ui/))
- **react-router 7** (HashRouter) for page routing
- **GSAP** for animation, **lucide-react** for icons
- **ESLint 9** with `typescript-eslint` and React hooks plugins

## Project Structure

```text
app/
├── index.html              # Vite entry HTML
├── public/assets/          # Card previews, hero/background art, floating sprites
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Router + layout shell
│   ├── index.css / App.css # Global + app-level styles
│   ├── pages/              # Route screens: Home + one Game{Name}.tsx per game
│   ├── sections/           # Home page sections (HeroBanner, GameShowcase, QuickPlayCTA)
│   ├── components/         # Shared UI: NavigationBar, Footer, GameCard, overlays,
│   │   │                   #   PixelButton, ScoreBox, MobileControls, etc.
│   │   └── ui/             # shadcn/ui primitives
│   ├── games/              # One folder per game, each with Board{Name}.tsx + gameLogic.ts
│   │   ├── board2048/
│   │   ├── boardMinesweeper/
│   │   ├── boardSnake/
│   │   ├── boardSudoku/
│   │   └── boardTetris/
│   ├── hooks/              # useGameLoop, useKeyboard, useSwipe, useLocalStorage, use-mobile
│   ├── lib/utils.ts        # cn() and shared helpers
│   └── types/index.ts      # Shared TypeScript types
├── tailwind.config.js      # Theme (shadcn tokens, custom colors, animations)
├── postcss.config.js
├── vite.config.ts
└── tsconfig*.json
```

The architecture cleanly separates **presentation** (`pages/`, `sections/`, `components/`) from **game logic** (`games/<name>/gameLogic.ts`), with reusable hooks for input handling and the game loop. Each game has a dedicated page that mounts its `Board*` component.

## Setup & Run

**Requirements:** Node.js 20+ and npm (or pnpm/yarn/bun).

```bash
cd app
npm install          # install dependencies
npm run dev          # start the Vite dev server (default: http://localhost:5173)
```

### Other scripts

```bash
npm run build        # type-check (tsc -b) and build production bundle to dist/
npm run preview      # serve the production build locally
npm run lint         # run ESLint
```

After `npm run build`, deploy the contents of `dist/` to any static host (Vercel, Netlify, GitHub Pages, S3, etc.).
