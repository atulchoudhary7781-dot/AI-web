'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Mail, Lock, Eye, EyeOff, Sparkles, 
  ArrowRight, Github, Chrome
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
// Safe i18n hook that handles SSR
function useSafeI18n() {
  try {
    const { useI18n } = require('@/lib/i18n')
    return useI18n()
  } catch {
    return {
      locale: 'en',
      setLocale: () => {},
      t: (key: string) => key,
      availableLocales: [],
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { t } = useSafeI18n()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Simulate API call (replace with real auth)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // For demo, redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    // Redirect to Google OAuth
    window.location.href = '/api/auth/signin?provider=google&callbackUrl=/dashboard'
  }

  // Handle GitHub OAuth login
  const handleGithubLogin = () => {
    // Redirect to GitHub OAuth
    window.location.href = '/api/auth/signin?provider=github&callbackUrl=/dashboard'
  }

  return (
    <div className="login-page-container min-h-screen bg-deep-black flex items-center justify-center p-4 relative overflow-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[128px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-6">
            <img
              src="/nexus-logo.png"
              alt="NEXUS AI"
              className="w-12 h-12 rounded-xl group-hover:scale-110 transition-transform"
            />
          </Link>
          
          <h1 className="text-3xl font-bold font-display gradient-text-nexus mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to continue to NEXUS AI
          </p>
        </div>

        {/* Login Card */}
        <Card variant="glass" className="p-8">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium"
              onClick={handleGoogleLogin}
            >
              <Chrome className="w-5 h-5 mr-3" />
              Continue with Google
            </Button>
            
            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium"
              onClick={handleGithubLogin}
            >
              <Github className="w-5 h-5 mr-3" />
              Continue with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-surface text-muted-foreground">
                or continue with email
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  {t('auth.password')}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-neon-cyan hover:underline"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-11 pr-11 h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="neon"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Signing in...
                </>
              ) : (
                <>
                  {t('auth.login')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.noAccount')}{' '}
            <Link
              href="/signup"
              className="font-medium text-neon-cyan hover:underline"
            >
              Create account
            </Link>
          </p>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to NEXUS AI's{' '}
          <Link href="/terms" className="hover:text-neon-cyan">Terms of Service</Link>{' '}
          and{' '}
          <Link href="/privacy" className="hover:text-neon-cyan">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.924 3 8.11l2.111-1.819z" />
    </svg>
  )
}
