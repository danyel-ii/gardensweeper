import type { DifficultyId } from '../state/presets'

type HudProps = {
  minesRemaining: number
  timeSeconds: number
  difficultyLabel: string
  status: 'playing' | 'won' | 'lost'
  onRestart: () => void
  onPreset: (id: Exclude<DifficultyId, 'custom'>) => void
  onOpenCustom: () => void
}

function pad3(n: number): string {
  const clamped = Math.max(0, Math.min(999, Math.floor(n)))
  return clamped.toString().padStart(3, '0')
}

export function Hud({
  minesRemaining,
  timeSeconds,
  difficultyLabel,
  status,
  onRestart,
  onPreset,
  onOpenCustom,
}: HudProps) {
  return (
    <div className="hud" aria-label="Game HUD">
      <div className="hudLeft">
        <div className="hudStat" aria-label="Mines remaining">
          <span className="hudStatLabel">Mines</span>
          <span className="hudStatValue">{pad3(minesRemaining)}</span>
        </div>
        <div className="hudStat" aria-label="Timer">
          <span className="hudStatLabel">Time</span>
          <span className="hudStatValue">{pad3(timeSeconds)}</span>
        </div>
      </div>

      <div className="hudCenter">
        <button className="btn" onClick={onRestart} aria-label="Restart (R)">
          {status === 'lost' ? 'Restart' : status === 'won' ? 'Again' : 'Reset'}
        </button>
        <div className="hudDifficulty" aria-label="Difficulty">
          {difficultyLabel}
        </div>
      </div>

      <div className="hudRight">
        <div className="hudPresets" aria-label="Difficulty presets">
          <button className="btn btnGhost" onClick={() => onPreset('beginner')}>
            1
          </button>
          <button
            className="btn btnGhost"
            onClick={() => onPreset('intermediate')}
          >
            2
          </button>
          <button className="btn btnGhost" onClick={() => onPreset('expert')}>
            3
          </button>
          <button className="btn btnGhost" onClick={onOpenCustom}>
            Custom
          </button>
        </div>
      </div>
    </div>
  )
}

