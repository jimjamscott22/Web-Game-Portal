# PixelPlay - Technical Specification

## Dependencies

### Runtime

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.0.0 | UI framework |
| react-dom | ^19.0.0 | DOM rendering |
| react-router-dom | ^7.0.0 | Client-side routing (6 routes) |
| gsap | ^3.12.0 | Core animation engine, timelines, ScrollTrigger, page transitions |
| imagesloaded | ^5.0.0 | Image preload detection for animation gating |
| lucide-react | ^0.460.0 | Icon library (arrows, flags, settings, etc.) |

### Dev

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5.6.0 | Type safety |
| vite | ^6.0.0 | Build tool |
| tailwindcss | ^3.4.0 | Utility CSS |
| @types/react | ^19.0.0 | React type definitions |
| @types/react-dom | ^19.0.0 | ReactDOM type definitions |
| @types/imagesloaded | ^4.1.0 | imagesloaded types |

### Fonts (Google Fonts, loaded via `<link>` in index.html)

- Pixelify Sans (weight 400, 600, 700) — display/headings
- DM Sans (weight 400, 500) — body/UI text

---

## Component Inventory

### Layout (shared across all pages)

| Component | Source | Notes |
|-----------|--------|-------|
| NavigationBar | Custom | Fixed top bar, logo + game links + CTA. Scroll-shadow behavior. Mobile hamburger overlay. |
| Footer | Custom | Dark footer, 3-column layout |
| PageTransitionOverlay | Custom | Color wipe overlay for route changes. Sits above all content at z-index above nav. |
| FloatingBackground | Custom | Decorative floating shapes (CSS animations), rendered behind page content |

### Homepage Sections

| Component | Source | Notes |
|-----------|--------|-------|
| HeroBanner | Custom | Full-viewport hero with floating game pieces canvas |
| FloatingGamePieces | Custom | Canvas-based drifting game piece decorations with click-burst interaction |
| GameShowcase | Custom | Filter tabs + game cards grid |
| GameCard | Custom | Reusable card component (5 instances, parameterized by game config) |
| FilterTabs | Custom | Circular icon buttons for game filtering |
| QuickPlayCTA | Custom | Dark CTA section with random game selector |

### Game Pages (shared wrappers)

| Component | Source | Notes |
|-----------|--------|-------|
| GamePageLayout | Custom | Consistent game page wrapper: title + score area + board + controls |
| GameHeader | Custom | Title + score/best displays per game |
| HowToPlayPanel | Custom | Collapsible instruction panel, shared across games |
| WinOverlay | Custom | Celebration overlay with confetti, "Keep Going" / "New Game" |
| GameOverOverlay | Custom | Game over overlay with shake trigger, "Try Again" |
| MobileControls | Custom | On-screen D-pad / action buttons for mobile play |

### Game Boards (each self-contained)

| Component | Source | Notes |
|-----------|--------|-------|
| Board2048 | Custom | 4x4 grid with DOM-based tiles. CSS transforms for slide/merge/spawn animations |
| BoardMinesweeper | Custom | Dynamic-size grid (9x9 / 16x16 / 16x30). CSS 3D button styling for unrevealed cells |
| BoardSnake | Custom | Canvas-based 20x20 grid. requestAnimationFrame game loop |
| BoardTetris | Custom | Canvas-based 10x20 board. requestAnimationFrame with configurable drop speed |
| BoardSudoku | Custom | 9x9 DOM grid with thick sub-grid borders. Number pad input below |

### Reusable Components

| Component | Source | Used By |
|-----------|--------|---------|
| PixelButton | Custom | Everywhere — 3 variants (primary/secondary/tertiary) with press animation |
| ConfettiEffect | Custom | WinOverlay — falling square particles, canvas-based |
| ScoreBox | Custom | Game headers across all games |
| DifficultyPills | Custom | GameCard, Minesweeper, Sudoku |

### Hooks

| Hook | Purpose |
|------|---------|
| useLocalStorage | Persist best scores and game state |
| useGameLoop | requestAnimationFrame loop for Snake/Tetris |
| useSwipe | Touch swipe detection for 2048/Snake mobile |
| useKeyboard | Keyboard event listener with key mapping |

---

## Animation Implementation

| Animation | Library | Approach | Complexity |
|-----------|---------|----------|------------|
| Page load sequence (staggered entrance) | GSAP timeline | Single timeline with labeled positions for nav, hero text, CTA button, cards | Medium |
| Floating game pieces drift | Canvas 2D + rAF | Custom canvas loop: random spawn positions, velocity vectors, edge wrapping, opacity fade at boundaries. Click detection with velocity burst | High |
| Floating background shapes | CSS @keyframes | Pure CSS animations: translateY drift + subtle rotate. Random delays/durations via inline styles | Low |
| Page transition color wipe | GSAP | Clip-path or scaleX animation from click position. Overlay element covers viewport, animates color panel expand then contract to reveal new page | High |
| Scroll-triggered section reveals | GSAP ScrollTrigger | Batch setup for heading + content blocks. translateY + opacity with stagger. once: true | Low |
| Nav link hover (dot + underline) | CSS transitions | scale transform on dot pseudo-element, width animation on underline ::after | Low |
| Button press (shadow + translateY) | CSS transitions | transform + box-shadow changes on :active. Bounce easing via cubic-bezier | Low |
| CTA button pulse | CSS @keyframes | Alternating box-shadow values in infinite keyframe | Low |
| Scroll indicator bounce | CSS @keyframes | Circle translateY down the line with opacity fade, looped | Low |
| Game card hover lift | CSS transitions | translateY + box-shadow on :hover/:active | Low |
| **2048** tile spawn | CSS animation | scale(0) → scale(1.1) → scale(1) keyframe, triggered on new tile | Low |
| **2048** tile merge pop | CSS animation | scale pulse keyframe on merge | Low |
| **2048** tile slide | CSS transition | translate3d with GSAP or CSS transition based on grid position changes | Medium |
| **2048** win confetti | Canvas 2D | ConfettiEffect component: colored squares with gravity + rotation | Medium |
| **2048** lose board shake | GSAP | translateX oscillation keyframe/tween, ±5px 5 cycles | Low |
| **Minesweeper** cascade reveal | rAF batching | Recursive reveal batched in animation frames with 0.05s stagger between wavefronts | Medium |
| **Minesweeper** mine reveal stagger | GSAP stagger | Sequential mine reveal with 0.1s delay between cells | Low |
| **Snake** continuous movement | rAF game loop | useGameLoop hook: position updates every frame based on speed config | Medium |
| **Snake** food pulse | CSS @keyframes | Infinite scale(1.0→1.1→1.0) on food cell | Low |
| **Snake** eat flash | CSS transition | Background color pulse on head segment for 0.1s | Low |
| **Tetris** line clear flash | Canvas + timer | Completed rows flash white for 0.15s, then shrink height to 0 over 0.2s | Medium |
| **Tetris** piece landing flash | Canvas | Brief brightness increase on piece cells for 0.05s | Low |
| **Tetris** game over fill | GSAP stagger | Random-colored blocks fill from bottom with staggered delay over 1s | Medium |
| **Sudoku** cell selection | CSS transition | Background + border transition on selected cell | Low |
| **Sudoku** related cells highlight | CSS class toggle | Instant highlight class, no animation | Low |
| **Sudoku** win celebration | ConfettiEffect | Reuse win confetti component | Low |

---

## State & Logic Plan

### Routing Architecture

React Router v7 with 6 routes:
- `/` — Homepage
- `/2048` — 2048 game
- `/minesweeper` — Minesweeper
- `/snake` — Snake
- `/tetris` — Tetris
- `/sudoku` — Sudoku

All routes use the same root layout (Nav + Footer + TransitionOverlay). Game pages are lazy-loaded.

### Page Transition Orchestration

A shared PageTransitionOverlay component manages the color wipe between routes:
1. Navigation is intercepted (custom navigate function)
2. Exit animation: current page content fades out (0.2s)
3. Wipe: overlay expands from click point with the target game's accent color (0.4s)
4. Route change occurs while overlay covers screen
5. Reveal: overlay contracts to reveal new page (0.3s)
6. Enter: new page content fades in (0.3s)

This requires a transition context/provider at the app root level.

### Game State Architecture

Each game is a self-contained module with its own state management (React useState/useReducer). No shared game state.

**2048:**
- Board state: 4x4 array of `{value: number | null, id: string}`
- Move logic: Directional slide + merge algorithm. Returns new board + score delta
- Animation state: Track which tiles are new/merged/moved for CSS animation triggers
- Persist: board state + current score + best score

**Minesweeper:**
- Board state: 2D array of `{isMine, isRevealed, isFlagged, adjacentMines, isQuestion}`
- Mine placement: Random placement after first click (guaranteed safe zone)
- Cascade reveal: BFS/DFS flood fill from empty cells
- Three difficulty presets: Beginner (9x9, 10), Intermediate (16x16, 40), Expert (16x30, 99)

**Snake:**
- Game loop via requestAnimationFrame in useGameLoop hook
- State: snake segments array, food position, direction queue, speed, score, game status
- Collision detection: wall bounds + self-intersection (O(n) segment check)
- Food spawn: random empty cell selection

**Tetris:**
- Game loop with configurable tick rate (speed increases with level)
- State: board grid (20x10), current piece, next piece, score, level, lines cleared
- Piece rotation with wall-kick logic (basic SRS)
- Line clear detection: scan rows, flash, remove, shift down
- Collision: piece-to-board and piece-to-boundary

**Sudoku:**
- Board state: 9x9 array of `{value: number | null, isGiven, notes: Set<number>}`
- Puzzle generation: Algorithm to create valid Sudoku puzzles with unique solutions
- Validation: Real-time conflict detection (same value in row/col/box)
- Difficulty: Control number of pre-filled cells (Easy ~40, Medium ~30, Hard ~22)

### localStorage Schema

```typescript
interface PersistedData {
  "pixelplay-2048-best": number;
  "pixelplay-minesweeper-best-beginner": number;
  "pixelplay-minesweeper-best-intermediate": number;
  "pixelplay-minesweeper-best-expert": number;
  "pixelplay-snake-best": number;
  "pixelplay-tetris-best": number;
  "pixelplay-tetris-level": number;
  "pixelplay-sudoku-best-time-easy": number;
  "pixelplay-sudoku-best-time-medium": number;
  "pixelplay-sudoku-best-time-hard": number;
  // Per-game resume state (optional)
  "pixelplay-2048-state": { board, score };
  "pixelplay-sudoku-state": { board, timer, difficulty };
}
```

### Responsive Strategy

- Desktop (≥1024px): Full layouts as designed, two-column where specified
- Tablet (768–1023px): Game cards 2-column grid, Tetris/Sudoku sidebars move below board
- Mobile (<768px): Single column, game boards scale to viewport width minus padding, hamburger nav, on-screen touch controls for all games
- Game board sizing: Use CSS `aspect-ratio` and `max-width` with viewport-relative scaling. Canvas games compute cell size from container dimensions.

---

## Other Key Decisions

### Game Rendering Strategy

- **DOM-based** (2048, Minesweeper, Sudoku): Grid layouts with CSS transitions for animations. Better for grid-based games with cell-by-cell styling.
- **Canvas-based** (Snake, Tetris): requestAnimationFrame loops for smooth real-time rendering. Better for continuous-motion games.

### Sudoku Puzzle Generation

Use a backtracking solver to generate valid complete grids, then remove cells based on difficulty while ensuring a unique solution. This is computed once per new game (not in real-time), so performance is acceptable.

### Tetris Wall Kicks

Implement basic wall-kick system: when rotation is blocked, try shifting the piece 1 cell left/right/up from the rotated position. This is sufficient for a casual implementation without full SRS.

### Image Assets

12 images specified in design.md. All are illustrations/previews in transparent PNG format. These are static assets served from `public/assets/` and referenced directly. No dynamic image loading required.
