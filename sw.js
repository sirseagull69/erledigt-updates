// App-Hülle offline verfügbar machen. Daten kommen immer live von Supabase.
importScripts("version.js");
const V = "erledigt-mobil-" + APP_VERSION;
const SHELL = ["./", "index.html", "version.js", "app.css", "app.js", "shared.js", "vendor/supabase.js", "extras.js", "scene.js", "push.js",
  "fonts/inter-latin-wght-normal.woff2", "fonts/bricolage-grotesque-latin-700-normal.woff2", "fonts/bricolage-grotesque-latin-800-normal.woff2",
  "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", (e) => { self.skipWaiting(); e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL))); });
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // Supabase nie cachen
  // Netz zuerst (immer aktuell), offline aus dem Cache
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then((r) => { const c = r.clone(); caches.open(V).then((ca) => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then((r) => r || caches.match("index.html"))));
});

// Push-Erinnerung vom Server (Supabase-Funktion push-reminders)
self.addEventListener("push", (e) => {
  let d = {}; try { d = e.data.json(); } catch { d = { title: "Erledigt", body: e.data?.text() || "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Erledigt", {
    body: d.body || "", tag: d.tag || undefined, renotify: true, icon: "icons/icon-192.png", badge: "icons/icon-192.png", data: { task: d.task || null },
  }));
});
// Antippen: offene App nach vorne holen (und Aufgabe öffnen), sonst neu starten
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const task = e.notification.data?.task;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    const c = cs.find((x) => new URL(x.url).origin === location.origin);
    if (c) { if (task) c.postMessage({ type: "open-task", task }); return c.focus(); }
    return self.clients.openWindow("./" + (task ? "?task=" + encodeURIComponent(task) : ""));
  }));
});
