// Automatisch aus der Desktop-App übernommen (tools/shared.py) – nicht von Hand ändern.
const WEEKDAYS = { montag: 1, mo: 1, dienstag: 2, di: 2, mittwoch: 3, mi: 3, donnerstag: 4, do: 4, freitag: 5, fr: 5, samstag: 6, sa: 6, sonntag: 0 }; // „so“ fehlt absichtlich – sonst würde „so schnell wie möglich“ zum Sonntag
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
// Feiertage (Bundesland aus design.state, sonst BW)
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
// Wetter-Symbole
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
