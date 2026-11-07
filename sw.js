// App-Hülle offline verfügbar machen. Daten kommen immer live von Supabase.
const V = "erledigt-mobil-21";
const SHELL = ["./", "index.html", "app.css", "app.js", "shared.js", "vendor/supabase.js", "extras.js", "scene.js", "v2.css", "v2.js", "manifest.webmanifest", "icons/icon-192.png"];
self.addEventListener("install", (e) => { self.skipWaiting(); e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL))); });
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // Supabase nie cachen
  // Netz zuerst (immer aktuell), offline aus dem Cache
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then((r) => { const c = r.clone(); caches.open(V).then((ca) => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then((r) => r || caches.match("index.html"))));
});
