export interface TimeBlock {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationMinutes: number;
  blockType: 'focus' | 'meeting' | 'learning' | 'break' | 'creative' | 'admin';
  icon: string;
  color: string;
  linkedItemType?: 'goal' | 'task' | 'habit';
  linkedItemId?: string;
  reminderMinutes?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  completionNotes?: string;
  createdAt: string;
  updatedAt: string;
  // Recurring event fields
  isRecurring?: boolean;
  recurrenceType?: 'weekly' | 'monthly';
  recurrenceInterval?: number; // every X weeks/months (default: 1)
  recurrenceEndDate?: string; // YYYY-MM-DD when to stop generating
  originalEventId?: string; // ID of the original event for recurring instances
  recurrenceExceptions?: string[]; // dates to skip (YYYY-MM-DD format)
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'task' | 'habit' | 'timeblock';
  icon: string;
  color: string;
  completed?: boolean;
  linkedId?: string; // ID of the linked task/habit/timeblock
}

export interface TimeBlockFormData {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  blockType: 'focus' | 'meeting' | 'learning' | 'break' | 'creative' | 'admin';
  icon: string;
  color: string;
  linkedItemType?: 'goal' | 'task' | 'habit';
  linkedItemId?: string;
  reminderMinutes?: number;
  // Recurring event fields
  isRecurring?: boolean;
  recurrenceType?: 'weekly' | 'monthly';
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
}

export interface DayViewData {
  date: string;
  events: CalendarEvent[];
  stats: {
    totalTasks: number;
    totalHabits: number;
    completedItems: number;
  };
}


export type CalendarView = 'day';