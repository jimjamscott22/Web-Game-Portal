# RoboRoute Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship RoboRoute as a complete eleventh PixelPlay game with a tested interpreter, twelve-level learning path, responsive program builder, generated art, persistence, and production deployment.

**Architecture:** Keep deterministic gameplay in a pure `gameLogic.ts` module that converts a nested program into an immutable execution trace. A focused React board owns editor and playback state, renders the trace against level data, and persists best stars. Existing PixelPlay page, routing, registry, card, skin, and hosting patterns provide the shell.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, Tailwind CSS 3, Lucide React, Node's test runner, OpenAI Sites packaging.

**Spec:** `docs/superpowers/specs/2026-08-29-roboroute-design.md`

## Global Constraints

- Ship exactly twelve handcrafted levels grouped as Sequences, Loops, and Logic.
- Keep all UI and program text code-native; use generated raster art only for game objects and the card preview.
- Stop execution after 80 primitive operations.
- Persist best stars and highest completed level locally.
- Do not add user-defined functions, recursion lessons, procedural levels, accounts, or cloud saves.
- Preserve all existing games, routes, skins, and owner-only hosting behavior.

---

### Task 1: Pure RoboRoute model and interpreter

**Files:**
- Create: `app/src/games/boardRoboRoute/gameLogic.ts`
- Test: `app/tests/roboRouteLogic.test.ts`

**Interfaces:**
- Produces: `ROBOROUTE_LEVELS`, `createCommand`, `executeProgram`, `countBlocks`, `starsForProgram`, and the exported `RoboLevel`, `ProgramCommand`, `RobotState`, `TraceFrame`, and `ExecutionResult` types.

- [x] **Step 1: Write failing tests** for forward movement, turning, battery collection, repeat bodies, dynamic `whileGoal` evaluation, `ifClear` branches, collision errors, the 80-operation cap, recursive block counts, star thresholds, and one known solution per tier.
- [x] **Step 2: Run the focused test** with `node --experimental-strip-types --test tests/roboRouteLogic.test.ts` and confirm it fails because the module is missing.
- [x] **Step 3: Implement the immutable model** with command kinds `move`, `turnLeft`, `turnRight`, `repeat`, `whileGoal`, and `ifClear`; trace entries carry `activeIds`, state after the event, and a readable message.
- [x] **Step 4: Implement twelve level constants** with valid starts, walls, batteries, goals, allowed command palettes, objectives, and par values.
- [x] **Step 5: Run the focused test** and confirm all interpreter and level cases pass.

### Task 2: Responsive program builder and animated board

**Files:**
- Create: `app/src/games/boardRoboRoute/BoardRoboRoute.tsx`
- Create: `app/src/games/boardRoboRoute/roboRoute.css`
- Create: `app/src/pages/GameRoboRoute.tsx`
- Use: `app/public/assets/roboroute-sprite-sheet.png`

**Interfaces:**
- Consumes: the Task 1 model and trace APIs.
- Produces: the default-exported playable board and page.

- [x] **Step 1: Build the board shell** with tier/level selection, objective, progress stars, a responsive grid, and sprite-sheet renderers for robot, wall, battery, and beacon.
- [x] **Step 2: Build the recursive editor** with root and nested insertion lanes, command palette filtering from the current level, active-lane state, nested repeat/while/if branches, and accessible remove controls.
- [x] **Step 3: Wire playback** so Run advances trace frames on a timer, Step advances once, Stop cancels playback, Reset clears program and execution, and current commands highlight from `activeIds`.
- [x] **Step 4: Persist progression** in `pixelplay-roboroute-progress-v1`, retaining the best star count per level and the highest completed level.
- [x] **Step 5: Add win and error feedback** for solved, collision, incomplete, and operation-limit outcomes without hiding the program that produced them.
- [x] **Step 6: Add instructions** describing insertion lanes, nested blocks, playback controls, batteries, beacon, and star scoring.

### Task 3: PixelPlay registry, routing, styling, and copy

**Files:**
- Modify: `app/src/App.tsx`
- Modify: `app/src/types/index.ts`
- Modify: `app/src/index.css`
- Modify: `app/src/sections/GameShowcase.tsx`
- Modify: `app/src/sections/HeroBanner.tsx`
- Modify: `app/index.html`
- Modify: `app/tests/hostingConfig.test.ts`
- Use: `app/public/assets/card-preview-roboroute.png`

**Interfaces:**
- Consumes: `GameRoboRoute` from Task 2.
- Produces: `/roboroute`, the eleventh registry card/nav entry, skin-aware `--t-s11`, and eleven-game copy/metadata.

- [x] **Step 1: Register RoboRoute** with route `/roboroute`, difficulties `Sequences`, `Loops`, `Logic`, and its preview asset.
- [x] **Step 2: Add lazy routing** through `App.tsx` and ensure navigation derives the new entry automatically.
- [x] **Step 3: Add `--t-s11` to every skin** and update the global comment from ten to eleven boards.
- [x] **Step 4: Update visible and metadata copy** from ten games to eleven games while preserving the existing title structure.
- [x] **Step 5: Extend hosting assertions** to require the RoboRoute metadata and generated assets.

### Task 4: Verification and private publication

**Files:**
- Verify: all files above
- Generate: `app/dist/` and the Sites package as ignored build artifacts

**Interfaces:**
- Consumes: the complete RoboRoute vertical slice.
- Produces: verified local and owner-only hosted builds.

- [x] **Step 1: Run logic and hosting tests** with `node --experimental-strip-types --test tests/gameLogic.test.ts tests/roboRouteLogic.test.ts tests/hostingConfig.test.ts`.
- [x] **Step 2: Run `npm run build`** and resolve TypeScript or bundle failures introduced by RoboRoute.
- [x] **Step 3: Run lint** and distinguish RoboRoute regressions from the documented existing React-rule baseline.
- [x] **Step 4: Start the local Vite server** and verify desktop and mobile layouts in the browser, including level selection, nested program creation, Run, Step, Stop, Reset, collision feedback, and a solved level.
- [x] **Step 5: Compare the local render with the concept** using screenshots and `view_image`; fix copy, layout, typography, palette, art framing, control state, and responsive mismatches.
- [ ] **Step 6: Package and publish through the existing Sites workflow**, verify the live `/roboroute` route and assets, and preserve owner-only access.
