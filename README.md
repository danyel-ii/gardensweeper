# Minesweeper Studio

Browser-based Minesweeper with a "beautification studio": every visual polish
feature (themes, textures, typography, motion, HUD styles, cursor, ambience,
etc.) is optional, reversible, and persisted.

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
  - 1 / 2 / 3 presets (Beginner / Intermediate / Expert)
  - M mute/unmute

## Sharing (Seeds + URL)

Boards are deterministic based on `width/height/mines/seed` plus the first reveal
coordinate. "Copy link" is enabled after the first reveal so the shared URL can
include that starting coordinate and reproduce the exact same board.

The URL encodes:
- Game params: `w`, `h`, `m`, `seed`, and (after first reveal) `sx`, `sy`
- Visuals: `theme` and optional `vp` (compact visual preset)

## Settings Overview

Settings are persisted in `localStorage` and applied via CSS variables/data
attributes.

- Theme: theme pack, color scheme (auto/light/dark), colorblind-friendly palette
- Numbers: font, style, glyph mode, larger numbers, high-contrast numbers
- Patterns & textures: patterns, texture/grain intensity, per-tile variation
- Motion: animations + intensity, reduce motion (auto/on/off), win/lose moments
- HUD & layout: HUD style, board frame, background style, vignette
- Cursor & interaction: custom cursor, hover highlight, chord preview, press feedback
- Audio & haptics: SFX + ambience + volumes, haptics

## Notes

- Visual settings are always optional and must not reduce readability or
  performance.
