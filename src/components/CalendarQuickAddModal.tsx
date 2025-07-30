import React, { useState } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import { useTaskStore } from '../store/taskStore';
import { useHabitStore } from '../store/habitStore';
import { useSettingsStore } from '../store/settingsStore';
import { Task } from '../types/task';
import { Habit } from '../types/habit';
import { createQuickAddOptions, createCalendarEventFromTask, createCalendarEventsFromHabit } from '../utils/calendarMapping';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { getAccentColorValue } from '../utils/accentColors';
import TimeBlockModal from './TimeBlockModal';

interface CalendarQuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTime: string;
  selectedDate: Date;
}

type QuickAddOption = 'link_task' | 'link_habit' | 'time_block' | 'custom_event';

export default function CalendarQuickAddModal({
  isOpen,
  onClose,
  selectedTime,
  selectedDate
}: CalendarQuickAddModalProps) {
  const { addTimeBlock } = useCalendarStore();
  const { tasks, updateTask } = useTaskStore();
  const { habits, updateHabit } = useHabitStore();
  const { getAccentColor } = useSettingsStore();
  
  const currentAccentColor = getAccentColorValue(getAccentColor());
  
  // Helper function to convert hex to rgb
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  const [selectedOption, setSelectedOption] = useState<QuickAddOption | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showTimeBlockModal, setShowTimeBlockModal] = useState(false);

  // Get quick add options
  const quickOptions = createQuickAddOptions(
    parseInt(selectedTime.split(':')[0]),
    selectedDate,
    tasks,
    habits
  );

  const handleLinkTask = (task: Task) => {
    const taskOptions = {
      selectedDate,
      startTime: selectedTime,
      duration: task.estimatedTime || 60,
      enableReminder: false,
      reminderMinutes: 15,
      setAsDeadline: false
    };

    const timeBlockData = createCalendarEventFromTask(task, taskOptions);
    addTimeBlock(timeBlockData);
    
    // Update task with calendar integration
    updateTask(task.id, {
      addToCalendar: true,
      calendarStartTime: selectedTime,
      calendarDuration: taskOptions.duration,
      dueDate: selectedDate
    });
    
    onClose();
  };

  const handleLinkHabit = (habit: Habit) => {
    const habitOptions = {
      startDate: selectedDate,
      duration: 'week' as const,
      preferredTime: selectedTime,
      estimatedDuration: getHabitEstimatedDuration(habit),
      followHabitFrequency: true,
      enableReminders: habit.reminderMinutes !== undefined,
      reminderMinutes: habit.reminderMinutes || 15
    };

    const events = createCalendarEventsFromHabit(habit, habitOptions);
    
    // Add events to calendar (limit to current date for quick add)
    const todayEvent = events.find(event => event.date === quickOptions.defaultTimeBlock.date);
    if (todayEvent) {
      addTimeBlock(todayEvent);
    }
    
    // Update habit with calendar integration
    updateHabit(habit.id, {
      calendarIntegration: true,
      scheduledTime: selectedTime
    });
    
    onClose();
  };

  const modalSwipe = useSwipeGesture({
    onSwipeUp: onClose,
    threshold: 75,
    preventHorizontal: true
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50" onClick={onClose}>
        <div
          className="bg-gray-800 w-full max-w-md rounded-t-2xl p-6 transform transition-transform max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          {...modalSwipe.swipeHandlers}
        >
          {/* Handle Bar */}
          <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Quick Add</h2>
              <p className="text-gray-400 text-sm">
                {selectedTime} • {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600"
            >
              ×
            </button>
          </div>

          {/* Quick Options */}
          <div className="space-y-4">
            {/* Link Existing Task */}
            {quickOptions.quickTasks.length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <span className="text-blue-400">✓</span>
                  Link Existing Task
                </h3>
                <div className="space-y-2">
                  {quickOptions.quickTasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => handleLinkTask(task)}
                      className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">
                          {task.type === 'to-buy' ? '🛒' : '✓'}
                        </span>
                        <div className="flex-1">
                          <p className="text-white font-medium">{task.name}</p>
                          <p className="text-gray-400 text-sm">
                            {task.estimatedTime ? `${task.estimatedTime} min` : 'No time estimate'}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500">
                          Priority {task.priority}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Link Existing Habit */}
            {quickOptions.quickHabits.length > 0 && (
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <span className="text-green-400">🔄</span>
                  Link Existing Habit
                </h3>
                <div className="space-y-2">
                  {quickOptions.quickHabits.map(habit => (
                    <button
                      key={habit.id}
                      onClick={() => handleLinkHabit(habit)}
                      className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{habit.icon}</span>
                        <div className="flex-1">
                          <p className="text-white font-medium">{habit.name}</p>
                          <p className="text-gray-400 text-sm">
                            {habit.frequency} • 
                            {habit.measurementType === 'time' && habit.targetAmount
                              ? ` ${habit.targetAmount} ${habit.targetUnit || 'min'}`
                              : ` ${getHabitEstimatedDuration(habit)} min estimated`
                            }
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Create Time Block */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <span style={{ color: currentAccentColor }}>⏰</span>
                Create Time Block
              </h3>
              <button
                onClick={() => setShowTimeBlockModal(true)}
                className="w-full p-4 rounded-lg text-left transition-colors"
                style={{
                  backgroundColor: currentAccentColor + '33',
                  borderColor: currentAccentColor + '4D',
                  border: '1px solid'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = currentAccentColor + '4D';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = currentAccentColor + '33';
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="text-white font-medium">New Time Block</p>
                    <p className="text-sm" style={{ color: currentAccentColor + 'CC' }}>
                      Schedule focused work time
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Presets */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <span className="text-purple-400">⚡</span>
                Quick Presets
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { title: 'Meeting', icon: '👥', duration: 60, type: 'work' },
                  { title: 'Break', icon: '☕', duration: 15, type: 'personal' },
                  { title: 'Focus Time', icon: '🎯', duration: 90, type: 'work' },
                  { title: 'Exercise', icon: '💪', duration: 45, type: 'health' }
                ].map(preset => (
                  <button
                    key={preset.title}
                    onClick={() => {
                      addTimeBlock({
                        ...quickOptions.defaultTimeBlock,
                        title: preset.title,
                        icon: preset.icon,
                        durationMinutes: preset.duration,
                        type: preset.type as any
                      });
                      onClose();
                    }}
                    className="p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-center transition-colors"
                  >
                    <div className="text-lg mb-1">{preset.icon}</div>
                    <div className="text-white text-sm font-medium">{preset.title}</div>
                    <div className="text-gray-400 text-xs">{preset.duration} min</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Empty State */}
          {quickOptions.quickTasks.length === 0 && quickOptions.quickHabits.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📅</div>
              <p className="text-gray-400 mb-4">
                No pending tasks or habits to link.
              </p>
              <button
                onClick={() => setShowTimeBlockModal(true)}
                className="px-6 py-2 text-white rounded-lg transition-colors"
                style={{ backgroundColor: currentAccentColor }}
                onMouseEnter={(e) => {
                  const rgb = hexToRgb(currentAccentColor);
                  if (rgb) {
                    e.currentTarget.style.backgroundColor = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = currentAccentColor;
                }}
              >
                Create Time Block
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Time Block Modal */}
      <TimeBlockModal
        isOpen={showTimeBlockModal}
        onClose={() => {
          setShowTimeBlockModal(false);
          onClose();
        }}
        defaultDate={selectedDate}
        defaultStartTime={selectedTime}
      />
    </>
  );
}

function getHabitEstimatedDuration(habit: Habit): number {
  if (habit.measurementType === 'time' && habit.targetAmount) {
    return habit.targetAmount;
  }
  
  switch (habit.measurementType) {
    case 'count':
      return Math.max(15, (habit.targetAmount || 1) * 5);
    case 'simple':
      return 30;
    case 'custom':
      return 45;
    default:
      return 30;
  }
}