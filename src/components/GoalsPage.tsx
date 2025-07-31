import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useGoalStore } from '../store/goalStore';
import { Goal } from '../types/goal';
import GoalsEmpty from './GoalsEmpty';
import GoalCard from './GoalCard';
import GoalCreationModal from './GoalCreationModal';
import GoalDetail from './GoalDetail';


interface GoalsPageProps {
  onNavigate?: (tab: string) => void;
}

export default function GoalsPage({ onNavigate }: GoalsPageProps) {
  const {
    goals,
    modalState,
    getFilteredGoals,
    openModal,
    closeModal,
    recalculateAllGoalProgress
  } = useGoalStore();

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);

  const filteredGoals = getFilteredGoals();

  const handleCreateGoal = () => {
    console.log('handleCreateGoal called, opening modal');
    console.log('modalState before:', modalState);
    setGoalToEdit(null);
    openModal();
    console.log('openModal called');
  };

  // Listen for custom event to open goal modal from dashboard
  useEffect(() => {
    const handleOpenGoalModal = () => {
      console.log('openGoalModal event received, calling handleCreateGoal');
      handleCreateGoal();
    };

    window.addEventListener('openGoalModal', handleOpenGoalModal);
    return () => window.removeEventListener('openGoalModal', handleOpenGoalModal);
  }, []);

  // Recalculate goal progress when component mounts or goals change
  useEffect(() => {
    if (goals.length > 0) {
      console.log('GoalsPage: Recalculating progress for', goals.length, 'goals');
      recalculateAllGoalProgress();
    }
  }, [goals.length, recalculateAllGoalProgress]);

  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowDetail(true);
  };

  const handleGoalEdit = (goal: Goal) => {
    setGoalToEdit(goal);
    setShowDetail(false);
    openModal();
  };

  const handleBackToList = () => {
    setShowDetail(false);
    setSelectedGoal(null);
  };

  const handleModalClose = () => {
    setGoalToEdit(null);
    closeModal();
  };

  // Show empty state if no goals exist
  if (goals.length === 0) {
    return <GoalsEmpty />;
  }

  // Show detail view if goal is selected
  if (showDetail && selectedGoal) {
    return (
      <GoalDetail
        goal={selectedGoal}
        onBack={handleBackToList}
        onEdit={handleGoalEdit}
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Goals</h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            {filteredGoals.length} of {goals.length} goals
          </p>
        </div>
        <button
          onClick={handleCreateGoal}
          className="w-12 h-12 bg-gradient-to-r accent-gradient text-white rounded-2xl flex items-center justify-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>


      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.map(goal => (
          <GoalCard 
            key={goal.id} 
            goal={goal} 
            viewMode="list"
            onClick={() => handleGoalClick(goal)}
          />
        ))}
      </div>

      {/* Goal Creation Modal */}
      <GoalCreationModal
        isOpen={modalState.isOpen}
        onClose={handleModalClose}
        goalToEdit={goalToEdit}
      />
    </div>
  );
}