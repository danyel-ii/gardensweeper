import { useEffect, useMemo, useRef } from 'react'

import type { Settings } from '../state/settings'
import { SoundEngine, type SfxName } from '../utils/sound'

export type HapticName = 'reveal' | 'flag' | 'win' | 'lose'

function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

function hapticPattern(name: HapticName): number | number[] {
  switch (name) {
    case 'reveal':
      return 8
    case 'flag':
      return 12
    case 'win':
      return [18, 32, 18]
    case 'lose':
      return [60, 40, 24]
  }
}

export function useAudio(settings: Settings) {
  const engineRef = useRef<SoundEngine | null>(null)
  if (engineRef.current == null) engineRef.current = new SoundEngine()

  useEffect(() => {
    engineRef.current!.setAmbience(settings.ambienceEnabled, settings.ambienceVolume)
    return () => engineRef.current!.setAmbience(false, 0)
  }, [settings.ambienceEnabled, settings.ambienceVolume])

  const playSfx = useMemo(() => {
    return (name: SfxName) => {
      if (!settings.sfxEnabled) return
      engineRef.current!.playSfx(name, settings.sfxVolume)
    }
  }, [settings.sfxEnabled, settings.sfxVolume])

  const haptic = useMemo(() => {
    return (name: HapticName) => {
      if (!settings.hapticsEnabled) return
      if (!canVibrate()) return
      try {
        navigator.vibrate(hapticPattern(name))
      } catch {
        // ignore
      }
    }
  }, [settings.hapticsEnabled])

  return { playSfx, haptic }
}
