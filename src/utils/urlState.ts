import type { BoardSpec } from '../engine/board'

export type UrlGameParams = {
  spec: BoardSpec
  seed: string
  start: { x: number; y: number } | null
}

export function parseUrlParams(search: string): UrlGameParams | null {
  const sp = new URLSearchParams(search)

  const w = Number.parseInt(sp.get('w') ?? '', 10)
  const h = Number.parseInt(sp.get('h') ?? '', 10)
  const m = Number.parseInt(sp.get('m') ?? '', 10)
  const seed = (sp.get('seed') ?? '').trim()

  const sxRaw = sp.get('sx')
  const syRaw = sp.get('sy')
  const sx = sxRaw != null ? Number.parseInt(sxRaw, 10) : null
  const sy = syRaw != null ? Number.parseInt(syRaw, 10) : null

  if (
    !Number.isInteger(w) ||
    !Number.isInteger(h) ||
    !Number.isInteger(m) ||
    w <= 0 ||
    h <= 0 ||
    m <= 0 ||
    seed.length === 0
  ) {
    return null
  }

  const start =
    sx != null && sy != null && Number.isInteger(sx) && Number.isInteger(sy)
      ? { x: sx, y: sy }
      : null

  return { spec: { width: w, height: h, mineCount: m }, seed, start }
}

export function buildUrl(baseHref: string, params: UrlGameParams): string {
  const url = new URL(baseHref)
  url.searchParams.set('w', String(params.spec.width))
  url.searchParams.set('h', String(params.spec.height))
  url.searchParams.set('m', String(params.spec.mineCount))
  url.searchParams.set('seed', params.seed)
  if (params.start) {
    url.searchParams.set('sx', String(params.start.x))
    url.searchParams.set('sy', String(params.start.y))
  } else {
    url.searchParams.delete('sx')
    url.searchParams.delete('sy')
  }

  // Strip any previously supported visual params.
  url.searchParams.delete('theme')
  url.searchParams.delete('vp')

  return url.toString()
}

