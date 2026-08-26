'use client'

import { useState } from 'react'
import { 
  Sparkles, User, Mail, Lock, Eye, EyeOff, 
  ArrowRight, LogIn, UserPlus, Shield, Zap, 
  Brain, Rocket, CheckCircle, LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LoginViewProps {
  onLogin: (user: { name: string; email: string }) => void
  onLogout: () => void
  isLoggedIn: boolean
  user: { name: string; email: string } | null
}

export default function LoginView({ 
  onLogin, 
  onLogout, 
  isLoggedIn, 
  user 
}: LoginViewProps) {
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
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

    setIsLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const userData = isLoginMode 
      ? { name: email.split('@')[0], email }
      : { name, email }
    
    localStorage.setItem('nexus_user', JSON.stringify(userData))
    onLogin(userData)
    setIsLoading(false)
    
    setName('')
    setEmail('')
    setPassword('')
  }

  const handleGuestLogin = () => {
    const guestUser = {
      name: 'Guest User',
      email: `guest_${Date.now()}@nexus.ai`
    }
    localStorage.setItem('nexus_user', JSON.stringify(guestUser))
    onLogin(guestUser)
  }

  const handleLogout = () => {
    localStorage.removeItem('nexus_user')
    localStorage.removeItem('nexus_sessions')
    onLogout()
  }

  if (isLoggedIn && user) {
    return (
      <div className="h-full flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 rounded-2xl p-8 backdrop-blur-xl text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2 font-[family-name:var(--font-orbitron)]">
              Welcome Back!
            </h2>
            <p className="text-gray-400 mb-6">
              You are logged in as <span className="text-cyan-400 font-medium">{user.name}</span>
            </p>

            <div className="bg-black/30 rounded-xl p-4 mb-6 text-left border border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold">{user.name}</p>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 bg-cyan-500/5 rounded-lg p-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Chat history will be saved</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-lg shadow-cyan-500/25"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Start Chatting Now
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout and Clear History
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="min-h-full flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 shadow-lg shadow-cyan-500/25 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-orbitron)] mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400">
                NEXUS AI
              </span>
            </h1>
            <p className="text-gray-400">
              {isLoginMode ? 'Welcome back! Login to continue' : 'Create account to save your chat history'}
            </p>
          </div>

          <div className="flex bg-gray-900/50 rounded-xl p-1 mb-6 border border-gray-800">
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

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

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
                      Login to Account
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Account
                    </>
                  )}
                  <ArrowRight className="w-5 h-5 ml-auto" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-950 text-gray-500">OR</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGuestLogin}
            className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-600"
          >
            <Zap className="w-5 h-5 mr-2" />
            Continue as Guest
          </Button>

          <div className="mt-6 bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-400">
                <p className="font-medium text-cyan-400 mb-1">Why create an account?</p>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Chat history saved automatically
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Access from any device
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    Personalized AI experience
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
