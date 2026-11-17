'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import UserProfilePage from '@/components/chat/UserProfilePage'
import { clearSessionUser, getSessionUser } from '@/lib/session'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const session = getSessionUser()
    if (!session) {
      router.replace('/login')
      return
    }
    setUser(session)
    setReady(true)
  }, [router])

  if (!ready || !user) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-400">Redirecting to login…</p>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <UserProfilePage
        user={user}
        onBack={() => router.push('/home')}
        onLogout={() => {
          clearSessionUser()
          localStorage.removeItem('nexus_profile')
          router.push('/home')
        }}
      />
    </div>
  )
}
