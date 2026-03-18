# Changelog — Kiro Paso a Paso

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
