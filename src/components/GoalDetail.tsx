import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Edit, MoreHorizontal, Plus, Trash2, Archive } from 'lucide-react';
import { Goal } from '../types/goal';
import { useTaskStore } from '../store/taskStore';
import { useHabitStore } from '../store/habitStore';
import { useGoalStore } from '../store/goalStore';
import { useJournalStore } from '../store/journalStore';
import TaskCreationModal from './TaskCreationModal';
import HabitCreationModal from './HabitCreationModal';
import JournalEntryModal from './JournalEntryModal';

interface GoalDetailProps {
  goal: Goal;
  onBack: () => void;
  onEdit: (goal: Goal) => void;
  onNavigate?: (tab: string) => void;
}

export default function GoalDetail({ goal, onBack, onEdit, onNavigate }: GoalDetailProps) {
  const { getTasksByGoal, addTask } = useTaskStore();
  const { getHabitsByGoal, getHabitStreak, isHabitCompletedToday } = useHabitStore();
  const { deleteGoal, toggleGoalCompletion } = useGoalStore();
  const { entries } = useJournalStore();
  
  // Goal color utilities for consistent styling
  const getGoalButtonStyle = () => ({
    backgroundColor: goal.color,
    transition: 'all 0.2s ease-in-out'
  });
  
  const getGoalHoverStyle = () => {
    // Create a darker shade for hover by reducing brightness
    const color = goal.color;
    if (color.startsWith('#')) {
      // Convert hex to RGB, darken by 20%
      const hex = color.replace('#', '');
      const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * 0.8);
      const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * 0.8);
      const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * 0.8);
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }
    return color;
  };
  
  const getGoalTextStyle = () => ({
    color: goal.color
  });
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get real linked tasks and habits
  const linkedTasks = getTasksByGoal(goal.id);
  const linkedHabits = getHabitsByGoal(goal.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilTarget = (targetDate?: string) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = getDaysUntilTarget(goal.targetDate);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      deleteGoal(goal.id);
      onBack();
    }
  };

  const handleToggleCompletion = () => {
    toggleGoalCompletion(goal.id);
    setShowDropdown(false);
  };

  // Filter journal entries for this specific goal
  const journalEntries = entries.filter(entry => 
    entry.linkedGoals.includes(goal.id)
  );

  const handleAddJournalNote = () => {
    setShowJournalModal(true);
  };

  const handleAddTask = () => {
    setShowTaskModal(true);
  };

  const handleAddHabit = () => {
    setShowHabitModal(true);
  };

  const handleTaskSubmit = (taskData: any) => {
    // Task modal already has goal ID pre-populated via defaultGoalId prop
    addTask(taskData);
    setShowTaskModal(false);
  };


  const formatJournalDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      const diffTime = today.getTime() - date.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} days ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Goal Detail Header - inline with other page sections */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-9 h-9 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
            <span className="text-base">📊</span>
          </button>
          <button
            onClick={() => onEdit(goal)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
            style={getGoalButtonStyle()}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getGoalHoverStyle()}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = goal.color}
          >
            <Edit className="w-4 h-4 text-white" />
          </button>
          <div ref={dropdownRef} className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-48">
                <button
                  onClick={handleToggleCompletion}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">
                    {goal.isCompleted ? '🔄' : '✅'}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {goal.isCompleted ? 'Mark as Active' : 'Mark as Completed'}
                  </span>
                </button>
                
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    // TODO: Implement archive functionality
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <Archive className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="text-gray-700 dark:text-gray-300">Archive Goal</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleDelete();
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/30 last:rounded-b-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-red-600 dark:text-red-400">Delete Goal</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {/* Goal Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-4 mb-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl text-white flex-shrink-0"
              style={{ background: goal.color }}
            >
              {goal.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{goal.name}</h1>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-3">{goal.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {goal.targetDate && (
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{formatDate(goal.targetDate)}</span>
                  </div>
                )}
                {daysLeft && (
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{daysLeft} days left</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span>📈</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Created {formatDate(goal.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div
            className="rounded-2xl p-5 text-white"
            style={{ background: goal.color }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">Overall Progress</span>
              <span className="text-2xl font-bold">{goal.progress.percentage}%</span>
            </div>
            <div className="h-2 bg-white bg-opacity-20 rounded-full mb-4">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${goal.progress.percentage}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold">{goal.progress.tasksCompleted}/{goal.progress.tasksTotal}</div>
                <div className="text-sm opacity-80">Tasks Done</div>
              </div>
              <div>
                <div className="text-xl font-bold">{goal.progress.habitCompletionRate}%</div>
                <div className="text-sm opacity-80">Habit Rate</div>
              </div>
              <div>
                <div className="text-xl font-bold">{goal.progress.currentStreak}</div>
                <div className="text-sm opacity-80">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              ✅ Linked Tasks
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-semibold">
                {linkedTasks.length}
              </span>
              {linkedTasks.length > 0 && onNavigate && (
                <button
                  onClick={() => onNavigate('tasks')}
                  className="transition-colors text-sm font-medium hover:opacity-80"
                  style={getGoalTextStyle()}
                >
                  View All →
                </button>
              )}
            </h2>
            <button
              onClick={handleAddTask}
              className="text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1"
              style={getGoalButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getGoalHoverStyle()}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = goal.color}
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
          
          <div className="space-y-3">
            {linkedTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">✅</div>
                <p>No tasks linked to this goal yet.</p>
                <p className="text-sm">Add tasks to track your progress!</p>
              </div>
            ) : (
              linkedTasks.map(task => (
                <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {task.status === 'completed' && <span className="text-xs">✓</span>}
                    </div>
                    <div className="flex-1 font-semibold text-gray-800 dark:text-white">{task.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {task.status === 'completed' 
                        ? `Completed ${formatDate(typeof task.updatedAt === 'string' ? task.updatedAt : task.updatedAt.toISOString())}` 
                        : task.dueDate 
                          ? `Due ${formatDate(typeof task.dueDate === 'string' ? task.dueDate : task.dueDate.toISOString())}`
                          : 'No due date'
                      }
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 ml-8">{task.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Habits Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              🔄 Supporting Habits
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-semibold">
                {linkedHabits.length}
              </span>
              {linkedHabits.length > 0 && onNavigate && (
                <button
                  onClick={() => onNavigate('habits')}
                  className="transition-colors text-sm font-medium hover:opacity-80"
                  style={getGoalTextStyle()}
                >
                  View All →
                </button>
              )}
            </h2>
            <button
              onClick={handleAddHabit}
              className="text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1"
              style={getGoalButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getGoalHoverStyle()}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = goal.color}
            >
              <Plus className="w-4 h-4" />
              Add Habit
            </button>
          </div>
          
          <div className="space-y-3">
            {linkedHabits.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🔄</div>
                <p>No habits linked to this goal yet.</p>
                <p className="text-sm">Add habits to build consistency!</p>
              </div>
            ) : (
              linkedHabits.map(habit => {
                const streak = getHabitStreak(habit.id);
                const isCompletedToday = isHabitCompletedToday(habit.id);
                
                return (
                  <div key={habit.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isCompletedToday
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-blue-300'
                      }`}>
                        {isCompletedToday && <span className="text-xs">✓</span>}
                      </div>
                      <div className="flex-1 font-semibold text-gray-800 dark:text-white">{habit.name}</div>
                      <div className="text-xs font-semibold flex items-center gap-1" style={getGoalTextStyle()}>
                        🔥 {streak} day streak
                      </div>
                    </div>
                    {habit.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 ml-8">{habit.description}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Journal Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              📝 Journal Notes
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-semibold">
                {journalEntries.length}
              </span>
            </h2>
            <button 
              onClick={handleAddJournalNote}
              className="text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1"
              style={getGoalButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getGoalHoverStyle()}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = goal.color}
            >
              <Plus className="w-4 h-4" />
              Add Note
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              {journalEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No journal entries for this goal yet.</p>
                  <p className="text-sm">Add your first note to track your progress!</p>
                </div>
              ) : (
                journalEntries.map(entry => (
                  <div key={entry.id} className="p-4 border border-gray-100 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold">{formatJournalDate(entry.createdAt)}</div>
                      {entry.mood && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <span className="text-base">
                            {entry.mood === 'great' ? '😊' : 
                             entry.mood === 'good' ? '🙂' : 
                             entry.mood === 'neutral' ? '😐' : 
                             entry.mood === 'low' ? '😕' : '😢'}
                          </span>
                          <span className="capitalize">{entry.mood}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{entry.content}</div>
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.map(tag => (
                          <span key={tag} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Creation Modal */}
      <TaskCreationModal 
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleTaskSubmit}
        editingTask={undefined}
        defaultGoalId={goal.id}
      />

      {/* Habit Creation Modal */}
      <HabitCreationModal 
        isOpen={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        editingHabit={null}
        defaultGoalId={goal.id}
      />

      {/* Journal Entry Modal */}
      <JournalEntryModal 
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
        defaultGoalId={goal.id}
      />
    </div>
  );
}