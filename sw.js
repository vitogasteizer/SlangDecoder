const CACHE_NAME = 'teen-slang-decoder-v1';
const urlsToCache = [
  './',
  './index.html',
  './index.tsx',
  './manifest.json',
  './metadata.json',
  './App.tsx',
  './types.ts',
  './components/Header.tsx',
  './components/Library.tsx',
  './components/Search.tsx',
  './contexts/LanguageContext.tsx',
  './data/codes.en.ts',
  './data/codes.es.ts',
  './data/codes.ka.ts',
  './locales/en.json',
  './locales/es.json',
  './locales/ka.json',
  './services/geminiService.ts',
  // External assets
  'https://cdn.tailwindcss.com',
  'https://i.postimg.cc/8zSXV3Rt/Slang-Decoder.png',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/client',
  'https://aistudiocdn.com/@google/genai@^1.27.0'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        const cachePromises = urlsToCache.map(urlToCache => {
            return cache.add(urlToCache).catch(err => {
                console.warn(`Failed to cache ${urlToCache}:`, err);
            });
        });
        return Promise.all(cachePromises);
      })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      const fetchedResponsePromise = fetch(event.request).then(
          (networkResponse) => {
              if (networkResponse.ok || networkResponse.type === 'opaque') {
                  cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
          },
      ).catch(error => {
          console.error('Fetch failed:', error);
          throw error;
      });

      return cachedResponse || fetchedResponsePromise;
    }),
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
