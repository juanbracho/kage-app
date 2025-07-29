import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import { useSettingsStore } from '../store/settingsStore';
import { Habit } from '../types/habit';
import HabitCard from './HabitCard';
import HabitCreationModal from './HabitCreationModal';
import HabitDetailModal from './HabitDetailModal';
import HabitsEmpty from './HabitsEmpty';
import { usePageCreationSwipe } from '../hooks/useSwipeGesture';

interface HabitsPageProps {
  onNavigate: (tab: string) => void;
}

export default function HabitsPage({ onNavigate: _onNavigate }: HabitsPageProps) {
  const { habits } = useHabitStore();
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  
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

  // Add swipe up to create habit gesture
  const creationSwipeHandlers = usePageCreationSwipe(handleCreateHabit);

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
      <div className="space-y-6">
        <HabitsEmpty onCreateHabit={handleCreateHabit} />
        {showCreationModal && (
          <HabitCreationModal 
            isOpen={showCreationModal}
            onClose={handleCloseCreationModal}
            editingHabit={editingHabit}
          />
        )}
      </div>
    );
  }

  return (
    <div {...creationSwipeHandlers} className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Habits</h1>
        <button
          onClick={handleCreateHabit}
          className="w-12 h-12 bg-gradient-to-r accent-gradient text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            onClick={() => handleHabitClick(habit.id)}
          />
        ))}
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