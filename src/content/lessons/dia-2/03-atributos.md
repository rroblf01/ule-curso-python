---
title: Atributos
day: 2
order: 3
minutes: 6
---

Los **atributos** son las variables que pertenecen a un objeto o a una clase.

## Atributos de instancia

Se crean con `self.` (normalmente en `__init__`) y **cada objeto tiene los suyos**:

```python
class Alumno:
    def __init__(self, nombre, grado, curso=1):
        self.nombre = nombre
        self.grado = grado
        self.curso = curso          # valor por defecto
        self.notas = []             # empieza vacío

ana = Alumno("Ana", "Matemáticas")
ana.notas.append(9.5)

print(ana.curso)   # 1
print(ana.notas)   # [9.5]
```

## Atributos de clase

Se definen **directamente dentro de la clase** (fuera de cualquier método) y son **compartidos** por todos los objetos:

```python
class Alumno:
    universidad = "Universidad de León"   # atributo de clase

    def __init__(self, nombre, grado):
        self.nombre = nombre               # atributos de instancia
        self.grado = grado

ana = Alumno("Ana", "Matemáticas")
hugo = Alumno("Hugo", "Veterinaria")

print(ana.universidad)      # Universidad de León
print(hugo.universidad)     # Universidad de León
print(Alumno.universidad)   # también desde la clase
```

| | Atributo de instancia | Atributo de clase |
|---|---|---|
| Dónde se define | `self.x = …` dentro de un método | Dentro de la clase, fuera de los métodos |
| ¿De quién es? | De cada objeto | Compartido por todos |
| Ejemplo | `nombre`, `notas` | `universidad`, contador de alumnos |

## Ejemplo: contar cuántos objetos se han creado

```python
class Alumno:
    total = 0

    def __init__(self, nombre):
        self.nombre = nombre
        Alumno.total += 1

ana = Alumno("Ana")
hugo = Alumno("Hugo")
print(Alumno.total)   # 2
```

> **💡 Convenio:** un atributo que empieza por guion bajo, como `self._saldo`, indica "esto es interno, no lo toques desde fuera". Python no lo impide, pero es un aviso para otros programadores.
