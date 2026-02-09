export type ThemePack = {
  id: string
  name: string
  description: string
  cssVars: {
    dark: Record<string, string>
    light: Record<string, string>
  }
  previewCss: {
    dark: string
    light: string
  }
}

const MINIMAL: ThemePack = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean baseline for gameplay and readability.',
  cssVars: {
    dark: {
      '--bg0': '#0e1116',
      '--bg1': '#111a28',
      '--panel': 'rgba(255, 255, 255, 0.06)',
      '--panelBorder': 'rgba(255, 255, 255, 0.12)',
      '--text0': 'rgba(255, 255, 255, 0.92)',
      '--text1': 'rgba(255, 255, 255, 0.72)',
      '--accent': '#7dd3fc',
    },
    light: {
      '--bg0': '#f5f7fb',
      '--bg1': '#e6eefc',
      '--panel': 'rgba(0, 0, 0, 0.04)',
      '--panelBorder': 'rgba(0, 0, 0, 0.10)',
      '--text0': 'rgba(0, 0, 0, 0.88)',
      '--text1': 'rgba(0, 0, 0, 0.66)',
      '--accent': '#0ea5e9',
    },
  },
  previewCss: {
    dark: 'linear-gradient(135deg, #0e1116, #111a28)',
    light: 'linear-gradient(135deg, #f5f7fb, #e6eefc)',
  },
}

export const THEME_PACKS: ThemePack[] = [MINIMAL]

export function getThemePack(id: string): ThemePack {
  return THEME_PACKS.find((p) => p.id === id) ?? MINIMAL
}

