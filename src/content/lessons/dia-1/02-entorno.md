---
title: "Nuestro entorno: Python en el navegador"
day: 1
order: 2
minutes: 4
---

En este curso **no hace falta instalar nada**: Python se ejecuta dentro de tu navegador gracias a [PyScript](https://pyscript.net), que usa una versión de Python compilada para la web. Empieza a cargarse solo al abrir la página (son unos 15 MB la primera vez; después queda guardado en el navegador). En el panel de la izquierda verás cuándo está **Listo**.

## Cada bloque de código es un editor

Prueba a pulsar **▶ Ejecutar** (o `Ctrl + Enter`, `Cmd + Enter` en Mac):

```python
print("Mi primer programa en Python")
2 + 3
```

- Puedes **cambiar el código** libremente y volver a ejecutarlo. Tus cambios se guardan en el navegador.
- El botón **↺** (aparece cuando cambias algo) devuelve el código a su versión original.
- Si una línea es solo un valor, como `2 + 3`, el editor muestra su resultado con una flecha **→**. En un programa normal (un archivo `.py`) tendrías que usar `print`.
- Si un programa no termina nunca (por ejemplo, un bucle infinito), pulsa **■ Detener**.
- Cuando el programa usa `input()`, aparece una caja de texto en la salida: escribe tu respuesta y pulsa `Enter`.

## Ayudas mientras escribes

| Ayuda | Cómo se usa |
|-------|-------------|
| **Autocompletado** | Aparece solo al escribir, o con `Ctrl + Espacio`. Acepta con `Enter` o `Tab`. |
| **Plantillas** | Escribe `for`, `if`, `while`, `def` o `class` y elige la plantilla de la lista. Salta entre los huecos con `Tab`. |
| **Documentación** | Pasa el ratón por encima de una función para ver qué hace, en español. |
| **Parámetros** | Al abrir un paréntesis, `round(`, verás qué datos espera la función. |
| **Errores** | Los errores de escritura se subrayan en rojo mientras escribes. Al ejecutar, los errores se explican en español. |

Pruébalo: coloca el cursor al final de la segunda línea, escribe un punto y espera (o pulsa `Ctrl + Espacio`) para ver todo lo que se puede hacer con un texto:

```python
nombre = "Universidad de León"
nombre
```

> **💡 Truco:** la tecla `Tab` sirve para sangrar el código. Si quieres salir del editor con el teclado, pulsa `Esc` y después `Tab`.

## Los bloques comparten variables

Todos los editores de un día funcionan como **un único programa**: una variable creada en un bloque existe en los demás, **siempre que hayas ejecutado antes ese bloque**. Ejecuta primero este:

```python
asignatura = "Programación"
```

Y después este:

```python
print(f"Estoy aprendiendo {asignatura}")
```

Si ejecutas un bloque que usa una variable que todavía no existe, verás un `NameError` y un botón para ejecutar los bloques anteriores del tema. Con **Borrar variables** (en el panel de la izquierda) empiezas de cero.

## ¿Y fuera del navegador?

- El **día 3** usaremos [Google Colab](https://colab.research.google.com), porque necesitaremos una GPU para ejecutar un modelo de inteligencia artificial.
- Para tus propios proyectos, instala Python desde [python.org](https://www.python.org/downloads/) y usa un editor como [VS Code](https://code.visualstudio.com/) con la extensión de Python.
