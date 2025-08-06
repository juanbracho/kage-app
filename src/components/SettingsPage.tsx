import { useState } from 'react'
import { 
  Bell, 
  Palette, 
  Shield, 
  Star, 
  HelpCircle, 
  User,
  Clock,
  Award,
  Moon,
  Sparkles,
  Lock,
  BarChart3,
  Cloud,
  MessageCircle,
  Info,
  Key,
  LogOut,
  Download,
  Upload,
  PlayCircle,
  Archive,
  RotateCcw,
  Trash2
} from 'lucide-react'
import { useSettingsStore } from '../store/settingsStore'
import { useUserStore } from '../store/userStore'
import { useOnboardingStore } from '../store/onboardingStore'
import { useGoalStore } from '../store/goalStore'
import ProfileSection from './ProfileSection'
import SettingsSection from './SettingsSection'
import SettingsItem from './SettingsItem'
import AccentColorPickerModal from './AccentColorPickerModal'
import DataExportModal from './DataExportModal'
import DataImportModal from './DataImportModal'

export default function SettingsPage() {
  const { 
    settings, 
    toggleNotifications, 
    setTheme, 
    togglePrivacySetting,
    updateAppearanceSettings,
    getAccentColorName,
    setupPasscode,
    validatePasscode,
    disablePasscode,
    changePasscode,
    setAutoLockTimeout
  } = useSettingsStore()
  
  const { signOut, isPremiumUser } = useUserStore()
  const { startOnboarding } = useOnboardingStore()
  const { getArchivedGoals, unarchiveGoal, deleteGoal } = useGoalStore()
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [expandedArchive, setExpandedArchive] = useState(false)
  
  // Passcode states
  const [showPasscodeSetup, setShowPasscodeSetup] = useState(false)
  const [showPasscodeChange, setShowPasscodeChange] = useState(false)
  const [passcodeInput, setPasscodeInput] = useState('')
  const [confirmPasscodeInput, setConfirmPasscodeInput] = useState('')
  const [currentPasscodeInput, setCurrentPasscodeInput] = useState('')
  const [passcodeError, setPasscodeError] = useState('')
  const [passcodeLoading, setPasscodeLoading] = useState(false)

  const handleReminderTimeChange = () => {
    // This would open a time picker modal
    console.log('Open time picker')
  }

  const handleThemeChange = () => {
    // This would open theme selection modal
    const newTheme = settings.appearance.theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  const handleAccentColorChange = () => {
    setIsColorPickerOpen(true)
  }

  const handleUpgradeToPremium = () => {
    console.log('Upgrade to premium')
  }

  const handleDataExport = () => {
    setIsExportModalOpen(true)
  }

  const handleDataImport = () => {
    setIsImportModalOpen(true)
  }

  const handleSignOut = () => {
    signOut()
  }

  const handleShowOnboarding = () => {
    startOnboarding()
  }

  // Passcode Handlers
  const resetPasscodeState = () => {
    setPasscodeInput('')
    setConfirmPasscodeInput('')
    setCurrentPasscodeInput('')
    setPasscodeError('')
    setPasscodeLoading(false)
  }

  const handleEnablePasscode = () => {
    resetPasscodeState()
    setShowPasscodeSetup(true)
  }

  const handleDisablePasscode = async () => {
    if (!currentPasscodeInput) {
      setPasscodeError('Please enter your current passcode')
      return
    }

    setPasscodeLoading(true)
    try {
      const success = await disablePasscode(currentPasscodeInput)
      if (success) {
        resetPasscodeState()
        setShowPasscodeSetup(false)
        console.log('✅ Passcode disabled successfully')
      } else {
        setPasscodeError('Incorrect passcode')
      }
    } catch (error) {
      setPasscodeError('Failed to disable passcode')
    } finally {
      setPasscodeLoading(false)
    }
  }

  const handleSetupPasscode = async () => {
    setPasscodeError('')

    if (passcodeInput.length !== 4 || !/^\d{4}$/.test(passcodeInput)) {
      setPasscodeError('Passcode must be 4 digits')
      return
    }

    if (passcodeInput !== confirmPasscodeInput) {
      setPasscodeError('Passcodes do not match')
      return
    }

    setPasscodeLoading(true)
    try {
      const success = await setupPasscode(passcodeInput)
      if (success) {
        resetPasscodeState()
        setShowPasscodeSetup(false)
        console.log('✅ Passcode setup successful')
      } else {
        setPasscodeError('Failed to setup passcode')
      }
    } catch (error) {
      setPasscodeError('Failed to setup passcode')
    } finally {
      setPasscodeLoading(false)
    }
  }

  const handleChangePasscode = async () => {
    setPasscodeError('')

    if (!currentPasscodeInput) {
      setPasscodeError('Please enter your current passcode')
      return
    }

    if (passcodeInput.length !== 4 || !/^\d{4}$/.test(passcodeInput)) {
      setPasscodeError('New passcode must be 4 digits')
      return
    }

    if (passcodeInput !== confirmPasscodeInput) {
      setPasscodeError('New passcodes do not match')
      return
    }

    setPasscodeLoading(true)
    try {
      const success = await changePasscode(currentPasscodeInput, passcodeInput)
      if (success) {
        resetPasscodeState()
        setShowPasscodeChange(false)
        console.log('✅ Passcode changed successfully')
      } else {
        setPasscodeError('Current passcode is incorrect')
      }
    } catch (error) {
      setPasscodeError('Failed to change passcode')
    } finally {
      setPasscodeLoading(false)
    }
  }

  const handleCancelPasscodeAction = () => {
    resetPasscodeState()
    setShowPasscodeSetup(false)
    setShowPasscodeChange(false)
  }

  const handleUnarchiveGoal = (goalId: string, goalName: string) => {
    if (confirm(`Are you sure you want to unarchive "${goalName}"? It will be restored to your active goals.`)) {
      console.log('🗃️ Settings: Unarchiving goal:', goalId);
      unarchiveGoal(goalId);
    }
  }

  const handleDeleteArchivedGoal = (goalId: string, goalName: string) => {
    if (confirm(`Are you sure you want to permanently delete "${goalName}"? This action cannot be undone.`)) {
      console.log('🗑️ Settings: Permanently deleting archived goal:', goalId);
      deleteGoal(goalId);
    }
  }

  const archivedGoals = getArchivedGoals()

  const PremiumBadge = () => (
    <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-2 py-1 rounded-md font-semibold">
      PREMIUM
    </span>
  )

  return (
    <div className="space-y-6 pb-16">
      {/* Profile Section */}
      <ProfileSection />

      {/* AI Premium Callout */}
      {!isPremiumUser() && (
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Unlock AI Superpowers</h3>
            </div>
            <p className="text-purple-100 text-sm mb-4 leading-relaxed">
              Get personalized insights, smart goal suggestions, and auto-generated journal prompts that make your productivity journey effortless.
            </p>
            <button 
              onClick={handleUpgradeToPremium}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-purple-50 transition-colors"
            >
              Upgrade to Premium
            </button>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
        </div>
      )}

      {/* Notifications Settings */}
      <SettingsSection title="Notifications" icon={<Bell className="w-5 h-5" />}>
        <SettingsItem
          icon={<Bell className="w-4 h-4" />}
          iconBgColor="bg-blue-500"
          title="Push Notifications"
          subtitle="Get reminders for habits and tasks"
          type="toggle"
          checked={settings.notifications.pushNotifications}
          onToggle={() => toggleNotifications('pushNotifications')}
        />
        
        <SettingsItem
          icon={<Clock className="w-4 h-4" />}
          iconBgColor="bg-blue-500"
          title="Reminder Time"
          subtitle="When to send daily reminders"
          type="value"
          value={settings.notifications.reminderTime}
          onClick={handleReminderTimeChange}
        />
        
        <SettingsItem
          icon={<Award className="w-4 h-4" />}
          iconBgColor="bg-blue-500"
          title="Achievement Notifications"
          subtitle="Celebrate streaks and milestones"
          type="toggle"
          checked={settings.notifications.achievementNotifications}
          onToggle={() => toggleNotifications('achievementNotifications')}
        />
      </SettingsSection>

      {/* Appearance Settings */}
      <SettingsSection title="Appearance" icon={<Palette className="w-5 h-5" />}>
        <SettingsItem
          icon={<Moon className="w-4 h-4" />}
          iconBgColor="bg-gray-500"
          title="Theme"
          subtitle="Choose your preferred theme"
          type="value"
          value={settings.appearance.theme === 'light' ? 'Light' : 'Dark'}
          onClick={handleThemeChange}
        />
        
        <SettingsItem
          icon={<Palette className="w-4 h-4" />}
          iconBgColor="bg-gray-500"
          title="Accent Color"
          subtitle="Customize your experience"
          type="value"
          value={getAccentColorName()}
          onClick={handleAccentColorChange}
        />
        
      </SettingsSection>

      {/* Privacy & Data */}
      <SettingsSection title="Privacy & Data" icon={<Shield className="w-5 h-5" />}>
        <SettingsItem
          icon={<Lock className="w-4 h-4" />}
          iconBgColor="bg-green-500"
          title="Privacy Policy"
          subtitle="How we protect your data"
          type="navigate"
          onClick={() => console.log('Open privacy policy')}
        />
        
        <SettingsItem
          icon={<Upload className="w-4 h-4" />}
          iconBgColor="bg-blue-500"
          title="Import Data"
          subtitle="Import from Kage backups or HabitKit"
          type="navigate"
          onClick={handleDataImport}
        />
        
        <SettingsItem
          icon={<Download className="w-4 h-4" />}
          iconBgColor="bg-purple-500"
          title="Data Export"
          subtitle="Download your data"
          type="navigate"
          onClick={handleDataExport}
        />
        
        <SettingsItem
          icon={<BarChart3 className="w-4 h-4" />}
          iconBgColor="bg-green-500"
          title="Analytics"
          subtitle="Help improve Kage"
          type="toggle"
          checked={settings.privacy.analytics}
          onToggle={() => togglePrivacySetting('analytics')}
        />
      </SettingsSection>

      {/* Security & Passcode */}
      <SettingsSection title="Security & Passcode" icon={<Lock className="w-5 h-5" />}>
        <SettingsItem
          icon={<Key className="w-4 h-4" />}
          iconBgColor="bg-indigo-500"
          title="Journal Passcode"
          subtitle={settings.passcode.enabled ? "Enabled - Journal protected" : "Disabled - Journal accessible"}
          type="toggle"
          checked={settings.passcode.enabled}
          onToggle={settings.passcode.enabled ? () => setShowPasscodeSetup(true) : handleEnablePasscode}
        />
        
        {settings.passcode.enabled && (
          <>
            <SettingsItem
              icon={<RotateCcw className="w-4 h-4" />}
              iconBgColor="bg-orange-500"
              title="Change Passcode"
              subtitle="Update your journal passcode"
              type="navigate"
              onClick={() => {
                resetPasscodeState()
                setShowPasscodeChange(true)
              }}
            />
            
            <SettingsItem
              icon={<Clock className="w-4 h-4" />}
              iconBgColor="bg-purple-500"
              title="Auto-Lock Timeout"
              subtitle={`Lock after ${settings.passcode.autoLockTimeout === 'never' ? 'never' : settings.passcode.autoLockTimeout}`}
              type="navigate"
              onClick={() => {
                // This would open auto-lock timeout selection
                const timeouts = ['1min', '5min', '15min', '30min', 'never'];
                const currentIndex = timeouts.indexOf(settings.passcode.autoLockTimeout);
                const nextIndex = (currentIndex + 1) % timeouts.length;
                setAutoLockTimeout(timeouts[nextIndex] as any);
              }}
            />
          </>
        )}
      </SettingsSection>

      {/* Archive Management */}
      <SettingsSection title="Archive Management" icon={<Archive className="w-5 h-5" />}>
        <SettingsItem
          icon={<Archive className="w-4 h-4" />}
          iconBgColor="bg-gray-500"
          title="Archived Goals"
          subtitle={archivedGoals.length > 0 ? `${archivedGoals.length} archived goal${archivedGoals.length !== 1 ? 's' : ''}` : "No archived goals"}
          type="navigate"
          onClick={() => setExpandedArchive(!expandedArchive)}
        />
        
        {expandedArchive && archivedGoals.length > 0 && (
          <div className="mt-4 space-y-3 bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Archived Goals ({archivedGoals.length})
            </div>
            {archivedGoals.map(goal => (
              <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ backgroundColor: goal.color }}
                    >
                      {goal.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                        {goal.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        {goal.description}
                      </p>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Archived {new Date(goal.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleUnarchiveGoal(goal.id, goal.name)}
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Unarchive goal"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteArchivedGoal(goal.id, goal.name)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Permanently delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {archivedGoals.length === 0 && (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <Archive className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No archived goals yet.</p>
                <p className="text-xs opacity-75">Archive goals from the Goals page to manage them here.</p>
              </div>
            )}
          </div>
        )}
      </SettingsSection>

      {/* Premium Features */}
      <SettingsSection title="Premium Features" icon={<Star className="w-5 h-5" />}>
        <SettingsItem
          icon={<Sparkles className="w-4 h-4" />}
          iconBgColor="bg-amber-500"
          title="AI Assistant"
          subtitle="Smart insights and suggestions"
          type="navigate"
          badge={<PremiumBadge />}
          onClick={() => console.log('Open AI settings')}
        />
        
        <SettingsItem
          icon={<BarChart3 className="w-4 h-4" />}
          iconBgColor="bg-purple-500"
          title="Advanced Analytics"
          subtitle="Detailed progress insights"
          type="navigate"
          badge={<PremiumBadge />}
          onClick={() => console.log('Open analytics')}
        />
        
        <SettingsItem
          icon={<Cloud className="w-4 h-4" />}
          iconBgColor="bg-green-500"
          title="Cloud Sync"
          subtitle="Access anywhere"
          type="navigate"
          badge={<PremiumBadge />}
          onClick={() => console.log('Open cloud sync')}
        />
      </SettingsSection>

      {/* Support & About */}
      <SettingsSection title="Support & About" icon={<HelpCircle className="w-5 h-5" />}>
        <SettingsItem
          icon={<PlayCircle className="w-4 h-4" />}
          iconBgColor="bg-blue-500"
          title="Show Onboarding"
          subtitle="Replay the welcome experience"
          type="navigate"
          onClick={handleShowOnboarding}
        />
        
        <SettingsItem
          icon={<MessageCircle className="w-4 h-4" />}
          iconBgColor="bg-amber-500"
          title="Help & Support"
          subtitle="Get help with Kage"
          type="navigate"
          onClick={() => console.log('Open support')}
        />
        
        <SettingsItem
          icon={<Star className="w-4 h-4" />}
          iconBgColor="bg-amber-500"
          title="Rate Kage"
          subtitle="Share your feedback"
          type="navigate"
          onClick={() => console.log('Open app store rating')}
        />
        
        <SettingsItem
          icon={<Info className="w-4 h-4" />}
          iconBgColor="bg-amber-500"
          title="About Kage"
          subtitle="Version, terms, and more"
          type="navigate"
          onClick={() => console.log('Open about page')}
        />
      </SettingsSection>

      {/* Account Management */}
      <SettingsSection title="Account" icon={<User className="w-5 h-5" />}>
        <SettingsItem
          icon={<Key className="w-4 h-4" />}
          iconBgColor="bg-red-500"
          title="Change Password"
          subtitle="Update your password"
          type="navigate"
          onClick={() => console.log('Open change password')}
        />
        
        <SettingsItem
          icon={<LogOut className="w-4 h-4" />}
          iconBgColor="bg-red-500"
          title="Sign Out"
          subtitle="Sign out of your account"
          type="navigate"
          onClick={handleSignOut}
        />
      </SettingsSection>

      {/* Version Info */}
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <div className="text-sm mb-1">Kage v{settings.version}</div>
        <div className="text-xs opacity-70">© 2025 Kage. Made with ❤️ for productivity.</div>
      </div>

      {/* Accent Color Picker Modal */}
      <AccentColorPickerModal 
        isOpen={isColorPickerOpen}
        onClose={() => setIsColorPickerOpen(false)}
      />

      {/* Data Export Modal */}
      <DataExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Data Import Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Passcode Setup/Change Modals */}
      {(showPasscodeSetup || showPasscodeChange) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <Key className="w-6 h-6 text-indigo-500" />
                {settings.passcode.enabled && showPasscodeSetup ? 'Disable Passcode' :
                 showPasscodeChange ? 'Change Passcode' : 'Setup Passcode'}
              </h2>
            </div>

            <div className="space-y-4">
              {/* Current passcode (for disable or change) */}
              {(settings.passcode.enabled && showPasscodeSetup) || showPasscodeChange ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Passcode
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    value={currentPasscodeInput}
                    onChange={(e) => {
                      setCurrentPasscodeInput(e.target.value.replace(/\D/g, ''))
                      setPasscodeError('')
                    }}
                    className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••"
                  />
                </div>
              ) : null}

              {/* New passcode (for setup or change, but not disable) */}
              {!(settings.passcode.enabled && showPasscodeSetup) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {showPasscodeChange ? 'New Passcode' : 'Enter 4-Digit Passcode'}
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={passcodeInput}
                      onChange={(e) => {
                        setPasscodeInput(e.target.value.replace(/\D/g, ''))
                        setPasscodeError('')
                      }}
                      className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm Passcode
                    </label>
                    <input
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={confirmPasscodeInput}
                      onChange={(e) => {
                        setConfirmPasscodeInput(e.target.value.replace(/\D/g, ''))
                        setPasscodeError('')
                      }}
                      className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="••••"
                    />
                  </div>
                </>
              )}

              {passcodeError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="text-sm text-red-700 dark:text-red-300">
                    {passcodeError}
                  </div>
                </div>
              )}

              {/* Information text */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  {settings.passcode.enabled && showPasscodeSetup
                    ? 'Enter your current passcode to disable journal protection.'
                    : showPasscodeChange
                    ? 'Enter your current passcode and choose a new 4-digit passcode.'
                    : 'Choose a 4-digit numeric passcode to protect your journal entries.'
                  }
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelPasscodeAction}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={passcodeLoading}
              >
                Cancel
              </button>
              <button
                onClick={
                  settings.passcode.enabled && showPasscodeSetup
                    ? handleDisablePasscode
                    : showPasscodeChange
                    ? handleChangePasscode
                    : handleSetupPasscode
                }
                disabled={passcodeLoading}
                className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {passcodeLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {settings.passcode.enabled && showPasscodeSetup
                  ? 'Disable'
                  : showPasscodeChange
                  ? 'Change'
                  : 'Setup'
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}