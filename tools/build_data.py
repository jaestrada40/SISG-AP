#!/usr/bin/env python3
"""Genera data/apt.js leyendo los documentos de gestión de SISG (docs/gestion/*.md) y la presentación actual
(docs/PRESENTACION_APT.html). Nada se transcribe a mano: si el plan cambia, se vuelve a correr este script.

Uso:  python3 tools/build_data.py [carpeta_docs]      (por defecto ../SISG/docs)
Solo usa la biblioteca estándar.
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "..", "SISG", "docs")
GEST = os.path.join(DOCS, "gestion")
read = lambda *p: open(os.path.join(*p), encoding="utf8").read()


def table_after(text, marker, nth=0):
    """Primera tabla markdown después de `marker`. Devuelve {cols, rows}."""
    pos = -1
    for _ in range(nth + 1):
        pos = text.index(marker, pos + 1)
    lines, started = [], False
    for ln in text[pos:].split("\n")[1:]:
        if ln.strip().startswith("|"):
            started = True
            lines.append(ln)
        elif started:
            break
        elif ln.startswith("#") and lines:
            break
    cells = [[c.strip() for c in l.strip().strip("|").split("|")] for l in lines]
    cells = [r for r in cells if not all(re.fullmatch(r":?-{2,}:?", c) for c in r)]
    return {"cols": cells[0], "rows": cells[1:]}


def num(s):
    s = re.sub(r"[^\d.,-]", "", s.replace(",", "."))
    try: return float(s) if "." in s else int(s)
    except ValueError: return None


# ------------------------------------------------------------------ markdown del plan
a = read(GEST, "01_acta_y_alcance.md")
e = read(GEST, "02_edt_cronograma_costos.md")
i = read(GEST, "03_interesados_comunicaciones.md")
r = read(GEST, "04_riesgos_calidad.md")
u = read(GEST, "06_prueba_usabilidad.md")
ia = read(GEST, "05_apendice_declaracion_ia.md")

D = {
    "objetivos": table_after(a, "**Objetivos SMART**"),
    "hitos": table_after(a, "### 6. Hitos y cronograma preliminar"),
    "riesgos_principales": table_after(a, "**Riesgos principales**"),
    "roles": table_after(a, "### 9. Director de proyecto y su autoridad"),
    "entregables": table_after(a, "### B.3 Entregables y criterios de aceptación"),
    "backlog": table_after(a, "Historias de usuario iniciales"),
    "paquetes": table_after(e, "**TABLA I: DICCIONARIO DE PAQUETES DE TRABAJO**"),
    "actividades": table_after(e, "**TABLA II: ACTIVIDADES, PREDECESORAS Y HOLGURA"),
    "pert": table_after(e, "**TABLA III: ESTIMACIÓN PERT"),
    "evm": table_after(e, "**TABLA IV: INDICADORES DE VALOR GANADO"),
    "etapas": table_after(e, "**TABLA V: ETAPAS, SPRINT GOAL Y DEFINITION OF DONE**"),
    "interesados": table_after(i, "**TABLA I: REGISTRO DE INTERESADOS**"),
    "estrategia": table_after(i, "**TABLA II: ESTRATEGIA POR INTERESADO**"),
    "comunicaciones": table_after(i, "**TABLA III: PLAN DE COMUNICACIONES**"),
    "reporte": table_after(i, "## 4. Reporte de estado"),
    "rbs": table_after(r, "**TABLA II: RIESGOS POR CATEGORÍA**"),
    "riesgos": table_after(r, "**TABLA III: REGISTRO DE RIESGOS**"),
    "nist": table_after(r, "**TABLA IV: FUENTE, EVENTO, VULNERABILIDAD E IMPACTO**"),
    "contingencia": table_after(r, "**TABLA V: PLAN DE CONTINGENCIA**"),
    "inventario": table_after(r, "**TABLA VI: INVENTARIO Y ESTADO DE LOS EQUIPOS DEL GRUPO**"),
    "oportunidades": table_after(r, "### Oportunidades"),
    "calidad": table_after(r, "**TABLA VII: ESPECIFICACIÓN DE CALIDAD**"),
    "dominios": table_after(r, "**TABLA VIII: CALIDAD EN LOS DOMINIOS**"),
    "defectos": table_after(r, "**TABLA IX: REGISTRO DE DEFECTOS**"),
    "tareas_usabilidad": table_after(u, "## 3. Tareas (datos ficticios)"),
    "declaracion_ia": table_after(ia, "## Declaración"),
}
# cifras del texto del plan
D["cifras"] = {
    "bac": 168, "contingencia_pct": 13, "gestion_pct": 5,
    "texto_reservas": re.search(r"- \*\*Reserva de contingencia\*\*.*", r).group(0),
}
D["sus"] = re.findall(r"^\d+\. (.*)$", u.split("## 4. Cuestionario final")[1].split("**Cálculo")[0], re.M)
D["miembros"] = re.search(r"\*\*Grupo 4:\*\* (.*)", a).group(1).strip()
D["docentes"] = [re.search(r"\*\*Docente:\*\* ([^·\n]*)", a).group(1).strip(), re.findall(r"\*\*Docente:\*\* ([^\n]*)", a)[1].strip()]
D["curso"] = re.search(r"\*\*Curso:\*\* ([^·\n]*)", a).group(1).strip()

def bullets_after(text, marker):
    seg = text[text.index(marker):].split("\n")[1:]
    out = []
    for ln in seg:
        if ln.startswith("- "): out.append(ln[2:].strip())
        elif ln.startswith("#") and out: break
    return out

def clean(s): return re.sub(r"\s+", " ", s).strip()
sec2 = a.split("### 2. Justificación / caso de negocio")[1].split("### 3.")[0]
D["justificacion"] = clean(sec2)
D["proposito"] = clean(re.search(r"\*\*Propósito:\*\* (.*?)\n\n", a, re.S).group(1))
D["alcance_incluye"] = bullets_after(a, "### B.1 Alcance del producto")
D["alcance_excluye"] = bullets_after(a, "### B.4 Exclusiones")
D["alcance_proyecto"] = clean(a.split("### B.2 Alcance del proyecto")[1].split("### B.3")[0].split("\n", 1)[1])
sup = a.split("**Supuestos:**")[1]
D["supuestos"] = [clean(x) for x in re.split(r";\s*", sup.split("\n**Restricciones:**")[0].strip().rstrip("."))]
res = a.split("**Restricciones:**")[1].split("\n\n")[0]
D["restricciones"] = [clean(x) for x in re.split(r";\s*", res.strip().rstrip("."))]
aut = re.search(r"\*\*Autoridad:\*\* (.*?)\n\n", a, re.S).group(1)
D["autoridad"] = [clean(x) for x in re.split(r";\s*", clean(aut).rstrip("."))]
rep = i.split("## 4. Reporte de estado")[1]
D["reporte_texto"] = {k: clean(re.search(r"\*\*" + k + r"\.\*\* (.*?)(?=\n\n|\Z)", rep, re.S).group(1)) for k in ["Desempeño", "Riesgos principales", "Acciones y decisiones"]}
D["hibrido_texto"] = [clean(p) for p in e.split("## 6. Enfoque híbrido: Fase 0 y sprints")[1].split("**TABLA V")[0].strip().split("\n") if p.strip()]
D["edt_nivel1"] = [m for m in re.findall(r"\b[GDAQX]\[(\d [^\]]+)\]", e)]
D["reglas_com"] = [clean(x) for x in re.findall(r"^\d+\. (.*)$", i.split("### Reglas")[1].split("## 4.")[0], re.M)]
D["ciclo_riesgos"] = {k: clean(re.search(r"- \*\*" + k + r"\.\*\* (.*)", r).group(1)) for k in ["Preparar", "Conducir", "Comunicar", "Mantener"]}
D["mensaje_gerente"] = clean(re.search(r"Mensaje de tres líneas al gerente.*?:\*\* (.*)", r, re.S).group(0))

# ------------------------------------------------------------------ presentación actual (HTML)
src = read(DOCS, "PRESENTACION_APT.html")
def txt(s):
    s = re.sub(r"<br\s*/?>", "\n", s); s = re.sub(r"</(tr|p|li|h\d|div)>", "\n", s); s = re.sub(r"</t[dh]>", " | ", s); s = re.sub(r"<[^>]+>", "", s)
    return re.sub(r"\n\s*\n+", "\n", html.unescape(s)).strip()

def html_table(h):
    out = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", h, re.S):
        out.append([html.unescape(re.sub(r"<[^>]+>", "", c)).strip() for c in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, re.S)])
    return {"cols": out[0], "rows": out[1:]} if out else None

slides = {}
for h, notes in re.findall(r"\[`(.*?)`,\s*\n?`(.*?)`\]", src, re.S):
    title = txt(h).split("\n")[0].strip()
    slides[title] = {"text": txt(h), "table": html_table(h), "notes": notes.strip()}
pick = lambda k: slides[k]
D["estado_objetivos"] = pick("Objetivos SMART y su estado")["table"]
D["estado_criterios"] = pick("Criterios de éxito")["table"]
D["estado_backlog"] = pick("Backlog: historias de usuario y estado")["table"]
D["pendientes"] = pick("Pendientes y cómo se cierran")["table"]
D["normas"] = pick("Normas y estándares: dónde se aplica cada una en SISG")["table"]
D["preguntas_metodologia"] = pick("Preguntas sobre metodología y normas")["table"]
D["preguntas_mas"] = pick("Más preguntas posibles (respuestas cortas)")["table"]
D["referencias"] = [l for l in pick("Referencias")["text"].split("\n")[1:] if l.strip() and not l.startswith("Citas")]
D["avance_posterior"] = clean(re.search(r"Avance posterior:.*", pick("Etapas del enfoque híbrido: objetivo y criterio de terminado")["text"]).group(0))
D["backlog_nota"] = clean(pick("Backlog: historias de usuario y estado")["text"].split("\n")[-1])
D["contexto_html"] = pick("Contexto y justificación")["text"]
D["hitos_nota"] = clean(pick("Hitos y cronograma preliminar")["text"].split("\n")[-1])
D["notas"] = {k: slides[k]["notes"] for k in ["Normas y estándares: dónde se aplica cada una en SISG", "Preguntas sobre metodología y normas", "Pendientes y cómo se cierran", "Lecciones aprendidas"] if k in slides}

# comprobaciones: si el plan cambia de forma, se avisa en vez de mostrar datos mal leídos
assert len(D["paquetes"]["rows"]) == 20, "el EDT debería tener 20 paquetes"
assert sum(num(x[2]) for x in D["paquetes"]["rows"]) == 168, "las horas del EDT deberían sumar 168"
assert len(D["actividades"]["rows"]) == 12 and len(D["riesgos"]["rows"]) == 13 and len(D["interesados"]["rows"]) == 12
assert len(D["objetivos"]["rows"]) == 6 and len(D["backlog"]["rows"]) == 6 and len(D["calidad"]["rows"]) == 8
assert len(D["edt_nivel1"]) == 5 and len(D["reglas_com"]) == 3, "EDT nivel 1 o reglas de comunicación mal leídos"
assert D["roles"]["cols"][0] == "Rol" and len(D["roles"]["rows"]) == 3, "la tabla de roles debería tener 3 filas"

out = os.path.join(ROOT, "data", "apt.js")
os.makedirs(os.path.dirname(out), exist_ok=True)
s = json.dumps(D, ensure_ascii=False, separators=(",", ":"))
open(out, "w", encoding="utf8").write("/* Datos del plan de gestión de SISG, leídos de docs/gestion y docs/PRESENTACION_APT.html. No editar a mano. */\nwindow.APT = " + s + ";\n")
print(f"{out}: {len(s):,} bytes · {len(D['paquetes']['rows'])} paquetes · {len(D['actividades']['rows'])} actividades · {len(D['riesgos']['rows'])} riesgos · {len(D['interesados']['rows'])} interesados")
