# Minesweeper Studio — to-do (Codex execution checklist)

This file is a living backlog and progress log.
Rules:
- Work top-to-bottom.
- Keep the app working after each milestone.
- After completing a task, tick it and add a short note if needed.

## Progress log (append-only)
- [x] (2026-02-09) Project started. Bootstrapped Vite + React + TS with ESLint, Prettier, and Vitest.
- [x] (2026-02-09) Milestone 11: Seed bar + shareable URL state (w/h/m/seed + sx/sy after first reveal), with optional theme + compact visual preset.
- [x] (2026-02-09) Milestone 12: Accessibility + perf pass (colorblind palette, focus rings, board render optimizations), README updated.
- [x] (2026-02-09) Pivot: removed the entire Settings/"studio" options system and extra polish features; re-themed the app as a slim Garden Sweeper default.

---

NOTE: Milestones 3–12 below were completed earlier, but the project has since pivoted to a slim app and those option-heavy features were intentionally removed. Keep this section as a historical record.

---

## Milestone 13 — Slim Garden Sweeper pivot

- [x] Remove Settings UI + settings persistence.
- [x] Remove theme packs, audio/haptics, stats/help extras.
- [x] Apply Garden Sweeper default theme inspiration (fonts, colors, sticker HUD, board/tile styling).
- [x] Keep core gameplay + seeded shareable links.

Acceptance:
- App is slim (no settings/options panels), still playable, and share links reproduce the board after first reveal.

## Milestone 0 — Bootstrap & guardrails

- [x] Initialize project with Vite + React + TypeScript.
- [x] Add scripts: dev/build/preview/test/lint/format (as appropriate).
- [x] Add basic folder structure:
  - `src/engine`, `src/state`, `src/themes`, `src/ui`, `src/styles`, `src/utils`, `src/assets`
- [x] Add a minimal README:
  - how to run
  - basic controls
  - note that visuals are optional via Settings
- [x] Add ESLint + Prettier (or equivalent) and TypeScript strict mode.
- [x] Confirm: `npm run dev` opens a blank shell app.

Acceptance:
- Dev server runs, build passes, basic layout loads.

---

## Milestone 1 — Core Minesweeper engine (pure + tested)

- [x] Implement deterministic RNG utility (seed → reproducible stream).
- [x] Implement board data model:
  - width, height, mineCount
  - mines (boolean array)
  - adjacentMineCounts (0..8 array)
- [x] Implement generation rules:
  - generated only after first reveal (so first click is safe)
  - optional stronger safety: first click + neighbors are safe
- [x] Implement game state model:
  - revealed (boolean array)
  - flagged (boolean array)
  - status: playing/won/lost
  - revealedCount, flagsCount, startTime, endTime
- [x] Implement actions (pure functions):
  - reveal cell (with flood fill for 0)
  - toggle flag
  - chord (reveal neighbors when flags match number)
  - compute win condition
- [x] Add Vitest tests for:
  - determinism given seed + first click
  - mine counts correct
  - adjacency counts correct
  - flood fill correctness
  - chord correctness
  - win/loss correctness

Acceptance:
- Tests pass; engine can be driven without UI.

---

## Milestone 2 — Minimal playable UI (no fancy visuals yet)

- [x] Build basic layout:
  - top HUD: mines remaining, timer, reset button
  - board grid
- [x] Implement tile interactions:
  - left click: reveal
  - right click/context menu: flag
  - chord: mouse (e.g. middle click OR left+right OR keyboard modifier)
- [x] Add difficulties + restart:
  - Beginner / Intermediate / Expert
  - Custom (simple modal/form)
- [x] Implement timer start on first action; stop on win/loss.
- [x] Add basic win/lose modal.
- [x] Add keyboard shortcuts (initial set):
  - R = restart
  - 1/2/3 = difficulty presets
  - Arrow keys move focus (optional), Enter reveal, F flag (optional)

Acceptance:
- Fully playable Minesweeper in browser.

---

## Milestone 3 — Settings system (foundation for all beautification)

- [x] Implement Settings store with:
  - defaults
  - versioning + migration
  - localStorage persistence
- [x] Create Settings UI:
  - button opens drawer/modal
  - categories + toggles + sliders
  - “Reset to defaults”
- [x] Add “Preview” area in settings for theme selection.
- [x] Implement `prefers-reduced-motion` + `prefers-color-scheme` integration:
  - default settings follow system, user override allowed.

Acceptance:
- Settings persist across reload; toggles affect UI (even if only minimal changes at first).

---

## Milestone 4 — Theme packs (art direction as a setting)

Implement at least 4 theme packs:
- [x] Minimal (baseline)
- [x] Stained Glass
- [x] Kintsugi Ceramic
- [x] Botanical Field Notes
- [ ] (Optional) Art Deco
- [ ] (Optional) Astral

Per theme:
- [x] Color tokens (CSS vars)
- [x] Tile styles (unrevealed/revealed/pressed)
- [x] Board frame style
- [x] Background style (flat/wallpaper/illustration)

Acceptance:
- Switching themes updates the entire visual system without breaking readability.

---

## Milestone 5 — Patterns, textures, grain, and procedural variation (all optional)

- [x] Patterned tiles toggle:
  - distinct patterns for unrevealed vs revealed
  - pattern intensity respects contrast rules
- [x] Texture overlay toggle + intensity slider:
  - apply subtle noise/grain overlay (generated or asset-based)
- [x] Procedural per-tile variation:
  - deterministic per tile based on seed + coords
  - used for slight background-position/rotation/brightness variation
  - intensity slider controls strength
- [x] Vignette and board depth toggles:
  - vignette overlay
  - board shadow / raised frame

Acceptance:
- Visual richness increases, but numbers remain readable in all combos.

---

## Milestone 6 — Typography, number styles, and glyph mode (all optional)

- [x] Add at least 2–3 font presets (open-license via npm packages or local assets).
- [x] Number style options:
  - classic
  - outlined/high-contrast
  - engraved/emboss (material-aware)
  - ink/handwritten (theme-aware)
- [x] Large numbers toggle
- [x] Glyph mode:
  - optional mapping of 1–8 to distinct themed glyphs
  - must remain quickly distinguishable
  - includes fallback to numerals

Acceptance:
- Numbers are always legible; glyph mode is usable and not confusing.

---

## Milestone 7 — Micro-animations and win/lose moments (all optional)

- [x] Press feedback animation (toggle)
- [x] Reveal animation (toggle)
- [x] Flood-fill cascade animation (toggle)
- [x] Flag placement animation (toggle)
- [x] Win moment animation (toggle)
- [x] Lose moment animation (toggle)
- [x] Reduce motion:
  - when reduce motion is on, disable/shorten animations globally

Acceptance:
- Animations feel premium, never distracting, and never block gameplay.

---

## Milestone 8 — HUD styles + layout polish (optional)

- [x] Implement HUD style switcher:
  - minimal
  - “brass counter” style
  - “field notes” style
- [x] Add a help/controls modal.
- [x] Add stats modal:
  - best times per difficulty stored locally
- [x] Make layout responsive:
  - works well on mobile portrait
  - settings accessible without covering key UI

Acceptance:
- UI feels designed; not just functional.

---

## Milestone 9 — Cursor + interaction polish (optional)

- [x] Custom cursor sets per theme (desktop only; fallback safe).
- [x] Hover highlight toggle
- [x] Chord preview toggle (soft highlight of neighbors when holding chord gesture)
- [x] Touch gestures:
  - long-press to flag
  - optional chord gesture that is discoverable in Help

Acceptance:
- Interaction feels “crafted” across mouse and touch.

---

## Milestone 10 — Ambience: SFX, ambient loop, haptics (optional)

- [x] SFX toggle + volume
- [x] Ambient loop toggle + volume (synth or bundled audio with license)
- [x] Haptics toggle on supported devices (`navigator.vibrate`)
- [x] Mute shortcut (e.g. M)

Acceptance:
- Sound never auto-blasts; defaults are gentle; everything is user-controlled.

---

## Milestone 11 — Shareable seeds + URL state

- [x] Add seed field + “New seed” button.
- [x] Encode game params into URL:
  - width/height/mines/seed
  - optionally theme id (and maybe a compact settings preset)
- [x] Add “Copy link” button.
- [x] Load from URL on startup.

Acceptance:
- Two users opening the same link get the same board and visuals (as applicable).

---

## Milestone 12 — Final QA, accessibility, and performance

- [x] Accessibility pass:
  - colorblind-friendly mode
  - keyboard operable core actions
  - focus states visible
  - ARIA labels for controls
- [x] Performance pass:
  - Tile rendering does not lag on Expert board
  - Avoid layout thrash in animations
- [x] Cross-browser sanity:
  - Chrome, Firefox, Safari basics
- [x] Update README with:
  - controls
  - settings explanations
  - theming overview
  - shareable links

Acceptance:
- `npm run build` succeeds, app is polished, and settings are stable.

---

## Nice-to-haves (only after done)

- [ ] PWA offline support
- [ ] Screenshot/export of board (SVG/PNG)
- [ ] “Daily puzzle” mode (fixed seed per day)
- [ ] Theme marketplace UI (still local presets)
