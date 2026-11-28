'use client'

import { useEffect, useState } from 'react'
import WorldIntro from './WorldIntro'

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const [boot, setBoot] = useState(true)
  const [intro, setIntro] = useState(false)

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem('nexus_world_intro_v3') === '1'
    } catch {
      seen = false
    }
    setIntro(!seen)
    setBoot(false)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const vv = window.visualViewport
      const height = Math.round(vv?.height ?? window.innerHeight)
      const offset = Math.round(vv?.offsetTop ?? 0)
      root.style.setProperty('--app-height', `${height}px`)
      root.style.setProperty('--app-offset', `${offset}px`)
    }
    apply()
    window.visualViewport?.addEventListener('resize', apply)
    window.visualViewport?.addEventListener('scroll', apply)
    window.addEventListener('orientationchange', apply)
    return () => {
      window.visualViewport?.removeEventListener('resize', apply)
      window.visualViewport?.removeEventListener('scroll', apply)
      window.removeEventListener('orientationchange', apply)
    }
  }, [])

  return (
    <>
      {boot && <div className="fixed inset-0 z-[9999] bg-black" aria-hidden />}
      {intro && <WorldIntro onDone={() => setIntro(false)} />}
      {children}
    </>
  )
}
