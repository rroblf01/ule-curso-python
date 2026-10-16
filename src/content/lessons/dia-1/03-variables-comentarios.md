---
title: Variables y comentarios
day: 1
order: 3
minutes: 3
---

## Variables

Una **variable** es un nombre que apunta a un valor guardado en memoria. Se crea con el signo `=` (asignación):

```python
nombre = "Lucía"
edad = 19
altura = 1.68

print(nombre, "tiene", edad, "años")
```

En Python **no hace falta declarar el tipo**: lo deduce del valor. Además, una variable puede cambiar de valor (y de tipo):

```python
edad = 19
edad = edad + 1   # ahora vale 20
edad += 1         # forma abreviada: ahora vale 21
```

### Reglas para los nombres

- Pueden tener letras, números y `_`, pero **no pueden empezar por un número**.
- Distinguen mayúsculas y minúsculas: `nota` y `Nota` son variables distintas.
- No pueden ser palabras reservadas (`if`, `for`, `class`, `def`…).
- Por convenio se usa `snake_case`: `nota_final`, `numero_de_alumnos`.

```python
nota_final = 8.5     # ✅ correcto
2nota = 7            # ❌ error: empieza por número
```

Ejecútalo para ver cómo se explica el error, y después corrígelo cambiando el nombre de la variable.

## Comentarios

Los comentarios son texto que Python **ignora**. Sirven para explicar el *porqué* del código a otras personas (o a ti dentro de un mes).

```python
# Esto es un comentario de una línea

precio = 20
iva = precio * 0.21  # también puede ir al final de una línea

"""
Las comillas triples crean un texto de varias líneas.
Se usa sobre todo para documentar funciones (docstrings),
lo veremos más adelante.
"""
```

> **💡 Buena práctica:** comenta lo que no es evidente. `x = x + 1  # suma 1 a x` no aporta nada.
