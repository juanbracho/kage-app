import { useState } from 'react'
import GoalCreationModal from './GoalCreationModal'

interface DashboardEmptyProps {
  onNavigate: (tab: string) => void
}

export default function DashboardEmpty({ onNavigate }: DashboardEmptyProps) {
  const [showGoalModal, setShowGoalModal] = useState(false)

  const handleCreateGoal = () => {
    setShowGoalModal(true)
  }

  const handleCreateGoalFromCard = () => {
    onNavigate('goals')
    // Small delay to ensure navigation happens first
    setTimeout(() => {
      // The goals page will handle opening the modal
      window.dispatchEvent(new CustomEvent('openGoalModal'))
    }, 100)
  }
  return (
    <>
    <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="relative mb-6">
        <div className="absolute top-2 right-8 text-2xl opacity-60 animate-pulse">
          ✨
        </div>
        <div className="text-8xl mb-4 animate-bounce opacity-80">
          🌱
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Welcome to Kage!</h2>
      <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-8 max-w-md mx-auto">
        Your productivity journey starts here. Set meaningful goals, build lasting habits, and track your progress all in one place.
      </p>
      
      <div className="flex flex-col items-center gap-3 mb-6">
        <button 
          onClick={handleCreateGoal}
          className="flex items-center gap-2 px-8 py-4 accent-gradient text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          🎯 Create Your First Goal
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div 
          onClick={handleCreateGoalFromCard}
          className="bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 cursor-pointer hover:accent-bg-50 dark:hover:accent-bg-900 hover-accent-border hover:border-solid transition-all"
        >
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Set a Goal</div>
        </div>
        <div 
          onClick={() => onNavigate('habits')}
          className="bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 cursor-pointer hover:accent-bg-50 dark:hover:accent-bg-900 hover-accent-border hover:border-solid transition-all"
        >
          <div className="text-3xl mb-2">🔄</div>
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Add Habits</div>
        </div>
        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 cursor-pointer hover:accent-bg-50 dark:hover:accent-bg-900 hover-accent-border hover:border-solid transition-all"
        >
          <div className="text-3xl mb-2">✅</div>
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Create Tasks</div>
        </div>
        <div 
          onClick={() => onNavigate('journal')}
          className="bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 cursor-pointer hover:accent-bg-50 dark:hover:accent-bg-900 hover-accent-border hover:border-solid transition-all"
        >
          <div className="text-3xl mb-2">📝</div>
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">Start Journaling</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-white text-sm">
            🔗
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Connect goals, habits & tasks</div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-white text-sm">
            📊
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Track your progress visually</div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-white text-sm">
            🎨
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Beautiful, motivating interface</div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-white text-sm">
            🤖
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">AI insights (premium)</div>
        </div>
      </div>
    </div>
    
    {/* Goal Creation Modal */}
    <GoalCreationModal
      isOpen={showGoalModal}
      onClose={() => setShowGoalModal(false)}
    />
    </>
  )
}