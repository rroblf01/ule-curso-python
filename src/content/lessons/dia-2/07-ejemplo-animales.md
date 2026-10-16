---
title: "Ejemplo práctico: Animal, Perro y Gato"
day: 2
order: 7
minutes: 8
---

Vamos a juntar todo lo visto: una clase base `Animal` y dos clases hijas, `Perro` y `Gato`.

## Paso 1: la clase base

Todo animal tiene nombre y edad, puede presentarse y hace algún sonido. Como "un animal genérico" no tiene un sonido concreto, dejamos que cada hija lo defina:

```python
class Animal:
    def __init__(self, nombre, edad):
        self.nombre = nombre
        self.edad = edad

    def hablar(self):
        return "..."

    def presentarse(self):
        return f"Soy {self.nombre}, tengo {self.edad} años y digo {self.hablar()}"

    def __str__(self):
        return f"{type(self).__name__} llamado {self.nombre}"
```

## Paso 2: las clases hijas

```python
class Perro(Animal):
    def __init__(self, nombre, edad, raza):
        super().__init__(nombre, edad)
        self.raza = raza

    def hablar(self):
        return "¡Guau!"

    def traer_pelota(self):
        return f"{self.nombre} te trae la pelota 🎾"


class Gato(Animal):
    def __init__(self, nombre, edad, es_casero=True):
        super().__init__(nombre, edad)
        self.es_casero = es_casero

    def hablar(self):
        return "¡Miau!"

    def ronronear(self):
        return f"{self.nombre} ronronea: purrr 😺"
```

## Paso 3: probarlo

```python
toby = Perro("Toby", 3, "Beagle")
misi = Gato("Misi", 5)

print(toby)                  # Perro llamado Toby
print(toby.presentarse())    # Soy Toby, tengo 3 años y digo ¡Guau!
print(misi.presentarse())    # Soy Misi, tengo 5 años y digo ¡Miau!
print(toby.traer_pelota())
print(misi.ronronear())
```

Fíjate: `presentarse()` está escrito **una sola vez** en `Animal`, pero llama a `self.hablar()`, que es distinto en cada hija. Eso es **polimorfismo**.

## Paso 4: tratarlos a todos por igual

```python
animales = [toby, misi, Perro("Rex", 7, "Pastor alemán"), Gato("Nube", 1, False)]

for animal in animales:
    print(animal.presentarse())

    # Algo específico según el tipo
    if isinstance(animal, Perro):
        print("  →", animal.traer_pelota())
    elif isinstance(animal, Gato):
        print("  →", animal.ronronear())
```

## Para ampliar (en casa)

1. Añade una clase `Pajaro` que sepa `volar()`.
2. Crea una clase `Refugio` que guarde una lista de animales y tenga los métodos `acoger(animal)`, `adoptar(nombre)` y `contar_por_tipo()` (cuántos perros, gatos…).

```python
class Pajaro(Animal):
    # Escribe aquí tu solución
    pass
```
