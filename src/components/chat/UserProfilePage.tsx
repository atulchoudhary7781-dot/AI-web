'use client'

import { useState } from 'react'
import {
  User, Mail, Camera, Save, X,
  MapPin, Phone, Globe, Edit3,
  Calendar, Settings, LogOut,
  ChevronLeft, Shield, ChevronRight,
  Bell, Lock, Key, Eye, Moon,
  Sun, Monitor, Check, Star,
  Award, Zap, Sparkles,
  Link2, FileText, MessageSquare
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

// Animated Toggle Component
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${enabled ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30' : 'bg-slate-700'}`}
    >
      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${enabled ? 'left-8' : 'left-1'} flex items-center justify-center`}>
        {enabled && <Check size={12} className="text-purple-600" />}
      </div>
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
    phone: '+91 XXXXX XXXXX',
    location: 'Mumbai, India',
    bio: 'AI Enthusiast | Building the future 🚀',
    website: 'https://atul-portfolio-alpha.vercel.app/'
  })

  // Settings states
  const [privacySettings, setPrivacySettings] = useState({
    twoFactorAuth: false,
    hideOnlineStatus: true,
    privateProfile: false
  })

  const [notificationSettings, setNotificationSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    chatMessages: true
  })

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark')
  const [language, setLanguage] = useState('en')

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ]

  const handleSave = () => {
    setIsEditing(false)
    localStorage.setItem('nexus_profile', JSON.stringify(profileData))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={activeSettingsPanel ? () => setActiveSettingsPanel(null) : onBack}
            className="p-3 hover:bg-white/10 rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {activeSettingsPanel === 'privacy' && '🔒 Privacy & Security'}
            {activeSettingsPanel === 'language' && '🌍 Language & Region'}
            {activeSettingsPanel === 'notifications' && '🔔 Notifications'}
            {!activeSettingsPanel && '⭐ My Profile'}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 py-8">
        
        {/* ===== PRIVACY PANEL ===== */}
        {activeSettingsPanel === 'privacy' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Security Card */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Account Security</h3>
                  <p className="text-sm text-gray-400">Keep your account protected</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {[
                  { icon: Key, title: 'Two-Factor Auth', desc: 'Add extra layer of security', setting: 'twoFactorAuth' as const },
                  { icon: Eye, title: 'Hide Online Status', desc: 'Appear offline to others', setting: 'hideOnlineStatus' as const },
                  { icon: Lock, title: 'Private Profile', desc: 'Only followers can see', setting: 'privateProfile' as const },
                ].map(({ icon: Icon, title, desc, setting }) => (
                  <div key={setting} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl hover:bg-black/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Icon size={18} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold">{title}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </div>
                    <Toggle 
                      enabled={privacySettings[setting]} 
                      onChange={(val) => setPrivacySettings({...privacySettings, [setting]: val})}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/5 backdrop-blur-xl rounded-3xl border border-red-500/20 p-6">
              <h3 className="font-bold text-red-400 mb-4">⚠️ Danger Zone</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 bg-red-500/20 hover:bg-red-500/30 rounded-2xl transition-colors text-left">
                  <p className="font-medium text-red-300">Deactivate</p>
                  <p className="text-xs text-red-400/70 mt-1">Temporarily disable</p>
                </button>
                <button className="p-4 bg-red-500/20 hover:bg-red-500/30 rounded-2xl transition-colors text-left">
                  <p className="font-medium text-red-300">Delete Account</p>
                  <p className="text-xs text-red-400/70 mt-1">Permanently remove</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== LANGUAGE PANEL ===== */}
        {activeSettingsPanel === 'language' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Language Selection */}
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-xl rounded-3xl border border-green-500/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Globe size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Language</h3>
                  <p className="text-sm text-gray-400">Choose your preferred language</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                      language === lang.code 
                        ? 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-500/50 scale-[1.02]' 
                        : 'bg-black/20 hover:bg-black/30 border border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-3 text-lg">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </span>
                    {language === lang.code && (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-purple-400" />
                Appearance
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'light' as const, icon: Sun, label: 'Light', color: 'from-yellow-500 to-orange-500' },
                  { value: 'dark' as const, icon: Moon, label: 'Dark', color: 'from-indigo-500 to-purple-500' },
                  { value: 'system' as const, icon: Monitor, label: 'System', color: 'from-gray-500 to-slate-500' },
                ].map(({ value, icon: Icon, label, color }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`p-5 rounded-2xl flex flex-col items-center gap-3 transition-all ${
                      theme === value 
                        ? `bg-gradient-to-br ${color} scale-105 shadow-lg` 
                        : 'bg-black/20 hover:bg-black/30'
                    }`}
                  >
                    <Icon size={28} />
                    <span className="text-sm font-medium">{label}</span>
                    {theme === value && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== NOTIFICATIONS PANEL ===== */}
        {activeSettingsPanel === 'notifications' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 backdrop-blur-xl rounded-3xl border border-orange-500/20 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <Bell size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Notifications</h3>
                  <p className="text-sm text-gray-400">Manage how you get notified</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {[
                  { icon: Bell, title: 'Push Notifications', desc: 'On your device', setting: 'pushNotifications' as const },
                  { icon: Mail, title: 'Email Updates', desc: 'In your inbox', setting: 'emailNotifications' as const },
                  { icon: MessageSquare, title: 'Chat Messages', desc: 'New conversations', setting: 'chatMessages' as const },
                ].map(({ icon: Icon, title, desc, setting }) => (
                  <div key={setting} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl hover:bg-black/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Icon size={18} className="text-orange-400" />
                      </div>
                      <div>
                        <p className="font-semibold">{title}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </div>
                    <Toggle 
                      enabled={notificationSettings[setting]} 
                      onChange={(val) => setNotificationSettings({...notificationSettings, [setting]: val})}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== MAIN PROFILE VIEW ===== */}
        {!activeSettingsPanel && (
          <>
            {/* Profile Hero Section */}
            <div className="relative mb-8">
              {/* Avatar */}
              <div className="px-6 pt-4">
                <div className="relative inline-block group">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-400 p-1 shadow-2xl shadow-purple-500/30">
                    <div className="w-full h-full rounded-[22px] bg-slate-800 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={64} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Avatar Edit Button */}
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-lg">
                    <Camera size={18} />
                  </button>

                  {/* Verified Badge */}
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check size={16} />
                  </div>
                </div>

                {/* Name & Info */}
                <div className="mt-4">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="text-2xl sm:text-3xl font-bold bg-transparent border-b-2 border-purple-500 focus:outline-none pb-1"
                    />
                  ) : (
                    <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {profileData.name}
                    </h2>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-gray-400">@{profileData.name.toLowerCase().replace(/\s/g, '')}</p>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">PRO</span>
                  </div>
                  
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="mt-2 text-sm text-gray-400 bg-transparent border-b border-white/20 focus:outline-none"
                    />
                  ) : (
                    <p className="mt-2 text-sm text-gray-400 flex items-center gap-2">
                      <Mail size={14} />
                      {profileData.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <FileText size={18} className="text-purple-400" />
                  About Me
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm font-medium shadow-lg shadow-purple-500/25"
                  >
                    <Edit3 size={14} />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 text-sm font-medium"
                    >
                      <Save size={14} />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl transition-all flex items-center gap-2 text-sm"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Bio Text */}
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-3 focus:outline-none focus:border-purple-500 resize-none"
                />
              ) : (
                <p className="text-gray-300 leading-relaxed">{profileData.bio}</p>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {/* Location */}
                <div className="flex items-center gap-3 p-4 bg-black/20 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <MapPin size={18} className="text-red-400" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        className="w-full bg-transparent focus:outline-none text-sm"
                      />
                    ) : (
                      <p className="text-sm font-medium">{profileData.location}</p>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 p-4 bg-black/20 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Phone size={18} className="text-green-400" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full bg-transparent focus:outline-none text-sm"
                      />
                    ) : (
                      <p className="text-sm font-medium">{profileData.phone}</p>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-center gap-3 p-4 bg-black/20 rounded-2xl sm:col-span-2">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Link2 size={18} className="text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                        className="w-full bg-transparent focus:outline-none text-sm"
                      />
                    ) : (
                      <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                        {profileData.website.replace('https://', '')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Cards */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 mb-6">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <Settings size={18} className="text-purple-400" />
                Quick Settings
              </h3>
              
              <div className="space-y-3">
                {[
                  { id: 'privacy', icon: Shield, title: 'Privacy & Security', desc: 'Password, 2FA, visibility', gradient: 'from-blue-500 to-cyan-500' },
                  { id: 'language', icon: Globe, title: 'Language & Region', desc: 'English, timezone, theme', gradient: 'from-green-500 to-emerald-500' },
                  { id: 'notifications', icon: Bell, title: 'Notifications', desc: 'Push, email preferences', gradient: 'from-orange-500 to-amber-500' },
                ].map(({ id, icon: Icon, title, desc, gradient }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSettingsPanel(id)}
                    className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-black/30 rounded-2xl transition-all group hover:scale-[1.02]"
                  >
                    <span className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon size={20} />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{title}</p>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </span>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full p-5 bg-gradient-to-r from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 border border-red-500/30 hover:border-red-500/50 rounded-3xl transition-all flex items-center justify-center gap-3 text-red-400 hover:text-red-300 font-medium group hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
              Sign Out
            </button>

            {/* Version Info */}
            <p className="text-center text-xs text-gray-600 mt-6">
              Nexus AI v2.0 • Made with ❤️
            </p>
          </>
        )}
      </div>
    </div>
  )
}
