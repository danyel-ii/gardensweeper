import { memo, type CSSProperties } from 'react'

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
    tvRotDeg,
    tvBright,
    ariaLabel,
    onFocusIndex,
    onReveal,
    onFlag,
    onChord,
    setRef,
  } = props

  let content: string | number = ''
  if (revealed) {
    if (mine) content = 'X'
    else if (adjacent > 0) content = adjacent
  } else if (flagged) {
    content = 'F'
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
          ['--tv-rot' as string]: `${tvRotDeg}deg`,
          ['--tv-bright' as string]: tvBright,
        } as CSSProperties
      }
      disabled={disabled}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      onFocus={() => onFocusIndex(index)}
      onMouseDown={(e) => {
        if (e.button === 1) {
          e.preventDefault()
          onChord(x, y)
        }
      }}
      onClick={(e) => {
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
