'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import UserProfilePage from '@/components/chat/UserProfilePage'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('nexus_user')
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
      } catch (e) {
        console.error('Error parsing user data:', e)
        // Redirect to home if no valid user
        router.push('/')
      }
    } else {
      // Redirect to home if not logged in
      router.push('/')
    }
    
    setIsLoading(false)
  }, [router])

  const handleBack = () => {
    router.push('/')
  }

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem('nexus_user')
    localStorage.removeItem('nexus_profile')
    
    // Redirect to home
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">Please login to view your profile</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
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
