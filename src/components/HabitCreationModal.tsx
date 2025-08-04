import { useState, useEffect } from 'react';
import { useHabitStore } from '../store/habitStore';
import { useGoalStore } from '../store/goalStore';
import { HabitFormData, Habit } from '../types/habit';
import { GOAL_CATEGORIES } from '../types/goal';

interface HabitCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingHabit?: Habit | null;
  defaultGoalId?: string;
}

const HABIT_ICONS = [
  '💪', '🏃', '💧', '📚', '🧘', '🥗', '💰', '🌅', '📝', '🎨', '🎵', '🌱',
  '🏠', '👥', '🎯', '⚡', '🔥', '✨', '🌟', '🎈', '🎊', '🎉', '🏆', '💎'
];

const HABIT_COLORS = [
  '#FF7101', // Orange (accent color default)
  '#2196F3', // Blue
  '#4CAF50', // Green
  '#9C27B0', // Purple
  '#E91E63', // Pink
  '#FBC02D', // Yellow
  '#607D8B'  // Blue Grey
];


const FREQUENCY_OPTIONS = [
  { id: 'daily', name: 'Daily', desc: 'Every day' },
  { id: 'weekly', name: 'Weekly', desc: 'Select days' },
  { id: 'custom', name: 'Custom', desc: 'X times per period' }
];

const DAYS = [
  { id: 'mon', label: 'M', full: 'Monday' },
  { id: 'tue', label: 'T', full: 'Tuesday' },
  { id: 'wed', label: 'W', full: 'Wednesday' },
  { id: 'thu', label: 'T', full: 'Thursday' },
  { id: 'fri', label: 'F', full: 'Friday' },
  { id: 'sat', label: 'S', full: 'Saturday' },
  { id: 'sun', label: 'S', full: 'Sunday' }
];

export default function HabitCreationModal({ isOpen, onClose, editingHabit, defaultGoalId }: HabitCreationModalProps) {
  const { addHabit, updateHabit, changeHabitFrequency } = useHabitStore();
  const { getActiveGoals } = useGoalStore();
  const goals = getActiveGoals();
  const [showIconGrid, setShowIconGrid] = useState(false);
  const [showScheduling, setShowScheduling] = useState(false);
  
  const [formData, setFormData] = useState<HabitFormData>({
    name: '',
    description: '',
    icon: '🎯',
    color: HABIT_COLORS[0],
    category: undefined,
    measurementType: 'simple',
    frequency: 'daily',
    selectedDays: [],
    calendarIntegration: false,
    targetUnit: 'units',
    goalId: defaultGoalId || ''
  });

  // const [goalLinkEnabled, setGoalLinkEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (editingHabit) {
        // Pre-populate form with existing habit data
        setFormData({
          name: editingHabit.name,
          description: editingHabit.description || '',
          icon: editingHabit.icon,
          color: editingHabit.color,
          category: editingHabit.category,
          measurementType: editingHabit.measurementType,
          frequency: editingHabit.frequency,
          selectedDays: editingHabit.selectedDays || [],
          calendarIntegration: editingHabit.calendarIntegration || false,
          targetUnit: editingHabit.targetUnit || 'units',
          targetAmount: editingHabit.targetAmount,
          customFrequency: editingHabit.customFrequency,
          startDate: editingHabit.startDate || new Date().toISOString().split('T')[0],
          scheduledTime: editingHabit.scheduledTime || '09:00',
          reminderMinutes: editingHabit.reminderMinutes,
          goalId: editingHabit.goalId || ''
        });
        setShowScheduling(editingHabit.calendarIntegration || false);
      } else {
        // Reset form when creating new habit
        const initialGoalId = defaultGoalId || '';
        const linkedGoal = initialGoalId ? goals.find(g => g.id === initialGoalId) : undefined;
        
        setFormData({
          name: '',
          description: '',
          icon: '🎯',
          color: HABIT_COLORS[0],
          category: linkedGoal?.category,
          measurementType: 'simple',
          frequency: 'daily',
          selectedDays: [],
          calendarIntegration: false,
          targetUnit: 'units',
          startDate: new Date().toISOString().split('T')[0],
          scheduledTime: '09:00',
          goalId: initialGoalId
        });
        setShowScheduling(false);
      }
      setShowIconGrid(false);
    }
  }, [isOpen, editingHabit, defaultGoalId]);

  const isFormValid = () => {
    if (!formData.name.trim()) return false;
    if (!formData.category) return false; // Category is required
    if (formData.frequency === 'weekly' && formData.selectedDays!.length === 0) return false;
    if (formData.frequency === 'custom' && (!formData.customFrequency?.times || formData.customFrequency.times < 1)) return false;
    return true;
  };

  const handleSave = () => {
    if (!isFormValid()) return;
    
    if (editingHabit) {
      // Check if frequency-related fields have changed
      const frequencyChanged = 
        editingHabit.frequency !== formData.frequency ||
        JSON.stringify(editingHabit.selectedDays) !== JSON.stringify(formData.selectedDays) ||
        JSON.stringify(editingHabit.customFrequency) !== JSON.stringify(formData.customFrequency);
      
      if (frequencyChanged) {
        // Use the frequency change method to preserve streak history
        changeHabitFrequency(
          editingHabit.id,
          formData.frequency,
          formData.selectedDays,
          formData.customFrequency,
          'User changed frequency settings'
        );
        
        // Update other non-frequency fields
        const { frequency, selectedDays, customFrequency, ...nonFrequencyData } = formData;
        
        updateHabit(editingHabit.id, nonFrequencyData);
      } else {
        // No frequency change, use normal update
        updateHabit(editingHabit.id, formData);
      }
    } else {
      addHabit(formData);
    }
    onClose();
  };


  const toggleDay = (dayId: string) => {
    const selectedDays = formData.selectedDays || [];
    if (selectedDays.includes(dayId)) {
      const newSelectedDays = selectedDays.filter(d => d !== dayId);
      setFormData({
        ...formData,
        selectedDays: newSelectedDays
      });
    } else {
      const newSelectedDays = [...selectedDays, dayId];
      setFormData({
        ...formData,
        selectedDays: newSelectedDays
      });
    }
  };

  const handleGoalChange = (goalId: string) => {
    const linkedGoal = goalId ? goals.find(g => g.id === goalId) : undefined;
    setFormData({
      ...formData,
      goalId,
      category: linkedGoal?.category || formData.category
    });
  };

  // Add swipe-to-close functionality (defined after all functions)

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-3 sm:p-4 md:p-5">
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] overflow-hidden text-gray-900 dark:text-white animate-in slide-in-from-bottom-4 duration-300 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-2xl font-bold">{editingHabit ? 'Edit Habit' : 'New Habit'}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Icon Selection */}
          <div className="text-center mb-4">
            <div
              onClick={() => setShowIconGrid(!showIconGrid)}
              className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-4xl cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors border-3 border-transparent"
              style={formData.icon !== '🎯' ? { background: formData.color, borderColor: 'var(--accent-color)' } : {}}
            >
              {formData.icon}
            </div>
            
            {showIconGrid && (
              <div className="grid grid-cols-8 gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl mt-4 max-h-48 overflow-y-auto">
                {HABIT_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => {
                      setFormData({ ...formData, icon });
                      setShowIconGrid(false);
                    }}
                    className="w-10 h-10 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center text-xl transition-colors"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="What habit do you want to build?"
              maxLength={50}
              autoComplete="on"
              autoCorrect="on"
              autoCapitalize="sentences"
              spellCheck="true"
              className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus-accent-border transition-colors"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Why is this habit important to you?"
              maxLength={200}
              autoComplete="on"
              autoCorrect="on"
              autoCapitalize="sentences"
              spellCheck="true"
              className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus-accent-border transition-colors min-h-20 resize-y"
            />
          </div>

          {/* Color Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Color *</label>
            <div className="grid grid-cols-7 gap-3">
              {HABIT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-12 h-12 rounded-xl border-3 transition-all hover:scale-110 ${
                    formData.color === color ? 'border-white shadow-lg shadow-accent' : 'border-transparent'
                  }`}
                  style={{ background: color }}
                >
                  {formData.color === color && <span className="text-white font-bold">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection - Only show when no goal is selected */}
          {!formData.goalId && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category *</label>
              <div className="grid grid-cols-2 gap-3">
                {GOAL_CATEGORIES.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: category.id })}
                    className={`p-3 rounded-xl border-2 text-left transition-all hover:scale-105 ${
                      formData.category === category.id
                        ? 'border-white shadow-lg'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    style={{ 
                      background: formData.category === category.id 
                        ? category.color 
                        : `${category.color}15`,
                      color: formData.category === category.id ? 'white' : category.color
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-semibold text-sm">{category.name}</span>
                    </div>
                    <div className={`text-xs ${
                      formData.category === category.id 
                        ? 'text-white opacity-90' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {category.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category Display - Show inherited category when goal is selected */}
          {formData.goalId && formData.category && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category (Inherited from Goal)</label>
              <div className="p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{GOAL_CATEGORIES.find(c => c.id === formData.category)?.icon}</span>
                  <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                    {GOAL_CATEGORIES.find(c => c.id === formData.category)?.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">Auto-assigned</span>
                </div>
              </div>
            </div>
          )}

          {/* Goal Linking */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Link to Goal</label>
            <select
              value={formData.goalId || ''}
              onChange={(e) => handleGoalChange(e.target.value)}
              className="w-full p-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus-accent-border transition-colors"
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
                💡 Create your first goal to link habits and track progress!
              </p>
            )}
          </div>


          {/* Frequency */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Frequency *</label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {FREQUENCY_OPTIONS.map(freq => (
                <button
                  key={freq.id}
                  onClick={() => setFormData({ ...formData, frequency: freq.id as any, selectedDays: [] })}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${
                    formData.frequency === freq.id
                      ? 'accent-border-500 accent-bg-50 accent-text-500'
                      : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold text-sm mb-1">{freq.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{freq.desc}</div>
                </button>
              ))}
            </div>

            {/* Weekly Days */}
            {formData.frequency === 'weekly' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Days *</label>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      className={`p-2 border-2 rounded-lg text-center text-sm font-semibold transition-all ${
                        formData.selectedDays?.includes(day.id)
                          ? 'accent-border-500 accent-bg-500 text-white'
                          : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Frequency */}
            {formData.frequency === 'custom' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Custom Frequency *</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    value={formData.customFrequency?.times || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      customFrequency: {
                        times: parseInt(e.target.value) || 1,
                        period: formData.customFrequency?.period || 'week'
                      }
                    })}
                    placeholder="3"
                    min="1"
                    max="7"
                    className="w-16 p-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-center focus:outline-none focus-accent-border"
                  />
                  <span className="text-gray-700 dark:text-gray-300">times per</span>
                  <select
                    value={formData.customFrequency?.period || 'week'}
                    onChange={(e) => setFormData({
                      ...formData,
                      customFrequency: {
                        times: formData.customFrequency?.times || 1,
                        period: e.target.value as 'week' | 'month'
                      }
                    })}
                    className="p-2 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus-accent-border"
                  >
                    <option value="week">week</option>
                    <option value="month">month</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Scheduling - Hidden for custom frequency */}
          {formData.frequency !== 'custom' && (
            <div className="mb-6">
              <button
                onClick={() => setShowScheduling(!showScheduling)}
                className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <span className="font-semibold">Scheduling</span>
              </div>
              <span className={`transition-transform ${showScheduling ? 'rotate-90' : ''}`}>▶</span>
            </button>
            
            {showScheduling && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate || ''}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus-accent-border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Time</label>
                    <input
                      type="time"
                      value={formData.scheduledTime || '09:00'}
                      onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                      className="w-full p-2 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus-accent-border"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Reminder</label>
                  <select
                    value={formData.reminderMinutes || ''}
                    onChange={(e) => setFormData({ ...formData, reminderMinutes: parseInt(e.target.value) || undefined })}
                    className="w-full p-2 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus-accent-border"
                  >
                    <option value="">No reminder</option>
                    <option value="0">At time of habit</option>
                    <option value="5">5 minutes before</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="60">1 hour before</option>
                  </select>
                </div>
                
                {/* Calendar Integration Toggle */}
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📅</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">Add to Calendar</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Create time blocks in your calendar</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, calendarIntegration: !formData.calendarIntegration })}
                    className={`w-12 h-6 rounded-full transition-all duration-200 relative ${
                      formData.calendarIntegration ? 'accent-bg-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-lg transform transition-transform duration-200 absolute top-0.5 ${
                      formData.calendarIntegration ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 p-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-xl font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid()}
            className={`flex-1 p-3 rounded-xl font-semibold transition-all ${
              isFormValid()
                ? 'accent-bg-500 hover-accent-bg-dark text-white hover:-translate-y-0.5 shadow-lg shadow-accent'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
{editingHabit ? 'Update Habit' : 'Create Habit'}
          </button>
        </div>
      </div>
    </div>
  );
}