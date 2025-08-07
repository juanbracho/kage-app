import { useState } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import DailyTimelineView from './DailyTimelineView';
import TimeBlockModal from './TimeBlockModal';
import CalendarEmpty from './CalendarEmpty';

export default function CalendarPage() {
  const { 
    timeBlocks, 
    currentDate, 
    navigatePrevious, 
    navigateNext,
    setCurrentDate
  } = useCalendarStore();
  
  const [showModal, setShowModal] = useState(false);

  const formatPeriodText = (isMobile = false) => {
    if (isMobile) {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
    return currentDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const renderCurrentView = () => {
    return <DailyTimelineView selectedDate={currentDate} />;
  };

  // Show empty state if no time blocks exist
  if (timeBlocks.length === 0) {
    return (
      <>
        <CalendarEmpty onCreateTimeBlock={() => setShowModal(true)} />
        <TimeBlockModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="w-full px-2 py-3 lg:px-3 lg:py-4">
        {/* Header removed - now using DailyTimelineView's compact header */}

        {/* Calendar Content */}
        {renderCurrentView()}

        {/* Modal */}
        <TimeBlockModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
    </div>
  );
}