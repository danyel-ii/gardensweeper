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
      '--wallpaper': 'none',
      '--boardFrameBg': 'var(--surfaceInset2)',
      '--boardFrameBorder': 'var(--lineSubtle)',
      '--tileHiddenBg': 'var(--surfaceTile)',
      '--tileHiddenHoverBg': 'var(--surfaceTileHover)',
      '--tileRevealedBg': 'var(--surfaceRevealed)',
      '--tileBorder': 'var(--line)',
      '--tileBorderHover': 'var(--lineHover)',
      '--tileRevealedBorder': 'var(--lineSubtle)',
      '--tileFlagBg': 'rgba(125, 211, 252, 0.14)',
      '--tileFlagBorder': 'rgba(125, 211, 252, 0.35)',
      '--tileMineBg': 'rgba(220, 38, 38, 0.22)',
      '--tileMineBorder': 'rgba(220, 38, 38, 0.5)',
    },
    light: {
      '--bg0': '#f5f7fb',
      '--bg1': '#e6eefc',
      '--panel': 'rgba(0, 0, 0, 0.04)',
      '--panelBorder': 'rgba(0, 0, 0, 0.10)',
      '--text0': 'rgba(0, 0, 0, 0.88)',
      '--text1': 'rgba(0, 0, 0, 0.66)',
      '--accent': '#0ea5e9',
      '--wallpaper': 'none',
      '--boardFrameBg': 'var(--surfaceInset2)',
      '--boardFrameBorder': 'var(--lineSubtle)',
      '--tileHiddenBg': 'var(--surfaceTile)',
      '--tileHiddenHoverBg': 'var(--surfaceTileHover)',
      '--tileRevealedBg': 'var(--surfaceRevealed)',
      '--tileBorder': 'var(--line)',
      '--tileBorderHover': 'var(--lineHover)',
      '--tileRevealedBorder': 'var(--lineSubtle)',
      '--tileFlagBg': 'rgba(14, 165, 233, 0.12)',
      '--tileFlagBorder': 'rgba(14, 165, 233, 0.34)',
      '--tileMineBg': 'rgba(220, 38, 38, 0.14)',
      '--tileMineBorder': 'rgba(220, 38, 38, 0.4)',
    },
  },
  previewCss: {
    dark: 'linear-gradient(135deg, #0e1116, #111a28)',
    light: 'linear-gradient(135deg, #f5f7fb, #e6eefc)',
  },
}

const STAINED_GLASS: ThemePack = {
  id: 'stained-glass',
  name: 'Stained Glass',
  description: 'Jewel-toned panes with lead lines and a soft bloom.',
  cssVars: {
    dark: {
      '--bg0': '#05070c',
      '--bg1': '#0b1330',
      '--panel': 'rgba(255, 255, 255, 0.06)',
      '--panelBorder': 'rgba(255, 255, 255, 0.14)',
      '--text0': 'rgba(255, 255, 255, 0.92)',
      '--text1': 'rgba(255, 255, 255, 0.74)',
      '--accent': '#22d3ee',
      '--wallpaper':
        'radial-gradient(900px 560px at 18% 18%, rgba(34, 211, 238, 0.18), transparent 60%), radial-gradient(780px 520px at 78% 32%, rgba(168, 85, 247, 0.16), transparent 60%), repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.06) 0 2px, transparent 2px 16px)',
      '--boardFrameBg': 'rgba(0, 0, 0, 0.24)',
      '--boardFrameBorder': 'rgba(255, 255, 255, 0.16)',
      '--tileHiddenBg':
        'linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.06))',
      '--tileHiddenHoverBg':
        'linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.08))',
      '--tileRevealedBg': 'rgba(0, 0, 0, 0.28)',
      '--tileBorder': 'rgba(255, 255, 255, 0.16)',
      '--tileBorderHover': 'rgba(255, 255, 255, 0.26)',
      '--tileRevealedBorder': 'rgba(255, 255, 255, 0.1)',
      '--tileFlagBg': 'rgba(34, 211, 238, 0.14)',
      '--tileFlagBorder': 'rgba(34, 211, 238, 0.44)',
      '--tileMineBg': 'rgba(244, 63, 94, 0.2)',
      '--tileMineBorder': 'rgba(244, 63, 94, 0.5)',
    },
    light: {
      '--bg0': '#0b1024',
      '--bg1': '#101e3f',
      '--panel': 'rgba(255, 255, 255, 0.07)',
      '--panelBorder': 'rgba(255, 255, 255, 0.16)',
      '--text0': 'rgba(255, 255, 255, 0.94)',
      '--text1': 'rgba(255, 255, 255, 0.76)',
      '--accent': '#38bdf8',
      '--wallpaper':
        'radial-gradient(860px 560px at 18% 18%, rgba(56, 189, 248, 0.18), transparent 60%), radial-gradient(760px 520px at 78% 32%, rgba(236, 72, 153, 0.14), transparent 60%), repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.06) 0 2px, transparent 2px 16px)',
      '--boardFrameBg': 'rgba(0, 0, 0, 0.24)',
      '--boardFrameBorder': 'rgba(255, 255, 255, 0.18)',
      '--tileHiddenBg':
        'linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.06))',
      '--tileHiddenHoverBg':
        'linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.08))',
      '--tileRevealedBg': 'rgba(0, 0, 0, 0.28)',
      '--tileBorder': 'rgba(255, 255, 255, 0.16)',
      '--tileBorderHover': 'rgba(255, 255, 255, 0.26)',
      '--tileRevealedBorder': 'rgba(255, 255, 255, 0.1)',
      '--tileFlagBg': 'rgba(56, 189, 248, 0.14)',
      '--tileFlagBorder': 'rgba(56, 189, 248, 0.44)',
      '--tileMineBg': 'rgba(244, 63, 94, 0.2)',
      '--tileMineBorder': 'rgba(244, 63, 94, 0.5)',
    },
  },
  previewCss: {
    dark: 'linear-gradient(135deg, #05070c, #0b1330)',
    light: 'linear-gradient(135deg, #0b1024, #101e3f)',
  },
}

const KINTSUGI: ThemePack = {
  id: 'kintsugi-ceramic',
  name: 'Kintsugi Ceramic',
  description: 'Warm porcelain with quiet gold seams.',
  cssVars: {
    dark: {
      '--bg0': '#101014',
      '--bg1': '#1a1410',
      '--panel': 'rgba(255, 255, 255, 0.06)',
      '--panelBorder': 'rgba(255, 255, 255, 0.12)',
      '--text0': 'rgba(255, 255, 255, 0.92)',
      '--text1': 'rgba(255, 255, 255, 0.72)',
      '--accent': '#fbbf24',
      '--wallpaper':
        'radial-gradient(900px 520px at 22% 18%, rgba(251, 191, 36, 0.12), transparent 60%), repeating-linear-gradient(120deg, rgba(255, 255, 255, 0.04) 0 1px, transparent 1px 18px)',
      '--boardFrameBg': 'rgba(0, 0, 0, 0.22)',
      '--boardFrameBorder': 'rgba(251, 191, 36, 0.22)',
      '--tileHiddenBg':
        'linear-gradient(180deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.05))',
      '--tileHiddenHoverBg':
        'linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.07))',
      '--tileRevealedBg': 'rgba(0, 0, 0, 0.24)',
      '--tileBorder': 'rgba(255, 255, 255, 0.14)',
      '--tileBorderHover': 'rgba(251, 191, 36, 0.32)',
      '--tileRevealedBorder': 'rgba(255, 255, 255, 0.1)',
      '--tileFlagBg': 'rgba(251, 191, 36, 0.12)',
      '--tileFlagBorder': 'rgba(251, 191, 36, 0.4)',
      '--tileMineBg': 'rgba(239, 68, 68, 0.18)',
      '--tileMineBorder': 'rgba(239, 68, 68, 0.44)',
    },
    light: {
      '--bg0': '#f7f0e8',
      '--bg1': '#efe0cf',
      '--panel': 'rgba(0, 0, 0, 0.04)',
      '--panelBorder': 'rgba(0, 0, 0, 0.10)',
      '--text0': 'rgba(0, 0, 0, 0.88)',
      '--text1': 'rgba(0, 0, 0, 0.66)',
      '--accent': '#b45309',
      '--wallpaper':
        'radial-gradient(860px 520px at 22% 18%, rgba(180, 83, 9, 0.12), transparent 60%), repeating-linear-gradient(120deg, rgba(0, 0, 0, 0.04) 0 1px, transparent 1px 18px)',
      '--boardFrameBg': 'rgba(0, 0, 0, 0.04)',
      '--boardFrameBorder': 'rgba(180, 83, 9, 0.22)',
      '--tileHiddenBg':
        'linear-gradient(180deg, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.01))',
      '--tileHiddenHoverBg':
        'linear-gradient(180deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02))',
      '--tileRevealedBg': 'rgba(0, 0, 0, 0.06)',
      '--tileBorder': 'rgba(0, 0, 0, 0.12)',
      '--tileBorderHover': 'rgba(180, 83, 9, 0.32)',
      '--tileRevealedBorder': 'rgba(0, 0, 0, 0.1)',
      '--tileFlagBg': 'rgba(180, 83, 9, 0.1)',
      '--tileFlagBorder': 'rgba(180, 83, 9, 0.34)',
      '--tileMineBg': 'rgba(239, 68, 68, 0.14)',
      '--tileMineBorder': 'rgba(239, 68, 68, 0.34)',
    },
  },
  previewCss: {
    dark: 'linear-gradient(135deg, #101014, #1a1410)',
    light: 'linear-gradient(135deg, #f7f0e8, #efe0cf)',
  },
}

const BOTANICAL: ThemePack = {
  id: 'botanical-field-notes',
  name: 'Botanical Field Notes',
  description: 'Paper, pencil, and a little chlorophyll.',
  cssVars: {
    dark: {
      '--bg0': '#0b0f0c',
      '--bg1': '#102018',
      '--panel': 'rgba(255, 255, 255, 0.06)',
      '--panelBorder': 'rgba(255, 255, 255, 0.12)',
      '--text0': 'rgba(255, 255, 255, 0.92)',
      '--text1': 'rgba(255, 255, 255, 0.72)',
      '--accent': '#34d399',
      '--wallpaper':
        'repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 18px), radial-gradient(900px 520px at 78% 22%, rgba(52, 211, 153, 0.12), transparent 60%)',
      '--boardFrameBg': 'rgba(0, 0, 0, 0.22)',
      '--boardFrameBorder': 'rgba(52, 211, 153, 0.22)',
      '--tileHiddenBg':
        'linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.05))',
      '--tileHiddenHoverBg':
        'linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.07))',
      '--tileRevealedBg': 'rgba(0, 0, 0, 0.24)',
      '--tileBorder': 'rgba(255, 255, 255, 0.14)',
      '--tileBorderHover': 'rgba(52, 211, 153, 0.32)',
      '--tileRevealedBorder': 'rgba(255, 255, 255, 0.1)',
      '--tileFlagBg': 'rgba(52, 211, 153, 0.12)',
      '--tileFlagBorder': 'rgba(52, 211, 153, 0.4)',
      '--tileMineBg': 'rgba(239, 68, 68, 0.18)',
      '--tileMineBorder': 'rgba(239, 68, 68, 0.44)',
    },
    light: {
      '--bg0': '#f3efe5',
      '--bg1': '#e6f3e6',
      '--panel': 'rgba(0, 0, 0, 0.04)',
      '--panelBorder': 'rgba(0, 0, 0, 0.10)',
      '--text0': 'rgba(0, 0, 0, 0.88)',
      '--text1': 'rgba(0, 0, 0, 0.66)',
      '--accent': '#15803d',
      '--wallpaper':
        'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.04) 0 1px, transparent 1px 18px), radial-gradient(900px 520px at 78% 22%, rgba(21, 128, 61, 0.12), transparent 60%)',
      '--boardFrameBg': 'rgba(0, 0, 0, 0.03)',
      '--boardFrameBorder': 'rgba(21, 128, 61, 0.2)',
      '--tileHiddenBg':
        'linear-gradient(180deg, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.01))',
      '--tileHiddenHoverBg':
        'linear-gradient(180deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02))',
      '--tileRevealedBg': 'rgba(0, 0, 0, 0.06)',
      '--tileBorder': 'rgba(0, 0, 0, 0.12)',
      '--tileBorderHover': 'rgba(21, 128, 61, 0.32)',
      '--tileRevealedBorder': 'rgba(0, 0, 0, 0.1)',
      '--tileFlagBg': 'rgba(21, 128, 61, 0.1)',
      '--tileFlagBorder': 'rgba(21, 128, 61, 0.34)',
      '--tileMineBg': 'rgba(239, 68, 68, 0.14)',
      '--tileMineBorder': 'rgba(239, 68, 68, 0.34)',
    },
  },
  previewCss: {
    dark: 'linear-gradient(135deg, #0b0f0c, #102018)',
    light: 'linear-gradient(135deg, #f3efe5, #e6f3e6)',
  },
}

export const THEME_PACKS: ThemePack[] = [
  MINIMAL,
  STAINED_GLASS,
  KINTSUGI,
  BOTANICAL,
]

export function getThemePack(id: string): ThemePack {
  return THEME_PACKS.find((p) => p.id === id) ?? MINIMAL
}
