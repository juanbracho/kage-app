import { useState, useEffect } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import { TimeBlockFormData, TimeBlock } from '../types/calendar';
import { useModalSwipe } from '../hooks/useSwipeGesture';

interface TimeBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledTime?: string;
  prefilledDate?: string;
  editingTimeBlock?: TimeBlock;
}

const BLOCK_TYPES = [
  { id: 'focus', icon: '🧠', name: 'Focus Work', desc: 'Deep work session' },
  { id: 'meeting', icon: '💼', name: 'Meeting', desc: 'Scheduled meetings' },
  { id: 'learning', icon: '📚', name: 'Learning', desc: 'Study & courses' },
  { id: 'break', icon: '☕', name: 'Break', desc: 'Rest & recharge' },
  { id: 'creative', icon: '🎨', name: 'Creative', desc: 'Creative work' },
  { id: 'admin', icon: '📋', name: 'Admin', desc: 'Administrative tasks' }
];

const ICONS = [
  '🧠', '💻', '📝', '🎯', '💼', '📞',
  '📚', '🎨', '☕', '🏃', '🧘', '📋'
];

const COLORS = [
  'linear-gradient(135deg, #FF7101, #e55a00)',
  'linear-gradient(135deg, #3B82F6, #1E40AF)',
  'linear-gradient(135deg, #22C55E, #15803D)',
  'linear-gradient(135deg, #A855F7, #7C3AED)',
  'linear-gradient(135deg, #EF4444, #DC2626)',
  'linear-gradient(135deg, #F59E0B, #D97706)',
  'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  'linear-gradient(135deg, #06B6D4, #0891B2)'
];

const DURATION_PRESETS = [
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 150, label: '2.5 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' }
];

export default function TimeBlockModal({ isOpen, onClose, prefilledTime, prefilledDate, editingTimeBlock }: TimeBlockModalProps) {
  const { addTimeBlock, updateTimeBlock, checkTimeConflict } = useCalendarStore();
  const [showIconGrid, setShowIconGrid] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  
  const [formData, setFormData] = useState<TimeBlockFormData>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    durationMinutes: 120,
    blockType: 'focus',
    icon: '🧠',
    color: COLORS[0],
    isRecurring: false,
    recurrenceType: 'weekly',
    recurrenceInterval: 1,
    recurrenceEndDate: ''
  });

  const [customDuration, setCustomDuration] = useState('');
  const [useCustomDuration, setUseCustomDuration] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      
      // If editing an existing time block, populate form with its data
      if (editingTimeBlock) {
        setFormData({
          title: editingTimeBlock.title,
          description: editingTimeBlock.description || '',
          date: editingTimeBlock.date,
          startTime: editingTimeBlock.startTime,
          durationMinutes: editingTimeBlock.durationMinutes,
          blockType: editingTimeBlock.blockType,
          icon: editingTimeBlock.icon,
          color: editingTimeBlock.color,
          isRecurring: editingTimeBlock.isRecurring || false,
          recurrenceType: editingTimeBlock.recurrenceType || 'weekly',
          recurrenceInterval: editingTimeBlock.recurrenceInterval || 1,
          recurrenceEndDate: editingTimeBlock.recurrenceEndDate || ''
        });
        
        // Show advanced options if the time block has advanced settings
        if (editingTimeBlock.isRecurring) {
          setShowRecurring(true);
        }
        if (editingTimeBlock.description || editingTimeBlock.linkedItemType) {
          setShowAdvanced(true);
        }
        
        // Handle custom duration display
        const standardDuration = DURATION_PRESETS.find(preset => preset.value === editingTimeBlock.durationMinutes);
        if (!standardDuration) {
          setUseCustomDuration(true);
          setCustomDuration(editingTimeBlock.durationMinutes.toString());
        }
      } else {
        // Creating new time block - use defaults or prefilled values
        setFormData({
          title: '',
          description: '',
          date: prefilledDate || today.toISOString().split('T')[0],
          startTime: prefilledTime || '09:00',
          durationMinutes: 120,
          blockType: 'focus',
          icon: '🧠',
          color: COLORS[0],
          isRecurring: false,
          recurrenceType: 'weekly',
          recurrenceInterval: 1,
          recurrenceEndDate: ''
        });
      }
      
      setShowIconGrid(false);
      if (!editingTimeBlock) {
        setShowAdvanced(false);
        setShowRecurring(false);
        setUseCustomDuration(false);
        setCustomDuration('');
      }
    }
  }, [isOpen, prefilledTime, prefilledDate, editingTimeBlock]);

  const isFormValid = () => {
    if (!formData.title.trim()) return false;
    if (!formData.date) return false;
    if (!formData.startTime) return false;
    if (formData.durationMinutes < 15) return false;
    
    // Check for time conflicts
    if (checkTimeConflict(formData.date, formData.startTime, formData.durationMinutes)) {
      return false;
    }
    
    return true;
  };

  const handleSave = () => {
    if (!isFormValid()) return;
    
    if (editingTimeBlock) {
      // Update existing time block
      updateTimeBlock(editingTimeBlock.id, formData);
    } else {
      // Create new time block
      addTimeBlock(formData);
    }
    
    onClose();
  };

  const handleBlockTypeSelect = (blockType: string) => {
    const selectedType = BLOCK_TYPES.find(type => type.id === blockType);
    if (selectedType) {
      setFormData({
        ...formData,
        blockType: blockType as any,
        icon: selectedType.icon,
        title: formData.title || selectedType.name
      });
    }
  };

  const handleDurationChange = (value: string) => {
    if (value === 'custom') {
      setUseCustomDuration(true);
    } else {
      setUseCustomDuration(false);
      setFormData({ ...formData, durationMinutes: parseInt(value) });
    }
  };

  const handleCustomDurationChange = (value: string) => {
    setCustomDuration(value);
    
    // Parse H:MM format
    const match = value.match(/^(\d{1,2}):([0-5]\d)$/);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const totalMinutes = hours * 60 + minutes;
      
      if (totalMinutes >= 15 && totalMinutes <= 480) {
        setFormData({ ...formData, durationMinutes: totalMinutes });
      }
    }
  };

  const formatEndTime = () => {
    if (!formData.startTime || !formData.durationMinutes) return '';
    
    const [hours, minutes] = formData.startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + formData.durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  };

  const swipeHandlers = useModalSwipe(onClose, !isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3 pb-24 sm:p-4 md:p-5">
      <div {...swipeHandlers} className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm sm:max-w-md md:max-w-lg max-h-full overflow-hidden shadow-xl animate-in slide-in-from-bottom-4 duration-300 text-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editingTimeBlock ? 'Edit Time Block' : 'Create Time Block'}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[calc(100vh-240px)] overflow-y-auto space-y-6">
          {/* Block Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Block Type</label>
            <div className="grid grid-cols-2 gap-3">
              {BLOCK_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleBlockTypeSelect(type.id)}
                  className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all text-center ${
                    formData.blockType === type.id
                      ? 'accent-border-500 accent-bg-50 accent-text-600'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <div className="font-semibold text-sm">{type.name}</div>
                  <div className="text-xs text-gray-500">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What will you work on?"
              className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus-accent-border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details about this time block..."
              rows={3}
              className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus-accent-border transition-colors resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus-accent-border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Start Time *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus-accent-border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Duration *</label>
            <div className="flex gap-3 items-center">
              <select
                value={useCustomDuration ? 'custom' : formData.durationMinutes.toString()}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="flex-1 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus-accent-border transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {DURATION_PRESETS.map(preset => (
                  <option key={preset.value} value={preset.value}>{preset.label}</option>
                ))}
                <option value="custom">Custom time</option>
              </select>
              {useCustomDuration && (
                <input
                  type="text"
                  value={customDuration}
                  onChange={(e) => handleCustomDurationChange(e.target.value)}
                  placeholder="2:30"
                  pattern="[0-9]:[0-5][0-9]"
                  className="w-20 p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus-accent-border transition-colors text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              )}
            </div>
          </div>

          {/* Visual Customization */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Visual</label>
            <div className="grid grid-cols-[auto_1fr] gap-5 items-start">
              <div className="flex flex-col items-center gap-3">
                <div
                  onClick={() => setShowIconGrid(!showIconGrid)}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl text-white cursor-pointer transition-all hover:scale-105"
                  style={{ background: formData.color }}
                >
                  {formData.icon}
                </div>
                
                {showIconGrid && (
                  <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {ICONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => {
                          setFormData({ ...formData, icon });
                          setShowIconGrid(false);
                        }}
                        className="w-10 h-10 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center text-lg transition-colors"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">COLOR</div>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        formData.color === color ? 'scale-110 ring-2 ring-gray-400' : 'hover:scale-105'
                      }`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-3 w-full p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-lg">⚙️</span>
              <span className="font-semibold">Advanced Options</span>
              <span className={`ml-auto transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>▶</span>
            </button>
            
            {showAdvanced && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Reminder</label>
                  <select
                    value={formData.reminderMinutes || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      reminderMinutes: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus-accent-border bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">No reminder</option>
                    <option value="15">15 minutes before</option>
                    <option value="30">30 minutes before</option>
                    <option value="45">45 minutes before</option>
                    <option value="60">1 hour before</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Recurring Options */}
          <div>
            <button
              onClick={() => setShowRecurring(!showRecurring)}
              className="flex items-center gap-3 w-full p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-lg">🔁</span>
              <span className="font-semibold">Repeat Event</span>
              <span className={`ml-auto transition-transform ${showRecurring ? 'rotate-90' : ''}`}>▶</span>
            </button>
            
            {showRecurring && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                {/* Recurring Toggle */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Enable Repeat</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.isRecurring 
                        ? 'bg-orange-500' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div className={`absolute w-5 h-5 bg-white rounded-full transition-transform top-0.5 ${
                      formData.isRecurring ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                {formData.isRecurring && (
                  <>
                    {/* Recurrence Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Repeat</label>
                      <select
                        value={formData.recurrenceType}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          recurrenceType: e.target.value as 'weekly' | 'monthly'
                        })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus-accent-border bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    {/* Recurrence Interval */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Every {formData.recurrenceType === 'weekly' ? 'week(s)' : 'month(s)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={formData.recurrenceInterval}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          recurrenceInterval: parseInt(e.target.value) || 1
                        })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus-accent-border bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">End Date (Optional)</label>
                      <input
                        type="date"
                        value={formData.recurrenceEndDate}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          recurrenceEndDate: e.target.value
                        })}
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus-accent-border bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Preview */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Repeat Preview</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        Repeats every {formData.recurrenceInterval} {formData.recurrenceType === 'weekly' ? 'week' : 'month'}{formData.recurrenceInterval > 1 ? 's' : ''}
                        {formData.recurrenceEndDate && ` until ${new Date(formData.recurrenceEndDate).toLocaleDateString()}`}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">Preview</div>
            <div
              className="flex items-center gap-3 p-3 rounded-lg text-white"
              style={{ background: formData.color }}
            >
              <span className="text-xl">{formData.icon}</span>
              <div className="flex-1">
                <div className="font-semibold">{formData.title || 'New Time Block'}</div>
                <div className="text-sm opacity-90">
                  {formData.startTime} - {formatEndTime()} ({formatDuration(formData.durationMinutes)})
                </div>
              </div>
            </div>
            {checkTimeConflict(formData.date, formData.startTime, formData.durationMinutes) && (
              <div className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <span>⚠️</span>
                <span>Time conflict detected with existing time block</span>
              </div>
            )}
          </div>

          {/* Footer - Now part of scrollable content */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 p-3 border border-gray-300 dark:border-gray-700 rounded-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid()}
              className={`flex-1 p-3 rounded-lg font-semibold transition-all ${
                isFormValid()
                  ? 'accent-bg-500 hover-accent-bg-dark text-white hover:-translate-y-0.5 shadow-lg'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {editingTimeBlock ? '💾 Update Time Block' : '✨ Create Time Block'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}