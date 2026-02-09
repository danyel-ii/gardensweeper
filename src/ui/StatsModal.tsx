import type { ReactNode } from 'react'

import type { Stats } from '../state/stats'
import { resetStats } from '../state/stats'
import { Modal } from './Modal'

type StatsModalProps = {
  open: boolean
  stats: Stats
  onChangeStats: (next: Stats) => void
  onClose: () => void
}

function row(label: string, value: ReactNode) {
  return (
    <div className="statsRow">
      <div className="statsLabel">{label}</div>
      <div className="statsValue">{value}</div>
    </div>
  )
}

export function StatsModal({ open, stats, onChangeStats, onClose }: StatsModalProps) {
  const b = stats.bestSeconds

  return (
    <Modal
      open={open}
      title="Stats"
      onClose={onClose}
      actions={
        <>
          <button className="btn btnGhost" onClick={onClose}>
            Close
          </button>
          <button className="btn" onClick={() => onChangeStats(resetStats())}>
            Reset stats
          </button>
        </>
      }
    >
      <div className="statsGrid" aria-label="Best times">
        {row('Beginner', b.beginner != null ? <span className="mono">{b.beginner}s</span> : '—')}
        {row(
          'Intermediate',
          b.intermediate != null ? <span className="mono">{b.intermediate}s</span> : '—',
        )}
        {row('Expert', b.expert != null ? <span className="mono">{b.expert}s</span> : '—')}
      </div>
      <p className="statsNote">
        Best times are stored locally in this browser.
      </p>
    </Modal>
  )
}

