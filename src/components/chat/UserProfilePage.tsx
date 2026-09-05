'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Mail, Camera, Save, X, CheckCircle,
  MapPin, Phone, Globe, Edit3, Sparkles,
  Calendar, MessageSquare, Settings, LogOut,
  ChevronLeft, Shield, Award, Zap, Upload,
  Download, Crown, Star, Clock, RefreshCw,
  CreditCard, Check, AlertCircle,
  Lock, Key, ShieldCheck, ExternalLink, Database, Heart
} from 'lucide-react'

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
    lockMessage: 'Coming Soon'
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
    gradient: 'from-cyan-500 to-purple-600',
    locked: true,
    lockMessage: 'Coming Soon'
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
  const [chatResetTime, setChatResetTime] = useState<string>('12:00 AM')

  // States for various actions
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isSyncingGmail, setIsSyncingGmail] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)

  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)

  // Load data on mount
  useEffect(() => {
    // Load user data
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

    // Load profile data
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
    loadChatCountForToday()

    // Load verification status
    const savedVerified = localStorage.getItem('nexus_email_verified')
    setEmailVerified(savedVerified === 'true')

    // Check URL params
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'true') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Helper functions
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const loadSubscriptionData = () => {
    try {
      const savedSubscription = localStorage.getItem('nexus_subscription')
      if (savedSubscription) {
        const subscription = JSON.parse(savedSubscription)
        setCurrentPlan(subscription.plan || 'free')
      }
      
      const savedChatCount = localStorage.getItem('nexus_chat_count_today')
      if (savedChatCount) {
        setChatCountToday(parseInt(savedChatCount, 10))
      }
    } catch (e) {
      console.error('Error loading subscription data:', e)
    }
  }

  const loadChatCountForToday = () => {
    try {
      const savedDate = localStorage.getItem('nexus_chat_count_date')
      const today = new Date().toDateString()

      if (savedDate === today) {
        const count = localStorage.getItem('nexus_chat_count_today')
        setChatCountToday(count ? parseInt(count, 10) : 0)
      } else {
        localStorage.setItem('nexus_chat_count_date', today)
        localStorage.setItem('nexus_chat_count_today', '0')
        setChatCountToday(0)
      }
    } catch (e) {
      console.error('Error loading chat count:', e)
    }
  }

  // Avatar upload handler
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsLoading(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatar(result)
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

  const handleRemoveAvatar = () => {
    setAvatar('')
    const updatedUser = { ...user, avatar: undefined }
    setUser(updatedUser)
    localStorage.setItem('nexus_user', JSON.stringify(updatedUser))
  }

  // Save profile
  const handleSaveProfile = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const updatedUser = { ...user, name, avatar }
    setUser(updatedUser)
    localStorage.setItem('nexus_user', JSON.stringify(updatedUser))
    
    const profileData = { bio, phone, location, website }
    localStorage.setItem('nexus_profile', JSON.stringify(profileData))
    
    setIsLoading(false)
    setIsEditing(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleCancelEdit = () => {
    setName(user.name || '')
    setAvatar(user.avatar || '')
    setIsEditing(false)
    
    const savedProfile = localStorage.getItem('nexus_profile')
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        setBio(profile.bio || '')
        setPhone(profile.phone || '')
        setLocation(profile.location || '')
        setWebsite(profile.website || '')
      } catch (e) {}
    }
  }

  // Upgrade plan
  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return
    setIsProcessingPayment(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert(`Redirecting to checkout for ${planId.toUpperCase()} plan...`)
    setIsProcessingPayment(false)
  }

  // Export data
  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const userData = {
        user: localStorage.getItem('nexus_user'),
        profile: localStorage.getItem('nexus_profile'),
        chatHistory: localStorage.getItem('nexus_chat_history'),
        exportDate: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nexus-export-${new Date().toISOString().split('T')[0]}.json`
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

  // Import data
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setIsImporting(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (!data.user) throw new Error('Invalid format')
        
        if (data.user) localStorage.setItem('nexus_user', data.user)
        if (data.profile) localStorage.setItem('nexus_profile', data.profile)
        if (data.chatHistory) localStorage.setItem('nexus_chat_history', data.chatHistory)
        
        window.location.reload()
      } catch (error) {
        console.error('Import failed:', error)
        alert('Import failed. Please check the file format.')
      }
      setIsImporting(false)
    }
    reader.readAsText(file)
  }

  // Gmail sync
  const handleSyncGmail = async () => {
    setIsSyncingGmail(true)
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsSyncingGmail(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // Send verification email
  const handleSendVerification = async () => {
    setIsSendingVerification(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSendingVerification(false)
    alert('Verification email sent! Please check your inbox.')
  }

  // Delete account
  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      localStorage.clear()
      if (onLogout) onLogout()
      router.push('/')
    }
  }

  // Clear history
  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      localStorage.removeItem('nexus_chat_history')
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }

  const chatLimitPercentage = maxChatsForPlan === Infinity ? 100 : (chatCountToday / maxChatsForPlan) * 100

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #030712, #111827, #000000)',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Success Toast */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          background: 'rgba(34, 197, 94, 0.2)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 32px rgba(34, 197, 94, 0.2)'
        }}>
          <CheckCircle size={20} className="text-green-400" />
          <span style={{ color: '#86efac', fontWeight: 500 }}>Action completed successfully!</span>
        </div>
      )}

      {/* ===== HEADER ===== */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(3, 7, 18, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(55, 65, 81, 0.5)',
        padding: '16px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Back Button */}
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#9ca3af',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(75, 85, 99, 0.3)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'transparent' }}
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>

          {/* Title - Centered */}
          <h1 style={{
            fontSize: '20px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #22d3ee, #a855f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            position: window.innerWidth > 768 ? 'relative' : 'absolute',
            left: window.innerWidth > 768 ? 'auto' : '50%',
            transform: window.innerWidth > 768 ? 'none' : 'translateX(-50%)'
          }}>
            My Profile
          </h1>

          {/* Edit/Cancel Button */}
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #06b6d4, #9333ea)',
                border: 'none',
                borderRadius: '8px',
                color: '#000000',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              <Edit3 size={16} />
              <span>Edit</span>
            </button>
          ) : (
            <button
              onClick={handleCancelEdit}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #4b5563',
                borderRadius: '8px',
                color: '#d1d5db',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(75, 85, 99, 0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Cancel
            </button>
          )}
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '24px 16px',
        paddingBottom: '80px'
      }}>
        
        {/* Chat Limit Banner */}
        {currentPlan === 'free' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(168, 85, 247, 0.1))',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: window.innerWidth > 640 ? 'row' : 'column',
              alignItems: window.innerWidth > 640 ? 'center' : 'flex-start',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} className="text-cyan-400" style={{ animation: 'pulse 2s infinite' }} />
                <span style={{ color: '#67e8f9', fontSize: '14px' }}>
                  Daily Chat Limit: <strong>{chatCountToday}/{maxChatsForPlan}</strong> chats used
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                width: window.innerWidth > 640 ? 'auto' : '100%'
              }}>
                <div style={{ 
                  flex: 1,
                  height: '8px',
                  background: '#1f2937',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  width: window.innerWidth > 640 ? '128px' : '100%'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(chatLimitPercentage, 100)}%`,
                    background: chatLimitPercentage >= 90 ? '#ef4444' : chatLimitPercentage >= 70 ? '#eab308' : 'linear-gradient(90deg, #06b6d4, #a855f7)',
                    transition: 'width 0.3s ease',
                    borderRadius: '4px'
                  }} />
                </div>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Resets: {chatResetTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* ===== PROFILE CARD ===== */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.6)',
          border: '1px solid rgba(55, 65, 81, 0.5)',
          borderRadius: '16px',
          padding: window.innerWidth > 768 ? '32px' : '24px',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth > 768 ? 'row' : 'column',
            alignItems: window.innerWidth > 768 ? 'flex-start' : 'center',
            gap: '24px',
            textAlign: window.innerWidth > 768 ? 'left' : 'center'
          }}>
            
            {/* Avatar Section */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                width: window.innerWidth > 768 ? '128px' : '96px',
                height: window.innerWidth > 768 ? '128px' : '96px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #06b6d4, #9333ea)',
                padding: '3px'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {avatar ? (
                    <img src={avatar} alt={name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: window.innerWidth > 736 ? '32px' : '24px', fontWeight: 700, color: '#22d3ee' }}>
                      {getInitials(name || 'U')}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Online Status */}
              <span style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '16px',
                height: '16px',
                backgroundColor: '#22c55e',
                borderRadius: '50%',
                border: '3px solid #111827'
              }} />

              {/* Edit Avatar Overlay */}
              {isEditing && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: window.innerWidth > 768 ? '128px' : '96px',
                      height: window.innerWidth > 768 ? '128px' : '96px',
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.6)',
                      opacity: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'opacity 0.2s',
                      border: 'none',
                      padding: 0
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                  >
                    <Camera size={28} color="white" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                </>
              )}

              {/* Remove Avatar Button */}
              {isEditing && avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    width: '28px',
                    height: '28px',
                    background: '#ef4444',
                    borderRadius: '50%',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <X size={14} color="white" />
                </button>
              )}
            </div>

            {/* User Info */}
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    style={{
                      width: '100%',
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      color: '#ffffff',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#06b6d4'; e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.2)' }}
                    onBlur={(e) => { e.target.style.borderColor = '#374151'; e.target.style.boxShadow = 'none' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '14px' }}>
                    <Mail size={16} />
                    <span>{email}</span>
                    {emailVerified && <CheckCircle size={16} className="text-green-400" />}
                  </div>
                  
                  {/* Additional Fields in Edit Mode */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: window.innerWidth > 640 ? 'repeat(3, 1fr)' : '1fr',
                    gap: '12px',
                    paddingTop: '16px',
                    borderTop: '1px solid #374151'
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={2}
                        style={{
                          width: '100%',
                          background: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#ffffff',
                          fontSize: '14px',
                          resize: 'none',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 234 567 890"
                        style={{
                          width: '100%',
                          background: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#ffffff',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country"
                        style={{
                          width: '100%',
                          background: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#ffffff',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #06b6d4, #9333ea)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#000000',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.7 : 1,
                      alignSelf: 'flex-start'
                    }}
                  >
                    {isLoading ? (
                      <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                    ) : (
                      <><Save size={16} /> Save Changes</>
                    )}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Name & Badge */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: window.innerWidth > 768 ? 'flex-start' : 'center',
                    gap: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <h2 style={{ margin: 0, fontSize: window.innerWidth > 768 ? '28px' : '24px', fontWeight: 700, color: '#ffffff' }}>
                      {name || 'User'}
                    </h2>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: currentPlan === 'pro' ? 'rgba(234, 179, 8, 0.2)' : currentPlan === 'normal' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                      color: currentPlan === 'pro' ? '#fbbf24' : currentPlan === 'normal' ? '#22d3ee' : '#9ca3af'
                    }}>
                      {currentPlan.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Email */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: window.innerWidth > 768 ? 'flex-start' : 'center',
                    gap: '8px', 
                    color: '#9ca3af', 
                    fontSize: '14px' 
                  }}>
                    <Mail size={16} />
                    <span>{email}</span>
                    {emailVerified ? (
                      <CheckCircle size={16} className="text-green-400" />
                    ) : (
                      <button
                        onClick={handleSendVerification}
                        disabled={isSendingVerification}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#22d3ee',
                          cursor: isSendingVerification ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          textDecoration: 'underline',
                          padding: 0
                        }}
                      >
                        {isSendingVerification ? 'Sending...' : 'Verify'}
                      </button>
                    )}
                  </div>

                  {/* Bio */}
                  {bio && (
                    <p style={{ margin: '8px 0 0', color: '#d1d5db', fontSize: '14px', maxWidth: '400px' }}>
                      {bio}
                    </p>
                  )}

                  {/* Additional Info */}
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    alignItems: 'center', 
                    justifyContent: window.innerWidth > 768 ? 'flex-start' : 'center',
                    gap: '16px', 
                    fontSize: '12px', 
                    color: '#6b7280',
                    marginTop: '8px'
                  }}>
                    {phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} /> {phone}
                      </span>
                    )}
                    {location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {location}
                      </span>
                    )}
                    {website && (
                      <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer"
                         style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', textDecoration: 'none' }}
                         onMouseEnter={(e) => e.currentTarget.style.color = '#22d3ee'}
                         onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}>
                        <Globe size={12} /> Website
                      </a>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> Joined {formatDate(new Date().toISOString())}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== TABS NAVIGATION ===== */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '4px',
          background: 'rgba(17, 24, 39, 0.6)',
          border: '1px solid rgba(55, 65, 81, 0.5)',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          {[
            { id: 'profile' as const, label: 'Profile', icon: User },
            { id: 'subscription' as const, label: 'Subscription', icon: Crown },
            { id: 'settings' as const, label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2))' : 'transparent',
                border: activeTab === tab.id ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                borderRadius: '8px',
                color: activeTab === tab.id ? '#22d3ee' : '#9ca3af',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = 'rgba(55, 65, 81, 0.3)' }}
              onMouseLeave={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent' }}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ===== TAB CONTENT ===== */}

        {/* PROFILE TAB CONTENT */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth > 640 ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              {[
                { icon: MessageSquare, value: chatCountToday.toString(), label: 'Chats Today', color: '#22d3ee' },
                { icon: Calendar, value: currentPlan === 'free' ? '10' : '∞', label: 'Daily Limit', color: '#a855f7' },
                { icon: Award, value: currentPlan.toUpperCase(), label: 'Current Plan', color: '#fbbf24' },
                { icon: ShieldCheck, value: emailVerified ? 'Yes' : 'No', label: 'Verified', color: '#22c55e' }
              ].map((stat, idx) => (
                <div key={idx} style={{
                  background: 'rgba(17, 24, 39, 0.6)',
                  border: '1px solid rgba(55, 65, 81, 0.5)',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center'
                }}>
                  <stat.icon size={24} style={{ color: stat.color, margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>{stat.value}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Account Details */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(55, 65, 81, 0.5)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={20} style={{ color: '#22d3ee' }} />
                Account Details
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Account Status', value: 'Active', badge: true },
                  { label: 'Member Since', value: formatDate(new Date().toISOString()), badge: false },
                  { label: 'Plan Type', value: currentPlan, badge: false },
                  { label: 'Email Verified', value: emailVerified ? 'Verified' : 'Pending', badge: false, highlight: !emailVerified }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: idx < 3 ? '1px solid rgba(55, 65, 81, 0.3)' : 'none'
                  }}>
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>{item.label}</span>
                    {item.badge ? (
                      <span style={{
                        padding: '4px 12px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#4ade80',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {item.value}
                      </span>
                    ) : (
                      <span style={{ color: item.highlight ? '#fbbf24' : '#ffffff', fontSize: '14px' }}>{item.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(55, 65, 81, 0.5)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} style={{ color: '#a855f7' }} />
                Quick Actions
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth > 640 ? 'repeat(2, 1fr)' : '1fr',
                gap: '12px'
              }}>
                {[
                  { icon: Crown, title: 'Upgrade Plan', desc: 'Unlock more features', action: () => setActiveTab('subscription'), color: '#22d3ee' },
                  { icon: Download, title: 'Export Data', desc: 'Download your chat history', action: handleExportData, loading: isExporting, color: '#22c55e' },
                  { icon: Upload, title: 'Import Data', desc: 'Restore from backup', action: () => importInputRef.current?.click(), loading: isImporting, color: '#3b82f6' },
                  { icon: RefreshCw, title: 'Clear History', desc: 'Delete all chat data', action: handleClearHistory, color: '#ef4444' }
                ].map((action, idx) => (
                  <button
                    key={idx}
                    onClick={action.action}
                    disabled={action.loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      background: 'rgba(31, 41, 55, 0.5)',
                      border: '1px solid rgba(55, 65, 81, 0.3)',
                      borderRadius: '8px',
                      cursor: action.loading ? 'not-allowed' : 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.2s',
                      opacity: action.loading ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => { if (!action.loading) e.currentTarget.style.background = 'rgba(55, 65, 81, 0.5)' }}
                    onMouseLeave={(e) => { if (!action.loading) e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)' }}
                  >
                    <div style={{
                      padding: '8px',
                      background: `${action.color}20`,
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <action.icon size={20} style={{ color: action.color }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff' }}>
                        {action.title}
                        {action.loading && <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite', marginLeft: '8px' }} />}
                      </div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <input ref={importInputRef} type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
            </div>
          </div>
        )}

        {/* SUBSCRIPTION TAB CONTENT */}
        {activeTab === 'subscription' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Current Plan Status */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>Current Plan</h3>
                <span style={{
                  padding: '4px 12px',
                  background: currentPlan === 'pro' ? 'rgba(251, 191, 36, 0.2)' : currentPlan === 'normal' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                  color: currentPlan === 'pro' ? '#fbbf24' : currentPlan === 'normal' ? '#22d3ee' : '#9ca3af',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {currentPlan.toUpperCase()}
                </span>
              </div>
              
              {currentPlan === 'free' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ margin: 0, color: '#d1d5db', fontSize: '14px' }}>
                    You're currently on the Free plan. Upgrade to unlock unlimited chats and premium features!
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#9ca3af' }}>
                    <Clock size={16} style={{ color: '#22d3ee' }} />
                    <span>{chatCountToday} of {maxChatsForPlan} chats used today</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ margin: 0, color: '#d1d5db', fontSize: '14px' }}>
                    Enjoy your {currentPlan.toUpperCase()} benefits! Unlimited access to premium features.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#22c55e' }}>
                    <CheckCircle size={16} />
                    <span>Unlimited chats & premium features</span>
                  </div>
                </div>
              )}
            </div>

            {/* Plans Grid */}
            <div>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, color: '#ffffff' }}>Available Plans</h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr',
                gap: '16px'
              }}>
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <div key={plan.id} style={{
                    position: 'relative',
                    background: 'rgba(17, 24, 39, 0.6)',
                    border: plan.popular ? '1px solid #22d3ee' : plan.locked ? '1px solid rgba(55, 65, 81, 0.5)' : currentPlan === plan.id ? '1px solid #22c55e' : '1px solid rgba(55, 65, 81, 0.5)',
                    borderRadius: '12px',
                    padding: '24px',
                    opacity: plan.locked ? 0.8 : 1
                  }}>
                    {plan.popular && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '4px 16px',
                        background: 'linear-gradient(135deg, #06b6d4, #9333ea)',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#000000'
                      }}>
                        Most Popular
                      </div>
                    )}

                    {currentPlan === plan.id && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        right: '-8px',
                        padding: '4px 12px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#4ade80'
                      }}>
                        Current
                      </div>
                    )}

                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700, color: plan.color === 'text-gray-400' ? '#9ca3af' : plan.color === 'text-cyan-400' ? '#22d3ee' : '#fbbf24' }}>
                        {plan.name}
                      </div>
                      <div style={{ marginTop: '12px' }}>
                        <span style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff' }}>${plan.price}</span>
                        <span style={{ color: '#9ca3af', fontSize: '14px' }}>/{plan.period}</span>
                      </div>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {plan.features.map((feature, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#d1d5db' }}>
                          <Check size={16} style={{ color: '#22c55e', flexShrink: 0, marginTop: '2px' }} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.locked ? (
                      <button
                        disabled
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#6b7280',
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <Lock size={16} />
                        {plan.lockMessage}
                      </button>
                    ) : currentPlan === plan.id ? (
                      <button
                        disabled
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: '8px',
                          color: '#4ade80',
                          fontSize: '14px',
                          fontWeight: 500,
                          cursor: 'not-allowed'
                        }}
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isProcessingPayment}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'linear-gradient(135deg, #06b6d4, #9333ea)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#000000',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: isProcessingPayment ? 'not-allowed' : 'pointer',
                          opacity: isProcessingPayment ? 0.7 : 1,
                          transition: 'opacity 0.2s'
                        }}
                      >
                        {isProcessingPayment ? (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
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
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(55, 65, 81, 0.5)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} style={{ color: '#22d3ee' }} />
                Billing Information
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Next Payment', value: currentPlan === 'free' ? 'N/A' : 'Monthly' },
                  { label: 'Payment Method', value: currentPlan === 'free' ? 'Not configured' : '•••• 4242', icon: CreditCard },
                  { label: 'Invoice History', value: 'View', link: true }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: idx < 2 ? '1px solid rgba(55, 65, 81, 0.3)' : 'none'
                  }}>
                    <span style={{ color: '#9ca3af', fontSize: '14px' }}>{item.label}</span>
                    {item.link ? (
                      <button style={{
                        background: 'none',
                        border: 'none',
                        color: '#22d3ee',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: 0
                      }}>
                        {item.value} <ExternalLink size={12} />
                      </button>
                    ) : (
                      <span style={{ color: '#ffffff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.icon && <item.icon size={14} />}
                        {item.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB CONTENT */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Security Section */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(55, 65, 81, 0.5)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} style={{ color: '#22d3ee' }} />
                Security
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { title: 'Password', desc: 'Last changed 30 days ago', btnText: 'Change', icon: Key, variant: 'default' },
                  { title: 'Two-Factor Authentication', desc: 'Add an extra layer of security', btnText: 'Enable', variant: 'default' },
                  { title: 'Active Sessions', desc: '2 devices currently active', btnText: 'Manage', variant: 'danger' }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: idx < 2 ? '1px solid rgba(55, 65, 81, 0.3)' : 'none',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff', marginBottom: '4px' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{item.desc}</div>
                    </div>
                    <button style={{
                      padding: '8px 16px',
                      background: item.variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(31, 41, 55, 0.5)',
                      border: item.variant === 'danger' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(55, 65, 81, 0.5)',
                      borderRadius: '8px',
                      color: item.variant === 'danger' ? '#ef4444' : '#d1d5db',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}>
                      {item.btnText}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Integrations Section */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(55, 65, 81, 0.5)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: '#a855f7' }} />
                Integrations
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { title: 'Gmail Integration', desc: 'Sync emails for context-aware responses', icon: Mail, color: '#ef4444', action: handleSyncGmail, loading: isSyncingGmail },
                  { title: 'Google Calendar', desc: 'Schedule meetings and reminders', icon: Calendar, color: '#3b82f6', action: null, loading: false },
                  { title: 'Cloud Storage', desc: 'Backup files to Google Drive/Dropbox', icon: Database, color: '#22c55e', action: null, loading: false }
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: idx < 2 ? '1px solid rgba(55, 65, 81, 0.3)' : 'none',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <item.icon size={20} style={{ color: item.color }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff' }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{item.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={item.action || undefined}
                      disabled={item.loading}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(31, 41, 55, 0.5)',
                        border: '1px solid rgba(55, 65, 81, 0.5)',
                        borderRadius: '8px',
                        color: '#d1d5db',
                        fontSize: '13px',
                        cursor: item.loading ? 'not-allowed' : 'pointer',
                        opacity: item.loading ? 0.6 : 1
                      }}
                    >
                      {item.loading ? (
                        <><RefreshCw size={12} style={{ animation: 'spin 1s linear infinite', marginRight: '4px' }} /> Syncing...</>
                      ) : (
                        'Connect'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences Section */}
            <div style={{
              background: 'rgba(17, 24, 39, 0.6)',
              border: '1px solid rgba(55, 65, 81, 0.5)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={20} style={{ color: '#fbbf24' }} />
                Preferences
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Theme', options: ['Cyberpunk Dark', 'Light Mode', 'System Default'] },
                  { label: 'Language', options: ['English', 'Hindi', 'Spanish', 'French'] }
                ].map((pref, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: idx < 1 ? '1px solid rgba(55, 65, 81, 0.3)' : 'none',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff' }}>{pref.label}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {idx === 0 ? 'Customize appearance' : 'Interface language'}
                      </div>
                    </div>
                    <select style={{
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffffff',
                      fontSize: '13px',
                      cursor: 'pointer',
                      outline: 'none'
                    }}>
                      {pref.options.map(opt => (
                        <option key={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}

                {/* Notifications Toggle */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(55, 65, 81, 0.3)'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff' }}>Notifications</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Email and push notifications</div>
                  </div>
                  <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{
                      position: 'absolute',
                      inset: 0,
                      background: '#374151',
                      borderRadius: '26px',
                      transition: 'background 0.3s'
                    }} />
                    <span style={{
                      position: 'absolute',
                      left: '3px',
                      bottom: '3px',
                      width: '20px',
                      height: '20px',
                      background: '#ffffff',
                      borderRadius: '50%',
                      transition: 'transform 0.3s'
                    }} />
                  </label>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} />
                Danger Zone
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#ffffff' }}>Logout</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Sign out of your account</div>
                  </div>
                  <button
                    onClick={onLogout}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(31, 41, 55, 0.5)',
                      border: '1px solid rgba(55, 65, 81, 0.5)',
                      borderRadius: '8px',
                      color: '#d1d5db',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(239, 68, 68, 0.2)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#ef4444' }}>Delete Account</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Permanently delete your account and data</div>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      color: '#ef4444',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===== FOOTER ===== */}
      <footer style={{
        background: 'rgba(3, 7, 18, 0.8)',
        borderTop: '1px solid rgba(55, 65, 81, 0.5)',
        marginTop: '48px',
        padding: '32px 16px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : '1fr',
          gap: '32px'
        }}>
          {/* Brand */}
          <div style={{ textAlign: window.innerWidth > 768 ? 'left' : 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: window.innerWidth > 768 ? 'flex-start' : 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: 'linear-gradient(135deg, #06b6d4, #9333ea)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={18} color="#ffffff" />
              </div>
              <span style={{ fontSize: '20px', fontWeight: 700, background: 'linear-gradient(135deg, #22d3ee, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Nexus AI
              </span>
            </div>
            <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6 }}>
              Your intelligent AI assistant for productivity, creativity, and more.
            </p>
          </div>

          {/* Quick Links */}
          <div style={{ textAlign: window.innerWidth > 768 ? 'left' : 'center' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Home', 'Privacy Policy', 'Terms of Service', 'Contact Support'].map(link => (
                <li key={link}>
                  <a href="#" style={{ color: '#9ca3af', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={(e) => e.currentTarget.style.color = '#22d3ee'}
                     onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Status */}
          <div style={{ textAlign: window.innerWidth > 768 ? 'left' : 'center' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Account Status</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: window.innerWidth > 768 ? 'flex-start' : 'center', gap: '8px', color: '#9ca3af' }}>
                <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                System Online
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: window.innerWidth > 768 ? 'flex-start' : 'center', gap: '8px', color: '#9ca3af' }}>
                <ShieldCheck size={14} style={{ color: '#22c55e' }} />
                Connection Secure
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                Version 2.0.0 • Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          maxWidth: '1200px',
          margin: '32px auto 0',
          paddingTop: '24px',
          borderTop: '1px solid rgba(55, 65, 81, 0.5)',
          display: 'flex',
          flexDirection: window.innerWidth > 768 ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
            © {new Date().getFullYear()} Nexus AI. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9ca3af', fontSize: '14px' }}>
            Made with <Heart size={14} style={{ color: '#ef4444' }} /> for you
          </div>
        </div>
      </footer>

      {/* Inline Styles for Animations */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
