---
title: Diccionarios
day: 1
order: 7
minutes: 4
---

Un **diccionario** (`dict`) guarda pares **clave → valor**. En lugar de acceder por posición, accedes por nombre:

```python
alumno = {
    "nombre": "Lucía",
    "edad": 19,
    "grado": "Ingeniería Informática",
    "notas": [7.5, 8.0, 6.25],
}

alumno["nombre"]      # "Lucía"
alumno["notas"][0]    # 7.5
```

## Añadir, cambiar y borrar

```python
alumno["edad"] = 20             # cambia un valor
alumno["email"] = "lu@unileon.es"  # añade una clave nueva
del alumno["grado"]             # borra una clave
```

## Consultar con seguridad

```python
alumno["telefono"]                      # ❌ KeyError: la clave no existe
alumno.get("telefono")                  # None (no da error)
alumno.get("telefono", "sin teléfono")  # valor por defecto
"email" in alumno                       # True
```

## Recorrer un diccionario

```python
alumno.keys()     # las claves
alumno.values()   # los valores
alumno.items()    # pares (clave, valor)

for clave, valor in alumno.items():
    print(f"{clave}: {valor}")
```

> **💡 Para el día 3:** los diccionarios se parecen mucho al formato **JSON**, que es como se comunican la mayoría de aplicaciones web y también los modelos de IA.
