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
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.7)
    let w = 0
    let h = 0
    let raf = 0
    let running = true

    type Star = { x: number; y: number; r: number; a: number; tw: number }
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

      const starCount = mobile ? 70 : 180
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.35 + 0.18,
        a: Math.random() * 0.75 + 0.12,
        tw: Math.random() * 2.6 + 0.5,
      }))

      const sparkCount = mobile ? 140 : 340
      sparks = Array.from({ length: sparkCount }, () => ({
        a: Math.random() * Math.PI * 2,
        d: 0.16 + Math.random() * 0.84,
        s: (Math.random() * 0.42 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
        w: Math.random() * 1.8 + 0.35,
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
      const rx = Math.min(w, h) * 0.24
      const ry = rx * 0.34

      for (const star of stars) {
        const tw = 0.42 + Math.sin(t * star.tw) * 0.48
        ctx.fillStyle = `rgba(255, 246, 232, ${star.a * tw})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(-0.22)

      const disk = ctx.createRadialGradient(0, 0, rx * 0.2, 0, 0, rx * 2.6)
      disk.addColorStop(0, 'rgba(255, 230, 180, 0.08)')
      disk.addColorStop(0.35, 'rgba(255, 140, 50, 0.07)')
      disk.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = disk
      ctx.beginPath()
      ctx.ellipse(0, 0, rx * 2.5, ry * 2.2, 0, 0, Math.PI * 2)
      ctx.fill()

      for (const spark of sparks) {
        spark.a += spark.s * 0.009
        const x = Math.cos(spark.a) * rx * spark.d * 2.45
        const y = Math.sin(spark.a) * ry * spark.d * 2.15
        const doppler = (Math.cos(spark.a) + 1) / 2
        const falloff = 1 - Math.abs(y) / (ry * 2.6)
        ctx.fillStyle = doppler > 0.55
          ? `rgb(${255}, ${Math.floor(150 + doppler * 70)}, ${Math.floor(70 + doppler * 40)})`
          : `rgb(${Math.floor(140 + doppler * 80)}, ${Math.floor(170 + doppler * 40)}, 255)`
        ctx.globalAlpha = Math.max(0.07, falloff * 0.62)
        ctx.beginPath()
        ctx.arc(x, y, spark.w, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 0.55
      ctx.strokeStyle = 'rgba(255, 214, 150, 0.55)'
      ctx.lineWidth = 2.2
      ctx.beginPath()
      ctx.ellipse(0, 0, rx * 1.05, ry * 0.92, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 0.28
      ctx.strokeStyle = 'rgba(158, 201, 255, 0.5)'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.ellipse(0, 0, rx * 0.82, ry * 0.72, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
      ctx.globalAlpha = 1

      const pulse = 0.2 + Math.sin(t * 0.65) * 0.06
      const glow = ctx.createRadialGradient(cx, cy, rx * 0.12, cx, cy, rx * 2.6)
      glow.addColorStop(0, `rgba(255, 176, 80, ${pulse})`)
      glow.addColorStop(0.32, 'rgba(255, 110, 30, 0.09)')
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
