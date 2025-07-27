import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useHabitStore } from '../store/habitStore';
import { useSettingsStore } from '../store/settingsStore';
import { Habit } from '../types/habit';
import HabitCard from './HabitCard';
import HabitCreationModal from './HabitCreationModal';
import HabitDetailModal from './HabitDetailModal';
import HabitsEmpty from './HabitsEmpty';

interface HabitsPageProps {
  onNavigate: (tab: string) => void;
}

export default function HabitsPage({ onNavigate: _onNavigate }: HabitsPageProps) {
  const { habits } = useHabitStore();
  const { isLoading: settingsLoading } = useSettingsStore();
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isPageReady, setIsPageReady] = useState(false);
  
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

  // Ensure page is ready before rendering content
  useEffect(() => {
    // Small delay to ensure CSS variables and store hydration are complete
    const timer = setTimeout(() => {
      setIsPageReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Show loading state while page is initializing
  if (!isPageReady || settingsLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
          <div className="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 h-24"></div>
          ))}
        </div>
      </div>
    );
  }

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
    <div className="space-y-6">
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