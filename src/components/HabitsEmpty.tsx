import { useState, useEffect } from 'react';

interface HabitsEmptyProps {
  onCreateHabit?: () => void;
}

const inspirationalQuotes = [
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Aristotle"
  },
  {
    text: "The chains of habit are too weak to be felt until they are too strong to be broken.",
    author: "Samuel Johnson"
  },
  {
    text: "First we make our habits, then our habits make us.",
    author: "John Dryden"
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    text: "You'll never change your life until you change something you do daily.",
    author: "Mike Murdock"
  }
];

export default function HabitsEmpty({ onCreateHabit }: HabitsEmptyProps) {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % inspirationalQuotes.length);
    }, 4000); // Change quote every 4 seconds

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="relative mb-6">
        <div className="absolute top-2 right-8 text-2xl opacity-60 animate-pulse">
          🔥
        </div>
        <div className="text-8xl mb-4 animate-bounce opacity-80">
          🔄
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Habits Yet</h2>
      <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-8 max-w-md mx-auto">
        Habits are the compound interest of personal development. Small daily actions that build up to extraordinary results over time.
      </p>
      
      <div className="flex flex-col items-center gap-3 mb-6">
        <button 
          onClick={onCreateHabit}
          className="flex items-center gap-2 px-8 py-4 accent-gradient text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
        >
          🌟 Start Your First Habit
        </button>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 mb-8">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 text-center">🔥 Habit Ideas</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <span>🏃</span> Morning workout - 30 minutes
          </div>
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <span>📚</span> Daily reading - 20 minutes
          </div>
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <span>💧</span> Drink 8 glasses of water
          </div>
          <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-300">
            <span>🧘</span> Evening meditation - 10 minutes
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 text-white text-center mb-6">
        <div 
          key={currentQuote}
          className="text-base italic mb-2 opacity-90 transition-all duration-500 animate-fade-in"
        >
          "{inspirationalQuotes[currentQuote].text}"
        </div>
        <div className="text-xs opacity-70">
          — {inspirationalQuotes[currentQuote].author}
        </div>
      </div>
      
      <div className="flex justify-center gap-2">
        {inspirationalQuotes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuote(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentQuote
                ? 'accent-bg-500 scale-125'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
            style={index === currentQuote ? {
              backgroundColor: 'var(--accent-color, #FF7101)'
            } : {}}
          />
        ))}
      </div>
    </div>
  )
}