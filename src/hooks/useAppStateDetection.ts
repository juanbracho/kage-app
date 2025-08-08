/**
 * App State Detection Hook
 * Detects app lifecycle events for passcode locking system
 * Supports both web and Capacitor mobile environments
 */

import { useEffect, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

export interface AppStateEvents {
  onBackground?: () => void
  onForeground?: () => void
  onVisibilityChange?: (isVisible: boolean) => void
  onWindowBlur?: () => void
  onWindowFocus?: () => void
}

export const useAppStateDetection = (events?: AppStateEvents) => {
  const lastVisibilityState = useRef<string>(document.visibilityState)
  const isInitialMount = useRef<boolean>(true)

  useEffect(() => {
    // Skip initial mount to avoid false triggers on page load
    if (isInitialMount.current) {
      isInitialMount.current = false
      // Initialize the last visibility state
      lastVisibilityState.current = document.visibilityState
      return
    }

    // Use Capacitor App plugin for mobile, fallback to web APIs
    if (Capacitor.isNativePlatform()) {
      console.log('🤖 Using Capacitor App plugin for mobile state detection')
      
      // Capacitor mobile app state detection
      const appStateChangeListener = App.addListener('appStateChange', (state) => {
        console.log('📱 Capacitor app state change:', state)
        
        if (state.isActive) {
          console.log('📱 App came to foreground (Capacitor)')
          events?.onForeground?.()
        } else {
          console.log('📱 App went to background (Capacitor)')
          events?.onBackground?.()
        }
      })

      // Capacitor pause/resume events (additional mobile detection)
      const pauseListener = App.addListener('pause', () => {
        console.log('⏸️ App paused (Capacitor)')
        events?.onBackground?.()
      })

      const resumeListener = App.addListener('resume', () => {
        console.log('▶️ App resumed (Capacitor)')
        events?.onForeground?.()
      })

      // Cleanup Capacitor listeners
      return () => {
        appStateChangeListener.remove()
        pauseListener.remove()
        resumeListener.remove()
      }
    } else {
      console.log('🌐 Using web APIs for browser state detection')
      
      // Web browser - Page Visibility API - detects tab/app switching
      const handleVisibilityChange = () => {
        const currentState = document.visibilityState
        const wasVisible = lastVisibilityState.current === 'visible'
        const isVisible = currentState === 'visible'

        console.log('👀 Visibility change:', { 
          from: lastVisibilityState.current, 
          to: currentState,
          wasVisible,
          isVisible 
        })

        // App went to background
        if (wasVisible && !isVisible) {
          console.log('📱 App went to background (Web)')
          events?.onBackground?.()
        }

        // App came to foreground  
        if (!wasVisible && isVisible) {
          console.log('📱 App came to foreground (Web)')
          events?.onForeground?.()
        }

        // General visibility change
        events?.onVisibilityChange?.(isVisible)
        
        lastVisibilityState.current = currentState
      }

      // Window focus/blur - detects app focus changes
      const handleWindowBlur = () => {
        console.log('🔵 Window blur event')
        events?.onWindowBlur?.()
      }

      const handleWindowFocus = () => {
        console.log('🟢 Window focus event')  
        events?.onWindowFocus?.()
      }

      // Page unload - app closing
      const handleBeforeUnload = () => {
        console.log('🚪 App closing/reloading')
        // Mark that app is closing - this will trigger lock on next open
        localStorage.setItem('kage-app-closing', Date.now().toString())
      }

      // Add event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('blur', handleWindowBlur)
      window.addEventListener('focus', handleWindowFocus)
      window.addEventListener('beforeunload', handleBeforeUnload)

      // Cleanup web listeners
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('blur', handleWindowBlur)
        window.removeEventListener('focus', handleWindowFocus)
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
  }, [events])

  // Check if app was closed and reopened
  useEffect(() => {
    const wasClosing = localStorage.getItem('kage-app-closing')
    if (wasClosing) {
      const closingTime = parseInt(wasClosing)
      const timeSinceClosed = Date.now() - closingTime
      
      console.log('🚪 App reopened after closing', { 
        closingTime: new Date(closingTime).toISOString(),
        timeSinceClosed: `${timeSinceClosed}ms` 
      })
      
      // Clear the flag
      localStorage.removeItem('kage-app-closing')
      
      // Trigger background event (app was effectively backgrounded)
      events?.onBackground?.()
    }
  }, [events])
}

export default useAppStateDetection