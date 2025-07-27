import { useState } from 'react';
import { ChevronDown, Plus, Edit, Trash2 } from 'lucide-react';

interface TemporaryTask {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
}

interface TemporaryHabit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
}

interface TaskHabitExpandableSectionProps {
  linkedTasks: TemporaryTask[];
  linkedHabits: TemporaryHabit[];
  onAddTask: () => void;
  onAddHabit: () => void;
  onEditTask: (task: TemporaryTask) => void;
  onEditHabit: (habit: TemporaryHabit) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

export default function TaskHabitExpandableSection({
  linkedTasks,
  linkedHabits,
  onAddTask,
  onAddHabit,
  onEditTask,
  onEditHabit,
  onDeleteTask,
  onDeleteHabit
}: TaskHabitExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalItems = linkedTasks.length + linkedHabits.length;

  return (
    <div className="mb-6">
      {/* Expandable Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
          isExpanded
            ? 'bg-gray-100 dark:bg-gray-800 accent-border-500 rounded-b-none'
            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📋</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">Tasks & Habits</span>
          {totalItems > 0 && (
            <span className="accent-bg-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              {totalItems}
            </span>
          )}
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`} 
        />
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="bg-gray-100 dark:bg-gray-800 border-2 border-t-0 accent-border-500 rounded-b-xl p-5 animate-slideDown">
          {/* Add Buttons */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={onAddTask}
              className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover-accent-border hover:bg-gray-200 dark:hover:bg-gray-700 transition-all group"
            >
              <Plus className="w-4 h-4 text-gray-400 group-hover:accent-text-500" />
              <span className="text-sm font-medium text-gray-400 group-hover:accent-text-500">
                Add Task
              </span>
            </button>
            <button
              onClick={onAddHabit}
              className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover-accent-border hover:bg-gray-200 dark:hover:bg-gray-700 transition-all group"
            >
              <Plus className="w-4 h-4 text-gray-400 group-hover:accent-text-500" />
              <span className="text-sm font-medium text-gray-400 group-hover:accent-text-500">
                Add Habit
              </span>
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {totalItems === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm">No tasks or habits added yet.</p>
                <p className="text-xs text-gray-500 mt-1">
                  Add tasks and habits to help achieve your goal!
                </p>
              </div>
            ) : (
              <>
                {/* Tasks */}
                {linkedTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-200 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: task.color }}
                    >
                      {task.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {task.name}
                      </div>
                      <div className="text-xs text-gray-400">Task</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditTask(task)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                      >
                        <Edit className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                      </button>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-red-600/20 hover:bg-red-600/30 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Habits */}
                {linkedHabits.map(habit => (
                  <div key={habit.id} className="flex items-center gap-3 p-3 bg-gray-700/50 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                      style={{ background: habit.color }}
                    >
                      {habit.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {habit.name}
                      </div>
                      <div className="text-xs text-gray-400">Habit</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditHabit(habit)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-600 hover:bg-gray-500 transition-colors"
                      >
                        <Edit className="w-3 h-3 text-gray-300" />
                      </button>
                      <button
                        onClick={() => onDeleteHabit(habit.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-red-600/20 hover:bg-red-600/30 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}