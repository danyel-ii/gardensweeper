import type { BoardSpec } from '../engine/board'

export type DifficultyId = 'beginner' | 'intermediate' | 'expert' | 'custom'

export type Preset = {
  id: Exclude<DifficultyId, 'custom'>
  label: string
  spec: BoardSpec
}

export const PRESETS: Preset[] = [
  { id: 'beginner', label: 'Beginner', spec: { width: 9, height: 9, mineCount: 10 } },
  {
    id: 'intermediate',
    label: 'Intermediate',
    spec: { width: 16, height: 16, mineCount: 40 },
  },
  { id: 'expert', label: 'Expert', spec: { width: 30, height: 16, mineCount: 99 } },
]

export type CustomSpecDraft = {
  width: string
  height: string
  mineCount: string
}

export function validateCustomSpec(
  width: number,
  height: number,
  mineCount: number,
): { ok: true; spec: BoardSpec } | { ok: false; error: string } {
  const wMin = 5
  const hMin = 5
  const wMax = 60
  const hMax = 40

  if (!Number.isInteger(width) || width < wMin || width > wMax) {
    return { ok: false, error: `Width must be an integer in [${wMin}, ${wMax}].` }
  }
  if (!Number.isInteger(height) || height < hMin || height > hMax) {
    return { ok: false, error: `Height must be an integer in [${hMin}, ${hMax}].` }
  }

  const total = width * height
  if (!Number.isInteger(mineCount) || mineCount < 1 || mineCount >= total) {
    return {
      ok: false,
      error: `Mines must be an integer in [1, ${total - 1}].`,
    }
  }

  return { ok: true, spec: { width, height, mineCount } }
}

