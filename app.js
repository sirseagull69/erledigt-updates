// Erledigt mobil – gleiche Daten wie die PC-App (Supabase), aufgeräumte Oberfläche fürs Handy.
// Datumserkennung + Wiederhol-Regeln kommen aus shared.js (aus der Desktop-App übernommen).
"use strict";
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayD = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const parseIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const WD = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

// ---------- Listen + Modus ----------
const LISTS = [
  { id: "arbeit", name: "Arbeit", dot: "#60A5FA" }, { id: "privat", name: "Privat", dot: "#FB923C" }, { id: "projekte", name: "Projekte", dot: "#34D399" },
  { id: "haushalt", name: "Haushalt", dot: "#A78BFA" }, { id: "einkaufen", name: "Einkaufen", dot: "#F472B6" }, { id: "termine", name: "Termine", dot: "#FBBF24" },
];
const listById = Object.fromEntries(LISTS.map((l) => [l.id, l]));
const MODE_LISTS = { arbeit: ["arbeit", "privat", "projekte"], privat: ["privat", "haushalt", "einkaufen", "termine"] };
let mode = store.get("em-mode", "arbeit"), list = "alle", tab = "list", calOff = 0, calSel = iso(todayD());
const shownLists = () => LISTS.filter((l) => MODE_LISTS[mode].includes(l.id));
const defList = () => (list !== "alle" ? list : mode === "privat" ? "privat" : "arbeit");
const PRIO = { hoch: 0, mittel: 1, niedrig: 2 };

// ---------- Daten ----------
const SB_URL = "https://ovosbxkwqgxxfekrtlov.supabase.co";
const SB_KEY = "sb_publishable_cvKxZ4tvDpez0OWyf-C-og_raV3cGVZ"; // öffentlicher Schlüssel, Schutz über RLS
const sb = supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: "erledigt-mobile-auth" } });
const FIELD = { title: "title", due: "due", until: "due_end", time: "time", timeEnd: "time_end", prio: "prio", list: "list", done: "done", archived: "archived", repeat: "repeat", notes: "notes", checklist: "checklist" };
const fromRow = (r) => ({ id: r.id, title: r.title, due: r.due, until: r.due_end || null, time: r.time, timeEnd: r.time_end || null, prio: PRIO[r.prio] !== undefined ? r.prio : "mittel", list: listById[r.list] ? r.list : "arbeit", done: !!r.done, archived: !!r.archived, repeat: r.repeat || null, notes: r.notes || "", checklist: Array.isArray(r.checklist) ? r.checklist : [], doneAt: r.done_at ? Date.parse(r.done_at) : null, createdAt: Date.parse(r.created_at) || Date.now() });
function toRow(p) {
  const row = {};
  for (const k in p) {
    if (FIELD[k]) row[FIELD[k]] = p[k] ?? (k === "done" || k === "archived" ? false : k === "checklist" ? [] : k === "notes" ? "" : null);
    else if (k === "doneAt") row.done_at = p[k] ? new Date(p[k]).toISOString() : null;
    else if (k === "createdAt") row.created_at = new Date(p[k]).toISOString();
  }
  return row;
}
let items = [], session = null, loaded = false;
const busy = new Set();
const endDay = (t) => t.until || t.due;
async function write(id, fn) {
  busy.add(id);
  try { const { error } = await fn(); if (error) throw error; setSync(true); }
  catch (err) { setSync(false); toast("Konnte nicht speichern – " + (/fetch|network/i.test(err.message) ? "keine Verbindung" : err.message)); setTimeout(fetchAll, 1500); }
  finally { setTimeout(() => busy.delete(id), 1500); }
}
function applyLocal(id, body) {
  const i = items.findIndex((x) => x.id === id);
  if (body === null) { if (i >= 0) items.splice(i, 1); } else if (i >= 0) items[i] = { ...items[i], ...body }; else items.push({ id, ...body });
  render();
}
const newId = () => "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function addItem(p) {
  const id = newId();
  const doc = { title: p.title, due: p.due || null, until: p.until || null, time: p.time || null, timeEnd: p.timeEnd || null, repeat: p.repeat || null, notes: "", checklist: [], prio: p.prio || "mittel", list: p.list || defList(), done: false, doneAt: null, createdAt: Date.now() };
  applyLocal(id, doc);
  write(id, () => sb.from("todos").upsert({ id, ...toRow(doc), attachments: [] }));
  return id;
}
function patch(id, p) {
  const it = items.find((x) => x.id === id);
  if ("due" in p && !("until" in p) && it?.until) p = { ...p, until: p.due && it.due ? iso(addDays(parseIso(p.due), Math.round((parseIso(it.until) - parseIso(it.due)) / 864e5))) : null };
  applyLocal(id, p);
  write(id, () => sb.from("todos").update(toRow(p)).eq("id", id));
}
let undoBuf = null;
function removeItem(id) {
  const it = items.find((x) => x.id === id); if (!it) return;
  undoBuf = { ...it };
  applyLocal(id, null);
  write(id, () => sb.from("todos").delete().eq("id", id));
  toast(`„${it.title}“ gelöscht`, true);
}
function toggleDone(id) {
  const it = items.find((x) => x.id === id); if (!it) return;
  if (!it.done && it.repeat) { // wiederkehrend: nächsten Termin anlegen (wie am PC)
    const base = addDays(new Date(Math.max(it.due ? parseIso(it.due) : 0, todayD())), 1);
    const next = iso(nextOcc(it.repeat, base)), nid = newId();
    const doc = { title: it.title, due: next, time: it.time || null, timeEnd: it.timeEnd || null, repeat: it.repeat, prio: it.prio, list: it.list, notes: it.notes || "", checklist: (it.checklist || []).map((c) => ({ ...c, done: false })), done: false, doneAt: null, createdAt: Date.now() };
    applyLocal(nid, doc); write(nid, () => sb.from("todos").upsert({ id: nid, ...toRow(doc), attachments: [] }));
    toast(`Kommt wieder: ${dueLabel(next)}`);
  }
  if (navigator.vibrate) navigator.vibrate(12);
  patch(id, { done: !it.done, doneAt: it.done ? null : Date.now() });
}
async function fetchAll() {
  const { data, error } = await sb.from("todos").select("*").order("created_at");
  if (error) { setSync(false); return; }
  items = data.map(fromRow); loaded = true; setSync(true); render();
}
let channel = null;
function subscribe() {
  if (channel) sb.removeChannel(channel);
  channel = sb.channel("todos-mobil").on("postgres_changes", { event: "*", schema: "public", table: "todos" }, (p) => {
    if (p.eventType === "DELETE") { if (p.old?.id && !busy.has(p.old.id)) applyLocal(p.old.id, null); }
    else if (p.new?.id && !busy.has(p.new.id)) { const { id, ...b } = fromRow(p.new); applyLocal(id, b); }
  }).subscribe((s) => { if (s === "SUBSCRIBED") fetchAll(); });
}
document.addEventListener("visibilitychange", () => { if (!document.hidden && session) fetchAll(); });
window.addEventListener("online", () => session && fetchAll());
const setSync = (on) => { $("sync").classList.toggle("off", !on); $("sync").title = on ? "Synchronisiert" : "Keine Verbindung"; };

// ---------- Feiertage (wie am PC, Baden-Württemberg) ----------
const holCache = {};
function holidays(y) {
  if (holCache[y]) return holCache[y];
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const easter = new Date(y, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1), E = (n) => iso(addDays(easter, n)), D = (mo, dd) => iso(new Date(y, mo - 1, dd));
  const out = {}; [[D(1, 1), "Neujahr"], [D(1, 6), "Heilige Drei Könige"], [E(-2), "Karfreitag"], [E(1), "Ostermontag"], [D(5, 1), "Tag der Arbeit"], [E(39), "Christi Himmelfahrt"], [E(50), "Pfingstmontag"], [E(60), "Fronleichnam"], [D(10, 3), "Tag der Deutschen Einheit"], [D(11, 1), "Allerheiligen"], [D(12, 25), "1. Weihnachtstag"], [D(12, 26), "2. Weihnachtstag"]].forEach(([k2, n]) => (out[k2] = n));
  return (holCache[y] = out);
}
const holidayOf = (k) => holidays(+k.slice(0, 4))[k] || "";

// ---------- Anzeige-Helfer ----------
function dueLabel(k) {
  const n = Math.round((parseIso(k) - todayD()) / 864e5);
  if (n === 0) return "Heute"; if (n === 1) return "Morgen"; if (n === -1) return "Gestern";
  if (n > 1 && n < 7) return WD[parseIso(k).getDay()].slice(0, 2) + ".";
  const d = parseIso(k); return `${d.getDate()}.${d.getMonth() + 1}.`;
}
const shortDate = (k) => { const d = parseIso(k); return `${d.getDate()}.${d.getMonth() + 1}.`; };
function dueText(t) {
  if (!t.due) return "";
  return (t.until ? `${shortDate(t.due)}–${shortDate(t.until)}` : dueLabel(t.due)) + (t.time ? " · " + t.time + (t.timeEnd ? "–" + t.timeEnd : "") : "");
}
const inList = () => items.filter((t) => !t.archived && (list === "alle" ? MODE_LISTS[mode].includes(t.list) : t.list === list));
const CHECK = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function taskHtml(t) {
  const today = iso(todayD()), c = listById[t.list].dot;
  const late = !t.done && t.due && endDay(t) < today, isToday = !t.done && t.due && t.due <= today && endDay(t) >= today;
  const meta = [list === "alle" ? `<span class="lst"><i></i>${listById[t.list].name}</span>` : "", t.due ? `<span class="${late ? "late" : isToday ? "today" : ""}">${esc(dueText(t))}</span>` : "", t.repeat ? "<span>↻</span>" : "", t.checklist.length ? `<span>☑ ${t.checklist.filter((x) => x.done).length}/${t.checklist.length}</span>` : "", t.notes ? "<span>✎</span>" : ""].filter(Boolean).join("");
  return `<div class="task-wrap" data-id="${t.id}"><div class="swipe-bg"><span class="l">✓ Erledigt</span><span class="r">Löschen</span></div>
    <div class="task${t.done ? " done" : ""}" style="--c:${c}"><button type="button" class="check" data-check="${t.id}" aria-label="${t.done ? "Wieder öffnen" : "Erledigt"}">${CHECK}</button>
    <div class="t-body" data-open="${t.id}"><div class="t-title">${esc(t.title)}</div>${meta ? `<div class="t-meta">${meta}</div>` : ""}</div>${t.prio === "hoch" && !t.done ? '<span class="prio" title="Hoch"></span>' : ""}</div></div>`;
}
function sectionOf(t) {
  const today = iso(todayD());
  if (!t.due) return 5;
  if (t.until && t.due <= today && t.until >= today) return 1;
  if (endDay(t) < today) return 0; if (t.due === today) return 1; if (t.due === iso(addDays(todayD(), 1))) return 2;
  if (t.due <= iso(addDays(todayD(), 7))) return 3; return 4;
}
const SECTIONS = ["Überfällig", "Heute", "Morgen", "Nächste 7 Tage", "Später", "Ohne Datum"];
const sortT = (a, b) => (a.due || "9") < (b.due || "9") ? -1 : (a.due || "9") > (b.due || "9") ? 1 : (a.time || "99") < (b.time || "99") ? -1 : (a.time || "99") > (b.time || "99") ? 1 : PRIO[a.prio] - PRIO[b.prio];

// ---------- Rendern ----------
function render() {
  if (!loaded) return;
  const h = new Date().getHours();
  $("greet").textContent = `${h < 11 ? "Guten Morgen" : h < 18 ? "Guten Tag" : "Guten Abend"} · ${WD[new Date().getDay()]}, ${new Date().getDate()}. ${MONTHS[new Date().getMonth()]}`;
  $("title").textContent = tab === "cal" ? "Kalender" : list === "alle" ? "Aufgaben" : listById[list].name;
  document.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
  if (list !== "alle" && !MODE_LISTS[mode].includes(list)) list = "alle";
  const cnt = (id) => items.filter((t) => !t.done && !t.archived && (id === "alle" ? MODE_LISTS[mode].includes(t.list) : t.list === id)).length;
  $("chips").innerHTML = [{ id: "alle", name: "Alle", dot: "var(--fg)" }, ...shownLists()].map((l) => `<button type="button" class="chip" data-list="${l.id}" aria-pressed="${list === l.id}" style="--c:${l.dot}">${l.id === "alle" ? "" : "<i></i>"}${l.name}<b>${cnt(l.id) || ""}</b></button>`).join("");
  $("view-list").hidden = tab !== "list"; $("view-cal").hidden = tab !== "cal";
  document.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
  if (tab === "list") renderList(); else renderCal();
}
function renderList() {
  const all = inList(), open = all.filter((t) => !t.done).sort(sortT), today = iso(todayD());
  const doneToday = all.filter((t) => t.done && t.doneAt && iso(new Date(t.doneAt)) === today);
  let html = "";
  SECTIONS.forEach((name, i) => { const sec = open.filter((t) => sectionOf(t) === i); if (sec.length) html += `<div class="sec${i === 0 ? " late" : ""}">${name} <span>${sec.length}</span></div>` + sec.map(taskHtml).join(""); });
  if (!open.length) html = `<div class="empty"><b>${doneToday.length ? "Alles erledigt 🎉" : "Nichts zu tun"}</b>Tipp unten auf <b style="display:inline;font-size:inherit">+</b>, um etwas einzutragen.</div>`;
  if (doneToday.length) html += `<details class="done-box"${store.get("em-done-open", false) ? " open" : ""}><summary class="sec">Heute erledigt <span>${doneToday.length}</span></summary>${doneToday.map(taskHtml).join("")}</details>`;
  $("view-list").innerHTML = html;
}
function renderCal() {
  const t0 = todayD(), today = iso(t0), first = new Date(t0.getFullYear(), t0.getMonth() + calOff, 1), m = first.getMonth();
  const start = addDays(first, -((first.getDay() + 6) % 7)), all = inList().filter((t) => t.due);
  const onDay = (k) => all.filter((t) => t.due === k || (t.until && t.due < k && t.until >= k));
  let cells = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((w) => `<div class="wd">${w}</div>`).join("");
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i), k = iso(d), ev = onDay(k).filter((t) => !t.done), we = d.getDay() === 0 || d.getDay() === 6;
    if (i >= 35 && d.getMonth() !== m) break;
    cells += `<button type="button" class="day${d.getMonth() !== m ? " other" : ""}${we ? " we" : ""}${holidayOf(k) ? " hol" : ""}${k === today ? " today" : ""}${k === calSel ? " sel" : ""}" data-day="${k}"><span class="n">${d.getDate()}</span><span class="dots">${ev.slice(0, 3).map((t) => `<i style="--c:${listById[t.list].dot}"></i>`).join("")}</span></button>`;
  }
  const sel = onDay(calSel).sort(sortT), sd = parseIso(calSel);
  $("view-cal").innerHTML = `<div class="cal-nav"><b>${MONTHS[m]} ${first.getFullYear()}</b><button type="button" data-cal="-1" aria-label="Voriger Monat">‹</button><button type="button" data-cal="0">Heute</button><button type="button" data-cal="1" aria-label="Nächster Monat">›</button></div>
    <div class="cal">${cells}</div>
    <div class="day-head"><b>${WD[sd.getDay()]}, ${sd.getDate()}. ${MONTHS[sd.getMonth()]}</b>${holidayOf(calSel) ? `<small>${holidayOf(calSel)}</small>` : ""}<span class="hint">+ trägt für diesen Tag ein</span></div>
    ${sel.length ? sel.map(taskHtml).join("") : '<div class="empty" style="padding:20px">Nichts an diesem Tag.</div>'}`;
}

// ---------- Neu ----------
let draft = { list: null, prio: null, forDay: null };
function openAdd(forDay) {
  draft = { list: null, prio: null, forDay: forDay || null };
  $("add-wrap").hidden = false; $("add-in").value = ""; addPreview();
  setTimeout(() => $("add-in").focus(), 60);
}
function addParsed() {
  const txt = $("add-in").value.trim(); if (!txt) return null;
  const p = parseInput(txt);
  if (draft.forDay && !p.due) p.due = draft.forDay;
  return { ...p, title: p.title || txt, list: draft.list || p.list || (draft.forDay && mode === "privat" ? "termine" : defList()), prio: draft.prio || p.prio || "mittel" };
}
const PRIO_UI = [["hoch", "Hoch", "var(--danger)"], ["mittel", "Mittel", "#E8A33D"], ["niedrig", "Niedrig", "var(--faint)"]];
function addPreview() {
  const p = addParsed();
  const bits = p ? [p.due ? dueText({ due: p.due, until: p.until, time: p.time, timeEnd: p.timeEnd }) : "", p.repeat ? "wiederholt sich" : "", p.list && !draft.list && p.list !== defList() ? listById[p.list]?.name : ""].filter(Boolean) : [];
  $("add-prev").innerHTML = bits.length ? "Erkannt: " + bits.map((b) => `<code>${esc(b)}</code>`).join("") : `z. B. <code>morgen</code> <code>Fr 14 Uhr</code> <code>9-17 Uhr</code>`;
  $("add-prev").classList.toggle("hit", bits.length > 0);
  const curList = p?.list || draft.list || defList(), curPrio = draft.prio || p?.prio || "mittel";
  $("add-prio").innerHTML = PRIO_UI.map(([k, n, c]) => `<button type="button" data-ap="${k}" aria-pressed="${curPrio === k}"><i class="dot" style="background:${c}"></i>${n}</button>`).join("");
  const dueK = p?.due || "", t0 = iso(todayD()), t1 = iso(addDays(todayD(), 1));
  $("add-quick").innerHTML = [["heute", "Heute", t0], ["morgen", "Morgen", t1]].map(([k, l, d]) => `<button type="button" data-q="${k}" aria-pressed="${dueK === d}">${l}</button>`).join("") + '<span class="q-sep"></span>'
    + shownLists().map((l) => `<button type="button" data-ql="${l.id}" aria-pressed="${curList === l.id}"><i class="dot" style="background:${l.dot}"></i>${l.name}</button>`).join("");
  $("add-save").disabled = !p;
}
function saveAdd() {
  const p = addParsed(); if (!p) { closeSheet($("add-wrap")); return; }
  addItem(p); closeSheet($("add-wrap"));
  if (p.due && tab === "cal") calSel = p.due;
}
$("add-btn").addEventListener("click", () => openAdd(tab === "cal" ? calSel : null));
$("add-in").addEventListener("input", addPreview);
$("add-in").addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveAdd(); } });
$("add-save").addEventListener("click", saveAdd);
$("add-cancel").addEventListener("click", () => closeSheet($("add-wrap")));
$("add-prio").addEventListener("click", (e) => { const b = e.target.closest("[data-ap]"); if (!b) return; draft.prio = b.dataset.ap; addPreview(); $("add-in").focus(); });
$("add-quick").addEventListener("click", (e) => {
  const q = e.target.closest("[data-q]"), ql = e.target.closest("[data-ql]");
  if (q) {
    const had = new RegExp("\\b" + q.dataset.q + "\\b", "i").test($("add-in").value);
    const v = $("add-in").value.replace(/\s*\b(heute|morgen)\b/gi, "").trim();
    $("add-in").value = had ? v : (v + " " + q.dataset.q).trim();
  }
  if (ql) draft.list = ql.dataset.ql;
  addPreview(); $("add-in").focus();
});

// Sheets schließen mit Animation
function closeSheet(w) {
  if (!w || w.hidden || w.classList.contains("closing")) return;
  document.activeElement?.blur?.();
  w.classList.add("closing");
  setTimeout(() => { w.hidden = true; w.classList.remove("closing"); }, 190);
}

// ---------- Details ----------
let detId = null;
function openDet(id) { detId = id; renderDet(); $("det-wrap").hidden = false; }
function renderDet() {
  const t = items.find((x) => x.id === detId); if (!t) { closeSheet($("det-wrap")); return; }
  $("det").innerHTML = `
    <textarea class="det-title" id="d-title" rows="2">${esc(t.title)}</textarea>
    <div class="row2"><label class="field"><span>Datum</span><input type="date" id="d-due" value="${t.due || ""}"></label><label class="field"><span>Bis (mehrtägig)</span><input type="date" id="d-until" value="${t.until || ""}" ${t.due ? `min="${t.due}"` : "disabled"}></label></div>
    <div class="row2"><label class="field"><span>Uhrzeit</span><input type="time" id="d-time" value="${t.time || ""}"></label><label class="field"><span>Bis</span><input type="time" id="d-tend" value="${t.timeEnd || ""}"></label></div>
    <div class="field"><span>Liste</span><div class="seg">${LISTS.filter((l) => MODE_LISTS[mode].includes(l.id) || l.id === t.list).map((l) => `<button type="button" data-dl="${l.id}" aria-pressed="${t.list === l.id}" style="--c:${l.dot}"><i></i>${l.name}</button>`).join("")}</div></div>
    <div class="field"><span>Priorität</span><div class="seg">${[["hoch", "Hoch"], ["mittel", "Mittel"], ["niedrig", "Niedrig"]].map(([k, l]) => `<button type="button" data-dp="${k}" aria-pressed="${t.prio === k}">${l}</button>`).join("")}</div></div>
    ${t.checklist.length ? `<div class="field"><span>Unterpunkte</span><div class="cl">${t.checklist.map((c, i) => `<label><input type="checkbox" data-cl="${i}" ${c.done ? "checked" : ""}>${esc(c.text)}</label>`).join("")}</div></div>` : ""}
    <label class="field"><span>Notizen</span><textarea id="d-notes" rows="4" placeholder="Notizen …">${esc(t.notes)}</textarea></label>
    <div class="acts"><button type="button" class="btn danger" id="d-del">Löschen</button><button type="button" class="btn primary" id="d-done">${t.done ? "Wieder öffnen" : "Erledigt"}</button></div>`;
}
function saveDetFields() {
  const t = items.find((x) => x.id === detId); if (!t) return;
  const p = {}, v = (id) => $(id)?.value ?? "";
  const title = v("d-title").trim(); if (title && title !== t.title) p.title = title;
  const due = v("d-due") || null; if (due !== (t.due || null)) { p.due = due; if (!due) { p.time = null; p.timeEnd = null; } }
  let until = v("d-until") || null; const effDue = "due" in p ? p.due : t.due; if (!effDue || (until && until <= effDue)) until = null; if (until !== (t.until || null)) p.until = until;
  const time = v("d-time") || null; if (time !== (t.time || null)) p.time = time;
  let te = v("d-tend") || null; const effTime = "time" in p ? p.time : t.time; if (!effTime || (te && te <= effTime)) te = null; if (te !== (t.timeEnd || null)) p.timeEnd = te;
  const notes = v("d-notes"); if (notes !== t.notes) p.notes = notes;
  if (Object.keys(p).length) patch(t.id, p);
}
$("det").addEventListener("change", (e) => { if (e.target.matches("input[type=date], input[type=time]")) { saveDetFields(); renderDet(); } if (e.target.dataset.cl !== undefined) { const t = items.find((x) => x.id === detId); const cl = t.checklist.map((c, i) => (i === +e.target.dataset.cl ? { ...c, done: e.target.checked } : c)); patch(t.id, { checklist: cl }); } });
$("det").addEventListener("focusout", (e) => { if (e.target.id === "d-title" || e.target.id === "d-notes") saveDetFields(); });
$("det").addEventListener("click", (e) => {
  const t = items.find((x) => x.id === detId); if (!t) return;
  const dl = e.target.closest("[data-dl]"), dp = e.target.closest("[data-dp]");
  if (dl) { patch(t.id, { list: dl.dataset.dl }); renderDet(); }
  if (dp) { patch(t.id, { prio: dp.dataset.dp }); renderDet(); }
  if (e.target.id === "d-del") { closeSheet($("det-wrap")); removeItem(t.id); }
  if (e.target.id === "d-done") { saveDetFields(); toggleDone(t.id); closeSheet($("det-wrap")); }
});

// ---------- Einstellungen ----------
function openSet() {
  $("set").innerHTML = `<h2 style="margin:4px 0">Einstellungen</h2>
    <div class="set-row"><span>Angemeldet als</span><b style="overflow:hidden;text-overflow:ellipsis">${esc(session?.user?.email || "")}</b></div>
    ${/ErledigtAndroid/.test(navigator.userAgent) ? "" : `<div class="set-row"><span>Auf den Home-Bildschirm</span><span class="muted" style="text-align:right;font-size:14px">iPhone: Teilen → „Zum Home-Bildschirm“</span></div>`}
    <div class="set-row"><span>Version</span><span class="muted">mobil 1.5${/ErledigtAndroid/.test(navigator.userAgent) ? " · Android" : ""}</span></div>
    <button type="button" class="btn danger wide" id="logout">Abmelden</button>`;
  $("set-wrap").hidden = false;
}
$("settings-btn").addEventListener("click", () => openSet());
$("set").addEventListener("click", async (e) => { if (e.target.id === "logout") { await sb.auth.signOut(); closeSheet($("set-wrap")); } });

// Sheets schließen: Hintergrund tippen oder nach unten wischen
document.querySelectorAll(".sheet-wrap").forEach((w) => {
  w.addEventListener("click", (e) => { if (e.target === w) { if (w.id === "det-wrap") saveDetFields(); closeSheet(w); } });
  let y0 = null; const sh = w.querySelector(".sheet");
  sh.addEventListener("touchstart", (e) => { y0 = e.target.closest(".grab") ? e.touches[0].clientY : null; if (y0 !== null) sh.style.transition = "none"; }, { passive: true });
  sh.addEventListener("touchmove", (e) => { if (y0 === null) return; const dy = e.touches[0].clientY - y0; sh.style.transform = `translateY(${dy > 0 ? dy : dy / 6}px)`; }, { passive: true });
  sh.addEventListener("touchend", (e) => { if (y0 === null) return; const dy = e.changedTouches[0].clientY - y0; sh.style.transition = ""; sh.style.transform = ""; y0 = null; if (dy > 110) { if (w.id === "det-wrap") saveDetFields(); closeSheet(w); } });
});

// ---------- Toast ----------
let toastT = 0;
function toast(text, canUndo) { $("toast-txt").textContent = text; $("toast-undo").hidden = !canUndo; $("toast").hidden = false; clearTimeout(toastT); toastT = setTimeout(() => ($("toast").hidden = true), 4000); }
$("toast-undo").addEventListener("click", () => {
  if (!undoBuf) return; const { id, ...b } = undoBuf; undoBuf = null; applyLocal(id, b);
  write(id, () => sb.from("todos").upsert({ id, ...toRow(b), attachments: [] })); $("toast").hidden = true;
});

// ---------- Tippen + Wischen ----------
document.addEventListener("click", (e) => {
  const ck = e.target.closest("[data-check]");
  if (ck) { const tsk = ck.closest(".task"); tsk.classList.add("pop"); toggleDone(ck.dataset.check); return; }
  const op = e.target.closest("[data-open]"); if (op && !swiped) { openDet(op.dataset.open); return; }
  const md = e.target.closest("[data-mode]"); if (md) { mode = md.dataset.mode; store.set("em-mode", mode); list = "alle"; render(); return; }
  const li = e.target.closest("[data-list]"); if (li) { list = li.dataset.list; render(); return; }
  const tb = e.target.closest("[data-tab]"); if (tb) { tab = tb.dataset.tab; render(); window.scrollTo({ top: 0 }); return; }
  const cn = e.target.closest("[data-cal]"); if (cn) { calOff = cn.dataset.cal === "0" ? 0 : calOff + +cn.dataset.cal; if (cn.dataset.cal === "0") calSel = iso(todayD()); render(); return; }
  const dy = e.target.closest("[data-day]"); if (dy) { calSel = dy.dataset.day; render(); }
});
document.addEventListener("toggle", (e) => { if (e.target.classList?.contains("done-box")) store.set("em-done-open", e.target.open); }, true);
let sw = null, swiped = false;
document.addEventListener("touchstart", (e) => {
  const w = e.target.closest(".task-wrap"); if (!w || e.target.closest("[data-check]")) return;
  sw = { w, el: w.querySelector(".task"), x: e.touches[0].clientX, y: e.touches[0].clientY, dx: 0, lock: null }; swiped = false;
}, { passive: true });
document.addEventListener("touchmove", (e) => {
  if (!sw) return;
  const dx = e.touches[0].clientX - sw.x, dy = e.touches[0].clientY - sw.y;
  if (sw.lock === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) sw.lock = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
  if (sw.lock !== "x") return;
  sw.dx = dx; swiped = true; sw.el.classList.add("dragging"); sw.el.style.transform = `translateX(${dx}px)`;
  sw.w.classList.toggle("sw-r", dx > 0); sw.w.classList.toggle("sw-l", dx < 0);
}, { passive: true });
document.addEventListener("touchend", () => {
  if (!sw) return; const { w, el, dx } = sw; sw = null; el.classList.remove("dragging");
  const id = w.dataset.id;
  if (dx > 90) { el.style.transform = "translateX(110%)"; setTimeout(() => toggleDone(id), 180); }
  else if (dx < -110) { el.style.transform = "translateX(-110%)"; setTimeout(() => removeItem(id), 180); }
  else { el.style.transform = ""; setTimeout(() => w.classList.remove("sw-r", "sw-l"), 250); }
  setTimeout(() => (swiped = false), 50);
});

// ---------- Anmeldung ----------
let signUp = false;
function authUi(up) { signUp = up; $("auth-title").textContent = up ? "Konto erstellen" : "Anmelden"; $("auth-go").textContent = up ? "Konto erstellen" : "Anmelden"; $("auth-switch").textContent = up ? "Schon ein Konto? Anmelden" : "Noch kein Konto? Konto erstellen"; authMsg(""); }
function authMsg(t, err) { $("auth-msg").hidden = !t; $("auth-msg").textContent = t || ""; $("auth-msg").className = "auth-msg" + (err ? " err" : ""); }
$("auth-switch").addEventListener("click", () => authUi(!signUp));
$("auth-form").addEventListener("submit", async (e) => {
  e.preventDefault(); $("auth-go").disabled = true; authMsg("Einen Moment …");
  const email = $("auth-email").value.trim(), password = $("auth-pass").value;
  try {
    if (signUp) { const { data, error } = await sb.auth.signUp({ email, password }); if (error) throw error; if (!data.session) { authUi(false); authMsg("Bestätige den Link in der Mail, dann hier anmelden."); } }
    else { const { error } = await sb.auth.signInWithPassword({ email, password }); if (error) throw error; }
  } catch (err) { const m = String(err.message || err); authMsg(/invalid login/i.test(m) ? "E-Mail oder Passwort stimmt nicht." : /not confirmed/i.test(m) ? "Bitte erst den Link in der Mail anklicken." : /fetch|network/i.test(m) ? "Keine Verbindung." : m, true); }
  finally { $("auth-go").disabled = false; }
});
sb.auth.onAuthStateChange((_ev, s) => {
  const was = !!session; session = s;
  $("auth").hidden = !!s; $("app").hidden = !s;
  if (s && !was) { subscribe(); fetchAll(); }
  if (!s) { items = []; loaded = false; if (channel) sb.removeChannel(channel); channel = null; }
});
setInterval(() => { if (session && tab === "list") render(); }, 60000);

// Offline-Fähigkeit (App-Hülle aus dem Cache)
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
