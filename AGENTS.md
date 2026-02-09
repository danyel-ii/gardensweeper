# Minesweeper Studio (Browser App)

This repository is a browser-based Minesweeper with a “beautification studio”: **all visual polish features are optional settings** (themes, patterns, textures, typography, animations, HUD styles, cursor styles, ambience, etc.). The app must remain readable and fast in every mode.

## Prime directive

1) Keep the game playable at all times (small, safe increments).
2) Prioritize **clarity + accessibility** over visual flair.
3) Every beautification feature must be:
   - optional (toggleable),
   - reversible (doesn’t corrupt state),
   - persisted (localStorage),
   - safe by default (no motion overload, no unreadable numbers).

## How to work in this repo

- Follow `to-do.md` top-to-bottom.
- After finishing any milestone, update `to-do.md`:
  - check completed items,
  - add short notes if you made a design decision,
  - add follow-up tasks if you discovered issues.
- Prefer small commits that keep the app running.

### Commands (expected)

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Preview prod build: `npm run preview`
- Tests: `npm run test`
- Lint/format (if configured): `npm run lint` / `npm run format`

If these scripts don’t exist yet, create them as part of bootstrapping.

## Recommended stack (use unless there’s a strong reason not to)

- Vite + React + TypeScript
- CSS variables for theming
- Minimal deps; prefer handwritten utilities over adding libraries

## Definition of done (non-negotiable)

### Core Minesweeper
- Standard difficulties: Beginner (9×9, 10), Intermediate (16×16, 40), Expert (30×16, 99)
- Custom game: width/height/mines with validation
- First click is safe (no mine). Prefer “first click and its neighbors are safe” if feasible.
- Left click reveal, right click flag, chord (reveal neighbors when flags match number)
- Win/lose detection + restart
- Timer + mines remaining
- Seeded boards (shareable link that reproduces the board)

### Inputs / platforms
- Desktop mouse + keyboard shortcuts
- Touch: tap reveal, long-press to flag, optional chord gesture (e.g. two-finger tap on number)
- Works on modern Chrome/Firefox/Safari

### Settings “Beautification Studio”
Implement settings such that **every** feature below can be enabled/disabled independently:

1) Art direction / themes (choose among theme packs)
2) Materials + lighting (tile bevel, highlights, shadows)
3) Micro-animations (press, reveal, flood cascade, flag placement)
4) Typography / number styles (font set, outlines, engraved/ink styles)
5) Glyph mode (optional mapping 1–8 to themed glyphs/icons, must remain instantly distinguishable)
6) Texture overlays + grain (global subtle noise; intensity slider)
7) Patterned tiles (different patterns for unrevealed vs revealed tiles)
8) Procedural variation per tile (deterministic jitter/variation; intensity slider)
9) Win/lose “moment” animations (tasteful, no flashing)
10) Premium HUD layouts (switchable HUD styles)
11) Cursor + interaction polish (custom cursor set, hover affordances)
12) Ambience (SFX, ambient loop, haptics on mobile)

Also required:
- “Reduce motion” option (and honor `prefers-reduced-motion`)
- High-contrast / colorblind-friendly palette option
- Larger numbers option

## Architecture expectations

### Directory structure (suggested)
- `src/engine/`       Pure game logic (board generation, reveals, flood fill, rules)
- `src/state/`        Settings + game state management
- `src/themes/`       Theme packs + tokens
- `src/ui/`           React components (Board, Tile, HUD, Settings drawer, Modals)
- `src/styles/`       Global CSS, tokens, utilities
- `src/assets/`       SVG icons, cursor images (avoid copyrighted assets)
- `src/utils/`        Deterministic RNG, hashing, helpers

### Engine rules
- Engine must be deterministic given: width/height/mines/seed/firstClickCoord.
- Keep engine pure and testable. UI should not mutate engine internals.
- Represent board as 1D arrays for performance; provide helpers for (x,y) ↔ index.

### Theming model (contract)
Implement a theme system based on CSS variables + small theme metadata.

Suggested types (adapt as needed):

- ThemePack:
  - id, name, description
  - cssVars: colors + shadows + radii + typography vars
  - patterns: CSS/SVG pattern defs for unrevealed/revealed tiles, board frame, background wallpaper
  - numbers: style hints (outline, emboss, glyph set)
  - cursor: optional cursor set
  - sounds: optional sound profile (can be synthesized)

### Settings model (contract)
Store a single `Settings` object in localStorage with versioning + migration.

Suggested categories:
- Theme:
  - `themePackId`
  - `darkMode` (auto/light/dark)
- Patterns & textures:
  - `patternsEnabled`
  - `textureEnabled`
  - `textureIntensity` (0..1)
  - `grainEnabled`
  - `proceduralVariation` (0..1)
- Typography & numbers:
  - `numberFont` (preset ids)
  - `numberStyle` (classic/engraved/ink/outlined)
  - `glyphModeEnabled`
  - `largeNumbers`
  - `highContrastNumbers`
- Motion:
  - `animationsEnabled`
  - `animationIntensity` (0..1)
  - `floodWaveEnabled`
  - `winLossAnimationsEnabled`
  - `reduceMotionMode` (auto/on/off)
- HUD & layout:
  - `hudStyle` (minimal/brass/field-notes/deco/etc.)
  - `boardFrameEnabled`
  - `backgroundStyle` (flat/wallpaper/illustration)
  - `parallaxEnabled`
  - `vignetteEnabled`
- Cursor & interaction:
  - `customCursorEnabled`
  - `hoverHighlightEnabled`
  - `pressFeedbackEnabled`
  - `chordPreviewEnabled`
- Audio & haptics:
  - `sfxEnabled`
  - `sfxVolume` (0..1)
  - `ambienceEnabled`
  - `ambienceVolume` (0..1)
  - `hapticsEnabled`
- Personalization:
  - `dailyPaletteEnabled`
  - `showThemePreviews`

## Visual quality guardrails (important)

- Numbers must remain readable:
  - Ensure contrast in every theme and state.
  - If the user enables heavy textures, automatically add number outline/shadow to maintain contrast.
- Avoid aggressive motion:
  - Respect reduce-motion settings.
  - No flashing, strobing, or rapid full-screen effects.
- Keep performance smooth:
  - Tile re-rendering should be minimal; memoize Tile components.
  - Use CSS transforms for animations when possible.

## Testing expectations

At minimum, add unit tests for the engine:
- correct mine count
- adjacency counts correct
- first click safety constraints honored
- flood fill reveals correct region
- win/lose detection correct
- seeded determinism

## Delivery

When finished:
- `npm install && npm run build` must succeed
- `npm run preview` must run and the game is playable
- Settings persist across reload
- Provide a short README section explaining:
  - how to run
  - controls
  - what each settings category does
  - shareable seed links