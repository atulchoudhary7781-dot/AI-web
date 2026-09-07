'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Mail, Lock, Eye, EyeOff, Sparkles, 
  ArrowRight, Chrome, Github,
  Loader2, AlertCircle
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  
  // Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email.trim()) {
      setError('Email is required')
      return
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      // Save auth to localStorage
      localStorage.setItem('nexus_auth', JSON.stringify({
        isLoggedIn: true,
        user: { name: email.split('@')[0], email }
      }))
      
      router.push('/')
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  // Google OAuth Handler
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.setItem('nexus_auth', JSON.stringify({
        isLoggedIn: true,
        user: { name: 'Google User', email: 'user@gmail.com' }
      }))
      router.push('/')
    } catch (err) {
      setError('Google sign-in failed')
      setIsLoading(false)
    }
  }

  // GitHub OAuth Handler
  const handleGithubLogin = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.setItem('nexus_auth', JSON.stringify({
        isLoggedIn: true,
        user: { name: 'GitHub User', email: 'user@github.com' }
      }))
      router.push('/')
    } catch (err) {
      setError('GitHub sign-in failed')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#030712] relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-[150px]" />
        
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
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/[0.08] shadow-2xl shadow-black/50">
          
          {/* Logo */}
          <Link href="/" className="flex justify-center mb-8 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-cyan-500/25 group-hover:shadow-cyan-500/40 group-hover:scale-105 transition-all duration-300">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </Link>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-base">
              Sign in to continue your journey with NEXUS AI
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-2.5 h-12 px-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] rounded-xl text-white text-sm font-medium transition-all duration-200 disabled:opacity-50"
            >
              <Chrome className="w-5 h-5 text-gray-400" />
              Google
            </button>
            
            <button
              onClick={handleGithubLogin}
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

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            
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
                  autoFocus
                  className="input-dark pl-12"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 hover:from-cyan-400 hover:via-blue-400 hover:to-violet-500 text-white font-bold text-base rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Signup Link */}
          <p className="mt-8 text-center text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-bold text-transparent bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text hover:from-cyan-300 hover:to-violet-300 transition-all"
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Fast</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Free</span>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-4 text-center text-xs text-gray-600 leading-relaxed">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-gray-500 hover:text-gray-300 transition-colors">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
