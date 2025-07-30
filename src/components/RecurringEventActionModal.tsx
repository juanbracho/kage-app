import React from 'react';
import { CalendarEvent } from '../types/calendar';

interface RecurringEventActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent;
  actionType: 'delete' | 'complete';
  onSingleAction: () => void;
  onSeriesAction: () => void;
}

export default function RecurringEventActionModal({
  isOpen,
  onClose,
  event,
  actionType,
  onSingleAction,
  onSeriesAction
}: RecurringEventActionModalProps) {
  if (!isOpen) return null;

  const actionText = actionType === 'delete' ? 'delete' : 'mark as complete';
  const actionIcon = actionType === 'delete' ? '🗑️' : '✅';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-sm mx-4 border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{actionIcon}</span>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {actionType === 'delete' ? 'Delete Event' : 'Complete Event'}
            </h3>
            <p className="text-sm text-gray-400">
              This is a recurring event
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{event.icon}</span>
            <span className="text-white font-medium">{event.title}</span>
          </div>
          <p className="text-sm text-gray-400">
            Do you want to {actionText} just this occurrence or the entire series?
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              onSingleAction();
              onClose();
            }}
            className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Just this occurrence
          </button>
          
          <button
            onClick={() => {
              onSeriesAction();
              onClose();
            }}
            className={`w-full p-3 text-white rounded-lg font-medium transition-colors ${
              actionType === 'delete' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            Entire series
          </button>
          
          <button
            onClick={onClose}
            className="w-full p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}