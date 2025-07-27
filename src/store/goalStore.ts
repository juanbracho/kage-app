import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Goal, 
  GoalStore, 
  GoalFormData, 
  GoalTemplate, 
  GoalFilter, 
  GoalViewMode, 
  GoalModalState,
  GoalCategory,
  GoalStats,
  GoalProgress,
  GoalDetailData,
  // TemplateTask,
  // TemplateHabit
} from '../types/goal';

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

// const formatDateToString = (date: Date): string => {
//   return date.toISOString().split('T')[0];
// };

// Sample goal templates
const sampleTemplates: GoalTemplate[] = [
  {
    id: 'health-fitness',
    name: 'Get Fit & Strong',
    description: 'Build a consistent workout routine and develop healthy eating habits for long-term fitness.',
    category: 'health',
    icon: '💪',
    color: 'linear-gradient(135deg, #10B981, #22C55E)',
    estimatedDuration: '3-6 months',
    difficulty: 'intermediate',
    popularity: 'high',
    isPopular: true,
    tags: ['fitness', 'health', 'strength'],
    templateTasks: [
      { id: '1', name: 'Join a gym or set up home workout space', priority: 'high' },
      { id: '2', name: 'Create workout schedule', priority: 'high' },
      { id: '3', name: 'Plan healthy meal prep routine', priority: 'medium' },
      { id: '4', name: 'Buy workout clothes and equipment', priority: 'medium' },
      { id: '5', name: 'Set fitness goals and track progress', priority: 'high' },
      { id: '6', name: 'Find workout buddy or trainer', priority: 'low' }
    ],
    templateHabits: [
      { id: '1', name: 'Morning workout', icon: '🏃', measurementType: 'simple', frequency: 'daily' },
      { id: '2', name: 'Drink 8 glasses of water', icon: '💧', measurementType: 'count', frequency: 'daily', targetAmount: 8 },
      { id: '3', name: 'Eat healthy breakfast', icon: '🥗', measurementType: 'simple', frequency: 'daily' },
      { id: '4', name: 'Track calories', icon: '📊', measurementType: 'simple', frequency: 'daily' }
    ]
  },
  {
    id: 'career-sideproject',
    name: 'Launch Side Project',
    description: 'Take your side project idea from concept to launch with structured milestones.',
    category: 'career',
    icon: '🚀',
    color: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    estimatedDuration: '3-4 months',
    difficulty: 'advanced',
    popularity: 'high',
    isPopular: true,
    tags: ['entrepreneurship', 'project', 'launch'],
    templateTasks: [
      { id: '1', name: 'Define project scope and requirements', priority: 'critical' },
      { id: '2', name: 'Create project timeline and milestones', priority: 'high' },
      { id: '3', name: 'Set up development environment', priority: 'high' },
      { id: '4', name: 'Design user interface and experience', priority: 'high' },
      { id: '5', name: 'Develop MVP features', priority: 'critical' },
      { id: '6', name: 'Test with beta users', priority: 'high' },
      { id: '7', name: 'Create landing page and marketing materials', priority: 'medium' },
      { id: '8', name: 'Launch and gather feedback', priority: 'critical' }
    ],
    templateHabits: [
      { id: '1', name: 'Daily coding/development', icon: '💻', measurementType: 'time', frequency: 'daily', targetAmount: 120 },
      { id: '2', name: 'Research competitors', icon: '🔍', measurementType: 'simple', frequency: 'weekly' }
    ]
  },
  {
    id: 'learning-spanish',
    name: 'Learn Spanish',
    description: 'Achieve conversational Spanish fluency through structured learning and practice.',
    category: 'learning',
    icon: '📚',
    color: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
    estimatedDuration: '6-12 months',
    difficulty: 'intermediate',
    popularity: 'medium',
    isPopular: false,
    tags: ['language', 'spanish', 'fluency'],
    templateTasks: [
      { id: '1', name: 'Choose learning platform or course', priority: 'high' },
      { id: '2', name: 'Set up study schedule', priority: 'high' },
      { id: '3', name: 'Find conversation partner', priority: 'medium' },
      { id: '4', name: 'Download language learning apps', priority: 'low' },
      { id: '5', name: 'Join Spanish learning community', priority: 'medium' },
      { id: '6', name: 'Plan trip to Spanish-speaking country', priority: 'low' }
    ],
    templateHabits: [
      { id: '1', name: 'Daily Spanish lessons', icon: '📖', measurementType: 'time', frequency: 'daily', targetAmount: 30 },
      { id: '2', name: 'Practice speaking', icon: '🗣️', measurementType: 'time', frequency: 'daily', targetAmount: 15 },
      { id: '3', name: 'Learn new vocabulary', icon: '📝', measurementType: 'count', frequency: 'daily', targetAmount: 10 }
    ]
  }
];

const initialModalState: GoalModalState = {
  isOpen: false,
  mode: 'template',
  currentStep: 0,
  formData: {}
};

const initialFilter: GoalFilter = {
  category: 'all',
  status: 'all',
  priority: 'all'
};

export const useGoalStore = create<GoalStore>()(
  persist(
    (set, get) => ({
      goals: [], // Start with empty goals to show empty state
      templates: sampleTemplates,
      currentFilter: initialFilter,
      viewMode: 'list',
      modalState: initialModalState,
      selectedGoal: undefined,

      // Basic CRUD operations
      addGoal: (goalData: GoalFormData): string => {
        const goalId = generateId();
        const newGoal: Goal = {
          id: goalId,
          name: goalData.name,
          description: goalData.description,
          category: goalData.category,
          icon: goalData.icon,
          color: goalData.color,
          targetDate: goalData.targetDate,
          isCompleted: false,
          priority: goalData.priority,
          motivation: goalData.motivation,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progress: {
            percentage: 0,
            tasksCompleted: 0,
            tasksTotal: 0,
            habitsActive: 0,
            habitCompletionRate: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastUpdated: new Date().toISOString()
          },
          linkedTaskIds: [],
          linkedHabitIds: [],
          linkedJournalIds: [],
          tags: goalData.tags || [],
          isArchived: false
        };

        set(state => ({
          goals: [...state.goals, newGoal],
          modalState: { ...initialModalState }
        }));
        
        // Recalculate progress for the new goal after creation
        setTimeout(() => {
          get().updateGoalProgress(goalId);
        }, 100);
        
        return goalId;
      },

      updateGoal: (id: string, updates: Partial<Goal>) => {
        set(state => ({
          goals: state.goals.map(goal =>
            goal.id === id
              ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
              : goal
          ),
          selectedGoal: state.selectedGoal?.id === id
            ? { ...state.selectedGoal, ...updates, updatedAt: new Date().toISOString() }
            : state.selectedGoal
        }));
      },

      deleteGoal: (id: string) => {
        set(state => ({
          goals: state.goals.filter(goal => goal.id !== id),
          selectedGoal: state.selectedGoal?.id === id ? undefined : state.selectedGoal
        }));
      },

      toggleGoalCompletion: (id: string) => {
        const goal = get().goals.find(g => g.id === id);
        if (!goal) return;

        const updates: Partial<Goal> = {
          isCompleted: !goal.isCompleted,
          completedAt: !goal.isCompleted ? new Date().toISOString() : undefined,
          updatedAt: new Date().toISOString()
        };

        if (!goal.isCompleted) {
          updates.progress = {
            ...goal.progress,
            percentage: 100,
            lastUpdated: new Date().toISOString()
          };
        }

        get().updateGoal(id, updates);
      },

      // Progress and linking
      updateGoalProgress: async (id: string) => {
        const goal = get().goals.find(g => g.id === id);
        if (!goal) return;

        // Calculate progress by accessing stores directly to avoid circular deps
        let tasksTotal = 0;
        let tasksCompleted = 0;
        let habitsActive = 0;
        let habitCompletionRate = 0;

        try {
          // Import stores dynamically to avoid circular dependencies
          const { useTaskStore } = await import('./taskStore');
          const { useHabitStore } = await import('./habitStore');
          
          // Get tasks linked to this goal
          const tasks = useTaskStore.getState().tasks || [];
          const linkedTasks = tasks.filter((task: any) => task.goalId === id);
          tasksTotal = linkedTasks.length;
          tasksCompleted = linkedTasks.filter((task: any) => task.status === 'completed').length;

          // Get habits linked to this goal  
          const habitStore = useHabitStore.getState();
          const habits = habitStore.habits || [];
          const completions = habitStore.completions || [];
          const linkedHabits = habits.filter((habit: any) => habit.goalId === id);
          habitsActive = linkedHabits.length;
          
          // Calculate habit completion rate (last 7 days average)
          if (linkedHabits.length > 0) {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const totalRate = linkedHabits.reduce((sum: number, habit: any) => {
              // Get completions for this specific habit from the separate completions array
              const habitCompletions = completions.filter((comp: any) => comp.habitId === habit.id);
              const last7Days = habitCompletions.filter((comp: any) => {
                const compDate = new Date(comp.date);
                return compDate >= weekAgo && comp.completed;
              });
              return sum + (last7Days.length / 7) * 100;
            }, 0);
            habitCompletionRate = Math.round(totalRate / linkedHabits.length);
          }
        } catch (error) {
          console.warn('Could not calculate goal progress:', error);
        }

        // Calculate overall percentage (60% tasks, 40% habits)
        let percentage = 0;
        if (tasksTotal > 0 || habitsActive > 0) {
          const taskWeight = 0.6;
          const habitWeight = 0.4;
          
          const taskProgress = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
          const habitProgress = habitCompletionRate;
          
          if (tasksTotal > 0 && habitsActive > 0) {
            percentage = Math.round((taskProgress * taskWeight) + (habitProgress * habitWeight));
          } else if (tasksTotal > 0) {
            percentage = Math.round(taskProgress);
          } else if (habitsActive > 0) {
            percentage = Math.round(habitProgress);
          }
        }

        const updatedProgress: GoalProgress = {
          ...goal.progress,
          percentage: Math.min(percentage, 100),
          tasksCompleted,
          tasksTotal,
          habitsActive,
          habitCompletionRate,
          lastUpdated: new Date().toISOString()
        };

        // Debug logging
        console.log(`Goal Progress Update for "${goal.name}":`, {
          goalId: id,
          tasksTotal,
          tasksCompleted,
          habitsActive,
          habitCompletionRate,
          percentage,
          updatedProgress
        });

        get().updateGoal(id, { progress: updatedProgress });
      },

      linkTaskToGoal: (goalId: string, taskId: string) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal || goal.linkedTaskIds.includes(taskId)) return;

        // Update goal with linked task
        set(state => ({
          goals: state.goals.map(g =>
            g.id === goalId
              ? { ...g, linkedTaskIds: [...g.linkedTaskIds, taskId], updatedAt: new Date().toISOString() }
              : g
          )
        }));

        // Update goal progress
        get().updateGoalProgress(goalId);
      },

      unlinkTaskFromGoal: (goalId: string, taskId: string) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal) return;

        // Update goal by removing linked task
        set(state => ({
          goals: state.goals.map(g =>
            g.id === goalId
              ? { ...g, linkedTaskIds: g.linkedTaskIds.filter(id => id !== taskId), updatedAt: new Date().toISOString() }
              : g
          )
        }));

        // Update goal progress
        get().updateGoalProgress(goalId);
      },

      linkHabitToGoal: (goalId: string, habitId: string) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal || goal.linkedHabitIds.includes(habitId)) return;

        // Update goal with linked habit
        set(state => ({
          goals: state.goals.map(g =>
            g.id === goalId
              ? { ...g, linkedHabitIds: [...g.linkedHabitIds, habitId], updatedAt: new Date().toISOString() }
              : g
          )
        }));

        // Update goal progress
        get().updateGoalProgress(goalId);
      },

      unlinkHabitFromGoal: (goalId: string, habitId: string) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal) return;

        // Update goal by removing linked habit
        set(state => ({
          goals: state.goals.map(g =>
            g.id === goalId
              ? { ...g, linkedHabitIds: g.linkedHabitIds.filter(id => id !== habitId), updatedAt: new Date().toISOString() }
              : g
          )
        }));

        // Update goal progress
        get().updateGoalProgress(goalId);
      },

      // Templates
      createGoalFromTemplate: (templateId: string, customData?: Partial<GoalFormData>) => {
        const template = get().templates.find(t => t.id === templateId);
        if (!template) return;

        const goalData: GoalFormData = {
          name: customData?.name || template.name,
          description: customData?.description || template.description,
          category: template.category,
          icon: customData?.icon || template.icon,
          color: customData?.color || template.color,
          priority: customData?.priority || 'medium',
          targetDate: customData?.targetDate,
          motivation: customData?.motivation,
          tags: customData?.tags || template.tags,
          templateId: templateId
        };

        get().addGoal(goalData);
      },

      getTemplatesByCategory: (category: GoalCategory) => {
        return get().templates.filter(template => template.category === category);
      },

      // Filtering and views
      setFilter: (filter: Partial<GoalFilter>) => {
        set(state => ({
          currentFilter: { ...state.currentFilter, ...filter }
        }));
      },

      setViewMode: (mode: GoalViewMode) => {
        set({ viewMode: mode });
      },

      getFilteredGoals: () => {
        const { goals, currentFilter } = get();
        
        return goals.filter(goal => {
          if (currentFilter.category !== 'all' && goal.category !== currentFilter.category) {
            return false;
          }
          
          if (currentFilter.status !== 'all') {
            switch (currentFilter.status) {
              case 'active':
                return !goal.isCompleted && !goal.isArchived;
              case 'completed':
                return goal.isCompleted;
              case 'overdue':
                return !goal.isCompleted && goal.targetDate && new Date(goal.targetDate) < new Date();
              default:
                return true;
            }
          }
          
          if (currentFilter.priority !== 'all' && goal.priority !== currentFilter.priority) {
            return false;
          }
          
          return true;
        });
      },

      // Modal management
      openModal: () => {
        set(state => ({
          modalState: {
            ...state.modalState,
            isOpen: true,
            currentStep: 0,
            formData: {}
          }
        }));
      },

      closeModal: () => {
        set(() => ({
          modalState: { ...initialModalState }
        }));
      },

      setModalStep: (step: number) => {
        set(state => ({
          modalState: { ...state.modalState, currentStep: step }
        }));
      },

      updateModalFormData: (data: Partial<GoalFormData>) => {
        set(state => ({
          modalState: {
            ...state.modalState,
            formData: { ...state.modalState.formData, ...data }
          }
        }));
      },

      // Selection and navigation
      selectGoal: (goal: Goal) => {
        set({ selectedGoal: goal });
      },

      clearSelection: () => {
        set({ selectedGoal: undefined });
      },

      // Statistics
      getGoalStats: (): GoalStats => {
        const goals = get().goals;
        const activeGoals = goals.filter(g => !g.isCompleted && !g.isArchived);
        const completedGoals = goals.filter(g => g.isCompleted);
        
        const totalProgress = goals.reduce((sum, goal) => sum + goal.progress.percentage, 0);
        const averageProgress = goals.length > 0 ? totalProgress / goals.length : 0;
        
        const categoryBreakdown = goals.reduce((acc, goal) => {
          if (!acc[goal.category]) {
            acc[goal.category] = { count: 0, averageProgress: 0, completionRate: 0 };
          }
          acc[goal.category].count++;
          acc[goal.category].averageProgress += goal.progress.percentage;
          return acc;
        }, {} as any);

        // Calculate averages for categories
        Object.keys(categoryBreakdown).forEach(category => {
          const data = categoryBreakdown[category];
          data.averageProgress = data.averageProgress / data.count;
          data.completionRate = (goals.filter(g => g.category === category && g.isCompleted).length / data.count) * 100;
        });

        return {
          totalGoals: goals.length,
          activeGoals: activeGoals.length,
          completedGoals: completedGoals.length,
          averageProgress,
          totalTasksLinked: goals.reduce((sum, goal) => sum + goal.linkedTaskIds.length, 0),
          totalHabitsLinked: goals.reduce((sum, goal) => sum + goal.linkedHabitIds.length, 0),
          overallCompletionRate: goals.length > 0 ? (completedGoals.length / goals.length) * 100 : 0,
          categoryBreakdown,
          currentActiveStreak: 0, // Would be calculated based on daily activity
          longestActiveStreak: 0,
          goalsCompletedThisMonth: completedGoals.filter(g => 
            g.completedAt && new Date(g.completedAt).getMonth() === new Date().getMonth()
          ).length,
          goalsCompletedThisYear: completedGoals.filter(g => 
            g.completedAt && new Date(g.completedAt).getFullYear() === new Date().getFullYear()
          ).length
        };
      },

      getGoalDetailData: (id: string): GoalDetailData | undefined => {
        const goal = get().goals.find(g => g.id === id);
        if (!goal) return undefined;

        // This would integrate with other stores to get linked items
        return {
          goal,
          linkedTasks: [], // Would fetch from task store
          linkedHabits: [], // Would fetch from habit store
          linkedJournalEntries: [], // Would fetch from journal store
          progressHistory: [],
          milestones: []
        };
      },

      getGoalProgress: (id: string): GoalProgress | undefined => {
        const goal = get().goals.find(g => g.id === id);
        return goal?.progress;
      },

      // Computed getters
      getActiveGoals: () => {
        return get().goals.filter(goal => !goal.isCompleted && !goal.isArchived);
      },

      getCompletedGoals: () => {
        return get().goals.filter(goal => goal.isCompleted);
      },

      getOverdueGoals: () => {
        const now = new Date();
        return get().goals.filter(goal => 
          !goal.isCompleted && 
          goal.targetDate && 
          new Date(goal.targetDate) < now
        );
      },

      getGoalsByCategory: (category: GoalCategory) => {
        return get().goals.filter(goal => goal.category === category);
      },
      
      // Utility function to recalculate progress for all goals
      recalculateAllGoalProgress: async () => {
        const goals = get().goals;
        for (const goal of goals) {
          await get().updateGoalProgress(goal.id);
        }
      }
    }),
    {
      name: 'goal-store',
      partialize: (state) => ({
        goals: state.goals,
        currentFilter: state.currentFilter,
        viewMode: state.viewMode
      })
    }
  )
);