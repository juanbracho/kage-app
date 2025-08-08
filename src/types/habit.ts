import { GoalCategory } from './goal';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category?: GoalCategory;
  measurementType: 'simple' | 'count' | 'time' | 'custom';
  targetAmount?: number;
  targetUnit?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  selectedDays?: string[];
  customFrequency?: {
    times: number;
    period: 'week' | 'month';
  };
  goalId?: string;
  useGoalColor?: boolean; // Inherit color from linked goal (default: true when goalId exists)
  customColor?: string;   // Override color when useGoalColor is false
  startDate?: string;
  scheduledTime?: string;
  reminderMinutes?: number;
  calendarIntegration?: boolean;
  createdAt: string;
  updatedAt: string;
  streak: number;
  completions: HabitCompletion[];
  // Enhanced streak tracking
  currentStreak?: {
    value: number;
    type: 'days' | 'weeks' | 'periods';
    label: string;
  };
  streakHistory?: StreakPeriod[];
  completionRate?: number;
  // Frequency change tracking
  frequencyHistory?: FrequencyChange[];
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  completedAt?: string;
  value?: number;
  notes?: string;
}

export interface HabitFormData {
  name: string;
  description?: string;
  icon: string;
  color: string;
  category?: GoalCategory;
  measurementType: 'simple' | 'count' | 'time' | 'custom';
  targetAmount?: number;
  targetUnit?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  selectedDays?: string[];
  customFrequency?: {
    times: number;
    period: 'week' | 'month';
  };
  goalId?: string;
  useGoalColor?: boolean; // Inherit color from linked goal (default: true when goalId exists)
  customColor?: string;   // Override color when useGoalColor is false
  startDate?: string;
  scheduledTime?: string;
  reminderMinutes?: number;
  calendarIntegration?: boolean;
}

// Enhanced streak tracking interfaces
export interface StreakPeriod {
  value: number;
  type: 'days' | 'weeks' | 'periods';
  startDate: string;
  endDate: string;
  frequency: 'daily' | 'weekly' | 'custom';
  label: string;
}

export interface DayCompletion {
  date: string;
  completed: boolean;
  isToday: boolean;
  isRequired: boolean; // Based on frequency settings
  value?: number;
}

export interface HabitProgress {
  lastTwoWeeks: DayCompletion[];
  currentWeek: DayCompletion[];
  lastWeek: DayCompletion[];
  completionRate: number;
  streakData: {
    current: number;
    longest: number;
    label: string;
  };
}

// Frequency change tracking
export interface FrequencyChange {
  id: string;
  changeDate: string;
  previousFrequency: {
    type: 'daily' | 'weekly' | 'custom';
    selectedDays?: string[];
    customFrequency?: {
      times: number;
      period: 'week' | 'month';
    };
  };
  newFrequency: {
    type: 'daily' | 'weekly' | 'custom';
    selectedDays?: string[];
    customFrequency?: {
      times: number;
      period: 'week' | 'month';
    };
  };
  streakAtChange: {
    value: number;
    type: 'days' | 'weeks' | 'periods';
    label: string;
  };
  reason?: string;
}