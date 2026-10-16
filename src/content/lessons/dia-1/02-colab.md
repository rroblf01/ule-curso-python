---
title: Nuestro entorno, Google Colab
day: 1
order: 2
minutes: 4
---

Para no perder tiempo instalando nada, vamos a programar en **Google Colab**: un cuaderno (*notebook*) de Python que se ejecuta en los servidores de Google. Solo necesitas un navegador y una cuenta de Google.

## Crear tu primer cuaderno

1. Entra en [colab.new](https://colab.new) (o en [colab.research.google.com](https://colab.research.google.com) → *Nuevo cuaderno*).
2. Inicia sesión con tu cuenta de Google.
3. Cambia el nombre del cuaderno arriba a la izquierda, por ejemplo `curso-python-dia-1.ipynb`.

Los cuadernos se guardan automáticamente en tu Google Drive, en la carpeta **Colab Notebooks**.

## Celdas

Un cuaderno está formado por **celdas**:

- **Celdas de código:** escribes Python y lo ejecutas.
- **Celdas de texto:** escribes notas o explicaciones (en formato Markdown).

Escribe esto en una celda de código y ejecútala con el botón ▶ o con **Mayús + Enter**:

```python
print("Mi primer programa en Colab")
2 + 3
```

> **💡 Truco:** en un cuaderno, si la **última línea** de una celda es un valor, Colab lo muestra automáticamente aunque no uses `print`. En un programa normal (`.py`) tendrías que usar `print`.

## Atajos útiles

| Atajo | Acción |
|-------|--------|
| `Mayús + Enter` | Ejecutar la celda y pasar a la siguiente |
| `Ctrl + Enter` | Ejecutar la celda y quedarse en ella |
| `Ctrl + M` y luego `B` | Nueva celda de código debajo |
| `Ctrl + M` y luego `D` | Borrar la celda |
| `Ctrl + /` | Comentar o descomentar líneas |

## Importante: el orden importa

Las variables que creas en una celda **siguen existiendo** en las demás, pero solo si has ejecutado esa celda antes. Si algo falla de forma extraña, usa **Entorno de ejecución → Reiniciar y ejecutar todo**.

> **¿Prefieres instalarlo en tu ordenador?** Descarga Python desde [python.org](https://www.python.org/downloads/) y usa un editor como [VS Code](https://code.visualstudio.com/) con la extensión de Python. Para este curso no es necesario.
