import { useState } from 'react'
import { Edit, CheckCircle } from 'lucide-react'
import { useUserStore } from '../store/userStore'
import ProfileEditModal from './ProfileEditModal'

export default function ProfileSection() {
  const { 
    profile, 
    getDisplayName, 
    getProfileInitials, 
    isPremiumUser,
    calculateStats
  } = useUserStore()
  
  // Get real-time calculated stats
  const stats = calculateStats()
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  if (!profile) {
    return null
  }

  const handleEditProfile = () => {
    setIsEditModalOpen(true)
  }

  const StatItem = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      <div className="text-lg font-bold text-orange-500 mb-1">
        {value}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        {label}
      </div>
    </div>
  )

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
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
            
            {/* Verified Badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">
              {getDisplayName()}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 truncate">
              {profile.email}
            </p>
            
            {/* Stats */}
            <div className="flex gap-4">
              <StatItem value={stats.totalGoals} label="Goals" />
              <StatItem value={stats.currentStreak} label="Day Streak" />
              <StatItem value={stats.totalTasks} label="Total Tasks" />
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={handleEditProfile}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        {/* Premium Status */}
        {isPremiumUser() && (
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-2 rounded-lg text-sm font-medium text-center">
            ⭐ Premium Member
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </>
  )
}