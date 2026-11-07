// Automatisch aus der Desktop-App übernommen (tools/shared.py) – nicht von Hand ändern.
const WEEKDAYS = { montag: 1, mo: 1, dienstag: 2, di: 2, mittwoch: 3, mi: 3, donnerstag: 4, freitag: 5, fr: 5, samstag: 6, sonntag: 0 };
const WD_PLURAL = { sonntags: 0, montags: 1, dienstags: 2, mittwochs: 3, donnerstags: 4, freitags: 5, samstags: 6 };
function matchRule(rule, d) {
  if (rule === "daily") return true;
  if (rule === "weekdays") return d.getDay() >= 1 && d.getDay() <= 5;
  if (rule.startsWith("weekly:")) return rule.slice(7).split(",").map(Number).includes(d.getDay());
  if (rule.startsWith("monthly:")) { const n = +rule.slice(8), last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); return d.getDate() === Math.min(n, last); }
  return false;
}
function nextOcc(rule, start) { let d = new Date(start); d.setHours(0, 0, 0, 0); for (let i = 0; i < 400; i++) { if (matchRule(rule, d)) return d; d = addDays(d, 1); } return d; }
function firstOcc(rule, time) {
  const d = nextOcc(rule, todayD());
  const hm = `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`;
  return iso(d) === iso(todayD()) && time && time <= hm ? nextOcc(rule, addDays(todayD(), 1)) : d;
}
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
function dateRange(d1, m1, y1, d2, m2, y2) {
  const mk = (d, m, y) => { let yr = y ? +y : todayD().getFullYear(); if (yr < 100) yr += 2000; const x = new Date(yr, +m - 1, +d); return x.getMonth() === +m - 1 && x.getDate() === +d ? x : null; };
  let a = mk(d1, m1, y1), b = mk(d2, m2, y2);
  if (!a || !b) return null;
  if (!y1 && !y2 && b < todayD()) { a = mk(d1, m1, a.getFullYear() + 1); b = mk(d2, m2, b.getFullYear() + 1); }
  if (b < a) return null;
  return [iso(a), iso(b)];
}
