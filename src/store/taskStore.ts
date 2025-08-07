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
  deleteSingleRecurringTask: (taskId: string) => void
  deleteAllRecurringTasks: (originalTaskId: string) => void
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
  getRepetitiveTasks: () => Task[]
  filterNextOccurrenceOnly: (tasks: Task[]) => Task[]
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

// Helper function to filter out duplicate repetitive tasks
// Only show the next occurrence within a month for each repetitive task group
const filterNextOccurrenceOnly = (tasks: Task[]): Task[] => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Start of today
  const oneMonthFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
  
  // Group tasks by recurring groups
  const taskGroups = new Map<string, Task[]>()
  const nonRepetitiveTasks: Task[] = []
  
  tasks.forEach(task => {
    if (task.isRecurring || task.originalTaskId) {
      // This is a repetitive task
      const groupKey = task.originalTaskId || task.id
      if (!taskGroups.has(groupKey)) {
        taskGroups.set(groupKey, [])
      }
      taskGroups.get(groupKey)!.push(task)
    } else {
      // Regular non-repetitive task
      nonRepetitiveTasks.push(task)
    }
  })
  
  const filteredRepetitiveTasks: Task[] = []
  
  // For each repetitive group, only include the next occurrence within a month
  taskGroups.forEach((groupTasks, groupKey) => {
    // Sort by due date
    groupTasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
    
    console.log('📅 filterNextOccurrenceOnly - processing group:', {
      groupKey,
      groupSize: groupTasks.length,
      taskNames: groupTasks.map(t => `${t.name} (${t.dueDate})`),
      today: today.toISOString(),
      oneMonthFromNow: oneMonthFromNow.toISOString()
    });
    
    // Find the next occurrence within a month (include today's tasks)
    const nextOccurrence = groupTasks.find(task => {
      if (!task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      const isWithinRange = dueDate >= today && dueDate <= oneMonthFromNow
      console.log('📅 filterNextOccurrenceOnly - checking task:', {
        taskName: task.name,
        dueDate: dueDate.toISOString(),
        isWithinRange,
        comparison: `${dueDate.toISOString()} >= ${today.toISOString()} && ${dueDate.toISOString()} <= ${oneMonthFromNow.toISOString()}`
      });
      return isWithinRange
    })
    
    if (nextOccurrence) {
      console.log('📅 filterNextOccurrenceOnly - selected next occurrence:', nextOccurrence.name);
      filteredRepetitiveTasks.push(nextOccurrence)
    } else {
      console.log('📅 filterNextOccurrenceOnly - no next occurrence found for group:', groupKey);
    }
  })
  
  return [...nonRepetitiveTasks, ...filteredRepetitiveTasks]
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
          })) || [],
          // Recurring task properties
          isRecurring: taskData.isRecurring || false,
          recurrenceType: taskData.recurrenceType,
          recurrenceInterval: taskData.recurrenceInterval,
          recurrenceStartDate: taskData.recurrenceStartDate,
          recurrenceEndDate: taskData.recurrenceEndDate || (taskData.isRecurring ? (() => {
            // Default to 1 year from start date (or today if no start date)
            const startDate = taskData.recurrenceStartDate ? new Date(taskData.recurrenceStartDate) : new Date();
            const oneYearLater = new Date(startDate);
            oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
            console.log('📅 Set default 1-year end date for new recurring task:', taskData.name, 'End date:', oneYearLater.toISOString().split('T')[0]);
            return oneYearLater;
          })() : undefined),
          // Calendar integration properties
          addToCalendar: taskData.addToCalendar || false,
          calendarStartTime: taskData.calendarStartTime,
          calendarDuration: taskData.calendarDuration,
          calendarDate: taskData.calendarDate,
          allDayTask: taskData.allDayTask || false
        }
        
        set(state => ({
          tasks: [newTask, ...state.tasks],
          isModalOpen: false
        }))
        
        // Generate recurring tasks if applicable
        if (newTask.isRecurring) {
          console.log('📅 Generating recurring tasks for:', newTask.name);
          // Repetitive tasks will appear as all-day event cards (no calendar integration needed)
          get().generateRecurringTasks(newTask);
          console.log('✅ Repetitive task created, instances will appear as all-day event cards');
        } else if (newTask.addToCalendar) {
          console.log('📅 Creating calendar entry for non-recurring task:', newTask.name);
          get().createCalendarEntryForTask(newTask);
        } else {
          console.log('📅 No calendar integration for task:', newTask.name);
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
        console.log('📋 Task Store: Updating task', id, updates);
        
        const currentTask = get().tasks.find(task => task.id === id);
        
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id === id) {
              const updatedTask = { ...task, ...updates, updatedAt: new Date() };
              
              // If task is becoming recurring and no end date is set, default to 1 year
              if (updatedTask.isRecurring && !updatedTask.recurrenceEndDate && !task.isRecurring) {
                const startDate = updatedTask.recurrenceStartDate ? new Date(updatedTask.recurrenceStartDate) : new Date();
                const oneYearLater = new Date(startDate);
                oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
                updatedTask.recurrenceEndDate = oneYearLater;
                console.log('📅 Set default 1-year end date for recurring task:', updatedTask.name, 'End date:', oneYearLater.toISOString().split('T')[0]);
              }
              
              // If subtasks are being updated, ensure they maintain proper object structure
              if (updates.subtasks) {
                updatedTask.subtasks = updates.subtasks.map((subtask: any, index: number) => {
                  if (typeof subtask === 'string') {
                    // Convert string to proper subtask object (new subtask)
                    return {
                      id: `${id}-${index}-${Date.now()}`,
                      name: subtask,
                      completed: false,
                      createdAt: new Date()
                    };
                  } else if (subtask && typeof subtask === 'object') {
                    // Preserve existing object with all its properties, especially completion state
                    return {
                      id: subtask.id || `${id}-${index}-${Date.now()}`,
                      name: subtask.name,
                      completed: subtask.completed !== undefined ? subtask.completed : false,
                      createdAt: subtask.createdAt || new Date()
                    };
                  }
                  return subtask;
                });
              }
              
              // If shopping items are being updated, ensure they maintain proper object structure
              if (updates.shoppingItems) {
                updatedTask.shoppingItems = updates.shoppingItems.map((item: any, index: number) => {
                  if (item && typeof item === 'object') {
                    // Preserve existing shopping item with its completion state
                    return {
                      id: item.id || `${id}-shop-${index}-${Date.now()}`,
                      name: item.name,
                      quantity: item.quantity || '1',
                      completed: item.completed !== undefined ? item.completed : false
                    };
                  }
                  return item;
                });
              }
              
              console.log('📋 Task Store: Updated task structure', updatedTask);
              return updatedTask;
            }
            return task;
          })
        }));
        
        // Handle recurring task changes
        const updatedTask = get().tasks.find(task => task.id === id);
        if (updatedTask && currentTask) {
          // Check if recurring status changed
          const wasRecurring = currentTask.isRecurring;
          const isNowRecurring = updatedTask.isRecurring;
          
          if (!wasRecurring && isNowRecurring) {
            // Task became recurring - generate instances (will appear as all-day event cards)
            console.log('📅 Task became recurring, generating instances for:', updatedTask.name);
            get().generateRecurringTasks(updatedTask);
            console.log('✅ Task converted to repetitive, instances will appear as all-day event cards');
          } else if (wasRecurring && !isNowRecurring) {
            // Task stopped being recurring - cleanup existing instances
            console.log('📅 Task stopped being recurring, cleaning up instances for:', updatedTask.name);
            get().cleanupRecurringTasks(id);
          } else if (wasRecurring && isNowRecurring) {
            // Task was and still is recurring - check if recurrence parameters changed
            if (
              currentTask.recurrenceType !== updatedTask.recurrenceType ||
              currentTask.recurrenceInterval !== updatedTask.recurrenceInterval ||
              currentTask.recurrenceStartDate !== updatedTask.recurrenceStartDate ||
              currentTask.recurrenceEndDate !== updatedTask.recurrenceEndDate
            ) {
              console.log('📅 Recurring parameters changed, regenerating instances for:', updatedTask.name);
              // Cleanup old instances and generate new ones
              get().cleanupRecurringTasks(id);
              get().generateRecurringTasks(updatedTask);
            }
          }
          
          // Update goal progress if task was/is linked to a goal
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

      deleteSingleRecurringTask: (taskId: string) => {
        const taskToDelete = get().tasks.find(task => task.id === taskId);
        
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== taskId)
        }))
        
        // Update goal progress if deleted task was linked to a goal
        if (taskToDelete?.goalId) {
          import('./goalStore').then(({ useGoalStore }) => {
            useGoalStore.getState().updateGoalProgress(taskToDelete.goalId!)
          }).catch(console.warn)
        }
      },

      deleteAllRecurringTasks: (originalTaskId: string) => {
        const originalTask = get().tasks.find(task => task.id === originalTaskId);
        const goalId = originalTask?.goalId;
        
        // Delete the original task
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== originalTaskId)
        }));
        
        // Delete all recurring instances
        get().cleanupRecurringTasks(originalTaskId);
        
        // Update goal progress if task was linked to a goal
        if (goalId) {
          import('./goalStore').then(({ useGoalStore }) => {
            useGoalStore.getState().updateGoalProgress(goalId)
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
        console.log('📋 Task Store: Toggling subtask', { taskId, subtaskId });
        
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id === taskId) {
              const updatedSubtasks = task.subtasks.map(subtask => {
                // Handle both string and object subtasks
                if (typeof subtask === 'string') {
                  // Convert string subtask to object if it matches the ID pattern
                  const tempId = `${taskId}-${task.subtasks.indexOf(subtask)}`;
                  if (tempId === subtaskId) {
                    return {
                      id: tempId,
                      name: subtask,
                      completed: true,
                      createdAt: new Date()
                    };
                  }
                  return {
                    id: tempId,
                    name: subtask,
                    completed: false,
                    createdAt: new Date()
                  };
                } else if (subtask.id === subtaskId) {
                  return { ...subtask, completed: !subtask.completed };
                }
                return subtask;
              });

              console.log('📋 Task Store: Updated subtasks for task', taskId, updatedSubtasks);
              
              return {
                ...task,
                subtasks: updatedSubtasks,
                updatedAt: new Date()
              };
            }
            return task;
          })
        }));
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
            const todayTasks = tasks.filter(task => 
              isToday(task.dueDate) && !isOverdue(task.dueDate) && task.status !== 'completed'
            );
            console.log('📅 Today filter - before filterNextOccurrenceOnly:', {
              totalTasks: tasks.length,
              todayTasksFound: todayTasks.length,
              todayTaskNames: todayTasks.map(t => `${t.name} (${t.dueDate}) recurring:${t.isRecurring || !!t.originalTaskId}`)
            });
            const filteredTodayTasks = filterNextOccurrenceOnly(todayTasks);
            console.log('📅 Today filter - after filterNextOccurrenceOnly:', {
              filteredCount: filteredTodayTasks.length,
              filteredTaskNames: filteredTodayTasks.map(t => `${t.name} (${t.dueDate})`)
            });
            return filteredTodayTasks;
          case 'upcoming':
            return filterNextOccurrenceOnly(
              tasks.filter(task => 
                isUpcoming(task.dueDate) && !isOverdue(task.dueDate) && !isToday(task.dueDate) && task.status !== 'completed'
              )
            )
          case 'repetitive':
            return get().getRepetitiveTasks()
          case 'overdue':
            return filterNextOccurrenceOnly(
              tasks.filter(task => 
                isOverdue(task.dueDate) && task.status !== 'completed'
              )
            )
          case 'completed':
            return filterNextOccurrenceOnly(
              tasks.filter(task => task.status === 'completed')
            )
          default:
            return filterNextOccurrenceOnly(tasks)
        }
      },

      getTasksBySection: () => {
        const { tasks } = get()
        
        const incompleteTasks = filterNextOccurrenceOnly(tasks.filter(task => task.status !== 'completed'))
        
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
          all: filterNextOccurrenceOnly(tasks).length,
          today: filterNextOccurrenceOnly(
            tasks.filter(task => 
              isToday(task.dueDate) && task.status !== 'completed'
            )
          ).length,
          upcoming: filterNextOccurrenceOnly(
            tasks.filter(task => 
              isUpcoming(task.dueDate) && task.status !== 'completed'
            )
          ).length,
          repetitive: get().getRepetitiveTasks().length,
          overdue: filterNextOccurrenceOnly(
            tasks.filter(task => 
              isOverdue(task.dueDate) && task.status !== 'completed'
            )
          ).length,
          completed: filterNextOccurrenceOnly(
            tasks.filter(task => task.status === 'completed')
          ).length
        }
      },

      getRepetitiveTasks: () => {
        const { tasks } = get()
        const now = new Date()
        const threeMonthsFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)) // 3 months
        
        // Get all repetitive tasks (original recurring tasks and their instances)
        const repetitiveTasks = tasks.filter(task => 
          (task.isRecurring || task.originalTaskId) && task.status !== 'completed'
        )
        
        // Group by original task (for recurring tasks) or by task itself (for original recurring tasks)
        const taskGroups = new Map<string, Task[]>()
        
        repetitiveTasks.forEach(task => {
          const groupKey = task.originalTaskId || task.id
          if (!taskGroups.has(groupKey)) {
            taskGroups.set(groupKey, [])
          }
          taskGroups.get(groupKey)!.push(task)
        })
        
        const result: Task[] = []
        
        taskGroups.forEach((taskInstances, groupKey) => {
          // Sort instances by due date
          taskInstances.sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0
            if (!a.dueDate) return 1
            if (!b.dueDate) return -1
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          })
          
          // Find all occurrences within the next 3 months
          const upcomingOccurrences = taskInstances.filter(task => {
            if (!task.dueDate) return false
            const dueDate = new Date(task.dueDate)
            return dueDate >= now && dueDate <= threeMonthsFromNow
          })
          
          // If we have instances, add them all with metadata
          upcomingOccurrences.forEach(occurrence => {
            const taskDueDate = occurrence.dueDate ? new Date(occurrence.dueDate) : null
            let isWithin14Days = false
            
            if (taskDueDate) {
              // Calculate days from now (start of today)
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()) // Start of today
              const taskDate = new Date(taskDueDate.getFullYear(), taskDueDate.getMonth(), taskDueDate.getDate()) // Start of task date
              const daysDifference = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
              
              // Upcoming means: 1-14 days from now (exclude today = 0 days, include future within 2 weeks)
              isWithin14Days = daysDifference > 0 && daysDifference <= 14
            }
            
            // Mark this task with special metadata for UI grouping
            const taskWithMetadata = {
              ...occurrence,
              _repetitiveGroup: {
                isUpcoming: isWithin14Days,
                monthGroup: occurrence.dueDate ? 
                  new Date(occurrence.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 
                  'No Due Date',
                allInstances: taskInstances.length
              }
            } as Task & { _repetitiveGroup: { isUpcoming: boolean; monthGroup: string; allInstances: number } }
            
            result.push(taskWithMetadata)
          })
        })
        
        // Sort final result: upcoming first, then by month
        return result.sort((a: any, b: any) => {
          const aGroup = a._repetitiveGroup
          const bGroup = b._repetitiveGroup
          
          // Upcoming tasks first
          if (aGroup.isUpcoming && !bGroup.isUpcoming) return -1
          if (!aGroup.isUpcoming && bGroup.isUpcoming) return 1
          
          // Then by due date
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        })
      },

      filterNextOccurrenceOnly: (tasks: Task[]) => {
        return filterNextOccurrenceOnly(tasks);
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
          // Skip if date is in exceptions BEFORE creating instance
          const dateString = formatDateToString(currentDate);
          if (!originalTask.recurrenceExceptions?.includes(dateString)) {
            // Create recurring instance for current date
            const recurringInstance: Task = {
              ...originalTask,
              id: generateId(),
              dueDate: new Date(currentDate),
              originalTaskId: originalTask.id,
              isRecurring: false, // Individual instances are not recurring
              allDayTask: originalTask.allDayTask, // Preserve all-day setting
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
          
          // Move to next occurrence AFTER processing current date
          if (originalTask.recurrenceType === 'daily') {
            currentDate.setDate(currentDate.getDate() + (originalTask.recurrenceInterval || 1));
          } else if (originalTask.recurrenceType === 'weekly') {
            currentDate.setDate(currentDate.getDate() + (7 * (originalTask.recurrenceInterval || 1)));
          } else if (originalTask.recurrenceType === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() + (originalTask.recurrenceInterval || 1));
          }
        }
        
        // Add all recurring instances to the store
        set((state) => ({
          tasks: [...state.tasks, ...recurringInstances]
        }));
        
        // Recurring instances will appear as all-day event cards directly from task store (no calendar integration)
        console.log('✅ Generated', recurringInstances.length, 'recurring instances, will appear as all-day event cards');
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
        
        // For all-day tasks, we don't need a specific start time
        if (!task.allDayTask && !task.calendarStartTime) {
          console.log('❌ Missing calendarStartTime for timed task');
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
        
        // Import required stores and utilities
        Promise.all([
          import('./calendarStore'), 
          import('./settingsStore'),
          import('../utils/accentColors')
        ]).then(([{ useCalendarStore }, { useSettingsStore }, { getAccentColorValue }]) => {
          console.log('📅 Calendar store imported successfully');
          const calendarStore = useCalendarStore.getState();
          const settingsStore = useSettingsStore.getState();
          const currentAccentColor = getAccentColorValue(settingsStore.accentColor);
          
          const dateString = formatDateToString(targetDate!);
          console.log('📅 Creating calendar entry with dateString:', dateString);

          const timeBlockData = {
            title: task.name,
            description: task.description || 'Task reminder',
            date: dateString,
            startTime: task.allDayTask ? '00:00' : task.calendarStartTime!,
            durationMinutes: task.allDayTask ? 1440 : (task.calendarDuration || 60), // Full day for all-day tasks
            blockType: task.allDayTask ? 'all-day-task' as const : 'admin' as const,
            icon: '📋',
            color: task.allDayTask 
              ? `linear-gradient(135deg, ${currentAccentColor}, ${currentAccentColor}dd)` // Use accent color for all-day tasks
              : task.type === 'deadline' 
              ? 'linear-gradient(135deg, #EF4444, #DC2626)' // Red for deadlines
              : task.type === 'to-buy'
              ? 'linear-gradient(135deg, #F59E0B, #D97706)' // Amber for shopping
              : 'linear-gradient(135deg, #8B5CF6, #7C3AED)', // Purple for standard tasks
            linkedItemType: 'task' as const,
            linkedItemId: task.id,
            allDay: task.allDayTask || false,
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