'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Mail, Lock, Eye, EyeOff, User, Sparkles, 
  ArrowRight, Github, Chrome, Check,
  Loader2, AlertCircle, CheckCircle
} from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  
  // Form State
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Password Strength Checker
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '', textColor: '' }
    if (pwd.length < 6) return { score: 1, label: 'Too short', color: 'bg-red-500', textColor: 'text-red-400' }
    if (pwd.length < 8) return { score: 2, label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-400' }
    
    let score = 2
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score === 2) return { score, label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-400' }
    if (score === 3) return { score, label: 'Good', color: 'bg-cyan-500', textColor: 'text-cyan-400' }
    return { score: 4, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-400' }
  }

  const passwordStrength = getPasswordStrength(password)

  // Handle Signup Submit
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!name.trim()) { setError('Name is required'); return }
    if (!email.trim()) { setError('Email is required'); return }
    if (!email.includes('@')) { setError('Please enter a valid email address'); return }
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (!agreedToTerms) { setError('You must agree to the terms and conditions'); return }

    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      localStorage.setItem('nexus_auth', JSON.stringify({
        isLoggedIn: true,
        user: { name, email }
      }))
      
      router.push('/')
    } catch (err) {
      setError('Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  // Google OAuth Handler
  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.setItem('nexus_auth', JSON.stringify({
        isLoggedIn: true,
        user: { name: 'Google User', email: 'user@gmail.com' }
      }))
      router.push('/')
    } catch (err) {
      setError('Google sign-up failed')
      setIsLoading(false)
    }
  }

  // GitHub OAuth Handler
  const handleGithubSignup = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.setItem('nexus_auth', JSON.stringify({
        isLoggedIn: true,
        user: { name: 'GitHub User', email: 'user@github.com' }
      }))
      router.push('/')
    } catch (err) {
      setError('GitHub sign-up failed')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030712] relative overflow-y-auto overflow-x-hidden py-12">
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-[150px]" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md my-8">
        <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/[0.08] shadow-2xl shadow-black/50">
          
          {/* Logo */}
          <Link href="/" className="flex justify-center mb-8 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-600 flex items-center justify-center shadow-xl shadow-violet-500/25 group-hover:shadow-violet-500/40 group-hover:scale-105 transition-all duration-300">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </Link>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Create Account
            </h1>
            <p className="text-gray-400 text-base">
              Join NEXUS AI and experience the future of AI
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="flex items-center justify-center gap-2.5 h-12 px-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-white text-sm font-medium transition-all duration-200 disabled:opacity-50"
            >
              <Chrome className="w-5 h-5 text-gray-400" />
              Google
            </button>
            
            <button
              onClick={handleGithubSignup}
              disabled={isLoading}
              className="flex items-center justify-center gap-2.5 h-12 px-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-white text-sm font-medium transition-all duration-200 disabled:opacity-50"
            >
              <Github className="w-5 h-5 text-gray-400" />
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0f172a] px-4 text-xs text-gray-500 uppercase tracking-wider font-medium">
                or
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            
            {/* Name Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="input-dark pl-12"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="input-dark pl-12"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="input-dark pl-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2 mt-3 pl-1">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength.score ? passwordStrength.color : 'bg-white/[0.08]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength.textColor} font-medium`}>
                    Password strength: {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-dark pl-12 pr-12"
                />
                {confirmPassword && confirmPassword === password && (
                  <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                )}
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] mt-2">
              <button
                type="button"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  agreedToTerms 
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 border-transparent' 
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                {agreedToTerms && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className="text-xs text-gray-400 leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Privacy Policy</Link>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !agreedToTerms}
              className="w-full py-3.5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-600 hover:from-violet-400 hover:via-purple-400 hover:to-pink-500 text-white font-bold text-base rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <Sparkles className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-transparent bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text hover:from-violet-300 hover:to-pink-300 transition-all"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-violet-500/[0.08] to-transparent border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Why join NEXUS AI?</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {[
              { text: 'Chat history saved automatically', icon: '✓' },
              { text: 'Access from any device, anywhere', icon: '✓' },
              { text: 'Personalized AI experience', icon: '✓' },
              { text: 'Priority support & early features', icon: '✓' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold ${
                  i === 0 ? 'bg-green-500/20 text-green-400' :
                  i === 1 ? 'bg-cyan-500/20 text-cyan-400' :
                  i === 2 ? 'bg-purple-500/20 text-purple-400' :
                  'bg-pink-500/20 text-pink-400'
                }`}>
                  {item.icon}
                </span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
