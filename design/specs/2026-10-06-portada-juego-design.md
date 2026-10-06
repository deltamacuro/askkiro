# Portada como pantalla de inicio de un juego

Fecha: 2026-10-06 · Alcance: `#screen-start` en `docs/index.html`, más `docs/workshop.css` y `docs/workshop.js`.

## Objetivo

Que la portada de askkiro.info se sienta como la intro de un juego y no como una landing con párrafos. Cada acción es una entrada de menú, no un texto. Estilo híbrido: tipografía y colores de kiro.dev, con la mecánica de un menú arcade.

## Diseño

**Composición.** En escritorio, el fantasma a la izquierda y el bloque de título y menú a la derecha. En móvil (≤ 700px), todo apilado y centrado.

**Título.**
- Logo "ASK KIRO" en Inter 800, grande y con brillo morado. Va dentro del `<h1>` junto con el lema, para mantener el SEO.
- Lema: "De vibe coding a software real".
- Línea de stats en Fragment Mono: `3 MUNDOS · 10 NIVELES · 55 MIN`.

**Fantasma.** Animación idle: flota de arriba abajo (unos 3 s) y parpadea los ojos cada pocos segundos, superponiendo un párpado sobre el SVG.

**Menú arcade.** Es una lista vertical de entradas en Fragment Mono, en mayúsculas. Mantiene los IDs actuales para no tocar la lógica:

| Entrada | Elemento | Cuándo aparece |
|---|---|---|
| `CONTINUAR · M{n}` | `#btn-continue` | Hay progreso guardado. Es el foco inicial |
| `JUGAR` | `#btn-play` | No hay progreso. Es el foco inicial |
| `NUEVA PARTIDA` | `#btn-reset` (abre la confirmación de siempre) | Hay progreso guardado |
| `MODO ORADOR` | `#btn-speaker` | Siempre |
| `CÓMO JUGAR` | `#btn-help` | Siempre |

- La entrada activa (por foco o por hover) muestra un cursor `▶` que parpadea y se ilumina en `--accent-bright`. Las demás quedan en `--muted`.
- ↑/↓ mueve el foco entre las entradas visibles, de forma circular. Enter o Espacio activa la entrada. También funciona con clic y toque.
- En la portada, si el foco está en `body` (nada enfocado), Enter activa la entrada principal; sobre otros elementos, Enter mantiene su comportamiento nativo.
- `M{n}` sale de `current` y se actualiza en `updateStartButtons()`.

**Indicador.** `— PULSA ENTER —` parpadeando debajo del menú. Con puntero táctil (`@media (hover: none)`), `— TOCA PARA JUGAR —`.

**Pie.** Una sola línea en mono de unos 0.62rem en `--muted` (`--dim` no llega a 4.5:1 sobre negro): `© 2026 COMUNIDAD · NO OFICIAL · KIRO ES MARCA DE AWS`. Reemplaza el `.unofficial` actual.

**Esquina de fork.** El octocat de github-corners (tholman, MIT) en la esquina superior derecha, solo en la portada:
- Triángulo en `--accent` y octocat en `--bg`.
- Mueve el brazo con hover y foco.
- `aria-label="Haz tu fork en GitHub"`, y enlaza a https://github.com/deltamacuro/askkiro.

**Ambiente.**
- Se mantienen los rayos y las partículas.
- Se agregan scanlines con un `repeating-linear-gradient` sobre la pantalla, a muy baja opacidad (≈ 0.04) y con `pointer-events: none`.
- Entrada: el logo cae con un pequeño rebote, el menú aparece después de golpe y por último el indicador empieza a parpadear.

## Accesibilidad

- Las entradas siguen siendo `<button>` y `<a>` reales dentro de un `<nav aria-label="Menú principal">`. El cursor `▶` es decorativo (`aria-hidden`).
- `:focus-visible` se ve igual que el hover.
- Con `prefers-reduced-motion: reduce` no hay parpadeos, flotación, caída ni brazo del octocat.

## Fuera de alcance

- No hay sonido.
- No cambian las pantallas de misiones ni la final; el link "Haz tu fork" de la final se queda.
- No cambia la lógica de progreso: solo cambian las etiquetas, la navegación con teclado y el texto `· M{n}`.

## Verificación

Probar en Chrome en tres casos: sin progreso, con progreso y con `prefers-reduced-motion`, a 1280px y a 390px.
- La navegación ↑/↓/Enter funciona.
- `MODO ORADOR` abre la ventana de orador.
- `NUEVA PARTIDA` pide confirmación.
- La esquina de fork no tapa nada.
- El contraste del texto del menú es ≥ 4.5:1.
