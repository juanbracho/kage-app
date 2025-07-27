interface JournalEmptyProps {
  onCreateEntry?: () => void
}

export default function JournalEmpty({ onCreateEntry }: JournalEmptyProps = {}) {
  return (
    <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="relative mb-6">
        <div className="absolute top-2 right-8 text-2xl opacity-60 animate-pulse">
          💭
        </div>
        <div className="text-8xl mb-4 animate-bounce opacity-80">
          📝
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Journal Entries</h2>
      <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-8 max-w-md mx-auto">
        Reflection amplifies growth. Start journaling to capture insights, track your mood, and see patterns in your productivity journey.
      </p>
      
      <div className="flex flex-col items-center gap-3 mb-6">
        <button 
          onClick={onCreateEntry}
          className="flex items-center gap-2 px-8 py-4 accent-gradient text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          ✍️ Write Your First Entry
        </button>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 mb-8">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 text-center">💭 Journal Prompts</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <span>🌅</span> What am I grateful for today?
          </div>
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <span>🎯</span> What progress did I make on my goals?
          </div>
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <span>💡</span> What did I learn today?
          </div>
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <span>🌙</span> How am I feeling right now?
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-white text-sm">
            🔗
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-200">Link to goals & habits</div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-white text-sm">
            😊
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-200">Track your mood daily</div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-white text-sm">
            🤖
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-200">Auto-prompts from AI</div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-8 h-8 accent-gradient rounded-lg flex items-center justify-center text-white text-sm">
            📈
          </div>
          <div className="text-xs font-medium text-gray-700 dark:text-gray-200">See patterns over time</div>
        </div>
      </div>
    </div>
  )
}