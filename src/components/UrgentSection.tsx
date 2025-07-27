import { Task } from '../types/task';

interface UrgentSectionProps {
  urgentTasks: Task[];
  onTaskToggle: (taskId: string) => void;
}

export default function UrgentSection({ urgentTasks, onTaskToggle }: UrgentSectionProps) {
  if (urgentTasks.length === 0) {
    return null;
  }

  const getCategoryTag = (task: Task) => {
    // Map task properties to category tags
    if (task.tags.includes('work') || task.tags.includes('career')) return 'Career';
    if (task.tags.includes('health') || task.tags.includes('fitness')) return 'Health';
    if (task.tags.includes('personal')) return 'Personal';
    if (task.tags.includes('life')) return 'Life';
    return 'General';
  };

  const getTaskStatus = (task: Task) => {
    if (!task.dueDate) return 'No due date';
    
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const isToday = dueDate.toDateString() === today.toDateString();
    const isOverdue = dueDate < today && !isToday;
    
    if (isOverdue) return 'Overdue';
    if (isToday) return 'Due today';
    return 'Due soon';
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Urgent</h3>
        </div>
        <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
          {urgentTasks.length} item{urgentTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {urgentTasks.map(task => (
          <div key={task.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-orange-100 dark:bg-gray-700 dark:border-gray-600">
            <button
              onClick={() => onTaskToggle(task.id)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-0.5 ${
                task.status === 'completed'
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'border-orange-300 hover:border-orange-500'
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
                <span className="text-xs text-orange-600 dark:text-orange-400 whitespace-nowrap">
                  {getTaskStatus(task)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-md dark:bg-orange-900/30 dark:text-orange-300">
                  {getCategoryTag(task)}
                </span>
                {task.priority === 'urgent' && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md dark:bg-red-900/30 dark:text-red-300">
                    Urgent
                  </span>
                )}
                {task.priority === 'high' && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-md dark:bg-yellow-900/30 dark:text-yellow-300">
                    High
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}