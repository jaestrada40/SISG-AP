/* Diapositivas 25 a 40: riesgos, calidad, normas, cierre y preguntas. */
(function () {
  "use strict";
  const K = window.K, A = K.A, esc = K.esc, fmt = K.fmt, $ = K.$, $$ = K.$$;
  const COL = { ok: "Cumple", run: "En curso", pend: "Pendiente" };
  const st = (txt) => { const s = K.status(txt); return `<span class="badge ${s}">${COL[s]}</span>`; };
  const LV = { Alta: 3, Alto: 3, Media: 2, Medio: 2, Baja: 1, Bajo: 1 };
  const rk = A.riesgos.rows.map((r) => ({ id: r[0], cat: r[1], name: r[2], p: r[3], i: r[4], lv: K.plain(r[5]), why: r[6], resp: r[7], who: r[8], h: K.num(r[9]) || 0 }));
  const LC = { Crítico: "pink", Alto: "orange", Medio: "yellow", Bajo: "green" };

  /* ============ 25 · ciclo del riesgo ============ */
  K.add("rie", "El ciclo del riesgo (ISO 21502 §7.8 · NIST 800-30)", "ciclo riesgos preparar conducir comunicar mantener NIST 800-30 ISO 21502 matriz 3x3 horizonte", (b, ctx) => {
    const st4 = [["Preparar", "blue", "1"], ["Conducir", "purple", "2"], ["Comunicar", "orange", "3"], ["Mantener", "green", "4"]];
    b.innerHTML = `<div class="cic">${st4.map(([k, c, n], i) => `<article style="--c:var(--c-${c});--d:${i * 90}ms"><header><i>${n}</i><b>${k}</b></header><p>${fmt(A.ciclo_riesgos[k])}</p></article>`).join("")}</div>
      <p class="foot">NIST SP 800-30 Rev. 1 organiza la evaluación en cuatro pasos; ISO 21502 §7.8 exige identificar, valorar y responder a los riesgos durante todo el proyecto.</p>`;
    const c = $$(".cic article", b); ctx.builds(5, (i) => c.forEach((e, k) => e.classList.toggle("on", i === 4 || k === i)));
  });

  /* ============ 26 · matriz 3x3 ============ */
  K.add("rie", "Matriz de riesgos 3×3 y RBS", "matriz probabilidad impacto 3x3 RBS categorías crítico alto medio bajo riesgos R2 R14", (b, ctx) => {
    const cell = {}; rk.forEach((r) => { const k = LV[r.p] + "," + LV[r.i]; (cell[k] = cell[k] || []).push(r); });
    const bg = (p, i) => { const s = p * i; return s >= 9 ? "#f2b3ad" : s >= 6 ? "#f4c9a0" : s >= 3 ? "#f6e2a8" : "#dcebc8"; };
    let sel = null;
    b.innerHTML = `<div class="mz"><div class="mz-g"><span class="ya">Probabilidad ↑</span>${[3, 2, 1].map((p) => [1, 2, 3].map((i) => `<div class="mc" style="background:${bg(p, i)}">${(cell[p + "," + i] || []).map((r) => `<button type="button" class="rp" data-id="${r.id}" style="--c:var(--c-${LC[r.lv]})">${r.id}</button>`).join("")}</div>`).join("")).join("")}<span class="xa">Impacto →</span></div>
      <aside class="mz-d"><div class="mz-rbs"><h4>RBS · categorías</h4>${A.rbs.rows.map((r) => `<span class="rb"><b>${esc(r[0])}</b> ${esc(r[1])}</span>`).join("")}</div><div class="mz-i"></div></aside></div>`;
    const d = $(".mz-i", b), show = (id) => { const r = rk.find((x) => x.id === id); $$(".rp", b).forEach((e) => e.classList.toggle("sel", e.dataset.id === id));
      d.innerHTML = `<span class="badge" style="background:var(--c-${LC[r.lv]})">${esc(r.lv)}</span><h3>${r.id} · ${esc(r.cat)}</h3><p>${fmt(r.name)}</p><p class="mut">Prob. ${r.p} · Impacto ${r.i} · ${r.h} h de reserva</p><p><b>Porque:</b> ${fmt(r.why)}</p>`; };
    $$(".rp", b).forEach((e) => ctx.on(e, "click", () => show(e.dataset.id))); show("R2");
  });

  /* ============ 27 · registro de riesgos ============ */
  K.add("rie", "Registro de riesgos y respuestas", "registro de riesgos R2 R14 estrategia mitigar evitar transferir aceptar respuesta responsable reserva horas", (b, ctx) => {
    let f = "Todos"; const levels = ["Todos", "Crítico", "Alto", "Medio", "Bajo"];
    b.innerHTML = `<div class="rg"><div class="chips">${levels.map((l) => `<button type="button" class="chip" data-l="${l}" aria-pressed="${l === f}">${l}</button>`).join("")}</div><div class="rg-b"><div class="rg-t"></div><aside class="rg-d"></aside></div></div>`;
    const t = $(".rg-t", b), d = $(".rg-d", b), show = (r) => { $$(".rg-t tr[data-id]", b).forEach((x) => x.classList.toggle("sel", x.dataset.id === r.id));
      d.innerHTML = `<span class="badge" style="background:var(--c-${LC[r.lv]})">${esc(r.lv)}</span><h3>${r.id} · ${fmt(r.name)}</h3><h4>Por qué</h4><p>${fmt(r.why)}</p><h4>Respuesta</h4><p>${fmt(r.resp)}</p><p class="mut">Responsable: ${esc(r.who)} · Reserva: ${r.h} h</p>`; };
    const draw = () => { const rows = rk.filter((r) => f === "Todos" || r.lv === f);
      t.innerHTML = `<table class="dt"><thead><tr><th>Id</th><th>Riesgo</th><th>P</th><th>I</th><th>Nivel</th><th>h</th></tr></thead><tbody>${rows.map((r) => `<tr class="clk" data-id="${r.id}"><td><b>${r.id}</b></td><td>${fmt(r.name.length > 62 ? r.name.slice(0, 61) + "…" : r.name)}</td><td>${esc(r.p)}</td><td>${esc(r.i)}</td><td><span class="badge" style="background:var(--c-${LC[r.lv]})">${esc(r.lv)}</span></td><td class="n">${r.h}</td></tr>`).join("")}</tbody></table>`;
      $$("tr[data-id]", t).forEach((tr) => tr.onclick = () => show(rk.find((x) => x.id === tr.dataset.id)));
      $$(".chip", b).forEach((c) => c.setAttribute("aria-pressed", c.dataset.l === f)); if (rows[0]) show(rows[0]); else d.innerHTML = '<p class="mut">Sin riesgos en este nivel.</p>'; };
    $$(".chip", b).forEach((c) => ctx.on(c, "click", () => { f = c.dataset.l; draw(); })); draw();
  });

  /* ============ 28 · modelo NIST ============ */
  K.add("rie", "Modelo NIST: del evento al impacto", "NIST 800-30 fuente de amenaza evento vulnerabilidad condición predisponente impacto adverso probabilidad severidad CVSS no es riesgo", (b, ctx) => {
    const rows = A.nist.rows; let cur = 0;
    b.innerHTML = `<div class="nst"><div class="chips">${rows.map((r, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="${i === 0}">${esc(r[0])}</button>`).join("")}</div><div class="nst-f"></div><div class="call info"><b>Severidad no es riesgo</b>${fmt(A.ciclo_riesgos.Conducir.split("Se recuerda que")[1] || "")}</div></div>`;
    const f = $(".nst-f", b), L = ["Fuente de amenaza", "Evento de amenaza", "Vulnerabilidad", "Condición predisponente", "Probabilidad", "Impacto adverso"], CC = ["pink", "orange", "yellow", "green", "blue", "purple"];
    const draw = (n) => { cur = n; const r = rows[n]; f.innerHTML = r.slice(1).map((v, i) => `<div class="nb" style="--c:var(--c-${CC[i]});--d:${i * 80}ms"><small>${L[i]}</small><p>${fmt(v)}</p></div>`).join(""); $$(".chip", b).forEach((c) => c.setAttribute("aria-pressed", +c.dataset.i === n)); };
    $$(".chip", b).forEach((c) => ctx.on(c, "click", () => draw(+c.dataset.i))); draw(0);
  });

  /* ============ 29 · contingencia y oportunidades ============ */
  K.add("rie", "Plan de contingencia y oportunidades", "contingencia disparador método alternativo oportunidades compartir reserva de contingencia gestión", (b, ctx) => {
    b.innerHTML = `<div class="ctg"><section><h3>Si pasa esto… hacemos esto</h3>${A.contingencia.rows.map((r) => `<article><b>${esc(r[0])}</b><div><small>Disparador</small><p>${fmt(r[1])}</p></div><div class="arr">→</div><div><small>Método alternativo</small><p>${fmt(r[2])}</p></div><em>${esc(r[3])}</em></article>`).join("")}</section>
      <section class="op"><h3>Oportunidades</h3>${A.oportunidades.rows.map((r) => `<article><b>${esc(r[0])} · ${esc(r[2])}</b><p>${fmt(r[1])}</p><small>${fmt(r[3])}</small></article>`).join("")}</section></div>`;
    const a = $$(".ctg article", b); ctx.builds(a.length + 1, (i) => a.forEach((e, k) => e.classList.toggle("on", i === a.length || k < i)));
  });

  /* ============ 30 · inventario CVE ============ */
  K.add("rie", "Inventario de equipos y CVE", "inventario equipos CVE CVSS NVD macOS riesgo residual parte B vulnerabilidad vigente actualizaciones", (b, ctx) => {
    const rows = A.inventario.rows;
    b.innerHTML = `<div class="inv">${rows.map((r, i) => `<article style="--d:${i * 100}ms"><header><i>${esc(r[0])}</i><b>${esc(r[1])}</b><small>compilación ${esc(r[2])}</small></header><h4>Frente a la vulnerabilidad base</h4><p>${fmt(r[3])}</p><h4>Decisión</h4><p>${fmt(r[4])}</p><h4>CVE vigente de su versión</h4><p>${fmt(r[5])}</p></article>`).join("")}</div>
      <p class="foot">CVSS mide <b>severidad</b> de la vulnerabilidad; el <b>riesgo</b> depende además de si el equipo está expuesto. Fuente: NVD.</p>`;
    const a = $$(".inv article", b); ctx.builds(a.length + 1, (i) => a.forEach((e, k) => e.classList.toggle("on", i === a.length || k < i)));
  });

  /* ============ 31 · especificación de calidad ============ */
  K.add("cal", "Especificación de calidad medible", "calidad especificación atributo unidad cómo se mide mínimo meta estado fiabilidad ISO 25010 ISO 21502 §7.11", (b, ctx) => {
    const rows = A.calidad.rows, c = { ok: 0, run: 0, pend: 0 }; rows.forEach((r) => c[K.status(r[5])]++);
    b.innerHTML = `<div class="ql"><div class="ql-s"><span class="badge ok">${c.ok} cumplen</span><span class="badge run">${c.run} en curso</span><span class="badge pend">${c.pend} pendientes</span></div><div class="ql-t">${K.tbl(A.calidad, { fmt: (v, ci) => (ci === 5 ? `${st(v)} <small>${fmt(v.replace(/^\*\*[^*]+\*\*:?\s*/, ""))}</small>` : fmt(v)), num: false })}</div></div>`;
  });

  /* ============ 32 · dominios ============ */
  K.add("cal", "La calidad en los siete dominios del PMBOK 8", "PMBOK 8 dominios calidad gobernanza alcance cronograma finanzas recursos riesgo interesados", (b, ctx) => {
    const rows = A.dominios.rows, CC = ["blue", "purple", "green", "teal", "yellow", "orange", "pink"];
    b.innerHTML = `<div class="dom">${rows.map((r, i) => `<article style="--c:var(--c-${CC[i % 7]});--d:${i * 70}ms"><b>${esc(r[0])}</b><em>${fmt(r[1])}</em><p>${fmt(r[2])}</p></article>`).join("")}</div>`;
    const a = $$(".dom article", b); ctx.builds(a.length + 1, (i) => a.forEach((e, k) => e.classList.toggle("on", i === a.length || k < i)));
  });

  /* ============ 33 · normas ============ */
  K.add("cal", "Normas y estándares: dónde se aplica cada una", "normas estándares PMBOK ISO 21502 ISO 25010 NIST CVSS CVE Scrum Guide IEEE", (b, ctx) => {
    const rows = A.normas.rows;
    b.innerHTML = `<div class="nrm"><div class="nrm-l">${rows.map((r, i) => `<button type="button" data-i="${i}">${esc(r[0])}</button>`).join("")}</div><aside class="nrm-d"></aside></div>`;
    const d = $(".nrm-d", b), bt = $$(".nrm-l button", b), show = (i) => { bt.forEach((x, k) => x.classList.toggle("sel", k === i)); const r = rows[i]; d.innerHTML = `<h3>${esc(r[0])}</h3><h4>Qué es</h4><p>${fmt(r[1])}</p><h4>Dónde la aplicamos en SISG</h4><p class="strat">${fmt(r[2])}</p>`; };
    bt.forEach((x, i) => ctx.on(x, "click", () => show(i))); ctx.builds(rows.length, show);
  });

  /* ============ 34 · defectos y SUS ============ */
  K.add("cal", "Defectos corregidos y prueba de usabilidad (SUS)", "defectos usabilidad SUS System Usability Scale cuestionario puntaje 68 tareas", (b, ctx) => {
    const sc = A.sus.map(() => 3);
    b.innerHTML = `<div class="sus"><div class="sus-l"><h3>Cuestionario SUS <small>1 = en desacuerdo · 5 = de acuerdo</small></h3>${A.sus.map((q, i) => `<label><span>${i + 1}. ${esc(q)}</span><input type="range" min="1" max="5" step="1" value="3" data-i="${i}"><b>3</b></label>`).join("")}</div>
      <aside class="sus-r"><div class="gauge"><svg viewBox="0 0 200 120"><path class="gb" d="M20 100 A80 80 0 0 1 180 100"/><path class="gf" d="M20 100 A80 80 0 0 1 180 100" pathLength="100" stroke-dasharray="0 100"/></svg><div class="gv"><b>0</b><span>puntaje SUS (0–100)</span></div></div><p class="fx">Impares: (respuesta − 1) · Pares: (5 − respuesta) · suma × 2.5. Un puntaje de 68 o más se considera aceptable.</p>
      <h4>Defectos ya corregidos</h4>${A.defectos.rows.map((r) => `<div class="df"><b>${fmt(r[0])}</b><span>${fmt(r[2])}</span></div>`).join("")}</aside></div>`;
    const calc = () => { const s = sc.reduce((a, v, i) => a + (i % 2 === 0 ? v - 1 : 5 - v), 0) * 2.5; $(".gv b", b).textContent = s.toFixed(1); const f = $(".gf", b); f.style.strokeDasharray = `${s} 100`; f.style.stroke = s >= 68 ? "var(--ok)" : "var(--bad)"; };
    $$("input", b).forEach((inp) => ctx.on(inp, "input", () => { sc[+inp.dataset.i] = +inp.value; inp.nextElementSibling.textContent = inp.value; calc(); })); requestAnimationFrame(calc);
  });

  /* ============ 35 · declaración de IA ============ */
  K.add("cie", "Declaración de uso de IA", "declaración de uso de inteligencia artificial apéndice 60% nota herramienta modelo verificación", (b, ctx) => {
    b.innerHTML = `<div class="ia"><div class="ia-t">${A.declaracion_ia.rows.map((r, i) => `<div style="--d:${i * 80}ms"><b>${fmt(r[0])}</b><p>${fmt(r[1])}</p></div>`).join("")}</div><div class="call warn"><b>Regla del curso</b>Omitir la declaración de uso de IA limita la nota máxima al <strong>60 %</strong> (riesgo R8). El apéndice se adjunta a cada entrega.</div></div>`;
    const a = $$(".ia-t > div", b); ctx.builds(a.length + 1, (i) => a.forEach((e, k) => e.classList.toggle("on", i === a.length || k < i)));
  });

  /* ============ 36 · pendientes ============ */
  K.add("cie", "Pendientes y cómo se cierran", "pendientes quién cómo se cierra roles acta Word laboratorio A1-b horas reales", (b, ctx) => {
    b.innerHTML = `<div class="pnd">${A.pendientes.rows.map((r, i) => `<label class="pd"><input type="checkbox" data-k="p${i}"><span><b>${fmt(r[0])}</b><small>${esc(r[1])} · ${fmt(r[2])}</small></span></label>`).join("")}</div><p class="foot">Marca lo que ya esté cerrado; se guarda en este navegador.</p>`;
    $$("input", b).forEach((c) => { c.checked = K.store.get("pd:" + c.dataset.k, false); ctx.on(c, "change", () => { K.store.set("pd:" + c.dataset.k, c.checked); c.closest(".pd").classList.toggle("done", c.checked); }); c.closest(".pd").classList.toggle("done", c.checked); });
  });

  /* ============ 37 · lecciones ============ */
  K.add("cie", "Lecciones aprendidas", "lecciones aprendidas cierre proceso resultados mejoras", (b) => {
    const raw = (A.notas["Lecciones aprendidas"] || "").replace(/\s+/g, " ").trim(), cut = raw.split("Lo que haríamos distinto:");
    const split = (x) => x.replace(/^Lo que funcionó:\s*/, "").split(/;\s*|,\s+y\s+(?=[a-záéíóú]+\s)/).map((y) => y.trim().replace(/\.$/, "")).filter(Boolean);
    const cols = [["Lo que funcionó", "lime", split(cut[0])], ["Lo que haríamos distinto", "rose", split(cut[1] || "")]];
    b.innerHTML = `<div class="les">${cols.map(([t, c, it]) => `<section style="--c:var(--${c})"><h3>${t}</h3><ul>${it.map((x) => `<li>${fmt(x.charAt(0).toUpperCase() + x.slice(1))}</li>`).join("")}</ul></section>`).join("")}</div><div class="call info"><b>Avance posterior</b>${fmt(A.avance_posterior.replace("Avance posterior: ", "").replace(/^./, (m) => m.toUpperCase()))}</div>`;
  });

  /* ============ 38 · preguntas ============ */
  K.add("cie", "Preguntas frecuentes de la exposición", "preguntas respuestas metodología normas híbrido Scrum riesgos calidad PERT", (b, ctx) => {
    const qs = [...A.preguntas_metodologia.rows, ...A.preguntas_mas.rows]; let i = 0, open = false;
    b.innerHTML = `<div class="qa"><div class="qa-l">${qs.map((q, k) => `<button type="button" data-k="${k}">${esc(q[0])}</button>`).join("")}</div><aside class="qa-d"></aside></div>`;
    const d = $(".qa-d", b), bt = $$(".qa-l button", b), show = (k) => { i = k; bt.forEach((x, n) => x.classList.toggle("sel", n === k)); d.innerHTML = `<h3>${esc(qs[k][0])}</h3><p>${fmt(qs[k][1])}</p>`; };
    bt.forEach((x, k) => ctx.on(x, "click", () => show(k))); show(0);
  });

  /* ============ 39 · referencias ============ */
  K.add("cie", "Referencias", "referencias bibliografía OPS PMI PMBOK ISO NIST", (b) => {
    b.innerHTML = `<ol class="refs">${A.referencias.map((r) => `<li>${fmt(r.replace(/^\[?\d+\]?\.?\s*/, ""))}</li>`).join("")}</ol>`;
  });

  /* ============ 40 · cierre ============ */
  K.add("cie", "Cierre: qué se lleva el curso", "cierre conclusión gracias resumen decisiones", (b, ctx) => {
    const c = A.cifras;
    b.innerHTML = `<div class="fin"><div class="fin-k">${[[c.bac + " h", "presupuesto base (BAC)"], ["20", "paquetes de trabajo"], ["13", "riesgos registrados"], ["12", "interesados"], ["74 %", "probabilidad de cumplir BD II"]].map(([v, l], i) => `<div style="--d:${i * 90}ms"><b>${v}</b><span>${l}</span></div>`).join("")}</div>
      <div class="call ok"><b>Mensaje final</b>Un enfoque híbrido —Fase 0 predictiva y sprints ágiles— apoyado en PMBOK 8, ISO 21502, ISO/IEC 25010 y NIST 800-30, con números que se pueden recalcular y riesgos con dueño y reserva.</div><p class="foot">Grupo 4 · ${esc(A.curso)} · ${esc(A.docentes[0])}</p></div>`;
    const a = $$(".fin-k > div", b); ctx.builds(2, (i) => a.forEach((e) => e.classList.toggle("on", i === 1)));
    ctx.timeout(80, 80);
  });
})();
