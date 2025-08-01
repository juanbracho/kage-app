import { create } from 'zustand';
import { DashboardStats, DashboardCard } from '../types/dashboard';
import { useTaskStore } from './taskStore';
import { useHabitStore } from './habitStore';
import { useJournalStore } from './journalStore';
import { useGoalStore } from './goalStore';

interface DashboardStore {
  getDashboardStats: () => DashboardStats;
  getDashboardCards: (onNavigate: (tab: string) => void) => DashboardCard[];
  hasAnyData: () => boolean;
  getGreeting: () => string;
  getCurrentDate: () => string;
  // New functions for Today's Focus
  getUrgentTasks: () => any[];
  getTodayTasks: () => any[];
  getTodayHabits: () => Array<{ habit: any; isCompleted: boolean }>;
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning!';
  if (hour < 17) return 'Good afternoon!';
  return 'Good evening!';
};

const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const isThisWeek = (date: Date | string): boolean => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return dateObj >= weekStart && dateObj <= weekEnd;
};

const isThisMonth = (date: Date | string): boolean => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const today = new Date();
  return dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();
};

export const useDashboardStore = create<DashboardStore>(() => ({
  getDashboardStats: (): DashboardStats => {
    const taskStore = useTaskStore.getState();
    const habitStore = useHabitStore.getState();
    const journalStore = useJournalStore.getState();
    const goalStore = useGoalStore.getState();
    
    const today = getTodayString();
    
    // Tasks stats
    const todayTasks = taskStore.tasks.filter(task => {
      if (!task.dueDate) return task.type === 'standard';
      const dueDateStr = task.dueDate instanceof Date ? task.dueDate.toISOString().split('T')[0] : String(task.dueDate).split('T')[0];
      return dueDateStr === today;
    });
    const completedTodayTasks = todayTasks.filter(task => task.status === 'completed');
    const tasksCompletionRate = todayTasks.length > 0 ? (completedTodayTasks.length / todayTasks.length) * 100 : 0;

    // Habits stats
    const todayHabits = habitStore.habits.filter(habit => {
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'weekly') {
        const dayOfWeek = new Date().getDay();
        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        return habit.selectedDays?.includes(dayNames[dayOfWeek]);
      }
      return false;
    });
    const completedTodayHabits = todayHabits.filter(habit => {
      const todayCompletion = habit.completions.find(c => c.date === today);
      return todayCompletion && todayCompletion.completed;
    });
    const habitsCompletionRate = todayHabits.length > 0 ? (completedTodayHabits.length / todayHabits.length) * 100 : 0;
    const bestStreak = habitStore.habits.reduce((maxStreak, habit) => {
      return Math.max(maxStreak, habit.streak || 0);
    }, 0);

    // Goals stats
    const activeGoals = goalStore.goals.filter(goal => !goal.isCompleted && !goal.isArchived);
    const totalGoals = goalStore.goals.length;
    const averageProgress = totalGoals > 0 
      ? Math.round(activeGoals.reduce((sum, goal) => sum + goal.progress.percentage, 0) / activeGoals.length) || 0
      : 0;

    // Journal stats
    const entriesThisWeek = journalStore.entries.filter(entry => 
      isThisWeek(entry.createdAt)
    ).length;
    const entriesThisMonth = journalStore.entries.filter(entry => 
      isThisMonth(entry.createdAt)
    ).length;
    const lastEntry = journalStore.entries.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    return {
      goals: {
        total: totalGoals,
        averageProgress,
        activeGoals: activeGoals.length
      },
      tasks: {
        total: taskStore.tasks.length,
        completedToday: completedTodayTasks.length,
        remaining: todayTasks.length - completedTodayTasks.length,
        completionRate: tasksCompletionRate
      },
      habits: {
        total: habitStore.habits.length,
        completedToday: completedTodayHabits.length,
        remaining: todayHabits.length - completedTodayHabits.length,
        completionRate: habitsCompletionRate,
        bestStreak
      },
      journal: {
        totalEntries: journalStore.entries.length,
        entriesThisWeek,
        entriesThisMonth,
        lastEntryDate: lastEntry ? (lastEntry.createdAt instanceof Date ? lastEntry.createdAt : new Date(lastEntry.createdAt)).toISOString().split('T')[0] : undefined
      }
    };
  },

  getDashboardCards: (onNavigate: (tab: string) => void): DashboardCard[] => {
    const store = useDashboardStore.getState();
    const stats = store.getDashboardStats();
    
    return [
      {
        id: 'goals',
        title: 'Goals',
        icon: '🎯',
        value: stats.goals.activeGoals.toString(),
        subtitle: 'active goals',
        progress: stats.goals.averageProgress,
        progressText: stats.goals.averageProgress > 0 ? `${stats.goals.averageProgress}% average progress` : 'No goals yet',
        colorClass: 'goals-card',
        onClick: () => onNavigate('goals')
      },
      {
        id: 'tasks',
        title: 'Tasks',
        icon: '✅',
        value: `${stats.tasks.completedToday}/${stats.tasks.completedToday + stats.tasks.remaining}`,
        subtitle: 'completed today',
        progress: stats.tasks.completionRate,
        progressText: stats.tasks.remaining > 0 ? `${stats.tasks.remaining} tasks remaining` : 'All tasks completed!',
        colorClass: 'tasks-card',
        onClick: () => onNavigate('tasks')
      },
      {
        id: 'habits',
        title: 'Habits',
        icon: '🔄',
        value: `${stats.habits.completedToday}/${stats.habits.completedToday + stats.habits.remaining}`,
        subtitle: 'completed today',
        progress: stats.habits.completionRate,
        progressText: stats.habits.bestStreak > 0 ? `🔥 ${stats.habits.bestStreak}-day streak` : 'Start your streak!',
        colorClass: 'habits-card',
        onClick: () => onNavigate('habits')
      }
    ];
  },

  hasAnyData: (): boolean => {
    const taskStore = useTaskStore.getState();
    const habitStore = useHabitStore.getState();
    const journalStore = useJournalStore.getState();
    const goalStore = useGoalStore.getState();
    
    return taskStore.tasks.length > 0 || 
           habitStore.habits.length > 0 || 
           journalStore.entries.length > 0 ||
           goalStore.goals.length > 0;
  },

  getGreeting: () => getTimeOfDay(),
  
  getCurrentDate: () => formatDate(new Date()),

  // New functions for Today's Focus
  getUrgentTasks: () => {
    const taskStore = useTaskStore.getState();
    const taskSections = taskStore.getTasksBySection();
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get truly urgent tasks: overdue + urgent priority + approaching deadlines
    const urgentTasks = [
      ...taskSections.overdue,
      // Get only urgent priority tasks from all sections
      ...taskSections.today.filter(task => task.priority === 'urgent'),
      ...taskSections.upcoming.filter(task => task.priority === 'urgent'),
      ...taskSections.noDueDate.filter(task => task.priority === 'urgent'),
      // Add deadline tasks approaching within 24 hours
      ...taskSections.today.filter(task => 
        task.type === 'deadline' && task.dueDate && 
        new Date(task.dueDate) <= tomorrow && task.priority !== 'urgent'
      ),
      ...taskSections.upcoming.filter(task => 
        task.type === 'deadline' && task.dueDate && 
        new Date(task.dueDate) <= tomorrow && task.priority !== 'urgent'
      )
    ];
    
    // Remove duplicates and filter out completed tasks
    const uniqueUrgentTasks = urgentTasks.filter((task, index, arr) => 
      arr.findIndex(t => t.id === task.id) === index
    );
    
    return uniqueUrgentTasks.filter(task => task.status !== 'completed');
  },

  getTodayTasks: () => {
    const taskStore = useTaskStore.getState();
    const taskSections = taskStore.getTasksBySection();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get urgent task IDs to exclude from today's tasks (prevent duplicates)
    const urgentTasks = useDashboardStore.getState().getUrgentTasks();
    const urgentTaskIds = new Set(urgentTasks.map(task => task.id));
    
    // Get ALL today's tasks, excluding those already in urgent section
    let todayTasks = taskSections.today.filter(task =>
      !urgentTaskIds.has(task.id)
    );
    
    // If we have less than 5 tasks, add tasks without due dates and upcoming tasks
    if (todayTasks.length < 5) {
      const allTasks = taskStore.tasks.filter(task => 
        task.status !== 'completed' && 
        !urgentTaskIds.has(task.id) // Exclude urgent tasks from all sections
      );
      
      // Get tasks without due dates
      const noDueDateTasks = allTasks.filter(task => !task.dueDate);
      
      // Get upcoming tasks (future dates), sorted by closest date first
      const upcomingTasks = allTasks
        .filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          return dueDate > today;
        })
        .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
      
      // Combine: today's tasks first, then no due date tasks, then upcoming tasks
      const combinedTasks = [
        ...todayTasks,
        ...noDueDateTasks,
        ...upcomingTasks
      ];
      
      // Remove duplicates and limit to 5
      const uniqueTasks = combinedTasks.filter((task, index, arr) => 
        arr.findIndex(t => t.id === task.id) === index
      );
      
      todayTasks = uniqueTasks.slice(0, 5);
    }
    
    return todayTasks.filter(task => task.status !== 'completed');
  },

  getTodayHabits: () => {
    const habitStore = useHabitStore.getState();
    const dayOfWeek = new Date().getDay();
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const todayName = dayNames[dayOfWeek];
    
    // Filter habits that should be done today based on frequency
    const todayHabits = habitStore.habits.filter(habit => {
      if (habit.frequency === 'daily') return true;
      if (habit.frequency === 'weekly' && habit.selectedDays) {
        return habit.selectedDays.includes(todayName);
      }
      if (habit.frequency === 'custom') {
        // For custom habits, we'll show them all for now
        // In a real app, you'd implement proper custom frequency logic
        return true;
      }
      return false;
    });

    // Map to include completion status
    return todayHabits.map(habit => ({
      habit,
      isCompleted: habitStore.isHabitCompletedToday(habit.id)
    }));
  }
}));