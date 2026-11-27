// Offline cache for the shape generator. Bump VERSION when any listed file changes.
const VERSION = "formas-v1";
const SHELL = [
  "./",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "../public/brand/favicon.svg",
  "../public/fonts/space-grotesk.woff2",
  "../public/fonts/work-sans.woff2",
  "../public/vendor/three/three.module.min.js",
  "../public/vendor/three/addons/geometries/RoundedBoxGeometry.js",
  "../public/vendor/three/addons/environments/RoomEnvironment.js",
  "../public/vendor/gifenc/gifenc.esm.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("formas-") && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first (so a new deploy shows up right away), cache as the offline fallback.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match("./")))
  );
});
