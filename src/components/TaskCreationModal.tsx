import { useState, useEffect } from 'react'
import { X, Clock, ShoppingCart, AlertTriangle, Plus, Trash2 } from 'lucide-react'
import { useGoalStore } from '../store/goalStore'
import { useCalendarStore } from '../store/calendarStore'

interface TaskCreationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskData: any) => void
  editingTask?: any
  defaultGoalId?: string
}

type TaskType = 'standard' | 'to-buy' | 'deadline'
type Priority = 'low' | 'medium' | 'high' | 'urgent'

export default function TaskCreationModal({ isOpen, onClose, onSubmit, editingTask, defaultGoalId }: TaskCreationModalProps) {
  const { getActiveGoals } = useGoalStore()
  const { addTimeBlock } = useCalendarStore()
  const goals = getActiveGoals()
  
  const [taskType, setTaskType] = useState<TaskType>('standard')
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [originalSubtasks, setOriginalSubtasks] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium' as Priority,
    dueDate: '',
    dueTime: '',
    goalId: defaultGoalId || '',
    estimatedTime: '',
    location: '',
    notes: '',
    tags: [] as string[],
    subtasks: [] as string[],
    shoppingItems: [{ name: '', quantity: '' }],
    isRecurring: false,
    recurrenceType: 'weekly' as 'daily' | 'weekly' | 'monthly',
    recurrenceInterval: 1,
    recurrenceStartDate: '',
    recurrenceEndDate: '',
  })

  const resetForm = () => {
    setTaskType('standard')
    setShowAdvancedSettings(false)
    setFormData({
      name: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      dueTime: '',
      goalId: defaultGoalId || '',
      estimatedTime: '',
      location: '',
      notes: '',
      tags: [],
      subtasks: [],
      shoppingItems: [{ name: '', quantity: '' }],
      isRecurring: false,
      recurrenceType: 'weekly',
      recurrenceInterval: 1,
      recurrenceStartDate: '',
      recurrenceEndDate: '',
    })
  }

  // Populate form when editing
  useEffect(() => {
    if (isOpen && editingTask) {
      setTaskType(editingTask.type || 'standard')
      // Store original subtasks to preserve completion states
      setOriginalSubtasks(editingTask.subtasks || [])
      setFormData({
        name: editingTask.name || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'medium',
        dueDate: editingTask.dueDate ? (() => {
          const date = new Date(editingTask.dueDate);
          return date.getFullYear() + '-' + 
                 String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(date.getDate()).padStart(2, '0');
        })() : '',
        dueTime: editingTask.dueDate ? (() => {
          const date = new Date(editingTask.dueDate);
          return String(date.getHours()).padStart(2, '0') + ':' + 
                 String(date.getMinutes()).padStart(2, '0');
        })() : '',
        goalId: editingTask.goalId || '',
        estimatedTime: editingTask.estimatedTime ? editingTask.estimatedTime.toString() : '',
        location: editingTask.location || '',
        notes: editingTask.notes || '',
        tags: editingTask.tags || [],
        subtasks: editingTask.subtasks?.length ? editingTask.subtasks.map((st: any) => {
          if (typeof st === 'string') return st;
          return st.name || '';
        }) : [],
        shoppingItems: editingTask.shoppingItems?.length ? editingTask.shoppingItems : [{ name: '', quantity: '' }],
        isRecurring: editingTask.isRecurring || false,
        recurrenceType: editingTask.recurrenceType || 'weekly',
        recurrenceInterval: editingTask.recurrenceInterval || 1,
        recurrenceStartDate: editingTask.recurrenceStartDate || '',
        recurrenceEndDate: editingTask.recurrenceEndDate || '',
      })
    } else if (isOpen && !editingTask) {
      setOriginalSubtasks([])
      resetForm()
    }
  }, [isOpen, editingTask])

  const handleClose = () => {
    resetForm()
    onClose()
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate recurring task requirements
    if (formData.isRecurring && !formData.recurrenceStartDate) {
      alert('Please provide a start date for recurring tasks');
      return;
    }
    
    // Combine date and time for deadline tasks, and set dueDate for recurring tasks
    let dueDate: Date | undefined = undefined
    if (taskType === 'deadline' && formData.dueDate) {
      const dateTimeString = formData.dueTime ? `${formData.dueDate}T${formData.dueTime}` : `${formData.dueDate}T00:00`
      dueDate = new Date(dateTimeString)
    } else if (formData.isRecurring && formData.recurrenceStartDate) {
      // For recurring tasks, set dueDate to recurrenceStartDate so the task store can use it
      dueDate = new Date(formData.recurrenceStartDate)
    }
    
    // Preserve subtask completion states when editing
    let processedSubtasks = formData.subtasks.filter(s => s && s.trim() !== '').map(s => s.trim());
    
    if (editingTask && originalSubtasks.length > 0) {
      // Use index-based preservation to maintain completion states
      processedSubtasks = processedSubtasks.map((subtaskName, index) => {
        // If we have an original subtask at this index, preserve its state
        if (index < originalSubtasks.length) {
          const originalSubtask = originalSubtasks[index];
          
          if (typeof originalSubtask === 'object' && originalSubtask.id) {
            // Preserve the original subtask object with its completion state
            return {
              ...originalSubtask,
              name: subtaskName  // Update name in case it was modified
            };
          } else if (typeof originalSubtask === 'string') {
            // Convert string to object while preserving it as incomplete
            return {
              id: `temp-${index}`,
              name: subtaskName,
              completed: false,
              createdAt: new Date()
            };
          }
        }
        
        // New subtask beyond original array length - return as string (will be converted by store)
        return subtaskName;
      });
    }

    // Process shopping items similar to subtasks to preserve completion states
    let processedShoppingItems: any[] = [];
    if (taskType === 'to-buy') {
      processedShoppingItems = formData.shoppingItems
        .filter(item => item.name && item.name.trim() !== '')
        .map((item, index) => {
          // If editing task, try to preserve existing shopping item structure
          if (editingTask && editingTask.shoppingItems && editingTask.shoppingItems[index]) {
            const originalItem = editingTask.shoppingItems[index];
            return {
              id: originalItem.id || `shop-${index}-${Date.now()}`,
              name: item.name.trim(),
              quantity: item.quantity || '1',
              completed: originalItem.completed || false
            };
          }
          // New shopping item
          return {
            name: item.name.trim(),
            quantity: item.quantity || '1'
          };
        });
    }

    const taskData = {
      ...formData,
      type: taskType,
      dueDate,
      subtasks: processedSubtasks,
      shoppingItems: processedShoppingItems
    }

    console.log('📋 TaskCreationModal: Submitting task data:', {
      taskName: taskData.name,
      taskType: taskType,
      isRecurring: taskData.isRecurring,
      recurrenceStartDate: taskData.recurrenceStartDate,
      dueDate: taskData.dueDate
    });
    
    // Create calendar entry for deadline tasks with both date and time
    if (taskType === 'deadline' && formData.dueDate && formData.dueTime && !editingTask) {
      console.log('Creating calendar entry:', {
        date: formData.dueDate,
        time: formData.dueTime,
        name: formData.name
      });
      
      addTimeBlock({
        title: formData.name,
        description: formData.description || 'Task deadline',
        date: formData.dueDate,
        startTime: formData.dueTime,
        durationMinutes: parseInt(formData.estimatedTime) || 60, // Default to 1 hour if no estimate
        blockType: 'admin', // Use 'admin' for administrative/deadline tasks
        icon: '📋',
        color: 'linear-gradient(135deg, #EF4444, #DC2626)', // Red gradient for deadlines
        linkedItemType: 'task',
        linkedItemId: taskData.name // Link back to the task
      })
    }
    
    onSubmit(taskData)
    handleClose()
  }

  const addSubtask = () => {
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, '']
    }))
  }

  const removeSubtask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }))
  }

  const updateSubtask = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map((subtask, i) => i === index ? value : subtask)
    }))
  }

  const addShoppingItem = () => {
    setFormData(prev => ({
      ...prev,
      shoppingItems: [...prev.shoppingItems, { name: '', quantity: '1' }]
    }))
  }

  const removeShoppingItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      shoppingItems: prev.shoppingItems.filter((_, i) => i !== index)
    }))
  }

  const updateShoppingItem = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      shoppingItems: prev.shoppingItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4 md:p-5">
      <div 
        className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm sm:max-w-md lg:max-w-lg max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300 text-gray-900 dark:text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{editingTask ? 'Edit Task' : 'New Task'}</h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
          <div className="p-6 space-y-6">
            {/* Task Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Task Type</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { id: 'standard', label: 'Standard', icon: Clock, color: 'bg-blue-50 border-blue-200 text-blue-700', desc: 'Regular task with optional subtasks' },
                  { id: 'to-buy', label: 'To-Buy', icon: ShoppingCart, color: 'bg-amber-50 border-amber-200 text-amber-700', desc: 'Shopping list with quantities' },
                  { id: 'deadline', label: 'Deadline', icon: AlertTriangle, color: 'bg-red-50 border-red-200 text-red-700', desc: 'Time-sensitive task' }
                ].map(type => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setTaskType(type.id as TaskType)}
                      className={`p-3 rounded-xl border-2 transition-all text-center min-h-[80px] flex flex-col justify-center items-center ${
                        taskType === type.id
                          ? `${type.color} border-opacity-100`
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mx-auto mb-1" />
                      <div className="text-xs font-medium mb-1">{type.label}</div>
                      <div className="text-xs opacity-75 leading-tight">{type.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Task Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Task Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                inputMode="text"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus-accent-ring focus-accent-border outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="What needs to be done?"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                inputMode="text"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus-accent-ring focus-accent-border outline-none transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Add more details..."
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Priority</label>
              <div className="grid grid-cols-4 gap-2 overflow-x-auto">
                {[
                  { id: 'low', label: 'Low', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200' },
                  { id: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
                  { id: 'high', label: 'High', color: 'bg-amber-100 text-amber-700' },
                  { id: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' }
                ].map(priority => (
                  <button
                    key={priority.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: priority.id as Priority }))}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-w-[60px] flex-shrink-0 text-center ${
                      formData.priority === priority.id
                        ? `${priority.color} ring-2 ring-offset-1 accent-ring-300`
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date & Time - Only for Deadline tasks */}
            {taskType === 'deadline' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus-accent-ring focus-accent-border outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Due Time</label>
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus-accent-ring focus-accent-border outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Goal Linking */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Link to Goal</label>
              <select
                value={formData.goalId}
                onChange={(e) => setFormData(prev => ({ ...prev, goalId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus-accent-ring focus-accent-border outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              >
                <option value="">No goal selected</option>
                {goals.length === 0 ? (
                  <option value="" disabled>No goals available - create a goal first</option>
                ) : (
                  goals.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.icon} {goal.name}
                    </option>
                  ))
                )}
              </select>
              {goals.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  💡 Create your first goal to link tasks and track progress!
                </p>
              )}
            </div>

            {/* Shopping Items - Only for To-Buy tasks */}
            {taskType === 'to-buy' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Shopping Items</label>
                <div className="space-y-3">
                  {formData.shoppingItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.quantity || '1'}
                          onChange={(e) => updateShoppingItem(index, 'quantity', e.target.value)}
                          placeholder="1"
                          className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus-accent-ring focus-accent-border outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateShoppingItem(index, 'name', e.target.value)}
                          placeholder="Item name"
                          inputMode="text"
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus-accent-ring focus-accent-border outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        {formData.shoppingItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeShoppingItem(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Add Item Button - Now at the bottom */}
                <button
                  type="button"
                  onClick={addShoppingItem}
                  className="w-full mt-3 py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg accent-text-600 hover-accent-text-dark text-sm font-medium flex items-center justify-center gap-2 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
            )}

            {/* Subtasks - For Standard and Deadline tasks */}
            {taskType !== 'to-buy' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Subtasks</label>
                <div className="space-y-2">
                  {formData.subtasks.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                      No subtasks added. Click "Add Subtask" to break this task into smaller steps.
                    </div>
                  ) : (
                    formData.subtasks.map((subtask, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={subtask}
                          onChange={(e) => updateSubtask(index, e.target.value)}
                          placeholder={`Subtask ${index + 1}`}
                          inputMode="text"
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus-accent-ring focus-accent-border outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <button
                          type="button"
                          onClick={() => removeSubtask(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                {/* Add Subtask Button - Now at the bottom */}
                <button
                  type="button"
                  onClick={addSubtask}
                  className="w-full mt-3 py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg accent-text-600 hover-accent-text-dark text-sm font-medium flex items-center justify-center gap-2 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Subtask
                </button>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus-accent-ring focus-accent-border outline-none transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Additional notes or reminders..."
              />
            </div>

            {/* Advanced Settings */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="flex items-center gap-3 w-full p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <span className="text-lg">⚙️</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">Advanced Settings</span>
                <span className={`ml-auto transition-transform ${showAdvancedSettings ? 'rotate-90' : ''}`}>▶</span>
              </button>
              
              {showAdvancedSettings && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-6">
                  
                  {/* Repeat Task Section */}
                  <div>
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors">
                      <span className="text-lg">🔁</span>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 dark:text-gray-200">Repeat Task</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Create recurring instances of this task</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, isRecurring: !prev.isRecurring }))}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          formData.isRecurring 
                            ? 'bg-orange-500' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div className={`absolute w-5 h-5 bg-white rounded-full transition-transform top-0.5 ${
                          formData.isRecurring ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>

                    {formData.isRecurring && (
                      <div className="mt-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg space-y-4 border border-orange-200 dark:border-orange-800">
                        {/* Recurrence Type */}
                        <div>
                          <label className="block text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">Repeat</label>
                          <select
                            value={formData.recurrenceType}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              recurrenceType: e.target.value as 'daily' | 'weekly' | 'monthly'
                            }))}
                            className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </div>

                        {/* Interval */}
                        <div>
                          <label className="block text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">Every</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="30"
                              placeholder="1"
                              value={formData.recurrenceInterval !== 1 ? formData.recurrenceInterval : ''}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                recurrenceInterval: parseInt(e.target.value) || 1
                              }))}
                              className="w-20 px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <span className="text-sm text-orange-600 dark:text-orange-400">
                              {formData.recurrenceType === 'daily' && 'day(s)'}
                              {formData.recurrenceType === 'weekly' && 'week(s)'}
                              {formData.recurrenceType === 'monthly' && 'month(s)'}
                            </span>
                          </div>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">Start Date *</label>
                            <input
                              type="date"
                              required={formData.isRecurring}
                              value={formData.recurrenceStartDate}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                recurrenceStartDate: e.target.value
                              }))}
                              className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            {!formData.recurrenceStartDate && (
                              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Start date is required for recurring tasks</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">End Date (Optional)</label>
                            <input
                              type="date"
                              value={formData.recurrenceEndDate}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                recurrenceEndDate: e.target.value
                              }))}
                              className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Calendar Integration Info - Only show for repetitive tasks */}
                  {formData.isRecurring && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📅</span>
                        <div>
                          <div className="font-semibold text-blue-800 dark:text-blue-200">Calendar Integration</div>
                          <div className="text-sm text-blue-600 dark:text-blue-300">Repetitive tasks automatically appear as all-day events in your calendar</div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
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
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}