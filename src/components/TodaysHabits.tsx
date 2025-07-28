import { Habit } from '../types/habit';
import { formatDateToString } from '../store/habitStore';
import { useGoalStore } from '../store/goalStore';
import { GOAL_CATEGORIES } from '../types/goal';

interface TodaysHabitsProps {
  todayHabits: Array<{
    habit: Habit;
    isCompleted: boolean;
  }>;
  onHabitToggle: (habitId: string, date: string) => void;
}

export default function TodaysHabits({ todayHabits, onHabitToggle }: TodaysHabitsProps) {
  const { goals } = useGoalStore();
  const today = formatDateToString(new Date());

  if (todayHabits.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔄</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Habits</h3>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">0 of 0</span>
        </div>
        
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-3xl mb-2">🌟</div>
          <p>No habits scheduled for today!</p>
          <p className="text-sm mt-1">Create some healthy habits to build a better routine.</p>
        </div>
      </div>
    );
  }

  const completedHabits = todayHabits.filter(({ isCompleted }) => isCompleted);

  const getCategoryTag = (habit: Habit) => {
    // If habit is linked to a goal, use the goal's category
    if (habit.goalId) {
      const linkedGoal = goals.find(g => g.id === habit.goalId);
      if (linkedGoal) {
        const goalCategory = GOAL_CATEGORIES.find(c => c.id === linkedGoal.category);
        return goalCategory?.name || 'Personal';
      }
    }
    
    // If no goal linked, use habit's own category
    if (habit.category) {
      const habitCategory = GOAL_CATEGORIES.find(c => c.id === habit.category);
      return habitCategory?.name || 'Personal';
    }
    
    // Fallback to 'Personal' if no category is set
    return 'Personal';
  };

  const formatTime = (habit: Habit) => {
    if (habit.scheduledTime) {
      const [hours, minutes] = habit.scheduledTime.split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${period}`;
    }
    
    // Default times based on habit type
    if (habit.name.toLowerCase().includes('morning') || habit.name.toLowerCase().includes('meditat')) return '7:00 AM';
    if (habit.name.toLowerCase().includes('evening') || habit.name.toLowerCase().includes('journal')) return '8:00 PM';
    return 'Anytime';
  };

  const getFrequencyDisplay = (habit: Habit) => {
    if (habit.frequency === 'daily') return 'Daily';
    if (habit.frequency === 'weekly') return 'Weekly';
    if (habit.frequency === 'custom' && habit.customFrequency) {
      return `${habit.customFrequency.times}x per ${habit.customFrequency.period}`;
    }
    return 'Custom';
  };

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔄</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Habits</h3>
        </div>
        <span className="text-sm font-medium text-green-600 dark:text-green-400">
          {completedHabits.length} of {todayHabits.length}
        </span>
      </div>

      <div className="space-y-3">
        {todayHabits.map(({ habit, isCompleted }) => (
          <div key={habit.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-green-100 dark:bg-gray-700 dark:border-gray-600">
            <button
              onClick={() => onHabitToggle(habit.id, today)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5 ${
                isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-green-300 hover:border-green-500'
              }`}
            >
              {isCompleted && (
                <span className="text-xs">✓</span>
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className={`font-medium text-gray-900 dark:text-white ${
                  isCompleted ? 'line-through opacity-60' : ''
                }`}>
                  {habit.name}
                </h4>
                <span className="text-xs text-green-600 dark:text-green-400 whitespace-nowrap">
                  {formatTime(habit)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md dark:bg-green-900/30 dark:text-green-300">
                  {getCategoryTag(habit)}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md dark:bg-gray-700 dark:text-gray-300">
                  {getFrequencyDisplay(habit)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}