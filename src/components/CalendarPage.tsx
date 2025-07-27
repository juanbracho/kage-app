import { useState } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import { DayView, WeekView, MonthView } from './CalendarViews';
import TimeBlockModal from './TimeBlockModal';
import CalendarEmpty from './CalendarEmpty';

export default function CalendarPage() {
  const { 
    timeBlocks, 
    currentView, 
    currentDate, 
    setCurrentView, 
    navigatePrevious, 
    navigateNext 
  } = useCalendarStore();
  
  const [showModal, setShowModal] = useState(false);

  const formatPeriodText = (isMobile = false) => {
    switch (currentView) {
      case 'day':
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
      case 'week':
        const weekStart = getWeekStart(currentDate);
        const weekEnd = getWeekEnd(currentDate);
        if (isMobile) {
          return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { day: 'numeric' })}`;
        }
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'month':
        if (isMobile) {
          return currentDate.toLocaleDateString('en-US', { 
            month: 'short',
            year: 'numeric'
          });
        }
        return currentDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
      default:
        return '';
    }
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
    d.setDate(d.getDate() - day); // Go back to Sunday
    return d;
  };

  const getWeekEnd = (date: Date) => {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'day':
        return <DayView />;
      case 'week':
        return <WeekView />;
      case 'month':
        return <MonthView />;
      default:
        return <DayView />;
    }
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
    <div className="flex-1 bg-gray-900 min-h-screen">
      <div className="w-full px-2 py-3 lg:px-3 lg:py-4">
        {/* Header */}
        <div className="mb-4">
          {/* Desktop/Tablet Header */}
          <div className="hidden sm:flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={navigatePrevious}
                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-md flex items-center justify-center text-gray-300 transition-colors"
              >
                ‹
              </button>
              <button
                onClick={() => {
                  // Add navigation to today logic here if needed
                }}
                className="px-3 py-1.5 accent-bg-500 hover:accent-bg-600 text-white text-sm font-medium rounded-md transition-colors"
              >
                Today
              </button>
              <button
                onClick={navigateNext}
                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-md flex items-center justify-center text-gray-300 transition-colors"
              >
                ›
              </button>
              <h1 className="text-lg font-medium text-white ml-4">
                {formatPeriodText()}
              </h1>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-800 rounded-md overflow-hidden">
              {[
                { key: 'month', label: 'M' },
                { key: 'week', label: 'W' },
                { key: 'day', label: 'D' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setCurrentView(key as any)}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    currentView === key
                      ? 'accent-bg-500 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Header (≤640px) */}
          <div className="sm:hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={navigatePrevious}
                  className="w-7 h-7 bg-gray-800 hover:bg-gray-700 rounded-md flex items-center justify-center text-gray-300 transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={() => {
                    // Add navigation to today logic here if needed
                  }}
                  className="px-2 py-1 accent-bg-500 hover:accent-bg-600 text-white text-xs font-medium rounded-md transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={navigateNext}
                  className="w-7 h-7 bg-gray-800 hover:bg-gray-700 rounded-md flex items-center justify-center text-gray-300 transition-colors"
                >
                  ›
                </button>
              </div>

              {/* Mobile View Toggle */}
              <div className="flex bg-gray-800 rounded-md overflow-hidden">
                {[
                  { key: 'month', label: 'M' },
                  { key: 'week', label: 'W' },
                  { key: 'day', label: 'D' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setCurrentView(key as any)}
                    className={`px-3 py-1.5 text-xs font-medium transition-all ${
                      currentView === key
                        ? 'accent-bg-500 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Date */}
            <h1 className="text-base font-medium text-white text-center">
              {formatPeriodText(true)}
            </h1>
          </div>
        </div>

        {/* Calendar Content */}
        {renderCurrentView()}

        {/* Modal */}
        <TimeBlockModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
    </div>
  );
}