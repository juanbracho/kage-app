import { useState, useEffect } from 'react';
import { Plus, Clock, AlertTriangle, Calendar, CheckCircle2, ChevronDown, ChevronUp, Target, Edit, Trash2, Repeat, ArrowUpDown, Grid, Users } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';
import { TaskFilter } from '../types/task';
import TaskCreationModal from './TaskCreationModal';
import TasksEmpty from './TasksEmpty';
import RecurringTaskDeleteModal from './RecurringTaskDeleteModal';
import { safeAddEventListener } from '../utils/pwaDetection';

const FILTER_TABS: { id: TaskFilter; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'today', label: 'Today', icon: Calendar },
  { id: 'upcoming', label: 'Upcoming', icon: Clock },
  { id: 'repetitive', label: 'Repetitive', icon: Repeat },
  { id: 'overdue', label: 'Overdue', icon: AlertTriangle },
  { id: 'completed', label: 'Done', icon: CheckCircle2 }
];

interface TasksPageProps {
  onNavigate?: (tab: string) => void;
}

export default function TasksPage({ onNavigate }: TasksPageProps) {
  const { 
    tasks, 
    currentFilter, 
    isModalOpen, 
    setFilter, 
    openModal, 
    closeModal, 
    toggleTask, 
    toggleSubtask, 
    toggleShoppingItem,
    getFilteredTasks, 
    getTasksBySection,
    getTaskCounts,
    addTask,
    updateTask,
    deleteTask,
    deleteSingleRecurringTask,
    deleteAllRecurringTasks,
    cleanupEmptySubtasks
  } = useTaskStore();
  
  const { goals } = useGoalStore();
  
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [showRecurringDeleteModal, setShowRecurringDeleteModal] = useState(false);
  const [recurringTaskToDelete, setRecurringTaskToDelete] = useState<any>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isAppStartup, setIsAppStartup] = useState(true);
  const [sortBy, setSortBy] = useState<'added' | 'priority'>('added');
  const [groupBy, setGroupBy] = useState<'general' | 'goals'>('general');

  // Cleanup empty subtasks on component mount and mark as initialized
  useEffect(() => {
    cleanupEmptySubtasks();
    
    // Mark as initialized after a delay to prevent startup modal opening
    setTimeout(() => {
      setHasInitialized(true);
      // Clear startup flag after sufficient time for proper initialization
      setTimeout(() => {
        setIsAppStartup(false);
      }, 1000);
    }, 500);
  }, [cleanupEmptySubtasks]);

  // Listen for custom event to open task modal from dashboard (only after full initialization)
  useEffect(() => {
    if (!hasInitialized || isAppStartup) return;
    
    const handleOpenTaskModal = () => {
      console.log('📋 TasksPage: Opening modal from custom event (post-startup)');
      openModal();
    };

    const cleanup = safeAddEventListener('openTaskModal', handleOpenTaskModal);
    return cleanup;
  }, [openModal, hasInitialized, isAppStartup]);
  
  // Get filtered tasks and organize by sections
  const filteredTasks = getFilteredTasks();
  const { today, overdue, upcoming, noDueDate } = getTasksBySection();
  const taskCounts = getTaskCounts();

  // Sort function for tasks
  const sortTasks = (tasks: any[]) => {
    if (sortBy === 'priority') {
      const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
      return [...tasks].sort((a, b) => {
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
        return aPriority - bPriority;
      });
    }
    // Default: sort by creation date (newest first)
    return [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  // Group tasks by goals when groupBy is 'goals'
  const groupTasksByGoals = (tasks: any[]) => {
    const grouped = new Map<string, { goal: any; tasks: any[] }>();
    
    tasks.forEach(task => {
      if (task.goalId) {
        const goal = goals.find(g => g.id === task.goalId);
        if (goal) {
          const key = task.goalId;
          if (!grouped.has(key)) {
            grouped.set(key, { goal, tasks: [] });
          }
          grouped.get(key)!.tasks.push(task);
        }
      }
    });
    
    // Sort groups by goal name for consistency
    return Array.from(grouped.values()).sort((a, b) => a.goal.name.localeCompare(b.goal.name));
  };

  // Get all tasks for goals grouping (combine all sections)
  const allTasks = groupBy === 'goals' ? [...today, ...overdue, ...upcoming, ...noDueDate] : [];
  const tasksByGoals = groupBy === 'goals' ? groupTasksByGoals(allTasks) : [];
  const tasksWithoutGoal = groupBy === 'goals' ? allTasks.filter(task => !task.goalId) : [];

  // Apply sorting to sections (only for non-repetitive filters)
  const sortedSections = currentFilter !== 'repetitive' ? {
    today: sortTasks(today),
    overdue: sortTasks(overdue), 
    upcoming: sortTasks(upcoming),
    noDueDate: sortTasks(noDueDate)
  } : { today, overdue, upcoming, noDueDate };
  
  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getGoalName = (goalId?: string) => {
    if (!goalId) return null;
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.name : null;
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    openModal();
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    
    // Check if this is a repetitive task (either original recurring task or an instance)
    if (task && (task.isRecurring || task.originalTaskId)) {
      setRecurringTaskToDelete(task);
      setShowRecurringDeleteModal(true);
    } else {
      // Regular task - show normal delete confirmation
      setTaskToDelete(taskId);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete);
      setTaskToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setTaskToDelete(null);
    setShowDeleteConfirm(false);
  };

  const handleDeleteSingleRecurring = () => {
    if (recurringTaskToDelete) {
      deleteSingleRecurringTask(recurringTaskToDelete.id);
      setRecurringTaskToDelete(null);
      setShowRecurringDeleteModal(false);
    }
  };

  const handleDeleteAllRecurring = () => {
    if (recurringTaskToDelete) {
      // If it's an instance, get the original task ID
      const originalTaskId = recurringTaskToDelete.originalTaskId || recurringTaskToDelete.id;
      deleteAllRecurringTasks(originalTaskId);
      setRecurringTaskToDelete(null);
      setShowRecurringDeleteModal(false);
    }
  };
  
  // Show empty state if no tasks exist
  if (tasks.length === 0) {
    return <TasksEmpty onNavigate={onNavigate} />;
  }

  const renderTaskCard = (task: any) => {
    const isExpanded = expandedTasks.has(task.id);
    const completedSubtasks = task.subtasks?.filter((st: any) => st.completed)?.length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const goalName = getGoalName(task.goalId);

    return (
      <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggleTask(task.id)}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5 ${
              task.status === 'completed'
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover-accent-border'
            }`}
          >
            {task.status === 'completed' && <span className="text-xs">✓</span>}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-semibold text-gray-800 dark:text-white ${
                task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : ''
              }`}>
                {task.name}
              </h3>
              
              <div className="flex items-center gap-1">
                {((task.subtasks && task.subtasks.length > 0) || (task.type === 'to-buy' && task.shoppingItems && task.shoppingItems.length > 0)) && (
                  <button
                    onClick={() => toggleExpanded(task.id)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
                
                <button
                  onClick={() => handleEditTask(task)}
                  className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                  title="Edit task"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {task.description && (
              <p className={`text-sm text-gray-600 dark:text-gray-300 mb-3 ${
                task.status === 'completed' ? 'line-through' : ''
              }`}>
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              {task.type === 'deadline' && task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                  {new Date(task.dueDate).toLocaleTimeString && (
                    <span className="text-xs opacity-75">
                      at {new Date(task.dueDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              )}
              
              {task.priority && (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'urgent' ? 'bg-red-500' :
                    task.priority === 'high' ? 'bg-orange-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <span className="capitalize">{task.priority}</span>
                </div>
              )}
              
              {goalName && (
                <button
                  onClick={() => onNavigate?.('goals')}
                  className="flex items-center gap-1 hover-accent-text-600 transition-colors"
                >
                  <Target className="w-3 h-3" />
                  <span>{goalName}</span>
                </button>
              )}
              
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="flex items-center gap-1">
                  <span>{completedSubtasks}/{totalSubtasks} subtasks</span>
                </div>
              )}
              
              {task.type === 'to-buy' && task.shoppingItems && task.shoppingItems.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-base">🛒</span>
                  <span>{task.shoppingItems.filter((item: any) => item.completed).length}/{task.shoppingItems.length} items</span>
                </div>
              )}
            </div>
            
            {isExpanded && task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-3 space-y-2">
                {task.subtasks.map((subtask: any, index: number) => {
                  const subtaskId = typeof subtask === 'string' ? `${task.id}-${index}` : subtask.id;
                  const subtaskName = typeof subtask === 'string' ? subtask : subtask.name;
                  const isCompleted = typeof subtask === 'string' ? false : subtask.completed;
                  
                  return (
                  <div key={subtaskId || `subtask-${task.id}-${index}`} className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleSubtask(task.id, subtaskId)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover-accent-border'
                      }`}
                    >
                      {isCompleted && <span className="text-xs">✓</span>}
                    </button>
                    <span className={`text-sm ${
                      isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {subtaskName}
                    </span>
                  </div>
                );
                })}
              </div>
            )}
            
            {/* Shopping Items for To-Buy tasks */}
            {isExpanded && task.type === 'to-buy' && task.shoppingItems && task.shoppingItems.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-4 mb-2">Shopping List:</div>
                {task.shoppingItems.map((item: any, index: number) => (
                  <div key={item.id || `item-${task.id}-${index}`} className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleShoppingItem(task.id, item.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        item.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover-accent-border'
                      }`}
                    >
                      {item.completed && <span className="text-xs">✓</span>}
                    </button>
                    <span className={`text-sm ${
                      item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {item.quantity && `${item.quantity} `}{item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderControlButtons = () => {
    if (currentFilter === 'repetitive') return null;
    
    return (
      <div className="flex items-center gap-2 mb-6">
        {currentFilter === 'all' && (
          <button
            onClick={() => setGroupBy(groupBy === 'general' ? 'goals' : 'general')}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Group by: {groupBy === 'general' ? 'General' : 'Goals'}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => setSortBy(sortBy === 'added' ? 'priority' : 'added')}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>Sort by: {sortBy === 'added' ? 'Added' : 'Priority'}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    );
  };

  const renderTaskSection = (title: string, tasks: any[], icon: React.ComponentType<any>) => {
    if (tasks.length === 0) return null;
    
    const IconComponent = icon;
    
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <IconComponent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h2>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-semibold">
            {tasks.length}
          </span>
        </div>
        <div className="space-y-3">
          {tasks.map((task) => renderTaskCard(task))}
        </div>
      </div>
    );
  };

  const renderGoalSection = (goalData: { goal: any; tasks: any[] }) => {
    const { goal, tasks } = goalData;
    const sortedTasks = sortTasks(tasks);
    
    return (
      <div className="mb-8" key={goal.id}>
        <div className="flex items-center gap-2 mb-4">
          <div 
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: goal.color }}
          />
          <span className="text-lg">{goal.icon}</span>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{goal.name}</h2>
          <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-semibold">
            {tasks.length}
          </span>
        </div>
        <div className="space-y-3">
          {sortedTasks.map((task) => renderTaskCard(task))}
        </div>
      </div>
    );
  };

  const renderRepetitiveTasks = (tasks: any[]) => {
    // Group tasks by their metadata
    const upcomingTasks = tasks.filter((task: any) => task._repetitiveGroup?.isUpcoming);
    const monthlyGroups = new Map<string, any[]>();
    
    tasks.forEach((task: any) => {
      if (!task._repetitiveGroup?.isUpcoming) {
        const monthGroup = task._repetitiveGroup?.monthGroup || 'No Due Date';
        if (!monthlyGroups.has(monthGroup)) {
          monthlyGroups.set(monthGroup, []);
        }
        monthlyGroups.get(monthGroup)!.push(task);
      }
    });

    return (
      <div className="space-y-8">
        {/* Upcoming Section (within 2 weeks) */}
        {upcomingTasks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Upcoming</h2>
              <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md text-xs font-semibold">
                Within 2 weeks
              </span>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-semibold">
                {upcomingTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {upcomingTasks.map((task) => renderRepetitiveTaskCard(task))}
            </div>
          </div>
        )}

        {/* Monthly Groups */}
        {Array.from(monthlyGroups.entries())
          .sort(([monthA], [monthB]) => {
            if (monthA === 'No Due Date') return 1;
            if (monthB === 'No Due Date') return -1;
            return new Date(monthA + ' 1, 2000').getTime() - new Date(monthB + ' 1, 2000').getTime();
          })
          .map(([monthGroup, monthTasks]) => (
            <div key={monthGroup} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{monthGroup}</h2>
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-semibold">
                  {monthTasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {monthTasks.map((task) => renderRepetitiveTaskCard(task))}
              </div>
            </div>
          ))}
      </div>
    );
  };

  const renderRepetitiveTaskCard = (task: any) => {
    const isExpanded = expandedTasks.has(task.id);
    const completedSubtasks = task.subtasks?.filter((st: any) => st.completed)?.length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const goalName = getGoalName(task.goalId);
    const repetitiveInfo = task._repetitiveGroup;

    return (
      <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition-shadow">
        <div className="flex items-start gap-3">
          <button
            onClick={() => toggleTask(task.id)}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5 ${
              task.status === 'completed'
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover-accent-border'
            }`}
          >
            {task.status === 'completed' && <span className="text-xs">✓</span>}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-gray-800 dark:text-white ${
                  task.status === 'completed' ? 'line-through text-gray-500 dark:text-gray-400' : ''
                }`}>
                  {task.name}
                </h3>
                
                {/* Repetitive Task Info */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs">
                    <Repeat className="w-3 h-3 text-purple-500" />
                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                      {task.recurrenceType} • Next of {repetitiveInfo?.allInstances || 1} occurrences
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {((task.subtasks && task.subtasks.length > 0) || (task.type === 'to-buy' && task.shoppingItems && task.shoppingItems.length > 0)) && (
                  <button
                    onClick={() => toggleExpanded(task.id)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}
                
                <button
                  onClick={() => handleEditTask(task)}
                  className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                  title="Edit task"
                >
                  <Edit className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {task.description && (
              <p className={`text-sm text-gray-600 dark:text-gray-300 mb-3 ${
                task.status === 'completed' ? 'line-through' : ''
              }`}>
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Next: {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              
              {task.priority && (
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 'urgent' ? 'bg-red-500' :
                    task.priority === 'high' ? 'bg-orange-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <span className="capitalize">{task.priority}</span>
                </div>
              )}
              
              {goalName && (
                <button
                  onClick={() => onNavigate?.('goals')}
                  className="flex items-center gap-1 hover-accent-text-600 transition-colors"
                >
                  <Target className="w-3 h-3" />
                  <span>{goalName}</span>
                </button>
              )}
              
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="flex items-center gap-1">
                  <span>{completedSubtasks}/{totalSubtasks} subtasks</span>
                </div>
              )}
              
              {task.type === 'to-buy' && task.shoppingItems && task.shoppingItems.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-base">🛒</span>
                  <span>{task.shoppingItems.filter((item: any) => item.completed).length}/{task.shoppingItems.length} items</span>
                </div>
              )}
            </div>
            
            {/* Rest of the expanded content (subtasks, shopping items) remains the same as renderTaskCard */}
            {isExpanded && task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-3 space-y-2">
                {task.subtasks.map((subtask: any, index: number) => {
                  const subtaskId = typeof subtask === 'string' ? `${task.id}-${index}` : subtask.id;
                  const subtaskName = typeof subtask === 'string' ? subtask : subtask.name;
                  const isCompleted = typeof subtask === 'string' ? false : subtask.completed;
                  
                  return (
                  <div key={subtaskId || `subtask-${task.id}-${index}`} className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleSubtask(task.id, subtaskId)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover-accent-border'
                      }`}
                    >
                      {isCompleted && <span className="text-xs">✓</span>}
                    </button>
                    <span className={`text-sm ${
                      isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {subtaskName}
                    </span>
                  </div>
                );
                })}
              </div>
            )}
            
            {/* Shopping Items for To-Buy tasks */}
            {isExpanded && task.type === 'to-buy' && task.shoppingItems && task.shoppingItems.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-4 mb-2">Shopping List:</div>
                {task.shoppingItems.map((item: any, index: number) => (
                  <div key={item.id || `item-${task.id}-${index}`} className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleShoppingItem(task.id, item.id)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        item.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover-accent-border'
                      }`}
                    >
                      {item.completed && <span className="text-xs">✓</span>}
                    </button>
                    <span className={`text-sm ${
                      item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {item.quantity && `${item.quantity} `}{item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <button
          onClick={openModal}
          className="accent-bg-500 hover-accent-bg-dark text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {FILTER_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setFilter(currentFilter === id ? 'all' : id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              currentFilter === id
                ? 'accent-bg-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {taskCounts[id] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                currentFilter === id
                  ? 'bg-white bg-opacity-20'
                  : 'bg-gray-200 dark:bg-gray-600'
              }`}>
                {taskCounts[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Control Buttons */}
      {renderControlButtons()}

      {/* Task Content */}
      <div>
        {currentFilter === 'all' && groupBy === 'general' && (
          <div>
            {renderTaskSection('Overdue', sortedSections.overdue, AlertTriangle)}
            {renderTaskSection('Today', sortedSections.today, Calendar)}
            {renderTaskSection('Upcoming', sortedSections.upcoming, Clock)}
            {renderTaskSection('No Due Date', sortedSections.noDueDate, Target)}
          </div>
        )}

        {currentFilter === 'all' && groupBy === 'goals' && (
          <div>
            {tasksByGoals.map(goalData => renderGoalSection(goalData))}
            {tasksWithoutGoal.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">No Goal</h2>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-semibold">
                    {tasksWithoutGoal.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {sortTasks(tasksWithoutGoal).map((task) => renderTaskCard(task))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {currentFilter === 'repetitive' && (
          <div>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🔁</div>
                <p>No repetitive tasks found.</p>
                <p className="text-sm mt-2">Repetitive tasks will appear here when you create recurring tasks.</p>
              </div>
            ) : (
              renderRepetitiveTasks(filteredTasks)
            )}
          </div>
        )}
        
        {currentFilter !== 'all' && currentFilter !== 'repetitive' && (
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">📋</div>
                <p>No tasks found for this filter.</p>
              </div>
            ) : (
              sortTasks(filteredTasks).map((task) => renderTaskCard(task))
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Task</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Task Delete Modal */}
      <RecurringTaskDeleteModal
        isOpen={showRecurringDeleteModal}
        onClose={() => {
          setShowRecurringDeleteModal(false);
          setRecurringTaskToDelete(null);
        }}
        task={recurringTaskToDelete}
        onDeleteSingle={handleDeleteSingleRecurring}
        onDeleteAll={handleDeleteAllRecurring}
      />

      {/* Task Creation Modal */}
      <TaskCreationModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setEditingTask(null);
          closeModal();
        }}
        onSubmit={(taskData) => {
          if (editingTask) {
            // Update existing task - convert TaskFormData to Task updates
            const taskUpdates: any = {
              name: taskData.name,
              description: taskData.description,
              type: taskData.type,
              priority: taskData.priority,
              dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
              goalId: taskData.goalId || undefined,
              estimatedTime: taskData.estimatedTime ? parseInt(taskData.estimatedTime.toString()) : undefined,
              location: taskData.location || undefined,
              reminderTime: taskData.reminderTime ? new Date(taskData.reminderTime) : undefined,
              notes: taskData.notes || undefined,
              tags: taskData.tags || [],
              subtasks: taskData.subtasks,
              shoppingItems: taskData.shoppingItems,
              // Recurring task properties
              isRecurring: taskData.isRecurring || false,
              recurrenceType: taskData.recurrenceType,
              recurrenceInterval: taskData.recurrenceInterval,
              recurrenceStartDate: taskData.recurrenceStartDate,
              recurrenceEndDate: taskData.recurrenceEndDate,
              // Calendar integration properties
              addToCalendar: taskData.addToCalendar || false,
              calendarStartTime: taskData.calendarStartTime,
              calendarDuration: taskData.calendarDuration,
              calendarDate: taskData.calendarDate,
              allDayTask: taskData.allDayTask || false
            };
            updateTask(editingTask.id, taskUpdates);
          } else {
            // Create new task
            addTask(taskData);
          }
          setEditingTask(null);
          closeModal();
        }}
        editingTask={editingTask}
      />
    </div>
  );
}