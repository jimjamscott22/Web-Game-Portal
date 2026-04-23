# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working directory

All application code lives in [app/](app/). Run every npm/vite/eslint/tsc command from inside `app/` — the repo root only holds `tech-spec.md` and this file.

## Commands

```bash
cd app
npm install
npm run dev       # Vite dev server on http://localhost:3000 (not Vite's default 5173 — see vite.config.ts)
npm run build     # tsc -b && vite build — type-check is part of the build, do not skip
npm run lint      # ESLint 9 flat config (eslint.config.js)
npm run preview   # serve the dist/ build
```

There is no test runner configured. Do not invent `npm test`; verify changes with `npm run build` (type-check) + `npm run lint` + manual browser check.

## Architecture

Single-page React 19 + TypeScript app routed by `react-router` v7 (HashRouter, to stay consistent with Vite's `base: './'`). The structural rule of the codebase is a **strict separation between presentation and game logic**:

- `src/pages/Game{Name}.tsx` — route-level page; owns layout, overlays (win/game-over), score display, and mobile controls. Mounts exactly one `Board*` component.
- `src/games/board{Name}/Board{Name}.tsx` — the playable board/canvas. React-side state, rendering, input wiring.
- `src/games/board{Name}/gameLogic.ts` — **pure** functions and types for that game's rules (move/merge/spawn/collision/solve). No React imports. This is where game behavior lives; the Board is a thin renderer over it.

When adding or modifying game behavior, change `gameLogic.ts` first and keep the Board dumb. When adding a new game: create `src/games/board{Name}/` with both files, a `src/pages/Game{Name}.tsx` page, add a route in [app/src/App.tsx](app/src/App.tsx), and a card in the home showcase.

### Cross-cutting pieces

- `src/hooks/` — shared runtime primitives reused across games: `useGameLoop` (rAF tick), `useKeyboard`, `useSwipe` (touch), `useLocalStorage` (high-score persistence), `use-mobile`. Prefer extending these over reimplementing per-game.
- `src/components/` — shared presentational pieces (NavigationBar, Footer, GameCard, PixelButton, ScoreBox, MobileControls, WinOverlay, GameOverOverlay, ConfettiEffect, FloatingBackground, PageTransitionOverlay).
- `src/components/ui/` — shadcn/ui Radix primitives. Configured via [app/components.json](app/components.json); regenerate/add with the shadcn CLI rather than hand-editing these.
- `src/sections/` — Home-page-only sections (HeroBanner, GameShowcase, QuickPlayCTA). Not reused elsewhere.
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge). Use it for all conditional className composition.
- `src/types/index.ts` — shared cross-game types.

### Conventions

- Import alias `@/` → `app/src/` (see [app/vite.config.ts](app/vite.config.ts) and [app/tsconfig.app.json](app/tsconfig.app.json)). Use `@/...` for anything outside the current folder.
- Styling is Tailwind + shadcn tokens defined in [app/tailwind.config.js](app/tailwind.config.js) (custom palette, pixel/retro animations). Prefer theme tokens (`bg-primary`, `text-muted-foreground`, etc.) over raw hex.
- Animation uses **GSAP** (already a dep) — follow existing overlays for the pattern rather than introducing framer-motion.
- Input: keyboard via `useKeyboard`, touch via `useSwipe` + on-screen `MobileControls`. Mobile support is load-bearing; any new game must wire both.

## Reference

- [app/README.md](app/README.md) — user-facing setup and file tree.
- [tech-spec.md](tech-spec.md) — original product/tech spec for the portal.
- [app/info.md](app/info.md) — short project notes.
