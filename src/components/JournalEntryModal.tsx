import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { useJournalStore } from '../store/journalStore'
import { useTaskStore } from '../store/taskStore'
import { useGoalStore } from '../store/goalStore'
import { useHabitStore } from '../store/habitStore'
import { MOOD_OPTIONS, LINK_TYPES, type Mood, type JournalFormData } from '../types/journal'
import LinkingDropdown from './LinkingDropdown'

interface JournalEntryModalProps {
  isOpen: boolean
  onClose: () => void
  defaultGoalId?: string
}

export default function JournalEntryModal({ isOpen, onClose, defaultGoalId }: JournalEntryModalProps) {
  const { addEntry, updateEntry, selectedEntry, isAutoSaving, setAutoSaving } = useJournalStore()
  const { tasks } = useTaskStore()
  const { getActiveGoals } = useGoalStore()
  const { habits } = useHabitStore()
  
  const goals = getActiveGoals()
  const activeHabits = habits
  
  const [formData, setFormData] = useState<JournalFormData>({
    content: '',
    mood: undefined,
    tags: [],
    linkedGoals: defaultGoalId ? [defaultGoalId] : [],
    linkedTasks: [],
    linkedHabits: []
  })
  
  const [characterCount, setCharacterCount] = useState(0)
  const [activeLinkTypes, setActiveLinkTypes] = useState<Set<string>>(new Set())
  const [tagsInput, setTagsInput] = useState('')
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<number | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Helper functions to transform store data for dropdowns
  const getDropdownItems = (type: string) => {
    switch (type) {
      case 'goals':
        return goals.map(goal => ({
          id: goal.id,
          name: goal.name,
          icon: goal.icon,
          color: goal.color,
          description: goal.description,
          progress: goal.progress?.percentage || 0,
          isCompleted: goal.isCompleted
        }))
      case 'tasks':
        return tasks.map(task => ({
          id: task.id,
          name: task.name,
          icon: '✅',
          description: task.description,
          isCompleted: task.status === 'completed'
        }))
      case 'habits':
        return activeHabits.map(habit => ({
          id: habit.id,
          name: habit.name,
          icon: habit.icon,
          color: habit.color,
          description: habit.description,
          progress: habit.streak
        }))
      default:
        return []
    }
  }

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (selectedEntry) {
        // Editing existing entry
        setFormData({
          content: selectedEntry.content,
          mood: selectedEntry.mood,
          tags: selectedEntry.tags,
          linkedGoals: selectedEntry.linkedGoals,
          linkedTasks: selectedEntry.linkedTasks,
          linkedHabits: selectedEntry.linkedHabits
        })
        setCharacterCount(selectedEntry.content.length)
        setTagsInput(selectedEntry.tags.join(', '))
        
        // Set active link types
        const activeTypes = new Set<string>()
        if (selectedEntry.linkedGoals.length > 0) activeTypes.add('goals')
        if (selectedEntry.linkedTasks.length > 0) activeTypes.add('tasks')
        if (selectedEntry.linkedHabits.length > 0) activeTypes.add('habits')
        setActiveLinkTypes(activeTypes)
      } else {
        // New entry
        resetForm()
      }
      textareaRef.current?.focus()
    }
  }, [isOpen, selectedEntry])

  const resetForm = () => {
    setFormData({
      content: '',
      mood: undefined,
      tags: [],
      linkedGoals: defaultGoalId ? [defaultGoalId] : [],
      linkedTasks: [],
      linkedHabits: []
    })
    setCharacterCount(0)
    setActiveLinkTypes(defaultGoalId ? new Set(['goals']) : new Set())
    setTagsInput('')
    setActiveDropdown(null)
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
      setAutoSaveTimeout(null)
    }
  }

  const handleClose = () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }
    resetForm()
    onClose()
  }

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }))
    setCharacterCount(content.length)
    
    // Auto-save logic
    if (selectedEntry) {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
      
      setAutoSaving(true)
      const timeout = setTimeout(() => {
        updateEntry(selectedEntry.id, { content })
        setAutoSaving(false)
      }, 1500)
      
      setAutoSaveTimeout(timeout)
    }
  }

  const handleMoodSelect = (mood: Mood) => {
    setFormData(prev => ({ ...prev, mood }))
  }

  const handleTagsChange = (value: string) => {
    setTagsInput(value)
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    setFormData(prev => ({ ...prev, tags }))
  }

  const toggleLinkType = (type: string) => {
    if (activeDropdown === type) {
      // Close dropdown if it's already open
      setActiveDropdown(null)
    } else {
      // Open dropdown for this type
      setActiveDropdown(type)
    }
  }

  const handleItemSelect = (type: string, itemId: string) => {
    const linkKey = `linked${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof JournalFormData
    const currentItems = formData[linkKey] as string[]
    
    if (!currentItems.includes(itemId)) {
      setFormData(prev => ({
        ...prev,
        [linkKey]: [...currentItems, itemId]
      }))
      
      // Activate link type if not already active
      if (!activeLinkTypes.has(type)) {
        const newActiveTypes = new Set(activeLinkTypes)
        newActiveTypes.add(type)
        setActiveLinkTypes(newActiveTypes)
      }
    }
  }

  const handleItemDeselect = (type: string, itemId: string) => {
    const linkKey = `linked${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof JournalFormData
    const updatedItems = (formData[linkKey] as string[]).filter(id => id !== itemId)
    
    setFormData(prev => ({
      ...prev,
      [linkKey]: updatedItems
    }))
    
    // If no more items of this type, deactivate link type
    if (updatedItems.length === 0) {
      const newActiveTypes = new Set(activeLinkTypes)
      newActiveTypes.delete(type)
      setActiveLinkTypes(newActiveTypes)
    }
  }

  const removeLinkedItem = (type: string, itemId: string) => {
    handleItemDeselect(type, itemId)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedEntry) {
      updateEntry(selectedEntry.id, {
        content: formData.content,
        mood: formData.mood || 'neutral',
        tags: formData.tags,
        linkedGoals: formData.linkedGoals,
        linkedTasks: formData.linkedTasks,
        linkedHabits: formData.linkedHabits
      })
    } else {
      addEntry({
        ...formData,
        mood: formData.mood || 'neutral'
      })
    }
    
    handleClose()
  }

  const canSave = characterCount >= 10

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 md:p-5">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 text-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            ✍️ {selectedEntry ? 'Edit' : 'New'} Journal Entry
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Entry Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                What's on your mind?
              </label>
              <textarea
                ref={textareaRef}
                value={formData.content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="What's on your mind? Reflect on your progress, share your thoughts, or write about your day..."
                spellCheck="true"
                className="w-full min-h-[120px] p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-700 focus-accent-border focus:ring-2 focus-accent-ring outline-none transition-all resize-y placeholder-gray-500 dark:placeholder-gray-400"
                style={{ lineHeight: '1.5' }}
              />
              {characterCount >= 100 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-right mt-2">
                  {characterCount} characters
                </div>
              )}
            </div>

            {/* Mood Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                How are you feeling?
              </label>
              <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <div className="flex gap-4 justify-between items-center">
                  {MOOD_OPTIONS.map(mood => (
                    <button
                      key={mood.id}
                      type="button"
                      onClick={() => handleMoodSelect(mood.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all hover:scale-105 ${
                        formData.mood === mood.id
                          ? 'bg-accent-100 dark:bg-accent-900/30 shadow-sm'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                      style={formData.mood === mood.id ? {
                        backgroundColor: 'var(--accent-color-light, #FB923C)',
                        color: 'var(--accent-color, #FF7101)'
                      } : {}}
                    >
                      <div className={`text-3xl transition-transform ${
                        formData.mood === mood.id ? 'scale-110' : ''
                      }`}>
                        {mood.emoji}
                      </div>
                      <div className={`text-xs font-semibold ${
                        formData.mood === mood.id 
                          ? 'text-white' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {mood.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cross-Feature Linking */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Link to your progress
              </label>
              <div className="relative">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {LINK_TYPES.map(linkType => {
                    const linkKey = `linked${linkType.id.charAt(0).toUpperCase() + linkType.id.slice(1)}` as keyof JournalFormData
                    const selectedCount = (formData[linkKey] as string[]).length
                    const isActive = selectedCount > 0
                    
                    return (
                      <button
                        key={linkType.id}
                        type="button"
                        data-dropdown-toggle
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleLinkType(linkType.id)
                        }}
                        className={`w-full flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all ${
                          isActive
                            ? 'accent-border-500 accent-bg-50 dark:accent-bg-900'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5'
                        }`}
                      >
                        <div className="text-xl">{linkType.icon}</div>
                        <div className={`text-xs font-semibold ${
                          isActive ? 'accent-text-600 dark:accent-text-400' : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {linkType.label}
                          {selectedCount > 0 && (
                            <div className="text-xs mt-1 opacity-75">
                              {selectedCount} selected
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {/* Full-width dropdown positioned over the entire card area */}
                {activeDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50">
                    {LINK_TYPES.map(linkType => {
                      if (activeDropdown !== linkType.id) return null
                      
                      const linkKey = `linked${linkType.id.charAt(0).toUpperCase() + linkType.id.slice(1)}` as keyof JournalFormData
                      
                      return (
                        <LinkingDropdown
                          key={linkType.id}
                          isOpen={true}
                          onClose={() => setActiveDropdown(null)}
                          items={getDropdownItems(linkType.id)}
                          selectedItems={formData[linkKey] as string[]}
                          onItemSelect={(itemId) => handleItemSelect(linkType.id, itemId)}
                          onItemDeselect={(itemId) => handleItemDeselect(linkType.id, itemId)}
                          title={linkType.label}
                          icon={linkType.icon}
                          emptyMessage={`No ${linkType.label.toLowerCase()} available`}
                          searchPlaceholder={`Search ${linkType.label.toLowerCase()}...`}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
              
              {/* Selected Links Display */}
              {(formData.linkedTasks.length > 0 || formData.linkedGoals.length > 0 || formData.linkedHabits.length > 0) && (
                <div className="space-y-3">
                  {/* Goals */}
                  {formData.linkedGoals.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                        🎯 Linked Goals ({formData.linkedGoals.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.linkedGoals.map(goalId => {
                          const goal = goals.find(g => g.id === goalId)
                          if (!goal) return null
                          return (
                            <div key={goalId} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800">
                              <span className="text-lg">{goal.icon}</span>
                              <span className="font-medium">{goal.name}</span>
                              {goal.progress && (
                                <span className="text-xs opacity-75">
                                  ({Math.round(goal.progress.percentage || 0)}%)
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  removeLinkedItem('goals', goalId)
                                }}
                                className="w-4 h-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-800 transition-colors ml-1"
                              >
                                ×
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tasks */}
                  {formData.linkedTasks.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                        ✅ Linked Tasks ({formData.linkedTasks.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.linkedTasks.map(taskId => {
                          const task = tasks.find(t => t.id === taskId)
                          if (!task) return null
                          return (
                            <div key={taskId} className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 dark:bg-green-900 dark:text-green-300 dark:border-green-800">
                              <span className="text-lg">✅</span>
                              <span className="font-medium">{task.name}</span>
                              {task.status === 'completed' && (
                                <span className="text-xs bg-green-100 text-green-600 px-1 py-0.5 rounded">
                                  Done
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  removeLinkedItem('tasks', taskId)
                                }}
                                className="w-4 h-4 bg-green-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-green-800 transition-colors ml-1"
                              >
                                ×
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Habits */}
                  {formData.linkedHabits.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                        🔄 Linked Habits ({formData.linkedHabits.length})
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.linkedHabits.map(habitId => {
                          const habit = activeHabits.find(h => h.id === habitId)
                          if (!habit) return null
                          return (
                            <div key={habitId} className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800">
                              <span className="text-lg">{habit.icon}</span>
                              <span className="font-medium">{habit.name}</span>
                              {habit.streak > 0 && (
                                <span className="text-xs bg-purple-100 text-purple-600 px-1 py-0.5 rounded">
                                  {habit.streak} day streak
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  removeLinkedItem('habits', habitId)
                                }}
                                className="w-4 h-4 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-purple-800 transition-colors ml-1"
                              >
                                ×
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Tags (optional)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="Add tags separated by commas..."
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus-accent-border focus:ring-2 focus-accent-ring outline-none transition-all placeholder-gray-500 dark:placeholder-gray-400"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use tags to organize and find your entries later
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className={`w-1.5 h-1.5 rounded-full ${isAutoSaving ? 'accent-bg-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span>{isAutoSaving ? 'Saving...' : 'Auto-saving...'}</span>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSave}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  canSave
                    ? 'accent-bg-500 text-white shadow-lg hover-accent-bg-dark hover:shadow-xl hover:-translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedEntry ? 'Update' : 'Save'} Entry
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}