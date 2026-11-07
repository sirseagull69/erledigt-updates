// Erledigt mobil – Test „locker“: Kalender oben rechts, Eingabezeile unten wie im Messenger.
"use strict";

// Kalender-Knopf im Kopf statt Tab-Leiste
$("cal-btn").addEventListener("click", () => { tab = tab === "cal" ? "list" : "cal"; render(); });
const render1 = render;
render = function () {
  render1(); $("cal-btn").setAttribute("aria-pressed", String(tab === "cal"));
  const d = parseIso(calSel);
  $("add-in").placeholder = tab === "cal" ? `Was ist am ${d.getDate()}.${d.getMonth() + 1}.?` : "Was steht an?";
};

// Eingabezeile
const comp = $("composer"), inp = $("add-in");
const FLAG = '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M5 21V4h10l1 2h4v10h-7l-1-2H7v7z"/></svg>';
addPreview = function () {
  const p = addParsed();
  const bits = p ? [p.due ? dueText({ due: p.due, until: p.until, time: p.time, timeEnd: p.timeEnd }) : "", p.repeat ? "wiederholt sich" : ""].filter(Boolean) : [];
  $("add-prev").textContent = bits.join(" · ");
  $("add-prev").classList.toggle("on", bits.length > 0);
  const dueK = p?.due || "", t0 = iso(todayD()), t1 = iso(addDays(todayD(), 1));
  const curList = p?.list || draft.list || defList(), hoch = (draft.prio || p?.prio) === "hoch", L = listById[curList];
  $("add-quick").innerHTML = `<button type="button" data-q="heute" aria-pressed="${dueK === t0}">Heute</button><button type="button" data-q="morgen" aria-pressed="${dueK === t1}">Morgen</button><span class="sep"></span>`
    + `<button type="button" data-flag aria-pressed="${hoch}"${hoch ? ' class="flag"' : ""}>${FLAG}Wichtig</button><span class="sep"></span>`
    + `<button type="button" data-cycle aria-pressed="false"><i class="dot" style="background:${L.dot}"></i>${L.name}<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10l5 5 5-5"/></svg></button>`;
  $("add-save").disabled = !p;
};
// Speichern-Knopf ohne alte Logik (die schließt ein Fenster) neu verdrahten
const send = $("add-save").cloneNode(true); $("add-save").replaceWith(send);
saveAdd = function () {
  const p = addParsed(); if (!p) return;
  addItem(p);
  if (p.due && tab === "cal") { calSel = p.due; render(); }
  inp.value = ""; draft = { list: draft.list, prio: null, forDay: tab === "cal" ? calSel : null };
  addPreview(); inp.focus();
};
send.addEventListener("pointerdown", (e) => e.preventDefault()); // Tastatur bleibt offen
send.addEventListener("click", saveAdd);
inp.addEventListener("input", () => addPreview());
inp.addEventListener("focus", () => { draft.forDay = tab === "cal" ? calSel : null; comp.classList.add("open"); addPreview(); });
inp.addEventListener("blur", () => setTimeout(() => { if (document.activeElement !== inp) { comp.classList.remove("open"); listMenu(true); } }, 120));
$("add-quick").addEventListener("pointerdown", (e) => e.preventDefault()); // Tippen auf Optionen schließt die Tastatur nicht
$("add-quick").addEventListener("click", (e) => {
  if (e.target.closest("[data-flag]")) { draft.prio = draft.prio === "hoch" ? "mittel" : "hoch"; addPreview(); }
  if (e.target.closest("[data-cycle]")) { listMenu(); }
});
// Listen-Auswahl: kleines Menü über der Leiste
function listMenu(close) {
  let m = $("c-menu");
  if (m || close) { m?.remove(); return; }
  const cur = addParsed()?.list || draft.list || defList();
  m = document.createElement("div"); m.id = "c-menu"; m.className = "c-menu";
  m.innerHTML = shownLists().map((l) => `<button type="button" data-pick="${l.id}" aria-pressed="${cur === l.id}"><i style="background:${l.dot}"></i>${l.name}</button>`).join("");
  comp.appendChild(m);
}
comp.addEventListener("pointerdown", (e) => { if (e.target.closest(".c-menu")) e.preventDefault(); });
comp.addEventListener("click", (e) => { const b = e.target.closest("[data-pick]"); if (!b) return; draft.list = b.dataset.pick; listMenu(true); addPreview(); inp.focus(); });
// Oben auf eine Liste tippen, während man schreibt: Liste fürs Eintragen übernehmen, Tastatur bleibt offen
document.addEventListener("pointerdown", (e) => {
  const chip = e.target.closest("#chips [data-list]");
  if (chip && document.activeElement === inp) { e.preventDefault(); return; }
  if (!comp.contains(e.target)) { listMenu(true); if (document.activeElement === inp) inp.blur(); }
});
document.addEventListener("click", (e) => { const chip = e.target.closest("#chips [data-list]"); if (chip && comp.classList.contains("open")) { draft.list = chip.dataset.list === "alle" ? null : chip.dataset.list; setTimeout(() => { addPreview(); inp.focus(); }, 0); } }, true);
// Leer-Hinweis passend
const renderList1 = renderList;
renderList = function () { renderList1(); const em = document.querySelector("#view-list .empty"); if (em) em.innerHTML = em.innerHTML.replace(/Tipp unten auf.*$/, "Unten eintippen, Enter – fertig."); };
draft = { list: null, prio: null, forDay: null };
addPreview();
