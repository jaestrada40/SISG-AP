# SISG · Administración de Proyectos (3CE0101)

Presentación interactiva de 40 diapositivas del plan de gestión del proyecto SISG (Grupo 4): iniciación, metodología híbrida,
planificación (EDT, PDM, PERT, Gantt, costos, valor ganado), interesados, riesgos (NIST 800-30), calidad (ISO 21502 / 25010),
normas, declaración de IA, lecciones y preguntas. Los datos salen de `../SISG/docs`, no se transcriben a mano.

## Cómo verla
- **Doble clic en `SISG-APT.html`** (un solo archivo, funciona sin servidor; solo la tipografía viene de Google Fonts).
- O con servidor: `python3 -m http.server 8770` y abrir <http://127.0.0.1:8770/>.

## Controles
`→` / espacio avanzan (primero los pasos internos de cada diapositiva) · `←` retrocede · `I` índice · `/` buscador de texto completo (lista todas las diapositivas donde aparece la palabra, con un fragmento; Enter abre la primera) · `F` pantalla completa · `Home` / `End`.
Hay botón de tema claro/oscuro. Las diapositivas con deslizadores (PERT, costos, valor ganado, SUS) se pueden mover para probar escenarios.

## Archivos
| Ruta | Qué es |
|---|---|
| `index.html` | Página y carga de scripts |
| `css/style.css` | Estilos (papel crema, JetBrains Mono, sombras duras) |
| `js/kit.js` | Motor: escala 1280×720, pasos, índice, utilidades |
| `js/slides1.js` · `slides2.js` · `slides3.js` | Diapositivas 1–13 · 14–24 · 25–40 |
| `data/apt.js` | Datos generados (no editar a mano) |
| `tools/build_data.py` | Regenera `data/apt.js` desde `../SISG/docs` (`python3 -I tools/build_data.py`) |
| `tools/bundle.py` | Genera `SISG-APT.html` (`python3 -I tools/bundle.py`) |
| `Dockerfile`, `nginx.conf` | Para publicar en Coolify / VPS (puerto 80, `/healthz`) |

## Si cambia el plan
`python3 -I tools/build_data.py && python3 -I tools/bundle.py`
