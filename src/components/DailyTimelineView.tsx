import React, { useState, useMemo } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import { useTaskStore } from '../store/taskStore';
import { useHabitStore } from '../store/habitStore';
import { useSettingsStore } from '../store/settingsStore';
import { CalendarEvent } from '../types/calendar';
import { Task } from '../types/task';
import { Habit } from '../types/habit';
import TimeBlockModal from './TimeBlockModal';
import CalendarQuickAddModal from './CalendarQuickAddModal';
import RecurringEventActionModal from './RecurringEventActionModal';
import { useCalendarEventGestures } from '../hooks/useCalendarEventGestures';
import { getAccentColorValue } from '../utils/accentColors';

interface TimeSlot {
  hour: number;
  displayTime: string;
  events: CalendarEvent[];
  isEmpty: boolean;
}

interface DailyTimelineViewProps {
  selectedDate: Date;
  onEventClick?: (event: CalendarEvent) => void;
  onEmptySlotClick?: (hour: number, date: Date) => void;
}

export default function DailyTimelineView({ 
  selectedDate, 
  onEventClick, 
  onEmptySlotClick 
}: DailyTimelineViewProps) {
  const { 
    timeBlocks, 
    getEventsForDate, 
    toggleTimeBlockCompletion, 
    deleteTimeBlock,
    isRecurringEvent,
    getOriginalEventId,
    toggleSingleRecurringCompletion,
    toggleRecurringSeriesCompletion,
    deleteSingleRecurringEvent,
    deleteRecurringSeries,
    navigatePrevious,
    navigateNext,
    setCurrentDate
  } = useCalendarStore();
  const { tasks } = useTaskStore();
  const { habits } = useHabitStore();
  const { getAccentColor } = useSettingsStore();
  
  const currentAccentColor = getAccentColorValue(getAccentColor());
  
  // Helper function to convert hex to rgb for hover effects
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddTime, setQuickAddTime] = useState<{ hour: number; date: Date } | null>(null);
  const [showTimeBlockModal, setShowTimeBlockModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [recurringAction, setRecurringAction] = useState<{ event: CalendarEvent; type: 'delete' | 'complete' } | null>(null);
  const [undoAction, setUndoAction] = useState<{ type: 'delete' | 'complete'; event: CalendarEvent; timeoutId: NodeJS.Timeout } | null>(null);

  // Generate time slots from 6 AM to 10 PM
  const timeSlots: TimeSlot[] = useMemo(() => {
    const slots: TimeSlot[] = [];
    const events = getEventsForDate(selectedDate);
    
    console.log('📅 Regenerating timeSlots, events:', events.length, 'timeBlocks:', timeBlocks.length);
    
    for (let hour = 6; hour <= 22; hour++) {
      const displayTime = hour === 12 ? '12 PM' : 
                         hour > 12 ? `${hour - 12} PM` : 
                         hour === 0 ? '12 AM' : `${hour} AM`;
      
      // Filter events for this hour - show events only at their starting hour
      const hourEvents = events.filter(event => {
        const eventStartHour = parseInt(event.startTime.split(':')[0]);
        
        // Only include events that START in this hour (no duplicates)
        return eventStartHour === hour;
      });
      
      const isEmpty = hourEvents.length === 0;
      
      slots.push({
        hour,
        displayTime,
        events: hourEvents,
        isEmpty
      });
      
    }
    
    return slots;
  }, [selectedDate, timeBlocks, getEventsForDate]);

  // Get current time for "Now" indicator
  const currentHour = new Date().getHours();
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const handleEventCompletion = (event: CalendarEvent) => {
    const eventId = event.linkedId || event.id;
    
    console.log('🎯 Handling completion for event:', event.title, 'ID:', eventId, 'Current completed:', event.completed);
    
    if (isRecurringEvent(eventId)) {
      setRecurringAction({ event, type: 'complete' });
      setShowRecurringModal(true);
    } else {
      toggleTimeBlockCompletion(eventId);
      console.log('🎯 Called toggleTimeBlockCompletion for ID:', eventId);
    }
  };

  const handleEventDeletion = (event: CalendarEvent) => {
    const eventId = event.linkedId || event.id;
    
    if (isRecurringEvent(eventId)) {
      setRecurringAction({ event, type: 'delete' });
      setShowRecurringModal(true);
    } else {
      deleteTimeBlock(eventId);
      
      // Show undo option for deletion only
      const timeoutId = setTimeout(() => setUndoAction(null), 5000);
      setUndoAction({ type: 'delete', event, timeoutId });
    }
  };
  
  const handleUndo = () => {
    if (!undoAction) return;
    
    if (undoAction.type === 'delete') {
      // Re-add the deleted event (simplified - in real implementation would restore full event)
      console.log('Undo delete:', undoAction.event.title);
    }
    // Removed undo for completion - only handle deletion undo
    
    clearTimeout(undoAction.timeoutId);
    setUndoAction(null);
  };

  // Gesture handlers for calendar events
  const eventGestures = useCalendarEventGestures({
    onTap: handleEventCompletion,
    onLongPress: (event: CalendarEvent) => {
      // Open edit modal (TimeBlockModal)
      setEditingEvent(event);
      setShowTimeBlockModal(true);
    },
    onSwipeLeft: handleEventDeletion
  });

  const handleEmptySlotClick = (hour: number) => {
    setQuickAddTime({ hour, date: selectedDate });
    setShowQuickAddModal(true);
    onEmptySlotClick?.(hour, selectedDate);
  };

  const getEventTypeColor = (event: CalendarEvent) => {
    if (event.type === 'habit') return '#34C759';
    if (event.type === 'task') return '#007AFF';
    return event.color || currentAccentColor;
  };

  const getEventTypeClass = (event: CalendarEvent) => {
    if (event.type === 'habit') return 'habit';
    if (event.type === 'task') return 'task';
    return '';
  };


  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Compact Date Header with Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              navigatePrevious();
            }}
            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-md flex items-center justify-center text-gray-300 transition-colors"
          >
            ‹
          </button>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric'
              })}
            </h2>
            <p className="text-sm text-gray-400">
              {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => {
              navigateNext();
            }}
            className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-md flex items-center justify-center text-gray-300 transition-colors"
          >
            ›
          </button>
        </div>
        <button
          onClick={() => {
            setCurrentDate(new Date());
          }}
          className="px-3 py-1.5 text-white text-sm font-medium rounded-md transition-colors"
          style={{ backgroundColor: currentAccentColor }}
          onMouseEnter={(e) => {
            const rgb = hexToRgb(currentAccentColor);
            if (rgb) {
              e.currentTarget.style.backgroundColor = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = currentAccentColor;
          }}
        >
          Today
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 py-2">
          {timeSlots.map((slot) => (
            <div 
              key={slot.hour}
              className={`flex items-start mb-3 min-h-[70px] relative transition-all duration-200 ${
                isToday && slot.hour === currentHour ? 'current-time bg-gradient-to-r from-transparent via-blue-500/5 to-transparent' : ''
              }`}
            >
              {/* Enhanced Time Label */}
              <div className="min-w-[65px] pt-2">
                <span className={`text-sm font-semibold transition-colors ${
                  isToday && slot.hour === currentHour 
                    ? 'text-blue-400' 
                    : !slot.isEmpty 
                      ? 'text-gray-300' 
                      : 'text-gray-500'
                }`}>
                  {slot.displayTime}
                </span>
              </div>

              {/* Simplified Timeline System */}
              <div className="flex flex-col items-center mx-4 -mt-1">
                {/* Timeline Dot */}
                <div 
                  className={`relative w-4 h-4 rounded-full transition-all duration-200 ${
                    slot.isEmpty 
                      ? 'border-2 border-gray-600 bg-gray-800' 
                      : 'border-2 shadow-lg'
                  }`}
                  style={!slot.isEmpty ? {
                    borderColor: currentAccentColor,
                    backgroundColor: currentAccentColor,
                    boxShadow: `0 0 12px ${currentAccentColor}40, 0 2px 4px rgba(0,0,0,0.2)`
                  } : {}}
                >
                  {/* Inner glow for active dots */}
                  {!slot.isEmpty && (
                    <div 
                      className="absolute inset-0.5 rounded-full opacity-60"
                      style={{ backgroundColor: 'white' }}
                    />
                  )}
                </div>
                
                {/* Timeline Line Below Dot */}
                <div 
                  className={`w-1 flex-1 min-h-[60px] transition-all duration-200 ${
                    slot.isEmpty ? 'bg-gray-700' : ''
                  }`}
                  style={!slot.isEmpty ? {
                    background: `linear-gradient(180deg, ${currentAccentColor} 0%, ${currentAccentColor}40 100%)`,
                    boxShadow: `0 0 4px ${currentAccentColor}30`
                  } : {}}
                />
              </div>

              {/* Content Area */}
              <div className="flex-1 pt-0">
                {slot.isEmpty ? (
                  <button
                    onClick={() => handleEmptySlotClick(slot.hour)}
                    className="group w-full p-4 border-2 border-dashed border-gray-600 rounded-xl text-gray-500 text-sm transition-all duration-200 touch-manipulation hover:border-solid hover:scale-[1.02] hover:shadow-md hover:bg-opacity-5"
                    style={{
                      '--hover-border-color': currentAccentColor,
                      '--hover-text-color': currentAccentColor
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = currentAccentColor;
                      e.currentTarget.style.color = currentAccentColor;
                      e.currentTarget.style.backgroundColor = currentAccentColor + '08';
                      e.currentTarget.style.boxShadow = `0 4px 12px ${currentAccentColor}20`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '';
                      e.currentTarget.style.color = '';
                      e.currentTarget.style.backgroundColor = '';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="transition-transform group-hover:scale-110">✨</span>
                      <span className="font-medium">Tap to add</span>
                    </div>
                  </button>
                ) : (
                  <div className="space-y-2">
                    {/* Show unique events with consistent styling */}
                    {Array.from(new Set(slot.events.map(e => e.id))).map(eventId => {
                      const event = slot.events.find(e => e.id === eventId)!;
                      const eventStartHour = parseInt(event.startTime.split(':')[0]);
                      const eventEndHour = parseInt(event.endTime.split(':')[0]);
                      const eventEndMinutes = parseInt(event.endTime.split(':')[1]);
                      const isEventStarting = eventStartHour === slot.hour;
                      
                      // Calculate total duration for display
                      let durationHours = eventEndHour - eventStartHour;
                      if (eventEndMinutes > 0) {
                        durationHours += eventEndMinutes / 60;
                      }
                      
                      // Only apply gestures to the starting hour to avoid duplication
                      const gestureProps = isEventStarting ? eventGestures.getEventHandlers(event) : {};
                      
                      return (
                        <div
                          key={`${event.id}-${slot.hour}`}
                          {...gestureProps}
                          className={`w-full text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg touch-manipulation cursor-pointer select-none relative ${
                            event.completed ? 'opacity-60' : ''
                          } ${getEventTypeClass(event)} p-4 rounded-xl shadow-md border border-opacity-20`}
                          style={{ 
                            background: `linear-gradient(135deg, ${getEventTypeColor(event)}25, ${getEventTypeColor(event)}15)`,
                            backdropFilter: 'blur(10px)',
                            borderColor: getEventTypeColor(event),
                            color: 'white',
                            boxShadow: `0 4px 12px ${getEventTypeColor(event)}20`,
                            // Enhanced height for multi-hour events
                            minHeight: durationHours > 1 ? `${Math.min(durationHours * 60, 200)}px` : 'auto'
                          }}
                        >
                          {/* Duration indicator bar for multi-hour events */}
                          {durationHours > 1 && (
                            <div 
                              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                              style={{ 
                                backgroundColor: getEventTypeColor(event),
                                boxShadow: `0 0 8px ${getEventTypeColor(event)}60`
                              }}
                            />
                          )}
                          {/* Consistent event layout for all multi-hour blocks */}
                          <div className="flex items-start gap-3">
                            <div 
                              className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-sm transition-all duration-200"
                              style={{ 
                                backgroundColor: getEventTypeColor(event) + '30',
                                border: `1px solid ${getEventTypeColor(event)}40`
                              }}
                            >
                              {event.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-semibold text-base leading-tight transition-all duration-200 ${event.completed ? 'line-through' : ''}`}>
                                {event.completed && <span className="mr-2 text-green-400">✅</span>}
                                {event.title}
                              </div>
                              {event.description && (
                                <div className="text-sm opacity-85 mt-1.5 leading-relaxed">
                                  {event.description}
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs opacity-70 mt-2">
                                <span className="bg-black bg-opacity-20 px-2 py-1 rounded-md font-medium">
                                  {event.startTime} - {event.endTime}
                                </span>
                                {durationHours > 1 && (
                                  <span 
                                    className="px-2 py-1 rounded-md font-bold text-white text-xs"
                                    style={{ 
                                      backgroundColor: getEventTypeColor(event),
                                      boxShadow: `0 2px 4px ${getEventTypeColor(event)}40`
                                    }}
                                  >
                                    ⏱️ {Math.round(durationHours * 10) / 10}h
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Current Time Indicator */}
              {isToday && slot.hour === currentHour && (
                <div className="absolute right-4 top-2">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                    Now
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Time Block Edit Modal */}
      {editingEvent && (
        <TimeBlockModal
          isOpen={showTimeBlockModal}
          onClose={() => {
            setShowTimeBlockModal(false);
            setEditingEvent(null);
          }}
          editingTimeBlock={timeBlocks.find(block => block.id === (editingEvent.linkedId || editingEvent.id))}
        />
      )}

      {/* Recurring Event Action Modal */}
      {recurringAction && (
        <RecurringEventActionModal
          isOpen={showRecurringModal}
          onClose={() => {
            setShowRecurringModal(false);
            setRecurringAction(null);
          }}
          event={recurringAction.event}
          actionType={recurringAction.type}
          onSingleAction={() => {
            const eventId = recurringAction.event.linkedId || recurringAction.event.id;
            if (recurringAction.type === 'delete') {
              deleteSingleRecurringEvent(eventId);
            } else {
              toggleSingleRecurringCompletion(eventId);
            }
          }}
          onSeriesAction={() => {
            const eventId = recurringAction.event.linkedId || recurringAction.event.id;
            const originalId = getOriginalEventId(eventId);
            if (originalId) {
              if (recurringAction.type === 'delete') {
                deleteRecurringSeries(originalId);
              } else {
                const newCompletedState = !recurringAction.event.completed;
                toggleRecurringSeriesCompletion(originalId, newCompletedState);
              }
            }
          }}
        />
      )}

      {/* Quick Add Modal */}
      {quickAddTime && (
        <CalendarQuickAddModal
          isOpen={showQuickAddModal}
          onClose={() => {
            setShowQuickAddModal(false);
            setQuickAddTime(null);
          }}
          selectedTime={`${quickAddTime.hour.toString().padStart(2, '0')}:00`}
          selectedDate={quickAddTime.date}
        />
      )}
      
      {/* Undo Toast - Only for deletions */}
      {undoAction && undoAction.type === 'delete' && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
            <span className="text-sm">
              Event deleted
            </span>
            <button
              onClick={handleUndo}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium ml-4"
            >
              Undo
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}