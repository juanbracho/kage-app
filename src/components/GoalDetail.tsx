import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Edit, MoreHorizontal, Plus, Trash2, Archive, Edit3, Target, Calendar, Settings } from 'lucide-react';
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
  const { getTasksByGoal, addTask, updateTask, toggleTask, deleteTask } = useTaskStore();
  const { getHabitsByGoal, getHabitStreak, isHabitCompletedToday, toggleDayCompletion, deleteHabit } = useHabitStore();
  const { goals, deleteGoal, toggleGoalCompletion, archiveGoal, addMilestone, updateMilestone, deleteMilestone, toggleMilestoneCompletion, updateProgressSettings } = useGoalStore();
  const { entries } = useJournalStore();
  
  // Get live goal data from store for real-time updates
  const currentGoal = goals.find(g => g.id === goal.id) || goal;
  
  // Debug logging for milestone issues
  console.log('🎯 GoalDetail - Current goal:', {
    id: currentGoal.id,
    name: currentGoal.name,
    milestonesCount: currentGoal.milestones?.length || 0,
    milestones: currentGoal.milestones || [],
    hasProgressSettings: !!currentGoal.progressSettings
  });
  
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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneDescription, setNewMilestoneDescription] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');
  
  // Progress Settings state
  const [showProgressSettings, setShowProgressSettings] = useState(false);
  const [tempProgressSettings, setTempProgressSettings] = useState(currentGoal.progressSettings);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update temp progress settings when goal changes
  useEffect(() => {
    setTempProgressSettings(currentGoal.progressSettings);
  }, [currentGoal.progressSettings]);

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
  const linkedTasks = getTasksByGoal(currentGoal.id);
  const linkedHabits = getHabitsByGoal(currentGoal.id);

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

  const daysLeft = getDaysUntilTarget(currentGoal.targetDate);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      deleteGoal(currentGoal.id);
      onBack();
    }
  };

  const handleToggleCompletion = () => {
    toggleGoalCompletion(currentGoal.id);
    setShowDropdown(false);
  };

  const handleArchive = () => {
    if (confirm('Are you sure you want to archive this goal? You can unarchive it later from Settings.')) {
      archiveGoal(currentGoal.id);
      onBack();
    }
  };

  // Filter journal entries for this specific goal
  const journalEntries = entries.filter(entry => 
    entry.linkedGoals.includes(currentGoal.id)
  );

  const handleAddJournalNote = () => {
    setShowJournalModal(true);
  };

  // Milestone handlers
  const handleAddMilestone = () => {
    setIsAddingMilestone(true);
  };

  const handleSaveMilestone = () => {
    if (newMilestoneDescription.trim()) {
      addMilestone(currentGoal.id, newMilestoneDescription.trim(), newMilestoneDueDate || undefined);
      setNewMilestoneDescription('');
      setNewMilestoneDueDate('');
      setIsAddingMilestone(false);
    }
  };

  const handleCancelMilestone = () => {
    setNewMilestoneDescription('');
    setNewMilestoneDueDate('');
    setIsAddingMilestone(false);
  };

  const handleMilestoneItemClick = (milestoneId: string) => {
    setSelectedMilestoneId(selectedMilestoneId === milestoneId ? null : milestoneId);
  };

  const handleToggleMilestone = (milestoneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMilestoneCompletion(currentGoal.id, milestoneId);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    if (confirm('Are you sure you want to delete this milestone?')) {
      deleteMilestone(currentGoal.id, milestoneId);
      setSelectedMilestoneId(null);
    }
  };

  const handleAddTask = () => {
    setShowTaskModal(true);
  };

  const handleAddHabit = () => {
    setShowHabitModal(true);
  };

  const handleTaskCheckboxClick = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handler
    toggleTask(taskId);
  };

  const handleHabitCheckboxClick = (habitId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handler
    const today = new Date().toISOString().split('T')[0];
    toggleDayCompletion(habitId, today);
  };

  const handleTaskItemClick = (taskId: string) => {
    setSelectedTaskId(selectedTaskId === taskId ? null : taskId);
  };

  const handleHabitItemClick = (habitId: string) => {
    setSelectedHabitId(selectedHabitId === habitId ? null : habitId);
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskModal(true);
    setSelectedTaskId(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
      setSelectedTaskId(null);
    }
  };

  const handleEditHabit = (habit: any) => {
    setEditingHabit(habit);
    setShowHabitModal(true);
    setSelectedHabitId(null);
  };

  const handleDeleteHabit = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(habitId);
      setSelectedHabitId(null);
    }
  };

  const handleTaskSubmit = (taskData: any) => {
    if (editingTask) {
      // Update existing task
      updateTask(editingTask.id, taskData);
    } else {
      // Create new task - modal already has goal ID pre-populated via defaultGoalId prop
      addTask(taskData);
    }
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleTaskModalClose = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleHabitModalClose = () => {
    setShowHabitModal(false);
    setEditingHabit(null);
  };

  // Progress Settings handlers
  const handleProgressSettingsToggle = () => {
    setShowProgressSettings(!showProgressSettings);
  };

  const handleProgressModeChange = (mode: 'tasks' | 'habits' | 'milestones' | 'mixed') => {
    setTempProgressSettings(prev => ({
      ...prev,
      calculationMode: mode,
      // Reset weights to default when switching to mixed mode
      mixedWeights: mode === 'mixed' ? { tasks: 40, habits: 40, milestones: 20 } : prev.mixedWeights
    }));
  };

  const handleWeightChange = (type: 'tasks' | 'habits' | 'milestones', value: number) => {
    setTempProgressSettings(prev => ({
      ...prev,
      mixedWeights: {
        ...prev.mixedWeights,
        [type]: value
      } as any
    }));
  };

  const handleSaveProgressSettings = () => {
    updateProgressSettings(currentGoal.id, tempProgressSettings);
    setShowProgressSettings(false);
  };

  const handleCancelProgressSettings = () => {
    setTempProgressSettings(currentGoal.progressSettings);
    setShowProgressSettings(false);
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
                    {currentGoal.isCompleted ? '🔄' : '✅'}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {currentGoal.isCompleted ? 'Mark as Active' : 'Mark as Completed'}
                  </span>
                </button>
                
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleArchive();
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
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{currentGoal.name}</h1>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-3">{currentGoal.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                {currentGoal.targetDate && (
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{formatDate(currentGoal.targetDate)}</span>
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
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Created {formatDate(currentGoal.createdAt)}</span>
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
              <span className="text-2xl font-bold">{currentGoal.progress.percentage}%</span>
            </div>
            <div className="h-2 bg-white bg-opacity-20 rounded-full mb-4">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${currentGoal.progress.percentage}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold">{currentGoal.progress.tasksCompleted}/{currentGoal.progress.tasksTotal}</div>
                <div className="text-sm opacity-80">Tasks Done</div>
              </div>
              <div>
                <div className="text-xl font-bold">{currentGoal.progress.habitCompletionRate}%</div>
                <div className="text-sm opacity-80">Habit Rate</div>
              </div>
              <div>
                <div className="text-xl font-bold">{currentGoal.progress.currentStreak}</div>
                <div className="text-sm opacity-80">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Settings Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              ⚙️ Progress Settings
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-semibold">
                {currentGoal.progressSettings.calculationMode}
              </span>
            </h2>
            <button
              onClick={handleProgressSettingsToggle}
              className="text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1"
              style={getGoalButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getGoalHoverStyle()}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = goal.color}
            >
              <Settings className="w-4 h-4" />
              Configure
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Current Progress Mode: <span className="font-medium capitalize">{currentGoal.progressSettings.calculationMode}</span>
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {currentGoal.progressSettings.calculationMode === 'tasks' && 'Progress calculated based on task completion percentage'}
                {currentGoal.progressSettings.calculationMode === 'habits' && 'Progress calculated based on habit completion rate'}
                {currentGoal.progressSettings.calculationMode === 'milestones' && 'Progress calculated based on milestone completion percentage'}
                {currentGoal.progressSettings.calculationMode === 'mixed' && 'Progress calculated using weighted combination of tasks, habits, and milestones'}
              </div>
            </div>

            {/* Progress Settings Form */}
            {showProgressSettings && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose Progress Calculation Method
                  </label>
                  <div className="space-y-2">
                    {(['tasks', 'habits', 'milestones', 'mixed'] as const).map((mode) => (
                      <label key={mode} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="progressMode"
                          value={mode}
                          checked={tempProgressSettings.calculationMode === mode}
                          onChange={() => handleProgressModeChange(mode)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white capitalize">{mode} Mode</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {mode === 'tasks' && 'Based on completed vs total tasks'}
                            {mode === 'habits' && 'Based on habit completion rate over time'}
                            {mode === 'milestones' && 'Based on completed vs total milestones'}
                            {mode === 'mixed' && 'Weighted combination of all progress types'}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Mixed Mode Weight Settings */}
                {tempProgressSettings.calculationMode === 'mixed' && tempProgressSettings.mixedWeights && (
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Adjust Weights (must total 100%)
                    </label>
                    <div className="space-y-3">
                      {(['tasks', 'habits', 'milestones'] as const).map((type) => (
                        <div key={type} className="flex items-center gap-3">
                          <label className="w-20 text-sm text-gray-600 dark:text-gray-400 capitalize">{type}:</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={tempProgressSettings.mixedWeights?.[type] || 0}
                            onChange={(e) => handleWeightChange(type, parseInt(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <span className="w-12 text-sm text-gray-600 dark:text-gray-400">
                            {tempProgressSettings.mixedWeights?.[type] || 0}%
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      Total: {(tempProgressSettings.mixedWeights?.tasks || 0) + (tempProgressSettings.mixedWeights?.habits || 0) + (tempProgressSettings.mixedWeights?.milestones || 0)}%
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveProgressSettings}
                    className="px-4 py-2 text-white rounded-lg text-sm font-medium"
                    style={getGoalButtonStyle()}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getGoalHoverStyle()}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = goal.color}
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={handleCancelProgressSettings}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Milestones Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
              🎯 Milestones
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md text-xs font-semibold">
                {currentGoal.milestones?.length || 0}
              </span>
            </h2>
            <button
              onClick={handleAddMilestone}
              className="text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1"
              style={getGoalButtonStyle()}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getGoalHoverStyle()}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = goal.color}
            >
              <Plus className="w-4 h-4" />
              Add Milestone
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Add Milestone Form */}
            {isAddingMilestone && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter milestone description..."
                    value={newMilestoneDescription}
                    onChange={(e) => setNewMilestoneDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <input
                        type="date"
                        value={newMilestoneDueDate}
                        onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveMilestone}
                        className="px-4 py-2 text-white rounded-lg text-sm font-medium"
                        style={getGoalButtonStyle()}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getGoalHoverStyle()}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = goal.color}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelMilestone}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Milestones List */}
            {(currentGoal.milestones?.length || 0) === 0 && !isAddingMilestone ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🎯</div>
                <p>No milestones set for this goal yet.</p>
                <p className="text-sm">Add milestones to track major achievements!</p>
              </div>
            ) : (
              (currentGoal.milestones || [])
                .sort((a, b) => a.order - b.order)
                .map((milestone, index) => (
                  <div key={milestone.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                    <div 
                      onClick={() => handleMilestoneItemClick(milestone.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          onClick={(e) => handleToggleMilestone(milestone.id, e)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer hover:scale-110 ${
                            milestone.completed
                              ? 'border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-300'
                          }`}
                          style={milestone.completed ? { backgroundColor: goal.color } : {}}
                        >
                          {milestone.completed && <span className="text-xs">✓</span>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
                          <Target className="w-4 h-4" />
                          <span>#{index + 1}</span>
                        </div>
                        <div className="flex-1 font-semibold text-gray-800 dark:text-white">{milestone.description}</div>
                        {milestone.dueDate && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Due {formatDate(milestone.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedMilestoneId === milestone.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Created {formatDate(milestone.createdAt)}
                          {milestone.completed && milestone.completedAt && (
                            <span> • Completed {formatDate(milestone.completedAt)}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
            )}
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
                <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                  <div 
                    onClick={() => handleTaskItemClick(task.id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        onClick={(e) => handleTaskCheckboxClick(task.id, e)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer hover:scale-110 ${
                          task.status === 'completed'
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-300'
                        }`}
                      >
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
                  
                  {selectedTaskId === task.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
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
                  <div key={habit.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                    <div 
                      onClick={() => handleHabitItemClick(habit.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div 
                          onClick={(e) => handleHabitCheckboxClick(habit.id, e)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer hover:scale-110 ${
                            isCompletedToday
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-blue-300 hover:border-blue-400'
                          }`}
                        >
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
                    
                    {selectedHabitId === habit.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                        <button
                          onClick={() => handleEditHabit(habit)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
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
        onClose={handleTaskModalClose}
        onSubmit={handleTaskSubmit}
        editingTask={editingTask}
        defaultGoalId={currentGoal.id}
      />

      {/* Habit Creation Modal */}
      <HabitCreationModal 
        isOpen={showHabitModal}
        onClose={handleHabitModalClose}
        editingHabit={editingHabit}
        defaultGoalId={currentGoal.id}
      />

      {/* Journal Entry Modal */}
      <JournalEntryModal 
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
        defaultGoalId={currentGoal.id}
      />
    </div>
  );
}