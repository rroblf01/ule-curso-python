---
title: Bucles for
day: 1
order: 10
minutes: 5
---

Un bucle `for` **recorre** los elementos de una secuencia (lista, cadena, tupla, diccionario…) y ejecuta el bloque una vez por cada uno.

```python
asignaturas = ["Cálculo", "Física", "Programación"]

for asignatura in asignaturas:
    print(f"Hoy estudio {asignatura}")
```

```python
for letra in "ULE":
    print(letra)
```

## `range()`: repetir un número de veces

```python
for i in range(5):          # 0, 1, 2, 3, 4  (el 5 no se incluye)
    print(i)

for i in range(1, 11):      # del 1 al 10
    print(f"7 x {i} = {7 * i}")

for i in range(0, 20, 5):   # 0, 5, 10, 15  (de 5 en 5)
    print(i)
```

## Acumular resultados

Un patrón muy habitual: empezar con un valor vacío e ir añadiendo dentro del bucle.

```python
notas = [7.5, 4.0, 9.25, 6.0]

total = 0
for nota in notas:
    total += nota

print(f"Media: {total / len(notas)}")
```

```python
aprobadas = []
for nota in notas:
    if nota >= 5:
        aprobadas.append(nota)

print(aprobadas)   # [7.5, 9.25, 6.0]
```

## `enumerate()`: posición y valor a la vez

```python
for posicion, asignatura in enumerate(asignaturas, start=1):
    print(f"{posicion}. {asignatura}")
```

## `break` y `continue`

- `break` **sale** del bucle inmediatamente.
- `continue` **salta** a la siguiente vuelta.

```python
for nota in notas:
    if nota < 5:
        print("¡Hay un suspenso!")
        break
```

> **💡 Extra:** las *list comprehensions* permiten crear listas en una línea: `aprobadas = [n for n in notas if n >= 5]`. Útiles, pero no hace falta dominarlas hoy.
