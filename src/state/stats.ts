export type DifficultyKey = 'beginner' | 'intermediate' | 'expert'

export type Stats = {
  version: 1
  bestSeconds: Partial<Record<DifficultyKey, number>>
}

const STATS_VERSION = 1 as const
const STORAGE_KEY = 'minesweeper_studio_stats'

const DEFAULT_STATS: Stats = {
  version: STATS_VERSION,
  bestSeconds: {},
}

function migrate(raw: unknown): Stats {
  if (raw == null || typeof raw !== 'object') return DEFAULT_STATS
  const r = raw as Record<string, unknown>
  const best = (r.bestSeconds ?? {}) as Record<string, unknown>
  const out: Partial<Record<DifficultyKey, number>> = {}
  for (const k of ['beginner', 'intermediate', 'expert'] as const) {
    const v = best[k]
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) out[k] = Math.floor(v)
  }
  return { version: STATS_VERSION, bestSeconds: out }
}

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATS
    return migrate(JSON.parse(raw))
  } catch {
    return DEFAULT_STATS
  }
}

export function saveStats(stats: Stats): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats))
  } catch {
    // ignore
  }
}

export function recordWin(
  stats: Stats,
  difficulty: DifficultyKey,
  seconds: number,
): Stats {
  const s = Math.floor(seconds)
  if (!Number.isFinite(s) || s <= 0) return stats
  const prev = stats.bestSeconds[difficulty]
  if (prev != null && prev <= s) return stats
  return {
    ...stats,
    bestSeconds: { ...stats.bestSeconds, [difficulty]: s },
  }
}

export function resetStats(): Stats {
  return DEFAULT_STATS
}

