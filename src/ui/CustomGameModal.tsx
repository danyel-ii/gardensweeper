import { useMemo, useState } from 'react'

import type { BoardSpec } from '../engine/board'
import { validateCustomSpec } from '../state/presets'
import { Modal } from './Modal'

type CustomGameModalProps = {
  open: boolean
  initialSpec: BoardSpec
  onClose: () => void
  onStart: (spec: BoardSpec) => void
}

export function CustomGameModal({
  open,
  initialSpec,
  onClose,
  onStart,
}: CustomGameModalProps) {
  const [width, setWidth] = useState(String(initialSpec.width))
  const [height, setHeight] = useState(String(initialSpec.height))
  const [mineCount, setMineCount] = useState(String(initialSpec.mineCount))

  const parsed = useMemo(() => {
    const w = Number.parseInt(width, 10)
    const h = Number.parseInt(height, 10)
    const m = Number.parseInt(mineCount, 10)
    if (Number.isNaN(w) || Number.isNaN(h) || Number.isNaN(m)) {
      return { ok: false as const, error: 'All fields must be integers.' }
    }
    return validateCustomSpec(w, h, m)
  }, [width, height, mineCount])

  return (
    <Modal
      open={open}
      title="Custom game"
      onClose={onClose}
      actions={
        <>
          <button className="btn btnGhost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn"
            disabled={!parsed.ok}
            onClick={() => {
              if (!parsed.ok) return
              onStart(parsed.spec)
              onClose()
            }}
          >
            Start
          </button>
        </>
      }
    >
      <div className="formGrid">
        <label className="formField">
          <span className="formLabel">Width</span>
          <input
            className="input"
            inputMode="numeric"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
        </label>
        <label className="formField">
          <span className="formLabel">Height</span>
          <input
            className="input"
            inputMode="numeric"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </label>
        <label className="formField">
          <span className="formLabel">Mines</span>
          <input
            className="input"
            inputMode="numeric"
            value={mineCount}
            onChange={(e) => setMineCount(e.target.value)}
          />
        </label>
      </div>

      {!parsed.ok ? <div className="formError">{parsed.error}</div> : null}
    </Modal>
  )
}

