# 🎨 Kiro Paso a Paso — Modo Remix

Usa este proyecto como plantilla y pídele a Kiro que lo adapte a otro dominio.

## Cómo empezar

1. Abre esta carpeta como workspace en Kiro
2. En el chat, escribe `#remix-guide` para activar el modo remix
3. Dile a Kiro qué tipo de conversor quieres:
   - "Quiero hacer un conversor de monedas"
   - "Adapta esto a un conversor de peso"
   - "Hazme un conversor de unidades de datos"

Kiro adaptará la app, el skill, el agente y las convenciones a tu dominio.

## Ideas de remix

| Dominio | Unidades ejemplo |
|---------|-----------------|
| 💰 Monedas | USD, EUR, COP, MXN, ARS |
| ⚖️ Peso | kg, lb, oz, g |
| 📏 Distancia | km, mi, m, ft |
| 💾 Datos | GB, MB, KB, TB |
| ⏱️ Tiempo | horas, min, seg, días |

## Qué se adapta

- `app.js` — Funciones de conversión
- `index.html` — Opciones y labels
- `.kiro/skills/` — Conocimiento del nuevo dominio
- `.kiro/agents/` — Reglas de revisión
- `.kiro/specs/` — Nueva spec para una feature adicional

## Ver la solución original

```bash
git checkout solucion
```

## Guía web

👉 [deltamacuro.github.io/kiro-paso-a-paso](https://deltamacuro.github.io/kiro-paso-a-paso/)
