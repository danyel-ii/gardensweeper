import { describe, expect, it } from 'vitest'

import { createBoardFromMineIndices } from './board'
import { chord, createNewGame, revealCell, toggleFlag, type GameState } from './game'

function countOnes(u8: Uint8Array): number {
  let c = 0
  for (const v of u8) c += v
  return c
}

describe('engine/game', () => {
  it('generates deterministically on first reveal given seed + first click', () => {
    const config = { width: 9, height: 9, mineCount: 10, seed: 'seed:det' }
    const a0 = createNewGame(config)
    const b0 = createNewGame(config)

    const a1 = revealCell(a0, 3, 4, 100).state
    const b1 = revealCell(b0, 3, 4, 200).state

    expect(Array.from(a1.board.mines)).toEqual(Array.from(b1.board.mines))
    expect(Array.from(a1.board.adjacentMineCounts)).toEqual(
      Array.from(b1.board.adjacentMineCounts),
    )
  })

  it('flood fill reveals connected zero-region and wins when all safe cells are revealed', () => {
    // 3x3 with a single mine bottom-right.
    const spec = { width: 3, height: 3, mineCount: 1 }
    const board = createBoardFromMineIndices(spec, [8])
    const base = createNewGame({ ...spec, seed: 'ignored' })
    const state = { ...base, generated: true, board, firstClickIndex: 0 }

    const next = revealCell(state, 0, 0, 123).state
    expect(next.status).toBe('won')
    expect(next.revealedCount).toBe(8)
    expect(next.score).toBe(10)
    expect(next.correctStreak).toBe(1)
    expect(next.revealed[8]).toBe(0)
  })

  it('chord reveals neighbors when flags match number (and can win)', () => {
    // 3x3 with mine top-left; center sees "1".
    const spec = { width: 3, height: 3, mineCount: 1 }
    const board = createBoardFromMineIndices(spec, [0])
    const base = createNewGame({ ...spec, seed: 'ignored' })
    let state: GameState = { ...base, generated: true, board, firstClickIndex: 4 }

    state = revealCell(state, 1, 1, 10).state
    expect(state.revealedCount).toBe(1)

    state = toggleFlag(state, 0, 0, 20)
    expect(state.flagsCount).toBe(1)

    state = chord(state, 1, 1, 30)
    expect(state.status).toBe('won')
    expect(state.revealedCount).toBe(8)
    expect(state.score).toBe(30)
    expect(state.correctStreak).toBe(2)
  })

  it('chord with incorrect flags can reveal a mine and lose', () => {
    const spec = { width: 3, height: 3, mineCount: 1 }
    const board = createBoardFromMineIndices(spec, [0])
    const base = createNewGame({ ...spec, seed: 'ignored' })
    let state: GameState = { ...base, generated: true, board, firstClickIndex: 4 }

    state = revealCell(state, 1, 1, 10).state
    state = toggleFlag(state, 0, 1, 20) // wrong flag; still matches required 1
    state = chord(state, 1, 1, 30)

    expect(state.status).toBe('lost')
    expect(state.revealed[0]).toBe(1)
  })

  it('revealing a mine loses and reveals all mines', () => {
    const spec = { width: 2, height: 2, mineCount: 1 }
    const board = createBoardFromMineIndices(spec, [0])
    const base = createNewGame({ ...spec, seed: 'ignored' })
    const state = { ...base, generated: true, board, firstClickIndex: 3 }

    const next = revealCell(state, 0, 0, 1).state
    expect(next.status).toBe('lost')
    expect(countOnes(next.board.mines)).toBe(1)
    expect(next.revealed[0]).toBe(1)
  })

  it('deducts 20 points on mine hit and resets streak', () => {
    const spec = { width: 2, height: 2, mineCount: 1 }
    const board = createBoardFromMineIndices(spec, [0])
    const base = createNewGame({ ...spec, seed: 'ignored' })
    const state: GameState = {
      ...base,
      generated: true,
      board,
      firstClickIndex: 3,
      score: 70,
      correctStreak: 4,
    }

    const next = revealCell(state, 0, 0, 1).state
    expect(next.status).toBe('lost')
    expect(next.score).toBe(50)
    expect(next.correctStreak).toBe(0)
  })

  it('applies 10 / 20 / 30 rewards based on consecutive correct reveals', () => {
    const spec = { width: 3, height: 3, mineCount: 4 }
    const board = createBoardFromMineIndices(spec, [0, 2, 6, 8])
    const base = createNewGame({ ...spec, seed: 'ignored' })
    let state: GameState = { ...base, generated: true, board, firstClickIndex: 4 }

    state = revealCell(state, 1, 1, 10).state // streak 1 => +10
    state = revealCell(state, 1, 0, 20).state // streak 2 => +20
    state = revealCell(state, 0, 1, 30).state // streak 3 => +20
    state = revealCell(state, 2, 1, 40).state // streak 4 => +20
    state = revealCell(state, 1, 2, 50).state // streak 5 => +30

    expect(state.score).toBe(100)
    expect(state.correctStreak).toBe(5)
  })
})
