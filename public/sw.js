// Service Worker for Workout App PWA
const CACHE_NAME = 'workout-app-v2'

// Only cache static assets, NOT HTML pages
const urlsToCache = [
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
]

// Install event - cache static assets only
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch event - network-first for navigations, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Navigation requests (HTML pages) - always go to network
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        // Offline fallback: return cached page if network fails
        return caches.match(request)
      })
    )
    return
  }

  // Static assets - cache-first
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request)
    })
  )
})
