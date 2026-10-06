# Ask Kiro — De vibe coding a software real

Tutorial interactivo para [Kiro](https://kiro.dev). 3 fases, 10 misiones, una app real. Validado contra Kiro IDE 1.2 (octubre 2026).

Construyes un juego runner desde cero y en cada misión agregas una feature de Kiro que resuelve un problema concreto.

## Las 10 misiones

| # | Fase | Feature | Problema que resuelve |
|---|------|---------|----------------------|
| 1 | Construye | Vibe Coding (agente Default) | Velocidad inicial |
| 2 | Construye | Steering | Inconsistencia de equipo |
| 3 | Construye | Specs (Quick Spec) | Features sin plan |
| 4 | Automatiza | Hooks | Errores que se cuelan |
| 5 | Automatiza | Custom Agents | Falta de criterio y permisos acotados |
| 6 | Automatiza | Web Search | Salir del IDE a buscar info |
| 7 | Automatiza | Workflows | Trabajo que no cabe en una sesión |
| 8 | Conecta | Skills (propias e importadas) | Contexto especializado bajo demanda |
| 9 | Conecta | MCP | IA desconectada del stack real |
| 10 | Conecta | Powers | Todo disperso, difícil de compartir |

## Cómo empezar

### Self-Service

1. Crea una carpeta vacía y ábrela en [Kiro](https://kiro.dev) con Autopilot activado.
2. Ve a [askkiro.info](https://askkiro.info/) y sigue las misiones: cada prompt se copia con "Ask Kiro" y se pega en el chat.

No necesitas clonar este repo: solo contiene la guía web.

### Presentador

En la portada de [askkiro.info](https://askkiro.info/), haz clic en "¿Vas a dar este taller?" para abrir la **vista de orador** en otra ventana (o ve directo a [askkiro.info/orador.html](https://askkiro.info/orador.html)).

- Proyecta el tutorial; la vista de orador queda en tu laptop. La audiencia nunca ve las notas.
- Cada misión muestra qué decir, qué mostrar, preguntas para la audiencia y qué confirmar con la sala.
- Cronómetro de sesión y por misión con el tiempo sugerido (~55 min total).
- Avanza con flechas o un clicker de presentación: ambas ventanas se mueven juntas.

## Guía web interactiva

[askkiro.info](https://askkiro.info/)

## Haz tu propia versión

Este repo es de código abierto ([MIT](LICENSE)): haz un fork para traducirlo, adaptarlo a tu equipo o dar el taller con tus propios ejemplos.

1. Haz un fork y activa GitHub Pages en **Settings → Pages**, con la rama `main` y la carpeta `/docs`.
2. Borra `docs/CNAME` (es el dominio askkiro.info) o pon ahí el tuyo.
3. En `docs/index.html`, quita o reemplaza el ID de Google Analytics (`G-ZDDXJ02XK6`) y cambia las URLs de `askkiro.info` en las metaetiquetas y los botones de compartir.
4. Edita el contenido:
   - `docs/index.html`: las misiones, los prompts, las visuales y las notas del orador (los bloques `.pnote` de cada misión).
   - `docs/workshop.css`: colores y tipografía (los tokens van al inicio).

No hace falta build: es HTML, CSS y JS estático. Para probarlo en local, sirve la carpeta con `python3 -m http.server -d docs` y abre http://localhost:8000 (la vista de orador no carga las notas si abres el archivo directo desde el disco).

La licencia cubre el código y el texto del tutorial, no la marca: Kiro y su logo son de Amazon Web Services. Si publicas tu versión, deja claro que no es oficial.
