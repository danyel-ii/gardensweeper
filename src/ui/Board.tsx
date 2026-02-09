import { useEffect, useMemo, useRef, useState } from 'react'

import type { GameState } from '../engine/game'
import { indexToX, indexToY } from '../engine/grid'
import { useSettings } from '../state/settings'
import { hashU32, u32ToUnit } from '../utils/hash'
import { hashStringToU32 } from '../utils/rng'
import { Tile } from './Tile'

type BoardProps = {
  game: GameState
  tileSizePx: number
  revealOrigin: { x: number; y: number } | null
  onReveal: (x: number, y: number) => void
  onFlag: (x: number, y: number) => void
  onChord: (x: number, y: number) => void
}

export function Board({
  game,
  tileSizePx,
  revealOrigin,
  onReveal,
  onFlag,
  onChord,
}: BoardProps) {
  const { settings, effectiveReduceMotion } = useSettings()
  const width = game.config.width
  const height = game.config.height
  const total = width * height
  const disabled = game.status !== 'playing'
  const variation = settings.proceduralVariation
  const waveOn =
    settings.animationsEnabled &&
    !effectiveReduceMotion &&
    settings.revealAnimationEnabled &&
    settings.floodWaveEnabled
  const waveStepMs = Math.max(0, Math.round(12 * settings.animationIntensity))

  const seedU32 = useMemo(() => hashStringToU32(game.config.seed), [game.config.seed])

  const [focusIndex, setFocusIndex] = useState(0)
  const tileRefs = useRef<Array<HTMLButtonElement | null>>([])

  useEffect(() => {
    const el = tileRefs.current[focusIndex]
    if (!el) return
    el.focus()
  }, [focusIndex])

  const setRef = (index: number, el: HTMLButtonElement | null) => {
    tileRefs.current[index] = el
  }

  useEffect(() => {
    // Reset focus on new games.
    setFocusIndex(0)
  }, [game.config.seed, width, height, game.config.mineCount])

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${width}, ${tileSizePx}px)`,
      gridTemplateRows: `repeat(${height}, ${tileSizePx}px)`,
    }),
    [width, height, tileSizePx],
  )

  const moveFocus = (dx: number, dy: number) => {
    const x = indexToX(width, focusIndex)
    const y = indexToY(width, focusIndex)
    const nx = Math.max(0, Math.min(width - 1, x + dx))
    const ny = Math.max(0, Math.min(height - 1, y + dy))
    setFocusIndex(ny * width + nx)
  }

  return (
    <div
      className="boardWrap"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          moveFocus(-1, 0)
          return
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          moveFocus(1, 0)
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          moveFocus(0, -1)
          return
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          moveFocus(0, 1)
          return
        }
        if (e.key === 'Enter') {
          e.preventDefault()
          const x = indexToX(width, focusIndex)
          const y = indexToY(width, focusIndex)
          onReveal(x, y)
          return
        }
        if (e.key === 'f' || e.key === 'F') {
          e.preventDefault()
          const x = indexToX(width, focusIndex)
          const y = indexToY(width, focusIndex)
          onFlag(x, y)
          return
        }
        if (e.key === ' ') {
          e.preventDefault()
          const x = indexToX(width, focusIndex)
          const y = indexToY(width, focusIndex)
          onChord(x, y)
        }
      }}
    >
      <div className="boardGrid" style={gridStyle} role="grid" aria-label="Minesweeper board">
        {Array.from({ length: total }, (_, index) => {
          const x = indexToX(width, index)
          const y = indexToY(width, index)
          const revealed = game.revealed[index] === 1
          const flagged = game.flagged[index] === 1
          const mine = game.board.mines[index] === 1
          const adjacent = game.board.adjacentMineCounts[index]

          const ariaLabel = revealed
            ? mine
              ? 'Mine'
              : adjacent > 0
                ? `Revealed ${adjacent}`
                : 'Revealed empty'
            : flagged
              ? 'Flagged'
              : 'Hidden'

          let tvRotDeg = 0
          let tvBright = 1
          if (variation > 0) {
            const base =
              seedU32 ^
              Math.imul(x + 1, 0x9e3779b1) ^
              Math.imul(y + 1, 0x85ebca6b)
            const u1 = u32ToUnit(hashU32(base))
            const u2 = u32ToUnit(hashU32(base ^ 0x27d4eb2d))
            tvRotDeg = (u1 * 2 - 1) * (1.15 * variation)
            tvBright = 1 + (u2 * 2 - 1) * (0.06 * variation)
          }

          let revealDelayMs = 0
          if (waveOn && revealOrigin && waveStepMs > 0) {
            const dist =
              Math.abs(x - revealOrigin.x) + Math.abs(y - revealOrigin.y)
            revealDelayMs = Math.min(180, dist * waveStepMs)
          }

          return (
            <Tile
              key={index}
              index={index}
              x={x}
              y={y}
              revealed={revealed}
              flagged={flagged}
              mine={mine}
              adjacent={adjacent}
              disabled={disabled}
              tabIndex={index === focusIndex ? 0 : -1}
              tileSizePx={tileSizePx}
              tvRotDeg={tvRotDeg}
              tvBright={tvBright}
              revealDelayMs={revealDelayMs}
              glyphModeEnabled={settings.glyphModeEnabled}
              ariaLabel={ariaLabel}
              onFocusIndex={setFocusIndex}
              onReveal={onReveal}
              onFlag={onFlag}
              onChord={onChord}
              setRef={setRef}
            />
          )
        })}
      </div>
    </div>
  )
}
