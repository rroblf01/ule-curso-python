---
title: Cadenas de texto (str)
day: 1
order: 5
minutes: 5
---

Una **cadena** (*string*) es texto entre comillas simples o dobles:

```python
asignatura = "Programación"
ciudad = 'León'
```

## Operaciones básicas

```python
saludo = "Hola" + " " + "mundo"   # concatenar: "Hola mundo"
"ja" * 3                          # repetir: "jajaja"
len("León")                       # longitud: 4
"ón" in "León"                    # ¿contiene?: True
```

## f-strings: meter variables en un texto

Es la forma más cómoda de construir textos. Pon una `f` delante y las variables entre llaves:

```python
nombre = "Lucía"
nota = 8.456

print(f"{nombre} ha sacado un {nota}")
print(f"{nombre} ha sacado un {nota:.2f}")   # con 2 decimales: 8.46
```

## Índices y trozos (*slicing*)

Cada carácter tiene una posición. **Se empieza a contar en 0**, y los números negativos cuentan desde el final:

```python
palabra = "Python"
#          P  y  t  h  o  n
#          0  1  2  3  4  5
#         -6 -5 -4 -3 -2 -1

palabra[0]     # "P"
palabra[-1]    # "n"
palabra[0:3]   # "Pyt"  (desde 0 hasta 3, sin incluir el 3)
palabra[2:]    # "thon"
palabra[::-1]  # "nohtyP" (al revés)
```

## Métodos útiles

```python
texto = "  Universidad de León  "

texto.upper()              # "  UNIVERSIDAD DE LEÓN  "
texto.lower()              # "  universidad de león  "
texto.strip()              # "Universidad de León" (quita espacios de los lados)
texto.replace("León", "LE")
texto.strip().split(" ")   # ["Universidad", "de", "León"]
"-".join(["a", "b", "c"])  # "a-b-c"
```

> **💡 Importante:** las cadenas son **inmutables**. Los métodos no cambian el texto original, devuelven uno nuevo. Si quieres conservar el cambio: `texto = texto.upper()`.
