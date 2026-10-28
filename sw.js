// FarmaPrecios : l'app marche hors connexion avec les derniers prix telecharges.
const SHELL = "fp-shell-v1";
const DATA = "fp-data";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SHELL && k !== DATA).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.endsWith("precios.json")) {
    // prix : reseau d'abord, sinon la derniere version gardee
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(DATA).then(c => c.put("precios.json", copy));
      return r;
    }).catch(() => caches.open(DATA).then(c => c.match("precios.json"))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
