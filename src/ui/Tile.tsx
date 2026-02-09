import { memo, useRef, type CSSProperties, type ReactNode } from 'react'

import { Glyph } from './Glyph'

export type TileViewModel = {
  index: number
  x: number
  y: number
  revealed: boolean
  flagged: boolean
  mine: boolean
  adjacent: number
  disabled: boolean
  tabIndex: number
  tileSizePx: number
  tvRotDeg: number
  tvBright: number
  revealDelayMs: number
  glyphModeEnabled: boolean
  chordPreview: boolean
  ariaLabel: string
  onFocusIndex: (index: number) => void
  onHoverIndex: (index: number | null) => void
  onReveal: (x: number, y: number, opts?: { chord?: boolean }) => void
  onFlag: (x: number, y: number) => void
  onChord: (x: number, y: number) => void
  setRef: (index: number, el: HTMLButtonElement | null) => void
}

function TileImpl(props: TileViewModel) {
  const {
    index,
    x,
    y,
    revealed,
    flagged,
    mine,
    adjacent,
    disabled,
    tabIndex,
    tileSizePx,
    tvRotDeg,
    tvBright,
    revealDelayMs,
    glyphModeEnabled,
    chordPreview,
    ariaLabel,
    onFocusIndex,
    onHoverIndex,
    onReveal,
    onFlag,
    onChord,
    setRef,
  } = props

  const longPressTimerRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)

  let content: ReactNode = ''
  if (revealed) {
    if (mine) content = 'X'
    else if (adjacent > 0) {
      content = glyphModeEnabled ? <Glyph n={adjacent} /> : adjacent
    }
  } else if (flagged) {
    content = 'F'
  }

  const classes = [
    'tile',
    revealed ? 'revealed' : 'hidden',
    mine && revealed ? 'mine' : '',
    flagged && !revealed ? 'flagged' : '',
    chordPreview ? 'chordPreview' : '',
    revealed && !mine && adjacent > 0 ? `n${adjacent}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      ref={(el) => setRef(index, el)}
      type="button"
      className={classes}
      style={
        {
          width: tileSizePx,
          height: tileSizePx,
          ['--tv-rot' as string]: `${tvRotDeg}deg`,
          ['--tv-bright' as string]: tvBright,
          ['--reveal-delay' as string]: `${revealDelayMs}ms`,
        } as CSSProperties
      }
      disabled={disabled}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      onFocus={() => onFocusIndex(index)}
      onMouseEnter={() => onHoverIndex(index)}
      onMouseLeave={() => onHoverIndex(null)}
      onTouchStart={(e) => {
        if (disabled) return
        // Two-finger tap chord gesture (discoverable via Help).
        if (e.touches.length === 2) {
          e.preventDefault()
          suppressClickRef.current = true
          if (longPressTimerRef.current != null) {
            window.clearTimeout(longPressTimerRef.current)
            longPressTimerRef.current = null
          }
          onChord(x, y)
        }
      }}
      onPointerDown={(e) => {
        if (disabled) return
        if (e.pointerType !== 'touch') return
        if (revealed) return
        suppressClickRef.current = false
        if (longPressTimerRef.current != null) {
          window.clearTimeout(longPressTimerRef.current)
        }
        longPressTimerRef.current = window.setTimeout(() => {
          suppressClickRef.current = true
          onFlag(x, y)
        }, 450)
      }}
      onPointerUp={(e) => {
        if (e.pointerType !== 'touch') return
        if (longPressTimerRef.current != null) {
          window.clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
        }
      }}
      onPointerCancel={() => {
        if (longPressTimerRef.current != null) {
          window.clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
        }
      }}
      onMouseDown={(e) => {
        if (e.button === 1) {
          e.preventDefault()
          onChord(x, y)
        }
      }}
      onClick={(e) => {
        if (suppressClickRef.current) {
          suppressClickRef.current = false
          return
        }
        if (e.shiftKey) onChord(x, y)
        else onReveal(x, y)
      }}
      onContextMenu={(e) => {
        e.preventDefault()
        onFlag(x, y)
      }}
    >
      <span className="tileContent" aria-hidden="true">
        {content}
      </span>
    </button>
  )
}

export const Tile = memo(TileImpl)
