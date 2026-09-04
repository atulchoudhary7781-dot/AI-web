'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  User, Mail, Shield, Bell, Palette, CreditCard,
  CheckCircle, Clock, Send, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme/Toggle'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
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

// Mock user data (will be replaced with real user context)
const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: null,
  plan: 'pro',
  emailVerified: false,
  joinedDate: '2024-01-15',
}

export default function SettingsPage() {
  // Using simple translations for now to avoid SSR issues
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'nav.settings': 'Settings',
      'common.save': 'Save',
      'nav.pricing': 'Pricing',
      'pricing.upgrade': 'Upgrade',
    }
    return translations[key] || key
  }
  const [userName, setUserName] = useState(mockUser.name)
  const [userEmail, setUserEmail] = useState(mockUser.email)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState('')

  // Handle profile save
  const handleSaveProfile = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setShowSuccessMessage('Profile updated successfully!')
    setIsSaving(false)
    setTimeout(() => setShowSuccessMessage(''), 3000)
  }

  // Handle send verification email
  const handleSendVerification = async () => {
    setIsSendingVerification(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setShowSuccessMessage('Verification email sent!')
    setIsSendingVerification(false)
    setTimeout(() => setShowSuccessMessage(''), 3000)
  }

  return (
    <div className="settings-page-container min-h-screen bg-deep-black p-4 md:p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display gradient-text-nexus mb-2">
            {t('nav.settings')}
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-2 animate-pulse">
            <CheckCircle className="w-5 h-5" />
            {showSuccessMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-neon-cyan" />
                <h2 className="text-lg font-semibold text-foreground">Profile</h2>
              </div>

              <div className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-2xl font-bold text-white">
                    {mockUser.name.charAt(0)}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    Email
                    {mockUser.emailVerified ? (
                      <span className="flex items-center gap-1 text-green-400 text-xs">
                        <CheckCircle className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-neon-cyan text-xs">
                        <Clock className="w-3.5 h-3.5" /> Not Verified
                      </span>
                    )}
                  </label>
                  <Input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="h-11"
                  />

                  {/* Email Verification - Feature H */}
                  {!mockUser.emailVerified && (
                    <div className="mt-2 p-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20">
                      <p className="text-sm text-neon-cyan mb-2">
                        Verify your email to unlock all features
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSendVerification}
                        disabled={isSendingVerification}
                        className="text-neon-cyan border-neon-cyan/30 hover:bg-neon-cyan/10"
                      >
                        {isSendingVerification ? (
                          <>
                            <LoadingSpinner />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Verification Email
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  variant="neon"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner />
                      Saving...
                    </>
                  ) : (
                    t('common.save')
                  )}
                </Button>
              </div>
            </Card>

            {/* Preferences Section */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Palette className="w-5 h-5 text-neon-purple" />
                <h2 className="text-lg font-semibold text-foreground">Preferences</h2>
              </div>

              <div className="space-y-6">
                {/* Theme Toggle - Feature E */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred appearance
                    </p>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="border-t border-white/10 pt-4" />

                {/* Language Switcher - Feature J */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Language</p>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred language
                    </p>
                  </div>
                  <LanguageSwitcher />
                </div>

                <div className="border-t border-white/10 pt-4" />

                {/* Notifications */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications
                    </p>
                  </div>
                  <ToggleSwitch defaultChecked />
                </div>
              </div>
            </Card>

            {/* Security Section */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-neon-cyan" />
                <h2 className="text-lg font-semibold text-foreground">Security</h2>
              </div>

              <div className="space-y-4">
                {/* Change Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Change Password</label>
                  <Input type="password" placeholder="••••••••" className="h-11" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">New Password</label>
                  <Input type="password" placeholder="••••••••" className="h-11" />
                </div>

                <Button variant="outline">Update Password</Button>

                {/* Two-Factor Auth */}
                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Button variant="neonOutline" size="sm">Enable</Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Plan Card */}
            <Card variant="neon" className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-neon-cyan" />
                <h3 className="font-semibold text-foreground">Current Plan</h3>
              </div>
              
              <div className="text-center py-4">
                <p className="text-3xl font-bold capitalize text-foreground">{mockUser.plan}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ${mockUser.plan === 'free' ? '0' : mockUser.plan === 'pro' ? '9' : '29'}/month
                </p>
              </div>

              <Link href="/pricing">
                <Button variant="outline" className="w-full">
                  {t('pricing.upgrade')}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card>

            {/* Account Info Card */}
            <Card variant="glass" className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Account Info</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Since</span>
                  <span className="text-foreground">{mockUser.joinedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Calls This Month</span>
                  <span className="text-foreground">1,247</span>
                </div>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card variant="glass" className="p-6 border-red-500/20">
              <h3 className="font-semibold text-red-400 mb-4">Danger Zone</h3>
              
              <div className="space-y-3">
                <Button variant="ghost" className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  Deactivate Account
                </Button>
                <Button variant="ghost" className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  Delete Account
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Toggle Switch Component
function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [isChecked, setIsChecked] = useState(defaultChecked)

  return (
    <button
      onClick={() => setIsChecked(!isChecked)}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors duration-200",
        isChecked ? "bg-neon-cyan" : "bg-white/20"
      )}
      aria-label="Toggle switch"
    >
      <span
        className={cn(
          "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200",
          isChecked ? "translate-x-7" : "translate-x-1"
        )}
      />
    </button>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.924 3 8.11l2.111-1.819z" />
    </svg>
  )
}
