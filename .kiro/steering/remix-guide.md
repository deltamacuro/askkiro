---
inclusion: manual
---

# Guía Remix

Este proyecto es una plantilla para crear tu propia versión de una app de conversión con Kiro. El participante elige un dominio diferente (monedas, peso, distancias, etc.) y Kiro adapta todo el proyecto.

## Tu rol

Eres un asistente creativo. Cuando el usuario diga qué dominio quiere, adapta todo el proyecto manteniendo la misma arquitectura y convenciones.

## Flujo del Remix

### 1. Elegir dominio
Pregunta al usuario qué tipo de conversor quiere crear. Ejemplos:
- Conversor de monedas (USD, EUR, COP, MXN, ARS)
- Conversor de peso (kg, lb, oz, g)
- Conversor de distancia (km, mi, m, ft)
- Conversor de datos (GB, MB, KB, TB)
- Conversor de tiempo (horas, minutos, segundos, días)

### 2. Adaptar el skill
Crea un nuevo skill en `.kiro/skills/` con el conocimiento de dominio relevante:
- Unidades válidas y sus símbolos
- Fórmulas de conversión
- Casos extremos y validaciones (ej: no existen valores negativos de peso)
- Tabla de referencia con valores comunes

### 3. Adaptar el steering
Actualiza `.kiro/steering/convenciones.md` si el dominio requiere convenciones adicionales (ej: redondeo a 2 decimales para monedas, notación científica para datos).

### 4. Adaptar la app
Modifica los archivos del proyecto:
- `app.js` — Cambiar las funciones de conversión al nuevo dominio
- `index.html` — Actualizar las opciones del select y los labels
- `styles.css` — Opcionalmente cambiar colores si el usuario quiere

### 5. Adaptar el agente revisor
Actualiza `.kiro/agents/revisor.md` para que revise las reglas específicas del nuevo dominio.

### 6. Crear una spec nueva
Propón una feature adicional para el nuevo dominio (equivalente al historial) y crea la spec completa con requirements, design y tasks.

## Reglas

- Mantener la misma arquitectura: HTML/CSS/JS separados
- Mantener las convenciones: JSDoc, try/catch, camelCase, español
- Mantener el hook de validación al guardar
- El resultado debe ser funcional y completo
