'use client'

import { useState } from 'react'
import {
  User, Mail, Camera, Save, X,
  MapPin, Phone, Globe, Edit3,
  Calendar, Settings, LogOut,
  ChevronLeft, Shield
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

export default function UserProfilePage({ user, onBack, onLogout }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // Profile state
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: '',
    location: '',
    bio: '',
    website: ''
  })

  const handleSave = () => {
    setIsEditing(false)
    // Save logic here
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset to original
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
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
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="w-flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
            >
              <span className="flex items-center gap-3">
                <Shield size={18} className="text-blue-400" />
                Privacy & Security
              </span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              <span className="flex items-center gap-3">
                <Globe size={18} className="text-green-400" />
                Language & Region
              </span>
            </button>
            
            <button className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              <span className="flex items-center gap-3">
                <Calendar size={18} className="text-orange-400" />
                Notifications
              </span>
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
      </div>
    </div>
  )
}
