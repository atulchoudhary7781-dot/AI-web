'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  User, Mail, Shield, Bell, Palette,
  CheckCircle, Trash2, UserX, X,
  Eye, Lock, Clock
} from 'lucide-react'

// ============================================
// TYPES
// ============================================
interface UserData {
  name: string
  email: string
  avatar?: string | null
}

// Mock user data
const mockUser: UserData = {
  name: 'John Doe',
  email: 'john@example.com',
  avatar: null
}

// ============================================
// SETTINGS PAGE COMPONENT
// ============================================
export default function SettingsPage() {
  // State
  const [userName, setUserName] = useState(mockUser.name)
  const [userEmail, setUserEmail] = useState(mockUser.email)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState('')
  
  // Danger Zone states
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Handle profile save
  const handleSaveProfile = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setShowSuccessMessage('Profile updated successfully!')
    setIsSaving(false)
    setTimeout(() => setShowSuccessMessage(''), 3000)
  }

  // Handle deactivate account
  const handleDeactivateAccount = async () => {
    setIsDeactivating(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      setShowSuccessMessage('Account deactivated successfully!')
      setShowDeactivateModal(false)
      
      setTimeout(() => {
        localStorage.removeItem('nexus_auth')
        window.location.href = '/login?message=deactivated'
      }, 2000)
    } catch (error) {
      console.error('Deactivate error:', error)
      setShowSuccessMessage('Error deactivating account')
    }
    setIsDeactivating(false)
    setTimeout(() => setShowSuccessMessage(''), 5000)
  }

  // Handle delete account
  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2500))
      setShowSuccessMessage('Account deleted permanently!')
      setShowDeleteModal(false)
      
      setTimeout(() => {
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/'
      }, 2000)
    } catch (error) {
      console.error('Delete error:', error)
      setShowSuccessMessage('Error deleting account')
    }
    setIsDeleting(false)
    setTimeout(() => setShowSuccessMessage(''), 5000)
  }

  return (
    <div className="page-wrapper min-h-screen bg-[#030712]">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="p-2 hover:bg-white/[0.06] rounded-xl transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m7 7l-7-7m7 7v11" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
              <p className="text-sm text-gray-400 mt-1">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400">{showSuccessMessage}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Section */}
            <section className="bg-[#0f172a]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-cyan-500/15">
                  <User className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Profile</h2>
              </div>

              <div className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/25">
                    {mockUser.name.charAt(0)}
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 text-sm rounded-lg transition-colors border border-white/[0.08]">
                      Change Avatar
                    </button>
                    <p className="text-xs text-gray-500 mt-1.5">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                {/* Name Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="input-dark"
                  />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    Email
                    <span className="flex items-center gap-1 text-xs text-cyan-400">
                      <Clock className="w-3.5 h-3.5" />
                      Not Verified
                    </span>
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="input-dark"
                  />

                  {/* Verification CTA */}
                  <div className="mt-2 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <p className="text-sm text-cyan-400 mb-2">
                      Verify your email to unlock all features
                    </p>
                    <button className="px-4 py-2 bg-transparent border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 rounded-lg text-sm font-medium transition-colors">
                      Send Verification Email
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 transition-all duration-200 disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <LoaderIcon />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </section>

            {/* Preferences Section */}
            <section className="bg-[#0f172a]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-violet-500/15">
                  <Palette className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Preferences</h2>
              </div>

              <div className="space-y-6">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-white">Theme</p>
                    <p className="text-sm text-gray-500 mt-0.5">Choose your preferred appearance</p>
                  </div>
                  <ToggleSwitch defaultChecked={true} />
                </div>

                <hr className="border-white/[0.08]" />

                {/* Language */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-white">Language</p>
                    <p className="text-sm text-gray-500 mt-0.5">Select your preferred language</p>
                  </div>
                  <select className="bg-[#0a0a0f] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-cyan-500/50 cursor-pointer">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                  </select>
                </div>

                <hr className="border-white/[0.08]" />

                {/* Notifications */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-white flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Notifications
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">Receive email notifications</p>
                  </div>
                  <ToggleSwitch defaultChecked={true} />
                </div>
              </div>
            </section>

            {/* Security Section */}
            <section className="bg-[#0f172a]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-green-500/15">
                  <Shield className="w-5 h-5 text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Security</h2>
              </div>

              <div className="space-y-4">
                {/* Change Password */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Change Password</label>
                  <input type="password" placeholder="••••••••" className="input-dark" />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">New Password</label>
                  <input type="password" placeholder="••••••••" className="input-dark" />
                </div>

                <button className="px-6 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 border border-white/[0.1] rounded-xl text-sm font-medium transition-colors">
                  Update Password
                </button>

                {/* Two-Factor Auth */}
                <div className="pt-4 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500 mt-0.5">Add an extra layer of security</p>
                    </div>
                    <button className="px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-lg text-sm font-medium transition-colors">
                      Enable
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar Cards */}
          <div className="space-y-6">
            
            {/* Current Plan Card */}
            <section className="bg-gradient-to-br from-cyan-500/[0.1] to-violet-500/[0.05] border border-cyan-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                <h3 className="font-semibold text-white">Current Plan</h3>
              </div>
              
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-white capitalize">Pro</p>
                <p className="text-sm text-gray-400 mt-1">$9/month</p>
              </div>

              <Link href="/pricing" className="block w-full px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-center text-gray-300 border border-white/[0.1] rounded-xl text-sm font-medium transition-colors">
                Upgrade Plan →
              </Link>
            </section>

            {/* Account Info Card */}
            <section className="bg-[#0f172a]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Account Info</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white">Jan 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">API Calls</span>
                  <span className="text-white">1,247</span>
                </div>
              </div>
            </section>

            {/* Danger Zone Card */}
            <section className="bg-[#0f172a]/60 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0H3.34c-1.54 0-2.502 1.667-1.732 2.5L3.34 16c.77 1.333 2.694 1.333 3.464 0H16.66c1.54 0 2.502-1.667 1.732-2.5z" />
                </svg>
                <h3 className="font-semibold text-red-400">Danger Zone</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Irreversible actions. Please be careful.
              </p>
              
              <div className="space-y-3">
                {/* Deactivate Button */}
                <button
                  onClick={() => setShowDeactivateModal(true)}
                  disabled={isDeactivating || isDeleting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 border border-yellow-500/20 hover:border-yellow-500/40 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" />
                  <span className="flex-1 text-left">Deactivate Account</span>
                  <span className="text-xs opacity-60">Temporarily disable</span>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDeactivating || isDeleting}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="flex-1 text-left">Delete Account</span>
                  <span className="text-xs opacity-60">Permanently remove</span>
                </button>
              </div>
              
              {/* Warning Note */}
              <div className="mt-4 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <p className="text-xs text-red-300/70 flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0H3.34c-1.54 0-2.502 1.667-1.732 2.5L3.34 16c.77 1.333 2.694 1.333 3.464 0H16.66c1.54 0 2.502-1.667 1.732-2.5z" />
                  </svg>
                  <span>
                    <strong>Warning:</strong> Deleting your account will permanently remove all data.
                  </span>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Confirmation Modals */}
      
      {/* Deactivate Modal */}
      {showDeactivateModal && (
        <ConfirmationModal
          isOpen={showDeactivateModal}
          onClose={() => setShowDeactivateModal(false)}
          onConfirm={handleDeactivateAccount}
          title="Deactivate Account?"
          message="Your account will be temporarily disabled. You can reactivate it later by logging in."
          confirmText="Yes, Deactivate"
          isLoading={isDeactivating}
          variant="warning"
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          title="Delete Account Permanently?"
          message="This action CANNOT be undone! All your data will be permanently deleted."
          confirmText="Yes, Delete Forever"
          isLoading={isDeleting}
          variant="danger"
        />
      )}
    </div>
  )
}

// ============================================
// TOGGLE SWITCH COMPONENT
// ============================================
function ToggleSwitch({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [isChecked, setIsChecked] = useState(defaultChecked)

  return (
    <button
      onClick={() => setIsChecked(!isChecked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
        isChecked ? 'bg-gradient-to-r from-cyan-500 to-violet-600' : 'bg-white/20'
      }`}
      aria-label="Toggle switch"
    >
      <span
        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
          isChecked ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// ============================================
// LOADER ICON COMPONENT
// ============================================
function LoaderIcon() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.924 3 8.11l2.111-1.819z" />
    </svg>
  )
}

// ============================================
// CONFIRMATION MODAL COMPONENT
// ============================================
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  isLoading,
  variant = 'danger'
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  isLoading: boolean
  variant?: 'danger' | 'warning'
}) {
  if (!isOpen) return null

  const isDanger = variant === 'danger'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#1a1a2e] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
          isDanger ? 'bg-red-500/20' : 'bg-yellow-500/20'
        }`}>
          {isDanger ? (
            <Trash2 className="w-8 h-8 text-red-400" />
          ) : (
            <UserX className="w-8 h-8 text-yellow-400" />
          )}
        </div>
        
        {/* Content */}
        <h3 className="text-xl font-bold text-white text-center mb-2">{title}</h3>
        <p className="text-gray-400 text-center text-sm leading-relaxed mb-6">{message}</p>
        
        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-white/[0.06] text-gray-300 hover:bg-white/[0.1] border border-white/[0.1] rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-70 ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-yellow-600 hover:bg-yellow-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderIcon />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
