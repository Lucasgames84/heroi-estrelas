// Service worker: guarda o jogo para funcionar offline depois da primeira visita.
// Ao atualizar o jogo, troque o número da versão abaixo para forçar a atualização.
const CACHE = 'heroi-estrelas-v1';
const ARQUIVOS = [
  './',
  './index.html',
  './jogo.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.allSettled(ARQUIVOS.map((a) => cache.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Usa o cache primeiro; se não houver, busca na rede e guarda a cópia
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const rede = fetch(event.request)
        .then((resp) => {
          if (resp && resp.status === 200 && resp.type === 'basic') {
            const copia = resp.clone();
            caches.open(CACHE).then((c) => c.put(event.request, copia));
          }
          return resp;
        })
        .catch(() => cached);
      return cached || rede;
    })
  );
});
