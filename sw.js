/* Offline cache. Bump CACHE when you change files. */
const CACHE = "gymlog-v10";
const ASSETS = ["./", "./index.html", "./manifest.json", "./catalog.json", "./workouts.json"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

/* Network-first for the shell as well as the data: a re-upload now shows up on the
   next load instead of waiting for a CACHE bump. The cache is the offline fallback. */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
});
