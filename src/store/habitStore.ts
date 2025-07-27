import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Habit, HabitCompletion, HabitFormData, FrequencyChange } from '../types/habit';
import { useCalendarStore } from './calendarStore';
import { TimeBlockFormData } from '../types/calendar';

interface HabitStore {
  habits: Habit[];
  completions: HabitCompletion[];
  viewMode: 'grid' | 'list';
  addHabit: (habitData: HabitFormData) => string;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (habitId: string, date: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  getHabitCompletions: (habitId: string) => HabitCompletion[];
  getHabitStreak: (habitId: string) => number;
  isHabitCompletedToday: (habitId: string) => boolean;
  // Enhanced streak calculation methods
  calculateStreakForFrequency: (habitId: string, frequency: 'daily' | 'weekly' | 'custom') => number;
  calculateDailyStreak: (completions: HabitCompletion[], today: Date, habit?: Habit) => number;
  calculateWeeklyStreak: (completions: HabitCompletion[], selectedDays: string[], today: Date) => number;
  calculateCustomStreak: (completions: HabitCompletion[], customFreq: {times: number; period: 'week' | 'month'} | undefined, today: Date) => number;
  // Day-specific completion methods
  toggleDayCompletion: (habitId: string, date: string) => void;
  isRequiredDay: (habitId: string, date: string) => boolean;
  getCompletionRate: (habitId: string, days?: number) => number;
  getLastTwoWeeksProgress: (habitId: string) => import('../types/habit').DayCompletion[];
  // Goal linking
  linkHabitToGoal: (habitId: string, goalId: string) => void;
  unlinkHabitFromGoal: (habitId: string, goalId: string) => void;
  getHabitsByGoal: (goalId: string) => Habit[];
  // Time block regeneration
  regenerateAllTimeBlocks: () => void;
  // Frequency change handling
  changeHabitFrequency: (habitId: string, newFrequency: Habit['frequency'], newSelectedDays?: string[], newCustomFrequency?: Habit['customFrequency'], reason?: string) => void;
  getHabitFrequencyHistory: (habitId: string) => FrequencyChange[];
  getTotalStreakContext: (habitId: string) => { current: number; historical: number; label: string; };
  // Detail modal methods
  getTotalCompletions: (habitId: string) => number;
  getBestStreak: (habitId: string) => number;
  getMonthlyProgress: (habitId: string) => any[];
  isHabitCompletedOnDate: (habitId: string, date: string) => boolean;
  // Best streak helper methods
  calculateBestDailyStreak: (habitId: string) => number;
  calculateBestWeeklyStreak: (habitId: string) => number;
  calculateBestCustomStreak: (habitId: string) => number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const formatDateToString = (date: Date) => {
  // Use local date formatting to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formatted = `${year}-${month}-${day}`;
  return formatted;
};

const today = formatDateToString(new Date());

// Helper function to determine if current day is over
// For now, we'll consider the day "over" at 11:59 PM
// This could be made configurable in the future
const isCurrentDayOver = (checkDate: Date = new Date()): boolean => {
  const now = new Date();
  const endOfDay = new Date(checkDate);
  endOfDay.setHours(23, 59, 59, 999);
  return now > endOfDay;
};

// Helper function to determine if current week is over
// Week ends on Sunday at 11:59 PM
const isCurrentWeekOver = (checkDate: Date = new Date()): boolean => {
  const now = new Date();
  const endOfWeek = new Date(checkDate);
  
  // Find the end of the current week (Sunday)
  const dayOfWeek = endOfWeek.getDay();
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return now > endOfWeek;
};

// Helper function to determine if current period is over
const isCurrentPeriodOver = (period: 'week' | 'month', checkDate: Date = new Date()): boolean => {
  if (period === 'week') {
    return isCurrentWeekOver(checkDate);
  } else {
    const now = new Date();
    const endOfMonth = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    return now > endOfMonth;
  }
};

// Helper function to generate recurring time blocks for habits
const generateRecurringTimeBlocks = (habit: Habit): TimeBlockFormData[] => {
  
  const timeBlocks: TimeBlockFormData[] = [];
  if (!habit.calendarIntegration || !habit.startDate || !habit.scheduledTime) {
    return timeBlocks;
  }

  const startDate = new Date(habit.startDate);
  const today = new Date();
  const endDate = new Date(today.getTime() + (8 * 7 * 24 * 60 * 60 * 1000)); // 8 weeks from now

  if (habit.frequency === 'daily') {
    // Fixed: Use proper date iteration without mutation
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      const dateString = formatDateToString(currentDate);
      
      
      timeBlocks.push({
        title: habit.name,
        description: habit.description || '',
        date: dateString,
        startTime: habit.scheduledTime,
        durationMinutes: 30, // Default duration, could be configurable
        blockType: 'focus', // Using focus as default for habits
        icon: habit.icon,
        color: habit.color,
        linkedItemType: 'habit',
        linkedItemId: habit.id
      });
    }
  } else if (habit.frequency === 'weekly' && habit.selectedDays) {
    const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const selectedDayNumbers = habit.selectedDays.map(day => dayMap[day as keyof typeof dayMap]);
    
    
    // Fixed: Use proper date iteration without mutation
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
    
    for (let i = 0; i <= totalDays; i++) {
      const currentDate = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      const dayOfWeek = currentDate.getDay();
      const dateString = formatDateToString(currentDate);
      
      if (selectedDayNumbers.includes(dayOfWeek)) {
        
        timeBlocks.push({
          title: habit.name,
          description: habit.description || '',
          date: dateString,
          startTime: habit.scheduledTime,
          durationMinutes: 30,
          blockType: 'focus', // Using focus as default for habits
          icon: habit.icon,
          color: habit.color,
          linkedItemType: 'habit',
          linkedItemId: habit.id
        });
      }
    }
  }
  // TODO: Add custom frequency support
  
  return timeBlocks;
};

// Sample data for demonstration
const sampleHabits: Habit[] = [
  {
    id: '1',
    name: 'Exercise',
    description: 'Daily workout routine to stay healthy and energized',
    icon: '🏃',
    color: '#10B981',
    measurementType: 'simple',
    frequency: 'daily',
    startDate: '2025-07-01',
    scheduledTime: '07:30',
    streak: 12,
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    completions: []
  },
  {
    id: '2',
    name: 'Reading',
    description: 'Read for at least 20 pages every day to expand knowledge',
    icon: '📚',
    color: '#3B82F6',
    measurementType: 'time',
    targetAmount: 20,
    targetUnit: 'pages',
    frequency: 'daily',
    startDate: '2025-07-01',
    scheduledTime: '21:00',
    streak: 8,
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    completions: []
  },
  {
    id: '3',
    name: 'Drink Water',
    description: 'Stay hydrated by drinking 8 glasses of water daily',
    icon: '💧',
    color: '#06B6D4',
    measurementType: 'simple',
    frequency: 'daily',
    streak: 25,
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    completions: []
  },
  {
    id: '4',
    name: 'Meditation',
    description: 'Practice mindfulness meditation three times a week',
    icon: '🧘',
    color: '#8B5CF6',
    measurementType: 'simple',
    frequency: 'weekly',
    selectedDays: ['mon', 'wed', 'fri'],
    startDate: '2025-07-01',
    scheduledTime: '18:00',
    streak: 3,
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
    completions: []
  }
];

// Generate sample completions for the last 30 days
const generateSampleCompletions = (): HabitCompletion[] => {
  const completions: HabitCompletion[] = [];
  const habits = sampleHabits;
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatDateToString(date);
    
    habits.forEach(habit => {
      // Generate realistic completion patterns
      let shouldComplete = false;
      
      switch (habit.id) {
        case '1': // Exercise - good consistency with occasional misses
          shouldComplete = Math.random() > 0.14; // 86% completion rate
          break;
        case '2': // Reading - moderate consistency
          shouldComplete = Math.random() > 0.29; // 71% completion rate
          break;
        case '3': // Drink Water - very consistent
          shouldComplete = Math.random() > 0.06; // 94% completion rate
          break;
        case '4': // Meditation - weekly habit, check if it's required day
          const dayOfWeek = date.getDay();
          const isRequired = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5; // Mon, Wed, Fri
          shouldComplete = isRequired && Math.random() > 0.11; // 89% completion rate on required days
          break;
      }
      
      if (shouldComplete) {
        completions.push({
          id: generateId(),
          habitId: habit.id,
          date: dateStr,
          completed: true,
          completedAt: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    });
  }
  
  return completions;
};

const regenerateTimeBlocksForAllHabits = () => {
  const habitStore = useHabitStore.getState();
  const calendarStore = useCalendarStore.getState();
  
  
  // Clear existing habit time blocks
  const habitTimeBlocks = calendarStore.timeBlocks.filter(block => 
    block.linkedItemType === 'habit'
  );
  
  habitTimeBlocks.forEach(block => {
    calendarStore.deleteTimeBlock(block.id);
  });
  
  // Regenerate time blocks for all habits with calendar integration
  habitStore.habits.forEach(habit => {
    if (habit.calendarIntegration) {
      const timeBlocks = generateRecurringTimeBlocks(habit);
      timeBlocks.forEach(timeBlock => {
        calendarStore.addTimeBlock(timeBlock);
      });
    }
  });
};

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
  habits: [],
  completions: [],
  viewMode: 'list',
  
  addHabit: (habitData: HabitFormData): string => {
    const habitId = generateId();
    const newHabit: Habit = {
      id: habitId,
      ...habitData,
      streak: 0,
      completions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    set((state) => ({
      habits: [...state.habits, newHabit]
    }));
    
    // Generate calendar time blocks if calendar integration is enabled
    if (newHabit.calendarIntegration) {
      const timeBlocks = generateRecurringTimeBlocks(newHabit);
      const calendarStore = useCalendarStore.getState();
      timeBlocks.forEach(timeBlock => {
        calendarStore.addTimeBlock(timeBlock);
      });
    }
    
    // Update goal progress if habit is linked to a goal
    if (newHabit.goalId) {
      import('./goalStore').then(({ useGoalStore }) => {
        useGoalStore.getState().updateGoalProgress(newHabit.goalId!)
      }).catch(console.warn)
    }
    
    return habitId;
  },
  
  updateHabit: (id: string, updates: Partial<Habit>) => {
    const { habits } = get();
    const oldHabit = habits.find(h => h.id === id);
    if (!oldHabit) return;
    
    const updatedHabit = { ...oldHabit, ...updates, updatedAt: new Date().toISOString() };
    
    set((state) => ({
      habits: state.habits.map(habit =>
        habit.id === id ? updatedHabit : habit
      )
    }));
    
    // Update calendar integration if scheduling changed
    if (updates.calendarIntegration !== undefined || updates.startDate || updates.scheduledTime || updates.frequency || updates.selectedDays) {
      const calendarStore = useCalendarStore.getState();
      
      // Remove old time blocks
      const oldTimeBlocks = calendarStore.timeBlocks.filter(block => 
        block.linkedItemType === 'habit' && block.linkedItemId === id
      );
      oldTimeBlocks.forEach(block => {
        calendarStore.deleteTimeBlock(block.id);
      });
      
      // Add new time blocks if calendar integration is enabled
      if (updatedHabit.calendarIntegration) {
        const timeBlocks = generateRecurringTimeBlocks(updatedHabit as Habit);
        timeBlocks.forEach(timeBlock => {
          calendarStore.addTimeBlock(timeBlock);
        });
      }
    }
    
    // Update goal progress if habit was/is linked to a goal
    const goalIds = new Set([oldHabit?.goalId, updatedHabit.goalId].filter(Boolean));
    goalIds.forEach(goalId => {
      if (goalId) {
        import('./goalStore').then(({ useGoalStore }) => {
          useGoalStore.getState().updateGoalProgress(goalId)
        }).catch(console.warn)
      }
    })
  },
  
  deleteHabit: (id: string) => {
    const habitToDelete = get().habits.find(h => h.id === id);
    
    set((state) => ({
      habits: state.habits.filter(habit => habit.id !== id),
      completions: state.completions.filter(completion => completion.habitId !== id)
    }));
    
    // Remove associated calendar time blocks
    const calendarStore = useCalendarStore.getState();
    const timeBlocks = calendarStore.timeBlocks.filter(block => 
      block.linkedItemType === 'habit' && block.linkedItemId === id
    );
    timeBlocks.forEach(block => {
      calendarStore.deleteTimeBlock(block.id);
    });
    
    // Update goal progress if deleted habit was linked to a goal
    if (habitToDelete?.goalId) {
      import('./goalStore').then(({ useGoalStore }) => {
        useGoalStore.getState().updateGoalProgress(habitToDelete.goalId!)
      }).catch(console.warn)
    }
  },
  
  toggleCompletion: (habitId: string, date: string) => {
    const { completions, habits } = get();
    const habit = habits.find(h => h.id === habitId);
    const existingCompletion = completions.find(
      c => c.habitId === habitId && c.date === date
    );
    
    if (existingCompletion) {
      // Remove completion
      set((state) => ({
        completions: state.completions.filter(
          c => !(c.habitId === habitId && c.date === date)
        )
      }));
    } else {
      // Add completion
      const newCompletion: HabitCompletion = {
        id: generateId(),
        habitId,
        date,
        completed: true,
        completedAt: new Date().toISOString()
      };
      
      set((state) => ({
        completions: [...state.completions, newCompletion]
      }));
    }
    
    // Update goal progress if habit is linked to a goal
    if (habit?.goalId) {
      import('./goalStore').then(({ useGoalStore }) => {
        useGoalStore.getState().updateGoalProgress(habit.goalId!)
      }).catch(console.warn)
    }
  },

  
  setViewMode: (mode: 'grid' | 'list') => {
    set({ viewMode: mode });
  },
  
  getHabitCompletions: (habitId: string) => {
    const { completions } = get();
    return completions.filter(c => c.habitId === habitId);
  },
  
  getHabitStreak: (habitId: string) => {
    const { habits, completions } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;
    
    const habitCompletions = completions
      .filter(c => c.habitId === habitId && c.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (habitCompletions.length === 0) return 0;
    
    // Use frequency-specific streak calculation
    return get().calculateStreakForFrequency(habitId, habit.frequency);
  },

  // Enhanced streak calculation based on frequency
  calculateStreakForFrequency: (habitId: string, frequency: 'daily' | 'weekly' | 'custom') => {
    const { habits, completions } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;
    
    const habitCompletions = completions
      .filter(c => c.habitId === habitId && c.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (habitCompletions.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (frequency) {
      case 'daily':
        return get().calculateDailyStreak(habitCompletions, today, habit);
      case 'weekly':
        return get().calculateWeeklyStreak(habitCompletions, habit.selectedDays || [], today);
      case 'custom':
        return get().calculateCustomStreak(habitCompletions, habit.customFrequency, today);
      default:
        return 0;
    }
  },

  // Daily habit streak calculation (simplified for simple habits)
  calculateDailyStreak: (completions: HabitCompletion[], today: Date, habit?: Habit) => {
    let streak = 0;
    const checkDate = new Date(today);
    
    // Count consecutive days backwards starting from today
    while (true) {
      const dateStr = formatDateToString(checkDate);
      const completion = completions.find(c => c.date === dateStr);
      
      // Check if day is completed for simple habits
      const isCompleted = completion ? completion.completed : false;
      
      if (isCompleted) {
        streak++;
      } else {
        // For today specifically, if no completion exists, don't break streak yet
        if (dateStr === formatDateToString(today)) {
          const todayCompletion = completions.find(c => c.date === dateStr);
          if (todayCompletion && !isCompleted) {
            // Explicitly marked as not completed, break streak
            break;
          }
          // No completion record for today yet, don't break streak but don't count it either
        } else {
          // Break the streak on first missed day (not today)
          break;
        }
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return streak;
  },

  // Weekly habit streak calculation (consecutive weeks with ALL selected days completed)
  calculateWeeklyStreak: (completions: HabitCompletion[], selectedDays: string[], today: Date) => {
    if (!selectedDays || selectedDays.length === 0) return 0;
    
    const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    const selectedDayNumbers = selectedDays.map(day => dayMap[day as keyof typeof dayMap]);
    
    let streak = 0;
    let currentWeekStart = new Date(today);
    
    // Set to Sunday of current week (week starts on Sunday)
    const dayOfWeek = currentWeekStart.getDay();
    const diff = -dayOfWeek; // Move back to Sunday (0 days if already Sunday)
    currentWeekStart.setDate(currentWeekStart.getDate() + diff);
    
    // Check weeks backwards starting from current week
    while (true) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6); // Saturday
      
      const isCurrentWeek = today >= currentWeekStart && today <= weekEnd;
      
      // Count completions for all selected days in this week
      let completedCount = 0;
      for (const dayNum of selectedDayNumbers) {
        const checkDate = new Date(currentWeekStart);
        // Since week starts on Sunday (day 0), no adjustment needed
        // Sunday=0, Monday=1, Tuesday=2, etc.
        checkDate.setDate(checkDate.getDate() + dayNum);
        
        const dateStr = formatDateToString(checkDate);
        const completion = completions.find(c => c.date === dateStr && c.completed);
        if (completion) {
          completedCount++;
        }
      }
      
      // Required: ALL selected days must be completed for the week
      const requiredCount = selectedDays.length;
      
      if (completedCount === requiredCount) {
        // Week is complete - streak +1
        streak++;
      } else if (isCurrentWeek) {
        // Current week not complete yet - don't break streak (week not over)
        // Don't increment, but continue checking previous weeks
        // The current incomplete week doesn't break the streak
      } else {
        // Past week that wasn't completed - break streak
        break;
      }
      
      // Move to previous week
      currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    }
    
    return streak;
  },

  // Custom frequency streak calculation (consecutive periods meeting target)
  calculateCustomStreak: (completions: HabitCompletion[], customFreq: {times: number; period: 'week' | 'month'} | undefined, today: Date) => {
    if (!customFreq) return 0;
    
    let streak = 0;
    const { times, period } = customFreq;
    
    let currentPeriodStart = new Date(today);
    currentPeriodStart.setHours(0, 0, 0, 0); // Normalize to start of day
    
    if (period === 'week') {
      // Set to Sunday of current week (Sunday = day 0)
      const dayOfWeek = currentPeriodStart.getDay();
      const diff = -dayOfWeek; // Move back to Sunday (0 days if already Sunday)
      currentPeriodStart.setDate(currentPeriodStart.getDate() + diff);
    } else {
      // Set to first day of current month
      currentPeriodStart.setDate(1);
    }
    
    // Check periods backwards starting from current period
    while (true) {
      const periodEnd = new Date(currentPeriodStart);
      
      if (period === 'week') {
        periodEnd.setDate(periodEnd.getDate() + 6);
        periodEnd.setHours(23, 59, 59, 999); // End of Saturday
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        periodEnd.setDate(0); // Last day of month
        periodEnd.setHours(23, 59, 59, 999); // End of last day
      }
      
      const todayNormalized = new Date(today);
      todayNormalized.setHours(0, 0, 0, 0);
      const isCurrentPeriod = todayNormalized >= currentPeriodStart && todayNormalized <= periodEnd;
      
      // Count completions in this period
      let periodCompletions = 0;
      for (const completion of completions) {
        if (!completion.completed) continue;
        
        const compDate = new Date(completion.date + 'T00:00:00'); // Ensure proper date parsing
        compDate.setHours(0, 0, 0, 0);
        
        if (compDate >= currentPeriodStart && compDate <= periodEnd) {
          periodCompletions++;
        }
      }
      
      // Debug logging (can be removed in production)
      console.log(`Custom Streak Debug - Period: ${formatDateToString(currentPeriodStart)} to ${formatDateToString(periodEnd)}`);
      console.log(`  - Is Current Period: ${isCurrentPeriod}`);  
      console.log(`  - Completions Found: ${periodCompletions}/${times}`);
      console.log(`  - Current Streak: ${streak}`);
      
      if (periodCompletions >= times) {
        // Period target met - streak +1
        streak++;
      } else if (isCurrentPeriod) {
        // Current period not complete yet - don't break streak (period not over)
        // Don't increment, but continue checking previous periods
        // The current incomplete period doesn't break the streak
      } else {
        // Past period that didn't meet target - break streak
        break;
      }
      
      // Move to previous period
      if (period === 'week') {
        currentPeriodStart.setDate(currentPeriodStart.getDate() - 7);
      } else {
        currentPeriodStart.setMonth(currentPeriodStart.getMonth() - 1);
      }
    }
    
    return streak;
  },

  // Day-specific completion toggle (simplified for simple habits only)
  toggleDayCompletion: (habitId: string, date: string) => {
    const { completions, habits } = get();
    const habit = habits.find(h => h.id === habitId);
    const existingCompletion = completions.find(
      c => c.habitId === habitId && c.date === date
    );

    if (existingCompletion) {
      // Toggle existing completion
      set((state) => ({
        completions: state.completions.map(c =>
          c.id === existingCompletion.id
            ? { ...c, completed: !c.completed, completedAt: !c.completed ? new Date().toISOString() : undefined }
            : c
        )
      }));
    } else {
      // Create new completion
      const newCompletion: HabitCompletion = {
        id: generateId(),
        habitId,
        date,
        completed: true,
        completedAt: new Date().toISOString()
      };
      
      set((state) => ({
        completions: [...state.completions, newCompletion]
      }));
    }
    
    // Update goal progress if habit is linked to a goal
    if (habit?.goalId) {
      import('./goalStore').then(({ useGoalStore }) => {
        useGoalStore.getState().updateGoalProgress(habit.goalId!)
      }).catch(console.warn)
    }
  },

  // Check if a specific day is required for a habit based on its frequency
  isRequiredDay: (habitId: string, date: string) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return false;

    const checkDate = new Date(date);
    const dayOfWeek = checkDate.getDay();

    switch (habit.frequency) {
      case 'daily':
        return true;
      case 'weekly':
        if (!habit.selectedDays) return false;
        const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
        const selectedDayNumbers = habit.selectedDays.map(day => dayMap[day as keyof typeof dayMap]);
        return selectedDayNumbers.includes(dayOfWeek);
      case 'custom':
        // For custom habits, all days are available but not necessarily required
        return true;
      default:
        return false;
    }
  },

  // Calculate completion rate over a specified number of days
  getCompletionRate: (habitId: string, days: number = 30) => {
    const { habits, completions } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;

    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const habitCompletions = completions.filter(c => c.habitId === habitId);
    
    let requiredDays = 0;
    let completedDays = 0;

    // Check each day in the period
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDateToString(d);
      
      if (get().isRequiredDay(habitId, dateStr)) {
        requiredDays++;
        const completion = habitCompletions.find(c => c.date === dateStr);
        
        // Check completion for simple habits
        const isCompleted = completion ? completion.completed : false;
        
        if (isCompleted) {
          completedDays++;
        }
      }
    }

    return requiredDays > 0 ? Math.round((completedDays / requiredDays) * 100) : 0;
  },

  // Get last two weeks of progress data for grid view
  getLastTwoWeeksProgress: (habitId: string) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return [];

    const today = new Date();
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);

    const progress: import('../types/habit').DayCompletion[] = [];
    const habitCompletions = get().getHabitCompletions(habitId);

    // Generate 14 days of progress data
    for (let i = 0; i < 14; i++) {
      const checkDate = new Date(twoWeeksAgo);
      checkDate.setDate(checkDate.getDate() + i);
      const dateStr = formatDateToString(checkDate);

      const completion = habitCompletions.find(c => c.date === dateStr);
      const isToday = dateStr === formatDateToString(today);
      const isRequired = get().isRequiredDay(habitId, dateStr);
      
      // Check if day is completed for simple habits
      const isCompleted = completion ? completion.completed : false;

      progress.push({
        date: dateStr,
        completed: isCompleted,
        isToday,
        isRequired,
        value: completion?.value
      });
    }

    return progress;
  },
  
  isHabitCompletedToday: (habitId: string) => {
    const { completions, habits } = get();
    const habit = habits.find(h => h.id === habitId);
    const todaysCompletion = completions.find(
      c => c.habitId === habitId && c.date === today
    );
    
    if (!todaysCompletion) return false;
    
    // For simple habits, check completed flag
    return todaysCompletion.completed;
  },

  // Goal linking functions
  linkHabitToGoal: (habitId: string, goalId: string) => {
    set((state) => ({
      habits: state.habits.map(habit =>
        habit.id === habitId
          ? { ...habit, goalId, updatedAt: new Date().toISOString() }
          : habit
      )
    }));
    
    // Update goal progress after linking
    import('./goalStore').then(({ useGoalStore }) => {
      useGoalStore.getState().updateGoalProgress(goalId)
    }).catch(console.warn)
  },

  unlinkHabitFromGoal: (habitId: string, goalId: string) => {
    set((state) => ({
      habits: state.habits.map(habit =>
        habit.id === habitId && habit.goalId === goalId
          ? { ...habit, goalId: undefined, updatedAt: new Date().toISOString() }
          : habit
      )
    }));
    
    // Update goal progress after unlinking
    import('./goalStore').then(({ useGoalStore }) => {
      useGoalStore.getState().updateGoalProgress(goalId)
    }).catch(console.warn)
  },

  getHabitsByGoal: (goalId: string) => {
    const { habits } = get();
    return habits.filter(habit => habit.goalId === goalId);
  },

  regenerateAllTimeBlocks: () => {
    regenerateTimeBlocksForAllHabits();
  },

  // Frequency change handling
  changeHabitFrequency: (habitId: string, newFrequency: Habit['frequency'], newSelectedDays?: string[], newCustomFrequency?: Habit['customFrequency'], reason?: string) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    // Get current streak before change
    const currentStreak = get().getHabitStreak(habitId);
    const currentStreakType = habit.frequency === 'weekly' ? 'weeks' : 
                            habit.frequency === 'custom' ? 'periods' : 'days';
    
    // Create frequency change record
    const frequencyChange: FrequencyChange = {
      id: generateId(),
      changeDate: new Date().toISOString(),
      previousFrequency: {
        type: habit.frequency,
        selectedDays: habit.selectedDays,
        customFrequency: habit.customFrequency
      },
      newFrequency: {
        type: newFrequency,
        selectedDays: newSelectedDays,
        customFrequency: newCustomFrequency
      },
      streakAtChange: {
        value: currentStreak,
        type: currentStreakType,
        label: `${currentStreak} ${currentStreakType}`
      },
      reason
    };

    // Update habit with new frequency and add to history
    set((state) => ({
      habits: state.habits.map(h =>
        h.id === habitId
          ? {
              ...h,
              frequency: newFrequency,
              selectedDays: newSelectedDays,
              customFrequency: newCustomFrequency,
              frequencyHistory: [...(h.frequencyHistory || []), frequencyChange],
              updatedAt: new Date().toISOString()
            }
          : h
      )
    }));

    // Update calendar integration if needed
    const updatedHabit = get().habits.find(h => h.id === habitId);
    if (updatedHabit && updatedHabit.calendarIntegration) {
      const calendarStore = useCalendarStore.getState();
      
      // Remove old time blocks
      const oldTimeBlocks = calendarStore.timeBlocks.filter(block => 
        block.linkedItemType === 'habit' && block.linkedItemId === habitId
      );
      oldTimeBlocks.forEach(block => {
        calendarStore.deleteTimeBlock(block.id);
      });
      
      // Add new time blocks
      const timeBlocks = generateRecurringTimeBlocks(updatedHabit);
      timeBlocks.forEach(timeBlock => {
        calendarStore.addTimeBlock(timeBlock);
      });
    }
  },

  getHabitFrequencyHistory: (habitId: string) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === habitId);
    return habit?.frequencyHistory || [];
  },

  getTotalStreakContext: (habitId: string) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return { current: 0, historical: 0, label: '0 days' };

    const currentStreak = get().getHabitStreak(habitId);
    const frequencyHistory = habit.frequencyHistory || [];
    
    // Calculate total historical streak from all frequency changes
    const historicalStreak = frequencyHistory.reduce((total, change) => {
      return total + change.streakAtChange.value;
    }, 0);

    // Generate appropriate label
    const currentType = habit.frequency === 'weekly' ? 'weeks' : 
                       habit.frequency === 'custom' ? 'periods' : 'days';
    
    if (historicalStreak > 0) {
      return {
        current: currentStreak,
        historical: historicalStreak,
        label: `${currentStreak} ${currentType} (${historicalStreak} total)`
      };
    }

    return {
      current: currentStreak,
      historical: 0,
      label: `${currentStreak} ${currentType}`
    };
  },

  // Detail modal methods
  getTotalCompletions: (habitId: string) => {
    const { completions } = get();
    return completions.filter(c => c.habitId === habitId && c.completed).length;
  },

  getBestStreak: (habitId: string) => {
    const { habits, completions } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return 0;

    // Use frequency-specific streak calculation for best streak too
    // This ensures consistency with current streak calculation
    if (habit.frequency === 'daily') {
      return get().calculateBestDailyStreak(habitId);
    } else if (habit.frequency === 'weekly') {
      return get().calculateBestWeeklyStreak(habitId);
    } else {
      return get().calculateBestCustomStreak(habitId);
    }
  },

  // Helper method to calculate best daily streak
  calculateBestDailyStreak: (habitId: string) => {
    const { completions } = get();
    const habitCompletions = completions
      .filter(c => c.habitId === habitId && c.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (habitCompletions.length === 0) return 0;

    let bestStreak = 0;
    let currentStreak = 0;
    let previousDate: Date | null = null;

    for (const completion of habitCompletions) {
      const completionDate = new Date(completion.date);
      
      if (previousDate) {
        const daysDiff = Math.floor((completionDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          currentStreak++;
        } else {
          bestStreak = Math.max(bestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      
      previousDate = completionDate;
    }
    
    return Math.max(bestStreak, currentStreak);
  },

  // Helper method to calculate best weekly streak 
  calculateBestWeeklyStreak: (habitId: string) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit || !habit.selectedDays) return 0;

    // For weekly habits, calculate best streak by finding longest sequence
    // of consecutive weeks where all required days were completed
    const today = new Date();
    let bestStreak = 0;
    
    // Go back through all historical data to find best streak
    for (let weeksBack = 0; weeksBack < 52; weeksBack++) { // Check up to 1 year back
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - (weeksBack * 7));
      const weekStreak = get().calculateWeeklyStreak(get().getHabitCompletions(habitId), habit.selectedDays, checkDate);
      bestStreak = Math.max(bestStreak, weekStreak);
    }
    
    return bestStreak;
  },

  // Helper method to calculate best custom streak
  calculateBestCustomStreak: (habitId: string) => {
    const { habits } = get();
    const habit = habits.find(h => h.id === habitId);
    if (!habit || !habit.customFrequency) return 0;

    // For custom habits, calculate best streak by finding longest sequence
    const today = new Date();
    let bestStreak = 0;
    
    // Check historical periods to find best streak
    const periodsBack = habit.customFrequency.period === 'week' ? 52 : 12; // 1 year of weeks or months
    for (let periodsBack = 0; periodsBack < 52; periodsBack++) {
      const checkDate = new Date(today);
      if (habit.customFrequency.period === 'week') {
        checkDate.setDate(checkDate.getDate() - (periodsBack * 7));
      } else {
        checkDate.setMonth(checkDate.getMonth() - periodsBack);
      }
      const periodStreak = get().calculateCustomStreak(get().getHabitCompletions(habitId), habit.customFrequency, checkDate);
      bestStreak = Math.max(bestStreak, periodStreak);
    }
    
    return bestStreak;
  },

  getMonthlyProgress: (habitId: string) => {
    const { completions } = get();
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return completions
      .filter(c => c.habitId === habitId && new Date(c.date) >= firstDayOfMonth)
      .map(c => ({ date: c.date, completed: c.completed }));
  },

  isHabitCompletedOnDate: (habitId: string, date: string) => {
    const { completions, habits } = get();
    const completion = completions.find(c => c.habitId === habitId && c.date === date);
    
    if (!completion) return false;
    
    // For simple habits, check completed flag
    return completion.completed;
  }
    }),
    {
      name: 'habit-store',
      version: 1
    }
  )
);