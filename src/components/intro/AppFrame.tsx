'use client'

import { useEffect, useState } from 'react'
import WorldIntro from './WorldIntro'

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const [boot, setBoot] = useState(true)
  const [intro, setIntro] = useState(false)

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem('nexus_world_intro') === '1'
    } catch {
      seen = false
    }
    setIntro(!seen)
    setBoot(false)
  }, [])

  return (
    <>
      {boot && <div className="fixed inset-0 z-[9999] bg-[#020010]" aria-hidden />}
      {intro && <WorldIntro onDone={() => setIntro(false)} />}
      {children}
    </>
  )
}
