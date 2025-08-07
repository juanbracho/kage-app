import { Goal, GoalViewMode } from '../types/goal';
import { useGoalStore } from '../store/goalStore';
import { useHabitStore } from '../store/habitStore';

interface GoalCardProps {
  goal: Goal;
  viewMode: GoalViewMode;
  onClick?: () => void;
}

export default function GoalCard({ goal, viewMode, onClick }: GoalCardProps) {
  const { selectGoal } = useGoalStore();
  const { habits, isHabitCompletedToday } = useHabitStore();
  
  const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && !goal.isCompleted;
  
  const handleClick = () => {
    selectGoal(goal);
    if (onClick) {
      onClick();
    }
  };

  const formatTargetDate = (dateStr?: string) => {
    if (!dateStr) return 'No deadline';
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `${diffDays} days left`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getProgressColor = () => {
    if (goal.isCompleted) return 'from-green-500 to-green-600';
    if (isOverdue) return 'from-red-500 to-red-600';
    // Use goal's specific color instead of category colors
    return goal.color;
  };

  const getHabitProgress = () => {
    // Get habits linked to this goal
    const linkedHabits = habits.filter(habit => habit.goalId === goal.id);
    const totalHabits = linkedHabits.length;
    
    // Debug logging for development
    if (totalHabits > 0) {
      console.log(`🎯 Goal "${goal.name}" has ${totalHabits} linked habits:`, linkedHabits.map(h => h.name));
    }
    
    if (totalHabits === 0) {
      return { completed: 0, total: 0 };
    }
    
    // Count how many habits are completed today
    const completedToday = linkedHabits.filter(habit => {
      const isCompleted = isHabitCompletedToday(habit.id);
      if (isCompleted) {
        console.log(`✅ Habit "${habit.name}" completed today`);
      }
      return isCompleted;
    }).length;
    
    console.log(`🎯 Goal "${goal.name}" habit progress: ${completedToday}/${totalHabits}`);
    return { completed: completedToday, total: totalHabits };
  };

  const habitProgress = getHabitProgress();

  return (
    <div
      onClick={handleClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 relative border-l-4 ${
        goal.isCompleted ? 'opacity-75' : ''
      } ${isOverdue ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20' : ''}`}
      style={{
        borderLeftColor: goal.isCompleted 
          ? '#22c55e' 
          : isOverdue 
          ? '#ef4444'
          : goal.color.includes('linear-gradient') 
          ? goal.color.replace('linear-gradient(135deg, ', '').replace(')', '').split(', ')[0]
          : goal.color
      }}
    >
      {/* Goal Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Goal Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white flex-shrink-0"
          style={{ 
            background: goal.color
          }}
        >
          {goal.icon}
        </div>
        
        {/* Goal Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 ${
            viewMode === 'grid' ? 'text-lg' : 'text-xl'
          }`}>
            {goal.name}
            {goal.isCompleted && <span className="ml-2 text-green-500">✓</span>}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 leading-relaxed">
            {goal.description}
          </p>
        </div>
        
        {/* Target Date */}
        <div className={`text-xs px-2 py-1 rounded-lg whitespace-nowrap ${
          isOverdue 
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
            : goal.isCompleted
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        }`}>
          {formatTargetDate(goal.targetDate)}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Progress</span>
          <span 
            className="text-sm font-bold"
            style={{ 
              color: goal.isCompleted ? '#22c55e' : goal.color 
            }}
          >
            {Math.round(goal.progress.percentage)}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              goal.isCompleted || isOverdue ? `bg-gradient-to-r ${getProgressColor()}` : ''
            }`}
            style={{ 
              width: `${Math.min(goal.progress.percentage, 100)}%`,
              backgroundColor: goal.isCompleted || isOverdue ? undefined : goal.color
            }}
          />
        </div>
      </div>

      {/* Goal Stats */}
      <div className="flex items-center gap-4 text-sm">
        {/* Tasks */}
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <span className="text-base">✅</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {goal.progress.tasksCompleted}/{goal.progress.tasksTotal}
          </span>
          <span>tasks</span>
        </div>
        
        {/* Habits */}
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <span className="text-base">🔄</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {habitProgress.completed}/{habitProgress.total}
          </span>
          <span>habits</span>
        </div>
        
        {/* Milestones */}
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <span className="text-base">🎯</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {(goal.milestones || []).filter(m => m.completed).length}/{(goal.milestones || []).length}
          </span>
          <span>milestones</span>
        </div>
        
        {/* Streak */}
        {goal.progress.currentStreak > 0 && (
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <span className="text-base">🔥</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {goal.progress.currentStreak}
            </span>
            <span>day streak</span>
          </div>
        )}
        
        {/* Priority Badge */}
        {goal.priority === 'high' || goal.priority === 'critical' && (
          <div className={`ml-auto px-2 py-1 rounded-lg text-xs font-medium ${
            goal.priority === 'critical'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}>
            {goal.priority === 'critical' ? '🚨' : '⚡'} {goal.priority}
          </div>
        )}
      </div>

      {/* Motivation Preview (only in list view) */}
      {viewMode === 'list' && goal.motivation && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 italic line-clamp-1">
            "{goal.motivation}"
          </p>
        </div>
      )}

      {/* Tags */}
      {goal.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {goal.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md"
            >
              #{tag}
            </span>
          ))}
          {goal.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md">
              +{goal.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}