// Service Worker for نظام إدارة المحامين
const CACHE_NAME = 'lawyer-system-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icon.svg'
];

// Install event - cache assets
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Caching assets');
      return cache.addAll(urlsToCache).catch(err => {
        console.warn('⚠️ Some assets failed to cache:', err);
        // Continue without fully blocking on cache errors
        return Promise.resolve();
      });
    }).catch(err => {
      console.warn('⚠️ Cache open failed:', err);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('✅ Service Worker activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests and API calls by default
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // For HTML, CSS, JS: network first, fall back to cache
  if (event.request.destination === 'document' || 
      event.request.destination === 'script' || 
      event.request.destination === 'style') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('📦 Serving from cache:', event.request.url);
          return caches.match(event.request);
        })
    );
  } 
  // For other assets: cache first, fall back to network
  else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            console.log('📦 Serving from cache:', event.request.url);
            return response;
          }
          return fetch(event.request).then(response => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          });
        })
        .catch(() => {
          console.warn('❌ Failed to fetch:', event.request.url);
          // Return a basic offline response
          return new Response('Offline - resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        })
    );
  }
});

// Message handler - respond to clients safely
self.addEventListener('message', event => {
  console.log('💬 Message received in SW:', event.data);
  // Always respond to messages to prevent "message channel closed" errors
  if (event.ports && event.ports.length > 0) {
    event.ports[0].postMessage({ success: true, message: 'Service Worker received message' });
  }
});

console.log('✅ Service Worker loaded successfully');
