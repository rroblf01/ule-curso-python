---
title: ¿Qué es un LLM y cómo se usa desde Python?
day: 3
order: 1
minutes: 5
---

## Modelos de lenguaje (LLM)

Un **LLM** (*Large Language Model*, modelo de lenguaje grande) es un programa entrenado con enormes cantidades de texto para **predecir la siguiente palabra**. Haciendo eso muy bien, es capaz de resumir, traducir, explicar, programar o crear preguntas de examen. ChatGPT, Gemini o Claude son ejemplos.

Hasta ahora los has usado desde una web de chat. Hoy vas a usarlos **desde tus propios programas**.

## ¿Cómo habla Python con una IA?

El modelo no se ejecuta en tu ordenador (ni en Colab): está en los servidores de la empresa. Tu programa le envía una **petición** por Internet a través de una **API** y recibe la respuesta.

```text
Tu programa en Python  ──── petición (texto + instrucciones) ────▶  Servidor con el modelo
                       ◀─────────── respuesta (texto o datos) ────
```

Para usar la API necesitas una **clave de API** (*API key*): una contraseña que identifica tu cuenta.

## ¿Qué es Pydantic AI?

[Pydantic AI](https://pydantic.dev/docs/ai/overview/) es una librería de Python que facilita mucho trabajar con modelos de IA:

- **Funciona con muchos proveedores** (Google Gemini, OpenAI, Anthropic, Mistral…) cambiando una sola línea.
- Permite pedir respuestas **estructuradas**: en lugar de un texto libre, la IA te devuelve **objetos de Python** con los campos que tú definas. ¡Con clases, como las de ayer!
- Lo crea el mismo equipo que hizo **Pydantic**, la librería de validación de datos más usada de Python.

## El objetivo de hoy

Construir un **asistente de estudio** que, a partir del texto de tus apuntes:

1. 📝 Genere un **resumen** con las ideas clave.
2. ❓ Cree un **test de preguntas** con varias opciones.
3. 🎮 Te haga el test de forma interactiva y te diga tu nota.
