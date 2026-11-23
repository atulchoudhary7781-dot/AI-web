'use client'

import { useEffect, useRef, useState } from 'react'

const INTRO_KEY = 'nexus_world_intro_v2'

export default function WorldIntro({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [leaving, setLeaving] = useState(false)
  const [phase, setPhase] = useState(0)
  const doneRef = useRef(false)

  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    setLeaving(true)
    try {
      sessionStorage.setItem(INTRO_KEY, '1')
    } catch { /* ignore */ }
    window.setTimeout(onDone, 900)
  }

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      finish()
      return
    }
    const timers = [
      window.setTimeout(() => setPhase(1), 280),
      window.setTimeout(() => setPhase(2), 1100),
      window.setTimeout(() => setPhase(3), 2300),
      window.setTimeout(() => setPhase(4), 3400),
      window.setTimeout(() => setPhase(5), 4500),
      window.setTimeout(() => finish(), 7200),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const mobile = window.innerWidth < 768
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.6)
    let w = 0
    let h = 0
    let raf = 0
    let running = true

    type Star = { x: number; y: number; z: number; r: number; a: number }
    type Spark = { a: number; d: number; s: number; w: number }

    let stars: Star[] = []
    let sparks: Spark[] = []

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    stars = Array.from({ length: mobile ? 90 : 220 }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random(),
      r: Math.random() * 1.4 + 0.2,
      a: Math.random() * 0.8 + 0.2,
    }))
    sparks = Array.from({ length: mobile ? 160 : 380 }, () => ({
      a: Math.random() * Math.PI * 2,
      d: 0.18 + Math.random() * 0.82,
      s: (Math.random() * 0.5 + 0.12) * (Math.random() > 0.5 ? 1 : -1),
      w: Math.random() * 1.7 + 0.35,
    }))

    const start = performance.now()
    const draw = (now: number) => {
      if (!running) return
      const t = (now - start) / 1000
      const zoom = 0.22 + Math.min(1, t / 3.4) ** 0.85 * 1.35
      const warp = Math.min(1, t / 2.6)

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = `rgba(0,0,0,${0.18 + warp * 0.12})`
      ctx.fillRect(0, 0, w, h)

      const cx = w * 0.52
      const cy = h * 0.46
      const rx = Math.min(w, h) * 0.16 * zoom
      const ry = rx * 0.34

      for (const star of stars) {
        star.z -= 0.0032 + warp * 0.011 * star.r
        if (star.z <= 0.04) {
          star.x = Math.random() * 2 - 1
          star.y = Math.random() * 2 - 1
          star.z = 1
        }
        const k = 0.62 / star.z
        const x = cx + star.x * k * w * 0.55
        const y = cy + star.y * k * h * 0.55
        if (x < -20 || x > w + 20 || y < -20 || y > h + 20) continue
        const alpha = Math.min(1, (1 - star.z) * star.a)
        ctx.fillStyle = `rgba(255, 236, 210, ${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, star.r * k * 0.55, 0, Math.PI * 2)
        ctx.fill()
        if (warp > 0.35 && star.z < 0.7) {
          ctx.strokeStyle = `rgba(255, 180, 90, ${alpha * 0.35})`
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(cx + star.x * (k * 0.82) * w * 0.55, cy + star.y * (k * 0.82) * h * 0.55)
          ctx.stroke()
        }
      }

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(-0.22)

      const haze = ctx.createRadialGradient(0, 0, rx * 0.15, 0, 0, rx * 3.1)
      haze.addColorStop(0, 'rgba(255, 210, 140, 0.16)')
      haze.addColorStop(0.4, 'rgba(255, 120, 40, 0.08)')
      haze.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = haze
      ctx.beginPath()
      ctx.ellipse(0, 0, rx * 2.8, ry * 2.4, 0, 0, Math.PI * 2)
      ctx.fill()

      for (const spark of sparks) {
        spark.a += spark.s * (0.012 + warp * 0.01)
        const x = Math.cos(spark.a) * rx * spark.d * 2.5
        const y = Math.sin(spark.a) * ry * spark.d * 2.2
        const doppler = (Math.cos(spark.a) + 1) / 2
        const falloff = 1 - Math.abs(y) / (ry * 2.8 + 1)
        ctx.globalAlpha = Math.max(0.05, falloff * 0.7)
        ctx.fillStyle = doppler > 0.55
          ? `rgb(255, ${Math.floor(150 + doppler * 70)}, ${Math.floor(70 + doppler * 40)})`
          : `rgb(${Math.floor(130 + doppler * 80)}, ${Math.floor(170 + doppler * 40)}, 255)`
        ctx.beginPath()
        ctx.arc(x, y, spark.w * (0.8 + zoom * 0.15), 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      ctx.strokeStyle = 'rgba(255, 214, 150, 0.7)'
      ctx.lineWidth = 2.4 * Math.min(2, zoom)
      ctx.beginPath()
      ctx.ellipse(0, 0, rx * 1.08, ry * 0.95, 0, 0, Math.PI * 2)
      ctx.stroke()

      ctx.strokeStyle = 'rgba(255, 170, 80, 0.35)'
      ctx.lineWidth = 8
      ctx.beginPath()
      ctx.ellipse(0, 0, rx * 1.22, ry * 1.05, 0, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.ellipse(0, 0, rx * 0.72, rx * 0.72, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = 'rgba(255, 196, 110, 0.85)'
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.ellipse(0, 0, rx * 0.76, rx * 0.76, 0, 0, Math.PI * 2)
      ctx.stroke()

      ctx.restore()

      const pulse = 0.16 + Math.sin(t * 0.8) * 0.05
      const glow = ctx.createRadialGradient(cx, cy, rx * 0.1, cx, cy, rx * 3)
      glow.addColorStop(0, `rgba(255, 176, 80, ${pulse})`)
      glow.addColorStop(0.4, 'rgba(255, 110, 30, 0.08)')
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div
      className={`nexus-intro ${leaving ? 'nexus-intro-leave' : ''}`}
      role="dialog"
      aria-label="NEXUS AI world intro"
    >
      <div
        className="nexus-intro-photo"
        style={{ transform: phase >= 1 ? 'scale(1.28)' : 'scale(1.06)' }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="nexus-intro-vignette" />

      <div className="nexus-intro-copy">
        <p className={`nexus-intro-kicker ${phase >= 1 ? 'is-on' : ''}`}>
          Crossing the horizon
        </p>
        <h1 className={`nexus-intro-title ${phase >= 2 ? 'is-on' : ''}`}>
          NEXUS <span>AI</span>
        </h1>
        <p className={`nexus-intro-line ${phase >= 3 ? 'is-on' : ''}`}>
          Intelligence beyond the event horizon
        </p>
        <p className={`nexus-intro-by ${phase >= 4 ? 'is-on' : ''}`}>
          Built by Atul Choudhary
        </p>
        <div className={`nexus-intro-rule ${phase >= 5 ? 'is-on' : ''}`} />
      </div>

      <button type="button" onClick={finish} className="nexus-intro-skip">
        Skip intro
      </button>
    </div>
  )
}
