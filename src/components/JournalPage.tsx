import { useState, useEffect } from 'react'
import { Plus, Search, Edit3, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useJournalStore } from '../store/journalStore'
import { useTaskStore } from '../store/taskStore'
import { MOOD_OPTIONS, type JournalFilter } from '../types/journal'
import JournalEmpty from './JournalEmpty'
import JournalEntryModal from './JournalEntryModal'
import { usePageCreationSwipe } from '../hooks/useSwipeGesture'

export default function JournalPage() {
  const { 
    entries, 
    currentFilter, 
    searchQuery, 
    isModalOpen,
    getFilteredEntries,
    setFilter,
    setSearchQuery,
    openModal,
    closeModal,
    addEntry,
    selectEntry,
    deleteEntry
  } = useJournalStore()
  
  const { tasks } = useTaskStore()

  const [showSearch, setShowSearch] = useState(false)
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [quickReflection, setQuickReflection] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>('neutral')
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set())
  const filteredEntries = getFilteredEntries()

  // Auto-hide search after inactivity
  useEffect(() => {
    if (showSearch && !searchQuery) {
      // Start timeout to hide search after 3 seconds of inactivity
      const timeout = setTimeout(() => {
        setShowSearch(false)
      }, 3000)
      
      setSearchTimeout(timeout)
      
      return () => {
        if (timeout) clearTimeout(timeout)
      }
    } else if (searchTimeout) {
      // Clear timeout if user is typing
      clearTimeout(searchTimeout)
      setSearchTimeout(null)
    }
  }, [showSearch, searchQuery])

  // Clear timeout on component unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [])

  const handleCreateEntry = () => {
    openModal()
  }

  // Add swipe up to create journal entry gesture
  const creationSwipeHandlers = usePageCreationSwipe(handleCreateEntry);

  // Listen for custom event to open journal modal from dashboard
  useEffect(() => {
    const handleOpenJournalModal = () => {
      handleCreateEntry();
    };

    window.addEventListener('openJournalModal', handleOpenJournalModal);
    return () => window.removeEventListener('openJournalModal', handleOpenJournalModal);
  }, []);

  const handleEditEntry = (entry: any) => {
    selectEntry(entry)
  }

  const toggleEntryExpansion = (entryId: string) => {
    const newExpanded = new Set(expandedEntries)
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId)
    } else {
      newExpanded.add(entryId)
    }
    setExpandedEntries(newExpanded)
  }

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      deleteEntry(entryId)
    }
  }

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood)
  }

  const handleQuickSave = () => {
    if (quickReflection.trim().length >= 10) {
      addEntry({
        content: quickReflection,
        mood: selectedMood,
        tags: [],
        linkedGoals: [],
        linkedTasks: [],
        linkedHabits: []
      })
      setQuickReflection('')
      setSelectedMood('neutral')
    }
  }

  const formatDate = (date: Date | string) => {
    const now = new Date()
    const entryDate = new Date(date)
    
    // Reset time to midnight for accurate day comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const entryDay = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate())
    
    const diffTime = today.getTime() - entryDay.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    
    // For dates older than yesterday, show mm-dd-yy format
    return entryDate.toLocaleDateString('en-US', { 
      month: '2-digit', 
      day: '2-digit',
      year: '2-digit'
    })
  }

  const getMoodEmoji = (mood: string) => {
    const moodOption = MOOD_OPTIONS.find(option => option.id === mood)
    return moodOption?.emoji || '😐'
  }

  const getPreviewText = (content: string, isExpanded: boolean, maxLength: number = 150) => {
    if (isExpanded || content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const isContentTruncated = (content: string, maxLength: number = 150) => {
    return content.length > maxLength
  }

  const filterCounts = {
    all: entries.length,
    today: entries.filter(entry => {
      const today = new Date()
      const entryDate = new Date(entry.createdAt)
      return entryDate.toDateString() === today.toDateString()
    }).length,
    'this-week': entries.filter(entry => {
      const today = new Date()
      const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
      const entryDate = new Date(entry.createdAt)
      return entryDate >= weekStart
    }).length,
    'this-month': entries.filter(entry => {
      const today = new Date()
      const entryDate = new Date(entry.createdAt)
      return entryDate.getMonth() === today.getMonth() && 
             entryDate.getFullYear() === today.getFullYear()
    }).length
  }

  // Show empty state if no entries
  if (entries.length === 0) {
    return (
      <div>
        <JournalEmpty onCreateEntry={handleCreateEntry} />
        <JournalEntryModal isOpen={isModalOpen} onClose={closeModal} />
      </div>
    )
  }

  return (
    <div {...creationSwipeHandlers} className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Journal</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button 
            onClick={handleCreateEntry}
            className="w-12 h-12 bg-gradient-to-r accent-gradient rounded-2xl text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your journal entries..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus-accent-ring focus-accent-border outline-none"
            autoFocus
          />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-4 gap-1">
          {[
            { id: 'all', label: 'All', count: filterCounts.all },
            { id: 'today', label: 'Today', count: filterCounts.today },
            { id: 'this-week', label: 'Week', count: filterCounts['this-week'] },
            { id: 'this-month', label: 'Month', count: filterCounts['this-month'] }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setFilter(filter.id as JournalFilter)}
              className={`px-2 py-3 rounded-lg font-medium text-sm transition-all text-center ${
                currentFilter === filter.id
                  ? 'accent-bg-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="truncate">{filter.label}</div>
              <div className={`text-xs mt-0.5 px-1.5 py-0.5 rounded-full inline-block ${
                currentFilter === filter.id 
                  ? 'bg-white/20' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {filter.count}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Reflection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 accent-bg-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">✍️</span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">Quick Reflection</h3>
        </div>
        
        <textarea
          value={quickReflection}
          onChange={(e) => setQuickReflection(e.target.value)}
          placeholder="How are you feeling? What's on your mind? Any insights from today?"
          className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg resize-none focus:ring-2 focus-accent-ring focus-accent-border outline-none text-sm"
          rows={3}
        />
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            {MOOD_OPTIONS.map(mood => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`w-10 h-10 rounded-lg text-xl transition-all hover:scale-110 ${
                  selectedMood === mood.id
                    ? 'accent-bg-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={mood.label}
              >
                {mood.emoji}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleQuickSave}
            disabled={quickReflection.trim().length < 10}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              quickReflection.trim().length >= 10
                ? 'accent-bg-500 text-white hover-accent-bg-dark'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Save Entry
          </button>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4 opacity-50">📝</div>
            <div className="font-semibold text-lg mb-2">No entries found</div>
            <div className="text-sm">
              {searchQuery ? 'Try a different search term' : 'No entries match the selected filter'}
            </div>
          </div>
        ) : (
          filteredEntries.map(entry => {
            const isExpanded = expandedEntries.has(entry.id)
            const isTruncated = isContentTruncated(entry.content)
            
            return (
            <div
              key={entry.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatDate(entry.createdAt)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(entry.createdAt).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditEntry(entry)
                    }}
                    className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteEntry(entry.id)
                    }}
                    className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>

              <div 
                className={`text-gray-900 dark:text-white leading-relaxed mb-3 transition-all duration-300 ${isTruncated ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg p-2 -m-2 transition-colors' : ''}`}
                onClick={isTruncated ? () => toggleEntryExpansion(entry.id) : undefined}
              >
                {getPreviewText(entry.content, isExpanded)}
                {isTruncated && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500 dark:text-gray-400 transition-all duration-200">
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 transition-transform duration-200" />
                        <span>Read less</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                        <span>Read more</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {entry.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Linked Items */}
              {(entry.linkedTasks.length > 0 || entry.linkedGoals.length > 0 || entry.linkedHabits.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {entry.linkedTasks.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                      ✅ {entry.linkedTasks.length} task{entry.linkedTasks.length > 1 ? 's' : ''}
                    </div>
                  )}
                  {entry.linkedGoals.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                      🎯 {entry.linkedGoals.length} goal{entry.linkedGoals.length > 1 ? 's' : ''}
                    </div>
                  )}
                  {entry.linkedHabits.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                      🔄 {entry.linkedHabits.length} habit{entry.linkedHabits.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {entry.characterCount} characters
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">How was your day?</span>
                  <div className="text-xl">{getMoodEmoji(entry.mood)}</div>
                </div>
              </div>
            </div>
            )
          })
        )}
      </div>

      <JournalEntryModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  )
}