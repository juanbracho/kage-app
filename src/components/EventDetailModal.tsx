import { useState, useEffect } from 'react';
import { CalendarEvent } from '../types/calendar';
import { X, Clock, Calendar, Edit2, Check, Trash2, Loader2 } from 'lucide-react';
import { useModalSwipe } from '../hooks/useSwipeGesture';

interface EventDetailModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete?: (eventId: string) => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
}

export default function EventDetailModal({
  event,
  isOpen,
  onClose,
  onToggleComplete,
  onEdit,
  onDelete
}: EventDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEvent, setEditedEvent] = useState<CalendarEvent | null>(null);
  const [localEvent, setLocalEvent] = useState<CalendarEvent | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync local state with prop changes using useEffect
  useEffect(() => {
    if (event && isOpen) {
      setLocalEvent(event);
      setIsEditing(false);
      setEditedEvent(null);
      setShowDeleteConfirm(false);
      setIsDeleting(false);
    }
  }, [event, isOpen]);

  // Always call the swipe hook before any early returns
  const swipeHandlers = useModalSwipe(onClose, !isOpen);

  if (!isOpen || !localEvent) return null;

  const handleEdit = () => {
    setEditedEvent({ ...localEvent });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedEvent && onEdit) {
      onEdit(editedEvent);
      setIsEditing(false);
      onClose();
    }
  };

  const handleToggleComplete = () => {
    if (onToggleComplete) {
      onToggleComplete(localEvent.id);
      // Update local state immediately for UI responsiveness
      setLocalEvent(prev => prev ? { ...prev, completed: !prev.completed } : null);
    }
  };

  const handleDeleteClick = () => {
    console.log('🗑️ Delete button clicked for event:', localEvent?.id);
    
    // Defensive check - ensure we have a valid event
    if (!localEvent || !localEvent.id) {
      console.log('❌ No valid event to delete');
      return;
    }
    
    // Defensive check - ensure we're not already in delete confirmation state
    if (showDeleteConfirm) {
      console.log('⚠️ Delete confirmation already showing, ignoring duplicate click');
      return;
    }
    
    setShowDeleteConfirm(true);
    console.log('🗑️ Delete confirmation modal should now be visible');
  };

  const handleDeleteConfirm = () => {
    console.log('🗑️ Delete confirmed for event:', localEvent?.id);
    
    // Defensive checks before proceeding with deletion
    if (!localEvent || !localEvent.id) {
      console.log('❌ No valid event to delete in confirmation');
      setShowDeleteConfirm(false);
      return;
    }
    
    if (!onDelete) {
      console.log('❌ onDelete function not available');
      setShowDeleteConfirm(false);
      return;
    }
    
    // Defensive check - ensure we're in the correct state
    if (!showDeleteConfirm) {
      console.log('⚠️ Delete confirmation not showing, unexpected state');
      return;
    }
    
    try {
      setIsDeleting(true);
      console.log('🗑️ Calling onDelete function');
      onDelete(localEvent.id);
      console.log('🗑️ Delete function called successfully');
      
      // Small delay to show the loading state
      setTimeout(() => {
        console.log('🗑️ Closing modals');
        setIsDeleting(false);
        setShowDeleteConfirm(false);
        onClose();
      }, 300);
    } catch (error) {
      console.error('❌ Error during delete operation:', error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    console.log('🗑️ Delete cancelled');
    
    // Defensive check - ensure we're actually in delete confirmation state
    if (!showDeleteConfirm) {
      console.log('⚠️ Delete cancel called but confirmation not showing');
      return;
    }
    
    setShowDeleteConfirm(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          {...swipeHandlers}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Event Details
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Event Icon and Title */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">{localEvent.icon}</span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedEvent?.title || ''}
                  onChange={(e) => setEditedEvent(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="flex-1 text-lg font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white"
                />
              ) : (
                <h3 className="flex-1 text-lg font-medium text-gray-900 dark:text-white">
                  {localEvent.title}
                </h3>
              )}
            </div>

            {/* Event Type */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span className="capitalize font-medium">{localEvent.type}</span>
              {localEvent.completed && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                  <Check size={12} />
                  Completed
                </span>
              )}
            </div>

            {/* Date and Time */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Calendar size={16} />
                {isEditing ? (
                  <input
                    type="date"
                    value={editedEvent?.date || ''}
                    onChange={(e) => setEditedEvent(prev => prev ? { ...prev, date: e.target.value } : null)}
                    className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white text-sm"
                  />
                ) : (
                  <span>{new Date(localEvent.date).toLocaleDateString()}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Clock size={16} />
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={editedEvent?.startTime || ''}
                      onChange={(e) => setEditedEvent(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white text-sm"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={editedEvent?.endTime || ''}
                      onChange={(e) => setEditedEvent(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                      className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                ) : (
                  <span>{localEvent.startTime} - {localEvent.endTime}</span>
                )}
              </div>
            </div>

            {/* Description */}
            {localEvent.description && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                {isEditing ? (
                  <textarea
                    value={editedEvent?.description || ''}
                    onChange={(e) => setEditedEvent(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={3}
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white resize-none"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-300">{localEvent.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {isEditing ? (
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 accent-bg-500 hover:accent-bg-600 text-white rounded-lg transition-colors font-medium"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    if (onEdit) {
                      onEdit(localEvent);
                    } else {
                      handleEdit();
                    }
                  }}
                  className="flex items-center justify-center w-12 h-12 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={handleToggleComplete}
                  className={`flex items-center justify-center w-12 h-12 rounded-lg transition-colors ${
                    localEvent.completed
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  <Check size={20} />
                </button>
                {onDelete && (
                  <button
                    onClick={handleDeleteClick}
                    disabled={showDeleteConfirm || isDeleting}
                    className="flex items-center justify-center w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            console.log('🗑️ Delete confirmation backdrop clicked');
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 border-2 border-red-200 dark:border-red-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Event
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
              Are you sure you want to delete "<strong>{localEvent?.title}</strong>"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Event'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}