// Service worker minimal : rend l'app installable (PWA) sans jamais toucher
// aux pages (navigation) ni aux appels API. Next.js sert du HTML streamé
// (App Router) — intercepter/cloner ces réponses casse le rendu (page
// blanche). On ne met donc en cache QUE les fichiers statiques immuables
// (icônes, bundles Next hashés), en laissant tout le reste passer tel quel.

const CACHE_NAME = 'shalom-shell-v2';
const SHELL_ASSETS = ['/icons/icon-192.png', '/icons/icon-512.png'];
const CACHEABLE_PREFIXES = ['/icons/', '/_next/static/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => {}) // un asset manquant ne doit jamais bloquer l'installation
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!CACHEABLE_PREFIXES.some((p) => url.pathname.startsWith(p))) return; // navigations, API, etc. : intactes

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
