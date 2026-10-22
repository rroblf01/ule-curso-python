# Python en 3 días · ULE

Web del curso introductorio de Python para estudiantes de 1.º de la Universidad de León. Tres sesiones de una hora:

| Día | Tema | Proyecto |
|-----|------|----------|
| 1 | Fundamentos: tipos de datos, control de flujo y funciones | 10 ejercicios con solución |
| 2 | Programación orientada a objetos | Formas geométricas con herencia |
| 3 | IA en tus programas con Pydantic AI y Ollama | Asistente de estudio (resúmenes y tests) |

Los alumnos no instalan nada:

- Un **playground** (`/playground/`) para escribir código libremente: precarga Pydantic y Pydantic AI al entrar, tiene ejemplos (input(), clases, Pydantic, agentes de IA) y muestra los paquetes disponibles, leídos del `pyodide-lock.json` incluido en el proyecto.
- Cada bloque de código es un editor que ejecuta Python en el navegador con [PyScript](https://pyscript.net) (Pyodide en un *web worker*). Incluye autocompletado y documentación en español, firmas de funciones, errores de sintaxis en vivo, errores de ejecución explicados, `input()`, `await` y botón para detener la ejecución.
- **Día 3:** Pydantic AI también se ejecuta en el navegador y habla con un modelo abierto (`granite4:350m`) en un servidor Ollama del curso. Encima de cada tema del día hay un bloque **Modelo de IA** que define la variable `MODELO` con Pydantic AI tal cual.

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
    ├── playground.astro  # Editor libre con los paquetes ya cargados (ejemplos en data/playground.ts)
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

## PyScript y Pyodide incluidos en el proyecto

La web no depende de ningún CDN: PyScript, el intérprete Pyodide y los paquetes que usamos (`jedi` para el autocompletado, `pydantic` y `pydantic-ai-slim[openai]` con sus 22 dependencias para el día 3) están en [public/vendor/pyscript/](public/vendor/pyscript/) (unos 24 MB). Solo se descargan cuando se usan: pydantic-ai, la primera vez que un bloque lo importa.

- Se generan con `npm run vendor:pyscript`, que descarga el [paquete offline oficial](https://docs.pyscript.net/2026.7.3/user-guide/offline/) de la versión indicada en el campo `pyscript` de `package.json` y resuelve los paquetes con `micropip` ejecutando ese mismo Pyodide en Node (como lo haría el navegador). Los descarga de la distribución de Pyodide o de PyPI comprobando su SHA-256 y los añade a `pyodide-lock.json`, de modo que un `import` los carga solo.
- Para actualizar PyScript o añadir un paquete de Pyodide, cambia `pyscript.version` o `pyscript.packages` en `package.json` y vuelve a ejecutar el comando.
- Python arranca **en diferido nada más entrar en la web** (en cualquier página, también la portada), en un *web worker*. La web usa el router de Astro (`<ClientRouter />`), así que al cambiar de página no se recarga el documento y **el mismo intérprete sigue vivo**: pasar de la portada a un día, o de un día a otro, no vuelve a cargar Python y las variables se conservan.
- Después, también en segundo plano, se cargan Pydantic y Pydantic AI (ver [src/data/preload.ts](src/data/preload.ts)) y `jedi` (autocompletado), en pasos cortos y solo cuando el alumno no está ejecutando bloques, para no retrasar **Ejecutar**. Así el primer agente de IA no paga la carga de los paquetes.
- Si el usuario tiene activado el ahorro de datos, Python se carga al usar un editor.

## Despliegue

Los editores necesitan `SharedArrayBuffer` (para `input()` y para detener la ejecución), que solo está disponible si la página se sirve con estas cabeceras:

```text
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

- `npm run dev` y `npm run preview` ya las envían (ver `astro.config.mjs`).
- **Docker (gofly):** el [Dockerfile](Dockerfile) construye la web, precomprime los ficheros de texto (incluido `pyodide.asm.wasm`: 9,6 MB → 3,5 MB) y la sirve con [gofly](https://github.com/rroblf01/gofly). Su configuración se escribe en [nginx.conf](nginx.conf) y se convierte a JSON en la propia construcción (`gofly -convert`), así que solo puede usar lo que el conversor entiende: `location` por prefijo (no expresiones regulares), `root`/`alias` y `add_header`. Además de COOP/COEP, define la caché:
  - `/_astro/` y `/vendor/`: un año, `immutable` (los nombres llevan un hash o la versión de PyScript). Sin esto, como gofly calcula el `ETag` con la fecha del fichero, **cada despliegue obligaba a volver a descargar los ~24 MB de Python**.
  - El resto (páginas, `runner.py`, `mini-coi.js`): `no-cache`, el navegador revalida (304) y los cambios se ven al momento.
- **Netlify / Cloudflare Pages:** las toma de [public/_headers](public/_headers).
- **Vercel:** las toma de [vercel.json](vercel.json).
- **GitHub Pages u otros sin control de cabeceras:** la página carga [mini-coi](https://github.com/WebReflection/mini-coi), un *service worker* que las añade (la primera visita se recarga sola una vez).

Las soluciones de los ejercicios van dentro de `<details><summary>Ver solución</summary> … </details>` (dejando líneas en blanco alrededor del bloque de código).

## Notas para el profesor

- **Primera carga de Python:** cada alumno descarga unos 15 MB la primera vez (después queda en la caché del navegador). Con toda la clase en la misma wifi, pide que abran la web al empezar la clase: la carga empieza sola.
- **Ritmo del día 1:** es el día más denso. Los minutos están ajustados a 60; en clase se hacen 2 + 1 ejercicios y el resto queda para casa.
- **Día 3: el servidor de IA.** El servidor y el modelo por defecto están en [src/data/ai.ts](src/data/ai.ts) (`https://ollama.ricardorobles.es/v1`, `granite4:350m`), que genera el bloque **Modelo de IA** que se muestra encima de cada tema del día 3 y se ejecuta solo al abrir el día. Es Pydantic AI tal cual: `os.environ["OLLAMA_BASE_URL"] = "..."` y `MODELO = "ollama:granite4:350m"`. En clase se cambia editando ese bloque y pulsando **Ejecutar**; cada navegador recuerda el cambio y **↺** vuelve a los valores del curso. Lo que necesita el servidor:
  - `OLLAMA_ORIGINS=*` (o el dominio de la web): sin él, Ollama rechaza con 403 las peticiones del navegador.
  - Un volumen en `/root/.ollama`, para no perder el modelo al redesplegar.
  - Capacidad para toda la clase: las peticiones se ponen en cola. Valora subir `OLLAMA_NUM_PARALLEL` si el servidor tiene núcleos y memoria de sobra.
- **La cabecera que se quita en el navegador:** el SDK de OpenAI (que Pydantic AI usa para Ollama) envía `x-stainless-read-timeout`, que no está en la lista de cabeceras que permite el CORS de Ollama, así que el navegador bloquearía todas las peticiones. [public/python/runner.py](public/python/runner.py) envuelve el `fetch` del worker para quitarla; por eso el código de los alumnos es Pydantic AI sin cambios (y funciona igual en Colab).
- **Si usas un modelo que "razona"** (como la familia Qwen 3.5), desactívalo o cada respuesta tardará minutos: `Agent(MODELO, model_settings={"extra_body": {"reasoning_effort": "none"}})`. El ajuste genérico `thinking=False` de pydantic-ai no llega a enviarse a Ollama, y para limitar la longitud hay que usar `max_tokens` dentro de `extra_body` (pydantic-ai envía `max_completion_tokens`, que Ollama 0.40.5 ignora).
- **Demostración con un Ollama local:** arranca Ollama en tu portátil con `OLLAMA_ORIGINS=*` (necesario si la web no se abre desde `localhost`), descarga el modelo (`ollama pull granite4:350m`) y cambia `OLLAMA_BASE_URL` a `"http://localhost:11434/v1"` en el bloque **Modelo de IA**. Si la web está publicada en HTTPS, Chrome puede pedir permiso para que una web acceda a la red local; si la abres con `npm run dev` en el mismo portátil no hace falta.
- **Calidad del modelo:** con 350 millones de parámetros contesta muy rápido (unos 50 tokens/s en el servidor) pero se equivoca a menudo y contesta en inglés si no se le pide en español. Los temas lo advierten y lo usan como ejercicio de espíritu crítico; con un servidor más potente, basta con poner otro modelo en el bloque.
- **Salidas estructuradas con `NativeOutput`:** con modelos de Ollama, el modo por defecto de Pydantic AI (llamada a herramienta) falla más y necesita reintentos. `NativeOutput` hace que Ollama restrinja la generación al esquema JSON.
- **`await` y no `run_sync`:** en el navegador (igual que en Colab) hay que usar `await agente.run(...)`. Si un alumno escribe `run_sync`, el editor lo detecta antes de ejecutar y le explica qué hacer, porque en el navegador se quedaría colgado.
- **Plan B:** si el servidor no responde, el tema 2 del día 3 explica cómo ejecutar Ollama en la GPU gratuita de Colab, y el último tema cómo usar Gemini (nivel gratuito con clave de [Google AI Studio](https://aistudio.google.com/apikey)).
