// AUTOMATISCH ERZEUGT (build/web.js). App-Hülle offline; Daten kommen immer live von Supabase.
const V = "erledigt-web-2.8.9";
const SHELL = ["./", "index.html", "styles.css", "web.css", "app.js", "vendor/supabase.js", "vendor/fonts/bricolage-grotesque-latin-500-normal.woff2", "vendor/fonts/bricolage-grotesque-latin-700-normal.woff2", "vendor/fonts/bricolage-grotesque-latin-800-normal.woff2", "vendor/fonts/inter-latin-wght-normal.woff2", "vendor/fonts/space-grotesk-latin-700-normal.woff2", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
self.addEventListener("install", (e) => { self.skipWaiting(); e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL))); });
self.addEventListener("activate", (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // Supabase nie cachen
  e.respondWith(fetch(e.request, { cache: "no-cache" }).then((r) => { const c = r.clone(); caches.open(V).then((ca) => ca.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then((r) => r || caches.match("index.html"))));
});
// Push-Erinnerung vom Server (Supabase-Funktion push-reminders)
self.addEventListener("push", (e) => {
  let d = {}; try { d = e.data.json(); } catch { d = { title: "Erledigt", body: e.data?.text() || "" }; }
  const actions = d.task && d.sig ? [{ action: "done", title: "✓ Erledigt" }, { action: "snooze", title: "In 15 Min" }] : [];
  e.waitUntil(self.registration.showNotification(d.title || "Erledigt", { body: d.body || "", tag: d.tag || undefined, renotify: true, icon: "icons/icon-192.png", badge: "icons/icon-192.png", actions, data: { task: d.task || null, uid: d.uid, exp: d.exp, sig: d.sig, tz: d.tz } }));
});
const ACTION_URL = "https://ovosbxkwqgxxfekrtlov.supabase.co/functions/v1/push-action";
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const data = e.notification.data || {}, task = data.task;
  if ((e.action === "done" || e.action === "snooze") && data.sig) {
    return e.waitUntil(fetch(ACTION_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, action: e.action }) })
      .then((r) => { if (!r.ok) throw new Error(r.status); }).catch(() => self.clients.openWindow("./?task=" + encodeURIComponent(task))));
  }
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((cs) => {
    const c = cs.find((x) => new URL(x.url).origin === location.origin);
    if (c) { if (task) c.postMessage({ type: "open-task", task }); return c.focus(); }
    return self.clients.openWindow("./" + (task ? "?task=" + encodeURIComponent(task) : ""));
  }));
});
