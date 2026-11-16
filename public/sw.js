const BUILD = 'dev'
const CACHE = 'emgs-' + BUILD

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    await self.clients.claim()
  })())
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return
  event.respondWith((async () => {
    try {
      const fresh = await fetch(req)
      const cache = await caches.open(CACHE)
      cache.put(req, fresh.clone())
      return fresh
    } catch (err) {
      const cached = await caches.match(req)
      if (cached) return cached
      throw err
    }
  })())
})
