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
    addToCalendar: false,
    calendarStartTime: '09:00',
    calendarDuration: 60,
    calendarDate: ''
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
      addToCalendar: false,
      calendarStartTime: '09:00',
      calendarDuration: 60,
      calendarDate: ''
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
        addToCalendar: editingTask.addToCalendar || false,
        calendarStartTime: editingTask.calendarStartTime || '09:00',
        calendarDuration: editingTask.calendarDuration || 60,
        calendarDate: editingTask.calendarDate || ''
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
      // Merge new subtask names with original completion states
      processedSubtasks = processedSubtasks.map((subtaskName, index) => {
        const originalSubtask = originalSubtasks.find(orig => 
          (typeof orig === 'string' ? orig : orig.name) === subtaskName
        );
        
        if (originalSubtask && typeof originalSubtask === 'object') {
          // Preserve the original subtask object with its completion state
          return {
            ...originalSubtask,
            name: subtaskName  // Update name in case it was modified
          };
        } else if (originalSubtasks[index] && typeof originalSubtasks[index] === 'object') {
          // Use original subtask but update the name
          return {
            ...originalSubtasks[index],
            name: subtaskName
          };
        }
        
        // New subtask - return as string (will be converted by store)
        return subtaskName;
      });
    }

    const taskData = {
      ...formData,
      type: taskType,
      dueDate,
      subtasks: processedSubtasks,
      shoppingItems: taskType === 'to-buy' ? formData.shoppingItems.filter(item => item.name && item.name.trim() !== '') : []
    }

    console.log('📋 TaskCreationModal: Submitting task data:', {
      taskName: taskData.name,
      taskType: taskType,
      addToCalendar: taskData.addToCalendar,
      calendarDate: taskData.calendarDate,
      calendarStartTime: taskData.calendarStartTime,
      calendarDuration: taskData.calendarDuration,
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
      shoppingItems: [...prev.shoppingItems, { name: '', quantity: '' }]
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
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Shopping Items</label>
                  <button
                    type="button"
                    onClick={addShoppingItem}
                    className="accent-text-600 hover-accent-text-dark text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.shoppingItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => updateShoppingItem(index, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-16 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus-accent-ring focus-accent-border outline-none text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateShoppingItem(index, 'name', e.target.value)}
                          placeholder="Item name"
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
              </div>
            )}

            {/* Subtasks - For Standard and Deadline tasks */}
            {taskType !== 'to-buy' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Subtasks</label>
                  <button
                    type="button"
                    onClick={addSubtask}
                    className="accent-text-600 hover-accent-text-dark text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Subtask
                  </button>
                </div>
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
                            <label className="block text-sm font-semibold text-orange-700 dark:text-orange-300 mb-2">Start Date</label>
                            <input
                              type="date"
                              value={formData.recurrenceStartDate}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                recurrenceStartDate: e.target.value
                              }))}
                              className="w-full px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
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

                  {/* Add to Calendar Section */}
                  <div>
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors">
                      <span className="text-lg">📅</span>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 dark:text-gray-200">Add to Calendar</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Create calendar time blocks for this task</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          addToCalendar: !prev.addToCalendar,
                          // Auto-populate calendar date if enabling calendar integration and no date is set
                          calendarDate: !prev.addToCalendar && !prev.calendarDate && !prev.isRecurring 
                            ? new Date().toISOString().split('T')[0] 
                            : prev.calendarDate
                        }))}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          formData.addToCalendar 
                            ? 'bg-purple-500' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <div className={`absolute w-5 h-5 bg-white rounded-full transition-transform top-0.5 ${
                          formData.addToCalendar ? 'translate-x-6' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>

                    {formData.addToCalendar && (
                      <div className="mt-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg space-y-4 border border-purple-200 dark:border-purple-800">
                        {/* Calendar Date - Always show for non-recurring tasks */}
                        {!formData.isRecurring && (
                          <div>
                            <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Calendar Date</label>
                            <input
                              type="date"
                              value={formData.calendarDate}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                calendarDate: e.target.value
                              }))}
                              className="w-full px-3 py-2 border border-purple-300 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              required
                            />
                            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                              Required for calendar integration
                            </div>
                          </div>
                        )}
                        
                        {/* Time Settings */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Start Time</label>
                            <input
                              type="time"
                              value={formData.calendarStartTime}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                calendarStartTime: e.target.value
                              }))}
                              className="w-full px-3 py-2 border border-purple-300 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Duration (minutes)</label>
                            <input
                              type="number"
                              min="15"
                              max="480"
                              step="15"
                              placeholder="60"
                              value={formData.calendarDuration !== 60 ? formData.calendarDuration : ''}
                              onChange={(e) => setFormData(prev => ({ 
                                ...prev, 
                                calendarDuration: parseInt(e.target.value) || 60
                              }))}
                              className="w-full px-3 py-2 border border-purple-300 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>

                        {/* Calendar Preview */}
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-1">Calendar Preview</div>
                          <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                            <span className="text-lg">📋</span>
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{formData.name || 'Task Name'}</div>
                              <div className="text-xs opacity-90">
                                {formData.calendarStartTime} - {(() => {
                                  if (!formData.calendarStartTime) return '';
                                  const [hours, minutes] = formData.calendarStartTime.split(':').map(Number);
                                  const totalMinutes = hours * 60 + minutes + formData.calendarDuration;
                                  const endHours = Math.floor(totalMinutes / 60) % 24;
                                  const endMins = totalMinutes % 60;
                                  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
                                })()} ({formData.calendarDuration}min)
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

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