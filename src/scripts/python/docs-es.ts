/**
 * Spanish documentation for the parts of Python used in the course.
 * Used by autocompletion, hover tooltips and signature hints.
 */

export interface Doc {
	/** Parameters, in order, as shown in the signature hint. */
	params?: string[];
	/** Short explanation in Spanish. */
	doc: string;
	/** A one-line example. */
	example?: string;
	/** What the function returns. */
	returns?: string;
}

export const BUILTINS: Record<string, Doc> = {
	print: {
		params: ['*valores', 'sep=" "', 'end="\\n"'],
		doc: 'Muestra los valores por pantalla, separados por `sep` y terminando con `end`.',
		example: 'print("Hola", nombre, sep=", ")',
	},
	input: {
		params: ['mensaje=""'],
		doc: 'Muestra el mensaje y espera a que el usuario escriba algo. **Siempre devuelve un texto (`str`)**: conviértelo con `int()` o `float()` si necesitas un número.',
		example: 'edad = int(input("¿Edad? "))',
		returns: 'str',
	},
	len: {
		params: ['coleccion'],
		doc: 'Devuelve el número de elementos de una lista, tupla, diccionario o cadena.',
		example: 'len([4, 8, 15])  # 3',
		returns: 'int',
	},
	type: {
		params: ['valor'],
		doc: 'Devuelve el tipo (la clase) de un valor.',
		example: 'type(3.5)  # <class \'float\'>',
	},
	sum: {
		params: ['numeros', 'inicio=0'],
		doc: 'Suma todos los elementos de una colección de números.',
		example: 'sum([4, 8, 15])  # 27',
	},
	min: {
		params: ['coleccion', 'key=None'],
		doc: 'Devuelve el elemento más pequeño. También admite varios valores: `min(3, 7, 1)`.',
		example: 'min([4, 8, 15])  # 4',
	},
	max: {
		params: ['coleccion', 'key=None'],
		doc: 'Devuelve el elemento más grande. Con `key` puedes indicar qué comparar.',
		example: 'max(formas, key=lambda f: f.area())',
	},
	round: {
		params: ['numero', 'decimales=None'],
		doc: 'Redondea un número. Sin `decimales` devuelve un entero.',
		example: 'round(3.14159, 2)  # 3.14',
	},
	abs: {
		params: ['numero'],
		doc: 'Devuelve el valor absoluto (el número sin signo).',
		example: 'abs(-5)  # 5',
	},
	range: {
		params: ['inicio', 'fin', 'paso=1'],
		doc: 'Genera números desde `inicio` hasta `fin` **sin incluirlo**. Con un solo argumento empieza en 0: `range(5)` → 0, 1, 2, 3, 4.',
		example: 'for i in range(1, 11):',
	},
	enumerate: {
		params: ['coleccion', 'start=0'],
		doc: 'Recorre una colección devolviendo pares (posición, elemento).',
		example: 'for i, nombre in enumerate(nombres, start=1):',
	},
	zip: {
		params: ['*colecciones'],
		doc: 'Recorre varias colecciones a la vez, emparejando sus elementos.',
		example: 'for letra, opcion in zip("ABCD", opciones):',
	},
	sorted: {
		params: ['coleccion', 'key=None', 'reverse=False'],
		doc: 'Devuelve una **lista nueva** ordenada, sin modificar la original.',
		example: 'sorted([3, 1, 2])  # [1, 2, 3]',
		returns: 'list',
	},
	reversed: {
		params: ['secuencia'],
		doc: 'Recorre una secuencia al revés.',
		example: 'for x in reversed(lista):',
	},
	int: {
		params: ['valor'],
		doc: 'Convierte un valor en número entero. Con decimales los corta (no redondea).',
		example: 'int("42")  # 42',
		returns: 'int',
	},
	float: {
		params: ['valor'],
		doc: 'Convierte un valor en número decimal.',
		example: 'float("3.5")  # 3.5',
		returns: 'float',
	},
	str: {
		params: ['valor'],
		doc: 'Convierte un valor en texto.',
		example: 'str(10)  # "10"',
		returns: 'str',
	},
	bool: {
		params: ['valor'],
		doc: 'Convierte un valor en `True` o `False`. Son falsos `0`, `""`, `[]`, `{}` y `None`.',
		returns: 'bool',
	},
	list: {
		params: ['coleccion=()'],
		doc: 'Crea una lista (vacía o a partir de otra colección).',
		example: 'list("abc")  # ["a", "b", "c"]',
		returns: 'list',
	},
	tuple: {
		params: ['coleccion=()'],
		doc: 'Crea una tupla: como una lista, pero no se puede modificar.',
		returns: 'tuple',
	},
	dict: {
		params: ['**pares'],
		doc: 'Crea un diccionario de pares clave → valor.',
		example: 'dict(nombre="Ana", edad=19)',
		returns: 'dict',
	},
	set: {
		params: ['coleccion=()'],
		doc: 'Crea un conjunto: una colección sin elementos repetidos ni orden.',
		returns: 'set',
	},
	isinstance: {
		params: ['objeto', 'clase'],
		doc: 'Devuelve `True` si el objeto es de esa clase **o de una clase hija**. La clase puede ser una tupla de clases.',
		example: 'isinstance(toby, Animal)',
		returns: 'bool',
	},
	issubclass: {
		params: ['clase', 'clase_padre'],
		doc: 'Devuelve `True` si una clase hereda de otra.',
		example: 'issubclass(Perro, Animal)',
		returns: 'bool',
	},
	super: {
		params: [],
		doc: 'Da acceso a los métodos de la clase padre. Se usa sobre todo en `__init__`.',
		example: 'super().__init__(nombre, edad)',
	},
	help: {
		params: ['objeto'],
		doc: 'Muestra la documentación de una función, clase o módulo.',
		example: 'help(round)',
	},
	dir: {
		params: ['objeto'],
		doc: 'Lista los atributos y métodos de un objeto.',
		example: 'dir("hola")',
	},
	open: {
		params: ['ruta', 'modo="r"', 'encoding=None'],
		doc: 'Abre un archivo. En el navegador solo hay un sistema de archivos temporal.',
	},
	any: {
		params: ['coleccion'],
		doc: 'Devuelve `True` si **algún** elemento es verdadero.',
		returns: 'bool',
	},
	all: {
		params: ['coleccion'],
		doc: 'Devuelve `True` si **todos** los elementos son verdaderos.',
		returns: 'bool',
	},
	chr: { params: ['codigo'], doc: 'Devuelve el carácter correspondiente a un código Unicode.', example: 'chr(65)  # "A"' },
	ord: { params: ['caracter'], doc: 'Devuelve el código Unicode de un carácter.', example: 'ord("A")  # 65' },
	pow: { params: ['base', 'exponente'], doc: 'Calcula una potencia, igual que `base ** exponente`.' },
	divmod: { params: ['a', 'b'], doc: 'Devuelve a la vez el cociente entero y el resto: `(a // b, a % b)`.' },
	map: { params: ['funcion', 'coleccion'], doc: 'Aplica una función a cada elemento.', example: 'list(map(int, ["1", "2"]))' },
	filter: { params: ['funcion', 'coleccion'], doc: 'Se queda con los elementos para los que la función devuelve `True`.' },
	id: { params: ['objeto'], doc: 'Devuelve un número que identifica al objeto en memoria.' },
	hasattr: { params: ['objeto', 'nombre'], doc: 'Indica si un objeto tiene un atributo con ese nombre.' },
	getattr: { params: ['objeto', 'nombre', 'por_defecto'], doc: 'Obtiene un atributo a partir de su nombre en texto.' },
	exit: { params: [], doc: 'Termina el programa.' },
};

const STR_METHODS: Record<string, Doc> = {
	upper: { params: [], doc: 'Devuelve el texto en MAYÚSCULAS.', example: '"hola".upper()  # "HOLA"', returns: 'str' },
	lower: { params: [], doc: 'Devuelve el texto en minúsculas.', example: '"HoLa".lower()  # "hola"', returns: 'str' },
	capitalize: { params: [], doc: 'Pone la primera letra en mayúscula y el resto en minúscula.', returns: 'str' },
	title: { params: [], doc: 'Pone En Mayúscula La Primera Letra De Cada Palabra.', returns: 'str' },
	strip: { params: ['caracteres=None'], doc: 'Quita los espacios (o los caracteres indicados) del principio y del final.', example: '"  hola  ".strip()  # "hola"', returns: 'str' },
	lstrip: { params: ['caracteres=None'], doc: 'Quita los espacios del principio.', returns: 'str' },
	rstrip: { params: ['caracteres=None'], doc: 'Quita los espacios del final.', returns: 'str' },
	replace: { params: ['viejo', 'nuevo', 'veces=-1'], doc: 'Devuelve un texto nuevo cambiando `viejo` por `nuevo`.', example: '"León".replace("ó", "o")', returns: 'str' },
	split: { params: ['separador=None', 'veces=-1'], doc: 'Corta el texto en trozos y devuelve una lista. Sin separador, corta por los espacios.', example: '"a b c".split()  # ["a", "b", "c"]', returns: 'list' },
	join: { params: ['coleccion'], doc: 'Une los textos de una colección usando este texto como separador.', example: '"-".join(["a", "b"])  # "a-b"', returns: 'str' },
	startswith: { params: ['prefijo'], doc: 'Indica si el texto empieza por `prefijo`.', returns: 'bool' },
	endswith: { params: ['sufijo'], doc: 'Indica si el texto termina en `sufijo`.', returns: 'bool' },
	find: { params: ['subtexto'], doc: 'Devuelve la posición donde aparece `subtexto`, o -1 si no está.', returns: 'int' },
	index: { params: ['subtexto'], doc: 'Como `find`, pero da error si no lo encuentra.', returns: 'int' },
	count: { params: ['subtexto'], doc: 'Cuenta cuántas veces aparece `subtexto`.', returns: 'int' },
	isdigit: { params: [], doc: 'Indica si el texto contiene solo cifras.', example: '"123".isdigit()  # True', returns: 'bool' },
	isalpha: { params: [], doc: 'Indica si el texto contiene solo letras.', returns: 'bool' },
	isupper: { params: [], doc: 'Indica si todas las letras están en mayúscula.', returns: 'bool' },
	islower: { params: [], doc: 'Indica si todas las letras están en minúscula.', returns: 'bool' },
	format: { params: ['*valores'], doc: 'Sustituye las `{}` del texto por los valores. Hoy en día es más cómodo usar f-strings.', returns: 'str' },
	center: { params: ['ancho', 'relleno=" "'], doc: 'Centra el texto en un ancho dado.', returns: 'str' },
	zfill: { params: ['ancho'], doc: 'Rellena con ceros a la izquierda.', example: '"7".zfill(3)  # "007"', returns: 'str' },
};

const LIST_METHODS: Record<string, Doc> = {
	append: { params: ['elemento'], doc: 'Añade un elemento **al final** de la lista.', example: 'notas.append(8.0)' },
	insert: { params: ['posicion', 'elemento'], doc: 'Inserta un elemento en la posición indicada.', example: 'notas.insert(0, 5.5)' },
	extend: { params: ['coleccion'], doc: 'Añade al final todos los elementos de otra colección.' },
	remove: { params: ['elemento'], doc: 'Borra la **primera** aparición del elemento. Da error si no está.' },
	pop: { params: ['posicion=-1'], doc: 'Quita y **devuelve** el elemento de esa posición (por defecto, el último).' },
	sort: { params: ['key=None', 'reverse=False'], doc: 'Ordena la lista **en el sitio** (la modifica y devuelve `None`).', example: 'notas.sort(reverse=True)' },
	reverse: { params: [], doc: 'Da la vuelta a la lista en el sitio.' },
	index: { params: ['elemento'], doc: 'Devuelve la posición del elemento. Da error si no está.', returns: 'int' },
	count: { params: ['elemento'], doc: 'Cuenta cuántas veces aparece el elemento.', returns: 'int' },
	clear: { params: [], doc: 'Vacía la lista.' },
	copy: { params: [], doc: 'Devuelve una copia de la lista.', returns: 'list' },
};

const DICT_METHODS: Record<string, Doc> = {
	keys: { params: [], doc: 'Devuelve las claves del diccionario.' },
	values: { params: [], doc: 'Devuelve los valores del diccionario.' },
	items: { params: [], doc: 'Devuelve los pares (clave, valor). Ideal para recorrerlo con `for clave, valor in d.items():`.' },
	get: { params: ['clave', 'por_defecto=None'], doc: 'Devuelve el valor de la clave, o `por_defecto` si no existe (sin dar error).', example: 'alumno.get("email", "sin email")' },
	pop: { params: ['clave', 'por_defecto'], doc: 'Quita la clave y devuelve su valor.' },
	update: { params: ['otro'], doc: 'Añade o actualiza claves a partir de otro diccionario.' },
	setdefault: { params: ['clave', 'por_defecto=None'], doc: 'Devuelve el valor de la clave; si no existe, la crea con `por_defecto`.' },
	clear: { params: [], doc: 'Vacía el diccionario.' },
	copy: { params: [], doc: 'Devuelve una copia del diccionario.', returns: 'dict' },
};

const TUPLE_METHODS: Record<string, Doc> = {
	index: { params: ['elemento'], doc: 'Devuelve la posición del elemento.', returns: 'int' },
	count: { params: ['elemento'], doc: 'Cuenta cuántas veces aparece el elemento.', returns: 'int' },
};

const MATH: Record<string, Doc> = {
	pi: { doc: 'El número π ≈ 3.14159.' },
	e: { doc: 'El número e ≈ 2.71828.' },
	sqrt: { params: ['x'], doc: 'Raíz cuadrada.', example: 'math.sqrt(16)  # 4.0' },
	pow: { params: ['base', 'exponente'], doc: 'Potencia (siempre devuelve `float`).' },
	floor: { params: ['x'], doc: 'Redondea hacia abajo.' },
	ceil: { params: ['x'], doc: 'Redondea hacia arriba.' },
	sin: { params: ['x'], doc: 'Seno (ángulo en radianes).' },
	cos: { params: ['x'], doc: 'Coseno (ángulo en radianes).' },
	radians: { params: ['grados'], doc: 'Convierte grados a radianes.' },
};

const RANDOM: Record<string, Doc> = {
	randint: { params: ['a', 'b'], doc: 'Número entero aleatorio entre `a` y `b`, **ambos incluidos**.', example: 'random.randint(1, 100)' },
	random: { params: [], doc: 'Número decimal aleatorio entre 0 y 1.' },
	choice: { params: ['secuencia'], doc: 'Elige un elemento al azar.', example: 'random.choice(["piedra", "papel", "tijera"])' },
	shuffle: { params: ['lista'], doc: 'Desordena la lista **en el sitio**.' },
	sample: { params: ['coleccion', 'k'], doc: 'Elige `k` elementos distintos al azar.' },
};

/** Methods grouped by the type (or module) they belong to. */
export const MEMBERS: Record<string, Record<string, Doc>> = {
	str: STR_METHODS,
	list: LIST_METHODS,
	dict: DICT_METHODS,
	tuple: TUPLE_METHODS,
	math: MATH,
	random: RANDOM,
};

export const KEYWORDS: Record<string, string> = {
	if: 'Ejecuta un bloque solo si se cumple la condición.',
	elif: '“Si no, si…”: otra condición que se comprueba si las anteriores fueron falsas.',
	else: 'Bloque que se ejecuta si no se ha cumplido ninguna condición anterior.',
	for: 'Recorre los elementos de una colección: `for elemento in coleccion:`.',
	while: 'Repite un bloque mientras la condición sea verdadera.',
	break: 'Sale inmediatamente del bucle.',
	continue: 'Salta a la siguiente vuelta del bucle.',
	in: 'Comprueba si un elemento está en una colección, o indica qué recorrer en un `for`.',
	not: 'Invierte una condición: `not True` es `False`.',
	and: 'Verdadero solo si las dos condiciones son verdaderas.',
	or: 'Verdadero si al menos una de las condiciones es verdadera.',
	is: 'Comprueba si dos nombres apuntan al mismo objeto. Se usa sobre todo con `None`: `x is None`.',
	def: 'Define una función: `def nombre(parametros):`.',
	return: 'Termina la función y devuelve un valor.',
	class: 'Define una clase: el molde para crear objetos.',
	pass: 'No hace nada. Sirve para dejar un bloque vacío.',
	import: 'Carga un módulo: `import math`.',
	from: 'Importa algo concreto de un módulo: `from math import pi`.',
	as: 'Da otro nombre a lo importado: `import random as rd`.',
	lambda: 'Crea una función pequeña sin nombre: `lambda x: x * 2`.',
	try: 'Intenta ejecutar un bloque que podría dar error.',
	except: 'Bloque que se ejecuta si se produce un error dentro del `try`.',
	finally: 'Bloque que se ejecuta siempre, haya error o no.',
	raise: 'Lanza un error a propósito: `raise ValueError("mensaje")`.',
	with: 'Usa un recurso y lo cierra automáticamente al terminar.',
	global: 'Indica que una variable se refiere a la variable global.',
	None: 'Representa “ningún valor”.',
	True: 'Valor booleano verdadero.',
	False: 'Valor booleano falso.',
	self: 'Dentro de una clase, representa al propio objeto.',
	async: 'Declara una función asíncrona (se usa con `await`).',
	await: 'Espera a que termine una operación asíncrona.',
	assert: 'Comprueba que algo es cierto y da error si no lo es.',
	del: 'Borra una variable, un elemento de una lista o una clave de un diccionario.',
	yield: 'Devuelve valores uno a uno desde una función generadora.',
};

/** Find documentation for a dotted name such as "str.upper" or "math.sqrt". */
export function lookup(name: string): Doc | null {
	const clean = name.replace(/^builtins\./, '');
	if (BUILTINS[clean]) return BUILTINS[clean];
	const [owner, member] = clean.split('.').slice(-2);
	if (member && MEMBERS[owner]?.[member]) return MEMBERS[owner][member];
	return null;
}

export function signatureText(name: string, doc: Doc) {
	return `${name}(${(doc.params ?? []).join(', ')})`;
}
