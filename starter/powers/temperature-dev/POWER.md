---
name: "temperature-dev"
displayName: "Temperature Dev"
description: "Kit completo para desarrollo de aplicaciones de conversion de temperaturas. Incluye convenciones de codigo, conocimiento de fisica de temperaturas, agente revisor de calidad y hooks de validacion automatica."
keywords: ["temperatura", "conversion", "celsius", "fahrenheit", "kelvin"]
author: "proyecto-conversor"
---

# Temperature Dev

## Overview

Power que empaqueta todo el conocimiento y configuracion necesaria para desarrollar aplicaciones de conversion de temperaturas con JavaScript. Incluye convenciones de codigo del equipo, conocimiento de fisica de temperaturas, un agente revisor de calidad y hooks de validacion automatica.

Este power esta pensado para que cualquier desarrollador que se una al proyecto tenga desde el primer momento todas las reglas, validaciones y herramientas configuradas.

## Available Steering Files

- **convenciones** - Convenciones del proyecto: idioma, nomenclatura, JSDoc, manejo de errores, estructura de archivos y estilos visuales.
- **fisica-temperaturas** - Conocimiento de fisica sobre escalas de temperatura, rangos validos, cero absoluto y casos extremos.

## Onboarding

### Que incluye este power

1. **Steering: Convenciones del proyecto** - Reglas de codigo que se aplican siempre (camelCase, JSDoc, try/catch, mensajes en espanol, separacion HTML/CSS/JS, colores #FF9900 y #000000, tipografia Roboto).
2. **Skill: Fisica de temperaturas** - Conocimiento sobre escalas Celsius, Fahrenheit y Kelvin, cero absoluto y validaciones fisicas.
3. **Agent: Revisor** - Agente senior developer que revisa calidad de codigo (JSDoc, try/catch, camelCase). Se invoca con `@revisor`.
4. **Hook: Revisar JSDoc en JS** - Al guardar un archivo `.js`, revisa automaticamente errores y funciones sin JSDoc.

### Como configurar

Para aplicar este power a un proyecto nuevo, copia las siguientes configuraciones a tu workspace:

#### 1. Steering (`.kiro/steering/convenciones.md`)
```markdown
---
inclusion: always
---

# Convenciones del Proyecto

## Idioma
- Todos los mensajes de error deben estar en espanol.

## Nomenclatura
- Usar camelCase para variables y funciones.

## Documentacion
- Todas las funciones deben tener comentarios JSDoc.

## Manejo de errores
- Siempre manejar errores con try/catch.

## Estructura de archivos
- El codigo debe estar separado en archivos independientes: HTML (.html), CSS (.css) y JavaScript (.js).

## Estilos visuales
- Color principal: #FF9900
- Color secundario: #000000
- Tipografia principal: 'Roboto', sans-serif (importar desde Google Fonts)
```

#### 2. Agent (`.kiro/agents/revisor.md`)
```markdown
---
name: revisor
description: Agente que actua como un senior developer estricto con la calidad del codigo. Revisa que todo el codigo tenga manejo de errores explicito con try/catch y que todas las funciones esten documentadas con JSDoc.
tools: ["read"]
---

Eres un senior developer estricto y exigente con la calidad del codigo. Tu rol es revisar codigo JavaScript y solo aprobarlo si cumple con estos criterios obligatorios:

1. Manejo de errores: Todas las funciones deben tener bloques try/catch explicitos. Los mensajes de error deben estar en espanol.
2. Documentacion JSDoc: Todas las funciones deben tener comentarios JSDoc completos con @param y @returns cuando aplique.
3. Nomenclatura: Las variables y funciones deben usar camelCase.

Cuando revises codigo:
- Si cumple todos los criterios, responde con "APROBADO" y un breve resumen.
- Si NO cumple, responde con "RECHAZADO" y lista cada problema con la linea y la correccion necesaria.
```

#### 3. Hook (`.kiro/hooks/js-jsdoc-check.kiro.hook`)
```json
{
  "enabled": true,
  "name": "Revisar JSDoc en JS",
  "description": "Al guardar un archivo JavaScript, revisa si hay errores de sintaxis o funciones sin documentacion JSDoc y avisa en el chat.",
  "version": "1",
  "when": {
    "type": "fileEdited",
    "patterns": ["*.js"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Revisa el archivo JavaScript que se acaba de guardar. Busca: 1) Errores de sintaxis o problemas en el codigo. 2) Funciones que no tengan comentarios JSDoc. Si encuentras problemas, avisame en espanol con los detalles. Si todo esta bien, confirma brevemente que el archivo cumple las convenciones."
  }
}
```

#### 4. Skill (`.kiro/skills/fisica-temperaturas/SKILL.md`)
La skill de fisica de temperaturas se activa automaticamente cuando se trabaja con logica de conversion. Contiene escalas, rangos validos y el cero absoluto.

## Common Workflows

### Workflow 1: Crear una nueva funcion de conversion
1. Escribe la funcion con JSDoc completo (@param, @returns).
2. Agrega try/catch con mensajes de error en espanol.
3. Usa camelCase para el nombre.
4. Valida contra el cero absoluto antes de convertir.
5. Guarda el archivo y el hook revisara automaticamente.

### Workflow 2: Revisar codigo antes de merge
1. Invoca `@revisor revisa <archivo>.js` en el chat.
2. El agente revisara JSDoc, try/catch y camelCase.
3. Si hay problemas, te dara la lista exacta de correcciones.
4. Corrige y vuelve a invocar hasta obtener APROBADO.

### Workflow 3: Validar temperaturas fisicamente imposibles
1. Activa la skill `fisica-temperaturas` con `/fisica-temperaturas` o `#fisica-temperaturas`.
2. Consulta los limites del cero absoluto: -273.15 C, -459.67 F, 0 K.
3. Implementa validacion que rechace valores por debajo de estos limites.

## Validaciones de Temperatura

| Escala      | Limite inferior (cero absoluto) |
|-------------|-------------------------------|
| Celsius     | -273.15 °C                    |
| Fahrenheit  | -459.67 °F                    |
| Kelvin      | 0 K                          |

Ningun valor puede estar por debajo del cero absoluto. Rechazar valores negativos en Kelvin.

## Best Practices

- Siempre validar contra el cero absoluto antes de convertir.
- Separar HTML, CSS y JS en archivos independientes.
- Documentar todas las funciones con JSDoc antes de hacer commit.
- Usar el agente `@revisor` como gate de calidad antes de merge.
- Mantener mensajes de error en espanol para consistencia del proyecto.
- Usar los colores #FF9900 (principal) y #000000 (secundario) en toda la UI.
- Importar Roboto de Google Fonts como tipografia principal.

## Troubleshooting

### El hook no se activa al guardar
- Verifica que el archivo tenga extension `.js`.
- Revisa que el hook este habilitado en `.kiro/hooks/js-jsdoc-check.kiro.hook` con `"enabled": true`.

### El agente revisor no responde
- Asegurate de invocarlo con `@revisor` seguido del comando.
- Verifica que el archivo `.kiro/agents/revisor.md` exista.

### La skill de temperaturas no se activa
- Verifica que exista `.kiro/skills/fisica-temperaturas/SKILL.md`.
- Invocala manualmente con `/fisica-temperaturas` en el chat.
