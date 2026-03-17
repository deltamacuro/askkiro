---
inclusion: manual
---

# Guía para el Presentador — De vibe coding a software real

Guión completo para dictar el workshop como clase. Cada sesión incluye qué demostrar, qué decir y cuándo pausar.

## Tu rol

Eres el asistente del presentador. Cuando te pida demostrar algo, hazlo de forma clara y visible.

## Guión (9 sesiones, ~60-75 min)

### Sesión 1 — Vibe Coding (5 min)
- Demo: "Crea una web app de conversor de temperaturas"
- Abrir en browser, mostrar que funciona
- Decir: "Un prompt. Treinta segundos. Tenemos una app. Pero... ¿qué pasa cuando otro dev toca este código?"

### Sesión 2 — Steering (8 min)
- Explicar el problema: inconsistencia entre devs
- Demo: crear steering con convenciones
- Demo: refactorizar el conversor
- Mostrar diff: JSDoc, español, try/catch
- Decir: "No le repetí las reglas. Las leyó solas. Para siempre, para todo el equipo."
- Pausa: preguntar a la audiencia qué convenciones agregarían

### Sesión 3 — Specs (10 min)
- Explicar: un prompt largo para algo complejo suele salir mal
- Demo: Panel Specs → "+" → historial-conversiones
- Mostrar los 3 documentos despacio
- Aprobar cada sección
- Decir: "No es un prompt que espero que funcione. Es un plan que yo revisé y aprobé."

### Sesión 4 — Hooks (8 min)
- Demo: Panel Hooks → "+" → crear hook de revisión al guardar
- Demo 1: borrar paréntesis en app.js, guardar, ver chat
- Demo 2: crear función sin JSDoc, guardar
- Decir: "No corrí ningún comando. No instalé ningún linter. El IDE reaccionó solo."
- Este es un momento "wow". Esperar la reacción.

### Sesión 5 — Agents (8 min)
- Explicar: la IA genérica aprueba cualquier cosa
- Demo: crear agente "revisor"
- Demo: @revisor revisa app.js
- Mostrar ciclo RECHAZADO → corrección → APROBADO
- Decir: "Tiene el criterio de tu equipo."
- Pausa: preguntar qué roles especializados necesitan

### Sesión 6 — Skills (8 min)
- Explicar diferencia steering vs skills
- Demo: crear skill "fisica-temperaturas"
- Demo: "¿Qué pasa si intento convertir -300°C?"
- Decir: "Steering son las reglas. Skills es la expertise."

### Sesión 7 — Web Search (5 min)
- Demo: "¿Cuál fue la temperatura más baja registrada en la Tierra?"
- Demo: "¿Cuál es el estándar ISO para temperaturas en UI?"
- Decir: "No abrí ninguna pestaña. La información llegó donde la necesitaba."

### Sesión 8 — MCP (8 min)
- Explicar: la IA no sabe qué servicios de AWS existen hoy
- Demo: configurar mcp.json con aws-documentation-mcp-server
- Demo: preguntar sobre deploy a hosting estático en AWS
- Mostrar cómo cita fuentes oficiales
- Decir: "Es la documentación oficial, leída en tiempo real."

### Sesión 9 — Powers (5 min)
- Explicar: todo vive disperso, difícil de compartir
- Mostrar concepto de Power como paquete
- Analogía: "Es como un npm package, pero para el conocimiento del equipo."
- Decir: "Con MCP conectaste la IA a una herramienta. Con Powers le diste el manual."

### Cierre (5 min)
- Leer la frase de cierre completa
- Mostrar cheat sheet
- Compartir link del repo
- Q&A

## Tips

- Mantén Kiro visible en pantalla grande
- Haz las demos en vivo, no uses capturas
- Si algo falla, úsalo como oportunidad de debugging
- Deja que la audiencia vea errores y correcciones en tiempo real
