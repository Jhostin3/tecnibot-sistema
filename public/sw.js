const CACHE_NAME = 'tecnibot-shell-v1'
const BASE_PATH = new URL(self.registration.scope).pathname
const APP_SHELL = [
  `${BASE_PATH}`,
  `${BASE_PATH}login`,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}pwa-192.png`,
  `${BASE_PATH}pwa-512.png`,
  `${BASE_PATH}assets/icono_cuy.png`,
  `${BASE_PATH}assets/cuy.png`,
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(`${BASE_PATH}login`)),
    )
    return
  }

  const sameOrigin = new URL(request.url).origin === self.location.origin

  if (!sameOrigin) return

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse

      return fetch(request).then((networkResponse) => {
        const responseClone = networkResponse.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone)
        })

        return networkResponse
      })
    }),
  )
})
