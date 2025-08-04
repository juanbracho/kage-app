import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TimeBlock, CalendarEvent, TimeBlockFormData, CalendarView, DayViewData } from '../types/calendar';

interface CalendarStore {
  timeBlocks: TimeBlock[];
  currentView: CalendarView;
  currentDate: Date;
  addTimeBlock: (timeBlockData: TimeBlockFormData) => Promise<void>;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => Promise<void>;
  deleteTimeBlock: (id: string) => void;
  deleteSingleRecurringEvent: (id: string) => void;
  deleteRecurringSeries: (originalEventId: string) => void;
  toggleTimeBlockCompletion: (id: string) => void;
  toggleSingleRecurringCompletion: (id: string) => void;
  toggleRecurringSeriesCompletion: (originalEventId: string, completed: boolean) => void;
  isRecurringEvent: (id: string) => boolean;
  getOriginalEventId: (id: string) => string | null;
  setCurrentView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
  navigateToDay: (date: Date) => void;
  navigatePrevious: () => void;
  navigateNext: () => void;
  getDayViewData: (date: Date) => DayViewData;
  getEventsForDate: (date: Date) => CalendarEvent[];
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

// Save verification and retry helpers
const verifySave = async (storeName: string, expectedCount?: number, timeoutMs = 2000): Promise<boolean> => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      try {
        const item = localStorage.getItem(storeName);
        if (item) {
          const parsed = JSON.parse(item);
          const actualCount = parsed?.state?.timeBlocks?.length || 0;
          
          if (expectedCount === undefined || actualCount >= expectedCount) {
            console.log('📅 Calendar Store: Save verification successful:', actualCount, 'timeBlocks');
            clearInterval(checkInterval);
            resolve(true);
            return;
          }
        }
      } catch (error) {
        console.error('📅 Calendar Store: Save verification error:', error);
      }
      
      if (Date.now() - startTime >= timeoutMs) {
        console.warn('📅 Calendar Store: Save verification timeout');
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
};

const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 500
): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`📅 Calendar Store: Operation failed (attempt ${attempt}/${maxRetries}):`, lastError.message);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
};

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
  
  addTimeBlock: async (timeBlockData: TimeBlockFormData) => {
    console.log('📅 Calendar Store: Adding time block:', timeBlockData.title);
    
    const newTimeBlock: TimeBlock = {
      id: generateId(),
      ...timeBlockData,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Use retry mechanism for the entire operation
    await retryOperation(async () => {
      // Get current count for verification
      const currentCount = get().timeBlocks.length;
      const expectedCount = currentCount + 1;
      
      // Perform the state update
      set((state) => {
        const updatedState = {
          ...state,
          timeBlocks: [...state.timeBlocks, newTimeBlock]
        };
        console.log('📅 Calendar Store: Updated timeBlocks count:', updatedState.timeBlocks.length);
        return updatedState;
      });
      
      // Verify the save was persisted
      const saveVerified = await verifySave('calendar-store', expectedCount, 3000);
      if (!saveVerified) {
        throw new Error('Failed to verify timeblock save to storage');
      }
      
      // Generate recurring events if applicable
      if (newTimeBlock.isRecurring) {
        console.log('📅 Calendar Store: Generating recurring events for:', newTimeBlock.title);
        get().generateRecurringEvents(newTimeBlock);
      }
      
      console.log('📅 Calendar Store: Successfully added and verified timeblock:', newTimeBlock.title);
    });
  },
  
  updateTimeBlock: async (id: string, updates: Partial<TimeBlock>) => {
    console.log('📅 Calendar Store: Updating time block:', id);
    
    await retryOperation(async () => {
      const currentCount = get().timeBlocks.length;
      
      // Perform the state update
      set((state) => ({
        timeBlocks: state.timeBlocks.map(block =>
          block.id === id
            ? { ...block, ...updates, updatedAt: new Date().toISOString() }
            : block
        )
      }));
      
      // Verify the update was persisted (same count but content changed)
      const saveVerified = await verifySave('calendar-store', currentCount, 2000);
      if (!saveVerified) {
        throw new Error('Failed to verify timeblock update to storage');
      }
      
      console.log('📅 Calendar Store: Successfully updated and verified timeblock:', id);
    });
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
    const { currentDate } = get();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    set({ currentDate: newDate });
  },
  
  navigateNext: () => {
    const { currentDate } = get();
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);  
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
  
  
  getEventsForDate: (date: Date) => {
    const dateString = formatDateToString(date);
    return get().getAllEventsForDate(dateString);
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

  isRecurringEvent: (id: string) => {
    const { timeBlocks } = get();
    const block = timeBlocks.find(b => b.id === id);
    return !!(block?.isRecurring || block?.originalEventId);
  },
  
  getOriginalEventId: (id: string) => {
    const { timeBlocks } = get();
    const block = timeBlocks.find(b => b.id === id);
    return block?.originalEventId || (block?.isRecurring ? id : null);
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
      partialize: (state) => {
        console.log('📅 Calendar Store: Partializing state - timeBlocks count:', state.timeBlocks.length);
        return {
          timeBlocks: state.timeBlocks,
          currentView: state.currentView,
          currentDate: state.currentDate
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('📅 Calendar Store: Rehydrated - timeBlocks count:', state.timeBlocks?.length || 0);
          // Ensure currentDate is a proper Date object after rehydration
          if (state.currentDate && typeof state.currentDate === 'string') {
            state.currentDate = new Date(state.currentDate);
          }
        }
      },
      // Add storage failure recovery
      storage: {
        getItem: (key) => {
          try {
            const item = localStorage.getItem(key);
            console.log('📅 Calendar Store: Retrieved from storage:', key, item ? 'success' : 'empty');
            return item;
          } catch (error) {
            console.error('📅 Calendar Store: Storage getItem failed:', error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, value);
            console.log('📅 Calendar Store: Saved to storage:', key, 'success');
          } catch (error) {
            console.error('📅 Calendar Store: Storage setItem failed:', error);
            // Optionally try to clear some space or notify user
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
            console.log('📅 Calendar Store: Removed from storage:', key);
          } catch (error) {
            console.error('📅 Calendar Store: Storage removeItem failed:', error);
          }
        }
      }
    }
  )
);