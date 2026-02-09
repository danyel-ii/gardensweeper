import { useCallback, useEffect, useMemo, useState } from 'react'

import type { BoardSpec } from '../engine/board'
import { chord, createNewGame, revealCell, toggleFlag, type GameState } from '../engine/game'
import { indexToX, indexToY } from '../engine/grid'
import { randomSeed } from '../utils/seed'
import { buildUrl, parseUrlParams } from '../utils/urlState'
import { AmbienceP5 } from './AmbienceP5'
import { Board } from './Board'
import { Modal } from './Modal'

function nowMs(): number {
  return Date.now()
}

function pad3(n: number): string {
  const clamped = Math.max(0, Math.min(999, Math.floor(n)))
  return clamped.toString().padStart(3, '0')
}

function computeElapsedSeconds(game: GameState, tMs: number): number {
  if (game.startMs == null) return 0
  const end = game.endMs ?? tMs
  return Math.max(0, Math.floor((end - game.startMs) / 1000))
}

function computeTileSizePx(width: number): number {
  // Tuned for a playful, "sticker" look while staying usable on mobile.
  if (width >= 30) return 18
  if (width >= 24) return 20
  if (width >= 20) return 22
  if (width >= 16) return 26
  if (width >= 10) return 30
  return 34
}

const DEFAULT_SPEC: BoardSpec = { width: 10, height: 10, mineCount: 12 }

export default function App() {
  const [boot] = useState(() => {
    const fromUrl = parseUrlParams(window.location.search)
    if (fromUrl) {
      try {
        let game = createNewGame({ ...fromUrl.spec, seed: fromUrl.seed })
        if (fromUrl.start) {
          game = revealCell(game, fromUrl.start.x, fromUrl.start.y).state
        }
        return { spec: fromUrl.spec, game, seedDraft: fromUrl.seed }
      } catch {
        // fall through to defaults
      }
    }

    const seed = randomSeed()
    const game = createNewGame({ ...DEFAULT_SPEC, seed })
    return { spec: DEFAULT_SPEC, game, seedDraft: seed }
  })

  const [spec, setSpec] = useState<BoardSpec>(() => boot.spec)
  const [game, setGame] = useState<GameState>(() => boot.game)
  const [seedDraft, setSeedDraft] = useState(() => boot.seedDraft)
  const [copied, setCopied] = useState(false)
  const [tMs, setTMs] = useState(() => nowMs())

  const minesRemaining = game.config.mineCount - game.flagsCount
  const elapsedSeconds = computeElapsedSeconds(game, tMs)
  const tileSizePx = computeTileSizePx(game.config.width)
  const canCopyLink = game.generated && game.firstClickIndex != null

  const beginNewGame = useCallback((nextSpec: BoardSpec, nextSeed: string) => {
    const seed = nextSeed.trim()
    if (seed.length === 0) return
    setSpec(nextSpec)
    setSeedDraft(seed)
    setCopied(false)
    setGame(createNewGame({ ...nextSpec, seed }))
  }, [])

  // Sync URL to reflect the current "challenge". Adds sx/sy only after first reveal.
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
    })
    history.replaceState(null, '', href)
  }, [
    game.config.width,
    game.config.height,
    game.config.mineCount,
    game.config.seed,
    game.generated,
    game.firstClickIndex,
  ])

  // Timer ticker: only while game is active and started.
  useEffect(() => {
    if (game.status !== 'playing') return
    if (game.startMs == null) return
    if (game.endMs != null) return
    const id = window.setInterval(() => setTMs(nowMs()), 250)
    return () => window.clearInterval(id)
  }, [game.status, game.startMs, game.endMs])

  // Global keyboard shortcut: R = restart with a new seed.
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
        beginNewGame(spec, randomSeed())
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [beginNewGame, spec])

  const handleReveal = useCallback((x: number, y: number) => {
    const t = nowMs()
    setGame((g) => revealCell(g, x, y, t).state)
  }, [])

  const handleFlag = useCallback((x: number, y: number) => {
    const t = nowMs()
    setGame((g) => toggleFlag(g, x, y, t))
  }, [])

  const handleChord = useCallback((x: number, y: number) => {
    const t = nowMs()
    setGame((g) => chord(g, x, y, t))
  }, [])

  const difficultyLabel = useMemo(() => {
    return `${game.config.width}×${game.config.height} / ${game.config.mineCount}`
  }, [game.config.width, game.config.height, game.config.mineCount])

  return (
    <div className="app" data-game-status={game.status}>
      <div className="liquidGlassBg" aria-hidden="true" />
      <div className="textureOverlay" aria-hidden="true" />
      <AmbienceP5 />

      <div className="bgSticker stickerTL" aria-hidden="true">
        <svg viewBox="0 0 100 100" role="presentation">
          <path
            d="M50 50 Q70 10 90 50 T50 90 T10 50 T50 10"
            fill="var(--ref-pink)"
            stroke="white"
            strokeWidth="3"
          />
          <circle cx="50" cy="50" r="10" fill="var(--ref-gold)" />
        </svg>
      </div>

      <div className="bgSticker stickerBR" aria-hidden="true">
        <svg viewBox="0 0 100 100" role="presentation">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="var(--ref-lime)"
            stroke="white"
            strokeWidth="3"
          />
          <circle cx="50" cy="50" r="40" fill="#fff" opacity="0.28" />
          <path d="M50 50 L50 10" stroke="white" strokeWidth="2" />
          <path d="M50 50 L90 50" stroke="white" strokeWidth="2" />
          <path d="M50 50 L50 90" stroke="white" strokeWidth="2" />
          <path d="M50 50 L10 50" stroke="white" strokeWidth="2" />
          <path d="M50 50 L22 22" stroke="white" strokeWidth="2" />
          <path d="M50 50 L78 22" stroke="white" strokeWidth="2" />
          <path d="M50 50 L78 78" stroke="white" strokeWidth="2" />
          <path d="M50 50 L22 78" stroke="white" strokeWidth="2" />
        </svg>
      </div>

      <div className="bgSticker stickerTR" aria-hidden="true">
        <svg viewBox="0 0 100 100" role="presentation">
          <polygon
            points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
            fill="var(--ref-papaya)"
            stroke="white"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="bgSticker stickerBL" aria-hidden="true">
        <svg viewBox="0 0 100 100" role="presentation">
          <path
            d="M50 90 Q10 60 10 30 Q10 10 50 10 Q90 10 90 30 Q90 60 50 90"
            fill="var(--ref-teal)"
            stroke="white"
            strokeWidth="3"
          />
          <path d="M50 15 L50 85" stroke="#fff" strokeWidth="2" opacity="0.5" />
        </svg>
      </div>

      <div className="gameWrapper">
        <header className="gardenHeader" aria-label="Game header">
          <div className="hudPanel" aria-label="Mines remaining">
            <div className="hudItem">
              <span className="icon" aria-hidden="true">
                🌵
              </span>
              <span className="hudValue">{pad3(minesRemaining)}</span>
            </div>
          </div>

          <div className="titleBlock">
            <h1 className="gardenTitle">Garden Sweeper</h1>
            <div className="gardenSub">{difficultyLabel}</div>
          </div>

          <div className="hudPanel" aria-label="Timer">
            <div className="hudItem">
              <span className="icon" aria-hidden="true">
                ⏱️
              </span>
              <span className="hudValue">{pad3(elapsedSeconds)}</span>
            </div>
          </div>
        </header>

        <div className="seedRow" aria-label="Seed and sharing">
          <label className="seedLabel">
            <span className="seedLabelText">Seed</span>
            <input
              className="seedInput"
              value={seedDraft}
              onChange={(e) => setSeedDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return
                beginNewGame(spec, seedDraft)
              }}
            />
          </label>

          <div className="seedButtons">
            <button
              className="seedBtn"
              type="button"
              onClick={() => beginNewGame(spec, randomSeed())}
            >
              New seed
            </button>
            <button
              className="seedBtn seedBtnPrimary"
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

          <div className="seedHint" aria-live="polite">
            {copied ? (
              <span className="seedCopied">Copied.</span>
            ) : canCopyLink ? (
              <span>Share reproduces the exact board.</span>
            ) : (
              <span>Make a first move to generate a shareable board.</span>
            )}
          </div>
        </div>

        <Board
          key={`${game.config.width}x${game.config.height}:${game.config.mineCount}:${game.config.seed}`}
          game={game}
          tileSizePx={tileSizePx}
          onReveal={handleReveal}
          onFlag={handleFlag}
          onChord={handleChord}
        />

        <div className="actionsRow">
          <button
            className="resetBtn"
            type="button"
            onClick={() => beginNewGame(spec, randomSeed())}
          >
            Plant New Garden
          </button>
        </div>
      </div>

      <Modal
        open={game.status === 'won'}
        title="Garden Grown!"
        onClose={() => beginNewGame(spec, randomSeed())}
        actions={
          <button className="seedBtn seedBtnPrimary" onClick={() => beginNewGame(spec, randomSeed())}>
            Play again
          </button>
        }
      >
        <p className="modalText">
          You cleared the garden in <span className="mono">{elapsedSeconds}s</span>.
        </p>
      </Modal>

      <Modal
        open={game.status === 'lost'}
        title="Ouch!"
        onClose={() => beginNewGame(spec, randomSeed())}
        actions={
          <button className="seedBtn seedBtnPrimary" onClick={() => beginNewGame(spec, randomSeed())}>
            Try again
          </button>
        }
      >
        <p className="modalText">You touched a prickly cactus.</p>
      </Modal>
    </div>
  )
}
