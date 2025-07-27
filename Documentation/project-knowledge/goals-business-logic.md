# Project Kage - Goals System: Complete Business Logic
**Purpose**: Comprehensive specification for the goal-centric foundation of Project Kage, including template system, custom creation, progress tracking, and cross-feature integration

---

## 🎯 **GOALS CORE PHILOSOPHY**

### **✅ GOAL-CENTRIC ARCHITECTURE**

Project Kage revolutionizes productivity by making **Goals the central hub** that connects all activities. Unlike traditional apps where goals are an afterthought, every task and habit in Kage serves a higher purpose.

#### **Core Principles**
- **Everything Links to Goals**: Tasks and habits gain meaning through goal connection
- **Visual Progress Tracking**: Real-time progress visualization across all linked activities  
- **Motivation Psychology**: Goals provide the "why" that drives consistency
- **Achievement Celebration**: Milestone celebrations reinforce positive behavior
- **Template-Driven Success**: Proven goal frameworks reduce decision paralysis

#### **Goal Types & Categories**
- **Health & Fitness**: Physical wellness, exercise, nutrition goals
- **Career & Business**: Professional growth, skill development, project goals
- **Learning & Skills**: Education, languages, hobby mastery
- **Personal Growth**: Mindfulness, relationships, self-improvement
- **Financial**: Saving, investing, budgeting objectives
- **Creative & Hobbies**: Artistic pursuits, creative projects

---

## 🏗️ **GOAL CREATION SYSTEM**

### **Two-Path Creation Strategy**
```
Goal Creation Entry Points:
1. Template Path (Recommended for new users)
   - Browse 6 categories with 50+ proven templates
   - One-click goal creation with pre-built tasks/habits
   - Edit after creation for personalization

2. Custom Path (Power users)
   - Complete customization with icon/color selection
   - Full control over every aspect
   - Build from scratch with guidance
```

### **Template System Architecture**
```javascript
GoalTemplate {
  id: string
  name: string
  category: 'health' | 'career' | 'learning' | 'personal' | 'financial' | 'creative'
  description: string
  duration: string // "3-6 months"
  difficulty: 1 | 2 | 3 | 4 | 5 // 1=Beginner, 5=Expert
  popularity: number // Usage ranking
  
  // Visual elements
  icon: string // Emoji or icon reference
  color: string // Hex color code
  
  // Pre-built content
  preBuildTasks: PreBuildTask[]
  preBuildHabits: PreBuildHabit[]
  motivationPrompts: string[]
  milestoneMessages: string[]
  
  // Metadata
  createdBy: 'system' | 'community' // Future: user-generated templates
  tags: string[]
  estimatedWeeks: number
  successRate: number // % of users who complete this template
}

PreBuildTask {
  name: string
  description: string
  priority: 1 | 2 | 3 | 4 | 5
  estimatedDays: number // Days after goal creation
  subTasks?: string[] // Optional sub-task names
  type: 'standard' | 'deadline' | 'to-buy'
}

PreBuildHabit {
  name: string
  description: string
  frequency: 'daily' | 'weekly' | 'custom'
  measurementType: 'simple' | 'count' | 'time' | 'custom'
  targetAmount?: number
  targetUnit?: string
  difficulty: 1 | 2 | 3 | 4 | 5
}
```

### **Template Categories & Examples**
```
HEALTH & FITNESS (8 templates):
┌─────────────────────────────────────┐
│ 💪 Get Fit & Strong                 │
│ 3-6 months • 8 tasks • 5 habits     │
│ Build consistent workout routine     │
│ ⭐⭐⭐⭐⭐ Popular                   │
└─────────────────────────────────────┘

│ 🏃 Run a Marathon                   │
│ 4-6 months • 12 tasks • 6 habits    │
│ Complete training for 26.2 miles    │
│ ⭐⭐⭐⭐⚪ Challenge                │

│ 🥗 Healthy Eating                   │
│ 2-3 months • 6 tasks • 7 habits     │
│ Sustainable nutrition habits        │
│ ⭐⭐⭐⚪⚪ Beginner                │

CAREER & BUSINESS (12 templates):
│ 🚀 Launch Side Project              │
│ 3-4 months • 15 tasks • 4 habits    │
│ Take idea from concept to launch    │
│ ⭐⭐⭐⭐⭐ Popular                   │

│ 📈 Get Promoted                     │
│ 6-12 months • 10 tasks • 5 habits   │
│ Strategic career advancement         │
│ ⭐⭐⭐⭐⚪ Professional             │

[Additional categories follow same pattern...]
```

### **Template Selection Flow**
```javascript
function selectTemplate(templateId, userId) {
  const template = getTemplate(templateId);
  const user = getUser(userId);
  
  // Create goal from template
  const goal = {
    id: generateId(),
    name: template.name,
    description: template.description,
    category: template.category,
    icon: template.icon,
    color: template.color,
    
    // Timeline
    createdAt: new Date(),
    targetDate: calculateTargetDate(template.estimatedWeeks),
    
    // Progress tracking
    progressPercentage: 0,
    status: 'active',
    
    // Template metadata
    fromTemplate: true,
    templateId: template.id,
    
    // User customization
    userId: userId,
    motivation: '', // User can add later
    
    // Relationships
    linkedTasks: [],
    linkedHabits: []
  };
  
  // Create pre-built tasks
  const tasks = template.preBuildTasks.map(taskTemplate => 
    createTaskFromTemplate(taskTemplate, goal.id)
  );
  
  // Create pre-built habits  
  const habits = template.preBuildHabits.map(habitTemplate =>
    createHabitFromTemplate(habitTemplate, goal.id)
  );
  
  // Link everything together
  goal.linkedTasks = tasks.map(t => t.id);
  goal.linkedHabits = habits.map(h => h.id);
  
  // Save to database
  saveGoal(goal);
  saveTasks(tasks);
  saveHabits(habits);
  
  // Generate welcome journal prompt
  createJournalPrompt('goal-created', { goal, isFromTemplate: true });
  
  return goal;
}
```

---

## 🎨 **CUSTOM GOAL CREATION**

### **Custom Creation Interface**
```
Custom Goal Modal Layout:
┌─────────────────────────────────────┐
│ Create Custom Goal              [×] │
├─────────────────────────────────────┤
│ Goal Name*                          │
│ [What do you want to achieve?]      │
│                                     │
│ Description                         │
│ [Describe your goal in detail...]   │
│                                     │
│ 🎨 Personalize Your Goal            │
│ ┌─────────────┬─────────────────────┐ │
│ │ Choose Icon │ Choose Color        │ │
│ │ 🎯🚀💪📚    │ ●●●●●●●●           │ │
│ │ 💰🏃🧘🎨    │ Orange Blue Green   │ │
│ └─────────────┴─────────────────────┘ │
│                                     │
│ Target Completion                   │
│ [Date Picker] [Duration Dropdown]   │
│                                     │
│ Category                            │
│ [Health & Fitness ▼]               │
│                                     │
│ ✨ Why This Matters                 │
│ [What will achieving this goal...]   │
│                                     │
│ 📊 Goal Preview                     │
│ [Live preview card]                 │
│                                     │
│ [Cancel] [Create Goal]              │
└─────────────────────────────────────┘
```

### **Custom Goal Data Structure**
```javascript
CustomGoal {
  // Core identification
  id: string
  name: string (1-60 characters)
  description: string (0-300 characters)
  
  // Visual customization
  icon: string // Selected from 50+ options
  color: string // Hex code from 8 gradient options
  
  // Timeline & targets
  createdAt: DateTime
  targetDate?: DateTime // Optional completion target
  estimatedDuration?: string // "3 months", "6 months", etc.
  
  // Organization
  category: 'health' | 'career' | 'learning' | 'personal' | 'financial' | 'creative'
  tags: string[] // User-created tags
  
  // Motivation psychology
  motivation: string // Why this goal matters
  expectedBenefits: string[] // What user expects to gain
  
  // Progress tracking  
  progressPercentage: number // 0-100
  status: 'active' | 'paused' | 'completed' | 'archived'
  
  // Milestones & achievements
  milestones: Milestone[]
  achievements: Achievement[]
  
  // Relationships
  linkedTasks: string[] // Task IDs
  linkedHabits: string[] // Habit IDs
  
  // Analytics
  timeSpent?: number // Minutes (future feature)
  completionPrediction?: number // AI confidence % (future)
  
  // Metadata
  fromTemplate: false // Distinguishes from template goals
  isPrivate: boolean // Default true
  sharedWith?: string[] // User IDs (future feature)
}

Milestone {
  id: string
  name: string
  targetPercentage: number // 25, 50, 75, 100
  isReached: boolean
  reachedAt?: DateTime
  celebrationMessage: string
}

Achievement {
  id: string
  type: 'streak' | 'consistency' | 'milestone' | 'completion'
  name: string
  description: string
  earnedAt: DateTime
  iconUrl?: string
}
```

### **Visual Customization Logic**
```javascript
// Icon Selection System
const iconCategories = {
  general: ['🎯', '🚀', '⭐', '💎', '🔥', '⚡', '🌟', '🎊'],
  health: ['💪', '🏃', '🥗', '🧘', '🏋️', '🚴', '🏊', '💚'],
  career: ['📈', '💼', '🎓', '📊', '💰', '🏆', '📝', '💡'],
  learning: ['📚', '🎓', '🧠', '📖', '✍️', '🗣️', '💻', '🎨'],
  personal: ['🧘', '❤️', '🌱', '🙏', '😊', '🌸', '🦋', '🌈'],
  creative: ['🎨', '🖌️', '📸', '🎵', '✨', '🎭', '📝', '🎪']
};

// Color System (8 Gradients)
const colorOptions = [
  { name: 'Orange', primary: '#FF7101', secondary: '#FFB347', gradient: 'linear-gradient(135deg, #FF7101, #FFB347)' },
  { name: 'Blue', primary: '#3B82F6', secondary: '#60A5FA', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)' },
  { name: 'Green', primary: '#22C55E', secondary: '#4ADE80', gradient: 'linear-gradient(135deg, #22C55E, #4ADE80)' },
  { name: 'Purple', primary: '#A855F7', secondary: '#C084FC', gradient: 'linear-gradient(135deg, #A855F7, #C084FC)' },
  { name: 'Pink', primary: '#EC4899', secondary: '#F472B6', gradient: 'linear-gradient(135deg, #EC4899, #F472B6)' },
  { name: 'Yellow', primary: '#F59E0B', secondary: '#FBBF24', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
  { name: 'Red', primary: '#EF4444', secondary: '#F87171', gradient: 'linear-gradient(135deg, #EF4444, #F87171)' },
  { name: 'Teal', primary: '#14B8A6', secondary: '#2DD4BF', gradient: 'linear-gradient(135deg, #14B8A6, #2DD4BF)' }
];

function updateGoalPreview(formData) {
  const preview = {
    icon: formData.selectedIcon || '🎯',
    name: formData.name || 'Your New Goal',
    color: formData.selectedColor || colorOptions[0],
    category: formData.category || 'Personal',
    targetDate: formData.targetDate ? formatDate(formData.targetDate) : 'Not set',
    motivation: formData.motivation ? truncate(formData.motivation, 50) : 'Add your motivation...'
  };
  
  renderGoalPreviewCard(preview);
}
```

---

## 📊 **PROGRESS TRACKING SYSTEM**

### **Multi-Source Progress Calculation**
```javascript
function calculateGoalProgress(goalId) {
  const goal = getGoal(goalId);
  const linkedTasks = getTasksByGoal(goalId);
  const linkedHabits = getHabitsByGoal(goalId);
  
  // Task Progress Component (60% weight)
  const taskProgress = calculateTaskProgress(linkedTasks);
  
  // Habit Progress Component (40% weight)  
  const habitProgress = calculateHabitProgress(linkedHabits);
  
  // Weighted combination
  const totalProgress = (taskProgress * 0.6) + (habitProgress * 0.4);
  
  return {
    overall: Math.round(totalProgress),
    tasks: {
      progress: taskProgress,
      completed: linkedTasks.filter(t => t.status === 'completed').length,
      total: linkedTasks.length
    },
    habits: {
      progress: habitProgress,
      activeStreaks: getActiveStreaks(linkedHabits),
      consistencyRate: getConsistencyRate(linkedHabits, 30) // Last 30 days
    },
    breakdown: {
      tasksContribution: Math.round(taskProgress * 0.6),
      habitsContribution: Math.round(habitProgress * 0.4)
    }
  };
}

function calculateTaskProgress(tasks) {
  if (tasks.length === 0) return 0;
  
  let totalWeight = 0;
  let completedWeight = 0;
  
  tasks.forEach(task => {
    // Weight by priority (urgent tasks worth more)
    const weight = task.priority <= 2 ? 1.5 : 1.0;
    totalWeight += weight;
    
    if (task.status === 'completed') {
      completedWeight += weight;
    } else if (task.progressPercentage > 0) {
      // Partial credit for tasks with completed sub-tasks
      completedWeight += (task.progressPercentage / 100) * weight;
    }
  });
  
  return totalWeight > 0 ? (completedWeight / totalWeight) * 100 : 0;
}

function calculateHabitProgress(habits) {
  if (habits.length === 0) return 0;
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  let totalConsistencyScore = 0;
  
  habits.forEach(habit => {
    const completions = getHabitCompletions(habit.id, thirtyDaysAgo, now);
    const expectedCompletions = calculateExpectedCompletions(habit, thirtyDaysAgo, now);
    
    if (expectedCompletions > 0) {
      const consistencyRate = Math.min(completions.length / expectedCompletions, 1.0);
      
      // Bonus for streaks
      const currentStreak = getCurrentStreak(habit.id);
      const streakBonus = Math.min(currentStreak / 30, 0.2); // Max 20% bonus
      
      totalConsistencyScore += (consistencyRate + streakBonus);
    }
  });
  
  return habits.length > 0 ? (totalConsistencyScore / habits.length) * 100 : 0;
}
```

### **Progress Visualization**
```
Goal Card Progress Display:
┌─────────────────────────────────────┐
│ 🎯 Get Fit & Strong            [⋮] │
│ Health & Fitness • 127 days left    │
│                                     │
│ ▓▓▓▓▓▓▓░░░ 67%                     │
│                                     │
│ 📋 Tasks: 8/12 completed            │
│ 🔄 Habits: 89% consistency          │
│                                     │
│ Next: Complete workout routine      │
└─────────────────────────────────────┘

Detailed Progress Breakdown:
┌─────────────────────────────────────┐
│ 📊 Progress Details                 │
│                                     │
│ Overall Progress: 67%               │
│ ▓▓▓▓▓▓▓░░░░░░░░░░░░░                │
│                                     │
│ 📋 Tasks (60% weight): 75%          │
│ ├─ Completed: 8/12 tasks            │
│ ├─ In Progress: 2 tasks             │
│ └─ Pending: 2 tasks                 │
│                                     │
│ 🔄 Habits (40% weight): 55%         │
│ ├─ Morning run: 23-day streak       │
│ ├─ Meal prep: 89% this month        │
│ └─ Sleep tracking: 67% this month   │
│                                     │
│ 🎯 On track to complete by Dec 31   │
└─────────────────────────────────────┘
```

### **Milestone System**
```javascript
const defaultMilestones = [
  { percentage: 25, name: 'Getting Started', message: 'Great beginning! You\'re 25% of the way there.' },
  { percentage: 50, name: 'Halfway Hero', message: 'Amazing progress! You\'re halfway to your goal!' },
  { percentage: 75, name: 'Nearly There', message: 'So close! 75% complete - the finish line is in sight!' },
  { percentage: 100, name: 'Goal Achieved!', message: 'Congratulations! You\'ve achieved your goal!' }
];

function checkMilestones(goal, previousProgress, newProgress) {
  const achievedMilestones = [];
  
  defaultMilestones.forEach(milestone => {
    if (previousProgress < milestone.percentage && newProgress >= milestone.percentage) {
      // Milestone reached!
      const achievement = {
        id: generateId(),
        goalId: goal.id,
        type: 'milestone',
        name: milestone.name,
        description: milestone.message,
        percentage: milestone.percentage,
        achievedAt: new Date(),
        celebration: generateCelebration(milestone.percentage)
      };
      
      achievedMilestones.push(achievement);
      
      // Save achievement
      saveAchievement(achievement);
      
      // Trigger celebrations
      showMilestoneCelebration(achievement);
      
      // Generate journal prompt
      createJournalPrompt('milestone-reached', { goal, milestone: achievement });
      
      // Schedule notification
      scheduleMilestoneNotification(achievement);
    }
  });
  
  return achievedMilestones;
}
```

---

## 🔗 **CROSS-FEATURE INTEGRATION**

### **Task-Goal Integration**
```javascript
function linkTaskToGoal(taskId, goalId) {
  const task = getTask(taskId);
  const goal = getGoal(goalId);
  
  // Update task
  task.goalId = goalId;
  task.updatedAt = new Date();
  
  // Update goal's linked tasks
  if (!goal.linkedTasks.includes(taskId)) {
    goal.linkedTasks.push(taskId);
  }
  
  // Recalculate goal progress
  const newProgress = calculateGoalProgress(goalId);
  const previousProgress = goal.progressPercentage;
  goal.progressPercentage = newProgress.overall;
  
  // Check for milestone achievements
  checkMilestones(goal, previousProgress, newProgress.overall);
  
  // Update goal visual elements
  if (task.priority <= 2) {
    // High priority tasks may influence goal urgency
    reassessGoalUrgency(goal);
  }
  
  // Save changes
  saveTask(task);
  saveGoal(goal);
  
  // Update dashboard
  updateDashboardGoalMetrics();
  
  return { task, goal, newProgress };
}

function handleTaskCompletion(taskId) {
  const task = getTask(taskId);
  
  if (task.goalId) {
    const goal = getGoal(task.goalId);
    const previousProgress = goal.progressPercentage;
    
    // Recalculate progress
    const newProgress = calculateGoalProgress(task.goalId);
    goal.progressPercentage = newProgress.overall;
    goal.updatedAt = new Date();
    
    // Check milestones
    const achievements = checkMilestones(goal, previousProgress, newProgress.overall);
    
    // Special handling for goal completion
    if (newProgress.overall >= 100 && goal.status !== 'completed') {
      completeGoal(goal);
    }
    
    // Generate contextual journal prompts
    if (task.priority <= 2 || achievements.length > 0) {
      createJournalPrompt('goal-progress', { 
        task, 
        goal, 
        progressGain: newProgress.overall - previousProgress,
        achievements 
      });
    }
  }
}
```

### **Habit-Goal Integration**
```javascript
function linkHabitToGoal(habitId, goalId) {
  const habit = getHabit(habitId);
  const goal = getGoal(goalId);
  
  // Update habit
  habit.goalId = goalId;
  habit.updatedAt = new Date();
  
  // Update goal's linked habits
  if (!goal.linkedHabits.includes(habitId)) {
    goal.linkedHabits.push(habitId);
  }
  
  // Inherit goal's visual elements if habit has defaults
  if (habit.color === getDefaultColor()) {
    habit.color = goal.color;
  }
  
  // Recalculate goal progress
  const newProgress = calculateGoalProgress(goalId);
  goal.progressPercentage = newProgress.overall;
  
  saveHabit(habit);
  saveGoal(goal);
  
  return { habit, goal, newProgress };
}

function handleHabitCompletion(habitId, completionDate) {
  const habit = getHabit(habitId);
  
  if (habit.goalId) {
    const goal = getGoal(habit.goalId);
    const previousProgress = goal.progressPercentage;
    
    // Update streak and consistency
    updateHabitStreak(habit, completionDate);
    
    // Recalculate goal progress
    const newProgress = calculateGoalProgress(habit.goalId);
    goal.progressPercentage = newProgress.overall;
    
    // Check for significant streaks that deserve celebration
    const currentStreak = getCurrentStreak(habitId);
    const streakMilestones = [7, 14, 30, 60, 100];
    
    if (streakMilestones.includes(currentStreak)) {
      createJournalPrompt('habit-milestone', {
        habit,
        goal,
        streak: currentStreak,
        goalProgress: newProgress.overall
      });
    }
    
    // Update goal if significant progress made
    if (newProgress.overall - previousProgress >= 1) {
      checkMilestones(goal, previousProgress, newProgress.overall);
    }
  }
}
```

### **Dashboard Integration**
```
Goals Dashboard Widget:
┌─────────────────────────────────────┐
│ 🎯 Goals (4 active)           [⋮]  │
│                                     │
│ 🏃 Get Fit & Strong      ▓▓▓▓▓▓▓░░░ 67% │
│ 🚀 Launch Side Project  ▓▓▓░░░░░░░ 23% │
│ 📚 Learn Spanish        ▓▓▓▓▓░░░░░ 45% │
│ 🧘 Mindfulness Practice ▓▓▓▓▓▓▓▓▓░ 89% │
│                                     │
│ Next milestone: 75% (Launch Project) │
│ [+ Create Goal] [View All]          │
└─────────────────────────────────────┘

Goal Detail Integration:
- Recent linked task completions
- Habit consistency for this goal  
- Journal entries mentioning this goal
- Progress timeline and predictions
- Recommended next actions
```

---

## 🎉 **ACHIEVEMENT & CELEBRATION SYSTEM**

### **Goal Completion Flow**
```javascript
function completeGoal(goal) {
  // Update goal status
  goal.status = 'completed';
  goal.completedAt = new Date();
  goal.progressPercentage = 100;
  
  // Calculate completion statistics
  const stats = {
    daysToComplete: calculateDaysBetween(goal.createdAt, goal.completedAt),
    tasksCompleted: goal.linkedTasks.length,
    habitsBuilt: goal.linkedHabits.length,
    fromTemplate: goal.fromTemplate,
    category: goal.category
  };
  
  // Create achievement record
  const achievement = {
    id: generateId(),
    type: 'goal-completion',
    goalId: goal.id,
    name: `${goal.name} - Achieved!`,
    description: `Completed in ${stats.daysToComplete} days`,
    achievedAt: new Date(),
    stats: stats,
    celebrationLevel: calculateCelebrationLevel(goal, stats)
  };
  
  // Save achievement
  saveAchievement(achievement);
  
  // Trigger major celebration
  showGoalCompletionCelebration(achievement);
  
  // Generate comprehensive journal prompt
  createJournalPrompt('goal-completion', {
    goal,
    achievement,
    stats,
    reflection: generateReflectionQuestions(goal)
  });
  
  // Update user statistics
  updateUserGoalStats(goal.userId, stats);
  
  // Suggest next goals
  suggestFollowUpGoals(goal);
  
  // Share achievement (if user opts in)
  offerAchievementShare(achievement);
  
  return achievement;
}

function calculateCelebrationLevel(goal, stats) {
  let level = 1; // Base celebration
  
  // Difficulty bonus
  if (goal.linkedTasks.length >= 10) level++;
  if (goal.linkedHabits.length >= 5) level++;
  
  // Speed bonus
  if (stats.daysToComplete <= 60) level++;
  if (stats.daysToComplete <= 30) level++;
  
  // First goal bonus
  if (isFirstGoalInCategory(goal)) level++;
  
  return Math.min(level, 5); // Max level 5
}
```

### **Celebration Animations & Notifications**
```
Celebration Types by Level:

Level 1 (Basic):
- Success notification with goal icon
- Confetti animation (3 seconds)
- Achievement sound effect
- "Goal Achieved!" message

Level 2 (Good):
- Level 1 + Progress celebration modal
- Share achievement option
- Stats display (days, tasks, habits)

Level 3 (Great):
- Level 2 + Animated progress timeline
- Personal best indicators
- Suggested next goals
- Extended confetti (5 seconds)

Level 4 (Amazing):
- Level 3 + Custom celebration message
- Achievement badge unlock
- Social sharing templates
- Special sound effects

Level 5 (Legendary):
- Level 4 + Full-screen celebration
- Streak/consistency bonuses
- Personal growth insights
- Surprise reward unlock
```

---

## 📈 **GOAL ANALYTICS & INSIGHTS**

### **Individual Goal Analytics**
```
Goal Detail Analytics:
┌─────────────────────────────────────┐
│ 📊 Goal Analytics                   │
│                                     │
│ Progress Over Time:                 │
│ 100% ┤                             │
│  75% ┤     ┌─────┐                 │
│  50% ┤   ┌─┘     └─┐               │
│  25% ┤ ┌─┘         └─┐             │
│   0% └─┘             └─────────     │
│      Week 1  2  3  4  5  6         │
│                                     │
│ Key Metrics:                        │
│ • Created: 45 days ago              │
│ • Progress rate: +1.5% per day      │
│ • Tasks completion: 8/12 (67%)      │
│ • Habits consistency: 89%           │
│ • Estimated completion: 18 days     │
│                                     │
│ Contributing Activities:             │
│ 🔄 Morning run: +23% goal progress  │
│ ✅ Workout plan: +15% goal progress │
│ ✅ Gym membership: +12% goal progress│
│                                     │
│ Insights:                           │
│ • Most productive day: Tuesday      │
│ • Consistency improved 40% in Week 3│
│ • Habit streaks correlate with mood │
└─────────────────────────────────────┘
```

### **Cross-Goal Analytics**
```javascript
function generateGoalInsights(userId) {
  const user = getUser(userId);
  const goals = getUserGoals(userId);
  const completedGoals = goals.filter(g => g.status === 'completed');
  const activeGoals = goals.filter(g => g.status === 'active');
  
  return {
    overview: {
      totalGoals: goals.length,
      completedGoals: completedGoals.length,
      activeGo