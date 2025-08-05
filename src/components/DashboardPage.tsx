import { useDashboardStore } from '../store/dashboardStore';
import { useTaskStore } from '../store/taskStore';
import { useHabitStore } from '../store/habitStore';
import DashboardEmpty from './DashboardEmpty';
import QuickActionsRow from './QuickActionsRow';
import TodaysFocus from './TodaysFocus';
import GroceryListCard from './GroceryListCard';

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
    getTodayHabits,
    getGroceryTasks
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
  const groceryTasks = getGroceryTasks();

  const handleTaskToggle = (taskId: string) => {
    toggleTask(taskId);
  };

  const handleHabitToggle = (habitId: string, date: string) => {
    toggleDayCompletion(habitId, date);
  };

  const handleGroceryTaskClick = (taskId: string) => {
    // Navigate to tasks page - the task modal will open automatically
    onNavigate('tasks');
  };

  const handleGroceryItemToggle = (taskId: string, itemIndex: number) => {
    // Toggle shopping item completion
    const { updateTask, tasks } = useTaskStore.getState();
    const task = tasks.find(t => t.id === taskId);
    if (task && task.shoppingItems && task.shoppingItems[itemIndex]) {
      const updatedShoppingItems = [...task.shoppingItems];
      updatedShoppingItems[itemIndex] = {
        ...updatedShoppingItems[itemIndex],
        completed: !updatedShoppingItems[itemIndex].completed
      };
      updateTask(taskId, { shoppingItems: updatedShoppingItems });
    }
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
      
      {/* Grocery Lists Card */}
      <GroceryListCard 
        groceryTasks={groceryTasks}
        onTaskClick={handleGroceryTaskClick}
        onItemToggle={handleGroceryItemToggle}
      />
      
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