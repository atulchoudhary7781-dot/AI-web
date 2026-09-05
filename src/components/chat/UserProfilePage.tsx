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
  Lock, Key, ShieldCheck, ExternalLink, Database, Heart
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

  // Helper Functions
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Load subscription data from localStorage
  const loadSubscriptionData = () => {
    try {
      const savedSubscription = localStorage.getItem('nexus_subscription')
      if (savedSubscription) {
        const subscription = JSON.parse(savedSubscription)
        setCurrentPlan(subscription.plan || 'free')
      }

      // Load chat count
      const savedChatCount = localStorage.getItem('nexus_chat_count_today')
      if (savedChatCount) {
        setChatCountToday(parseInt(savedChatCount, 10))
      }

      // Calculate reset time (midnight)
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      setChatResetTime(tomorrow.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }))
    } catch (e) {
      console.error('Error loading subscription data:', e)
    }
  }

  // Load chat count for today
  const loadChatCountForToday = () => {
    try {
      const savedDate = localStorage.getItem('nexus_chat_count_date')
      const today = new Date().toDateString()

      if (savedDate === today) {
        const count = localStorage.getItem('nexus_chat_count_today')
        setChatCountToday(count ? parseInt(count, 10) : 0)
      } else {
        // New day, reset count
        localStorage.setItem('nexus_chat_count_date', today)
        localStorage.setItem('nexus_chat_count_today', '0')
        setChatCountToday(0)
      }

      // Set max chats based on plan
      const savedPlan = localStorage.getItem('nexus_subscription')
      if (savedPlan) {
        const plan = JSON.parse(savedPlan)
        if (plan.plan === 'pro') setMaxChatsForPlan(Infinity)
        else if (plan.plan === 'normal') setMaxChatsForPlan(100)
        else setMaxChatsForPlan(10)
      }
    } catch (e) {
      console.error('Error loading chat count:', e)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsLoading(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatar(result)
        
        // Update user state and localStorage
        const updatedUser = { ...user, avatar: result }
        setUser(updatedUser)
        localStorage.setItem('nexus_user', JSON.stringify(updatedUser))
        
        setIsLoading(false)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatar('')
    const updatedUser = { ...user, avatar: undefined }
    setUser(updatedUser)
    localStorage.setItem('nexus_user', JSON.stringify(updatedUser))
  }

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    // Update user object
    const updatedUser = { ...user, name, avatar }
    setUser(updatedUser)
    
    // Save to localStorage
    localStorage.setItem('nexus_user', JSON.stringify(updatedUser))
    
    // Save profile data
    const profileData = { bio, phone, location, website }
    localStorage.setItem('nexus_profile', JSON.stringify(profileData))
    
    setIsLoading(false)
    setIsEditing(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setName(user.name || '')
    setAvatar(user.avatar || '')
    setIsEditing(false)
    
    // Reload original values
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
  }

  // Handle subscription upgrade
  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return // Free plan can't upgrade to itself
    setIsProcessingPayment(true)
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    
    // In real app, redirect to Stripe checkout
    alert(`Redirecting to Stripe checkout for ${planId.toUpperCase()} plan...`)
    
    setIsProcessingPayment(false)
  }

  // Export chat data
  const handleExportData = async () => {
    setIsExporting(true)
    
    try {
      // Gather all user data
      const userData = {
        user: localStorage.getItem('nexus_user'),
        profile: localStorage.getItem('nexus_profile'),
        subscription: localStorage.getItem('nexus_subscription'),
        chatHistory: localStorage.getItem('nexus_chat_history'),
        exportDate: new Date().toISOString()
      }
      
      // Create and download file
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
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
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
    
    setIsExporting(false)
  }

  // Import chat data
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setIsImporting(true)
    
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        // Validate data structure
        if (!data.user || !data.chatHistory) {
          throw new Error('Invalid file format')
        }
        
        // Import data
        if (data.user) localStorage.setItem('nexus_user', data.user)
        if (data.profile) localStorage.setItem('nexus_profile', data.profile)
        if (data.subscription) localStorage.setItem('nexus_subscription', data.subscription)
        if (data.chatHistory) localStorage.setItem('nexus_chat_history', data.chatHistory)
        
        // Reload page to reflect changes
        window.location.reload()
      } catch (error) {
        console.error('Import failed:', error)
        alert('Import failed. Please check the file format.')
      }
      
      setIsImporting(false)
    }
    
    reader.readAsText(file)
  }

  // Sync Gmail
  const handleSyncGmail = async () => {
    setIsSyncingGmail(true)
    
    // Simulate Gmail sync
    await new Promise((resolve) => setTimeout(resolve, 3000))
    
    setIsSyncingGmail(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // Send verification email
  const handleSendVerification = async () => {
    setIsSendingVerification(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    setIsSendingVerification(false)
    alert('Verification email sent! Please check your inbox.')
  }

  // Delete account
  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Clear all data
      localStorage.clear()
      
      // Logout and redirect
      if (onLogout) {
        onLogout()
      }
      router.push('/')
    }
  }

  // Clear chat history
  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      localStorage.removeItem('nexus_chat_history')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }

  // Calculate chat limit percentage
  const chatLimitPercentage = maxChatsForPlan === Infinity ? 100 : (chatCountToday / maxChatsForPlan) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-right duration-300">
          <div className="bg-green-500/20 border border-green-500/30 backdrop-blur-xl rounded-xl px-6 py-4 flex items-center gap-3 shadow-lg shadow-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">Action completed successfully!</span>
          </div>
        </div>
      )}

      {/* ===== HEADER NAVIGATION ===== */}
      <header className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Desktop: 3-column grid for centered title */}
          <div className="hidden md:grid md:grid-cols-3 items-center">
            {/* Left: Back button */}
            <div className="justify-self-start">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
            </div>
            
            {/* Center: Title */}
            <div className="justify-self-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                My Profile
              </h1>
            </div>
            
            {/* Right: Edit/Cancel button */}
            <div className="justify-self-end">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Mobile: Flex layout */}
          <div className="flex md:hidden items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent absolute left-1/2 transform -translate-x-1/2">
              My Profile
            </h1>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-20">
        
        {/* Chat Limit Banner (Free users only) */}
        {currentPlan === 'free' && (
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span className="text-sm text-cyan-300">
                  Daily Chat Limit: <strong>{chatCountToday}/{maxChatsForPlan}</strong> chats used
                </span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      chatLimitPercentage >= 90 ? 'bg-red-500' : chatLimitPercentage >= 70 ? 'bg-yellow-500' : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                    }`}
                    style={{ width: `${Math.min(chatLimitPercentage, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">Resets: {chatResetTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* ===== PROFILE CARD ===== */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                  {avatar ? (
                    <img src={avatar} alt={name || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl md:text-4xl font-bold text-cyan-400">{getInitials(name || 'U')}</span>
                  )}
                </div>
              </div>
              
              {isEditing && (
                <>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="absolute inset-0 w-24 h-24 md:w-32 md:h-32 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                </>
              )}
              
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-gray-900" />
              
              {isEditing && avatar && (
                <button 
                  onClick={handleRemoveAvatar} 
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left space-y-3">
              {isEditing ? (
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter your name" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                  />
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{email}</span>
                    {emailVerified && <CheckCircle className="w-4 h-4 text-green-400" />}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">{name || 'User'}</h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      currentPlan === 'pro' ? 'bg-yellow-500/20 text-yellow-400' :
                      currentPlan === 'normal' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {currentPlan.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{email}</span>
                    {emailVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <button 
                        onClick={handleSendVerification}
                        disabled={isSendingVerification}
                        className="text-xs text-cyan-400 hover:text-cyan-300 underline disabled:opacity-50"
                      >
                        {isSendingVerification ? 'Sending...' : 'Verify'}
                      </button>
                    )}
                  </div>

                  {bio && (
                    <p className="text-gray-300 text-sm mt-2 max-w-md mx-auto md:mx-0">{bio}</p>
                  )}

                  {/* Additional Info */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-500 pt-2">
                    {phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {phone}
                      </span>
                    )}
                    {location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {location}
                      </span>
                    )}
                    {website && (
                      <a href={website.startsWith('http') ? website : `https://${website}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                        <Globe className="w-3 h-3" />
                        Website
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined {formatDate(new Date().toISOString())}
                    </span>
                  </div>
                </div>
              )}

              {/* Editing: Additional Fields */}
              {isEditing && (
                <div className="space-y-3 pt-4 border-t border-gray-700">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-cyan-500 outline-none resize-none text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 234 567 890"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Website</label>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-cyan-500 outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="flex items-center gap-3 pt-4">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== TABS NAVIGATION ===== */}
        <div className="flex items-center gap-2 p-1 bg-gray-900/50 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'subscription'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Crown className="w-4 h-4" />
            Subscription
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* ===== TAB CONTENT ===== */}
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                <MessageSquare className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{chatCountToday}</div>
                <div className="text-xs text-gray-400">Chats Today</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{currentPlan === 'free' ? '10' : '∞'}</div>
                <div className="text-xs text-gray-400">Daily Limit</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                <Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{currentPlan.toUpperCase()}</div>
                <div className="text-xs text-gray-400">Current Plan</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-center">
                <ShieldCheck className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{emailVerified ? 'Yes' : 'No'}</div>
                <div className="text-xs text-gray-400">Verified</div>
              </div>
            </div>

            {/* Account Details */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                Account Details
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400 text-sm">Account Status</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400 text-sm">Member Since</span>
                  <span className="text-white text-sm">{formatDate(new Date().toISOString())}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400 text-sm">Plan Type</span>
                  <span className="text-white text-sm capitalize">{currentPlan}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400 text-sm">Email Verified</span>
                  <span className={`text-sm ${emailVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                    {emailVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Quick Actions
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('subscription')}
                  className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-left group"
                >
                  <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-all">
                    <Crown className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Upgrade Plan</div>
                    <div className="text-xs text-gray-400">Unlock more features</div>
                  </div>
                </button>

                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-left group disabled:opacity-50"
                >
                  <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg group-hover:from-green-500/30 group-hover:to-emerald-500/30 transition-all">
                    <Download className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Export Data</div>
                    <div className="text-xs text-gray-400">Download your chat history</div>
                  </div>
                </button>

                <button
                  onClick={() => importInputRef.current?.click()}
                  disabled={isImporting}
                  className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-left group disabled:opacity-50"
                >
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg group-hover:from-blue-500/30 group-hover:to-indigo-500/30 transition-all">
                    <Upload className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Import Data</div>
                    <div className="text-xs text-gray-400">Restore from backup</div>
                  </div>
                </button>
                <input ref={importInputRef} type="file" accept=".json" onChange={handleImportData} className="hidden" />

                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors text-left group"
                >
                  <div className="p-2 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg group-hover:from-red-500/30 group-hover:to-orange-500/30 transition-all">
                    <RefreshCw className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Clear History</div>
                    <div className="text-xs text-gray-400">Delete all chat data</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBSCRIPTION TAB */}
        {activeTab === 'subscription' && (
          <div className="space-y-6 animate-fade-in">
            {/* Current Plan Status */}
            <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border border-cyan-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Current Plan</h3>
                <Badge className={
                  currentPlan === 'pro' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  currentPlan === 'normal' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
                  'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }>
                  {currentPlan.toUpperCase()}
                </Badge>
              </div>
              
              {currentPlan === 'free' && (
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm">
                    You're currently on the Free plan. Upgrade to unlock unlimited chats and premium features!
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>{chatCountToday} of {maxChatsForPlan} chats used today</span>
                  </div>
                </div>
              )}
              
              {(currentPlan === 'normal' || currentPlan === 'pro') && (
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm">
                    Enjoy your {currentPlan.toUpperCase()} benefits! Unlimited access to premium features.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Unlimited chats & premium features</span>
                  </div>
                </div>
              )}
            </div>

            {/* Available Plans */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Available Plans</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-gray-900/50 border rounded-xl p-6 transition-all ${
                      plan.popular
                        ? 'border-cyan-500/50 ring-2 ring-cyan-500/20'
                        : currentPlan === plan.id
                        ? 'border-green-500/50'
                        : 'border-gray-800 hover:border-gray-700'
                    } ${plan.locked ? 'opacity-75' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white border-0">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    {currentPlan === plan.id && (
                      <div className="absolute -top-3 right-4">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Current
                        </Badge>
                      </div>
                    )}

                    <div className="text-center mb-4">
                      <div className={`text-2xl font-bold ${plan.color}`}>{plan.name}</div>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-white">${plan.price}</span>
                        <span className="text-gray-400 text-sm">/{plan.period}</span>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.locked ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-gray-800 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Lock className="w-4 h-4" />
                        {plan.lockMessage}
                      </button>
                    ) : currentPlan === plan.id ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isProcessingPayment}
                        className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                      >
                        {isProcessingPayment ? (
                          <span className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          `Upgrade to ${plan.name}`
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Info */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-cyan-400" />
                Billing Information
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Next Payment</span>
                  <span className="text-white">
                    {currentPlan === 'free' ? 'N/A' : 'Monthly'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Payment Method</span>
                  <span className="text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    {currentPlan === 'free' ? 'Not configured' : '•••• 4242'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-400">Invoice History</span>
                  <button className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                    View <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            {/* Security Section */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                Security
              </h3>
              
              <div className="space-y-3">
                {/* Change Password */}
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div>
                    <div className="text-sm font-medium text-white">Password</div>
                    <div className="text-xs text-gray-400">Last changed 30 days ago</div>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    <Key className="w-4 h-4 mr-2" />
                    Change
                  </Button>
                </div>

                {/* Two-Factor Auth */}
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div>
                    <div className="text-sm font-medium text-white">Two-Factor Authentication</div>
                    <div className="text-xs text-gray-400">Add an extra layer of security</div>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    Enable
                  </Button>
                </div>

                {/* Active Sessions */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium text-white">Active Sessions</div>
                    <div className="text-xs text-gray-400">2 devices currently active</div>
                  </div>
                  <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                    Manage
                  </Button>
                </div>
              </div>
            </div>

            {/* Integrations Section */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Integrations
              </h3>
              
              <div className="space-y-3">
                {/* Gmail Sync */}
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-sm font-medium text-white">Gmail Integration</div>
                      <div className="text-xs text-gray-400">Sync emails for context-aware responses</div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSyncGmail}
                    disabled={isSyncingGmail}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    {isSyncingGmail ? (
                      <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Syncing...</>
                    ) : (
                      <>Connect</>
                    )}
                  </Button>
                </div>

                {/* Calendar */}
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-sm font-medium text-white">Google Calendar</div>
                      <div className="text-xs text-gray-400">Schedule meetings and reminders</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    Connect
                  </Button>
                </div>

                {/* Storage */}
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-sm font-medium text-white">Cloud Storage</div>
                      <div className="text-xs text-gray-400">Backup files to Google Drive/Dropbox</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    Connect
                  </Button>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-yellow-400" />
                Preferences
              </h3>
              
              <div className="space-y-4">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-white">Theme</div>
                    <div className="text-xs text-gray-400">Customize appearance</div>
                  </div>
                  <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none">
                    <option>Cyberpunk Dark</option>
                    <option>Light Mode</option>
                    <option>System Default</option>
                  </select>
                </div>

                {/* Language */}
                <div className="flex items-center justify-between py-2 border-t border-gray-800">
                  <div>
                    <div className="text-sm font-medium text-white">Language</div>
                    <div className="text-xs text-gray-400">Interface language</div>
                  </div>
                  <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between py-2 border-t border-gray-800">
                  <div>
                    <div className="text-sm font-medium text-white">Notifications</div>
                    <div className="text-xs text-gray-400">Email and push notifications</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:ring-2 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Danger Zone
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-white">Logout</div>
                    <div className="text-xs text-gray-400">Sign out of your account</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLogout}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-red-500/20">
                  <div>
                    <div className="text-sm font-medium text-red-400">Delete Account</div>
                    <div className="text-xs text-gray-400">Permanently delete your account and data</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteAccount}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-950/80 border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Nexus AI
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Your intelligent AI assistant for productivity, creativity, and more.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">Home</a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">Contact Support</a>
                </li>
              </ul>
            </div>

            {/* Account Status */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white">Account Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  System Online
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-green-400" />
                  Connection Secure
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Version 2.0.0 • Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Nexus AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                Made with <Heart className="w-4 h-4 text-red-400" /> for you
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
