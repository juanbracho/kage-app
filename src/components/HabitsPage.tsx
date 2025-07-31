import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import { useSettingsStore } from '../store/settingsStore';
import { Habit } from '../types/habit';
import HabitRow from './HabitRow';
import HabitCreationModal from './HabitCreationModal';
import HabitDetailModal from './HabitDetailModal';
import HabitsEmpty from './HabitsEmpty';

interface HabitsPageProps {
  onNavigate: (tab: string) => void;
}

export default function HabitsPage({ onNavigate: _onNavigate }: HabitsPageProps) {
  const { habits } = useHabitStore();
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const handleHabitClick = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
      setSelectedHabit(habit);
      setShowDetailModal(true);
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowCreationModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedHabit(null);
  };

  const handleCloseCreationModal = () => {
    setShowCreationModal(false);
    setEditingHabit(null);
  };

  const handleCreateHabit = () => {
    setShowCreationModal(true);
  };



  // Listen for custom event to open habit modal from dashboard
  useEffect(() => {
    const handleOpenHabitModal = () => {
      handleCreateHabit();
    };

    window.addEventListener('openHabitModal', handleOpenHabitModal);
    return () => window.removeEventListener('openHabitModal', handleOpenHabitModal);
  }, []);


  // Show empty state if no habits
  if (habits.length === 0) {
    return (
      <>
        <HabitsEmpty onCreateHabit={handleCreateHabit} />
        {showCreationModal && (
          <HabitCreationModal 
            isOpen={showCreationModal}
            onClose={handleCloseCreationModal}
            editingHabit={editingHabit}
          />
        )}
      </>
    );
  }

  // Get 7-day window centered on selected date
  const getSevenDayWindow = () => {
    const days = [];
    const today = new Date();
    
    // Create 7-day window: 3 days before selected, selected day, 3 days after
    for (let i = -3; i <= 3; i++) {
      const day = new Date(selectedDate);
      day.setDate(selectedDate.getDate() + i);
      
      days.push({
        date: day,
        dayName: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][day.getDay()],
        dayNumber: day.getDate(),
        isToday: day.toDateString() === today.toDateString(),
        isSelected: day.toDateString() === selectedDate.toDateString()
      });
    }
    return days;
  };

  const getCurrentDateString = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    };
    return selectedDate.toLocaleDateString('en-US', options);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const sevenDayWindow = getSevenDayWindow();
  const currentDateString = getCurrentDateString();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Habits</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateHabit}
            className="accent-bg-500 hover-accent-bg-dark text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Habit
          </button>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="text-center">
        <div className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          {currentDateString}
        </div>
        
        {/* Scrollable 7-day calendar */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 justify-center min-w-max px-4">
            {sevenDayWindow.map((day, index) => (
              <div 
                key={index}
                className={`text-center py-2 px-3 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                  day.isSelected 
                    ? 'accent-bg-500 text-white' 
                    : day.isToday
                    ? 'accent-bg-100 accent-text-500 border border-current'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                } min-w-[48px]`}
                onClick={() => handleDayClick(day.date)}
              >
                <div>{day.dayName}</div>
                <div>{day.dayNumber}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Habits List Section */}
      <div>
        
        {/* Habits List */}
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              selectedDate={selectedDate}
              onClick={() => handleHabitClick(habit.id)}
            />
          ))}
        </div>
      </div>


      {/* Creation Modal */}
      {showCreationModal && (
        <HabitCreationModal 
          isOpen={showCreationModal}
          onClose={handleCloseCreationModal}
          editingHabit={editingHabit}
        />
      )}

      {/* Detail Modal */}
      <HabitDetailModal
        habit={selectedHabit}
        isOpen={showDetailModal}
        onClose={handleCloseDetailModal}
        onEdit={handleEditHabit}
      />

    </div>
  );
}