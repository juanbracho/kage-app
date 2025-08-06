export interface Task {
  id: string
  name: string
  description?: string
  type: TaskType
  status: TaskStatus
  priority: TaskPriority
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  goalId?: string
  subtasks: Subtask[]
  estimatedTime?: number
  location?: string
  reminderTime?: Date
  notes?: string
  tags: string[]
  shoppingItems?: ShoppingItem[]
  // Recurring task fields
  isRecurring?: boolean
  recurrenceType?: 'daily' | 'weekly' | 'monthly'
  recurrenceInterval?: number
  recurrenceStartDate?: string
  recurrenceEndDate?: string
  originalTaskId?: string
  recurrenceExceptions?: string[]
  // Calendar integration fields
  addToCalendar?: boolean
  calendarStartTime?: string
  calendarDuration?: number
  calendarDate?: string
  allDayTask?: boolean
}

export interface Subtask {
  id: string
  name: string
  completed: boolean
  createdAt: Date
}

export interface ShoppingItem {
  id: string
  name: string
  quantity?: string
  completed: boolean
}

export type TaskType = 'standard' | 'to-buy' | 'deadline'

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type TaskFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed'

export interface TaskSection {
  id: string
  title: string
  icon: string
  tasks: Task[]
  count: number
}

export interface TaskFormData {
  name: string
  description: string
  type: TaskType
  priority: TaskPriority
  dueDate?: Date | string
  goalId?: string
  estimatedTime?: number | string
  location?: string
  reminderTime?: Date | string
  notes: string
  tags: string[]
  subtasks: string[]
  shoppingItems?: Omit<ShoppingItem, 'id' | 'completed'>[]
  // Recurring task fields
  isRecurring?: boolean
  recurrenceType?: 'daily' | 'weekly' | 'monthly'
  recurrenceInterval?: number
  recurrenceStartDate?: string
  recurrenceEndDate?: string
  // Calendar integration fields
  addToCalendar?: boolean
  calendarStartTime?: string
  calendarDuration?: number
  calendarDate?: string
  allDayTask?: boolean
}

export interface TaskStore {
  tasks: Task[]
  currentFilter: TaskFilter
  isModalOpen: boolean
  selectedTask?: Task
  
  // Actions
  addTask: (taskData: TaskFormData) => string
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleTask: (id: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  setFilter: (filter: TaskFilter) => void
  openModal: () => void
  closeModal: () => void
  selectTask: (task: Task) => void
  
  // Computed
  getFilteredTasks: () => Task[]
  getTasksBySection: () => TaskSection[]
  getTaskCounts: () => Record<TaskFilter, number>
}