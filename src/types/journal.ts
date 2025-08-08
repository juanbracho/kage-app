export interface JournalEntry {
  id: string
  content: string
  mood: Mood
  createdAt: Date
  updatedAt: Date
  tags: string[]
  linkedGoals: string[]
  linkedTasks: string[]
  linkedHabits: string[]
  characterCount: number
}

export type Mood = 'very-low' | 'low' | 'neutral' | 'good' | 'great'

export interface MoodOption {
  id: Mood
  emoji: string
  label: string
  color: string
}

export interface LinkedItem {
  id: string
  name: string
  emoji: string
  type: 'goal' | 'task' | 'habit'
}

export interface JournalFormData {
  content: string
  mood?: Mood
  tags: string[]
  linkedGoals: string[]
  linkedTasks: string[]
  linkedHabits: string[]
}

export type JournalFilter = 'all' | 'today' | 'this-week' | 'this-month'

export interface JournalStore {
  entries: JournalEntry[]
  currentFilter: JournalFilter
  isModalOpen: boolean
  selectedEntry?: JournalEntry
  searchQuery: string
  isAutoSaving: boolean
  lastSaved?: Date
  
  // Actions
  addEntry: (entryData: JournalFormData) => void
  importEntry: (entry: JournalEntry) => void
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void
  deleteEntry: (id: string) => void
  setFilter: (filter: JournalFilter) => void
  setSearchQuery: (query: string) => void
  openModal: () => void
  closeModal: () => void
  selectEntry: (entry: JournalEntry) => void
  setAutoSaving: (saving: boolean) => void
  autoSaveEntry: (id: string, content: string) => void
  
  // Computed
  getFilteredEntries: () => JournalEntry[]
  getEntriesByDate: () => Record<string, JournalEntry[]>
  getMoodStats: () => Record<Mood, number>
  getTagUsage: () => Record<string, number>
}

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'very-low',
    emoji: '😢',
    label: 'Very Low',
    color: 'text-red-600'
  },
  {
    id: 'low',
    emoji: '😕',
    label: 'Low',
    color: 'text-orange-600'
  },
  {
    id: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    color: 'text-gray-600'
  },
  {
    id: 'good',
    emoji: '😊',
    label: 'Good',
    color: 'text-green-600'
  },
  {
    id: 'great',
    emoji: '🤩',
    label: 'Great',
    color: 'text-blue-600'
  }
]

export const LINK_TYPES = [
  {
    id: 'goals',
    icon: '🎯',
    label: 'Goals',
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    id: 'tasks',
    icon: '✅',
    label: 'Tasks',
    color: 'bg-green-50 text-green-700 border-green-200'
  },
  {
    id: 'habits',
    icon: '🔄',
    label: 'Habits',
    color: 'bg-purple-50 text-purple-700 border-purple-200'
  }
] as const