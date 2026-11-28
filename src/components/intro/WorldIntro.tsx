'use client'

import { useEffect, useRef, useState } from 'react'

const INTRO_KEY = 'nexus_world_intro_v3'

export default function WorldIntro({ onDone }: { onDone: () => void }) {
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
    window.setTimeout(onDone, 500)
  }

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      finish()
      return
    }
    const timers = [
      window.setTimeout(() => setPhase(1), 120),
      window.setTimeout(() => setPhase(2), 420),
      window.setTimeout(() => setPhase(3), 900),
      window.setTimeout(() => setPhase(4), 1400),
      window.setTimeout(() => setPhase(5), 1800),
      window.setTimeout(() => finish(), 2800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div
      className={`nexus-intro ${leaving ? 'nexus-intro-leave' : ''}`}
      role="dialog"
      aria-label="NEXUS AI intro"
    >
      <div className="nexus-intro-copy">
        <p className={`nexus-intro-kicker ${phase >= 1 ? 'is-on' : ''}`}>
          NEXUS AI
        </p>
        <h1 className={`nexus-intro-title ${phase >= 2 ? 'is-on' : ''}`}>
          Ask anything
        </h1>
        <p className={`nexus-intro-line ${phase >= 3 ? 'is-on' : ''}`}>
          Writing, code, research, and files — in one calm place.
        </p>
        <p className={`nexus-intro-by ${phase >= 4 ? 'is-on' : ''}`}>
          Built by Atul Choudhary
        </p>
        <div className={`nexus-intro-rule ${phase >= 5 ? 'is-on' : ''}`} />
      </div>

      <button type="button" onClick={finish} className="nexus-intro-skip">
        Skip
      </button>
    </div>
  )
}
