/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react'

type Rgb = { r: number; g: number; b: number }

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}

type Petal = {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  spin: number
  size: number
  color: Rgb
  alpha: number
  driftPhase: number
}

type Butterfly = {
  x: number
  y: number
  s: number
  seed: number
  phase: number
  flutter: number
  color: Rgb
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

function makePalette(): { petals: Rgb[]; butterflies: Rgb[] } {
  return {
    petals: [
      { r: 255, g: 140, b: 90 }, // papaya
      { r: 233, g: 196, b: 106 }, // gold
      { r: 236, g: 78, b: 138 }, // pink
      { r: 42, g: 157, b: 143 }, // teal
    ],
    butterflies: [
      { r: 42, g: 157, b: 143 }, // teal
      { r: 236, g: 78, b: 138 }, // pink
      { r: 0, g: 95, b: 115 }, // ocean
    ],
  }
}

export function AmbienceP5() {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  const palette = useMemo(() => makePalette(), [])

  useEffect(() => {
    if (reducedMotion) return
    if (!hostRef.current) return

    let instance: any | null = null
    let cancelled = false

    ;(async () => {
      const mod = await import('p5')
      const P5 = (mod as any).default ?? mod
      if (cancelled) return
      if (!hostRef.current) return

      const sketch = (p: any) => {
        const petals: Petal[] = []
        const butterflies: Butterfly[] = []

        const rand = (a: number, b?: number) =>
          b == null ? p.random(a) : p.random(a, b)

        const pick = <T,>(arr: T[]) => arr[Math.floor(rand(arr.length))]

        const resetPetal = (pt: Petal, w: number, h: number, first = false) => {
          const size = rand(10, 22)
          pt.size = size
          pt.x = rand(-size, w + size)
          pt.y = first ? rand(-h, h) : rand(-h * 0.2, -size * 2)
          pt.vx = rand(-0.18, 0.18)
          pt.vy = rand(0.32, 0.78)
          pt.rot = rand(-Math.PI, Math.PI)
          pt.spin = rand(-0.012, 0.012)
          pt.alpha = rand(72, 126)
          pt.color = pick(palette.petals)
          pt.driftPhase = rand(0, Math.PI * 2)
        }

        const resetButterfly = (b: Butterfly, w: number, h: number, first = false) => {
          b.s = rand(0.65, 1.25)
          b.x = rand(0, w)
          b.y = first ? rand(0, h) : rand(h * 0.25, h * 1.1)
          b.seed = rand(10_000)
          b.phase = rand(0, Math.PI * 2)
          b.flutter = rand(0.12, 0.22)
          b.color = pick(palette.butterflies)
        }

        const initPopulation = (w: number, h: number) => {
          petals.length = 0
          butterflies.length = 0

          const petalCount = Math.round(clamp((w * h) / 95_000, 10, 52))
          const butterflyCount = Math.round(clamp((w * h) / 260_000, 4, 12))

          for (let i = 0; i < petalCount; i += 1) {
            const pt = {} as Petal
            resetPetal(pt, w, h, true)
            petals.push(pt)
          }
          for (let i = 0; i < butterflyCount; i += 1) {
            const b = {} as Butterfly
            resetButterfly(b, w, h, true)
            butterflies.push(b)
          }
        }

        const drawPetal = (pt: Petal) => {
          p.push()
          p.translate(pt.x, pt.y)
          p.rotate(pt.rot)
          p.noStroke()
          p.fill(pt.color.r, pt.color.g, pt.color.b, pt.alpha)
          const s = pt.size
          p.beginShape()
          p.vertex(0, -s * 0.65)
          p.bezierVertex(s * 0.55, -s * 0.25, s * 0.35, s * 0.65, 0, s * 0.75)
          p.bezierVertex(-s * 0.35, s * 0.65, -s * 0.55, -s * 0.25, 0, -s * 0.65)
          p.endShape(p.CLOSE)

          p.stroke(255, 255, 255, 54)
          p.strokeWeight(1)
          p.noFill()
          p.line(0, -s * 0.5, 0, s * 0.55)
          p.pop()
        }

        const drawButterfly = (b: Butterfly) => {
          const flap = 0.55 + 0.45 * Math.sin(b.phase)
          const wingW = 20 * flap
          const wingH = 14

          p.push()
          p.translate(b.x, b.y)
          p.scale(b.s)
          p.rotate(Math.sin(b.phase * 0.35) * 0.18)
          p.noStroke()

          // Wings
          p.fill(b.color.r, b.color.g, b.color.b, 120)
          p.ellipse(-wingW * 0.62, 0, wingW, wingH)
          p.ellipse(wingW * 0.62, 0, wingW, wingH)
          p.fill(255, 255, 255, 70)
          p.ellipse(-wingW * 0.62, 0, wingW * 0.55, wingH * 0.55)
          p.ellipse(wingW * 0.62, 0, wingW * 0.55, wingH * 0.55)

          // Body
          p.fill(38, 70, 83, 170)
          p.rect(-1.7, -6.5, 3.4, 13, 2.2)

          // Antennae
          p.stroke(38, 70, 83, 110)
          p.strokeWeight(1.2)
          p.line(-0.5, -6.2, -4.8, -10.2)
          p.line(0.5, -6.2, 4.8, -10.2)
          p.noStroke()
          p.pop()
        }

        p.setup = () => {
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1))
          p.createCanvas(window.innerWidth, window.innerHeight)
          const canvas = p.canvas as HTMLCanvasElement
          canvas.setAttribute('aria-hidden', 'true')
          canvas.style.pointerEvents = 'none'
          canvas.style.display = 'block'
          p.frameRate(30)
          initPopulation(p.width, p.height)
        }

        p.windowResized = () => {
          p.resizeCanvas(window.innerWidth, window.innerHeight)
          initPopulation(p.width, p.height)
        }

        p.draw = () => {
          p.clear()
          const w = p.width
          const h = p.height
          const t = p.frameCount

          for (const pt of petals) {
            pt.y += pt.vy
            pt.x += pt.vx + Math.sin(pt.driftPhase + t * 0.018) * 0.38
            pt.rot += pt.spin

            const pad = pt.size * 2
            if (pt.y > h + pad) resetPetal(pt, w, h, false)
            if (pt.x < -pad) pt.x = w + pad
            if (pt.x > w + pad) pt.x = -pad

            drawPetal(pt)
          }

          for (const b of butterflies) {
            b.phase += b.flutter
            const n1 = p.noise(b.seed, t * 0.01)
            const n2 = p.noise(b.seed + 777, t * 0.01)
            b.x += (n1 - 0.5) * 1.2
            b.y += (n2 - 0.5) * 0.8 - 0.18

            const pad = 40
            if (b.x < -pad) b.x = w + pad
            if (b.x > w + pad) b.x = -pad
            if (b.y < -pad) b.y = h + pad
            if (b.y > h + pad) b.y = -pad

            drawButterfly(b)
          }
        }
      }

      instance = new P5(sketch, hostRef.current)
    })()

    const onVisibility = () => {
      if (!instance) return
      if (document.hidden) instance.noLoop()
      else instance.loop()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      if (instance) {
        instance.remove()
        instance = null
      }
    }
  }, [palette, reducedMotion])

  return <div className="ambientLayer" ref={hostRef} aria-hidden="true" />
}
