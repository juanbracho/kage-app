import { DashboardCard } from '../types/dashboard';

interface DashboardCardsProps {
  cards: DashboardCard[];
  onNavigate: (tab: string) => void;
}

function StatCard({ card }: { card: DashboardCard }) {
  return (
    <div
      onClick={card.onClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${card.colorClass}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{card.icon}</span>
          <span className="font-semibold text-gray-900 dark:text-white">{card.title}</span>
        </div>
      </div>
      
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {card.value}
      </div>
      
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        {card.subtitle}
      </div>
      
      <div className="space-y-2">
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full accent-gradient rounded-full transition-all duration-500"
            style={{ width: `${Math.min(card.progress, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {card.progressText}
        </div>
      </div>
    </div>
  );
}

function QuickActionsCard({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const actions = [
    { id: 'goal', icon: '🎯', label: 'Goal', tab: 'goals' },
    { id: 'task', icon: '✅', label: 'Task', tab: 'tasks' },
    { id: 'habit', icon: '🔄', label: 'Habit', tab: 'habits' },
    { id: 'journal', icon: '📝', label: 'Journal', tab: 'journal' }
  ];

  return (
    <div className="accent-gradient rounded-2xl p-5 text-white">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">⚡</span>
        <span className="font-semibold">Quick Add</span>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={() => onNavigate(action.tab)}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center transition-all duration-200 hover:bg-white/30 hover:scale-105"
          >
            <div className="text-2xl mb-1">{action.icon}</div>
            <div className="text-xs font-medium">{action.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardCards({ cards, onNavigate }: DashboardCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {cards.map(card => (
        <StatCard key={card.id} card={card} />
      ))}
      <QuickActionsCard onNavigate={onNavigate} />
    </div>
  );
}