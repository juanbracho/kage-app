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

  // Separate all-day events from timed events
  const { allDayEvents, timedEvents } = useMemo(() => {
    const events = getEventsForDate(selectedDate);
    
    console.log('📅 Regenerating events for date:', selectedDate.toISOString().split('T')[0]);
    console.log('📅 Total events found:', events.length, 'Total timeBlocks in store:', timeBlocks.length);
    
    // Log details about each event for debugging
    events.forEach((event, index) => {
      console.log(`📅 Event ${index + 1}:`, {
        id: event.id,
        title: event.title,
        type: event.type,
        allDay: event.allDay,
        date: event.date,
        startTime: event.startTime,
        goalId: event.goalId,
        milestoneId: event.milestoneId
      });
    });
    
    const allDay = events.filter(event => {
      const isAllDay = event.allDay === true;
      const isMilestone = event.type === 'milestone';
      const isRepetitiveTask = event.type === 'repetitive-task';
      const shouldBeAllDay = isAllDay || isMilestone || isRepetitiveTask;
      
      console.log(`📅 Event "${event.title}" - allDay:${isAllDay}, milestone:${isMilestone}, repetitive:${isRepetitiveTask}, shouldBeAllDay:${shouldBeAllDay}`);
      
      return shouldBeAllDay;
    });
    
    const timed = events.filter(event => {
      const isNotAllDay = !event.allDay;
      const isNotMilestone = event.type !== 'milestone';
      const isNotRepetitiveTask = event.type !== 'repetitive-task';
      return isNotAllDay && isNotMilestone && isNotRepetitiveTask;
    });
    
    console.log('📅 All-day events:', allDay.length, 'Timed events:', timed.length);
    
    if (allDay.length > 0) {
      console.log('📅 All-day events details:', allDay.map(e => ({ title: e.title, type: e.type, allDay: e.allDay })));
    }
    
    return { allDayEvents: allDay, timedEvents: timed };
  }, [selectedDate, timeBlocks, getEventsForDate]);

  // Generate time slots from 6 AM to 10 PM for timed events
  const timeSlots: TimeSlot[] = useMemo(() => {
    const slots: TimeSlot[] = [];
    
    for (let hour = 6; hour <= 22; hour++) {
      const displayTime = hour === 12 ? '12 PM' : 
                         hour > 12 ? `${hour - 12} PM` : 
                         hour === 0 ? '12 AM' : `${hour} AM`;
      
      // Filter timed events for this hour - show events only at their starting hour
      const hourEvents = timedEvents.filter(event => {
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
  }, [timedEvents]);

  // Get current time for "Now" indicator
  const currentHour = new Date().getHours();
  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const handleEventCompletion = async (event: CalendarEvent) => {
    const eventId = event.linkedId || event.id;
    
    console.log('🎯 Handling completion for event:', event.title, 'ID:', eventId, 'Current completed:', event.completed, 'Type:', event.type);
    
    // Handle milestone completion differently
    if (event.type === 'milestone' && event.goalId && event.milestoneId) {
      try {
        const { useGoalStore } = await import('../store/goalStore');
        const goalStore = useGoalStore.getState();
        goalStore.toggleMilestoneCompletion(event.goalId, event.milestoneId);
        console.log('🎯 Milestone completion toggled:', event.title);
      } catch (error) {
        console.error('❌ Error toggling milestone completion:', error);
      }
    } else if (isRecurringEvent(eventId)) {
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
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Compact Date Header with Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              navigatePrevious();
            }}
            className="w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
          >
            ‹
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric'
              })}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isToday ? 'Today' : selectedDate.toLocaleDateString('en-US', { year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => {
              navigateNext();
            }}
            className="w-8 h-8 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors"
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

      {/* Debug Section - Remove after testing */}
      <div className="px-4 py-2 border-b border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-xs">
        <div className="text-yellow-800 dark:text-yellow-300 font-mono">
          Debug: Total events: {timedEvents.length + allDayEvents.length} | 
          Timed: {timedEvents.length} | 
          All-day: {allDayEvents.length} | 
          TimeBlocks in store: {timeBlocks.length}
        </div>
      </div>

      {/* All-Day Events Section */}
      {allDayEvents.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-current opacity-60"></span>
            All-Day Events ({allDayEvents.length})
          </h3>
          <div className="space-y-2">
            {allDayEvents.map((event) => (
              <div
                key={event.id}
                {...eventGestures}
                onMouseDown={() => eventGestures.onMouseDown?.(event)}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                  event.completed 
                    ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60' 
                    : 'bg-white dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                style={{
                  borderLeftWidth: '4px',
                  borderLeftColor: event.type === 'milestone' ? currentAccentColor : 
                                   event.type === 'repetitive-task' ? currentAccentColor : 
                                   event.color || currentAccentColor
                }}
              >
                {/* Completion Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventCompletion(event);
                  }}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    event.completed
                      ? 'text-white'
                      : 'border-gray-400 hover:border-gray-300'
                  }`}
                  style={event.completed ? {
                    backgroundColor: currentAccentColor,
                    borderColor: currentAccentColor
                  } : {}}
                >
                  {event.completed && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* Event Icon */}
                <div className="text-xl">{event.icon}</div>

                {/* Event Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${
                    event.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'
                  }`}>
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className={`text-sm truncate ${
                      event.completed ? 'text-gray-500 dark:text-gray-600' : 'text-gray-600 dark:text-gray-300'
                    }`}>
                      {event.description}
                    </p>
                  )}
                </div>

                {/* Event Type Badge */}
                <div 
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: `${currentAccentColor}20`,
                    color: currentAccentColor
                  }}
                >
                  {event.type === 'milestone' ? 'Milestone' : 
                   event.type === 'repetitive-task' ? 'Task' : 'Event'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                      ? 'text-gray-700 dark:text-gray-300' 
                      : 'text-gray-500 dark:text-gray-500'
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
                      ? 'border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800' 
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
                    slot.isEmpty ? 'bg-gray-300 dark:bg-gray-700' : ''
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
                    className="group w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-500 text-sm transition-all duration-200 touch-manipulation hover:border-solid hover:scale-[1.02] hover:shadow-md hover:bg-opacity-5"
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
                      const eventStartMinutes = parseInt(event.startTime.split(':')[1]);
                      
                      // Convert times to total minutes for accurate calculation
                      const startTotalMinutes = eventStartHour * 60 + eventStartMinutes;
                      const endTotalMinutes = eventEndHour * 60 + eventEndMinutes;
                      
                      // Calculate duration in hours
                      const durationHours = (endTotalMinutes - startTotalMinutes) / 60;
                      
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
          <div className="bg-gray-800 dark:bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
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