// Kage PWA Service Worker
// Version 1.1.0

const CACHE_NAME = 'kage-v1.1.0';
const STATIC_CACHE_NAME = 'kage-static-v1.1.0';
const DYNAMIC_CACHE_NAME = 'kage-dynamic-v1.1.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/kage-app/',
  '/kage-app/index.html',
  '/kage-app/manifest.json',
  '/kage-app/icons/kage-logo.svg',
  '/kage-app/icons/icon-192x192.svg',
  '/kage-app/icons/icon-512x512.svg'
];

// Dynamic assets that will be cached as requested
const DYNAMIC_ASSETS_PATTERNS = [
  /^\/kage-app\/src\//,
  /^\/kage-app\/assets\//,
  /^\/kage-app\/node_modules\//
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Static caching failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle navigation requests (HTML pages) - Network first for fresh assets
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Update cache with fresh HTML
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME)
              .then((cache) => {
                cache.put('/kage-app/', responseClone);
              });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback to cached version if network fails
          return caches.match('/kage-app/');
        })
    );
    return;
  }
  
  // Handle API requests (localStorage operations don't need network)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Offline - API unavailable' }),
            { 
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }
  
  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // For dynamic assets, cache them after fetching
        return fetch(request)
          .then((networkResponse) => {
            // Check if we should cache this resource
            const shouldCache = DYNAMIC_ASSETS_PATTERNS.some(pattern => 
              pattern.test(url.pathname)
            );
            
            if (shouldCache && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            
            return networkResponse;
          })
          .catch(() => {
            // If network fails, try to return a cached version
            return caches.match(request);
          });
      })
  );
});

// Background sync for data synchronization
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync data with server when connection is restored
      syncDataWithServer()
    );
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from Kage',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Kage', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function for data synchronization
async function syncDataWithServer() {
  try {
    console.log('Service Worker: Syncing data with server...');
    
    // Get all data from localStorage that needs to be synced
    const allClients = await clients.matchAll();
    
    if (allClients.length > 0) {
      // Send message to the main thread to handle data sync
      allClients[0].postMessage({
        type: 'SYNC_DATA',
        timestamp: Date.now()
      });
    }
    
    console.log('Service Worker: Data sync completed');
  } catch (error) {
    console.error('Service Worker: Data sync failed', error);
  }
}

// Cache size management
async function manageCacheSize() {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const keys = await cache.keys();
  
  // Keep only the most recent 50 dynamic assets
  if (keys.length > 50) {
    const oldestKeys = keys.slice(0, keys.length - 50);
    await Promise.all(
      oldestKeys.map(key => cache.delete(key))
    );
  }
}

// Run cache management periodically
setInterval(manageCacheSize, 60000); // Every minute