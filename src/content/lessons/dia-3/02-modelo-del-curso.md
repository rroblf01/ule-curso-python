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

# MODELO es el texto "proveedor:modelo", aquí "ollama:granite4:350m".
# Ollama está pensado para ejecutarse en tu propio ordenador y el nuestro está en un
# servidor (un VPS), por eso arriba le decimos dónde está con OLLAMA_BASE_URL.
#
# Con los proveedores oficiales no hace falta: Pydantic AI ya sabe a qué servidor
# llamar (solo necesita tu clave de API). Por ejemplo:
#     agente = Agent("openai:gpt-5.1-mini")
#     agente = Agent("google:gemini-2.5-flash")
agente = Agent(MODELO, instructions="Responde en español, en una frase.")
resultado = await agente.run("¿Qué es una lista en Python?")
print(resultado.output)
print("Ha respondido:", resultado.response.model_name)
```

La primera vez tarda unos segundos más, porque el navegador carga **Pydantic AI** y los 25 paquetes que necesita.

## Las dos líneas del bloque Modelo de IA

```python static
os.environ["OLLAMA_BASE_URL"] = "https://ollama.ricardorobles.es/v1"
MODELO = "ollama:granite4:350m"
```

- **`OLLAMA_BASE_URL`**: *dónde* está el servidor Ollama. El `/v1` final indica que usamos su API compatible con la de OpenAI.
- **`MODELO`**: *qué* modelo usar, con el formato `"proveedor:modelo"`. Pydantic AI lee el proveedor (`ollama`) y busca la dirección en `OLLAMA_BASE_URL`.

Este mismo código funciona igual en Google Colab o en tu ordenador (después de instalar la librería con `pip install "pydantic-ai-slim[openai]"`).

## Cambiar de modelo o de servidor

`MODELO` es una variable normal de Python. Para usar otro modelo u otro servidor:

1. Cambia el nombre del modelo o la dirección de `OLLAMA_BASE_URL` en el bloque **Modelo de IA** de arriba.
2. Pulsa **Ejecutar** en ese bloque.
3. **Vuelve a ejecutar los bloques que crean agentes** (`Agent(MODELO, ...)`): cada agente se queda con el modelo que tenía `MODELO` cuando se creó.

Tu cambio se guarda en el navegador; el botón **↺** del bloque vuelve a los valores del curso.

> **💡 Más rápido en tu ordenador:** instala [Ollama](https://ollama.com/download), descarga el modelo con `ollama pull granite4:350m` y pon `OLLAMA_BASE_URL` a `"http://localhost:11434/v1"`. Si la web no la abres desde tu propio ordenador (`localhost`), arranca Ollama con `OLLAMA_ORIGINS=*` para que el navegador pueda conectarse.

## Ten en cuenta

- **Es un modelo diminuto**: `granite4:350m` tiene 350 millones de parámetros; ChatGPT o Gemini tienen miles de veces más. Es rápido y gratuito, pero **se equivoca a menudo**. Desconfía de lo que diga y compruébalo.
- **Contesta en inglés si no se lo pides en español.** Por eso casi todos nuestros agentes llevan instrucciones.
- **El servidor es compartido**: si toda la clase pregunta a la vez, las respuestas se ponen en cola y tardan más. Si una petición se eterniza, pulsa **■ Detener**.

<details>
<summary>¿Y si quiero mi propio servidor en Colab?</summary>

Puedes ejecutar Ollama en la GPU gratuita de Google Colab (*Entorno de ejecución → Cambiar tipo de entorno → GPU T4*) y usarlo desde ese mismo cuaderno:

```python static
!apt-get -qq update > /dev/null && apt-get -qq install -y zstd > /dev/null
!curl -fsSL https://ollama.com/install.sh | sh

import subprocess, time
servidor = subprocess.Popen(["ollama", "serve"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(5)
!ollama pull granite4:350m
!pip install -q "pydantic-ai-slim[openai]"

import os

os.environ["OLLAMA_BASE_URL"] = "http://localhost:11434/v1"
MODELO = "ollama:granite4:350m"
```

Recuerda que en Colab, igual que aquí, se usa `await agente.run(...)`.

</details>
