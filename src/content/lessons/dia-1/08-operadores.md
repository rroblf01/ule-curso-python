---
title: Operadores de comparación y lógicos
day: 1
order: 8
minutes: 3
---

## Operadores de comparación

Comparan dos valores y devuelven un booleano (`True` o `False`):

| Operador | Significado | Ejemplo | Resultado |
|----------|-------------|---------|-----------|
| `==` | Igual a | `5 == 5` | `True` |
| `!=` | Distinto de | `5 != 3` | `True` |
| `>` | Mayor que | `5 > 3` | `True` |
| `<` | Menor que | `5 < 3` | `False` |
| `>=` | Mayor o igual | `5 >= 5` | `True` |
| `<=` | Menor o igual | `4 <= 3` | `False` |

> **⚠️ Error muy común:** `=` **asigna** un valor y `==` **compara**. `nota = 5` guarda un 5; `nota == 5` pregunta si vale 5.

```python
"hola" == "Hola"    # False: distingue mayúsculas
0 < nota <= 10      # Python permite encadenar comparaciones
```

## Operadores lógicos

Combinan varias condiciones:

| Operador | Devuelve `True` si… | Ejemplo |
|----------|----------------------|---------|
| `and` | **las dos** condiciones son ciertas | `nota >= 5 and asistencia >= 80` |
| `or` | **al menos una** es cierta | `es_festivo or es_fin_de_semana` |
| `not` | la condición es **falsa** (la invierte) | `not llueve` |

```python
nota = 6
asistencia = 70

nota >= 5 and asistencia >= 80   # False (falla la asistencia)
nota >= 5 or asistencia >= 80    # True  (basta con la nota)
not nota >= 5                    # False
```

## Otros operadores útiles

```python
"a" in "casa"           # True: pertenencia
3 in [1, 2, 3]          # True
"z" not in "casa"       # True
```
