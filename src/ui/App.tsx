import { useEffect, useMemo, useState } from 'react'

import type { BoardSpec } from '../engine/board'
import { revealCell } from '../engine/game'
import { chord, createNewGame, toggleFlag, type GameState } from '../engine/game'
import { PRESETS, type DifficultyId } from '../state/presets'
import { randomSeed } from '../utils/seed'
import { Board } from './Board'
import { CustomGameModal } from './CustomGameModal'
import { Hud } from './Hud'
import { Modal } from './Modal'

function nowMs(): number {
  return Date.now()
}

function computeElapsedSeconds(game: GameState, tMs: number): number {
  if (game.startMs == null) return 0
  const end = game.endMs ?? tMs
  return Math.max(0, Math.floor((end - game.startMs) / 1000))
}

function bestDifficultyLabel(difficulty: DifficultyId, spec: BoardSpec): string {
  const preset = PRESETS.find((p) => p.id === difficulty)
  if (preset) return preset.label
  return `Custom ${spec.width}x${spec.height} (${spec.mineCount})`
}

function computeTileSizePx(width: number): number {
  // Keep it simple for now: scale down for larger boards, but stay tappable.
  if (width >= 30) return 20
  if (width >= 20) return 24
  return 28
}

export default function App() {
  const [difficulty, setDifficulty] = useState<DifficultyId>('beginner')
  const [spec, setSpec] = useState<BoardSpec>(() => PRESETS[0]!.spec)

  const [game, setGame] = useState<GameState>(() =>
    createNewGame({ ...PRESETS[0]!.spec, seed: randomSeed() }),
  )

  const [tMs, setTMs] = useState(() => nowMs())
  const [customOpen, setCustomOpen] = useState(false)

  const difficultyLabel = useMemo(
    () => bestDifficultyLabel(difficulty, spec),
    [difficulty, spec],
  )

  const minesRemaining = game.config.mineCount - game.flagsCount
  const elapsedSeconds = computeElapsedSeconds(game, tMs)
  const tileSizePx = computeTileSizePx(game.config.width)

  // Timer ticker: only while game is active and started.
  useEffect(() => {
    if (game.status !== 'playing') return
    if (game.startMs == null) return
    if (game.endMs != null) return
    const id = window.setInterval(() => setTMs(nowMs()), 250)
    return () => window.clearInterval(id)
  }, [game.status, game.startMs, game.endMs])

  // Global keyboard shortcuts.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target != null &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      if (typing) return

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        setGame(createNewGame({ ...spec, seed: randomSeed() }))
        return
      }
      if (e.key === '1') {
        e.preventDefault()
        const p = PRESETS.find((x) => x.id === 'beginner')!
        setDifficulty('beginner')
        setSpec(p.spec)
        setGame(createNewGame({ ...p.spec, seed: randomSeed() }))
        return
      }
      if (e.key === '2') {
        e.preventDefault()
        const p = PRESETS.find((x) => x.id === 'intermediate')!
        setDifficulty('intermediate')
        setSpec(p.spec)
        setGame(createNewGame({ ...p.spec, seed: randomSeed() }))
        return
      }
      if (e.key === '3') {
        e.preventDefault()
        const p = PRESETS.find((x) => x.id === 'expert')!
        setDifficulty('expert')
        setSpec(p.spec)
        setGame(createNewGame({ ...p.spec, seed: randomSeed() }))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [spec])

  const startNewGame = (nextSpec: BoardSpec, nextDifficulty: DifficultyId) => {
    setDifficulty(nextDifficulty)
    setSpec(nextSpec)
    setGame(createNewGame({ ...nextSpec, seed: randomSeed() }))
  }

  return (
    <div className="app" data-app>
      <header className="appHeader">
        <div className="appHeaderInner">
          <div className="titleRow">
            <div>
              <h1 className="appTitle">Minesweeper Studio</h1>
              <p className="appSubtitle">
                Core gameplay first. Visual "studio" settings arrive in the next
                milestones.
              </p>
            </div>
            <div className="headerMeta">
              <span className="metaPill">{difficultyLabel}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="appMain appMainGame">
        <section className="panel" aria-label="Game">
          <Hud
            minesRemaining={minesRemaining}
            timeSeconds={elapsedSeconds}
            difficultyLabel={difficultyLabel}
            status={game.status}
            onRestart={() => setGame(createNewGame({ ...spec, seed: randomSeed() }))}
            onPreset={(id) => {
              const p = PRESETS.find((x) => x.id === id)!
              startNewGame(p.spec, id)
            }}
            onOpenCustom={() => setCustomOpen(true)}
          />

          <Board
            game={game}
            tileSizePx={tileSizePx}
            onReveal={(x, y) => {
              setGame((g) => revealCell(g, x, y, nowMs()).state)
            }}
            onFlag={(x, y) => {
              setGame((g) => toggleFlag(g, x, y, nowMs()))
            }}
            onChord={(x, y) => {
              setGame((g) => chord(g, x, y, nowMs()))
            }}
          />
        </section>

        <section className="panel sidePanel" aria-label="Info">
          <h2 className="panelTitle">Controls</h2>
          <div className="helpList">
            <div>
              <span className="helpKey">Left click</span> reveal
            </div>
            <div>
              <span className="helpKey">Right click</span> flag
            </div>
            <div>
              <span className="helpKey">Middle click</span> chord
            </div>
            <div>
              <span className="helpKey">Shift + click</span> chord
            </div>
            <div>
              <span className="helpKey">Arrows</span> move focus
            </div>
            <div>
              <span className="helpKey">Enter</span> reveal focused tile
            </div>
            <div>
              <span className="helpKey">F</span> flag focused tile
            </div>
            <div>
              <span className="helpKey">Space</span> chord focused tile
            </div>
            <div>
              <span className="helpKey">R</span> restart
            </div>
            <div>
              <span className="helpKey">1 / 2 / 3</span> presets
            </div>
          </div>
        </section>
      </main>

      <CustomGameModal
        open={customOpen}
        initialSpec={spec}
        onClose={() => setCustomOpen(false)}
        onStart={(nextSpec) => startNewGame(nextSpec, 'custom')}
      />

      <Modal
        open={game.status === 'won'}
        title="You win"
        onClose={() => setGame(createNewGame({ ...spec, seed: randomSeed() }))}
        actions={
          <>
            <button
              className="btn btnGhost"
              onClick={() => setGame(createNewGame({ ...spec, seed: randomSeed() }))}
            >
              Close
            </button>
            <button
              className="btn"
              onClick={() => setGame(createNewGame({ ...spec, seed: randomSeed() }))}
            >
              New game
            </button>
          </>
        }
      >
        <p className="modalText">
          Time: <span className="mono">{elapsedSeconds}s</span>
        </p>
      </Modal>

      <Modal
        open={game.status === 'lost'}
        title="Boom"
        onClose={() => setGame(createNewGame({ ...spec, seed: randomSeed() }))}
        actions={
          <>
            <button
              className="btn btnGhost"
              onClick={() => setGame(createNewGame({ ...spec, seed: randomSeed() }))}
            >
              Close
            </button>
            <button
              className="btn"
              onClick={() => setGame(createNewGame({ ...spec, seed: randomSeed() }))}
            >
              Restart
            </button>
          </>
        }
      >
        <p className="modalText">Try again.</p>
      </Modal>

      <footer className="appFooter">
        <small>
          Milestone 2 UI: playable core. Milestones 3+ add Settings, themes, and
          polish.
        </small>
      </footer>
    </div>
  )
}

