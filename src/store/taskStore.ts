import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, TaskFilter, TaskFormData } from '../types/task'

interface TaskStore {
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
  toggleShoppingItem: (taskId: string, itemId: string) => void
  setFilter: (filter: TaskFilter) => void
  openModal: () => void
  closeModal: () => void
  selectTask: (task: Task) => void
  
  // Goal linking
  linkTaskToGoal: (taskId: string, goalId: string) => void
  unlinkTaskFromGoal: (taskId: string, goalId: string) => void
  getTasksByGoal: (goalId: string) => Task[]
  
  // Data cleanup
  cleanupEmptySubtasks: () => void
  
  // Recurring tasks
  generateRecurringTasks: (originalTask: Task) => void
  cleanupRecurringTasks: (originalTaskId: string) => void
  createCalendarEntryForTask: (task: Task) => void
  
  // Computed
  getFilteredTasks: () => Task[]
  getTasksBySection: () => { today: Task[], overdue: Task[], upcoming: Task[], noDueDate: Task[] }
  getTaskCounts: () => Record<TaskFilter, number>
}

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9)

const formatDateToString = (date: Date) => {
  // Use local date formatting to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isOverdue = (dueDate?: Date) => {
  if (!dueDate) return false
  const today = new Date()
  const due = new Date(dueDate)
  
  // A task is overdue if its due date is before today (not including today)
  // This ensures tasks due today stay in "Today" section, not "Overdue"
  return due.toDateString() !== today.toDateString() && due < today
}

const isToday = (dueDate?: Date) => {
  if (!dueDate) return false
  const today = new Date()
  const due = new Date(dueDate)
  return due.toDateString() === today.toDateString()
}

const isUpcoming = (dueDate?: Date) => {
  if (!dueDate) return false
  const today = new Date()
  const due = new Date(dueDate)
  
  // Exclude today's tasks (they belong in "Today" section)
  if (due.toDateString() === today.toDateString()) {
    return false
  }
  
  // Check if task is within the next 7 days (but not today)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 && diffDays <= 7
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      currentFilter: 'all',
      isModalOpen: false,
      selectedTask: undefined,

      addTask: (taskData: TaskFormData): string => {
        const taskId = generateId();
        const newTask: Task = {
          id: taskId,
          name: taskData.name,
          description: taskData.description,
          type: taskData.type,
          status: 'pending',
          priority: taskData.priority,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          goalId: taskData.goalId || undefined,
          estimatedTime: taskData.estimatedTime ? parseInt(taskData.estimatedTime.toString()) : undefined,
          location: taskData.location || undefined,
          reminderTime: taskData.reminderTime ? new Date(taskData.reminderTime) : undefined,
          notes: taskData.notes || undefined,
          tags: taskData.tags || [],
          subtasks: taskData.subtasks.filter(name => name && name.trim() !== '').map(name => ({
            id: generateId(),
            name: name.trim(),
            completed: false,
            createdAt: new Date()
          })),
          shoppingItems: taskData.shoppingItems?.map(item => ({
            id: generateId(),
            name: item.name,
            quantity: item.quantity,
            completed: false
          })) || []
        }
        
        set(state => ({
          tasks: [newTask, ...state.tasks],
          isModalOpen: false
        }))
        
        // Generate recurring tasks if applicable
        if (newTask.isRecurring) {
          console.log('📅 Generating recurring tasks for:', newTask.name);
          get().generateRecurringTasks(newTask);
        } else if (newTask.addToCalendar) {
          console.log('📅 Creating calendar entry for non-recurring task:', newTask.name);
          get().createCalendarEntryForTask(newTask);
        } else {
          console.log('📅 No calendar integration for task:', newTask.name, {
            isRecurring: newTask.isRecurring,
            addToCalendar: newTask.addToCalendar
          });
        }
        
        // Update goal progress if task is linked to a goal
        if (newTask.goalId) {
          import('./goalStore').then(({ useGoalStore }) => {
            useGoalStore.getState().updateGoalProgress(newTask.goalId!)
          }).catch(console.warn)
        }
        
        return taskId;
      },

      updateTask: (id: string, updates: Partial<Task>) => {
        const currentTask = get().tasks.find(task => task.id === id);
        const updatedTask = currentTask ? { ...currentTask, ...updates, updatedAt: new Date() } : null;
        
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          )
        }))
        
        // Update goal progress if task was/is linked to a goal
        if (updatedTask) {
          const goalIds = new Set([currentTask?.goalId, updatedTask.goalId].filter(Boolean));
          goalIds.forEach(goalId => {
            if (goalId) {
              import('./goalStore').then(({ useGoalStore }) => {
                useGoalStore.getState().updateGoalProgress(goalId)
              }).catch(console.warn)
            }
          })
        }
      },

      deleteTask: (id: string) => {
        const taskToDelete = get().tasks.find(task => task.id === id);
        
        // If deleting a recurring task (original), also delete all its instances
        if (taskToDelete?.isRecurring) {
          get().cleanupRecurringTasks(id);
        }
        
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }))
        
        // Update goal progress if deleted task was linked to a goal
        if (taskToDelete?.goalId) {
          import('./goalStore').then(({ useGoalStore }) => {
            useGoalStore.getState().updateGoalProgress(taskToDelete.goalId!)
          }).catch(console.warn)
        }
      },

      toggleTask: (id: string) => {
        const task = get().tasks.find(t => t.id === id);
        
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id === id) {
              const newStatus = task.status === 'completed' ? 'pending' : 'completed'
              return {
                ...task,
                status: newStatus,
                updatedAt: new Date()
              }
            }
            return task
          })
        }))
        
        // Update goal progress if task is linked to a goal
        if (task?.goalId) {
          import('./goalStore').then(({ useGoalStore }) => {
            useGoalStore.getState().updateGoalProgress(task.goalId!)
          }).catch(console.warn)
        }
      },

      toggleSubtask: (taskId: string, subtaskId: string) => {
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask =>
                  subtask.id === subtaskId
                    ? { ...subtask, completed: !subtask.completed }
                    : subtask
                ),
                updatedAt: new Date()
              }
            }
            return task
          })
        }))
      },

      toggleShoppingItem: (taskId: string, itemId: string) => {
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                shoppingItems: task.shoppingItems?.map(item =>
                  item.id === itemId
                    ? { ...item, completed: !item.completed }
                    : item
                ) || [],
                updatedAt: new Date()
              }
            }
            return task
          })
        }))
      },

      setFilter: (filter: TaskFilter) => {
        set({ currentFilter: filter })
      },

      openModal: () => {
        set({ isModalOpen: true })
      },

      closeModal: () => {
        set({ isModalOpen: false, selectedTask: undefined })
      },

      selectTask: (task: Task) => {
        set({ selectedTask: task })
      },

      getFilteredTasks: () => {
        const { tasks, currentFilter } = get()
        
        switch (currentFilter) {
          case 'today':
            return tasks.filter(task => 
              isToday(task.dueDate) && !isOverdue(task.dueDate) && task.status !== 'completed'
            )
          case 'upcoming':
            return tasks.filter(task => 
              isUpcoming(task.dueDate) && !isOverdue(task.dueDate) && !isToday(task.dueDate) && task.status !== 'completed'
            )
          case 'overdue':
            return tasks.filter(task => 
              isOverdue(task.dueDate) && task.status !== 'completed'
            )
          case 'completed':
            return tasks.filter(task => task.status === 'completed')
          default:
            return tasks
        }
      },

      getTasksBySection: () => {
        const { tasks } = get()
        
        const incompleteTasks = tasks.filter(task => task.status !== 'completed')
        
        return {
          overdue: incompleteTasks.filter(task => isOverdue(task.dueDate)),
          today: incompleteTasks.filter(task => 
            isToday(task.dueDate) && !isOverdue(task.dueDate)
          ),
          upcoming: incompleteTasks.filter(task => 
            isUpcoming(task.dueDate) && !isOverdue(task.dueDate) && !isToday(task.dueDate)
          ),
          noDueDate: incompleteTasks.filter(task => !task.dueDate)
        }
      },

      getTaskCounts: () => {
        const { tasks } = get()
        
        return {
          all: tasks.length,
          today: tasks.filter(task => 
            isToday(task.dueDate) && task.status !== 'completed'
          ).length,
          upcoming: tasks.filter(task => 
            isUpcoming(task.dueDate) && task.status !== 'completed'
          ).length,
          overdue: tasks.filter(task => 
            isOverdue(task.dueDate) && task.status !== 'completed'
          ).length,
          completed: tasks.filter(task => task.status === 'completed').length
        }
      },

      // Goal linking functions
      linkTaskToGoal: (taskId: string, goalId: string) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === taskId
              ? { ...task, goalId, updatedAt: new Date() }
              : task
          )
        }))
        
        // Update goal progress after linking
        import('./goalStore').then(({ useGoalStore }) => {
          useGoalStore.getState().updateGoalProgress(goalId)
        }).catch(console.warn)
      },

      unlinkTaskFromGoal: (taskId: string, goalId: string) => {
        set(state => ({
          tasks: state.tasks.map(task =>
            task.id === taskId && task.goalId === goalId
              ? { ...task, goalId: undefined, updatedAt: new Date() }
              : task
          )
        }))
        
        // Update goal progress after unlinking
        import('./goalStore').then(({ useGoalStore }) => {
          useGoalStore.getState().updateGoalProgress(goalId)
        }).catch(console.warn)
      },

      getTasksByGoal: (goalId: string) => {
        const { tasks } = get()
        return tasks.filter(task => task.goalId === goalId)
      },

      // Clean up empty subtasks from existing data and migrate string subtasks to objects
      cleanupEmptySubtasks: () => {
        set(state => ({
          tasks: state.tasks.map(task => ({
            ...task,
            subtasks: task.subtasks
              .filter((subtask: any) => {
                // Filter out empty subtasks
                if (typeof subtask === 'string') {
                  return subtask.trim() !== ''
                }
                return subtask.id && (subtask.name !== undefined && subtask.name !== null)
              })
              .map((subtask: any) => {
                // Convert string subtasks to proper objects
                if (typeof subtask === 'string') {
                  return {
                    id: generateId(),
                    name: subtask,
                    completed: false,
                    createdAt: new Date()
                  }
                }
                return subtask
              })
          }))
        }))
      },

      generateRecurringTasks: (originalTask: Task) => {
        if (!originalTask.isRecurring) return;
        
        const { tasks } = get();
        
        // Use recurrenceStartDate if available, otherwise fallback to dueDate or today
        let startDate: Date;
        if (originalTask.recurrenceStartDate) {
          startDate = new Date(originalTask.recurrenceStartDate);
        } else if (originalTask.dueDate) {
          startDate = new Date(originalTask.dueDate);
        } else {
          startDate = new Date(); // Use today if no date specified
        }
        const endDate = originalTask.recurrenceEndDate 
          ? new Date(originalTask.recurrenceEndDate)
          : new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year ahead
        
        const recurringInstances: Task[] = [];
        const currentDate = new Date(startDate);
        
        // Generate recurring instances
        while (currentDate <= endDate) {
          // Move to next occurrence
          if (originalTask.recurrenceType === 'daily') {
            currentDate.setDate(currentDate.getDate() + (originalTask.recurrenceInterval || 1));
          } else if (originalTask.recurrenceType === 'weekly') {
            currentDate.setDate(currentDate.getDate() + (7 * (originalTask.recurrenceInterval || 1)));
          } else if (originalTask.recurrenceType === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() + (originalTask.recurrenceInterval || 1));
          }
          
          if (currentDate > endDate) break;
          
          // Skip if date is in exceptions
          const dateString = formatDateToString(currentDate);
          if (originalTask.recurrenceExceptions?.includes(dateString)) continue;
          
          // Create recurring instance
          const recurringInstance: Task = {
            ...originalTask,
            id: generateId(),
            dueDate: new Date(currentDate),
            originalTaskId: originalTask.id,
            isRecurring: false, // Individual instances are not recurring
            createdAt: new Date(),
            updatedAt: new Date(),
            // Reset subtasks completion status for each instance
            subtasks: originalTask.subtasks.map(subtask => ({
              ...subtask,
              id: generateId(),
              completed: false,
              createdAt: new Date()
            })),
            // Reset shopping items completion status for each instance
            shoppingItems: originalTask.shoppingItems?.map(item => ({
              ...item,
              id: generateId(),
              completed: false
            })) || []
          };
          
          recurringInstances.push(recurringInstance);
          
          // Limit to prevent infinite generation (max 100 instances)
          if (recurringInstances.length >= 100) break;
        }
        
        // Add all recurring instances to the store
        set((state) => ({
          tasks: [...state.tasks, ...recurringInstances]
        }));
        
        // Create calendar entries for recurring instances if calendar integration is enabled
        if (originalTask.addToCalendar) {
          console.log('📅 Creating calendar entries for', recurringInstances.length, 'recurring instances');
          recurringInstances.forEach((instance, index) => {
            console.log(`📅 Creating calendar entry ${index + 1}/${recurringInstances.length} for date:`, instance.dueDate);
            get().createCalendarEntryForTask(instance);
          });
        } else {
          console.log('📅 No calendar integration enabled for recurring task:', originalTask.name);
        }
      },

      cleanupRecurringTasks: (originalTaskId: string) => {
        set((state) => ({
          tasks: state.tasks.filter(task => task.originalTaskId !== originalTaskId)
        }));
      },

      createCalendarEntryForTask: (task: Task) => {
        console.log('📅 createCalendarEntryForTask called with task:', {
          taskId: task.id,
          taskName: task.name,
          addToCalendar: task.addToCalendar,
          calendarStartTime: task.calendarStartTime,
          calendarDate: task.calendarDate,
          isRecurring: task.isRecurring,
          dueDate: task.dueDate
        });

        if (!task.addToCalendar) {
          console.log('❌ Task calendar integration disabled');
          return;
        }
        
        if (!task.calendarStartTime) {
          console.log('❌ Missing calendarStartTime');
          return;
        }
        
        // For non-recurring tasks, use calendarDate if available, otherwise use dueDate
        let targetDate: Date | null = null;
        if (task.isRecurring && task.dueDate) {
          targetDate = new Date(task.dueDate);
          console.log('📅 Using dueDate for recurring task:', task.dueDate);
        } else if (!task.isRecurring && task.calendarDate) {
          targetDate = new Date(task.calendarDate);
          console.log('📅 Using calendarDate for non-recurring task:', task.calendarDate);
        } else if (task.dueDate) {
          targetDate = new Date(task.dueDate);
          console.log('📅 Using dueDate as fallback:', task.dueDate);
        } else if (!task.isRecurring) {
          // For non-recurring tasks without calendarDate, default to today
          targetDate = new Date();
          console.log('📅 Defaulting to today for non-recurring task without calendar date');
        }
        
        if (!targetDate) {
          console.log('❌ No valid date found for calendar entry', {
            isRecurring: task.isRecurring,
            hasCalendarDate: !!task.calendarDate,
            hasDueDate: !!task.dueDate,
            calendarDate: task.calendarDate,
            dueDate: task.dueDate
          });
          return;
        }
        
        // Import calendar store dynamically to avoid circular dependency
        import('./calendarStore').then(({ useCalendarStore }) => {
          console.log('📅 Calendar store imported successfully');
          const calendarStore = useCalendarStore.getState();
          
          const dateString = formatDateToString(targetDate!);
          console.log('📅 Creating calendar entry with dateString:', dateString);

          const timeBlockData = {
            title: task.name,
            description: task.description || 'Task reminder',
            date: dateString,
            startTime: task.calendarStartTime!,
            durationMinutes: task.calendarDuration || 60,
            blockType: 'admin' as const, // Use 'admin' for task-related time blocks
            icon: '📋',
            color: task.type === 'deadline' 
              ? 'linear-gradient(135deg, #EF4444, #DC2626)' // Red for deadlines
              : task.type === 'to-buy'
              ? 'linear-gradient(135deg, #F59E0B, #D97706)' // Amber for shopping
              : 'linear-gradient(135deg, #8B5CF6, #7C3AED)', // Purple for standard tasks
            linkedItemType: 'task' as const,
            linkedItemId: task.id,
            isRecurring: task.isRecurring && task.recurrenceType !== 'daily',
            recurrenceType: task.recurrenceType === 'daily' ? undefined : task.recurrenceType as 'weekly' | 'monthly' | undefined,
            recurrenceInterval: task.recurrenceType === 'daily' ? undefined : task.recurrenceInterval,
            recurrenceEndDate: task.recurrenceType === 'daily' ? undefined : task.recurrenceEndDate
          };

          console.log('📅 Time block data:', timeBlockData);
          
          try {
            console.log('📅 About to call calendarStore.addTimeBlock...');
            calendarStore.addTimeBlock(timeBlockData);
            console.log('✅ Calendar entry created successfully');
            
            // Verify the time block was actually added
            const allTimeBlocks = calendarStore.timeBlocks;
            console.log('📅 Current time blocks count:', allTimeBlocks.length);
            const justAdded = allTimeBlocks.find(tb => tb.title === task.name && tb.linkedItemId === task.id);
            if (justAdded) {
              console.log('✅ Verified: Time block found in calendar store:', justAdded.id);
            } else {
              console.log('❌ Warning: Time block not found in calendar store after addition');
            }
          } catch (error) {
            console.error('❌ Error creating calendar entry:', error);
            console.error('❌ Error details:', {
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined,
              timeBlockData
            });
          }
        }).catch((error) => {
          console.error('❌ Failed to import calendar store:', error);
        });
      }
    }),
    {
      name: 'task-store',
      version: 1
    }
  )
)