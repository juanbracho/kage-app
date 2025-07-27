import { useState } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import { CalendarEvent } from '../types/calendar';
import { useLongPress } from '../hooks/useLongPress';
import EventDetailModal from './EventDetailModal';
import TimeBlockModal from './TimeBlockModal';

interface EventItemProps {
  event: CalendarEvent;
  onClick?: () => void;
  onLongPress?: () => void;
}

function EventItem({ event, onClick, onLongPress }: EventItemProps) {
  const longPressHandlers = useLongPress({
    onLongPress: () => onLongPress?.(),
    onClick: () => onClick?.(),
    threshold: 500
  });

  return (
    <div
      {...longPressHandlers}
      className={`flex items-start gap-2 p-2 rounded text-sm font-medium cursor-pointer transition-all hover:scale-105 touch-manipulation h-full w-full select-none border ${
        event.completed ? 'opacity-60 line-through' : ''
      }`}
      style={{ 
        backgroundColor: event.color.includes('linear-gradient') 
          ? event.color.replace('linear-gradient(135deg, ', '').replace(')', '').split(', ')[0] + '30'
          : event.color + '30',
        color: event.color.includes('linear-gradient')
          ? event.color.replace('linear-gradient(135deg, ', '').replace(')', '').split(', ')[0]
          : event.color,
        borderColor: event.color.includes('linear-gradient')
          ? event.color.replace('linear-gradient(135deg, ', '').replace(')', '').split(', ')[0]
          : event.color
      }}
    >
      <span className="text-base">{event.icon}</span>
      <span className="truncate">{event.title}</span>
    </div>
  );
}

// Month Event Item Component
function MonthEventItem({ event, onClick, onLongPress }: EventItemProps) {
  const longPressHandlers = useLongPress({
    onLongPress: () => onLongPress?.(),
    onClick: () => onClick?.(),
    threshold: 500
  });

  return (
    <div
      {...longPressHandlers}
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={`text-xs p-1 rounded cursor-pointer truncate font-medium touch-manipulation ${
        event.completed ? 'opacity-60 line-through' : ''
      }`}
      style={{ 
        backgroundColor: event.color.includes('linear-gradient') 
          ? event.color.replace('linear-gradient(135deg, ', '').replace(')', '').split(', ')[0] + '20'
          : event.color + '20',
        color: event.color.includes('linear-gradient')
          ? event.color.replace('linear-gradient(135deg, ', '').replace(')', '').split(', ')[0]
          : event.color
      }}
    >
      {event.icon} {event.title}
    </div>
  );
}

// Day View Component
export function DayView() {
  const { currentDate, getDayViewData, toggleTimeBlockCompletion, deleteTimeBlock, updateTimeBlock } = useCalendarStore();
  const dayData = getDayViewData(currentDate);
  
  // Debug logging
  console.log('📅 DayView Debug:', {
    currentDate: currentDate.toISOString(),
    dayData: dayData,
    eventsCount: dayData.events.length,
    events: dayData.events.map(e => ({ title: e.title, startTime: e.startTime, date: e.date }))
  });

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === 'timeblock') {
      toggleTimeBlockCompletion(event.id);
    }
  };

  const handleEventLongPress = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setShowEventModal(false);
    setShowEditModal(false);
  };

  const handleOpenEditModal = () => {
    setShowEventModal(false);
    setShowEditModal(true);
  };

  const handleEmptySpaceLongPress = () => {
    setShowCreateModal(true);
  };

  const handleEventEdit = (editedEvent: CalendarEvent) => {
    // Calculate duration in minutes from start and end times
    const [startHour, startMinute] = editedEvent.startTime.split(':').map(Number);
    const [endHour, endMinute] = editedEvent.endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    // Create updates object with CalendarEvent data converted to TimeBlock format
    const updates = {
      title: editedEvent.title,
      description: editedEvent.description,
      date: editedEvent.date,
      startTime: editedEvent.startTime,
      durationMinutes: durationMinutes
    };

    // Update the time block in the store
    updateTimeBlock(editedEvent.id, updates);
  };

  const generateTimeSlots = () => {
    const slots = [];
    
    // First, collect all events and calculate their positions
    const eventPositions = dayData.events.map(event => {
      const startHour = parseInt(event.startTime.split(':')[0]);
      const startMinute = parseInt(event.startTime.split(':')[1]);
      const endHour = parseInt(event.endTime.split(':')[0]);
      const endMinute = parseInt(event.endTime.split(':')[1]);
      
      // Calculate total duration in minutes
      const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      const hourHeight = 60; // 60px per hour
      
      // Calculate position relative to the first hour slot (6 AM)
      const startHourIndex = startHour - 6; // 6 AM is our first hour
      const topOffset = startHourIndex * hourHeight + (startMinute / 60) * hourHeight;
      const height = (totalMinutes / 60) * hourHeight;
      
      return {
        event,
        top: topOffset,
        height: height,
        startHour
      };
    });

    for (let hour = 6; hour <= 22; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;

      const emptySpaceLongPress = useLongPress({
        onLongPress: handleEmptySpaceLongPress,
        threshold: 500
      });

      slots.push(
        <div key={hour} className="flex border-b border-gray-700 h-[60px] relative">
          <div className="w-16 sm:w-20 p-2 sm:p-3 text-xs text-gray-400 bg-gray-900 border-r border-gray-700 flex items-start shrink-0">
            {timeStr}
          </div>
          <div 
            {...emptySpaceLongPress}
            className="flex-1 relative bg-gray-800 cursor-pointer select-none"
          ></div>
        </div>
      );
    }
    
    return (
      <div className="relative">
        {slots}
        {/* Events positioned within the scrollable content */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="flex h-full">
            <div className="w-16 sm:w-20 shrink-0"></div>
            <div className="flex-1 relative overflow-hidden">
              {eventPositions.map(({ event, top, height }) => {
                // Calculate the total calendar height (17 hours * 60px = 1020px)
                const totalCalendarHeight = 17 * 60;
                
                // Ensure events don't extend beyond the visible calendar area
                const clampedTop = Math.max(0, Math.min(top, totalCalendarHeight - 36));
                const maxAllowedHeight = Math.min(height, totalCalendarHeight - clampedTop);
                const clampedHeight = Math.max(Math.min(maxAllowedHeight, height), 36);
                
                return (
                  <div 
                    key={event.id} 
                    className="absolute left-2 right-2 z-10 pointer-events-auto overflow-hidden"
                    style={{
                      top: `${clampedTop}px`,
                      height: `${clampedHeight}px`,
                      minHeight: '36px',
                      maxHeight: `${totalCalendarHeight - clampedTop}px`
                    }}
                  >
                    <EventItem 
                      event={event} 
                      onClick={() => handleEventClick(event)}
                      onLongPress={() => handleEventLongPress(event)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-gray-800 rounded-lg overflow-hidden h-[calc(100vh-200px)]">
        {/* Timeline */}
        <div className="h-full overflow-y-auto overflow-x-hidden">
          {generateTimeSlots()}
        </div>
      </div>
      
      <EventDetailModal
        event={selectedEvent}
        isOpen={showEventModal}
        onClose={handleCloseModal}
        onToggleComplete={toggleTimeBlockCompletion}
        onEdit={handleOpenEditModal}
        onDelete={(eventId) => {
          console.log('🗑️ CalendarViews: Delete request for event ID:', eventId);
          deleteTimeBlock(eventId);
          console.log('🗑️ CalendarViews: Delete completed, closing modal');
          handleCloseModal();
        }}
      />
      
      <TimeBlockModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />

      {/* Edit TimeBlockModal */}
      {selectedEvent && (
        <TimeBlockModal 
          isOpen={showEditModal} 
          onClose={handleCloseModal}
          prefilledDate={selectedEvent.date}
          prefilledTime={selectedEvent.startTime}
          editingTimeBlock={{
            id: selectedEvent.linkedId || selectedEvent.id,
            title: selectedEvent.title,
            description: selectedEvent.description,
            date: selectedEvent.date,
            startTime: selectedEvent.startTime,
            durationMinutes: (() => {
              const [startHour, startMinute] = selectedEvent.startTime.split(':').map(Number);
              const [endHour, endMinute] = selectedEvent.endTime.split(':').map(Number);
              const startTotalMinutes = startHour * 60 + startMinute;
              const endTotalMinutes = endHour * 60 + endMinute;
              return endTotalMinutes - startTotalMinutes;
            })()
          }}
        />
      )}
    </>
  );
}

// Week View Component
export function WeekView() {
  const { currentDate, getWeekViewData, toggleTimeBlockCompletion, navigateToDay, updateTimeBlock } = useCalendarStore();
  const weekData = getWeekViewData(currentDate);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Debug logging
  console.log('🗓️ WeekView Debug:', {
    currentDate: currentDate.toISOString(),
    weekData: weekData,
    daysCount: weekData.days.length,
    dayDates: weekData.days.map(d => ({ date: d.date, eventsCount: d.events.length }))
  });

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === 'timeblock') {
      toggleTimeBlockCompletion(event.id);
    }
  };

  const handleEventLongPress = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setShowEventModal(false);
    setShowEditModal(false);
  };

  const handleOpenEditModal = () => {
    setShowEventModal(false);
    setShowEditModal(true);
  };

  const handleEventEdit = (editedEvent: CalendarEvent) => {
    // Calculate duration in minutes from start and end times
    const [startHour, startMinute] = editedEvent.startTime.split(':').map(Number);
    const [endHour, endMinute] = editedEvent.endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    // Update the time block in the store
    if (editedEvent.linkedId) {
      updateTimeBlock(editedEvent.linkedId, {
        title: editedEvent.title,
        description: editedEvent.description,
        date: editedEvent.date,
        startTime: editedEvent.startTime,
        durationMinutes: durationMinutes
      });
    }
    
    handleCloseModal();
  };

  const handleDayHeaderClick = (dayDate: Date) => {
    navigateToDay(dayDate);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 17 }, (_, i) => i + 6); // All hours from 6:00 to 22:00 (6 AM to 10 PM)

  return (
    <>
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      {/* Week Header - Day Names and Numbers */}
      <div className="grid grid-cols-8 border-b border-gray-700">
        {/* Empty corner for time column */}
        <div className="h-16 bg-gray-800 border-r border-gray-700"></div>
        
        {/* Day Headers */}
        {weekData.days.map((day, index) => {
          // Parse the date string manually to avoid timezone issues
          const [year, month, dayNum] = day.date.split('-').map(Number);
          const dayDate = new Date(year, month - 1, dayNum); // month is 0-indexed
          const isToday = dayDate.toDateString() === new Date().toDateString();
          
          return (
            <div 
              key={day.date} 
              onClick={() => handleDayHeaderClick(dayDate)}
              className="h-16 bg-gray-800 border-r border-gray-700 last:border-r-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <div className="text-xs text-gray-400 mb-1">
                {dayNames[index]}
              </div>
              {isToday ? (
                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {dayDate.getDate()}
                </div>
              ) : (
                <div className="text-lg font-bold text-white">
                  {dayDate.getDate()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Week Grid - Time Slots */}
      <div className="max-h-[600px] overflow-y-auto">
        {hours.map(hour => (
          <div key={hour} className="grid grid-cols-8 border-b border-gray-700">
            {/* Time Column */}
            <div className="h-16 bg-gray-800 border-r border-gray-700 flex items-center justify-center text-xs text-gray-400">
              {hour.toString().padStart(2, '0')}:00
            </div>
            
            {/* Day Columns */}
            {weekData.days.map((day, dayIndex) => {
              // Get events for this day at this specific hour
              const eventsAtTime = day.events.filter(event => {
                const eventHour = parseInt(event.startTime.split(':')[0]);
                return eventHour === hour;
              });

              // Debug logging for first hour only to avoid spam
              if (hour === 6) {
                console.log(`📅 Day ${dayIndex} (${day.date}):`, {
                  date: day.date,
                  totalEvents: day.events.length,
                  events: day.events.map(e => ({ title: e.title, startTime: e.startTime, date: e.date }))
                });
              }
              
              return (
                <div key={`${day.date}-${hour}`} className="h-16 bg-gray-900 border-r border-gray-700 last:border-r-0 p-1 relative">
                  {eventsAtTime.map(event => (
                    <EventItem
                      key={event.id}
                      event={event}
                      onClick={() => handleEventClick(event)}
                      onLongPress={() => handleEventLongPress(event)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
    
    {/* Event Detail Modal */}
    {selectedEvent && (
      <EventDetailModal
        isOpen={showEventModal}
        onClose={handleCloseModal}
        event={selectedEvent}
        onEdit={handleOpenEditModal}
      />
    )}

    {/* Edit TimeBlockModal */}
    {selectedEvent && (
      <TimeBlockModal 
        isOpen={showEditModal} 
        onClose={handleCloseModal}
        prefilledDate={selectedEvent.date}
        prefilledTime={selectedEvent.startTime}
        editingTimeBlock={{
          id: selectedEvent.linkedId || selectedEvent.id,
          title: selectedEvent.title,
          description: selectedEvent.description,
          date: selectedEvent.date,
          startTime: selectedEvent.startTime,
          durationMinutes: (() => {
            const [startHour, startMinute] = selectedEvent.startTime.split(':').map(Number);
            const [endHour, endMinute] = selectedEvent.endTime.split(':').map(Number);
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;
            return endTotalMinutes - startTotalMinutes;
          })()
        }}
      />
    )}
    </>
  );
}

// Month View Component
export function MonthView() {
  const { currentDate, getMonthViewData, toggleTimeBlockCompletion, navigateToDay, updateTimeBlock } = useCalendarStore();
  const monthData = getMonthViewData(currentDate);
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === 'timeblock') {
      toggleTimeBlockCompletion(event.id);
    }
  };

  const handleEventLongPress = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setShowEventModal(false);
    setShowEditModal(false);
  };

  const handleOpenEditModal = () => {
    setShowEventModal(false);
    setShowEditModal(true);
  };

  const handleEventEdit = (editedEvent: CalendarEvent) => {
    // Calculate duration in minutes from start and end times
    const [startHour, startMinute] = editedEvent.startTime.split(':').map(Number);
    const [endHour, endMinute] = editedEvent.endTime.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    // Update the time block in the store
    if (editedEvent.linkedId) {
      updateTimeBlock(editedEvent.linkedId, {
        title: editedEvent.title,
        description: editedEvent.description,
        date: editedEvent.date,
        startTime: editedEvent.startTime,
        durationMinutes: durationMinutes
      });
    }
    
    handleCloseModal();
  };

  const handleDayClick = (date: string) => {
    // Parse the date string manually to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number);
    const dayDate = new Date(year, month - 1, day); // month is 0-indexed
    navigateToDay(dayDate);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Month Header */}
      <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        {dayNames.map(day => (
          <div key={day} className="p-2 sm:p-4 text-center text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-600">
        {monthData.days.map((day, index) => (
          <div
            key={`${day.date}-${index}`}
            onClick={() => handleDayClick(day.date)}
            className={`bg-white dark:bg-gray-800 min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              !day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500' : ''
            } ${day.isToday ? 'accent-bg-50 dark:accent-bg-900 border-2 accent-border-500' : ''}`}
          >
            <div className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${
              day.isToday ? 'accent-text-600 dark:accent-text-400' : day.isCurrentMonth ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
            }`}>
              {day.dayNumber}
            </div>
            
            <div className="space-y-1">
              {day.events.slice(0, 3).map(event => (
                <MonthEventItem
                  key={event.id}
                  event={event}
                  onClick={() => handleEventClick(event)}
                  onLongPress={() => handleEventLongPress(event)}
                />
              ))}
              {day.events.length > 3 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  +{day.events.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* Event Detail Modal */}
    {selectedEvent && (
      <EventDetailModal
        isOpen={showEventModal}
        onClose={handleCloseModal}
        event={selectedEvent}
        onEdit={handleOpenEditModal}
      />
    )}

    {/* Edit TimeBlockModal */}
    {selectedEvent && (
      <TimeBlockModal 
        isOpen={showEditModal} 
        onClose={handleCloseModal}
        prefilledDate={selectedEvent.date}
        prefilledTime={selectedEvent.startTime}
        editingTimeBlock={{
          id: selectedEvent.linkedId || selectedEvent.id,
          title: selectedEvent.title,
          description: selectedEvent.description,
          date: selectedEvent.date,
          startTime: selectedEvent.startTime,
          durationMinutes: (() => {
            const [startHour, startMinute] = selectedEvent.startTime.split(':').map(Number);
            const [endHour, endMinute] = selectedEvent.endTime.split(':').map(Number);
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;
            return endTotalMinutes - startTotalMinutes;
          })()
        }}
      />
    )}
    </>
  );
}