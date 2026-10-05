# Changelog — Ask Kiro

## v1.5.0 — 2026-10-05 — Claridad del tutorial + vista de orador

| ID | Descripcion |
|----|-------------|
| UX-012 | Pasos numerados (1, 2, 3...) en cada mision |
| UX-013 | "Resultado" pasa a ser un checkbox "Verifica" con criterio concreto; marca el dot como completado |
| UX-014 | Panel "Tu proyecto": estructura `.kiro/` que crece mision a mision (el que, el plan, el cuando, el quien, el como) |
| UX-015 | El fantasma salta sobre los dots al avanzar; salto grande al cruzar de fase y festejo al verificar |
| UX-016 | M3 Specs: wizard reemplazado por los 3 documentos reales (requirements.md con EARS, design.md con diagrama, tasks.md con checkboxes) y sus puertas de aprobacion, segun kiro.dev/docs/specs |
| PRES-001 | Modo presentador reemplazado por `orador.html`: vista de orador en ventana aparte, sincronizada con el tutorial, con cronometros y bloques Decir / Mostrar / Preguntar / Confirma |
| PRES-002 | Navegacion con clickers de presentacion (PageUp/PageDown) en ambas ventanas |
| CONT-002 | M3: se corrige "Solo requeridas / Todas" (no existe; "Run all Tasks" ejecuta las requeridas pendientes), se agregan Quick Spec y Sync Files |

## v1.4.0 — 2026-10-05 — Auditoria

| ID | Descripcion |
|----|-------------|
| BUG-019 | Con un overlay abierto, flechas/Enter navegaban misiones por detras — ahora se bloquean |
| BUG-020 | Escape no cerraba el onboarding de presentador — manejo unificado de Escape para todos los overlays |
| BUG-021 | El foco no volvia al boton de origen al cerrar overlays — `openOverlay`/`closeOverlay` lo restauran |
| BUG-022 | `loadState` no validaba datos de localStorage — `current` fuera de rango dejaba la pantalla vacia |
| A11Y-001 | Focus trap en todos los overlays (antes solo ayuda) + `role="dialog"` y `aria-modal` |
| SEO-001 | og:image/twitter:image en PNG 1200x630 (`og-image.png`); SVG no es soportado por LinkedIn/X |
| CONT-001 | Duracion unificada a 50 minutos; "Podes" → "Puedes"; M5 ya no asume que existe `game.js` |
| CODE-001 | Eliminados restos del modo remix, listener muerto de `.start-mode` y logica de fase duplicada (`phaseOf`) |
| DOC-001 | README: se trabaja en una carpeta vacia, no clonando este repo |

## v1.3.0 — 2026-03-18 — Onboarding + Recap

| ID | Descripcion |
|----|-------------|
| UX-008 | Modal de onboarding al hacer clic en "Empezar": explica como funciona el tutorial en 3 pasos con iconos |
| UX-009 | Recap visual en end screen: mapa de conceptos con las 3 fases y 9 features organizadas como flowchart CSS |
| UX-010 | End screen usa align-items:safe center para scroll cuando el contenido excede la pantalla |
| UX-011 | Escape cierra el onboarding modal y navega a misiones |

## v1.2.1 — 2026-03-18 — Epic Ghost Animation

| ID | Descripcion |
|----|-------------|
| ANIM-001 | Ghost del end-screen con animacion power-up: float asimetrico + squash-stretch + micro-wiggle (endGhostPower 4s) |
| ANIM-002 | Glow pulsante ciclico en el ghost: intensidad de drop-shadow sube y baja (endGhostGlow 3s) |
| ANIM-003 | Doble anillo de aura: inner pulse (auraPulse 2.5s) + outer energy ring (auraOuter 3.5s) |
| ANIM-004 | Rayos de luz del end-screen mas rapidos (50s → 35s) para mayor energia visual |

## v1.2.0 — 2026-03-18 — UX Polish

| ID | Descripcion |
|----|-------------|
| UX-001 | Dots de fases locked no permiten click ni navegacion (validacion de fase en click handler) |
| UX-002 | Dots locked con visual atenuado (.dot-locked) y cursor default |
| UX-003 | Dots visitados con micro-recompensa: pulse animation al completar mision |
| UX-004 | Keyboard: Escape cierra help overlay, ArrowRight/Enter finaliza en ultima mision |
| UX-005 | Help overlay: focus trap con Tab/Shift+Tab, devuelve foco al cerrar |
| UX-006 | mission-area: align-items safe center para evitar corte de contenido en scroll |
| UX-007 | screen-end: particulas flotantes sutiles (consistencia con las demas screens) |

## v1.1.1 — 2026-03-18 — Bugfix round 2

| ID | Estado | Descripcion |
|----|--------|-------------|
| BUG-014 | ✅ fixed | switchScreen no persiste pantalla en localStorage — saveState guarda `screen`, restoreScreen lo restaura (incluye screen-end) |
| BUG-015 | ✅ fixed | Fases locked alcanzables por teclado — tabindex="-1" en HTML y gestion dinamica en updateUI |
| BUG-016 | ✅ fixed | Link "Modo remix" sin estado disabled — clase .start-mode-disabled, pointer-events:none, title="Proximamente", aria-disabled |
| BUG-017 | ✅ fixed | meta theme-color con color viejo #0c0c0f — actualizado a #09090a |
| BUG-018 | ✅ fixed | .start-btn:hover mata btnPulse permanentemente — redeclarar lista completa de animaciones en :hover |

## v1.1.0 — 2026-03-18 — Bugfix + A11y + Code Quality

Correccion masiva de 13 bugs detectados en auditoria de codigo.

| ID | Estado | Descripcion |
|----|--------|-------------|
| BUG-001 | ✅ fixed | Timing mismatch: fade-out CSS 400ms vs setTimeout 250ms — alineado a 350ms |
| BUG-002 | ✅ fixed | Race condition en switchScreen con doble-clic — flag `transitioning` |
| BUG-003 | ✅ fixed | loadState no restauraba la screen activa — agregado `restoreScreen()` |
| BUG-004 | ✅ fixed | Fases nunca se bloqueaban realmente — logica `isPhaseUnlocked()` |
| BUG-005 | ✅ fixed | Clipboard sin .catch ni fallback — `copyToClipboard()` con execCommand fallback |
| BUG-006 | ✅ fixed | 100vh en iOS Safari — agregado `height: 100dvh` con fallback |
| BUG-007 | ✅ fixed | nav-dots sin aria-label — dots con `aria-label` y `aria-current` |
| BUG-008 | ✅ fixed | role="tablist" incompleto — removido (navegacion simple) |
| BUG-009 | ✅ fixed | topbar-phase.locked sin aria-disabled — agregado en HTML y JS dinamico |
| BUG-010 | ✅ fixed | nav-dot 8x8px touch target — padding trick para 26px area clickeable |
| BUG-011 | ✅ fixed | Sin estilos :focus-visible — agregados para todos los interactivos |
| BUG-012 | ✅ fixed | Bloques multilinea sin pre+code — migrados a `<pre><code>` |
| BUG-013 | ✅ fixed | Variables globales sin encapsular — IIFE con let/const y JSDoc completo |

## v1.0.0 — Release inicial

- 3 pantallas fullscreen (Inicio, Misiones, Final)
- 9 misiones en 3 fases
- Navegacion con flechas, dots y tabs de fase
- Persistencia con localStorage
- Modo presentador
- Clipboard copy en bloques de codigo
