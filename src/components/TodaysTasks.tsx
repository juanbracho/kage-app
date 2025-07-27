import { Task } from '../types/task';

interface TodaysTasksProps {
  todayTasks: Task[];
  onTaskToggle: (taskId: string) => void;
}

export default function TodaysTasks({ todayTasks, onTaskToggle }: TodaysTasksProps) {
  if (todayTasks.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">✅</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Tasks</h3>
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">0 of 0</span>
        </div>
        
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-3xl mb-2">🎉</div>
          <p>No tasks scheduled for today!</p>
          <p className="text-sm mt-1">Enjoy your free time or add some tasks to stay productive.</p>
        </div>
      </div>
    );
  }

  const completedTasks = todayTasks.filter(task => task.status === 'completed');

  const getCategoryTag = (task: Task) => {
    // Map task properties to category tags
    if (task.tags.includes('work') || task.tags.includes('career')) return 'Career';
    if (task.tags.includes('health') || task.tags.includes('fitness')) return 'Health';
    if (task.tags.includes('personal')) return 'Personal';
    if (task.tags.includes('life')) return 'Life';
    return 'General';
  };

  const formatTime = (task: Task) => {
    if (task.reminderTime) {
      return new Date(task.reminderTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // Default times based on priority
    if (task.priority === 'high' || task.priority === 'urgent') return 'Morning';
    return 'Anytime';
  };

  const getTimeCategory = (task: Task) => {
    if (task.reminderTime) {
      const hour = new Date(task.reminderTime).getHours();
      if (hour < 12) return 'Morning';
      if (hour < 17) return 'Afternoon';
      return 'Evening';
    }
    return 'Anytime';
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">✅</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Tasks</h3>
        </div>
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {completedTasks.length} of {todayTasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {todayTasks.map(task => (
          <div key={task.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100 dark:bg-gray-700 dark:border-gray-600">
            <button
              onClick={() => onTaskToggle(task.id)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5 ${
                task.status === 'completed'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-blue-300 hover:border-blue-500'
              }`}
            >
              {task.status === 'completed' && (
                <span className="text-xs">✓</span>
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className={`font-medium text-gray-900 dark:text-white ${
                  task.status === 'completed' ? 'line-through opacity-60' : ''
                }`}>
                  {task.name}
                </h4>
                <span className="text-xs text-blue-600 dark:text-blue-400 whitespace-nowrap">
                  {formatTime(task)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md dark:bg-blue-900/30 dark:text-blue-300">
                  {getCategoryTag(task)}
                </span>
                {task.estimatedTime && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md dark:bg-gray-700 dark:text-gray-300">
                    {task.estimatedTime}min
                  </span>
                )}
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md dark:bg-blue-900/30 dark:text-blue-300">
                  {getTimeCategory(task)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}