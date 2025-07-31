import { useState, useEffect } from 'react';
import { Plus, Clock, AlertTriangle, Calendar, CheckCircle2, ChevronDown, ChevronUp, Target, Edit, Trash2 } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { useGoalStore } from '../store/goalStore';
import { TaskFilter } from '../types/task';
import TaskCreationModal from './TaskCreationModal';
import TasksEmpty from './TasksEmpty';
import { safeAddEventListener } from '../utils/pwaDetection';

const FILTER_TABS: { id: TaskFilter; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'today', label: 'Today', icon: Calendar },
  { id: 'upcoming', label: 'Upcoming', icon: Clock },
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
    cleanupEmptySubtasks
  } = useTaskStore();
  
  const { goals } = useGoalStore();
  
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Cleanup empty subtasks on component mount
  useEffect(() => {
    cleanupEmptySubtasks();
  }, [cleanupEmptySubtasks]);

  // Listen for custom event to open task modal from dashboard
  useEffect(() => {
    const handleOpenTaskModal = () => {
      openModal();
    };

    const cleanup = safeAddEventListener('openTaskModal', handleOpenTaskModal);
    return cleanup;
  }, [openModal]);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  // Get filtered tasks and organize by sections
  const filteredTasks = getFilteredTasks();
  const { today, overdue, upcoming, noDueDate } = getTasksBySection();
  const taskCounts = getTaskCounts();
  
  // Show empty state if no tasks exist
  if (tasks.length === 0) {
    return <TasksEmpty onNavigate={onNavigate} />;
  }
  
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
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
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
                    task.priority === 'high' ? 'accent-bg-500' :
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

      {/* Task Content */}
      <div>
        {currentFilter === 'all' && (
          <div>
            {renderTaskSection('Overdue', overdue, AlertTriangle)}
            {renderTaskSection('Today', today, Calendar)}
            {renderTaskSection('Upcoming', upcoming, Clock)}
            {renderTaskSection('No Due Date', noDueDate, Target)}
          </div>
        )}
        
        {currentFilter !== 'all' && (
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">📋</div>
                <p>No tasks found for this filter.</p>
              </div>
            ) : (
              filteredTasks.map((task) => renderTaskCard(task))
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

      {/* Task Creation Modal */}
      <TaskCreationModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setEditingTask(null);
          closeModal();
        }}
        onSubmit={(taskData) => {
          if (editingTask) {
            // Update existing task
            updateTask(editingTask.id, taskData);
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