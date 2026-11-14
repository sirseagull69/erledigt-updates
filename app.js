// AUTOMATISCH ERZEUGT (build/web.js) – Erledigt 2.9.2 als Web-App
(() => {
// ===== 01-grundlagen.js =====
// ---------- Konstanten ----------
const LISTS = [ // alle Listen; welche in der Seitenleiste stehen, hängt vom Modus ab (Arbeit/Privat)
  { id: "alle", name: "Alle Aufgaben", dot: "#F5F3EF" },
  { id: "arbeit", name: "Arbeit", dot: "#60A5FA" },
  { id: "privat", name: "Privat", dot: "#FB923C" },
  { id: "projekte", name: "Projekte", dot: "#34D399" },
  { id: "haushalt", name: "Haushalt", dot: "#A78BFA" },
  { id: "einkaufen", name: "Einkaufen", dot: "#F472B6" },
  { id: "termine", name: "Termine", dot: "#FBBF24" },
];
// ---------- Modus: Arbeit (Standard) oder Privat – im Design-Menü ----------
function privMode() { try { return design.mode === "privat"; } catch { return false; } } // design kommt erst in Teil 04
// Strikt getrennt: im Arbeitsmodus ist nichts Privates zu sehen (Listen, Zähler, Suche, Kalender, Planung, Assistent) – und umgekehrt.
const MODE_LISTS = { arbeit: ["alle", "arbeit", "projekte"], privat: ["alle", "privat", "haushalt", "einkaufen", "termine"] };
const modeHas = (l) => MODE_LISTS[privMode() ? "privat" : "arbeit"].includes(l);
const inMode = (t) => modeHas(t.list);
function shownLists() { const ids = MODE_LISTS[privMode() ? "privat" : "arbeit"]; return LISTS.filter((l) => ids.includes(l.id)); }
const defList = () => (privMode() ? "privat" : "arbeit");
const PRIOS = [
  { id: "hoch", name: "Hoch", dot: "var(--danger)" },
  { id: "mittel", name: "Mittel", dot: "var(--warn)" },
  { id: "niedrig", name: "Niedrig", dot: "var(--low)" },
];
const PRIO_RANK = { hoch: 0, mittel: 1, niedrig: 2 };
const listById = Object.fromEntries(LISTS.map((l) => [l.id, l]));
const prioById = Object.fromEntries(PRIOS.map((p) => [p.id, p]));

// ---------- Datum ----------
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const todayD = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const WD = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MON = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const diffDays = (s) => Math.round((parseIso(s) - todayD()) / 864e5);
function dueLabel(s) {
  const n = diffDays(s);
  if (n === 0) return "Heute";
  if (n === 1) return "Morgen";
  if (n === -1) return "Gestern";
  const d = parseIso(s);
  if (n > 1 && n < 7) return WD[d.getDay()].slice(0, 2) + ".";
  return `${d.getDate()}.${d.getMonth() + 1}.` + (d.getFullYear() !== todayD().getFullYear() ? String(d.getFullYear()).slice(2) : "");
}
const nextMonday = () => ((1 - todayD().getDay() + 7) % 7) || 7;

// ---------- Wiederholen ----------
const WDS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const WD_PLURAL = { sonntags: 0, montags: 1, dienstags: 2, mittwochs: 3, donnerstags: 4, freitags: 5, samstags: 6 };
function matchRule(rule, d) {
  if (rule === "daily") return true;
  if (rule === "weekdays") return d.getDay() >= 1 && d.getDay() <= 5;
  if (rule.startsWith("weekly:")) return rule.slice(7).split(",").map(Number).includes(d.getDay());
  if (rule.startsWith("monthly:")) { const n = +rule.slice(8), last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); return d.getDate() === Math.min(n, last); }
  return false;
}
function nextOcc(rule, start) { let d = new Date(start); d.setHours(0, 0, 0, 0); for (let i = 0; i < 400; i++) { if (matchRule(rule, d)) return d; d = addDays(d, 1); } return d; }
// Erstes Vorkommen ab heute – ist heute dran, die Uhrzeit aber schon vorbei, dann das nächste
function firstOcc(rule, time) {
  const d = nextOcc(rule, todayD());
  const hm = `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`;
  return iso(d) === iso(todayD()) && time && time <= hm ? nextOcc(rule, addDays(todayD(), 1)) : d;
}
function repLabel(r) {
  if (!r) return "";
  if (r === "daily") return "täglich";
  if (r === "weekdays") return "werktags";
  if (r.startsWith("weekly:")) { const ds = r.slice(7).split(",").map(Number); return ds.length === 1 ? Object.keys(WD_PLURAL).find((k) => WD_PLURAL[k] === ds[0]) : ds.map((x) => WDS[x] + ".").join(", "); }
  if (r.startsWith("monthly:")) return `monatl. am ${r.slice(8)}.`;
  return "";
}
const repKind = (r) => (!r ? "none" : r.split(":")[0]);
const REP_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>';

// ---------- Schnelleingabe ----------
const WEEKDAYS = { montag: 1, mo: 1, dienstag: 2, di: 2, mittwoch: 3, mi: 3, donnerstag: 4, do: 4, freitag: 5, fr: 5, samstag: 6, sa: 6, sonntag: 0 }; // „so“ fehlt absichtlich – sonst würde „so schnell wie möglich“ zum Sonntag
function parseInput(text) {
  let due = null, until = null, prio = null, list = null, time = null, timeEnd = null, repeat = null;
  const keep = [], weekly = new Set();
  // Mehrwort-Formen vorher zusammenziehen
  text = text
    .replace(/\bjeden\s+tag\b/gi, "täglich")
    .replace(/\bjede\s+woche\b/gi, "wöchentlich")
    .replace(/\bjeden\s+monat\b/gi, "monatlich")
    .replace(/\bjeden\s+(\d{1,2})\.(?=\s|$)/gi, "monatlich@$1")
    .replace(/\bjeden\s+(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b/gi, "$1s")
    // Uhrzeit-Spannen: „9-17 Uhr“, „9:00–17:30“, „8 bis 12 Uhr“
    .replace(/\b(\d{1,2})(?::(\d{2}))?\s*(?:-|–|bis)\s*(\d{1,2})(?::(\d{2}))?(\s*uhr)?(?=\s|$|[,;)])/gi, (all, h1, m1, h2, m2, uhr) =>
      (uhr || m1 || m2) && +h1 < 24 && +h2 < 24 && (!m1 || +m1 < 60) && (!m2 || +m2 < 60) ? ` ¤${pad(+h1)}:${m1 || "00"}¤${pad(+h2)}:${m2 || "00"}¤ ` : all)
    .replace(/\b(\d{1,2})(?::(\d{2}))?\s+uhr\b/gi, (_, h, m) => `${h}:${m || "00"}`)
    // Zeiträume: „23.11.26-25.11.26“, „vom 23.11. bis 25.11.“, „23.-25.11.“
    .replace(/(?:\b(?:von|vom)\s+)?(\d{1,2})\.(?:(\d{1,2})\.)?(\d{2,4})?\s*(?:-|–|bis(?:\s+zum)?)\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})?(?=\s|$|[,;)])/gi, (all, d1, m1, y1, d2, m2, y2) => {
      const r = dateRange(d1, m1 || m2, y1 || y2, d2, m2, y2 || y1); return r ? ` §${r[0]}§${r[1]}§ ` : all; })
    .replace(/\b(?:am|ab|vom|bis(?:\s+zum)?)\s+(?=\d{1,2}\.\d{1,2}\.)/gi, "");
  for (const tok of text.trim().split(/\s+/)) {
    const t = tok.toLowerCase();
    const tm = t.match(/^(\d{1,2})(?::(\d{2}))?(uhr)?$/);
    if (tm && (tm[2] || tm[3]) && +tm[1] < 24 && (!tm[2] || +tm[2] < 60)) { time = `${pad(+tm[1])}:${tm[2] || "00"}`; continue; }
    if (/^!+$/.test(t)) { prio = "hoch"; continue; }
    if (t === "täglich" || t === "taeglich") { repeat = "daily"; continue; }
    if (t === "werktags" || t === "wochentags") { repeat = "weekdays"; continue; }
    if (t in WD_PLURAL) { weekly.add(WD_PLURAL[t]); continue; }
    if (t === "wöchentlich" || t === "woechentlich") { repeat = "weekly:?"; continue; }
    if (t === "monatlich") { repeat = "monthly:?"; continue; }
    const mm = t.match(/^monatlich@(\d{1,2})$/); if (mm && +mm[1] >= 1 && +mm[1] <= 31) { repeat = "monthly:" + +mm[1]; continue; }
    if (t === "#privat" || t === "#p") { list = "privat"; continue; }
    if (t === "#arbeit" || t === "#a") { list = "arbeit"; continue; }
    if (t === "#projekte" || t === "#projekt") { list = "projekte"; continue; }
    if (t === "#haushalt" || t === "#h") { list = "haushalt"; continue; }
    if (t === "#einkaufen" || t === "#einkauf" || t === "#e") { list = "einkaufen"; continue; }
    if (t === "#termine" || t === "#termin") { list = "termine"; continue; }
    if (t === "heute") { due = iso(todayD()); continue; }
    if (t === "morgen") { due = iso(addDays(todayD(), 1)); continue; }
    if (t === "übermorgen" || t === "uebermorgen") { due = iso(addDays(todayD(), 2)); continue; }
    if (t in WEEKDAYS) { const n = ((WEEKDAYS[t] - todayD().getDay() + 7) % 7) || 7; due = iso(addDays(todayD(), n)); continue; }
    const tr = t.match(/^¤(\d\d:\d\d)¤(\d\d:\d\d)¤$/); if (tr) { time = tr[1]; timeEnd = tr[2] > tr[1] ? tr[2] : null; continue; }
    const rg = t.match(/^§(\d{4}-\d\d-\d\d)§(\d{4}-\d\d-\d\d)§$/); if (rg) { due = rg[1]; until = rg[2] > rg[1] ? rg[2] : null; continue; }
    const m = t.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})?$/);
    if (m) {
      const day = +m[1], mon = +m[2] - 1;
      let year = m[3] ? +m[3] : todayD().getFullYear();
      if (year < 100) year += 2000;
      let d = new Date(year, mon, day);
      if (d.getMonth() === mon && d.getDate() === day) {
        if (!m[3] && d < todayD()) d = new Date(year + 1, mon, day);
        due = iso(d); continue;
      }
    }
    keep.push(tok);
  }
  if (weekly.size) repeat = "weekly:" + [...weekly].sort().join(",");
  if (repeat === "weekly:?") repeat = "weekly:" + (due ? parseIso(due) : todayD()).getDay();
  if (repeat === "monthly:?") repeat = "monthly:" + (due ? parseIso(due) : todayD()).getDate();
  if (repeat && !due) due = iso(firstOcc(repeat, time));
  // Uhrzeit ohne Datum: heute, oder morgen falls schon vorbei
  if (time && !due) { const now = new Date(); due = iso(`${pad(now.getHours())}:${pad(now.getMinutes())}` < time ? todayD() : addDays(todayD(), 1)); }
  if (until && repeat) until = null;
  return { title: keep.join(" ").replace(/\s+([,;)])/g, "$1").replace(/\s+(?:von|vom|am|bis)$/i, "").trim(), due, until, prio, list, time, timeEnd, repeat };
}
// Nachträglich: offene Einträge ohne Datum, in deren Titel ein Datum oder Zeitraum steht („Seminar 23.11.26-25.11.26“)
// bekommen Datum (und Ende) gesetzt; der Datumsteil fliegt aus dem Titel. Nur ausdrückliche Daten, keine Wörter wie „morgen“.
function datesFromTitle(title) {
  if (!/\d{1,2}\.(\d{1,2}\.)?(\d{2,4})?\s*(-|–|bis)?\s*\d{0,2}\.?\d{1,2}\./.test(title)) return null;
  let due = null, until = null;
  let t = title.replace(/(?:\b(?:von|vom)\s+)?(\d{1,2})\.(?:(\d{1,2})\.)?(\d{2,4})?\s*(?:-|–|bis(?:\s+zum)?)\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})?(?=\s|$|[,;)])/i, (all, d1, m1, y1, d2, m2, y2) => {
    const r = dateRange(d1, m1 || m2, y1 || y2, d2, m2, y2 || y1); if (!r) return all; due = r[0]; until = r[1] > r[0] ? r[1] : null; return " "; });
  if (!due) t = t.replace(/(?:\b(?:am|vom|ab|bis(?:\s+zum)?)\s+)?\b(\d{1,2})\.(\d{1,2})\.(\d{2,4})?(?=\s|$|[,;)])/i, (all, d, m, y) => { const r = dateRange(d, m, y, d, m, y); if (!r) return all; due = r[0]; return " "; });
  if (!due) return null;
  return { title: t.replace(/\s+/g, " ").replace(/\s+([,;)])/g, "$1").replace(/\s+(?:von|vom|am|bis)$/i, "").trim() || title, due, until };
}
// Uhrzeit-Spanne aus dem Titel („Seminar 9-17 Uhr“) → time/timeEnd
function timesFromTitle(title) {
  let time = null, timeEnd = null;
  const t = title.replace(/\b(\d{1,2})(?::(\d{2}))?\s*(?:-|–|bis)\s*(\d{1,2})(?::(\d{2}))?(\s*uhr)?(?=\s|$|[,;)])/i, (all, h1, m1, h2, m2, uhr) => {
    if (!((uhr || m1 || m2) && +h1 < 24 && +h2 < 24 && (!m1 || +m1 < 60) && (!m2 || +m2 < 60))) return all;
    time = `${pad(+h1)}:${m1 || "00"}`; const e = `${pad(+h2)}:${m2 || "00"}`; timeEnd = e > time ? e : null; return " "; });
  if (!time) return null;
  return { title: t.replace(/\s+/g, " ").replace(/\s+(?:von|um|ab)$/i, "").trim() || title, time, timeEnd };
}
function retroDates() {
  if (MINI || !loaded) return;
  items.filter((t) => !t.done && !t.archived).forEach((t) => {
    const p = {}; let title = t.title;
    if (!t.due) { const r = datesFromTitle(title); if (r) { title = r.title; p.due = r.due; p.until = r.until; } }
    if (!t.time) { const r = timesFromTitle(title); if (r) { title = r.title; p.time = r.time; p.timeEnd = r.timeEnd; if (!t.due && !p.due) p.due = iso(todayD()); } }
    if (Object.keys(p).length) patch(t.id, { ...p, title });
  });
}
// Zeitraum aus Tag/Monat/Jahr-Teilen (Jahr optional, zweistellig erlaubt); null, wenn ungültig
function dateRange(d1, m1, y1, d2, m2, y2) {
  const mk = (d, m, y) => { let yr = y ? +y : todayD().getFullYear(); if (yr < 100) yr += 2000; const x = new Date(yr, +m - 1, +d); return x.getMonth() === +m - 1 && x.getDate() === +d ? x : null; };
  let a = mk(d1, m1, y1), b = mk(d2, m2, y2);
  if (!a || !b) return null;
  if (!y1 && !y2 && b < todayD()) { a = mk(d1, m1, a.getFullYear() + 1); b = mk(d2, m2, b.getFullYear() + 1); }
  if (b < a) return null;
  return [iso(a), iso(b)];
}
const dueText = (t) => (t.due ? (t.until ? `${shortDate(t.due)}–${shortDate(t.until)}` : dueLabel(t.due)) : "Datum") + (t.time ? " " + t.time + (t.timeEnd ? "–" + t.timeEnd : "") : "");
const shortDate = (k) => { const [y, m, d] = k.split("-"); return `${+d}.${+m}.`; };

// ---------- Zustand ----------
let items = [];
const MINI = new URLSearchParams(location.search).has("mini");
let view = "list"; try { const v = localStorage.getItem("erledigt-view"); view = v === "week" || v === "month" ? v : "list"; } catch {}
let weekOffset = 0, monthOffset = 0, detailId = null;
let col = null;
let loaded = false;
let list = "alle", draftPrio = "mittel";
const filter = "offen"; // Liste zeigt offene Aufgaben; heute Erledigtes eingeklappt darunter
let selected = null, editing = null, popFor = null, undo = null;
try { list = localStorage.getItem("todo-list") || "alle"; } catch {}
if (!listById[list]) list = "alle";

const $ = (id) => document.getElementById(id);
// Hintergrund-Timer nur arbeiten lassen, wenn das Fenster sichtbar ist (spart Akku/CPU); beim Zurückkommen einmal nachziehen
const VIS_FNS = new Set();
const whenVisible = (fn) => { VIS_FNS.add(fn); return () => { if (!document.hidden) fn(); }; };
document.addEventListener("visibilitychange", () => { if (!document.hidden) VIS_FNS.forEach((f) => { try { f(); } catch {} }); });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Alte Einträge (prio als true/false) weiter lesen können
const norm = (d) => ({ ...d, archived: !!d.archived, checklist: Array.isArray(d.checklist) ? d.checklist : [], attachments: Array.isArray(d.attachments) ? d.attachments : [], notes: d.notes || "", prio: d.prio === true ? "hoch" : PRIO_RANK[d.prio] !== undefined ? d.prio : "mittel", list: listById[d.list] && d.list !== "alle" ? d.list : "arbeit" });

function setStatus(text, err) {
  const el = $("status");
  if (!text) { el.hidden = true; return; }
  el.hidden = false; el.className = "note" + (err ? " err" : ""); el.textContent = text;
}

// ---------- Schreiben ----------
async function write(fn) {
  try { await fn(); }
  catch (e) {
    console.error(e);
    setSync(false);
    setStatus("Konnte nicht speichern – keine Verbindung zu Supabase? Ich lade neu, sobald sie wieder da ist.", true);
    reloadSoon();
  }
}
function addItem(p) {
  const id = "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const doc = { title: p.title, due: p.due, until: p.until || null, time: p.time || null, timeEnd: p.timeEnd || null, repeat: p.repeat || null, notes: p.notes || "", checklist: p.checklist || [], attachments: [], prio: p.prio || draftPrio, list: p.list || (list === "alle" ? defList() : list), done: false, doneAt: null, createdAt: Date.now() };
  selected = id;
  if (!modeHas(doc.list)) { selected = null; setTimeout(() => showToast(`In „${listById[doc.list].name}“ abgelegt – im ${privMode() ? "Privat" : "Arbeits"}modus ausgeblendet`), 0); }
  write(() => col.doc(id).set(doc));
  if (!MINI) { const mm = memMatches(p.title, id); if (mm.length) setTimeout(() => showBadge("Kennst du schon", `${mm[0].t.title} (${memDate(mm[0].t)}): ${mm[0].t.solution}`, "bolt", true), 700); }
  return id;
}
const patch = (id, p) => {
  if ("due" in p && !("until" in p)) { // mehrtägig: Ende mitschieben bzw. entfernen
    const it = items.find((x) => x.id === id);
    if (it?.until) p = { ...p, until: p.due && it.due ? iso(addDays(parseIso(p.due), Math.round((parseIso(it.until) - parseIso(it.due)) / 864e5))) : null };
  }
  return write(() => col.doc(id).update(p));
};
const endDay = (t) => t.until || t.due; // letzter Tag eines (mehrtägigen) Eintrags
function remove(ids, text) {
  const gone = items.filter((i) => ids.includes(i.id));
  if (!gone.length) return;
  showToast(text, gone.map(({ id, ...body }) => ({ id, body })));
  const order = visible().map((i) => i.id); const idx = order.indexOf(selected);
  if (ids.includes(selected)) selected = order.filter((x) => !ids.includes(x))[Math.max(0, idx - 1)] || null;
  for (const id of ids) write(() => col.doc(id).delete());
}
function toggleDone(id) {
  const it = items.find((i) => i.id === id); if (!it) return;
  if (!it.done && it.repeat) spawnNext(it);
  if (!it.done && !MINI && !privMode()) setTimeout(() => askSolution(items.find((x) => x.id === id) || it), 650);
  return patch(id, { done: !it.done, doneAt: it.done ? null : Date.now() });
}
// Wiederkehrend: erledigt → nächster Termin wird neu angelegt (die erledigte bleibt für Statistik/Streak)
function spawnNext(it) {
  const spawned = new Set(JSON.parse(localStorage.getItem("erledigt-spawned") || "[]"));
  if (spawned.has(it.id)) return;
  spawned.add(it.id); try { localStorage.setItem("erledigt-spawned", JSON.stringify([...spawned].slice(-500))); } catch {}
  const base = addDays(new Date(Math.max(it.due ? parseIso(it.due) : 0, todayD())), 1);
  const next = iso(nextOcc(it.repeat, base));
  if (items.some((x) => x.id !== it.id && !x.done && !x.archived && x.repeat === it.repeat && x.title === it.title && x.list === it.list && x.due && x.due >= next)) return; // gibt es schon
  const id = "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  write(() => col.doc(id).set({ title: it.title, due: next, time: it.time || null, timeEnd: it.timeEnd || null, repeat: it.repeat, prio: it.prio, list: it.list, notes: it.notes || "", checklist: (it.checklist || []).map((c) => ({ ...c, done: false })), attachments: [], done: false, doneAt: null, createdAt: Date.now() }));
  setTimeout(() => showBadge("Kommt wieder", `„${it.title}“ – nächstes Mal ${dueLabel(next)}${it.time ? " " + it.time : ""}`, "clock"), 500);
}
function cyclePrio(id) {
  const it = items.find((i) => i.id === id); if (!it) return;
  const order = ["hoch", "mittel", "niedrig"];
  return patch(id, { prio: order[(order.indexOf(it.prio) + 1) % 3] });
}

let toastTimer;
// Rückgängig gibt es nur, wenn diese Meldung auch etwas zum Zurücknehmen hat (Liste gelöschter Einträge oder eine Funktion)
function showToast(text, undoWith = null) {
  undo = undoWith; $("toast-undo").hidden = !undoWith;
  $("toast-text").textContent = text; $("toast").hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { $("toast").hidden = true; undo = null; }, 6000);
}
$("toast-undo").addEventListener("click", () => {
  if (!undo) return;
  const back = undo; undo = null; $("toast").hidden = true;
  if (typeof back === "function") { back(); render(); return; }
  for (const { id, body, unarchive } of back) unarchive ? patch(id, { archived: false }) : write(() => col.doc(id).set(body));
});

// ---------- Ansicht ----------
// „Alle“ im Arbeitsmodus ohne Einkaufszettel – Milch & Brot gehören nicht zwischen die Arbeitsaufgaben
const inList = () => items.filter((t) => !t.archived && (list === "alle" ? inMode(t) : t.list === list));
// Abschnitte der offenen Liste: Überfällig / Heute / Morgen / Diese Woche / Später / Ohne Datum
const SECTIONS = ["Überfällig", "Heute", "Morgen", "Nächste 7 Tage", "Später", "Ohne Datum"];
let secDays = { key: "" };
function sectionOf(t) {
  const d0 = todayD(), key = +d0;
  if (secDays.key !== key) secDays = { key, today: iso(d0), tomorrow: iso(addDays(d0, 1)), week: iso(addDays(d0, 7)) }; // Tagesgrenzen einmal pro Tag statt pro Vergleich
  const { today, tomorrow, week } = secDays;
  if (!t.due) return { i: 5 };
  if (t.until && t.due <= today && t.until >= today) return { i: 1 };
  if (endDay(t) < today) return { i: 0 };
  if (t.due === today) return { i: 1 };
  if (t.due === tomorrow) return { i: 2 };
  if (t.due <= week) return { i: 3 };
  return { i: 4 };
}
function visible() {
  const dueKey = (t) => t.due || "9999";
  if (MINI) { const today = iso(todayD()); return items.filter((t) => !t.done && !t.archived && inMode(t) && t.due && t.due <= today).sort((a, b) => (PRIO_RANK[a.prio] - PRIO_RANK[b.prio]) || ((a.time || "99") < (b.time || "99") ? -1 : 1)); }
  const secMemo = new Map();
  const grp = filter === "offen" ? (t) => { let s = secMemo.get(t.id); if (s === undefined) secMemo.set(t.id, (s = sectionOf(t).i)); return s; } : () => 0;
  return inList()
    .filter((t) => filter === "alle" || (filter === "offen" ? !t.done : t.done))
    .sort((a, b) => (a.done - b.done) || (grp(a) - grp(b)) || (filter === "erledigt" ? (b.doneAt || 0) - (a.doneAt || 0) : 0) || (PRIO_RANK[a.prio] - PRIO_RANK[b.prio]) || (dueKey(a) < dueKey(b) ? -1 : dueKey(a) > dueKey(b) ? 1 : 0) || (a.createdAt - b.createdAt));
}

const CHECK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const CLOCK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const TRASH = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>';

// ---------- Animation-Helfer ----------
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const cardEl = (id) => document.querySelector(`.task[data-id="${id}"]`);
const busy = new Set();
let seen = new Set(), enterIdx = 0;
const entering = new Map(); // id -> Startzeit der Einblend-Animation (überlebt Neu-Rendern)
const ENTER_MS = 450;
let lastCounts = {}, shownPct = 0, lastPct = null, lastPctList = null, pctRaf = 0;

async function animateOut(el, dir) {
  if (!el || reduce.matches) return;
  const h = el.offsetHeight;
  el.style.pointerEvents = "none";
  await el.animate([
    { height: h + "px", opacity: 1, transform: "none", marginBottom: "0px" },
    { height: h + "px", opacity: 0, transform: `translateX(${dir * 40}px) scale(.97)`, marginBottom: "0px", offset: .55 },
    { height: "0px", opacity: 0, transform: `translateX(${dir * 40}px) scale(.97)`, marginBottom: "-8px", paddingTop: "0px", paddingBottom: "0px", borderWidth: "0px" },
  ], { duration: 420, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" }).finished.catch(() => {});
}

const CONFETTI = ["#4F46E5", "#60A5FA", "#FB923C", "#34D399", "#F59E0B", "#EC4899"];
// Konfetti: kleine Explosion an einem Element; ab Stärke 3 zusätzlich Regen über den ganzen Bildschirm
// Letzte Klickposition – Ersatz-Startpunkt, falls das Element schon neu gezeichnet/ausgeblendet ist
let lastPointer = null;
document.addEventListener("pointerdown", (e) => { lastPointer = { x: e.clientX, y: e.clientY, t: Date.now() }; }, true);
function burst(from, n, power) {
  if (reduce.matches) return;
  let r = from && from.isConnected ? from.getBoundingClientRect() : null;
  let cx, cy;
  if (r && (r.width || r.height) && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
  else if (lastPointer && Date.now() - lastPointer.t < 3000) { cx = lastPointer.x; cy = lastPointer.y; }
  else { cx = innerWidth / 2; cy = innerHeight / 3; }
  cx = Math.min(Math.max(cx, 0), innerWidth); cy = Math.min(Math.max(cy, 0), innerHeight);
  // Nicht endlos stapeln (ruckelt sonst)
  const live = document.querySelectorAll(".confetti");
  if (live.length > 350) for (let i = 0; i < live.length - 250; i++) live[i].remove();
  const big = power > 1.5;
  for (let i = 0; i < n * (big ? 1.5 : 1.3); i++) {
    const s = document.createElement("span");
    s.className = "confetti";
    const size = big ? 9 + Math.random() * 9 : 6 + Math.random() * 5;
    s.style.width = size + "px"; s.style.height = (Math.random() < .5 ? size * 1.7 : size) + "px";
    s.style.background = CONFETTI[i % CONFETTI.length];
    if (Math.random() < .35) s.style.borderRadius = "50%";
    document.body.appendChild(s);
    const ang = -Math.PI / 2 + (Math.random() - .5) * Math.PI * (big ? 1.6 : 2);
    const dist = (big ? 90 + Math.random() * 160 : 35 + Math.random() * 55) * Math.min(power, 2.5);
    const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist, rot = (Math.random() - .5) * 1080;
    s.animate([
      { transform: `translate(${cx}px, ${cy}px) rotate(0) scale(.6)`, opacity: 1 },
      { transform: `translate(${cx + dx}px, ${cy + dy}px) rotate(${rot / 2}deg) scale(1)`, opacity: 1, offset: .45 },
      { transform: `translate(${cx + dx * 1.3}px, ${cy + dy + (big ? 380 : 120)}px) rotate(${rot}deg) scale(.9)`, opacity: 0 },
    ], { duration: big ? 1900 + Math.random() * 900 : 1000 + Math.random() * 400, easing: "cubic-bezier(.15,.7,.35,1)" }).finished.then(() => s.remove(), () => s.remove());
  }
  if (power >= 3) rain(Math.round(n * 1.6));
}
function rain(n) {
  if (reduce.matches) return;
  const W = innerWidth, H = innerHeight;
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "confetti";
    const size = 9 + Math.random() * 10;
    s.style.width = size + "px"; s.style.height = size * (Math.random() < .6 ? 1.8 : 1) + "px";
    s.style.background = CONFETTI[i % CONFETTI.length];
    if (Math.random() < .3) s.style.borderRadius = "50%";
    document.body.appendChild(s);
    const x = Math.random() * W, sway = (Math.random() - .5) * 220, rot = (Math.random() - .5) * 1440;
    s.animate([
      { transform: `translate(${x}px, -30px) rotate(0)`, opacity: 1 },
      { transform: `translate(${x + sway}px, ${H * .55}px) rotate(${rot / 2}deg)`, opacity: 1, offset: .55 },
      { transform: `translate(${x - sway / 2}px, ${H + 40}px) rotate(${rot}deg)`, opacity: .9 },
    ], { duration: 2400 + Math.random() * 1800, delay: Math.random() * 700, easing: "linear", fill: "backwards" }).finished.then(() => s.remove(), () => s.remove());
  }
}

function countPct(target) {
  cancelAnimationFrame(pctRaf);
  const from = shownPct, start = performance.now(), dur = reduce.matches ? 0 : 600;
  const step = (now) => {
    const k = dur ? Math.min(1, (now - start) / dur) : 1;
    shownPct = Math.round(from + (target - from) * (1 - Math.pow(1 - k, 3)));
    $("pct").textContent = shownPct + "%";
    if (k < 1) pctRaf = requestAnimationFrame(step);
  };
  pctRaf = requestAnimationFrame(step);
}

async function completeTask(id) {
  const it = items.find((i) => i.id === id);
  if (!it || busy.has(id)) return;
  const el = cardEl(id);
  if (!it.done && el && !reduce.matches) {
    busy.add(id);
    el.classList.add("popping");
    sfx.done();
    burst(el.querySelector(".tick"), 18, 1.3);
    await wait(420);
    if (filter === "offen") await animateOut(el, 1);
    busy.delete(id);
  }
  toggleDone(id); render();
}
async function deleteTask(id) {
  const it = items.find((i) => i.id === id);
  if (!it || busy.has(id)) return;
  busy.add(id);
  sfx.del();
  await animateOut(cardEl(id), -1);
  busy.delete(id);
  remove([id], `„${it.title}“ gelöscht`); render();
}

function taskHtml(t) {
  const L = listById[t.list], P = prioById[t.prio];
  const n = t.due ? diffDays(t.due) : null;
  const dueCls = n === null ? "" : n < 0 && !t.done ? "late" : n === 0 && !t.done ? "today" : "";
  const title = editing === t.id
    ? `<input class="title-input" id="edit-${t.id}" value="${esc(t.title)}" aria-label="Titel bearbeiten">`
    : `<span class="title" data-act="open" title="Details öffnen (Enter) · Doppelklick: umbenennen">${esc(t.title)}</span>`;
  const pop = popFor === t.id ? `<div class="pop" role="menu">
      <button type="button" data-due="0">Heute <small>${WD[todayD().getDay()].slice(0, 2)}.</small></button>
      <button type="button" data-due="1">Morgen <small>${WD[addDays(todayD(), 1).getDay()].slice(0, 2)}.</small></button>
      <button type="button" data-due="${nextMonday()}">Nächster Montag <small>${dueLabel(iso(addDays(todayD(), nextMonday())))}</small></button>
      <button type="button" data-due="none">Kein Datum</button>
      <input type="date" id="date-${t.id}" value="${t.due || ""}" aria-label="Datum wählen">
      ${t.due ? `<label class="pop-until">bis <input type="date" id="until-${t.id}" value="${t.until || ""}" min="${t.due}" aria-label="Enddatum (mehrtägig)"></label>` : ""}
      <div class="pop-sep">Wiederholen</div>
      <div class="pop-rep">${[["none", "Nie"], ["daily", "Täglich"], ["weekdays", "Werktags"], ["weekly", "Wöchentlich"], ["monthly", "Monatlich"]].map(([k, l]) => `<button type="button" data-rep="${k}" aria-pressed="${repKind(t.repeat) === k}">${l}</button>`).join("")}</div>
    </div>` : "";
  const now = performance.now();
  if (!seen.has(t.id) && !entering.has(t.id) && !reduce.matches) entering.set(t.id, now + Math.min(enterIdx++, 10) * 45);
  let enterStyle = "";
  if (entering.has(t.id)) {
    const elapsed = now - entering.get(t.id);
    if (elapsed < ENTER_MS) enterStyle = ` style="animation-delay:${Math.round(-elapsed)}ms"`;
    else entering.delete(t.id);
  }
  return `<div style="--task-c:${L.dot === "#F5F3EF" ? "var(--line)" : L.dot}" class="task${popFor === t.id ? " has-pop" : ""}${t.done ? " done" : ""}${t.prio === "hoch" && !t.done ? " hoch" : ""}${selected === t.id ? " sel" : ""}${enterStyle ? " enter" : ""}" data-id="${t.id}"${enterStyle}>
    <button type="button" class="tick" data-act="done" aria-pressed="${t.done}" aria-label="${t.done ? "Als offen markieren" : "Als erledigt markieren"}"><span>${CHECK}</span></button>
    <div class="body">
      ${title}
      <div class="meta">${(() => {
        // Wichtiges immer, Rest erst beim Hinzeigen (am Zeilenende, damit nichts springt)
        const lst = `<button type="button" class="listchip" data-act="list" title="Liste wechseln"><span class="sq" style="width:8px;height:8px;background:${L.dot}"></span>${L.name}</button>`;
        const pri = `<button type="button" data-act="prio" title="Priorität ändern"><span class="dot" style="background:${P.dot}"></span>${P.name}</button>`;
        const due = `<button type="button" class="${dueCls}" data-act="due" title="Datum ändern">${CLOCK}${dueText(t)}${t.repeat ? `<span class="rep">${REP_ICON}${esc(repLabel(t.repeat))}</span>` : ""}</button>`;
        const sec = (h) => h.replace('<button type="button"', '<button type="button" data-sec="1"');
        // wie am Handy: Liste · Datum; Priorität „Hoch“ als roter Punkt rechts in der Zeile
        const showList = list === "alle", showDue = !!t.due;
        return [showList ? lst : "", showDue ? due : "", indicators(t),
          showDue ? "" : sec(due), sec(pri), showList ? "" : sec(lst),].join("");
      })()}
      </div>
    </div>
    <button type="button" class="trash" data-act="del" aria-label="Aufgabe löschen">${TRASH}</button>
    ${pop}
  </div>`;
}

function render() {
  syncAppIcon(); // Akzentfarbe kann sich geändert haben (Design, Hell/Dunkel, Freitag)
  const h = new Date().getHours(), t = todayD();
  $("greet").textContent = `${h < 11 ? "Guten Morgen" : h < 18 ? "Guten Tag" : "Guten Abend"} · ${WD[t.getDay()]}, ${t.getDate()}. ${MON[t.getMonth()]}`;
  $("title").textContent = listById[list].name;
  document.body.classList.toggle("friday", new Date().getDay() === 5 && (!design || design.friday));
  document.body.classList.toggle("friday-accent", !design || (design.preset === "standard" && !design.custom));

  if (!shownLists().some((l) => l.id === list)) list = "alle";
  $("lists").innerHTML = `<div class="mode-seg" role="group" aria-label="Modus"><button type="button" data-mode="arbeit" aria-pressed="${!privMode()}">Arbeit</button><button type="button" data-mode="privat" aria-pressed="${privMode()}">Privat</button></div><span class="label">Listen</span>` + shownLists().map((l) => {
    const open = items.filter((x) => !x.done && !x.archived && (l.id === "alle" ? inMode(x) : x.list === l.id)).length;
    const bump = loaded && lastCounts[l.id] !== undefined && lastCounts[l.id] !== open;
    lastCounts[l.id] = loaded ? open : undefined;
    return `<button type="button" data-list="${l.id}" aria-current="${list === l.id}"><span class="name"><span class="sq" style="background:${l.dot}"></span>${l.name}</span><span class="n${bump ? " bump" : ""}">${loaded ? open : ""}</span></button>`;
  }).join("");

  $("prios").innerHTML = PRIOS.map((p) => `<button type="button" data-prio="${p.id}" aria-pressed="${draftPrio === p.id}"><span class="dot" style="background:${p.dot}"></span>${p.name}</button>`).join("");

  const all = inList(), doneN = all.filter((x) => x.done).length;
  const pct = all.length ? Math.round((doneN / all.length) * 100) : 0;
  $("bar").style.width = pct + "%";
  if (pct !== lastPct) {
    if (loaded && pct === 100 && lastPct !== null && lastPct < 100 && lastPctList === list && all.length) burst($("bar"), 70, 4);
    countPct(pct);
  }
  if (loaded) { lastPct = pct; lastPctList = list; }
  $("progress-sub").textContent = `${doneN} erledigt · ${all.length - doneN} offen`;

  const vis = visible();
  let html = "";
  enterIdx = 0;
  $("view-seg").querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
  if (MINI) $("mini-count").textContent = loaded ? `${vis.length} offen` : "";
  if (loaded && list === "einkaufen" && view === "list" && !MINI) { // Einkaufsliste wie Bring (03c-einkauf.js)
    document.body.classList.remove("alles-frei"); seen = new Set(vis.map((t) => t.id));
    $("tasks").innerHTML = shopHtml(); updateFun(); if (detailId) renderDetail(); return;
  }
  if (loaded && view === "month" && !MINI) {
    $("tasks").innerHTML = monthHtml(); updateFun(); if (detailId) renderDetail(); return;
  }
  if (loaded && view === "week" && !MINI) {
    $("tasks").innerHTML = weekHtml(); updateFun(); if (detailId) renderDetail(); return;
  }
  if (loaded) {
    const frei = !vis.length && filter === "offen" && all.length > 0 && !MINI;
    document.body.classList.toggle("alles-frei", frei);
    if (frei) {
      const n = all.filter((t) => t.done && t.doneAt && iso(new Date(t.doneAt)) === iso(todayD())).length;
      html = `<div class="frei"><b>Alles erledigt.</b><span>${n ? `Heute ${n} ${n === 1 ? "Aufgabe" : "Aufgaben"} geschafft.` : "Nichts mehr offen."}${design.name ? " Gut gemacht, " + esc(design.name) + "." : ""}</span><div class="frei-acts"><button type="button" class="chip-btn" data-frei="rep">Was hab ich gemacht?</button><button type="button" class="chip-btn" data-frei="plan">Morgen planen</button></div></div>`;
    } else if (!vis.length) {
      const txt = filter === "erledigt" ? "Noch nichts abgehakt – leg los." : all.length ? "Alles erledigt. Gönn dir eine Pause." : "Schreib oben rein, was ansteht, und drück Enter.";
      html = `<div class="empty"><b>Nichts zu tun hier.</b><span>${txt}</span></div>`;
    } else if (filter === "offen" && !MINI) {
      let last = -1;
      const secs = vis.map((t) => sectionOf(t).i), secN = {}; for (const s of secs) secN[s] = (secN[s] || 0) + 1;
      html = vis.map((t, vi) => {
        const s = secs[vi], head = s !== last ? `<div class="sec-h${s === 0 ? " late" : ""}" role="heading" aria-level="3"><b>${SECTIONS[s]}</b><span>${secN[s]}</span></div>` : "";
        last = s; return head + taskHtml(t);
      }).join("");
    } else html = vis.map(taskHtml).join("");
    // 3) Heute erledigt – eingeklappt unter der offenen Liste
    if (filter === "offen" && !MINI) {
      const tdy = iso(todayD()), doneT = inList().filter((t) => t.done && t.doneAt && iso(new Date(t.doneAt)) === tdy).sort((a, b) => b.doneAt - a.doneAt);
      if (doneT.length) html += `<details class="done-today"${store.get("erledigt-done-open", false) ? " open" : ""}><summary><span>Heute erledigt</span><b>${doneT.length}</b></summary>${doneT.map(taskHtml).join("")}</details>`;
    }
    seen = new Set(vis.map((t) => t.id));
  }
  // Wird gerade ein Titel in der Liste umbenannt, darf Neu-Zeichnen (z. B. Sync von einem anderen Gerät) das Getippte nicht verwerfen
  const edOld = editing && $("edit-" + editing), edKeep = edOld && document.activeElement === edOld ? { v: edOld.value, a: edOld.selectionStart, b: edOld.selectionEnd } : null;
  if (edOld) edOld.dataset.cancel = "1"; // das alte Feld verschwindet gleich – sein focusout soll nichts speichern und den Bearbeiten-Zustand nicht beenden
  const edId = editing;
  $("tasks").innerHTML = html;
  editing = edId;
  updateFun();
  if (detailId) renderDetail();

  if (editing) { const el = $("edit-" + editing); if (el) { if (edKeep) el.value = edKeep.v; el.focus(); if (edKeep) el.setSelectionRange(edKeep.a, edKeep.b); else el.setSelectionRange(el.value.length, el.value.length); } else editing = null; }
}

function updateHint() {
  const v = $("new").value;
  const sl = v.trim().match(/^\/(\S*)\s*(.*)$/);
  if (sl) {
    const tp = sl[1] ? findTpl(sl[1]) : null;
    $("hint").innerHTML = tp ? `Vorlage <code>${esc(tp.name)}</code> – Enter legt sie mit ${tp.checklist.length} Unterpunkten an${sl[2] ? ` für <code>${esc(sl[2])}</code>` : ""}`
      : "Vorlagen: " + allTpl().map((x) => `<code>/${esc(x.id.startsWith("eigen-") ? x.name.split(" ")[0].toLowerCase() : x.id)}</code>`).join(" ");
    return;
  }
  $("hint").classList.toggle("idle", !v.trim());
  if (!v.trim()) { $("hint").innerHTML = `Tipp: <code>morgen 14:30</code> Erinnerung · <code>donnerstags</code> wiederholen · <code>!</code> hoch · ${privMode() ? "<code>#einkaufen</code>" : "<code>#projekte</code>"} · <code>/</code> Vorlagen`; if (list === "einkaufen") $("hint").innerHTML = `<code>Milch, Brot, Eier</code> legt mehrere Artikel an · Kachel antippen = gekauft`; return; }
  const p = parseInput(v);
  const bits = [listById[p.list || (list === "alle" ? defList() : list)].name, prioById[p.prio || draftPrio].name];
  if (p.due) bits.push(dueText(p));
  if (p.time) bits.push("mit Erinnerung");
  if (p.repeat) bits.push("wiederholt " + repLabel(p.repeat));
  $("hint").innerHTML = `Wird angelegt als <code>${bits.map(esc).join("</code><code>")}</code>`;
}

// ---------- Ereignisse ----------
$("new").addEventListener("input", updateHint);
$("tasks").addEventListener("toggle", (e) => { if (e.target.classList?.contains("done-today")) store.set("erledigt-done-open", e.target.open); }, true);
$("addform").addEventListener("submit", (e) => {
  e.preventDefault();
  const sl = $("new").value.trim().match(/^\/(\S+)\s*(.*)$/);
  if (sl) { const tp = findTpl(sl[1]); if (tp) { applyTemplate(tp, sl[2]); return; } }
  const p = parseInput($("new").value);
  if (MINI && !p.due) p.due = iso(todayD()); // Im Mini-Widget landet alles auf heute
  if (!p.title) { const f = $("addform"); f.classList.remove("shake"); void f.offsetWidth; f.classList.add("shake"); $("new").focus(); return; }
  $("new").value = ""; updateHint();
  addItem(p); render();
});
$("prios").addEventListener("click", (e) => { const b = e.target.closest("[data-prio]"); if (!b) return; draftPrio = b.dataset.prio; render(); updateHint(); });
$("lists").addEventListener("click", (e) => { const mb = e.target.closest("[data-mode]"); if (mb) { setAppMode(mb.dataset.mode); return; } const b = e.target.closest("[data-list]"); if (!b) return; if (list === b.dataset.list) return; list = b.dataset.list; try { localStorage.setItem("todo-list", list); } catch {} render(); updateHint();
  if (!reduce.matches) $("title").animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "cubic-bezier(.2,.8,.2,1)" }); });

$("tasks").addEventListener("click", (e) => {
  const card = e.target.closest(".task"); if (!card) return;
  const id = card.dataset.id;
  const repBtn = e.target.closest("[data-rep]");
  if (repBtn) {
    const it = items.find((i) => i.id === id), base = it.due ? parseIso(it.due) : todayD(), k = repBtn.dataset.rep;
    const rule = k === "none" ? null : k === "weekly" ? "weekly:" + base.getDay() : k === "monthly" ? "monthly:" + base.getDate() : k;
    popFor = null;
    patch(id, rule ? { repeat: rule, due: it.due || iso(firstOcc(rule, it.time)) } : { repeat: null });
    render(); return;
  }
  const dueBtn = e.target.closest("[data-due]");
  if (dueBtn) { const v = dueBtn.dataset.due; popFor = null; patch(id, v === "none" ? { due: null, time: null } : { due: iso(addDays(todayD(), +v)) }); render(); return; }
  const act = e.target.closest("[data-act]")?.dataset.act;
  if (e.target.closest(".pop")) return;
  selected = id;
  if (act === "done") { completeTask(id); return; }
  if (act === "del") { deleteTask(id); return; }
  if (act === "prio") cyclePrio(id);
  else if (act === "list") { const it = items.find((i) => i.id === id); const order = shownLists().map((l) => l.id).filter((x) => x !== "alle"); patch(id, { list: order[(order.indexOf(it.list) + 1) % order.length] }); }
  else if (act === "due") popFor = popFor === id ? null : id;
  else if (act === "edit") { editing = id; popFor = null; }
  else if (act === "open") { lastOpenClick = { id, t: Date.now() }; openDetail(id); return; }
  render();
});
$("tasks").addEventListener("dblclick", (e) => { const t = e.target.closest('.title[data-act="open"]'); if (!t) return; closeDetail(); editing = t.closest(".task").dataset.id; popFor = null; render(); });
// Doppelklick auf den Titel = umbenennen. Der erste Klick öffnet schon die Details, der zweite landet deshalb auf deren Hintergrund –
// das Doppelklick-Ereignis kam nie beim Titel an (Umbenennen in der Liste ging gar nicht). Darum hier: Doppelklick kurz nach dem Öffnen zählt.
let lastOpenClick = { id: null, t: 0 };
document.addEventListener("dblclick", (e) => {
  if (!matchMedia("(hover: hover)").matches || Date.now() - lastOpenClick.t > 600 || e.target.closest(".task")) return;
  const id = lastOpenClick.id; lastOpenClick = { id: null, t: 0 };
  if (!items.some((x) => x.id === id) || (detailId && detailId !== id)) return;
  if (detailId) closeDetail();
  editing = id; popFor = null; selected = id; render();
});
$("tasks").addEventListener("change", (e) => {
  if (e.target.type !== "date") return;
  if (e.target.id.startsWith("until-")) { const id = e.target.id.slice(6), it = items.find((x) => x.id === id), v = e.target.value; popFor = null; patch(id, { until: v && it?.due && v > it.due ? v : null }); render(); return; }
  const id = e.target.id.slice(5); popFor = null; patch(id, { due: e.target.value || null }); render();
});
$("tasks").addEventListener("keydown", (e) => {
  if (!e.target.classList.contains("title-input")) return;
  if (e.key === "Enter") { e.preventDefault(); e.target.blur(); }
  if (e.key === "Escape") { e.preventDefault(); e.target.dataset.cancel = "1"; e.target.blur(); }
});
$("tasks").addEventListener("focusout", (e) => {
  if (!e.target.classList.contains("title-input")) return;
  if (!e.target.isConnected) return; // Feld wurde beim Neu-Zeichnen ersetzt, nicht vom Nutzer verlassen
  const id = editing; editing = null;
  const v = e.target.value.trim(), it = items.find((i) => i.id === id);
  if (!e.target.dataset.cancel && it && v && v !== it.title) patch(id, { title: v });
  render();
});
document.addEventListener("click", (e) => { if (popFor && !e.target.closest(".pop") && !e.target.closest('[data-act="due"]')) { popFor = null; render(); } });

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "f" && !MINI) { e.preventDefault(); openSearch(); return; }
  if (!$("search").hidden) return;
  if (e.key === "Escape" && !$("tpl-menu").hidden) { $("tpl-menu").hidden = true; return; }
  if (e.key === "Escape" && detailId && !["INPUT", "TEXTAREA"].includes(e.target.tagName)) { closeDetail(); return; }
  if (e.target.tagName === "TEXTAREA") return;
  if (e.target.tagName === "INPUT") { if (e.key === "Escape" && e.target.id === "new") e.target.blur(); return; }
  konami(e.key);
  const lbx = document.querySelector(".lightbox");
  if (lbx) { if (e.key === "Escape") lbx.remove(); return; }
  if (e.key === "Escape" && closeOverlays()) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const order = visible().map((t) => t.id), idx = order.indexOf(selected), k = e.key.toLowerCase();
  if (k === "n" || k === "/") { e.preventDefault(); $("new").focus(); }
  else if (k === "t") toggleTheme();
  else if (k === "j" || e.key === "ArrowDown") { e.preventDefault(); if (order.length) selected = order[Math.min(idx + 1, order.length - 1)]; render(); }
  else if (k === "k" || e.key === "ArrowUp") { e.preventDefault(); if (order.length) selected = order[Math.max(idx - 1, 0)]; render(); }
  else if (!selected) return;
  else if (k === "x") { e.preventDefault(); completeTask(selected); }
  else if (k === "f") { e.preventDefault(); startFokus(selected); }
  else if (k === "p") { cyclePrio(selected); render(); }
  else if (e.key === "Enter" && e.target === document.body) { e.preventDefault(); openDetail(selected); }
  else if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); deleteTask(selected); }
  else if (e.key === "Escape") { selected = null; popFor = null; render(); }
});

// ---------- Hell/Dunkel ----------
const root = document.documentElement;
const mq = matchMedia("(prefers-color-scheme: dark)");
const isDark = () => root.dataset.theme ? root.dataset.theme === "dark" : mq.matches;
const syncTheme = () => { document.body.classList.toggle("is-dark", isDark()); syncAppIcon(); }; // Titelleiste + Symbol mitfärben
try { const t = localStorage.getItem("todo-theme"); if (t === "dark" || t === "light") root.dataset.theme = t; } catch {}
function toggleTheme() {
  root.dataset.theme = isDark() ? "light" : "dark";
  try { localStorage.setItem("todo-theme", root.dataset.theme); } catch {}
  syncTheme();
}
$("theme").addEventListener("click", () => {
  toggleTheme();
  if (!reduce.matches) $("theme").querySelector(isDark() ? ".sun" : ".moon").animate([{ transform: "rotate(-90deg) scale(.5)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 400, easing: "cubic-bezier(.3,1.5,.5,1)" });
});
mq.addEventListener?.("change", syncTheme);
syncTheme();

// ---------- Erinnerungen ----------
// Feuert, solange die Seite in einem Tab offen ist (auch im Hintergrund).
const NKEY = "todo-notified";
let notified = {};
try { notified = JSON.parse(localStorage.getItem(NKEY)) || {}; } catch {}
const canNotify = () => "Notification" in window && Notification.permission === "granted";
let wantNotify = true;
try { wantNotify = localStorage.getItem("todo-notify") !== "0"; } catch {}
function syncBell() { $("bell").classList.toggle("on", wantNotify && canNotify()); $("bell").title = wantNotify && canNotify() ? "Benachrichtigungen an" : "Benachrichtigungen aus – klicken zum Einschalten"; }
$("bell").addEventListener("click", async () => {
  if (wantNotify && canNotify()) { wantNotify = false; }
  else {
    wantNotify = true;
    if ("Notification" in window && Notification.permission !== "granted") {
      try { await Notification.requestPermission(); } catch {}
    }
    if (!canNotify()) showToast(`${window.desktop ? "Windows-Benachrichtigungen" : "Mitteilungen"} gehen hier nicht – Erinnerungen kommen nur in der App.`);
    else { $("bell").classList.remove("ringing"); void $("bell").offsetWidth; $("bell").classList.add("ringing"); }
  }
  try { localStorage.setItem("todo-notify", wantNotify ? "1" : "0"); } catch {}
  syncBell();
});

function markNotified(key) {
  notified[key] = Date.now();
  const cutoff = Date.now() - 14 * 864e5;
  for (const k in notified) if (notified[k] < cutoff) delete notified[k];
  try { localStorage.setItem(NKEY, JSON.stringify(notified)); } catch {}
}
function showReminder(title, sub, taskId, single) {
  addNote({ kind: taskId || single ? "reminder" : "summary", ic: "bell", title, sub, taskId });
  const box = $("reminders");
  while (box.children.length >= 3) box.firstElementChild.remove();
  const el = document.createElement("div");
  el.className = "reminder"; el.setAttribute("role", "alert");
  el.innerHTML = `<div class="ic"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg></div>
    <div class="tx"><b>${esc(title)}</b><small>${esc(sub)}</small>
    <div class="acts">${taskId ? '<button type="button" class="primary" data-r="done">Erledigt</button><button type="button" data-r="snooze">In 15 Min</button>' : ""}<button type="button" data-r="close">OK</button></div></div>`;
  el.addEventListener("click", (e) => {
    const a = e.target.closest("[data-r]")?.dataset.r; if (!a) return;
    if (a === "done" && taskId) completeTask(taskId);
    if (a === "snooze" && taskId) { const d = new Date(Date.now() + 15 * 60000); patch(taskId, { due: iso(d), time: `${pad(d.getHours())}:${pad(d.getMinutes())}` }); }
    el.remove();
  });
  box.appendChild(el);
  if (wantNotify && canNotify()) {
    try {
      const n = new Notification(title, { body: sub, tag: taskId || (single ? "privat" : "summary"), requireInteraction: !!taskId });
      n.onclick = () => { window.desktop?.show(); window.focus(); if (taskId) { selected = taskId; render(); } n.close(); };
    } catch {}
  }
}

document.addEventListener("click", (e) => { const b = e.target.closest("[data-frei]"); if (!b) return; if (b.dataset.frei === "rep") openRep(); else openPlan(); });
function checkReminders() {
  if (MINI) return;
  if (!loaded) return;
  const now = new Date(), today = iso(todayD()), hm = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const vorlauf = +(design.vorlauf || 0); // Minuten vor dem Termin (Einstellungen → Arbeitstag)
  // Einzelne Aufgaben mit Uhrzeit: Erinnerungszeitpunkt = Termin minus Vorlauf
  for (const t of items) {
    if (t.done || !t.due || !t.time) continue;
    const key = `${t.id}@${t.due}T${t.time}`;
    if (notified[key]) continue;
    const at = new Date(parseIso(t.due)); at.setHours(+t.time.slice(0, 2), +t.time.slice(3), 0, 0); at.setMinutes(at.getMinutes() - vorlauf);
    if (at <= now) {
      markNotified(key);
      // Nur frisch fällige melden (max. 15 Min her), nicht alles Alte beim ersten Öffnen nach Tagen
      const missed = now - at >= 15 * 60000 && t.due === today; // PC schlief zur Erinnerungszeit: am selben Tag nachreichen statt verschlucken
      if (now - at < 15 * 60000 || missed) {
        const when = missed ? `Verpasst – war um ${t.time} fällig` : vorlauf ? `In ${vorlauf} Min um ${t.time}` : `Fällig um ${t.time}`;
        if (inMode(t) || privMode()) showReminder(t.title, when + ` · ${listById[t.list].name}`, t.id);
        else showReminder("Private Erinnerung", when + " · Details im Privat-Modus", null, true); // Titel bleibt bei der Arbeit verborgen
      }
    }
  }
  // Einmal pro Tag ab 8 Uhr: Übersicht für heute
  const sumKey = "summary@" + today;
  if (!notified[sumKey] && now.getHours() >= 8) {
    const open = items.filter((t) => !t.done && !t.archived && t.due && inMode(t));
    const todayN = open.filter((t) => t.due === today).length, overN = open.filter((t) => endDay(t) < today).length;
    markNotified(sumKey);
    if (todayN || overN) showReminder(
      todayN ? `${todayN} ${todayN === 1 ? "Aufgabe" : "Aufgaben"} für heute` : `${overN} überfällig`,
      [todayN && overN ? `${overN} überfällig` : "", open.filter((t) => t.due <= today).sort((a, b) => PRIO_RANK[a.prio] - PRIO_RANK[b.prio]).slice(0, 3).map((t) => t.title).join(" · ")].filter(Boolean).join(" — "),
      null);
  }
}
setInterval(checkReminders, 20000);
syncBell();

let design = null; // wird im Design-Teil weiter unten gesetzt

// ---------- Laden ----------
render(); updateHint();
setInterval(whenVisible(render), 5 * 60000); // Begrüßung/Datum aktuell halten

// ===== 02-spass-memes.js =====
// ======================================================================
// ---------- Spaß: XP, Level, Streak, Erfolge, Sounds, Tagesmodus ----------
// ======================================================================
let uid = null, funReady = false;
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// Sounds – im Browser erzeugt, keine Dateien
let soundOn = store.get("erledigt-sound", true), actx = null;
function tone(freqs, dur = .14, type = "sine", gap = .07, vol = .12) {
  if (!soundOn) return;
  try {
    actx = actx || new AudioContext();
    const t0 = actx.currentTime + .01;
    freqs.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain(), t = t0 + i * gap;
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + .03);
    });
  } catch {}
}
const sfx = {
  done: () => tone([880, 1318.5], .2, "sine", .075),
  del: () => tone([330, 220], .12, "sine", .06, .07),
  ach: () => tone([784, 987.8, 1174.7, 1568], .22, "triangle", .08, .1),
  level: () => tone([523.3, 659.3, 784, 1046.5, 1318.5], .35, "triangle", .11, .12),
};
function syncSound() { $("sound").classList.toggle("muted", !soundOn); }
$("sound").addEventListener("click", () => { soundOn = !soundOn; store.set("erledigt-sound", soundOn); syncSound(); sfx.done(); });
syncSound();

// Level (abschaltbar, Standard: aus)
let levelsOn = store.get("erledigt-levels", false);
function syncLevels() { document.body.classList.toggle("no-levels", !levelsOn); $("lvl-toggle").setAttribute("aria-checked", String(levelsOn)); }
$("lvl-toggle").addEventListener("click", () => { levelsOn = !levelsOn; store.set("erledigt-levels", levelsOn); syncLevels(); renderAch(); if (levelsOn) burst($("lvl-toggle"), 14, 1); });
syncLevels();
const PTS = { hoch: 30, mittel: 20, niedrig: 10 };
const LEVELS = [
  [0, "Praktikant"], [50, "Azubi"], [150, "Junior-Admin"], [300, "Helpdesk-Held"], [500, "Ticket-Ninja"],
  [750, "Patch-Profi"], [1050, "Sysadmin"], [1400, "Netzwerk-Magier"], [1800, "Serverflüsterer"],
  [2300, "Domain-Admin"], [2900, "IT-Legende"], [3600, "Root"], [4400, "Der Endgegner"],
];
const doneItems = () => items.filter((t) => t.done && t.doneAt);
const onTime = (t) => !t.due || iso(new Date(t.doneAt)) <= t.due;
function xpOf() { return doneItems().reduce((s, t) => s + (PTS[t.prio] || 20) + (t.due && onTime(t) ? 10 : 0), 0); }
function levelOf(xp) {
  let i = 0; while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
  const cur = LEVELS[i][0], next = LEVELS[i + 1]?.[0] ?? null;
  return { n: i + 1, title: LEVELS[i][1], cur, next, pct: next ? Math.round(((xp - cur) / (next - cur)) * 100) : 100 };
}
function streakOf() {
  const days = new Set(doneItems().map((t) => iso(new Date(t.doneAt))));
  let d = todayD(); if (!days.has(iso(d))) d = addDays(d, -1);
  let n = 0;
  for (let k = 0; k < 500; k++) {
    if (days.has(iso(d))) n++;
    else if (d.getDay() !== 0 && d.getDay() !== 6) break;
    d = addDays(d, -1);
  }
  return { n, today: days.has(iso(todayD())) };
}

// Erfolge
const IC = {
  star: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>',
  fire: '<path d="M12 2c1.5 4.5 7 6.5 7 12.5a7 7 0 0 1-14 0c0-3 1.5-5 3-6 0 2 1 3.5 2.3 4C9 9 10 5.5 12 2z"/>',
  ext: '<path d="M9 3h6M12 3v4M7 21h10a2 2 0 0 0 2-2v-7a5 5 0 0 0-5-5h-4a5 5 0 0 0-5 5v7a2 2 0 0 0 2 2z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  frog: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 15c0-3 4-5 9-5s9 2 9 5-4 5-9 5-9-2-9-5z"/><path d="M9 16c1.5 1 4.5 1 6 0"/>',
  hundred: '<path d="M4 8v8M8 8h3v8H8zM15 8h3v8h-3z"/>',
  disco: '<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16"/>',
  crown: '<path d="M3 18h18M4 18 3 7l5 4 4-6 4 6 5-4-1 11"/>',
};
const perDay = () => { const m = {}; for (const t of doneItems()) { const k = iso(new Date(t.doneAt)); m[k] = (m[k] || 0) + 1; } return Math.max(0, ...Object.values(m)); };
const hourDone = (f) => doneItems().some((t) => f(new Date(t.doneAt)));
const ACH = [
  { id: "first", ic: "star", name: "Los geht's", desc: "Erste Aufgabe erledigt", ok: () => doneItems().length >= 1 },
  { id: "five", ic: "bolt", name: "Fleißbienchen", desc: "5 Aufgaben an einem Tag", ok: () => perDay() >= 5 },
  { id: "ten", ic: "bolt", name: "Maschine", desc: "10 Aufgaben an einem Tag", ok: () => perDay() >= 10 },
  { id: "early", ic: "sun", name: "Frühaufsteher", desc: "Vor 7:30 Uhr was erledigt", ok: () => hourDone((d) => d.getHours() * 60 + d.getMinutes() < 450) },
  { id: "night", ic: "moon", name: "Nachteule", desc: "Nach 22 Uhr was erledigt", ok: () => hourDone((d) => d.getHours() >= 22) },
  { id: "zero", ic: "inbox", name: "Inbox Zero", desc: "Keine offene Aufgabe mehr", ok: () => doneItems().length > 0 && !items.some((t) => !t.done) },
  { id: "s5", ic: "fire", name: "Feuer frei", desc: "5 Tage Streak", ok: () => streakOf().n >= 5 },
  { id: "s20", ic: "fire", name: "Unaufhaltsam", desc: "20 Tage Streak", ok: () => streakOf().n >= 20 },
  { id: "hot", ic: "ext", name: "Brandlöscher", desc: "10 Aufgaben mit Prio Hoch erledigt", ok: () => doneItems().filter((t) => t.prio === "hoch").length >= 10 },
  { id: "punctual", ic: "clock", name: "Pünktlich wie die Bahn", desc: "10 Aufgaben vor der Frist erledigt", ok: () => doneItems().filter((t) => t.due && onTime(t)).length >= 10 },
  { id: "wed", ic: "frog", name: "Meme-Lord", desc: "An einem Mittwoch was erledigt", ok: () => hourDone((d) => d.getDay() === 3) },
  { id: "hundred", ic: "hundred", name: "Hundert", desc: "100 Aufgaben erledigt", ok: () => doneItems().length >= 100 },
  { id: "lvl7", ic: "crown", name: "Sysadmin", desc: "Level 7 erreicht", ok: () => levelsOn && levelOf(xpOf()).n >= 7, levels: true },
  { id: "disco", ic: "disco", name: "Geheimtür", desc: "Den Konami-Code gefunden", ok: () => discoFound },
];
let discoFound = false;
const icon = (k, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;

function showBadge(title, sub, ic, noLog) {
  if (!noLog) addNote({ kind: /^Erfolg/.test(title) ? "ach" : /update|aktualisiert/i.test(title) ? "update" : "info", ic, title, sub });
  const box = $("reminders");
  while (box.children.length >= 3) box.firstElementChild.remove();
  const el = document.createElement("div");
  el.className = "reminder badge"; el.setAttribute("role", "status");
  el.innerHTML = `<div class="ic">${icon(ic)}</div><div class="tx"><b>${esc(title)}</b><small>${esc(sub)}</small></div>`;
  el.addEventListener("click", () => el.remove());
  box.appendChild(el);
  setTimeout(() => el.remove(), 6000);
}

function showLevelUp(lv) {
  $("lvl-big").textContent = "Level " + lv.n;
  $("lvl-new").textContent = lv.title;
  $("lvl-msg").textContent = lv.next ? `Nächstes Level bei ${lv.next} XP` : "Höher geht's nicht. Respekt.";
  $("lvl-overlay").hidden = false;
  sfx.level();
  setTimeout(() => burst($("lvl-big"), 80, 4), 150);
  try { if (wantNotify && canNotify()) new Notification(`Level ${lv.n}: ${lv.title}`, { body: "Level-Up in Erledigt.", silent: true }); } catch {}
}
$("lvl-close").addEventListener("click", () => { $("lvl-overlay").hidden = true; });
$("lvl-overlay").addEventListener("click", (e) => { if (e.target.id === "lvl-overlay") $("lvl-overlay").hidden = true; });

function renderAch() {
  const got = store.get("erledigt-ach-" + uid, {});
  $("ach-grid").innerHTML = ACH.filter((a) => levelsOn || !a.levels).map((a) => `<div class="ach${got[a.id] ? "" : " locked"}"><div class="ic">${icon(a.ic)}</div><div><b>${esc(a.name)}</b><span>${esc(a.desc)}${got[a.id] ? " · " + new Date(got[a.id]).toLocaleDateString("de-DE") : ""}</span></div></div>`).join("");
}
$("ach-open").addEventListener("click", () => { renderAch(); $("ach-overlay").hidden = false; });
$("ach-close").addEventListener("click", () => { $("ach-overlay").hidden = true; });
$("ach-overlay").addEventListener("click", (e) => { if (e.target.id === "ach-overlay") $("ach-overlay").hidden = true; });
function closeOverlays() { let any = false; if (!$("inbox").hidden) { closeInbox(); any = true; } for (const id of ["lvl-overlay", "ach-overlay", "plan-overlay", "week-overlay", "party-overlay", "design-overlay"]) if (!$(id).hidden) { $(id).hidden = true; any = true; } return any; }

// (1.4.3 hatte hier einmalig die Erfolge zurückgesetzt – als sichtbarer Auto-Update-Test. Erledigt, entfernt.)
let celebrateNext = false;
function migrations() {}

// Wird bei jedem render() aufgerufen
function updateFun() {
  if (MINI || !loaded || !uid) return;
  migrations();
  const xp = xpOf(), lv = levelOf(xp), st = streakOf();
  $("lvl-num").textContent = "Lvl " + lv.n;
  $("lvl-title").textContent = lv.title;
  $("xp-bar").style.width = lv.pct + "%";
  $("xp-sub").textContent = lv.next ? `${xp} / ${lv.next} XP` : `${xp} XP · Max-Level`;
  $("streak-n").textContent = st.n;
  $("streak").className = "streak" + (st.n === 0 ? " cold" : st.today ? " hot" : "");
  $("streak2-n").textContent = st.n;
  renderToday();
  $("streak2").className = "streak" + (st.n === 0 ? " cold" : st.today ? " hot" : "");

  const kLvl = "erledigt-lvl-" + uid, kAch = "erledigt-ach-" + uid;
  const got = store.get(kAch, null);
  const firstRun = got === null;
  const now = got || {};
  const fresh = [];
  for (const a of ACH) if (!now[a.id] && a.ok()) { now[a.id] = Date.now(); fresh.push(a); }
  if (fresh.length || firstRun) store.set(kAch, now);
  const shown = ACH.filter((a) => levelsOn || !a.levels);
  $("ach-count").textContent = `${shown.filter((a) => now[a.id]).length}/${shown.length}`;

  const lastLvl = store.get(kLvl, null);
  if (lastLvl === null || lv.n < lastLvl) store.set(kLvl, lv.n);
  // Beim ersten Laden nichts feiern, nur merken
  if ((!funReady && !celebrateNext) || firstRun) { funReady = true; if (lastLvl === null || lv.n > lastLvl) store.set(kLvl, lv.n); return; }
  if (lv.n > lastLvl) { store.set(kLvl, lv.n); if (levelsOn) showLevelUp(lv); }
  if (celebrateNext) { celebrateNext = false; funReady = true; }
  fresh.forEach((a, i) => setTimeout(() => { showBadge("Erfolg: " + a.name, a.desc, a.ic); sfx.ach(); }, 2500 + i * 1200));
}

// Frosch (Feierabend-Fenster)
const FROG = `<svg class="frog" viewBox="0 0 200 160" aria-hidden="true">
  <ellipse cx="100" cy="112" rx="78" ry="42" fill="#4ADE80"/><ellipse cx="100" cy="120" rx="52" ry="26" fill="#BBF7D0"/>
  <circle cx="62" cy="62" r="28" fill="#4ADE80"/><circle cx="138" cy="62" r="28" fill="#4ADE80"/>
  <g class="blink"><circle cx="62" cy="60" r="17" fill="#fff"/><circle cx="66" cy="62" r="8" fill="#111"/></g>
  <g class="blink"><circle cx="138" cy="60" r="17" fill="#fff"/><circle cx="134" cy="62" r="8" fill="#111"/></g>
  <path d="M72 100q28 22 56 0" stroke="#14532D" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="56" cy="96" r="7" fill="#F9A8D4" opacity=".8"/><circle cx="144" cy="96" r="7" fill="#F9A8D4" opacity=".8"/></svg>`;
const dayKey = () => iso(todayD());

function feierabendAt() { return store.get("erledigt-feierabend", "16:30"); } // "" = arbeitet nicht → kein Countdown
function arbeitsbeginn() { return store.get("erledigt-arbeitsbeginn", "07:30"); }
// Arbeitstermin heute mit Uhrzeit von–bis (Liste „Arbeit“) überschreibt die normale Arbeitszeit, z. B. Seminar 9–17 Uhr
function workToday() {
  const k = iso(todayD());
  const t = items.filter((x) => x.list === "arbeit" && !x.archived && x.time && x.timeEnd && x.due && x.due <= k && endDay(x) >= k).sort((a, b) => (a.time < b.time ? -1 : 1));
  return t.length ? { start: t[0].time, end: t.reduce((m, x) => (x.timeEnd > m ? x.timeEnd : m), t[0].timeEnd), title: t[0].title } : null;
}
const workStart = () => workToday()?.start || arbeitsbeginn();
const workEnd = () => workToday()?.end || feierabendAt();
const hm = (s) => { const [h, m] = String(s).split(":").map(Number); return [h || 0, m || 0]; };
function feierabendText() {
  const now = new Date(), wd = now.getDay();
  const ov = workToday();
  if (!workEnd()) return { t: "", none: true, party: false, pct: 0 };
  if ((wd === 0 || wd === 6) && !ov) return { t: privMode() ? "Wochenende. Genieß es." : "Wochenende. Was machst du hier?", party: true, pct: 100 };
  const [h, m] = hm(workEnd());
  const end = new Date(now); end.setHours(h, m, 0, 0);
  const start = new Date(now); start.setHours(...hm(workStart()), 0, 0);
  const pct = Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
  const mins = Math.round((end - now) / 60000);
  if (now < start) return { t: ov ? `${ov.title} ab ${ov.start}` : `Arbeit ab ${workStart()}`, party: false, pct: 0 };
  if (mins <= 0) return { t: privMode() ? "Feierabend. Endlich." : "Feierabend. Ab nach Hause.", party: true, pct: 100 };
  const hh = Math.floor(mins / 60), mm = mins % 60;
  return { t: `Feierabend in ${hh ? hh + " Std " : ""}${mm} Min`, party: mins <= 30, pct };
}
const isWide = () => matchMedia("(min-width: 1500px)").matches; // rechte Spalte „Heute“ sichtbar

let lastTodayHtml = "", todayShown = false, lastDayHtml = null;
// Fortschrittsring im Uhr-Stil (Akzentfarbe): Verlauf entlang des Bogens, Schatten am Kopf, Funken beim Schließen
var ringShown = 0, ringRaf = 0, ringSparks = [];
const RS = 84, RP = 8, RW = 11; // Größe, Rand für Funken, Ringbreite
function ringCols() {
  const x = document.createElement("canvas").getContext("2d"); x.fillStyle = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#4F46E5";
  const h = x.fillStyle, n = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)), mix = (k) => "#" + n.map((v) => Math.round(v + (255 - v) * k).toString(16).padStart(2, "0")).join("");
  return { c0: h, c1: mix(.45), rgb: n.join(" ") };
}
function ringDraw(cv, p, glow, C) {
  const dpr = window.devicePixelRatio || 1;
  if (cv.width !== RS * dpr) cv.width = cv.height = RS * dpr;
  const g = cv.getContext("2d"), c = RS / 2, r = RS / 2 - RP - RW / 2, A0 = -Math.PI / 2, TAU = Math.PI * 2, head = A0 + p * TAU;
  g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, RS, RS);
  g.lineWidth = RW; g.lineCap = "butt";
  g.strokeStyle = `rgb(${C.rgb} / .2)`; g.beginPath(); g.arc(c, c, r, 0, TAU); g.stroke();
  if (glow > 0) { g.save(); g.shadowColor = C.c1; g.shadowBlur = 16 * glow; g.strokeStyle = `rgb(${C.rgb} / ${.9 * glow})`; g.beginPath(); g.arc(c, c, r, 0, TAU); g.stroke(); g.restore(); }
  if (p >= .002) {
    g.save();
    g.beginPath(); g.arc(c, c, r + RW / 2, 0, TAU); g.arc(c, c, r - RW / 2, 0, TAU, true); g.clip();
    const grad = g.createConicGradient(A0, c, c); grad.addColorStop(0, C.c0); grad.addColorStop(Math.min(1, p), C.c1); if (p < 1) grad.addColorStop(1, C.c1);
    g.strokeStyle = grad; g.beginPath(); g.arc(c, c, r, A0, head); g.stroke();
    if (p < 1) { g.fillStyle = C.c0; g.beginPath(); g.arc(c, c - r, RW / 2, 0, TAU); g.fill(); }
    const tx = -Math.sin(head), ty = Math.cos(head);
    g.shadowColor = "rgb(0 0 0 / .5)"; g.shadowBlur = 5; g.shadowOffsetX = tx * 2.5; g.shadowOffsetY = ty * 2.5;
    g.fillStyle = C.c1; g.beginPath(); g.arc(c + r * Math.cos(head), c + r * Math.sin(head), RW / 2, 0, TAU); g.fill();
    g.restore();
  }
  ringSparks.forEach((s) => { g.globalAlpha = Math.max(0, s.l); g.fillStyle = s.c; g.beginPath(); g.arc(s.x, s.y, s.s * (.5 + s.l / 2), 0, TAU); g.fill(); });
  g.globalAlpha = 1;
}
function ringBurst(C) {
  const c = RS / 2, y = RP + RW / 2;
  for (let n = 0; n < 14; n++) { const a = -Math.PI / 2 + (Math.random() - .5) * 2.6, v = 1 + Math.random() * 2; ringSparks.push({ x: c, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 1, s: 1 + Math.random() * 1.5, c: Math.random() < .3 ? "#fff" : C.c1 }); }
  tone([1046.5, 1568], .22, "sine", .06, .05);
}
function animateRing(replay) {
  const tile = document.querySelector("#today-card .ring-tile"); if (!tile) return;
  const cv = tile.querySelector("canvas"), num = tile.querySelector("em"), to = +tile.dataset.pct / 100, from = replay ? 0 : ringShown, C = ringCols();
  cancelAnimationFrame(ringRaf);
  const t0 = performance.now(), D = reduce.matches ? 0 : 1400, closes = to >= 1 && from < 1;
  const ease = (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  let fired = 0, last = t0;
  const tick = (t) => {
    const k = D ? Math.min(1, (t - t0) / D) : 1, x = from + (to - from) * ease(k);
    let busy = k < 1;
    if (closes && !fired && x >= 1 && D) { fired = t; ringBurst(C); }
    const glow = fired ? Math.max(0, 1 - (t - fired) / 900) : 0; if (glow > 0) busy = true;
    const dt = Math.min(3, (t - last) / 16.7); last = t;
    ringSparks.forEach((s) => { s.x += s.vx * dt; s.y += s.vy * dt; s.vy += .06 * dt; s.vx *= .97; s.l -= .028 * dt; });
    ringSparks = ringSparks.filter((s) => s.l > 0); if (ringSparks.length) busy = true;
    ringDraw(cv, x, glow, C);
    num.textContent = Math.round(x * 100) + "%";
    if (busy) ringRaf = requestAnimationFrame(tick);
  };
  ringRaf = requestAnimationFrame(tick);
  ringShown = to;
}
function ringsHtml(doneToday, dueToday, st) {
  const tot = doneToday + dueToday, pc = tot ? Math.round(doneToday / tot * 100) : 0;
  return `<div class="tc-stats"><div class="ring-tile" data-pct="${pc}" title="Klick: nochmal abspielen"><div class="ring"><canvas aria-hidden="true"></canvas><em>${pc}%</em></div><div><b>${doneToday} von ${tot}</b><span>${dueToday ? `heute geschafft · ${dueToday} offen` : tot ? "alles für heute erledigt" : "heute nichts fällig"}</span></div></div><div><b>${st}</b><span>Tage Streak</span></div></div>`;
}
$("today-card").addEventListener("click", (e) => { if (e.target.closest(".ring-tile")) animateRing(true); });
function renderToday() {
  if (!isWide()) return;
  const t = todayD(), today = iso(t);
  const doneToday = items.filter((x) => x.done && x.doneAt && inMode(x) && iso(new Date(x.doneAt)) === today).length;
  const dueToday = items.filter((x) => !x.done && !x.archived && inMode(x) && x.due && x.due <= today).length;
  const st = loaded ? streakOf().n : 0;
  const html = `<div class="today-card${todayShown ? " static" : ""}">
    <div class="tc-top"><b>Heute</b><span>${WD[t.getDay()]}, ${t.getDate()}. ${MON[t.getMonth()]} · KW ${kw(t)}</span></div>
    ${ringsHtml(doneToday, dueToday, st)}
    <div class="tc-btns"><button type="button" class="chip-btn" id="plan-open">Tag planen</button><button type="button" class="chip-btn" id="week-open">Wochenrückblick</button>${privMode() ? "" : '<button type="button" class="chip-btn" id="rep-open">Was hab ich gemacht?</button>'}</div>
  </div>`;
  if (html === lastTodayHtml) return;
  lastTodayHtml = html; todayShown = true;
  $("today-card").innerHTML = html;
  animateRing();
}
function kw(d) { const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = x.getUTCDay() || 7; x.setUTCDate(x.getUTCDate() + 4 - day); const y = new Date(Date.UTC(x.getUTCFullYear(), 0, 1)); return Math.ceil(((x - y) / 864e5 + 1) / 7); }

function renderDay() {
  if (MINI) return;
  $("aside").hidden = !isWide();
  if (isWide()) renderToday();
}
$("aside").addEventListener("click", (e) => {
  if (e.target.closest("#plan-open")) openPlan();
  else if (e.target.closest("#week-open")) openWeek();
  else if (e.target.closest("#rep-open")) openRep();
});
matchMedia("(min-width: 1500px)").addEventListener("change", renderDay);
renderDay();
setInterval(whenVisible(renderDay), 30000);

// ===== 03-fokus-rituale.js =====
// ======================================================================
// ---------- Tagesplanung (einmal am Tag beim ersten Öffnen) ----------
// ======================================================================
function openPlan() {
  const h = new Date().getHours();
  $("plan-h").textContent = h < 11 ? "Guten Morgen" : h < 18 ? "Guten Tag" : "Guten Abend";
  renderPlan();
  $("plan-overlay").hidden = false;
}
function renderPlan() {
  const today = iso(todayD());
  const open = items.filter((t) => !t.done && !t.archived && inMode(t));
  const late = open.filter((t) => t.due && endDay(t) < today).sort((a, b) => (a.due < b.due ? -1 : 1));
  const now = open.filter((t) => t.due === today).sort((a, b) => (a.time || "99") < (b.time || "99") ? -1 : 1);
  const none = open.filter((t) => !t.due).length;
  const row = (t, isLate) => `<div class="plan-row" data-id="${t.id}"><span class="sq" style="background:${listById[t.list].dot}"></span><span class="t">${esc(t.title)}</span><small>${isLate ? dueLabel(t.due) : t.time || ""}${t.prio === "hoch" ? " · Hoch" : ""}</small>${isLate ? '<button type="button" data-plan="today">Heute</button><button type="button" data-plan="tomorrow">Morgen</button>' : ""}<button type="button" class="ok" data-plan="done" aria-label="Erledigt">✓</button></div>`;
  let html = "";
  if (late.length) html += `<h3 class="late">Überfällig · ${late.length}</h3>` + late.map((t) => row(t, true)).join("");
  html += `<h3>Heute · ${now.length}</h3>` + (now.length ? now.map((t) => row(t, false)).join("") : '<p class="plan-empty">Nichts fest eingeplant. Freie Bahn.</p>');
  if (none) html += `<p class="plan-empty">${none} ${none === 1 ? "Aufgabe" : "Aufgaben"} ohne Datum warten in der Liste.</p>`;
  $("plan-body").innerHTML = html;
  $("plan-all").hidden = late.length < 2;
}
$("plan-body").addEventListener("click", (e) => {
  const b = e.target.closest("[data-plan]"); if (!b) return;
  const id = b.closest(".plan-row").dataset.id, a = b.dataset.plan;
  if (a === "today") patch(id, { due: iso(todayD()) });
  else if (a === "tomorrow") patch(id, { due: iso(addDays(todayD(), 1)) });
  else if (a === "done") { toggleDone(id); sfx.done(); burst(b, 12, 1); }
  setTimeout(renderPlan, 50);
});
$("plan-all").addEventListener("click", () => {
  const today = iso(todayD());
  items.filter((t) => !t.done && !t.archived && inMode(t) && t.due && endDay(t) < today).forEach((t) => patch(t.id, { due: today }));
  setTimeout(renderPlan, 50);
});
$("plan-go").addEventListener("click", () => { $("plan-overlay").hidden = true; burst($("new"), 24, 2); });
$("plan-close").addEventListener("click", () => { $("plan-overlay").hidden = true; });
$("plan-overlay").addEventListener("click", (e) => { if (e.target.id === "plan-overlay") $("plan-overlay").hidden = true; });

// ======================================================================
// ---------- Wochenrückblick (freitags ab 12 Uhr, einmal pro Woche) ----------
// ======================================================================
function weekStats(back = 0) {
  const t = todayD(), mon = addDays(t, -((t.getDay() + 6) % 7) - 7 * back);
  const keys = [...Array(7)].map((_, i) => iso(addDays(mon, i)));
  const done = doneItems().filter(inMode).filter((x) => { const k = iso(new Date(x.doneAt)); return k >= keys[0] && k <= keys[6]; });
  return { mon, keys, per: keys.map((k) => done.filter((x) => iso(new Date(x.doneAt)) === k).length), done };
}
const weekId = () => { const s = weekStats(); return iso(s.mon); };
function openWeek() {
  const w = weekStats(), last = weekStats(1);
  const total = w.done.length, lastTotal = last.done.length;
  const showDays = [0, 1, 2, 3, 4].concat(w.per[5] ? [5] : [], w.per[6] ? [6] : []);
  const max = Math.max(1, ...w.per);
  const best = w.per.indexOf(Math.max(...w.per));
  const byList = LISTS.map((l) => l.id).filter((x) => x !== "alle").map((l) => [l, w.done.filter((x) => x.list === l).length]).filter((x) => x[1]);
  const hot = w.done.filter((x) => x.prio === "hoch").length;
  const oldest = items.filter((x) => !x.done && !x.archived && inMode(x)).sort((a, b) => a.createdAt - b.createdAt)[0];
  const oldDays = oldest ? Math.floor((Date.now() - oldest.createdAt) / 864e5) : 0;
  const verdict = total === 0 ? "Ruhige Woche. Auch mal schön." : total < 5 ? "Solide Woche." : total < 15 ? "Starke Woche!" : "Maschine. Absolute Maschine.";
  const diff = total - lastTotal;
  $("week-body").innerHTML = `
    <p class="week-verdict">${verdict}</p>
    <div class="week-bars" style="--n:${showDays.length}">${showDays.map((i) => `<div><b>${w.per[i]}</b><i class="${w.per[i] ? "" : "zero"}" style="height:${Math.max(4, (w.per[i] / max) * 120)}px;animation-delay:${i * 70}ms"></i><span>${["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"][i]}</span></div>`).join("")}</div>
    <div class="week-sum">
      <div><b>${total}</b><span>erledigt${lastTotal || total ? ` · ${diff >= 0 ? "+" : ""}${diff} zur Vorwoche` : ""}</span></div>
      <div><b>${hot}</b><span>davon Prio Hoch</span></div>
      <div><b>${total ? ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"][best] : "–"}</b><span>stärkster Tag</span></div>
      <div><b>${streakOf().n}</b><span>Tage Streak</span></div>
    </div>
    ${byList.length ? `<p class="week-note">${byList.map(([l, n]) => `${listById[l].name}: ${n}`).join(" · ")}</p>` : ""}
    ${oldest && oldDays >= 5 ? `<p class="week-note">Ältester offener Brocken: <b>${esc(oldest.title)}</b> – liegt seit ${oldDays} Tagen.</p>` : ""}`;
  $("week-overlay").hidden = false;
  if (total && total >= lastTotal) setTimeout(() => burst(document.querySelector("#week-overlay .week-verdict"), 50, 3), 300);
  sfx.ach();
}
$("week-close").addEventListener("click", () => { $("week-overlay").hidden = true; });
$("week-overlay").addEventListener("click", (e) => { if (e.target.id === "week-overlay") $("week-overlay").hidden = true; });

// ======================================================================
// ---------- Feierabend-Party ----------
// ======================================================================
function showParty() {
  const today = iso(todayD());
  const n = doneItems().filter((t) => iso(new Date(t.doneAt)) === today).length;
  $("party-frog").innerHTML = FROG;
  $("party-sub").textContent = n ? `Heute ${n} ${n === 1 ? "Aufgabe" : "Aufgaben"} erledigt.` : "Heute nix abgehakt. Morgen wieder.";
  $("party-msg").textContent = ["Laptop zu, Kopf aus.", "Die Tickets laufen nicht weg.", "Der Drucker kommt auch ohne dich klar. Vielleicht.", "Gut gemacht. Ab nach Hause."][Math.floor(Math.random() * 4)];
  $("party-overlay").hidden = false;
  tone([523.3, 659.3, 784, 1046.5, 784, 1046.5, 1318.5], .2, "triangle", .12, .12);
  for (let i = 0; i < 3; i++) setTimeout(() => burst(document.querySelector("#party-overlay .big"), 60, 4), i * 500);
  try { if (wantNotify && canNotify()) { const no = new Notification("Feierabend!", { body: $("party-sub").textContent + " Ab nach Hause." }); no.onclick = () => window.desktop?.show(); } } catch {}
  setTimeout(() => { $("party-overlay").hidden = true; }, 15000);
}
$("party-close").addEventListener("click", () => { $("party-overlay").hidden = true; });

// Rituale prüfen: beim Laden und jede Minute
const anyOverlay = () => ["plan-overlay", "week-overlay", "party-overlay", "lvl-overlay", "ach-overlay", "setup-overlay"].some((id) => $(id) && !$(id).hidden);
function maybeRituals() {
  if (MINI) return;
  if (!uid || !loaded) return;
  const now = new Date(), wd = now.getDay(), today = dayKey();
  // Feierabend: Werktag, Zeit erreicht, höchstens 2 Std danach, einmal pro Tag
  if (((wd >= 1 && wd <= 5) || workToday()) && workEnd()) {
    const [h, m] = workEnd().split(":").map(Number); const end = new Date(now); end.setHours(h, m, 0, 0);
    const k = "erledigt-party-" + today;
    if (now >= end && now - end < 2 * 3600e3 && !store.get(k, false) && !anyOverlay()) { store.set(k, true); showParty(); return; }
  }
  if (anyOverlay()) return;
  const kPlan = "erledigt-plan-" + uid;
  if (store.get(kPlan, "") !== today && now.getHours() >= 5) {
    store.set(kPlan, today);
    const open = items.filter((t) => !t.done && !t.archived && inMode(t) && t.due && t.due <= iso(todayD()));
    if (open.length) { openPlan(); return; }
  }
  const kWeek = "erledigt-week-" + uid;
  if ((wd === 5 && now.getHours() >= 12) || wd === 6 || wd === 0) {
    if (store.get(kWeek, "") !== weekId()) { store.set(kWeek, weekId()); openWeek(); }
  }
}
setInterval(maybeRituals, 60000);

// ===== 03b-fokus.js =====
// ======================================================================
// ---------- Fokus-Modus: Landschaft über die ganze Fläche, eine Aufgabe, Timer (25 Min) ----------
// ======================================================================
// Start: Taste F auf der gewählten Aufgabe, oder ◎ im Detail. Ende: Esc oder „Fokus beenden“.
// Die Landschaft ist dieselbe wie im Kopf – body.fokus zieht den Kopf auf volle Höhe, die Szene rechnet sich neu.
let fokus = null; // { id, end, left, paused, tick }
function fokusFmt(ms) { const s = Math.max(0, Math.round(ms / 1000)); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }
function fokusRender() {
  if (!fokus) return;
  const t = items.find((x) => x.id === fokus.id);
  if (!t || t.done) { endFokus(); return; }
  $("fokus-title").textContent = t.title;
  const cl = t.checklist || [], done = cl.filter((c) => c.done).length;
  const next = items.filter((x) => !x.done && inMode(x) && x.id !== t.id && x.due === iso(todayD()) && x.time).sort((a, b) => (a.time < b.time ? -1 : 1))[0];
  $("fokus-sub").textContent = [cl.length ? `☑ ${done} von ${cl.length} Unterpunkten` : "", next ? `Nächstes: ${next.title} um ${next.time}` : ""].filter(Boolean).join(" · ");
  const left = fokus.paused ? fokus.left : fokus.end - Date.now();
  $("fokus-time").textContent = fokusFmt(left);
  $("fokus-pause").textContent = fokus.paused ? "Weiter" : "Pause";
  if (left <= 0 && !fokus.paused) { fokus.paused = true; fokus.left = 0; try { sfx.done?.(); } catch {} showReminder("Fokus-Runde vorbei", `25 Minuten an „${t.title}“ – kurze Pause?`, null); }
}
function startFokus(id) {
  const t = items.find((x) => x.id === id); if (!t || t.done || MINI) return;
  if (fokus) clearInterval(fokus.tick);
  fokus = { id, end: Date.now() + 25 * 60000, left: 0, paused: false, tick: setInterval(fokusRender, 500) };
  const n = new Date();
  $("fokus-date").textContent = `Fokus · ${WD[n.getDay()]}, ${n.getDate()}. ${MON[n.getMonth()]}`;
  $("fokus").hidden = false; document.body.classList.add("fokus");
  if (typeof sceneSync === "function") setTimeout(sceneSync, 50);
  fokusRender();
}
function endFokus() {
  if (!fokus) return;
  clearInterval(fokus.tick); fokus = null;
  $("fokus").hidden = true; document.body.classList.remove("fokus");
  if (typeof sceneSync === "function") setTimeout(sceneSync, 50);
}
$("fokus").addEventListener("click", (e) => {
  if (!fokus) return;
  if (e.target.id === "fokus-x") endFokus();
  else if (e.target.id === "fokus-done") { const id = fokus.id; endFokus(); completeTask(id); }
  else if (e.target.id === "fokus-pause") { if (fokus.paused) { fokus.end = Date.now() + fokus.left; fokus.paused = false; } else { fokus.left = Math.max(0, fokus.end - Date.now()); fokus.paused = true; } fokusRender(); }
  else if (e.target.id === "fokus-more") { if (fokus.paused) fokus.left += 5 * 60000; else fokus.end += 5 * 60000; fokusRender(); }
});
document.addEventListener("keydown", (e) => { if (fokus && e.key === "Escape") { e.stopPropagation(); endFokus(); } }, true);

// ===== 03c-einkauf.js =====
// ======================================================================
// ---------- Einkaufsliste wie Bring: Kacheln statt Zeilen, Katalog nach Regalen, Zuletzt gekauft ----------
// ======================================================================
// Gilt nur für die Liste „Einkaufen“ in der Listenansicht. Jeder Artikel bleibt eine normale Aufgabe (Sync, Details, Handy wie gehabt):
// Tipp auf Kachel im Korb = gekauft (erledigt) · Tipp im Katalog = in den Korb · Tipp bei „Zuletzt gekauft“ = wieder in den Korb.
// Eingabe oben: „Milch, Brot, Eier“ legt drei Artikel an. Rechtsklick / langer Druck öffnet die Details (Menge, Notiz).
const SHOP_CATS = [
  ["Obst & Gemüse", ["🍎 Äpfel", "🍌 Bananen", "🍐 Birnen", "🍇 Trauben", "🍓 Erdbeeren", "🫐 Blaubeeren", "🍊 Orangen", "🍋 Zitronen", "🥝 Kiwi", "🍑 Pfirsiche", "🍒 Kirschen", "🍍 Ananas", "🥭 Mango", "🍉 Melone", "🥑 Avocado", "🍅 Tomaten", "🥒 Gurke", "🥕 Möhren", "🧅 Zwiebeln", "🧄 Knoblauch", "🥔 Kartoffeln", "🥬 Salat", "🥦 Brokkoli", "🥦 Blumenkohl", "🫑 Paprika", "🌶️ Chili", "🍆 Aubergine", "🥒 Zucchini", "🌽 Mais", "🍄 Champignons", "🥬 Spinat", "🥬 Lauch", "🫛 Erbsen", "🌿 Kräuter", "🫚 Ingwer", "🥗 Rucola"]],
  ["Brot & Backwaren", ["🍞 Brot", "🥖 Baguette", "🥐 Croissants", "🥯 Brötchen", "🍞 Toast", "🥨 Brezeln", "🧇 Waffeln", "🍰 Kuchen", "🍪 Kekse", "🥙 Wraps", "🫓 Fladenbrot"]],
  ["Milch & Kühlregal", ["🥛 Milch", "🥛 Hafermilch", "🧈 Butter", "🧀 Käse", "🧀 Gouda", "🧀 Feta", "🧀 Mozzarella", "🧀 Parmesan", "🧀 Frischkäse", "🥛 Joghurt", "🥛 Quark", "🥛 Sahne", "🥛 Schmand", "🥚 Eier", "🥓 Speck", "🍖 Schinken", "🌭 Wurst", "🥩 Aufschnitt", "🧈 Margarine", "🍮 Pudding", "🥛 Skyr"]],
  ["Fleisch & Fisch", ["🍗 Hähnchen", "🥩 Hackfleisch", "🥩 Rindfleisch", "🥩 Schnitzel", "🌭 Würstchen", "🍗 Pute", "🐟 Lachs", "🐟 Fischstäbchen", "🍤 Garnelen", "🥫 Thunfisch", "🥩 Steak", "🌱 Tofu"]],
  ["Vorräte", ["🍝 Nudeln", "🍚 Reis", "🥣 Haferflocken", "🥣 Müsli", "🌾 Mehl", "🍬 Zucker", "🧂 Salz", "🫙 Pesto", "🍅 Passata", "🥫 Tomaten (Dose)", "🥫 Kichererbsen", "🥫 Bohnen", "🥫 Mais (Dose)", "🫒 Oliven", "🫙 Gewürzgurken", "🧴 Olivenöl", "🧴 Rapsöl", "🫙 Essig", "🍯 Honig", "🫙 Marmelade", "🥜 Erdnussbutter", "🍫 Nutella", "🧂 Gewürze", "🧂 Brühe", "🫙 Senf", "🥫 Ketchup", "🥫 Mayo", "🍜 Instant-Nudeln", "🫘 Linsen", "🥔 Kartoffelpüree", "🧁 Backpulver", "🍫 Backschokolade", "🌰 Nüsse", "🥥 Kokosmilch", "🍛 Currypaste", "🍜 Sojasoße"]],
  ["Tiefkühl", ["🍕 Pizza", "🍟 Pommes", "🥦 TK-Gemüse", "🍓 TK-Beeren", "🍨 Eis", "🥟 Maultaschen", "🥐 Aufbackbrötchen", "🌿 TK-Kräuter", "🥬 TK-Spinat"]],
  ["Getränke", ["💧 Wasser", "🧃 Apfelsaft", "🧃 Orangensaft", "🥤 Cola", "🥤 Limo", "🍺 Bier", "🍷 Wein", "☕ Kaffee", "🍵 Tee", "🥛 Kakao", "🧋 Eistee", "🍾 Sekt", "⚡ Energy"]],
  ["Snacks & Süßes", ["🍫 Schokolade", "🍬 Gummibärchen", "🥨 Chips", "🥨 Salzstangen", "🍿 Popcorn", "🍪 Müsliriegel", "🥜 Erdnüsse", "🍩 Donuts", "🍭 Bonbons", "🧇 Waffeln", "🍫 Riegel"]],
  ["Haushalt", ["🧻 Toilettenpapier", "🧻 Küchenrolle", "🧴 Spülmittel", "🧽 Schwämme", "🧼 Spültabs", "🧺 Waschmittel", "🧴 Weichspüler", "🗑️ Müllbeutel", "🧴 Allzweckreiniger", "🧻 Taschentücher", "🧴 Glasreiniger", "🔋 Batterien", "💡 Glühbirne", "🧽 Putzlappen", "🧴 Entkalker", "🕯️ Kerzen", "🎁 Geschenkpapier", "📦 Alufolie", "📦 Frischhaltefolie", "📦 Backpapier"]],
  ["Drogerie", ["🪥 Zahnpasta", "🪥 Zahnbürste", "🧴 Shampoo", "🧴 Duschgel", "🧼 Seife", "🧴 Deo", "🧴 Creme", "🪒 Rasierer", "🧴 Sonnencreme", "🩹 Pflaster", "💊 Schmerztabletten", "🧻 Wattepads", "🧴 Handcreme", "🧴 Haarspray", "🧴 Spülung", "🧴 Lippenpflege"]],
  ["Tiere", ["🐱 Katzenfutter", "🐱 Katzenstreu", "🐱 Leckerlis", "🐶 Hundefutter", "🐾 Snacks (Tier)"]],
];
const SHOP_ITEMS = SHOP_CATS.flatMap(([cat, arr]) => arr.map((s) => { const i = s.indexOf(" "); return { emoji: s.slice(0, i), name: s.slice(i + 1), cat }; }));
const shopKey = (s) => String(s || "").toLowerCase().replace(/\d+\s*(x|st|stk|g|kg|l|ml|pack|packung|flaschen?|dosen?)?\b/g, "").replace(/[^a-zäöüß ]/g, "").trim();
const SHOP_BY_KEY = Object.fromEntries(SHOP_ITEMS.map((x) => [shopKey(x.name), x]));
// Icon für einen frei eingetippten Artikel: exakt, sonst Wortanfang, sonst nach Kategorie-Stichworten
function shopIcon(title) {
  const k = shopKey(title); if (!k) return "🛒";
  if (SHOP_BY_KEY[k]) return SHOP_BY_KEY[k].emoji;
  const w = k.split(" ")[0];
  const hit = SHOP_ITEMS.find((x) => { const xk = shopKey(x.name); return xk === w || xk.startsWith(w) || w.startsWith(xk) || k.includes(xk); });
  return hit ? hit.emoji : "🛒";
}
const shopItems = () => items.filter((t) => !t.archived && t.list === "einkaufen");
function shopHtml() {
  // Bewusst wenig: Korb oben, darunter eine Reihe Vorschläge, der Katalog erst auf Tipp (Regal-Chips) oder beim Suchen.
  const all = shopItems(), open = all.filter((t) => !t.done).sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  const openKeys = new Set(open.map((t) => shopKey(t.title)));
  const recent = all.filter((t) => t.done && t.doneAt).sort((a, b) => b.doneAt - a.doneAt);
  const seenNames = new Set(), sugg = [];
  for (const t of recent) { const k = shopKey(t.title); if (seenNames.has(k) || openKeys.has(k)) continue; seenNames.add(k); sugg.push({ name: t.title, emoji: shopIcon(t.title) }); if (sugg.length >= 12) break; }
  for (const x of SHOP_STAPLES) { if (sugg.length >= 12) break; const k = shopKey(x); if (seenNames.has(k) || openKeys.has(k)) continue; seenNames.add(k); sugg.push({ name: x, emoji: shopIcon(x) }); }
  const tile = (t) => `<button type="button" class="sh-tile in" data-sh="${t.id}" title="Antippen = gekauft"><span class="sh-ico">${shopIcon(t.title)}</span><span class="sh-name">${esc(t.title)}</span></button>`;
  const ktile = (x, cls = "") => `<button type="button" class="sh-tile${cls}${openKeys.has(shopKey(x.name)) ? " in" : ""}" data-sh-add="${esc(x.name)}"><span class="sh-ico">${x.emoji}</span><span class="sh-name">${esc(x.name)}</span></button>`;
  const q = shopQuery.trim().toLowerCase();
  let h = `<div class="shop">`;
  h += `<section class="sh-sec sh-korb"><h4><span>Im Korb</span><b>${open.length}</b>${open.length > 1 ? `<button type="button" class="sh-all" data-sh-all="1">Alles gekauft</button>` : ""}</h4>`;
  h += open.length ? `<div class="sh-grid">${open.map(tile).join("")}</div>` : `<div class="sh-empty">Leer. Tipp unten etwas an oder schreib oben <code>Milch, Brot, Eier</code>.</div>`;
  h += `</section>`;
  if (sugg.length) h += `<section class="sh-sec sh-quick"${q ? " hidden" : ""}><h4><span>Schnell rein</span></h4><div class="sh-grid sh-small">${sugg.map((x) => ktile(x)).join("")}</div></section>`;
  h += `<section class="sh-sec sh-kat"><h4><span>Katalog</span><input type="search" class="sh-search" placeholder="Suchen …" value="${esc(shopQuery)}" aria-label="Im Katalog suchen"></h4><div class="sh-res">`;
  if (q) {
    const hits = SHOP_ITEMS.filter((x) => x.name.toLowerCase().includes(q)).slice(0, 24);
    h += `<div class="sh-grid sh-small">${hits.map((x) => ktile(x)).join("")}${hits.some((x) => x.name.toLowerCase() === q) ? "" : ktile({ name: shopQuery.trim(), emoji: "➕" }, " sh-new")}</div>`;
  } else {
    h += `<div class="sh-chips">${SHOP_CATS.map(([c]) => `<button type="button" class="chip-btn${shopCat === c ? " on" : ""}" data-sh-cat="${esc(c)}">${esc(c)}</button>`).join("")}</div>`;
    if (shopCat) h += `<div class="sh-grid sh-small">${SHOP_ITEMS.filter((x) => x.cat === shopCat).map((x) => ktile(x)).join("")}</div>`;
  }
  h += `</div></section></div>`;
  return h;
}
const SHOP_STAPLES = ["Milch", "Brot", "Eier", "Butter", "Käse", "Bananen", "Äpfel", "Tomaten", "Nudeln", "Toilettenpapier", "Joghurt", "Kaffee"];
let shopCat = "";
let shopQuery = "";
function shopAdd(name) {
  const k = shopKey(name), ex = shopItems().find((t) => !t.done && shopKey(t.title) === k);
  if (ex) { remove([ex.id], `„${ex.title}“ aus dem Korb genommen`); return; }
  addItem({ title: name, list: "einkaufen", prio: "mittel" });
}
$("tasks").addEventListener("click", async (e) => {
  if (list !== "einkaufen") return;
  const all = e.target.closest("[data-sh-all]"); if (all) { const ids = shopItems().filter((t) => !t.done).map((t) => t.id); burst(all, 24, 1.6); sfx.done(); for (const id of ids) toggleDone(id); render(); showToast(`${ids.length} Sachen gekauft`, () => ids.forEach((x) => items.find((i) => i.id === x)?.done && toggleDone(x))); return; }
  const cat = e.target.closest("[data-sh-cat]"); if (cat) { shopCat = shopCat === cat.dataset.shCat ? "" : cat.dataset.shCat; render(); return; }
  const add = e.target.closest("[data-sh-add]"); if (add) { shopAdd(add.dataset.shAdd); render(); const s = $("tasks").querySelector(".sh-search"); if (s && shopQuery) { shopQuery = ""; render(); } return; }
  const b = e.target.closest("[data-sh]"); if (!b) return;
  const id = b.dataset.sh, t = items.find((x) => x.id === id); if (!t) return;
  if (!t.done) { b.classList.add("popping"); sfx.done(); burst(b, 14, 1.2); await wait(260); toggleDone(id); render(); showToast(`„${t.title}“ gekauft`, () => items.find((i) => i.id === id)?.done && toggleDone(id)); }
  else { // zuletzt gekauft → wieder in den Korb (neuer Eintrag, der alte bleibt für die Statistik)
    const k = shopKey(t.title); if (shopItems().some((x) => !x.done && shopKey(x.title) === k)) { showToast(`„${t.title}“ ist schon im Korb`); return; }
    addItem({ title: t.title, list: "einkaufen", prio: "mittel", notes: t.notes || "" }); render();
  }
});
$("tasks").addEventListener("contextmenu", (e) => { const b = e.target.closest("[data-sh]"); if (!b || list !== "einkaufen") return; e.preventDefault(); selected = b.dataset.sh; openDetail(b.dataset.sh); });
{ let pressT = 0; // langer Druck am Handy öffnet die Details
  $("tasks").addEventListener("touchstart", (e) => { const b = e.target.closest("[data-sh]"); if (!b) return; clearTimeout(pressT); pressT = setTimeout(() => { navigator.vibrate?.(10); selected = b.dataset.sh; openDetail(b.dataset.sh); b.dataset.held = "1"; }, 550); }, { passive: true });
  ["touchend", "touchmove", "touchcancel"].forEach((ev) => $("tasks").addEventListener(ev, () => clearTimeout(pressT), { passive: true }));
  $("tasks").addEventListener("click", (e) => { const b = e.target.closest("[data-sh]"); if (b?.dataset.held) { delete b.dataset.held; e.stopImmediatePropagation(); e.preventDefault(); } }, true);
}
// Suche tauscht nur die Trefferliste aus – kein komplettes Neuzeichnen pro Tastendruck, Fokus bleibt im Feld
$("tasks").addEventListener("input", (e) => {
  if (!e.target.classList.contains("sh-search")) return;
  shopQuery = e.target.value;
  const cur = e.target.closest(".shop"), tpl = document.createElement("template"); tpl.innerHTML = shopHtml();
  const fresh = tpl.content.querySelector(".sh-res"), old = cur?.querySelector(".sh-res");
  if (!old || !fresh) { render(); return; }
  old.replaceWith(fresh);
  const qk = cur.querySelector(".sh-quick"); if (qk) qk.hidden = !!shopQuery.trim();
});
$("tasks").addEventListener("keydown", (e) => { if (e.target.classList.contains("sh-search") && e.key === "Enter" && shopQuery.trim()) { e.preventDefault(); const hit = SHOP_ITEMS.find((x) => x.name.toLowerCase() === shopQuery.trim().toLowerCase()) || SHOP_ITEMS.find((x) => x.name.toLowerCase().startsWith(shopQuery.trim().toLowerCase())); shopAdd(hit ? hit.name : shopQuery.trim()); shopQuery = ""; render(); $("tasks").querySelector(".sh-search")?.focus(); } });
// Eingabe oben: mehrere Artikel mit Komma
$("addform").addEventListener("submit", (e) => {
  if (list !== "einkaufen") return;
  const v = $("new").value.trim(); if (!v.includes(",") || v.startsWith("/")) return;
  e.preventDefault(); e.stopImmediatePropagation();
  v.split(",").map((s) => s.trim()).filter(Boolean).forEach((s) => { const p = parseInput(s); const title = p.title || s; if (!shopItems().some((t) => !t.done && shopKey(t.title) === shopKey(title))) addItem({ ...p, title, list: "einkaufen", prio: p.prio || "mittel" }); });
  $("new").value = ""; updateHint(); render();
}, true);

// ===== 04-mitteilungen-design.js =====
// ======================================================================
// ---------- Mitteilungs-Zentrale ----------
// ======================================================================
const CHANGELOG = {
  "2.9.2": ["Ohne Verbindung geht nichts mehr verloren: Änderungen bleiben gespeichert und werden nachgeschickt, sobald das Netz wieder da ist", "Doppelklick auf einen Titel benennt wieder um – und Getipptes bleibt, auch wenn gerade ein anderes Gerät synchronisiert", "Verpasste Erinnerung (PC war im Ruhezustand) wird am selben Tag nachgereicht", "Der Assistent Origami (lokale KI) ist vorerst ausgebaut – die App ist dadurch deutlich kleiner"],
  "2.9.1": ["Flüssiger, vor allem am Handy und Mac: Der Himmel pausiert, wenn ein Fenster offen ist oder du weiterscrollst", "Arbeit und Privat sind strikt getrennt – im Arbeitsmodus ist nichts Privates mehr zu sehen (Listen, Zähler, Suche, Kalender, Planung, Assistent)", "Fenster und Menüs sind am Handy und Mac deckend statt Milchglas – umstellbar unter Einstellungen → Extras → Glas-Effekt", "Handy: Wochenansicht mit Tagen untereinander, Erinnerungen unten, Tagesplanung lesbar, kein heller Streifen über dem Himmel"],
  "2.9.0": ["Großer Frühjahrsputz: schneller, sparsamer im Hintergrund, aufgeräumter Code", "Origami ist schlauer – mehr Gedächtnis, kürzere und passendere Anweisungen", "Handy: Listen als Pillen oben, Aufgaben sofort sichtbar, größere Tippflächen", "Fokus-Modus zeigt wieder Timer und Knöpfe", "Einkaufen: „gekauft“ lässt sich rückgängig machen", "Sicherheit: Assistenten-Links von außen werden ignoriert"],
  "2.8.9": ["Dein Assistent heißt jetzt Origami – mit eigenem Papiervogel, der beim Arbeiten fliegt"],
  "2.8.8": ["KI-Leistung jetzt in drei Stufen", "Beim Antworten siehst du Schritt für Schritt, was der Assistent gerade macht"],
  "2.8.7": ["Assistent im eigenen Look", "Lade-Kreis beim Schreiben repariert", "Android: Handy-KI mit Gemini Nano (neue App-Version installieren)"],
  "2.8.6": ["Menüs noch durchsichtiger"],
  "2.8.5": ["Landschaften mit Vorschaubildern, Menüs halbtransparent", "Assistent im neuen Look – Dateien mit Vorschau und Speichern, Fortschritt bleibt stehen bis fertig", "Der Assistent hat jetzt etwas Persönlichkeit"],
  "2.8.4": ["Schöner Start: Logo, Haken, dann blendet alles weich ein"],
  "2.8.3": ["Assistent sieht jetzt nach was aus: Orb, Glanz, sanfte Animationen"],
  "2.8.2": ["Neue Landschaft Fjord – nachts mit Nordlicht, das sich im Wasser spiegelt", "Einkaufen aufgeräumt: Korb, „Schnell rein“, Regale nur auf Tipp", "Dschungel ist raus"],
  "2.8.1": ["Dschungel: Fluss und überwachsener Tempel, weniger Papageien", "Unterwasser ohne Lichtstrahlen"],
  "2.8.0": ["Einkaufen wie bei Bring: Kacheln, Katalog nach Regalen, Zuletzt gekauft – Tipp aufs Kästchen = gekauft", "Oben „Milch, Brot, Eier“ eintippen legt gleich drei Artikel an", "Neue Landschaften: Unterwasser und Dschungel"],
  "2.7.5": ["Feiertage in der Landschaft: Advent, Weihnachten, Silvester-Feuerwerk, Ostern, Halloween – automatisch am richtigen Tag", "Ausprobieren: Einstellungen → Himmel testen → Anlass"],
  "2.7.4": ["Im dunklen Modus reicht die Landschaft bis hinter die Listen – weniger leere Fläche", "Kein Hinweis-Fenster mehr beim Wechsel zwischen Arbeit und Privat", "Handy: gleiche Oberfläche wie am PC"],
  "2.7.3": ["Fokus-Modus: Taste F auf einer Aufgabe (oder ◎ im Detail) – die Landschaft füllt das ganze Fenster, dazu nur die eine Aufgabe und ein 25-Minuten-Timer mit Pause und +5 Min", "Esc oder „Fokus beenden“ bringt dich zurück"],
  "2.7.2": ["Erinnern vor dem Termin: Pünktlich, 5, 15, 30 oder 60 Min vorher (Einstellungen → Arbeitstag) – gilt auch fürs Handy", "Schalter „Große Landschaft“ in den Einstellungen: aus = schmales Band wie früher"],
  "2.7.1": ["Heller Modus: weicher, kurzer Übergang unter der Landschaft"],
  "2.7.0": ["Mehr Landschaft: der Himmel oben ist höher und hat jetzt einen Vordergrund – Wiese, große Bäume, der See in einer Senke", "Alles erledigt? Dann wächst die Landschaft und übernimmt den leeren Platz", "Titel oben bleibt auch bei hellem Mittagshimmel gut lesbar"],
  "2.6.7": ["Regen und Gewitter im Himmel richten sich nach der echten Regenmenge – kein Unwetter mehr bei Niesel"],
  "2.6.6": ["Updates kommen jetzt über GitHub-Releases (schneller, Download-Repo bleibt klein)", "Schnelleingabe kennt „do“ und „sa“ als Wochentag"],
  "2.6.5": ["Einstellungen neu: ruhig wie am Handy – Abschnitte, Farb-Kacheln, Schalter mit Erklärung", "Wetter mit Charakter: echte Quellwolken, die ziehen, Regen und Schnee mit Tiefe und Wind, richtige Blitze, ziehender Nebel", "Feierabend-Zeile im Kopf ist nur noch Anzeige"],
  "2.6.4": ["Windows: Fenster erscheint beim Start wieder zuverlässig (statt nur im Infobereich)", "Einstellungen-Knopf (Zahnrad) oben rechts wie am Handy", "Maximieren, Vollbild und Fenstergröße ändern ohne Ruckeln und ohne schwarzes Aufblitzen"],
  "2.6.3": ["Mac: Schließen im Vollbild hinterlässt keinen schwarzen Bildschirm mehr"],
  "2.6.2": ["Einstellungen auf allen Geräten gleich: Farbe, Landschaft, Hell/Dunkel, Arbeitszeit, Wetter-Ort (Arbeit/Privat bleibt je Gerät)", "Aufgabenzeilen wie am Handy: Kreis in Listenfarbe, „Hoch“ als roter Punkt"],
  "2.6.1": ["Himmel geht nahtlos bis an den oberen Fensterrand (Titelleiste durchsichtig)", "Updates deutlich sichtbar: Ladebalken unten rechts, Installations-Bildschirm, unter Windows mit Fortschrittsfenster", "Mitteilungen-Fenster wird nicht mehr von der Heute-Spalte verdeckt"],
  "2.6.0": ["Aufgeräumt: nur noch ein Look, Himmel fest oben, Seitenleiste nur Modus + Listen", "Design-Menü kurz: Modus, Hell/Dunkel, Farbe, Landschaft, Arbeitszeit", "Level, XP, Streak und Fortschritt gesammelt im Fenster „Erfolge“", "Aufgaben ruhiger: Nebensachen erst beim Hinzeigen; Offen/Erledigt-Schalter weg (Erledigtes von heute eingeklappt unten)", "Memes, Sprüche und Fokus-Modus entfernt"],
};
const INBOX_KEY = "erledigt-inbox";
function notesGet() { return store.get(INBOX_KEY, []); }
function addNote(n) {
  try {
    const list = notesGet();
    list.unshift({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), t: Date.now(), read: false, ...n });
    store.set(INBOX_KEY, list.slice(0, 100));
    renderInboxBadge(true);
    if (!$("inbox").hidden) renderInbox();
  } catch {}
}
function ago(t) {
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "gerade";
  if (m < 60) return `vor ${m} Min`;
  const h = Math.round(m / 60);
  if (h < 24) return `vor ${h} Std`;
  const d = new Date(t);
  return `${d.getDate()}.${d.getMonth() + 1}. ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function renderInboxBadge(ringIt) {
  const n = notesGet().filter((x) => !x.read).length;
  const el = $("inbox-n");
  el.hidden = !n; el.textContent = n > 99 ? "99+" : String(n);
  if (ringIt && n) { const b = $("inbox-btn"); b.classList.remove("ringing"); void b.offsetWidth; b.classList.add("ringing"); }
}
function renderInbox() {
  const list = notesGet();
  $("inbox-list").innerHTML = list.length
    ? list.map((x) => `<button type="button" class="note-row k-${x.kind}${x.read ? "" : " unread"}" data-note="${x.id}"><span class="ic">${icon(IC[x.ic] ? x.ic : "star", 16)}</span><span class="tx"><b>${esc(x.title)}</b>${x.sub ? `<span>${esc(x.sub)}</span>` : ""}</span><time>${ago(x.t)}</time></button>`).join("")
    : '<div class="inbox-empty">Noch keine Mitteilungen.<br>Erinnerungen, Erfolge und Updates landen hier.</div>';
}
function openInbox() { renderInbox(); $("inbox").hidden = false; $("inbox-btn").setAttribute("aria-expanded", "true"); }
function closeInbox() {
  $("inbox").hidden = true; $("inbox-btn").setAttribute("aria-expanded", "false");
  store.set(INBOX_KEY, notesGet().map((x) => ({ ...x, read: true })));
  renderInboxBadge(false);
}
$("inbox-btn").addEventListener("click", (e) => { e.stopPropagation(); $("inbox").hidden ? openInbox() : closeInbox(); });
$("inbox-read").addEventListener("click", () => { store.set(INBOX_KEY, notesGet().map((x) => ({ ...x, read: true }))); renderInbox(); renderInboxBadge(false); });
$("inbox-clear").addEventListener("click", () => { store.set(INBOX_KEY, []); renderInbox(); renderInboxBadge(false); });
$("inbox-list").addEventListener("click", (e) => {
  const row = e.target.closest("[data-note]"); if (!row) return;
  const n = notesGet().find((x) => x.id === row.dataset.note);
  if (n?.taskId && items.some((t) => t.id === n.taskId)) {
    closeInbox();
    const t = items.find((x) => x.id === n.taskId);
    if (list !== "alle" && t.list !== list) list = "alle";
    selected = n.taskId; render();
    cardEl(n.taskId)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }
});
document.addEventListener("click", (e) => { if (!$("inbox").hidden && !e.target.closest("#inbox") && !e.target.closest("#inbox-btn")) closeInbox(); });
setInterval(() => { if (!document.hidden && !$("inbox").hidden) renderInbox(); }, 60000);
renderInboxBadge(false);

// ======================================================================
// ---------- Design-Menü ----------
// ======================================================================
// Farbschemas: Akzent hell/dunkel, Seitenleiste, Hintergrund hell/dunkel
const PRESETS = {
  standard: { name: "Standard", a: "#4F46E5", ad: "#7C74F2", side: "#16171B", sc: "#24252B", st: "#3A3B42" },
  ozean: { name: "Ozean", a: "#0284C7", ad: "#38BDF8", side: "#0C2233", sc: "#143349", st: "#1E4A6B", bg: "#EEF5F9", bgd: "#0B1419", card_d: "#111D24" },
  wald: { name: "Wald", a: "#15803D", ad: "#4ADE80", side: "#10241A", sc: "#183524", st: "#24503A", bg: "#F1F5EE", bgd: "#0C130F", card_d: "#121C16" },
  sunset: { name: "Sonnenuntergang", a: "#EA580C", ad: "#FB923C", side: "#2A1410", sc: "#3D1F17", st: "#5A2E22", bg: "#FBF3EC", bgd: "#160F0C", card_d: "#211612" },
  beere: { name: "Beere", a: "#BE185D", ad: "#F472B6", side: "#2A0F1F", sc: "#3D1730", st: "#5A2347", bg: "#FBF1F5", bgd: "#160C11", card_d: "#22131B" },
  ritterwand: { name: "Ritterwand", a: "#3F8576", ad: "#6FC0AD", side: "#1F3A35", sc: "#2A4D46", st: "#3A665D", bg: "#F2F6F5", bgd: "#0E1514", card_d: "#15201E", danger: "#B14240" },
  papier: { name: "Papier", soft: true, a: "#9A6B3F", ad: "#B07B45", side: "#2B241D", sc: "#3A3128", st: "#4E4337", bg: "#F4EFE6", bgd: "#1C1915", vl: "--bg:#F4EFE6;--card:#FBF8F2;--fg:#3B342C;--muted:#776B5E;--faint:#A09484;--line:#E3DACB;--chip:#EDE5D7;--seg:#EDE5D7;--box:#CFC3B1;", vd: "--bg:#1C1915;--card:#24201B;--fg:#E3D9CA;--muted:#A89C8B;--faint:#7E7365;--line:#332D26;--chip:#2C2721;--seg:#2C2721;--box:#4A4239;" },
  abendlicht: { name: "Abendlicht", soft: true, a: "#B7791F", ad: "#B9772A", side: "#2A2018", sc: "#3A2D22", st: "#523F30", bg: "#F7F2EB", bgd: "#1A1614", vl: "--bg:#F7F2EB;--card:#FFFCF7;--fg:#3A2F25;--muted:#7A6A58;--faint:#A39380;--line:#E8DED0;--chip:#F0E8DC;--seg:#F0E8DC;--box:#D6C9B6;", vd: "--bg:#1A1614;--card:#231E1B;--fg:#E8DCCB;--muted:#A99887;--faint:#7D6F62;--line:#342C27;--chip:#2D2622;--seg:#2D2622;--box:#4D423A;" },
  nord: { name: "Nord", soft: true, a: "#5E81AC", ad: "#5E81AC", side: "#2E3440", sc: "#3B4252", st: "#4C566A", bg: "#ECEFF4", bgd: "#2E3440", vl: "--bg:#ECEFF4;--card:#F7F9FC;--fg:#2E3440;--muted:#4C566A;--faint:#7B8597;--line:#D8DEE9;--chip:#E5E9F0;--seg:#E5E9F0;--box:#C2CAD8;", vd: "--bg:#2E3440;--card:#3B4252;--fg:#D8DEE9;--muted:#A3ABBA;--faint:#7B8597;--line:#434C5E;--chip:#434C5E;--seg:#434C5E;--box:#5A657A;" },
  salbei: { name: "Salbei", soft: true, a: "#5F8566", ad: "#5E8A68", side: "#243028", sc: "#2F3D33", st: "#405244", bg: "#EEF1EA", bgd: "#171C18", vl: "--bg:#EEF1EA;--card:#F8FAF5;--fg:#2F3A31;--muted:#66735F;--faint:#8F9A88;--line:#DCE3D6;--chip:#E5EBDF;--seg:#E5EBDF;--box:#C5CFBE;", vd: "--bg:#171C18;--card:#1F2620;--fg:#DCE5D8;--muted:#9AA894;--faint:#738069;--line:#2C352D;--chip:#273028;--seg:#273028;--box:#435044;" },
  lavendel: { name: "Lavendel", soft: true, a: "#7C6FB0", ad: "#7F6FBF", side: "#2A2638", sc: "#363149", st: "#4A4362", bg: "#F2F0F7", bgd: "#18161F", vl: "--bg:#F2F0F7;--card:#FBFAFE;--fg:#34304A;--muted:#6E6888;--faint:#958FAD;--line:#E1DDEC;--chip:#EAE7F3;--seg:#EAE7F3;--box:#CBC5DC;", vd: "--bg:#18161F;--card:#211E2A;--fg:#E2DEEE;--muted:#A39DBB;--faint:#78728F;--line:#2E2A3A;--chip:#2A2635;--seg:#2A2635;--box:#47425A;" },
  graphit: { name: "Graphit", soft: true, a: "#5B6B7C", ad: "#62778E", side: "#26282B", sc: "#323438", st: "#45484D", bg: "#EFEFEE", bgd: "#1E1F21", vl: "--bg:#EFEFEE;--card:#FAFAF9;--fg:#33363A;--muted:#6B6E73;--faint:#94979B;--line:#DEDEDC;--chip:#E7E7E5;--seg:#E7E7E5;--box:#C9C9C6;", vd: "--bg:#1E1F21;--card:#26282B;--fg:#D4D5D7;--muted:#9A9DA1;--faint:#73767A;--line:#333538;--chip:#2E3033;--seg:#2E3033;--box:#4A4D52;" },
  arcade: { name: "Arcade", secret: true, a: "#22D3EE", ad: "#22D3EE", side: "#12052E", sc: "#1E0B45", st: "#3A1D78", force: true,
    vars: "--bg:#0B0420;--card:#160A35;--line:#2E1A5E;--chip:#21104A;--seg:#21104A;--fg:#E8FBFF;--muted:#A99BE0;--faint:#7D6FB8;--box:#4C3591;--side-fg:#E8FBFF;--side-muted:#A99BE0;--danger:#FB7185;--warn:#FACC15;--low:#7D6FB8;color-scheme:dark;" },
};
const DEFAULT_DESIGN = { scene: "wald", mode: "arbeit", name: "", place: null, preset: "standard", custom: null, w: { scene: true, hoch: true } };
design = Object.assign({}, DEFAULT_DESIGN, store.get("erledigt-design", {}));
design.w = Object.assign({}, DEFAULT_DESIGN.w, design.w || {});
function saveDesign() { store.set("erledigt-design", design); }
// Glas-Effekt (durchscheinende Fenster mit Weichzeichner): kostet am Handy und Mac spürbar Leistung → dort aus, unter Windows an. Pro Gerät umstellbar (Einstellungen → Extras).
function glassOn() { return typeof design.w.glass === "boolean" ? design.w.glass : !!window.desktop && window.desktop.platform !== "darwin"; }
// Modus umschalten (Seitenleiste oder Design-Menü); gibt true zurück, wenn dafür die Einrichtung aufgeht
function setAppMode(m) {
  m = m === "privat" ? "privat" : "arbeit";
  if (design.mode === m) return false;
  const first = m === "privat" && !design.name;
  design.mode = m;
  { const cur = detailId && items.find((x) => x.id === detailId); if (cur && !inMode(cur)) closeDetail(); if (!$("search").hidden) closeSearch(); selected = null; popFor = null; } // nichts aus dem anderen Modus offen lassen
  designChanged(); lastTodayHtml = ""; lastDayHtml = null; renderDay(); updateHint();
  if (first) { openSetup(); return true; }
  return false;
}

// App-Symbol (Fenster, Taskleiste, Infobereich) in der aktuellen Akzentfarbe zeichnen
var iconKey = "", iconTimer = 0; // var: render() kann schon vor dieser Zeile laufen
var tbKey = "", tbClear = null, tbCtx = null, tbHexMemo = {};
// Farbe als #rrggbb für Windows – ein einziger Canvas, Ergebnisse gemerkt (vorher: drei neue Canvas pro Scroll-Ereignis)
function tbHex(c) { tbHexMemo = tbHexMemo || {}; if (tbHexMemo[c]) return tbHexMemo[c]; tbCtx = tbCtx || document.createElement("canvas").getContext("2d"); tbCtx.fillStyle = "#000"; tbCtx.fillStyle = c; return (tbHexMemo[c] = tbCtx.fillStyle); }
function syncTitlebar(fromScroll) {
  if (MINI || !window.desktop?.titlebar) return;
  document.body.classList.add("has-tb");
  if (window.desktop?.platform === "darwin") document.body.classList.add("mac");
  // Mit Himmel: Titelleiste durchsichtig, solange man oben ist – der Himmel geht bis an den Fensterrand
  const clear = document.body.classList.contains("has-scene") && scrollY < 60;
  if (fromScroll === true && clear === tbClear) return; // beim Scrollen nur reagieren, wenn die 60-px-Grenze überschritten wird
  tbClear = clear;
  document.body.classList.toggle("tb-clear", clear);
  const cs = getComputedStyle(document.body), bg = cs.getPropertyValue("--bg").trim() || "#121316", fg = cs.getPropertyValue("--fg").trim() || "#F5F3EF";
  const col = clear ? "#00000000" : tbHex(bg), sym = clear ? "#FFFFFF" : tbHex(fg), key = col + sym + bg;
  if (key !== tbKey) { tbKey = key; window.desktop.titlebar(col, sym, tbHex(bg)); }
}
addEventListener("scroll", () => syncTitlebar(true), { passive: true });
function syncAppIcon() {
  syncTitlebar();
  if (MINI || !window.desktop?.setIcon) return;
  clearTimeout(iconTimer);
  iconTimer = setTimeout(() => {
    const acc = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#4F46E5";
    if (acc === iconKey) return;
    iconKey = acc;
    const draw = (n) => {
      const c = document.createElement("canvas"); c.width = c.height = n;
      const g = c.getContext("2d"), r = n * .22, k = n / 256;
      g.fillStyle = acc; g.beginPath(); g.roundRect(n * .04, n * .04, n * .92, n * .92, r); g.fill();
      g.strokeStyle = "#fff"; g.lineWidth = 26 * k; g.lineCap = "round"; g.lineJoin = "round";
      g.beginPath(); g.moveTo(72 * k, 134 * k); g.lineTo(112 * k, 174 * k); g.lineTo(186 * k, 90 * k); g.stroke();
      return c.toDataURL("image/png");
    };
    window.desktop.setIcon(draw(256), draw(32));
  }, 250);
}
function applyDesign() {
  const p = PRESETS[design.preset] && (!PRESETS[design.preset].secret || store.get("erledigt-arcade", false)) ? PRESETS[design.preset] : PRESETS.standard;
  const a = design.custom || p.a, ad = design.custom || p.ad;
  let L = `--accent:${a};`, D = `--accent:${ad};`;
  if (p.bg) L += `--bg:${p.bg};`;
  if (p.bgd) D += `--bg:${p.bgd};`;
  if (p.card_d) D += `--card:${p.card_d};`;
  if (p.danger) { L += `--danger:${p.danger};`; }
  if (p.vl) L += p.vl; // augenschonende Schemas: eigene, weichere Text-/Flächenfarben
  if (p.vd) D += p.vd;
  if (p.force) { L += p.vars; D += p.vars; }
  let el = $("design-css");
  if (!el) { el = document.createElement("style"); el.id = "design-css"; document.head.appendChild(el); }
  el.textContent = `:root{${L}}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${D}}}:root[data-theme="dark"]{${D}}`;
  const b = document.body.classList;
  b.toggle("arcade", !!p.force);
  b.toggle("soft", !!p.soft);
  b.toggle("no-glass", !glassOn());
  if (sceneSync) sceneSync();
  const ni = document.getElementById("new"); if (ni) ni.placeholder = innerWidth < 520 ? (design.mode === "privat" ? "z. B. „Zahnarzt morgen 15 Uhr“" : "z. B. „VPN Peter morgen“") : design.mode === "privat" ? "Was steht an? z. B. „Zahnarzt anrufen morgen“" : "Was steht an? z. B. „VPN Peter prüfen morgen“";
}

function renderDesign() {
  const unlocked = store.get("erledigt-arcade", false), dark = isDark();
  const swatch = ([k, p]) => {
    if (p.secret && !unlocked) return "";
    return `<button type="button" class="st-tile" data-preset="${k}" aria-pressed="${design.preset === k && !design.custom}"><i style="--a:${p.a};--b:${p.ad}"></i><span>${p.name}</span></button>`;
  };
  const opt = (key, list, cur = design[key]) => `<div class="st-tabs" role="group">${list.map(([v, l]) => `<button type="button" data-opt="${key}" data-val="${v}" aria-pressed="${cur === v}">${l}</button>`).join("")}</div>`;
  const tog = (id, title, sub, on) => `<button type="button" class="st-item" data-tog="${id}"><span class="st-l"><b>${title}</b><small>${sub}</small></span><span class="switch" role="switch" aria-checked="${on}" aria-label="${title}"></span></button>`;
  const chev = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';
  const theme = root.dataset.theme || "system";
  const cust = design.custom || (PRESETS[design.preset] || PRESETS.standard).a;
  $("design-body").innerHTML = `
    <section class="st-sec"><h3>Modus</h3>${opt("mode", [["arbeit", "Arbeit"], ["privat", "Privat"]])}</section>
    <section class="st-sec"><h3>Hell oder Dunkel</h3>${opt("theme", [["system", !window.desktop ? "Automatisch" : window.desktop.platform === "darwin" ? "Wie Mac" : "Wie Windows"], ["light", "Hell"], ["dark", "Dunkel"]], theme)}</section>
    <section class="st-sec"><h3>Farbe</h3><div class="st-tiles">${Object.entries(PRESETS).map(swatch).join("")}<label class="st-tile custom" aria-pressed="${!!design.custom}"><i style="--a:${design.custom || "#f43f5e"};--b:${design.custom || "#3b82f6"}"${design.custom ? "" : ' class="rainbow"'}></i><span>Eigene</span><input type="color" id="custom-color" value="${cust}"></label></div></section>
    <section class="st-sec"><h3>Landschaft</h3><div class="st-land" role="group">${[["wald", "Schwarzwald"], ["alpen", "Alpen"], ["kueste", "Küste"], ["stadt", "Stadt"], ["schlicht", "Schlicht"], ["wasser", "Unterwasser"], ["fjord", "Fjord"]].map(([v, l]) => `<button type="button" data-opt="scene" data-val="${v}" aria-pressed="${design.scene === v}"><img src="img/land-${v}.jpg" alt="" loading="lazy"><span>${l}</span></button>`).join("")}</div></section>
    <section class="st-sec"><h3>Arbeitstag</h3><div class="st-list">
      <button type="button" class="st-item" data-setup="1"><span class="st-l"><b>Arbeitszeit</b><small>${feierabendAt() ? `${arbeitsbeginn()} – ${feierabendAt()} Uhr` : "keine festgelegt"}</small></span>${chev}</button>
      <button type="button" class="st-item" id="setup-open"><span class="st-l"><b>Name & Wetter-Ort</b><small>${esc(design.name || "kein Name")} · ${esc(weatherPlace().name)}</small></span>${chev}</button>
    </div>
    <h3 style="margin-top:14px">Erinnern vor dem Termin</h3>${opt("vorlauf", [[0, "Pünktlich"], [5, "5 Min"], [15, "15 Min"], [30, "30 Min"], [60, "1 Std"]], +(design.vorlauf || 0))}<small class="muted" style="display:block;margin-top:6px">Gilt am PC, Mac und Handy.</small></section>
    <section class="st-sec"><h3>Extras</h3><div class="st-list">${tog("w.scene", "Himmel oben", "Landschaft mit echtem Wetter und Tageszeit", design.w.scene)}${design.w.scene ? tog("w.hoch", "Große Landschaft", "Hoch, mit Wiese und Bäumen vorne – aus: schmales Band wie früher", design.w.hoch !== false) : ""}${tog("w.glass", "Glas-Effekt", "Durchscheinende Fenster – schick, braucht aber mehr Leistung", glassOn())}${tog("sound", "Sounds", "Kleine Töne beim Abhaken", soundOn)}${tog("levels", "Level & XP", "Punkte und Erfolge fürs Erledigen", levelsOn)}</div></section>
    ${design.w.scene && window.__scene ? (() => { const st = window.__scene.skyTest.state(), row = (k, cur, list) => `<div class="opt-row" role="group">${list.map(([v, l]) => `<button type="button" data-sky-${k}="${v}" aria-pressed="${cur === v}">${l}</button>`).join("")}</div>`;
      return `<details class="ds-more st-sec"><summary>Himmel testen</summary>
      <h3>Wetter</h3>${row("w", st.weather, [["echt", "Echt"], ["sonne", "Sonne"], ["wolken", "Wolken"], ["regen", "Regen"], ["schnee", "Schnee"], ["gewitter", "Gewitter"], ["nebel", "Nebel"]])}
      <h3>Jahreszeit</h3>${row("s", st.season, [["echt", "Echt"], ["fruehling", "Frühling"], ["sommer", "Sommer"], ["herbst", "Herbst"], ["winter", "Winter"]])}
      <h3>Anlass</h3>${row("f", st.fest, [["echt", "Echt"], ["advent", "Advent"], ["weihnachten", "Weihnachten"], ["silvester", "Silvester"], ["ostern", "Ostern"], ["halloween", "Halloween"]])}
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="chip-btn" data-sky-x="day">Tag im Zeitraffer</button><button type="button" class="chip-btn" data-sky-x="ev">Ereignis auslösen</button></div></details>`; })() : ""}`;
}
function designChanged() { saveDesign(); applyDesign(); renderDesign(); render(); }
$("design-open").addEventListener("click", () => { renderDesign(); $("design-overlay").hidden = false; });
$("design-close").addEventListener("click", () => { $("design-overlay").hidden = true; });
$("design-overlay").addEventListener("click", (e) => {
  if (e.target.id === "design-overlay") { $("design-overlay").hidden = true; return; }
  const sk = e.target.closest("[data-sky-w],[data-sky-s],[data-sky-f],[data-sky-x]");
  if (sk && window.__scene) {
    const t = window.__scene.skyTest; $("design-overlay").hidden = true;
    if (sk.dataset.skyW) t.weather(sk.dataset.skyW); else if (sk.dataset.skyS) t.season(sk.dataset.skyS); else if (sk.dataset.skyF) t.fest(sk.dataset.skyF); else setTimeout(() => (sk.dataset.skyX === "day" ? t.day() : t.event()), 200);
    return;
  }
  const sw = e.target.closest("[data-preset]");
  if (sw) { design.preset = sw.dataset.preset; design.custom = null; designChanged(); burst(sw, 14, 1.2); return; }
  const o = e.target.closest("[data-opt]");
  if (o) {
    if (o.dataset.opt === "mode") { if (setAppMode(o.dataset.val)) $("design-overlay").hidden = true; return; }
    if (o.dataset.opt === "vorlauf") { design.vorlauf = +o.dataset.val || 0; designChanged(); return; }
    if (o.dataset.opt === "theme") { if (o.dataset.val === "system") delete root.dataset.theme; else root.dataset.theme = o.dataset.val; try { if (o.dataset.val === "system") localStorage.removeItem("todo-theme"); else localStorage.setItem("todo-theme", o.dataset.val); } catch {} syncTheme(); designChanged(); return; }
    design[o.dataset.opt] = o.dataset.val; designChanged();
    return;
  }
  if (e.target.closest("#setup-open, [data-setup]")) { $("design-overlay").hidden = true; openSetup(); return; }
  const t = e.target.closest("[data-tog]");
  if (t) {
    const id = t.dataset.tog;
    if (id === "w.glass") design.w.glass = !glassOn();
    else if (id.startsWith("w.")) design.w[id.slice(2)] = !design.w[id.slice(2)];
    else if (id === "levels") { $("lvl-toggle").click(); }
    else if (id === "sound") { $("sound").click(); }
    else design[id] = !design[id];
    designChanged(); return;
  }
});
$("design-overlay").addEventListener("input", (e) => { if (e.target.id === "custom-color") { design.custom = e.target.value; saveDesign(); applyDesign(); } });
$("design-overlay").addEventListener("change", (e) => { if (e.target.id === "custom-color") renderDesign(); });
applyDesign();

// Beim Größe ändern (Maximieren, Vollbild, Ziehen): Übergänge kurz aus, sonst ruckelt das Layout hinterher
let rsT = 0;
addEventListener("resize", () => { document.body.classList.add("resizing"); clearTimeout(rsT); rsT = setTimeout(() => document.body.classList.remove("resizing"), 220); });

// ===== 05-aufgaben-detail-suche.js =====
// ======================================================================
// ---------- 1.6: Details (Unterpunkte, Notizen, Screenshots) ----------
// ======================================================================
const ICON_CL = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7l2 2 4-4M4 17l2 2 4-4M13 7h7M13 17h7"/></svg>';
const ICON_NOTE = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>';
const ICON_IMG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>';
const ICON_MAIL = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
const ICON_BULB = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>';
function indicators(t) {
  let h = "";
  const cl = t.checklist || [];
  if (cl.length) { const d = cl.filter((c) => c.done).length; h += `<span class="ind${d === cl.length ? " full" : ""}" title="Unterpunkte">${ICON_CL}${d}/${cl.length}</span>`; }
  if (!t.done) { const mm = memMatches(t.title, t.id); if (mm.length) h += `<span class="ind mem" title="${esc(`Schon mal gelöst (${memDate(mm[0].t)}): ${mm[0].t.solution}`)}">${ICON_BULB}Schon mal gelöst</span>`; }
  const mf = (t.notes || "").match(/^Mail von ([^<\n·]+)/);
  if (mf) h += `<span class="ind mail" title="Aus einer Mail">${ICON_MAIL}${esc(mf[1].trim())}</span>`;
  else if (t.notes) h += `<span class="ind" title="Hat Notizen">${ICON_NOTE}</span>`;
  if ((t.attachments || []).length) h += `<span class="ind" title="Screenshots">${ICON_IMG}${t.attachments.length}</span>`;
  return h;
}
const rid = () => Math.random().toString(36).slice(2, 9);
const signed = new Map(); // Pfad -> signierte URL (1 Std gültig)
async function signUrls(paths) {
  const need = paths.filter((p) => !signed.has(p));
  if (!need.length) return;
  try {
    const { data, error } = await sb.storage.from("attachments").createSignedUrls(need, 3600);
    if (error) throw error;
    data.forEach((d) => d.signedUrl && signed.set(d.path, d.signedUrl));
  } catch (e) { console.warn("signedUrls", e); }
}

function openDetail(id) {
  if (!items.some((i) => i.id === id)) return;
  detailId = id; selected = id; popFor = null;
  $("drawer").hidden = false; $("drawer-bg").hidden = false;
  lastDetailHtml = "";
  renderDetail(true);
}
function closeDetail() {
  if (!detailId) return;
  flushNotes();
  detailId = null; $("drawer").hidden = true; $("drawer-bg").hidden = true; $("drawer").innerHTML = ""; lastDetailHtml = "";
  render();
}
let lastDetailHtml = "", notesTimer = 0, tplSaving = false;
function renderDetail(focusTitle) {
  const t = items.find((i) => i.id === detailId);
  if (!t) { closeDetail(); return; }
  // Feld, in dem gerade getippt wird, merken – nach dem Neuzeichnen samt Cursor wiederherstellen
  const ae = document.activeElement;
  const keep = ae && $("drawer").contains(ae) && ["INPUT", "TEXTAREA"].includes(ae.tagName)
    ? { id: ae.id, cid: ae.closest(".cl-item")?.dataset.cid, value: ae.value, s: ae.selectionStart, e: ae.selectionEnd } : null;
  const L = listById[t.list], P = prioById[t.prio], cl = t.checklist || [], done = cl.filter((c) => c.done).length;
  const atts = t.attachments || [];
  const html = `
    <div class="drawer-head">
      <button type="button" class="tick" data-d="done" aria-pressed="${t.done}" aria-label="${t.done ? "Als offen markieren" : "Erledigt"}" style="margin-top:2px"><span style="${t.done ? "background:var(--accent);border-color:var(--accent)" : ""}">${t.done ? CHECK : ""}</span></button>
      <textarea id="d-title" rows="1" aria-label="Titel">${esc(t.title)}</textarea>
      ${t.done ? "" : '<button type="button" class="x" data-d="fokus" aria-label="Fokus-Modus (F)" title="Fokus-Modus (F)" style="font-size:15px">◎</button>'}
      <button type="button" class="x" data-d="close" aria-label="Schließen (Esc)">×</button>
    </div>
    <div class="drawer-body">
      <div class="meta"><span class="ind"><span class="sq" style="width:8px;height:8px;background:${L.dot}"></span>${L.name}</span><span class="ind"><span class="dot" style="background:${P.dot}"></span>${P.name}</span><span class="ind">${CLOCK}${t.due ? dueText(t) : "Kein Datum"}</span>${t.repeat ? `<span class="ind rep">${REP_ICON}${esc(repLabel(t.repeat))}</span>` : ""}</div>
      <section>
        <h4><span>Unterpunkte</span><span id="cl-count">${cl.length ? `${done}/${cl.length}` : ""}</span></h4>
        ${cl.length ? `<div class="cl-bar"><div id="cl-bar" style="width:${Math.round((done / cl.length) * 100)}%"></div></div>` : ""}
        <div id="cl-list">${cl.map((c) => `<div class="cl-item${c.done ? " on" : ""}" data-cid="${esc(c.id)}"><button type="button" class="cb" data-d="cl-toggle" aria-pressed="${!!c.done}" aria-label="Abhaken">${c.done ? CHECK.replace('width="16" height="16"', 'width="13" height="13"') : ""}</button><input type="text" value="${esc(c.text)}" data-d="cl-text" aria-label="Unterpunkt"><button type="button" class="rm" data-d="cl-rm" aria-label="Entfernen">×</button></div>`).join("")}</div>
        <div class="cl-add"><span style="width:22px;text-align:center;font-size:18px">+</span><input id="cl-new" placeholder="Unterpunkt hinzufügen – Enter" aria-label="Neuer Unterpunkt"></div>
        ${cl.length && done === cl.length && !t.done ? `<div class="cl-done-hint" style="margin-top:10px"><span>Alle Unterpunkte erledigt.</span><button type="button" data-d="done">Aufgabe abhaken</button></div>` : ""}
      </section>
      <section>
        <h4><span>Notizen</span><span id="notes-state"></span></h4>
        <textarea id="d-notes" placeholder="Seriennummer, IP, wer hat angerufen, Links …">${esc(t.notes || "")}</textarea>
      </section>
      ${mailBody(t.id) ? `<section><details class="mail-full"><summary>Ganze Mail anzeigen <small>(nur auf diesem PC gespeichert)</small></summary><div>${esc(mailBody(t.id))}</div></details></section>` : ""}
      ${t.done ? `<section><h4><span>Wie gelöst?</span><span id="sol-state"></span></h4><textarea id="d-sol" rows="2" placeholder="Ein Satz reicht – z. B. „Einzugsrolle gereinigt“">${esc(t.solution || "")}</textarea></section>` : ""}
      ${(() => { const mm = memMatches(t.title, t.id); return mm.length ? `<section><h4><span>Schon mal gelöst</span></h4><div class="mem-list">${mm.map((m) => `<div class="mem-item"><b>${esc(m.t.solution)}</b><small>${esc(m.t.title)} · ${memDate(m.t)}</small></div>`).join("")}</div></section>` : ""; })()}
      <section>
        <h4><span>Screenshots</span><span>${atts.length || ""}</span></h4>
        ${atts.length ? `<div class="shots">${atts.map((a) => `<div class="shot${signed.has(a.path) ? "" : " loading"}" data-path="${esc(a.path)}">${signed.has(a.path) ? `<img src="${esc(signed.get(a.path))}" alt="${esc(a.name || "Screenshot")}" data-d="shot-open">` : ""}<button type="button" data-d="shot-rm" aria-label="Screenshot löschen">×</button></div>`).join("")}</div>` : ""}
        <div class="drop" data-d="pick" id="drop" style="margin-top:${atts.length ? 8 : 0}px">Bild mit <b>Strg+V</b> einfügen, hierher ziehen oder klicken</div>
      </section>
    </div>
    <div class="drawer-foot" id="d-foot">
      ${tplSaving ? `<input id="tpl-name" placeholder="Name der Vorlage" value="${esc(t.title.replace(/:.*$/, ""))}" aria-label="Name der Vorlage"><button type="button" data-d="tpl-save">Speichern</button><button type="button" data-d="tpl-cancel">Abbrechen</button>`
        : `${/^Mail von [^\n]*<[^>@\s]+@[^>\s]+>/.test(t.notes || "") ? '<button type="button" data-d="reply">Antworten</button>' : ""}<button type="button" data-d="tpl">Als Vorlage speichern</button>${t.done ? "" : ''}<button type="button" class="danger" data-d="del">Löschen</button>`}
    </div>`;
  if (html !== lastDetailHtml) {
    lastDetailHtml = html; $("drawer").innerHTML = html;
    if (keep && !focusTitle) {
      const el = keep.id ? $(keep.id) : $("drawer").querySelector(`.cl-item[data-cid="${CSS.escape(keep.cid || "")}"] input`);
      if (el) { el.value = keep.value; el.focus(); try { el.setSelectionRange(keep.s, keep.e); } catch {} }
    }
  }
  if (focusTitle) setTimeout(() => (cl.length ? $("cl-new") : $("d-title"))?.focus(), 60);
  if (tplSaving) setTimeout(() => $("tpl-name")?.select(), 30);
  const missing = atts.map((a) => a.path).filter((p) => !signed.has(p));
  if (missing.length) signUrls(missing).then(() => { if (detailId === t.id) { lastDetailHtml = ""; renderDetail(); } });
}
const curTask = () => items.find((i) => i.id === detailId);
function setChecklist(cl) { patch(detailId, { checklist: cl }); }
function flushNotes() {
  clearTimeout(notesTimer);
  const ta = $("d-notes"), t = curTask();
  if (ta && t && ta.value !== (t.notes || "")) { patch(t.id, { notes: ta.value }); if ($("notes-state")) $("notes-state").textContent = "gespeichert"; }
}
function flushTitle() {
  const ta = $("d-title"), t = curTask();
  if (!ta || !t) return;
  const v = ta.value.replace(/\s+/g, " ").trim();
  if (v && v !== t.title) patch(t.id, { title: v });
}

$("drawer-bg").addEventListener("click", closeDetail);
$("drawer").addEventListener("click", (e) => {
  const b = e.target.closest("[data-d]"); if (!b) return;
  const t = curTask(); if (!t) return;
  const a = b.dataset.d;
  if (a === "close") closeDetail();
  else if (a === "fokus") { const id = t.id; closeDetail(); startFokus(id); }
  else if (a === "done") { const id = t.id; closeDetail(); completeTask(id); }
  else if (a === "cl-toggle") {
    const cid = b.closest(".cl-item").dataset.cid;
    const cl = t.checklist.map((c) => (c.id === cid ? { ...c, done: !c.done } : c));
    if (!t.checklist.find((c) => c.id === cid).done) { sfx.done(); burst(b, 10, 1); }
    lastDetailHtml = ""; setChecklist(cl);
    if (cl.length && cl.every((c) => c.done)) setTimeout(() => burst($("cl-count") || b, 30, 2), 150);
  }
  else if (a === "cl-rm") { const cid = b.closest(".cl-item").dataset.cid; lastDetailHtml = ""; setChecklist(t.checklist.filter((c) => c.id !== cid)); }
  else if (a === "pick") $("file-in").click();
  else if (a === "shot-open") { const lb = document.createElement("div"); lb.className = "lightbox"; lb.innerHTML = `<div><img src="${esc(b.src)}" alt=""><small>Klick oder Esc schließt</small></div>`; lb.addEventListener("click", () => lb.remove()); document.body.appendChild(lb); }
  else if (a === "shot-rm") removeShot(b.closest(".shot").dataset.path);
  else if (a === "tpl") { tplSaving = true; lastDetailHtml = ""; renderDetail(); }
  else if (a === "tpl-cancel") { tplSaving = false; lastDetailHtml = ""; renderDetail(); }
  else if (a === "tpl-save") saveAsTemplate();
  else if (a === "reply") { const to = (t.notes.match(/^Mail von [^\n]*<([^>]+)>/) || [])[1]; if (to) window.open(`mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent("AW: " + t.title)}`, "_blank"); }
  else if (a === "del") { const id = t.id; closeDetail(); deleteTask(id); }
});
let solTimer = 0;
$("drawer").addEventListener("input", (e) => {
  if (e.target.id === "d-sol") { clearTimeout(solTimer); $("sol-state").textContent = "…"; const id = detailId, v = e.target.value; solTimer = setTimeout(() => { patch(id, { solution: v.trim().slice(0, 2000) }); if ($("sol-state")) $("sol-state").textContent = "gespeichert"; }, 700); }
  if (e.target.id === "d-notes") { clearTimeout(notesTimer); $("notes-state").textContent = "…"; notesTimer = setTimeout(flushNotes, 700); }
});
$("drawer").addEventListener("keydown", (e) => {
  const t = curTask(); if (!t) return;
  if (e.target.id === "d-title" && e.key === "Enter") { e.preventDefault(); flushTitle(); $("cl-new")?.focus(); }
  if (e.target.id === "cl-new" && e.key === "Enter") {
    e.preventDefault();
    const v = e.target.value.trim(); if (!v) return;
    e.target.value = "";
    lastDetailHtml = ""; setChecklist([...(t.checklist || []), { id: rid(), text: v.slice(0, 300), done: false }]);
    setTimeout(() => $("cl-new")?.focus(), 30);
  }
  if (e.target.dataset.d === "cl-text" && e.key === "Enter") { e.preventDefault(); e.target.blur(); }
  if (e.target.id === "tpl-name" && e.key === "Enter") { e.preventDefault(); saveAsTemplate(); }
  if (e.key === "Escape") { e.preventDefault(); e.target.blur(); if (!tplSaving) closeDetail(); else { tplSaving = false; lastDetailHtml = ""; renderDetail(); } }
});
$("drawer").addEventListener("focusout", (e) => {
  if (e.target.id === "d-title") flushTitle();
  if (e.target.id === "d-notes") flushNotes();
  if (e.target.dataset.d === "cl-text") {
    const t = curTask(); if (!t) return;
    const cid = e.target.closest(".cl-item").dataset.cid, v = e.target.value.trim();
    const old = t.checklist.find((c) => c.id === cid);
    if (old && v && v !== old.text) setChecklist(t.checklist.map((c) => (c.id === cid ? { ...c, text: v.slice(0, 300) } : c)));
    else if (old && !v) { lastDetailHtml = ""; setChecklist(t.checklist.filter((c) => c.id !== cid)); }
  }
});

// Screenshots: Strg+V, Ziehen, Dateiauswahl
async function uploadShots(files) {
  const t = curTask(); if (!t || !uid) return;
  const imgs = [...files].filter((f) => /^image\/(png|jpe?g|gif|webp)$/.test(f.type));
  if (!imgs.length) return;
  for (const f of imgs) {
    if (f.size > 10 * 1024 * 1024) { showToast("Bild zu groß (max. 10 MB)."); continue; }
    const ext = (f.type.split("/")[1] || "png").replace("jpeg", "jpg");
    const path = `${uid}/${t.id}/${Date.now()}-${rid()}.${ext}`;
    $("drop") && ($("drop").textContent = "Lade hoch …");
    const { error } = await sb.storage.from("attachments").upload(path, f, { contentType: f.type, upsert: false });
    if (error) { console.warn(error); showToast("Screenshot konnte nicht hochgeladen werden."); continue; }
    const cur = curTask() || t;
    signed.delete(path);
    lastDetailHtml = "";
    patch(t.id, { attachments: [...(cur.attachments || []), { path, name: f.name || "Screenshot." + ext, at: Date.now() }] });
    sfx.done();
  }
}
async function removeShot(path) {
  const t = curTask(); if (!t) return;
  lastDetailHtml = "";
  patch(t.id, { attachments: (t.attachments || []).filter((a) => a.path !== path) });
  const { error } = await sb.storage.from("attachments").remove([path]);
  if (error) console.warn(error);
}
document.addEventListener("paste", (e) => {
  if (!detailId) return;
  const files = [...(e.clipboardData?.items || [])].filter((i) => i.kind === "file" && i.type.startsWith("image/")).map((i) => i.getAsFile()).filter(Boolean);
  if (!files.length) return;
  e.preventDefault();
  uploadShots(files);
});
$("file-in").addEventListener("change", (e) => { uploadShots(e.target.files); e.target.value = ""; });
$("drawer").addEventListener("dragover", (e) => { if (e.dataTransfer?.types?.includes("Files")) { e.preventDefault(); $("drop")?.classList.add("over"); } });
$("drawer").addEventListener("dragleave", (e) => { if (!$("drawer").contains(e.relatedTarget)) $("drop")?.classList.remove("over"); });
$("drawer").addEventListener("drop", (e) => { if (e.dataTransfer?.files?.length) { e.preventDefault(); $("drop")?.classList.remove("over"); uploadShots(e.dataTransfer.files); } });

// ======================================================================
// ---------- Vorlagen ----------
// ======================================================================
const BUILTIN_TPL = [
  { id: "austritt", name: "Mitarbeiter-Austritt", title: "Austritt: {name}", list: "arbeit", prio: "hoch", checklist: [
    "AD-Konto zum Austrittsdatum deaktivieren", "Passwort zurücksetzen", "Postfach: Abwesenheitsnotiz / Weiterleitung", "Postfach-Zugriff für Vorgesetzten", "Aus Verteilerlisten und Gruppen entfernen",
    "Lizenzen freigeben (M365 & Co.)", "VPN / Remote-Zugänge sperren", "ProCall / Durchwahl umleiten", "Persönliche Daten sichern (Home-Laufwerk)", "Hardware zurück: Laptop, Handy, Zubehör", "Schlüssel / Transponder zurück", "Inventarliste aktualisieren"] },
  { id: "neu", name: "Neuer Mitarbeiter", title: "Neuer MA: {name}", list: "arbeit", prio: "hoch", checklist: [
    "AD-Konto anlegen", "M365-Lizenz zuweisen", "Postfach + Signatur einrichten", "Gruppen und Laufwerke freigeben", "PC / Laptop einrichten", "Telefon / ProCall-Nebenstelle", "Handy einrichten",
    "Drucker verbinden", "Software nach Abteilung installieren", "Zugangsdaten übergeben", "Kurze Einweisung (Passwort, VPN, Helpdesk)", "Inventarliste aktualisieren"] },
  { id: "pc", name: "Neuer PC einrichten", title: "PC einrichten: {name}", list: "arbeit", prio: "mittel", checklist: [
    "Windows-Updates", "Domäne beitreten, Rechnername setzen", "BitLocker aktivieren", "Virenschutz / Monitoring-Agent", "Office installieren", "Fachsoftware installieren", "Drucker einrichten", "Benutzerprofil testen", "Inventar eintragen"] },
];
const PRIV_TPL = [
  { id: "einkauf", name: "Wocheneinkauf", title: "Einkaufen", list: "einkaufen", prio: "mittel", checklist: ["Obst & Gemüse", "Brot", "Milch / Joghurt", "Käse & Aufschnitt", "Nudeln / Reis", "Getränke", "Drogerie", "Katzenfutter"] },
  { id: "putzen", name: "Wohnung putzen", title: "Wohnung putzen", list: "haushalt", prio: "mittel", checklist: ["Staubsaugen", "Wischen", "Bad", "Küche & Herd", "Staub wischen", "Betten neu beziehen", "Müll raus"] },
  { id: "urlaub", name: "Urlaub packen", title: "Packen: {name}", list: "privat", prio: "hoch", checklist: ["Ausweis / Pass", "Ladekabel", "Kleidung", "Kulturbeutel", "Medikamente", "Sonnenbrille", "Tickets / Buchung", "Pflanzen gießen lassen", "Fenster zu, Herd aus"] },
  { id: "geburtstag", name: "Geburtstag", title: "Geburtstag: {name}", list: "termine", prio: "mittel", checklist: ["Geschenk überlegen", "Geschenk besorgen", "Karte schreiben", "Gratulieren"] },
];
const builtinTpl = () => (privMode() ? PRIV_TPL : BUILTIN_TPL);
const customTpl = () => store.get("erledigt-templates", []);
const allTpl = () => [...builtinTpl(), ...customTpl()];
function findTpl(q) { q = q.toLowerCase(); return allTpl().find((x) => x.id.toLowerCase().startsWith(q) || x.name.toLowerCase().startsWith(q)); }
function applyTemplate(tp, rest) {
  const p = parseInput(rest || "");
  const name = p.title.trim();
  const title = tp.title.includes("{name}") ? tp.title.replace("{name}", name || "…").replace(/:\s*…$/, "") : (name ? `${tp.title} ${name}` : tp.title);
  const id = addItem({ ...p, title, list: p.list || tp.list, prio: p.prio || tp.prio, notes: tp.notes || "", checklist: tp.checklist.map((c) => ({ id: rid(), text: typeof c === "string" ? c : c.text, done: false })) });
  $("new").value = ""; updateHint(); $("tpl-menu").hidden = true;
  sfx.ach();
  setTimeout(() => openDetail(id), 120);
}
function renderTplMenu() {
  const own = customTpl();
  $("tpl-menu").innerHTML = builtinTpl().map((x) => `<button type="button" class="tpl" data-tpl="${x.id}">${x.name}<small>${x.checklist.length} Punkte</small></button>`).join("")
    + (own.length ? '<p>Eigene</p>' + own.map((x) => `<button type="button" class="tpl" data-tpl="${esc(x.id)}">${esc(x.name)}<small>${x.checklist.length} Punkte</small><span class="rm" data-tpl-rm="${esc(x.id)}" title="Vorlage löschen">×</span></button>`).join("") : "")
    + (privMode() ? `<p>Tipp: Erst Namen eintippen (z. B. „Mama 12.05.“), dann Vorlage wählen – oder direkt <b>/geburtstag Mama</b>.</p>` : `<p>Tipp: Erst Namen eintippen (z. B. „Max Müller morgen“), dann Vorlage wählen – oder direkt <b>/austritt Max Müller</b>.</p>`);
}
$("tpl-btn").addEventListener("click", (e) => { e.stopPropagation(); renderTplMenu(); $("tpl-menu").hidden = !$("tpl-menu").hidden; });
$("tpl-menu").addEventListener("click", (e) => {
  e.stopPropagation();
  const rm = e.target.closest("[data-tpl-rm]");
  if (rm) { store.set("erledigt-templates", customTpl().filter((x) => x.id !== rm.dataset.tplRm)); renderTplMenu(); return; }
  const b = e.target.closest("[data-tpl]"); if (!b) return;
  const tp = allTpl().find((x) => x.id === b.dataset.tpl);
  if (tp) applyTemplate(tp, $("new").value);
});
document.addEventListener("click", (e) => { if (!$("tpl-menu").hidden && !e.target.closest(".tpl-wrap")) $("tpl-menu").hidden = true; });
function saveAsTemplate() {
  const t = curTask(); const name = ($("tpl-name")?.value || "").trim();
  if (!t || !name) return;
  const tp = { id: "eigen-" + rid(), name: name.slice(0, 60), title: name.slice(0, 60) + ": {name}", list: t.list, prio: t.prio, notes: t.notes || "", checklist: (t.checklist || []).map((c) => c.text) };
  store.set("erledigt-templates", [...customTpl(), tp]);
  tplSaving = false; lastDetailHtml = ""; renderDetail();
  showBadge("Vorlage gespeichert", `„${tp.name}“ – im Vorlage-Menü oder mit /${tp.name.split(" ")[0].toLowerCase()}`, "star");
}

// ======================================================================
// ---------- Suche (Strg+F) ----------
// ======================================================================
let searchSel = 0, searchHits = [];
function openSearch() { if (detailId) flushNotes(); $("search").hidden = false; $("search-in").value = ""; runSearch(); setTimeout(() => $("search-in").focus(), 20); }
function closeSearch() { $("search").hidden = true; }
const mark = (s, q) => { const i = s.toLowerCase().indexOf(q); return i < 0 ? esc(s) : esc(s.slice(0, i)) + "<mark>" + esc(s.slice(i, i + q.length)) + "</mark>" + esc(s.slice(i + q.length)); };
function runSearch() {
  const q = $("search-in").value.trim().toLowerCase();
  let hits;
  if (!q) hits = items.filter((t) => !t.done && !t.archived && inMode(t)).sort((a, b) => b.createdAt - a.createdAt).slice(0, 8).map((t) => ({ t, where: "" }));
  else hits = items.filter(inMode).map((t) => {
    let score = 0, where = "";
    const ti = t.title.toLowerCase().indexOf(q);
    if (ti >= 0) score += ti === 0 ? 100 : 60;
    const ch = (t.checklist || []).find((c) => c.text.toLowerCase().includes(q));
    if (ch) { score += 30; where = "Unterpunkt: " + ch.text; }
    if ((t.notes || "").toLowerCase().includes(q)) { score += 20; const i = t.notes.toLowerCase().indexOf(q); where = where || "Notiz: …" + t.notes.slice(Math.max(0, i - 20), i + 60).replace(/\s+/g, " ") + "…"; }
    if ((t.solution || "").toLowerCase().includes(q)) { score += 25; where = where || "Lösung: " + t.solution; }
    if (!score) return null;
    if (!t.done) score += 10;
    return { t, where, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score || b.t.createdAt - a.t.createdAt).slice(0, 30);
  searchHits = hits; searchSel = 0;
  $("search-list").innerHTML = hits.length ? hits.map((h, i) => {
    const t = h.t, L = listById[t.list];
    const st = t.archived ? '<span class="st ok">archiviert</span>' : t.done ? `<span class="st ok">erledigt ${t.doneAt ? new Date(t.doneAt).toLocaleDateString("de-DE") : ""}</span>` : "";
    return `<button type="button" class="sr" role="option" data-i="${i}" aria-selected="${i === 0}"><span class="sq" style="background:${L.dot}"></span><span class="t">${q ? mark(t.title, q) : esc(t.title)}${h.where ? `<span class="hit">${q ? mark(h.where, q) : esc(h.where)}</span>` : ""}</span>${st}<small>${t.due ? dueLabel(t.due) : ""}</small></button>`;
  }).join("") : `<div class="search-empty">Nichts gefunden für „${esc(q)}“.</div>`;
}
function pickSearch(i) {
  const h = searchHits[i]; if (!h) return;
  closeSearch();
  if (list !== "alle" && h.t.list !== list) list = "alle";
  render(); openDetail(h.t.id);
}
$("search-btn").addEventListener("click", openSearch);
$("search-in").addEventListener("input", runSearch);
$("search-in").addEventListener("keydown", (e) => {
  if (e.key === "Escape") { e.preventDefault(); closeSearch(); return; }
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    searchSel = Math.max(0, Math.min(searchHits.length - 1, searchSel + (e.key === "ArrowDown" ? 1 : -1)));
    $("search-list").querySelectorAll(".sr").forEach((b, i) => { b.setAttribute("aria-selected", String(i === searchSel)); if (i === searchSel) b.scrollIntoView({ block: "nearest" }); });
  }
  if (e.key === "Enter") { e.preventDefault(); pickSearch(searchSel); }
});
$("search-list").addEventListener("click", (e) => { const b = e.target.closest(".sr"); if (b) pickSearch(+b.dataset.i); });
$("search").addEventListener("click", (e) => { if (e.target.id === "search") closeSearch(); });

// ======================================================================
// ---------- Wochenansicht mit Drag & Drop ----------
// ======================================================================
function weekHtml() {
  const t0 = todayD(), today = iso(t0);
  const mon = addDays(t0, -((t0.getDay() + 6) % 7) + 7 * weekOffset);
  const days = [...Array(7)].map((_, i) => addDays(mon, i));
  const open = inList().filter((t) => !t.done);
  const card = (t, late) => `<div class="wk-card${late ? " late" : ""}" draggable="true" data-id="${t.id}" style="--task-c:${listById[t.list].dot}"><span class="wt">${esc(t.title)}</span><small>${t.prio === "hoch" ? '<span class="dot" style="background:var(--danger)"></span>' : ""}${t.time || ""}${late ? `<span style="color:var(--danger)">seit ${dueLabel(t.due)}</span>` : ""}${(t.checklist || []).length ? ` ${(t.checklist || []).filter((c) => c.done).length}/${t.checklist.length}` : ""}${t.repeat ? " " + REP_ICON : ""}</small></div>`;
  const cols = days.map((d) => {
    const k = iso(d), isToday = k === today, hol = holidayOf(k), we = d.getDay() === 0 || d.getDay() === 6 || !!hol?.pub;
    let list = open.filter((t) => t.due === k || (t.until && t.due < k && t.until >= k)).sort((a, b) => (PRIO_RANK[a.prio] - PRIO_RANK[b.prio]) || ((a.time || "99") < (b.time || "99") ? -1 : 1));
    const late = isToday ? open.filter((t) => t.due && endDay(t) < today) : [];
    const doneN = inList().filter((t) => t.done && t.due === k).length;
    return `<div class="wk-col${isToday ? " today" : ""}${we ? " weekend" : ""}" data-day="${k}"><header><b>${["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.</b><span>${list.length + late.length || ""}</span></header>${hol ? `<div class="wk-hol${hol.pub ? " pub" : ""}">${esc(hol.name)}</div>` : ""}<div class="wk-items">${late.map((t) => card(t, true)).join("")}${list.map((t) => card(t, false)).join("")}</div>${doneN ? `<div class="wk-more">+ ${doneN} erledigt</div>` : ""}</div>`;
  }).join("");
  const nodate = open.filter((t) => !t.due);
  const kw = (() => { const x = new Date(Date.UTC(mon.getFullYear(), mon.getMonth(), mon.getDate())); const day = x.getUTCDay() || 7; x.setUTCDate(x.getUTCDate() + 4 - day); const y = new Date(Date.UTC(x.getUTCFullYear(), 0, 1)); return Math.ceil(((x - y) / 864e5 + 1) / 7); })();
  return `<div class="wk-nav"><b>KW ${kw}</b><button type="button" data-wk="-1" aria-label="Vorige Woche">‹</button><button type="button" data-wk="0">Heute</button><button type="button" data-wk="1" aria-label="Nächste Woche">›</button><span class="wk-hint" style="color:var(--muted);font-size:13px;margin-left:8px">Karten auf einen Tag ziehen, um sie zu verschieben</span></div>
    <div class="wk-nodate" data-day="none"><span class="lbl">Ohne Datum</span>${nodate.length ? nodate.map((t) => `<span class="wk-chip" draggable="true" data-id="${t.id}" style="--task-c:${listById[t.list].dot}">${esc(t.title)}</span>`).join("") : '<span style="color:var(--faint);font-size:13px;text-transform:none;letter-spacing:0">– hierher ziehen entfernt das Datum</span>'}</div>
    <div class="wk-grid">${cols}</div>`;
}
$("tasks").addEventListener("click", (e) => {
  if (view !== "week") return;
  const nav = e.target.closest("[data-wk]");
  if (nav) { weekOffset = nav.dataset.wk === "0" ? 0 : weekOffset + Number(nav.dataset.wk); render(); return; }
  const c = e.target.closest(".wk-card, .wk-chip");
  if (c) openDetail(c.dataset.id);
});
let dragId = null;
// Ziehen mit der Maus (eigene Umsetzung statt HTML-Drag&Drop – das war unter Windows unzuverlässig)
let pd = null, dragGhost = null, eatClick = false;
$("tasks").addEventListener("dragstart", (e) => { if (e.target.closest?.(".wk-card, .wk-chip, .mo-ev")) e.preventDefault(); });
$("tasks").addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  const c = e.target.closest?.(".wk-card, .wk-chip, .mo-ev"); if (!c) return;
  pd = { c, id: c.dataset.id, x: e.clientX, y: e.clientY };
});
document.addEventListener("pointermove", (e) => {
  if (!pd) return;
  if (!dragId) {
    if (Math.hypot(e.clientX - pd.x, e.clientY - pd.y) < 6) return;
    dragId = pd.id; pd.c.classList.add("dragging"); document.body.classList.add("dragging-ev");
    dragGhost = document.createElement("div"); dragGhost.className = "drag-ghost"; dragGhost.style.setProperty("--c", getComputedStyle(pd.c).getPropertyValue("--task-c")); dragGhost.textContent = items.find((x) => x.id === dragId)?.title || ""; document.body.appendChild(dragGhost);
  }
  dragGhost.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 8}px)`;
  const col = document.elementFromPoint(e.clientX, e.clientY)?.closest?.("#tasks [data-day]");
  document.querySelectorAll("#tasks [data-day].over").forEach((x) => x !== col && x.classList.remove("over"));
  col?.classList.add("over");
});
document.addEventListener("pointerup", (e) => {
  if (!pd) return;
  const was = dragId, c = pd.c; pd = null;
  if (!was) return;
  eatClick = true; setTimeout(() => (eatClick = false), 50);
  dragGhost?.remove(); dragGhost = null; c.classList.remove("dragging"); document.body.classList.remove("dragging-ev");
  document.querySelectorAll(".over").forEach((x) => x.classList.remove("over"));
  const col = document.elementFromPoint(e.clientX, e.clientY)?.closest?.("#tasks [data-day]");
  dragId = null;
  if (!col) return;
  const day = col.dataset.day, it = items.find((x) => x.id === was);
  if (it && (it.due || "none") !== day) { patch(was, day === "none" ? { due: null, time: null } : { due: day }); sfx.done(); }
  render();
});
// Finger-Ziehen vom Browser abgebrochen (Seite scrollt stattdessen): aufräumen, sonst bleibt die Zieh-Marke am Bildschirm kleben
document.addEventListener("pointercancel", () => {
  if (!pd) return; const c = pd.c; pd = null; dragId = null;
  dragGhost?.remove(); dragGhost = null; c.classList.remove("dragging"); document.body.classList.remove("dragging-ev");
  document.querySelectorAll("#tasks .over").forEach((x) => x.classList.remove("over"));
});
document.addEventListener("click", (e) => { if (eatClick) { e.stopPropagation(); e.preventDefault(); eatClick = false; } }, true);
$("view-seg").addEventListener("click", (e) => {
  const b = e.target.closest("[data-view]"); if (!b || b.dataset.view === view) return;
  view = b.dataset.view; weekOffset = 0; monthOffset = 0;
  try { localStorage.setItem("erledigt-view", view); } catch {}
  render();
});

// ======================================================================
// ---------- Kalender: Monatsansicht ----------
// ======================================================================
// Termine sind Aufgaben mit Datum (Erinnerung, Wiederholen, Abhaken funktionieren mit).
// Klick auf einen Tag → Eintrag anlegen, Klick auf Eintrag → Details, Ziehen → anderer Tag.
// Feiertage (je Bundesland) + Sondertage, jedes Jahr neu berechnet
const STATES = [["BW", "Baden-Württemberg"], ["BY", "Bayern"], ["BE", "Berlin"], ["BB", "Brandenburg"], ["HB", "Bremen"], ["HH", "Hamburg"], ["HE", "Hessen"], ["MV", "Mecklenburg-Vorpommern"], ["NI", "Niedersachsen"], ["NW", "Nordrhein-Westfalen"], ["RP", "Rheinland-Pfalz"], ["SL", "Saarland"], ["SN", "Sachsen"], ["ST", "Sachsen-Anhalt"], ["SH", "Schleswig-Holstein"], ["TH", "Thüringen"]];
const holCache = {};
function holidays(year) {
  let st = "BW"; try { st = design.state || "BW"; } catch {}
  const key = year + st; if (holCache[key]) return holCache[key];
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const easter = new Date(year, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
  const E = (n) => iso(addDays(easter, n)), D = (mo, dd) => iso(new Date(year, mo - 1, dd));
  const lastSun = (mo) => { const x = new Date(year, mo, 0); return iso(addDays(x, -x.getDay())); };
  const out = {}, add = (k, name, pub) => { out[k] = out[k] ? { name: out[k].name + " · " + name, pub: out[k].pub || pub } : { name, pub }; };
  const inS = (...l) => l.includes(st);
  add(D(1, 1), "Neujahr", true);
  if (inS("BW", "BY", "ST")) add(D(1, 6), "Heilige Drei Könige", true);
  if (inS("BE", "MV")) add(D(3, 8), "Frauentag", true);
  add(E(-2), "Karfreitag", true); add(E(0), "Ostersonntag", false); add(E(1), "Ostermontag", true);
  add(D(5, 1), "Tag der Arbeit", true); add(E(39), "Christi Himmelfahrt", true); add(E(49), "Pfingstsonntag", false); add(E(50), "Pfingstmontag", true);
  if (inS("BW", "BY", "HE", "NW", "RP", "SL")) add(E(60), "Fronleichnam", true);
  if (inS("SL")) add(D(8, 15), "Mariä Himmelfahrt", true);
  if (inS("TH")) add(D(9, 20), "Weltkindertag", true);
  add(D(10, 3), "Tag der Deutschen Einheit", true);
  if (inS("BB", "HB", "HH", "MV", "NI", "SN", "ST", "SH", "TH")) add(D(10, 31), "Reformationstag", true);
  if (inS("BW", "BY", "NW", "RP", "SL")) add(D(11, 1), "Allerheiligen", true);
  if (inS("SN")) { const x = new Date(year, 10, 22); add(iso(addDays(x, -((x.getDay() + 4) % 7))), "Buß- und Bettag", true); }
  add(D(12, 25), "1. Weihnachtstag", true); add(D(12, 26), "2. Weihnachtstag", true);
  // Sondertage (kein Feiertag)
  add(D(2, 14), "Valentinstag", false); add(E(-48), "Rosenmontag", false);
  const may = new Date(year, 4, 1); add(iso(addDays(may, ((7 - may.getDay()) % 7) + 7)), "Muttertag", false);
  add(lastSun(3), "Zeitumstellung (+1 Std)", false); add(lastSun(10), "Zeitumstellung (−1 Std)", false);
  add(D(10, 31), "Halloween", false); add(D(12, 6), "Nikolaus", false);
  const adv4 = addDays(new Date(year, 11, 24), -(new Date(year, 11, 24).getDay() || 7));
  [4, 3, 2, 1].forEach((n, j) => add(iso(addDays(adv4, -7 * j)), `${n}. Advent`, false));
  add(D(12, 24), "Heiligabend", false); add(D(12, 31), "Silvester", false);
  return (holCache[key] = out);
}
const holidayOf = (k) => holidays(+k.slice(0, 4))[k] || null;
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
let moAdd = null; // Tag, an dem gerade das Eingabefeld offen ist
function monthHtml() {
  const t0 = todayD(), today = iso(t0);
  const first = new Date(t0.getFullYear(), t0.getMonth() + monthOffset, 1), m = first.getMonth();
  const start = addDays(first, -((first.getDay() + 6) % 7));
  const all = inList().filter((t) => t.due);
  const ev = (t, k) => `<div role="button" tabindex="0" class="mo-ev${t.done ? " done" : ""}${!t.done && endDay(t) < today ? " late" : ""}${t.until ? " multi" : ""}" draggable="true" data-id="${t.id}" style="--task-c:${listById[t.list].dot}" title="${esc(t.title)}">${t.until && k !== t.due ? "↳ " : t.time ? `<b>${t.time}</b>` : ""}${esc(t.title)}</div>`;
  const cells = [...Array(42)].map((_, i) => {
    const d = addDays(start, i), k = iso(d), other = d.getMonth() !== m, we = d.getDay() === 0 || d.getDay() === 6;
    const list = all.filter((t) => t.due === k || (t.until && t.due < k && t.until >= k)).sort((a, b) => (a.done - b.done) || ((a.time || "99") < (b.time || "99") ? -1 : 1));
    const shown = list.slice(0, 4), more = list.length - shown.length;
    const hol = holidayOf(k);
    const add = moAdd === k ? `<div class="mo-add"><input id="mo-in" placeholder="Neuer Termin …" maxlength="300"><input type="time" id="mo-time"><button type="button" class="mo-ok" data-mo-ok="${k}">OK</button></div>` : "";
    return `<div class="mo-cell${other ? " other" : ""}${we || hol?.pub ? " weekend" : ""}${hol?.pub ? " holiday" : ""}${k === today ? " today" : ""}" data-day="${k}" data-mo-day="${k}"><span class="mo-top"><span class="mo-d">${d.getDate()}</span>${hol ? `<span class="mo-hol${hol.pub ? " pub" : ""}" title="${esc(hol.name)}">${esc(hol.name)}</span>` : ""}</span><div class="mo-evs">${shown.map((t) => ev(t, k)).join("")}${more > 0 ? `<button type="button" class="mo-more" data-mo-more="${k}">+ ${more} weitere</button>` : ""}</div>${add}</div>`;
  }).join("");
  return `<div class="wk-nav mo-nav"><b>${MONTHS[m]} ${first.getFullYear()}</b><button type="button" data-mo="-1" aria-label="Voriger Monat">‹</button><button type="button" data-mo="0">Heute</button><button type="button" data-mo="1" aria-label="Nächster Monat">›</button><span class="mo-hint">Auf einen Tag klicken zum Eintragen · Einträge auf andere Tage ziehen</span></div>
    <div class="mo-grid"><div class="mo-wd">Mo</div><div class="mo-wd">Di</div><div class="mo-wd">Mi</div><div class="mo-wd">Do</div><div class="mo-wd">Fr</div><div class="mo-wd we">Sa</div><div class="mo-wd we">So</div>${cells}</div>`;
}
function moSave(day) {
  const txt = ($("mo-in")?.value || "").trim(), tm = $("mo-time")?.value || "";
  moAdd = null;
  if (!txt) { render(); return; }
  const p = parseInput(txt);
  const lst = p.list || (privMode() ? "termine" : list === "alle" ? defList() : list);
  addItem({ ...p, title: p.title || txt, due: day, time: /^\d{2}:\d{2}$/.test(tm) ? tm : p.time || null, list: lst });
  sfx.done(); render();
}
$("tasks").addEventListener("click", (e) => {
  if (view !== "month") return;
  const nav = e.target.closest("[data-mo]");
  if (nav) { monthOffset = nav.dataset.mo === "0" ? 0 : monthOffset + Number(nav.dataset.mo); moAdd = null; render(); return; }
  const ok = e.target.closest("[data-mo-ok]"); if (ok) { moSave(ok.dataset.moOk); return; }
  if (e.target.closest(".mo-add")) return;
  const evb = e.target.closest(".mo-ev"); if (evb) { openDetail(evb.dataset.id); return; }
  const more = e.target.closest("[data-mo-more]");
  if (more) { const k = more.dataset.moMore; list = "alle"; view = "list"; try { localStorage.setItem("erledigt-view", view); } catch {} render(); showBadge(`Termine am ${k.split("-").reverse().join(".")}`, "Alle Einträge stehen jetzt in der Liste.", "star"); return; }
  const cell = e.target.closest("[data-mo-day]");
  if (cell) { moAdd = cell.dataset.moDay; render(); setTimeout(() => $("mo-in")?.focus(), 0); }
});
$("tasks").addEventListener("keydown", (e) => {
  if (view !== "month" || !e.target.closest?.(".mo-add")) return;
  if (e.key === "Enter") { e.preventDefault(); moSave(moAdd); }
  if (e.key === "Escape") { e.preventDefault(); moAdd = null; render(); }
});

// ======================================================================
// ---------- Mini-Widget (eigenes kleines Fenster) ----------
// ======================================================================
$("mini-btn").addEventListener("click", () => window.desktop?.toggleMini?.());
if (MINI) {
  document.body.classList.add("mini");
  $("new").placeholder = "Neu für heute …";
  document.title = "Erledigt – Heute";
  $("mini-open").addEventListener("click", () => window.desktop?.show());
  $("mini-close").addEventListener("click", () => window.desktop?.toggleMini?.());
}

// ===== 06-supabase-anmeldung.js =====
// ---------- Konami-Code → Disco ----------
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
let kPos = 0;
function konami(key) {
  kPos = key === KONAMI[kPos] || key.toLowerCase() === KONAMI[kPos] ? kPos + 1 : key === KONAMI[0] ? 1 : 0;
  if (kPos < KONAMI.length) return;
  kPos = 0; discoFound = true;
  if (!store.get("erledigt-arcade", false)) { store.set("erledigt-arcade", true); setTimeout(() => showBadge("Geheimes Design freigeschaltet", "„Arcade“ – im Design-Menü (Paletten-Knopf)", "disco"), 2500); }
  document.body.classList.add("disco");
  tone([523, 659, 784, 1047, 784, 659, 523, 659, 784, 1047], .16, "square", .09, .05);
  for (let i = 0; i < 4; i++) setTimeout(() => burst(document.querySelector("h1"), 40, 3), i * 600);
  setTimeout(() => document.body.classList.remove("disco"), 6000);
  render();
}

// ---------- Supabase ----------
const SB_URL = "https://ovosbxkwqgxxfekrtlov.supabase.co";
const SB_KEY = "sb_publishable_cvKxZ4tvDpez0OWyf-C-og_raV3cGVZ"; // öffentlicher Schlüssel, Schutz über RLS
const sb = supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: "erledigt-auth" } });
const toIso = (ms) => (ms ? new Date(ms).toISOString() : null);
const FIELD = { title: "title", due: "due", time: "time", prio: "prio", list: "list", done: "done", archived: "archived", repeat: "repeat", notes: "notes", checklist: "checklist", attachments: "attachments", solution: "solution", until: "due_end", timeEnd: "time_end" };
function toRow(p) {
  const row = {};
  for (const k in p) {
    if (FIELD[k]) row[FIELD[k]] = p[k] ?? (k === "done" || k === "archived" ? false : k === "checklist" || k === "attachments" ? [] : k === "solution" ? "" : null);
    else if (k === "doneAt") row.done_at = toIso(p[k]);
    else if (k === "createdAt") row.created_at = toIso(p[k]);
  }
  return row;
}
const fromRow = (r) => norm({ id: r.id, title: r.title, due: r.due, until: r.due_end || null, timeEnd: r.time_end || null, time: r.time, prio: r.prio, list: r.list, done: r.done, archived: r.archived, repeat: r.repeat || null, notes: r.notes || "", checklist: Array.isArray(r.checklist) ? r.checklist : [], attachments: Array.isArray(r.attachments) ? r.attachments : [], solution: r.solution || "", doneAt: r.done_at ? Date.parse(r.done_at) : null, createdAt: Date.parse(r.created_at) });
function applyLocal(id, body) {
  const i = items.findIndex((x) => x.id === id);
  if (body === null) { if (i >= 0) items.splice(i, 1); }
  else if (i >= 0) items[i] = norm({ ...items[i], ...body });
  else items.push(norm({ id, ...body }));
  render();
}
const ok = ({ error }) => { if (error) throw error; setSync(true); };
// ---------- Warteschlange für Änderungen ohne Verbindung ----------
// Vorher: Änderung schlug fehl → nach 5 s wurde vom Server neu geladen und die Änderung war still weg (Handy im Funkloch, PC nach Ruhezustand).
// Jetzt: Was wegen fehlender Verbindung nicht rausgeht, bleibt lokal sichtbar, wird gemerkt (übersteht auch Neustart) und der Reihe nach nachgeschickt.
const OUTBOX_KEY = "erledigt-outbox";
let outbox = store.get(OUTBOX_KEY, []); if (!Array.isArray(outbox)) outbox = [];
let inflight = 0, writeSeq = 0, flushing = null;
const saveOutbox = () => store.set(OUTBOX_KEY, outbox.slice(-500));
const isNetErr = (e) => !!e && (!navigator.onLine || /fetch|network|load failed|timeout|abort/i.test(String(e.message || e)) || e.status === 0);
const sendOp = (o) => (o.op === "upsert" ? sb.from("todos").upsert({ id: o.id, ...o.row }) : o.op === "update" ? sb.from("todos").update(o.row).eq("id", o.id) : sb.from("todos").delete().eq("id", o.id));
async function runOp(o) {
  writeSeq++;
  if (outbox.length) { outbox.push(o); saveOutbox(); flushOutbox(); return; } // Reihenfolge wahren: erst das Ältere
  inflight++;
  let res; try { res = await sendOp(o); } catch (e) { res = { error: e }; } finally { inflight--; }
  if (res.error && isNetErr(res.error)) { outbox.push(o); saveOutbox(); setSync(false); setStatus("Keine Verbindung – deine Änderungen bleiben hier gespeichert und werden nachgeschickt.", true); reloadSoon(); return; }
  ok(res);
}
// true = alles draußen. Fehler, die nicht an der Verbindung liegen (z. B. Zeile gibt es nicht mehr), werden übersprungen statt ewig wiederholt.
function flushOutbox() {
  if (flushing) return flushing;
  flushing = (async () => {
    outbox = outbox.filter((o) => !o.uid || o.uid === uid);
    while (outbox.length) {
      let res; try { res = await sendOp(outbox[0]); } catch (e) { res = { error: e }; }
      if (res.error && isNetErr(res.error)) { saveOutbox(); return false; }
      if (res.error) console.warn("Änderung verworfen:", res.error.message || res.error);
      outbox.shift(); saveOutbox();
    }
    return true;
  })().finally(() => { flushing = null; });
  return flushing;
}
col = {
  doc: (id) => ({
    set: async (d) => { applyLocal(id, d); await runOp({ op: "upsert", id, row: toRow(d), uid }); },
    update: async (p) => { applyLocal(id, p); await runOp({ op: "update", id, row: toRow(p), uid }); },
    delete: async () => { applyLocal(id, null); await runOp({ op: "delete", id, uid }); },
  }),
};

function setSync(on) { $("sync").classList.toggle("off", !on); $("sync").title = on ? "Synchronisiert" : "Offline – Änderungen werden nicht gespeichert"; }
let reloadTimer = 0;
function reloadSoon() { clearTimeout(reloadTimer); reloadTimer = setTimeout(fetchAll, 5000); }

async function fetchAll() {
  if (!uid) return;
  // Erst Wartendes nachschicken – sonst würde der Serverstand die lokalen Änderungen überschreiben
  if (outbox.length && !(await flushOutbox())) { setSync(false); setStatus(`Keine Verbindung – ${outbox.length} ${outbox.length === 1 ? "Änderung wartet" : "Änderungen warten"} und ${outbox.length === 1 ? "wird" : "werden"} nachgeschickt.`, true); reloadSoon(); if (!loaded && items.length) { loaded = true; render(); } return; }
  const seq = writeSeq;
  const { data, error } = await sb.from("todos").select("*").order("created_at");
  if (error) { setSync(false); setStatus("Keine Verbindung zu Supabase. Neuer Versuch läuft …", true); reloadSoon(); return; }
  // Während des Ladens wurde etwas geändert: Die Antwort kann schon veraltet sein (abgehakte Aufgabe spränge kurz zurück) → gleich noch einmal laden
  if (seq !== writeSeq || inflight || outbox.length) { clearTimeout(reloadTimer); reloadTimer = setTimeout(fetchAll, 800); if (loaded) return; }
  items = data.map(fromRow);
  setSync(true); setStatus("");
  loaded = true; render(); checkReminders(); setTimeout(retroDates, 1500);
  setTimeout(maybeRituals, 1200);
}

let channel = null;
function subscribe() {
  if (channel) sb.removeChannel(channel);
  channel = sb.channel("todos-live")
    .on("postgres_changes", { event: "*", schema: "public", table: "todos" }, (p) => {
      if (p.eventType === "DELETE") { if (p.old?.id && !busy.has(p.old.id)) applyLocal(p.old.id, null); }
      else if (p.new?.id && !busy.has(p.new.id)) { const t = fromRow(p.new); const { id, ...body } = t; applyLocal(id, body); }
    })
    .subscribe((status) => { if (status === "SUBSCRIBED") fetchAll(); if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") { setSync(false); reloadSoon(); } });
}

// Nach Ruhezustand / Netzwechsel neu laden
window.addEventListener("online", fetchAll);
document.addEventListener("visibilitychange", () => { if (!document.hidden && session) fetchAll(); });
setInterval(() => { if (session) fetchAll(); }, 5 * 60000);

// ---------- Anmeldung ----------
let session = null, signUpMode = false;
function showAuth(show) { $("auth").hidden = !show; if (show) setTimeout(() => $("auth-email").focus(), 50); }
function authMsg(text, err) { const m = $("auth-msg"); m.hidden = !text; m.textContent = text || ""; m.className = "auth-msg" + (err ? " err" : ""); }
function setMode(up) {
  signUpMode = up;
  $("auth-title").textContent = up ? "Konto erstellen" : "Anmelden";
  $("auth-go").textContent = up ? "Konto erstellen" : "Anmelden";
  $("auth-switch").textContent = up ? "Schon ein Konto? Anmelden" : "Noch kein Konto? Konto erstellen";
  $("auth-pass").autocomplete = up ? "new-password" : "current-password";
  authMsg("");
}
$("auth-switch").addEventListener("click", () => setMode(!signUpMode));
$("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("auth-email").value.trim(), password = $("auth-pass").value;
  $("auth-go").disabled = true; authMsg("Einen Moment …");
  try {
    if (signUpMode) {
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.session) { authMsg("Fast fertig: Bestätige den Link in der Mail von Supabase, dann hier anmelden."); setMode(false); authMsg("Bestätige den Link in der Mail von Supabase, dann hier anmelden."); }
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
  } catch (err) {
    const m = String(err.message || err);
    authMsg(/invalid login/i.test(m) ? "E-Mail oder Passwort stimmt nicht." : /not confirmed/i.test(m) ? "Bitte erst den Bestätigungslink in der Mail anklicken." : /already registered/i.test(m) ? "Für diese E-Mail gibt es schon ein Konto – melde dich an." : /fetch|network/i.test(m) ? "Keine Verbindung zu Supabase." : m, true);
  } finally { $("auth-go").disabled = false; }
});
$("logout").addEventListener("click", async () => { await sb.auth.signOut(); });

sb.auth.onAuthStateChange((event, s) => {
  const was = session?.user?.id;
  session = s;
  if (!s) { uid = null; funReady = false; items = []; loaded = false; if (channel) { sb.removeChannel(channel); channel = null; } render(); showAuth(true); return; }
  $("me").textContent = s.user.email;
  uid = s.user.id;
  showAuth(false);
  if (was !== s.user.id) { setStatus(""); subscribe(); fetchAll(); }
});

// ===== 07-nachfragen.js =====
// Der Assistent „Origami“ (lokale KI) ist seit 2.9.2 ausgebaut – der Stand davor liegt in der Git-History (Tag/Commit 2.9.1).
function userName() { try { return (design.name || "").trim() || "Nils"; } catch { return "Nils"; } }
// ======================================================================
// ---------- 1.7: Nachfragen von selbst (ohne KI) ----------
// ======================================================================
const NUDGE_KEY = "erledigt-nudge";
const dayDiff = (a, b) => Math.round((parseIso(b) - parseIso(a)) / 864e5);
function nudgeCandidate() {
  const today = iso(todayD()), now = Date.now();
  const log = store.get(NUDGE_KEY, { day: "", n: 0, last: 0, seen: {} });
  const fresh = (t) => !(log.seen[t.id] && now - log.seen[t.id] < 7 * 864e5);
  const open = items.filter((t) => !t.done && !t.archived && inMode(t) && !t.repeat && fresh(t));
  const late = open.filter((t) => t.due && dayDiff(t.due, today) >= 3).sort((a, b) => (a.due < b.due ? -1 : 1))[0];
  if (late) return { t: late, kind: "late", n: dayDiff(late.due, today) };
  const stale = open.filter((t) => !t.due && t.createdAt && now - t.createdAt > 10 * 864e5).sort((a, b) => a.createdAt - b.createdAt)[0];
  if (stale) return { t: stale, kind: "stale", n: Math.floor((now - stale.createdAt) / 864e5) };
  return null;
}
function maybeNudge(force) {
  if (MINI || !loaded || !uid) return;
  const h = new Date().getHours();
  const today = iso(todayD()), log = store.get(NUDGE_KEY, { day: "", n: 0, last: 0, seen: {} });
  if (log.day !== today) { log.day = today; log.n = 0; }
  if (!force && (h < 8 || h >= 19 || log.n >= 2 || Date.now() - log.last < 2 * 3600e3)) return;
  const c = nudgeCandidate(); if (!c) return;
  log.n++; log.last = Date.now(); log.seen[c.t.id] = Date.now();
  for (const [k, v] of Object.entries(log.seen)) if (Date.now() - v > 30 * 864e5) delete log.seen[k];
  store.set(NUDGE_KEY, log);
  showNudge(c);
}
function showNudge({ t, kind, n }) {
  const title = kind === "late" ? `Seit ${n} Tagen überfällig` : `Liegt seit ${n} Tagen rum`;
  const sub = kind === "late" ? `„${t.title}“ – was machen wir damit?` : `„${t.title}“ – noch aktuell?`;
  addNote({ kind: "info", ic: "bolt", title, sub, taskId: t.id });
  const box = $("reminders");
  while (box.children.length >= 3) box.firstElementChild.remove();
  const el = document.createElement("div");
  el.className = "reminder nudge"; el.setAttribute("role", "status");
  el.innerHTML = `<div class="ic">${icon("bolt")}</div><div class="tx"><b>${esc(title)}</b><small>${esc(sub)}</small>
    <div class="acts"><button type="button" class="primary" data-n="today">Heute</button><button type="button" data-n="week">Nächste Woche</button><button type="button" data-n="split">Aufteilen</button><button type="button" data-n="del">Löschen</button><button type="button" data-n="ok">Passt so</button></div></div>`;
  el.addEventListener("click", (e) => {
    const a = e.target.closest("[data-n]")?.dataset.n; if (!a) return;
    const cur = items.find((x) => x.id === t.id);
    if (cur) {
      if (a === "today") patch(t.id, { due: iso(todayD()) });
      if (a === "week") { const d = todayD(); patch(t.id, { due: iso(addDays(d, ((8 - d.getDay()) % 7) || 7)) }); }
      if (a === "split") openDetail(t.id); // Unterpunkte im Detail anlegen
      if (a === "del") deleteTask(t.id);
    }
    el.remove();
  });
  box.appendChild(el);
}
if (!MINI) {
  setTimeout(() => maybeNudge(), 4 * 60000);
  setInterval(() => maybeNudge(), 30 * 60000);
}

// ===== 08-mail.js =====
// ======================================================================
// ---------- 1.8: Mail → Aufgabe ----------
// ======================================================================
const isMailFile = (f) => /\.(msg|eml)$/i.test(f?.name || "");
const cleanSubject = (s) => String(s || "").replace(/^\s*((re|aw|wg|fw|fwd|antw|weiterleitung)\s*:\s*)+/i, "").replace(/\s+/g, " ").trim();
// Kopierter Mailtext (Outlook: „Von: … Gesendet: … Betreff: …“) → Felder
function parseMailText(text) {
  const lines = String(text).replace(/\r/g, "").split("\n");
  const head = {}; let bodyStart = 0;
  const KEYS = { von: "from", from: "from", betreff: "subject", subject: "subject", gesendet: "date", sent: "date", datum: "date", date: "date", an: "to", to: "to", cc: "cc" };
  for (let i = 0; i < Math.min(lines.length, 14); i++) {
    const m = lines[i].match(/^\s*(Von|From|Betreff|Subject|Gesendet|Sent|Datum|Date|An|To|Cc)\s*:\s*(.*)$/i);
    if (m) { const k = KEYS[m[1].toLowerCase()]; if (!(k in head)) head[k] = m[2].trim(); bodyStart = i + 1; }
    else if (bodyStart && !lines[i].trim()) break; // Kopf zu Ende – alte Verläufe weiter unten nicht mitlesen
  }
  const body = lines.slice(bodyStart).join("\n").trim();
  const fm = (head.from || "").match(/^(.*?)\s*<([^>]+)>/) || (head.from || "").match(/^(.*?)\s*\[(?:mailto:)?([^\]]+)\]/);
  // Titel ohne Mail-Kopf: erste Zeile, die keine Anrede ist („Hallo Nils,“ etc.)
  const greet = /^(hallo|hi|hey|moin|servus|guten (morgen|tag|abend)|sehr geehrte|liebe[rs]?|grüß dich|mahlzeit)\b/i;
  const cand = lines.slice(bodyStart).map((l) => l.trim()).filter(Boolean);
  let first = cand.find((l) => !greet.test(l)) || cand[0] || "";
  first = first.replace(/[,:]$/, ""); first = first.charAt(0).toUpperCase() + first.slice(1);
  return { subject: head.subject || "", from: fm ? fm[1].replace(/"/g, "").trim() : head.from || "", fromEmail: fm ? fm[2].trim() : (/@/.test(head.from || "") ? head.from : ""), date: head.date || "", body: body || text.trim(), fallbackTitle: first };
}
const looksLikeMail = (t) => /^\s*(Von|From|Betreff|Subject)\s*:/im.test(t) || String(t).trim().split(/\n/).length >= 3;
// Nur der Kern der Mail: ohne Anrede, Signatur, Disclaimer, alten Verlauf, Leerzeilen-Wüste
const SIGN_OFF = /^(mit )?(freundliche[mn]?|viele[n]?|beste[n]?|liebe|herzliche|schöne)? ?(grüße|gruß|grüssen|grüßen)(?![a-zäöüß]).*$|^(mfg|lg|vg|bg|gruß|grüße|best regards|kind regards|regards|with best regards|cheers|thanks|danke( dir| euch| schön| im voraus)?[,!. ]*(und |&)?( viele| beste)? ?(grüße|gruß)?)[,!.]*$|^--\s*$/i;
const GREETING = /^(hallo|hi|hey|moin|servus|guten (morgen|tag|abend)|sehr geehrte[rs]?|liebe[rs]?|grüß dich|mahlzeit)\b.{0,40}$/i;
function mailCore(b) {
  let t = String(b || "").replace(/\r/g, "").replace(/\u00a0/g, " ");
  const cut = t.search(/^(-{3,}\s*(Ursprüngliche Nachricht|Original Message)|_{10,}|(Von|From):\s.+\n\s*(Gesendet|Sent|Datum|Date):)/im);
  if (cut > 0) t = t.slice(0, cut);
  let lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
  const end = lines.findIndex((l, i) => i > 0 && SIGN_OFF.test(l));
  if (end > 0) lines = lines.slice(0, end);
  if (lines.length > 1 && GREETING.test(lines[0])) lines.shift();
  return lines.join("\n").slice(0, 2000);
}
// Frist aus dem Text: „heute“, „morgen“, „übermorgen“, „bis Freitag“, „bis 12.11.“
function mailDue(text) {
  const t = String(text || "").toLowerCase().slice(0, 600).replace(/guten morgen/g, ""), today = todayD();
  if (/\bübermorgen\b/.test(t)) return iso(addDays(today, 2));
  if (/\bmorgen\b/.test(t)) return iso(addDays(today, 1));
  const wd = t.match(/\bbis (?:zum |spätestens )?(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag)\b/);
  if (wd) { const n = ["sonntag", "montag", "dienstag", "mittwoch", "donnerstag", "freitag", "samstag"].indexOf(wd[1]); return iso(addDays(today, ((n - today.getDay() + 7) % 7) || 7)); }
  const dt = t.match(/\bbis (?:zum |spätestens )?(\d{1,2})\.(\d{1,2})\.(\d{2,4})?/);
  if (dt) { let y = dt[3] ? +dt[3] : today.getFullYear(); if (y < 100) y += 2000; const d = new Date(y, +dt[2] - 1, +dt[1]); if (!dt[3] && d < today) d.setFullYear(y + 1); if (!isNaN(d)) return iso(d); }
  if (/\b(heute( noch)?|asap|dringend|sofort)\b/.test(t)) return iso(today);
  return null;
}
function createFromMail(m) {
  const title = (cleanSubject(m.subject) || cleanSubject(m.fallbackTitle) || "Mail bearbeiten").slice(0, 200);
  let when = "";
  const d = m.date && !isNaN(Date.parse(m.date)) ? new Date(m.date) : null;
  if (d) when = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  else if (m.date) when = m.date;
  const who = [m.from, m.fromEmail && m.fromEmail !== m.from ? `<${m.fromEmail}>` : ""].filter(Boolean).join(" ");
  const body = mailCore(m.body);
  const head = who || when ? `Mail${who ? " von " + who : ""}${when ? " · " + when : ""}` : "";
  // In Supabase nur Kopf + eine Zeile – der volle Text bleibt lokal auf diesem PC
  const notes = (head ? head + "\n\n" : "") + mailShort(body);
  const id = addItem({ title, due: mailDue(body) || iso(todayD()), list: "arbeit", prio: "mittel", notes });
  mailBodySet(id, body);
  showBadge("Aus Mail angelegt", title, "inbox", true);
  sfx.done?.();
  setTimeout(() => openDetail(id), 250);
  return id;
}
// ---- Voller Mailtext nur lokal (localStorage dieses PCs), max. 300 Mails / 90 Tage ----
const MB_KEY = "erledigt-mailbodies";
function mailBodySet(id, body) {
  const all = store.get(MB_KEY, {}); all[id] = { b: String(body).slice(0, 6000), t: Date.now() };
  const keys = Object.keys(all).sort((a, b) => all[b].t - all[a].t);
  for (const k of keys.slice(300)) delete all[k];
  for (const k of keys) if (Date.now() - all[k].t > 90 * 864e5) delete all[k];
  store.set(MB_KEY, all);
}
const mailBody = (id) => store.get(MB_KEY, {})[id]?.b || "";
// Kurzfassung ohne KI: erster Satz bzw. erste Zeile, gekürzt
function mailShort(body) {
  const t = String(body || "").replace(/\s+/g, " ").trim();
  const m = t.match(/^.{20,180}?[.!?](\s|$)/);
  return (m ? m[0] : t.slice(0, 160) + (t.length > 160 ? " …" : "")).trim();
}
// Einmalig: alte Mail-Aufgaben aufräumen – Volltext nach lokal, in Supabase nur Kopf + Kurzfassung
function migrateMailNotes() {
  if (MINI || !uid || !loaded) return;
  const k = "erledigt-mailmig-" + uid; if (store.get(k, false)) return;
  let n = 0;
  for (const t of items) {
    const mm = (t.notes || "").match(/^(Mail[^\n]*)\n\n([\s\S]+)$/);
    if (!mm || !/^Mail( von |\s·)/.test(mm[1])) continue;
    const body = mm[2].trim();
    if (body.length <= 200 && !body.includes("\n")) continue; // schon kurz
    if (!mailBody(t.id)) mailBodySet(t.id, body);
    patch(t.id, { notes: mm[1] + "\n\n" + mailShort(body) }); n++;
  }
  store.set(k, true);
  if (n) addNote({ kind: "info", ic: "inbox", title: `${n} Mail-Aufgabe${n === 1 ? "" : "n"} aufgeräumt`, sub: "Der volle Mailtext liegt jetzt nur noch auf diesem PC, in der Cloud steht nur eine Kurzfassung." });
}
const migT = setInterval(() => { if (loaded && uid) { migrateMailNotes(); clearInterval(migT); } }, 5000);
// Spart Rechenleistung: Animationen laufen nur, solange das Fenster aktiv ist
const idleSync = () => document.body.classList.toggle("idle", document.hidden || !document.hasFocus());
window.addEventListener("blur", idleSync); window.addEventListener("focus", idleSync); document.addEventListener("visibilitychange", idleSync); idleSync();
async function mailFromFile(f) {
  try {
    const r = await window.desktop?.mailParse?.(f.name, await f.arrayBuffer());
    if (!r?.ok) throw new Error(/unsupported|invalid|signature/i.test(r?.error || "") ? "Das ist keine Outlook-Mail (.msg)." : r?.error || "nicht lesbar");
    createFromMail(r.mail);
  } catch (err) { showBadge("Mail konnte nicht gelesen werden", String(err.message || err).slice(0, 120), "bell", true); }
}
// Ziehen & Ablegen aufs ganze Fenster
let dragDepth = 0;
const externalDrag = (e) => !dragId && !detailId && (e.dataTransfer?.types?.includes("Files") || e.dataTransfer?.types?.includes("text/plain"));
if (!MINI) {
  document.addEventListener("dragenter", (e) => { if (!externalDrag(e) || privMode()) return; dragDepth++; $("mail-drop").hidden = false; });
  document.addEventListener("dragleave", () => { if (dragDepth && --dragDepth === 0) $("mail-drop").hidden = true; });
  document.addEventListener("dragover", (e) => { if (e.dataTransfer?.types?.includes("Files") || externalDrag(e)) e.preventDefault(); });
  document.addEventListener("drop", (e) => {
    dragDepth = 0; $("mail-drop").hidden = true;
    if (dragId) return;
    if (e.dataTransfer?.types?.includes("Files")) e.preventDefault(); // nie die Datei im Fenster öffnen
    if (detailId) return; // Detail-Fenster hat eigenes Ablegen (Screenshots)
    const files = [...(e.dataTransfer?.files || [])];
    const mails = files.filter(isMailFile);
    if (mails.length) { e.preventDefault(); window.desktop?.show?.(); mails.slice(0, 10).forEach(mailFromFile); return; }
    if (files.length) { showBadge("Nur Mails (.msg/.eml)", "Ziehe eine Mail aus Outlook hier rein.", "inbox", true); return; }
    const text = e.dataTransfer?.getData("text/plain");
    if (text && looksLikeMail(text)) { e.preventDefault(); window.desktop?.show?.(); createFromMail(parseMailText(text)); }
  });
}
// Mehrzeiliges Einfügen ins Eingabefeld = Mail
$("new").addEventListener("paste", (e) => {
  const t = e.clipboardData?.getData("text/plain") || "";
  if (t.trim().split(/\n/).length >= 3 || /^\s*(Von|From)\s*:/im.test(t) && /^\s*(Betreff|Subject)\s*:/im.test(t)) { e.preventDefault(); createFromMail(parseMailText(t)); }
});

// ===== 09-gedaechtnis-bericht.js =====
// ======================================================================
// ---------- 2.0: Gedächtnis für gelöste Probleme ----------
// ======================================================================
var STOP = new Set("der die das den dem des ein eine einer einen und oder für fuer mit von vom bei beim im in am an auf aus ist sind nicht bitte mal noch neu neue neuer neues kurz heute morgen uebermorgen wieder schon auch nur zum zur ueber unter nach vor wie was wer wo geht gehen kann koennen muss soll prüfen pruefen checken machen erledigen anschauen schauen".split(" "));
function memTokens(s) {
  return [...new Set(String(s || "").toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !STOP.has(w))
    .map((w) => (w.length > 5 ? w.replace(/(en|er|es|e|n|s)$/, "") : w)))];
}
var memCache = { key: "", list: [] };
function memIndex() {
  const done = items.filter((t) => t.done && inMode(t) && (t.solution || "").trim()); // frühere Lösungen nur aus dem aktuellen Modus
  const key = done.map((t) => t.id + (t.solution || "").length).join("|");
  if (key !== memCache.key) memCache = { key, list: done.map((t) => ({ t, tok: memTokens(t.title + " " + (t.checklist || []).map((c) => c.text).join(" ")) })) };
  return memCache.list;
}
// Ähnliche, früher gelöste Aufgaben (neueste zuerst)
function memMatches(title, excludeId) {
  if (!STOP || !memCache) return []; // Seite lädt noch
  const a = memTokens(title); if (!a.length) return [];
  return memIndex().filter((x) => x.t.id !== excludeId).map((x) => {
    const shared = x.tok.filter((w) => a.includes(w));
    const score = shared.length / Math.min(a.length, x.tok.length || 1);
    return { t: x.t, shared, score };
  }).filter((m) => m.shared.length >= 2 || (m.shared.length === 1 && m.shared[0].length >= 5 && m.score >= .5))
    .sort((p, q) => q.shared.length - p.shared.length || (q.t.doneAt || 0) - (p.t.doneAt || 0)).slice(0, 3);
}
const memDate = (t) => (t.doneAt ? `${new Date(t.doneAt).getDate()}.${new Date(t.doneAt).getMonth() + 1}.` : "");
// Nach dem Abhaken: „Wie gelöst?“ (optional)
var solveTimer = 0;
function askSolution(t) {
  if (MINI || !t || t.repeat || t.list === "privat" || store.get("erledigt-ask-solution", true) === false) return;
  const el = $("solve");
  el.dataset.id = t.id;
  $("solve-t").textContent = t.title;
  $("solve-in").value = "";
  el.hidden = false;
  clearTimeout(solveTimer);
  const arm = () => { clearTimeout(solveTimer); solveTimer = setTimeout(() => { if (document.activeElement !== $("solve-in") || !$("solve-in").value) el.hidden = true; }, matchMedia("(hover: none)").matches ? 9000 : 20000); };
  arm(); el.onmousemove = arm;
}
function saveSolution() {
  const el = $("solve"), v = $("solve-in").value.trim(), id = el.dataset.id;
  el.hidden = true; clearTimeout(solveTimer);
  if (v && items.some((x) => x.id === id)) { patch(id, { solution: v.slice(0, 2000) }); showBadge("Gemerkt", "Taucht wieder auf, wenn was Ähnliches kommt.", "bolt", true); }
}
$("solve").addEventListener("click", (e) => {
  if (e.target.closest("#solve-x")) { $("solve").hidden = true; return; }
  if (e.target.closest("#solve-ok")) { saveSolution(); return; }
  if (e.target.closest("#solve-never")) { store.set("erledigt-ask-solution", false); $("solve").hidden = true; showBadge("Frag ich nicht mehr", "Lösungen kannst du weiter im Detail eintragen.", "bolt", true); }
});
$("solve-in").addEventListener("keydown", (e) => {
  if (e.key === "Enter") { e.preventDefault(); saveSolution(); }
  if (e.key === "Escape") { e.preventDefault(); $("solve").hidden = true; }
});

// ======================================================================
// ---------- 2.0: „Was hab ich gemacht?“ – Bericht ----------
// ======================================================================
let repRange = "woche", repBusy = false;
function repSpan(kind) {
  const t = todayD(), mon = addDays(t, -((t.getDay() + 6) % 7));
  if (kind === "heute") return [t, addDays(t, 1), `heute (${t.getDate()}.${t.getMonth() + 1}.)`];
  if (kind === "woche") return [mon, addDays(mon, 7), `KW ${kwOf(t)}`];
  if (kind === "vorwoche") return [addDays(mon, -7), mon, `KW ${kwOf(addDays(mon, -7))}`];
  const first = new Date(t.getFullYear(), t.getMonth(), 1);
  return [first, new Date(t.getFullYear(), t.getMonth() + 1, 1), MON[t.getMonth()] + " " + t.getFullYear()];
}
function kwOf(d) { const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const day = x.getUTCDay() || 7; x.setUTCDate(x.getUTCDate() + 4 - day); const y = new Date(Date.UTC(x.getUTCFullYear(), 0, 1)); return Math.ceil(((x - y) / 864e5 + 1) / 7); }
function repItems() {
  const [a, b] = repSpan(repRange);
  return items.filter((t) => t.done && t.doneAt && t.doneAt >= +a && t.doneAt < +b && inMode(t)).sort((p, q) => p.doneAt - q.doneAt);
}
const repWho = (t) => (t.notes || "").match(/^Mail von ([^<\n·]+)/)?.[1]?.trim() || "";
function repPlain() {
  const list = repItems(), [, , label] = repSpan(repRange);
  if (!list.length) return `Erledigt ${label}: noch nichts.`;
  const byDay = new Map();
  for (const t of list) { const d = new Date(t.doneAt), k = `${WDS[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`; if (!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(t); }
  const one = (t) => `• ${t.title}${repWho(t) ? ` (für ${repWho(t)})` : ""}${t.solution ? ` – ${t.solution}` : ""}`;
  return `IT – erledigt ${label} (${list.length})\n\n` + (repRange === "heute" ? list.map(one).join("\n") : [...byDay].map(([k, ts]) => `${k}\n${ts.map(one).join("\n")}`).join("\n\n"));
}
function renderRep() {
  const n = repItems().length;
  $("rep-seg").innerHTML = [["heute", "Heute"], ["woche", "Diese Woche"], ["vorwoche", "Letzte Woche"], ["monat", "Monat"]].map(([k, l]) => `<button type="button" data-r="${k}" aria-pressed="${repRange === k}">${l}</button>`).join("");
  $("rep-n").textContent = `${n} erledigte Aufgabe${n === 1 ? "" : "n"} (ohne Privat)`;
  if (!repBusy) $("rep-out").value = repPlain();
}
function openRep() { $("rep-overlay").hidden = false; repBusy = false; renderRep(); }
$("rep-overlay").addEventListener("click", (e) => {
  if (e.target.id === "rep-overlay" || e.target.closest("#rep-close")) { $("rep-overlay").hidden = true; repBusy = false; return; }
  const r = e.target.closest("[data-r]"); if (r && !repBusy) { repRange = r.dataset.r; renderRep(); return; }
  if (e.target.closest("#rep-copy")) { navigator.clipboard.writeText($("rep-out").value).then(() => { $("rep-copy").textContent = "Kopiert ✓"; setTimeout(() => ($("rep-copy").textContent = "Kopieren"), 1500); }).catch(() => {}); return; }
  if (e.target.closest("#rep-mail")) { const v = $("rep-out").value; window.open(`mailto:?subject=${encodeURIComponent(v.split("\n")[0])}&body=${encodeURIComponent(v.split("\n").slice(1).join("\n").trim())}`, "_blank"); }
});

// ===== 09b-himmel.js =====
// ======================================================================
// ---------- Himmel im Kopfbereich (Schwarzwald, Tageslauf, Wetter) ----------
// ======================================================================
// Die Sonne läuft vom echten Sonnenaufgang bis zum Sonnenuntergang (Open-Meteo, Wetter-Ort) über den Himmel.
// Jahreszeit + Mondphase vom echten Datum, Wetter (Regen, Schnee, Wolken, Nebel, Gewitter) von Open-Meteo für Nufringen.
// Alles in einer eigenen Funktion, damit die Namen nicht mit dem Rest kollidieren. applyDesign() ruft sceneSync().
var sceneSync = null;
(() => {
if (MINI) return;
const hdr = document.getElementById("hero") || document.querySelector("main > header"); if (!hdr) return;
const box = document.createElement("div"); box.className = "sc"; box.setAttribute("aria-hidden", "true");
box.innerHTML = '<svg viewBox="0 0 900 210" preserveAspectRatio="xMidYMax slice"></svg><svg class="sc-move" viewBox="0 0 900 210" preserveAspectRatio="xMidYMax slice"></svg><div class="sc-grain"></div><canvas class="sc-fx"></canvas><div class="sc-flash"></div>';
(document.getElementById("hero") || document.querySelector(".hello") || hdr).prepend(box);
const svg = box.querySelector("svg"), mv = box.querySelector(".sc-move"), fxc = box.querySelector(".sc-fx"), flashEl = box.querySelector(".sc-flash");
var SC_START = 450, SC_END = 990, SW = 900, SH = 210; // SH: Höhe der Szene (210 = Band, 300 = hoch mit Vordergrund)
const scHoch = () => { try { return design.w.hoch !== false; } catch { return true; } }; // SW: Breite der Szene, passend zum Banner (nichts wird gestreckt oder abgeschnitten)
const W = { cover: 0, rain: 0, snow: 0, fog: 0, storm: false, sunrise: 0, sunset: 0 }; // sunrise/sunset in Minuten (vom Wetterdienst)
const NS = "http://www.w3.org/2000/svg";
const mk = (tag, attrs, parent = svg) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, k) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * Math.max(0, Math.min(1, k))).toString(16).padStart(2, "0")).join("");
const lum = (h) => { const [r, g, b] = hex(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
function seeded(s) { return () => { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rnd = (a, b) => a + Math.random() * (b - a);

// ---------- Himmel: oben, Mitte, Horizont ----------
const SKY = [
  [300, "#070A1A", "#0E1330", "#1A1F42"], [380, "#1B1E46", "#4A3D6E", "#D98A72"], [440, "#4E79B8", "#A9B9D6", "#F7D1A8"],
  [600, "#3E7BC9", "#86B3E3", "#CFE4F2"], [800, "#447FC6", "#8DB6E0", "#DCE6EA"], [905, "#5A6FB0", "#C19AA8", "#F6C18B"],
  [990, "#3B3474", "#9A5D86", "#F08C5A"], [1050, "#1A1C45", "#3D2E5E", "#7A4466"], [1120, "#0A0D24", "#141838", "#262650"], [1410, "#060818", "#0B0F28", "#171A3A"],
];
function sky(m) { let i = SKY.findIndex((k) => k[0] > m); if (i <= 0) i = i === 0 ? 1 : SKY.length - 1; const a = SKY[i - 1], b = SKY[i], k = (m - a[0]) / (b[0] - a[0]); return [1, 2, 3].map((j) => mix(a[j], b[j], k)); }
function daylight(m) { if (m < SC_START - 70 || m > SC_END + 80) return 0; if (m < SC_START + 20) return (m - (SC_START - 70)) / 90; if (m > SC_END - 20) return 1 - (m - (SC_END - 20)) / 100; return 1; }

// ---------- Jahreszeit (nur als Farbton und Schnee) ----------
const SEASON = { winter: { tint: "#DCE6EE", k: .18, snow: true, leaf: [] }, fruehling: { tint: "#7FB27A", k: .2, leaf: ["#8CC47A", "#A8D48A", "#F2B6C6"] }, sommer: { tint: "#4F8A4A", k: .2, leaf: ["#4E8A45", "#5E9A4F", "#3F7A3A"] }, herbst: { tint: "#B8742E", k: .18, leaves: true, leaf: ["#D9822B", "#C2512B", "#E3B23C", "#A8552A", "#D96B2B"] } };
function realSeason(d = new Date()) { const mo = d.getMonth(); return mo <= 1 || mo === 11 ? "winter" : mo <= 4 ? "fruehling" : mo <= 7 ? "sommer" : "herbst"; }
let season = realSeason();
// ---------- Feiertage im Himmel ----------
// Advent: Lichterkette + Stern am Haus · 24.12.–6.1.: geschmückter Baum · 31.12./1.1. nachts: Feuerwerk
// Karfreitag–Ostermontag: Eier im Gras + Hase · 31.10.: Kürbisse + Fledermäuse
function easterOf(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451); return new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1); }
function realFest(now = new Date()) {
  const y = now.getFullYear(), t = new Date(y, now.getMonth(), now.getDate()), day = (mo, d) => new Date(y, mo - 1, d);
  const d24 = day(12, 24), adv1 = new Date(y, 11, 24 - d24.getDay() - 21), ost = easterOf(y);
  const between = (a, b) => t >= a && t <= b;
  return {
    advent: between(adv1, day(12, 23)),
    baum: t >= day(12, 24) || t <= day(1, 6),
    feuerwerk: (now.getMonth() === 11 && now.getDate() === 31) || (now.getMonth() === 0 && now.getDate() === 1),
    ostern: between(new Date(ost.getTime() - 2 * 864e5), new Date(ost.getTime() + 864e5)),
    halloween: now.getMonth() === 9 && now.getDate() === 31,
  };
}
let festTest = null; // zum Ausprobieren: "advent", "weihnachten", "silvester", "ostern", "halloween"
function fest() {
  if (!festTest) return realFest();
  const f = { advent: false, baum: false, feuerwerk: false, ostern: false, halloween: false };
  if (festTest === "advent") f.advent = true; else if (festTest === "weihnachten") { f.advent = true; f.baum = true; } else if (festTest === "silvester") { f.baum = true; f.feuerwerk = true; } else if (festTest in f) f[festTest] = true;
  return f;
}
function moonPhase(d = new Date()) { const syn = 29.530588853, ref = Date.UTC(2000, 0, 6, 18, 14); return (((d - ref) / 864e5) % syn + syn) % syn / syn; }

// ---------- Bergkämme ----------
function ridgePts(seed, base, amp, rough, peaky) {
  const R = seeded(seed), o = [R() * 9, R() * 9, R() * 9, R() * 9], pts = [];
  for (let x = -10; x <= SW + 10; x += 5) {
    const ridged = 1 - Math.abs(Math.sin(x / 95 + o[3])), sharp = peaky ? amp * .55 * ridged ** 2.2 : 0;
    const y = base - amp * (.5 * Math.sin(x / 140 + o[0]) + .3 * Math.sin(x / 61 + o[1]) + .15 * Math.sin(x / 23 + o[2])) - sharp - rough * (R() - .5) * 2;
    pts.push([x, y]);
  }
  return pts;
}
const LAYERS = [ // seed, Grundlinie, Höhe, Rauheit, Tannen
  [11, 126, 30, 1.2, 0], [23, 140, 24, 1.4, 0], [37, 152, 22, 1.6, .3], [51, 170, 18, 1.8, .5], [64, 194, 12, 2, .68],
];
// Vordergrund im hohen Modus: nahe Wiese mit Bäumen, ganz vorne ein Hang
const FRONT = [[78, 236, 10, 1.5, .4], [91, 274, 8, 1.3, .26]];
let L = {}, layerEls = [], leafEls = [];
// Landschaften: wald (Schwarzwald), alpen, kueste, stadt, schlicht, wasser (Unterwasser), fjord – Auswahl im Design-Menü
const THEMES = ["wald", "alpen", "kueste", "stadt", "schlicht", "wasser", "fjord"];
const theme = () => { try { return THEMES.includes(design.scene) ? design.scene : "wald"; } catch { return "wald"; } };
const LAYERS_ALP = [[11, 104, 92, 2.4, 0], [23, 128, 66, 2, 0], [37, 158, 20, 1.4, .3], [51, 176, 12, 1.6, .55], [64, 196, 8, 1.8, .72]];
// Alpen: schroffe, hohe Felsgipfel statt sanfter Schwarzwaldkuppen
function alpPts(seed, base, amp, rough) {
  const R = seeded(seed), o = [R() * 9, R() * 9, R() * 9], pts = [];
  for (let x = -10; x <= SW + 10; x += 4) {
    const pk = Math.pow(1 - Math.abs(Math.sin(x / 78 + o[0])), 3.2), pk2 = Math.pow(1 - Math.abs(Math.sin(x / 41 + o[1])), 4);
    pts.push([x, base - amp * (.18 + .62 * pk + .22 * pk2 + .08 * Math.sin(x / 19 + o[2])) - rough * (R() - .5) * 2.4]);
  }
  return pts;
}
let TH = "wald";
function build() {
  svg.innerHTML = ""; mv.innerHTML = ""; layerEls = []; L.crownPts = []; SH = scHoch() ? 300 : 210;
  const se = SEASON[season];
  const defs = mk("defs", {});
  defs.innerHTML = `
  <linearGradient id="sc-sky" x1="0" y1="0" x2="0" y2="1"><stop id="sc-s0" offset="0"/><stop id="sc-s1" offset=".55"/><stop id="sc-s2" offset="1"/></linearGradient>
  <radialGradient id="sc-bloom"><stop offset="0" stop-color="#FFF6DA" stop-opacity=".95"/><stop offset=".12" stop-color="#FFE3A6" stop-opacity=".6"/><stop offset=".45" stop-color="#FFC58A" stop-opacity=".18"/><stop offset="1" stop-color="#FFC58A" stop-opacity="0"/></radialGradient>
  <radialGradient id="sc-mglow"><stop offset="0" stop-color="#E8ECFF" stop-opacity=".35"/><stop offset="1" stop-color="#E8ECFF" stop-opacity="0"/></radialGradient>
  <linearGradient id="sc-ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE7B5" stop-opacity=".22"/><stop offset="1" stop-color="#FFE7B5" stop-opacity="0"/></linearGradient>
  <radialGradient id="sc-st"><stop id="sc-st0" offset="0" stop-opacity=".85"/><stop id="sc-st1" offset=".55" stop-opacity=".35"/><stop id="sc-st2" offset="1" stop-opacity="0"/></radialGradient>
  <linearGradient id="sc-trail" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".55"/></linearGradient>
  <linearGradient id="sc-lake" x1="0" y1="0" x2="0" y2="1"><stop id="sc-lk0" offset="0"/><stop id="sc-lk1" offset="1"/></linearGradient>
  <linearGradient id="sc-cl" x1="0" y1="0" x2="0" y2="1"><stop id="sc-c0" offset="0"/><stop id="sc-c1" offset=".5"/><stop id="sc-c2" offset="1"/></linearGradient>
  <linearGradient id="sc-cd" x1="0" y1="0" x2="0" y2="1"><stop id="sc-d0" offset="0"/><stop id="sc-d1" offset=".55"/><stop id="sc-d2" offset="1"/></linearGradient>
  <linearGradient id="sc-cdu" x1="0" y1="0" x2="0" y2="70" gradientUnits="userSpaceOnUse"><stop id="sc-du0" offset="0"/><stop id="sc-du1" offset=".6"/><stop id="sc-du2" offset="1"/></linearGradient>
  <linearGradient id="sc-clu" x1="0" y1="0" x2="0" y2="50" gradientUnits="userSpaceOnUse"><stop id="sc-lu0" offset="0"/><stop id="sc-lu1" offset="1"/></linearGradient>
  <linearGradient id="sc-shaft" x1="0" y1="0" x2="0" y2="1"><stop id="sc-sh0" offset="0" stop-opacity=".55"/><stop id="sc-sh1" offset="1" stop-opacity="0"/></linearGradient>
  <linearGradient id="sc-wray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4F7FF" stop-opacity=".55"/><stop offset=".7" stop-color="#E4F7FF" stop-opacity=".12"/><stop offset="1" stop-color="#E4F7FF" stop-opacity="0"/></linearGradient>
  <filter id="sc-soft" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="1.1"/></filter>
  <filter id="sc-blur5" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="sc-blur8" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="sc-blur3" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="sc-grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .55 0"/></filter>`;
  svg.setAttribute("viewBox", `0 0 ${SW} ${SH}`); mv.setAttribute("viewBox", `0 0 ${SW} ${SH}`); box.style.setProperty("--sw", SW);
  mk("rect", { x: 0, y: 0, width: SW, height: SH, fill: "url(#sc-sky)" });
  // Sterne
  L.stars = mk("g", {});
  const SR = seeded(7);
  for (let i = 0; i < SW / 8; i++) mk("circle", { cx: SR() * SW, cy: SR() * 140, r: SR() < .08 ? 1.3 : .35 + SR() * .7, fill: "#fff" }, L.stars);
  L.twinkle = mk("g", {}, mv);
  for (let i = 0; i < 10; i++) mk("circle", { class: "star", cx: SR() * SW, cy: SR() * 120, r: 1.1, fill: "#fff", style: `animation-delay:${SR() * 3.4}s` }, L.twinkle);
  // Mond (echte Phase)
  L.moon = mk("g", {});
  mk("circle", { r: 46, fill: "url(#sc-mglow)" }, L.moon);
  const ph = moonPhase(), mr = 9, k = Math.cos(ph * 2 * Math.PI), right = ph < .5;
  mk("circle", { r: mr, fill: "#2A2F4C", opacity: .55 }, L.moon);
  mk("path", { d: `M0 ${-mr} A${mr} ${mr} 0 0 ${right ? 1 : 0} 0 ${mr} A${Math.abs(k) * mr} ${mr} 0 0 ${(right ? k > 0 : k < 0) ? 0 : 1} 0 ${-mr}Z`, fill: "#F1EEE4" }, L.moon);
  // Sonne mit Strahlen
  L.rays = mk("g", { opacity: 0 });
  for (let i = 0; i < 7; i++) mk("path", { d: `M0 0 L${-60 + i * 22} 220 L${-44 + i * 22} 220Z`, fill: "url(#sc-ray)" }, L.rays);
  L.bloom = mk("circle", { r: 120, fill: "url(#sc-bloom)" });
  L.sun = mk("circle", { r: 13 });
  L.clouds = mk("g", { class: "sc-clouds" }); // echte Wolken: vor Sonne/Mond, hinter den Bergen
  // Hohe Schleierwolken (weich, lang)
  L.streaks = mk("g", {}, mv);
  [[30, 260, 5, 180], [52, 340, 4, 240], [74, 200, 3.5, 210], [22, 180, 3, 300]].forEach(([y, w, h, dur], i) => {
    const g = mk("g", { class: "streak", style: `animation-duration:${dur}s;animation-delay:-${i * 70 + 20}s` }, L.streaks);
    mk("ellipse", { cx: 0, cy: y, rx: w / 2, ry: h * 2.2, fill: "url(#sc-st)" }, g);
    mk("ellipse", { cx: w * .2, cy: y + 4, rx: w / 3, ry: h * 1.4, fill: "url(#sc-st)", opacity: .7 }, g);
  });
  // Bergschichten mit Nebel dazwischen
  L.towerLight = null; L.lights = [];
  leafEls = []; L.lights = []; L.smoke = null;
  const HOUSE = Math.round(SW * .33), LAKE = [Math.round(SW * .46), Math.round(SW * .46) + 200]; L.lake = LAKE;
  TH = theme();
  L.shimmer = null; L.frontPts = null; L.beam = null; L.rel = []; L.col = []; L.refl = null; L.aurora = null;
  if (TH === "wasser") buildWater(defs);
  else if (TH === "fjord") buildFjord(defs);
  else if (TH === "kueste") buildCoast(defs);
  else if (TH === "stadt") buildCity(defs);
  else if (TH === "schlicht") buildPlain();
  else (TH === "alpen" ? LAYERS_ALP : LAYERS).concat(SH > 210 ? FRONT : []).forEach(([seed, base, amp, rough, pines], i) => {
    const alp = TH === "alpen";
    const pts = alp && i <= 1 ? alpPts(seed, base, amp, rough) : ridgePts(seed, base, amp, rough, alp ? i <= 2 : i <= 1);
    if (i === 5) pts.forEach((q) => { if (q[0] > LAKE[0] - 60 && q[0] < LAKE[1] + 60) q[1] += 18 * Math.sin(Math.PI * Math.max(0, Math.min(1, (q[0] - LAKE[0] + 60) / (LAKE[1] - LAKE[0] + 120)))); }); // Senke: Blick auf den See bleibt frei
    if (i === 4) pts.forEach((q) => { if (q[0] > LAKE[0] - 30 && q[0] < LAKE[1] + 30) q[1] += 14 * Math.sin(Math.PI * Math.max(0, Math.min(1, (q[0] - LAKE[0] + 30) / (LAKE[1] - LAKE[0] + 60)))); });
    let d = `M-10 ${SH} L${pts.map((p) => p[0] + " " + p[1].toFixed(1)).join(" L")} L${SW + 10} ${SH}Z`;
    if (alp && i === 1) { const right = pts.filter((t) => t[0] > SW * .55 && t[0] < SW * .9); L.alpTop = right.reduce((m, t) => (t[1] < m[1] ? t : m), right[0]); }
    const R = seeded(seed * 3), crowns = [];
    const free = (x) => !(i === 3 && Math.abs(x - HOUSE) < 34) && !((i === 4 || i === 5) && x > LAKE[0] - 30 && x < LAKE[1] + 30);
    if (pines) { // Weißtannen (gestuft, schmal) + Laubbäume dazwischen
      for (let j = 0; j < pts.length; j++) {
        const [x, y] = pts[j]; if (!free(x)) continue;
        const r = R();
        if (r < pines * .62) { const h = (7 + R() * 11) * (1 + (i - 2) * .22), w = h * .26; d += ` M${x - w} ${y + 2} L${x - w * .5} ${y - h * .42} L${x - w * .78} ${y - h * .42} L${x - w * .32} ${y - h * .72} L${x - w * .55} ${y - h * .72} L${x} ${y - h} L${x + w * .55} ${y - h * .72} L${x + w * .32} ${y - h * .72} L${x + w * .78} ${y - h * .42} L${x + w * .5} ${y - h * .42} L${x + w} ${y + 2}Z`; }
        else if (i >= 3 && !alp && r < pines * .62 + .2) { const h = (8 + R() * 9) * (1 + (i - 2) * .22); d += ` M${x - .6} ${y + 2} V${y - h * .45} H${x + .6} V${y + 2}Z`; crowns.push([x, y - h * .62, h, Math.floor(R() * 5), R()]); }
      }
    }
    if (i === 3 && !alp) { // Schwarzwaldhaus: riesiges Walmdach, fast bis zum Boden
      const q = pts.find((t) => t[0] >= HOUSE), x = q[0], y = q[1] + 6;
      d += ` M${x - 15} ${y + 4} L${x - 15} ${y - 4} L${x - 19} ${y - 3} L${x - 7} ${y - 17} L${x + 9} ${y - 17} L${x + 21} ${y - 3} L${x + 17} ${y - 4} L${x + 17} ${y + 4}Z M${x + 5} ${y - 17} L${x + 5} ${y - 21} L${x + 8} ${y - 21} L${x + 8} ${y - 15}Z`;
      L.house = [x, y];
    }
    if (i === 4) { // Bergsee spiegelt den Himmel
      const lk = mk("g", {});
      mk("ellipse", { cx: (LAKE[0] + LAKE[1]) / 2, cy: 203, rx: (LAKE[1] - LAKE[0]) / 2 + 10, ry: 9, fill: "url(#sc-lake)" }, lk);
      L.shimmer = mk("g", {}, mv);
      for (let j = 0; j < 9; j++) { const x = LAKE[0] + 30 + R() * (LAKE[1] - LAKE[0] - 60), y = 199 + R() * 8; mk("path", { d: `M${x} ${y} h${8 + R() * 18}`, stroke: "#fff", "stroke-width": .8, "stroke-linecap": "round", class: "shim", style: `animation-delay:${R() * 3}s` }, L.shimmer); }
      L.frontPts = pts;
    }
    const g = mk("g", {});
    const p = mk("path", { d }, g); layerEls.push(p);
    crowns.forEach(([x, y, h, ci, v]) => { // Krone aus mehreren Ellipsen, leicht schief
      const w = h * (.28 + v * .1), c = mk("g", {}, g);
      [[0, 0, w, h * .4], [-w * .45, h * .12, w * .7, h * .28], [w * .45, h * .08, w * .72, h * .3], [w * .1 * (v - .5), -h * .22, w * .7, h * .26]].forEach(([dx, dy, rx, ry]) => mk("ellipse", { cx: x + dx, cy: y + dy, rx, ry }, c));
      leafEls.push([c, i, ci]); L.crownPts.push([x, y, h, i, ci]); });
    if ((se.snow || alp) && i <= 1) {
      const gr = mk("linearGradient", { id: "sc-snow" + i, x1: 0, y1: 0, x2: 0, y2: 1, gradientUnits: "userSpaceOnUse" }, defs);
      gr.setAttribute("y1", base - amp * (alp ? 1.1 : 1.4)); gr.setAttribute("y2", base + 6);
      mk("stop", { offset: 0, "stop-color": "#F4F7FB" }, gr); mk("stop", { offset: alp ? .3 : .38, "stop-color": "#E6ECF3" }, gr); mk("stop", { offset: alp ? .42 : .62, class: "snowbase" }, gr);
      p.dataset.snow = i;
    }
    if (i === 3 && alp) { // Almhütte mit flachem Satteldach + Seilbahn hoch zum Gipfel
      const q = pts.find((t) => t[0] >= SW * .3), x = q[0], y = q[1] + 5;
      p.setAttribute("d", p.getAttribute("d") + ` M${x - 11} ${y + 3} V${y - 7} L${x - 14} ${y - 6} L${x} ${y - 15} L${x + 14} ${y - 6} L${x + 11} ${y - 7} V${y + 3}Z`);
      [[-6, -3], [0, -3], [6, -3]].forEach(([dx, dy], j) => { const w = mk("rect", { x: x + dx - 1.4, y: y + dy - 1.2, width: 2.8, height: 2.4, fill: "#FFC96E" }); L.lights.push([w, j * .05]); });
      const top = L.alpTop || [SW * .72, 40], a = [SW * .12, 170];
      mk("path", { d: `M${a[0]} ${a[1]} Q${(a[0] + top[0]) / 2} ${(a[1] + top[1]) / 2 + 18} ${top[0]} ${top[1]}`, stroke: "#2A2D35", "stroke-width": .5, fill: "none", opacity: .6 });
      const gon = mk("g", {}, mv); mk("rect", { x: -3, y: 0, width: 6, height: 4.2, rx: 1, fill: "#C8473E" }, gon); mk("path", { d: "M0 0 V-3", stroke: "#2A2D35", "stroke-width": .5 }, gon);
      const kf = []; for (let k = 0; k <= 20; k++) { const t = k / 20, cx = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * ((a[0] + top[0]) / 2) + t * t * top[0], cy = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * ((a[1] + top[1]) / 2 + 18) + t * t * top[1]; kf.push({ transform: `translate(${cx}px, ${cy + 3}px)` }); }
      gon.animate(kf, { duration: 70000, iterations: Infinity, direction: "alternate", easing: "ease-in-out" });
    }
    if (i === 3 && !alp) { // Fenster + Kaminrauch am Schwarzwaldhaus
      const [x, y] = L.house;
      [[-11, -3], [-6, -3], [6, -3], [11, -3], [-2, -11]].forEach(([dx, dy], j) => { const w = mk("rect", { x: x + dx - 1.4, y: y + dy - 1.2, width: 2.8, height: 2.4, fill: "#FFC96E" }); L.lights.push([w, j * .04]); });
      L.smoke = mk("g", {}, mv);
      for (let j = 0; j < 4; j++) mk("circle", { cx: x + 6.5, cy: y - 22, r: 3, class: "smk", opacity: .5, style: `animation-delay:${j * 1.5}s` }, L.smoke);
    }
    if (i === 2 || i === 3) {
      for (let j = 0; j < (i === 2 ? 22 : 10); j++) { const q = pts[Math.floor(R() * pts.length)]; const c = mk("circle", { cx: q[0] + R() * 4, cy: q[1] + 4 + R() * (i === 2 ? 12 : 8), r: .7 + R() * .6, fill: "#FFD58A" }); L.lights.push([c, .1 + R() * .9]); }
    }
    if (i < 4) {
      const fg = mk("g", { filter: "url(#sc-blur8)" });
      for (let j = 0; j < Math.ceil(SW / 190); j++) mk("ellipse", { cx: 80 + j * 190 + R() * 60, cy: base + 8, rx: 90 + R() * 70, ry: 7 + R() * 4, class: "fogc" }, fg);
    }
  });
  if (!L.shimmer) L.shimmer = mk("g", {}, mv);
  L.fogm = mk("g", {}, mv); // ziehender Nebel (nur bei Nebel sichtbar)
  L.fx = mk("g", {}, mv);
  buildClouds();
  buildFest();
  // Filmkorn
  draw(cur);
}

// ---------- Wolken: Quellwolken, die ziehen; bei Regen eine dunkle Decke mit Regenschleiern ----------
let wxKey = "";
const wKey = () => [Math.round(W.cover * 5), W.rain > 0, W.snow > 0, W.storm, W.fog > 0].join();
function puff(g, cx, cy, w, h, R, fill, flat = true) {
  // Wolke aus überlappenden Kugeln: flache Unterseite, oben hoch gewölbt, jede Kugel oben hell, unten im Schatten
  const n = Math.max(4, Math.round(w / 16));
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), hump = Math.sin(Math.PI * (.15 + t * .7));
    const r = (w / n) * (.85 + R() * .6) * (.6 + hump * .7);
    mk("circle", { cx: cx - w / 2 + t * w + (R() - .5) * 6, cy: cy - r * .55 - hump * h * .35 * R(), r, fill }, g);
  }
  for (let i = 0; i < Math.round(n / 2); i++) { // Krone
    const r = (w / n) * (1.1 + R() * .7);
    mk("circle", { cx: cx - w * .25 + R() * w * .5, cy: cy - h * (.45 + R() * .3), r, fill }, g);
  }
  if (flat) mk("ellipse", { cx, cy: cy + 1, rx: w * .52, ry: Math.max(3, h * .16), fill }, g); // flacher Boden
}
function drift(g, w, dur, R) {
  try { const a = g.animate([{ transform: `translateX(${-w}px)` }, { transform: `translateX(${SW + w}px)` }], { duration: dur * 1000, iterations: Infinity, easing: "linear" }); a.currentTime = R() * dur * 1000; } catch {}
}
function buildFest() {
  L.festGlow = []; L.festDark = [];
  const F = fest(); L.festKey = JSON.stringify(F);
  if (!(TH === "wald" || TH === "alpen") || !L.house) return;
  const [hx, hy] = L.house, g = mk("g", {}), gm = mk("g", {}, mv), R = seeded(77);
  const glow = (el, k = 1) => { L.festGlow.push([el, k]); return el; };
  // Vordere Wiese: hier steht die Deko, damit man sie sieht (das Haus liegt weit hinten zwischen den Bäumen)
  const fp = (L.frontPts || []).filter((q) => q[0] > 20 && q[0] < SW - 20);
  const at = (x) => fp.length ? fp.reduce((m, q) => (Math.abs(q[0] - x) < Math.abs(m[0] - x) ? q : m), fp[0]) : [x, SH - 60];
  if (F.advent && !F.baum) { // Stern über dem Haus
    const sx = hx + 1, sy = hy - 40, st = (r1, r2) => Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; return `${(sx + Math.cos(a) * r).toFixed(1)},${(sy + Math.sin(a) * r).toFixed(1)}`; }).join(" ");
    glow(mk("circle", { cx: sx, cy: sy, r: 10, fill: "#FFE7A8", opacity: .25, filter: "url(#sc-blur3)" }), .6);
    glow(mk("polygon", { points: st(4.6, 1.9), fill: "#FFE9AE" }));
  }
  if (F.advent || F.baum) { // Tanne auf der Wiese: Advent nur warmweiße Lichter, ab Heiligabend bunt + Kugeln + Stern
    const [tx, ty0] = at(SW * .2), ty = ty0 + 4, h = 46, w = 15;
    const tiers = [[1, .0], [.78, .3], [.56, .56], [.34, .8]];
    let d = "";
    tiers.forEach(([sc, off]) => { const bw = w * sc, top = ty - h * (off + .42 * (1 - off * .55)), bot = ty - h * off; d += `M${tx - bw} ${bot} Q${tx - bw * .4} ${bot - 2} ${tx} ${top} Q${tx + bw * .4} ${bot - 2} ${tx + bw} ${bot}Q${tx} ${bot + 3} ${tx - bw} ${bot}Z `; });
    d += `M${tx - 1.6} ${ty} V${ty + 4} H${tx + 1.6} V${ty}Z`;
    L.festDark.push(mk("path", { d }, g));
    const cols = F.baum ? ["#FF5A5A", "#FFD36E", "#7FB8FF", "#FF8FD1", "#9BE29B"] : ["#FFE7A8"];
    for (let row = 0; row < 5; row++) { // Lichterkette schräg um den Baum
      const v0 = .08 + row * .18, n = 7 - row;
      for (let k = 0; k < n; k++) { const t = (k + .5) / n, v = v0 + t * .12, half = w * (1 - v) * .95, x = tx - half + t * half * 2, y = ty - h * v; glow(mk("circle", { cx: x, cy: y, r: 1.05, fill: cols[(row * 3 + k) % cols.length], class: "fest-tw", style: `animation-delay:${(R() * 2.4).toFixed(2)}s` }, gm)); }
    }
    if (F.baum) {
      for (let k = 0; k < 9; k++) { const v = .1 + R() * .7, x = tx + (R() - .5) * 1.6 * w * (1 - v), y = ty - h * v + 2; L.festGlow.push([mk("circle", { cx: x, cy: y, r: 1.6, fill: ["#C8323C", "#D9A93A", "#3F6FC2"][k % 3] }, g), -1]); }
      const sx = tx, sy = ty - h - 2.5, st = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 1.7 : 4.2; return `${(sx + Math.cos(a) * r).toFixed(1)},${(sy + Math.sin(a) * r).toFixed(1)}`; }).join(" ");
      glow(mk("circle", { cx: sx, cy: sy, r: 8, fill: "#FFD36E", opacity: .3, filter: "url(#sc-blur3)" }, gm), .7);
      glow(mk("polygon", { points: st, fill: "#FFD36E" }, gm), 1);
      // Geschenke unterm Baum
      [[-9, 4.5, "#C8323C"], [7, 3.6, "#3F6FC2"], [-2.5, 3, "#D9A93A"]].forEach(([dx, sz, c]) => { const x = tx + dx, y = ty + 3; L.festGlow.push([mk("rect", { x: x - sz / 2, y: y - sz, width: sz, height: sz, fill: c, rx: .3 }, g), -1]); L.festGlow.push([mk("rect", { x: x - .35, y: y - sz, width: .7, height: sz, fill: "#F5EBD5" }, g), -1]); });
    }
  }
  if (F.halloween) { // Kürbisse vorne auf der Wiese, Gesichter leuchten abends
    const [px, py] = at(SW * .22);
    [[0, 0, 6], [-11, 1, 4.4], [9, 1.4, 3.6]].forEach(([dx, dy, r]) => {
      const x = px + dx, y = py + dy + 3;
      L.festGlow.push([mk("ellipse", { cx: x, cy: y - r * .9, rx: r * 1.3, ry: r, fill: "#D9661A" }, g), -1]);
      mk("path", { d: `M${x - r * .45} ${y - r * 1.85} Q${x - r * .05} ${y - r * .2} ${x - r * .45} ${y} M${x + r * .45} ${y - r * 1.85} Q${x + r * .05} ${y - r * .2} ${x + r * .45} ${y}`, stroke: "#A84A10", "stroke-width": .5, fill: "none", opacity: .6 }, g);
      mk("path", { d: `M${x} ${y - r * 1.85} q.3 -1.6 1.6 -2`, stroke: "#3E5A2A", "stroke-width": 1, fill: "none", "stroke-linecap": "round" }, g);
      const cy = y - r * .95;
      glow(mk("circle", { cx: x, cy, r: r * 1.6, fill: "#FFB347", opacity: .2, filter: "url(#sc-blur3)" }, g), .5);
      glow(mk("path", { d: `M${x - r * .65} ${cy - r * .05} l${r * .28} ${-r * .42} l${r * .28} ${r * .42}Z M${x + r * .09} ${cy - r * .05} l${r * .28} ${-r * .42} l${r * .28} ${r * .42}Z M${x - r * .7} ${cy + r * .25} q${r * .7} ${r * .55} ${r * 1.4} 0 l${-r * .25} ${r * .12} l${-r * .2} ${-r * .12} l${-r * .25} ${r * .14} l${-r * .25} ${-r * .14} l${-r * .2} ${r * .12}Z`, fill: "#FFD36E" }, g));
    });
  }
  if (F.ostern && fp.length) { // Bunte Eier im Gras, links und rechts vom See
    const cols = ["#F28AB2", "#8FC8F2", "#F2D36E", "#9BE29B", "#C7A2F2", "#F2A06E"];
    const spots = fp.filter((q) => (q[0] > 40 && q[0] < L.lake[0] - 20) || (q[0] > L.lake[1] + 20 && q[0] < SW - 40));
    for (let k = 0; k < 11 && spots.length; k++) {
      const q = spots[Math.floor(R() * spots.length)], x = q[0] + R() * 6, y = q[1] + 4, c = cols[k % cols.length], rot = `rotate(${((R() - .5) * 50).toFixed(0)} ${x} ${y})`;
      L.festGlow.push([mk("ellipse", { cx: x, cy: y, rx: 2.3, ry: 3, fill: c, transform: rot }, g), -1]);
      L.festGlow.push([mk("path", { d: `M${x - 2.2} ${y - .3} q1.1 -1 2.2 0 t2.2 0`, stroke: "#FFFFFF", "stroke-width": .55, fill: "none", opacity: .8, transform: rot }, g), -1]);
    }
  }
}
function buildClouds() {
  if (!L.clouds) return;
  L.clouds.innerHTML = ""; L.fogm.innerHTML = ""; wxKey = wKey(); fx.parts = [];
  if (TH === "wasser") return;
  const R = seeded(Math.round(W.cover * 10) * 7 + (W.rain ? 3 : 0) + (W.snow ? 5 : 0) + 11), wet = W.rain || W.snow, wind = W.storm ? 2.4 : wet ? 1.5 : 1;
  // Quellwolken (Schönwetter bis bewölkt)
  const n = wet ? Math.round(3 + W.cover * 3) : Math.round(W.cover * 9 + (W.cover > .15 ? 1 : 0));
  for (let i = 0; i < n; i++) {
    const depth = R(), w = 70 + depth * 120 + R() * 40, h = w * (.38 + R() * .2), y = 34 + (1 - depth) * 30 + R() * 22;
    const g = mk("g", { filter: wet ? "url(#sc-blur3)" : "url(#sc-soft)", opacity: (.75 + depth * .25).toFixed(2) }, L.clouds);
    if (wet) puff(g, 0, y + 10, w * 1.4, h * .5, R, "url(#sc-cdu)", false); // zerfranste Regenfetzen
    else puff(g, 0, y, w, h, R, "url(#sc-cl)");
    drift(g, w, (520 - depth * 260 + R() * 120) / wind, R);
  }
  // Regen- / Schneedecke: tief hängend über die ganze Breite, Unterseite wellig (von unten gesehen)
  if (wet || W.cover > .85) {
    const deck = mk("g", {}, L.clouds), base = W.storm ? 54 : wet ? 46 : 30;
    let d = `M-20 -10 L${SW + 20} -10 L${SW + 20} ${base}`;
    for (let x = SW + 20; x > -20;) { const bw = 30 + R() * 46, by = base + (R() - .3) * 10; d += ` Q${x - bw / 2} ${by + 12 + R() * 10} ${x - bw} ${by}`; x -= bw; }
    mk("path", { d: d + " Z", fill: wet ? "url(#sc-cdu)" : "url(#sc-clu)", filter: "url(#sc-blur3)" }, deck);
    for (let i = 0; i < Math.round(SW / 70); i++) { // einzelne tiefere Fetzen
      const x = R() * SW, y = base - 2 + R() * 10, rx = 30 + R() * 40;
      mk("ellipse", { cx: x, cy: y, rx, ry: 6 + R() * 6, fill: wet ? "url(#sc-cdu)" : "url(#sc-clu)", filter: "url(#sc-blur3)", opacity: .9 }, deck);
    }
    L.deck = deck;
  } else L.deck = null;
  // Regenschleier unter den Wolken (schräg, weich)
  if (W.rain || W.snow) {
    const sh = mk("g", { filter: "url(#sc-blur5)", opacity: (W.snow ? .35 : .25 + W.rain * .35).toFixed(2) }, L.clouds);
    for (let i = 0; i < Math.round(SW / 160); i++) {
      const x = R() * SW, w = 40 + R() * 80, g = mk("g", {}, sh);
      mk("path", { d: `M${x} 30 L${x + w} 30 L${x + w - 26} 170 L${x - 26} 170Z`, fill: "url(#sc-shaft)" }, g);
      drift(g, 0, (300 + R() * 200) / wind, R);
    }
  }
  // Ziehender Nebel
  if (W.fog) for (let i = 0; i < 6; i++) {
    const g = mk("g", { filter: "url(#sc-blur8)" }, L.fogm), y = 120 + R() * 70, w = 260 + R() * 260;
    mk("ellipse", { cx: 0, cy: y, rx: w / 2, ry: 12 + R() * 14, class: "fogm" }, g);
    drift(g, w / 2, 260 + R() * 220, R);
  }
}

// Nebelbänke zwischen Schichten (für alle Landschaften)
function fogBand(base, R) { const fg = mk("g", { filter: "url(#sc-blur8)" }); for (let j = 0; j < Math.ceil(SW / 190); j++) mk("ellipse", { cx: 80 + j * 190 + R() * 60, cy: base + 8, rx: 90 + R() * 70, ry: 7 + R() * 4, class: "fogc" }, fg); }
const layer = (d) => { const g = mk("g", {}), p = mk("path", { d }, g); layerEls.push(p); return p; };
const ridgeD = (pts) => `M-10 ${SH} L${pts.map((p) => p[0] + " " + p[1].toFixed(1)).join(" L")} L${SW + 10} ${SH}Z`;

// ---------- Fjord: steile Berge mit Schneekappen beidseits, stilles Wasser, das alles spiegelt – nachts Nordlicht ----------
function buildFjord(defs) {
  const R = seeded(211), f1 = (n) => n.toFixed(1), HZ = SH > 210 ? 168 : 146;
  L.refl = []; L.fjord = { HZ };
  const fl = (d, k, j, snow) => { const p = layer(d); p.dataset.k = k; p.dataset.j = j; if (snow) { const id = "F" + layerEls.length; const gr = mk("linearGradient", { id: "sc-snow" + id, x1: 0, y1: 0, x2: 0, y2: 1, gradientUnits: "userSpaceOnUse" }, defs); gr.setAttribute("y1", snow[0]); gr.setAttribute("y2", snow[1]); mk("stop", { offset: 0, "stop-color": "#F4F7FB" }, gr); mk("stop", { offset: .35, "stop-color": "#E6ECF3" }, gr); mk("stop", { offset: .5, class: "snowbase" }, gr); p.dataset.snow = id; } return p; };
  // Nordlicht: liegt hinter den Bergen, bewegt sich langsam; Farbe und Sichtbarkeit setzt draw()
  const ag = mk("linearGradient", { id: "sc-aur", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  mk("stop", { offset: 0, "stop-color": "#39E58C", "stop-opacity": 0 }, ag); mk("stop", { offset: .35, "stop-color": "#39E58C", "stop-opacity": .9 }, ag); mk("stop", { offset: 1, "stop-color": "#8B5CF6", "stop-opacity": 0 }, ag);
  L.aurora = mk("g", { opacity: 0 });
  [[14, 80, 0, 52000], [40, 70, 1, 68000], [4, 50, 2, 44000], [60, 56, 3, 76000]].forEach(([y0, h, i, dur]) => {
    let d = `M${-SW * .3} ${y0}`; for (let x = -SW * .3; x <= SW * 1.3; x += 90) d += ` Q${f1(x + 45)} ${f1(y0 + (R() - .5) * 40)} ${f1(x + 90)} ${f1(y0 + (R() - .5) * 20)}`;
    for (let x = SW * 1.3; x >= -SW * .3; x -= 90) d += ` Q${f1(x - 45)} ${f1(y0 + h + (R() - .5) * 50)} ${f1(x - 90)} ${f1(y0 + h + (R() - .5) * 24)}`; d += "Z";
    const p = mk("path", { d, fill: "url(#sc-aur)", filter: "url(#sc-blur8)", opacity: .95 - i * .15 }, L.aurora);
    try { const a = p.animate([{ transform: "translateX(0) skewX(0deg)" }, { transform: `translateX(${i % 2 ? -70 : 70}px) skewX(${i % 2 ? -6 : 6}deg)` }], { duration: dur, iterations: Infinity, direction: "alternate", easing: "ease-in-out" }); a.currentTime = R() * dur; } catch {}
  });
  // Berge: hinten quer, dann zwei Paare, die von den Seiten ins Wasser laufen
  const wing = (seed, gapHalf, base, amp, k, j, snowTop) => {
    const pts = ridgePts(seed, base, amp, 1, true).map(([x, y]) => { const t = Math.min(1, Math.max(0, (Math.abs(x - SW / 2) - gapHalf) / (SW * .14))); const tt = t * t * (3 - 2 * t); return [x, HZ + 14 + (y - HZ - 14) * tt]; });
    return fl(ridgeD(pts), k, j, snowTop ? [base - amp * 1.05, base - amp * .25] : null);
  };
  fl(ridgeD(ridgePts(13, HZ - 26, 52, 1, true)), .18, 0, [HZ - 80, HZ - 36]); fogBand(HZ - 20, R);
  wing(31, SW * .1, HZ - 34, 96, .4, 1, true);
  wing(37, SW * .26, HZ - 30, 130, .64, 2, true);
  // Wasser
  mk("rect", { x: 0, y: HZ, width: SW, height: SH - HZ + 20, fill: "url(#sc-lake)" });
  // Spiegelung: Kopien von Nordlicht und Bergen, gespiegelt und nur im Wasser sichtbar
  const rc = mk("clipPath", { id: "sc-fjc" }, defs); mk("rect", { x: 0, y: HZ, width: SW, height: SH - HZ + 20 }, rc);
  const rg = mk("g", { "clip-path": "url(#sc-fjc)", transform: `translate(0 ${2 * HZ}) scale(1 -1)`, opacity: .55 });
  L.auroraR = mk("g", { opacity: 0 }, rg); L.aurora.querySelectorAll("path").forEach((p) => { const c = mk("path", { d: p.getAttribute("d"), fill: "url(#sc-aur)", filter: "url(#sc-blur8)", opacity: p.getAttribute("opacity") }, L.auroraR); });
  layerEls.forEach((p) => { const c = mk("path", { d: p.getAttribute("d") }, rg); L.refl.push([c, p]); });
  L.shimmer = mk("g", {}, mv);
  for (let j = 0; j < Math.ceil(SW / 30); j++) mk("path", { d: `M${f1(R() * SW)} ${f1(HZ + 4 + R() * (SH - HZ - 6))} h${f1(5 + R() * 12)}`, stroke: "#fff", "stroke-width": .7, "stroke-linecap": "round", class: "shim", style: `animation-delay:${R() * 3}s` }, L.shimmer);
  // Ufer vorne links mit rotem Fischerhaus auf Stelzen, Steg und Boot
  const SX = SW * .14, SY = HZ + 36;
  fl(`M-10 ${SH + 10} V${f1(SY - 8)} Q${f1(SX - 40)} ${f1(SY - 14)} ${f1(SX)} ${f1(SY - 4)} Q${f1(SX + 50)} ${f1(SY + 6)} ${f1(SX + 70)} ${f1(SY + 18)} Q${f1(SX + 80)} ${f1(SY + 30)} ${f1(SX + 60)} ${SH + 10}Z`, .92, 3);
  const hx = SX + 6, hy = SY - 4; L.house = [hx, hy];
  const hut = mk("g", {}); L.col = L.col || [];
  const col = (el, c) => { L.col.push([el, c]); return el; };
  [[-13, 0], [-5, 0], [3, 0], [11, 0]].forEach(([dx]) => col(mk("rect", { x: hx + dx - .8, y: hy - 2, width: 1.6, height: 7, fill: "#3B2E24" }, hut), "#3B2E24")); // Stelzen
  col(mk("path", { d: `M${hx - 15} ${hy - 2} V${hy - 16} L${hx} ${hy - 25} L${hx + 15} ${hy - 16} V${hy - 2}Z`, fill: "#B33A2E" }, hut), "#B33A2E");
  col(mk("path", { d: `M${hx - 17} ${hy - 15} L${hx} ${hy - 26.5} L${hx + 17} ${hy - 15} L${hx + 15} ${hy - 14} L${hx} ${hy - 24.5} L${hx - 15} ${hy - 14}Z`, fill: "#F2F0E8" }, hut), "#F2F0E8");
  [[-7, -9], [6, -9], [0, -18]].forEach(([dx, dy], j) => { const w = mk("rect", { x: hx + dx - 1.6, y: hy + dy - 1.4, width: 3.2, height: 2.8, fill: "#FFC96E" }, hut); L.lights.push([w, j * .05]); });
  col(mk("path", { d: `M${hx + 15} ${hy - 1} L${hx + 58} ${hy + 10} L${hx + 58} ${hy + 12.5} L${hx + 15} ${hy + 1.5}Z`, fill: "#4A3A2C" }, hut), "#4A3A2C"); // Steg
  [[22, 2], [34, 5], [46, 8], [56, 10.5]].forEach(([dx, dy]) => col(mk("rect", { x: hx + dx - .7, y: hy + dy, width: 1.4, height: 6, fill: "#3B2E24" }, hut), "#3B2E24"));
  const boat = mk("g", {}, mv); col(mk("path", { d: `M${hx + 44} ${hy + 16} Q${hx + 50} ${hy + 22} ${hx + 60} ${hy + 21} L${hx + 63} ${hy + 15} Q${hx + 52} ${hy + 13} ${hx + 44} ${hy + 16}Z`, fill: "#2E4A5E" }, boat), "#2E4A5E");
  try { boat.animate([{ transform: "translateY(0)" }, { transform: "translateY(1.2px)" }], { duration: 2600, iterations: Infinity, direction: "alternate", easing: "ease-in-out" }); } catch {}
  L.frontPts = [[SW * .5, SH - 24]]; L.lake = [0, SW]; L.fjordHZ = HZ;
}

// ---------- Unterwasser: Riff mit Korallen, Lichtstrahlen von oben, Blasen, Seegras – nachts Plankton und Quallen ----------
const CORAL = ["#E8788F", "#F0A05A", "#9B7FD6", "#4FBFA8", "#E9D36A", "#D95A5A", "#F2B8C6"];
function buildWater() {
  const R = seeded(131), FL = SH - 6, sway = (el, ox, oy, deg, dur) => { try { el.style.transformBox = "view-box"; el.style.transformOrigin = `${ox}px ${oy}px`; const a = el.animate([{ transform: `rotate(${-deg}deg)` }, { transform: `rotate(${deg}deg)` }], { duration: dur, iterations: Infinity, direction: "alternate", easing: "ease-in-out" }); a.currentTime = R() * dur; } catch {} };
  const wl = (d, k, tint) => { const p = layer(d); p.dataset.k = k; if (tint) p.dataset.tint = tint; return p; };
  const quad = (x1, y1, x2, y2, w1, w2) => { const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l; return `M${(x1 + nx * w1).toFixed(1)} ${(y1 + ny * w1).toFixed(1)} L${(x2 + nx * w2).toFixed(1)} ${(y2 + ny * w2).toFixed(1)} L${(x2 - nx * w2).toFixed(1)} ${(y2 - ny * w2).toFixed(1)} L${(x1 - nx * w1).toFixed(1)} ${(y1 - ny * w1).toFixed(1)}Z `; };
  // Korallenformen (Pfad-Strings; Farbe kommt über dataset.tint aus draw())
  const staghorn = (x, y, h, ang, w) => { let d = ""; const go = (x, y, h, ang, w, dp) => { const x2 = x + Math.sin(ang) * h, y2 = y - Math.cos(ang) * h; d += quad(x, y, x2, y2, w, w * .6); if (dp < 3) { const n = R() < .6 ? 2 : 1; for (let i = 0; i < n; i++) go(x2, y2, h * (.6 + R() * .2), ang + (i ? 1 : -1) * (.35 + R() * .5), w * .65, dp + 1); } else d += `M${(x2 - w).toFixed(1)} ${y2.toFixed(1)} a${w} ${w} 0 1 0 ${w * 2} 0 a${w} ${w} 0 1 0 ${-w * 2} 0Z `; }; go(x, y, h, ang, w, 0); return d; };
  const brain = (x, y, r) => { let d = `M${(x - r * 1.2).toFixed(1)} ${y + 2} `; const n = 7; for (let i = 0; i <= n; i++) { const a = Math.PI - (i / n) * Math.PI, bx = x + Math.cos(a) * r * 1.2, by = y - Math.sin(a) * r * (.9 + R() * .3); d += `${i ? "Q" + (x + Math.cos(a + .22) * r * 1.5).toFixed(1) + " " + (y - Math.sin(a + .22) * r * 1.35).toFixed(1) + " " : "L"}${bx.toFixed(1)} ${by.toFixed(1)} `; } return d + `L${(x + r * 1.2).toFixed(1)} ${y + 2}Z `; };
  const fan = (x, y, r) => { let d = `M${x - 1} ${y} L${x + 1} ${y} L${x + 1} ${y - r * .3} `; const n = 9; for (let i = 0; i <= n; i++) { const a = -.1 - (i / n) * (Math.PI - .2), rr = r * (.75 + R() * .35), bx = x + Math.cos(a) * rr, by = y - r * .3 + Math.sin(a) * rr; d += `L${bx.toFixed(1)} ${by.toFixed(1)} L${(x + Math.cos(a - .15) * rr * .72).toFixed(1)} ${(y - r * .3 + Math.sin(a - .15) * rr * .72).toFixed(1)} `; } return d + `L${x - 1} ${y - r * .3}Z `; };
  const tubes = (x, y, h) => { let d = ""; for (let i = 0; i < 3 + Math.floor(R() * 3); i++) { const tx = x + i * 5 - 6, th = h * (.5 + R() * .7), w = 2 + R() * 1.4; d += `M${(tx - w).toFixed(1)} ${y + 2} V${(y - th).toFixed(1)} a${w} ${w * .5} 0 0 1 ${w * 2} 0 V${y + 2}Z `; } return d; };
  const star = (x, y, r) => { let d = ""; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 1.2566, a2 = a + .6283; d += `${i ? "L" : "M"}${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)} L${(x + Math.cos(a2) * r * .45).toFixed(1)} ${(y + Math.sin(a2) * r * .45).toFixed(1)} `; } return d + "Z "; };
  const floor = (seed, base, amp) => ridgePts(seed, base, amp, .4, false);
  // Hinten: ferne Riffkanten (blau verschwommen)
  const far = floor(11, FL - 78, 22); wl(ridgeD(far), .18);
  let d = ""; for (let i = 0; i < Math.ceil(SW / 100); i++) { const q = far[Math.floor(R() * far.length)]; d += R() < .5 ? staghorn(q[0], q[1] + 2, 9 + R() * 8, (R() - .5) * .6, 1.2) : brain(q[0], q[1] + 2, 6 + R() * 6); } wl(d, .28, "#5A8FB8");
  L.shafts = mk("g", { opacity: 0 });
  // Mitte: Riff mit Korallen in Farbe
  const mid = floor(23, FL - 44, 16); wl(ridgeD(mid), .5);
  const byTint = {};
  for (let i = 0; i < Math.ceil(SW / 60); i++) { const q = mid[Math.floor(R() * mid.length)], t = Math.floor(R() * CORAL.length), kind = R(); byTint[t] = (byTint[t] || "") + (kind < .35 ? staghorn(q[0], q[1] + 3, 12 + R() * 12, (R() - .5) * .5, 1.6) : kind < .55 ? brain(q[0], q[1] + 3, 8 + R() * 8) : kind < .8 ? fan(q[0], q[1] + 3, 12 + R() * 10) : tubes(q[0], q[1] + 3, 14 + R() * 10)); }
  Object.keys(byTint).forEach((t) => wl(byTint[t], .55, CORAL[t]));
  // Sandboden mit Lichtflecken (Kaustik) und Seesternen
  const sand = floor(37, FL - 10, 5); const sp = wl(ridgeD(sand), .72); sp.dataset.sand = 1;
  L.shimmer = mk("g", {}, mv);
  for (let j = 0; j < SW / 14; j++) { const q = sand[Math.floor(R() * sand.length)], y = q[1] + 2 + R() * Math.max(2, SH - q[1] - 2); mk("path", { d: `M${q[0]} ${y.toFixed(1)} q${4 + R() * 6} -2 ${10 + R() * 14} 0`, stroke: "#fff", "stroke-width": .7, "stroke-linecap": "round", fill: "none", class: "shim", style: `animation-delay:${R() * 3}s` }, L.shimmer); }
  d = ""; for (let i = 0; i < 4; i++) { const q = sand[Math.floor(R() * sand.length)]; d += star(q[0], q[1] + 5 + R() * 6, 4 + R() * 2.5); } wl(d, .74, "#E8788F");
  // Vorne: große Korallenstöcke, Seegras und Anemonen (schwanken, liegen in der bewegten Ebene)
  d = ""; const nearTint = CORAL[Math.floor(R() * CORAL.length)];
  [[SW * .08, 1], [SW * .9, 1], [SW * .5, .6]].forEach(([x, sc]) => { d += brain(x, FL, 22 * sc) + staghorn(x - 30 * sc, FL + 2, 24 * sc, -.4, 2.4) + staghorn(x + 32 * sc, FL + 2, 20 * sc, .35, 2.2); });
  wl(d, .9, nearTint);
  d = ""; [[SW * .22, 1], [SW * .72, .8]].forEach(([x, sc]) => { d += fan(x, FL + 1, 26 * sc) + tubes(x + 30 * sc, FL + 1, 24 * sc); }); wl(d, .92, CORAL[(CORAL.indexOf(nearTint) + 3) % CORAL.length]);
  L.kelp = mk("g", {}, mv);
  for (let i = 0; i < Math.ceil(SW / 45); i++) {
    const x = R() * SW, h = 30 + R() * 60, w = 2.2 + R() * 1.6, pts = [];
    for (let k = 0; k <= 6; k++) pts.push([x + Math.sin(k * 1.5 + x) * 5 * (k / 6), FL + 4 - h * k / 6]);
    let kd = `M${(pts[0][0] - w).toFixed(1)} ${pts[0][1]}`; pts.forEach(([px, py], k) => { if (k) kd += ` L${(px - w * (1 - k / 7)).toFixed(1)} ${py.toFixed(1)}`; }); for (let k = 6; k >= 0; k--) kd += ` L${(pts[k][0] + w * (1 - k / 7)).toFixed(1)} ${pts[k][1].toFixed(1)}`; kd += "Z";
    const p = mk("path", { d: kd, class: "kelp" }, L.kelp); sway(p, x, FL + 4, 3 + R() * 3, 5000 + R() * 4000);
  }
  L.anem = mk("g", {}, mv);
  for (let i = 0; i < Math.ceil(SW / 160); i++) { const x = 40 + R() * (SW - 80), c = ["#F2B8C6", "#F0A05A", "#C9B6FF"][i % 3], g = mk("g", {}, L.anem); for (let k = 0; k < 14; k++) { const a = -Math.PI * .95 + (k / 13) * Math.PI * .9, l = 7 + R() * 6, p = mk("path", { d: `M${x.toFixed(1)} ${FL + 2} Q${(x + Math.cos(a) * l * .5).toFixed(1)} ${(FL + 2 + Math.sin(a) * l * .6).toFixed(1)} ${(x + Math.cos(a) * l).toFixed(1)} ${(FL + 2 + Math.sin(a) * l).toFixed(1)}`, stroke: c, "stroke-width": 1.6, "stroke-linecap": "round", fill: "none" }, g); sway(p, x, FL + 2, 5, 2500 + R() * 2000); } }
  // Blasen aus dem Boden
  L.bubbles = mk("g", {}, mv);
  for (let i = 0; i < Math.ceil(SW / 40); i++) { const x = R() * SW, r = .6 + R() * 1.6, dur = 7000 + R() * 8000, b = mk("circle", { cx: 0, cy: 0, r, fill: "#fff", opacity: 0 }, L.bubbles); try { const a = b.animate([{ transform: `translate(${x}px, ${FL}px)`, opacity: 0 }, { opacity: .55, offset: .08 }, { transform: `translate(${x + 14}px, ${FL * .6}px)`, opacity: .5, offset: .5 }, { transform: `translate(${x - 6}px, 6px)`, opacity: 0 }], { duration: dur, iterations: Infinity, easing: "linear" }); a.currentTime = R() * dur; } catch {} }
  // Plankton: leuchtet nachts
  L.plankton = mk("g", { opacity: 0 }, mv);
  for (let i = 0; i < SW / 9; i++) mk("circle", { class: "star", cx: R() * SW, cy: 10 + R() * (SH - 30), r: .5 + R() * .7, fill: "#9FF5E8", style: `animation-delay:${R() * 3.4}s` }, L.plankton);
  // Wasseroberfläche von unten: zwei wellige Bänder ziehen gegeneinander
  L.surface = mk("g", {}, mv);
  [[0, 5, 120], [4, 3.5, 170]].forEach(([y0, amp, dur], j) => { let sd = `M${-SW} ${y0}`; for (let x = -SW; x <= SW * 2; x += 36) sd += ` Q${x + 18} ${(y0 + amp * 2 * (R() * .5 + .5)).toFixed(1)} ${x + 36} ${y0}`; sd += ` L${SW * 2} -40 L${-SW} -40Z`; const p = mk("path", { d: sd, class: "wsurf", opacity: .35 - j * .12 }, L.surface); try { p.animate([{ transform: "translateX(0)" }, { transform: `translateX(${j ? 72 : -72}px)` }], { duration: dur * 100, iterations: Infinity, direction: "alternate", easing: "ease-in-out" }); } catch {} });
  L.frontPts = [[SW * .2, FL - 12]]; L.lake = [SW * .2, SW * .2]; L.house = null;
}


// ---------- Küste: Landzungen, Meer mit Glitzern, Leuchtturm auf der Klippe ----------
function buildCoast() {
  const R = seeded(91), HZ = 124; // Horizont höher, damit das Meer im weichen Auslauf noch sichtbar ist
  layer(ridgeD(ridgePts(11, HZ - 14, 14, .8, false).map(([x, y]) => [x, x > SW * .58 ? y : HZ + 2 + (y - HZ) * .2]))); fogBand(HZ - 14, R);
  layer(ridgeD(ridgePts(23, HZ - 4, 9, 1, false).map(([x, y]) => [x, x < SW * .28 ? y : HZ + 2]))); fogBand(HZ - 6, R);
  // Meer (spiegelt den Himmel)
  mk("rect", { x: 0, y: HZ, width: SW, height: SH - HZ, fill: "url(#sc-lake)" });
  L.shimmer = mk("g", {}, mv);
  for (let j = 0; j < SW / 10; j++) { const y = HZ + 3 + Math.pow(R(), 1.4) * 70, x = R() * SW, w = 5 + (y - HZ) * .5 * R() + 3; mk("path", { d: `M${x} ${y} h${w}`, stroke: "#fff", "stroke-width": .4 + (y - HZ) / 70, "stroke-linecap": "round", class: "shim", style: `animation-delay:${R() * 3}s` }, L.shimmer); }
  // Klippe rechts mit Leuchtturm
  const cx = Math.round(SW * .8), top = HZ + 6;
  let d = `M${cx - 150} 212 L${cx - 110} 186 Q${cx - 80} ${top + 6} ${cx - 44} ${top} L${cx + 60} ${top - 5} Q${cx + 110} ${top - 3} ${cx + 150} ${top + 8} L${SW + 10} ${top + 4} L${SW + 10} 212Z`;
  d += ` M${cx - 7} ${top} L${cx - 5} ${top - 50} L${cx + 5} ${top - 50} L${cx + 7} ${top}Z M${cx - 7.5} ${top - 50} h15 v-3 h-15Z M${cx - 4.5} ${top - 53} v-8 h9 v8Z M${cx - 5.5} ${top - 61} L${cx} ${top - 67} L${cx + 5.5} ${top - 61}Z`;
  // Häuschen am Turm
  d += ` M${cx + 12} ${top} v-9 l7 -6 l7 6 v9Z`;
  layer(d);
  L.house = [cx, top];
  [top - 14, top - 31].forEach((y) => mk("rect", { x: cx - 6.2, y, width: 12.4, height: 5, fill: "#C8473E", opacity: .85 }));
  const lamp = mk("circle", { cx, cy: top - 57, r: 2.8, fill: "#FFE8A8" }); L.lights.push([lamp, 0]);
  const win = mk("rect", { x: cx + 17.5, y: top - 6, width: 3, height: 3, fill: "#FFC96E" }); L.lights.push([win, .3]);
  L.beam = mk("g", { transform: `translate(${cx} ${top - 57})`, opacity: 0 }, mv);
  const b = mk("path", { d: "M0 0 L-320 -16 L-320 16Z", fill: "#FFF1C2", opacity: .22, filter: "url(#sc-blur3)" }, L.beam);
  b.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(.05)" }, { transform: "scaleX(-1)" }, { transform: "scaleX(.05)" }, { transform: "scaleX(1)" }], { duration: 9000, iterations: Infinity });
  // Segelboot draußen
  const bx = SW * .38; layer(`M${bx - 9} ${HZ + 6} h18 l-3 3 h-12Z M${bx} ${HZ + 5} V${HZ - 12} L${bx + 8} ${HZ + 4}Z M${bx - 1} ${HZ - 10} L${bx - 7} ${HZ + 4} H${bx - 1}Z`);
  // Dünengras vorne links
  let g = `M-10 212 L-10 172 Q${SW * .12} 164 ${SW * .26} 180 Q${SW * .32} 188 ${SW * .36} 212Z`;
  for (let j = 0; j < 50; j++) { const x = R() * SW * .3, y = 172 + (x / (SW * .3)) * 10 + R() * 4, h = 6 + R() * 10, lean = (R() - .3) * 5; g += ` M${x} ${y} Q${x + lean * .5} ${y - h * .6} ${x + lean} ${y - h} L${x + .9} ${y}Z`; }
  layer(g);
  L.frontPts = [[SW * .2, 180]]; L.lake = [SW * .2, SW * .2];
}

// ---------- Stadt: Hügel, Skyline mit Fernsehturm, Fenster gehen abends an ----------
function buildCity() {
  const R = seeded(57);
  layer(ridgeD(ridgePts(11, 122, 16, 1, false))); fogBand(122, R);
  const row = (base, minH, maxH, minW, maxW, wins, tower) => {
    let d = "", x = -10; const rects = [];
    while (x < SW + 10) {
      const w = minW + R() * (maxW - minW), h = minH + R() * (maxH - minH), y = base - h;
      d += ` M${x} ${base + 30} V${y} H${x + w} V${base + 30}Z`;
      if (R() < .25) d += ` M${x + w * .3} ${y} V${y - 4 - R() * 6} H${x + w * .35} V${y}Z`; // Antenne
      rects.push([x, y, w, h]); x += w + (R() < .3 ? 2 + R() * 6 : 0);
    }
    if (tower) { const tx = SW * .62, ty = base - maxH - 52; d += ` M${tx - 2} ${base + 30} L${tx - 1.2} ${ty + 20} L${tx + 1.2} ${ty + 20} L${tx + 2} ${base + 30}Z M${tx - 6} ${ty + 20} a6 4 0 1 0 12 0 a6 4 0 1 0 -12 0Z M${tx - .5} ${ty + 16} V${ty} H${tx + .5} V${ty + 16}Z`; const t = mk("circle", { cx: tx, cy: ty, r: 1, fill: "#FF4A4A", class: "blink" }, mv); L.towerLight = t; }
    layer(d);
    if (wins) rects.forEach(([x, y, w, h]) => { for (let wy = y + 4; wy < Math.min(base + 26, y + h + 24); wy += wins) for (let wx = x + 2.5; wx < x + w - 3; wx += wins * .9) if (R() < .42) { const c = mk("rect", { x: wx, y: wy, width: wins * .38, height: wins * .5, fill: R() < .8 ? "#FFD58A" : "#BFE0FF" }); L.lights.push([c, R()]); } });
  };
  row(140, 16, 42, 10, 22, 0, true); fogBand(140, R);
  row(160, 12, 34, 14, 30, 5.5, false);
  row(184, 8, 22, 18, 40, 6.5, false);
  // Straße mit Laternen
  layer(`M-10 212 V200 H${SW + 10} V212Z`);
  for (let x = 20; x < SW; x += 70) { mk("rect", { x, y: 190, width: .8, height: 10, fill: "#222" }); const c = mk("circle", { cx: x + .4, cy: 190, r: 1.6, fill: "#FFE2A0" }); L.lights.push([c, 0]); }
  L.frontPts = [[SW * .2, 200]]; L.lake = [SW * .2, SW * .2];
}

// ---------- Schlicht: nur Himmel und eine sanfte Hügelkante ----------
function buildPlain() { const R = seeded(3); layer(ridgeD(ridgePts(11, 150, 12, .4, false))); fogBand(150, R); layer(ridgeD(ridgePts(23, 172, 8, .3, false))); L.frontPts = [[SW * .2, 196]]; L.lake = [SW * .2, SW * .2]; }

// ---------- Zeichnen ----------
let cur = 720;
function draw(m) {
  cur = m;
  let [top, mid, hor] = sky(m); const d = daylight(m), night = 1 - d, se = SEASON[season];
  const ov = Math.min(1, W.cover * .7 + (W.rain || W.snow ? .25 : 0) + (W.storm ? .2 : 0)); // Bewölkung färbt den Himmel grau
  if (ov > 0) { const g = (a, b) => mix(a, b, night * .85); top = mix(top, g("#8E98A5", "#10121A"), ov * .8); mid = mix(mid, g("#B3BAC3", "#181A24"), ov * .75); hor = mix(hor, g("#C7CCD2", "#22242E"), ov * .6); }
  const skyHor = hor, lt = d * (1 - ov * .5); // Unterwasser: Licht kommt von oben, Himmel färbt nur die Oberfläche
  if (TH === "wasser") { top = mix(mix("#06142C", "#2A8FB8", lt), skyHor, .22 * lt); mid = mix("#040D22", "#176189", lt); hor = mix("#02081A", "#0B3B63", lt); }
  ["sc-s0", "sc-s1", "sc-s2"].forEach((id, i) => document.getElementById(id).setAttribute("stop-color", [top, mid, hor][i]));
  // Luftperspektive: hinten fast Horizontfarbe, vorne dunkel; tagsüber mit Jahreszeit-Ton
  const deep = mix(mix(top, "#05070F", .55), "#05070F", night * .5);
  layerEls.forEach((el, i) => {
    if (TH === "fjord") { const k = +el.dataset.k, j = +el.dataset.j; let c = mix(hor, deep, k); c = mix(c, j === 3 ? "#2A3A2E" : "#4E5868", (.3 + j * .08) * (.4 + .6 * d)); if (j === 3) c = mix(c, "#0E1420", .3 * (.4 + .6 * d)); if (el.dataset.snow) { el.setAttribute("fill", `url(#sc-snow${el.dataset.snow})`); const st = document.querySelector(`#sc-snow${el.dataset.snow} .snowbase`); st.setAttribute("stop-color", c); document.querySelectorAll(`#sc-snow${el.dataset.snow} stop`).forEach((x, jj) => { if (jj < 2) x.setAttribute("stop-color", mix(["#F4F7FB", "#E6ECF3"][jj], hor, .25 + night * .55)); }); } else el.setAttribute("fill", c); el.dataset.c = c; return; }
    if (TH === "wasser") { const c0 = mix(hor, "#010510", +el.dataset.k || .5); const c = el.dataset.tint ? mix(c0, el.dataset.tint, .7 * lt) : el.dataset.sand ? mix(c0, "#CBB984", .62 * lt) : c0; el.setAttribute("fill", c); el.dataset.c = c; return; }
    const k = Math.min(1, .22 + i * (layerEls.length > 5 ? .13 : .19));
    let c = mix(hor, deep, k);
    c = mix(c, se.tint, se.k * 1.8 * d * (.3 + i / 5.5));
    if (TH === "alpen") { if (i <= 1) c = mix(c, "#5E636E", .35 * (.4 + .6 * d)); else if (i === 2) c = mix(c, "#5F8F45", .32 * d); }
    if (el.dataset.snow) { el.setAttribute("fill", `url(#sc-snow${el.dataset.snow})`); const st = document.querySelector(`#sc-snow${el.dataset.snow} .snowbase`); st.setAttribute("stop-color", c); document.querySelectorAll(`#sc-snow${el.dataset.snow} stop`).forEach((x, j) => { if (j < 2) x.setAttribute("stop-color", mix(["#F4F7FB", "#E6ECF3"][j], hor, .25 + night * .55)); }); }
    else { if (i >= 2) c = mix(c, TH === "wald" || TH === "alpen" ? "#0F1C17" : "#0E1420", (.18 + (i - 2) * .14) * (.4 + .6 * d)); el.setAttribute("fill", c); }
    el.dataset.c = c;
  });
  if (L.refl) L.refl.forEach(([c, p]) => c.setAttribute("fill", p.dataset.snow ? `url(#sc-snow${p.dataset.snow})` : p.dataset.c));
  if (L.aurora) { const a = Math.max(0, night - .15) * (1 - ov) * .95; L.aurora.setAttribute("opacity", a.toFixed(2)); L.auroraR.setAttribute("opacity", a.toFixed(2)); }
  if (L.rel) L.rel.forEach(([el, li, k]) => { const base = layerEls[li]?.dataset.c; if (base) el.setAttribute("fill", mix(base, k > 0 ? "#06100A" : "#FFFFFF", Math.abs(k) * (k > 0 ? 1 : .5 + .5 * d))); });
  if (L.col) L.col.forEach(([el, c]) => el.setAttribute("fill", mix(c, "#0A1020", night * .85)));
  leafEls.forEach(([el, li, ci]) => { const base = layerEls[li].dataset.c, pal = se.leaf; el.setAttribute("fill", pal.length ? mix(base, pal[ci % pal.length], (.3 + (li - 2) * .07) * (.08 + .92 * d)) : base); el.setAttribute("opacity", pal.length ? 1 : 0); });
  if (L.festGlow) L.festGlow.forEach(([el, k]) => { if (k < 0) el.setAttribute("opacity", .55 + d * .45); else el.setAttribute("opacity", Math.min(1, (.35 + night * .65) * k)); });
  if (L.festDark && layerEls.length) L.festDark.forEach((el) => el.setAttribute("fill", mix(layerEls[layerEls.length - 1].dataset.c, "#2E6B40", .25 + .45 * d)));
  { const tq = TH === "alpen" ? .45 * d : 0; document.getElementById("sc-lk0").setAttribute("stop-color", mix(mix(hor, "#000000", .1), "#3FB0BE", tq)); document.getElementById("sc-lk1").setAttribute("stop-color", mix(mix(mid, "#000000", .25), "#1F7F8C", tq)); }
  L.shimmer.setAttribute("opacity", TH === "wasser" ? lt * .55 : .25 + d * .35);
  if (TH === "wasser") {
    L.shafts.setAttribute("opacity", (lt * .9).toFixed(2));
    L.plankton.setAttribute("opacity", (night * .9).toFixed(2));
    box.querySelectorAll(".wsurf").forEach((e) => e.setAttribute("fill", mix(top, "#FFFFFF", .35 + .25 * lt)));
    box.querySelectorAll(".kelp").forEach((e) => e.setAttribute("fill", mix(mix(hor, "#010510", .85), "#2E8A5A", .65 * lt)));
    L.anem.setAttribute("opacity", (.35 + .65 * lt).toFixed(2));
  }
  if (L.beam) L.beam.setAttribute("opacity", night > .5 ? .9 : 0);
  const morning = m < 620 ? Math.min(1, (620 - m) / 170) : 0;
  if (L.smoke) { L.smoke.setAttribute("opacity", .55); L.smoke.querySelectorAll("circle").forEach((c) => c.setAttribute("fill", mix(hor, "#FFFFFF", .3 * d))); }
  svg.querySelectorAll(".fogc").forEach((f) => { f.setAttribute("fill", mix(hor, "#FFFFFF", d * .25 + morning * .2)); f.setAttribute("opacity", Math.min(.95, .32 + night * .1 + morning * .4 + W.fog * .5 + ov * .15)); });
  { const stc = mix(mix("#FFFFFF", hor, .35 + (1 - d) * .3), top, night * .7); ["sc-st0", "sc-st1", "sc-st2"].forEach((id) => document.getElementById(id).setAttribute("stop-color", stc)); }
  L.streaks.setAttribute("opacity", TH === "wasser" ? 0 : Math.min(1, .75 - night * .45 + ov * .5));
  // Sonne: Bogen vom Arbeitsbeginn bis Feierabend, geht hinter den Bergen unter
  const p = (m - SC_START) / (SC_END - SC_START);
  const sx = 70 + Math.max(-.15, Math.min(1.15, p)) * (SW - 200), sy = 150 - Math.sin(Math.max(0, Math.min(1, p)) * Math.PI) * 125 + (p > 1 ? (p - 1) * 380 : p < 0 ? -p * 380 : 0);
  const wasser = TH === "wasser";
  [L.sun, L.bloom].forEach((e) => { e.setAttribute("cx", sx); e.setAttribute("cy", wasser ? -24 : sy); });
  if (wasser) L.shafts.setAttribute("transform", `translate(${sx} 0)`);
  const low = p < .15 || p > .8;
  L.sun.setAttribute("fill", low ? "#FFC27A" : "#FFF4D6");
  L.bloom.setAttribute("opacity", (p > -.15 && p < 1.15 ? (low ? 1 : .75) : 0) * (1 - ov * .85)); L.sun.setAttribute("opacity", wasser ? 0 : 1 - ov * .9);
  L.rays.setAttribute("transform", `translate(${sx} ${sy})`);
  L.rays.setAttribute("opacity", wasser ? 0 : (low && p > -.05 && p < 1.05 ? .9 : .25 * d) * (1 - ov));
  // Mond, Sterne
  const starO = m < 420 ? Math.max(0, 1 - (m - 330) / 90) : m > 1010 ? Math.min(1, (m - 1010) / 100) : 0;
  L.stars.setAttribute("opacity", wasser ? 0 : starO * (1 - ov)); L.twinkle.setAttribute("opacity", wasser ? 0 : starO * (1 - ov));
  const mp = m > 960 ? (m - 960) / 450 : (m + 1440 - 960) / 450;
  L.moon.setAttribute("transform", `translate(${160 + Math.min(1, mp) * (SW - 340)} ${36 + Math.abs(mp - .5) * 50})`);
  L.moon.setAttribute("opacity", starO * (1 - ov * .85) * (wasser ? .6 : 1));
  // Lichter im Tal
  const on = m > SC_END - 10 ? Math.min(1, (m - (SC_END - 10)) / 110) : m < SC_START ? Math.max(0, (SC_START - m) / 50) : 0;
  L.lights.forEach(([c, th]) => c.setAttribute("opacity", th < on ? .95 : 0));
  { // Wolken: oben angestrahlt (bei tiefer Sonne warm), unten Schatten; nachts dunkel
    const warm = low && p > -.1 && p < 1.1 ? 1 : 0;
    let lit = mix("#FFFFFF", hor, .12 + warm * .45);
    lit = mix(lit, mix(top, "#3A4060", .35), night * .85);
    const shade = mix(mix(lit, "#7F8AA0", .5), "#1A1D2C", night * .6);
    const set = (id, c) => document.getElementById(id)?.setAttribute("stop-color", c);
    set("sc-c0", lit); set("sc-c1", mix(lit, shade, .35)); set("sc-c2", shade);
    const dTop = mix(mix(W.storm ? "#7E8798" : "#9AA3B2", hor, .12 + warm * .3), "#2C3142", night * .75), dBot = mix(W.storm ? "#2A2F3B" : "#4A5160", "#151824", night * .65);
    set("sc-d0", dTop); set("sc-d1", mix(dTop, dBot, .55)); set("sc-d2", dBot);
    set("sc-du0", mix(dBot, "#000000", .2 * (1 - night))); set("sc-du1", mix(dBot, dTop, .2)); set("sc-du2", mix(dBot, dTop, .55));
    set("sc-lu0", shade); set("sc-lu1", mix(lit, shade, .4));
    set("sc-sh0", mix(dBot, "#C9D2DE", W.snow ? .7 : .25)); set("sc-sh1", dBot);
    box.querySelectorAll(".fogm").forEach((f) => { f.setAttribute("fill", mix(hor, "#FFFFFF", d * .35 + morning * .2)); f.setAttribute("opacity", (W.fog * (.45 + morning * .25)).toFixed(2)); });
    fx.night = night; fx.d = d;
  }
  fxSync();
  // Schrift passend zum Himmel
  const light = lum(mix(top, mid, .5)) > .5 && !W.storm && TH !== "wasser"; // bei Gewitter hängt die dunkle Decke hinter der Schrift
  hdr.style.setProperty("--hfg", light ? "#142030" : "#F6F2FA");
  hdr.style.setProperty("--hfg2", light ? "#34465C" : "#C9C4DA");
  hdr.classList.toggle("sc-light", light);
}

// ---------- Ereignisse (klein, Silhouetten) ----------
const isNight = () => cur < SC_START - 30 || cur > SC_END + 40;
const EV = {
  plane() {
    const y = rnd(24, 70), g = mk("g", {}, L.fx), n = isNight(), c = n ? "#0B0E1E" : "rgb(20 28 44 / .75)";
    mk("rect", { x: -160, y: -.6, width: 156, height: 1.2, fill: "url(#sc-trail)", opacity: n ? .15 : .9 }, g);
    mk("path", { d: "M-1 0 Q-1 -1.4 2 -1.5 H13 Q16 -1.3 16.5 0 Q16 1.2 13 1.3 H2 Q-1 1.3 -1 0Z M5 0.4 L2 4.5 H4.5 L9 .4Z M-.5 -1 L-2.5 -5 H-.2 L3 -1.4Z", fill: c }, g);
    mk("circle", { cx: 8, cy: 1.8, r: .9, fill: "#FF4A4A", class: "blink" }, g);
    if (n) mk("circle", { cx: 16, cy: 0, r: .8, fill: "#fff", class: "blink", style: "animation-delay:.8s" }, g);
    g.animate([{ transform: `translate(-30px, ${y + 10}px)` }, { transform: `translate(${SW + 160}px, ${y - 8}px)` }], { duration: 26000, easing: "linear" }).finished.then(() => g.remove());
  },
  birds() {
    const y = rnd(50, 90), g = mk("g", {}, L.fx), c = isNight() ? "#1A1E36" : "rgb(25 25 35 / .7)";
    [[0, 0], [9, -4], [9, 4], [18, -8], [18, 8], [27, -11], [27, 11]].forEach(([dx, dy], i) => {
      const b = mk("path", { d: "M-4 0 Q-2 -2.6 0 0 Q2 -2.6 4 0", fill: "none", stroke: c, "stroke-width": 1.1, "stroke-linecap": "round", transform: `translate(${dx} ${dy})` }, g);
      b.animate([{ d: "path('M-4 0 Q-2 -2.6 0 0 Q2 -2.6 4 0')" }, { d: "path('M-4 -.6 Q-2 1.4 0 0 Q2 1.4 4 -.6')" }], { duration: 240 + i * 17, iterations: 80, direction: "alternate" });
    });
    g.animate([{ transform: `translate(${SW + 30}px, ${y}px)` }, { transform: `translate(-60px, ${y - 26}px)` }], { duration: 16000, easing: "linear" }).finished.then(() => g.remove());
  },
  star() {
    const g = mk("g", {}, L.fx), x = rnd(260, SW - 140), y = rnd(14, 60);
    mk("path", { d: "M0 0 L70 -26", stroke: "url(#sc-trail)", "stroke-width": 1.4, "stroke-linecap": "round" }, g);
    mk("circle", { r: 1.4, fill: "#fff" }, g);
    g.animate([{ transform: `translate(${x}px, ${y}px)`, opacity: 0 }, { opacity: 1, offset: .15 }, { transform: `translate(${x - 190}px, ${y + 72}px)`, opacity: 0 }], { duration: 1200, easing: "ease-in" }).finished.then(() => g.remove());
  },
  sat() {
    const g = mk("g", {}, L.fx); mk("circle", { r: .8, fill: "#fff" }, g);
    g.animate([{ transform: "translate(-10px, 26px)" }, { transform: `translate(${SW + 10}px, 80px)` }], { duration: 32000, easing: "linear" }).finished.then(() => g.remove());
  },
  reh() {
    if (!layerEls[4] || !L.frontPts) return;
    const q = L.frontPts.find((t) => t[0] >= L.lake[0] - 18) || [L.lake[0] - 18, 196], g = mk("g", {}, L.fx), c = layerEls[4].dataset.c;
    g.setAttribute("transform", `translate(${q[0]} ${q[1] + 1})`);
    const deer = mk("g", {}, g);
    mk("path", { d: "M-6 0 V-4.5 Q-6 -7 -3 -7.2 H3.5 L5.5 -10.5 L7.5 -11 L8 -9.5 L6.5 -8.6 L5 -6.5 V0 H4 V-4 H-4.5 V0Z M6.4 -11 L5.8 -12.6 M7.4 -11 L7.6 -12.8", fill: c, stroke: c, "stroke-width": .6 }, deer);
    deer.animate([{ opacity: 0 }, { opacity: 1, offset: .08 }, { opacity: 1, offset: .9 }, { opacity: 0 }], { duration: 9000, fill: "forwards" }).finished.then(() => g.remove());
    deer.animate([{ transform: "none" }, { transform: "rotate(0)", offset: .3 }, { transform: "translate(0, .6px) rotate(6deg)", offset: .4 }, { transform: "translate(0, .6px) rotate(6deg)", offset: .6 }, { transform: "none", offset: .7 }, { transform: "translateX(-10px)" }], { duration: 9000 });
  },
  feuerwerk() { // Rakete steigt, platzt in Funken, die fallen und verglühen
    const cols = ["#FF5A5A", "#FFD36E", "#7FB8FF", "#FF8FD1", "#9BE29B", "#FFFFFF"], c = cols[Math.floor(Math.random() * cols.length)], c2 = cols[Math.floor(Math.random() * cols.length)];
    const x = rnd(SW * .12, SW * .88), y = rnd(22, 70), g = mk("g", {}, L.fx), rise = 900 + Math.random() * 500;
    const trail = mk("circle", { r: .7, fill: "#FFE7C2" }, g);
    trail.animate([{ transform: `translate(${x + rnd(-10, 10)}px, ${SH - 40}px)`, opacity: .9 }, { transform: `translate(${x}px, ${y}px)`, opacity: 1 }], { duration: rise, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" }).finished.then(() => {
      trail.remove();
      const n = 30 + Math.floor(Math.random() * 14), r0 = rnd(26, 42);
      const flash = mk("circle", { cx: x, cy: y, r: r0 * .9, fill: c, opacity: .35, filter: "url(#sc-blur8)" }, g);
      flash.animate([{ opacity: .45 }, { opacity: 0 }], { duration: 700, fill: "forwards" });
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + rnd(-.08, .08), r = r0 * rnd(.75, 1.05), p = mk("circle", { r: rnd(.8, 1.2), fill: i % 3 ? c : c2 }, g);
        p.animate([{ transform: `translate(${x}px, ${y}px)`, opacity: 1 }, { transform: `translate(${x + Math.cos(a) * r * .8}px, ${y + Math.sin(a) * r * .8}px)`, opacity: 1, offset: .35 }, { transform: `translate(${x + Math.cos(a) * r}px, ${y + Math.sin(a) * r + 14}px)`, opacity: 0 }], { duration: rnd(1500, 2200), easing: "cubic-bezier(.1,.8,.3,1)", fill: "forwards" });
      }
      setTimeout(() => g.remove(), 2600);
    });
  },
  hase() { // hoppelt über die vordere Wiese
    if (!L.frontPts || !layerEls[4]) return;
    const dir = Math.random() < .5 ? 1 : -1, g = mk("g", {}, L.fx), c = mix(layerEls[4].dataset.c, "#8A6A4A", .35);
    const body = mk("g", {}, g);
    mk("path", { d: "M-3.5 0 Q-4.5 -3.4 -1 -3.6 Q2 -3.8 2.6 -2 L3.6 -2.6 L3.4 -6.4 L4.3 -6.6 L4.6 -2.8 L5 -6 L5.8 -5.9 L5.5 -2.4 Q6.4 -1.6 5.4 -.6 L3 0 Z", fill: c }, body);
    mk("circle", { cx: -3.6, cy: -2.2, r: .9, fill: "#F2EDE6" }, body);
    if (dir < 0) body.setAttribute("transform", "scale(-1 1)");
    const kf = [], pts = L.frontPts.filter((q) => q[0] > 0 && q[0] < SW), steps = 22, x0 = dir > 0 ? 30 : SW - 30, x1 = dir > 0 ? SW * .42 : SW * .58;
    for (let i = 0; i <= steps; i++) { const x = x0 + (x1 - x0) * i / steps, q = pts.reduce((m, t) => (Math.abs(t[0] - x) < Math.abs(m[0] - x) ? t : m), pts[0]); kf.push({ transform: `translate(${x}px, ${q[1] + 1 - (i % 2 ? 3 : 0)}px)`, opacity: i === 0 || i === steps ? 0 : 1 }); }
    g.animate(kf, { duration: 7000, easing: "linear", fill: "forwards" }).finished.then(() => g.remove());
  },
  fledermaus() { // flattern im Zickzack über den Abendhimmel
    const g = mk("g", {}, L.fx), y = rnd(30, 80), c = "#120E1C";
    for (let k = 0; k < 3; k++) {
      const b = mk("path", { d: "M0 0 Q-2 -2 -5 -1 Q-3 0 -2.6 1 Q-1 .4 0 1.4 Q1 .4 2.6 1 Q3 0 5 -1 Q2 -2 0 0Z", fill: c, transform: `translate(${k * 14} ${(k % 2) * 8})` }, g);
      b.animate([{ transform: `translate(${k * 14}px, ${(k % 2) * 8}px) scaleY(1)` }, { transform: `translate(${k * 14}px, ${(k % 2) * 8 - 2}px) scaleY(-.6)` }], { duration: 180 + k * 30, iterations: 120, direction: "alternate" });
    }
    const kf = []; for (let i = 0; i <= 12; i++) kf.push({ transform: `translate(${-40 + (SW + 80) * i / 12}px, ${y + Math.sin(i * 1.7) * 14}px)` });
    g.animate(kf, { duration: 14000, easing: "linear" }).finished.then(() => g.remove());
  },
  fische() { // Schwarm kleiner Fische zieht vorbei
    const dir = Math.random() < .5 ? 1 : -1, n = 8 + Math.floor(Math.random() * 9), g = mk("g", {}, L.fx), y0 = rnd(50, SH - 90), night = isNight();
    const pal = [["#C9D6E3", "#8FA3B8"], ["#F2C94C", "#E0A32E"], ["#5DADE2", "#3B7FBF"], ["#F28C6B", "#D9633F"]][Math.floor(Math.random() * 4)];
    for (let i = 0; i < n; i++) {
      const s = rnd(.8, 1.3), x = rnd(-50, 50), y = rnd(-22, 22), f = mk("g", {}, g);
      mk("path", { d: "M-4 0 Q-1.5 -2.6 2.2 -1.8 Q4.2 -1 4.6 0 Q4.2 1 2.2 1.8 Q-1.5 2.6 -4 0Z M-4 0 L-6.5 -2.2 L-6 0 L-6.5 2.2Z", fill: night ? "#0A1530" : pal[i % 3 ? 0 : 1], transform: `translate(${x} ${y}) scale(${s * dir} ${s})` }, f);
      if (!night) mk("circle", { cx: x + 2.6 * s * dir, cy: y - .5 * s, r: .45 * s, fill: "#1B2430" }, f);
      f.animate([{ transform: "translateY(0)" }, { transform: `translateY(${rnd(2, 5)}px)` }], { duration: rnd(900, 1600), iterations: Infinity, direction: "alternate", easing: "ease-in-out" });
    }
    const kf = []; for (let i = 0; i <= 10; i++) kf.push({ transform: `translate(${dir > 0 ? -80 + (SW + 160) * i / 10 : SW + 80 - (SW + 160) * i / 10}px, ${y0 + Math.sin(i * 1.3) * 18}px)` });
    g.animate(kf, { duration: rnd(16000, 24000), easing: "linear" }).finished.then(() => g.remove());
  },
  schildkroete() { // Meeresschildkröte paddelt gemächlich durch
    const dir = Math.random() < .5 ? 1 : -1, g = mk("g", {}, L.fx), night = isNight(), c = night ? "#0A1530" : "#4E8F6A", c2 = night ? "#0A1530" : "#3B6E52";
    const b = mk("g", { transform: `scale(${dir} 1)` }, g);
    const fl = mk("path", { d: "M-6 -6 Q-12 -15 -2 -12 Q3 -10 4 -7Z M-6 6 Q-12 15 -2 12 Q3 10 4 7Z M-12 -3 Q-16 -5 -15 -1Z M-12 3 Q-16 5 -15 1Z", fill: c2 }, b);
    fl.animate([{ transform: "rotate(-10deg)" }, { transform: "rotate(10deg)" }], { duration: 1900, iterations: Infinity, direction: "alternate", easing: "ease-in-out" });
    mk("path", { d: "M12 -1 Q18 -4 20 -1 Q18 3 12 2Z", fill: c2 }, b);
    mk("path", { d: "M-12 0 Q-12 -9 0 -9 Q12 -9 12 0 Q12 7 0 7 Q-12 7 -12 0Z", fill: c }, b);
    if (!night) { mk("path", { d: "M-8 -3 Q0 -7 8 -3 M-9 1 Q0 -3 9 1 M-7 4 Q0 1 7 4", stroke: c2, "stroke-width": .7, fill: "none" }, b); mk("circle", { cx: 17.5, cy: -1.5, r: .7, fill: "#1B2430" }, b); }
    const y0 = rnd(40, SH - 100), kf = []; for (let i = 0; i <= 12; i++) kf.push({ transform: `translate(${dir > 0 ? -40 + (SW + 80) * i / 12 : SW + 40 - (SW + 80) * i / 12}px, ${y0 + Math.sin(i * .9) * 10}px)` });
    g.animate(kf, { duration: rnd(38000, 50000), easing: "linear" }).finished.then(() => g.remove());
  },
  hai() { // Hai weit hinten, nur Silhouette
    const dir = Math.random() < .5 ? 1 : -1, g = mk("g", {}, L.fx), c = mix(isNight() ? "#05091A" : "#0F2A48", "#000000", .2);
    const b = mk("path", { d: "M-18 0 Q-10 -5 4 -4 Q10 -3.6 15 0 Q10 3 4 3.5 Q-10 4 -18 0Z M-3 -4 L1 -14 L6 -4Z M-18 0 L-25 -8 L-21 0 L-25 7Z M6 3 L8 8 L11 3Z", fill: c, opacity: .8, transform: `scale(${dir} 1)` }, g);
    b.animate([{ transform: `scale(${dir} 1) rotate(0deg)` }, { transform: `scale(${dir} 1) rotate(3deg)` }], { duration: 1400, iterations: Infinity, direction: "alternate", easing: "ease-in-out" });
    const y0 = rnd(30, 90), kf = []; for (let i = 0; i <= 8; i++) kf.push({ transform: `translate(${dir > 0 ? -40 + (SW + 80) * i / 8 : SW + 40 - (SW + 80) * i / 8}px, ${y0 + Math.sin(i * .8) * 6}px)` });
    g.animate(kf, { duration: rnd(26000, 34000), easing: "linear" }).finished.then(() => g.remove());
  },
  quallen() { // Quallen steigen langsam auf, nachts leuchten sie
    const n = 2 + Math.floor(Math.random() * 3), night = isNight();
    for (let i = 0; i < n; i++) {
      const g = mk("g", {}, L.fx), x = rnd(SW * .08, SW * .92), s = rnd(.8, 1.5), c = ["#F7A8D8", "#A8E6F7", "#C9B6FF"][i % 3];
      if (night) mk("circle", { r: 15, cy: -4, fill: c, opacity: .3, filter: "url(#sc-blur5)" }, g);
      for (let k = 0; k < 5; k++) { const t = mk("path", { d: `M${-6 + k * 3} 0 q${rnd(-3, 3)} 8 ${rnd(-2, 2)} 16`, stroke: c, "stroke-width": .5, fill: "none", opacity: .7 }, g); t.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(.78)" }], { duration: 1800, iterations: Infinity, direction: "alternate", easing: "ease-in-out", delay: k * 120 }); }
      const bell = mk("path", { d: "M-9 0 Q-9 -11 0 -11 Q9 -11 9 0 Q4 2 0 1 Q-4 2 -9 0Z", fill: c, opacity: night ? .9 : .6 }, g);
      bell.animate([{ transform: "scale(1 1)" }, { transform: "scale(1.12 .86)" }], { duration: 1800, iterations: Infinity, direction: "alternate", easing: "ease-in-out" });
      const kf = []; for (let j = 0; j <= 10; j++) kf.push({ transform: `translate(${x + Math.sin(j * 1.1 + i) * 25}px, ${SH + 20 - (SH + 60) * j / 10}px) scale(${s})`, opacity: j === 0 || j === 10 ? 0 : 1 });
      g.animate(kf, { duration: rnd(30000, 44000), delay: i * 2500, easing: "linear", fill: "both" }).finished.then(() => g.remove());
    }
  },
  wal() { // Wal taucht kurz auf, bläst und verschwindet wieder
    if (!L.fjordHZ) return;
    const HZ = L.fjordHZ, x = rnd(SW * .3, SW * .8), y = HZ + 6 + Math.random() * 12, s = .6 + (y - HZ) / 18, g = mk("g", {}, L.fx), c = mix("#1C2636", "#000", .2);
    const back = mk("path", { d: "M-30 0 Q-20 -9 -4 -10 Q6 -10.5 10 -8 L12 -14 L15 -7 Q24 -4 30 0Z", fill: c, transform: `translate(${x} ${y}) scale(${s})` }, g);
    back.style.transformBox = "view-box"; back.style.transformOrigin = `${x}px ${y}px`;
    back.animate([{ transform: `translate(${x}px, ${y}px) scale(${s}, 0)` }, { transform: `translate(${x}px, ${y}px) scale(${s}, ${s})`, offset: .3 }, { transform: `translate(${x + 10}px, ${y}px) scale(${s}, ${s})`, offset: .6 }, { transform: `translate(${x + 20}px, ${y}px) scale(${s}, 0)` }], { duration: 7000, easing: "ease-in-out", fill: "forwards" });
    setTimeout(() => { for (let i = 0; i < 6; i++) { const p = mk("circle", { r: 1.2 + Math.random(), fill: "#fff", opacity: .7 }, g); p.animate([{ transform: `translate(${x - 2 * s}px, ${y - 9 * s}px)`, opacity: .8 }, { transform: `translate(${x - 2 * s + (Math.random() - .5) * 14 * s}px, ${y - (22 + Math.random() * 10) * s}px)`, opacity: 0 }], { duration: 1400 + i * 120, easing: "ease-out", fill: "forwards" }); } }, 2100);
    setTimeout(() => g.remove(), 7600);
  },
  leaf() { // Blätter lösen sich aus einer Baumkrone, flattern im Wind und landen am Boden
    if (!SEASON[season].leaves && season !== "fruehling") return;
    const pal = SEASON[season].leaves ? SEASON.herbst.leaf : ["#F7D6E0", "#FFFFFF", "#F2B6C6"];
    const trees = L.crownPts.filter((t) => t[3] >= 3); if (!trees.length) return;
    const wind = rnd(.4, 1.2) * (Math.random() < .75 ? 1 : -1); // meist leichter Westwind
    for (let n = 0, cnt = 2 + Math.floor(rnd(0, 4)); n < cnt; n++) {
      const [tx, ty, th, li] = trees[Math.floor(Math.random() * trees.length)];
      const sz = li === 4 ? rnd(1.6, 2.4) : rnd(1.1, 1.6), x0 = tx + rnd(-th * .3, th * .3), y0 = ty + rnd(-th * .2, th * .2);
      const fall = rnd(26, 46) * (li === 4 ? 1 : .7), dur = rnd(5500, 9000), ph = rnd(0, 6.28), sway = rnd(4, 9), spin = rnd(1.5, 3.5) * (Math.random() < .5 ? -1 : 1);
      const col = pal[Math.floor(Math.random() * pal.length)];
      const l = mk("path", { d: `M0 ${-sz} Q${sz * 1.1} ${-sz * .2} 0 ${sz} Q${-sz * 1.1} ${-sz * .2} 0 ${-sz}Z M0 ${sz} L0 ${sz * 1.5}`, fill: col, stroke: col, "stroke-width": .3 }, L.fx);
      const kf = [];
      for (let i = 0; i <= 16; i++) {
        const k = i / 16, e = k * k * (3 - 2 * k) * .35 + k * .65; // erst zögerlich, dann gleichmäßig
        const x = x0 + wind * k * 55 + Math.sin(ph + k * 9) * sway * Math.min(1, k * 4), y = y0 + e * fall + Math.cos(ph + k * 9) * 1.5 * k;
        kf.push({ transform: `translate(${x}px, ${y}px) rotate(${Math.sin(ph + k * 9) * 50 + spin * k * 180}deg) scaleX(${Math.cos(ph * 2 + k * 14).toFixed(2)})`, opacity: k < .06 ? k / .06 : k > .85 ? (1 - k) / .15 : 1 });
      }
      l.animate(kf, { duration: dur, delay: n * rnd(400, 1500), easing: "linear", fill: "both" }).finished.then(() => l.remove());
    }
  },
};
function randomEvent() { const nat = TH === "wald" || TH === "alpen", F = fest(); const pool = TH === "fjord" ? (isNight() ? ["star", "star", "sat", "wal"] : ["birds", "birds", "plane", "wal", "wal"]) : TH === "wasser" ? (isNight() ? ["quallen", "quallen", "fische", "hai"] : ["fische", "fische", "fische", "schildkroete", "hai", "quallen"]) : isNight() ? ["star", "star", "sat", "plane", ...(nat ? ["reh"] : []), ...(F.halloween ? ["fledermaus", "fledermaus", "fledermaus"] : [])] : ["plane", "plane", "birds", "birds", ...(nat ? ["reh", "leaf"] : []), ...(F.ostern && nat ? ["hase", "hase", "hase"] : [])]; EV[pool[Math.floor(Math.random() * pool.length)]](); }


// ---------- Wetter (Open-Meteo, kein Konto, nur fester Ort Nufringen) ----------
// Stärke nach der echten Niederschlagsmenge (mm der letzten 15 Min), nicht nur nach dem Wettercode:
// der meldet oft „Regen“ oder „Gewitter“, obwohl draußen kaum was fällt. Ohne Menge (alter Cache, Testmodus) zählt der Code.
function applyWeather(code, cover, mm) {
  const c = +code || 0, has = typeof mm === "number" && isFinite(mm);
  W.cover = Math.max(0, Math.min(1, (+cover || 0) / 100));
  const wet = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(c), drizzle = c >= 51 && c <= 57;
  const byCode = [55, 57, 65, 67, 82, 95, 96, 99].includes(c) ? 1 : [53, 63, 81].includes(c) ? .6 : .3;
  const byMm = mm <= 0 ? .08 : mm < .1 ? .15 : mm < .3 ? .3 : mm < .8 ? .55 : 1;
  W.rain = wet ? (has ? Math.min(byMm, drizzle ? .2 : 1) : byCode) : 0;
  const snowy = [71, 73, 75, 77, 85, 86].includes(c);
  W.snow = snowy ? (has ? (mm <= 0 ? .2 : mm < .3 ? .45 : 1) : [75, 86].includes(c) ? 1 : .55) : 0;
  W.fog = [45, 48].includes(c) ? 1 : 0;
  W.storm = c >= 95 && (!has || mm >= .3); // Blitze nur, wenn es auch richtig regnet
}
async function loadWeather(force) {
  const test = store.get("erledigt-wetter-test", ""); // zum Ausprobieren: "regen", "schnee", "gewitter", "nebel", "wolken"
  if (test) { applyWeather({ sonne: 0, regen: 63, schnee: 73, gewitter: 95, nebel: 45, wolken: 3 }[test] || 0, { sonne: 0, wolken: 90 }[test] ?? 70); return; }
  const pl = placeNow(), key = pl.lat.toFixed(2) + "," + pl.lon.toFixed(2), day = iso(todayD());
  const cache = store.get("erledigt-wetter", null), fresh = cache && cache.key === key && cache.day === day;
  const useCache = (c) => { applyWeather(c.code, c.cover, c.mm); W.sunrise = c.sr || 0; W.sunset = c.ss || 0; };
  if (fresh && !force && Date.now() - cache.t < 30 * 60e3) { useCache(cache); return; }
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pl.lat}&longitude=${pl.lon}&current=weather_code,cloud_cover,precipitation&daily=sunrise,sunset&forecast_days=1&timezone=auto`);
    const j = await r.json(), cur = j.current || {}, toMin = (t) => { const m = String(t || "").match(/T(\d\d):(\d\d)/); return m ? +m[1] * 60 + +m[2] : 0; };
    const c = { t: Date.now(), key, day, code: cur.weather_code, cover: cur.cloud_cover, mm: cur.precipitation, sr: toMin(j.daily?.sunrise?.[0]), ss: toMin(j.daily?.sunset?.[0]) };
    store.set("erledigt-wetter", c); useCache(c);
  } catch { if (cache) useCache(cache); }
}

// ---------- Uhr, Ereignisse, Ein/Aus ----------
function placeNow() { try { const p = design.place; if (p && isFinite(p.lat) && isFinite(p.lon)) return p; } catch {} return { name: "Nufringen", lat: 48.62, lon: 8.89 }; }
function minuteNow() {
  // Sonne nach echtem Sonnenauf- und -untergang am Wetter-Ort – in Arbeit und Privat gleich
  const n = new Date();
  SC_START = W.sunrise || 450; SC_END = Math.max(W.sunset || 1020, SC_START + 60);
  return Math.max(300, Math.min(1410, n.getHours() * 60 + n.getMinutes()));
}
// Filmkorn einmal als Bild erzeugen
try { const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d"), im = g.createImageData(128, 128); for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 26; } g.putImageData(im, 0, 0); box.querySelector(".sc-grain").style.backgroundImage = `url(${c.toDataURL()})`; } catch {}
let lastPk = "";

// ---------- Regen, Schnee, Blitze: Canvas mit Tiefe, Wind und Böen ----------
const fx = { parts: [], splash: [], bolt: null, raf: 0, last: 0, w: 0, h: 0, dpr: 1, night: 0, d: 1, nextBolt: 0, t: 0 };
const fxg = fxc.getContext("2d");
function fxSize() {
  const r = box.getBoundingClientRect(), dpr = Math.min(1.5, devicePixelRatio || 1);
  if (!r.width || !r.height) return false;
  if (Math.round(r.width) !== fx.w || Math.round(r.height) !== fx.h || dpr !== fx.dpr) { fx.w = Math.round(r.width); fx.h = Math.round(r.height); fx.dpr = dpr; fxc.width = fx.w * dpr; fxc.height = fx.h * dpr; fx.parts = []; }
  return true;
}
const fxActive = () => on && TH !== "wasser" && (W.rain || W.snow || W.storm) && !document.hidden && !reduce.matches && !document.body.classList.contains("idle") && !document.body.classList.contains("sc-pause");
function spawn(top) {
  const z = .25 + Math.random() * .75, snow = !!W.snow && !(W.rain && Math.random() < .5);
  return { x: Math.random() * (fx.w + 120) - 60, y: top ? Math.random() * fx.h : -20 - Math.random() * 40, z, snow, ph: Math.random() * 6.28, f: .6 + Math.random() * 1.2 };
}
function fxSync() {
  if (!fxActive()) { if (fx.raf) { cancelAnimationFrame(fx.raf); fx.raf = 0; } if (fx.w) fxg.clearRect(0, 0, fxc.width, fxc.height); fx.parts = []; return; }
  if (!fx.raf) { fx.last = performance.now(); fx.raf = requestAnimationFrame(fxStep); }
}
function makeBolt() {
  // Blitz: zickzack von der Wolkenunterseite bis zu den Bergen, mit Verästelungen
  const segs = [], x0 = fx.w * (.1 + Math.random() * .8), y1 = fx.h * (.5 + Math.random() * .25);
  const branch = (x, y, len, ang, depth) => {
    let px = x, py = y; const steps = Math.round(len / 9);
    for (let i = 0; i < steps; i++) {
      const nx = px + Math.sin(ang) * 10 + (Math.random() - .5) * 18, ny = py + Math.cos(ang) * 10;
      segs.push([px, py, nx, ny, depth]); px = nx; py = ny;
      if (depth < 2 && Math.random() < .09) branch(px, py, len * (.25 + Math.random() * .3), ang + (Math.random() < .5 ? -1 : 1) * (.4 + Math.random() * .6), depth + 1);
    }
  };
  branch(x0, fx.h * .2, y1 - fx.h * .2, (Math.random() - .5) * .3, 0);
  return { segs, x: x0, t0: performance.now(), dur: 520 };
}
function fxStep(now) {
  fx.raf = 0;
  if (!fxActive() || !fxSize()) { fxSync(); return; }
  const dt = Math.min(.05, (now - fx.last) / 1000); fx.last = now; fx.t += dt;
  const { w, h } = fx, g = fxg;
  g.setTransform(fx.dpr, 0, 0, fx.dpr, 0, 0); g.clearRect(0, 0, w, h);
  // Böen: Stärke und Wind schwanken langsam
  const gust = .75 + .25 * Math.sin(fx.t * .45) + .12 * Math.sin(fx.t * 1.7 + 1), wind = (W.storm ? .32 : .16) * gust + .05 * Math.sin(fx.t * .3);
  const amt = Math.max(W.rain, W.snow * .9, W.storm ? .7 : 0);
  const target = Math.round((w * h) / (W.snow && !W.rain ? 2600 : 1500) * amt * gust);
  while (fx.parts.length < target) fx.parts.push(spawn(fx.parts.length < target * .6 && fx.t < .2));
  if (fx.parts.length > target + 20) fx.parts.length = target;
  const dim = 1 - fx.night * .55, ground = h * .86;
  g.lineCap = "round";
  for (const q of fx.parts) {
    if (q.snow) {
      const vy = (18 + q.z * 46) * (W.storm ? 1.4 : 1);
      q.y += vy * dt; q.x += (wind * 90 * q.z + Math.sin(fx.t * q.f + q.ph) * 14 * q.z) * dt;
      const r = .5 + q.z * q.z * 2.4;
      g.globalAlpha = (.35 + q.z * .6) * dim;
      g.fillStyle = "#FFFFFF";
      g.beginPath(); g.arc(q.x, q.y, r, 0, 6.283); g.fill();
      if (q.z > .85) { g.globalAlpha = .12 * dim; g.beginPath(); g.arc(q.x, q.y, r * 2.4, 0, 6.283); g.fill(); } // nahe Flocken unscharf
    } else {
      const sp = (420 + q.z * 760) * (W.storm ? 1.15 : 1), vx = wind * sp;
      q.y += sp * dt; q.x += vx * dt;
      const len = 7 + q.z * 17;
      g.globalAlpha = (.12 + q.z * .38) * dim * (.7 + W.rain * .3);
      g.strokeStyle = fx.night > .5 ? "#9FB0C8" : "#E4ECF6"; g.lineWidth = .5 + q.z * .8;
      g.beginPath(); g.moveTo(q.x, q.y); g.lineTo(q.x - vx / sp * len, q.y - len); g.stroke();
      if (q.z > .7 && q.y > ground + (q.ph / 6.28) * (h - ground)) { fx.splash.push({ x: q.x, y: q.y, t: 0, z: q.z }); q.y = h + 99; }
    }
    if (q.y > h + 10 || q.x < -80 || q.x > w + 80) Object.assign(q, spawn(false));
  }
  // Spritzer am Boden
  g.strokeStyle = fx.night > .5 ? "#9FB0C8" : "#E4ECF6";
  fx.splash = fx.splash.filter((sp) => {
    sp.t += dt; const k = sp.t / .22; if (k >= 1) return false;
    g.globalAlpha = (1 - k) * .5 * sp.z * dim; g.lineWidth = .6;
    const r = 1.5 + k * 4 * sp.z;
    g.beginPath(); g.ellipse(sp.x, sp.y, r, r * .35, 0, Math.PI, 0); g.stroke();
    return true;
  });
  // Gewitter
  if (W.storm) {
    if (!fx.nextBolt) fx.nextBolt = now + 2500 + Math.random() * 4000;
    if (now > fx.nextBolt && !fx.bolt) { fx.bolt = makeBolt(); fx.nextBolt = now + 5000 + Math.random() * 11000; }
    if (fx.bolt) {
      const k = (now - fx.bolt.t0) / fx.bolt.dur;
      if (k >= 1) { fx.bolt = null; flashEl.style.opacity = 0; box.classList.remove("sc-lit"); }
      else {
        const fl = k < .12 ? 1 : k < .22 ? .25 : k < .34 ? .9 : k < .45 ? .15 : (1 - k) * .6; // Flackern wie echt
        g.globalAlpha = fl; g.shadowColor = "#AFC0FF"; g.shadowBlur = 18;
        for (const [x1, y1, x2, y2, dpt] of fx.bolt.segs) { g.strokeStyle = dpt ? "#D4DCFF" : "#FFFFFF"; g.lineWidth = dpt ? 1 / dpt : 2.4; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); }
        g.shadowBlur = 0;
        flashEl.style.background = `radial-gradient(ellipse at ${fx.bolt.x}px 20%, rgb(220 228 255 / .9), rgb(200 210 255 / .25) 45%, transparent 75%)`;
        flashEl.style.opacity = (fl * (.35 + fx.night * .3)).toFixed(2);
        box.classList.toggle("sc-lit", fl > .5);
      }
    }
  } else fx.nextBolt = 0;
  g.globalAlpha = 1;
  fx.raf = requestAnimationFrame(fxStep);
}
document.addEventListener("visibilitychange", () => fxSync());
new MutationObserver(() => fxSync()).observe(document.body, { attributes: true, attributeFilter: ["class"] });
// ---------- Leistung: Himmel hält an, solange man ihn nicht sieht ----------
// Weggescrollt oder von einem Fenster/den Details verdeckt → alle Himmel-Animationen pausieren (CSS über body.sc-pause, der Rest hier).
// Vorher lief alles weiter und wurde bei jedem Bild neu gezeichnet – auch unter dem Milchglas der Fenster. Das war der größte Ruckler am Handy und Mac.
let scSeen = true, scPaused = false;
const SC_COVER = ".overlay:not([hidden]), .drawer:not([hidden]), .search:not([hidden]), .auth:not([hidden]), .upd-screen:not([hidden])";
function scPauseSync() {
  const b = document.body.classList, p = !scSeen || (!b.contains("fokus") && !!document.querySelector(SC_COVER));
  const all = p || b.contains("idle");
  if (p !== b.contains("sc-pause")) b.toggle("sc-pause", p);
  if (all === scPaused) return;
  scPaused = all;
  try { for (const a of box.getAnimations({ subtree: true })) { if (typeof CSSAnimation !== "undefined" && a instanceof CSSAnimation) continue; if (all) a.pause(); else if (a.playState === "paused") a.play(); } } catch {}
}
try { new IntersectionObserver((es) => { scSeen = es[es.length - 1].isIntersecting; scPauseSync(); }).observe(box); } catch {}
let scPT = 0; const scPauseSoon = () => { if (!scPT) scPT = setTimeout(() => { scPT = 0; scPauseSync(); }, 0); };
new MutationObserver(scPauseSoon).observe(document.body, { attributes: true, attributeFilter: ["hidden"], subtree: true, childList: true }); // Fenster/Details gehen auf oder zu
new MutationObserver(scPauseSoon).observe(document.body, { attributes: true, attributeFilter: ["class"] }); // Fokus-Modus, Fenster inaktiv
let built = false, on = false, tick = 0, evT = 0, leafT = 0, fwT = 0;
const quiet = () => document.hidden || reduce.matches || document.body.classList.contains("sc-pause"); // Ereignisse auch, wenn Erledigt sichtbar, aber nicht aktiv ist – nur nicht minimiert/verdeckt
let lastEv = 0;
const fire = (name) => { lastEv = Date.now(); EV[name](); };
function nextEvent() { clearTimeout(evT); evT = setTimeout(() => { if (on && !quiet()) { lastEv = Date.now(); randomEvent(); } nextEvent(); }, (180 + Math.random() * 180) * 1000); }
window.addEventListener("focus", () => { if (on && !quiet() && Date.now() - lastEv > 300000) setTimeout(() => { lastEv = Date.now(); randomEvent(); }, 1500); });
function measure() { const w = box.clientWidth, h = box.clientHeight; return w && h ? Math.max(700, Math.min(2600, Math.round(SH * w / h))) : SW; }
let seasonTest = null, playing = 0;
function refresh() { if (!on || playing) return; const s = seasonTest || realSeason(), nw = measure(); if (s !== season || !built || theme() !== TH || Math.abs(nw - SW) > 30 || JSON.stringify(fest()) !== L.festKey) { season = s; SW = nw; build(); built = true; } else if (wKey() !== wxKey) buildClouds(); draw(minuteNow()); }
let rsT = 0; try { new ResizeObserver(() => { clearTimeout(rsT); rsT = setTimeout(() => { if (on && Math.abs(measure() - SW) > 30) refresh(); }, 250); }).observe(box); } catch {}
sceneSync = () => {
  const want = !!design.w.scene;
  const hoch = scHoch() ? 300 : 210; if (built && hoch !== SH) built = false;
  document.body.classList.toggle("has-scene", want); document.body.classList.toggle("scene-flach", want && hoch === 210);
  if (typeof syncTitlebar === "function") syncTitlebar();
  const pk = JSON.stringify(placeNow());
  if (want === on) { if (on) { refresh(); if (pk !== lastPk) { lastPk = pk; loadWeather(true).then(refresh); } } return; }
  lastPk = pk;
  on = want;
  clearInterval(tick); clearTimeout(evT); clearInterval(leafT); clearInterval(fwT);
  if (!on) { svg.innerHTML = ""; built = false; fxSync(); return; }
  refresh();
  loadWeather().then(refresh);
  tick = setInterval(() => { refresh(); if (new Date().getMinutes() % 30 === 0) loadWeather().then(refresh); }, 60000);
  nextEvent();
  leafT = setInterval(() => { if (on && !document.hidden && !quiet() && SEASON[season].leaves && Math.random() < .35) EV.leaf(); }, 60000);
  clearInterval(fwT); fwT = setInterval(() => { if (on && !document.hidden && !quiet() && fest().feuerwerk && isNight() && Math.random() < .7) EV.feuerwerk(); }, 2600);
  setTimeout(() => { if (on && !quiet()) fire(TH === "wasser" ? "fische" : isNight() ? "star" : "plane"); }, 4000);
};
// Test-Werkzeuge fürs Design-Menü
const skyTest = {
  weather(name) { store.set("erledigt-wetter-test", name === "echt" ? "" : name); W.cover = W.rain = W.snow = W.fog = 0; W.storm = false; loadWeather(name === "echt").then(refresh); },
  season(name) { seasonTest = name === "echt" ? null : name; built = false; refresh(); },
  fest(name) { festTest = name === "echt" ? null : name; built = false; refresh(); if (festTest === "silvester") [0, 700, 1500].forEach((t) => setTimeout(() => EV.feuerwerk(), t)); if (festTest === "ostern") setTimeout(() => EV.hase(), 400); if (festTest === "halloween") setTimeout(() => EV.fledermaus(), 400); },
  event() { if (on) randomEvent(); },
  day() { // ganzer Tag in 15 Sekunden
    if (!on) return; cancelAnimationFrame(playing); const t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / 15000), m = Math.round(300 + k * 1110); draw(m); if (k < 1) playing = requestAnimationFrame(step); else { playing = 0; refresh(); } };
    playing = requestAnimationFrame(step);
  },
  state: () => ({ weather: store.get("erledigt-wetter-test", "") || "echt", season: seasonTest || "echt", fest: festTest || "echt" }),
};
window.__scene = { house: () => L.house, bolt: () => { fx.bolt = makeBolt(); }, EV, skyTest, reloadWeather: () => loadWeather(true).then(refresh), sw: () => SW, draw: (m) => draw(m), weather: (c, cv) => { applyWeather(c, cv); refresh(); }, season: (s) => { season = s; build(); draw(minuteNow()); } }; // für Tests
sceneSync();
})();

// ===== 09c-einrichtung.js =====
// ======================================================================
// ---------- Einrichtung: Name, Modus (Arbeit/Privat), Arbeitszeit, Wetter-Ort ----------
// ======================================================================
// Kommt beim ersten Start (neue Installation oder Mac) und beim Umschalten auf Privat.
// Später jederzeit über Design-Menü → „Einrichtung“.
function openSetup() {
  if (MINI) return;
  let ov = $("setup-overlay");
  if (!ov) { ov = document.createElement("div"); ov.className = "overlay"; ov.id = "setup-overlay"; document.body.appendChild(ov); }
  const pl = design.place || { name: "Nufringen", lat: 48.62, lon: 8.89 }, noJob = !feierabendAt();
  ov.innerHTML = `<div class="ach-modal setup" role="dialog" aria-label="Einrichtung">
    <header><h2>Kurz einrichten</h2><button type="button" class="x" id="setup-x" aria-label="Schließen">×</button></header>
    <label class="su-row"><span>Dein Vorname</span><input id="su-name" maxlength="40" value="${esc(design.name || "")}"></label>
    <div class="su-row"><span>Wofür nutzt du Erledigt?</span><div class="opt-row" role="group" id="su-mode">
      <button type="button" data-su-mode="arbeit" aria-pressed="${!privMode()}">Arbeit</button><button type="button" data-su-mode="privat" aria-pressed="${privMode()}">Privat</button></div>
      <small>Privat: Listen Privat, Haushalt, Einkaufen, Termine · Alltagssprüche · keine Mail-Funktionen</small></div>
    <div class="su-row"><span>Arbeitszeit</span><div class="su-time"><input type="time" id="su-von" value="${arbeitsbeginn()}" ${noJob ? "disabled" : ""}> bis <input type="time" id="su-bis" value="${feierabendAt() || "16:30"}" ${noJob ? "disabled" : ""}>
      <label class="su-check"><input type="checkbox" id="su-nojob" ${noJob ? "checked" : ""}> Ich arbeite nicht (kein Feierabend-Countdown)</label></div></div>
    <label class="su-row"><span>Bundesland (für Feiertage im Kalender)</span><select id="su-state">${STATES.map(([k, n]) => `<option value="${k}" ${(design.state || "BW") === k ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    <div class="su-row"><span>Wetter-Ort für den Himmel</span><div class="su-place"><input id="su-ort" placeholder="Stadt suchen …" value=""><button type="button" class="chip-btn" id="su-find">Suchen</button></div>
      <small id="su-cur">Aktuell: <b>${esc(pl.name)}</b></small><div class="su-hits" id="su-hits"></div></div>
    <div class="su-acts"><button type="button" class="primary" id="su-save">Speichern</button></div>
  </div>`;
  ov.dataset.place = JSON.stringify(pl);
  ov.dataset.mode = privMode() ? "privat" : "arbeit";
  ov.hidden = false;
  setTimeout(() => $("su-name")?.focus(), 50);
}
async function setupFind() {
  const q = $("su-ort").value.trim(); if (!q) return;
  $("su-hits").innerHTML = "<small>Suche …</small>";
  try {
    const j = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=de&format=json`)).json();
    const r = j.results || [];
    $("su-hits").innerHTML = r.length ? r.map((x) => `<button type="button" class="chip-btn" data-su-place='${esc(JSON.stringify({ name: x.name, lat: +x.latitude.toFixed(3), lon: +x.longitude.toFixed(3) }))}'>${esc(x.name)}<small> ${esc([x.admin1, x.country].filter(Boolean).join(", "))}</small></button>`).join("") : "<small>Nichts gefunden – anders schreiben?</small>";
  } catch { $("su-hits").innerHTML = "<small>Keine Verbindung zur Ortssuche.</small>"; }
}
document.addEventListener("click", (e) => {
  const ov = $("setup-overlay"); if (!ov || ov.hidden || !ov.contains(e.target)) return;
  if (e.target.id === "setup-x" || e.target === ov) { ov.hidden = true; store.set("erledigt-setup-done", true); return; }
  const m = e.target.closest("[data-su-mode]");
  if (m) { ov.dataset.mode = m.dataset.suMode; ov.querySelectorAll("[data-su-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b === m))); return; }
  if (e.target.id === "su-find") { setupFind(); return; }
  const p = e.target.closest("[data-su-place]");
  if (p) { ov.dataset.place = p.dataset.suPlace; $("su-cur").innerHTML = `Gewählt: <b>${esc(JSON.parse(p.dataset.suPlace).name)}</b>`; $("su-hits").innerHTML = ""; return; }
  if (e.target.id === "su-save") {
    design.name = $("su-name").value.trim().slice(0, 40);
    design.mode = ov.dataset.mode === "privat" ? "privat" : "arbeit";
    design.state = $("su-state").value || "BW";
    try { design.place = JSON.parse(ov.dataset.place); } catch {}
    if ($("su-nojob").checked) store.set("erledigt-feierabend", "");
    else { const v = $("su-von").value, b = $("su-bis").value; if (/^\d{2}:\d{2}$/.test(v)) store.set("erledigt-arbeitsbeginn", v); store.set("erledigt-feierabend", /^\d{2}:\d{2}$/.test(b) ? b : "16:30"); }
    store.set("erledigt-setup-done", true);
    ov.hidden = true;
    lastTodayHtml = ""; lastDayHtml = null;
    designChanged(); renderDay();
    window.__scene?.reloadWeather?.(); loadWeek(true);
    showBadge("Eingerichtet", design.mode === "privat" ? "Privat-Modus ist an." : "Alles gespeichert.", "star");
  }
});
document.addEventListener("change", (e) => { if (e.target.id === "su-nojob") { $("su-von").disabled = $("su-bis").disabled = e.target.checked; } });
document.addEventListener("keydown", (e) => { if (e.target.id === "su-ort" && e.key === "Enter") { e.preventDefault(); setupFind(); } });

// Beim ersten Start fragen: neue Installation oder Mac (dort läuft Erledigt meist für jemand anderen)
(() => {
  if (MINI || store.get("erledigt-setup-done", false)) return;
  const fresh = store.get("erledigt-last-version", null) === null;
  if (!fresh && window.desktop?.platform !== "darwin") { store.set("erledigt-setup-done", true); return; } // bestehende Installation (Nils): nicht stören
  const wait = setInterval(() => { if (loaded && !anyOverlay()) { clearInterval(wait); openSetup(); } }, 1500);
})();

// ===== 09d-kopf-wetter.js =====
// ======================================================================
// ---------- Kopfbereich: Feierabend-Zeile, Kalender-Knopf, Wetter ----------
// ======================================================================
// Der Kopfbereich (#hero) steht fest in index.html. Hier kommen nur die Inhalte rein.

// Feierabend als ruhige Zeile unter dem Titel; Klick = Arbeitszeit ändern
function heroFeier() {
  if (MINI) return;
  const el = $("hero-feier"), f = feierabendText();
  el.hidden = !!f.none;
  el.classList.toggle("party", !!f.party);
  el.innerHTML = icon("clock", 15) + esc(f.t || "");
}
// Feierabend-Zeile ist nur Anzeige – Arbeitszeit ändert man in den Einstellungen
setInterval(whenVisible(heroFeier), 30000);

// Kalender-Knopf: Monat an/aus
$("cal-btn").addEventListener("click", () => $("view-seg").querySelector(`[data-view="${view === "month" ? "list" : "month"}"]`)?.click());
const calSync = () => $("cal-btn").setAttribute("aria-pressed", String(view === "month"));

// ---------- Wetter für 7 Tage (Open-Meteo): rechte Spalte, im kleinen Fenster als Pille im Himmel ----------
const WX = {
  sun: '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="4.5" fill="#F5B83D"/><g stroke="#F5B83D" stroke-width="2" stroke-linecap="round"><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></g></svg>',
  part: '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="9" cy="9" r="3.6" fill="#F5B83D"/><g stroke="#F5B83D" stroke-width="1.8" stroke-linecap="round"><path d="M9 2.5v1.4M2.5 9h1.4M4.4 4.4l1 1M13.6 4.4l-1 1"/></g><path d="M8 19.5h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.5 1.3A2.9 2.9 0 0 0 8 19.5z" fill="#C9D3E0"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M7 19h10.5a4 4 0 0 0 .4-8 5.6 5.6 0 0 0-10.7 1.5A3.3 3.3 0 0 0 7 19z" fill="#AEB8C6"/></svg>',
  fog: '<svg viewBox="0 0 24 24" width="22" height="22"><g stroke="#AEB8C6" stroke-width="2" stroke-linecap="round"><path d="M4 9h16M6 13h12M4 17h16"/></g></svg>',
  rain: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M7 15h10.5a4 4 0 0 0 .4-8 5.6 5.6 0 0 0-10.7 1.5A3.3 3.3 0 0 0 7 15z" fill="#AEB8C6"/><g stroke="#5AA2E8" stroke-width="2" stroke-linecap="round"><path d="M8.5 17.5l-1 2.5M12.5 17.5l-1 2.5M16.5 17.5l-1 2.5"/></g></svg>',
  snow: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M7 14.5h10.5a4 4 0 0 0 .4-8 5.6 5.6 0 0 0-10.7 1.5A3.3 3.3 0 0 0 7 14.5z" fill="#AEB8C6"/><g fill="#DDEBFA"><circle cx="8.5" cy="18" r="1.3"/><circle cx="12.5" cy="20" r="1.3"/><circle cx="16.5" cy="18" r="1.3"/></g></svg>',
  storm: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M7 14.5h10.5a4 4 0 0 0 .4-8 5.6 5.6 0 0 0-10.7 1.5A3.3 3.3 0 0 0 7 14.5z" fill="#8E99A8"/><path d="M12.5 14l-2.5 4h2.5l-1.5 4 4-5.5h-2.6l1.6-2.5z" fill="#F5B83D"/></svg>',
};
const wxKind = (c) => c === 0 ? "sun" : c <= 2 ? "part" : c === 3 ? "cloud" : c === 45 || c === 48 ? "fog" : c >= 95 ? "storm" : (c >= 71 && c <= 77) || c === 85 || c === 86 ? "snow" : (c >= 51 && c <= 67) || (c >= 80 && c <= 82) ? "rain" : "cloud";
const WX_NAME = { sun: "Sonnig", part: "Leicht bewölkt", cloud: "Bewölkt", fog: "Nebel", rain: "Regen", snow: "Schnee", storm: "Gewitter" };
let week = store.get("erledigt-woche", null);
const weatherPlace = () => (design.place && isFinite(design.place.lat) ? design.place : { name: "Nufringen", lat: 48.62, lon: 8.89 });
async function loadWeek(force) {
  if (MINI) return;
  const pl = weatherPlace(), key = pl.lat.toFixed(2) + "," + pl.lon.toFixed(2);
  if (!force && week && week.key === key && Date.now() - week.t < 3600e3) return renderWeek();
  try {
    const d = (await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pl.lat}&longitude=${pl.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`)).json()).daily;
    week = { key, name: pl.name, t: Date.now(), days: d.time.map((t, i) => ({ t, c: d.weather_code[i], hi: Math.round(d.temperature_2m_max[i]), lo: Math.round(d.temperature_2m_min[i]), p: Number.isFinite(+d.precipitation_probability_max?.[i]) ? Math.round(+d.precipitation_probability_max[i]) : null })) };
    store.set("erledigt-woche", week);
  } catch {}
  renderWeek();
}
function weekRows() {
  const today = iso(todayD()), lo = Math.min(...week.days.map((d) => d.lo)), hi = Math.max(...week.days.map((d) => d.hi)), span = Math.max(1, hi - lo);
  return `<div class="wx-h"><b>Wetter</b><span>${esc(week.name || weatherPlace().name)}</span></div>` + week.days.map((d) => {
    const k = wxKind(d.c), name = d.t === today ? "Heute" : WDS[new Date(d.t + "T12:00").getDay()];
    return `<div class="wx-row" title="${WX_NAME[k]}${d.p != null ? " · Regen " + d.p + " %" : ""}"><span class="wx-d">${name}</span><span class="wx-i">${WX[k]}</span><span class="wx-p">${d.p != null && d.p >= 30 ? d.p + " %" : ""}</span><span class="wx-lo">${d.lo}°</span><span class="wx-bar"><i style="left:${(d.lo - lo) / span * 100}%;right:${(hi - d.hi) / span * 100}%"></i></span><span class="wx-hi">${d.hi}°</span></div>`;
  }).join("");
}
function renderWeek() {
  const ok = !!week?.days?.length, now = ok && week.days.find((d) => d.t === iso(todayD()));
  $("aside-weather").innerHTML = ok ? weekRows() : `<div class="wx-h"><b>Wetter</b><span>${esc(weatherPlace().name)}</span></div><small class="wx-none">Gerade keine Verbindung zum Wetterdienst.</small>`;
  $("wx-pop").innerHTML = ok ? weekRows() : "";
  $("hero-wx").hidden = !now;
  if (now) $("hero-wx").innerHTML = WX[wxKind(now.c)] + `${now.hi}°<small>${now.lo}°</small>`;
}
$("hero-wx").addEventListener("click", (e) => {
  e.stopPropagation();
  const pop = $("wx-pop"), r = $("hero-wx").getBoundingClientRect();
  pop.style.left = r.left + "px"; pop.style.top = r.bottom + 8 + "px"; pop.hidden = !pop.hidden;
});
document.addEventListener("click", (e) => { if (!$("wx-pop").hidden && !$("wx-pop").contains(e.target)) $("wx-pop").hidden = true; });
addEventListener("scroll", () => { const p = $("wx-pop"); if (!p.hidden) p.hidden = true; }, { passive: true }); // nur anfassen, wenn offen – sonst rechnet der Browser bei jedem Scroll-Schritt alle Stile neu
setInterval(() => loadWeek(), 30 * 60e3);

// Nach jedem Zeichnen mitziehen
const render0 = render;
render = function () { render0(); if (!MINI) { calSync(); heroFeier(); } };
if (!MINI) { heroFeier(); loadWeek(); }

// ===== 09e-einstellungen-sync.js =====
// ======================================================================
// ---------- Einstellungen auf allen Geräten gleich (Supabase: user_settings) ----------
// ======================================================================
// Abgeglichen: Farbe, Landschaft, Himmel an/aus, Hell/Dunkel, Arbeitszeit, Name, Wetter-Ort, Bundesland.
// Nicht abgeglichen: Arbeit/Privat-Modus (darf je Gerät verschieden sein).
let setRemote = {}, setSent = "", setUid = null, setChan = null;
function settingsSnap() {
  return Object.assign({}, setRemote, {
    preset: design.preset || "standard", custom: design.custom || null, scene: design.scene || "wald", sceneOn: !!design.w.scene, sceneHoch: design.w.hoch !== false, vorlauf: +(design.vorlauf || 0),
    name: design.name || "", place: design.place || null, state: design.state || "BW",
    start: arbeitsbeginn(), end: feierabendAt(), theme: root.dataset.theme || "system",
  });
}
function settingsApply(d) {
  if (!d || typeof d !== "object") return;
  setRemote = d;
  const placeBefore = JSON.stringify(design.place || null);
  if (d.preset) design.preset = d.preset;
  if ("custom" in d) design.custom = d.custom || null;
  if (d.scene) design.scene = d.scene;
  if (typeof d.sceneOn === "boolean") design.w.scene = d.sceneOn;
  if (typeof d.sceneHoch === "boolean") design.w.hoch = d.sceneHoch;
  if (typeof d.vorlauf === "number") design.vorlauf = d.vorlauf;
  if (typeof d.name === "string") design.name = d.name;
  if (d.place) design.place = d.place;
  if (d.state) design.state = d.state;
  if (/^\d{2}:\d{2}$/.test(d.start || "")) store.set("erledigt-arbeitsbeginn", d.start);
  if (typeof d.end === "string") store.set("erledigt-feierabend", d.end);
  if (d.theme) {
    try { if (d.theme === "system") { delete root.dataset.theme; localStorage.removeItem("todo-theme"); } else { root.dataset.theme = d.theme; localStorage.setItem("todo-theme", d.theme); } } catch {}
    syncTheme();
  }
  saveDesign(); applyDesign(); lastTodayHtml = ""; render(); renderDay();
  if (!$("design-overlay").hidden) renderDesign();
  if (JSON.stringify(design.place || null) !== placeBefore) { window.__scene?.reloadWeather?.(); loadWeek(true); }
}
async function settingsPush() {
  const snap = settingsSnap(), s = JSON.stringify(snap);
  if (s === setSent) return;
  setSent = s;
  const { error } = await sb.from("user_settings").upsert({ user_id: uid, data: snap, updated_at: new Date().toISOString() });
  if (error) { console.warn("Einstellungen:", error.message); setSent = ""; }
}
async function settingsInit() {
  if (MINI || !uid || setUid === uid) return;
  setUid = uid;
  const { data, error } = await sb.from("user_settings").select("data").maybeSingle();
  if (error) { setUid = null; return; }
  if (data?.data && Object.keys(data.data).length) { settingsApply(data.data); setSent = JSON.stringify(settingsSnap()); }
  else settingsPush(); // erstes Gerät: eigene Einstellungen hochladen
  if (setChan) sb.removeChannel(setChan);
  setChan = sb.channel("einstellungen-" + uid).on("postgres_changes", { event: "*", schema: "public", table: "user_settings", filter: `user_id=eq.${uid}` }, (p) => {
    const d = p.new?.data; if (!d || JSON.stringify(d) === setSent) return;
    settingsApply(d); setSent = JSON.stringify(settingsSnap());
  }).subscribe();
}
// Änderungen (egal wo im Menü) alle 2 Sekunden einsammeln und hochladen
setInterval(() => { if (!uid || !loaded) return; if (setUid !== uid) settingsInit(); else settingsPush(); }, 2000);

// ===== 10-start.js =====
// Start-Animation: Logo zeichnet sich, dann blendet die Oberfläche gestaffelt ein (nicht im Mini-Fenster, nicht bei reduzierter Bewegung)
{
  const intro = $("intro");
  if (intro) {
    if (MINI || matchMedia("(prefers-reduced-motion: reduce)").matches) intro.remove();
    else { document.body.classList.add("boot"); setTimeout(() => intro.classList.add("out"), 1050); setTimeout(() => intro.remove(), 1600); setTimeout(() => document.body.classList.remove("boot"), 2800); }
  }
}
// Version + Updates
if (!MINI) window.desktop?.version?.().then((v) => {
  $("ver").textContent = "Erledigt v" + v;
  const last = store.get("erledigt-last-version", null);
  store.set("erledigt-last-version", v);
  if (last && last !== v && v !== "1.4.3") setTimeout(() => { showBadge(`Aktualisiert auf ${v}`, "Was neu ist, steht in den Mitteilungen.", "up", true); addNote({ kind: "update", ic: "up", title: `Aktualisiert auf ${v}`, sub: (CHANGELOG[v] || ["Kleine Verbesserungen"]).map((x) => "• " + x).join("\n") }); }, 1500);
});
const setVer = (t, keep) => { $("ver").textContent = t; clearTimeout(setVer.t); if (!keep) setVer.t = setTimeout(() => window.desktop?.version?.().then((v) => { $("ver").textContent = "Erledigt v" + v; }), 6000); };
$("ver").addEventListener("click", () => { if ($("ver").dataset.url) { window.open($("ver").dataset.url, "_blank"); return; } window.desktop?.checkUpdates?.(); setVer("Suche Update …"); });
// Update-Anzeige: Karte mit Ladebalken beim Herunterladen, großer Bildschirm beim Installieren
const updCard = (title, sub, pct) => {
  $("upd-card").hidden = false; $("upd-t").textContent = title; $("upd-s").textContent = sub || "";
  $("upd-bar").style.width = pct == null ? "100%" : Math.max(3, pct) + "%";
  $("upd-bar").classList.toggle("run", pct == null);
};
window.desktop?.onUpdate?.((u) => {
  if (u.state === "checking") setVer("Suche Update …", true);
  if (u.state === "uptodate") setVer("Erledigt ist aktuell ✓");
  if (u.state === "downloading") {
    setVer(`Update ${u.version} lädt … ${u.pct != null ? u.pct + " %" : ""}`, true);
    updCard(`Update ${u.version || ""} wird geladen`, u.pct != null ? `${u.pct} %` : "", u.pct);
    if (!u.pct && store.get("erledigt-update-noted", "") !== u.version) { store.set("erledigt-update-noted", u.version); addNote({ kind: "update", ic: "up", title: `Update ${u.version} gefunden`, sub: "Wird geladen und danach automatisch installiert." }); }
  }
  if (u.state === "preparing") { setVer(`Update ${u.version} wird vorbereitet …`, true); updCard(`Update ${u.version} wird vorbereitet`, "Gleich geht's los", null); }
  if (u.state === "installing") {
    setVer(`Installiere ${u.version} …`, true); $("upd-card").hidden = true;
    $("upd-big").textContent = `Update auf ${u.version} wird installiert`;
    $("upd-sub").textContent = "Erledigt schließt sich kurz und startet dann von selbst neu.";
    $("upd-hint").textContent = window.desktop?.platform === "win32" ? "Gleich erscheint ein kleines Installationsfenster – einfach abwarten." : "Das dauert nur ein paar Sekunden.";
    $("upd-screen").hidden = false;
  }
  if (u.state === "error") {
    console.warn("Update:", u.message); $("upd-card").hidden = true;
    setVer("Update-Suche fehlgeschlagen");
    addNote({ kind: "update", ic: "up", title: "Update fehlgeschlagen", sub: String(u.message || "").slice(0, 160) });
  }
  if (u.state === "manual") { // Mac: automatischer Austausch geht nicht → Download-Link
    $("upd-card").hidden = true;
    $("ver").dataset.url = u.url; setVer(`Update ${u.version} verfügbar – klicken`, true);
    if (store.get("erledigt-update-told", "") !== u.version + (u.why || "")) { store.set("erledigt-update-told", u.version + (u.why || "")); addNote({ kind: "update", ic: "up", title: `Update ${u.version} verfügbar`, sub: (u.why ? "Automatisch ging es nicht: " + u.why + ". " : "") + "Klick unten links auf die Version zum Herunterladen." }); }
  }
});

// Aus dem Hauptprozess: Schnellerfassung (Strg+Alt+N)
window.desktop?.onQuickAdd?.((text) => {
  if (typeof text === "string" && text.trim() && looksLikeMail(text) && !MINI) { window.desktop?.show?.(); createFromMail(parseMailText(text)); return; }
  if (typeof text === "string" && text.trim()) { $("new").value = text.trim().replace(/\s+/g, " ").slice(0, 300); updateHint(); }
  $("new").focus(); if (!text) $("new").select();
});

// ===== web-part.js =====
// ======================================================================
// ---------- Web-Version (Handy, iPhone, Android-TWA) – nur außerhalb von Electron ----------
// ======================================================================
// Wird von build/web.js als letzter Teil in app.js gehängt (gleicher Gültigkeitsbereich wie alle anderen Teile).
// Push-Erinnerungen: Server-Funktion push-reminders (Supabase) schickt; hier Erlaubnis holen und Gerät in push_subs eintragen.
if (!window.desktop) {
  document.body.classList.add("web");
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});

  const VAPID_PUBLIC = "BL9LO55gCavAEJtr2_fy_IQ7LcNDLnNFdBEgDsKX_ZXMn9oMVMdi3cavlvuINUsl-nK4_2MoD5hqtQnjbToJ40I";
  const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const STANDALONE = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const pushOk = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const b64u = (s) => { const p = "=".repeat((4 - (s.length % 4)) % 4), b = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(b, (c) => c.charCodeAt(0)); };
  const deviceName = () => IS_IOS ? "iPhone/iPad" : /Android/.test(navigator.userAgent) ? "Android" : /Mac/.test(navigator.userAgent) ? "Mac (Browser)" : /Windows/.test(navigator.userAgent) ? "Windows (Browser)" : "Browser";
  const tzName = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Berlin"; } catch { return "Europe/Berlin"; } };
  const currentSub = async () => { if (!pushOk()) return null; const reg = await navigator.serviceWorker.getRegistration(); return reg ? reg.pushManager.getSubscription() : null; };
  async function saveSub(sub) {
    if (!uid) return; const j = sub.toJSON();
    const { error } = await sb.from("push_subs").upsert({ endpoint: j.endpoint, user_id: uid, p256dh: j.keys.p256dh, auth: j.keys.auth, device: deviceName(), tz: tzName() });
    if (error) throw error;
  }
  async function pushOn() {
    if (await Notification.requestPermission() !== "granted") throw new Error("Mitteilungen sind blockiert – in den Handy-Einstellungen für Erledigt erlauben.");
    const reg = await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(VAPID_PUBLIC) });
    await saveSub(sub);
  }
  async function pushOff() { const sub = await currentSub(); if (!sub) return; await sb.from("push_subs").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe().catch(() => {}); }

  // Zeile in den Einstellungen (ganz oben), Zustand wird nachgeladen
  let pushState = false;
  const pushRow = () => {
    if (IS_IOS && !STANDALONE) return `<div class="st-item"><span class="st-l"><b>Erst zum Home-Bildschirm</b><small>iPhone schickt Mitteilungen nur an die Home-Bildschirm-App: Teilen → „Zum Home-Bildschirm“, dann dort öffnen.</small></span></div>`;
    if (!pushOk()) return `<div class="st-item"><span class="st-l"><b>Push geht hier nicht</b><small>Dieser Browser kann keine Mitteilungen empfangen.</small></span></div>`;
    return `<button type="button" class="st-item" id="push-tog"><span class="st-l"><b>Erinnerungen aufs Handy</b><small>Zur Uhrzeit einer Aufgabe und morgens die Übersicht</small></span><span class="switch" role="switch" aria-checked="${pushState}" aria-label="Erinnerungen aufs Handy"></span></button>`;
  };
  const renderDesignDesk = renderDesign;
  renderDesign = function () {
    renderDesignDesk();
    const host = $("design-body"); if (!host) return;
    const sec = document.createElement("section"); sec.className = "st-sec"; sec.id = "push-sec";
    sec.innerHTML = `<h3>Handy</h3><div class="st-list">${pushRow()}</div>`;
    host.insertBefore(sec, host.firstChild);
  };
  const syncPush = () => currentSub().then((s) => { pushState = !!s && Notification.permission === "granted"; const sw = document.querySelector("#push-tog .switch"); if (sw) sw.setAttribute("aria-checked", String(pushState)); }).catch(() => {});
  $("design-open")?.addEventListener("click", () => setTimeout(syncPush, 0));
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("#push-tog"); if (!b) return;
    b.disabled = true;
    try { if (pushState) { await pushOff(); showToast("Erinnerungen aufs Handy sind aus"); } else { await pushOn(); showToast("Erinnerungen aufs Handy sind an"); } }
    catch (err) { showToast(String(err.message || err)); }
    finally { b.disabled = false; syncPush(); }
  });
  // Abmelden: Gerät vorher austragen (danach greift RLS nicht mehr)
  $("logout")?.addEventListener("click", (e) => {
    if (e.isTrusted && !e.target.dataset.pushDone) { e.stopImmediatePropagation(); e.preventDefault(); pushOff().catch(() => {}).finally(() => { e.target.dataset.pushDone = "1"; e.target.click(); delete e.target.dataset.pushDone; }); }
  }, true);
  // Nach dem Anmelden: Abo auffrischen (neuer Endpunkt nach Handy-Update)
  sb.auth.onAuthStateChange((_e, s) => { if (s) setTimeout(() => currentSub().then((sub) => sub && Notification.permission === "granted" && saveSub(sub)).catch(() => {}), 500); });

  // Mitteilung angetippt → Aufgabe öffnen
  const openFromPush = (id) => { if (!id) return; let n = 30; const go = () => { if (loaded && items.some((t) => t.id === id)) { selected = id; openDetail(id); } else if (n-- > 0) setTimeout(go, 300); }; go(); };
  navigator.serviceWorker?.addEventListener("message", (e) => { if (e.data?.type === "open-task") openFromPush(e.data.task); });
  const qTask = new URLSearchParams(location.search).get("task");
  if (qTask) { history.replaceState(null, "", location.pathname); openFromPush(qTask); }
}

// ---------- Touch-Steuerung (Handy): Zeile antippen = Details, Wischen rechts = erledigt, links = löschen ----------
if (!window.desktop && matchMedia("(hover: none)").matches) {
  // Doppeltipp-Umbenennen aus (am Handy versehentlich; umbenennen geht im Detail-Titel)
  $("tasks").addEventListener("dblclick", (e) => e.stopImmediatePropagation(), true);
  // Tipp irgendwo auf die Zeile (außer Kreis) öffnet die Details
  $("tasks").addEventListener("click", (e) => {
    if (swiped) { e.stopImmediatePropagation(); e.preventDefault(); return; }
    const row = e.target.closest(".task"); if (!row || e.target.closest(".tick") || e.target.closest(".title")) return;
    if (e.target.closest(".pop, input, textarea")) return;
    e.stopImmediatePropagation(); selected = row.dataset.id; openDetail(row.dataset.id);
  }, true);
  let sw = null, swiped = false;
  $("tasks").addEventListener("touchstart", (e) => {
    const row = e.target.closest(".task"); if (!row || e.touches.length !== 1 || e.target.closest(".tick, input, textarea")) { sw = null; return; }
    sw = { row, x: e.touches[0].clientX, y: e.touches[0].clientY, dx: 0, lock: null }; swiped = false;
  }, { passive: true });
  $("tasks").addEventListener("touchmove", (e) => {
    if (!sw) return;
    const dx = e.touches[0].clientX - sw.x, dy = e.touches[0].clientY - sw.y;
    if (sw.lock === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) sw.lock = Math.abs(dx) > Math.abs(dy) * 1.4 ? "x" : "y";
    if (sw.lock !== "x") return;
    sw.dx = dx; swiped = true; sw.row.classList.add("sw-drag");
    sw.row.style.transform = `translateX(${dx}px)`;
    sw.row.classList.toggle("sw-r", dx > 30); sw.row.classList.toggle("sw-l", dx < -30);
  }, { passive: true });
  const swEnd = () => {
    if (!sw) return; const { row, dx } = sw, id = row.dataset.id; sw = null;
    row.classList.remove("sw-drag");
    if (dx > 100) { navigator.vibrate?.(12); completeTask(id); }
    else if (dx < -120) { navigator.vibrate?.(12); deleteTask(id); }
    row.style.transform = ""; setTimeout(() => row.classList.remove("sw-r", "sw-l"), 220);
    setTimeout(() => (swiped = false), 60);
  };
  $("tasks").addEventListener("touchend", swEnd); $("tasks").addEventListener("touchcancel", swEnd);
}

})();
