// Estuda.AI — Service Worker
// Estratégia: cache-first para assets estáticos, network-only para APIs

const CACHE_NAME = 'estudaai-v1.9.0';

// Recursos pré-cacheados na instalação (app shell)
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
];

// CDN externos para cachear dinamicamente (on fetch)
const CACHEABLE_ORIGINS = [
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

// Domínios de API — nunca cacheados, sempre via rede
const API_ORIGINS = [
  'api.anthropic.com',
  'supabase.co',
];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(err => {
        // Não falhar a instalação por recursos indisponíveis
        console.warn('[SW] Precache parcial:', err);
        return self.skipWaiting();
      })
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;

  // Ignorar não-GET
  if (request.method !== 'GET') return;

  let url;
  try { url = new URL(request.url); } catch { return; }

  // APIs externas — deixar passar sem cache
  if (API_ORIGINS.some(d => url.hostname.includes(d))) return;

  event.respondWith(handleFetch(request, url));
});

async function handleFetch(request, url) {
  const isSameOrigin = url.origin === self.location.origin;
  const isCacheableCDN = CACHEABLE_ORIGINS.some(d => url.hostname.includes(d));

  // 1. Tentar cache primeiro
  const cached = await caches.match(request);
  if (cached) return cached;

  // 2. Buscar na rede
  try {
    const response = await fetch(request);
    if (!response.ok) return response;

    // 3. Cachear resposta se for origem confiável
    if (isSameOrigin || isCacheableCDN) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
    }
    return response;
  } catch {
    // 4. Offline: retornar index.html para navegação
    if (request.mode === 'navigate') {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }
    // Outros recursos: falhar silenciosamente
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

// ─── Mensagem de controle (para forçar atualização) ───────────────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
