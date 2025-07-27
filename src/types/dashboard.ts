export interface DashboardStats {
  goals: {
    total: number;
    averageProgress: number;
    activeGoals: number;
  };
  tasks: {
    total: number;
    completedToday: number;
    remaining: number;
    completionRate: number;
  };
  habits: {
    total: number;
    completedToday: number;
    remaining: number;
    completionRate: number;
    bestStreak: number;
  };
  journal: {
    totalEntries: number;
    entriesThisWeek: number;
    entriesThisMonth: number;
    lastEntryDate?: string;
  };
}

export interface QuickAction {
  id: string;
  type: 'goal' | 'task' | 'habit' | 'journal';
  icon: string;
  label: string;
  onClick: () => void;
}

export interface DashboardCard {
  id: string;
  title: string;
  icon: string;
  value: string;
  subtitle: string;
  progress: number;
  progressText: string;
  colorClass: string;
  onClick: () => void;
}