'use client'

import { useEffect, useRef, useState } from 'react'

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
      sessionStorage.setItem('nexus_world_intro', '1')
    } catch { /* ignore */ }
    window.setTimeout(onDone, 720)
  }

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      finish()
      return
    }

    const timers = [
      window.setTimeout(() => setPhase(1), 120),
      window.setTimeout(() => setPhase(2), 700),
      window.setTimeout(() => setPhase(3), 1400),
      window.setTimeout(() => setPhase(4), 2200),
      window.setTimeout(() => setPhase(5), 3200),
      window.setTimeout(() => finish(), 5400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const mobile = window.innerWidth < 768
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75)
    let w = 0
    let h = 0
    let raf = 0
    let running = true

    type Star = {
      x: number
      y: number
      z: number
      s: number
      hue: number
    }
    const count = mobile ? 70 : 160
    const stars: Star[] = Array.from({ length: count }, () => ({
      x: Math.random() * 2 - 1,
      y: Math.random() * 2 - 1,
      z: Math.random(),
      s: Math.random() * 1.8 + 0.4,
      hue: Math.random() > 0.7 ? 280 : 190,
    }))

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

    const start = performance.now()
    const draw = (now: number) => {
      if (!running) return
      const t = (now - start) / 1000
      ctx.fillStyle = '#020010'
      ctx.fillRect(0, 0, w, h)

      const gx = w * 0.5 + Math.sin(t * 0.35) * w * 0.08
      const gy = h * 0.42 + Math.cos(t * 0.28) * h * 0.06
      const nebula = ctx.createRadialGradient(gx, gy, 20, gx, gy, Math.max(w, h) * 0.55)
      nebula.addColorStop(0, 'rgba(0, 229, 255, 0.28)')
      nebula.addColorStop(0.35, 'rgba(124, 58, 237, 0.16)')
      nebula.addColorStop(0.7, 'rgba(236, 72, 153, 0.06)')
      nebula.addColorStop(1, 'rgba(2, 0, 16, 0)')
      ctx.fillStyle = nebula
      ctx.fillRect(0, 0, w, h)

      const ring = 90 + Math.sin(t * 1.6) * 18
      ctx.beginPath()
      ctx.arc(w / 2, h * 0.42, ring + 40, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.18 + Math.sin(t * 3) * 0.08})`
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(w / 2, h * 0.42, ring, t, t + Math.PI * 1.4)
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.65)'
      ctx.lineWidth = 3
      ctx.stroke()

      for (const star of stars) {
        star.z -= 0.0045 + star.s * 0.0012
        if (star.z <= 0.02) {
          star.x = Math.random() * 2 - 1
          star.y = Math.random() * 2 - 1
          star.z = 1
        }
        const k = 0.55 / star.z
        const x = w / 2 + star.x * k * w
        const y = h / 2 + star.y * k * h
        if (x < -40 || x > w + 40 || y < -40 || y > h + 40) continue
        const alpha = Math.min(1, (1 - star.z) * 1.15)
        const size = star.s * k * 0.9
        ctx.fillStyle = star.hue > 220
          ? `rgba(196, 125, 255, ${alpha})`
          : `rgba(0, 229, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      const nodes = 12
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)'
      ctx.lineWidth = 1
      for (let i = 0; i < nodes; i++) {
        const a = t * 0.6 + (i / nodes) * Math.PI * 2
        const x1 = w / 2 + Math.cos(a) * (110 + Math.sin(t + i) * 20)
        const y1 = h * 0.42 + Math.sin(a) * (70 + Math.cos(t + i) * 16)
        const b = a + Math.PI * 0.45
        const x2 = w / 2 + Math.cos(b) * 160
        const y2 = h * 0.42 + Math.sin(b) * 100
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

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
      className={`fixed inset-0 z-[9999] overflow-hidden bg-[#020010] transition-opacity duration-700 ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      role="dialog"
      aria-label="NEXUS AI intro"
    >
      <img
        src="/nexus-promo-poster.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-md"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,0,16,0.35)_70%,#020010_100%)]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div
          className={`mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-600 shadow-[0_0_80px_rgba(0,229,255,0.55)] transition-all duration-700 sm:h-24 sm:w-24 ${
            phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-10 w-10 text-white sm:h-12 sm:w-12" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3l2.2 6.4L21 12l-6.8 2.6L12 21l-2.2-6.4L3 12l6.8-2.6L12 3z" />
          </svg>
        </div>

        <h1
          className={`font-display text-5xl font-black tracking-[0.18em] text-white transition-all duration-700 sm:text-7xl ${
            phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          NEXUS <span className="bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">AI</span>
        </h1>
        <p
          className={`mt-4 max-w-lg text-xs font-medium uppercase tracking-[0.42em] text-cyan-200/80 transition-all duration-700 sm:text-sm ${
            phase >= 3 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          The future of intelligence
        </p>
        <p
          className={`mt-3 text-sm text-slate-400 transition-all duration-700 ${
            phase >= 4 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Built by Atul Choudhary
        </p>
        <div
          className={`mt-8 h-px w-40 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transition-all duration-700 ${
            phase >= 5 ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
          }`}
        />
      </div>

      <button
        type="button"
        onClick={finish}
        className="absolute bottom-6 right-6 z-20 min-h-11 rounded-full border border-white/20 bg-black/40 px-4 text-xs font-semibold tracking-wide text-white backdrop-blur-md hover:border-cyan-300/50 hover:text-cyan-200"
      >
        Skip intro
      </button>
    </div>
  )
}
