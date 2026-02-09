import { describe, expect, it } from 'vitest'

import { generateBoard, safeZoneIndices } from './board'
import { forEachNeighborIndex } from './grid'

function u8ToHex(u8: Uint8Array): string {
  // Stable snapshot for comparisons/debugging.
  return Array.from(u8, (v) => v.toString(16)).join('')
}

describe('engine/board', () => {
  it('is deterministic given spec + seed + safeIndex', () => {
    const spec = { width: 9, height: 9, mineCount: 10 }
    const seed = 'seed:alpha'
    const safeIndex = 40

    const a = generateBoard(spec, seed, safeIndex)
    const b = generateBoard(spec, seed, safeIndex)

    expect(a.safetyMode).toBe(b.safetyMode)
    expect(u8ToHex(a.board.mines)).toBe(u8ToHex(b.board.mines))
    expect(u8ToHex(a.board.adjacentMineCounts)).toBe(u8ToHex(b.board.adjacentMineCounts))
  })

  it('places exactly mineCount mines', () => {
    const spec = { width: 30, height: 16, mineCount: 99 }
    const seed = 'seed:count'
    const safeIndex = 0
    const { board } = generateBoard(spec, seed, safeIndex)
    const actual = board.mines.reduce((acc, v) => acc + v, 0)
    expect(actual).toBe(spec.mineCount)
  })

  it('ensures first click + neighbors are safe when feasible', () => {
    const spec = { width: 9, height: 9, mineCount: 10 }
    const seed = 'seed:neighbors'
    const safeIndex = 0

    const { board, safetyMode } = generateBoard(spec, seed, safeIndex)
    expect(safetyMode).toBe('neighbors')

    const safe = safeZoneIndices(spec.width, spec.height, safeIndex, safetyMode)
    for (const idx of safe) expect(board.mines[idx]).toBe(0)
  })

  it('falls back to only-first-cell safety when neighbor safety is impossible', () => {
    const spec = { width: 5, height: 5, mineCount: 24 }
    const seed = 'seed:cell'
    const safeIndex = 12

    const { board, safetyMode } = generateBoard(spec, seed, safeIndex)
    expect(safetyMode).toBe('cell')
    expect(board.mines[safeIndex]).toBe(0)
  })

  it('adjacent mine counts match mines array', () => {
    const spec = { width: 16, height: 16, mineCount: 40 }
    const seed = 'seed:adj'
    const safeIndex = 42
    const { board } = generateBoard(spec, seed, safeIndex)

    const total = spec.width * spec.height
    for (let i = 0; i < total; i += 1) {
      if (board.mines[i] === 1) continue
      let count = 0
      forEachNeighborIndex(spec.width, spec.height, i, (n) => {
        count += board.mines[n]
      })
      expect(board.adjacentMineCounts[i]).toBe(count)
    }
  })
})
