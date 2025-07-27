export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  isPremium: boolean
  memberSince: Date
  timezone: string
  language: string
}

export interface UserStats {
  totalGoals: number
  completedGoals: number
  currentStreak: number
  longestStreak: number
  totalTasks: number
  completedTasks: number
  totalHabits: number
  activeHabits: number
  journalEntries: number
  timeBlocks: number
}

export interface UserPreferences {
  startOfWeek: 'monday' | 'sunday'
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'
  defaultTaskPriority: 'low' | 'medium' | 'high' | 'urgent'
  defaultHabitFrequency: 'daily' | 'weekly' | 'custom'
  autoArchiveCompleted: boolean
  showTutorials: boolean
}


export interface UserAchievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: Date
  category: 'goals' | 'tasks' | 'habits' | 'journal' | 'streak'
}