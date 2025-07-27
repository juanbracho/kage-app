import TaskCreationModal from './TaskCreationModal'
import { useTaskStore } from '../store/taskStore'

interface TasksEmptyProps {
  onNavigate?: (tab: string) => void
}

export default function TasksEmpty({ onNavigate }: TasksEmptyProps) {
  const { openModal, isModalOpen, closeModal, addTask } = useTaskStore()

  const handleCreateTask = () => {
    openModal()
  }

  const handleLinkToGoal = () => {
    onNavigate?.('goals')
  }
  return (
    <>
    <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="relative mb-6">
        <div className="absolute top-2 right-8 text-2xl opacity-60 animate-pulse">
          ⚡
        </div>
        <div className="text-8xl mb-4 animate-bounce opacity-80">
          ✅
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Tasks Yet</h2>
      <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-8 max-w-md mx-auto">
        Tasks are the building blocks of your goals. Create actionable items that move you closer to what you want to achieve.
      </p>
      
      <div className="flex flex-col items-center gap-3 mb-6">
        <button 
          onClick={handleCreateTask}
          className="flex items-center gap-2 px-8 py-4 accent-gradient text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          ➕ Add Your First Task
        </button>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 mb-8">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">📋 Task Examples</div>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <div className="w-4 h-4 border border-gray-300 dark:border-gray-500 rounded"></div>
            Research gym memberships nearby
          </div>
          <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <div className="w-4 h-4 border border-gray-300 dark:border-gray-500 rounded"></div>
            Schedule doctor's appointment
          </div>
          <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <div className="w-4 h-4 border border-gray-300 dark:border-gray-500 rounded"></div>
            Buy groceries for meal prep
          </div>
          <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <div className="w-4 h-4 border border-gray-300 dark:border-gray-500 rounded"></div>
            Submit project proposal
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-white text-sm">
            📝
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Break down complex projects</div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-white text-sm">
            📅
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Set due dates & reminders</div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-white text-sm">
            🎯
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Link tasks to your goals</div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-white text-sm">
            ✨
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Organize with sub-tasks</div>
        </div>
      </div>
    </div>
    
    {/* Task Creation Modal */}
    <TaskCreationModal
      isOpen={isModalOpen}
      onClose={closeModal}
      onSubmit={(taskData) => {
        addTask(taskData)
        closeModal()
      }}
    />
    </>
  )
}