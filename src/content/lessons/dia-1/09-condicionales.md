---
title: Condicionales (if, elif, else)
day: 1
order: 9
minutes: 5
---

Un condicional permite que el programa **tome decisiones**: ejecuta un bloque de código solo si se cumple una condición.

> **Nota:** a veces se les llama "bucles if", pero **no son bucles**: un `if` se ejecuta como mucho una vez. Los bucles (`for` y `while`) repiten código.

```python
nota = 7.5

if nota >= 5:
    print("Aprobado 🎉")
else:
    print("Suspenso")
```

## La indentación es obligatoria

En Python los bloques se marcan con **sangría** (4 espacios) después de los dos puntos `:`. No hay llaves `{}` como en otros lenguajes.

```python
if nota >= 5:
print("Aprobado")   # ❌ IndentationError
```

## Varias opciones con `elif`

```python
nota = 8.2

if nota < 5:
    calificacion = "Suspenso"
elif nota < 7:
    calificacion = "Aprobado"
elif nota < 9:
    calificacion = "Notable"
else:
    calificacion = "Sobresaliente"

print(calificacion)   # Notable
```

Python evalúa las condiciones **de arriba abajo** y ejecuta **solo el primer bloque** que se cumpla.

## Condiciones combinadas

```python
edad = 19
tiene_carnet = True

if edad >= 18 and tiene_carnet:
    print("Puedes conducir")
elif edad >= 18:
    print("Primero saca el carnet")
else:
    print("Aún no puedes conducir")
```

## Valores "verdaderos" y "falsos"

Cualquier valor se puede usar como condición. Son **falsos**: `0`, `0.0`, `""` (texto vacío), `[]`, `{}` y `None`. Todo lo demás es verdadero.

```python
apuntes = []

if apuntes:
    print("Tienes apuntes")
else:
    print("La lista está vacía")
```
