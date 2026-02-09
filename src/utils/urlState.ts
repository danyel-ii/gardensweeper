import type { BoardSpec } from '../engine/board'
import { DEFAULT_SETTINGS, type Settings } from '../state/settings'

export type UrlGameParams = {
  spec: BoardSpec
  seed: string
  start: { x: number; y: number } | null
}

export type UrlVisualParams = {
  themePackId?: string
  preset?: string
}

function base64UrlEncode(input: string): string {
  const b64 = btoa(input)
  return b64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function base64UrlDecode(input: string): string {
  const b64 = input.replaceAll('-', '+').replaceAll('_', '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  return atob(b64 + pad)
}

export function encodeVisualPreset(settings: Settings): string {
  const diff: Record<string, unknown> = {}
  const keys = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]
  for (const k of keys) {
    if (k === 'version') continue
    const a = settings[k]
    const b = DEFAULT_SETTINGS[k]
    if (a !== b) diff[k as string] = a
  }
  return base64UrlEncode(JSON.stringify({ v: settings.version, d: diff }))
}

export function decodeVisualPreset(preset: string): Partial<Settings> | null {
  try {
    const raw = JSON.parse(base64UrlDecode(preset)) as {
      v?: unknown
      d?: unknown
    }
    if (!raw || typeof raw !== 'object') return null
    if (!raw.d || typeof raw.d !== 'object') return null
    return raw.d as Partial<Settings>
  } catch {
    return null
  }
}

export function parseUrlParams(search: string): {
  game?: UrlGameParams
  visual?: UrlVisualParams
} {
  const sp = new URLSearchParams(search)

  const w = Number.parseInt(sp.get('w') ?? '', 10)
  const h = Number.parseInt(sp.get('h') ?? '', 10)
  const m = Number.parseInt(sp.get('m') ?? '', 10)
  const seed = sp.get('seed') ?? ''

  const sxRaw = sp.get('sx')
  const syRaw = sp.get('sy')
  const sx = sxRaw != null ? Number.parseInt(sxRaw, 10) : null
  const sy = syRaw != null ? Number.parseInt(syRaw, 10) : null

  const themePackId = sp.get('theme') ?? undefined
  const preset = sp.get('vp') ?? undefined

  const out: { game?: UrlGameParams; visual?: UrlVisualParams } = {}

  if (
    Number.isInteger(w) &&
    Number.isInteger(h) &&
    Number.isInteger(m) &&
    w > 0 &&
    h > 0 &&
    m > 0 &&
    seed.length > 0
  ) {
    const start =
      sx != null && sy != null && Number.isInteger(sx) && Number.isInteger(sy)
        ? { x: sx, y: sy }
        : null
    out.game = { spec: { width: w, height: h, mineCount: m }, seed, start }
  }

  if (themePackId || preset) out.visual = { themePackId, preset }

  return out
}

export function buildUrl(
  baseHref: string,
  params: UrlGameParams & { themePackId?: string; preset?: string },
): string {
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

  if (params.themePackId) url.searchParams.set('theme', params.themePackId)
  else url.searchParams.delete('theme')

  if (params.preset) url.searchParams.set('vp', params.preset)
  else url.searchParams.delete('vp')

  return url.toString()
}

