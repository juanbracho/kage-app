import { safeDispatchEvent } from '../utils/pwaDetection';

interface QuickActionsRowProps {
  onNavigate: (tab: string) => void;
}

export default function QuickActionsRow({ onNavigate }: QuickActionsRowProps) {
  const actions = [
    { 
      id: 'goal', 
      icon: '🎯', 
      label: 'New Goal', 
      tab: 'goals'
    },
    { 
      id: 'task', 
      icon: '✅', 
      label: 'Add Task', 
      tab: 'tasks'
    },
    { 
      id: 'habit', 
      icon: '🔄', 
      label: 'Add Habit', 
      tab: 'habits'
    },
    { 
      id: 'journal', 
      icon: '📝', 
      label: 'Journal', 
      tab: 'journal'
    }
  ];

  const handleActionClick = (tab: string) => {
    // Always navigate to the page first
    onNavigate(tab);
    
    // Then dispatch custom event to open creation modal using safe dispatch
    if (tab === 'goals') {
      // Small delay to ensure page has loaded before opening modal
      setTimeout(() => {
        safeDispatchEvent('openGoalModal');
      }, 100);
    } else if (tab === 'tasks') {
      setTimeout(() => {
        safeDispatchEvent('openTaskModal');
      }, 100);
    } else if (tab === 'habits') {
      setTimeout(() => {
        safeDispatchEvent('openHabitModal');
      }, 100);
    } else if (tab === 'journal') {
      setTimeout(() => {
        safeDispatchEvent('openJournalModal');
      }, 100);
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
      
      <div className="accent-gradient rounded-2xl p-5 text-white">
        <div className="grid grid-cols-4 gap-3">
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.tab)}
              className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center transition-all duration-200 hover:bg-white/30 hover:scale-105"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-xs font-medium">{action.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}