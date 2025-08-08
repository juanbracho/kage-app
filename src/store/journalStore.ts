import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { JournalEntry, JournalFormData, JournalFilter, JournalStore } from '../types/journal'

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

const isToday = (date: Date | string) => {
  const today = new Date()
  const compareDate = typeof date === 'string' ? new Date(date) : date
  return compareDate.toDateString() === today.toDateString()
}

const isThisWeek = (date: Date | string) => {
  const today = new Date()
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
  const weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6)
  const compareDate = typeof date === 'string' ? new Date(date) : date
  return compareDate >= weekStart && compareDate <= weekEnd
}

const isThisMonth = (date: Date | string) => {
  const today = new Date()
  const compareDate = typeof date === 'string' ? new Date(date) : date
  return compareDate.getMonth() === today.getMonth() && compareDate.getFullYear() === today.getFullYear()
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      entries: [],
      currentFilter: 'all',
      isModalOpen: false,
      selectedEntry: undefined,
      searchQuery: '',
      isAutoSaving: false,
      lastSaved: undefined,

      addEntry: (entryData: JournalFormData) => {
        const newEntry: JournalEntry = {
          id: generateId(),
          content: entryData.content,
          mood: entryData.mood || 'neutral',
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: entryData.tags.filter(tag => tag.trim() !== ''),
          linkedGoals: entryData.linkedGoals || [],
          linkedTasks: entryData.linkedTasks || [],
          linkedHabits: entryData.linkedHabits || [],
          characterCount: entryData.content.length
        }
        
        set(state => ({
          entries: [newEntry, ...state.entries],
          isModalOpen: false,
          lastSaved: new Date()
        }))
      },

      // Import entry preserving original dates (for data restore)
      importEntry: (entry: JournalEntry) => {
        // Ensure dates are Date objects (convert from string if needed)
        const importedEntry: JournalEntry = {
          ...entry,
          createdAt: typeof entry.createdAt === 'string' ? new Date(entry.createdAt) : entry.createdAt,
          updatedAt: typeof entry.updatedAt === 'string' ? new Date(entry.updatedAt) : entry.updatedAt,
          characterCount: entry.content.length
        }
        
        set(state => ({
          entries: [importedEntry, ...state.entries],
          lastSaved: new Date()
        }))
      },

      updateEntry: (id: string, updates: Partial<JournalEntry>) => {
        set(state => ({
          entries: state.entries.map(entry =>
            entry.id === id
              ? { 
                  ...entry, 
                  ...updates, 
                  updatedAt: new Date(),
                  characterCount: updates.content ? updates.content.length : entry.characterCount
                }
              : entry
          ),
          lastSaved: new Date()
        }))
      },

      deleteEntry: (id: string) => {
        set(state => ({
          entries: state.entries.filter(entry => entry.id !== id)
        }))
      },

      setFilter: (filter: JournalFilter) => {
        set({ currentFilter: filter })
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query })
      },

      openModal: () => {
        set({ isModalOpen: true, selectedEntry: undefined })
      },

      closeModal: () => {
        set({ isModalOpen: false, selectedEntry: undefined })
      },

      selectEntry: (entry: JournalEntry) => {
        set({ selectedEntry: entry, isModalOpen: true })
      },

      setAutoSaving: (saving: boolean) => {
        set({ isAutoSaving: saving })
      },

      autoSaveEntry: (id: string, content: string) => {
        set(state => {
          const entry = state.entries.find(e => e.id === id)
          if (!entry) return state

          return {
            entries: state.entries.map(e =>
              e.id === id
                ? { 
                    ...e, 
                    content, 
                    updatedAt: new Date(),
                    characterCount: content.length
                  }
                : e
            ),
            isAutoSaving: true
          }
        })

        // Auto-save indication
        setTimeout(() => {
          set(state => ({ 
            ...state, 
            isAutoSaving: false, 
            lastSaved: new Date() 
          }))
        }, 1000)
      },

      getFilteredEntries: () => {
        const { entries, currentFilter, searchQuery } = get()
        
        let filtered = entries

        // Apply date filter
        switch (currentFilter) {
          case 'today':
            filtered = entries.filter(entry => isToday(entry.createdAt))
            break
          case 'this-week':
            filtered = entries.filter(entry => isThisWeek(entry.createdAt))
            break
          case 'this-month':
            filtered = entries.filter(entry => isThisMonth(entry.createdAt))
            break
          default:
            filtered = entries
        }

        // Apply search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase()
          filtered = filtered.filter(entry =>
            entry.content.toLowerCase().includes(query) ||
            entry.tags.some(tag => tag.toLowerCase().includes(query))
          )
        }

        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      },

      getEntriesByDate: () => {
        const { entries } = get()
        const grouped: Record<string, JournalEntry[]> = {}
        
        entries.forEach(entry => {
          const entryDate = typeof entry.createdAt === 'string' ? new Date(entry.createdAt) : entry.createdAt
          const dateKey = entryDate.toISOString().split('T')[0]
          if (!grouped[dateKey]) {
            grouped[dateKey] = []
          }
          grouped[dateKey].push(entry)
        })

        // Sort each day's entries by time (newest first)
        Object.keys(grouped).forEach(date => {
          grouped[date].sort((a, b) => {
            const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt
            const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt
            return dateB.getTime() - dateA.getTime()
          })
        })

        return grouped
      },

      getMoodStats: () => {
        const { entries } = get()
        const stats = {
          'very-low': 0,
          'low': 0,
          'neutral': 0,
          'good': 0,
          'great': 0
        }
        
        entries.forEach(entry => {
          stats[entry.mood]++
        })
        
        return stats
      },

      getTagUsage: () => {
        const { entries } = get()
        const tagCount: Record<string, number> = {}
        
        entries.forEach(entry => {
          entry.tags.forEach(tag => {
            tagCount[tag] = (tagCount[tag] || 0) + 1
          })
        })
        
        return tagCount
      }
    }),
    {
      name: 'journal-store',
      version: 1
    }
  )
)