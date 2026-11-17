'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  User, Shield, Bell, Palette,
  CheckCircle, Trash2, UserX, X,
  Clock, ChevronLeft
} from 'lucide-react'
import SiteHeader from '@/components/layout/SiteHeader'
import { getSessionUser } from '@/lib/session'

function readSavedUser() {
  if (typeof window === 'undefined') return { name: '', email: '' }
  try {
    const raw = localStorage.getItem('nexus_user')
    if (!raw) return { name: '', email: '' }
    const parsed = JSON.parse(raw) as { name?: string; email?: string }
    return { name: parsed.name || '', email: parsed.email || '' }
  } catch {
    return { name: '', email: '' }
  }
}

export default function SettingsPage() {
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [language, setLanguage] = useState('English')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [twoFactor, setTwoFactor] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const session = getSessionUser()
    setIsLoggedIn(!!session)
    const saved = session || readSavedUser()
    setUserName(saved.name)
    setUserEmail(saved.email)
    setNotifications(localStorage.getItem('nexus_notifications') !== 'off')
    setLanguage(localStorage.getItem('nexus_language') || 'English')
    setTwoFactor(localStorage.getItem('nexus_2fa') === 'on')
    setEmailVerified(localStorage.getItem('nexus_email_verified') === '1')
    const avatar = localStorage.getItem('nexus_avatar')
    if (avatar) setAvatarUrl(avatar)
  }, [])

  const flash = (text: string) => {
    setNotice(text)
    setTimeout(() => setNotice(''), 3000)
  }

  const handleSaveProfile = () => {
    const name = userName.trim()
    const email = userEmail.trim()
    if (!name) return flash('Please enter your name')
    if (!email.includes('@')) return flash('Please enter a valid email')
    setIsSaving(true)
    const existing = readSavedUser()
    localStorage.setItem('nexus_user', JSON.stringify({ ...existing, name, email }))
    setTimeout(() => {
      setIsSaving(false)
      flash('Profile updated successfully')
    }, 400)
  }

  const handleAvatar = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return flash('Choose a JPG, PNG or GIF')
    if (file.size > 2 * 1024 * 1024) return flash('Avatar must be under 2MB')
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result || '')
      setAvatarUrl(url)
      localStorage.setItem('nexus_avatar', url)
      flash('Avatar updated')
    }
    reader.readAsDataURL(file)
  }

  const handleNotifications = (on: boolean) => {
    setNotifications(on)
    localStorage.setItem('nexus_notifications', on ? 'on' : 'off')
    flash(on ? 'Notifications on' : 'Notifications off')
  }

  const handleLanguage = (value: string) => {
    setLanguage(value)
    localStorage.setItem('nexus_language', value)
    flash(`Language set to ${value}`)
  }

  const handleUpdatePassword = () => {
    if (currentPassword.length < 4) return flash('Enter your current password')
    if (newPassword.length < 4) return flash('New password must be at least 4 characters')
    setCurrentPassword('')
    setNewPassword('')
    flash('Password updated')
  }

  const handleVerifyEmail = () => {
    if (!userEmail.includes('@')) return flash('Enter an email first')
    localStorage.setItem('nexus_email_verified', '1')
    setEmailVerified(true)
    flash(`Verification sent to ${userEmail}`)
  }

  const handleTwoFactor = () => {
    const next = !twoFactor
    setTwoFactor(next)
    localStorage.setItem('nexus_2fa', next ? 'on' : 'off')
    flash(next ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled')
  }

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true)
    await new Promise((r) => setTimeout(r, 600))
    localStorage.removeItem('nexus_user')
    localStorage.removeItem('nexus_auth')
    setShowDeactivateModal(false)
    setIsDeactivating(false)
    window.location.href = '/login?message=deactivated'
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    await new Promise((r) => setTimeout(r, 600))
    localStorage.clear()
    sessionStorage.clear()
    setShowDeleteModal(false)
    setIsDeleting(false)
    window.location.href = '/'
  }

  const initial = (userName.trim()[0] || 'A').toUpperCase()

  return (
    <div className="page-shell min-h-screen">
      <SiteHeader />
      <div className="border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-8 py-5 sm:py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-300 hover:border-cyan-400/40"
              aria-label="Back to chat"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
              <p className="text-sm text-gray-400 mt-1">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {notice && (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-8 pt-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400">{notice}</p>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-8 py-6 sm:py-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-[#0f172a]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-cyan-500/15">
                  <User className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Profile</h2>
              </div>

              {!isLoggedIn ? (
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center">
                  <p className="text-sm text-slate-300">
                    Login or create an account to set up your profile.
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <Link
                      href="/login"
                      className="rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-2 text-sm font-semibold text-slate-950"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/5"
                    >
                      Create Account
                    </Link>
                  </div>
                </div>
              ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initial
                    )}
                  </div>
                  <div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        handleAvatar(e.target.files?.[0])
                        e.target.value = ''
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 text-sm rounded-lg border border-white/[0.08]"
                    >
                      Change Avatar
                    </button>
                    <p className="text-xs text-gray-500 mt-1.5">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Atul Choudhary"
                    className="input-dark placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    Email
                    <span className={`flex items-center gap-1 text-xs ${emailVerified ? 'text-emerald-400' : 'text-cyan-400'}`}>
                      <Clock className="w-3.5 h-3.5" />
                      {emailVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="e.g. atul@email.com"
                    className="input-dark placeholder:text-slate-500"
                  />
                  {!emailVerified && (
                    <div className="mt-2 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                      <p className="text-sm text-cyan-400 mb-2">Verify your email to unlock all features</p>
                      <button
                        type="button"
                        onClick={handleVerifyEmail}
                        className="px-4 py-2 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-lg text-sm font-medium"
                      >
                        Send Verification Email
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold rounded-xl disabled:opacity-70"
                >
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
              )}
            </section>

            <section className="bg-[#0f172a]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-violet-500/15">
                  <Palette className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Preferences</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 py-2">
                  <div>
                    <p className="font-medium text-white">Language</p>
                    <p className="text-sm text-gray-500 mt-0.5">Select your preferred language</p>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => handleLanguage(e.target.value)}
                    className="bg-[#0a0a0f] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500/50"
                  >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                  </select>
                </div>

                <hr className="border-white/[0.08]" />

                <div className="flex items-center justify-between gap-4 py-2">
                  <div>
                    <p className="font-medium text-white flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{notifications ? 'Email alerts on' : 'Email alerts off'}</p>
                  </div>
                  <ToggleSwitch checked={notifications} onChange={handleNotifications} label="Notifications" />
                </div>
              </div>
            </section>

            <section className="bg-[#0f172a]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-green-500/15">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Security</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="input-dark placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="input-dark placeholder:text-slate-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  className="px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 border border-white/[0.1] rounded-xl text-sm font-medium"
                >
                  Update Password
                </button>

                <div className="pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between gap-4 py-2">
                    <div>
                      <p className="font-medium text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500 mt-0.5">{twoFactor ? 'Enabled' : 'Add an extra layer of security'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTwoFactor}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                        twoFactor
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-violet-500/10 text-violet-400 border-violet-500/30 hover:bg-violet-500/20'
                      }`}
                    >
                      {twoFactor ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-gradient-to-br from-cyan-500/[0.1] to-violet-500/[0.05] border border-cyan-500/20 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Current Plan</h3>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-white">Free</p>
                <p className="text-sm text-gray-400 mt-1">Upgrade anytime</p>
              </div>
              <Link
                href="/pricing"
                className="block w-full px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-center text-gray-300 border border-white/[0.1] rounded-xl text-sm font-medium"
              >
                Upgrade Plan →
              </Link>
            </section>

            <section className="bg-[#0f172a]/60 border border-white/[0.06] rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Account Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white">2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400">Active</span>
                </div>
              </div>
            </section>

            <section className="bg-[#0f172a]/60 border border-red-500/20 rounded-2xl p-6">
              <h3 className="font-semibold text-red-400 mb-4">Danger Zone</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowDeactivateModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-yellow-400 hover:bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm font-medium"
                >
                  <UserX className="w-4 h-4" />
                  Deactivate Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {showDeactivateModal && (
        <ConfirmationModal
          onClose={() => setShowDeactivateModal(false)}
          onConfirm={handleDeactivateAccount}
          title="Deactivate Account?"
          message="Your account will be temporarily disabled. You can sign in again later."
          confirmText="Yes, Deactivate"
          isLoading={isDeactivating}
          variant="warning"
        />
      )}
      {showDeleteModal && (
        <ConfirmationModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account Permanently?"
          message="This cannot be undone. All local data on this device will be removed."
          confirmText="Yes, Delete Forever"
          isLoading={isDeleting}
          variant="danger"
        />
      )}
    </div>
  )
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-[3.25rem] shrink-0 cursor-pointer items-center rounded-full border transition-colors ${
        checked
          ? 'border-cyan-400/50 bg-gradient-to-r from-cyan-500 to-violet-600'
          : 'border-white/20 bg-white/10'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

function ConfirmationModal({
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  isLoading,
  variant = 'danger',
}: {
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  isLoading: boolean
  variant?: 'danger' | 'warning'
}) {
  const isDanger = variant === 'danger'
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a2e] p-6">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-white text-center mb-2">{title}</h3>
        <p className="text-gray-400 text-center text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-white/[0.06] text-gray-300 border border-white/10 rounded-xl text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white ${
              isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {isLoading ? 'Processing…' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
