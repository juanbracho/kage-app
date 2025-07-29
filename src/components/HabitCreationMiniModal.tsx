import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useModalSwipe } from '../hooks/useSwipeGesture';

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

interface HabitCreationMiniModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<TemporaryHabit, 'id'>) => void;
  editingHabit?: TemporaryHabit;
  goalColor?: string;
}

const HABIT_COLORS = [
  '#FF7101', // Orange (goal default)
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#A855F7', // Purple
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#6B7280', // Gray
  '#10B981'  // Emerald
];

const HABIT_ICONS = ['🔄', '💪', '📚', '🧘', '🏃', '💧', '🥗', '😴', '🎯', '⚡', '🌅', '🎨'];

const MEASUREMENT_TYPES = [
  { id: 'simple', icon: '✅', name: 'Simple', desc: 'Yes/No daily' },
  { id: 'count', icon: '🔢', name: 'Count', desc: 'Track number' },
  { id: 'time', icon: '⏱️', name: 'Time', desc: 'Track duration' },
  { id: 'custom', icon: '📊', name: 'Custom', desc: 'Custom units' }
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

export default function HabitCreationMiniModal({
  isOpen,
  onClose,
  onSave,
  editingHabit,
  goalColor = '#FF7101'
}: HabitCreationMiniModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🔄',
    color: goalColor,
    measurementType: 'simple' as const,
    frequency: 'daily' as const,
    selectedDays: [] as string[],
    customFrequency: { times: 1, period: 'day' as const },
    targetAmount: 1,
    targetUnit: 'units'
  });

  useEffect(() => {
    if (isOpen) {
      if (editingHabit) {
        setFormData({
          name: editingHabit.name,
          description: editingHabit.description || '',
          icon: editingHabit.icon,
          color: editingHabit.color,
          measurementType: editingHabit.measurementType,
          frequency: editingHabit.frequency,
          selectedDays: editingHabit.selectedDays || [],
          customFrequency: editingHabit.customFrequency || { times: 1, period: 'day' },
          targetAmount: editingHabit.targetAmount || 1,
          targetUnit: editingHabit.targetUnit || 'units'
        });
      } else {
        setFormData({
          name: '',
          description: '',
          icon: '🔄',
          color: goalColor,
          measurementType: 'simple',
          frequency: 'daily',
          selectedDays: [],
          customFrequency: { times: 1, period: 'day' },
          targetAmount: 1,
          targetUnit: 'units'
        });
      }
    }
  }, [isOpen, editingHabit, goalColor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      icon: formData.icon,
      color: formData.color,
      measurementType: formData.measurementType,
      frequency: formData.frequency,
      selectedDays: formData.selectedDays,
      customFrequency: formData.customFrequency,
      targetAmount: formData.targetAmount,
      targetUnit: formData.targetUnit
    });

    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      icon: '🔄',
      color: goalColor,
      measurementType: 'simple',
      frequency: 'daily',
      selectedDays: [],
      customFrequency: { times: 1, period: 'day' },
      targetAmount: 1,
      targetUnit: 'units'
    });
    onClose();
  };

  const swipeHandlers = useModalSwipe(handleClose, !isOpen);

  const toggleDay = (dayId: string) => {
    const selectedDays = formData.selectedDays || [];
    if (selectedDays.includes(dayId)) {
      const newSelectedDays = selectedDays.filter(d => d !== dayId);
      setFormData({ ...formData, selectedDays: newSelectedDays });
    } else {
      const newSelectedDays = [...selectedDays, dayId];
      setFormData({ ...formData, selectedDays: newSelectedDays });
    }
  };

  const getTargetUnit = () => {
    switch (formData.measurementType) {
      case 'count': return 'times';
      case 'time': return 'minutes';
      case 'custom': return formData.targetUnit || 'units';
      default: return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div {...swipeHandlers} className="bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            {editingHabit ? 'Edit Habit' : 'Add Habit'}
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Habit Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Habit Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="What habit do you want to build?"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus-accent-border transition-colors"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Why is this habit important?"
              rows={2}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus-accent-border transition-colors resize-none"
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                    formData.icon === icon
                      ? 'accent-bg-500 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    formData.color === color
                      ? 'border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ background: color }}
                >
                  {formData.color === color && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Measurement Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Measurement Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MEASUREMENT_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, measurementType: type.id as any })}
                  className={`p-2 rounded-lg text-xs transition-all ${
                    formData.measurementType === type.id
                      ? 'accent-bg-500 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <div className="font-medium">{type.icon} {type.name}</div>
                  <div className="opacity-75">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Amount - Only for count, time, custom */}
          {formData.measurementType !== 'simple' && (
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Target {getTargetUnit()}
              </label>
              <input
                type="number"
                min="1"
                value={formData.targetAmount || 1}
                onChange={(e) => setFormData({ ...formData, targetAmount: parseInt(e.target.value) || 1 })}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus-accent-border transition-colors"
              />
              {formData.measurementType === 'custom' && (
                <input
                  type="text"
                  value={formData.targetUnit}
                  onChange={(e) => setFormData({ ...formData, targetUnit: e.target.value })}
                  placeholder="Custom unit (e.g., pages, cups)"
                  className="w-full p-3 mt-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus-accent-border transition-colors"
                />
              )}
            </div>
          )}

          {/* Frequency */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Frequency
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {FREQUENCY_OPTIONS.map(freq => (
                <button
                  key={freq.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, frequency: freq.id as any })}
                  className={`p-2 rounded-lg text-xs transition-all ${
                    formData.frequency === freq.id
                      ? 'accent-bg-500 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  <div className="font-medium">{freq.name}</div>
                  <div className="opacity-75">{freq.desc}</div>
                </button>
              ))}
            </div>
            
            {/* Weekly Days Selection */}
            {formData.frequency === 'weekly' && (
              <div>
                <div className="text-xs text-gray-400 mb-2">Select days:</div>
                <div className="flex gap-1 justify-center">
                  {DAYS.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        formData.selectedDays?.includes(day.id)
                          ? 'accent-bg-500 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
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
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={formData.customFrequency?.times || 1}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    customFrequency: { 
                      ...formData.customFrequency!, 
                      times: parseInt(e.target.value) || 1 
                    } 
                  })}
                  className="w-16 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-center focus:outline-none focus-accent-border transition-colors"
                />
                <span className="p-2 text-gray-400 text-sm">times per</span>
                <select
                  value={formData.customFrequency?.period || 'day'}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    customFrequency: { 
                      ...formData.customFrequency!, 
                      period: e.target.value as any 
                    } 
                  })}
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus-accent-border transition-colors"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-2">Preview</div>
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ background: formData.color }}
              >
                {formData.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">
                  {formData.name || 'Habit name'}
                </div>
                <div className="text-xs text-gray-400">
                  {MEASUREMENT_TYPES.find(t => t.id === formData.measurementType)?.name} • {formData.frequency.charAt(0).toUpperCase() + formData.frequency.slice(1)}
                  {formData.measurementType !== 'simple' && ` • ${formData.targetAmount} ${getTargetUnit()}`}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || (formData.frequency === 'weekly' && formData.selectedDays!.length === 0) || (formData.measurementType !== 'simple' && (!formData.targetAmount || formData.targetAmount < 1))}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                formData.name.trim()
                  ? 'accent-bg-500 hover-accent-bg-dark text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {editingHabit ? 'Update Habit' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}