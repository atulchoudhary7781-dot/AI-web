'use client'

import { useState, useEffect, useRef } from 'react'
import {
  User, Mail, Camera, Save, X, CheckCircle,
  MapPin, Phone, Globe, Edit3, Sparkles,
  Calendar, MessageSquare, Settings, LogOut,
  ChevronLeft, Shield, Award, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface UserProfileProps {
  user: {
    name: string
    email: string
    avatar?: string
  }
  onBack?: () => void
  onLogout?: () => void
}

export default function UserProfilePage({ user: initialUser, onBack, onLogout }: UserProfileProps) {
  const [user, setUser] = useState(initialUser)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'settings'>('profile')
  
  // Form states
  const [name, setName] = useState(initialUser.name || '')
  const [email] = useState(initialUser.email || '')
  const [avatar, setAvatar] = useState(initialUser.avatar || '')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        setName(parsedUser.name || '')
        setAvatar(parsedUser.avatar || '')
      } catch (e) {
        console.error('Error parsing user data:', e)
      }
    }

    // Load profile data if exists
    const savedProfile = localStorage.getItem('nexus_profile')
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        setBio(profile.bio || '')
        setPhone(profile.phone || '')
        setLocation(profile.location || '')
        setWebsite(profile.website || '')
      } catch (e) {
        console.error('Error parsing profile data:', e)
      }
    }
  }, [])

  // Handle avatar upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setAvatar(result)
      
      // Update user state immediately for preview
      setUser(prev => ({ ...prev, avatar: result }))
    }
    reader.readAsDataURL(file)
  }

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatar('')
    setUser(prev => ({ ...prev, avatar: undefined }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Save profile
  const handleSaveProfile = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update user object
    const updatedUser = {
      ...user,
      name,
      avatar
    }

    // Save to localStorage
    localStorage.setItem('nexus_user', JSON.stringify(updatedUser))
    
    // Save extended profile data
    const profileData = { bio, phone, location, website }
    localStorage.setItem('nexus_profile', JSON.stringify(profileData))

    setUser(updatedUser)
    setIsEditing(false)
    setShowSuccess(true)
    setIsLoading(false)

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000)
  }

  // Cancel editing
  const handleCancelEdit = () => {
    setName(user.name || '')
    setAvatar(user.avatar || '')
    setBio(bio)
    setPhone(phone)
    setLocation(location)
    setWebsite(website)
    setIsEditing(false)
  }

  // Get initials for fallback avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Generate stats (mock data - in real app, fetch from API)
  const stats = [
    { label: 'Total Chats', value: '24', icon: MessageSquare, color: 'from-cyan-500 to-blue-500' },
    { label: 'Days Active', value: '15', icon: Calendar, color: 'from-violet-500 to-purple-500' },
    { label: 'AI Queries', value: '156', icon: Zap, color: 'from-pink-500 to-rose-500' },
    { label: 'Member Since', value: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: Award, color: 'from-green-500 to-emerald-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-green-500/20 border border-green-500/30 backdrop-blur-xl rounded-xl px-6 py-4 flex items-center gap-3 shadow-lg shadow-green-500/20">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-medium">Profile updated successfully!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500 rounded-full filter blur-[120px]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-8">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>

            <h1 className="text-2xl font-bold gradient-text font-[family-name:var(--font-orbitron)]">
              User Profile
            </h1>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-600 rounded-lg text-sm text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Profile Header Card */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                
                {/* Avatar Section */}
                <div className="relative group">
                  {/* Avatar */}
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-cyan-500 to-violet-600 p-1">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-800">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={name || 'User'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-violet-600/20">
                          <span className="text-4xl font-bold text-cyan-400">
                            {getInitials(name || 'U')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Camera Overlay - Only show when editing */}
                  {isEditing && (
                    <>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 w-32 h-32 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      >
                        <Camera className="w-8 h-8 text-white" />
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </>
                  )}

                  {/* Online Status */}
                  <span className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-4 border-gray-900" />

                  {/* Remove Avatar Button */}
                  {isEditing && avatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full max-w-md bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Mail className="w-4 h-4" />
                        <span>{email}</span>
                        <Badge variant="secondary" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-xs">
                          Verified
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                          {name || 'User'}
                        </h2>
                        <div className="flex items-center gap-2 text-gray-400 text-sm justify-center md:justify-start">
                          <Mail className="w-4 h-4" />
                          <span>{email}</span>
                          <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      </div>

                      {bio && !isEditing && (
                        <p className="text-gray-400 max-w-lg">{bio}</p>
                      )}
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  {isEditing && (
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-lg shadow-cyan-500/25"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  )}
                  
                  {onLogout && (
                    <Button
                      variant="outline"
                      onClick={onLogout}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs & Content */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-gray-900/50 p-1 rounded-xl border border-gray-800 w-fit">
          {[
            { id: 'profile', label: 'Profile Info', icon: User },
            { id: 'stats', label: 'Statistics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bio Card */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-white">About Me</h3>
                </div>
                
                {isEditing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none resize-none transition-all"
                  />
                ) : (
                  <p className="text-gray-400 leading-relaxed">
                    {bio || 'No bio added yet. Click edit to add your bio!'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Contact Info Card */}
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-violet-400" />
                  <h3 className="font-semibold text-white">Contact Information</h3>
                </div>

                <div className="space-y-4">
                  {/* Phone */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone number"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:border-cyan-500 outline-none transition-all"
                        />
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm text-gray-300">{phone || 'Not added'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Location"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:border-cyan-500 outline-none transition-all"
                        />
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm text-gray-300">{location || 'Not added'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Website */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-pink-400" />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://yourwebsite.com"
                          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:border-cyan-500 outline-none transition-all"
                        />
                      ) : (
                        <div>
                          <p className="text-xs text-gray-500">Website</p>
                          {website ? (
                            <a 
                              href={website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              {website}
                            </a>
                          ) : (
                            <p className="text-sm text-gray-300">Not added</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-gray-900/50 border-gray-800 backdrop-blur-xl hover:border-gray-700 transition-all">
                <CardContent className="p-6 text-center space-y-3">
                  <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
            
            {/* Additional Stats Card */}
            <Card className="col-span-full bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 border-gray-800 backdrop-blur-xl">
              <CardContent className="p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-cyan-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">NEXUS AI Power User</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  You're making great use of AI! Keep exploring and creating amazing things.
                </p>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-violet-600 text-white border-0">
                    <Zap className="w-3 h-3 mr-1" />
                    Pro Member
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-xl">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-400" />
                  Account Settings
                </h3>

                <div className="space-y-4">
                  {/* Theme Setting */}
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Dark Mode</p>
                      <p className="text-sm text-gray-400">Use dark theme throughout the app</p>
                    </div>
                    <div className="w-12 h-6 bg-cyan-500 rounded-full relative cursor-pointer">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Notifications</p>
                      <p className="text-sm text-gray-400">Receive updates about your account</p>
                    </div>
                    <div className="w-12 h-6 bg-cyan-500 rounded-full relative cursor-pointer">
                      <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform" />
                    </div>
                  </div>

                  {/* Data Export */}
                  <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Export Data</p>
                      <p className="text-sm text-gray-400">Download all your chat history and data</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-600">
                      Export
                    </Button>
                  </div>

                  {/* Delete Account */}
                  <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                    <div>
                      <p className="text-red-400 font-medium">Delete Account</p>
                      <p className="text-sm text-gray-400">Permanently delete your account and data</p>
                    </div>
                    <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

// Missing icon import
function BarChart3(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3v18h18"/>
      <path d="m19 9-5 5-4-4-3 3"/>
    </svg>
  )
}
