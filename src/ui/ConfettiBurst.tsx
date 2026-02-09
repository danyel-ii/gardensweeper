import { useMemo, type CSSProperties } from 'react'

export type ConfettiPiece = {
  xPct: number
  sizeW: number
  sizeH: number
  radius: number
  color: string
  opacity: number
  driftX: number
  spinDeg: number
  delayMs: number
  durationMs: number
}

type ConfettiBurstProps = {
  pieces: ConfettiPiece[]
}

export function ConfettiBurst({ pieces }: ConfettiBurstProps) {
  const items = useMemo(() => pieces, [pieces])

  return (
    <div className="confettiLayer" aria-hidden="true">
      {items.map((p, i) => (
        <i
          key={i}
          className="confettiPiece"
          style={
            {
              left: `${p.xPct}%`,
              width: `${p.sizeW}px`,
              height: `${p.sizeH}px`,
              borderRadius: `${p.radius}px`,
              background: p.color,
              opacity: p.opacity,
              animationDelay: `${p.delayMs}ms`,
              animationDuration: `${p.durationMs}ms`,
              ['--confetti-dx' as string]: `${p.driftX}px`,
              ['--confetti-spin' as string]: `${p.spinDeg}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
