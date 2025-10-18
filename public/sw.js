const CACHE_NAME = 'parkovka-pwa-v1';
const STATIC_CACHE_NAME = 'parkovka-static-v1';
const DYNAMIC_CACHE_NAME = 'parkovka-dynamic-v1';

// Файлы для кеширования при установке
const STATIC_ASSETS = [
  '/',
  '/mobile-app/catalog',
  '/mobile-app/map',
  '/mobile-app/profile',
  '/mobile-app/bookings',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-96x96.svg'
];

// API endpoints для кеширования
const API_CACHE_PATTERNS = [
  /\/api\/spots/,
  /\/api\/bookings/,
  /\/api\/auth/
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Стратегия кеширования для разных типов запросов
  if (request.method === 'GET') {
    // Статические ресурсы - Cache First
    if (STATIC_ASSETS.includes(url.pathname) || 
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js') ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.svg')) {
      
      event.respondWith(
        caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            return fetch(request)
              .then((response) => {
                if (response.status === 200) {
                  const responseClone = response.clone();
                  caches.open(STATIC_CACHE_NAME)
                    .then((cache) => {
                      cache.put(request, responseClone);
                    });
                }
                return response;
              })
              .catch(() => {
                // Возвращаем офлайн страницу для навигации
                if (request.destination === 'document') {
                  return caches.match('/');
                }
              });
          })
      );
    }
    
    // API запросы - Network First с fallback
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            return caches.match(request)
              .then((cachedResponse) => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                
                // Возвращаем базовый ответ для API
                return new Response(
                  JSON.stringify({ 
                    error: 'Офлайн режим', 
                    message: 'Нет подключения к интернету' 
                  }),
                  {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'application/json' }
                  }
                );
              });
          })
      );
    }
    
    // Остальные запросы - Network First
    else {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            return caches.match(request)
              .then((cachedResponse) => {
                if (cachedResponse) {
                  return cachedResponse;
                }
                
                // Для навигационных запросов возвращаем главную страницу
                if (request.destination === 'document') {
                  return caches.match('/');
                }
              });
          })
      );
    }
  }
});

// Обработка push уведомлений
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление от Парковки',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть приложение',
        icon: '/icons/icon-96x96.svg'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/icons/icon-96x96.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Парковка', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Просто закрываем уведомление
    return;
  } else {
    // Клик по телу уведомления
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Синхронизация в фоне
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Здесь можно добавить логику синхронизации данных
      console.log('Background sync completed')
    );
  }
});

// Обработка сообщений от основного потока
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
