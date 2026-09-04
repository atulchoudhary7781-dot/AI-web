'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Mail, Lock, Eye, EyeOff, User, Sparkles, 
  ArrowRight, Github, Chrome, Check
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

export default function SignupPage() {
  const router = useRouter()
  const { t } = useSafeI18n()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Password strength checker
  const getPasswordStrength = (pwd: string) => {
    if (pwd.length < 6) return { score: 0, label: 'Too short', color: 'text-red-400' }
    if (pwd.length < 8) return { score: 1, label: 'Weak', color: 'text-yellow-400' }
    
    let score = 1
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score === 2) return { score, label: 'Fair', color: 'text-yellow-400' }
    if (score === 3) return { score, label: 'Good', color: 'text-neon-cyan' }
    return { score: 4, label: 'Strong', color: 'text-neon-purple' }
  }

  const passwordStrength = getPasswordStrength(password)

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call (replace with real auth)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // For demo, redirect to dashboard or email verification
      router.push('/dashboard?newAccount=true')
    } catch (err) {
      setError('Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google OAuth signup
  const handleGoogleSignup = () => {
    window.location.href = '/api/auth/signin?provider=google&callbackUrl=/dashboard'
  }

  // Handle GitHub OAuth signup
  const handleGithubSignup = () => {
    window.location.href = '/api/auth/signin?provider=github&callbackUrl=/dashboard'
  }

  return (
    <div className="signup-page-container min-h-screen bg-deep-black flex items-center justify-center p-4 relative overflow-hidden py-12 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-neon-purple/10 rounded-full blur-[128px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-6">
            <img
              src="/nexus-logo.png"
              alt="NEXUS AI"
              className="w-14 h-14 rounded-xl group-hover:scale-110 transition-transform"
            />
          </Link>
          
          <h1 className="text-3xl font-bold font-display gradient-text-nexus mb-2">
            Create Account
          </h1>
          <p className="text-muted-foreground">
            Join NEXUS AI and experience the future of AI
          </p>
        </div>

        {/* Signup Card */}
        <Card variant="glass" className="p-8">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium"
              onClick={handleGoogleSignup}
            >
              <Chrome className="w-5 h-5 mr-3" />
              Sign up with Google
            </Button>
            
            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium"
              onClick={handleGithubSignup}
            >
              <Github className="w-5 h-5 mr-3" />
              Sign up with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-surface text-muted-foreground">
                or sign up with email
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-11 h-12"
                />
              </div>
            </div>

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
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          level <= passwordStrength.score
                            ? passwordStrength.color.replace('text-', 'bg-')
                            : "bg-white/10"
                        )}
                      />
                    ))}
                  </div>
                  <span className={cn("text-xs", passwordStrength.color)}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-11 h-12"
                />
                {confirmPassword && confirmPassword === password && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                )}
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setAgreedToTerms(!agreedToTerms)}
                className={cn(
                  "mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                  agreedToTerms
                    ? "bg-neon-cyan border-neon-cyan"
                    : "border-white/20 hover:border-white/40"
                )}
              >
                {agreedToTerms && <Check className="w-3 h-3 text-deep-black" />}
              </button>
              <span className="text-sm text-muted-foreground">
                I agree to the{' '}
                <Link href="/terms" className="text-neon-cyan hover:underline">Terms of Service</Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-neon-cyan hover:underline">Privacy Policy</Link>
              </span>
            </div>

            <Button
              type="submit"
              variant="neon"
              className="w-full h-12 text-base font-medium"
              disabled={isLoading || !agreedToTerms}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <Sparkles className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('auth.hasAccount')}{' '}
            <Link
              href="/login"
              className="font-medium text-neon-cyan hover:underline"
            >
              Sign in
            </Link>
          </p>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="hover:text-neon-cyan">Sign in here</Link>.
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
