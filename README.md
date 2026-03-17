# 🌡️ Kiro Paso a Paso

Workshop interactivo para aprender las features de Kiro construyendo un conversor de temperaturas.

## ¿Qué vas a aprender?

| Feature | Qué hace | Dónde verlo |
|---------|----------|-------------|
| 📐 Steering | Reglas que Kiro sigue siempre | `starter/.kiro/steering/` |
| 🧠 Skills | Conocimiento de dominio inyectado | `starter/.kiro/skills/` |
| ⚡ Hooks | Automatización basada en eventos | `starter/.kiro/hooks/` |
| 🤖 Agents | Roles especializados reutilizables | `starter/.kiro/agents/` |
| 📋 Specs | Desarrollo guiado por requisitos | `starter/.kiro/specs/` |
| 📦 Powers | Todo empaquetado y distribuible | `starter/powers/` |

## Estructura del repo

```
kiro-paso-a-paso/
├── docs/                  # Guía web interactiva (GitHub Pages)
├── starter/               # Punto de partida para el participante
│   ├── .kiro/             # Assets de Kiro (steering, skills, agents, hooks, specs)
│   ├── powers/            # Power empaquetado
│   ├── index.html         # App básica (sin historial)
│   ├── app.js             # Lógica de conversión
│   ├── styles.css         # Estilos base
│   └── ejemplo.js         # Archivo para practicar
├── solucion/              # App completa (referencia final)
│   ├── index.html         # App con historial
│   ├── app.js             # Lógica + integración historial
│   ├── history.js         # Módulo de historial
│   ├── styles.css         # Estilos completos
│   └── ejemplo.js
└── README.md
```

## Elige tu modo

### 🧑‍💻 Self-Service (autoguiado)

1. Clona este repo
2. Abre la carpeta `starter/` como workspace en Kiro
3. En el chat, escribe `#workshop-guide` y luego "empezar workshop"
4. Kiro te guiará paso a paso por cada feature

### 🎤 Presentador (clase guiada)

1. Abre la [guía web interactiva](https://deltamacuro.github.io/kiro-paso-a-paso/)
2. Selecciona el modo "Presentador" para ver notas y tiempos
3. Los participantes abren `starter/` en Kiro y siguen las instrucciones

### 🎨 Remix (versión personalizada)

1. Abre `starter/` en Kiro
2. Pídele: "Quiero adaptar este proyecto a un conversor de [monedas/peso/distancias]"
3. Kiro usará la estructura existente como patrón para crear tu versión

## GitHub Pages

La guía web se sirve desde `docs/`. Para activarla:

1. Ve a Settings → Pages
2. Source: Deploy from branch
3. Branch: `main`, folder: `/docs`
4. La guía estará en `https://deltamacuro.github.io/kiro-paso-a-paso/`

## ¿Cómo funciona?

El participante abre `starter/` como workspace. Al hacerlo, Kiro lee automáticamente los archivos en `.kiro/` y tiene todo el contexto: convenciones del equipo, conocimiento de física, el agente revisor y los hooks de validación. La carpeta `solucion/` sirve como referencia para comparar el resultado final.
