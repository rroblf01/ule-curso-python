# Python en 3 días · ULE

Web del curso introductorio de Python para estudiantes de 1.º de la Universidad de León. Tres sesiones de una hora:

| Día | Tema | Proyecto |
|-----|------|----------|
| 1 | Fundamentos: tipos de datos, control de flujo y funciones | 10 ejercicios con solución |
| 2 | Programación orientada a objetos | Formas geométricas con herencia |
| 3 | IA en tus programas con Pydantic AI y Ollama | Asistente de estudio (resúmenes y tests) |

Los alumnos no instalan nada:

- **Días 1 y 2:** cada bloque de código es un editor que ejecuta Python en el navegador con [PyScript](https://pyscript.net) (Pyodide en un *web worker*). Incluye autocompletado y documentación en español, firmas de funciones, errores de sintaxis en vivo, errores de ejecución explicados, `input()` y botón para detener bucles infinitos.
- **Día 3:** [Google Colab](https://colab.research.google.com) con GPU para ejecutar un modelo con Ollama. El tema de Pydantic sí se ejecuta en el navegador.

## Desarrollo

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # genera la web estática en ./dist
npm run preview
```

## Estructura

```text
src/
├── content/lessons/      # Un archivo Markdown por tema
│   ├── dia-1/
│   ├── dia-2/
│   └── dia-3/
├── content.config.ts     # Esquema de los temas (title, day, order, minutes)
├── data/days.ts          # Título y objetivo de cada día
├── scripts/python/       # Editores ejecutables
│   ├── runtime.ts        # Worker de PyScript compartido (ejecutar, detener, input, jedi)
│   ├── playground.ts     # Editor CodeMirror + barra + salida
│   ├── assist.ts         # Autocompletado, ayuda al pasar el ratón, firmas y errores en vivo
│   └── docs-es.ts        # Documentación en español de funciones y métodos
├── components/Navbar.astro
├── layouts/Base.astro
└── pages/
    ├── index.astro       # Portada
    └── dia/[day].astro   # Temario a la izquierda, contenido a la derecha
```

### Añadir o editar un tema

Crea un `.md` en la carpeta del día con este *frontmatter*:

```md
---
title: Título del tema
day: 1
order: 16          # posición en la lista
minutes: 5         # duración estimada (se suma en el total del día)
runnable: true     # opcional: false para que los bloques de Python no sean editores
---
```

Los bloques ```` ```python ```` de un tema ejecutable se convierten en editores. Para dejar uno como código estático, añade `static`: ```` ```python static ````.

El motor que se ejecuta en el worker está en [public/python/runner.py](public/python/runner.py), incluidas las explicaciones en español de los errores.

## Despliegue

Los editores necesitan `SharedArrayBuffer` (para `input()` y para detener la ejecución), que solo está disponible si la página se sirve con estas cabeceras:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

- `npm run dev` y `npm run preview` ya las envían (ver `astro.config.mjs`).
- **Netlify / Cloudflare Pages:** las toma de [public/_headers](public/_headers).
- **Vercel:** las toma de [vercel.json](vercel.json).
- **GitHub Pages u otros sin control de cabeceras:** la página carga [mini-coi](https://github.com/WebReflection/mini-coi), un *service worker* que las añade (la primera visita se recarga sola una vez).

Las soluciones de los ejercicios van dentro de `<details><summary>Ver solución</summary> … </details>` (dejando líneas en blanco alrededor del bloque de código).

## Notas para el profesor

- **Primera carga de Python:** cada alumno descarga unos 10-15 MB la primera vez (después queda en la caché del navegador). Con toda la clase en la misma wifi, pide que abran la web y pulsen **Cargar ahora** (panel de la izquierda) al empezar.
- **Ritmo del día 1:** es el día más denso. Los minutos están ajustados a 60; en clase se hacen 2 + 1 ejercicios y el resto queda para casa.
- **Día 3 sin claves de API:** se usa un modelo abierto (`qwen3:8b`) servido con **Ollama** en la GPU T4 gratuita de Colab. Pide a los alumnos que ejecuten la *celda de preparación* al empezar la clase: tarda 2-3 minutos (descarga de ~5 GB) y se puede explicar la teoría mientras tanto.
- **Salidas estructuradas con `NativeOutput`:** con modelos locales, el modo por defecto de Pydantic AI (llamada a herramienta) falla más y necesita reintentos. `NativeOutput` hace que Ollama restrinja la generación al esquema JSON. Probado con pydantic-ai 2.57 y Ollama 0.40.
- **Plan B:** las GPUs gratuitas de Colab no están garantizadas. El último tema del día 3 explica cómo cambiar a Gemini (nivel gratuito con clave de [Google AI Studio](https://aistudio.google.com/apikey), requiere ser mayor de edad) cambiando solo la celda de preparación.
- **Pydantic AI v2:** en Colab hay que usar `await agente.run(...)` en lugar de `run_sync`, porque el cuaderno ya tiene un bucle de eventos en marcha.
