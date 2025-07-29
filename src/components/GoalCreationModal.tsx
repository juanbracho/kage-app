import { useState, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useGoalStore } from '../store/goalStore';
import { useTaskStore } from '../store/taskStore';
import { useHabitStore } from '../store/habitStore';
import { 
  GoalFormData, 
  GoalCategory, 
  GoalPriority,
  GOAL_CATEGORIES,
  GOAL_ICONS,
  GOAL_COLORS
} from '../types/goal';
import TaskHabitExpandableSection from './TaskHabitExpandableSection';
import TaskCreationMiniModal from './TaskCreationMiniModal';
import HabitCreationMiniModal from './HabitCreationMiniModal';
import { useModalSwipe } from '../hooks/useSwipeGesture';

interface GoalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: any; // Goal to edit (undefined for new goal)
}

interface TemporaryTask {
  id: string;
  name: string;
  description?: string;
  type: 'standard' | 'to-buy' | 'deadline';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface TemporaryHabit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  measurementType: 'simple' | 'count' | 'time' | 'custom';
  frequency: 'daily' | 'weekly' | 'custom';
  selectedDays?: string[];
  customFrequency?: {
    times: number;
    period: 'day' | 'week' | 'month';
  };
  targetAmount?: number;
  targetUnit?: string;
}

const PRIORITY_OPTIONS: { id: GoalPriority; name: string; icon: string; desc: string }[] = [
  { id: 'low', name: 'Low', icon: '🔵', desc: 'Nice to have' },
  { id: 'medium', name: 'Medium', icon: '🟡', desc: 'Important' },
  { id: 'high', name: 'High', icon: '🟠', desc: 'Very important' },
  { id: 'critical', name: 'Critical', icon: '🔴', desc: 'Must achieve' }
];

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

export default function GoalCreationModal({ isOpen, onClose, goalToEdit }: GoalCreationModalProps) {
  const { 
    templates, 
    addGoal, 
    createGoalFromTemplate,
    getTemplatesByCategory,
    updateGoal,
    linkTaskToGoal,
    linkHabitToGoal
  } = useGoalStore();
  
  const { addTask } = useTaskStore();
  const { addHabit } = useHabitStore();

  const [mode, setMode] = useState<'template' | 'custom'>('template');
  const [currentView, setCurrentView] = useState<'categories' | 'templates' | 'custom'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showIconGrid, setShowIconGrid] = useState(false);
  
  // Temporary linked items state
  const [linkedTasks, setLinkedTasks] = useState<TemporaryTask[]>([]);
  const [linkedHabits, setLinkedHabits] = useState<TemporaryHabit[]>([]);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TemporaryTask | undefined>();
  const [editingHabit, setEditingHabit] = useState<TemporaryHabit | undefined>();

  const [formData, setFormData] = useState<GoalFormData>({
    name: '',
    description: '',
    category: 'health',
    icon: '🎯',
    color: GOAL_COLORS[0],
    priority: 'medium',
    tags: []
  });

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        // Edit mode - pre-populate form with existing goal data
        setMode('custom');
        setCurrentView('custom');
        setSelectedCategory(goalToEdit.category);
        setSelectedTemplateId(null);
        setFormData({
          name: goalToEdit.name || '',
          description: goalToEdit.description || '',
          category: goalToEdit.category || 'health',
          icon: goalToEdit.icon || '🎯',
          color: goalToEdit.color || GOAL_COLORS[0],
          priority: goalToEdit.priority || 'medium',
          targetDate: goalToEdit.targetDate || undefined,
          motivation: goalToEdit.motivation || '',
          tags: goalToEdit.tags || []
        });
      } else {
        // Create mode - start fresh
        setMode('template');
        setCurrentView('categories');
        setSelectedCategory(null);
        setSelectedTemplateId(null);
        setFormData({
          name: '',
          description: '',
          category: 'health',
          icon: '🎯',
          color: GOAL_COLORS[0],
          priority: 'medium',
          tags: []
        });
      }
    }
  }, [isOpen, goalToEdit]);

  const handleClose = () => {
    setMode('template');
    setCurrentView('categories');
    setSelectedCategory(null);
    setSelectedTemplateId(null);
    // Reset temporary linked items state
    setLinkedTasks([]);
    setLinkedHabits([]);
    setShowTaskModal(false);
    setShowHabitModal(false);
    setEditingTask(undefined);
    setEditingHabit(undefined);
    onClose();
  };

  const handleModeSwitch = (newMode: 'template' | 'custom') => {
    setMode(newMode);
    if (newMode === 'template') {
      setCurrentView('categories');
    } else {
      setCurrentView('custom');
    }
    setSelectedCategory(null);
    setSelectedTemplateId(null);
  };

  const handleCategorySelect = (category: GoalCategory) => {
    setSelectedCategory(category);
    setCurrentView('templates');
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        name: template.name,
        description: template.description,
        category: template.category,
        icon: template.icon,
        color: template.color
      });
    }
  };

  const handleCreateFromTemplate = () => {
    if (selectedTemplateId) {
      createGoalFromTemplate(selectedTemplateId, formData);
      handleClose();
    }
  };

  const handleCreateCustom = () => {
    if (isFormValid()) {
      if (goalToEdit) {
        // Edit mode - update existing goal
        updateGoal(goalToEdit.id, formData);
        // TODO: Handle updating linked tasks/habits in edit mode
      } else {
        // Create mode - add new goal and get the ID
        const goalId = addGoal(formData);
        
        // Create and link tasks to the goal
        linkedTasks.forEach(tempTask => {
          const taskData = {
            name: tempTask.name,
            description: tempTask.description || '',
            type: tempTask.type,
            priority: tempTask.priority,
            goalId: goalId,
            notes: '',
            tags: [],
            subtasks: [],
            shoppingItems: tempTask.type === 'to-buy' ? [] : undefined
          };
          
          // Add task to store and get the ID
          const taskId = addTask(taskData);
          
          // Link task to goal
          linkTaskToGoal(taskId, goalId);
        });
        
        // Create and link habits to the goal
        linkedHabits.forEach(tempHabit => {
          const habitData = {
            name: tempHabit.name,
            description: tempHabit.description,
            icon: tempHabit.icon,
            color: tempHabit.color,
            measurementType: tempHabit.measurementType,
            frequency: tempHabit.frequency,
            selectedDays: tempHabit.selectedDays,
            customFrequency: tempHabit.customFrequency,
            targetAmount: tempHabit.targetAmount,
            targetUnit: tempHabit.targetUnit,
            calendarIntegration: false,
            startDate: new Date().toISOString().split('T')[0]
          };
          
          // Add habit to store and get the ID
          const habitId = addHabit(habitData);
          
          // Link habit to goal
          linkHabitToGoal(habitId, goalId);
        });
      }
      handleClose();
    }
  };

  const isFormValid = () => {
    return formData.name.trim().length > 0 && formData.description.trim().length > 0;
  };

  // Task and Habit handlers
  const handleAddTask = () => {
    setEditingTask(undefined);
    setShowTaskModal(true);
  };

  const handleAddHabit = () => {
    setEditingHabit(undefined);
    setShowHabitModal(true);
  };

  const handleEditTask = (task: TemporaryTask) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleEditHabit = (habit: TemporaryHabit) => {
    setEditingHabit(habit);
    setShowHabitModal(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setLinkedTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleDeleteHabit = (habitId: string) => {
    setLinkedHabits(prev => prev.filter(habit => habit.id !== habitId));
  };

  const handleSaveTask = (taskData: Omit<TemporaryTask, 'id'>) => {
    if (editingTask) {
      // Update existing task
      setLinkedTasks(prev => prev.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...taskData }
          : task
      ));
    } else {
      // Add new task
      const newTask: TemporaryTask = {
        id: generateId(),
        ...taskData
      };
      setLinkedTasks(prev => [...prev, newTask]);
    }
    setShowTaskModal(false);
    setEditingTask(undefined);
  };

  const handleSaveHabit = (habitData: Omit<TemporaryHabit, 'id'>) => {
    if (editingHabit) {
      // Update existing habit
      setLinkedHabits(prev => prev.map(habit => 
        habit.id === editingHabit.id 
          ? { ...habit, ...habitData }
          : habit
      ));
    } else {
      // Add new habit
      const newHabit: TemporaryHabit = {
        id: generateId(),
        ...habitData
      };
      setLinkedHabits(prev => [...prev, newHabit]);
    }
    setShowHabitModal(false);
    setEditingHabit(undefined);
  };

  // const toggleTag = (tag: string) => {
  //   setFormData({
  //     ...formData,
  //     tags: formData.tags.includes(tag)
  //       ? formData.tags.filter(t => t !== tag)
  //       : [...formData.tags, tag]
  //   });
  // };

  if (!isOpen) return null;

  const categoryTemplates = selectedCategory ? getTemplatesByCategory(selectedCategory) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-3 sm:p-4 md:p-5">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[90vh] overflow-hidden text-gray-900 dark:text-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {currentView === 'templates' && (
                <button
                  onClick={() => setCurrentView('categories')}
                  className="w-9 h-9 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {goalToEdit ? 'Edit Goal' : 'New Goal'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="w-9 h-9 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Mode Toggle */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5 flex">
            <button
              onClick={() => handleModeSwitch('template')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                mode === 'template'
                  ? 'accent-gradient text-white shadow-lg shadow-accent'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => handleModeSwitch('custom')}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                mode === 'custom'
                  ? 'accent-gradient text-white shadow-lg shadow-accent'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Templates Mode */}
          {mode === 'template' && (
            <>
              {/* Categories View */}
              {currentView === 'categories' && (
                <div className="space-y-3">
                  {GOAL_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.id)}
                      className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl p-4 transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-gray-300 flex items-center gap-4 text-left"
                    >
                      <div className="text-2xl flex-shrink-0">{category.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base mb-1">{category.name}</h3>
                        <p className="text-gray-400 text-sm">{category.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Templates View */}
              {currentView === 'templates' && selectedCategory && (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-2">
                      {GOAL_CATEGORIES.find(c => c.id === selectedCategory)?.icon}
                    </div>
                    <h3 className="text-xl font-bold">
                      {GOAL_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                    </h3>
                  </div>
                  
                  {categoryTemplates.map(template => (
                    <div
                      key={template.id}
                      className={`bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 cursor-pointer transition-all border-2 ${
                        selectedTemplateId === template.id
                          ? 'accent-border-500 bg-gray-100 dark:bg-gray-700'
                          : 'border-transparent hover:border-gray-600'
                      }`}
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white"
                          style={{ background: template.color }}
                        >
                          {template.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1">{template.name}</h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{template.description}</p>
                        </div>
                        <div className="text-xs text-gray-400">{template.estimatedDuration}</div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="text-base">✅</span>
                          {template.templateTasks.length} tasks
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-base">🔄</span>
                          {template.templateHabits.length} habits
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs ${
                          template.popularity === 'high' ? 'bg-green-500/20 text-green-400' :
                          template.popularity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {template.popularity === 'high' ? '⭐ Popular' :
                           template.popularity === 'medium' ? '👍 Good' :
                           '🌱 Beginner'}
                        </span>
                      </div>
                      
                      {selectedTemplateId === template.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={handleCreateFromTemplate}
                            className="w-full py-3 accent-bg-500 hover-accent-bg-dark rounded-xl font-semibold transition-colors"
                          >
                            Create Goal from Template
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={() => setCurrentView('custom')}
                    className="w-full py-4 border-2 border-dashed border-gray-600 hover-accent-border rounded-2xl text-gray-400 hover-accent-text transition-colors"
                  >
                    + Create Custom Goal Instead
                  </button>
                </div>
              )}
            </>
          )}

          {/* Custom Mode */}
          {mode === 'custom' && (
            <div className="space-y-6">
              {/* Goal Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Goal Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="What do you want to achieve?"
                  maxLength={100}
                  className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus-accent-border transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your goal and why it matters to you..."
                  maxLength={500}
                  rows={3}
                  className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus-accent-border transition-colors resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {GOAL_CATEGORIES.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setFormData({ ...formData, category: category.id })}
                      className={`p-3 border-2 rounded-xl text-center transition-all ${
                        formData.category === category.id
                          ? 'accent-border-500 bg-gray-100 dark:bg-gray-700 accent-text-500'
                          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="text-xl mb-1">{category.icon}</div>
                      <div className="text-xs font-semibold">{category.name.split(' ')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon & Color */}
              <div className="grid grid-cols-2 gap-6">
                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Icon</label>
                  <div className="text-center">
                    <div
                      onClick={() => setShowIconGrid(!showIconGrid)}
                      className="w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl cursor-pointer hover:opacity-80 transition-all shadow-sm"
                      style={{ background: formData.color, color: 'white' }}
                    >
                      {formData.icon}
                    </div>
                    
                    {showIconGrid && (
                      <div className="grid grid-cols-4 gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        {GOAL_ICONS.map(icon => (
                          <button
                            key={icon}
                            onClick={() => {
                              setFormData({ ...formData, icon });
                              setShowIconGrid(false);
                            }}
                            className="w-10 h-10 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center text-lg transition-colors"
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {GOAL_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-lg border-3 transition-all hover:scale-110 ${
                          formData.color === color ? 'accent-border-500 border-3' : 'border-transparent'
                        }`}
                        style={{ background: color }}
                      >
                        {formData.color === color && <span className="text-white font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                <div className="grid grid-cols-2 gap-3">
                  {PRIORITY_OPTIONS.map(priority => (
                    <button
                      key={priority.id}
                      onClick={() => setFormData({ ...formData, priority: priority.id })}
                      className={`p-3 border-2 rounded-xl text-left transition-all ${
                        formData.priority === priority.id
                          ? 'accent-border-500 bg-gray-100 dark:bg-gray-700 accent-text-500'
                          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{priority.icon}</span>
                        <span className="font-semibold">{priority.name}</span>
                      </div>
                      <div className="text-xs text-gray-400">{priority.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Target Date (Optional)</label>
                <input
                  type="date"
                  value={formData.targetDate || ''}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value || undefined })}
                  className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus-accent-border transition-colors"
                />
              </div>

              {/* Tasks & Habits Expandable Section */}
              <TaskHabitExpandableSection
                linkedTasks={linkedTasks}
                linkedHabits={linkedHabits}
                onAddTask={handleAddTask}
                onAddHabit={handleAddHabit}
                onEditTask={handleEditTask}
                onEditHabit={handleEditHabit}
                onDeleteTask={handleDeleteTask}
                onDeleteHabit={handleDeleteHabit}
              />

              {/* Why This Matters Section */}
              <div className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">✨</span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Why This Matters</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  Understanding your "why" is crucial for long-term success. What will achieving this goal mean to you?
                </div>
                <textarea
                  value={formData.motivation || ''}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  placeholder="How will achieving this goal change your life? What impact will it have on you and others?"
                  maxLength={300}
                  rows={3}
                  className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus-accent-border transition-colors resize-none"
                />
              </div>

              {/* Goal Preview Section */}
              <div className="bg-gray-100/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-2xl p-5 mb-6">
                <div className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wide">
                  Goal Preview
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-300 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white"
                      style={{ background: formData.color }}
                    >
                      {formData.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white mb-1">
                        {formData.name || (goalToEdit ? 'Edit Goal' : 'Your New Goal')}
                      </div>
                      <div className="text-sm text-gray-400">
                        🏃 {GOAL_CATEGORIES.find(c => c.id === formData.category)?.name} • {formData.targetDate ? new Date(formData.targetDate).toLocaleDateString() : 'Not set'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {mode === 'custom' && (
          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
            <button
              onClick={handleClose}
              className="flex-1 py-4 px-6 bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCustom}
              disabled={!isFormValid()}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all ${
                isFormValid()
                  ? 'accent-bg-500 hover-accent-bg-dark text-white hover:-translate-y-0.5 shadow-lg shadow-accent'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isFormValid() ? (goalToEdit ? 'Update Goal' : 'Create Goal') : 'Enter goal name'}
            </button>
          </div>
        )}
      </div>
      
      {/* Task Creation Mini Modal */}
      <TaskCreationMiniModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
        goalColor={formData.color}
      />

      {/* Habit Creation Mini Modal */}
      <HabitCreationMiniModal
        isOpen={showHabitModal}
        onClose={() => setShowHabitModal(false)}
        onSave={handleSaveHabit}
        editingHabit={editingHabit}
        goalColor={formData.color}
      />
    </div>
  );
}