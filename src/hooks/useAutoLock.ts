/**
 * Auto-Lock Hook
 * Provides global auto-lock functionality for the journal passcode system
 */

import { useEffect, useRef } from 'react'
import { useSettingsStore } from '../store/settingsStore'

export interface AutoLockEvents {
  onAutoLock?: () => void
  onWarning?: (timeRemaining: number) => void
}

export const useAutoLock = (events?: AutoLockEvents) => {
  const { settings, shouldAutoLock } = useSettingsStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const warningShownRef = useRef<boolean>(false)

  useEffect(() => {
    // Only run auto-lock checks if passcode is enabled
    if (!settings.passcode.enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Start auto-lock checking interval
    intervalRef.current = setInterval(() => {
      if (shouldAutoLock()) {
        // Trigger auto-lock event
        if (events?.onAutoLock) {
          events.onAutoLock()
        }
        console.log('🔒 Auto-lock triggered')
      } else if (events?.onWarning && settings.passcode.lastAccessTime) {
        // Check if we should show warning (30 seconds before lock)
        const timeoutMs = getAutoLockTimeoutMs(settings.passcode.autoLockTimeout)
        if (timeoutMs > 0) {
          const timeSinceLastAccess = Date.now() - settings.passcode.lastAccessTime
          const timeRemaining = timeoutMs - timeSinceLastAccess
          
          // Show warning when 30 seconds remain
          if (timeRemaining <= 30000 && timeRemaining > 0 && !warningShownRef.current) {
            events.onWarning(Math.floor(timeRemaining / 1000))
            warningShownRef.current = true
          } else if (timeRemaining > 30000) {
            warningShownRef.current = false
          }
        }
      }
    }, 1000) // Check every second

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [settings.passcode.enabled, shouldAutoLock, events])

  // Reset warning flag when passcode settings change
  useEffect(() => {
    warningShownRef.current = false
  }, [settings.passcode.autoLockTimeout, settings.passcode.lastAccessTime])
}

// Helper to get timeout in milliseconds
const getAutoLockTimeoutMs = (timeout: string): number => {
  switch (timeout) {
    case '1min': return 60 * 1000
    case '5min': return 5 * 60 * 1000
    case '15min': return 15 * 60 * 1000
    case '30min': return 30 * 60 * 1000
    case 'never': return -1
    default: return 5 * 60 * 1000
  }
}