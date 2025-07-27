import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  UserProfile, 
  UserStats, 
  UserPreferences, 
  UserAchievement
} from '../types/user'

interface UserStore {
  profile: UserProfile | null
  stats: UserStats
  preferences: UserPreferences
  achievements: UserAchievement[]
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setProfile: (profile: UserProfile) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
  updateStats: (stats: Partial<UserStats>) => void
  addAchievement: (achievement: UserAchievement) => void
  signIn: (profile: UserProfile) => void
  signOut: () => void
  
  // Computed stats from other stores
  calculateStats: () => UserStats
  
  // Getters
  getDisplayName: () => string
  getProfileInitials: () => string
  isPremiumUser: () => boolean
  getCurrentStreak: () => number
  getTotalCompletedItems: () => number
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9)

const defaultProfile: UserProfile = {
  id: generateId(),
  name: 'Alex Chen',
  email: 'alex.chen@example.com',
  isPremium: false,
  memberSince: new Date(),
  timezone: 'UTC',
  language: 'en'
}

const defaultStats: UserStats = {
  totalGoals: 0,
  completedGoals: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalTasks: 0,
  completedTasks: 0,
  totalHabits: 0,
  activeHabits: 0,
  journalEntries: 0,
  timeBlocks: 0
}

const defaultPreferences: UserPreferences = {
  startOfWeek: 'monday',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  defaultTaskPriority: 'medium',
  defaultHabitFrequency: 'daily',
  autoArchiveCompleted: true,
  showTutorials: true
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      stats: defaultStats,
      preferences: defaultPreferences,
      achievements: [],
      isAuthenticated: true, // Default to authenticated for demo
      isLoading: false,

      setProfile: (profile: UserProfile) => {
        set({ profile, isAuthenticated: true })
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        set(state => ({
          profile: state.profile ? { ...state.profile, ...updates } : null
        }))
      },

      updatePreferences: (newPreferences: Partial<UserPreferences>) => {
        set(state => ({
          preferences: { ...state.preferences, ...newPreferences }
        }))
      },

      updateStats: (newStats: Partial<UserStats>) => {
        set(state => ({
          stats: { ...state.stats, ...newStats }
        }))
      },

      addAchievement: (achievement: UserAchievement) => {
        set(state => ({
          achievements: [achievement, ...state.achievements]
        }))
      },

      signIn: (profile: UserProfile) => {
        set({ 
          profile, 
          isAuthenticated: true,
          isLoading: false 
        })
      },

      signOut: () => {
        set({ 
          profile: null, 
          isAuthenticated: false,
          stats: defaultStats,
          achievements: []
        })
      },

      calculateStats: (): UserStats => {
        // This would integrate with other stores to calculate real stats
        // For now, return current stats with some dummy data
        const currentStats = get().stats
        
        // In a real implementation, we would import and use the other stores:
        // const { goals } = useGoalStore.getState()
        // const { tasks } = useTaskStore.getState()
        // const { habits } = useHabitStore.getState()
        // const { entries } = useJournalStore.getState()
        
        return {
          ...currentStats,
          totalGoals: 4,
          completedGoals: 2,
          currentStreak: 23,
          longestStreak: 45,
          totalTasks: 127,
          completedTasks: 89,
          totalHabits: 8,
          activeHabits: 6,
          journalEntries: 42,
          timeBlocks: 15
        }
      },

      // Getters
      getDisplayName: (): string => {
        const { profile } = get()
        return profile?.name || 'User'
      },

      getProfileInitials: (): string => {
        const { profile } = get()
        if (!profile?.name) return 'U'
        
        const names = profile.name.split(' ')
        if (names.length === 1) {
          return names[0].charAt(0).toUpperCase()
        }
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
      },

      isPremiumUser: (): boolean => {
        const { profile } = get()
        return profile?.isPremium || false
      },

      getCurrentStreak: (): number => {
        return get().stats.currentStreak
      },

      getTotalCompletedItems: (): number => {
        const { stats } = get()
        return stats.completedGoals + stats.completedTasks + stats.journalEntries
      }
    }),
    {
      name: 'user-store',
      version: 1
    }
  )
)