/* Diapositivas 14 a 24: planificación (EDT, PDM, PERT, Gantt, costos, valor ganado) e interesados y comunicaciones. */
(function () {
  "use strict";
  const K = window.K, A = K.A, esc = K.esc, fmt = K.fmt, $ = K.$, $$ = K.$$, N = K.N;
  const COL = { ok: "Cumple", run: "En curso", pend: "Pendiente" };
  const st = (txt) => { const s = K.status(txt); return `<span class="badge ${s}">${COL[s]}</span>`; };
  const BAC = K.num(A.cifras.bac);
  const pk = A.paquetes.rows.map((r) => ({ code: r[0], name: r[1], h: K.num(r[2]), dates: r[3], pct: K.num(r[4]), resp: r[5], g: +r[0].split(".")[0] }));
  const GC = ["blue", "purple", "green", "teal", "yellow"];
  const phi = (z) => { const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp((-z * z) / 2), p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; };

  /* ============ 14 · EDT ============ */
  K.add("pla", "EDT: estructura de desglose del trabajo", "EDT paquetes de trabajo regla del 100% horas 168 gestión datos aplicación calidad cierre", (b, ctx) => {
    const groups = A.edt_nivel1.map((n, i) => ({ name: n.slice(2), pk: pk.filter((p) => p.g === i + 1), c: GC[i] })).map((g) => Object.assign(g, { h: g.pk.reduce((a, p) => a + p.h, 0) }));
    b.innerHTML = `<div class="edt"><div class="edt-root"><span>0</span><b>SISG – Módulo Grupo 4</b><em><strong data-n="${BAC}">0</strong> h</em><small>Regla del 100 %: los paquetes suman todo el alcance</small></div>
      <div class="edt-br">${groups.map((g, i) => `<section class="edt-g" style="--c:var(--c-${g.c});--d:${i * 90}ms"><header><b>${i + 1} · ${esc(g.name)}</b><span>${g.h} h · ${Math.round((g.h / BAC) * 100)} %</span><i style="width:${(g.h / BAC) * 100}%"></i></header>
        <div class="edt-p">${g.pk.map((p) => `<span class="pk" title="${esc(p.name)} · ${esc(p.dates)} · ${esc(p.resp)}"><i>${p.code}</i>${esc(p.name)}<b>${p.h} h</b></span>`).join("")}</div></section>`).join("")}</div></div>
      <p class="foot">Nivel 1: cinco grupos. Nivel 2: veinte paquetes de trabajo. Las horas son estimaciones iniciales que el grupo debe reemplazar por sus horas reales.</p>`;
    K.countUp($("[data-n]", b), BAC, 1000);
    const g = $$(".edt-g", b); ctx.builds(g.length + 1, (i) => g.forEach((e, k) => e.classList.toggle("on", k < i || i === g.length)));
  });

  /* ============ 15 · diccionario de paquetes ============ */
  K.add("pla", "Diccionario de paquetes de trabajo", "paquetes horas fechas avance responsable valor ganado 110.1 66% líder datos calidad", (b, ctx) => {
    const resp = ["Todos", ...new Set(pk.map((p) => p.resp))]; let f = "Todos";
    b.innerHTML = `<div class="dic"><div class="dic-top"><div class="chips">${resp.map((r) => `<button type="button" class="chip" aria-pressed="${r === f}" data-r="${esc(r)}">${esc(r)}</button>`).join("")}</div><div class="dic-sum"></div></div><div class="dic-t"></div></div>
      <p class="foot">Responsables propuestos por rol (Líder, Datos, Calidad, Todos); el grupo debe asignar personas. Avance = porcentaje estimado en el borrador del 24 de octubre.</p>`;
    const draw = () => {
      const rows = pk.filter((p) => f === "Todos" || p.resp === f), h = rows.reduce((a, p) => a + p.h, 0), ev = rows.reduce((a, p) => a + (p.h * p.pct) / 100, 0);
      $(".dic-sum", b).innerHTML = `<span><b>${rows.length}</b> paquetes</span><span><b>${h}</b> h</span><span>valor ganado <b>${ev.toFixed(1)}</b> h</span><span>avance ponderado <b>${h ? ((ev / h) * 100).toFixed(0) : 0} %</b></span>`;
      $(".dic-t", b).innerHTML = `<table class="dt"><thead><tr><th>Código</th><th>Paquete</th><th>Horas</th><th>Fechas</th><th>Avance</th><th>Responsable</th></tr></thead><tbody>${rows.map((p) => `<tr><td><code>${p.code}</code></td><td>${esc(p.name)}</td><td class="n">${p.h}</td><td>${esc(p.dates)}</td><td><div class="pb"><i style="width:${p.pct}%"></i><span>${p.pct} %</span></div></td><td>${esc(p.resp)}</td></tr>`).join("")}</tbody></table>`;
      $$(".chip", b).forEach((c) => c.setAttribute("aria-pressed", c.dataset.r === f));
    };
    $$(".chip", b).forEach((c) => ctx.on(c, "click", () => { f = c.dataset.r; draw(); })); draw();
  });

  /* ============ 16 · PDM ============ */
  K.add("pla", "Red de precedencia (PDM) y holgura", "PDM método de diagramación por precedencia actividades predecesoras ES EF LS LF holgura ruta crítica", (b, ctx) => {
    const act = {}; A.actividades.rows.forEach((r) => (act[r[0]] = { id: r[0], name: r[1], d: K.num(r[2]), pre: r[3], es: K.num(r[4]), ef: K.num(r[5]), ls: K.num(r[6]), lf: K.num(r[7]), slack: K.num(r[8]), dates: r[9] }));
    const pos = { A: [0, 0], F: [1, 0], G: [1, 1], H: [2, 0.5], I: [3, 0.5], J: [4, 0.5], B: [0, 2.3], C: [1, 2.3], D: [2, 2.3], E: [3, 2.3], K: [4, 2.3], L: [5, 2.3] };
    const edges = [["A", "F"], ["A", "G"], ["F", "H"], ["G", "H"], ["H", "I"], ["I", "J"], ["B", "C"], ["C", "D"], ["D", "E"], ["E", "K"], ["K", "L"]];
    const wrap = (t) => { const w = t.split(" "); let a = "", c = ""; for (const x of w) { if (!c && (a + " " + x).trim().length <= 19) a = (a + " " + x).trim(); else c = (c + " " + x).trim(); } return [a, c.length > 24 ? c.slice(0, 23) + "…" : c]; };
    const W = 178, H = 88, X = 192, Y = 102, ox = 8, oy = 4, P = (id) => ({ x: ox + pos[id][0] * X, y: oy + pos[id][1] * Y });
    const sl = (n) => (n.slack === 0 ? "s0" : n.slack <= 2 ? "s2" : "s8");
    const path = ([a, c]) => { const p = P(a), q = P(c); return `M${p.x + W} ${p.y + H / 2} C${p.x + W + 14} ${p.y + H / 2}, ${q.x - 14} ${q.y + H / 2}, ${q.x} ${q.y + H / 2}`; };
    b.innerHTML = `<div class="pdm"><svg viewBox="0 0 1184 330" role="img" aria-label="Red de precedencia"><defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1 1L9 5 1 9z" fill="var(--ink)"/></marker></defs>
      ${edges.map((e) => `<path class="pe" d="${path(e)}" marker-end="url(#ar)"/>`).join("")}
      <text x="${P("E").x + W + 4}" y="${P("E").y + H + 18}" class="ov">solape −2 d</text>
      ${Object.values(act).map((n) => { const p = P(n.id); return `<g class="pn ${sl(n)}" data-id="${n.id}" transform="translate(${p.x},${p.y})"><rect width="${W}" height="${H}" rx="10"/><text x="10" y="18" class="t1">${n.id} · ${esc(wrap(n.name)[0])}</text><text x="10" y="33" class="t1">${esc(wrap(n.name)[1])}</text><text x="10" y="55" class="t2">${n.d} d · holgura ${n.slack}</text><text x="10" y="75" class="t3">ES ${n.es}  EF ${n.ef}  LS ${n.ls}  LF ${n.lf}</text></g>`; }).join("")}</svg>
      <div class="pdm-l"><span><i class="s0"></i>holgura 0 (fecha fija)</span><span><i class="s2"></i>holgura 2 (menor margen de la entrega de BD II)</span><span><i class="s8"></i>holgura 8 o más</span></div>
      <aside class="pdm-d"></aside></div>`;
    const d = $(".pdm-d", b), nodes = $$(".pn", b);
    const show = (id) => { const n = act[id]; nodes.forEach((g) => g.classList.toggle("sel", g.dataset.id === id));
      d.innerHTML = `<h3>${n.id} · ${esc(n.name)}</h3><p><b>Duración:</b> ${n.d} días · <b>Predecesoras:</b> ${esc(n.pre)} · <b>Fechas:</b> ${esc(n.dates)}</p><p><b>Inicio temprano</b> ${n.es} · <b>Fin temprano</b> ${n.ef} · <b>Inicio tardío</b> ${n.ls} · <b>Fin tardío</b> ${n.lf} · <b>Holgura</b> ${n.slack} d <span class="mut">(días desde el 26 de octubre)</span></p>`; };
    nodes.forEach((g) => ctx.on(g, "click", () => show(g.dataset.id)));
    const steps = [["BD II", ["B", "C", "D", "E", "K", "L"]], ["Gestión", ["A", "F", "G", "H", "I", "J"]]];
    // ruta con menor holgura de BD II: se dibuja resaltada en el último paso
    ctx.builds(3, (i) => { nodes.forEach((g) => g.classList.toggle("off", i === 0 && !steps[0][1].includes(g.dataset.id))); $$(".pe", b).forEach((p, k) => p.classList.toggle("off", i === 0 && k < 6)); $$(".pn", b).forEach((g) => g.classList.toggle("dimm", i === 2 && act[g.dataset.id].slack > 2)); show(i === 2 ? "E" : i === 1 ? "A" : "B"); });
  });

  /* ============ 17 · ruta crítica y PERT ============ */
  K.add("pla", "Ruta crítica y estimación PERT", "ruta crítica CPM PERT tres valores optimista probable pesimista probabilidad 74% desviación z", (b, ctx) => {
    const chain = A.pert.rows.map((r) => ({ id: r[0], name: r[1], o: K.num(r[2]), m: K.num(r[3]), p: K.num(r[4]) })), base = chain.map((c) => ({ ...c })), OV = 2, AV = 33;
    b.innerHTML = `<div class="pert"><div class="pert-l"><h3>Cadena de Bases de Datos II <small>B → C → D → E → K → L</small></h3>${chain.map((c, i) => `<div class="pr" data-i="${i}"><span class="pid">${c.id}</span><span class="pnm">${esc(c.name)}</span>
      ${["o", "m", "p"].map((k) => `<label>${k.toUpperCase()}<input type="range" min="1" max="16" step="1" value="${c[k]}" data-k="${k}"><b>${c[k]}</b></label>`).join("")}<em class="pe2">—</em></div>`).join("")}
      <button type="button" class="btn" id="rs">Restablecer valores del plan</button></div>
      <aside class="pert-r"><div class="gauge"><svg viewBox="0 0 200 120"><path class="gb" d="M20 100 A80 80 0 0 1 180 100"/><path class="gf" d="M20 100 A80 80 0 0 1 180 100" pathLength="100" stroke-dasharray="0 100"/></svg><div class="gv"><b>0 %</b><span>probabilidad de cumplir</span></div></div>
      <dl><div><dt>Duración esperada</dt><dd class="eE">—</dd></div><div><dt>Desviación (σ)</dt><dd class="eS">—</dd></div><div><dt>Días disponibles</dt><dd>${AV}</dd></div><div><dt>z = (${AV} − E) / σ</dt><dd class="eZ">—</dd></div></dl>
      <p class="fx"><code>E = (O + 4M + P) / 6</code> · <code>σ = (P − O) / 6</code> · se restan ${OV} días por el solape de K con E · σ total = √(Σσ²)</p>
      <div class="call info"><b>Para subir la probabilidad</b>Empezar el ETL con datos reales ya (C), no esperar la presentación de la tarea del 30 de octubre (B), y mantener el solape de K con E.</div></aside></div>
      <p class="foot">Los valores O/M/P son estimaciones del autor del borrador; el grupo debe validarlas. J (exposición) tiene holgura 0 porque su fecha la fija el calendario del curso.</p>`;
    const calc = () => { let E = 0, V = 0;
      chain.forEach((c, i) => { const e = Math.round(((c.o + 4 * c.m + c.p) / 6) * 10) / 10, s = Math.round(((c.p - c.o) / 6) * 100) / 100; E += e; V += s * s; $$(".pr", b)[i].querySelector(".pe2").textContent = `E ${e.toFixed(1)} · σ ${s.toFixed(2)}`; });
      E -= OV; const S = Math.sqrt(V), z = (AV - E) / S, pr = phi(z) * 100;
      $(".eE", b).textContent = E.toFixed(1) + " d"; $(".eS", b).textContent = S.toFixed(2) + " d"; $(".eZ", b).textContent = z.toFixed(2);
      $(".gv b", b).textContent = pr.toFixed(0) + " %"; $(".gf", b).style.strokeDasharray = `${pr} 100`; $(".gf", b).style.stroke = pr >= 80 ? "var(--ok)" : pr >= 60 ? "var(--warn)" : "var(--bad)"; };
    $$("input", b).forEach((inp) => ctx.on(inp, "input", () => { const i = +inp.closest(".pr").dataset.i; chain[i][inp.dataset.k] = +inp.value; inp.nextElementSibling.textContent = inp.value; calc(); }));
    ctx.on($("#rs", b), "click", () => { base.forEach((c, i) => ["o", "m", "p"].forEach((k) => { chain[i][k] = c[k]; const inp = $$(".pr", b)[i].querySelector(`[data-k="${k}"]`); inp.value = c[k]; inp.nextElementSibling.textContent = c[k]; })); calc(); });
    calc();
  });

  /* ============ 18 · Gantt ============ */
  K.add("pla", "Cronograma (Gantt) de las actividades restantes", "gantt cronograma actividades restantes ruta crítica 26 octubre 28 noviembre", (b, ctx) => {
    const rows = A.actividades.rows.map((r) => ({ id: r[0], name: r[1], es: K.num(r[4]), ef: K.num(r[5]), sl: K.num(r[8]) })), T = 33, crit = ["K", "L", "J"];
    const sec = [["Bases de Datos II (cadena con menor holgura)", ["B", "C", "D", "E", "K", "L"]], ["Administración de Proyectos", ["A", "F", "G", "H", "I", "J"]]];
    const d0 = new Date(2026, 9, 26), tick = (n) => new Date(d0.getTime() + n * 864e5), lab = (d) => `${d.getDate()} ${["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][d.getMonth()]}`;
    const now = Math.round((new Date() - d0) / 864e5), showNow = now >= 0 && now <= T;
    b.innerHTML = `<div class="gantt"><div class="g-ax">${[0, 7, 14, 21, 28].map((n) => `<span style="left:${(n / T) * 100}%">${lab(tick(n))}</span>`).join("")}<span style="left:100%" class="end">${lab(tick(T))}</span></div>
      ${sec.map(([t, ids]) => `<div class="g-s"><h4>${t}</h4>${ids.map((id) => { const r = rows.find((x) => x.id === id); return `<div class="g-r"><span class="g-n"><b>${r.id}</b> ${esc(r.name)}</span><div class="g-t">${[7, 14, 21, 28].map((n) => `<i class="gl" style="left:${(n / T) * 100}%"></i>`).join("")}<div class="g-b ${crit.includes(id) ? "crit" : ""}" style="left:${(r.es / T) * 100}%;width:${((r.ef - r.es) / T) * 100}%"><span>${r.ef - r.es} d</span></div></div></div>`; }).join("")}</div>`).join("")}
      ${showNow ? `<div class="g-now" style="left:calc(260px + (100% - 260px) * ${now / T})"><span>hoy</span></div>` : ""}</div>
      <p class="foot">Días calendario desde el lunes 26 de octubre de 2026 (método de precedencias). En rojo, las actividades críticas: K y L cierran la entrega de BD II con 2 días de holgura; J, la exposición, tiene la fecha fija por el calendario del curso. El trabajo ya hecho está en el diccionario de paquetes.</p>`;
    const bars = $$(".g-b", b); ctx.builds(bars.length + 1, (i) => bars.forEach((e, k) => e.classList.toggle("on", k < i || i === bars.length)));
  });

  /* ============ 19 · costos y reservas ============ */
  K.add("pla", "Costos y reservas", "costos reservas contingencia gestión BAC 168 horas 13% 21.8 8.4 198.2 horas-persona", (b, ctx) => {
    const need = A.riesgos.rows.reduce((a, r) => a + K.num(r[9]), 0);
    b.innerHTML = `<div class="cost"><div class="cs-l"><div class="bac"><div class="bar"><i class="b1" style="flex:0"></i><i class="b2" style="flex:0"></i><i class="b3" style="flex:0"></i></div>
      <ul class="lg"><li><i class="b1"></i>BAC · presupuesto base <b>${BAC} h</b></li><li><i class="b2"></i>Reserva de contingencia <b class="rc">—</b></li><li><i class="b3"></i>Reserva de gestión (5 %) <b>${(BAC * 0.05).toFixed(1)} h</b></li></ul></div>
      <div class="total">Presupuesto con reservas <b class="tt">—</b></div>
      <p>No hay gasto monetario: <b>Q 0</b>. Se usan Docker y software libre en equipos propios, así que el costo se mide en <b>horas-persona</b>. El método es el mismo con quetzales.</p></div>
      <aside class="cs-r"><h3>¿Por qué 13 % y no 10 %?</h3><p>Las respuestas a los riesgos identificados suman <b>${need} h</b> (columna «Reserva» del registro). Mueve el porcentaje y mira si alcanza:</p>
        <label class="sl">Reserva de contingencia <b class="pc">13 %</b><input type="range" min="5" max="20" step="1" value="13" id="pc"></label>
        <div class="cov"><span>Reserva</span><b class="cv1">—</b><span>Necesario</span><b>${need} h</b><span>Margen</span><b class="mg">—</b></div><div class="verd2"></div>
        <p class="mut">La sesión 10 sugiere 10 % del BAC. Se reajusta la reserva cuando cambia la priorización de riesgos. La reserva de gestión (imprevistos no identificados) queda bajo control del líder.</p></aside></div>`;
    const calc = () => { const p = +$("#pc", b).value, rc = +(BAC * p / 100).toFixed(1), rg = +(BAC * 0.05).toFixed(1), tot = BAC + rc + rg, mg = +(rc - need).toFixed(1);
      $(".pc", b).textContent = p + " %"; $(".rc", b).textContent = `${p} % = ${rc} h`; $(".tt", b).textContent = tot.toFixed(1) + " h"; $(".cv1", b).textContent = rc + " h"; $(".mg", b).textContent = (mg >= 0 ? "+" : "") + mg + " h";
      $(".b1", b).style.flex = BAC; $(".bar .b2", b).style.flex = rc; $(".bar .b3", b).style.flex = rg;
      const v = $(".verd2", b); v.className = "verd2 " + (mg >= 0 ? "ok" : "bad"); v.textContent = mg >= 0 ? `Cubre las ${need} h de respuestas con ${mg} h de margen.` : `No alcanza: faltan ${Math.abs(mg)} h.`; };
    ctx.on($("#pc", b), "input", calc); requestAnimationFrame(calc);
  });

  /* ============ 20 · valor ganado ============ */
  K.add("pla", "Valor ganado: calculadora", "valor ganado EVM EV PV SPI CPI EAC AC avance BAC", (b, ctx) => {
    const PV0 = K.num(A.evm.rows.find((r) => r[0].startsWith("PV"))[1]), pct = pk.map((p) => p.pct);
    b.innerHTML = `<div class="evm"><div class="ev-l">${pk.map((p, i) => `<label class="ev-r" title="${esc(p.name)}"><span><code>${p.code}</code>${esc(p.name)}</span><small>${p.h} h</small><input type="range" min="0" max="100" step="5" value="${p.pct}" data-i="${i}"><b>${p.pct} %</b></label>`).join("")}</div>
      <aside class="ev-r2"><div class="kp"><div><small>EV · valor ganado</small><b class="vEV">—</b></div><div><small>Avance = EV / BAC</small><b class="vAV">—</b></div><div><small>SPI = EV / PV</small><b class="vSPI">—</b></div><div><small>CPI = EV / AC</small><b class="vCPI">pendiente</b></div></div>
        <div class="in2"><label>PV (valor planificado, h) <input type="number" id="pv" value="${PV0}" step="0.1" min="0"></label><label class="acf">AC · horas reales del grupo (h) <input type="number" id="ac" placeholder="escribe aquí el total de horas" step="0.5" min="0"></label></div>
        <div class="vd"></div><div class="call warn"><b>Antes de reportarlo</b>${fmt(A.evm.rows.find((r) => r[0].startsWith("AC"))[2])}. El SPI mayor que 1 depende de porcentajes y horas que son <b>estimaciones del borrador</b>; no debe reportarse como resultado hasta validarlos con el grupo.</div>
        <button type="button" class="btn" id="rs2">Restablecer al corte del 24 de octubre</button></aside></div>`;
    const calc = () => { const ev = pk.reduce((a, p, i) => a + (p.h * pct[i]) / 100, 0), pv = +$("#pv", b).value || 0, ac = +$("#ac", b).value || 0, spi = pv ? ev / pv : 0;
      $(".vEV", b).textContent = ev.toFixed(1) + " h"; $(".vAV", b).textContent = ((ev / BAC) * 100).toFixed(0) + " %"; $(".vSPI", b).textContent = spi.toFixed(2);
      const cpi = ac ? ev / ac : null; $(".vCPI", b).textContent = cpi ? cpi.toFixed(2) : "pendiente";
      const eac = cpi ? BAC / cpi : null;
      $(".vd", b).innerHTML = `<p>${spi >= 1 ? `<b class="okc">Adelantados:</b> debíamos llevar ${pv} h a hoy y llevamos ${ev.toFixed(1)} h.` : `<b class="badc">Atrasados:</b> debíamos llevar ${pv} h y llevamos ${ev.toFixed(1)} h.`}</p>${cpi ? `<p>${cpi >= 1 ? "Gastamos menos de lo ganado" : "Gastamos más de lo ganado"} · <b>EAC = BAC / CPI = ${eac.toFixed(1)} h</b> si el desempeño de costo continúa.</p>` : `<p class="mut">CPI y EAC no se pueden calcular sin el costo real (AC): el grupo debe registrar las horas realmente trabajadas.</p>`}`;
      const spiEl = $(".vSPI", b); spiEl.style.color = spi >= 1 ? "var(--ok)" : "var(--bad)"; };
    $$("input[type=range]", b).forEach((inp) => ctx.on(inp, "input", () => { pct[+inp.dataset.i] = +inp.value; inp.nextElementSibling.textContent = inp.value + " %"; calc(); }));
    ctx.on($("#pv", b), "input", calc); ctx.on($("#ac", b), "input", calc);
    ctx.on($("#rs2", b), "click", () => { pk.forEach((p, i) => { pct[i] = p.pct; const inp = $$("input[type=range]", b)[i]; inp.value = p.pct; inp.nextElementSibling.textContent = p.pct + " %"; }); $("#pv", b).value = PV0; $("#ac", b).value = ""; calc(); });
    calc();
  });

  /* ============ 21 · matriz poder / interés ============ */
  K.add("int", "Matriz poder / interés", "interesados poder interés cuadrantes gestionar atentamente mantener informado monitorear mantener satisfecho", (b, ctx) => {
    const sk = A.interesados.rows.map((r) => ({ id: r[0], name: r[1], tipo: r[2], exp: r[3], pw: K.num(r[4]), it: K.num(r[5]), q: r[6] }));
    const strat = Object.fromEntries(A.estrategia.rows.map((r) => [r[0], r[3]])), CQ = { "Gestionar atentamente": "pink", "Mantener informado": "yellow", Monitorear: "green", "Mantener satisfecho": "blue" };
    const groups = {}; sk.forEach((s) => (groups[s.pw + "," + s.it] = (groups[s.pw + "," + s.it] || []).concat(s)));
    sk.forEach((s) => { const g = groups[s.pw + "," + s.it]; s.k = g.indexOf(s); s.n = g.length; });
    const XM = { 1: 10, 2: 24, 3: 40, 4: 64, 5: 86 }, YM = { 5: 14, 4: 36, 3: 60, 2: 76, 1: 90 };   // 4 y 5 = alto: quedan en la mitad de arriba / derecha
    const X = (s) => XM[s.it] + (s.n > 1 ? (s.k - (s.n - 1) / 2) * 4.6 : 0), Y = (s) => YM[s.pw] + (s.n > 1 ? (s.k % 2 ? 4.5 : -4.5) : 0);
    b.innerHTML = `<div class="mx"><div class="mx-p"><div class="q q1"><span>Mantener satisfecho</span></div><div class="q q2"><span>Gestionar atentamente</span></div><div class="q q3"><span>Monitorear</span></div><div class="q q4"><span>Mantener informado</span></div>
        <span class="ax x">Interés →</span><span class="ax y">Poder →</span>${sk.map((s, i) => `<button type="button" class="pt" style="left:${X(s)}%;top:${Y(s)}%;--c:var(--c-${CQ[s.q]});--d:${i * 60}ms" data-i="${i}" title="${esc(s.name)}">${s.id.replace("STK-", "")}</button>`).join("")}</div>
      <aside class="mx-d"></aside></div><p class="foot">Regla de cuadrantes: alto = 4 o 5. Poder e interés son una valoración inicial del grupo y deben validarse.</p>`;
    const d = $(".mx-d", b), pts = $$(".pt", b);
    const show = (i) => { const s = sk[i]; pts.forEach((p, k) => p.classList.toggle("sel", k === i));
      d.innerHTML = `<span class="badge" style="background:var(--c-${CQ[s.q]})">${esc(s.q)}</span><h3>${esc(s.id)} · ${fmt(s.name)}</h3><p class="mut">${esc(s.tipo)} · poder ${s.pw} · interés ${s.it}</p><h4>Expectativa principal</h4><p>${fmt(s.exp)}</p><h4>Estrategia</h4><p class="strat">${fmt(strat[K.plain(s.name)] || strat[s.name] || "")}</p>`; };
    pts.forEach((p, i) => ctx.on(p, "click", () => show(i)));
    ctx.builds(2, (i) => { $(".mx-p", b).classList.toggle("pts", i === 1); }); show(0);
  });

  /* ============ 22 · estrategia por interesado ============ */
  K.add("int", "Estrategia por interesado", "estrategia interesados cuadrante docentes equipo Grupo 8 ministerio hospitales seguro social centros organismos aseguradoras pacientes", (b, ctx) => {
    const order = ["Gestionar atentamente", "Mantener informado", "Monitorear", "Mantener satisfecho"], CQ = { "Gestionar atentamente": "pink", "Mantener informado": "yellow", Monitorear: "green", "Mantener satisfecho": "blue" };
    b.innerHTML = `<div class="est">${order.map((q, i) => `<section style="--c:var(--c-${CQ[q]});--d:${i * 100}ms"><h3>${q} <small>${A.estrategia.rows.filter((r) => r[2] === q).length}</small></h3>${A.estrategia.rows.filter((r) => r[2] === q).map((r) => `<article><b>${fmt(r[0])}</b><span>${fmt(r[3])}</span></article>`).join("") || '<p class="mut">Ningún interesado cae en este cuadrante.</p>'}</section>`).join("")}</div>`;
    const c = $$(".est > section", b); ctx.builds(4, (i) => c.forEach((e, k) => e.classList.toggle("on", k <= i)));
  });

  /* ============ 23 · plan de comunicaciones ============ */
  K.add("int", "Plan de comunicaciones", "comunicaciones plantilla S13 a quién qué cuándo cómo quién formato reglas", (b, ctx) => {
    const t = A.comunicaciones;
    b.innerHTML = `<div class="com"><div class="com-t">${K.tbl(t, { cols: [0, 2, 3, 4, 5], rowCls: () => "clk", heads: { 0: "A quién", 2: "Qué", 3: "Cuándo", 4: "Cómo", 5: "Quién" } })}</div><aside class="com-d"></aside></div>
      <div class="reglas">${A.reglas_com.map((r, i) => `<div><i>${i + 1}</i><span>${fmt(r)}</span></div>`).join("")}</div>`;
    const rows = $$("tbody tr", b), d = $(".com-d", b);
    const show = (i) => { rows.forEach((r, k) => r.classList.toggle("sel", k === i)); const r = t.rows[i];
      d.innerHTML = `<h3>${fmt(r[0])}</h3><h4>Expectativa (por qué)</h4><p>${fmt(r[1])}</p><h4>Formato (plantilla)</h4><p>${fmt(r[6])}</p>`; };
    rows.forEach((r, i) => ctx.on(r, "click", () => show(i))); ctx.builds(rows.length, show);
  });

  /* ============ 24 · reporte de estado ============ */
  K.add("int", "Reporte de estado (plantilla de la sesión 13)", "reporte de estado CPI SPI EAC avance desempeño riesgos acciones corte 24 octubre", (b, ctx) => {
    const g = (k) => A.reporte.rows.find((r) => r[0] === k)[1], T = A.reporte_texto;
    b.innerHTML = `<div class="rep"><div class="rep-h">${["Proyecto", "Período", "Para", "Elabora"].map((k) => `<div><small>${k}</small><b>${fmt(g(k))}</b></div>`).join("")}</div>
      <div class="rep-k"><div class="k est"><small>Avance = EV / BAC</small><b>${K.plain(g("Avance")).split("(")[0].trim()}</b><span>estimado, por validar</span></div><div class="k est"><small>SPI</small><b>${K.plain(g("SPI")).split(" ")[0]}</b><span>EV 110.1 h / PV 86.6 h · estimado, por validar</span></div><div class="k pend"><small>CPI</small><b>pendiente</b><span>falta el costo real (AC)</span></div><div class="k pend"><small>EAC</small><b>pendiente</b><span>requiere CPI · BAC = ${BAC} h</span></div></div>
      <div class="rep-c"><section><h3>Desempeño</h3><p>${fmt(T["Desempeño"])}</p></section><section><h3>Riesgos principales</h3><p>${fmt(T["Riesgos principales"])}</p></section><section><h3>Acciones y decisiones</h3><p>${fmt(T["Acciones y decisiones"])}</p></section></div>
      <p class="foot">Borrador generado con IA: <b>sí</b> · Verificado por: ____________________ · Fecha: ____________. Corte: 24 de octubre de 2026; el SPI está sujeto a validar los porcentajes de avance.</p></div>`;
    const c = $$(".rep-c section", b); ctx.builds(4, (i) => { $(".rep-k", b).classList.add("on"); c.forEach((e, k) => e.classList.toggle("on", k < i)); });
  });
})();
