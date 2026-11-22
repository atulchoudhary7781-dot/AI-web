'use client'

import { useEffect, useRef } from 'react'

export default function BlackHoleBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const mobile = window.innerWidth < 768
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.6)
    let w = 0
    let h = 0
    let raf = 0
    let running = true

    type Star = { x: number; y: number; r: number; a: number; tw: number }
    type Spark = { a: number; d: number; s: number; w: number; c: string }

    let stars: Star[] = []
    let sparks: Spark[] = []

    const colors = ['#ffd9a0', '#ffb347', '#e8a06a', '#9ec9ff', '#fff6e8']

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const starCount = mobile ? 55 : 140
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.7 + 0.15,
        tw: Math.random() * 2.4 + 0.6,
      }))

      const sparkCount = mobile ? 90 : 220
      sparks = Array.from({ length: sparkCount }, () => ({
        a: Math.random() * Math.PI * 2,
        d: 0.18 + Math.random() * 0.72,
        s: (Math.random() * 0.35 + 0.08) * (Math.random() > 0.5 ? 1 : -1),
        w: Math.random() * 1.6 + 0.4,
        c: colors[Math.floor(Math.random() * colors.length)],
      }))
    }

    resize()
    window.addEventListener('resize', resize)

    const start = performance.now()
    const draw = (now: number) => {
      if (!running) return
      const t = (now - start) / 1000
      ctx.clearRect(0, 0, w, h)

      const cx = w * 0.52
      const cy = h * 0.46
      const rx = Math.min(w, h) * 0.22
      const ry = rx * 0.38

      for (const star of stars) {
        const tw = 0.45 + Math.sin(t * star.tw) * 0.45
        ctx.fillStyle = `rgba(255, 246, 232, ${star.a * tw})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(-0.18)
      for (const spark of sparks) {
        spark.a += spark.s * 0.008
        const x = Math.cos(spark.a) * rx * spark.d * 2.35
        const y = Math.sin(spark.a) * ry * spark.d * 2.05
        const falloff = 1 - Math.abs(y) / (ry * 2.4)
        ctx.fillStyle = spark.c
        ctx.globalAlpha = Math.max(0.08, falloff * 0.55)
        ctx.beginPath()
        ctx.arc(x, y, spark.w, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
      ctx.globalAlpha = 1

      const pulse = 0.22 + Math.sin(t * 0.7) * 0.05
      const glow = ctx.createRadialGradient(cx, cy, rx * 0.15, cx, cy, rx * 2.4)
      glow.addColorStop(0, `rgba(255, 176, 80, ${pulse})`)
      glow.addColorStop(0.35, 'rgba(255, 120, 40, 0.08)')
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
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

  return (
    <div className="blackhole-stage" aria-hidden>
      <div className="blackhole-photo" />
      <canvas ref={canvasRef} className="blackhole-canvas" />
      <div className="blackhole-vignette" />
      <div className="blackhole-grain" />
    </div>
  )
}
