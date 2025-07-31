import React from 'react';
import { Habit } from '../types/habit';
import { useHabitStore, formatDateToString } from '../store/habitStore';

interface HabitRowProps {
  habit: Habit;
  selectedDate?: Date;
  onClick: () => void;
}

export default function HabitRow({ habit, selectedDate, onClick }: HabitRowProps) {
  const { toggleDayCompletion, isHabitCompletedOnDate, isRequiredDay } = useHabitStore();

  // Get the 5-day window centered around selected date (or today if not provided)
  const getFiveDayWindow = () => {
    const centerDate = selectedDate || new Date();
    const today = new Date();
    const days = [];
    
    // Create 5-day window: 2 days before center, center day, 2 days after
    for (let i = -2; i <= 2; i++) {
      const day = new Date(centerDate);
      day.setDate(centerDate.getDate() + i);
      
      const dateString = formatDateToString(day);
      const isToday = day.toDateString() === today.toDateString();
      const isCompleted = isHabitCompletedOnDate(habit.id, dateString);
      const isRequired = isRequiredDay(habit.id, dateString);
      
      const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      
      days.push({
        date: dateString,
        label: dayLabels[day.getDay()],
        isToday,
        isCompleted,
        isRequired
      });
    }
    
    return days;
  };

  const fiveDayWindow = getFiveDayWindow();

  const handleDayToggle = (e: React.MouseEvent, dateString: string) => {
    e.stopPropagation();
    toggleDayCompletion(habit.id, dateString);
  };

  return (
    <div 
      className="flex items-center justify-between p-4 mb-3 bg-gray-700 rounded-2xl cursor-pointer hover:bg-gray-600 transition-all duration-200 w-full"
      onClick={onClick}
      style={{ color: habit.color }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-5 h-5 flex items-center justify-center text-base flex-shrink-0">
          {habit.icon}
        </div>
        <div className="text-base font-medium truncate" style={{ color: habit.color }}>
          {habit.name}
        </div>
      </div>
      
      <div className="flex gap-1.5 flex-shrink-0 ml-4">
        {fiveDayWindow.map((day) => (
          <div key={day.date} className="flex flex-col items-center">
            <div className="text-xs text-gray-400 text-center mb-1 whitespace-nowrap">
              {day.label}
            </div>
            <div 
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer text-xs font-bold ${
                day.isCompleted 
                  ? 'text-white' 
                  : 'text-gray-400'
              } ${
                day.isToday ? 'border-[3px]' : 'border-2'
              } ${
                !day.isRequired ? 'opacity-30' : ''
              }`}
              style={{ 
                borderColor: habit.color,
                backgroundColor: day.isCompleted ? habit.color : 'transparent'
              }}
              onClick={(e) => handleDayToggle(e, day.date)}
            >
              {day.isCompleted ? '✓' : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}