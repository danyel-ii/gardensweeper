import { createRng } from '../utils/rng'
import {
  forEachNeighborIndex,
  indexToX,
  indexToY,
  neighborIndices,
  xyToIndex,
} from './grid'

export type BoardSpec = {
  width: number
  height: number
  mineCount: number
}

export type Board = BoardSpec & {
  mines: Uint8Array
  adjacentMineCounts: Uint8Array
}

export type FirstClickSafetyMode = 'neighbors' | 'cell'

export function assertValidSpec(spec: BoardSpec): void {
  const { width, height, mineCount } = spec
  if (!Number.isInteger(width) || width <= 0) {
    throw new Error(`Invalid width: ${width}`)
  }
  if (!Number.isInteger(height) || height <= 0) {
    throw new Error(`Invalid height: ${height}`)
  }
  const total = width * height
  if (!Number.isInteger(mineCount) || mineCount < 1 || mineCount >= total) {
    throw new Error(
      `Invalid mineCount: ${mineCount} (must be in [1, ${total - 1}])`,
    )
  }
}

export function computeAdjacentMineCounts(
  width: number,
  height: number,
  mines: Uint8Array,
): Uint8Array {
  const total = width * height
  if (mines.length !== total) {
    throw new Error(`mines length ${mines.length} !== total ${total}`)
  }

  const adjacentMineCounts = new Uint8Array(total)
  for (let i = 0; i < total; i += 1) {
    if (mines[i] === 1) continue
    let count = 0
    forEachNeighborIndex(width, height, i, (n) => {
      count += mines[n]
    })
    adjacentMineCounts[i] = count
  }

  return adjacentMineCounts
}

export function createBoardFromMineIndices(
  spec: BoardSpec,
  mineIndices: number[],
): Board {
  assertValidSpec(spec)
  const total = spec.width * spec.height
  const mines = new Uint8Array(total)
  for (const idx of mineIndices) {
    if (!Number.isInteger(idx) || idx < 0 || idx >= total) {
      throw new Error(`Invalid mine index: ${idx}`)
    }
    mines[idx] = 1
  }

  const actualMineCount = mines.reduce((acc, v) => acc + v, 0)
  if (actualMineCount !== spec.mineCount) {
    throw new Error(
      `mineCount mismatch: spec=${spec.mineCount}, actual=${actualMineCount}`,
    )
  }

  return {
    ...spec,
    mines,
    adjacentMineCounts: computeAdjacentMineCounts(spec.width, spec.height, mines),
  }
}

export function safeZoneIndices(
  width: number,
  height: number,
  safeIndex: number,
  mode: FirstClickSafetyMode,
): number[] {
  const total = width * height
  if (!Number.isInteger(safeIndex) || safeIndex < 0 || safeIndex >= total) {
    throw new Error(`Invalid safeIndex: ${safeIndex}`)
  }

  if (mode === 'cell') return [safeIndex]

  const out = new Set<number>()
  out.add(safeIndex)
  for (const n of neighborIndices(width, height, safeIndex)) out.add(n)
  return [...out]
}

function chooseSafetyMode(spec: BoardSpec, safeIndex: number): FirstClickSafetyMode {
  const total = spec.width * spec.height
  const neighborZoneSize = safeZoneIndices(
    spec.width,
    spec.height,
    safeIndex,
    'neighbors',
  ).length

  // Only exclude neighbors if it still leaves room for all mines.
  if (spec.mineCount <= total - neighborZoneSize) return 'neighbors'
  return 'cell'
}

function shuffleInPlace<T>(arr: T[], seed: string): void {
  const rng = createRng(seed)
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = rng.nextInt(i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

export function generateBoard(
  spec: BoardSpec,
  seed: string,
  safeIndex: number,
): { board: Board; safetyMode: FirstClickSafetyMode } {
  assertValidSpec(spec)
  const total = spec.width * spec.height
  if (!Number.isInteger(safeIndex) || safeIndex < 0 || safeIndex >= total) {
    throw new Error(`Invalid safeIndex: ${safeIndex}`)
  }

  const safetyMode = chooseSafetyMode(spec, safeIndex)
  const excluded = new Set<number>(
    safeZoneIndices(spec.width, spec.height, safeIndex, safetyMode),
  )
  if (!excluded.has(safeIndex)) excluded.add(safeIndex)

  const candidates: number[] = []
  for (let i = 0; i < total; i += 1) {
    if (excluded.has(i)) continue
    candidates.push(i)
  }

  if (spec.mineCount > candidates.length) {
    // This should never happen given assertValidSpec + chooseSafetyMode fallback.
    throw new Error(
      `Not enough candidate cells for mines: mines=${spec.mineCount} candidates=${candidates.length}`,
    )
  }

  // Mix safeIndex into the shuffle seed so the same seed can produce different
  // boards when the first click differs (by design).
  shuffleInPlace(candidates, `${seed}|${spec.width}x${spec.height}|${spec.mineCount}|${safeIndex}|${safetyMode}`)

  const mines = new Uint8Array(total)
  for (let i = 0; i < spec.mineCount; i += 1) {
    mines[candidates[i]] = 1
  }

  // Safety is a non-negotiable invariant.
  if (mines[safeIndex] === 1) {
    throw new Error('Invariant violated: safeIndex is a mine')
  }
  if (safetyMode === 'neighbors') {
    const sx = indexToX(spec.width, safeIndex)
    const sy = indexToY(spec.width, safeIndex)
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const x = sx + dx
        const y = sy + dy
        if (x < 0 || x >= spec.width || y < 0 || y >= spec.height) continue
        const idx = xyToIndex(spec.width, x, y)
        if (mines[idx] === 1) {
          throw new Error(
            'Invariant violated: neighbor safety requested but a neighbor is a mine',
          )
        }
      }
    }
  }

  const adjacentMineCounts = computeAdjacentMineCounts(
    spec.width,
    spec.height,
    mines,
  )

  return { board: { ...spec, mines, adjacentMineCounts }, safetyMode }
}

