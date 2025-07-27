import { Task } from '../types/task';
import { Habit } from '../types/habit';
import UrgentSection from './UrgentSection';
import TodaysTasks from './TodaysTasks';
import TodaysHabits from './TodaysHabits';

interface TodaysFocusProps {
  urgentTasks: Task[];
  todayTasks: Task[];
  todayHabits: Array<{
    habit: Habit;
    isCompleted: boolean;
  }>;
  onTaskToggle: (taskId: string) => void;
  onHabitToggle: (habitId: string, date: string) => void;
}

export default function TodaysFocus({ 
  urgentTasks, 
  todayTasks, 
  todayHabits, 
  onTaskToggle, 
  onHabitToggle 
}: TodaysFocusProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">🎯</span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Focus</h2>
      </div>

      <div className="space-y-4">
        {/* Urgent Section */}
        <UrgentSection 
          urgentTasks={urgentTasks}
          onTaskToggle={onTaskToggle}
        />

        {/* Today's Tasks Section */}
        <TodaysTasks 
          todayTasks={todayTasks}
          onTaskToggle={onTaskToggle}
        />

        {/* Today's Habits Section */}
        <TodaysHabits 
          todayHabits={todayHabits}
          onHabitToggle={onHabitToggle}
        />
      </div>
    </div>
  );
}