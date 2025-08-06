export type Theme = 'light' | 'dark' | 'system'
export type AccentColor = 'orange' | 'blue' | 'green' | 'purple' | 'red' | 'yellow'
export type NotificationTime = string // HH:MM format

export interface NotificationSettings {
  pushNotifications: boolean
  reminderTime: NotificationTime
  achievementNotifications: boolean
  dailyReminders: boolean
  weeklyReports: boolean
}

export interface AppearanceSettings {
  theme: Theme
  accentColor: AccentColor
  compactMode: boolean
  showProgressRings: boolean
}

export interface PrivacySettings {
  analytics: boolean
  crashReporting: boolean
  dataSharing: boolean
  locationTracking: boolean
}

export type AutoLockTimeout = '1min' | '5min' | '15min' | '30min' | 'never';

export interface PasscodeSettings {
  enabled: boolean
  hash?: string
  salt?: string
  autoLockTimeout: AutoLockTimeout
  lastAccessTime?: number
}

export interface PremiumSettings {
  aiAssistant: boolean
  advancedAnalytics: boolean
  cloudSync: boolean
  unlimitedGoals: boolean
  customThemes: boolean
}

export interface AppSettings {
  notifications: NotificationSettings
  appearance: AppearanceSettings
  privacy: PrivacySettings
  premium: PremiumSettings
  passcode: PasscodeSettings
  version: string
  firstLaunch: boolean
  onboardingCompleted: boolean
}


// Settings categories for UI organization
export type SettingsCategory = 
  | 'profile'
  | 'notifications' 
  | 'appearance'
  | 'security'
  | 'privacy'
  | 'premium'
  | 'support'
  | 'account'

export interface SettingsCategoryConfig {
  id: SettingsCategory
  title: string
  icon: string
  description?: string
}