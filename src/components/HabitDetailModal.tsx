import React, { useState } from 'react';
import { Habit } from '../types/habit';
import { useHabitStore, formatDateToString } from '../store/habitStore';
import { X, Edit3, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface HabitDetailModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (habit: Habit) => void;
}

export default function HabitDetailModal({ habit, isOpen, onClose, onEdit }: HabitDetailModalProps) {
  const { 
    getHabitStreak, 
    getCompletionRate, 
    getTotalCompletions,
    getBestStreak,
    getMonthlyProgress,
    toggleDayCompletion,
    deleteHabit,
    isHabitCompletedOnDate
  } = useHabitStore();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!isOpen || !habit) return null;

  const currentStreak = getHabitStreak(habit.id);

  const handleDelete = () => {
    deleteHabit(habit.id);
    onClose();
  };

  const handleEdit = () => {
    onEdit(habit);
    onClose();
  };

  const handleDayClick = (dateStr: string, isFuture: boolean) => {
    if (!isFuture) {
      // For simple habits, use toggle
      toggleDayCompletion(habit.id, dateStr);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isRequiredWeeklyDay = (date: Date) => {
    if (habit.frequency !== 'weekly' || !habit.selectedDays) return false;
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayName = dayNames[date.getDay()];
    return habit.selectedDays.includes(dayName);
  };


  // Generate calendar days for selected month
  const generateCalendarDays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // Use same date formatting as habit store for consistency
      const dateStr = formatDateToString(date);
      const isCompleted = isHabitCompletedOnDate(habit.id, dateStr);
      const isToday = dateStr === formatDateToString(today);
      const isFuture = date > today;
      const isRequiredDay = isRequiredWeeklyDay(date);
      
      days.push({
        day,
        dateStr,
        isCompleted,
        isToday,
        isFuture,
        isRequiredDay
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  // Helper function to get lighter shade of habit color
  const getLighterColor = (color: string, opacity: number = 0.2) => {
    // Convert hex to rgb and add opacity
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Get frequency display text
  const getFrequencyText = () => {
    switch (habit.frequency) {
      case 'weekly':
        if (habit.selectedDays) {
          const dayNames = {
            mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', 
            fri: 'Fri', sat: 'Sat', sun: 'Sun'
          };
          // Sort days in proper week order (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
          const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
          const sortedDays = habit.selectedDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
          const selectedDayNames = sortedDays.map(day => dayNames[day as keyof typeof dayNames]).join(', ');
          return `Weekly • ${selectedDayNames}`;
        }
        return 'Weekly';
      case 'daily':
        return 'Daily';
      case 'custom':
        if (habit.customFrequency) {
          return `${habit.customFrequency.times}x per ${habit.customFrequency.period}`;
        }
        return 'Custom';
      default:
        return 'Daily';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl transform transition-transform max-h-[90vh] overflow-y-auto">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="p-6 pb-4">
          {/* Top row: Icon, Name, Description, Close button */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0"
                style={{ backgroundColor: habit.color }}
              >
                {habit.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{habit.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{habit.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0 ml-4"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Two column layout: Current Streak + Frequency */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            {/* Current Streak */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1" style={{ color: habit.color }}>
                {currentStreak}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">CURRENT STREAK</div>
            </div>
            
            {/* Frequency */}
            <div className="text-center">
              <div className="text-lg font-bold mb-1" style={{ color: habit.color }}>
                {getFrequencyText()}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">FREQUENCY</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit3 className="w-5 h-5" />
            Edit Habit
          </button>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-xl font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Delete
          </button>
        </div>

        {/* Calendar Section */}
        <div className="px-6 pb-6">
          <div className="mb-4">
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Calendar</div>
            
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentMonth} {currentYear}
              </h3>
              
              <button
                onClick={() => navigateMonth('next')}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Calendar Grid */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-600 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={index} className="aspect-square" />;
                }

                let buttonClass = 'aspect-square rounded-lg text-sm font-medium transition-all ';
                let buttonStyle: React.CSSProperties = {};

                if (day.isCompleted) {
                  // Completed day - full habit color
                  buttonClass += 'text-white border-2 border-opacity-100';
                  buttonStyle.backgroundColor = habit.color;
                  buttonStyle.borderColor = habit.color;
                } else if (day.isToday) {
                  // Today - dashed border in habit color
                  buttonClass += 'bg-white dark:bg-gray-600 border-2 border-dashed text-gray-900 dark:text-white';
                  buttonStyle.borderColor = habit.color;
                } else if (day.isFuture) {
                  // Future dates - disabled, lighter appearance
                  buttonClass += 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed';
                } else if (day.isRequiredDay) {
                  // Required weekly day - light background of habit color
                  buttonClass += 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-500 hover:scale-105';
                  buttonStyle.backgroundColor = getLighterColor(habit.color, 0.15);
                } else {
                  // Regular available day
                  buttonClass += 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-500 hover:scale-105';
                }


                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day.dateStr, day.isFuture)}
                    disabled={day.isFuture}
                    className={buttonClass}
                    style={buttonStyle}
                  >
                    <span className="text-sm font-bold">{day.day}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>


        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Habit</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{habit.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}