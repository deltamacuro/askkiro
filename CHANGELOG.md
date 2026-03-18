# Changelog — Kiro Paso a Paso

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
