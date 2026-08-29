# RoboRoute Design Specification

## Goal

Add RoboRoute as PixelPlay's eleventh game: an original, approachable coding puzzle in which players assemble readable commands and watch a robot execute them on a grid.

## Experience

RoboRoute teaches three concepts across twelve handcrafted levels:

- **Sequences (levels 1-4):** move forward and turn left or right.
- **Loops (levels 5-8):** repeat a body a fixed number of times or while the robot has not reached the beacon.
- **Logic (levels 9-12):** branch with `if front is clear / else` inside loops.

The player builds a program from a command palette, chooses the insertion lane for nested blocks, and can remove individual blocks. Run animates the whole program, Step advances one trace event, Stop halts playback, and Reset clears the current program and returns the robot to its start.

## Rules and feedback

- A level is solved only after every battery is collected and the robot reaches the beacon.
- Walking into a wall or outside the grid stops execution with a specific collision message.
- Programs stop after 80 primitive operations and report a loop-limit message.
- A completed level earns one to three stars based on the recursive command-block count compared with the level's par.
- Best stars and unlocked progress persist in local storage; all twelve levels remain directly selectable so progress cannot trap the player.

## Visual system

The approved functional design is implemented in PixelPlay's existing warm organic skin system. The primary desktop composition follows [the RoboRoute concept](../designs/2026-08-29-roboroute-desktop-concept.png): a route board on the left, readable program builder on the right, compact tier controls above, and the existing How to play disclosure below. PixelPlay's real navigation replaces the concept's invented navigation items.

Generated production art lives in `app/public/assets/roboroute-sprite-sheet.png`. Its equal quadrants contain robot, wall, battery, and beacon assets. The game card uses `app/public/assets/card-preview-roboroute.png`.

All interactive labels and program text remain code-native. Layout stacks board above program controls on narrow screens. Motion respects `prefers-reduced-motion`.

## Scope boundaries

- No drag-and-drop dependency; insertion is click-based and keyboard accessible.
- No user-defined functions, recursion lessons, procedural levels, accounts, or cloud saves.
- No copied Brilliant branding, artwork, interface, or level layouts.
- Existing games and skin behavior remain unchanged.

## Integration

Add the game to the shared registry, navigation, lazy routes, homepage cards, eleven-game marketing copy, metadata, and hosting assertions. Pure logic tests cover interpreter movement, loops, conditionals, collision, step limits, scoring, and representative level solutions.
