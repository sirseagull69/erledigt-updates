// Erledigt mobil – Push-Erinnerungen (Web-Push).
// Der Server (Supabase-Funktion push-reminders, läuft jede Minute) schickt zur Uhrzeit einer Aufgabe
// und ab 8 Uhr die Tagesübersicht – gleiche Regeln wie die Desktop-App.
// Hier: Erlaubnis holen, Gerät in push_subs eintragen/austragen, Antippen öffnet die Aufgabe.
"use strict";
const VAPID_PUBLIC = "BL9LO55gCavAEJtr2_fy_IQ7LcNDLnNFdBEgDsKX_ZXMn9oMVMdi3cavlvuINUsl-nK4_2MoD5hqtQnjbToJ40I";
const IS_APK = /ErledigtAndroid/.test(navigator.userAgent);
const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const STANDALONE = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const pushOk = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
const b64u = (s) => { const p = "=".repeat((4 - (s.length % 4)) % 4), b = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(b, (c) => c.charCodeAt(0)); };
const deviceName = () => IS_APK ? "Android-App" : IS_IOS ? "iPhone/iPad" : /Android/.test(navigator.userAgent) ? "Android" : /Mac/.test(navigator.userAgent) ? "Mac" : /Windows/.test(navigator.userAgent) ? "Windows" : "Browser";
const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Berlin"; } catch { return "Europe/Berlin"; } };

async function currentSub() {
  if (!pushOk()) return null;
  const reg = await navigator.serviceWorker.getRegistration();
  return reg ? reg.pushManager.getSubscription() : null;
}
async function saveSub(sub) {
  const j = sub.toJSON();
  const { error } = await sb.from("push_subs").upsert({ endpoint: j.endpoint, user_id: session.user.id, p256dh: j.keys.p256dh, auth: j.keys.auth, device: deviceName(), tz: tz() });
  if (error) throw error;
}
async function pushOn() {
  if (await Notification.requestPermission() !== "granted") throw new Error("Mitteilungen sind für Erledigt blockiert – in den Handy-Einstellungen erlauben.");
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(VAPID_PUBLIC) });
  await saveSub(sub);
}
async function pushOff() {
  const sub = await currentSub(); if (!sub) return;
  await sb.from("push_subs").delete().eq("endpoint", sub.endpoint);
  await sub.unsubscribe().catch(() => {});
}

// Zeile in den Einstellungen
function pushRow(state) {
  if (IS_APK) return `<div class="set-row col"><span>In dieser App gehen keine Push-Mitteilungen.</span><span class="muted" style="font-size:14px">Öffne <b>sirseagull69.github.io/erledigt-updates</b> in Chrome → Menü ⋮ → „Zum Startbildschirm hinzufügen“. Diese Version bekommt Erinnerungen, die APK kannst du dann löschen.</span></div>`;
  if (IS_IOS && !STANDALONE) return `<div class="set-row col"><span>Erst zum Home-Bildschirm hinzufügen</span><span class="muted" style="font-size:14px">iPhone schickt Mitteilungen nur an die Home-Bildschirm-App: Teilen → „Zum Home-Bildschirm“, dann dort öffnen und hier einschalten.</span></div>`;
  if (!pushOk()) return `<div class="set-row"><span>Mitteilungen</span><span class="muted" style="font-size:14px">Dieser Browser kann das nicht</span></div>`;
  return `<label class="set-row"><span>Erinnerungen aufs Handy<br><small class="muted">Zur Uhrzeit einer Aufgabe und morgens die Übersicht</small></span><input type="checkbox" id="push-sw" class="sw" ${state ? "checked" : ""}></label>`;
}
const setOpenPush = openSet;
openSet = function () {
  setOpenPush();
  $("set").querySelector("h2").insertAdjacentHTML("afterend", `<h3 class="set-h">Erinnerungen</h3><div id="push-row">${pushRow(false)}</div>`);
  currentSub().then((s) => { const sw = $("push-sw"); if (sw) sw.checked = !!s && Notification.permission === "granted"; }).catch(() => {});
};
$("set").addEventListener("change", async (e) => {
  if (e.target.id !== "push-sw") return;
  const sw = e.target; sw.disabled = true;
  try {
    if (sw.checked) { await pushOn(); toast("Erinnerungen sind an"); } else { await pushOff(); toast("Erinnerungen sind aus"); }
  } catch (err) { sw.checked = !sw.checked; toast(String(err.message || err)); }
  finally { sw.disabled = false; }
});

// Abmelden: dieses Gerät austragen, damit hier keine Erinnerungen des alten Kontos mehr ankommen
$("set").addEventListener("click", async (e) => {
  if (e.target.id !== "logout") return;
  e.stopImmediatePropagation(); e.target.disabled = true;
  await pushOff().catch(() => {}); // muss vor dem Abmelden passieren (RLS)
  await sb.auth.signOut(); closeSheet($("set-wrap"));
}, true);

// Nach dem Anmelden: Abo auffrischen (falls das Handy einen neuen Endpunkt vergeben hat)
sb.auth.onAuthStateChange((_ev, s) => { if (s) currentSub().then((sub) => sub && Notification.permission === "granted" && saveSub(sub)).catch(() => {}); });

// Mitteilung angetippt → Aufgabe öffnen
function openTaskFromPush(id) {
  if (!id) return;
  const tryOpen = (n) => { if (loaded && items.some((t) => t.id === id)) openDet(id); else if (n > 0) setTimeout(() => tryOpen(n - 1), 300); };
  tryOpen(30);
}
navigator.serviceWorker?.addEventListener("message", (e) => { if (e.data?.type === "open-task") openTaskFromPush(e.data.task); });
const qTask = new URLSearchParams(location.search).get("task");
if (qTask) { history.replaceState(null, "", location.pathname); openTaskFromPush(qTask); }
