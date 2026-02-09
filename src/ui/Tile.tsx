import { memo, useRef, type CSSProperties, type ReactNode } from 'react'

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
  rotDeg: number
  ariaLabel: string
  onFocusIndex: (index: number) => void
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
    rotDeg,
    ariaLabel,
    onFocusIndex,
    onReveal,
    onFlag,
    onChord,
    setRef,
  } = props

  const longPressTimerRef = useRef<number | null>(null)
  const suppressClickRef = useRef(false)

  let content: ReactNode = ''
  if (revealed) {
    if (mine) content = '🌵'
    else if (adjacent > 0) content = adjacent
  } else if (flagged) {
    content = '🦋'
  }

  const classes = [
    'tile',
    revealed ? 'revealed' : 'hidden',
    mine && revealed ? 'mine' : '',
    flagged && !revealed ? 'flagged' : '',
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
          ['--tile-rot' as string]: `${revealed ? 0 : rotDeg}deg`,
        } as CSSProperties
      }
      disabled={disabled}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      data-num={revealed && !mine && adjacent > 0 ? adjacent : undefined}
      onFocus={() => onFocusIndex(index)}
      onTouchStart={(e) => {
        if (disabled) return
        // Two-finger tap chord gesture.
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

