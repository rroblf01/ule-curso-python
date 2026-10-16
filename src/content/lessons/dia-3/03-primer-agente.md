---
title: Tu primer agente
day: 3
order: 3
minutes: 7
---

En Pydantic AI, un **agente** (`Agent`) es un objeto que sabe hablar con un modelo de IA. Sí, **un objeto**: `Agent` es una clase, como las que creamos ayer.

## Hola, IA

```python
from pydantic_ai import Agent

agente = Agent(MODELO)

resultado = await agente.run("Explica qué es una variable en Python en una sola frase.")
print(resultado.output)
```

- `Agent(MODELO)` crea el agente (instanciamos la clase).
- `agente.run(...)` envía la pregunta al modelo (a través de Ollama).
- `resultado.output` contiene la respuesta.

### ¿Y ese `await`?

El modelo tarda unos segundos en generar la respuesta. `await` significa "**espera a que termine** esta operación". En Colab se puede usar directamente en las celdas.

> **💡 Fuera de Colab** (en un archivo `.py` normal) usarías la versión síncrona, sin `await`: `resultado = agente.run_sync("...")`. En Colab `run_sync` **no funciona**, así que usa siempre `await agente.run(...)`.

## Darle instrucciones

Las **instrucciones** (también llamadas *system prompt*) definen el papel y el estilo del agente para todas las preguntas:

```python
profesor = Agent(
    MODELO,
    instructions=(
        "Eres un profesor de Python para estudiantes de primer curso de universidad. "
        "Respondes en español, de forma breve y con un ejemplo de código cuando sea útil."
    ),
)

resultado = await profesor.run("¿Para qué sirve self en una clase?")
print(resultado.output)
```

Prueba a cambiar las instrucciones: *"Respondes como un pirata"*, *"Respondes solo con emojis"*… Verás cómo cambia la respuesta.

## Mantener una conversación

Cada llamada a `run` es **independiente**: el modelo no recuerda nada. Para continuar una conversación, le pasamos el historial de mensajes anteriores:

```python
r1 = await profesor.run("¿Qué es una lista?")
print(r1.output)

r2 = await profesor.run(
    "¿Y en qué se diferencia de una tupla?",
    message_history=r1.all_messages(),
)
print(r2.output)
```

Sin `message_history`, el modelo no sabría a qué se refiere "*se diferencia*".

## Mini reto

Crea un agente que actúe como **traductor de español a inglés** y que solo devuelva la traducción, sin explicaciones. Pruébalo con tres frases.

<details>
<summary>Ver solución</summary>

```python
traductor = Agent(
    MODELO,
    instructions="Traduce al inglés el texto del usuario. Devuelve solo la traducción, sin comentarios.",
)

for frase in ["Me encanta programar", "Mañana tengo examen de cálculo", "León está en España"]:
    resultado = await traductor.run(frase)
    print(resultado.output)
```

</details>
