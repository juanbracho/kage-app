import React, { useState, useEffect } from 'react'
import { X, Camera, User } from 'lucide-react'
import { useUserStore } from '../store/userStore'
import { useModalSwipe } from '../hooks/useSwipeGesture'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const { profile, updateProfile, getProfileInitials } = useUserStore()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    timezone: '',
    language: ''
  })

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        timezone: profile.timezone || 'UTC',
        language: profile.language || 'en'
      })
    }
  }, [isOpen, profile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile(formData)
    onClose()
  }

  const handleClose = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        timezone: profile.timezone || 'UTC',
        language: profile.language || 'en'
      })
    }
    onClose()
  }

  const swipeHandlers = useModalSwipe(handleClose, !isOpen)

  const handleAvatarChange = () => {
    // This would open image picker in a real app
    console.log('Open image picker for avatar')
  }

  if (!isOpen || !profile) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div {...swipeHandlers} className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 text-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 accent-gradient rounded-xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt={profile.name}
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    getProfileInitials()
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={handleAvatarChange}
                  className="absolute -bottom-2 -right-2 w-8 h-8 accent-bg-500 hover-accent-bg-dark rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Tap to change your profile picture
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus-accent-ring focus-accent-border outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus-accent-ring focus-accent-border outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter your email address"
              />
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus-accent-ring focus-accent-border outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Central European Time</option>
                <option value="Asia/Tokyo">Japan Time (JST)</option>
                <option value="Australia/Sydney">Australian Eastern Time</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus-accent-ring focus-accent-border outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 accent-gradient text-white rounded-xl font-medium hover:accent-gradient-dark transition-all shadow-lg hover:shadow-xl"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}