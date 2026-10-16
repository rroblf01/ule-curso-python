---
title: Listas y tuplas
day: 1
order: 6
minutes: 5
---

## Listas (`list`)

Una lista guarda **varios valores en orden**. Se escribe entre corchetes y **se puede modificar**:

```python
notas = [7.5, 4.0, 9.25, 6.0]
mezcla = ["texto", 3, True, 2.5]   # puede mezclar tipos

notas[0]      # 7.5  (los índices funcionan igual que en las cadenas)
notas[-1]     # 6.0
notas[1:3]    # [4.0, 9.25]
len(notas)    # 4
```

### Modificar una lista

```python
notas.append(8.0)      # añade al final        -> [7.5, 4.0, 9.25, 6.0, 8.0]
notas.insert(0, 5.5)   # inserta en posición 0 -> [5.5, 7.5, 4.0, 9.25, 6.0, 8.0]
notas[2] = 4.5         # cambia un elemento
notas.remove(6.0)      # borra el primer 6.0
ultima = notas.pop()   # quita y devuelve el último elemento
notas.sort()           # ordena de menor a mayor
```

```python
5.5 in notas    # ¿está en la lista? True / False
```

## Tuplas (`tuple`)

Una tupla es como una lista, pero **no se puede modificar** (es inmutable). Se escribe entre paréntesis:

```python
coordenadas_leon = (42.5987, -5.5671)
coordenadas_leon[0]       # 42.5987
coordenadas_leon[0] = 0   # ❌ TypeError: no se puede modificar
```

¿Para qué sirve algo que no se puede cambiar? Para datos que **van juntos y no deberían cambiar**: coordenadas, fechas, colores RGB… Además, protegen de modificaciones accidentales.

### Desempaquetado

```python
latitud, longitud = coordenadas_leon
print(latitud)   # 42.5987

# Truco clásico: intercambiar dos variables
a, b = 1, 2
a, b = b, a      # ahora a = 2 y b = 1
```

| | Lista | Tupla |
|---|---|---|
| Sintaxis | `[1, 2, 3]` | `(1, 2, 3)` |
| ¿Modificable? | Sí | No |
| Uso típico | Colecciones que cambian | Datos fijos que van juntos |
