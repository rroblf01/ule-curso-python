---
title: Métodos
day: 2
order: 4
minutes: 8
---

Los **métodos** son funciones definidas dentro de una clase. Describen lo que un objeto **puede hacer** y trabajan con sus atributos a través de `self`.

```python
class Alumno:
    def __init__(self, nombre):
        self.nombre = nombre
        self.notas = []

    def anadir_nota(self, nota):
        self.notas.append(nota)

    def media(self):
        if not self.notas:
            return 0
        return sum(self.notas) / len(self.notas)

    def esta_aprobado(self):
        return self.media() >= 5      # un método puede llamar a otro


lucia = Alumno("Lucía")
lucia.anadir_nota(7.5)
lucia.anadir_nota(4.0)
lucia.anadir_nota(9.0)

print(f"Media: {lucia.media():.2f}")       # Media: 6.83
print(lucia.esta_aprobado())               # True
```

Fíjate en que al **definir** el método escribimos `self`, pero al **llamarlo** no: `lucia.media()` equivale a `Alumno.media(lucia)`.

## Métodos especiales: `__str__`

Si haces `print(lucia)` verás algo poco útil como `<__main__.Alumno object at 0x7f...>`. El método especial `__str__` define cómo se muestra el objeto como texto:

```python
class Alumno:
    def __init__(self, nombre):
        self.nombre = nombre
        self.notas = []

    def media(self):
        return sum(self.notas) / len(self.notas) if self.notas else 0

    def __str__(self):
        return f"Alumno {self.nombre} (media {self.media():.2f})"


lucia = Alumno("Lucía")
lucia.notas = [8, 9]
print(lucia)   # Alumno Lucía (media 8.50)
```

Los métodos que empiezan y terminan con doble guion bajo (`__init__`, `__str__`, `__len__`, `__eq__`…) se llaman **métodos mágicos** o *dunder*: Python los llama automáticamente en ciertas situaciones.

## Mini reto (2 min)

Crea una clase `CuentaBancaria` con un `titular` y un `saldo` (que empiece en 0), y los métodos `ingresar(cantidad)` y `retirar(cantidad)`. Si no hay saldo suficiente, `retirar` debe mostrar un aviso.

```python
class CuentaBancaria:
    def __init__(self, titular, saldo=0):
        # Escribe aquí tu solución
        pass


cuenta = CuentaBancaria("Lucía")
```

<details>
<summary>Ver solución</summary>

```python
class CuentaBancaria:
    def __init__(self, titular, saldo=0):
        self.titular = titular
        self.saldo = saldo

    def ingresar(self, cantidad):
        self.saldo += cantidad

    def retirar(self, cantidad):
        if cantidad > self.saldo:
            print("Saldo insuficiente")
        else:
            self.saldo -= cantidad

    def __str__(self):
        return f"Cuenta de {self.titular}: {self.saldo:.2f} €"


cuenta = CuentaBancaria("Lucía")
cuenta.ingresar(100)
cuenta.retirar(30)
cuenta.retirar(500)   # Saldo insuficiente
print(cuenta)         # Cuenta de Lucía: 70.00 €
```

</details>
