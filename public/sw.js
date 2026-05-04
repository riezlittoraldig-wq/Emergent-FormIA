/**
 * FormIA Service Worker — Cache stratégique offline-first
 * Stratégie : Network-first pour les données, Cache-first pour les assets statiques
 */

const CACHE_NAME = 'formia-v1'
const CACHE_DURATION_DAYS = 7

// Assets statiques à précacher (ajuster selon le build Next.js)
const STATIC_ASSETS = [
  '/formia',
  '/formia/login',
  '/manifest.json'
]

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[FormIA SW] Installation')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // On tente de précacher, mais on n'échoue pas si une ressource est indispo
      return Promise.allSettled(
        STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => console.warn(`[SW] Impossible de cacher ${url}:`, err.message))
        )
      )
    })
  )
  self.skipWaiting()
})

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[FormIA SW] Activation')
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Suppression ancien cache:', key)
            return caches.delete(key)
          })
      )
    )
  )
  self.clients.claim()
})

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorer les requêtes non-GET, extensions Chrome, Supabase, etc.
  if (request.method !== 'GET') return
  if (url.protocol === 'chrome-extension:') return
  if (url.hostname.includes('supabase.co')) return
  if (url.hostname.includes('supabase.io')) return
  if (url.hostname.includes('googleapis.com')) return

  // Assets Next.js (_next/static) → Cache-first (immutables)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Pages de l'app → Network-first avec fallback cache
  if (url.pathname.startsWith('/formia') || url.pathname === '/') {
    event.respondWith(networkFirstWithFallback(request))
    return
  }

  // Tout le reste → Network-first simple
  event.respondWith(networkFirstWithFallback(request))
})

// ─── Stratégies ───────────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Ressource indisponible hors ligne', { status: 503 })
  }
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    // Fallback ultime : renvoyer la page /formia si dispo
    const fallback = await caches.match('/formia')
    if (fallback) return fallback

    return new Response(
      JSON.stringify({ error: 'Hors ligne', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// ─── Background Sync (optionnel, si supporté) ─────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'formia-sync-drafts') {
    console.log('[FormIA SW] Background sync déclenché')
    // La sync réelle se fait dans OfflineBanner via Dexie + Supabase client
    // Le SW signale juste la disponibilité réseau
    event.waitUntil(
      self.clients.matchAll().then(clients => {
        clients.forEach(client =>
          client.postMessage({ type: 'FORMIA_SYNC_AVAILABLE' })
        )
      })
    )
  }
})
