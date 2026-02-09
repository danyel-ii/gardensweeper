import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { getThemePack } from '../themes/packs'

export type DarkModeSetting = 'auto' | 'light' | 'dark'
export type ReduceMotionSetting = 'auto' | 'on' | 'off'

export type HudStyle = 'minimal' | 'brass' | 'field-notes'
export type BackgroundStyle = 'flat' | 'wallpaper' | 'illustration'
export type NumberStyle = 'classic' | 'outlined' | 'engraved' | 'ink'

export type Settings = {
  version: 2

  // Theme
  themePackId: string
  darkMode: DarkModeSetting
  colorblindPaletteEnabled: boolean

  // Patterns & textures
  patternsEnabled: boolean
  textureEnabled: boolean
  textureIntensity: number // 0..1
  grainEnabled: boolean
  proceduralVariation: number // 0..1

  // Typography & numbers
  numberFont: string
  numberStyle: NumberStyle
  glyphModeEnabled: boolean
  largeNumbers: boolean
  highContrastNumbers: boolean

  // Motion
  animationsEnabled: boolean
  animationIntensity: number // 0..1
  revealAnimationEnabled: boolean
  flagPlacementAnimationEnabled: boolean
  floodWaveEnabled: boolean
  winLossAnimationsEnabled: boolean
  winAnimationEnabled: boolean
  loseAnimationEnabled: boolean
  reduceMotionMode: ReduceMotionSetting

  // HUD & layout
  hudStyle: HudStyle
  boardFrameEnabled: boolean
  backgroundStyle: BackgroundStyle
  parallaxEnabled: boolean
  vignetteEnabled: boolean

  // Cursor & interaction
  customCursorEnabled: boolean
  hoverHighlightEnabled: boolean
  pressFeedbackEnabled: boolean
  chordPreviewEnabled: boolean

  // Audio & haptics
  sfxEnabled: boolean
  sfxVolume: number // 0..1
  ambienceEnabled: boolean
  ambienceVolume: number // 0..1
  hapticsEnabled: boolean

  // Personalization
  dailyPaletteEnabled: boolean
  showThemePreviews: boolean
}

const SETTINGS_VERSION = 2 as const
const STORAGE_KEY = 'minesweeper_studio_settings'

export const DEFAULT_SETTINGS: Settings = {
  version: SETTINGS_VERSION,

  themePackId: 'minimal',
  darkMode: 'auto',
  colorblindPaletteEnabled: false,

  patternsEnabled: false,
  textureEnabled: false,
  textureIntensity: 0.2,
  grainEnabled: false,
  proceduralVariation: 0,

  numberFont: 'system',
  numberStyle: 'classic',
  glyphModeEnabled: false,
  largeNumbers: false,
  highContrastNumbers: false,

  animationsEnabled: true,
  animationIntensity: 0.75,
  revealAnimationEnabled: true,
  flagPlacementAnimationEnabled: true,
  floodWaveEnabled: true,
  winLossAnimationsEnabled: true,
  winAnimationEnabled: true,
  loseAnimationEnabled: true,
  reduceMotionMode: 'auto',

  hudStyle: 'minimal',
  boardFrameEnabled: true,
  backgroundStyle: 'wallpaper',
  parallaxEnabled: false,
  vignetteEnabled: false,

  customCursorEnabled: false,
  hoverHighlightEnabled: true,
  pressFeedbackEnabled: true,
  chordPreviewEnabled: false,

  sfxEnabled: false,
  sfxVolume: 0.2,
  ambienceEnabled: false,
  ambienceVolume: 0.12,
  hapticsEnabled: false,

  dailyPaletteEnabled: false,
  showThemePreviews: true,
}

function numberFontToFamily(id: string): string {
  switch (id) {
    case 'atkinson':
      return "'Atkinson Hyperlegible', var(--mono)"
    case 'plex-mono':
      return "'IBM Plex Mono', var(--mono)"
    case 'caveat':
      return "'Caveat', var(--mono)"
    case 'system':
    default:
      return 'var(--mono)'
  }
}

function clamp01(n: unknown, fallback: number): number {
  if (typeof n !== 'number' || !Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(1, n))
}

function isOneOf<T extends readonly string[]>(
  v: unknown,
  allowed: T,
): v is T[number] {
  return typeof v === 'string' && (allowed as readonly string[]).includes(v)
}

function migrate(raw: unknown): Settings {
  if (raw == null || typeof raw !== 'object') return DEFAULT_SETTINGS
  const r = raw as Record<string, unknown>

  const next: Settings = {
    ...DEFAULT_SETTINGS,

    version: SETTINGS_VERSION,

    themePackId: typeof r.themePackId === 'string' ? r.themePackId : DEFAULT_SETTINGS.themePackId,
    darkMode: isOneOf(r.darkMode, ['auto', 'light', 'dark'] as const)
      ? r.darkMode
      : DEFAULT_SETTINGS.darkMode,
    colorblindPaletteEnabled:
      typeof r.colorblindPaletteEnabled === 'boolean'
        ? r.colorblindPaletteEnabled
        : DEFAULT_SETTINGS.colorblindPaletteEnabled,

    patternsEnabled:
      typeof r.patternsEnabled === 'boolean'
        ? r.patternsEnabled
        : DEFAULT_SETTINGS.patternsEnabled,
    textureEnabled:
      typeof r.textureEnabled === 'boolean'
        ? r.textureEnabled
        : DEFAULT_SETTINGS.textureEnabled,
    textureIntensity: clamp01(r.textureIntensity, DEFAULT_SETTINGS.textureIntensity),
    grainEnabled:
      typeof r.grainEnabled === 'boolean' ? r.grainEnabled : DEFAULT_SETTINGS.grainEnabled,
    proceduralVariation: clamp01(r.proceduralVariation, DEFAULT_SETTINGS.proceduralVariation),

    numberFont:
      typeof r.numberFont === 'string' ? r.numberFont : DEFAULT_SETTINGS.numberFont,
    numberStyle: isOneOf(r.numberStyle, ['classic', 'outlined', 'engraved', 'ink'] as const)
      ? r.numberStyle
      : DEFAULT_SETTINGS.numberStyle,
    glyphModeEnabled:
      typeof r.glyphModeEnabled === 'boolean'
        ? r.glyphModeEnabled
        : DEFAULT_SETTINGS.glyphModeEnabled,
    largeNumbers:
      typeof r.largeNumbers === 'boolean' ? r.largeNumbers : DEFAULT_SETTINGS.largeNumbers,
    highContrastNumbers:
      typeof r.highContrastNumbers === 'boolean'
        ? r.highContrastNumbers
        : DEFAULT_SETTINGS.highContrastNumbers,

    animationsEnabled:
      typeof r.animationsEnabled === 'boolean'
        ? r.animationsEnabled
        : DEFAULT_SETTINGS.animationsEnabled,
    animationIntensity: clamp01(r.animationIntensity, DEFAULT_SETTINGS.animationIntensity),
    revealAnimationEnabled:
      typeof r.revealAnimationEnabled === 'boolean'
        ? r.revealAnimationEnabled
        : DEFAULT_SETTINGS.revealAnimationEnabled,
    flagPlacementAnimationEnabled:
      typeof r.flagPlacementAnimationEnabled === 'boolean'
        ? r.flagPlacementAnimationEnabled
        : DEFAULT_SETTINGS.flagPlacementAnimationEnabled,
    floodWaveEnabled:
      typeof r.floodWaveEnabled === 'boolean'
        ? r.floodWaveEnabled
        : DEFAULT_SETTINGS.floodWaveEnabled,
    winLossAnimationsEnabled:
      typeof r.winLossAnimationsEnabled === 'boolean'
        ? r.winLossAnimationsEnabled
        : DEFAULT_SETTINGS.winLossAnimationsEnabled,
    winAnimationEnabled:
      typeof r.winAnimationEnabled === 'boolean'
        ? r.winAnimationEnabled
        : DEFAULT_SETTINGS.winAnimationEnabled,
    loseAnimationEnabled:
      typeof r.loseAnimationEnabled === 'boolean'
        ? r.loseAnimationEnabled
        : DEFAULT_SETTINGS.loseAnimationEnabled,
    reduceMotionMode: isOneOf(r.reduceMotionMode, ['auto', 'on', 'off'] as const)
      ? r.reduceMotionMode
      : DEFAULT_SETTINGS.reduceMotionMode,

    hudStyle: isOneOf(r.hudStyle, ['minimal', 'brass', 'field-notes'] as const)
      ? r.hudStyle
      : DEFAULT_SETTINGS.hudStyle,
    boardFrameEnabled:
      typeof r.boardFrameEnabled === 'boolean'
        ? r.boardFrameEnabled
        : DEFAULT_SETTINGS.boardFrameEnabled,
    backgroundStyle: isOneOf(r.backgroundStyle, ['flat', 'wallpaper', 'illustration'] as const)
      ? r.backgroundStyle
      : DEFAULT_SETTINGS.backgroundStyle,
    parallaxEnabled:
      typeof r.parallaxEnabled === 'boolean'
        ? r.parallaxEnabled
        : DEFAULT_SETTINGS.parallaxEnabled,
    vignetteEnabled:
      typeof r.vignetteEnabled === 'boolean'
        ? r.vignetteEnabled
        : DEFAULT_SETTINGS.vignetteEnabled,

    customCursorEnabled:
      typeof r.customCursorEnabled === 'boolean'
        ? r.customCursorEnabled
        : DEFAULT_SETTINGS.customCursorEnabled,
    hoverHighlightEnabled:
      typeof r.hoverHighlightEnabled === 'boolean'
        ? r.hoverHighlightEnabled
        : DEFAULT_SETTINGS.hoverHighlightEnabled,
    pressFeedbackEnabled:
      typeof r.pressFeedbackEnabled === 'boolean'
        ? r.pressFeedbackEnabled
        : DEFAULT_SETTINGS.pressFeedbackEnabled,
    chordPreviewEnabled:
      typeof r.chordPreviewEnabled === 'boolean'
        ? r.chordPreviewEnabled
        : DEFAULT_SETTINGS.chordPreviewEnabled,

    sfxEnabled:
      typeof r.sfxEnabled === 'boolean' ? r.sfxEnabled : DEFAULT_SETTINGS.sfxEnabled,
    sfxVolume: clamp01(r.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
    ambienceEnabled:
      typeof r.ambienceEnabled === 'boolean'
        ? r.ambienceEnabled
        : DEFAULT_SETTINGS.ambienceEnabled,
    ambienceVolume: clamp01(r.ambienceVolume, DEFAULT_SETTINGS.ambienceVolume),
    hapticsEnabled:
      typeof r.hapticsEnabled === 'boolean'
        ? r.hapticsEnabled
        : DEFAULT_SETTINGS.hapticsEnabled,

    dailyPaletteEnabled:
      typeof r.dailyPaletteEnabled === 'boolean'
        ? r.dailyPaletteEnabled
        : DEFAULT_SETTINGS.dailyPaletteEnabled,
    showThemePreviews:
      typeof r.showThemePreviews === 'boolean'
        ? r.showThemePreviews
        : DEFAULT_SETTINGS.showThemePreviews,
  }

  // If an unknown theme pack id is stored, keep it, but fall back safely at apply-time.
  return next
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return migrate(JSON.parse(raw))
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // ignore (private mode, storage disabled, etc.)
  }
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

type SettingsContextValue = {
  settings: Settings
  setSettings: (updater: (prev: Settings) => Settings) => void
  resetSettings: () => void
  effectiveColorScheme: 'light' | 'dark'
  effectiveReduceMotion: boolean
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsInner] = useState<Settings>(() => loadSettings())

  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const effectiveColorScheme = useMemo<'light' | 'dark'>(() => {
    if (settings.darkMode === 'dark') return 'dark'
    if (settings.darkMode === 'light') return 'light'
    return prefersDark ? 'dark' : 'light'
  }, [settings.darkMode, prefersDark])

  const effectiveReduceMotion = useMemo(() => {
    if (settings.reduceMotionMode === 'on') return true
    if (settings.reduceMotionMode === 'off') return false
    return prefersReducedMotion
  }, [settings.reduceMotionMode, prefersReducedMotion])

  const setSettings = (updater: (prev: Settings) => Settings) => {
    setSettingsInner((prev) => migrate(updater(prev)))
  }

  const resetSettings = () => setSettingsInner(DEFAULT_SETTINGS)

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.colorScheme = effectiveColorScheme
    root.dataset.reduceMotion = effectiveReduceMotion ? 'on' : 'off'
    const motionOn = settings.animationsEnabled && !effectiveReduceMotion
    root.dataset.animations = motionOn ? 'on' : 'off'
    root.dataset.largeNumbers = settings.largeNumbers ? 'on' : 'off'
    root.dataset.highContrastNumbers = settings.highContrastNumbers ? 'on' : 'off'
    root.dataset.patterns = settings.patternsEnabled ? 'on' : 'off'
    root.dataset.texture = settings.textureEnabled ? 'on' : 'off'
    root.dataset.grain = settings.grainEnabled ? 'on' : 'off'
    root.dataset.vignette = settings.vignetteEnabled ? 'on' : 'off'
    root.dataset.boardFrame = settings.boardFrameEnabled ? 'on' : 'off'
    root.dataset.numberStyle = settings.numberStyle
    root.dataset.glyphMode = settings.glyphModeEnabled ? 'on' : 'off'
    root.dataset.pressFeedback =
      motionOn && settings.pressFeedbackEnabled ? 'on' : 'off'
    root.dataset.revealAnim =
      motionOn && settings.revealAnimationEnabled ? 'on' : 'off'
    root.dataset.flagAnim =
      motionOn && settings.flagPlacementAnimationEnabled ? 'on' : 'off'
    root.dataset.floodWave = motionOn && settings.floodWaveEnabled ? 'on' : 'off'
    root.dataset.winAnim =
      motionOn &&
      settings.winLossAnimationsEnabled &&
      settings.winAnimationEnabled
        ? 'on'
        : 'off'
    root.dataset.loseAnim =
      motionOn &&
      settings.winLossAnimationsEnabled &&
      settings.loseAnimationEnabled
        ? 'on'
        : 'off'

    const needsOutline =
      settings.highContrastNumbers ||
      settings.patternsEnabled ||
      settings.textureEnabled ||
      settings.grainEnabled
    root.dataset.numberOutline = needsOutline ? 'on' : 'off'

    // Theme pack -> CSS vars
    const pack = getThemePack(settings.themePackId)
    const vars = effectiveColorScheme === 'dark' ? pack.cssVars.dark : pack.cssVars.light
    for (const [k, v] of Object.entries(vars)) {
      root.style.setProperty(k, v)
    }

    const anim = settings.animationsEnabled && !effectiveReduceMotion ? settings.animationIntensity : 0
    root.style.setProperty('--animFast', `${Math.round(120 * anim)}ms`)
    root.style.setProperty('--animSlow', `${Math.round(220 * anim)}ms`)

    root.style.setProperty('--numberFontFamily', numberFontToFamily(settings.numberFont))
    root.style.setProperty('--textureIntensity', String(clamp01(settings.textureIntensity, 0.2)))
    root.style.setProperty(
      '--proceduralVariationIntensity',
      String(clamp01(settings.proceduralVariation, 0)),
    )
  }, [settings, effectiveColorScheme, effectiveReduceMotion])

  const value: SettingsContextValue = {
    settings,
    setSettings,
    resetSettings,
    effectiveColorScheme,
    effectiveReduceMotion,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
