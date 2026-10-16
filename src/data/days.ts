export interface Day {
	number: number;
	title: string;
	subtitle: string;
	goal: string;
}

export const days: Day[] = [
	{
		number: 1,
		title: 'Fundamentos de Python',
		subtitle: 'Tipos de datos, control de flujo y funciones',
		goal: 'Escribir tus primeros programas: guardar datos, tomar decisiones, repetir tareas y crear funciones.',
	},
	{
		number: 2,
		title: 'Programación orientada a objetos',
		subtitle: 'Clases, atributos, métodos y herencia',
		goal: 'Modelar el mundo con clases y reutilizar código mediante la herencia.',
	},
	{
		number: 3,
		title: 'IA en tus programas con Pydantic AI',
		subtitle: 'Construye un asistente de estudio',
		goal: 'Usar un modelo de IA desde Python para resumir tus apuntes y generar tests de repaso.',
	},
];
