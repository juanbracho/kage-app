import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TimeBlock, CalendarEvent, TimeBlockFormData, CalendarView, DayViewData, WeekViewData, MonthViewData } from '../types/calendar';

interface CalendarStore {
  timeBlocks: TimeBlock[];
  currentView: CalendarView;
  currentDate: Date;
  addTimeBlock: (timeBlockData: TimeBlockFormData) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  toggleTimeBlockCompletion: (id: string) => void;
  setCurrentView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
  navigateToDay: (date: Date) => void;
  navigatePrevious: () => void;
  navigateNext: () => void;
  getDayViewData: (date: Date) => DayViewData;
  getWeekViewData: (date: Date) => WeekViewData;
  getMonthViewData: (date: Date) => MonthViewData;
  getAllEventsForDate: (date: string) => CalendarEvent[];
  checkTimeConflict: (date: string, startTime: string, durationMinutes: number, excludeId?: string) => boolean;
  generateRecurringEvents: (originalEvent: TimeBlock) => void;
  cleanupRecurringEvents: (originalEventId: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDateToString = (date: Date) => {
  // Use local date formatting to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formatted = `${year}-${month}-${day}`;
  return formatted;
};

// const formatTimeString = (date: Date) => {
//   return date.toTimeString().slice(0, 5);
// };

const addMinutesToTime = (timeStr: string, minutes: number): string => {
  const [hours, mins] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

// Sample time blocks for demonstration (commented out for empty state)
// const sampleTimeBlocks: TimeBlock[] = [
//   {
//     id: '1',
//     title: 'Team standup meeting',
//     description: 'Daily standup with the development team',
//     date: '2025-07-09',
//     startTime: '09:00',
//     durationMinutes: 30,
//     blockType: 'meeting',
//     icon: '💼',
//     color: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
//     status: 'scheduled',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   },
//   {
//     id: '2',
//     title: 'Deep Work Session',
//     description: 'Focus time for React development',
//     date: '2025-07-09',
//     startTime: '10:00',
//     durationMinutes: 120,
//     blockType: 'focus',
//     icon: '🧠',
//     color: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
//     status: 'scheduled',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   },
//   {
//     id: '3',
//     title: 'Code Review Session',
//     description: 'Review pull requests and provide feedback',
//     date: '2025-07-09',
//     startTime: '14:00',
//     durationMinutes: 60,
//     blockType: 'admin',
//     icon: '💻',
//     color: 'linear-gradient(135deg, #F59E0B, #D97706)',
//     status: 'scheduled',
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString()
//   }
// ];

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
  timeBlocks: [],
  currentView: 'day',
  currentDate: new Date(),
  
  addTimeBlock: (timeBlockData: TimeBlockFormData) => {
    const newTimeBlock: TimeBlock = {
      id: generateId(),
      ...timeBlockData,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    set((state) => {
      return {
        timeBlocks: [...state.timeBlocks, newTimeBlock]
      };
    });
    
    // Generate recurring events if applicable
    if (newTimeBlock.isRecurring) {
      get().generateRecurringEvents(newTimeBlock);
    }
  },
  
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => {
    set((state) => ({
      timeBlocks: state.timeBlocks.map(block =>
        block.id === id
          ? { ...block, ...updates, updatedAt: new Date().toISOString() }
          : block
      )
    }));
  },
  
  deleteTimeBlock: (id: string) => {
    console.log('🗑️ Calendar Store: Deleting time block with ID:', id);
    
    const { timeBlocks } = get();
    const blockToDelete = timeBlocks.find(block => block.id === id);
    
    // If deleting a recurring event (original), also delete all its instances
    if (blockToDelete?.isRecurring) {
      get().cleanupRecurringEvents(id);
    }
    
    set((state) => {
      const filteredBlocks = state.timeBlocks.filter(block => block.id !== id);
      console.log('🗑️ Calendar Store: Blocks before deletion:', state.timeBlocks.length);
      console.log('🗑️ Calendar Store: Blocks after deletion:', filteredBlocks.length);
      return {
        timeBlocks: filteredBlocks
      };
    });
  },
  
  toggleTimeBlockCompletion: (id: string) => {
    set((state) => ({
      timeBlocks: state.timeBlocks.map(block =>
        block.id === id
          ? {
              ...block,
              status: block.status === 'completed' ? 'scheduled' : 'completed',
              updatedAt: new Date().toISOString()
            }
          : block
      )
    }));
  },
  
  setCurrentView: (view: CalendarView) => {
    set({ currentView: view });
  },
  
  setCurrentDate: (date: Date) => {
    set({ currentDate: new Date(date) });
  },
  
  navigateToDay: (date: Date) => {
    set({ 
      currentView: 'day',
      currentDate: new Date(date)
    });
  },
  
  navigatePrevious: () => {
    const { currentView, currentDate } = get();
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    
    set({ currentDate: newDate });
  },
  
  navigateNext: () => {
    const { currentView, currentDate } = get();
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    
    set({ currentDate: newDate });
  },
  
  getDayViewData: (date: Date) => {
    const { timeBlocks } = get();
    const dateString = formatDateToString(date);
    
    console.log('Calendar getDayViewData:', {
      requestedDate: dateString,
      totalTimeBlocks: timeBlocks.length,
      allBlockDates: timeBlocks.map(b => b.date)
    });
    
    // Get time blocks for this date
    const dayTimeBlocks = timeBlocks.filter(block => block.date === dateString);
    
    console.log('Filtered timeBlocks for date:', {
      date: dateString,
      foundBlocks: dayTimeBlocks.length,
      blocks: dayTimeBlocks
    });
    
    // Convert time blocks to calendar events
    const events: CalendarEvent[] = dayTimeBlocks.map(block => ({
      id: block.id,
      title: block.title,
      description: block.description,
      date: block.date,
      startTime: block.startTime,
      endTime: addMinutesToTime(block.startTime, block.durationMinutes),
      type: 'timeblock',
      icon: block.icon,
      color: block.color,
      completed: block.status === 'completed',
      linkedId: block.id
    }));
    
    // Calculate stats based on linkedItemType from time blocks
    const stats = {
      totalTasks: dayTimeBlocks.filter(block => block.linkedItemType === 'task').length,
      totalHabits: dayTimeBlocks.filter(block => block.linkedItemType === 'habit').length,
      completedItems: events.filter(e => e.completed).length
    };
    
    return {
      date: dateString,
      events,
      stats
    };
  },
  
  getWeekViewData: (date: Date) => {
    const { timeBlocks } = get();
    
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay(); // 0 = Sunday, 1 = Monday, etc.
    startOfWeek.setDate(startOfWeek.getDate() - day); // Go back to Sunday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    console.log('🗓️ getWeekViewData Debug:', {
      inputDate: date.toISOString(),
      startOfWeek: startOfWeek.toISOString(),
      endOfWeek: endOfWeek.toISOString(),
      totalTimeBlocks: timeBlocks.length,
      timeBlockDates: timeBlocks.map(b => b.date)
    });
    
    const days: DayViewData[] = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      const dayViewData = get().getDayViewData(currentDay);
      
      console.log(`📅 Week Day ${i}:`, {
        date: formatDateToString(currentDay),
        eventsFound: dayViewData.events.length
      });
      
      days.push(dayViewData);
    }
    
    return {
      weekStart: formatDateToString(startOfWeek),
      weekEnd: formatDateToString(endOfWeek),
      days
    };
  },
  
  getMonthViewData: (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Get first day of month and adjust to start on Sunday
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    startDate.setDate(firstDay.getDate() - dayOfWeek); // Go back to Sunday
    
    // Get days to display (usually 42 days - 6 weeks)
    const days: (DayViewData & { dayNumber: number; isCurrentMonth: boolean; isToday: boolean })[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const currentDay = new Date(startDate);
      currentDay.setDate(startDate.getDate() + i);
      
      const dayData = get().getDayViewData(currentDay);
      const isCurrentMonth = currentDay.getMonth() === month;
      const isToday = formatDateToString(currentDay) === formatDateToString(today);
      
      days.push({
        ...dayData,
        dayNumber: currentDay.getDate(),
        isCurrentMonth,
        isToday
      });
    }
    
    return {
      year,
      month,
      days
    };
  },
  
  getAllEventsForDate: (date: string) => {
    const { timeBlocks } = get();
    
    return timeBlocks
      .filter(block => block.date === date)
      .map(block => ({
        id: block.id,
        title: block.title,
        description: block.description,
        date: block.date,
        startTime: block.startTime,
        endTime: addMinutesToTime(block.startTime, block.durationMinutes),
        type: 'timeblock' as const,
        icon: block.icon,
        color: block.color,
        completed: block.status === 'completed',
        linkedId: block.id
      }));
  },
  
  checkTimeConflict: (date: string, startTime: string, durationMinutes: number, excludeId?: string) => {
    const { timeBlocks } = get();
    
    const endTime = addMinutesToTime(startTime, durationMinutes);
    
    return timeBlocks.some(block => {
      if (block.id === excludeId || block.date !== date) return false;
      
      const blockEndTime = addMinutesToTime(block.startTime, block.durationMinutes);
      
      // Check for overlap
      return (
        (startTime >= block.startTime && startTime < blockEndTime) ||
        (endTime > block.startTime && endTime <= blockEndTime) ||
        (startTime <= block.startTime && endTime >= blockEndTime)
      );
    });
  },

  generateRecurringEvents: (originalEvent: TimeBlock) => {
    if (!originalEvent.isRecurring) return;
    
    const { timeBlocks } = get();
    const startDate = new Date(originalEvent.date);
    const endDate = originalEvent.recurrenceEndDate 
      ? new Date(originalEvent.recurrenceEndDate)
      : new Date(startDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year ahead
    
    const recurringInstances: TimeBlock[] = [];
    const currentDate = new Date(startDate);
    
    // Generate recurring instances
    while (currentDate <= endDate) {
      // Move to next occurrence
      if (originalEvent.recurrenceType === 'weekly') {
        currentDate.setDate(currentDate.getDate() + (7 * (originalEvent.recurrenceInterval || 1)));
      } else if (originalEvent.recurrenceType === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + (originalEvent.recurrenceInterval || 1));
      }
      
      if (currentDate > endDate) break;
      
      // Skip if date is in exceptions
      const dateString = formatDateToString(currentDate);
      if (originalEvent.recurrenceExceptions?.includes(dateString)) continue;
      
      // Create recurring instance
      const recurringInstance: TimeBlock = {
        ...originalEvent,
        id: generateId(),
        date: dateString,
        originalEventId: originalEvent.id,
        isRecurring: false, // Individual instances are not recurring
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      recurringInstances.push(recurringInstance);
      
      // Limit to prevent infinite generation (max 100 instances)
      if (recurringInstances.length >= 100) break;
    }
    
    // Add all recurring instances to the store
    set((state) => ({
      timeBlocks: [...state.timeBlocks, ...recurringInstances]
    }));
  },

  cleanupRecurringEvents: (originalEventId: string) => {
    set((state) => ({
      timeBlocks: state.timeBlocks.filter(block => block.originalEventId !== originalEventId)
    }));
  }
    }),
    {
      name: 'calendar-store',
      version: 1,
      partialize: (state) => ({
        timeBlocks: state.timeBlocks
      })
    }
  )
);