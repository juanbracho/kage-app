export type OnboardingStep = 'welcome' | 'category' | 'template' | 'ai' | 'ready'

export interface CategoryOption {
  id: string
  name: string
  description: string
  icon: string
}

export interface GoalTemplate {
  id: string
  icon: string
  name: string
  duration: string
  description: string
  taskCount: number
  habitCount: number
  category: string
  tasks: TemplateTask[]
  habits: TemplateHabit[]
}

export interface TemplateTask {
  name: string
  description: string
  type: 'standard' | 'to-buy' | 'deadline'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedTime?: number
}

export interface TemplateHabit {
  name: string
  description: string
  frequency: 'daily' | 'weekly' | 'custom'
  selectedDays?: string[]
  icon: string
}

export interface OnboardingData {
  selectedCategory: string | null
  selectedTemplate: GoalTemplate | null
  userName: string
  userEmail: string
  skipAI: boolean
}

export interface UserStats {
  goalCount: number
  dayStreak: number
  totalTasks: number
}