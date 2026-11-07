// Erledigt mobil – Extras: Himmel im Kopfbereich, Feierabend-Countdown, Farbschemas.
// Läuft nach app.js (nutzt store, items, mode, iso, todayD, render, $ …) und vor scene.js.
"use strict";

// ---------- Einstellungen (nur auf diesem Handy) ----------
var MINI = false; // für scene.js (Desktop-Code)
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const DESIGN0 = { preset: "standard", place: null, start: "07:30", end: "16:30", w: { scene: true } };
var design = Object.assign({}, DESIGN0, store.get("em-design", {}));
design.w = Object.assign({}, DESIGN0.w, design.w || {});
if (!design.end) design.end = "16:30";
const saveDesign = () => store.set("em-design", design);

const privMode = () => mode === "privat";
const feierabendAt = () => design.end || "";
const arbeitsbeginn = () => design.start || "07:30";
const hm = (s) => { const [h, m] = String(s).split(":").map(Number); return [h || 0, m || 0]; };
// Termin in der Arbeitsliste mit Uhrzeit von–bis überschreibt die Arbeitszeit für den Tag (wie am PC)
function workToday() {
  const k = iso(todayD());
  const t = items.filter((x) => x.list === "arbeit" && !x.archived && x.time && x.timeEnd && x.due && x.due <= k && endDay(x) >= k).sort((a, b) => (a.time < b.time ? -1 : 1));
  return t.length ? { start: t[0].time, end: t.reduce((m, x) => (x.timeEnd > m ? x.timeEnd : m), t[0].timeEnd), title: t[0].title } : null;
}
const workStart = () => workToday()?.start || arbeitsbeginn();
const workEnd = () => workToday()?.end || feierabendAt();
function feierabendText() {
  const now = new Date(), wd = now.getDay(), ov = workToday();
  if (!workEnd()) return null;
  if ((wd === 0 || wd === 6) && !ov) return { t: privMode() ? "Wochenende. Genieß es." : "Wochenende. Was machst du hier?", party: true };
  const [h, m] = hm(workEnd()), end = new Date(now); end.setHours(h, m, 0, 0);
  const start = new Date(now); start.setHours(...hm(workStart()), 0, 0);
  const mins = Math.round((end - now) / 60000);
  if (now < start) return { t: ov ? `${ov.title} ab ${ov.start}` : `Arbeit ab ${workStart()}`, party: false };
  if (mins <= 0) return { t: privMode() ? "Feierabend. Endlich." : "Feierabend. Ab nach Hause.", party: true };
  const hh = Math.floor(mins / 60), mm = mins % 60;
  return { t: `Feierabend in ${hh ? hh + " Std " : ""}${mm} Min`, party: mins <= 30 };
}
const CLOCK = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
function feierUpdate() {
  let el = $("feier");
  if (!el) { el = document.createElement("button"); el.type = "button"; el.id = "feier"; el.className = "feier"; document.querySelector(".top-txt").appendChild(el); }
  const f = feierabendText();
  el.hidden = !f; if (!f) return;
  el.classList.toggle("party", !!f.party);
  el.innerHTML = CLOCK + esc(f.t);
}

// ---------- Farbschemas (wie am PC) ----------
const PRESETS = {
  standard: { name: "Standard", a: "#6F5CF0", ad: "#8B7CF6" },
  ozean: { name: "Ozean", a: "#0284C7", ad: "#38BDF8", bg: "#EEF5F9", bgd: "#0B1419", card_d: "#111D24", chip_d: "#182833" },
  wald: { name: "Wald", a: "#15803D", ad: "#4ADE80", bg: "#F1F5EE", bgd: "#0C130F", card_d: "#121C16", chip_d: "#1A271F" },
  sunset: { name: "Sonnenuntergang", a: "#EA580C", ad: "#FB923C", bg: "#FBF3EC", bgd: "#160F0C", card_d: "#211612", chip_d: "#2D1E18" },
  beere: { name: "Beere", a: "#BE185D", ad: "#F472B6", bg: "#FBF1F5", bgd: "#160C11", card_d: "#22131B", chip_d: "#2E1A25" },
  ritterwand: { name: "Ritterwand", a: "#3F8576", ad: "#6FC0AD", bg: "#F2F6F5", bgd: "#0E1514", card_d: "#15201E", chip_d: "#1D2B28" },
  papier: { name: "Papier", a: "#9A6B3F", ad: "#B07B45", vl: "--bg:#F4EFE6;--card:#FBF8F2;--fg:#3B342C;--muted:#776B5E;--faint:#A09484;--line:#E3DACB;--chip:#EDE5D7;", vd: "--bg:#1C1915;--card:#24201B;--fg:#E3D9CA;--muted:#A89C8B;--faint:#7E7365;--line:#332D26;--chip:#2C2721;" },
  nord: { name: "Nord", a: "#5E81AC", ad: "#81A1C1", vl: "--bg:#ECEFF4;--card:#F7F9FC;--fg:#2E3440;--muted:#4C566A;--faint:#7B8597;--line:#D8DEE9;--chip:#E5E9F0;", vd: "--bg:#2E3440;--card:#3B4252;--fg:#D8DEE9;--muted:#A3ABBA;--faint:#7B8597;--line:#434C5E;--chip:#434C5E;" },
  salbei: { name: "Salbei", a: "#5F8566", ad: "#7FA887", vl: "--bg:#EEF1EA;--card:#F8FAF5;--fg:#2F3A31;--muted:#66735F;--faint:#8F9A88;--line:#DCE3D6;--chip:#E5EBDF;", vd: "--bg:#171C18;--card:#1F2620;--fg:#DCE5D8;--muted:#9AA894;--faint:#738069;--line:#2C352D;--chip:#273028;" },
  lavendel: { name: "Lavendel", a: "#7C6FB0", ad: "#9D90D6", vl: "--bg:#F2F0F7;--card:#FBFAFE;--fg:#34304A;--muted:#6E6888;--faint:#958FAD;--line:#E1DDEC;--chip:#EAE7F3;", vd: "--bg:#18161F;--card:#211E2A;--fg:#E2DEEE;--muted:#A39DBB;--faint:#78728F;--line:#2E2A3A;--chip:#2A2635;" },
  graphit: { name: "Graphit", a: "#5B6B7C", ad: "#8296AB", vl: "--bg:#EFEFEE;--card:#FAFAF9;--fg:#33363A;--muted:#6B6E73;--faint:#94979B;--line:#DEDEDC;--chip:#E7E7E5;", vd: "--bg:#1E1F21;--card:#26282B;--fg:#D4D5D7;--muted:#9A9DA1;--faint:#73767A;--line:#333538;--chip:#2E3033;" },
};
function applyDesign() {
  const p = PRESETS[design.preset] || PRESETS.standard;
  let L = `--accent:${p.a};--accent-2:${p.ad};--on-party:#fff;`, D = `--accent:${p.ad};--accent-2:${p.a};--on-party:#10131A;`;
  if (p.bg) L += `--bg:${p.bg};`;
  if (p.bgd) D += `--bg:${p.bgd};`;
  if (p.card_d) D += `--card:${p.card_d};`;
  if (p.chip_d) D += `--chip:${p.chip_d};`;
  if (p.vl) L += p.vl;
  if (p.vd) D += p.vd;
  let el = $("design-css");
  if (!el) { el = document.createElement("style"); el.id = "design-css"; document.head.appendChild(el); }
  el.textContent = `:root{${L}}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${D}}}:root[data-theme="dark"]{${D}}`;
  if (design.theme === "light" || design.theme === "dark") document.documentElement.dataset.theme = design.theme; else delete document.documentElement.dataset.theme;
  // Statusleiste in der Hintergrundfarbe
  requestAnimationFrame(() => { const bg = getComputedStyle(document.body).backgroundColor; document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", bg)); });
}

// ---------- Einstellungen erweitern ----------
const setOpen0 = openSet;
openSet = function () {
  setOpen0();
  const pl = design.place || { name: "Nufringen" };
  const sw = Object.entries(PRESETS).map(([k, p]) => `<button type="button" class="swatch" data-preset="${k}" aria-pressed="${design.preset === k}" style="--a:${p.a};--b:${p.ad}"><i></i><span>${p.name}</span></button>`).join("");
  const html = `
    <h3 class="set-h">Hell oder dunkel</h3>
    <div class="modes" id="ex-theme">${[["system", "Wie Handy"], ["light", "Hell"], ["dark", "Dunkel"]].map(([k, n]) => `<button type="button" data-theme-opt="${k}" aria-pressed="${(design.theme || "system") === k}">${n}</button>`).join("")}</div>
    <h3 class="set-h">Farbe</h3><div class="swatches">${sw}</div>
    <h3 class="set-h" id="set-work">Arbeitszeit</h3>
    <div class="set-row"><span>Von – bis</span><span class="set-time"><input type="time" id="ex-von" value="${esc(arbeitsbeginn())}"> – <input type="time" id="ex-bis" value="${esc(design.end || "16:30")}"></span></div>
    <h3 class="set-h">Himmel oben</h3>
    <label class="set-row"><span>Landschaft mit Wetter</span><input type="checkbox" id="ex-scene" class="sw" ${design.w.scene ? "checked" : ""}></label>
    <div class="set-row col"><span>Wetter-Ort: <b id="ex-cur">${esc(pl.name)}</b></span><span class="set-place"><input id="ex-ort" placeholder="Stadt suchen …" enterkeyhint="search"><button type="button" class="btn" id="ex-find">Suchen</button></span><span class="set-hits" id="ex-hits"></span></div>
    <h3 class="set-h">App</h3>
    <div class="set-row"><span>Neueste Version holen</span><button type="button" class="btn" id="ex-upd" style="padding:8px 14px;font-size:15px">Aktualisieren</button></div>
    <h3 class="set-h">Konto</h3>`;
  $("set").querySelector("h2").insertAdjacentHTML("afterend", html);
};
async function placeFind() {
  const q = $("ex-ort").value.trim(); if (!q) return;
  $("ex-hits").innerHTML = '<small class="muted">Suche …</small>';
  try {
    const j = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=de&format=json`)).json();
    const r = j.results || [];
    $("ex-hits").innerHTML = r.length ? r.map((x) => `<button type="button" class="chip" data-place='${esc(JSON.stringify({ name: x.name, lat: +x.latitude.toFixed(3), lon: +x.longitude.toFixed(3) }))}'>${esc(x.name)} <small class="muted">${esc(x.admin1 || x.country || "")}</small></button>`).join("") : '<small class="muted">Nichts gefunden.</small>';
  } catch { $("ex-hits").innerHTML = '<small class="muted">Keine Verbindung zur Ortssuche.</small>'; }
}
const changed = () => { saveDesign(); feierUpdate(); if (typeof sceneSync === "function") sceneSync(); };
$("set").addEventListener("click", (e) => {
  const p = e.target.closest("[data-preset]");
  if (p) { design.preset = p.dataset.preset; saveDesign(); applyDesign(); document.querySelectorAll("[data-preset]").forEach((b) => b.setAttribute("aria-pressed", String(b === p))); return; }
  const th = e.target.closest("[data-theme-opt]");
  if (th) { design.theme = th.dataset.themeOpt; saveDesign(); applyDesign(); document.querySelectorAll("[data-theme-opt]").forEach((b) => b.setAttribute("aria-pressed", String(b === th))); return; }
  if (e.target.id === "ex-find") { placeFind(); return; }
  if (e.target.id === "ex-upd") { forceUpdate(e.target); return; }
  const pl = e.target.closest("[data-place]");
  if (pl) { design.place = JSON.parse(pl.dataset.place); $("ex-cur").textContent = design.place.name; $("ex-hits").innerHTML = ""; $("ex-ort").value = ""; saveDesign(); window.__scene?.reloadWeather?.(); }
});
$("set").addEventListener("change", (e) => {
  const id = e.target.id;
  if (id === "ex-von" && /^\d{2}:\d{2}$/.test(e.target.value)) { design.start = e.target.value; changed(); }
  else if (id === "ex-bis" && /^\d{2}:\d{2}$/.test(e.target.value)) { design.end = e.target.value; changed(); }
  else if (id === "ex-scene") { design.w.scene = e.target.checked; changed(); }
});
$("set").addEventListener("keydown", (e) => { if (e.target.id === "ex-ort" && e.key === "Enter") { e.preventDefault(); placeFind(); } });
document.addEventListener("click", (e) => { if (e.target.closest("#feier")) { openSet(); setTimeout(() => $("set-work")?.scrollIntoView({ block: "start", behavior: "smooth" }), 80); } });

// ---------- Update von Hand: Cache leeren, alles frisch laden ----------
async function forceUpdate(btn) {
  btn.disabled = true; btn.textContent = "Lädt …";
  try {
    const files = ["./", "index.html", "app.css", "app.js", "shared.js", "extras.js", "scene.js", "v2.css", "v2.js", "vendor/supabase.js", "manifest.webmanifest", "sw.js"];
    await Promise.all(files.map((f) => fetch(f, { cache: "reload" }).catch(() => {})));
    if ("serviceWorker" in navigator) for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister();
    if (window.caches) for (const k of await caches.keys()) await caches.delete(k);
  } catch {}
  location.replace(location.pathname + "?v=" + Date.now());
}
// Neue Version übernimmt → einmal neu laden, damit man sie sofort sieht
if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (!reloaded) { reloaded = true; location.reload(); } });
}

// ---------- Sheets: Hintergrund sperren, über der Tastatur bleiben ----------
const wraps = [...document.querySelectorAll(".sheet-wrap")];
const lockSync = () => document.body.classList.toggle("locked", wraps.some((w) => !w.hidden));
new MutationObserver(lockSync).observe(document.body, { subtree: true, attributes: true, attributeFilter: ["hidden"] });
if (window.visualViewport) {
  const kb = () => { const v = visualViewport, off = Math.max(0, innerHeight - v.height - v.offsetTop); document.documentElement.style.setProperty("--kb", off > 60 ? off + "px" : "0px"); };
  visualViewport.addEventListener("resize", kb); visualViewport.addEventListener("scroll", kb);
}

// ---------- Neue Aufgabe kurz hervorheben ----------
let freshId = null;
const addItem0 = addItem;
addItem = function (p) { const id = addItem0(p); freshId = id; requestAnimationFrame(() => { document.querySelector(`.task-wrap[data-id="${id}"]`)?.classList.add("fresh"); freshId = null; }); return id; };

// ---------- Einhängen ----------
const render0 = render;
const WD_S = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], MO_S = ["Jan", "Feb", "März", "Apr", "Mai", "Juni", "Juli", "Aug", "Sep", "Okt", "Nov", "Dez"];
render = function () { render0(); if (loaded) { const n = new Date(), h = n.getHours(); $("greet").textContent = `${h < 11 ? "Guten Morgen" : h < 18 ? "Guten Tag" : "Guten Abend"} · ${WD_S[n.getDay()]}, ${n.getDate()}. ${MO_S[n.getMonth()]}`; feierUpdate(); if (typeof sceneSync === "function") sceneSync(); } };
applyDesign();
feierUpdate();
