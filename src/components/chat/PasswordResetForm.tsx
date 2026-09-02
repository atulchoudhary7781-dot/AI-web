'use client'

import { useState } from 'react'
import { Lock, Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface PasswordResetFormProps {
  onBackToLogin?: () => void
}

export default function PasswordResetForm({ onBackToLogin }: PasswordResetFormProps) {
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Step 1: Request password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        
        // In development, show the reset link
        if (data.resetUrl) {
          console.log('Reset URL:', data.resetUrl)
          setToken(data.token)
          setStep('reset')
        } else {
          // In production, just show success message
          setTimeout(() => setStep('reset'), 2000)
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send reset email' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Reset password with token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      setLoading(false)
      return
    }

    // Validate password strength
    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' })
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      })

      const data = await response.json()

      if (response.ok) {
        setStep('success')
        setMessage({ type: 'success', text: data.message })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to reset password' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-[#12121a] border-white/10 shadow-2xl">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center mb-4">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl text-white">
          {step === 'request' && 'Forgot Password'}
          {step === 'reset' && 'Reset Password'}
          {step === 'success' && 'Password Reset!'}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {step === 'request' && "Enter your email to receive a reset link"}
          {step === 'reset' && "Enter your new password"}
          {step === 'success' && "Your password has been updated successfully"}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Success State */}
        {step === 'success' ? (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            
            {message && (
              <p className="text-green-400 text-sm">{message.text}</p>
            )}

            <Button
              onClick={onBackToLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Back to Login
            </Button>
          </div>
        ) : (
          <>
            {/* Message Display */}
            {message && (
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                message.type === 'success' 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            {/* Step 1: Request Reset Form */}
            {step === 'request' && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="w-full text-sm text-gray-400 hover:text-white flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </button>
              </form>
            )}

            {/* Step 2: Reset Password Form */}
            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Token field - auto-filled in dev, hidden in production */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Reset Token</label>
                  <Input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 font-mono text-xs"
                    placeholder="Enter token from email"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Password must:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li className={newPassword.length >= 8 ? 'text-green-400' : ''}>Be at least 8 characters</li>
                    <li className={newPassword === confirmPassword && newPassword.length > 0 ? 'text-green-400' : ''}>Match confirmation</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !token || !newPassword || !confirmPassword}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="w-full text-sm text-gray-400 hover:text-white flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Email Entry
                </button>
              </form>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
