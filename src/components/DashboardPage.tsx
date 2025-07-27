import { useDashboardStore } from '../store/dashboardStore';
import { useTaskStore } from '../store/taskStore';
import { useHabitStore } from '../store/habitStore';
import DashboardEmpty from './DashboardEmpty';
import QuickActionsRow from './QuickActionsRow';
import TodaysFocus from './TodaysFocus';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { 
    hasAnyData, 
    getGreeting, 
    getCurrentDate,
    getUrgentTasks,
    getTodayTasks,
    getTodayHabits
  } = useDashboardStore();
  
  const { toggleTask } = useTaskStore();
  const { toggleDayCompletion } = useHabitStore();
  
  // If no data exists, show empty state
  if (!hasAnyData()) {
    return <DashboardEmpty onNavigate={onNavigate} />;
  }
  
  // Get dashboard data
  const greeting = getGreeting();
  const currentDate = getCurrentDate();
  const urgentTasks = getUrgentTasks();
  const todayTasks = getTodayTasks();
  const todayHabits = getTodayHabits();

  const handleTaskToggle = (taskId: string) => {
    toggleTask(taskId);
  };

  const handleHabitToggle = (habitId: string, date: string) => {
    toggleDayCompletion(habitId, date);
  };
  
  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting}</h1>
        <p className="text-gray-600 dark:text-gray-300">{currentDate}</p>
      </div>
      
      {/* Quick Actions Row */}
      <QuickActionsRow onNavigate={onNavigate} />
      
      {/* Today's Focus */}
      <TodaysFocus 
        urgentTasks={urgentTasks}
        todayTasks={todayTasks}
        todayHabits={todayHabits}
        onTaskToggle={handleTaskToggle}
        onHabitToggle={handleHabitToggle}
      />
    </div>
  );
}