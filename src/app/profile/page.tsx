'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import UserProfilePage from '@/components/chat/UserProfilePage'

// Version for cache busting - v2.0 Clean Profile
const PROFILE_VERSION = '2.0.0'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Force fresh load - clear any cached data issues
    console.log(`Profile Page v${PROFILE_VERSION} loading...`)
    
    // Check if user is logged in
    const savedUser = localStorage.getItem('nexus_user')
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (e) {
        console.error('Error parsing user data:', e)
        router.push('/')
      }
    } else {
      router.push('/')
    }
    
    setIsLoading(false)
  }, [router])

  const handleBack = () => {
    router.push('/')
  }

  const handleLogout = () => {
    localStorage.removeItem('nexus_user')
    localStorage.removeItem('nexus_profile')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">Please login to view your profile</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <UserProfilePage
      user={user}
      onBack={handleBack}
      onLogout={handleLogout}
    />
  )
}
