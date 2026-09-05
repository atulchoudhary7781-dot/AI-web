'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Mail, Camera, Save, X, CheckCircle,
  MapPin, Phone, Globe, Edit3, Sparkles,
  Calendar, MessageSquare, Settings, LogOut,
  ChevronLeft, Shield, Award, Zap, Upload,
  Download, Crown, Star, Clock, RefreshCw,
  Image as ImageIcon, CreditCard, Check, AlertCircle,
  Lock, Key, ShieldCheck, ExternalLink, Database
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Types
interface UserProfileProps {
  user: {
    name: string
    email: string
    avatar?: string
  }
  onBack?: () => void
  onLogout?: () => void
}

interface SubscriptionPlan {
  id: 'free' | 'normal' | 'pro'
  name: string
  price: number
  period: string
  features: string[]
  popular?: boolean
  color: string
  gradient: string
  locked?: boolean
  lockMessage?: string
}

// Subscription Plans Data
const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    features: [
      '10 chats per day',
      'Basic AI responses',
      'Community support',
      'Chat history (7 days)'
    ],
    color: 'text-gray-400',
    gradient: 'from-gray-500 to-gray-600',
    locked: false
  },
  {
    id: 'normal',
    name: 'Normal',
    price: 10,
    period: 'month',
    features: [
      'Unlimited chats',
      'Advanced AI models',
      'Priority support',
      'Chat history (30 days)',
      'File attachments',
      'Export data'
    ],
    popular: true,
    color: 'text-cyan-400',
    gradient: 'from-cyan-500 to-blue-500',
    locked: true,
    lockMessage: 'Coming Soon with Subscription'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 20,
    period: 'month',
    features: [
      'Everything in Normal',
      'GPT-4 & Claude access',
      'Image generation',
      'Voice conversations',
      'API access',
      'Custom AI training',
      'Priority queue',
      'Dedicated support'
    ],
    color: 'text-yellow-400',
    gradient: 'from-neon-cyan to-neon-purple',
    locked: true,
    lockMessage: 'Coming Soon with Subscription'
  }
]

export default function UserProfilePage({ user: initialUser, onBack, onLogout }: UserProfileProps) {
  const [user, setUser] = useState(initialUser)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'settings'>('profile')
  
  // Form states
  const [name, setName] = useState(initialUser.name || '')
  const [email] = useState(initialUser.email || '')
  const [avatar, setAvatar] = useState(initialUser.avatar || '')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')

  // Subscription state
  const [currentPlan, setCurrentPlan] = useState<'free' | 'normal' | 'pro'>('free')
  const [chatCountToday, setChatCountToday] = useState(0)
  const [maxChatsForPlan, setMaxChatsForPlan] = useState(10)
  const [chatResetTime, setChatResetTime] = useState<string>('')

  // Import/Export state
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Gmail sync state
  const [isSyncingGmail, setIsSyncingGmail] = useState(false)

  // Stripe/Email verification states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Router for navigation
  const router = useRouter()

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        setName(parsedUser.name || '')
        setAvatar(parsedUser.avatar || '')
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }

    // Load profile data if exists
    const savedProfile = localStorage.getItem('nexus_profile')
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        setBio(profile.bio || '')
        setPhone(profile.phone || '')
        setLocation(profile.location || '')
        setWebsite(profile.website || '')
      } catch (e) {
        console.error('Error parsing profile data:', e)
      }
    }

    // Load subscription data
    loadSubscriptionData()

    // Load chat count for today
    loadChatCountForToday()

    // Check if email is verified (from localStorage or API)
    const savedVerified = localStorage.getItem('nexus_email_verified')
    setEmailVerified(savedVerified === 'true')

    // Check if user is admin
    const savedRole = localStorage.getItem('nexus_user_role')
    setIsAdmin(savedRole === 'admin')

    // Check URL params for success/canceled from Stripe
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'true') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (urlParams.get('verified') === 'true') {
      setEmailVerified(true)
      localStorage.setItem('nexus_email_verified', 'true')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Calculate chat reset time
  const calculateResetTime = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const diff = tomorrow.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${hours}h ${minutes}m`
  }

  // Load subscription data
  const loadSubscriptionData = () => {
    const savedSub = localStorage.getItem('nexus_subscription')
    if (savedSub) {
      try {
        const sub = JSON.parse(savedSub)
        setCurrentPlan(sub.plan || 'free')
        
        // Set max chats based on plan
        if (sub.plan === 'pro' || sub.plan === 'normal') {
          setMaxChatsForPlan(Infinity) // Unlimited
        } else {
          setMaxChatsForPlan(10)
        }
      } catch (e) {
        console.error('Error parsing subscription:', e)
      }
    }
    
    // Update reset time
    setChatResetTime(calculateResetTime())
    
    // Update reset time every minute
    const interval = setInterval(() => {
      setChatResetTime(calculateResetTime())
    }, 60000)

    return () => clearInterval(interval)
  }

  // Load chat count for today
  const loadChatCountForToday = () => {
    const savedChats = localStorage.getItem('nexus_chat_count_today')
    const savedDate = localStorage.getItem('nexus_chat_date')
    
    const today = new Date().toDateString()
    
    if (savedDate === today && savedChats) {
      setChatCountToday(parseInt(savedChats, 10))
    } else {
      // New day, reset count
      setChatCountToday(0)
      localStorage.setItem('nexus_chat_count_today', '0')
      localStorage.setItem('nexus_chat_date', today)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setAvatar(result)
      
      // Update user state immediately for preview
      setUser(prev => ({ ...prev, avatar: result }))
    }
    reader.readAsDataURL(file)
  }

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatar('')
    setUser(prev => ({ ...prev, avatar: undefined }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Sync photo from Gmail/Google
  const handleGmailPhotoSync = async () => {
    setIsSyncingGmail(true)
    
    try {
      // Simulate Google OAuth flow (in production, use Google OAuth API)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo: Use a placeholder Google avatar or ask user to enter URL
      const googleImageUrl = prompt('Enter your Google Profile Photo URL (or leave blank for default):', 
        'https://lh3.googleusercontent.com/a/default-user'
      )
      
      if (googleImageUrl) {
        setAvatar(googleImageUrl)
        setUser(prev => ({ ...prev, avatar: googleImageUrl }))
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Gmail sync error:', error)
      alert('Failed to sync Google photo. Please try again.')
    } finally {
      setIsSyncingGmail(false)
    }
  }

  // Save profile
  const handleSaveProfile = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update user object
    const updatedUser = {
      ...user,
      name,
      avatar
    }

    // Save to localStorage
    localStorage.setItem('nexus_user', JSON.stringify(updatedUser))
    
    // Save extended profile data
    const profileData = { bio, phone, location, website }
    localStorage.setItem('nexus_profile', JSON.stringify(profileData))

    setUser(updatedUser)
    setIsEditing(false)
    setShowSuccess(true)
    setIsLoading(false)

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setName(user.name || '')
    setAvatar(user.avatar || '')
    setBio(bio)
    setPhone(phone)
    setLocation(location)
    setWebsite(website)
    setIsEditing(false)
  }

  // Handle subscription upgrade with real Stripe integration
  const handleSubscriptionChange = async (planId: 'free' | 'normal' | 'pro') => {
    if (planId === currentPlan) return
    
    // If downgrading to free, just do it locally
    if (planId === 'free') {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newSub = { plan: 'free', startDate: new Date().toISOString() }
      localStorage.setItem('nexus_subscription', JSON.stringify(newSub))
      setCurrentPlan('free')
      setMaxChatsForPlan(10)
      
      setIsLoading(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      return
    }
    
    // For paid plans, use Stripe Checkout
    setIsProcessingPayment(true)
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan: planId })
      })
      
      const data = await response.json()
      
      if (data.success && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        // Fallback to mock payment if Stripe not configured
        console.log('Stripe not configured, using mock payment')
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        const newSub = {
          plan: planId,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          price: planId === 'normal' ? 10 : 20
        }
        
        localStorage.setItem('nexus_subscription', JSON.stringify(newSub))
        setCurrentPlan(planId)
        setMaxChatsForPlan(Infinity)
        
        setIsLoading(false)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        
        alert(`Successfully upgraded to ${planId.toUpperCase()} plan! 🎉`)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to process payment. Please try again.')
      setIsLoading(false)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  // Send email verification
  const handleSendVerification = async () => {
    setIsSendingVerification(true)
    
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        alert(data.message + (data.verificationUrl ? `\n\nDev URL: ${data.verificationUrl}` : ''))
        if (data.verified) {
          setEmailVerified(true)
          localStorage.setItem('nexus_email_verified', 'true')
        }
      } else {
        alert(data.error || 'Failed to send verification email')
      }
    } catch (error) {
      console.error('Verification error:', error)
      alert('Failed to send verification email.')
    } finally {
      setIsSendingVerification(false)
    }
  }

  // Export data
  const handleExportData = async () => {
    setIsExporting(true)
    
    try {
      // Gather all user data
      const exportData = {
        user: JSON.parse(localStorage.getItem('nexus_user') || '{}'),
        profile: JSON.parse(localStorage.getItem('nexus_profile') || '{}'),
        subscription: JSON.parse(localStorage.getItem('nexus_subscription') || '{}'),
        chats: JSON.parse(localStorage.getItem('nexus_chats') || '[]'),
        exportDate: new Date().toISOString(),
        version: '1.0'
      }
      
      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nexus-ai-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  // Import data
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string)
        
        // Validate import data
        if (!importData.user || !importData.version) {
          throw new Error('Invalid export file')
        }
        
        // Confirm import
        const confirmed = confirm(
          `This will overwrite your current data with:\n` +
          `- User: ${importData.user?.name || 'Unknown'}\n` +
          `- Chats: ${importData.chats?.length || 0} sessions\n\n` +
          `Continue with import?`
        )
        
        if (confirmed) {
          // Import data
          if (importData.user) localStorage.setItem('nexus_user', JSON.stringify(importData.user))
          if (importData.profile) localStorage.setItem('nexus_profile', JSON.stringify(importData.profile))
          if (importData.subscription) {
            localStorage.setItem('nexus_subscription', JSON.stringify(importData.subscription))
            loadSubscriptionData()
          }
          if (importData.chats) localStorage.setItem('nexus_chats', JSON.stringify(importData.chats))
          
          // Reload page to show imported data
          window.location.reload()
        }
      } catch (error) {
        console.error('Import error:', error)
        alert('Failed to import data. Please check the file format.')
      } finally {
        setIsImporting(false)
        if (importInputRef.current) {
          importInputRef.current.value = ''
        }
      }
    }
    reader.readAsText(file)
  }

  // Get initials for fallback avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Generate stats (mock data - in real app, fetch from API)
  const stats = [
    { label: 'Total Chats', value: currentPlan === 'free' ? `${chatCountToday}/${maxChatsForPlan}` : '∞', icon: MessageSquare, color: 'from-cyan-500 to-blue-500' },
    { label: 'Days Active', value: '15', icon: Calendar, color: 'from-violet-500 to-purple-500' },
    { label: 'AI Queries', value: '156', icon: Zap, color: 'from-pink-500 to-rose-500' },
    { label: 'Plan', value: currentPlan.toUpperCase(), icon: currentPlan === 'pro' ? Crown : Star, color: currentPlan === 'pro' ? 'from-neon-cyan to-neon-purple' : currentPlan === 'normal' ? 'from-cyan-500 to-blue-500' : 'from-gray-500 to-gray-600' }
  ]

  // Chat limit percentage (for progress bar)
  const chatLimitPercentage = maxChatsForPlan === Infinity ? 100 : (chatCountToday / maxChatsForPlan) * 100

  return (
    <div className="profile-page-container min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-green-500/20 border border-green-500/30 backdrop-blur-xl rounded-xl px-6 py-4 flex items-center gap-3 shadow-lg shadow-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">Action completed successfully!</span>
          </div>
        </div>
      )}

      {/* ===== HEADER SECTION (Fixed Height) ===== */}
      <div className="flex-shrink-0">
        {/* Header Background */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10" />
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500 rounded-full filter blur-[120px]" />
          </div>

          {/* Chat Limit Banner - Compact */}
          {currentPlan === 'free' && (
            <div className="relative bg-gradient-to-r from-neon-cyan/20 via-neon-purple/20 to-electric-blue/20 border-b border-neon-cyan/30 px-4 py-2">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neon-cyan animate-pulse" />
                  <p className="text-xs font-medium text-neon-cyan">
                    Daily Chat Limit: {chatCountToday}/{maxChatsForPlan} chats used · Resets in: <span className="font-mono">{chatResetTime}</span>
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        chatLimitPercentage >= 90 ? 'bg-red-500' : chatLimitPercentage >= 70 ? 'bg-yellow-500' : 'bg-gradient-to-r from-cyan-500 to-violet-500'
                      }`}
                      style={{ width: `${Math.min(chatLimitPercentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">Coming Soon</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Bar - Compact */}
          <div className="relative max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors group text-sm"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back</span>
              </button>

              <h1 className="text-xl font-bold gradient-text font-[family-name:var(--font-orbitron)]">
                User Profile
              </h1>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-xs font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-600 rounded-lg text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Card - Compact */}
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                
                {/* Avatar Section - Smaller */}
                <div className="relative group flex-shrink-0">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500 to-violet-600 p-1">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-800">
                      {avatar ? (
                        <img src={avatar} alt={name || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-violet-600/20">
                          <span className="text-2xl font-bold text-cyan-400">{getInitials(name || 'U')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <>
                      <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 w-20 h-20 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </>
                  )}
                  <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                  {isEditing && avatar && (
                    <button onClick={handleRemoveAvatar} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  )}
                </div>

                {/* User Info - Compact */}
                <div className="flex-1 text-center sm:text-left">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="w-full max-w-sm bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:border-cyan-500 outline-none" />
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 text-xs">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{email}</span>
                        {emailVerified && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center justify-center sm:justify-start gap-3">
                        <h2 className="text-xl font-bold text-white">{name || 'User'}</h2>
                        <Badge variant="secondary" className={currentPlan === 'pro' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : currentPlan === 'normal' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}>
                          {currentPlan.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400 text-sm">
                        <Mail className="w-4 h-4" />
                        <span>{email}</span>
                        {emailVerified ? (
                          <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle className="w-3.5 h-3.5" /> VERIFIED</span>
                        ) : (
                          <span className="text-yellow-400 text-xs cursor-pointer hover:underline" onClick={handleSendVerification}>Verify Email</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons - Compact */}
                <div className="flex flex-col gap-2">
                  {isEditing && (
                    <Button onClick={handleSaveProfile} disabled={isLoading} size="sm" className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-lg shadow-cyan-500/25 text-xs">
                      {isLoading ? 'Saving...' : <><Save className="w-3.5 h-3.5 mr-1" /> Save</>}
                    </Button>
                  )}
                  {onLogout && (
                    <Button variant="outline" size="sm" onClick={onLogout} className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs">
                      <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===== CONTENT SECTION (Fills Remaining Space) ===== */}
      <div className="flex-1 overflow-hidden flex flex-col">
      {/* Tabs & Content */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-gray-900/50 p-1 rounded-xl border border-gray-800 w-fit">
          {[
            { id: 'profile', label: 'Profile Info', icon: User },
            { id: 'subscription', label: 'Subscription', icon: CreditCard },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Info Tab */}
        {activeTab === 'profile' && (
          <div 
            className="profile-info-tab-scroll"
            style={{
              height: 'calc(100vh - 300px)',
              overflowY: 'scroll',
              overflowX: 'hidden',
              paddingRight: '8px'
            }}
          >
            <div className="grid md:grid-cols-2 gap-6 pb-8">
            {/* Bio Card */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-white">About Me</h3>
                </div>
                
                {isEditing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none resize-none transition-all"
                  />
                ) : (
                  <p className="text-gray-400 leading-relaxed">
                    {bio || 'No bio added yet. Click edit to add your bio!'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contact Info Card */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-violet-400" />
                  <h3 className="font-semibold text-white">Contact Information</h3>
                </div>

                <div className="space-y-4">
                  {/* Phone */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone number"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:border-cyan-500 outline-none transition-all"
                        />
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm text-gray-300">{phone || 'Not added'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Location"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:border-cyan-500 outline-none transition-all"
                        />
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm text-gray-300">{location || 'Not added'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Website */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-pink-400" />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://yourwebsite.com"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:border-cyan-500 outline-none transition-all"
                        />
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500">Website</p>
                          {website ? (
                            <a 
                              href={website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              {website}
                            </a>
                          ) : (
                            <p className="text-sm text-gray-300">Not added</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div 
            className="subscription-tab-scroll"
            style={{
              height: 'calc(100vh - 300px)',
              overflowY: 'scroll',
              overflowX: 'hidden',
              paddingRight: '8px'
            }}
          >
            <div className="space-y-6 pb-8">
            {/* Current Plan Status */}
            <Card className="bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 border-gray-800 backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-gray-300">Current Plan</span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {currentPlan === 'pro' ? '👑 Pro' : currentPlan === 'normal' ? '⭐ Normal' : '🆓 Free'}
                </h2>
                <p className="text-gray-400 mb-6">
                  {currentPlan === 'free' 
                    ? `You have ${maxChatsForPlan - chatCountToday} chats remaining today`
                    : 'Unlimited access to all features!'
                  }
                </p>
                
                {/* Free User Progress */}
                {currentPlan === 'free' && (
                  <div className="max-w-md mx-auto mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Daily Usage</span>
                      <span className="text-cyan-400">{chatCountToday}/{maxChatsForPlan} chats</span>
                    </div>
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          chatLimitPercentage >= 90 
                            ? 'bg-red-500' 
                            : chatLimitPercentage >= 70 
                              ? 'bg-yellow-500' 
                              : 'bg-gradient-to-r from-cyan-500 to-violet-500'
                        }`}
                        style={{ width: `${Math.min(chatLimitPercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-gray-500">Resets at midnight</span>
                      <span className="text-cyan-400">{chatResetTime}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Plans Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative bg-gray-900/50 backdrop-blur-xl overflow-hidden transition-all duration-300 ${
                    (plan as any).locked 
                      ? 'opacity-75 cursor-not-allowed border-yellow-500/30' 
                      : currentPlan === plan.id 
                        ? 'border-2 border-cyan-500 shadow-lg shadow-cyan-500/20 scale-105' 
                        : 'border-gray-800 hover:border-gray-700'
                  } ${(plan as any).popular && !(plan as any).locked ? 'md:-mt-4 md:mb-[-16px]' : ''}`}
                >
                  {/* Locked Badge */}
                  {(plan as any).locked && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      COMING SOON
                    </div>
                  )}
                  
                  {plan.popular && !(plan as any).locked && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      POPULAR
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-3 ${
                        (plan as any).locked ? 'grayscale opacity-60' : ''
                      }`}>
                        {plan.id === 'pro' ? (
                          <Crown className="w-6 h-6 text-white" />
                        ) : plan.id === 'normal' ? (
                          <Star className="w-6 h-6 text-white" />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <h3 className={`text-xl font-bold ${plan.color} ${(plan as any).locked ? 'line-through opacity-60' : ''}`}>{plan.name}</h3>
                      <div className="mt-2">
                        <span className={`text-3xl font-bold text-white ${(plan as any).locked ? 'line-through opacity-60' : ''}`}>${plan.price}</span>
                        <span className="text-gray-400">/{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className={`flex items-start gap-2 text-sm ${
                          (plan as any).locked ? 'opacity-50' : ''
                        }`}>
                          <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            currentPlan === plan.id ? 'text-cyan-400' : 'text-gray-500'
                          }`} />
                          <span className={currentPlan === plan.id ? 'text-gray-200' : 'text-gray-400'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {(plan as any).locked ? (
                      <div className="w-full">
                        <Button
                          variant="locked"
                          disabled={true}
                          className="w-full"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Coming Soon with Subscription
                        </Button>
                        <p className="text-xs text-center text-yellow-400 mt-2 flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          Subscription feature coming soon!
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleSubscriptionChange(plan.id)}
                        disabled={currentPlan === plan.id || isLoading}
                        className={`w-full ${
                          currentPlan === plan.id
                            ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                            : `bg-gradient-to-r ${plan.gradient} hover:shadow-lg hover:opacity-90`
                        } transition-all`}
                      >
                        {currentPlan === plan.id ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Current Plan
                          </>
                        ) : plan.price === 0 ? (
                          'Downgrade to Free'
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Upgrade to {plan.name}
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div 
            className="settings-tab-scroll"
            style={{
              height: 'calc(100vh - 300px)',
              overflowY: 'scroll',
              overflowX: 'hidden',
              paddingRight: '8px'
            }}
          >
            <div className="space-y-5 pb-8">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  Account Settings
                </h3>

                <div className="space-y-4">
                  {/* Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Notifications</p>
                      <p className="text-sm text-gray-400">Receive updates about your account</p>
                    </div>
                    <div className="w-12 h-6 bg-cyan-500 rounded-full relative cursor-pointer">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                    </div>
                  </div>

                  {/* Data Export */}
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Export Data</p>
                      <p className="text-sm text-gray-400">Download all your chat history and data</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      {isExporting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {isExporting ? 'Exporting...' : 'Export'}
                    </Button>
                  </div>

                  {/* Data Import */}
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Import Data</p>
                      <p className="text-sm text-gray-400">Restore data from backup file</p>
                    </div>
                    <div className="relative">
                      <input
                        ref={importInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImportData}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => importInputRef.current?.click()}
                        disabled={isImporting}
                        className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                      >
                        {isImporting ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {isImporting ? 'Importing...' : 'Import'}
                      </Button>
                    </div>
                  </div>

                  {/* Clear Cache */}
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Clear Cache</p>
                      <p className="text-sm text-gray-400">Clear local storage and cache</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Clear all cache? This will not delete your account.')) {
                          localStorage.clear()
                          window.location.reload()
                        }
                      }}
                      className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                    >
                      Clear
                    </Button>
                  </div>

                  {/* Email Verification */}
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium flex items-center gap-2">
                        Email Verification
                        {emailVerified && (
                          <ShieldCheck className="w-4 h-4 text-green-400" />
                        )}
                      </p>
                      <p className="text-sm text-gray-400">
                        {emailVerified ? 'Your email is verified' : 'Verify your email address'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendVerification}
                      disabled={isSendingVerification || emailVerified}
                      className={emailVerified ? "border-green-500/30 text-green-400" : "border-blue-500/30 text-blue-400 hover:bg-blue-500/10"}
                    >
                      {emailVerified ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </>
                      ) : isSendingVerification ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Verify
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Password Reset */}
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Password</p>
                      <p className="text-sm text-gray-400">Reset your password via email</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Open password reset modal or navigate
                        const shouldReset = confirm('Send password reset link to ' + email + '?')
                        if (shouldReset) {
                          fetch('/api/auth/forgot-password', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email })
                          })
                          .then(res => res.json())
                          .then(data => {
                            alert(data.message + (data.resetUrl ? '\n\nDev URL: ' + data.resetUrl : ''))
                          })
                          .catch(() => alert('Failed to send reset email'))
                        }
                      }}
                      className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                    >
                      <Key className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  </div>

                  {/* Admin Dashboard - Only show for admins */}
                  {isAdmin && (
                    <div className="flex items-center justify-between p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                      <div>
                        <p className="text-purple-400 font-medium flex items-center gap-2">
                          <Database className="w-4 h-4" />
                          Admin Dashboard
                        </p>
                        <p className="text-sm text-gray-400">Manage users, view stats & revenue</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/admin')}
                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Open
                      </Button>
                    </div>
                  )}

                  {/* Delete Account */}
                  <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <div>
                      <p className="text-red-400 font-medium">Delete Account</p>
                      <p className="text-sm text-gray-400">Permanently delete your account and data</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure? This action cannot be undone!')) {
                          localStorage.clear()
                          onLogout?.()
                        }
                      }}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}

// Missing icon import
function BarChart3(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3v18h18"/>
      <path d="m19 9-5 5-4-4-3 3"/>
    </svg>
  )
}
