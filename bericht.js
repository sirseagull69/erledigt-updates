// Erledigt mobil – „Was hab ich gemacht?“ (wie am PC, ohne KI): erledigte Aufgaben nach Zeitraum, ohne Privat, nach Tagen.
"use strict";
let repRange = "heute";
const kwOf = (d) => { const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); const dn = x.getUTCDay() || 7; x.setUTCDate(x.getUTCDate() + 4 - dn); const y0 = new Date(Date.UTC(x.getUTCFullYear(), 0, 1)); return Math.ceil(((x - y0) / 864e5 + 1) / 7); };
function repSpan(kind) {
  const t = todayD(), mon = addDays(t, -((t.getDay() + 6) % 7));
  if (kind === "heute") return [t, addDays(t, 1), `heute (${t.getDate()}.${t.getMonth() + 1}.)`];
  if (kind === "woche") return [mon, addDays(mon, 7), `KW ${kwOf(t)}`];
  if (kind === "vorwoche") return [addDays(mon, -7), mon, `KW ${kwOf(addDays(mon, -7))}`];
  return [new Date(t.getFullYear(), t.getMonth(), 1), new Date(t.getFullYear(), t.getMonth() + 1, 1), MONTHS[t.getMonth()] + " " + t.getFullYear()];
}
const repItems = () => { const [a, b] = repSpan(repRange); return items.filter((t) => t.done && t.doneAt && t.doneAt >= +a && t.doneAt < +b && t.list !== "privat").sort((p, q) => p.doneAt - q.doneAt); };
const repWho = (t) => (t.notes || "").match(/^Mail von ([^<\n·]+)/)?.[1]?.trim() || "";
function repText() {
  const list = repItems(), [, , label] = repSpan(repRange);
  if (!list.length) return `Erledigt ${label}: nichts eingetragen.`;
  const days = new Map(); for (const t of list) { const k = iso(new Date(t.doneAt)); days.set(k, [...(days.get(k) || []), t]); }
  const one = (t) => `• ${t.title}${repWho(t) ? ` (für ${repWho(t)})` : ""}${t.solution ? ` – ${t.solution}` : ""}`;
  return `Erledigt ${label} (${list.length} Aufgaben)\n\n` + [...days].map(([k, ts]) => { const d = parseIso(k); return `${WD[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}.\n${ts.map(one).join("\n")}`; }).join("\n\n");
}
function openRep() { $("rep-wrap").hidden = false; renderRep(); }
function renderRep() {
  const n = repItems().length;
  $("rep").innerHTML = `<h2 style="margin:4px 0 10px">Was hab ich gemacht?</h2>
    <div class="modes" id="rep-seg">${[["heute", "Heute"], ["woche", "Woche"], ["vorwoche", "Letzte Woche"], ["monat", "Monat"]].map(([k, l]) => `<button type="button" data-r="${k}" aria-pressed="${repRange === k}">${l}</button>`).join("")}</div>
    <p class="muted" style="margin:10px 0 6px;font-size:13px">${n} erledigte Aufgabe${n === 1 ? "" : "n"} (ohne Privat)</p>
    <textarea id="rep-out" class="rep-out" readonly rows="12">${esc(repText())}</textarea>
    <div class="acts"><button type="button" class="btn" id="rep-copy">Kopieren</button><button type="button" class="btn primary" id="rep-share">Teilen</button></div>`;
}
$("rep").addEventListener("click", async (e) => {
  const r = e.target.closest("[data-r]"); if (r) { repRange = r.dataset.r; renderRep(); return; }
  if (e.target.id === "rep-copy") { try { await navigator.clipboard.writeText($("rep-out").value); toast("Kopiert"); } catch { $("rep-out").select(); } }
  if (e.target.id === "rep-share") { const v = $("rep-out").value; if (navigator.share) navigator.share({ title: v.split("\n")[0], text: v }).catch(() => {}); else { try { await navigator.clipboard.writeText(v); toast("Kopiert – Teilen gibt es hier nicht"); } catch {} } }
});
// Knöpfe in „Alles erledigt“: Bericht oder Kalender auf morgen
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-frei]"); if (!b) return;
  if (b.dataset.frei === "rep") openRep();
  else { tab = "cal"; calOff = 0; calSel = iso(addDays(todayD(), 1)); render(); setTimeout(() => $("add-in").focus(), 200); }
});
