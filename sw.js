/* Offline cache. Bump CACHE when you change files. */
const CACHE = "gymlog-v4";
const ASSETS = ["./", "./index.html", "./manifest.json", "./catalog.json", "./workouts.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

/* network-first for data, cache-first for the shell */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const isData = /(?:catalog|workouts)\.json/.test(e.request.url);
  if (isData) {
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
  }
});
