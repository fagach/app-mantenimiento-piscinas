
const CACHE_NAME = "mantenimiento-piscinas-v2";

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
  const solicitud = event.request;

  if (solicitud.method !== "GET") return;

  if (solicitud.mode === "navigate") {
    event.respondWith(
      fetch(solicitud).catch(async () => {
        const cache = await caches.open(CACHE_NAME);

        return (
          await cache.match("./index.html") ||
          await cache.match("./") ||
          Response.error()
        );
      })
    );
    return;
  }

  event.respondWith(
    caches.match(solicitud).then(guardada => {
      if (guardada) return guardada;

      return fetch(solicitud).then(respuesta => {
        if (
          respuesta &&
          respuesta.status === 200 &&
          new URL(solicitud.url).origin === self.location.origin
        ) {
          const copia = respuesta.clone();

          caches.open(CACHE_NAME).then(cache =>
            cache.put(solicitud, copia)
          );
        }

        return respuesta;
      });
    })
  );
});
