import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import type { GameState } from '../engine/game'
import { indexToX, indexToY } from '../engine/grid'
import { hashU32, u32ToUnit } from '../utils/hash'
import { hashStringToU32 } from '../utils/rng'
import { Tile } from './Tile'

type BoardProps = {
  game: GameState
  tileSizePx: number
  onReveal: (x: number, y: number) => void
  onFlag: (x: number, y: number) => void
  onChord: (x: number, y: number) => void
}

export function Board({ game, tileSizePx, onReveal, onFlag, onChord }: BoardProps) {
  const width = game.config.width
  const height = game.config.height
  const total = width * height
  const disabled = game.status !== 'playing'

  const seedU32 = useMemo(() => hashStringToU32(game.config.seed), [game.config.seed])

  const wrapRef = useRef<HTMLDivElement | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [wrapWidthPx, setWrapWidthPx] = useState<number | null>(null)

  // Ensure the board always fits horizontally on mobile by shrinking tile size as needed.
  // We observe the wrapper width (which is now `width: 100%`) so it reflects available space,
  // not the intrinsic (shrink-to-fit) width of the grid contents.
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return

    const update = () => {
      const next = Math.max(0, Math.floor(el.getBoundingClientRect().width))
      setWrapWidthPx((prev) => (prev === next ? prev : next))
    }

    update()

    const ro = new ResizeObserver(() => update())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const effectiveTileSizePx = useMemo(() => {
    if (wrapWidthPx == null) return tileSizePx
    if (typeof window === 'undefined') return tileSizePx
    const gridEl = gridRef.current
    if (!gridEl) return tileSizePx

    const cs = window.getComputedStyle(gridEl)
    const gapPx =
      Number.parseFloat(cs.columnGap || cs.gap || '0') ||
      Number.parseFloat(cs.gap || '0') ||
      0
    const paddingX =
      (Number.parseFloat(cs.paddingLeft || '0') || 0) +
      (Number.parseFloat(cs.paddingRight || '0') || 0)
    const borderX =
      (Number.parseFloat(cs.borderLeftWidth || '0') || 0) +
      (Number.parseFloat(cs.borderRightWidth || '0') || 0)

    const extra = paddingX + borderX + Math.max(0, width - 1) * gapPx
    const fit = Math.floor((wrapWidthPx - extra) / width)
    if (!Number.isFinite(fit)) return tileSizePx

    // Keep tiles big when we can, but shrink enough to avoid horizontal scrolling.
    // Avoid going too tiny (still allow overflow for extreme board sizes).
    const minTilePx = 14
    return Math.min(tileSizePx, Math.max(minTilePx, fit))
  }, [tileSizePx, width, wrapWidthPx])

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

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${width}, ${effectiveTileSizePx}px)`,
      gridTemplateRows: `repeat(${height}, ${effectiveTileSizePx}px)`,
    }),
    [width, height, effectiveTileSizePx],
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
      ref={wrapRef}
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
      <div
        className="boardGrid"
        ref={gridRef}
        style={gridStyle}
        role="grid"
        aria-label="Minesweeper board"
      >
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

          // Slight "handmade" rotation for unrevealed tiles, deterministic by seed and coords.
          let rotDeg = 0
          if (!revealed) {
            const base =
              seedU32 ^
              Math.imul(x + 1, 0x9e3779b1) ^
              Math.imul(y + 1, 0x85ebca6b)
            const u = u32ToUnit(hashU32(base))
            rotDeg = (u * 2 - 1) * 2.1
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
              tileSizePx={effectiveTileSizePx}
              rotDeg={rotDeg}
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
