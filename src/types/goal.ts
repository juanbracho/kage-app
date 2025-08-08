export interface Goal {
  id: string;
  name: string;
  description: string;
  category: GoalCategory;
  icon: string;
  color: string;
  targetDate?: string; // YYYY-MM-DD format
  isCompleted: boolean;
  priority: GoalPriority;
  motivation?: string; // Why this goal matters
  createdAt: string;
  updatedAt: string;
  
  // Progress tracking
  progress: GoalProgress;
  
  // NEW: Milestones system
  milestones: GoalMilestone[];
  
  // NEW: Progress calculation settings
  progressSettings: GoalProgressSettings;
  
  // Linked items
  linkedTaskIds: string[];
  linkedHabitIds: string[];
  linkedJournalIds: string[];
  
  // Metadata
  tags: string[];
  isArchived: boolean;
  completedAt?: string;
}

export interface GoalProgress {
  percentage: number; // 0-100
  tasksCompleted: number;
  tasksTotal: number;
  habitsActive: number;
  habitCompletionRate: number; // 0-100
  currentStreak: number;
  longestStreak: number;
  lastUpdated: string;
}

export interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  category: GoalCategory;
  icon: string;
  color: string;
  estimatedDuration: string; // e.g., "3-6 months"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popularity: 'low' | 'medium' | 'high';
  
  // Pre-defined tasks and habits
  templateTasks: TemplateTask[];
  templateHabits: TemplateHabit[];
  
  // Template metadata
  tags: string[];
  isPopular: boolean;
  userCount?: number;
  
  // Enhanced validation for real-world effectiveness
  realWorldValidation?: {
    expertValidated: boolean;
    basedOnProgram?: string;
    prerequisites: string[];
    successRate: string;
    averageCompletionTime: string;
    difficultyJustification: string;
  };
}

export interface TemplateTask {
  id: string;
  name: string;
  description?: string;
  estimatedTime?: number; // minutes
  priority: GoalPriority;
  dependsOn?: string[]; // Other template task IDs
  category?: string;
  
  // Enhanced fields for structured templates
  weekNumber?: number; // For training programs
  details?: string; // Additional implementation details
}

export interface TemplateHabit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  measurementType: 'simple' | 'count' | 'time' | 'custom';
  frequency: 'daily' | 'weekly' | 'custom';
  targetAmount?: number;
  targetUnit?: string;
  category?: string;
  priority?: GoalPriority;
  
  // Enhanced frequency configuration
  customFrequency?: {
    times: number;
    period: 'day' | 'week' | 'month';
  };
  selectedDays?: string[]; // For weekly habits
}

// JSON Template System Interfaces
export interface TemplateCollection {
  templates: GoalTemplate[];
  metadata: {
    version: string;
    lastUpdated: string;
    totalTemplates: number;
    categories: string[];
    expertValidation?: Record<string, any>;
  };
}

export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateCreationResult {
  success: boolean;
  goalId?: string;
  taskIds: string[];
  habitIds: string[];
  error?: string;
}

export interface GoalFormData {
  name: string;
  description: string;
  category: GoalCategory;
  icon: string;
  color: string;
  targetDate?: string;
  priority: GoalPriority;
  motivation?: string;
  tags: string[];
  
  // For template-based creation
  templateId?: string;
  customizeTasks?: boolean;
  customizeHabits?: boolean;
}

export interface GoalStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  averageProgress: number;
  totalTasksLinked: number;
  totalHabitsLinked: number;
  overallCompletionRate: number;
  
  // By category
  categoryBreakdown: Record<GoalCategory, {
    count: number;
    averageProgress: number;
    completionRate: number;
  }>;
  
  // Streaks and momentum
  currentActiveStreak: number; // Days with goal activity
  longestActiveStreak: number;
  goalsCompletedThisMonth: number;
  goalsCompletedThisYear: number;
}

export interface GoalFilter {
  category?: GoalCategory | 'all';
  status?: 'active' | 'completed' | 'overdue' | 'all';
  priority?: GoalPriority | 'all';
  dateRange?: 'this-week' | 'this-month' | 'this-year' | 'custom';
  hasLinkedTasks?: boolean;
  hasLinkedHabits?: boolean;
}

export type GoalCategory = 
  | 'health' 
  | 'career' 
  | 'learning' 
  | 'personal' 
  | 'finance' 
  | 'creativity';

export type GoalPriority = 'low' | 'medium' | 'high' | 'critical';

export type GoalViewMode = 'list' | 'grid' | 'timeline';

export interface GoalCategoryConfig {
  id: GoalCategory;
  name: string;
  icon: string;
  description: string;
  color: string;
  gradientStart: string;
  gradientEnd: string;
  templateCount: number;
}

// Goal creation modal types
export interface GoalModalState {
  isOpen: boolean;
  mode: 'template' | 'custom';
  selectedCategory?: GoalCategory;
  selectedTemplate?: GoalTemplate;
  currentStep: number;
  formData: Partial<GoalFormData>;
}

// Goal detail page types
export interface GoalDetailData {
  goal: Goal;
  linkedTasks: any[]; // Will use actual Task type when integrating
  linkedHabits: any[]; // Will use actual Habit type when integrating
  linkedJournalEntries: any[]; // Will use actual JournalEntry type when integrating
  progressHistory: GoalProgressSnapshot[];
  milestones: GoalMilestone[];
}

export interface GoalProgressSnapshot {
  date: string;
  percentage: number;
  tasksCompleted: number;
  habitsActive: number;
  notes?: string;
}

export interface GoalMilestone {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  order: number;
  dueDate?: string;
}

// NEW: Progress calculation settings
export interface GoalProgressSettings {
  calculationMode: 'tasks' | 'habits' | 'milestones' | 'mixed';
  mixedWeights?: {
    tasks: number;      // 0-100, default: 40
    habits: number;     // 0-100, default: 30  
    milestones: number; // 0-100, default: 30
  };
  timeframe?: '7days' | '30days' | '90days'; // For habit calculations, default: '30days'
}

// Store interface
export interface GoalStore {
  goals: Goal[];
  templates: GoalTemplate[];
  currentFilter: GoalFilter;
  viewMode: GoalViewMode;
  modalState: GoalModalState;
  selectedGoal?: Goal;
  
  // Actions
  addGoal: (goalData: GoalFormData) => string;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  toggleGoalCompletion: (id: string) => void;
  archiveGoal: (id: string) => void;
  unarchiveGoal: (id: string) => void;
  
  // Progress and linking
  updateGoalProgress: (id: string) => Promise<void>;
  linkTaskToGoal: (goalId: string, taskId: string) => void;
  unlinkTaskFromGoal: (goalId: string, taskId: string) => void;
  linkHabitToGoal: (goalId: string, habitId: string) => void;
  unlinkHabitFromGoal: (goalId: string, habitId: string) => void;
  
  // NEW: Milestone management
  addMilestone: (goalId: string, description: string, dueDate?: string) => void;
  updateMilestone: (goalId: string, milestoneId: string, updates: Partial<GoalMilestone>) => void;
  deleteMilestone: (goalId: string, milestoneId: string) => void;
  toggleMilestoneCompletion: (goalId: string, milestoneId: string) => void;
  reorderMilestones: (goalId: string, milestoneIds: string[]) => void;
  
  // NEW: Progress settings management
  updateProgressSettings: (goalId: string, settings: Partial<GoalProgressSettings>) => void;
  
  // Templates - Enhanced with JSON system
  createGoalFromTemplate: (templateId: string, customData?: Partial<GoalFormData>) => Promise<TemplateCreationResult>;
  getTemplatesByCategory: (category: GoalCategory) => Promise<GoalTemplate[]>;
  getAllTemplates: () => Promise<GoalTemplate[]>;
  getTemplateById: (templateId: string) => Promise<GoalTemplate | undefined>;
  refreshTemplates: () => Promise<void>;
  
  // Filtering and views
  setFilter: (filter: Partial<GoalFilter>) => void;
  setViewMode: (mode: GoalViewMode) => void;
  getFilteredGoals: () => Goal[];
  getActiveGoals: () => Goal[];
  getArchivedGoals: () => Goal[];
  
  // Modal management
  openModal: (mode?: 'template' | 'custom') => void;
  closeModal: () => void;
  setModalStep: (step: number) => void;
  updateModalFormData: (data: Partial<GoalFormData>) => void;
  
  // Selection and navigation
  selectGoal: (goal: Goal) => void;
  clearSelection: () => void;
  
  // Statistics
  getGoalStats: () => GoalStats;
  getGoalDetailData: (id: string) => GoalDetailData | undefined;
  getGoalProgress: (id: string) => GoalProgress | undefined;
  
  // Computed
  getActiveGoals: () => Goal[];
  getCompletedGoals: () => Goal[];
  getOverdueGoals: () => Goal[];
  getGoalsByCategory: (category: GoalCategory) => Goal[];
  
  // Utility
  recalculateAllGoalProgress: () => Promise<void>;

  // NEW: Calendar and journal integration
  createMilestoneCalendarEvent: (goalId: string, milestone: GoalMilestone) => Promise<void>;
  triggerMilestoneJournalPrompt: (goalId: string, milestoneId: string, goal: Goal, milestone: GoalMilestone) => Promise<void>;
}

// Constants for UI
export const GOAL_CATEGORIES: GoalCategoryConfig[] = [
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: '🏃',
    description: 'Physical wellness, exercise, nutrition',
    color: '#10B981',
    gradientStart: '#10B981',
    gradientEnd: '#22C55E',
    templateCount: 4
  },
  {
    id: 'career',
    name: 'Career & Business',
    icon: '🚀',
    description: 'Professional growth, projects, skills',
    color: '#3B82F6',
    gradientStart: '#3B82F6',
    gradientEnd: '#60A5FA',
    templateCount: 4
  },
  {
    id: 'learning',
    name: 'Learning & Skills',
    icon: '📚',
    description: 'Education, new skills, knowledge',
    color: '#F59E0B',
    gradientStart: '#F59E0B',
    gradientEnd: '#FBBF24',
    templateCount: 4
  },
  {
    id: 'personal',
    name: 'Personal Growth',
    icon: '🧘',
    description: 'Self-improvement, mindfulness, habits',
    color: '#8B5CF6',
    gradientStart: '#8B5CF6',
    gradientEnd: '#A855F7',
    templateCount: 4
  },
  {
    id: 'finance',
    name: 'Finance & Career',
    icon: '💰',
    description: 'Savings, investments, budgeting',
    color: '#10B981',
    gradientStart: '#10B981',
    gradientEnd: '#059669',
    templateCount: 4
  },
  {
    id: 'creativity',
    name: 'Creative & Hobbies',
    icon: '🎨',
    description: 'Art, music, writing, crafts',
    color: '#EC4899',
    gradientStart: '#EC4899',
    gradientEnd: '#F472B6',
    templateCount: 4
  }
];

export const GOAL_ICONS = [
  '🎯', '🚀', '💪', '📚', '💰', '🏃', '🧘', '🎨',
  '🌟', '🔥', '⚡', '💡', '🎪', '🎭', '🏆', '📈'
];

export const GOAL_COLORS = [
  '#FF7101', // Orange (accent color default)
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#14B8A6'  // Teal
];