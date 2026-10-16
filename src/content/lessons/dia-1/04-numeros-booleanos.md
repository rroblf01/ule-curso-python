---
title: Números y booleanos
day: 1
order: 4
minutes: 4
---

## Enteros (`int`) y decimales (`float`)

```python
alumnos = 120        # int: número entero
nota_media = 6.75    # float: número con decimales (se usa el punto, no la coma)

type(alumnos)        # <class 'int'>
type(nota_media)     # <class 'float'>
```

### Operaciones aritméticas

| Operador | Significado | Ejemplo | Resultado |
|----------|-------------|---------|-----------|
| `+` | Suma | `7 + 2` | `9` |
| `-` | Resta | `7 - 2` | `5` |
| `*` | Multiplicación | `7 * 2` | `14` |
| `/` | División (siempre da `float`) | `7 / 2` | `3.5` |
| `//` | División entera | `7 // 2` | `3` |
| `%` | Resto (módulo) | `7 % 2` | `1` |
| `**` | Potencia | `7 ** 2` | `49` |

```python
# ¿Es par? Si el resto entre 2 es 0, sí
numero = 14
numero % 2   # 0
```

### Conversiones

```python
int("42")      # 42   (texto -> entero)
float("3.5")   # 3.5  (texto -> decimal)
int(3.99)      # 3    (corta los decimales, no redondea)
str(10)        # "10" (número -> texto)
```

> **⚠️ Ojo con los decimales:** `0.1 + 0.2` da `0.30000000000000004`. No es un fallo de Python: los ordenadores guardan los decimales en binario y algunos no se pueden representar exactamente. Para mostrarlos, usa `round()`.

## Booleanos (`bool`)

Solo tienen dos valores: `True` y `False` (con mayúscula). Son el resultado de cualquier pregunta de sí o no:

```python
aprobado = True
tiene_beca = False

nota = 7.5
nota >= 5      # True
nota == 10     # False
```

Los booleanos son la base de las decisiones (`if`) y de los bucles (`while`) que veremos enseguida.
