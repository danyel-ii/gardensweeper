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
  const longPressFiredRef = useRef(false)
  const suppressResetTimerRef = useRef<number | null>(null)

  const scheduleSuppressReset = () => {
    if (suppressResetTimerRef.current != null) {
      window.clearTimeout(suppressResetTimerRef.current)
      suppressResetTimerRef.current = null
    }
    // If the long-press triggers a mobile context menu, some browsers won't dispatch a click.
    // This ensures we don't suppress the next real tap.
    suppressResetTimerRef.current = window.setTimeout(() => {
      suppressResetTimerRef.current = null
      suppressClickRef.current = false
      longPressFiredRef.current = false
    }, 900)
  }

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
          longPressFiredRef.current = true
          if (longPressTimerRef.current != null) {
            window.clearTimeout(longPressTimerRef.current)
            longPressTimerRef.current = null
          }
          onChord(x, y)
          scheduleSuppressReset()
        }
      }}
      onPointerDown={(e) => {
        if (disabled) return
        if (e.pointerType !== 'touch') return
        if (revealed) return
        suppressClickRef.current = false
        longPressFiredRef.current = false
        if (suppressResetTimerRef.current != null) {
          window.clearTimeout(suppressResetTimerRef.current)
          suppressResetTimerRef.current = null
        }
        if (longPressTimerRef.current != null) {
          window.clearTimeout(longPressTimerRef.current)
        }
        longPressTimerRef.current = window.setTimeout(() => {
          suppressClickRef.current = true
          longPressFiredRef.current = true
          onFlag(x, y)
          scheduleSuppressReset()
        }, 450)
      }}
      onPointerUp={(e) => {
        if (e.pointerType !== 'touch') return
        if (longPressTimerRef.current != null) {
          window.clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
        }
        if (longPressFiredRef.current) scheduleSuppressReset()
      }}
      onPointerCancel={() => {
        if (longPressTimerRef.current != null) {
          window.clearTimeout(longPressTimerRef.current)
          longPressTimerRef.current = null
        }
        if (suppressResetTimerRef.current != null) {
          window.clearTimeout(suppressResetTimerRef.current)
          suppressResetTimerRef.current = null
        }
        suppressClickRef.current = false
        longPressFiredRef.current = false
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
        // Some mobile browsers fire `contextmenu` after long-press.
        // If we already handled the long-press, don't double-toggle the flag.
        if (suppressClickRef.current || longPressFiredRef.current) {
          scheduleSuppressReset()
          return
        }
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
