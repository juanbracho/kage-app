import { useState, useEffect } from 'react';
import { X, Clock, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useModalSwipe } from '../hooks/useSwipeGesture';

interface TemporaryTask {
  id: string;
  name: string;
  description?: string;
  type: 'standard' | 'to-buy' | 'deadline';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface TaskCreationMiniModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<TemporaryTask, 'id'>) => void;
  editingTask?: TemporaryTask;
  goalColor?: string;
}

type TaskType = 'standard' | 'to-buy' | 'deadline';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

export default function TaskCreationMiniModal({
  isOpen,
  onClose,
  onSave,
  editingTask,
  goalColor = '#FF7101'
}: TaskCreationMiniModalProps) {
  const [taskType, setTaskType] = useState<TaskType>('standard');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'standard' as TaskType,
    priority: 'medium' as Priority
  });

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        setTaskType(editingTask.type || 'standard');
        setFormData({
          name: editingTask.name,
          description: editingTask.description || '',
          type: editingTask.type || 'standard',
          priority: editingTask.priority || 'medium'
        });
      } else {
        setTaskType('standard');
        setFormData({
          name: '',
          description: '',
          type: 'standard',
          priority: 'medium'
        });
      }
    }
  }, [isOpen, editingTask, goalColor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSave({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      type: taskType,
      priority: formData.priority
    });

    onClose();
  };

  const handleClose = () => {
    setTaskType('standard');
    setFormData({
      name: '',
      description: '',
      type: 'standard',
      priority: 'medium'
    });
    onClose();
  };

  const swipeHandlers = useModalSwipe(handleClose, !isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div {...swipeHandlers} className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {editingTask ? 'Edit Task' : 'Add Task'}
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Task Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Task Type</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'standard', label: 'Standard', icon: Clock, color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' },
                { id: 'to-buy', label: 'To-Buy', icon: ShoppingCart, color: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300' },
                { id: 'deadline', label: 'Deadline', icon: AlertTriangle, color: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' }
              ].map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setTaskType(type.id as TaskType)}
                    className={`p-2 rounded-lg border-2 transition-all text-center flex flex-col justify-center items-center ${
                      taskType === type.id
                        ? `${type.color} border-opacity-100`
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-xs font-medium">{type.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Task Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus-accent-border transition-colors"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details..."
              rows={2}
              className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus-accent-border transition-colors resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'low', label: 'Low', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200' },
                { id: 'medium', label: 'Medium', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
                { id: 'high', label: 'High', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
                { id: 'urgent', label: 'Urgent', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' }
              ].map(priority => (
                <button
                  key={priority.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: priority.id as Priority }))}
                  className={`py-2 px-2 rounded-lg text-xs font-medium transition-all text-center ${
                    formData.priority === priority.id
                      ? `${priority.color} ring-2 ring-offset-1 accent-ring-300`
                      : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview</div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                {taskType === 'standard' && <Clock className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                {taskType === 'to-buy' && <ShoppingCart className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                {taskType === 'deadline' && <AlertTriangle className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {formData.name || 'Task name'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {taskType.charAt(0).toUpperCase() + taskType.slice(1)} · {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim()}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                formData.name.trim()
                  ? 'accent-bg-500 hover-accent-bg-dark text-white'
                  : 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {editingTask ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}