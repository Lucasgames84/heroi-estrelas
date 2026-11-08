// Service worker: guarda o jogo para funcionar offline depois da primeira visita.
// Ao atualizar o jogo, troque o número da versão abaixo para forçar a atualização.
const CACHE = 'heroi-estrelas-v4';
const ARQUIVOS = [
  './',
  './index.html',
  './jogo.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './sprites/heroi-1.jpg',
  './sprites/heroi-2.jpg',
  './sprites/heroi-3.jpg',
  './sprites/heroi-4.jpg',
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

// Rede primeiro: pega a versão nova quando há internet; sem internet, usa a cópia guardada
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((resp) => {
        if (resp && resp.status === 200 && resp.type === 'basic') {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put(event.request, copia));
        }
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});
