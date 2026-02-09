import { useEffect, useMemo, useRef, useState } from 'react'

import type { BoardSpec } from '../engine/board'
import { revealCell } from '../engine/game'
import { chord, createNewGame, toggleFlag, type GameState } from '../engine/game'
import { indexToX, indexToY } from '../engine/grid'
import { PRESETS, type DifficultyId } from '../state/presets'
import { DEFAULT_SETTINGS, useSettings } from '../state/settings'
import { loadStats, recordWin, saveStats, type DifficultyKey } from '../state/stats'
import { randomSeed } from '../utils/seed'
import {
  buildUrl,
  decodeVisualPreset,
  encodeVisualPreset,
  parseUrlParams,
} from '../utils/urlState'
import { Board } from './Board'
import { CustomGameModal } from './CustomGameModal'
import { HelpModal } from './HelpModal'
import { Hud } from './Hud'
import { Modal } from './Modal'
import { SettingsModal } from './SettingsModal'
import { StatsModal } from './StatsModal'
import { useAudio } from './useAudio'

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

function difficultyFromSpec(spec: BoardSpec): DifficultyId {
  const match = PRESETS.find(
    (p) =>
      p.spec.width === spec.width &&
      p.spec.height === spec.height &&
      p.spec.mineCount === spec.mineCount,
  )
  return match?.id ?? 'custom'
}

function computeTileSizePx(width: number): number {
  // Keep it simple for now: scale down for larger boards, but stay tappable.
  if (width >= 30) return 20
  if (width >= 20) return 24
  return 28
}

export default function App() {
  const { settings, setSettings } = useSettings()
  const { playSfx, haptic } = useAudio(settings)
  const prevGameRef = useRef<GameState | null>(null)
  const prevMuteRef = useRef<{ sfxEnabled: boolean; ambienceEnabled: boolean } | null>(
    null,
  )

  const initial = useMemo(() => {
    const parsed = parseUrlParams(window.location.search)
    const keepVisualPresetInUrl = Boolean(parsed.visual?.preset)
    const fromUrl = parsed.game
    if (fromUrl) {
      try {
        const spec: BoardSpec = fromUrl.spec
        const difficulty = difficultyFromSpec(spec)
        let game = createNewGame({ ...spec, seed: fromUrl.seed.trim() })
        if (fromUrl.start) {
          game = revealCell(game, fromUrl.start.x, fromUrl.start.y).state
        }
        return {
          spec,
          difficulty,
          game,
          seedDraft: fromUrl.seed.trim(),
          keepVisualPresetInUrl,
        }
      } catch {
        // fall through to defaults
      }
    }

    const spec = PRESETS[0]!.spec
    const seedDraft = randomSeed()
    const game = createNewGame({ ...spec, seed: seedDraft })
    return {
      spec,
      difficulty: 'beginner' as DifficultyId,
      game,
      seedDraft,
      keepVisualPresetInUrl,
    }
  }, [])

  const [difficulty, setDifficulty] = useState<DifficultyId>(initial.difficulty)
  const [spec, setSpec] = useState<BoardSpec>(() => initial.spec)
  const [game, setGame] = useState<GameState>(() => initial.game)
  const [seedDraft, setSeedDraft] = useState(() => initial.seedDraft)
  const keepVisualPresetInUrl = initial.keepVisualPresetInUrl

  const [tMs, setTMs] = useState(() => nowMs())
  const [customOpen, setCustomOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [stats, setStats] = useState(() => loadStats())
  const [copied, setCopied] = useState(false)
  const [revealOrigin, setRevealOrigin] = useState<{ x: number; y: number } | null>(
    null,
  )

  const difficultyLabel = useMemo(
    () => bestDifficultyLabel(difficulty, spec),
    [difficulty, spec],
  )

  const minesRemaining = game.config.mineCount - game.flagsCount
  const elapsedSeconds = computeElapsedSeconds(game, tMs)
  const tileSizePx = computeTileSizePx(game.config.width)
  const canCopyLink = game.generated && game.firstClickIndex != null

  useEffect(() => {
    const prev = prevGameRef.current
    prevGameRef.current = game
    if (!prev) return

    const sameGame =
      prev.config.seed === game.config.seed &&
      prev.config.width === game.config.width &&
      prev.config.height === game.config.height &&
      prev.config.mineCount === game.config.mineCount
    if (!sameGame) return

    if (prev.status === 'playing' && game.status === 'won') {
      playSfx('win')
      haptic('win')
      return
    }
    if (prev.status === 'playing' && game.status === 'lost') {
      playSfx('lose')
      haptic('lose')
      return
    }

    if (game.flagsCount > prev.flagsCount) {
      playSfx('flag')
      haptic('flag')
      return
    }
    if (game.revealedCount > prev.revealedCount) {
      playSfx('reveal')
      haptic('reveal')
    }
  }, [game, playSfx, haptic])

  useEffect(() => {
    saveStats(stats)
  }, [stats])

  useEffect(() => {
    const parsed = parseUrlParams(window.location.search)
    const visual = parsed.visual
    if (!visual) return

    setSettings((prev) => {
      let next = prev
      if (visual.preset) {
        const partial = decodeVisualPreset(visual.preset)
        if (partial) next = { ...DEFAULT_SETTINGS, ...partial }
      }
      if (visual.themePackId) next = { ...next, themePackId: visual.themePackId }
      return next
    })
  }, [setSettings])

  useEffect(() => {
    setSeedDraft(game.config.seed)
  }, [game.config.seed])

  useEffect(() => {
    const start =
      game.generated && game.firstClickIndex != null
        ? {
            x: indexToX(game.config.width, game.firstClickIndex),
            y: indexToY(game.config.width, game.firstClickIndex),
          }
        : null

    const href = buildUrl(window.location.href, {
      spec: {
        width: game.config.width,
        height: game.config.height,
        mineCount: game.config.mineCount,
      },
      seed: game.config.seed,
      start,
      themePackId: settings.themePackId,
      preset: keepVisualPresetInUrl ? encodeVisualPreset(settings) : undefined,
    })

    history.replaceState(null, '', href)
  }, [
    game.config.width,
    game.config.height,
    game.config.mineCount,
    game.config.seed,
    game.generated,
    game.firstClickIndex,
    settings,
    keepVisualPresetInUrl,
  ])

  useEffect(() => {
    if (game.status !== 'won') return
    if (difficulty === 'custom') return
    const key = difficulty as DifficultyKey
    setStats((s) => recordWin(s, key, elapsedSeconds))
  }, [game.status, game.config.seed, difficulty, elapsedSeconds])

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

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault()
        setSettings((s) => {
          const muted = !s.sfxEnabled && !s.ambienceEnabled
          if (!muted) {
            prevMuteRef.current = {
              sfxEnabled: s.sfxEnabled,
              ambienceEnabled: s.ambienceEnabled,
            }
            return { ...s, sfxEnabled: false, ambienceEnabled: false }
          }
          const prevAudio = prevMuteRef.current
          prevMuteRef.current = null
          return {
            ...s,
            sfxEnabled: prevAudio?.sfxEnabled ?? true,
            ambienceEnabled: prevAudio?.ambienceEnabled ?? false,
          }
        })
        return
      }

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault()
        setRevealOrigin(null)
        setGame(createNewGame({ ...spec, seed: randomSeed() }))
        return
      }
      if (e.key === '1') {
        e.preventDefault()
        const p = PRESETS.find((x) => x.id === 'beginner')!
        setRevealOrigin(null)
        setDifficulty('beginner')
        setSpec(p.spec)
        setGame(createNewGame({ ...p.spec, seed: randomSeed() }))
        return
      }
      if (e.key === '2') {
        e.preventDefault()
        const p = PRESETS.find((x) => x.id === 'intermediate')!
        setRevealOrigin(null)
        setDifficulty('intermediate')
        setSpec(p.spec)
        setGame(createNewGame({ ...p.spec, seed: randomSeed() }))
        return
      }
      if (e.key === '3') {
        e.preventDefault()
        const p = PRESETS.find((x) => x.id === 'expert')!
        setRevealOrigin(null)
        setDifficulty('expert')
        setSpec(p.spec)
        setGame(createNewGame({ ...p.spec, seed: randomSeed() }))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [spec, setSettings])

  const startNewGame = (nextSpec: BoardSpec, nextDifficulty: DifficultyId) => {
    setDifficulty(nextDifficulty)
    setSpec(nextSpec)
    setGame(createNewGame({ ...nextSpec, seed: randomSeed() }))
    setRevealOrigin(null)
  }

  return (
    <div className="app" data-app data-game-status={game.status}>
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
              <button
                className="btn btnGhost"
                type="button"
                onClick={() => setSettingsOpen(true)}
              >
                Settings
              </button>
              <button
                className="btn btnGhost"
                type="button"
                onClick={() => setHelpOpen(true)}
              >
                Help
              </button>
              <button
                className="btn btnGhost"
                type="button"
                onClick={() => setStatsOpen(true)}
              >
                Stats
              </button>
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
            onRestart={() => {
              setRevealOrigin(null)
              setGame(createNewGame({ ...spec, seed: randomSeed() }))
            }}
            onPreset={(id) => {
              const p = PRESETS.find((x) => x.id === id)!
              startNewGame(p.spec, id)
            }}
            onOpenCustom={() => setCustomOpen(true)}
          />

          <div className="seedBar" aria-label="Seed and sharing">
            <label className="seedLabel">
              <span className="seedLabelText">Seed</span>
              <input
                className="input seedInput"
                value={seedDraft}
                onChange={(e) => setSeedDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  const nextSeed = seedDraft.trim()
                  if (!nextSeed) return
                  setRevealOrigin(null)
                  setGame(createNewGame({ ...spec, seed: nextSeed }))
                }}
              />
            </label>
            <div className="seedButtons">
              <button
                className="btn btnGhost"
                type="button"
                onClick={() => {
                  const nextSeed = randomSeed()
                  setSeedDraft(nextSeed)
                  setRevealOrigin(null)
                  setGame(createNewGame({ ...spec, seed: nextSeed }))
                }}
              >
                New seed
              </button>
              <button
                className="btn btnGhost"
                type="button"
                disabled={seedDraft.trim().length === 0 || seedDraft.trim() === game.config.seed}
                onClick={() => {
                  const nextSeed = seedDraft.trim()
                  if (!nextSeed) return
                  setRevealOrigin(null)
                  setGame(createNewGame({ ...spec, seed: nextSeed }))
                }}
              >
                Set seed
              </button>
              <button
                className="btn"
                type="button"
                disabled={!canCopyLink}
                onClick={async () => {
                  if (!canCopyLink) return
                  const start = {
                    x: indexToX(game.config.width, game.firstClickIndex!),
                    y: indexToY(game.config.width, game.firstClickIndex!),
                  }
                  const href = buildUrl(window.location.href, {
                    spec: {
                      width: game.config.width,
                      height: game.config.height,
                      mineCount: game.config.mineCount,
                    },
                    seed: game.config.seed,
                    start,
                    themePackId: settings.themePackId,
                    preset: encodeVisualPreset(settings),
                  })

                  try {
                    await navigator.clipboard.writeText(href)
                    setCopied(true)
                    window.setTimeout(() => setCopied(false), 1400)
                  } catch {
                    // Fallback for older browsers.
                    const ta = document.createElement('textarea')
                    ta.value = href
                    ta.style.position = 'fixed'
                    ta.style.left = '-9999px'
                    document.body.appendChild(ta)
                    ta.select()
                    document.execCommand('copy')
                    document.body.removeChild(ta)
                    setCopied(true)
                    window.setTimeout(() => setCopied(false), 1400)
                  }
                }}
              >
                Copy link
              </button>
            </div>
            <div className="seedHint">
              {copied ? (
                <span className="seedCopied">Copied.</span>
              ) : canCopyLink ? (
                <span>Share reproduces board + visuals.</span>
              ) : (
                <span>Start a game (first reveal) to generate a shareable board.</span>
              )}
            </div>
          </div>

          <Board
            game={game}
            tileSizePx={tileSizePx}
            revealOrigin={revealOrigin}
            onReveal={(x, y) => {
              setRevealOrigin({ x, y })
              setGame((g) => revealCell(g, x, y, nowMs()).state)
            }}
            onFlag={(x, y) => {
              setGame((g) => toggleFlag(g, x, y, nowMs()))
            }}
            onChord={(x, y) => {
              setRevealOrigin({ x, y })
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
            <div>
              <span className="helpKey">M</span> mute/unmute
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

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <StatsModal
        open={statsOpen}
        stats={stats}
        onChangeStats={setStats}
        onClose={() => setStatsOpen(false)}
      />

      <Modal
        open={game.status === 'won'}
        title="You win"
        onClose={() => {
          setRevealOrigin(null)
          setGame(createNewGame({ ...spec, seed: randomSeed() }))
        }}
        actions={
          <>
            <button
              className="btn btnGhost"
              onClick={() => {
                setRevealOrigin(null)
                setGame(createNewGame({ ...spec, seed: randomSeed() }))
              }}
            >
              Close
            </button>
            <button
              className="btn"
              onClick={() => {
                setRevealOrigin(null)
                setGame(createNewGame({ ...spec, seed: randomSeed() }))
              }}
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
        onClose={() => {
          setRevealOrigin(null)
          setGame(createNewGame({ ...spec, seed: randomSeed() }))
        }}
        actions={
          <>
            <button
              className="btn btnGhost"
              onClick={() => {
                setRevealOrigin(null)
                setGame(createNewGame({ ...spec, seed: randomSeed() }))
              }}
            >
              Close
            </button>
            <button
              className="btn"
              onClick={() => {
                setRevealOrigin(null)
                setGame(createNewGame({ ...spec, seed: randomSeed() }))
              }}
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
