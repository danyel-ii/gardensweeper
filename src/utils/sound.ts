export type SfxName = 'reveal' | 'flag' | 'win' | 'lose'

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(1, v))
}

export class SoundEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private ambienceNodes:
    | { out: GainNode; stop: () => void; setVolume: (v: number) => void }
    | null = null

  private ensure(): { ctx: AudioContext; master: GainNode } {
    if (this.ctx && this.master) return { ctx: this.ctx, master: this.master }

    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const master = ctx.createGain()
    master.gain.value = 0.8
    master.connect(ctx.destination)
    this.ctx = ctx
    this.master = master
    return { ctx, master }
  }

  private async resumeIfNeeded(ctx: AudioContext): Promise<void> {
    if (ctx.state !== 'suspended') return
    try {
      await ctx.resume()
    } catch {
      // ignored: browsers can reject if not in a user gesture.
    }
  }

  playSfx(name: SfxName, volume01: number): void {
    const v = clamp01(volume01)
    if (v <= 0) return
    const { ctx, master } = this.ensure()
    void this.resumeIfNeeded(ctx)

    const now = ctx.currentTime
    const out = ctx.createGain()
    out.connect(master)

    const osc = ctx.createOscillator()
    osc.connect(out)

    // Keep levels conservative. v=1 is still gentle.
    const gain = 0.05 * v

    if (name === 'reveal') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(520, now)
      out.gain.setValueAtTime(0, now)
      out.gain.linearRampToValueAtTime(gain, now + 0.005)
      out.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)
      osc.start(now)
      osc.stop(now + 0.065)
    } else if (name === 'flag') {
      osc.type = 'square'
      osc.frequency.setValueAtTime(220, now)
      out.gain.setValueAtTime(0, now)
      out.gain.linearRampToValueAtTime(gain * 0.8, now + 0.003)
      out.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)
      osc.start(now)
      osc.stop(now + 0.055)
    } else if (name === 'win') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, now) // C5
      osc.frequency.exponentialRampToValueAtTime(784, now + 0.18) // G5
      out.gain.setValueAtTime(0, now)
      out.gain.linearRampToValueAtTime(gain, now + 0.01)
      out.gain.exponentialRampToValueAtTime(0.0001, now + 0.22)
      osc.start(now)
      osc.stop(now + 0.23)
    } else if (name === 'lose') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(196, now) // G3
      osc.frequency.exponentialRampToValueAtTime(98, now + 0.22) // G2
      out.gain.setValueAtTime(0, now)
      out.gain.linearRampToValueAtTime(gain * 0.9, now + 0.01)
      out.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)
      osc.start(now)
      osc.stop(now + 0.26)
    }
  }

  setAmbience(enabled: boolean, volume01: number): void {
    const v = clamp01(volume01)
    if (!enabled || v <= 0) {
      this.stopAmbience()
      return
    }

    if (this.ambienceNodes) {
      this.ambienceNodes.setVolume(v)
      return
    }

    const { ctx, master } = this.ensure()
    void this.resumeIfNeeded(ctx)

    const out = ctx.createGain()
    out.gain.value = 0.025 * v
    out.connect(master)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 420
    filter.Q.value = 0.7
    filter.connect(out)

    const oscA = ctx.createOscillator()
    oscA.type = 'sine'
    oscA.frequency.value = 110
    oscA.connect(filter)

    const oscB = ctx.createOscillator()
    oscB.type = 'sine'
    oscB.frequency.value = 165
    oscB.detune.value = -6
    oscB.connect(filter)

    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.07

    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 24
    lfo.connect(lfoGain)
    lfoGain.connect(filter.frequency)

    oscA.start()
    oscB.start()
    lfo.start()

    this.ambienceNodes = {
      out,
      setVolume: (vv) => {
        out.gain.value = 0.025 * clamp01(vv)
      },
      stop: () => {
        try {
          oscA.stop()
          oscB.stop()
          lfo.stop()
        } catch {
          // ignore
        }
        try {
          oscA.disconnect()
          oscB.disconnect()
          lfo.disconnect()
          lfoGain.disconnect()
          filter.disconnect()
          out.disconnect()
        } catch {
          // ignore
        }
      },
    }
  }

  stopAmbience(): void {
    if (!this.ambienceNodes) return
    this.ambienceNodes.stop()
    this.ambienceNodes = null
  }
}

