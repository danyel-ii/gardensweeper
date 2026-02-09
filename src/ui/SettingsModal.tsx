import { THEME_PACKS } from '../themes/packs'
import { useSettings } from '../state/settings'
import { Modal } from './Modal'

type SettingsModalProps = {
  open: boolean
  onClose: () => void
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(1, n))
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const {
    settings,
    setSettings,
    resetSettings,
    effectiveColorScheme,
    effectiveReduceMotion,
  } = useSettings()

  const showPreviews = settings.showThemePreviews

  return (
    <Modal
      open={open}
      title="Settings"
      onClose={onClose}
      actions={
        <>
          <button className="btn btnGhost" onClick={onClose}>
            Close
          </button>
          <button
            className="btn"
            onClick={() => {
              resetSettings()
            }}
          >
            Reset defaults
          </button>
        </>
      }
    >
      <div className="settingsMeta">
        <div>
          <span className="settingsMetaLabel">System:</span>{' '}
          <span className="mono">
            {effectiveColorScheme} /{' '}
            {effectiveReduceMotion ? 'reduced motion' : 'full motion'}
          </span>
        </div>
      </div>

      <div className="settingsSection">
        <h3 className="settingsH3">Theme</h3>
        {showPreviews ? (
          <div className="themeGrid">
            {THEME_PACKS.map((pack) => {
              const selected = pack.id === settings.themePackId
              const preview =
                effectiveColorScheme === 'dark'
                  ? pack.previewCss.dark
                  : pack.previewCss.light
              return (
                <button
                  key={pack.id}
                  type="button"
                  className={[
                    'themeCard',
                    selected ? 'themeCardSelected' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() =>
                    setSettings((s) => ({
                      ...s,
                      themePackId: pack.id,
                    }))
                  }
                >
                  <div className="themeSwatch" style={{ background: preview }} />
                  <div className="themeCardText">
                    <div className="themeName">{pack.name}</div>
                    <div className="themeDesc">{pack.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="placeholder">
            Theme previews are disabled. Enable "Show theme previews" in
            Personalization to see cards.
          </div>
        )}

        <div className="settingsRow">
          <label className="settingsLabel">
            Color scheme
            <select
              className="select"
              value={settings.darkMode}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  darkMode: e.target.value as typeof s.darkMode,
                }))
              }
            >
              <option value="auto">Auto (system)</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </label>

          <label className="settingsLabel settingsToggle">
            <input
              type="checkbox"
              checked={settings.colorblindPaletteEnabled}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  colorblindPaletteEnabled: e.target.checked,
                }))
              }
            />
            Colorblind-friendly palette (coming soon)
          </label>
        </div>
      </div>

      <div className="settingsSection">
        <h3 className="settingsH3">Numbers</h3>
        <div className="settingsRow">
          <label className="settingsLabel settingsToggle">
            <input
              type="checkbox"
              checked={settings.largeNumbers}
              onChange={(e) =>
                setSettings((s) => ({ ...s, largeNumbers: e.target.checked }))
              }
            />
            Larger numbers
          </label>

          <label className="settingsLabel settingsToggle">
            <input
              type="checkbox"
              checked={settings.highContrastNumbers}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  highContrastNumbers: e.target.checked,
                }))
              }
            />
            High-contrast numbers
          </label>
        </div>
      </div>

      <div className="settingsSection">
        <h3 className="settingsH3">Motion</h3>
        <div className="settingsRow">
          <label className="settingsLabel">
            Reduce motion
            <select
              className="select"
              value={settings.reduceMotionMode}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  reduceMotionMode: e.target.value as typeof s.reduceMotionMode,
                }))
              }
            >
              <option value="auto">Auto (system)</option>
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
          </label>

          <label className="settingsLabel settingsToggle">
            <input
              type="checkbox"
              checked={settings.animationsEnabled}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  animationsEnabled: e.target.checked,
                }))
              }
            />
            Animations
          </label>
        </div>

        <label className="settingsLabel">
          Animation intensity
          <input
            className="range"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.animationIntensity}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                animationIntensity: clamp01(Number(e.target.value)),
              }))
            }
          />
        </label>
      </div>

      <div className="settingsSection">
        <h3 className="settingsH3">Personalization</h3>
        <div className="settingsRow">
          <label className="settingsLabel settingsToggle">
            <input
              type="checkbox"
              checked={settings.showThemePreviews}
              onChange={(e) =>
                setSettings((s) => ({ ...s, showThemePreviews: e.target.checked }))
              }
            />
            Show theme previews
          </label>
        </div>
      </div>
    </Modal>
  )
}
