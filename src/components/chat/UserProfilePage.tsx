'use client'

import { useState } from 'react'
import {
  User, Mail, Camera, Save, X,
  MapPin, Phone, Globe, Edit3,
  Calendar, Settings, LogOut,
  ChevronLeft, Shield, ChevronRight,
  Bell, Lock, Key, Eye, EyeOff,
  Moon, Sun, Monitor, Check
} from 'lucide-react'

// Types
interface UserProfileProps {
  user: {
    name: string
    email: string
    avatar?: string
  }
  onBack?: () => void
  onLogout?: () => void
}

// Toggle Component
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-purple-600' : 'bg-gray-600'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'left-7' : 'left-1'}`} />
    </button>
  )
}

export default function UserProfilePage({ user, onBack, onLogout }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [activeSettingsPanel, setActiveSettingsPanel] = useState<string | null>(null)
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: '',
    location: '',
    bio: '',
    website: ''
  })

  // Privacy & Security settings
  const [privacySettings, setPrivacySettings] = useState({
    twoFactorAuth: false,
    hideOnlineStatus: true,
    privateProfile: false,
    showEmail: false
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    chatMessages: true,
    updates: true,
    marketing: false
  })

  // Theme & Display
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark')
  
  // Language
  const [language, setLanguage] = useState('en')

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ar', name: 'العربية' }
  ]

  const handleSave = () => {
    setIsEditing(false)
    // Save to localStorage
    localStorage.setItem('nexus_profile', JSON.stringify(profileData))
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to original
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={activeSettingsPanel ? () => setActiveSettingsPanel(null) : onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">
            {activeSettingsPanel === 'privacy' && 'Privacy & Security'}
            {activeSettingsPanel === 'language' && 'Language & Region'}
            {activeSettingsPanel === 'notifications' && 'Notifications'}
            {!activeSettingsPanel && 'Profile'}
          </h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* ===== PRIVACY & SECURITY PANEL ===== */}
        {activeSettingsPanel === 'privacy' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Account Security */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Lock size={20} className="text-blue-400" />
                Account Security
              </h3>
              
              <div className="space-y-4">
                {/* Two-Factor Authentication */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Key size={18} className="text-green-400" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-400">Add extra security to your account</p>
                    </div>
                  </div>
                  <Toggle 
                    enabled={privacySettings.twoFactorAuth} 
                    onChange={(val) => setPrivacySettings({...privacySettings, twoFactorAuth: val})}
                  />
                </div>

                {/* Change Password */}
                <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                  <div className="flex items-center gap-3">
                    <Key size={18} className="text-yellow-400" />
                    <div className="text-left">
                      <p className="font-medium">Change Password</p>
                      <p className="text-xs text-gray-400">Update your password regularly</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-white" />
                </button>

                {/* Active Sessions */}
                <button className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                  <div className="flex items-center gap-3">
                    <Shield size={18} className="text-purple-400" />
                    <div className="text-left">
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-xs text-gray-400">Manage where you're logged in</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-white" />
                </button>
              </div>
            </div>

            {/* Privacy Options */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Eye size={20} className="text-cyan-400" />
                Privacy Options
              </h3>
              
              <div className="space-y-4">
                {/* Hide Online Status */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium">Hide Online Status</p>
                    <p className="text-xs text-gray-400">Others won't see when you're online</p>
                  </div>
                  <Toggle 
                    enabled={privacySettings.hideOnlineStatus} 
                    onChange={(val) => setPrivacySettings({...privacySettings, hideOnlineStatus: val})}
                  />
                </div>

                {/* Private Profile */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium">Private Profile</p>
                    <p className="text-xs text-gray-400">Only approved followers can see your profile</p>
                  </div>
                  <Toggle 
                    enabled={privacySettings.privateProfile} 
                    onChange={(val) => setPrivacySettings({...privacySettings, privateProfile: val})}
                  />
                </div>

                {/* Show Email */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium">Show Email Publicly</p>
                    <p className="text-xs text-gray-400">Allow others to see your email address</p>
                  </div>
                  <Toggle 
                    enabled={privacySettings.showEmail} 
                    onChange={(val) => setPrivacySettings({...privacySettings, showEmail: val})}
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl border border-red-500/30 p-6">
              <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
              
              <div className="space-y-3">
                <button className="w-full p-4 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors text-left">
                  <p className="font-medium text-red-300">Deactivate Account</p>
                  <p className="text-xs text-red-400/70">Temporarily disable your account</p>
                </button>
                
                <button className="w-full p-4 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors text-left">
                  <p className="font-medium text-red-300">Delete Account</p>
                  <p className="text-xs text-red-400/70">Permanently delete your account and data</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== LANGUAGE & REGION PANEL ===== */}
        {activeSettingsPanel === 'language' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Language Selection */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Globe size={20} className="text-green-400" />
                Language
              </h3>
              
              <p className="text-sm text-gray-400 mb-4">Choose your preferred language</p>
              
              <div className="space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                      language === lang.code 
                        ? 'bg-purple-600/30 border border-purple-500' 
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    <span>{lang.name}</span>
                    {language === lang.code && (
                      <Check size={18} className="text-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Region Settings */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-red-400" />
                Region Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Timezone</label>
                  <select className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-purple-500">
                    <option value="IST" className="bg-slate-800">India Standard Time (IST)</option>
                    <option value="UTC" className="bg-slate-800">Coordinated Universal Time (UTC)</option>
                    <option value="EST" className="bg-slate-800">Eastern Time (EST)</option>
                    <option value="PST" className="bg-slate-800">Pacific Time (PST)</option>
                    <option value="GMT" className="bg-slate-800">Greenwich Mean Time (GMT)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Date Format</label>
                  <select className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-purple-500">
                    <option value="DD/MM/YYYY" className="bg-slate-800">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY" className="bg-slate-800">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD" className="bg-slate-800">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Number Format</label>
                  <select className="w-full p-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:border-purple-500">
                    <option value="1,234.56" className="bg-slate-800">1,234.56 (International)</option>
                    <option value="1.234,56" className="bg-slate-800">1.234,56 (European)</option>
                    <option value="1 234.56" className="bg-slate-800">1 234.56 (French)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Theme Selection */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                {theme === 'dark' ? <Moon size={20} className="text-indigo-400" /> : 
                 theme === 'light' ? <Sun size={20} className="text-yellow-400" /> :
                 <Monitor size={20} className="text-gray-400" />}
                Appearance
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                    theme === 'light' ? 'bg-yellow-500/30 border border-yellow-500' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Sun size={24} className="text-yellow-400" />
                  <span className="text-sm">Light</span>
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                    theme === 'dark' ? 'bg-indigo-500/30 border border-indigo-500' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Moon size={24} className="text-indigo-400" />
                  <span className="text-sm">Dark</span>
                </button>
                
                <button
                  onClick={() => setTheme('system')}
                  className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-colors ${
                    theme === 'system' ? 'bg-gray-500/30 border border-gray-500' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Monitor size={24} className="text-gray-400" />
                  <span className="text-sm">System</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== NOTIFICATIONS PANEL ===== */}
        {activeSettingsPanel === 'notifications' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Notification Preferences */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Bell size={20} className="text-orange-400" />
                Notification Preferences
              </h3>
              
              <div className="space-y-4">
                {/* Push Notifications */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-xs text-gray-400">Receive notifications on your device</p>
                  </div>
                  <Toggle 
                    enabled={notificationSettings.pushNotifications} 
                    onChange={(val) => setNotificationSettings({...notificationSettings, pushNotifications: val})}
                  />
                </div>

                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-xs text-gray-400">Receive updates via email</p>
                  </div>
                  <Toggle 
                    enabled={notificationSettings.emailNotifications} 
                    onChange={(val) => setNotificationSettings({...notificationSettings, emailNotifications: val})}
                  />
                </div>
              </div>
            </div>

            {/* What to Notify About */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold mb-4">Notify Me About</h3>
              
              <div className="space-y-4">
                {/* Chat Messages */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-blue-400" />
                    <div>
                      <p className="font-medium">Chat Messages</p>
                      <p className="text-xs text-gray-400">New messages from users</p>
                    </div>
                  </div>
                  <Toggle 
                    enabled={notificationSettings.chatMessages} 
                    onChange={(val) => setNotificationSettings({...notificationSettings, chatMessages: val})}
                  />
                </div>

                {/* Updates */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-green-400" />
                    <div>
                      <p className="font-medium">Product Updates</p>
                      <p className="text-xs text-gray-400">New features and improvements</p>
                    </div>
                  </div>
                  <Toggle 
                    enabled={notificationSettings.updates} 
                    onChange={(val) => setNotificationSettings({...notificationSettings, updates: val})}
                  />
                </div>

                {/* Marketing */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-pink-400" />
                    <div>
                      <p className="font-medium">Marketing & Offers</p>
                      <p className="text-xs text-gray-400">Promotional content and deals</p>
                    </div>
                  </div>
                  <Toggle 
                    enabled={notificationSettings.marketing} 
                    onChange={(val) => setNotificationSettings({...notificationSettings, marketing: val})}
                  />
                </div>
              </div>
            </div>

            {/* Do Not Disturb */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Bell size={20} className="text-gray-400" />
                Do Not Disturb
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left">
                  <p className="font-medium">Quiet Hours</p>
                  <p className="text-xs text-gray-400">10 PM - 7 AM</p>
                </button>
                <button className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-left">
                  <p className="font-medium">Mute All</p>
                  <p className="text-xs text-gray-400">Until I turn it back on</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== MAIN PROFILE VIEW (when no settings panel active) ===== */}
        {!activeSettingsPanel && (
          <>
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-1">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={64} className="text-gray-400" />
                    )}
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={16} />
                </button>
              </div>
              
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="mt-4 text-2xl font-bold bg-transparent border-b-2 border-purple-500 text-center focus:outline-none"
                />
              ) : (
                <h2 className="mt-4 text-2xl font-bold">{profileData.name}</h2>
              )}
              <p className="text-gray-400 mt-1">{profileData.email}</p>
            </div>

            {/* Profile Info Card */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User size={20} className="text-purple-400" />
                  Personal Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Save size={16} />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Info Fields */}
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Mail size={20} className="text-blue-400" />
                  <div className="flex-1">
                    <label className="text-xs text-gray-400">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full bg-transparent focus:outline-none"
                      />
                    ) : (
                      <p>{profileData.email}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Phone size={20} className="text-green-400" />
                  <div className="flex-1">
                    <label className="text-xs text-gray-400">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        placeholder="Add phone number"
                        className="w-full bg-transparent focus:outline-none placeholder:text-gray-500"
                      />
                    ) : (
                      <p className="text-gray-400">{profileData.phone || 'Not added'}</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <MapPin size={20} className="text-red-400" />
                  <div className="flex-1">
                    <label className="text-xs text-gray-400">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        placeholder="Add location"
                        className="w-full bg-transparent focus:outline-none placeholder:text-gray-500"
                      />
                    ) : (
                      <p className="text-gray-400">{profileData.location || 'Not added'}</p>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <Globe size={20} className="text-cyan-400" />
                  <div className="flex-1">
                    <label className="text-xs text-gray-400">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                        placeholder="Add website"
                        className="w-full bg-transparent focus:outline-none placeholder:text-gray-500"
                      />
                    ) : (
                      <p className="text-gray-400">{profileData.website || 'Not added'}</p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                  <Calendar size={20} className="text-yellow-400 mt-1" />
                  <div className="flex-1">
                    <label className="text-xs text-gray-400">Bio</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        placeholder="Tell us about yourself"
                        rows={3}
                        className="w-full bg-transparent focus:outline-none placeholder:text-gray-500 resize-none"
                      />
                    ) : (
                      <p className="text-gray-400">{profileData.bio || 'No bio yet'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Settings size={20} className="text-purple-400" />
                Settings
              </h3>
              
              <div className="space-y-3">
                {/* Privacy & Security */}
                <button 
                  onClick={() => setActiveSettingsPanel('privacy')}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <Shield size={18} className="text-blue-400" />
                    <div className="text-left">
                      <p className="font-medium">Privacy & Security</p>
                      <p className="text-xs text-gray-400">Password, 2FA, visibility</p>
                    </div>
                  </span>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-white" />
                </button>
                
                {/* Language & Region */}
                <button 
                  onClick={() => setActiveSettingsPanel('language')}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <Globe size={18} className="text-green-400" />
                    <div className="text-left">
                      <p className="font-medium">Language & Region</p>
                      <p className="text-xs text-gray-400">English, timezone, format</p>
                    </div>
                  </span>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-white" />
                </button>
                
                {/* Notifications */}
                <button 
                  onClick={() => setActiveSettingsPanel('notifications')}
                  className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                >
                  <span className="flex items-center gap-3">
                    <Bell size={18} className="text-orange-400" />
                    <div className="text-left">
                      <p className="font-medium">Notifications</p>
                      <p className="text-xs text-gray-400">Push, email, preferences</p>
                    </div>
                  </span>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-white" />
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-2xl transition-colors flex items-center justify-center gap-2 text-red-400"
            >
              <LogOut size={20} />
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  )
}
