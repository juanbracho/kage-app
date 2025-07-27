import React from 'react';
import { Habit } from '../types/habit';
import { useHabitStore, formatDateToString } from '../store/habitStore';

interface HabitCardProps {
  habit: Habit;
  onClick: () => void;
}

export default function HabitCard({ habit, onClick }: HabitCardProps) {
  const { 
    toggleDayCompletion, 
    isHabitCompletedToday, 
    getHabitStreak,
    getCompletionRate,
    getLastTwoWeeksProgress
  } = useHabitStore();

  const isCompletedToday = isHabitCompletedToday(habit.id);
  const currentStreak = getHabitStreak(habit.id);
  const completionRate = getCompletionRate(habit.id, 30);
  const progressData = getLastTwoWeeksProgress(habit.id);


  const handleCompletionToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const todayStr = formatDateToString(today);
    
    // For simple habits, use the toggle
    toggleDayCompletion(habit.id, todayStr);
  };

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return '#10B981'; // Good - green
    if (rate >= 60) return '#F59E0B'; // Medium - amber
    return '#EF4444'; // Poor - red
  };

  const getFrequencyText = () => {
    switch (habit.frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        if (habit.selectedDays) {
          const dayInitials = {
            mon: 'M', tue: 'Tu', wed: 'W', thu: 'Th', 
            fri: 'F', sat: 'Sa', sun: 'Su'
          };
          // Sort days in proper week order (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
          const dayOrder = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
          const sortedDays = habit.selectedDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
          const selectedDayInitials = sortedDays.map(day => dayInitials[day as keyof typeof dayInitials]).join(' ');
          return `Weekly • ${selectedDayInitials}`;
        }
        return 'Weekly';
      case 'custom':
        if (habit.customFrequency) {
          return `${habit.customFrequency.times}x per ${habit.customFrequency.period}`;
        }
        return 'Custom';
      default:
        return 'Daily';
    }
  };

  const getStreakText = () => {
    if (habit.frequency === 'weekly') {
      return `${currentStreak} weeks`;
    } else if (habit.frequency === 'custom') {
      return `${currentStreak} periods`;
    }
    return `${currentStreak} days`;
  };

  // Helper function to get lighter shade of habit color
  const getLighterColor = (color: string, opacity: number = 0.3) => {
    // Convert hex to rgb and add opacity
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
      onClick={onClick}
      style={{ borderLeft: `4px solid ${habit.color}` }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Habit Icon */}
        <div 
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xl font-semibold"
          style={{ backgroundColor: habit.color }}
        >
          {habit.icon}
        </div>

        {/* Habit Info - takes most space */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg leading-tight mb-1">
            {habit.name}
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              {getFrequencyText()}
            </span>
            <span 
              className="font-semibold"
              style={{ color: getCompletionRateColor(completionRate) }}
            >
              {completionRate}% completion
            </span>
          </div>
        </div>

        {/* Right side container */}
        <div className="flex flex-col items-center gap-2">
          {/* Completion Button - varies by habit type */}
          <button
            onClick={handleCompletionToggle}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-200 hover:scale-105 relative ${
              isCompletedToday
                ? 'text-white border-opacity-100'
                : 'text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-opacity-70'
            }`}
            style={{
              backgroundColor: isCompletedToday ? habit.color : undefined,
              borderColor: isCompletedToday ? habit.color : undefined,
            }}
            onMouseEnter={(e) => {
              if (!isCompletedToday) {
                e.currentTarget.style.borderColor = habit.color;
                e.currentTarget.style.color = habit.color;
              }
            }}
            onMouseLeave={(e) => {
              if (!isCompletedToday) {
                e.currentTarget.style.borderColor = '';
                e.currentTarget.style.color = '';
              }
            }}
          >
            '✓'
          </button>

          {/* Streak Info - below button */}
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold"
            style={{ 
              backgroundColor: 'var(--accent-100, #FFEDD5)',
              color: 'var(--accent-color, #FF7101)'
            }}
          >
            <span>🔥</span>
            <span>{getStreakText()}</span>
          </div>
        </div>
      </div>

      {/* Progress Grid */}
      <div className="flex gap-1 mt-2">
        {progressData.slice(-7).map((day) => {
          let className = 'w-4 h-4 rounded border transition-all duration-200 ';
          const style: React.CSSProperties = {};

          if (day.completed) {
            // Completed day - full habit color
            className += 'border-opacity-100';
            style.backgroundColor = habit.color;
            style.borderColor = habit.color;
          } else if (day.isToday) {
            // Today - dashed border in habit color
            className += 'border-2 border-dashed bg-white dark:bg-gray-700';
            style.borderColor = habit.color;
          } else if (day.isRequired) {
            // Required day (for weekly habits) - light habit color background
            className += 'border-gray-200 dark:border-gray-600';
            style.backgroundColor = getLighterColor(habit.color, 0.3);
          } else {
            // Non-required day - gray background, low opacity
            className += 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-40';
          }

          return (
            <div
              key={day.date}
              className={className}
              style={style}
            />
          );
        })}
      </div>
    </div>
  );
}