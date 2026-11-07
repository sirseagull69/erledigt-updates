// Automatisch aus der Desktop-App übernommen (tools/shared.py) – nicht von Hand ändern.
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
box.innerHTML = '<svg viewBox="0 0 900 210" preserveAspectRatio="xMidYMax slice"></svg><svg class="sc-move" viewBox="0 0 900 210" preserveAspectRatio="xMidYMax slice"></svg><div class="sc-grain"></div><div class="sc-rain"></div><div class="sc-snow"></div><div class="sc-flash"></div>';
(document.getElementById("hero") || document.querySelector(".hello") || hdr).prepend(box);
const svg = box.querySelector("svg"), mv = box.querySelector(".sc-move"), precip = { rain: box.querySelector(".sc-rain"), snow: box.querySelector(".sc-snow") };
var SC_START = 450, SC_END = 990, SW = 900; // SW: Breite der Szene, passend zum Banner (nichts wird gestreckt oder abgeschnitten)
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
let L = {}, layerEls = [], leafEls = [];
// Landschaften: wald (Schwarzwald), alpen, kueste, stadt, schlicht – Auswahl im Design-Menü
const THEMES = ["wald", "alpen", "kueste", "stadt", "schlicht"];
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
  svg.innerHTML = ""; mv.innerHTML = ""; layerEls = []; L.crownPts = [];
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
  <filter id="sc-blur8" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="sc-blur3" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="sc-grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .55 0"/></filter>`;
  svg.setAttribute("viewBox", `0 0 ${SW} 210`); mv.setAttribute("viewBox", `0 0 ${SW} 210`); box.style.setProperty("--sw", SW);
  mk("rect", { x: 0, y: 0, width: SW, height: 210, fill: "url(#sc-sky)" });
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
  L.shimmer = null; L.frontPts = null; L.beam = null;
  if (TH === "kueste") buildCoast(defs);
  else if (TH === "stadt") buildCity(defs);
  else if (TH === "schlicht") buildPlain();
  else (TH === "alpen" ? LAYERS_ALP : LAYERS).forEach(([seed, base, amp, rough, pines], i) => {
    const alp = TH === "alpen";
    const pts = alp && i <= 1 ? alpPts(seed, base, amp, rough) : ridgePts(seed, base, amp, rough, alp ? i <= 2 : i <= 1);
    if (i === 4) pts.forEach((q) => { if (q[0] > LAKE[0] - 30 && q[0] < LAKE[1] + 30) q[1] += 14 * Math.sin(Math.PI * Math.max(0, Math.min(1, (q[0] - LAKE[0] + 30) / (LAKE[1] - LAKE[0] + 60)))); });
    let d = `M-10 210 L${pts.map((p) => p[0] + " " + p[1].toFixed(1)).join(" L")} L${SW + 10} 210Z`;
    if (alp && i === 1) { const right = pts.filter((t) => t[0] > SW * .55 && t[0] < SW * .9); L.alpTop = right.reduce((m, t) => (t[1] < m[1] ? t : m), right[0]); }
    const R = seeded(seed * 3), crowns = [];
    const free = (x) => !(i === 3 && Math.abs(x - HOUSE) < 34) && !(i === 4 && x > LAKE[0] - 10 && x < LAKE[1] + 10);
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
  L.fx = mk("g", {}, mv);
  // Filmkorn
  draw(cur);
}

// Nebelbänke zwischen Schichten (für alle Landschaften)
function fogBand(base, R) { const fg = mk("g", { filter: "url(#sc-blur8)" }); for (let j = 0; j < Math.ceil(SW / 190); j++) mk("ellipse", { cx: 80 + j * 190 + R() * 60, cy: base + 8, rx: 90 + R() * 70, ry: 7 + R() * 4, class: "fogc" }, fg); }
const layer = (d) => { const g = mk("g", {}), p = mk("path", { d }, g); layerEls.push(p); return p; };
const ridgeD = (pts) => `M-10 210 L${pts.map((p) => p[0] + " " + p[1].toFixed(1)).join(" L")} L${SW + 10} 210Z`;

// ---------- Küste: Landzungen, Meer mit Glitzern, Leuchtturm auf der Klippe ----------
function buildCoast() {
  const R = seeded(91), HZ = 124; // Horizont höher, damit das Meer im weichen Auslauf noch sichtbar ist
  layer(ridgeD(ridgePts(11, HZ - 14, 14, .8, false).map(([x, y]) => [x, x > SW * .58 ? y : HZ + 2 + (y - HZ) * .2]))); fogBand(HZ - 14, R);
  layer(ridgeD(ridgePts(23, HZ - 4, 9, 1, false).map(([x, y]) => [x, x < SW * .28 ? y : HZ + 2]))); fogBand(HZ - 6, R);
  // Meer (spiegelt den Himmel)
  mk("rect", { x: 0, y: HZ, width: SW, height: 210 - HZ, fill: "url(#sc-lake)" });
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
  const ov = Math.min(1, W.cover * .7 + (W.rain || W.snow ? .25 : 0)); // Bewölkung färbt den Himmel grau
  if (ov > 0) { const g = (a, b) => mix(a, b, night * .85); top = mix(top, g("#8E98A5", "#10121A"), ov * .8); mid = mix(mid, g("#B3BAC3", "#181A24"), ov * .75); hor = mix(hor, g("#C7CCD2", "#22242E"), ov * .6); }
  ["sc-s0", "sc-s1", "sc-s2"].forEach((id, i) => document.getElementById(id).setAttribute("stop-color", [top, mid, hor][i]));
  // Luftperspektive: hinten fast Horizontfarbe, vorne dunkel; tagsüber mit Jahreszeit-Ton
  const deep = mix(mix(top, "#05070F", .55), "#05070F", night * .5);
  layerEls.forEach((el, i) => {
    const k = .22 + i * .19;
    let c = mix(hor, deep, k);
    c = mix(c, se.tint, se.k * 1.8 * d * (.3 + i / 5.5));
    if (TH === "alpen") { if (i <= 1) c = mix(c, "#5E636E", .35 * (.4 + .6 * d)); else if (i === 2) c = mix(c, "#5F8F45", .32 * d); }
    if (el.dataset.snow) { el.setAttribute("fill", `url(#sc-snow${el.dataset.snow})`); const st = document.querySelector(`#sc-snow${el.dataset.snow} .snowbase`); st.setAttribute("stop-color", c); document.querySelectorAll(`#sc-snow${el.dataset.snow} stop`).forEach((x, j) => { if (j < 2) x.setAttribute("stop-color", mix(["#F4F7FB", "#E6ECF3"][j], hor, .25 + night * .55)); }); }
    else { if (i >= 2) c = mix(c, TH === "wald" || TH === "alpen" ? "#0F1C17" : "#0E1420", (.18 + (i - 2) * .14) * (.4 + .6 * d)); el.setAttribute("fill", c); }
    el.dataset.c = c;
  });
  leafEls.forEach(([el, li, ci]) => { const base = layerEls[li].dataset.c, pal = se.leaf; el.setAttribute("fill", pal.length ? mix(base, pal[ci % pal.length], (.3 + (li - 2) * .07) * (.08 + .92 * d)) : base); el.setAttribute("opacity", pal.length ? 1 : 0); });
  { const tq = TH === "alpen" ? .45 * d : 0; document.getElementById("sc-lk0").setAttribute("stop-color", mix(mix(hor, "#000000", .1), "#3FB0BE", tq)); document.getElementById("sc-lk1").setAttribute("stop-color", mix(mix(mid, "#000000", .25), "#1F7F8C", tq)); }
  L.shimmer.setAttribute("opacity", .25 + d * .35);
  if (L.beam) L.beam.setAttribute("opacity", night > .5 ? .9 : 0);
  const morning = m < 620 ? Math.min(1, (620 - m) / 170) : 0;
  if (L.smoke) { L.smoke.setAttribute("opacity", .55); L.smoke.querySelectorAll("circle").forEach((c) => c.setAttribute("fill", mix(hor, "#FFFFFF", .3 * d))); }
  svg.querySelectorAll(".fogc").forEach((f) => { f.setAttribute("fill", mix(hor, "#FFFFFF", d * .25 + morning * .2)); f.setAttribute("opacity", Math.min(.95, .32 + night * .1 + morning * .4 + W.fog * .5 + ov * .15)); });
  { const stc = mix(mix("#FFFFFF", hor, .35 + (1 - d) * .3), top, night * .7); ["sc-st0", "sc-st1", "sc-st2"].forEach((id) => document.getElementById(id).setAttribute("stop-color", stc)); }
  L.streaks.setAttribute("opacity", Math.min(1, .75 - night * .45 + ov * .5));
  // Sonne: Bogen vom Arbeitsbeginn bis Feierabend, geht hinter den Bergen unter
  const p = (m - SC_START) / (SC_END - SC_START);
  const sx = 70 + Math.max(-.15, Math.min(1.15, p)) * (SW - 200), sy = 150 - Math.sin(Math.max(0, Math.min(1, p)) * Math.PI) * 125 + (p > 1 ? (p - 1) * 380 : p < 0 ? -p * 380 : 0);
  [L.sun, L.bloom].forEach((e) => { e.setAttribute("cx", sx); e.setAttribute("cy", sy); });
  const low = p < .15 || p > .8;
  L.sun.setAttribute("fill", low ? "#FFC27A" : "#FFF4D6");
  L.bloom.setAttribute("opacity", (p > -.15 && p < 1.15 ? (low ? 1 : .75) : 0) * (1 - ov * .85)); L.sun.setAttribute("opacity", 1 - ov * .9);
  L.rays.setAttribute("transform", `translate(${sx} ${sy})`);
  L.rays.setAttribute("opacity", (low && p > -.05 && p < 1.05 ? .9 : .25 * d) * (1 - ov));
  // Mond, Sterne
  const starO = m < 420 ? Math.max(0, 1 - (m - 330) / 90) : m > 1010 ? Math.min(1, (m - 1010) / 100) : 0;
  L.stars.setAttribute("opacity", starO * (1 - ov)); L.twinkle.setAttribute("opacity", starO * (1 - ov));
  const mp = m > 960 ? (m - 960) / 450 : (m + 1440 - 960) / 450;
  L.moon.setAttribute("transform", `translate(${160 + Math.min(1, mp) * (SW - 340)} ${36 + Math.abs(mp - .5) * 50})`);
  L.moon.setAttribute("opacity", starO * (1 - ov * .85));
  // Lichter im Tal
  const on = m > SC_END - 10 ? Math.min(1, (m - (SC_END - 10)) / 110) : m < SC_START ? Math.max(0, (SC_START - m) / 50) : 0;
  L.lights.forEach(([c, th]) => c.setAttribute("opacity", th < on ? .95 : 0));
  precip.rain.style.opacity = W.rain ? (.35 + W.rain * .45) * (night > .5 ? .6 : 1) : 0;
  precip.snow.style.opacity = W.snow ? .5 + W.snow * .5 : 0;
  hdr.classList.toggle("sc-storm", !!W.storm);
  // Schrift passend zum Himmel
  const light = lum(mix(top, mid, .5)) > .5;
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
function randomEvent() { const nat = TH === "wald" || TH === "alpen"; const pool = isNight() ? ["star", "star", "sat", "plane", ...(nat ? ["reh"] : [])] : ["plane", "plane", "birds", "birds", ...(nat ? ["reh", "leaf"] : [])]; EV[pool[Math.floor(Math.random() * pool.length)]](); }


// ---------- Wetter (Open-Meteo, kein Konto, nur fester Ort Nufringen) ----------
function applyWeather(code, cover) {
  const c = +code || 0;
  W.cover = Math.max(0, Math.min(1, (+cover || 0) / 100));
  W.rain = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(c) ? ([55, 57, 65, 67, 82, 95, 96, 99].includes(c) ? 1 : [53, 63, 81].includes(c) ? .6 : .3) : 0;
  W.snow = [71, 73, 75, 77, 85, 86].includes(c) ? ([75, 86].includes(c) ? 1 : .55) : 0;
  W.fog = [45, 48].includes(c) ? 1 : 0;
  W.storm = c >= 95;
}
async function loadWeather(force) {
  const test = store.get("erledigt-wetter-test", ""); // zum Ausprobieren: "regen", "schnee", "gewitter", "nebel", "wolken"
  if (test) { applyWeather({ sonne: 0, regen: 63, schnee: 73, gewitter: 95, nebel: 45, wolken: 3 }[test] || 0, { sonne: 0, wolken: 90 }[test] ?? 70); return; }
  const pl = placeNow(), key = pl.lat.toFixed(2) + "," + pl.lon.toFixed(2), day = iso(todayD());
  const cache = store.get("erledigt-wetter", null), fresh = cache && cache.key === key && cache.day === day;
  const useCache = (c) => { applyWeather(c.code, c.cover); W.sunrise = c.sr || 0; W.sunset = c.ss || 0; };
  if (fresh && !force && Date.now() - cache.t < 30 * 60e3) { useCache(cache); return; }
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pl.lat}&longitude=${pl.lon}&current=weather_code,cloud_cover&daily=sunrise,sunset&forecast_days=1&timezone=auto`);
    const j = await r.json(), cur = j.current || {}, toMin = (t) => { const m = String(t || "").match(/T(\d\d):(\d\d)/); return m ? +m[1] * 60 + +m[2] : 0; };
    const c = { t: Date.now(), key, day, code: cur.weather_code, cover: cur.cloud_cover, sr: toMin(j.daily?.sunrise?.[0]), ss: toMin(j.daily?.sunset?.[0]) };
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
let built = false, on = false, tick = 0, evT = 0, leafT = 0;
const quiet = () => document.hidden || reduce.matches; // Ereignisse auch, wenn Erledigt sichtbar, aber nicht aktiv ist – nur nicht minimiert/verdeckt
let lastEv = 0;
const fire = (name) => { lastEv = Date.now(); EV[name](); };
function nextEvent() { clearTimeout(evT); evT = setTimeout(() => { if (on && !quiet()) { lastEv = Date.now(); randomEvent(); } nextEvent(); }, (180 + Math.random() * 180) * 1000); }
window.addEventListener("focus", () => { if (on && !quiet() && Date.now() - lastEv > 300000) setTimeout(() => { lastEv = Date.now(); randomEvent(); }, 1500); });
function measure() { const w = box.clientWidth, h = box.clientHeight; return w && h ? Math.max(700, Math.min(2600, Math.round(210 * w / h))) : SW; }
let seasonTest = null, playing = 0;
function refresh() { if (!on || playing) return; const s = seasonTest || realSeason(), nw = measure(); if (s !== season || !built || theme() !== TH || Math.abs(nw - SW) > 30) { season = s; SW = nw; build(); built = true; } draw(minuteNow()); }
let rsT = 0; try { new ResizeObserver(() => { clearTimeout(rsT); rsT = setTimeout(() => { if (on && Math.abs(measure() - SW) > 30) refresh(); }, 250); }).observe(box); } catch {}
sceneSync = () => {
  const want = !!design.w.scene;
  document.body.classList.toggle("has-scene", want);
  const pk = JSON.stringify(placeNow());
  if (want === on) { if (on) { refresh(); if (pk !== lastPk) { lastPk = pk; loadWeather(true).then(refresh); } } return; }
  lastPk = pk;
  on = want;
  clearInterval(tick); clearTimeout(evT); clearInterval(leafT);
  if (!on) { svg.innerHTML = ""; built = false; return; }
  refresh();
  loadWeather().then(refresh);
  tick = setInterval(() => { refresh(); if (new Date().getMinutes() % 30 === 0) loadWeather().then(refresh); }, 60000);
  nextEvent();
  leafT = setInterval(() => { if (on && !quiet() && SEASON[season].leaves && Math.random() < .35) EV.leaf(); }, 60000);
  setTimeout(() => { if (on && !quiet()) fire(isNight() ? "star" : "plane"); }, 4000);
};
// Test-Werkzeuge fürs Design-Menü
const skyTest = {
  weather(name) { store.set("erledigt-wetter-test", name === "echt" ? "" : name); W.cover = W.rain = W.snow = W.fog = 0; W.storm = false; loadWeather(name === "echt").then(refresh); },
  season(name) { seasonTest = name === "echt" ? null : name; built = false; refresh(); },
  event() { if (on) fire(isNight() ? ["star", "sat", "plane", "reh"][Math.floor(Math.random() * 4)] : ["plane", "birds", "reh", "leaf"][Math.floor(Math.random() * 4)]); },
  day() { // ganzer Tag in 15 Sekunden
    if (!on) return; cancelAnimationFrame(playing); const t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / 15000), m = Math.round(300 + k * 1110); draw(m); if (k < 1) playing = requestAnimationFrame(step); else { playing = 0; refresh(); } };
    playing = requestAnimationFrame(step);
  },
  state: () => ({ weather: store.get("erledigt-wetter-test", "") || "echt", season: seasonTest || "echt" }),
};
window.__scene = { EV, skyTest, reloadWeather: () => loadWeather(true).then(refresh), sw: () => SW, draw: (m) => draw(m), weather: (c, cv) => { applyWeather(c, cv); refresh(); }, season: (s) => { season = s; build(); draw(minuteNow()); } }; // für Tests
sceneSync();
})();
