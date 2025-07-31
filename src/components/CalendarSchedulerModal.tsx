import React, { useState } from 'react';
import { Task } from '../types/task';
import { Habit } from '../types/habit';
import { useCalendarStore } from '../store/calendarStore';
import { useTaskStore } from '../store/taskStore';
import { useHabitStore } from '../store/habitStore';
import { 
  createCalendarEventFromTask, 
  createCalendarEventsFromHabit,
  TaskSchedulingOptions,
  HabitSchedulingOptions
} from '../utils/calendarMapping';

interface CalendarSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceType: 'task' | 'habit';
  sourceData: Task | Habit;
  defaultDate?: Date;
  defaultTime?: string;
}

export default function CalendarSchedulerModal({
  isOpen,
  onClose,
  sourceType,
  sourceData,
  defaultDate = new Date(),
  defaultTime = '09:00'
}: CalendarSchedulerModalProps) {
  const { addTimeBlock } = useCalendarStore();
  const { updateTask } = useTaskStore();
  const { updateHabit } = useHabitStore();

  // Task scheduling state
  const [taskOptions, setTaskOptions] = useState<TaskSchedulingOptions>({
    selectedDate: defaultDate,
    startTime: defaultTime,
    duration: (sourceData as Task).estimatedTime || 60,
    enableReminder: false,
    reminderMinutes: 15,
    setAsDeadline: false
  });

  // Habit scheduling state
  const [habitOptions, setHabitOptions] = useState<HabitSchedulingOptions>({
    startDate: defaultDate,
    duration: 'month',
    preferredTime: (sourceData as Habit).scheduledTime || defaultTime,
    estimatedDuration: getHabitEstimatedDuration(sourceData as Habit),
    followHabitFrequency: true,
    enableReminders: (sourceData as Habit).reminderMinutes !== undefined,
    reminderMinutes: (sourceData as Habit).reminderMinutes || 15
  });

  const handleScheduleTask = () => {
    const task = sourceData as Task;
    const timeBlockData = createCalendarEventFromTask(task, taskOptions);
    
    // Add to calendar
    addTimeBlock(timeBlockData);
    
    // Update task with calendar integration
    updateTask(task.id, {
      addToCalendar: true,
      calendarStartTime: taskOptions.startTime,
      calendarDuration: taskOptions.duration,
      dueDate: taskOptions.selectedDate
    });
    
    onClose();
  };

  const handleScheduleHabit = () => {
    const habit = sourceData as Habit;
    const events = createCalendarEventsFromHabit(habit, habitOptions);
    
    // Add all recurring events to calendar
    events.forEach(eventData => {
      addTimeBlock(eventData);
    });
    
    // Update habit with calendar integration
    updateHabit(habit.id, {
      calendarIntegration: true,
      scheduledTime: habitOptions.preferredTime
    });
    
    onClose();
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-800 w-full max-w-md rounded-t-2xl p-6 transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle Bar */}
        <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            Add to Calendar
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:bg-gray-600"
          >
            ×
          </button>
        </div>

        {/* Source Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg mb-6">
          <span className="text-2xl">
            {sourceType === 'task' ? 
              ((sourceData as Task).type === 'to-buy' ? '🛒' : '✓') : 
              (sourceData as Habit).icon
            }
          </span>
          <div>
            <h3 className="text-white font-medium">{sourceData.name}</h3>
            <p className="text-gray-400 text-sm">
              {sourceType === 'task' ? 'Task' : 'Habit'}
            </p>
          </div>
        </div>

        {/* Task Scheduling Options */}
        {sourceType === 'task' && (
          <div className="space-y-4">
            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={taskOptions.selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setTaskOptions(prev => ({
                    ...prev,
                    selectedDate: new Date(e.target.value)
                  }))}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={taskOptions.startTime}
                  onChange={(e) => setTaskOptions(prev => ({
                    ...prev,
                    startTime: e.target.value
                  }))}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={taskOptions.duration}
                onChange={(e) => setTaskOptions(prev => ({
                  ...prev,
                  duration: parseInt(e.target.value)
                }))}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Reminder */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Enable Reminder
              </label>
              <button
                onClick={() => setTaskOptions(prev => ({
                  ...prev,
                  enableReminder: !prev.enableReminder
                }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  taskOptions.enableReminder ? 'bg-orange-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    taskOptions.enableReminder ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {taskOptions.enableReminder && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reminder (minutes before)
                </label>
                <select
                  value={taskOptions.reminderMinutes}
                  onChange={(e) => setTaskOptions(prev => ({
                    ...prev,
                    reminderMinutes: parseInt(e.target.value)
                  }))}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
                >
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Habit Scheduling Options */}
        {sourceType === 'habit' && (
          <div className="space-y-4">
            {/* Schedule Period */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Schedule for
              </label>
              <select
                value={habitOptions.duration}
                onChange={(e) => setHabitOptions(prev => ({
                  ...prev,
                  duration: e.target.value as 'week' | 'month' | 'custom'
                }))}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
              >
                <option value="week">Next Week</option>
                <option value="month">Next Month</option>
                <option value="custom">Custom Period</option>
              </select>
            </div>

            {/* Preferred Time */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preferred Time
              </label>
              <input
                type="time"
                value={habitOptions.preferredTime}
                onChange={(e) => setHabitOptions(prev => ({
                  ...prev,
                  preferredTime: e.target.value
                }))}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={habitOptions.estimatedDuration}
                onChange={(e) => setHabitOptions(prev => ({
                  ...prev,
                  estimatedDuration: parseInt(e.target.value)
                }))}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Frequency Info */}
            <div className="p-3 bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong>Current Frequency:</strong> {(sourceData as Habit).frequency}
                {(sourceData as Habit).selectedDays && (
                  <span> on {(sourceData as Habit).selectedDays?.join(', ')}</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={sourceType === 'task' ? handleScheduleTask : handleScheduleHabit}
            className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Add to Calendar
          </button>
        </div>
      </div>
    </div>
  );
}

function getHabitEstimatedDuration(habit: Habit): number {
  if (habit.measurementType === 'time' && habit.targetAmount) {
    return habit.targetAmount;
  }
  
  // Smart defaults based on measurement type
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