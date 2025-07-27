import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  AppSettings, 
  NotificationSettings, 
  AppearanceSettings, 
  PrivacySettings, 
  PremiumSettings,
  Theme,
  AccentColor,
  NotificationTime
} from '../types/settings'

// Map accent color IDs to their display names
const ACCENT_COLOR_NAMES: Record<AccentColor, string> = {
  orange: 'Orange',
  blue: 'Cyan',
  green: 'Emerald', 
  purple: 'Purple',
  red: 'Bordeaux',
  yellow: 'Corn'
}

interface SettingsStore {
  settings: AppSettings
  isLoading: boolean
  
  // Actions
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void
  updateAppearanceSettings: (settings: Partial<AppearanceSettings>) => void
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void
  updatePremiumSettings: (settings: Partial<PremiumSettings>) => void
  setTheme: (theme: Theme) => void
  setAccentColor: (color: AccentColor) => void
  setReminderTime: (time: NotificationTime) => void
  toggleNotifications: (type: keyof NotificationSettings) => void
  togglePrivacySetting: (type: keyof PrivacySettings) => void
  resetToDefaults: () => void
  exportSettings: () => string
  importSettings: (settingsJson: string) => boolean
  
  // Getters
  getTheme: () => Theme
  getAccentColor: () => AccentColor
  getAccentColorName: () => string
  isPremiumEnabled: () => boolean
  areNotificationsEnabled: () => boolean
  initializeSettings: () => void
}

const defaultSettings: AppSettings = {
  notifications: {
    pushNotifications: true,
    reminderTime: '08:00',
    achievementNotifications: true,
    dailyReminders: true,
    weeklyReports: false
  },
  appearance: {
    theme: 'light',
    accentColor: 'orange',
    animations: true,
    compactMode: false,
    showProgressRings: true
  },
  privacy: {
    analytics: true,
    crashReporting: true,
    dataSharing: false,
    locationTracking: false
  },
  premium: {
    aiAssistant: false,
    advancedAnalytics: false,
    cloudSync: false,
    unlimitedGoals: false,
    customThemes: false
  },
  version: '1.0.0',
  firstLaunch: true,
  onboardingCompleted: false
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,

      updateNotificationSettings: (newSettings: Partial<NotificationSettings>) => {
        set(state => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              ...newSettings
            }
          }
        }))
      },

      updateAppearanceSettings: (newSettings: Partial<AppearanceSettings>) => {
        set(state => ({
          settings: {
            ...state.settings,
            appearance: {
              ...state.settings.appearance,
              ...newSettings
            }
          }
        }))
      },

      updatePrivacySettings: (newSettings: Partial<PrivacySettings>) => {
        set(state => ({
          settings: {
            ...state.settings,
            privacy: {
              ...state.settings.privacy,
              ...newSettings
            }
          }
        }))
      },

      updatePremiumSettings: (newSettings: Partial<PremiumSettings>) => {
        set(state => ({
          settings: {
            ...state.settings,
            premium: {
              ...state.settings.premium,
              ...newSettings
            }
          }
        }))
      },

      setTheme: (theme: Theme) => {
        set(state => ({
          settings: {
            ...state.settings,
            appearance: {
              ...state.settings.appearance,
              theme
            }
          }
        }))
        
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      setAccentColor: (color: AccentColor) => {
        set(state => ({
          settings: {
            ...state.settings,
            appearance: {
              ...state.settings.appearance,
              accentColor: color
            }
          }
        }))
        
        // Apply accent color to CSS custom properties
        const colorMap = {
          orange: {
            50: '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            300: '#FDBA74',
            400: '#FB923C',
            500: '#FF7101',
            600: '#EA580C',
            700: '#C2410C',
            800: '#9A3412',
            900: '#7C2D12'
          },
          blue: {
            50: '#ECFEFF',
            100: '#CFFAFE',
            200: '#A5F3FC',
            300: '#67E8F9',
            400: '#22D3EE',
            500: '#06B6D4',
            600: '#0891B2',
            700: '#0E7490',
            800: '#155E75',
            900: '#164E63'
          },
          green: {
            50: '#ECFDF5',
            100: '#D1FAE5',
            200: '#A7F3D0',
            300: '#6EE7B7',
            400: '#34D399',
            500: '#10B981',
            600: '#059669',
            700: '#047857',
            800: '#065F46',
            900: '#064E3B'
          },
          purple: {
            50: '#FAF5FF',
            100: '#F3E8FF',
            200: '#E9D5FF',
            300: '#D8B4FE',
            400: '#C084FC',
            500: '#A855F7',
            600: '#9333EA',
            700: '#7C3AED',
            800: '#6B21A8',
            900: '#581C87'
          },
          red: {
            50: '#FEF2F2',
            100: '#FEE2E2',
            200: '#FECACA',
            300: '#FCA5A5',
            400: '#F87171',
            500: '#7C2D12',
            600: '#6D2813',
            700: '#5D2312',
            800: '#4E1E10',
            900: '#3F180D'
          },
          yellow: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FBBF24',
            500: '#EAB308',
            600: '#CA8A04',
            700: '#A16207',
            800: '#854D0E',
            900: '#713F12'
          }
        }
        
        const root = document.documentElement
        const colors = colorMap[color]
        
        // Set all color variations
        Object.entries(colors).forEach(([shade, hex]) => {
          root.style.setProperty(`--accent-${shade}`, hex)
        })
        
        // Set main accent color variables
        root.style.setProperty('--accent-color', colors[500])
        root.style.setProperty('--accent-color-light', colors[400])
        root.style.setProperty('--accent-color-dark', colors[600])
      },

      setReminderTime: (time: NotificationTime) => {
        set(state => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              reminderTime: time
            }
          }
        }))
      },

      toggleNotifications: (type: keyof NotificationSettings) => {
        set(state => ({
          settings: {
            ...state.settings,
            notifications: {
              ...state.settings.notifications,
              [type]: !state.settings.notifications[type]
            }
          }
        }))
      },

      togglePrivacySetting: (type: keyof PrivacySettings) => {
        set(state => ({
          settings: {
            ...state.settings,
            privacy: {
              ...state.settings.privacy,
              [type]: !state.settings.privacy[type]
            }
          }
        }))
      },

      resetToDefaults: () => {
        set({ settings: { ...defaultSettings, firstLaunch: false } })
      },

      exportSettings: (): string => {
        const { settings } = get()
        return JSON.stringify(settings, null, 2)
      },

      importSettings: (settingsJson: string): boolean => {
        try {
          const importedSettings = JSON.parse(settingsJson)
          // Validate the imported settings structure
          if (importedSettings && typeof importedSettings === 'object') {
            set(() => ({
              settings: {
                ...defaultSettings,
                ...importedSettings,
                version: defaultSettings.version // Always use current version
              }
            }))
            return true
          }
          return false
        } catch (error) {
          console.error('Failed to import settings:', error)
          return false
        }
      },

      // Getters
      getTheme: (): Theme => {
        return get().settings.appearance.theme
      },

      getAccentColor: (): AccentColor => {
        return get().settings.appearance.accentColor
      },

      getAccentColorName: (): string => {
        const accentColor = get().settings.appearance.accentColor
        return ACCENT_COLOR_NAMES[accentColor] || 'Orange'
      },

      isPremiumEnabled: (): boolean => {
        const { premium } = get().settings
        return Object.values(premium).some(value => value === true)
      },

      areNotificationsEnabled: (): boolean => {
        return get().settings.notifications.pushNotifications
      },

      initializeSettings: () => {
        const { settings } = get()
        
        // Apply theme
        if (settings.appearance.theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        
        // Apply accent color
        const colorMap = {
          orange: {
            50: '#FFF7ED',
            100: '#FFEDD5',
            200: '#FED7AA',
            300: '#FDBA74',
            400: '#FB923C',
            500: '#FF7101',
            600: '#EA580C',
            700: '#C2410C',
            800: '#9A3412',
            900: '#7C2D12'
          },
          blue: {
            50: '#ECFEFF',
            100: '#CFFAFE',
            200: '#A5F3FC',
            300: '#67E8F9',
            400: '#22D3EE',
            500: '#06B6D4',
            600: '#0891B2',
            700: '#0E7490',
            800: '#155E75',
            900: '#164E63'
          },
          green: {
            50: '#ECFDF5',
            100: '#D1FAE5',
            200: '#A7F3D0',
            300: '#6EE7B7',
            400: '#34D399',
            500: '#10B981',
            600: '#059669',
            700: '#047857',
            800: '#065F46',
            900: '#064E3B'
          },
          purple: {
            50: '#FAF5FF',
            100: '#F3E8FF',
            200: '#E9D5FF',
            300: '#D8B4FE',
            400: '#C084FC',
            500: '#A855F7',
            600: '#9333EA',
            700: '#7C3AED',
            800: '#6B21A8',
            900: '#581C87'
          },
          red: {
            50: '#FEF2F2',
            100: '#FEE2E2',
            200: '#FECACA',
            300: '#FCA5A5',
            400: '#F87171',
            500: '#7C2D12',
            600: '#6D2813',
            700: '#5D2312',
            800: '#4E1E10',
            900: '#3F180D'
          },
          yellow: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FBBF24',
            500: '#EAB308',
            600: '#CA8A04',
            700: '#A16207',
            800: '#854D0E',
            900: '#713F12'
          }
        }
        
        const root = document.documentElement
        const colors = colorMap[settings.appearance.accentColor]
        
        // Set all color variations
        Object.entries(colors).forEach(([shade, hex]) => {
          root.style.setProperty(`--accent-${shade}`, hex)
        })
        
        // Set main accent color variables
        root.style.setProperty('--accent-color', colors[500])
        root.style.setProperty('--accent-color-light', colors[400])
        root.style.setProperty('--accent-color-dark', colors[600])
      }
    }),
    {
      name: 'settings-store',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply settings immediately after rehydration
          state.initializeSettings()
        }
      },
    }
  )
)

// Initialize settings immediately when store is created
// This ensures CSS variables are available from the start
const initializeImmediately = () => {
  const root = document.documentElement
  const defaultColor = 'orange'
  
  const colorMap = {
    orange: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#FF7101',
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12'
    }
  }
  
  const colors = colorMap[defaultColor]
  
  // Set default color values immediately
  Object.entries(colors).forEach(([shade, hex]) => {
    root.style.setProperty(`--accent-${shade}`, hex)
  })
  
  root.style.setProperty('--accent-color', colors[500])
  root.style.setProperty('--accent-color-light', colors[400])
  root.style.setProperty('--accent-color-dark', colors[600])
}

// Call immediately when module loads
if (typeof window !== 'undefined') {
  initializeImmediately()
}