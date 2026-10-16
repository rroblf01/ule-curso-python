---
title: El modelo del curso
day: 3
order: 2
minutes: 5
---

En esta web el modelo de IA **ya está configurado**: solo tienes que importarlo. Ejecuta este bloque:

```python
from curso import MODELO

MODELO.model_name
```

La primera vez tarda unos segundos, porque el navegador carga **Pydantic AI** y los 25 paquetes que necesita. Después ya queda cargado.

## Elegir el servidor y el modelo

En el panel **Modelo de IA** (a la izquierda, debajo de los temas) puedes cambiar:

- **Servidor Ollama**: la dirección del servidor. Por defecto, el del curso.
- **Modelo**: los que tenga instalados ese servidor. Por ejemplo, `granite4:350m` es **más pequeño y unas tres veces más rápido** que `qwen3.5:0.8b`, pero se equivoca todavía más (¡y a veces contesta en inglés si no se lo pides en español!).

El cambio se aplica **al momento**, incluso a los agentes que ya hayas creado. Compruébalo: ejecuta este bloque, cambia el modelo en el panel y vuelve a ejecutarlo.

```python
from pydantic_ai import Agent

agente = Agent(MODELO, instructions="Responde en español, en una frase.")
resultado = await agente.run("¿Qué es una lista en Python?")
print(resultado.output)
print("Ha respondido:", resultado.response.model_name)
```

También se puede cambiar desde el código:

```python
import curso

curso.configurar(modelo="granite4:350m")   # o servidor="http://localhost:11434"
MODELO
```

> **💡 Más rápido en tu ordenador:** si instalas [Ollama](https://ollama.com/download) en tu ordenador y descargas un modelo (`ollama pull granite4:350m`), pon `http://localhost:11434` como servidor. Si la web no la abres desde tu propio ordenador (`localhost`), arranca Ollama con `OLLAMA_ORIGINS=*` para que el navegador pueda conectarse.

## ¿Qué hay dentro de `curso`?

`curso` es un pequeño módulo de Python preparado para el curso. Puedes ver su código:

```python
import inspect
import curso

print(inspect.getsource(curso))
```

Fíjate en tres cosas:

1. **`SERVIDOR`** y **`NOMBRE_MODELO`**: los elige el panel. A la dirección se le añade `/v1`, que es la API de Ollama compatible con la de OpenAI.
2. **`reasoning_effort: none`**: Qwen 3.5 "razona" antes de contestar si no se le dice lo contrario. Con razonamiento, una frase tarda **más de un minuto**; sin él, **un par de segundos**. Y **`max_tokens`** limita lo largas que pueden ser las respuestas.
3. **La cabecera que se quita**: el navegador solo deja enviar a otro dominio las cabeceras que ese servidor acepta (*CORS*), y Ollama no acepta una que añade la librería de OpenAI.
4. **`ModeloDelCurso`**: envuelve al modelo real. Por eso `configurar()` puede cambiarlo sin que tengas que crear de nuevo tus agentes.

## Ten en cuenta

- **Son modelos muy pequeños** (`qwen3.5:0.8b` tiene 0,8 mil millones de parámetros; ChatGPT o Gemini tienen cientos de veces más). Son rápidos y gratuitos, pero **se equivocan a menudo**. Desconfía de lo que digan y compruébalo.
- **El servidor es compartido**: si toda la clase pregunta a la vez, las respuestas se ponen en cola y tardan más. Ten paciencia; si una petición se eterniza, pulsa **■ Detener**.

<details>
<summary>¿Y fuera de esta web? (Colab o tu ordenador)</summary>

En **cualquier Python** (Colab, tu ordenador…) puedes usar el mismo servidor sin el módulo `curso`:

```python static
# !pip install "pydantic-ai-slim[openai]"   ← en Colab, la primera vez
import os
from pydantic_ai import Agent

os.environ["OLLAMA_BASE_URL"] = "https://ollama.ricardorobles.es/v1"
MODELO = "ollama:qwen3.5:0.8b"

agente = Agent(MODELO, model_settings={"extra_body": {"reasoning_effort": "none"}})
```

Si quieres **tu propio servidor**, puedes ejecutar Ollama en la GPU gratuita de Google Colab (*Entorno de ejecución → Cambiar tipo de entorno → GPU T4*) con un modelo más grande:

```python static
!apt-get -qq update > /dev/null && apt-get -qq install -y zstd > /dev/null
!curl -fsSL https://ollama.com/install.sh | sh

import os, subprocess, time
servidor = subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(5)
!ollama pull qwen3:8b
!pip install -q "pydantic-ai-slim[openai]"

os.environ["OLLAMA_BASE_URL"] = "http://localhost:11434/v1"
MODELO = "ollama:qwen3:8b"
```

Recuerda que en Colab, igual que aquí, se usa `await agente.run(...)`.

</details>
