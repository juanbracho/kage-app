import { useState, useMemo } from 'react';
import { useCalendarStore } from '../store/calendarStore';
import { useGoalStore } from '../store/goalStore';
import { useTaskStore } from '../store/taskStore';
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
  
  const { goals } = useGoalStore();
  const { tasks } = useTaskStore();
  
  const [showModal, setShowModal] = useState(false);

  // Check if there are any calendar events (time blocks, milestones, or repetitive tasks)
  const hasAnyCalendarContent = useMemo(() => {
    // Check time blocks
    if (timeBlocks.length > 0) return true;
    
    // Check if there are any milestones with due dates
    const hasMilestones = goals.some(goal => 
      goal.milestones && goal.milestones.some(milestone => milestone.dueDate)
    );
    if (hasMilestones) return true;
    
    // Check if there are any repetitive tasks
    const hasRepetitiveTasks = tasks.some(task => 
      (task.isRecurring || task.originalTaskId) && task.dueDate
    );
    if (hasRepetitiveTasks) return true;
    
    return false;
  }, [timeBlocks.length, goals, tasks]);

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

  // Show empty state if no calendar content exists (time blocks, milestones, or repetitive tasks)
  if (!hasAnyCalendarContent) {
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