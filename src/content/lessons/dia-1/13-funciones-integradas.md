---
title: Funciones integradas
day: 1
order: 13
minutes: 4
---

Python trae de serie muchas **funciones integradas** (*built-in*) que puedes usar sin importar nada. Ya has visto varias:

| Función | Qué hace | Ejemplo | Resultado |
|---------|----------|---------|-----------|
| `print()` | Muestra valores por pantalla | `print("Hello world")` | `Hello world` |
| `len()` | Longitud de una secuencia | `len([4, 8, 15])` | `3` |
| `type()` | Tipo de un valor | `type(3.5)` | `<class 'float'>` |
| `input()` | Pide un texto al usuario | `input("¿Nombre? ")` | lo que escriba |
| `sum()` | Suma los elementos | `sum([4, 8, 15])` | `27` |
| `min()` | El menor | `min([4, 8, 15])` | `4` |
| `max()` | El mayor | `max([4, 8, 15])` | `15` |
| `round()` | Redondea | `round(3.14159, 2)` | `3.14` |

## `print()` en detalle

```python
print("Hello world")
print("Nota:", 7.5, "puntos")          # separa con espacios
print("a", "b", "c", sep="-")          # a-b-c
print("Sin salto", end=" ")            # no salta de línea al final
```

## `input()` siempre devuelve texto

```python
edad = input("¿Cuántos años tienes? ")
print(type(edad))           # <class 'str'>, ¡aunque escribas un número!

edad = int(input("¿Cuántos años tienes? "))   # conviértelo
print(f"El año que viene tendrás {edad + 1}")
```

## Combinándolas

```python
notas = [7.5, 4.0, 9.25, 6.0]

media = sum(notas) / len(notas)
print(f"Media: {round(media, 2)}")
print(f"Mejor nota: {max(notas)}, peor nota: {min(notas)}")
```

## Otras que te encontrarás

- `sorted(lista)`: devuelve una copia ordenada.
- `abs(-5)`: valor absoluto.
- `int()`, `float()`, `str()`, `list()`, `bool()`: conversiones de tipo.
- `range()` y `enumerate()`: los vimos con `for`.
- `help(funcion)`: muestra la documentación de cualquier función. ¡Pruébalo con `help(round)`!
