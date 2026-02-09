import { generateBoard } from './board'
import type { Board, BoardSpec } from './board'
import { forEachNeighborIndex, inBounds, xyToIndex } from './grid'

export type GameConfig = BoardSpec & { seed: string }

export type GameStatus = 'playing' | 'won' | 'lost'

export type GameState = {
  config: GameConfig
  status: GameStatus
  generated: boolean
  firstClickIndex: number | null
  board: Board
  revealed: Uint8Array
  flagged: Uint8Array
  revealedCount: number // non-mine cells only
  flagsCount: number
  startMs: number | null
  endMs: number | null
}

export type RevealResult = {
  state: GameState
  safetyModeUsed?: 'neighbors' | 'cell'
}

function assertValidConfig(config: GameConfig): void {
  // BoardSpec validation happens in generateBoard and helpers. Here we keep it minimal.
  if (typeof config.seed !== 'string') {
    throw new Error('seed must be a string')
  }
}

export function createNewGame(config: GameConfig): GameState {
  assertValidConfig(config)
  const total = config.width * config.height
  if (!Number.isInteger(total) || total <= 0) {
    throw new Error('Invalid board size')
  }

  const board: Board = {
    width: config.width,
    height: config.height,
    mineCount: config.mineCount,
    mines: new Uint8Array(total),
    adjacentMineCounts: new Uint8Array(total),
  }

  return {
    config,
    status: 'playing',
    generated: false,
    firstClickIndex: null,
    board,
    revealed: new Uint8Array(total),
    flagged: new Uint8Array(total),
    revealedCount: 0,
    flagsCount: 0,
    startMs: null,
    endMs: null,
  }
}

function withStartTime(state: GameState, nowMs?: number): GameState {
  if (state.startMs != null) return state
  if (nowMs == null) return state
  return { ...state, startMs: nowMs }
}

function withEndTimeIfMissing(
  state: GameState,
  nowMs: number | undefined,
): GameState {
  if (state.endMs != null) return state
  if (nowMs == null) return state
  return { ...state, endMs: nowMs }
}

function checkWinAndFinalize(state: GameState, nowMs?: number): GameState {
  if (state.status !== 'playing') return state
  const total = state.config.width * state.config.height
  const safeCells = total - state.config.mineCount
  if (state.revealedCount !== safeCells) return state
  return withEndTimeIfMissing({ ...state, status: 'won' }, nowMs)
}

function revealAllMines(state: GameState): GameState {
  const revealed = state.revealed.slice()
  const mines = state.board.mines
  for (let i = 0; i < mines.length; i += 1) {
    if (mines[i] === 1) revealed[i] = 1
  }
  return { ...state, revealed }
}

function applyReveals(
  state: GameState,
  startIndices: number[],
  nowMs?: number,
): GameState {
  if (state.status !== 'playing') return state
  const total = state.config.width * state.config.height
  const revealed = state.revealed.slice()
  let revealedCount = state.revealedCount

  const queue = [...startIndices]
  while (queue.length > 0) {
    const idx = queue.pop()!
    if (idx < 0 || idx >= total) continue
    if (revealed[idx] === 1) continue
    if (state.flagged[idx] === 1) continue

    // Mine hit: game over (and reveal mines for UX).
    if (state.board.mines[idx] === 1) {
      revealed[idx] = 1
      const lost = withEndTimeIfMissing({ ...state, status: 'lost', revealed }, nowMs)
      return revealAllMines(lost)
    }

    revealed[idx] = 1
    revealedCount += 1

    // Flood expansion: if this cell is 0, reveal all neighboring non-mine cells.
    if (state.board.adjacentMineCounts[idx] === 0) {
      forEachNeighborIndex(state.config.width, state.config.height, idx, (n) => {
        if (revealed[n] === 1) return
        if (state.flagged[n] === 1) return
        if (state.board.mines[n] === 1) return
        queue.push(n)
      })
    }
  }

  const next = { ...state, revealed, revealedCount }
  return checkWinAndFinalize(next, nowMs)
}

export function revealCell(
  state: GameState,
  x: number,
  y: number,
  nowMs?: number,
): RevealResult {
  if (state.status !== 'playing') return { state }
  if (!inBounds(state.config.width, state.config.height, x, y)) return { state }

  const idx = xyToIndex(state.config.width, x, y)
  if (state.flagged[idx] === 1) return { state }
  if (state.revealed[idx] === 1) return { state }

  let next = withStartTime(state, nowMs)
  let safetyModeUsed: 'neighbors' | 'cell' | undefined

  if (!next.generated) {
    const { board, safetyMode } = generateBoard(next.config, next.config.seed, idx)
    safetyModeUsed = safetyMode
    next = {
      ...next,
      generated: true,
      firstClickIndex: idx,
      board,
    }
  }

  return { state: applyReveals(next, [idx], nowMs), safetyModeUsed }
}

export function toggleFlag(
  state: GameState,
  x: number,
  y: number,
  nowMs?: number,
): GameState {
  if (state.status !== 'playing') return state
  if (!inBounds(state.config.width, state.config.height, x, y)) return state

  const idx = xyToIndex(state.config.width, x, y)
  if (state.revealed[idx] === 1) return state

  const next = withStartTime(state, nowMs)
  const flagged = next.flagged.slice()
  const was = flagged[idx] === 1
  flagged[idx] = was ? 0 : 1

  return {
    ...next,
    flagged,
    flagsCount: next.flagsCount + (was ? -1 : 1),
  }
}

export function chord(
  state: GameState,
  x: number,
  y: number,
  nowMs?: number,
): GameState {
  if (state.status !== 'playing') return state
  if (!state.generated) return state
  if (!inBounds(state.config.width, state.config.height, x, y)) return state

  const idx = xyToIndex(state.config.width, x, y)
  if (state.revealed[idx] !== 1) return state

  const requiredFlags = state.board.adjacentMineCounts[idx]
  let flagCount = 0
  const neighbors: number[] = []
  forEachNeighborIndex(state.config.width, state.config.height, idx, (n) => {
    neighbors.push(n)
    if (state.flagged[n] === 1) flagCount += 1
  })

  if (flagCount !== requiredFlags) return state

  const toReveal: number[] = []
  for (const n of neighbors) {
    if (state.flagged[n] === 1) continue
    if (state.revealed[n] === 1) continue
    toReveal.push(n)
  }

  const next = withStartTime(state, nowMs)
  return applyReveals(next, toReveal, nowMs)
}
