# 🌡️ Kiro Workshop — Conversor de Temperaturas

Workshop interactivo para aprender las features de Kiro construyendo un conversor de temperaturas.

## ¿Qué vas a aprender?

| Feature | Qué hace | Archivo clave |
|---------|----------|---------------|
| 📐 Steering | Reglas que Kiro sigue siempre | `.kiro/steering/convenciones.md` |
| 🧠 Skills | Conocimiento de dominio inyectado | `.kiro/skills/fisica-temperaturas/SKILL.md` |
| ⚡ Hooks | Automatización basada en eventos | `.kiro/hooks/js-jsdoc-check.kiro.hook` |
| 🤖 Agents | Roles especializados reutilizables | `.kiro/agents/revisor.md` |
| 📋 Specs | Desarrollo guiado por requisitos | `.kiro/specs/conversion-history/` |
| 📦 Powers | Todo empaquetado y distribuible | `powers/temperature-dev/POWER.md` |

## Elige tu modo

### 🧑‍💻 Self-Service (autoguiado)

1. Clona este repo y ábrelo en Kiro
2. En el chat, escribe `#workshop-guide` y luego "empezar workshop"
3. Kiro te guiará paso a paso por cada feature

### 🎤 Presentador (clase guiada)

1. Abre la [guía web interactiva](https://tu-usuario.github.io/kiro-demo-temperaturas/)
2. Selecciona el modo "Presentador" para ver notas y tiempos
3. Sigue el guión paso a paso con demos en vivo

### 🎨 Remix (versión personalizada)

1. Clona el repo y ábrelo en Kiro
2. Pídele a Kiro: "Quiero adaptar este proyecto a un conversor de [monedas/peso/distancias]"
3. Kiro usará la estructura existente como patrón para crear tu versión

## Guía web

La carpeta `docs/` contiene una GitHub Pages con la guía interactiva del workshop. Para activarla:

1. Sube el repo a GitHub
2. Ve a Settings → Pages → Source: Deploy from branch → Branch: `main`, folder: `/docs`
3. La guía estará disponible en `https://tu-usuario.github.io/kiro-demo-temperaturas/`

## Estructura del proyecto

```
├── .kiro/
│   ├── steering/          # Reglas del proyecto
│   │   ├── convenciones.md
│   │   └── workshop-guide.md  # Guía autoguiada para Kiro
│   ├── skills/            # Conocimiento de dominio
│   ├── agents/            # Agentes especializados
│   ├── hooks/             # Automatizaciones
│   └── specs/             # Especificaciones de features
├── docs/                  # GitHub Pages del workshop
├── powers/                # Power empaquetado
├── index.html             # App del conversor
├── app.js                 # Lógica de conversión
├── history.js             # Módulo de historial
├── styles.css             # Estilos
└── ejemplo.js             # Archivo para practicar
```
