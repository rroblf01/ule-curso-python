---
title: Herencia
day: 2
order: 5
minutes: 8
---

La **herencia** permite crear una clase nueva **a partir de otra existente**. La clase nueva (hija o subclase) **recibe todos los atributos y métodos** de la original (padre o superclase), y puede **añadir** o **modificar** lo que necesite.

Sirve para no repetir código y para expresar relaciones del tipo **"es un"**: un alumno *es una* persona, un profesor *es una* persona.

```python
class Persona:
    def __init__(self, nombre, edad):
        self.nombre = nombre
        self.edad = edad

    def presentarse(self):
        return f"Hola, soy {self.nombre} y tengo {self.edad} años"


class Alumno(Persona):             # Alumno hereda de Persona
    pass                           # de momento no añade nada


ana = Alumno("Ana", 19)
print(ana.presentarse())           # ¡funciona! lo ha heredado
```

## Añadir atributos con `super()`

Si la clase hija necesita su propio `__init__`, usa `super()` para llamar al de la clase padre y no repetir código:

```python
class Alumno(Persona):
    def __init__(self, nombre, edad, grado):
        super().__init__(nombre, edad)   # inicializa nombre y edad
        self.grado = grado               # y añade lo nuevo


class Profesor(Persona):
    def __init__(self, nombre, edad, departamento):
        super().__init__(nombre, edad)
        self.departamento = departamento
```

## Sobrescribir métodos

Una clase hija puede **redefinir** un método del padre para que se comporte de otra forma:

```python
class Profesor(Persona):
    def __init__(self, nombre, edad, departamento):
        super().__init__(nombre, edad)
        self.departamento = departamento

    def presentarse(self):
        saludo = super().presentarse()             # reutiliza el del padre
        return f"{saludo}. Doy clase en {self.departamento}"


profe = Profesor("Carmen", 45, "Matemáticas")
print(profe.presentarse())
# Hola, soy Carmen y tengo 45 años. Doy clase en Matemáticas
```

## Polimorfismo

Objetos de clases distintas pueden responder **al mismo método**, cada uno a su manera. Así puedes tratarlos a todos por igual:

```python
personas = [
    Alumno("Ana", 19, "Biología"),
    Profesor("Carmen", 45, "Matemáticas"),
]

for persona in personas:
    print(persona.presentarse())   # cada uno usa su versión
```

> **💡** Esta idea es la clave del ejemplo práctico y del proyecto de hoy.
