'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Sparkles, User, Mail, Lock, Eye, EyeOff, 
  ArrowRight, LogIn, UserPlus, X, Rocket,
  CheckCircle, Zap, Camera, Crown, Star,
  Image as ImageIcon, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: (user: { name: string; email: string; avatar?: string }) => void
  onSignup: (user: { name: string; email: string; avatar?: string }) => void
  chatCount?: number
  maxChats?: number
  reason?: 'chat_limit' | 'file_attach' // Why modal is showing
}

interface PlanOption {
  id: 'free' | 'normal' | 'pro'
  name: string
  price: number
  features: string[]
  popular?: boolean
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['10 chats/day', 'Basic AI', '7-day history']
  },
  {
    id: 'normal',
    name: 'Normal',
    price: 10,
    popular: true,
    features: ['Unlimited chats', 'Advanced AI', '30-day history', 'File upload']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 20,
    features: ['Everything in Normal', 'GPT-4 & Claude', 'Image gen', 'Voice chat', 'API access']
  }
]

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLogin, 
  onSignup,
  chatCount = 0,
  maxChats = 6,
  reason = 'chat_limit'
}: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // New states for photo & subscription
  const [avatar, setAvatar] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<string>('free')
  const [showPlanSelection, setShowPlanSelection] = useState(false)
  const [isSyncingGmail, setIsSyncingGmail] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log('🔐 AuthModal - isOpen changed to:', isOpen)
    console.log('🔐 AuthModal - reason:', reason)
  }, [isOpen, reason])

  if (!isOpen) return null

  // Handle avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setAvatar(result)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  // Handle Gmail photo sync
  const handleGmailSync = async () => {
    setIsSyncingGmail(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const googleImageUrl = prompt('Enter your Google Profile Photo URL:', '')
      
      if (googleImageUrl) {
        setAvatar(googleImageUrl)
      }
    } catch (error) {
      console.error('Gmail sync error:', error)
    } finally {
      setIsSyncingGmail(false)
    }
  }

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatar('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!isLoginMode && !name.trim()) {
      setError('Name is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }

    // If signing up and no plan selected for paid plans, show plan selection
    if (!isLoginMode && showPlanSelection && selectedPlan === 'free') {
      // Free plan is valid, continue
    }

    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Save to localStorage for persistence
    const userData = isLoginMode 
      ? { name: email.split('@')[0], email }
      : { name, email, avatar: avatar || undefined }
    
    localStorage.setItem('nexus_user', JSON.stringify(userData))
    
    // Save subscription choice for new signups
    if (!isLoginMode) {
      const subData = {
        plan: selectedPlan,
        startDate: new Date().toISOString(),
        ...(selectedPlan !== 'free' && {
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          price: selectedPlan === 'normal' ? 10 : 20
        })
      }
      localStorage.setItem('nexus_subscription', JSON.stringify(subData))
      
      onSignup(userData)
    } else {
      onLogin(userData)
    }
    
    setIsLoading(false)
    onClose()

    // Reset form
    setName('')
    setEmail('')
    setPassword('')
    setAvatar('')
    setSelectedPlan('free')
    setShowPlanSelection(false)
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gradient-to-b from-gray-900 to-gray-950 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Limit Info */}
        <div className="bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-pink-500/20 border-b border-gray-800 p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            {reason === 'file_attach' ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            ) : (
              <Sparkles className="w-8 h-8 text-white" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron)]">
            {reason === 'file_attach' ? '🔒 Login Required!' : isLoginMode ? 'Welcome Back! 👋' : 'Join NEXUS AI 🚀'}
          </h2>
          
          {/* Progress Indicator - Only show for chat limit and login mode */}
          {reason === 'chat_limit' && isLoginMode && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex gap-1">
                {[...Array(maxChats)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i < Math.min(chatCount, maxChats) 
                        ? 'bg-gradient-to-r from-cyan-400 to-violet-400' 
                        : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">
                {chatCount}/{maxChats} chats used
              </span>
            </div>
          )}
          
          {/* File attach message */}
          {reason === 'file_attach' && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-orange-300 font-medium">File Attach Feature</span>
            </div>
          )}
          
          <p className="text-sm text-gray-400 mt-3">
            {reason === 'file_attach' 
              ? 'Login or create a free account to attach files!'
              : isLoginMode 
                ? 'Sign in to access your account and continue chatting'
                : 'Create your free account and start chatting with AI!'
            }
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex bg-gray-900/50 m-4 rounded-xl p-1 border border-gray-800">
          <button
            onClick={() => { setIsLoginMode(true); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              isLoginMode 
                ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4 inline mr-2" />
            Login
          </button>
          <button
            onClick={() => { setIsLoginMode(false); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              !isLoginMode 
                ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-4">
          {/* Avatar Upload - Only for Signup */}
          {!isLoginMode && (
            <div className="space-y-3">
              <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                Profile Photo (Optional)
              </label>
              
              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 p-1">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
                      {avatar ? (
                        <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-gray-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Upload Overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 w-20 h-20 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 text-xs"
                  >
                    <ImageIcon className="w-3 h-3 mr-1" />
                    Upload Photo
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGmailSync}
                    disabled={isSyncingGmail}
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                  >
                    {isSyncingGmail ? (
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <ImageIcon className="w-3 h-3 mr-1" />
                    )}
                    {isSyncingGmail ? 'Syncing...' : 'Use Google Photo'}
                  </Button>

                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Name Field - Only for Sign Up */}
          {!isLoginMode && (
            <div className="space-y-2">
              <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all duration-200"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all duration-200"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 4 characters"
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 pl-11 pr-11 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all duration-200"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Plan Selection - Only for Signup */}
          {!isLoginMode && (
            <div className="space-y-3">
              <label className="text-sm text-gray-400 font-medium flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                Choose Your Plan
              </label>
              
              <div className="grid grid-cols-3 gap-2">
                {PLAN_OPTIONS.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative p-3 rounded-xl border transition-all ${
                      selectedPlan === plan.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                    } ${plan.popular ? 'ring-2 ring-yellow-500/30' : ''}`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-2 right-2 text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-bold">
                        BEST
                      </span>
                    )}
                    
                    <div className="text-center">
                      <div className="text-lg mb-1">
                        {plan.id === 'pro' ? '👑' : plan.id === 'normal' ? '⭐' : '🆓'}
                      </div>
                      <div className={`font-semibold text-sm ${
                        selectedPlan === plan.id ? 'text-cyan-400' : 'text-white'
                      }`}>
                        {plan.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        ${plan.price}/mo
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Plan Features */}
              <div className="bg-gray-800/30 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-2">Selected plan includes:</p>
                <ul className="space-y-1">
                  {PLAN_OPTIONS.find(p => p.id === selectedPlan)?.features.map((feature, idx) => (
                    <li key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm flex items-center gap-2">
              <X className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 h-12 font-medium text-base"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <>
                {isLoginMode ? (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Login to Continue
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create {PLAN_OPTIONS.find(p => p.id === selectedPlan)?.name} Account
                    {selectedPlan !== 'free' && (
                      <span className="ml-auto text-xs opacity-75">
                        (${PLAN_OPTIONS.find(p => p.id === selectedPlan)?.price}/mo)
                      </span>
                    )}
                  </>
                )}
                <ArrowRight className="w-5 h-5 ml-auto" />
              </>
            )}
          </Button>
        </form>

        {/* Benefits Footer */}
        <div className="px-4 pb-6">
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
            <p className="text-xs font-semibold text-cyan-400 mb-2">✨ Why Join NEXUS AI?</p>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                Powerful AI models (GPT-4, Claude, Llama)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                Chat history saved securely
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                Access from any device
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                Free tier available forever!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
