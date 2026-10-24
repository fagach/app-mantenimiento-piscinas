
const CACHE_NAME = "mantenimiento-piscinas-v1";

const ARCHIVOS = [
  "./",
  "./index.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(nombres =>
      Promise.all(
        nombres
          .filter(nombre =>
            nombre.startsWith("mantenimiento-piscinas-") &&
            nombre !== CACHE_NAME
          )
          .map(nombre => caches.delete(nombre))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(respuestaGuardada => {
      if (respuestaGuardada) return respuestaGuardada;

      return fetch(event.request).then(respuesta => {
        if (
          respuesta &&
          respuesta.status === 200 &&
          new URL(event.request.url).origin === self.location.origin
        ) {
          const copia = respuesta.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, copia)
          );
        }

        return respuesta;
      });
    })
  );
});
