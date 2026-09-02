'use client'

import React, { useState } from 'react'
import { Mail, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

interface EmailVerificationProps {
  email: string
  isVerified: boolean
  onVerify?: () => Promise<void>
  onResend?: () => Promise<void>
  className?: string
}

export function EmailVerification({
  email,
  isVerified,
  onVerify,
  onResend,
  className,
}: EmailVerificationProps) {
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleResend = async () => {
    if (!onResend) return
    
    setIsLoading(true)
    setStatus('sending')
    setErrorMessage('')
    
    try {
      await onResend()
      setStatus('sent')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send verification email')
    } finally {
      setIsLoading(false)
      
      // Reset status after 5 seconds
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <div className={cn(
      "rounded-xl p-4 transition-all duration-200",
      isVerified 
        ? "bg-green-500/10 border border-green-500/20" 
        : "bg-yellow-500/10 border border-yellow-500/20",
      className
    )}>
      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isVerified ? "bg-green-500/20" : "bg-yellow-500/20"
        )}>
          {isVerified ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <Mail className="w-5 h-5 text-yellow-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className={cn(
              "text-sm font-medium",
              isVerified ? "text-green-400" : "text-yellow-400"
            )}>
              {isVerified ? t('auth.verified') : t('auth.notVerified')}
            </p>
            
            {/* Verified badge */}
            {isVerified && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </span>
            )}
            
            {/* Not verified badge */}
            {!isVerified && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                <AlertCircle className="w-3 h-3 mr-1" />
                Pending
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            {isVerified 
              ? `Your email ${email} has been verified`
              : `We've sent a verification email to ${email}`
            }
          </p>

          {/* Actions */}
          {!isVerified && (
            <div className="flex items-center gap-2">
              <Button
                variant={status === 'sent' ? 'outline' : 'neon'}
                size="sm"
                onClick={handleResend}
                disabled={isLoading || status === 'sending'}
                className="h-8 text-xs"
              >
                {isLoading || status === 'sending' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    Sending...
                  </>
                ) : status === 'sent' ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Sent!
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    {t('auth.resendVerification')}
                  </>
                )}
              </Button>

              {onVerify && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onVerify}
                  className="h-8 text-xs"
                >
                  {t('auth.verifyEmail')}
                </Button>
              )}
            </div>
          )}

          {/* Error message */}
          {status === 'error' && errorMessage && (
            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {errorMessage}
            </p>
          )}

          {/* Success message */}
          {status === 'sent' && (
            <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {t('auth.verificationSent')} - Check your inbox
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// Standalone email verification form for settings page
export function EmailVerificationForm({ 
  currentEmail,
  isVerified,
}: { 
  currentEmail: string
  isVerified: boolean 
}) {
  const { t } = useI18n()
  
  const handleResend = async (): Promise<void> => {
    // Mock implementation - would call API in production
    console.log('Resending verification to:', currentEmail)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {t('auth.verifyEmail')}
        </h3>
        <p className="text-sm text-muted-foreground">
          Verify your email address to unlock all features and improve account security.
        </p>
      </div>

      <EmailVerification
        email={currentEmail}
        isVerified={isVerified}
        onResend={handleResend}
      />

      {/* Additional info */}
      {!isVerified && (
        <div className="rounded-lg bg-white/5 p-3 border border-white/10">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> If you don't receive the email within a few minutes, check your spam folder or{' '}
            <button 
              onClick={() => window.location.reload()} 
              className="text-neon-orange hover:underline"
            >
              try again
            </button>.
          </p>
        </div>
      )}
    </div>
  )
}

export default EmailVerification
