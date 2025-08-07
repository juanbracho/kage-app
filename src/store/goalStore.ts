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
  TemplateCreationResult,
  GoalMilestone,
  GoalProgressSettings
} from '../types/goal';
import templateLoader from '../services/templateLoader';

const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

// const formatDateToString = (date: Date): string => {
//   return date.toISOString().split('T')[0];
// };

// Initialize template loading on store creation with better error handling
const initializeTemplates = async () => {
  try {
    console.log('🔄 Initializing templates in goalStore...');
    await templateLoader.loadTemplates();
    console.log('✅ Templates loaded successfully in goalStore');
    
    // Update store with loaded templates if possible
    if (typeof window !== 'undefined') {
      const loadedTemplates = await templateLoader.getTemplates();
      console.log(`📊 Loaded ${loadedTemplates.length} templates from templateLoader`);
    }
  } catch (error) {
    console.error('❌ Failed to load templates in goalStore:', error);
    console.log('🔄 Using legacy templates as fallback');
  }
};

// Trigger template loading with error protection
try {
  initializeTemplates();
} catch (initError) {
  console.error('❌ Failed to initialize templates:', initError);
}

// Legacy fallback templates (kept for backwards compatibility)
const legacyTemplates: GoalTemplate[] = [
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
      templates: legacyTemplates,
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
          // NEW: Initialize milestones and progress settings
          milestones: [],
          progressSettings: {
            calculationMode: 'tasks', // Default to current behavior
            timeframe: '30days'
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

      archiveGoal: (id: string) => {
        console.log('🗃️ Goal Store: Archiving goal:', id);
        get().updateGoal(id, {
          isArchived: true,
          updatedAt: new Date().toISOString()
        });
      },

      unarchiveGoal: (id: string) => {
        console.log('📂 Goal Store: Unarchiving goal:', id);
        get().updateGoal(id, {
          isArchived: false,
          updatedAt: new Date().toISOString()
        });
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
          // Import stores dynamically with error handling
          let taskStore, habitStore;
          try {
            const { useTaskStore } = await import('./taskStore');
            const { useHabitStore } = await import('./habitStore');
            taskStore = useTaskStore.getState();
            habitStore = useHabitStore.getState();
          } catch (importError) {
            console.warn('⚠️ Could not load task/habit stores, using fallback:', importError);
            return { success: false, error: 'Store initialization failed' };
          }
          
          // Get tasks linked to this goal
          const tasks = taskStore?.tasks || [];
          const linkedTasks = tasks.filter((task: any) => task.goalId === id);
          tasksTotal = linkedTasks.length;
          tasksCompleted = linkedTasks.filter((task: any) => task.status === 'completed').length;

          // Get habits linked to this goal  
          const habits = habitStore?.habits || [];
          const completions = habitStore?.completions || [];
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

        // Calculate overall percentage using selected progress mode
        let percentage = 0;
        const progressSettings = goal.progressSettings || { calculationMode: 'tasks', timeframe: '30days' };
        
        const milestonesCompleted = goal.milestones?.filter(m => m.completed).length || 0;
        const milestonesTotal = goal.milestones?.length || 0;
        
        // Calculate progress based on selected mode
        switch (progressSettings.calculationMode) {
          case 'tasks':
            percentage = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
            break;
          
          case 'habits':
            percentage = habitsActive > 0 ? habitCompletionRate : 0;
            break;
          
          case 'milestones':
            percentage = milestonesTotal > 0 ? (milestonesCompleted / milestonesTotal) * 100 : 0;
            break;
          
          case 'mixed':
            const weights = progressSettings.mixedWeights || { tasks: 40, habits: 40, milestones: 20 };
            let taskProgress = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
            let habitProgress = habitsActive > 0 ? habitCompletionRate : 0;
            let milestoneProgress = milestonesTotal > 0 ? (milestonesCompleted / milestonesTotal) * 100 : 0;
            
            // Apply weights (convert percentages to decimals)
            percentage = (
              (taskProgress * (weights.tasks / 100)) +
              (habitProgress * (weights.habits / 100)) +
              (milestoneProgress * (weights.milestones / 100))
            );
            break;
          
          default:
            // Fallback to tasks mode
            percentage = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
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

      // NEW: Milestone management operations
      addMilestone: (goalId: string, description: string, dueDate?: string) => {
        const milestone: GoalMilestone = {
          id: generateId(),
          description,
          completed: false,
          createdAt: new Date().toISOString(),
          order: get().goals.find(g => g.id === goalId)?.milestones.length || 0,
          dueDate
        };

        set(state => ({
          goals: state.goals.map(goal =>
            goal.id === goalId
              ? { 
                  ...goal, 
                  milestones: [...goal.milestones, milestone],
                  updatedAt: new Date().toISOString()
                }
              : goal
          )
        }));

        // Create calendar event for milestone if it has a due date
        if (dueDate) {
          console.log('🎯 About to create calendar event for milestone:', {
            goalId,
            milestoneId: milestone.id,
            milestoneDescription: milestone.description,
            dueDate: milestone.dueDate
          });
          
          // Call async function without await to avoid blocking the milestone creation
          get().createMilestoneCalendarEvent(goalId, milestone).catch(error => {
            console.error('❌ Async error in milestone calendar creation:', error);
          });
        } else {
          console.log('🎯 Milestone has no due date, skipping calendar event creation');
        }

        // Update progress if using milestone-based calculation
        get().updateGoalProgress(goalId);
      },

      updateMilestone: (goalId: string, milestoneId: string, updates: Partial<GoalMilestone>) => {
        const goal = get().goals.find(g => g.id === goalId);
        const originalMilestone = goal?.milestones.find(m => m.id === milestoneId);
        
        set(state => ({
          goals: state.goals.map(goal =>
            goal.id === goalId
              ? {
                  ...goal,
                  milestones: goal.milestones.map(milestone =>
                    milestone.id === milestoneId
                      ? { ...milestone, ...updates }
                      : milestone
                  ),
                  updatedAt: new Date().toISOString()
                }
              : goal
          )
        }));

        // If due date was added or changed, update calendar event
        if (updates.dueDate && updates.dueDate !== originalMilestone?.dueDate && originalMilestone) {
          const updatedMilestone = { ...originalMilestone, ...updates };
          get().createMilestoneCalendarEvent(goalId, updatedMilestone);
        }

        // Update progress if using milestone-based calculation
        get().updateGoalProgress(goalId);
      },

      deleteMilestone: (goalId: string, milestoneId: string) => {
        set(state => ({
          goals: state.goals.map(goal =>
            goal.id === goalId
              ? {
                  ...goal,
                  milestones: goal.milestones.filter(m => m.id !== milestoneId),
                  updatedAt: new Date().toISOString()
                }
              : goal
          )
        }));

        // Update progress if using milestone-based calculation
        get().updateGoalProgress(goalId);
      },

      toggleMilestoneCompletion: (goalId: string, milestoneId: string) => {
        const goal = get().goals.find(g => g.id === goalId);
        const milestone = goal?.milestones.find(m => m.id === milestoneId);
        
        if (!milestone) return;

        const updates: Partial<GoalMilestone> = {
          completed: !milestone.completed,
          completedAt: !milestone.completed ? new Date().toISOString() : undefined
        };

        get().updateMilestone(goalId, milestoneId, updates);
        
        // Trigger journal prompt if milestone is being completed
        if (!milestone.completed && goal) {
          get().triggerMilestoneJournalPrompt(goalId, milestoneId, goal, milestone);
        }
      },

      reorderMilestones: (goalId: string, milestoneIds: string[]) => {
        set(state => ({
          goals: state.goals.map(goal =>
            goal.id === goalId
              ? {
                  ...goal,
                  milestones: milestoneIds.map((id, index) => {
                    const milestone = goal.milestones.find(m => m.id === id);
                    return milestone ? { ...milestone, order: index } : null;
                  }).filter(Boolean) as GoalMilestone[],
                  updatedAt: new Date().toISOString()
                }
              : goal
          )
        }));
      },

      // NEW: Progress settings management
      updateProgressSettings: (goalId: string, settings: Partial<GoalProgressSettings>) => {
        set(state => ({
          goals: state.goals.map(goal =>
            goal.id === goalId
              ? {
                  ...goal,
                  progressSettings: { ...goal.progressSettings, ...settings },
                  updatedAt: new Date().toISOString()
                }
              : goal
          )
        }));

        // Recalculate progress with new settings
        get().updateGoalProgress(goalId);
      },

      // Templates - Enhanced with JSON template system
      createGoalFromTemplate: async (templateId: string, customData?: Partial<GoalFormData>): Promise<TemplateCreationResult> => {
        try {
          console.log(`🎯 Creating goal from template: ${templateId}`);
          
          // Load template from JSON system
          const template = await templateLoader.getTemplateById(templateId);
          if (!template) {
            console.error(`❌ Template not found: ${templateId}`);
            return {
              success: false,
              taskIds: [],
              habitIds: [],
              error: `Template with ID '${templateId}' not found`
            };
          }

          console.log(`📋 Found template: ${template.name}`);
          console.log(`📝 Template has ${template.templateTasks.length} tasks and ${template.templateHabits.length} habits`);

          // Create the main goal
          const goalData: GoalFormData = {
            name: customData?.name || template.name,
            description: customData?.description || template.description,
            category: template.category,
            icon: customData?.icon || template.icon,
            color: customData?.color || template.color,
            priority: customData?.priority || 'medium',
            targetDate: customData?.targetDate,
            motivation: customData?.motivation || `Based on ${template.name} template`,
            tags: customData?.tags || template.tags,
            templateId: templateId
          };

          const goalId = get().addGoal(goalData);
          console.log(`✅ Created goal with ID: ${goalId}`);

          const createdTaskIds: string[] = [];
          const createdHabitIds: string[] = [];

          // Get access to task and habit stores with error handling
          let taskStore, habitStore;
          try {
            const { useTaskStore } = await import('./taskStore');
            const { useHabitStore } = await import('./habitStore');
            taskStore = useTaskStore.getState();
            habitStore = useHabitStore.getState();
          } catch (importError) {
            console.warn('⚠️ Could not load stores for template creation:', importError);
            return { success: false, error: 'Store import failed during template creation' };
          }

          // Create tasks from template
          if (template.templateTasks && template.templateTasks.length > 0) {
            console.log(`📝 Creating ${template.templateTasks.length} tasks...`);
            
            for (const templateTask of template.templateTasks) {
              const taskData = {
                name: templateTask.name,
                description: templateTask.description || '',
                type: 'standard' as const,
                priority: templateTask.priority,
                goalId: goalId,
                notes: templateTask.details || '',
                tags: [template.name, ...(template.tags || [])],
                subtasks: [],
                status: 'pending' as const,
                dueDate: templateTask.weekNumber ? 
                  new Date(Date.now() + (templateTask.weekNumber * 7 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0] : 
                  undefined
              };
              
              try {
                const taskId = taskStore.addTask(taskData);
                createdTaskIds.push(taskId);
                get().linkTaskToGoal(taskId, goalId);
                console.log(`✅ Created task: ${templateTask.name}`);
              } catch (error) {
                console.error(`❌ Failed to create task: ${templateTask.name}`, error);
              }
            }
          }

          // Create habits from template
          if (template.templateHabits && template.templateHabits.length > 0) {
            console.log(`🔄 Creating ${template.templateHabits.length} habits...`);
            
            for (const templateHabit of template.templateHabits) {
              const habitData = {
                name: templateHabit.name,
                description: templateHabit.description || '',
                icon: templateHabit.icon,
                color: template.color,
                measurementType: templateHabit.measurementType,
                frequency: templateHabit.frequency,
                selectedDays: templateHabit.selectedDays,
                customFrequency: templateHabit.customFrequency,
                targetAmount: templateHabit.targetAmount,
                targetUnit: templateHabit.targetUnit,
                calendarIntegration: false,
                startDate: new Date().toISOString().split('T')[0],
                goalId: goalId
              };
              
              try {
                const habitId = habitStore.addHabit(habitData);
                createdHabitIds.push(habitId);
                get().linkHabitToGoal(habitId, goalId);
                console.log(`✅ Created habit: ${templateHabit.name}`);
              } catch (error) {
                console.error(`❌ Failed to create habit: ${templateHabit.name}`, error);
              }
            }
          }

          // Update goal progress after linking all items
          get().updateGoalProgress(goalId);

          console.log(`🎉 Successfully created goal from template!`);
          console.log(`📊 Summary: 1 goal, ${createdTaskIds.length} tasks, ${createdHabitIds.length} habits`);

          return {
            success: true,
            goalId,
            taskIds: createdTaskIds,
            habitIds: createdHabitIds
          };

        } catch (error) {
          console.error('❌ Error creating goal from template:', error);
          return {
            success: false,
            taskIds: [],
            habitIds: [],
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          };
        }
      },

      getTemplatesByCategory: async (category: GoalCategory): Promise<GoalTemplate[]> => {
        try {
          return await templateLoader.getTemplatesByCategory(category);
        } catch (error) {
          console.error('Error getting templates by category:', error);
          // Fallback to legacy templates
          return get().templates.filter(template => template.category === category);
        }
      },

      // Additional template methods
      getAllTemplates: async (): Promise<GoalTemplate[]> => {
        try {
          const templates = await templateLoader.getTemplates();
          return templates || [];
        } catch (error) {
          console.error('Error getting all templates:', error);
          const fallbackTemplates = get().templates || legacyTemplates || [];
          return fallbackTemplates;
        }
      },

      getTemplateById: async (templateId: string): Promise<GoalTemplate | undefined> => {
        try {
          return await templateLoader.getTemplateById(templateId);
        } catch (error) {
          console.error('Error getting template by ID:', error);
          return get().templates.find(t => t.id === templateId);
        }
      },

      refreshTemplates: async (): Promise<void> => {
        try {
          await templateLoader.reloadTemplates();
          console.log('✅ Templates refreshed successfully');
        } catch (error) {
          console.error('❌ Error refreshing templates:', error);
        }
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
          // Always exclude archived goals unless specifically viewing archived status
          if (currentFilter.status !== 'archived' && goal.isArchived) {
            return false;
          }
          
          if (currentFilter.category !== 'all' && goal.category !== currentFilter.category) {
            return false;
          }
          
          if (currentFilter.status !== 'all') {
            switch (currentFilter.status) {
              case 'active':
                return !goal.isCompleted && !goal.isArchived;
              case 'completed':
                return goal.isCompleted && !goal.isArchived;
              case 'archived':
                return goal.isArchived;
              case 'overdue':
                return !goal.isCompleted && !goal.isArchived && goal.targetDate && new Date(goal.targetDate) < new Date();
              default:
                return !goal.isArchived; // Default excludes archived
            }
          }
          
          if (currentFilter.priority !== 'all' && goal.priority !== currentFilter.priority) {
            return false;
          }
          
          return true;
        });
      },

      getActiveGoals: () => {
        const { goals } = get();
        return goals.filter(goal => !goal.isArchived);
      },

      getArchivedGoals: () => {
        const { goals } = get();
        return goals.filter(goal => goal.isArchived);
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
      },

      // NEW: Calendar integration for milestones
      createMilestoneCalendarEvent: async (goalId: string, milestone: GoalMilestone) => {
        try {
          const goal = get().goals.find(g => g.id === goalId);
          console.log('🎯 Creating milestone calendar event:', { goalId, milestone, goal });
          
          if (!goal) {
            console.log('❌ Goal not found for milestone calendar event');
            return;
          }
          
          if (!milestone.dueDate) {
            console.log('❌ No due date for milestone, skipping calendar event');
            return;
          }

          // Import calendar store dynamically to avoid circular dependency
          const { useCalendarStore } = await import('./calendarStore');
          const calendarStore = useCalendarStore.getState();

          // Get current accent color for consistent theming
          const { useSettingsStore } = await import('./settingsStore');
          const { getAccentColorValue } = await import('../utils/accentColors');
          const settingsStore = useSettingsStore.getState();
          const currentAccentColor = getAccentColorValue(settingsStore.accentColor);
          
          const timeBlockData = {
            title: `Milestone: ${milestone.description}`,
            description: `Goal: ${goal.name}`,
            date: milestone.dueDate,
            startTime: '00:00', // All-day event
            durationMinutes: 1440, // Full day
            blockType: 'milestone' as const,
            icon: '🎯',
            color: goal.color || `linear-gradient(135deg, ${currentAccentColor}, ${currentAccentColor}dd)`,
            linkedItemType: 'milestone' as const,
            linkedItemId: milestone.id,
            allDay: true,
            goalId: goalId,
            milestoneId: milestone.id
          };

          console.log('🎯 About to create calendar time block with data:', timeBlockData);
          await calendarStore.addTimeBlock(timeBlockData);
          console.log('✅ Created calendar event for milestone:', milestone.description);
          
          // Verify the time block was actually added (with a small delay to ensure store is updated)
          setTimeout(() => {
            const allTimeBlocks = calendarStore.timeBlocks;
            console.log('📅 Current time blocks count after milestone creation:', allTimeBlocks.length);
            console.log('📅 All time blocks:', allTimeBlocks.map(tb => ({
              id: tb.id,
              title: tb.title,
              date: tb.date,
              blockType: tb.blockType,
              allDay: tb.allDay,
              milestoneId: tb.milestoneId
            })));
            
            const justAdded = allTimeBlocks.find(tb => tb.title === timeBlockData.title && tb.milestoneId === milestone.id);
            if (justAdded) {
              console.log('✅ Verified: Milestone time block found in calendar store:', justAdded);
            } else {
              console.log('❌ Warning: Milestone time block not found in calendar store after addition');
              console.log('📅 Searching for:', { title: timeBlockData.title, milestoneId: milestone.id });
            }
          }, 100);
        } catch (error) {
          console.error('❌ Error creating milestone calendar event:', error);
          console.error('❌ Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timeBlockData
          });
        }
      },

      // NEW: Journal prompt integration for milestone completion
      triggerMilestoneJournalPrompt: async (goalId: string, milestoneId: string, goal: Goal, milestone: GoalMilestone) => {
        try {
          // Import journal store dynamically
          const { useJournalStore } = await import('./journalStore');
          const journalStore = useJournalStore.getState();
          
          const today = new Date().toISOString().split('T')[0];
          const journalPrompt = `🎯 Milestone Achievement!\n\nI just completed the milestone "${milestone.description}" for my goal "${goal.name}".\n\nWhat I learned from this milestone:\n\nHow this brings me closer to my goal:\n\nNext steps:\n\n`;

          // Check if there's already a journal entry for today
          const existingEntry = journalStore.getEntry(today);
          
          if (existingEntry) {
            // Append to existing entry
            const updatedContent = `${existingEntry.content}\n\n${journalPrompt}`;
            journalStore.updateEntry(today, { content: updatedContent });
          } else {
            // Create new entry
            journalStore.addEntry({
              date: today,
              content: journalPrompt,
              mood: 'positive' as const,
              tags: [`goal:${goal.name}`, 'milestone', 'achievement']
            });
          }

          // Show success message (in real app, this would trigger a modal)
          console.log(`🎉 Journal entry created for milestone completion: ${milestone.description}`);
          
        } catch (error) {
          console.error('❌ Error creating milestone journal entry:', error);
        }
      }
    }),
    {
      name: 'goal-store',
      partialize: (state) => ({
        goals: state.goals,
        currentFilter: state.currentFilter,
        viewMode: state.viewMode
      }),
      onRehydrateStorage: () => (state) => {
        // Migrate existing goals to ensure they have milestones and progressSettings
        if (state?.goals) {
          state.goals = state.goals.map(goal => ({
            ...goal,
            milestones: goal.milestones || [],
            progressSettings: goal.progressSettings || {
              calculationMode: 'tasks',
              timeframe: '30days'
            }
          }));
          console.log('🎯 Migrated', state.goals.length, 'goals to include milestone support');
        }
      }
    }
  )
);