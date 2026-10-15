/* Offline cache. Bump CACHE when you change files. */
const CACHE = "gymlog-v19";
const ASSETS = ["./", "./index.html", "./manifest.json", "./catalog.json", "./workouts.json"];

/* Optional extras: cached when present, ignored when not. body.svg is the
   hand-editable muscle map - rename body_draft.svg to body.svg to switch it on. */
const OPTIONAL = ["./body.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c =>
    c.addAll(ASSETS).then(() =>
      Promise.all(OPTIONAL.map(u => c.add(u).catch(() => null))))
  ).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

/* Network-first for the shell as well as the data: a re-upload shows up on the
   next load instead of waiting for a CACHE bump. The cache is the offline fallback. */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => {
    const copy = r.clone();
    if (r.ok) caches.open(CACHE).then(c => c.put(e.request, copy));
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
});
