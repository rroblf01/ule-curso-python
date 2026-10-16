---
title: El modelo del curso
day: 3
order: 2
minutes: 5
---

Arriba del todo, en todos los temas de hoy, está el bloque **Modelo de IA**. Define la variable `MODELO` que usan todos los ejemplos y se ejecuta solo al abrir el día. Usamos **`granite4:350m`**, un modelo abierto de IBM, instalado en el servidor Ollama del curso.

## Probar el modelo

```python
from pydantic_ai import Agent

agente = Agent(MODELO, instructions="Responde en español, en una frase.")
resultado = await agente.run("¿Qué es una lista en Python?")
print(resultado.output)
print("Ha respondido:", resultado.response.model_name)
```

La primera vez tarda unos segundos más, porque el navegador carga **Pydantic AI** y los 25 paquetes que necesita.

## Cambiar de modelo o de servidor

`MODELO` es una variable normal de Python. Para usar otro modelo u otro servidor:

1. Cambia el nombre del modelo o la dirección de `SERVIDOR` en el bloque **Modelo de IA** de arriba.
2. Pulsa **Ejecutar** en ese bloque.
3. **Vuelve a ejecutar los bloques que crean agentes** (`Agent(MODELO, ...)`): cada agente se queda con el modelo que tenía `MODELO` cuando se creó.

Tu cambio se guarda en el navegador; el botón **↺** del bloque vuelve a los valores del curso.

> **💡 Más rápido en tu ordenador:** instala [Ollama](https://ollama.com/download), descarga el modelo con `ollama pull granite4:350m` y pon `SERVIDOR = "http://localhost:11434"`. Si la web no la abres desde tu propio ordenador (`localhost`), arranca Ollama con `OLLAMA_ORIGINS=*` para que el navegador pueda conectarse.

## ¿Qué hace `crear_modelo`?

`crear_modelo` viene del módulo `curso`, preparado para esta web. Puedes ver su código:

```python
import inspect
import curso

print(inspect.getsource(curso))
```

Fíjate en tres cosas:

1. **El servidor**: a la dirección se le añade `/v1`, que es la API de Ollama compatible con la de OpenAI.
2. **`extra_body`**: `reasoning_effort: none` evita que los modelos que saben "razonar" lo hagan (tardarían minutos), y `max_tokens` limita lo largas que pueden ser las respuestas.
3. **La cabecera que se quita**: el navegador solo deja enviar a otro dominio las cabeceras que ese servidor acepta (*CORS*), y Ollama no acepta una que añade la librería de OpenAI.

## Ten en cuenta

- **Es un modelo diminuto**: `granite4:350m` tiene 350 millones de parámetros; ChatGPT o Gemini tienen miles de veces más. Es rápido y gratuito, pero **se equivoca a menudo**. Desconfía de lo que diga y compruébalo.
- **Contesta en inglés si no se lo pides en español.** Por eso casi todos nuestros agentes llevan instrucciones.
- **El servidor es compartido**: si toda la clase pregunta a la vez, las respuestas se ponen en cola y tardan más. Si una petición se eterniza, pulsa **■ Detener**.

<details>
<summary>¿Y fuera de esta web? (Colab o tu ordenador)</summary>

En **cualquier Python** (Colab, tu ordenador…) puedes usar el mismo servidor sin el módulo `curso`:

```python static
# !pip install "pydantic-ai-slim[openai]"   ← en Colab, la primera vez
import os
from pydantic_ai import Agent

os.environ["OLLAMA_BASE_URL"] = "https://ollama.ricardorobles.es/v1"
MODELO = "ollama:granite4:350m"

agente = Agent(MODELO, model_settings={"extra_body": {"max_tokens": 700}})
```

Si quieres **tu propio servidor**, puedes ejecutar Ollama en la GPU gratuita de Google Colab (*Entorno de ejecución → Cambiar tipo de entorno → GPU T4*):

```python static
!apt-get -qq update > /dev/null && apt-get -qq install -y zstd > /dev/null
!curl -fsSL https://ollama.com/install.sh | sh

import os, subprocess, time
servidor = subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(5)
!ollama pull granite4:350m
!pip install -q "pydantic-ai-slim[openai]"

os.environ["OLLAMA_BASE_URL"] = "http://localhost:11434/v1"
MODELO = "ollama:granite4:350m"
```

Recuerda que en Colab, igual que aquí, se usa `await agente.run(...)`.

</details>
