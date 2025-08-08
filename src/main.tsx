import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import Capacitor for mobile functionality
import { Capacitor } from '@capacitor/core'

// Initialize mobile plugins if running on native platform
if (Capacitor.isNativePlatform()) {
  console.log('📱 Running on native platform - initializing mobile plugins')
  
  // Import App plugin for app state detection
  import('@capacitor/app').then(({ App }) => {
    console.log('📱 App plugin loaded successfully')
  }).catch(error => {
    console.error('❌ Failed to load App plugin:', error)
  })
}

// Register service worker for PWA functionality
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/sw.js')
//       .then((registration) => {
//         console.log('SW registered: ', registration);
        
//         // Listen for updates
//         registration.addEventListener('updatefound', () => {
//           const newWorker = registration.installing;
//           if (newWorker) {
//             newWorker.addEventListener('statechange', () => {
//               if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
//                 // New content available, prompt user to refresh
//                 if (confirm('New version available! Refresh to update?')) {
//                   window.location.reload();
//                 }
//               }
//             });
//           }
//         });
//       })
//       .catch((registrationError) => {
//         console.log('SW registration failed: ', registrationError);
//       });
//   });
// }

// Unregister any existing service workers and clear caches
if ('serviceWorker' in navigator) {
  // Remove existing registrations
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      console.log('Unregistering service worker:', registration);
      registration.unregister();
    }
  });

  // Clear all caches
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('All caches cleared');
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)