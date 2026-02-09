# Garden Sweeper (Browser App)

This repository is a slim, browser-based Minesweeper with a playful garden theme.

## Prime Directive

1) Keep the game playable at all times (small, safe increments).
2) Keep it slim: avoid option creep and heavy dependencies.
3) Prioritize clarity + accessibility (readable numbers, visible focus states, no motion overload).

## Definition Of Done (Core)

- First click is safe (no mine). Prefer “first click and its neighbors are safe” if feasible.
- Left click reveal, right click flag, chord (reveal neighbors when flags match number).
- Win/lose detection + restart.
- Timer + mines remaining.
- Seeded determinism and share links:
  - Deterministic given `width/height/mines/seed/firstClickCoord`.
  - “Copy link” is enabled after the first reveal and includes `sx/sy` so the board reproduces exactly.
  - URL params: `w`, `h`, `m`, `seed`, and (after first reveal) `sx`, `sy`.

## Inputs / Platforms

- Desktop: mouse + keyboard
  - Arrows move focus, Enter reveal, F flag, Space chord, R restart
- Touch:
  - Tap reveal, long-press flag, two-finger tap chord

## Architecture Expectations

- `src/engine/`: pure deterministic logic (board generation, reveals, rules) with unit tests.
- `src/ui/`: React components; UI does not mutate engine internals.
- `src/utils/`: deterministic helpers (seed, hashing, URL state).
- Styling via `src/styles/global.css` (single default theme, no user settings).

## Delivery

- `npm install && npm run test && npm run build` succeed.
- `npm run dev` and `npm run preview` are playable.
- README documents: how to run, controls, and shareable seed links.

