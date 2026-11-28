/* Diapositivas 1 a 13: portada, agenda, iniciación (acta y alcance) y metodología (híbrido, Scrum, etapas, backlog). */
(function () {
  "use strict";
  const K = window.K, A = K.A, esc = K.esc, fmt = K.fmt, $ = K.$, $$ = K.$$;
  const COL = { ok: "Cumple", run: "En curso", pend: "Pendiente" };
  const st = (txt) => { const s = K.status(txt); return `<span class="badge ${s}">${COL[s]}</span>`; };

  /* ============ 1 · portada ============ */
  K.add("cover", "SISG · Administración de Proyectos", "portada curso docente Grupo 4 plan de gestión", (b, ctx) => {
    const steps = A.etapas.rows.map((r) => r[0].replace(/\s*\(predictiva\)/, ""));
    b.innerHTML = `<div class="cv"><div class="cv-t"><span class="cv-k">Universidad San Pablo de Guatemala · ${esc(A.curso)}</span>
      <h1>SISG<br><mark>Administración de Proyectos</mark></h1>
      <p>Plan de gestión del módulo del Grupo 4: del acta de constitución al cierre, con las normas y la metodología del curso.</p>
      <div class="cv-team">${A.miembros.split(",").map((m) => `<span>${esc(m.trim())}</span>`).join("")}</div>
      <small>Docente: ${esc(A.docentes[0])} · Curso relacionado: Bases de Datos II (${esc(A.docentes[1])})</small>
      <div class="cv-hint">Presiona <kbd>→</kbd> para empezar</div></div>
      <ol class="cv-route">${steps.map((s, i) => `<li><i>${i === 0 ? "F0" : "S" + i}</i><span>${esc(s.split("·")[1] ? s.split("·")[1].trim() : s)}</span></li>`).join("")}</ol></div>`;
    const li = $$(".cv-route li", b); let k = 0;
    const tick = () => { li.forEach((e, j) => e.classList.toggle("on", j === k)); k = (k + 1) % li.length; };
    tick(); ctx.timer(tick, 1400);
  }, { cover: true });

  /* ============ 2 · agenda ============ */
  K.add("ini", "La ruta de la presentación", "agenda secciones iniciación metodología planificación interesados riesgos calidad cierre", (b, ctx) => {
    const order = ["ini", "met", "pla", "int", "rie", "cal", "cie"];
    const info = { ini: "Acta, objetivos SMART, alcance, supuestos e hitos", met: "Modelo híbrido: Fase 0 y sprints, Scrum, backlog", pla: "EDT, red de precedencia, ruta crítica, PERT, Gantt, costos y valor ganado",
      int: "Registro y matriz poder/interés, comunicaciones, reporte de estado", rie: "Proceso con 4 marcos, RBS, matriz, registro, NIST, CVSS y laboratorio A1-b", cal: "ISO 21502, ISO/IEC 25010, especificaciones medibles, defectos y usabilidad",
      cie: "Normas y estándares, lecciones, declaración de IA, pendientes y preguntas" };
    b.innerHTML = `<div class="agenda">${order.map((s, i) => {
      const first = K.slides.findIndex((x) => x.sec === s), n = K.slides.filter((x) => x.sec === s).length;
      return `<button type="button" class="ag" data-go="${first + 1}" style="--c:var(--c-${K.SEC[s][1]})"><span class="ag-n">${i + 1}</span><b>${K.SEC[s][0]}</b><small>${info[s]}</small><em>${n} diapositivas · desde la ${first + 1}</em></button>`;
    }).join("")}</div><p class="agenda-note">Sigue el orden del curso. Haz clic en una sección para ir directo.</p>`;
    const ag = $$(".ag", b); ctx.builds(7, (i) => ag.forEach((e, k) => e.classList.toggle("on", k <= i)));
    ag.forEach((e) => ctx.on(e, "click", () => K.go(+e.dataset.go)));
  });

  /* ============ 3 · contexto y justificación ============ */
  K.add("ini", "Contexto y justificación", "caso de negocio OPS línea base arquitectura objetivo transiciones un proyecto dos cursos", (b, ctx) => {
    b.innerHTML = `<div class="ctx"><section class="card c-a"><h3>El proyecto</h3><p>${fmt(A.proposito.charAt(0).toUpperCase() + A.proposito.slice(1))}</p>
        <div class="two-c"><b>Un proyecto, dos cursos</b><span>Administración de Proyectos Tecnológicos (este plan) y Bases de Datos II: ER, estrella, ETL y consultas.</span></div></section>
      <section class="card c-b"><h3>Caso de negocio</h3><p>${fmt(A.justificacion.split("El documento de la OPS")[0].trim())}</p>
        <p class="hl">Los centros y organismos <b>alimentan y consumen</b> datos, pero hoy trabajan con archivos de Excel y bases aisladas. Sin un modelo común, ministerios, aseguradoras y universidades no pueden comparar estudios ni campañas.</p></section>
      <section class="card c-c"><h3>La respuesta: el marco de la OPS</h3><div class="steps3">
        <div class="s3"><i>1</i><b>Línea base</b><span>dónde estamos hoy</span></div><em>→</em>
        <div class="s3"><i>2</i><b>Arquitectura objetivo</b><span>a dónde queremos llegar</span></div><em>→</em>
        <div class="s3"><i>3</i><b>Transiciones</b><span>cómo se cruza</span></div></div>
        <p>Con la <b>interoperabilidad</b> y la <b>seguridad de la información</b> como principios. Este módulo entrega el modelo común y demuestra que los indicadores se calculan sin perder filas ni montos (reconciliación en cero).</p></section></div>`;
    const c = $$(".ctx > section", b); ctx.builds(3, (i) => c.forEach((e, k) => e.classList.toggle("on", k <= i)));
  });

  /* ============ 4 · objetivos SMART ============ */
  K.add("ini", "Objetivos SMART y su estado", "objetivos específicos medibles fecha O1 O2 O3 O4 O5 O6 trazabilidad entregable", (b, ctx) => {
    const trace = ["ER de las fuentes", "Modelo estrella", "ETL y reconciliación", "Consultas", "Documentos de gestión", "Exposición e informe de cierre"];
    b.innerHTML = `<div class="obj">${A.estado_objetivos.rows.map((r, i) => `<article class="oc" style="--d:${i * 70}ms"><header><b>${r[0]}</b>${st(r[2])}</header><p>${fmt(r[1])}</p><footer><span>Entregable</span> ${esc(trace[i])}</footer><small>${esc(r[2])}</small></article>`).join("")}</div>
      <p class="foot">Cada objetivo tiene medida y fecha, como pide el criterio SMART. Trazabilidad: ER → O1 · estrella → O2 · ETL y reconciliación → O3 · consultas → O4 · documentos → O5 · exposición e informe de cierre → O6.</p>`;
    const c = $$(".oc", b); ctx.builds(c.length + 1, (i) => c.forEach((e, k) => e.classList.toggle("on", k < i || i === c.length)));
  });

  /* ============ 5 · criterios de éxito ============ */
  K.add("ini", "Criterios de éxito", "criterios de éxito reconciliación pruebas e2e columnas personales IEEE holgura usabilidad", (b, ctx) => {
    const rows = A.estado_criterios.rows, cnt = { ok: 0, run: 0, pend: 0 };
    rows.forEach((r) => cnt[K.status(r[2])]++);
    const C = 2 * Math.PI * 54;
    b.innerHTML = `<div class="crit"><aside class="ring"><svg viewBox="0 0 130 130"><circle cx="65" cy="65" r="54" class="rg-bg"/><circle cx="65" cy="65" r="54" class="rg-fg" stroke-dasharray="${C}" stroke-dashoffset="${C}"/></svg>
        <div class="rg-n"><b>0</b><span>de ${rows.length} cumplen</span></div>
        <ul><li><i class="d ok"></i>${cnt.ok} cumplen</li><li><i class="d run"></i>${cnt.run} en curso</li><li><i class="d pend"></i>${cnt.pend} pendientes</li></ul></aside>
      <ol class="cl">${rows.map((r, i) => `<li class="${K.status(r[2])}" style="--d:${i * 90}ms"><i>${r[0]}</i><div><b>${fmt(r[1])}</b><span>${fmt(r[2])}</span></div>${st(r[2])}</li>`).join("")}</ol></div>
      <p class="foot">Estado según la presentación vigente del grupo (algunos resultados son posteriores al corte del 24 de octubre).</p>`;
    const fg = $(".rg-fg", b); requestAnimationFrame(() => (fg.style.strokeDashoffset = C * (1 - cnt.ok / rows.length)));
    K.countUp($(".rg-n b", b), cnt.ok, 900);
  });

  /* ============ 6 · alcance ============ */
  K.add("ini", "Alcance: qué incluye y qué no", "alcance del producto proyecto incluye excluye exclusiones", (b, ctx) => {
    b.innerHTML = `<div class="alc"><section class="in"><h3>Incluye <small>alcance del producto: el qué</small></h3><ul>${A.alcance_incluye.map((x, i) => `<li style="--d:${i * 80}ms">${fmt(x)}</li>`).join("")}</ul></section>
      <section class="out"><h3>Excluye <small>fuera del alcance</small></h3><ul>${A.alcance_excluye.map((x, i) => `<li style="--d:${i * 80}ms">${fmt(x.replace(/\.$/, ""))}</li>`).join("")}</ul></section>
      <section class="prj"><h3>Alcance del proyecto <small>el cómo y el cuánto trabajo</small></h3><p>${fmt(A.alcance_proyecto)}</p></section></div>`;
    const s = $$(".alc > section", b); ctx.builds(3, (i) => s.forEach((e, k) => e.classList.toggle("on", k <= i)));
  });

  /* ============ 7 · entregables y criterios de aceptación ============ */
  K.add("ini", "Entregables y criterios de aceptación", "entregables criterios aceptación ER estrella ETL consultas aplicación documentos gestión trazabilidad", (b, ctx) => {
    const obj = { "ER de las fuentes": "O1", "Modelo estrella": "O2", ETL: "O3", Consultas: "O4", "Aplicación": "—", "Documentos de gestión": "O5" };
    b.innerHTML = `<div class="ent">${A.entregables.rows.map((r, i) => `<article style="--d:${i * 90}ms"><header><b>${fmt(r[0])}</b><span class="badge">${obj[K.plain(r[0])] || "—"}</span></header><p>${fmt(r[1])}</p></article>`).join("")}</div>
      <p class="foot">Cada entregable tiene su criterio de aceptación y se rastrea a un objetivo (columna de la derecha de cada tarjeta). La aplicación no tiene objetivo propio: es la fuente de datos del resto.</p>`;
    const c = $$(".ent article", b); ctx.builds(c.length, (i) => c.forEach((e, k) => e.classList.toggle("on", k <= i)));
  });

  /* ============ 8 · supuestos, restricciones, roles ============ */
  K.add("ini", "Supuestos, restricciones, autoridad y roles", "supuestos restricciones director de proyecto autoridad roles líder datos aplicación calidad", (b, ctx) => {
    const list = (arr) => `<ul>${arr.map((x) => `<li>${fmt(x.charAt(0).toUpperCase() + x.slice(1))}</li>`).join("")}</ul>`;
    b.innerHTML = `<div class="sup"><section class="card"><h3>Supuestos</h3>${list(A.supuestos)}</section><section class="card"><h3>Restricciones</h3>${list(A.restricciones)}</section>
      <section class="card"><h3>Autoridad del director de proyecto</h3>${list(A.autoridad)}</section>
      <section class="card roles"><h3>Roles</h3>${A.roles.rows.map((r) => `<div class="role"><b>${esc(r[0])}</b><span>${fmt(r[1])}</span><em>${fmt(r[2])}</em></div>`).join("")}
        <small>Roles asignados en el acta, sección 9.</small></section></div>
      <p class="foot">Equipo: ${esc(A.miembros)}.</p>`;
    const c = $$(".sup > section", b); ctx.builds(4, (i) => c.forEach((e, k) => e.classList.toggle("on", k <= i)));
  });

  /* ============ 9 · hitos ============ */
  K.add("ini", "Hitos y cronograma preliminar", "hitos fechas 25 octubre 30 octubre 2 noviembre 5 noviembre 10 noviembre exposición examen entrega 28 noviembre", (b, ctx) => {
    const MES = { oct: 9, nov: 10 };
    const parse = (s) => { const m = /(\d{1,2})(?:–(\d{1,2}))?\s+(oct|nov)/i.exec(K.plain(s)); return m ? new Date(2026, MES[m[3].toLowerCase()], +m[1]) : null; };
    const ms = A.hitos.rows.map((r) => ({ d: parse(r[0]), f: K.plain(r[0]), t: r[1] })), t0 = ms[0].d.getTime(), t1 = ms[ms.length - 1].d.getTime();
    const pos = (d) => 4 + ((d.getTime() - t0) / (t1 - t0)) * 92;
    const now = new Date(), inRange = now >= ms[0].d && now <= new Date(2026, 10, 30), todayPct = inRange ? K.clamp(4 + ((Math.min(now.getTime(), t1) - t0) / (t1 - t0)) * 92, 0, 98) : null;
    b.innerHTML = `<div class="tl"><div class="tl-line"><i></i></div>${ms.map((m, i) => `<div class="tl-m ${i % 2 ? "dn" : "up"}" style="left:${pos(m.d)}%;--d:${i * 120}ms"><span class="dot"></span><b>${esc(m.f)}</b><small>${fmt(m.t)}</small></div>`).join("")}${todayPct != null ? `<div class="tl-now" style="left:${todayPct}%"><span>hoy</span></div>` : ""}</div>
      <div class="call warn"><b>Dato clave</b>${fmt(A.hitos_nota.replace("Dato clave: ", ""))}</div>
      <div class="call info"><b>Fecha actualizada</b>El documento «Qué leer, qué presentar y qué entregar» fija la exposición el <strong>sábado 28 de noviembre de 2026</strong>; el acta conserva las fechas originales (20–21 de noviembre).</div>`;
    const ml = $$(".tl-m", b); ctx.builds(ml.length + 1, (i) => { $(".tl-line i", b).style.width = Math.min(100, (i / ml.length) * 100) + "%"; ml.forEach((e, k) => e.classList.toggle("on", k < i)); });
  });

  /* ============ 10 · enfoque híbrido ============ */
  K.add("met", "Enfoque híbrido: predictivo + ágil", "híbrido predictivo ágil fase 0 sprints ruta crítica hitos scrum guide sprint cero", (b, ctx) => {
    const e = A.etapas.rows;
    const adj = [["Sprint 0 → Fase 0", "«Sprint 0»: arquitectura, modelado y planificación.", "Fase 0 · Preparación (predictiva). La Scrum Guide no define un «Sprint 0»; esta fase cierra con el acta, el alcance y el cronograma de hitos aprobados."],
      ["Ruta crítica", "Nombra el orden de trabajo de los sprints.", "Se gestiona en el marco predictivo: hitos fin-a-inicio entre sprints. Si un hito se atrasa, se mueve la fecha de los primeros pasos."],
      ["Sprints 1–5", "Cinco etapas definidas de antemano.", "Ejecución ágil: cada sprint con Sprint Goal, Incremento y Definition of Done; Review y Retrospective para adaptar el siguiente."]];
    b.innerHTML = `<div class="hyb"><div class="hy-bands"><span class="pred">PREDICTIVA</span><span class="agil">ÁGIL · SPRINTS CON SPRINT GOAL, INCREMENTO Y DEFINITION OF DONE</span></div>
      <ol class="hy-route">${e.map((r, i) => `<li class="${K.status(r[4])}"><i>${i === 0 ? "F0" : "S" + i}</i><b>${esc(r[0].split("·")[1].replace(/\(predictiva\)/, "").trim())}</b><small>${fmt(r[1])}</small></li>`).join('<span class="hy-m" title="Hito entre etapas">◆</span>')}</ol>
      <div class="hy-adj">${adj.map((x) => `<div class="adj"><b>${x[0]}</b><span class="was">${fmt(x[1])}</span><span class="now">${fmt(x[2])}</span></div>`).join("")}</div>
      <div class="call warn gold"><b>Regla de oro del roadmap</b>${fmt(A.hibrido_texto[1].replace("La regla del roadmap de la sesión se adapta así: ", ""))}</div>
      <p class="foot">Fuentes: Scrum Guide 2020 · Scrum.org (Sprint Zero) · PMBOK (Critical Path) · PMI (2017), Agile Practice Guide, 3.1.6–3.1.10. Contenido: roadmap del docente, ajustado al modelo híbrido.</p></div>`;
    const parts = [$(".hy-route", b), $(".hy-adj", b), $(".gold", b)]; ctx.builds(3, (i) => parts.forEach((p, k) => p.classList.toggle("on", k <= i)));
  });

  /* ============ 11 · Scrum en SISG ============ */
  K.add("met", "Las cuatro piezas de Scrum en SISG", "scrum product backlog sprint sprint goal incremento definition of done", (b, ctx) => {
    const e = A.etapas.rows;
    const cards = [["Product Backlog", "Lista emergente y ordenada de lo necesario para mejorar el producto; única fuente de trabajo del equipo.", "Las historias de usuario H1 a H6, ordenadas por prioridad (alta, media, baja)."],
      ["Sprint", "Evento de duración fija, de un mes o menos, que contiene a todos los demás eventos de Scrum.", "Cinco sprints después de la Fase 0, cada uno con su objetivo y su cierre."],
      ["Sprint Goal", "Objetivo único del sprint; da foco y coherencia al trabajo del equipo.", `Sprint 2 → «${e[2][1]}».`],
      ["Incremento + Definition of Done", "Peldaño concreto y usable hacia el objetivo del producto; solo cuenta si cumple la Definition of Done.", `Sprint 1 termina cuando: ${e[1][3].replace(/\.$/, "")}.`]];
    b.innerHTML = `<div class="scr">${cards.map((c, i) => `<article style="--d:${i * 100}ms"><h3>${c[0]}</h3><p>${c[1]}</p><div class="sisg"><span>En SISG</span>${fmt(c[2])}</div></article>`).join("")}</div>
      <p class="foot">Fuente: Schwaber & Sutherland (2020), The Scrum Guide — secciones Scrum Events y Scrum Artifacts.</p>`;
    const c = $$(".scr article", b); ctx.builds(4, (i) => c.forEach((e2, k) => e2.classList.toggle("on", k <= i)));
  });

  /* ============ 12 · etapas, sprint goal y DoD ============ */
  K.add("met", "Etapas: Sprint Goal y Definition of Done", "fase 0 sprint 1 2 3 4 5 definition of done estado paquetes edt", (b, ctx) => {
    const e = A.etapas;
    b.innerHTML = `<div class="eta"><div class="eta-t">${K.tbl(e, { cols: [0, 1, 2, 4], fmt: (v, ci) => (ci === 4 ? `${st(v)}` : fmt(v)), rowCls: () => "clk", num: false })}</div>
      <aside class="eta-d"></aside></div><div class="call ok"><b>Avance posterior al corte</b>${esc(A.avance_posterior.replace("Avance posterior: ", ""))}</div>`;
    const d = $(".eta-d", b), rows = $$("tbody tr", b);
    const show = (i) => { rows.forEach((r, k) => r.classList.toggle("sel", k === i)); const r = e.rows[i];
      d.innerHTML = `<span class="tag">${i === 0 ? "Predictiva" : "Ágil"}</span><h3>${esc(r[0])}</h3><h4>Sprint Goal</h4><p>${fmt(r[1])}</p><h4>Paquetes de la EDT</h4><p><code>${esc(r[2])}</code></p><h4>Definition of Done</h4><p class="dod">${fmt(r[3])}</p><h4>Estado al 24 de octubre</h4><p>${st(r[4])} <span class="mut">${fmt(r[4])}</span></p>`; };
    rows.forEach((r, i) => ctx.on(r, "click", () => show(i))); ctx.builds(e.rows.length, show);
  });

  /* ============ 13 · backlog ============ */
  K.add("met", "Backlog: historias de usuario y estado", "backlog historias de usuario H1 H2 H3 H4 H5 H6 prioridad criterio de aceptación", (b, ctx) => {
    const rows = A.estado_backlog.rows, pr = ["Alta", "Media", "Baja"];
    b.innerHTML = `<div class="bk">${pr.map((p) => `<section><h3 class="p-${p.toLowerCase()}">Prioridad ${p}</h3>${rows.filter((r) => r[3] === p).map((r, i) => `<article class="bkc" style="--d:${i * 120}ms"><header><b>${r[0]}</b><span class="badge ${K.status(r[4])}">${fmt(r[4])}</span></header><p>${fmt(r[1])}</p><small><b>Criterio:</b> ${fmt(r[2])}</small></article>`).join("")}</section>`).join("")}</div>
      <p class="foot">${esc(A.backlog_nota)}</p>`;
    const c = $$(".bkc", b); ctx.builds(c.length, (i) => c.forEach((e, k) => e.classList.toggle("on", k <= i)));
  });
})();
