/* Guarda la app para usarla sin conexion. Sube el numero de version al publicar cambios. */
const CACHE = "entreno-v6";
const CORE = ["./", "./index.html", "./fotos.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png"];
self.addEventListener("install", e => {
  /* cache:"reload" evita que el navegador entregue copias viejas guardadas */
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, {cache: "reload"})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const same = new URL(e.request.url).origin === self.location.origin;
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request, {ignoreSearch: true}).then(hit => {
        const req = same ? new Request(e.request.url, {cache: "no-cache"}) : e.request;
        const net = fetch(req).then(res => {
          if (res && (res.ok || res.type === "opaque")) cache.put(e.request, res.clone());
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    )
  );
});
