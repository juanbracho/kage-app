/**
 * PWA Detection and Environment Utilities
 */

export interface PWAInfo {
  isPWA: boolean;
  isStandalone: boolean;
  isFullscreen: boolean;
  isMinimalUI: boolean;
  displayMode: string;
  platform: string;
  userAgent: string;
}

/**
 * Detect if the app is running as a PWA
 */
export function detectPWAEnvironment(): PWAInfo {
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                window.matchMedia('(display-mode: fullscreen)').matches ||
                (window.navigator as any).standalone === true; // iOS Safari

  const displayMode = window.matchMedia('(display-mode: standalone)').matches ? 'standalone' :
                      window.matchMedia('(display-mode: fullscreen)').matches ? 'fullscreen' :
                      window.matchMedia('(display-mode: minimal-ui)').matches ? 'minimal-ui' :
                      'browser';

  return {
    isPWA,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches,
    isFullscreen: window.matchMedia('(display-mode: fullscreen)').matches,
    isMinimalUI: window.matchMedia('(display-mode: minimal-ui)').matches,
    displayMode,
    platform: navigator.platform,
    userAgent: navigator.userAgent
  };
}

/**
 * Log PWA environment information for debugging
 */
export function logPWAEnvironment(): void {
  const pwaInfo = detectPWAEnvironment();
  
  console.group('🔍 PWA Environment Detection');
  console.log('Is PWA:', pwaInfo.isPWA);
  console.log('Display Mode:', pwaInfo.displayMode);
  console.log('Platform:', pwaInfo.platform);
  console.log('User Agent:', pwaInfo.userAgent);
  console.log('Location:', window.location.href);
  console.log('Base URL:', document.querySelector('base')?.href || 'No base tag');
  console.groupEnd();
}

/**
 * Enhanced error logging with PWA context
 */
export function logErrorWithPWAContext(error: any, context?: string): void {
  const pwaInfo = detectPWAEnvironment();
  
  console.group('❌ Error in PWA Context');
  console.error('Error:', error);
  if (context) console.log('Context:', context);
  console.log('PWA Info:', pwaInfo);
  console.log('Timestamp:', new Date().toISOString());
  console.groupEnd();
}

/**
 * Safe event dispatching with PWA compatibility
 */
export function safeDispatchEvent(eventName: string, detail?: any): boolean {
  try {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
    return true;
  } catch (error) {
    logErrorWithPWAContext(error, `Dispatching event: ${eventName}`);
    return false;
  }
}

/**
 * Safe event listener with PWA compatibility
 */
export function safeAddEventListener(
  eventName: string, 
  handler: EventListener, 
  options?: AddEventListenerOptions
): () => void {
  try {
    window.addEventListener(eventName, handler, options);
    return () => {
      try {
        window.removeEventListener(eventName, handler, options);
      } catch (error) {
        logErrorWithPWAContext(error, `Removing event listener: ${eventName}`);
      }
    };
  } catch (error) {
    logErrorWithPWAContext(error, `Adding event listener: ${eventName}`);
    return () => {}; // No-op cleanup function
  }
}