// Service Worker المتقدم v7.0
const CACHE_VERSION = 'v7.0.0';
const CACHE_NAME = `lawyer-system-${CACHE_VERSION}`;

// الملفات الأساسية للتخزين المؤقت
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/manifest.json'
];

// استراتيجية التخزين المؤقت: Cache First مع Fallback
const CACHE_STRATEGIES = {
  cacheFirst: ['css', 'js', 'png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'woff', 'woff2', 'ttf', 'eot'],
  networkFirst: ['html', 'json']
};

// التثبيت - تخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v7.0...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Cache failed:', err))
  );
});

// التفعيل - حذف الكاش القديم
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v7.0');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// جلب الملفات - استراتيجية ذكية
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // تجاهل الطلبات الخارجية
  if (url.origin !== location.origin) {
    return;
  }

  const extension = url.pathname.split('.').pop();

  // استراتيجية Cache First للملفات الثابتة
  if (CACHE_STRATEGIES.cacheFirst.includes(extension)) {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) {
            console.log('[SW] Serving from cache:', url.pathname);
            return cached;
          }
          
          return fetch(request)
            .then(response => {
              // تخزين النسخة الجديدة
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, response.clone());
                  return response;
                });
            });
        })
        .catch(() => {
          // إذا فشل كل شيء، عرض صفحة offline
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        })
    );
  }
  // استراتيجية Network First للـ HTML و JSON
  else if (CACHE_STRATEGIES.networkFirst.includes(extension) || request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // تخزين النسخة الجديدة
          return caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, response.clone());
              return response;
            });
        })
        .catch(() => {
          // إذا لا يوجد إنترنت، استخدم الكاش
          return caches.match(request)
            .then(cached => {
              if (cached) {
                console.log('[SW] Serving from cache (offline):', url.pathname);
                return cached;
              }
              // آخر حل: الصفحة الرئيسية
              return caches.match('/index.html');
            });
        })
    );
  }
});

// معالجة رسائل من التطبيق
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then(names => Promise.all(names.map(name => caches.delete(name))))
        .then(() => console.log('[SW] All caches cleared'))
    );
  }
});

// إرسال إشعار عند التحديث
self.addEventListener('controllerchange', () => {
  console.log('[SW] Controller changed - new version active');
});
