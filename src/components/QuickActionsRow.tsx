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
    if (tab === 'goals') {
      // Dispatch custom event to open goal modal
      window.dispatchEvent(new CustomEvent('openGoalModal'));
    } else if (tab === 'tasks' || tab === 'habits') {
      // Navigate to page which will open modal
      onNavigate(tab);
    } else {
      // Navigate normally for journal
      onNavigate(tab);
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