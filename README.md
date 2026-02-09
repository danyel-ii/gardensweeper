# Garden Sweeper

Slim browser-based Minesweeper with a playful garden theme.

## Run

```bash
npm install
npm run dev
```

Other useful commands:

```bash
npm run test
npm run build
npm run preview
```

## Controls

- Left click / tap: reveal
- Right click / long-press: flag
- Chord (reveal neighbors when flags match number):
  - Mouse: middle click, or Shift + click
  - Keyboard: Space on a revealed tile
  - Touch: two-finger tap on a revealed number
- Keyboard:
  - Arrows move focus
  - Enter reveal focused tile
  - F flag focused tile
  - R restart

## Sharing (Seeds + URL)

Boards are deterministic based on `width/height/mines/seed` plus the first reveal
coordinate. "Copy link" is enabled after the first reveal so the shared URL can
include that starting coordinate and reproduce the exact same board.

The URL encodes:
- Game params: `w`, `h`, `m`, `seed`, and (after first reveal) `sx`, `sy`

## Notes

- Default board is 10x10 with 12 mines (matches the theme inspiration).
