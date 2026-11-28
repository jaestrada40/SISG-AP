/* Base de la presentación: utilidades, registro de diapositivas y el motor (escala 1280×720, pasos internos, índice).
   → avanza (primero los pasos internos de la diapositiva) · ← retrocede · F pantalla completa · I índice · Home / End. */
(function () {
  "use strict";
  const A = window.APT;
  const K = (window.K = { A, slides: [] });
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  K.REDUCED = REDUCED;

  /* ---------- utilidades ---------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  K.esc = esc;
  K.fmt = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/(^|[\s(«])\*([^*\n]+)\*/g, "$1<i>$2</i>");
  K.$ = (s, r) => (r || document).querySelector(s);
  K.$$ = (s, r) => [...(r || document).querySelectorAll(s)];
  K.N = (n) => Number(n).toLocaleString("en-US");
  K.num = (s) => { const m = String(s).replace(",", ".").match(/-?\d+(?:\.\d+)?/); return m ? parseFloat(m[0]) : NaN; };
  K.plain = (s) => String(s).replace(/\*\*|`|\*/g, "");
  K.clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  K.store = {
    get(k, d) { try { const v = localStorage.getItem("sisgapt:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("sisgapt:" + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } },
  };
  K.countUp = (el, to, ms, f) => {
    f = f || K.N; const dec = String(to).includes(".") ? 1 : 0;
    if (REDUCED) { el.textContent = f(to); return; }
    const t0 = performance.now();
    (function tick(t) { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3), v = to * e; el.textContent = f(dec ? +v.toFixed(1) : Math.round(v)); if (k < 1 && el.isConnected) requestAnimationFrame(tick); })(t0);
  };

  /* estado a partir del texto de los documentos: verde = cumplido, ámbar = en curso, rojo = pendiente */
  K.status = (txt) => {
    const t = String(txt).toLowerCase();
    if (/^(cumplido|cumple|hecho|implementad|resuelta|listo)/.test(t)) return "ok";
    if (/pendiente|por iniciar|por completar|por validar|sin dato/.test(t)) return "pend";
    return "run";
  };
  K.badge = (txt, cls) => `<span class="badge ${cls || ""}">${K.fmt(txt)}</span>`;
  K.level = (txt) => { const t = K.plain(txt).toLowerCase(); return /cr[ií]tico/.test(t) ? "crit" : /alto/.test(t) ? "alto" : /medio/.test(t) ? "medio" : "bajo"; };

  /* tabla HTML a partir de {cols, rows}. opt.cols: índices a mostrar · opt.fmt(v, ci, row): celda · opt.rowCls(row, i) */
  K.tbl = (t, opt) => {
    opt = opt || {}; const idx = opt.cols || t.cols.map((_, i) => i);
    const f = opt.fmt || ((v) => K.fmt(v));
    return `<table class="dt ${opt.cls || ""}"><thead><tr>${idx.map((i) => `<th>${esc(opt.heads && opt.heads[i] != null ? opt.heads[i] : t.cols[i])}</th>`).join("")}</tr></thead><tbody>` +
      t.rows.map((r, ri) => `<tr data-i="${ri}" class="${opt.rowCls ? opt.rowCls(r, ri) : ""}">${idx.map((i) => `<td${opt.num !== false && /^\s*[-\d.,%]+\s*$/.test(r[i]) ? ' class="n"' : ""}>${f(r[i], i, r)}</td>`).join("")}</tr>`).join("") + `</tbody></table>`;
  };

  /* ---------- registro de diapositivas ---------- */
  K.SEC = {
    cover: ["", ""], ini: ["Iniciación", "orange"], met: ["Metodología", "blue"], pla: ["Planificación", "purple"],
    int: ["Interesados", "green"], rie: ["Riesgos", "pink"], cal: ["Calidad", "teal"], cie: ["Cierre", "yellow"],
  };
  K.add = (sec, title, text, render, o) => K.slides.push(Object.assign({ sec, title, text, render }, o || {}));

  /* =====================================================================
     MOTOR
     ===================================================================== */
  const D = (K.deck = {});
  let idx = -1, ctxNow = null, build = { max: 0, i: 0, fn: null }, keys = {}, ready = false;
  const root = () => K.$("#deck");

  function makeCtx(back) {
    const items = [];
    return {
      back,
      timer(fn, ms) { const t = setInterval(fn, ms); items.push(() => clearInterval(t)); return t; },
      timeout(fn, ms) { const t = setTimeout(fn, ms); items.push(() => clearTimeout(t)); return t; },
      on(el, ev, fn) { el.addEventListener(ev, fn); items.push(() => el.removeEventListener(ev, fn)); },
      onKey(k, fn) { keys[k] = fn; },
      cleanup(fn) { items.push(fn); },
      builds(n, fn) { build = { max: n, i: back ? n - 1 : 0, fn }; dots(); fn(build.i); },
      dispose() { items.forEach((f) => f()); items.length = 0; keys = {}; build = { max: 0, i: 0, fn: null }; },
    };
  }
  function dots() { const d = K.$(".sl-dots", root()); if (d) d.innerHTML = build.max > 1 ? Array.from({ length: build.max }, (_, k) => `<i class="${k <= build.i ? "on" : ""}"></i>`).join("") : ""; }
  function fit() {
    const v = K.$(".dk-view", root()), s = K.$("#dk-slide"); if (!v || !s) return;
    s.style.transform = `translate(-50%, -50%) scale(${Math.min(v.clientWidth / 1280, v.clientHeight / 720)})`;
  }
  function mount(i, back) {
    if (ctxNow) ctxNow.dispose();
    const S = K.slides[i], host = K.$("#dk-slide"), k = K.SEC[S.sec] || K.SEC.ini;
    host.className = "dk-slide" + (S.cover ? " is-cover" : "");
    host.innerHTML = (S.cover ? "" : `<div class="sl-head"><span class="kick" style="--c:var(--c-${k[1]})">${String(i + 1).padStart(2, "0")} · ${k[0]}</span><h1>${esc(S.title)}</h1></div>`) + `<div class="sl-body"></div><div class="sl-dots"></div>`;
    ctxNow = makeCtx(back);
    S.render(K.$(".sl-body", host), ctxNow);
    dots();
  }
  D.show = (n) => {
    init(); const el = root(); el.hidden = false;
    n = K.clamp(n, 1, K.slides.length) - 1; fit();
    if (n !== idx) { const prev = idx; idx = n; mount(n, prev - n === 1); }
    K.$(".dk-count", el).textContent = `${String(n + 1).padStart(2, "0")} / ${K.slides.length}`;
    K.$(".dk-name", el).textContent = K.slides[n].title;
    K.$(".dk-bar i", el).style.width = ((n + 1) / K.slides.length) * 100 + "%";
    K.$$("#dk-index button", el).forEach((b, k) => b.setAttribute("aria-current", k === n ? "true" : "false"));
    const h = `#/p/${n + 1}`; if (location.hash !== h) history.replaceState(null, "", h);
    document.title = `${K.slides[n].title} · SISG · Administración de Proyectos`;
  };
  K.go = (n) => { location.hash = `#/p/${K.clamp(n, 1, K.slides.length)}`; };
  function next() { if (build.max > 1 && build.i < build.max - 1) { build.i++; build.fn(build.i); dots(); } else if (idx < K.slides.length - 1) K.go(idx + 2); }
  function prev() { if (build.max > 1 && build.i > 0) { build.i--; build.fn(build.i); dots(); } else if (idx > 0) K.go(idx); }
  function toggleFull() { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {}); }

  function init() {
    if (ready) return; ready = true;
    const el = root();
    el.innerHTML = `<div class="dk-top"><span class="dk-count"></span><span class="dk-name"></span><span class="grow"></span>
      <button type="button" id="dk-prev" title="Anterior (←)" aria-label="Anterior">←</button><button type="button" id="dk-next" title="Siguiente (→)" aria-label="Siguiente">→</button>
      <button type="button" id="dk-idx" title="Índice (I)">Índice</button><button type="button" id="dk-full" title="Pantalla completa (F)">Pantalla completa</button></div>
      <div class="dk-view"><div class="dk-slide" id="dk-slide"></div></div><div class="dk-bar"><i></i></div>
      <aside id="dk-index" hidden><h3>Diapositivas</h3><input type="search" id="dk-q" placeholder="Buscar en todo el contenido (/)" autocomplete="off" aria-label="Buscar diapositiva"><div id="dk-nres"></div>${K.slides.map((s, i) => `<button type="button" data-i="${i}"><i>${String(i + 1).padStart(2, "0")}</i><span>${esc(s.title)}<small class="sn"></small></span></button>`).join("")}</aside>`;
    K.$("#dk-prev", el).onclick = prev; K.$("#dk-next", el).onclick = next;
    K.$("#dk-idx", el).onclick = () => { const x = K.$("#dk-index", el); x.hidden = !x.hidden; if (!x.hidden) { const c = K.$('[aria-current="true"]', x); if (c) c.scrollIntoView({ block: "center" }); } };
    const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), q = K.$("#dk-q", el), idxB = K.$$("#dk-index button", el);
    /* Texto completo: se dibuja cada diapositiva fuera de pantalla (con todos sus pasos y botones de detalle) y se guarda su texto; se hace una sola vez, al primer uso. */
    let hay = null;
    const cosecha = (S) => {
      const body = document.createElement("div"), txt = [S.title, S.text || ""], ta = document.createElement("textarea"), grab = () => { ta.innerHTML = body.innerHTML.replace(/<[^>]+>/g, " "); txt.push(ta.value); };
      const c = { back: false, timer() {}, timeout() {}, cleanup() {}, onKey() {}, dispose() {}, on(e, ev, f) { e.addEventListener(ev, f); }, builds(n, f) { for (let k = 0; k < n; k++) { f(k); grab(); } } };
      try { S.render(body, c); grab(); body.querySelectorAll("button:not([data-go]):not(.btn)").forEach((b) => { b.click(); grab(); }); } catch (e) { /* una diapositiva que falle conserva el texto ya obtenido */ }
      return txt.join(" \n ").replace(/\s+/g, " ");
    };
    const filtra = () => {
      if (!hay) hay = K.slides.map((s) => { const raw = cosecha(s); return { raw, n: norm(raw) }; });
      const t = norm(q.value).split(/\s+/).filter(Boolean); let c = 0;
      idxB.forEach((b, i) => {
        const h = hay[i], ok = t.every((w) => h.n.includes(w)), sn = K.$(".sn", b); b.hidden = !ok; if (ok) c++;
        if (!ok || !t.length) { sn.textContent = ""; return; }
        const p = Math.max(0, h.n.indexOf(t[0]) - 28); /* shortcut: sin conteo de coincidencias; una diapositiva con pasos repite su texto al cosecharlo */
        sn.textContent = "…" + h.raw.slice(p, p + 90) + "…";
      });
      K.$("#dk-nres", el).textContent = t.length ? c + " de " + K.slides.length + " diapositivas" : "";
    };
    q.oninput = filtra;
    q.onkeydown = (e) => { if (e.key === "Enter") { const b = idxB.find((x) => !x.hidden); if (b) b.click(); } else if (e.key === "Escape") { q.value = ""; filtra(); K.$("#dk-index", el).hidden = true; q.blur(); } };
    K.$$("#dk-index button", el).forEach((b) => (b.onclick = () => { K.$("#dk-index", el).hidden = true; K.go(+b.dataset.i + 1); }));
    K.$("#dk-full", el).onclick = toggleFull;
    addEventListener("resize", fit); new ResizeObserver(fit).observe(K.$(".dk-view", el));
    document.addEventListener("fullscreenchange", () => { document.body.classList.toggle("dk-full", !!document.fullscreenElement); setTimeout(fit, 60); });
    addEventListener("keydown", (e) => {
      if (root().hidden || e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
      if (keys[e.key]) { keys[e.key](e); return; }
      if (e.key === "ArrowRight" || e.key === "PageDown" || (e.key === " " && e.target.tagName !== "BUTTON")) { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
      else if (e.key === "Home") K.go(1); else if (e.key === "End") K.go(K.slides.length);
      else if (e.key === "f" || e.key === "F") toggleFull();
      else if (e.key === "i" || e.key === "I") K.$("#dk-idx").click();
      else if (e.key === "/") { e.preventDefault(); const x = K.$("#dk-index"); x.hidden = false; K.$("#dk-q").focus(); K.$("#dk-q").select(); }
      else if (e.key === "Escape" && !K.$("#dk-index").hidden) K.$("#dk-index").hidden = true;
    });
  }
  K.start = () => {
    const go = () => { const m = /^#\/p\/(\d+)$/.exec(location.hash); D.show(m ? +m[1] : 1); };
    addEventListener("hashchange", go);
    (document.fonts && document.fonts.load ? Promise.race([document.fonts.load('600 14px "JetBrains Mono"'), new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve()).catch(() => {}).then(go);
  };
})();
