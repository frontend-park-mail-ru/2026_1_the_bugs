const STATIC_CACHE = "domdeli-static-v1";
const API_CACHE = "domdeli-api-v1";
const API_TTL = 1 * 60 * 1000;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (/\.(js|css|png|jpg|svg|ico|woff2)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(event.request, response.clone());
          });
          return response;
        });
      })
    );
    return;
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request);
        if (response.ok) {
          const cache = await caches.open(API_CACHE);
          const responseToCache = response.clone();
          await cache.put(event.request, responseToCache);
        }
        return response;
      } catch (e) {
        const cache = await caches.open(API_CACHE);
        const cached = await cache.match(event.request);
        console.log(e)
        if (cached) {
            return cached;
        }
        return new Response(JSON.stringify({ error: "Ошибка сети"}), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      }
    })());
    return;
  }
});