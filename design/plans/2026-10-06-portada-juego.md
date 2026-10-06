# Portada estilo pantalla de inicio de juego — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convertir `#screen-start` de askkiro.info en una pantalla de inicio de juego: logo grande, menú arcade navegable con teclado, "PULSA ENTER", pie legal corto y la esquina "fork me" de GitHub.

**Architecture:** Es un sitio estático, sin build. Se cambian tres cosas: el marcado de la portada en `docs/index.html`, los estilos de la portada en `docs/workshop.css` (se reemplaza el bloque viejo de botones) y la función `setupStartMenu()` en `docs/workshop.js`, junto con un ajuste a `updateStartButtons()`. Los IDs `btn-play`, `btn-continue`, `btn-reset`, `btn-speaker` y `btn-help` no cambian, así que los handlers que ya existen siguen funcionando.

**Tech Stack:** HTML, CSS y JS vanilla (IIFE en `workshop.js`); fuentes Inter y Fragment Mono. Se verifica en Chrome con chrome-devtools MCP, sirviendo el sitio con `python3 -m http.server -d docs 8765`.

## Global Constraints

- Spec: `design/specs/2026-10-06-portada-juego-design.md`.
- Tokens: `--accent #9147ff`, `--accent-bright #c59eff`, `--accent-deep #7a0ecd`, `--text`, `--body`, `--muted #938f9b`, `--bg #000`. Ningún texto pequeño va en `--dim`.
- El texto visible lleva tildes (es la regla CONT-005 del CHANGELOG).
- Con `prefers-reduced-motion: reduce` no hay parpadeos, caída, flotación ni brazo del octocat, y todo el contenido queda visible.
- No se tocan las pantallas de misiones ni la final.
- El repo no tiene tests automatizados. Cada tarea se verifica en el navegador con `evaluate_script` y `take_screenshot`, con las aserciones que se indican.

---

### Task 1: Marcado y estilos de la portada

**Files:**
- Modify: `docs/index.html:43-66` (todo el bloque `<!-- SCREEN: INICIO -->`)
- Modify: `docs/workshop.css:116-181` (borrar el título viejo y los botones), `:209-218` (borrar `.start-help` y `.start-speaker`), `:243-254` (media query de 700px), `:1278-1280` (`.unofficial`), `:1320` (h1 en 600px) y `:1452` (`.start-btn:focus-visible`). Los números de línea son los de antes de editar; hay que ubicar los bloques por su texto.

**Interfaces:**
- Produces: `#start-menu` (un `<nav>`), las entradas `.menu-item` (con los IDs de siempre), `#continue-mission` (un `<span>` donde va "· M{n}") y la clase `.is-primary`, que marca la entrada principal (el CSS dibuja el cursor ▶ cuando el menú no tiene ni foco ni hover).

- [ ] **Step 1: Reemplazar el marcado de la portada**

En `docs/index.html`, reemplazar desde `<div class="screen screen-start active" ...>` hasta su cierre (justo antes de `<!-- SCREEN: MISIONES -->`) por:

```html
  <div class="screen screen-start active" id="screen-start" role="region" aria-label="Pantalla de inicio">
    <div class="start-scan" aria-hidden="true"></div>
    <a href="https://github.com/deltamacuro/askkiro" class="fork-corner" target="_blank" rel="noopener noreferrer" aria-label="Haz tu fork en GitHub">
      <svg width="80" height="80" viewBox="0 0 250 250" aria-hidden="true">
        <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path>
        <path class="octo-arm" d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor"></path>
        <path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor"></path>
      </svg>
    </a>
    <div class="start-content">
      <div class="start-ghost-wrap anim-ghost">
        <img src="askiro.svg" alt="Askiro, el fantasma con bigote que guía el tutorial" class="start-ghost-img" fetchpriority="high">
      </div>
      <div class="start-left">
        <p class="start-eyebrow">Tutorial interactivo para <a href="https://kiro.dev" target="_blank" rel="noopener noreferrer">Kiro</a></p>
        <h1 class="start-title"><span class="start-logo">Ask Kiro</span><span class="start-tagline">De vibe coding a software real</span></h1>
        <p class="start-stats">3 mundos &middot; 10 niveles &middot; 55 min</p>
        <nav class="start-menu" id="start-menu" aria-label="Menú principal">
          <button class="menu-item" id="btn-continue" hidden>Continuar <span class="menu-meta" id="continue-mission"></span></button>
          <button class="menu-item" id="btn-play">Jugar</button>
          <button class="menu-item" id="btn-reset" hidden>Nueva partida</button>
          <a href="orador.html" class="menu-item" id="btn-speaker">Modo orador</a>
          <a href="#help" class="menu-item" id="btn-help">Cómo jugar</a>
        </nav>
        <p class="start-press" aria-hidden="true"><span class="press-key">&mdash; Pulsa Enter &mdash;</span><span class="press-touch">&mdash; Toca para jugar &mdash;</span></p>
      </div>
    </div>
    <p class="start-legal">&copy; 2026 Comunidad &middot; No oficial &middot; Kiro es marca de AWS</p>
  </div>
```

El SVG del octocat es de github-corners (tholman, MIT). El primer `<path>` es el triángulo y toma el `fill` del SVG. Los otros dos son el octocat y usan `currentColor`.

- [ ] **Step 2: Borrar el CSS viejo de la portada**

En `docs/workshop.css`, borrar estos bloques:
- Desde `/* Epic title */` hasta `.start-btn-reset:hover { ... }` incluido. Hay que dejar intacto `/* Reset confirmation modal */` y todo lo que le sigue hasta `.reset-confirm:hover`.
- Desde `.start-help { ... }` hasta `.start-speaker:hover strong { ... }` incluido.
- Las tres líneas de `.unofficial`.
- `.start-left h1 { font-size: 1.8rem; }` dentro de `@media (max-width: 600px)`.
- `.start-btn:focus-visible { outline-offset: 3px; }`.

Dentro de `@media (max-width: 700px)` (bajo `/* Ghost — the hero character */`), reemplazar estas líneas:

```css
  .start-left h1 { font-size: 2.2rem; text-align: center; }
  .start-sub { text-align: center; }
  .start-speaker { margin-left: auto; margin-right: auto; text-align: left; }
```

por:

```css
  .start-logo { font-size: 3rem; }
  .start-menu { align-items: center; }
  .menu-item { padding-right: 1.6rem; }
  .fork-corner svg { width: 64px; height: 64px; }
```

- [ ] **Step 3: Agregar el CSS nuevo de la portada**

En `.screen-start { ... }`, agregar `flex-direction: column;` como primera declaración. En `.start-content { ... }`, agregar `margin-block: auto;`.

Después de la línea `.start-eyebrow a { ... }`, insertar:

```css
.start-eyebrow, .start-stats { opacity: 0; transform: translateY(12px); }
.start-eyebrow { animation: staggerIn 0.5s ease forwards 0.1s; }
.start-stats { animation: staggerIn 0.5s ease forwards 0.6s; }

/* Logo de juego: cae con rebote */
.start-title { margin-bottom: 0.9rem; }
.start-logo {
  display: block; font-size: clamp(3rem, 7vw, 5.5rem); font-weight: 800;
  letter-spacing: -0.04em; line-height: 0.95; text-transform: uppercase;
  background: linear-gradient(180deg, #fff 0%, var(--accent-bright) 55%, var(--accent) 100%);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 4px 0 var(--accent-deep)) drop-shadow(0 0 24px rgba(145,71,255,0.45));
  opacity: 0; animation: logoDrop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s forwards;
}
@keyframes logoDrop { from { opacity: 0; transform: translateY(-60px); } to { opacity: 1; transform: none; } }
.start-tagline { display: block; margin-top: 0.7rem; font-size: clamp(1rem, 1.6vw, 1.25rem); font-weight: 600; color: var(--body); letter-spacing: -0.01em; }
.start-stats { font-family: 'Fragment Mono', monospace; font-size: 0.8rem; color: var(--accent-bright); text-transform: uppercase; letter-spacing: 0.18em; margin-bottom: 1.6rem; }

/* Menú arcade: cursor ▶ en la opción activa; aparece de golpe después del logo */
.start-menu { display: flex; flex-direction: column; align-items: flex-start; gap: 0.15rem; opacity: 0; animation: menuPop 0s linear 0.85s forwards; }
@keyframes menuPop { to { opacity: 1; } }
.menu-item {
  position: relative; display: inline-flex; align-items: baseline; gap: 0.6rem;
  padding: 0.35rem 0 0.35rem 1.6rem; background: none; border: none; cursor: pointer;
  font-family: 'Fragment Mono', monospace; font-size: 1.05rem; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--muted); text-decoration: none; transition: color 0.12s, text-shadow 0.12s;
}
.menu-item[hidden] { display: none; }
.menu-item::before {
  content: "▶"; content: "▶" / "";
  position: absolute; left: 0; top: 50%; transform: translateY(-50%);
  font-size: 0.75em; color: var(--accent-bright); opacity: 0;
}
.menu-item:hover, .menu-item:focus-visible,
.start-menu:not(:hover):not(:focus-within) .menu-item.is-primary {
  color: var(--text); outline: none; text-shadow: 0 0 12px rgba(197,158,255,0.6);
}
.menu-item:hover::before, .menu-item:focus-visible::before,
.start-menu:not(:hover):not(:focus-within) .menu-item.is-primary::before {
  opacity: 1; animation: cursorBlink 0.8s steps(1) infinite;
}
@keyframes cursorBlink { 50% { opacity: 0; } }
.menu-meta { font-size: 0.8em; color: var(--accent-bright); letter-spacing: 0.08em; }

.start-press {
  margin-top: 1.6rem; font-family: 'Fragment Mono', monospace; font-size: 0.72rem;
  letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent-bright);
  opacity: 0; animation: pressBlink 1.1s steps(1) 1.3s infinite;
}
@keyframes pressBlink { 0% { opacity: 1; } 50% { opacity: 0; } }
.press-touch { display: none; }
@media (hover: none) { .press-key { display: none; } .press-touch { display: inline; } }

.start-legal {
  position: relative; z-index: 1; padding: 0 1rem 1rem; text-align: center;
  font-family: 'Fragment Mono', monospace; font-size: 0.62rem; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--muted);
}

/* Scanlines de CRT, muy sutiles */
.start-scan {
  position: fixed; inset: 0; z-index: 2; pointer-events: none;
  background: repeating-linear-gradient(to bottom, rgba(255,255,255,0.035) 0 1px, transparent 1px 3px);
}

/* Esquina "fork me" de GitHub (github-corners, tholman, MIT) */
.fork-corner { position: absolute; top: 0; right: 0; z-index: 3; }
.fork-corner svg { display: block; fill: var(--accent); color: var(--bg); }
.fork-corner .octo-arm { transform-origin: 130px 106px; }
.fork-corner:hover .octo-arm, .fork-corner:focus-visible .octo-arm { animation: octoWave 560ms ease-in-out; }
@keyframes octoWave { 0%, 100% { transform: rotate(0); } 20%, 60% { transform: rotate(-25deg); } 40%, 80% { transform: rotate(10deg); } }
.fork-corner:focus-visible { outline: 2px solid var(--accent-bright); outline-offset: -6px; }

@media (prefers-reduced-motion: reduce) {
  .start-eyebrow, .start-stats, .start-logo, .start-menu, .start-press { animation: none; opacity: 1; transform: none; }
  .menu-item::before, .fork-corner .octo-arm { animation: none !important; }
}
```

- [ ] **Step 4: Verificar en el navegador**

Ejecutar `python3 -m http.server -d docs 8765` en segundo plano y abrir `http://localhost:8765/` en un contexto aislado. Esperar 2 s y ejecutar en la página:

```js
() => ({
  logo: getComputedStyle(document.querySelector('.start-logo')).opacity,
  menuItems: [...document.querySelectorAll('#start-menu .menu-item')].filter(e => !e.hidden).map(e => e.textContent.trim()),
  legal: document.querySelector('.start-legal').textContent,
  fork: document.querySelector('.fork-corner').getAttribute('href'),
  oldGone: !document.querySelector('.unofficial, .start-speaker, .start-help')
})
```

Resultado esperado: `logo: "1"`, `menuItems: ["Jugar", "Modo orador", "Cómo jugar"]`, `legal` empieza con "© 2026", `fork` es la URL del repo y `oldGone: true`. Tomar una captura a 1280px y otra a 390px (con `resize_page`). Hay que ver el logo grande, el menú en Fragment Mono, la esquina morada con el octocat y el pie en una sola línea, sin solapes.

- [ ] **Step 5: Commit**

```bash
git add docs/index.html docs/workshop.css
git commit -m "feat: portada estilo pantalla de inicio de juego (marcado y estilos)"
```

---

### Task 2: Comportamiento del menú

**Files:**
- Modify: `docs/workshop.js`: `updateStartButtons()` (≈ línea 697), una función nueva `setupStartMenu()` después de `setupScreens()` y la llamada en el init (≈ línea 209).

**Interfaces:**
- Consumes: `#start-menu`, `.menu-item`, `#continue-mission` y `.is-primary` de la Task 1. También `current`, `getOpenOverlay()` y la variable `hasProgress`, que ya existe dentro de `updateStartButtons()`.
- Produces: `setupStartMenu(): void`.

- [ ] **Step 1: Comprobar que todavía no funciona**

En `http://localhost:8765/`, ejecutar:

```js
() => ({ primary: document.querySelector('#start-menu .is-primary')?.id ?? null })
```

Resultado esperado: `{ primary: null }`, porque todavía nadie asigna la clase.

- [ ] **Step 2: Marcar la entrada principal y el nivel guardado**

En `updateStartButtons()`, justo después de `if (btnReset) btnReset.hidden = !hasProgress;`, agregar:

```js
    const meta = document.getElementById('continue-mission');
    if (meta) meta.textContent = '· M' + current;
    [btnPlay, btnContinue].forEach(function (el) { if (el) el.classList.remove('is-primary'); });
    const primary = hasProgress ? btnContinue : btnPlay;
    if (primary) primary.classList.add('is-primary');
```

Actualizar el JSDoc de la función: `Sin progreso: "Jugar" es la principal. Con progreso: "Continuar · M{n}" (principal) + "Nueva partida".`

- [ ] **Step 3: Agregar `setupStartMenu()`**

Después del cierre de `setupScreens()`, insertar:

```js
  /**
   * Menú de la portada estilo arcade: flechas arriba/abajo recorren las opciones visibles,
   * Espacio activa también los enlaces y Enter sin nada enfocado activa la opción principal.
   */
  function setupStartMenu() {
    const menu = document.getElementById('start-menu');
    const start = document.getElementById('screen-start');
    if (!menu || !start) return;
    function items() {
      return Array.from(menu.querySelectorAll('.menu-item')).filter(function (el) { return !el.hidden; });
    }

    menu.addEventListener('keydown', function (e) {
      if (e.key === ' ' && e.target.tagName === 'A') { e.preventDefault(); e.target.click(); return; }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const list = items();
      const i = list.indexOf(document.activeElement);
      list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length].focus();
    });

    document.addEventListener('keydown', function (e) {
      if (!start.classList.contains('active') || getOpenOverlay()) return;
      if (document.activeElement && document.activeElement !== document.body) return;
      const primary = menu.querySelector('.is-primary:not([hidden])') || items()[0];
      if (!primary) return;
      if (e.key === 'Enter') { e.preventDefault(); primary.click(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); primary.focus(); }
    });
  }
```

En el init, después de `setupScreens();`, agregar `setupStartMenu();`.

- [ ] **Step 4: Verificar el comportamiento**

Recargar `http://localhost:8765/` (sin progreso, con `localStorage.clear()` antes de recargar) y comprobar lo siguiente:

1. Ejecutar `() => document.querySelector('#start-menu .is-primary').id`. Esperado: `"btn-play"`.
2. Con `press_key` en `ArrowDown`, la entrada enfocada pasa a ser `btn-play`. Con otro `ArrowDown`, pasa a `btn-speaker`. Con `ArrowUp` dos veces, vuelve a `btn-play` y luego salta a `btn-help` (es circular). Para comprobarlo, ejecutar `() => document.activeElement.id` después de cada tecla.
3. Ejecutar `() => { document.activeElement.blur(); }` y luego `press_key` en `Enter`. Esperado: `document.querySelector('#screen-play').classList.contains('active') === true` después de 600 ms.
4. Volver a la portada con `() => document.getElementById('btn-home').click()`. Ahora hay progreso, así que ejecutar `() => ({ primary: document.querySelector('#start-menu .is-primary').id, meta: document.getElementById('continue-mission').textContent, items: [...document.querySelectorAll('#start-menu .menu-item')].filter(e => !e.hidden).map(e => e.id) })`. Esperado: `primary: "btn-continue"`, `meta: "· M1"` e `items: ["btn-continue", "btn-reset", "btn-speaker", "btn-help"]`.
5. Ejecutar `() => document.getElementById('btn-reset').click()` y comprobar que `#reset-overlay` queda abierto. Cerrarlo con `Escape`.
6. Comprobar que no hay errores con `list_console_messages`.

- [ ] **Step 5: Commit**

```bash
git add docs/workshop.js
git commit -m "feat: menú arcade de la portada navegable con flechas y Enter"
```

---

### Task 3: Movimiento reducido, CHANGELOG y cierre

**Files:**
- Modify: `CHANGELOG.md` (entrada nueva arriba)

- [ ] **Step 1: Verificar el movimiento reducido**

Con `emulate` y `prefers-reduced-motion: reduce`, recargar y ejecutar:

```js
() => ['.start-logo', '.start-menu', '.start-press'].map(s => getComputedStyle(document.querySelector(s)).opacity)
```

Esperado: `["1", "1", "1"]`. Tomar una captura: todo tiene que verse estático y visible.

- [ ] **Step 2: Agregar la entrada del CHANGELOG**

Insertar debajo de `# Changelog — Ask Kiro` y antes de `## v1.6.0`:

```markdown
## v1.7.0 — 2026-10-06 — Portada de juego y código abierto

| ID | Descripción |
|----|-------------|
| UX-021 | Portada como pantalla de inicio de juego: logo ASK KIRO que cae con rebote, menú arcade (Continuar · M{n}, Jugar, Nueva partida, Modo orador, Cómo jugar) navegable con ↑/↓ y Enter, "Pulsa Enter" parpadeante y scanlines sutiles |
| UX-022 | Esquina "fork me" de GitHub con el octocat en el morado de la marca; el aviso legal queda en una línea al pie |
| OSS-001 | Licencia MIT y sección "Haz tu propia versión" en el README (fork, GitHub Pages, CNAME, Analytics) |
```

- [ ] **Step 3: Detener el servidor y hacer commit**

```bash
pkill -f "http.server -d docs 8765"
git add CHANGELOG.md
git commit -m "docs: CHANGELOG v1.7.0"
```
