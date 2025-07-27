import { useState, useEffect } from 'react'
import { Target, CheckSquare, Calendar, BookOpen, BarChart3, Hash, Settings, TrendingUp } from 'lucide-react'
import { useSettingsStore } from './store/settingsStore'
import DashboardPage from './components/DashboardPage'
import GoalsPage from './components/GoalsPage'
import TasksPage from './components/TasksPage'
import HabitsPage from './components/HabitsPage'
import CalendarPage from './components/CalendarPage'
import JournalPage from './components/JournalPage'
import SettingsPage from './components/SettingsPage'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import OfflineIndicator from './components/OfflineIndicator'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { settings, initializeSettings } = useSettingsStore()

  // Initialize settings on app startup
  useEffect(() => {
    initializeSettings()
  }, [])

  // PWA routing detection and handling
  useEffect(() => {
    const isPWA = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    // Log PWA context for debugging
    console.log('PWA Detection:', { 
      isPWA, 
      currentPath: window.location.pathname,
      search: window.location.search,
      action 
    });

    // Handle URL parameters for PWA shortcuts
    if (action) {
      switch (action) {
        case 'create':
          // Check which section based on pathname
          if (window.location.pathname.includes('goals')) {
            setActiveTab('goals');
          } else if (window.location.pathname.includes('tasks')) {
            setActiveTab('tasks');
          } else if (window.location.pathname.includes('habits')) {
            setActiveTab('habits');
          } else if (window.location.pathname.includes('journal')) {
            setActiveTab('journal');
          }
          break;
        case 'complete':
          if (window.location.pathname.includes('habits')) {
            setActiveTab('habits');
          }
          break;
      }
      
      // Clean URL after processing
      window.history.replaceState({}, '', '/kage-app/');
    }
  }, [])

  // Apply theme changes
  useEffect(() => {
    if (settings.appearance.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.appearance.theme])

  const tabs = [
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'habits', label: 'Habits', icon: Hash },
    { id: 'journal', label: 'Journal', icon: BookOpen },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={setActiveTab} />
      case 'goals':
        return <GoalsPage onNavigate={setActiveTab} />
      case 'tasks':
        return <TasksPage onNavigate={setActiveTab} />
      case 'habits':
        return <HabitsPage onNavigate={setActiveTab} />
      case 'calendar':
        return <CalendarPage />
      case 'journal':
        return <JournalPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <DashboardPage onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kage</h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Goal-Centric Productivity</p>
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                activeTab === 'calendar' 
                  ? 'accent-bg-100 dark:accent-bg-900 accent-text-600 dark:accent-text-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={activeTab === 'calendar' ? {
                backgroundColor: 'var(--accent-color-light, #FB923C)',
                color: 'var(--accent-color, #FF7101)'
              } : {}}
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                activeTab === 'settings' 
                  ? 'accent-bg-100 dark:accent-bg-900 accent-text-600 dark:accent-text-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={activeTab === 'settings' ? {
                backgroundColor: 'var(--accent-color-light, #FB923C)',
                color: 'var(--accent-color, #FF7101)'
              } : {}}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-2 py-3 pb-24 scroll-smooth scrollbar-hide">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
        <div className="flex justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'accent-text-500 accent-bg-50 dark:accent-bg-900 dark:accent-text-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                style={activeTab === tab.id ? {
                  backgroundColor: 'var(--accent-color-light, #FB923C)',
                  color: 'var(--accent-color, #FF7101)'
                } : {}}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-xs">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* Offline Status Indicator */}
      <OfflineIndicator />
    </div>
  )
}

export default App