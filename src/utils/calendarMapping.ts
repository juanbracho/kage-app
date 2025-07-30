import { Task } from '../types/task';
import { Habit } from '../types/habit';
import { CalendarEvent, TimeBlockFormData } from '../types/calendar';

export interface TaskSchedulingOptions {
  selectedDate: Date;
  startTime: string;
  duration: number;
  enableReminder: boolean;
  reminderMinutes: number;
  setAsDeadline: boolean;
}

export interface HabitSchedulingOptions {
  startDate: Date;
  duration: 'week' | 'month' | 'custom';
  endDate?: Date;
  preferredTime: string;
  estimatedDuration: number;
  followHabitFrequency: boolean;
  enableReminders: boolean;
  reminderMinutes: number;
}

/**
 * Creates a calendar event from a task with scheduling options
 */
export function createCalendarEventFromTask(
  task: Task, 
  options: TaskSchedulingOptions
): TimeBlockFormData {
  const endTime = calculateEndTime(options.startTime, options.duration);
  
  return {
    title: task.name,
    description: task.description || '',
    date: formatDateForCalendar(options.selectedDate),
    startTime: options.startTime,
    durationMinutes: options.duration,
    type: getTaskBlockType(task.type),
    color: getTaskColor(task.priority),
    icon: getTaskIcon(task.type),
    recurring: false,
    notes: generateTaskNotes(task)
  };
}

/**
 * Creates recurring calendar events from a habit
 */
export function createCalendarEventsFromHabit(
  habit: Habit,
  options: HabitSchedulingOptions
): TimeBlockFormData[] {
  const events: TimeBlockFormData[] = [];
  const dateRange = getSchedulingDateRange(options.startDate, options.duration, options.endDate);
  const occurrenceDates = getHabitOccurrenceDates(habit, dateRange);

  for (const date of occurrenceDates) {
    events.push({
      title: habit.name,
      description: habit.description || generateHabitDescription(habit),
      date: formatDateForCalendar(date),
      startTime: options.preferredTime,
      durationMinutes: options.estimatedDuration,
      type: 'personal',
      color: habit.color || '#34C759',
      icon: habit.icon || '🔄',
      recurring: true,
      notes: generateHabitNotes(habit)
    });
  }

  return events;
}

/**
 * Quick add integration - create event from empty calendar slot
 */
export function createQuickAddOptions(
  hour: number,
  date: Date,
  availableTasks: Task[],
  availableHabits: Habit[]
) {
  const timeString = `${hour.toString().padStart(2, '0')}:00`;
  
  return {
    selectedTime: timeString,
    selectedDate: date,
    quickTasks: availableTasks
      .filter(task => !task.addToCalendar && task.status === 'pending')
      .slice(0, 5), // Show top 5 pending tasks
    quickHabits: availableHabits
      .filter(habit => shouldShowHabitForDate(habit, date))
      .slice(0, 3), // Show top 3 relevant habits
    defaultTimeBlock: {
      title: '',
      description: '',
      date: formatDateForCalendar(date),
      startTime: timeString,
      durationMinutes: 60,
      type: 'work' as const,
      color: 'var(--accent-color, #FF7101)',
      icon: '⏰',
      recurring: false,
      notes: ''
    }
  };
}

// Helper functions

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMins = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
}

function formatDateForCalendar(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTaskBlockType(taskType: string): 'work' | 'personal' | 'health' | 'learning' | 'social' | 'travel' {
  switch (taskType) {
    case 'deadline':
      return 'work';
    case 'to-buy':
      return 'personal';
    default:
      return 'work';
  }
}

function getTaskColor(priority: number): string {
  const colors = {
    1: '#FF3B30', // High priority - Red
    2: '#FF9500', // Medium-high - Orange  
    3: '#007AFF', // Medium - Blue
    4: '#34C759', // Medium-low - Green
    5: '#8E8E93'  // Low priority - Gray
  };
  return colors[priority as keyof typeof colors] || '#007AFF';
}

function getTaskIcon(taskType: string): string {
  const icons = {
    'standard': '✓',
    'to-buy': '🛒',
    'deadline': '⏰'
  };
  return icons[taskType as keyof typeof icons] || '✓';
}

function generateTaskNotes(task: Task): string {
  let notes = '';
  
  if (task.estimatedTime) {
    notes += `Estimated time: ${task.estimatedTime} minutes\n`;
  }
  
  if (task.location) {
    notes += `Location: ${task.location}\n`;
  }
  
  if (task.notes) {
    notes += `Notes: ${task.notes}\n`;
  }
  
  if (task.tags.length > 0) {
    notes += `Tags: ${task.tags.join(', ')}`;
  }
  
  return notes.trim();
}

function generateHabitDescription(habit: Habit): string {
  if (habit.measurementType === 'time' && habit.targetAmount) {
    return `${habit.targetAmount} ${habit.targetUnit || 'minutes'}`;
  } else if (habit.measurementType === 'count' && habit.targetAmount) {
    return `${habit.targetAmount} ${habit.targetUnit || 'times'}`;
  }
  return habit.description || 'Daily habit';
}

function generateHabitNotes(habit: Habit): string {
  let notes = '';
  
  if (habit.measurementType === 'time' && habit.targetAmount) {
    notes += `Target: ${habit.targetAmount} ${habit.targetUnit || 'minutes'}\n`;
  } else if (habit.measurementType === 'count' && habit.targetAmount) {
    notes += `Target: ${habit.targetAmount} ${habit.targetUnit || 'times'}\n`;
  }
  
  if (habit.frequency === 'weekly' && habit.selectedDays) {
    notes += `Days: ${habit.selectedDays.join(', ')}\n`;
  }
  
  if (habit.streak > 0) {
    notes += `Current streak: ${habit.streak} days`;
  }
  
  return notes.trim();
}

function getSchedulingDateRange(
  startDate: Date,
  duration: 'week' | 'month' | 'custom',
  endDate?: Date
): { start: Date; end: Date } {
  const start = new Date(startDate);
  let end: Date;
  
  switch (duration) {
    case 'week':
      end = new Date(start);
      end.setDate(start.getDate() + 7);
      break;
    case 'month':
      end = new Date(start);
      end.setMonth(start.getMonth() + 1);
      break;
    case 'custom':
      end = endDate || new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
      break;
  }
  
  return { start, end };
}

function getHabitOccurrenceDates(habit: Habit, dateRange: { start: Date; end: Date }): Date[] {
  const dates: Date[] = [];
  
  if (habit.frequency === 'daily') {
    for (let d = new Date(dateRange.start); d <= dateRange.end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
  } else if (habit.frequency === 'weekly' && habit.selectedDays) {
    const dayMap: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };
    
    const targetDays = habit.selectedDays.map(day => dayMap[day]).filter(d => d !== undefined);
    
    for (let d = new Date(dateRange.start); d <= dateRange.end; d.setDate(d.getDate() + 1)) {
      if (targetDays.includes(d.getDay())) {
        dates.push(new Date(d));
      }
    }
  } else if (habit.frequency === 'custom' && habit.customFrequency) {
    // For custom frequency, generate based on the pattern
    let current = new Date(dateRange.start);
    const interval = habit.customFrequency.period === 'week' ? 7 : 30;
    const timesPerPeriod = habit.customFrequency.times;
    
    while (current <= dateRange.end) {
      for (let i = 0; i < timesPerPeriod && current <= dateRange.end; i++) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + Math.floor(interval / timesPerPeriod));
      }
    }
  }
  
  return dates;
}

function shouldShowHabitForDate(habit: Habit, date: Date): boolean {
  if (habit.frequency === 'daily') return true;
  
  if (habit.frequency === 'weekly' && habit.selectedDays) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getDay()];
    return habit.selectedDays.includes(dayName);
  }
  
  return true; // Default to showing for custom frequency
}

/**
 * Bidirectional sync - update source entities when calendar events change
 */
export function syncCalendarEventToTask(event: CalendarEvent, task: Task): Partial<Task> {
  return {
    dueDate: new Date(event.date),
    calendarStartTime: event.startTime,
    calendarDuration: parseInt(event.endTime.split(':')[0]) * 60 + parseInt(event.endTime.split(':')[1]) - 
                     (parseInt(event.startTime.split(':')[0]) * 60 + parseInt(event.startTime.split(':')[1])),
    addToCalendar: true
  };
}

export function syncCalendarEventToHabit(event: CalendarEvent, habit: Habit): Partial<Habit> {
  return {
    scheduledTime: event.startTime,
    calendarIntegration: true
  };
}