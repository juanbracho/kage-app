import React from 'react';
import { Task } from '../types/task';

interface RecurringTaskDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onDeleteSingle: () => void;
  onDeleteAll: () => void;
}

export default function RecurringTaskDeleteModal({
  isOpen,
  onClose,
  task,
  onDeleteSingle,
  onDeleteAll
}: RecurringTaskDeleteModalProps) {
  if (!isOpen) return null;

  const taskType = task.isRecurring ? 'recurring task' : 'task instance';
  const taskIcon = task.isRecurring ? '🔄' : '📋';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🗑️</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Repetitive Task
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This is a {taskType}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{taskIcon}</span>
            <span className="text-gray-900 dark:text-white font-medium">{task.name}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Do you want to delete just this occurrence or all iterations of this task?
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              onDeleteSingle();
              onClose();
            }}
            className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Just this occurrence
          </button>
          
          <button
            onClick={() => {
              onDeleteAll();
              onClose();
            }}
            className="w-full p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
          >
            All iterations
          </button>
          
          <button
            onClick={onClose}
            className="w-full p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}