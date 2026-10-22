import { AI_DEFAULTS } from './ai';

export interface Example {
	id: string;
	label: string;
	code: string;
}

/** Packages the playground loads in the background, and modules it imports. */
export const PRELOAD = {
	packages: ['pydantic', 'pydantic-ai-slim'],
	modules: ['pydantic', 'pydantic_ai'],
};

/** Standard library modules worth pointing out to students. */
export const STDLIB = ['math', 'random', 'statistics', 'datetime', 'json', 're', 'collections', 'itertools', 'string', 'time'];

export const STARTER = `# Playground: escribe cualquier código Python y pulsa Ejecutar (Ctrl+Enter).
# Tus cambios se guardan en el navegador. Prueba también los ejemplos de arriba.

nombre = "ULE"
print(f"¡Hola, {nombre}!")
`;

export const EXAMPLES: Example[] = [
	{
		id: 'hola',
		label: 'Hola, input()',
		code: `nombre = input("¿Cómo te llamas? ")
edad = int(input("¿Cuántos años tienes? "))

print(f"Hola, {nombre}. Dentro de 10 años tendrás {edad + 10}.")
`,
	},
	{
		id: 'juego',
		label: 'Adivina el número',
		code: `import random

secreto = random.randint(1, 100)
intentos = 0

while True:
    intento = int(input("Di un número del 1 al 100: "))
    intentos += 1
    if intento < secreto:
        print("Es mayor ⬆️")
    elif intento > secreto:
        print("Es menor ⬇️")
    else:
        print(f"¡Correcto! En {intentos} intentos")
        break
`,
	},
	{
		id: 'clases',
		label: 'Clases',
		code: `class Animal:
    def __init__(self, nombre):
        self.nombre = nombre

    def hablar(self):
        return "..."


class Perro(Animal):
    def hablar(self):
        return "¡Guau!"


class Gato(Animal):
    def hablar(self):
        return "¡Miau!"


for animal in [Perro("Toby"), Gato("Misi")]:
    print(f"{animal.nombre} dice {animal.hablar()}")
`,
	},
	{
		id: 'pydantic',
		label: 'Pydantic',
		code: `from pydantic import BaseModel, Field, ValidationError


class Alumno(BaseModel):
    nombre: str
    edad: int = Field(ge=16)
    notas: list[float] = []


ana = Alumno(nombre="Ana", edad=19, notas=[7.5, 8])
print(ana)
print(ana.model_dump_json())

try:
    Alumno(nombre="Hugo", edad="quince")
except ValidationError as error:
    print(error)
`,
	},
	{
		id: 'agente',
		label: 'Agente de IA',
		code: `import os
from pydantic_ai import Agent

os.environ["OLLAMA_BASE_URL"] = "${AI_DEFAULTS.server}"
MODELO = "ollama:${AI_DEFAULTS.model}"

agente = Agent(MODELO, instructions="Responde en español, en una o dos frases.")
resultado = await agente.run("Cuéntame un dato curioso sobre Python.")
print(resultado.output)
`,
	},
	{
		id: 'estructurada',
		label: 'IA con datos estructurados',
		code: `import os
from pydantic import BaseModel, Field
from pydantic_ai import Agent, NativeOutput

os.environ["OLLAMA_BASE_URL"] = "${AI_DEFAULTS.server}"
MODELO = "ollama:${AI_DEFAULTS.model}"


class Evento(BaseModel):
    titulo: str
    fecha: str = Field(description="Fecha del evento")
    es_examen: bool


extractor = Agent(MODELO, output_type=NativeOutput(Evento), instructions="Extrae el evento del texto.")
resultado = await extractor.run("El examen final de Cálculo es el 15 de enero")
print(resultado.output)
`,
	},
];
