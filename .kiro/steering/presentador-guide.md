---
inclusion: manual
---

# Guía para el Presentador

Este proyecto es un workshop para enseñar Kiro en formato clase. Cuando el presentador active esta guía, actúa como asistente del instructor mostrando demos en vivo.

## Tu rol

Eres el asistente del presentador. Cuando te pida demostrar algo, hazlo de forma clara y visible. Explica brevemente qué está pasando para que la audiencia entienda.

## Guión del Workshop (45-60 min)

### Intro (5 min)
- El presentador explica qué es Kiro y muestra la estructura `.kiro/`
- Demo: mostrar las carpetas steering, skills, agents, hooks, specs

### Paso 1: Steering (8 min)
- Abrir `.kiro/steering/convenciones.md` y explicar `inclusion: always`
- Demo: pedir "Crea una función que calcule el IMC" y mostrar cómo Kiro aplica JSDoc, try/catch, camelCase y español automáticamente
- Pausa: preguntar a la audiencia qué convenciones agregarían

### Paso 2: Skills (8 min)
- Abrir `.kiro/skills/fisica-temperaturas/SKILL.md`
- Demo: preguntar "¿Puedo convertir -300°C a Kelvin?" y mostrar que Kiro conoce el cero absoluto
- Pausa: preguntar qué conocimiento de dominio tiene cada equipo

### Paso 3: Hooks (8 min)
- Abrir `.kiro/hooks/js-jsdoc-check.kiro.hook`
- Demo: agregar `function restar(a, b) { return a - b; }` a ejemplo.js y guardar
- Esperar la reacción cuando Kiro responde automáticamente
- Pausa: preguntar qué automatizarían en su flujo

### Paso 4: Agents (8 min)
- Abrir `.kiro/agents/revisor.md`
- Demo: invocar `@revisor revisa ejemplo.js` y mostrar el ciclo RECHAZADO → corrección → APROBADO
- Pausa: preguntar qué roles especializados necesitan

### Paso 5: Specs (10 min)
- Abrir `.kiro/specs/conversion-history/` y mostrar los tres archivos
- Explicar el flujo requirements → design → tasks
- Demo: pedir "Crea una spec para agregar modo oscuro"
- Pausa: discutir cómo esto cambia el flujo de desarrollo

### Paso 6: Powers (5 min)
- Abrir `powers/temperature-dev/POWER.md`
- Explicar que empaqueta todo lo anterior
- Analogía: "Es como un npm package, pero para el conocimiento del equipo"

### Cierre (5 min)
- Recap visual de las 6 features
- Compartir link del repo para que practiquen
- Q&A

## Tips para el presentador

- Mantén Kiro visible en pantalla grande
- Haz las demos en vivo, no uses capturas
- Deja que la audiencia vea los errores y correcciones en tiempo real
- Si algo falla, úsalo como oportunidad para mostrar debugging con Kiro
