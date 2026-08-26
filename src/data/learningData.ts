export interface VowelItem {
  letter: string;
  name: string;
  word: string;
  icon: string;
  color: string;
  sentence: string;
}

export interface VowelExercise {
  id: string;
  displayWord: string; // e.g. "_ B E J A"
  missingLetter: string; // "A"
  fullWord: string; // "ABEJA"
  icon: string;
  options: string[]; // ["A", "E", "O"]
}

export interface AlphabetItem {
  letter: string;
  name: string;
  word: string;
  icon: string;
  color: string;
}

export interface NumberItem {
  number: number;
  word: string;
  emoji: string;
  color: string;
}

export interface ColorItem {
  name: string;
  hex: string;
  textColor: string;
  example: string;
  icon: string;
  description: string;
}

export interface ColorMixRule {
  color1: string;
  color2: string;
  result: string;
  resultHex: string;
  icon: string;
}

export interface ShapeItem {
  name: string;
  icon: string;
  sides: number;
  color: string;
  realWorldExample: string;
  description: string;
}

export interface AnimalItem {
  name: string;
  emoji: string;
  sound: string;
  soundText: string;
  habitat: string;
  funFact: string;
  bgColor: string;
}

export const VOCALES_DATA: VowelItem[] = [
  {
    letter: 'A',
    name: 'Vocal A',
    word: 'Abeja',
    icon: '🐝',
    color: '#ff70a6',
    sentence: 'A de Abeja y Árbol',
  },
  {
    letter: 'E',
    name: 'Vocal E',
    word: 'Elefante',
    icon: '🐘',
    color: '#4fc3f7',
    sentence: 'E de Elefante y Estrella',
  },
  {
    letter: 'I',
    name: 'Vocal I',
    word: 'Isla',
    icon: '🏝️',
    color: '#a855f7',
    sentence: 'I de Isla e Iguana',
  },
  {
    letter: 'O',
    name: 'Vocal O',
    word: 'Oso',
    icon: '🐻',
    color: '#f59e0b',
    sentence: 'O de Oso y Ojo',
  },
  {
    letter: 'U',
    name: 'Vocal U',
    word: 'Uva',
    icon: '🍇',
    color: '#10b981',
    sentence: 'U de Uva y Unicornio',
  },
];

export const VOCAL_EXERCISES: VowelExercise[] = [
  // Vocal A (6 palabras)
  {
    id: 'a1',
    displayWord: '_ B E J A',
    missingLetter: 'A',
    fullWord: 'ABEJA',
    icon: '🐝',
    options: ['A', 'E', 'O'],
  },
  {
    id: 'a2',
    displayWord: '_ V I Ó N',
    missingLetter: 'A',
    fullWord: 'AVIÓN',
    icon: '✈️',
    options: ['A', 'I', 'U'],
  },
  {
    id: 'a3',
    displayWord: '_ R B O L',
    missingLetter: 'A',
    fullWord: 'ÁRBOL',
    icon: '🌳',
    options: ['A', 'O', 'E'],
  },
  {
    id: 'a4',
    displayWord: '_ G U A',
    missingLetter: 'A',
    fullWord: 'AGUA',
    icon: '💧',
    options: ['A', 'U', 'I'],
  },
  {
    id: 'a5',
    displayWord: '_ Z U L',
    missingLetter: 'A',
    fullWord: 'AZUL',
    icon: '💙',
    options: ['A', 'E', 'O'],
  },
  {
    id: 'a6',
    displayWord: '_ N I L L O',
    missingLetter: 'A',
    fullWord: 'ANILLO',
    icon: '💍',
    options: ['A', 'I', 'E'],
  },

  // Vocal E (6 palabras)
  {
    id: 'e1',
    displayWord: '_ L E F A N T E',
    missingLetter: 'E',
    fullWord: 'ELEFANTE',
    icon: '🐘',
    options: ['E', 'A', 'I'],
  },
  {
    id: 'e2',
    displayWord: '_ S T R E L L A',
    missingLetter: 'E',
    fullWord: 'ESTRELLA',
    icon: '⭐',
    options: ['E', 'O', 'U'],
  },
  {
    id: 'e3',
    displayWord: '_ R I Z O',
    missingLetter: 'E',
    fullWord: 'ERIZO',
    icon: '🦔',
    options: ['E', 'I', 'A'],
  },
  {
    id: 'e4',
    displayWord: '_ S C U E L A',
    missingLetter: 'E',
    fullWord: 'ESCUELA',
    icon: '🏫',
    options: ['E', 'U', 'O'],
  },
  {
    id: 'e5',
    displayWord: '_ S P E J O',
    missingLetter: 'E',
    fullWord: 'ESPEJO',
    icon: '🪞',
    options: ['E', 'A', 'I'],
  },
  {
    id: 'e6',
    displayWord: '_ N A N O',
    missingLetter: 'E',
    fullWord: 'ENANO',
    icon: '🧙‍♂️',
    options: ['E', 'O', 'U'],
  },

  // Vocal I (6 palabras)
  {
    id: 'i1',
    displayWord: '_ S L A',
    missingLetter: 'I',
    fullWord: 'ISLA',
    icon: '🏝️',
    options: ['I', 'A', 'E'],
  },
  {
    id: 'i2',
    displayWord: '_ G L Ú',
    missingLetter: 'I',
    fullWord: 'IGLÚ',
    icon: '❄️',
    options: ['I', 'U', 'O'],
  },
  {
    id: 'i3',
    displayWord: '_ M Á N',
    missingLetter: 'I',
    fullWord: 'IMÁN',
    icon: '🧲',
    options: ['I', 'E', 'A'],
  },
  {
    id: 'i4',
    displayWord: '_ N D I O',
    missingLetter: 'I',
    fullWord: 'INDIO',
    icon: '🏹',
    options: ['I', 'O', 'U'],
  },
  {
    id: 'i5',
    displayWord: '_ G U A N A',
    missingLetter: 'I',
    fullWord: 'IGUANA',
    icon: '🦎',
    options: ['I', 'A', 'E'],
  },
  {
    id: 'i6',
    displayWord: '_ N S E C T O',
    missingLetter: 'I',
    fullWord: 'INSECTO',
    icon: '🐞',
    options: ['I', 'E', 'O'],
  },

  // Vocal O (6 palabras)
  {
    id: 'o1',
    displayWord: '_ S O',
    missingLetter: 'O',
    fullWord: 'OSO',
    icon: '🐻',
    options: ['O', 'U', 'A'],
  },
  {
    id: 'o2',
    displayWord: '_ J O',
    missingLetter: 'O',
    fullWord: 'OJO',
    icon: '👁️',
    options: ['O', 'E', 'I'],
  },
  {
    id: 'o3',
    displayWord: '_ R E J A',
    missingLetter: 'O',
    fullWord: 'OREJA',
    icon: '👂',
    options: ['O', 'A', 'U'],
  },
  {
    id: 'o4',
    displayWord: '_ V E J A',
    missingLetter: 'O',
    fullWord: 'OVEJA',
    icon: '🐑',
    options: ['O', 'E', 'I'],
  },
  {
    id: 'o5',
    displayWord: '_ L A',
    missingLetter: 'O',
    fullWord: 'OLA',
    icon: '🌊',
    options: ['O', 'A', 'U'],
  },
  {
    id: 'o6',
    displayWord: '_ L L A',
    missingLetter: 'O',
    fullWord: 'OLLA',
    icon: '🍲',
    options: ['O', 'U', 'E'],
  },

  // Vocal U (6 palabras)
  {
    id: 'u1',
    displayWord: '_ V A S',
    missingLetter: 'U',
    fullWord: 'UVAS',
    icon: '🍇',
    options: ['U', 'A', 'O'],
  },
  {
    id: 'u2',
    displayWord: '_ N I C O R N I O',
    missingLetter: 'U',
    fullWord: 'UNICORNIO',
    icon: '🦄',
    options: ['U', 'I', 'E'],
  },
  {
    id: 'u3',
    displayWord: '_ N O',
    missingLetter: 'U',
    fullWord: 'UNO',
    icon: '1️⃣',
    options: ['U', 'O', 'A'],
  },
  {
    id: 'u4',
    displayWord: '_ Ñ A',
    missingLetter: 'U',
    fullWord: 'UÑA',
    icon: '💅',
    options: ['U', 'A', 'E'],
  },
  {
    id: 'u5',
    displayWord: '_ N I V E R S O',
    missingLetter: 'U',
    fullWord: 'UNIVERSO',
    icon: '🌌',
    options: ['U', 'O', 'I'],
  },
  {
    id: 'u6',
    displayWord: '_ N I F O R M E',
    missingLetter: 'U',
    fullWord: 'UNIFORME',
    icon: '🥋',
    options: ['U', 'E', 'O'],
  },
];

export const ABECEDARIO_DATA: AlphabetItem[] = [
  { letter: 'A', name: 'A', word: 'Árbol', icon: '🌳', color: '#ff70a6' },
  { letter: 'B', name: 'Be', word: 'Barco', icon: '⛵', color: '#4fc3f7' },
  { letter: 'C', name: 'Ce', word: 'Casa', icon: '🏠', color: '#34d399' },
  { letter: 'D', name: 'De', word: 'Delfín', icon: '🐬', color: '#fbbf24' },
  { letter: 'E', name: 'E', word: 'Estrella', icon: '⭐', color: '#a78bfa' },
  { letter: 'F', name: 'Efe', word: 'Flor', icon: '🌸', color: '#f472b6' },
  { letter: 'G', name: 'Ge', word: 'Gato', icon: '🐱', color: '#38bdf8' },
  { letter: 'H', name: 'Hache', word: 'Helado', icon: '🍦', color: '#fb923c' },
  { letter: 'I', name: 'I', word: 'Iglú', icon: '❄️', color: '#818cf8' },
  { letter: 'J', name: 'Jota', word: 'Jirafa', icon: '🦒', color: '#facc15' },
  { letter: 'K', name: 'Ka', word: 'Koala', icon: '🐨', color: '#a3e635' },
  { letter: 'L', name: 'Ele', word: 'León', icon: '🦁', color: '#f97316' },
  { letter: 'M', name: 'Eme', word: 'Manzana', icon: '🍎', color: '#ef4444' },
  { letter: 'N', name: 'Ene', word: 'Nube', icon: '☁️', color: '#60a5fa' },
  { letter: 'Ñ', name: 'Eñe', word: 'Ñandú', icon: '🦤', color: '#c084fc' },
  { letter: 'O', name: 'O', word: 'Oveja', icon: '🐑', color: '#4ade80' },
  { letter: 'P', name: 'Pe', word: 'Pelota', icon: '⚽', color: '#f43f5e' },
  { letter: 'Q', name: 'Cu', word: 'Queso', icon: '🧀', color: '#fde047' },
  { letter: 'R', name: 'Erre', word: 'Rana', icon: '🐸', color: '#22c55e' },
  { letter: 'S', name: 'Ese', word: 'Sol', icon: '☀️', color: '#eab308' },
  { letter: 'T', name: 'Te', word: 'Tortuga', icon: '🐢', color: '#14b8a6' },
  { letter: 'U', name: 'U', word: 'Unicornio', icon: '🦄', color: '#d946ef' },
  { letter: 'V', name: 'Uve', word: 'Vaca', icon: '🐮', color: '#64748b' },
  { letter: 'W', name: 'Doble uve', word: 'Waffle', icon: '🧇', color: '#d97706' },
  { letter: 'X', name: 'Equis', word: 'Xilófono', icon: '🎵', color: '#06b6d4' },
  { letter: 'Y', name: 'I griega', word: 'Yoyó', icon: '🪀', color: '#8b5cf6' },
  { letter: 'Z', name: 'Zeta', word: 'Zanahoria', icon: '🥕', color: '#ea580c' },
];

export const NUMEROS_DATA: NumberItem[] = [
  { number: 1, word: 'Uno', emoji: '🌞', color: '#ff70a6' },
  { number: 2, word: 'Dos', emoji: '🍎', color: '#4fc3f7' },
  { number: 3, word: 'Tres', emoji: '🚗', color: '#34d399' },
  { number: 4, word: 'Cuatro', emoji: '🎈', color: '#fbbf24' },
  { number: 5, word: 'Cinco', emoji: '⭐', color: '#a78bfa' },
  { number: 6, word: 'Seis', emoji: '🧁', color: '#f472b6' },
  { number: 7, word: 'Siete', emoji: '🦋', color: '#38bdf8' },
  { number: 8, word: 'Ocho', emoji: '🐙', color: '#fb923c' },
  { number: 9, word: 'Nueve', emoji: '⚽', color: '#818cf8' },
  { number: 10, word: 'Diez', emoji: '🍭', color: '#facc15' },
  { number: 11, word: 'Once', emoji: '🐸', color: '#a3e635' },
  { number: 12, word: 'Doce', emoji: '🎨', color: '#f97316' },
  { number: 13, word: 'Trece', emoji: '🚀', color: '#ef4444' },
  { number: 14, word: 'Catorce', emoji: '🍓', color: '#60a5fa' },
  { number: 15, word: 'Quince', emoji: '🌻', color: '#c084fc' },
  { number: 16, word: 'Dieciséis', emoji: '💎', color: '#4ade80' },
  { number: 17, word: 'Diecisiete', emoji: '🐱', color: '#f43f5e' },
  { number: 18, word: 'Dieciocho', emoji: '🍩', color: '#fde047' },
  { number: 19, word: 'Diecinueve', emoji: '🎁', color: '#22c55e' },
  { number: 20, word: 'Veinte', emoji: '🏆', color: '#eab308' },
];

export const COLORES_DATA: ColorItem[] = [
  { name: 'Rojo', hex: '#ef4444', textColor: '#ffffff', example: 'Manzana', icon: '🍎', description: 'Como una fresa y un corazón' },
  { name: 'Azul', hex: '#3b82f6', textColor: '#ffffff', example: 'Cielo', icon: '🌊', description: 'Como el mar y el cielo' },
  { name: 'Amarillo', hex: '#eab308', textColor: '#344054', example: 'Sol', icon: '☀️', description: 'Brillante como el sol y un plátano' },
  { name: 'Verde', hex: '#22c55e', textColor: '#ffffff', example: 'Hoja', icon: '🍃', description: 'Como los árboles y las ranitas' },
  { name: 'Naranja', hex: '#f97316', textColor: '#ffffff', example: 'Zanahoria', icon: '🥕', description: 'Dulce como una naranja y el fuego' },
  { name: 'Morado', hex: '#8b5cf6', textColor: '#ffffff', example: 'Uva', icon: '🍇', description: 'Mágico como las uvas y las flores' },
  { name: 'Rosa', hex: '#ec4899', textColor: '#ffffff', example: 'Flamenco', icon: '🦩', description: 'Tierno como el algodón de azúcar' },
  { name: 'Celeste', hex: '#38bdf8', textColor: '#ffffff', example: 'Nube clara', icon: '💎', description: 'Claro y fresco como el agua' },
  { name: 'Café', hex: '#854d0e', textColor: '#ffffff', example: 'Chocolate', icon: '🍫', description: 'Cálido como los osos y la madera' },
  { name: 'Blanco', hex: '#f8fafc', textColor: '#344054', example: 'Nieve', icon: '⛄', description: 'Puro como las nubes y la nieve' },
  { name: 'Negro', hex: '#1e293b', textColor: '#ffffff', example: 'Noche', icon: '🌙', description: 'Misterioso como el cielo nocturno' },
];

export const COLOR_MIX_RULES: ColorMixRule[] = [
  { color1: 'Rojo', color2: 'Amarillo', result: 'Naranja', resultHex: '#f97316', icon: '🍊' },
  { color1: 'Azul', color2: 'Amarillo', result: 'Verde', resultHex: '#22c55e', icon: '🌲' },
  { color1: 'Rojo', color2: 'Azul', result: 'Morado', resultHex: '#8b5cf6', icon: '🔮' },
  { color1: 'Rojo', color2: 'Blanco', result: 'Rosa', resultHex: '#ec4899', icon: '🌸' },
  { color1: 'Azul', color2: 'Blanco', result: 'Celeste', resultHex: '#38bdf8', icon: '💧' },
];

export const FIGURAS_DATA: ShapeItem[] = [
  { name: 'Círculo', icon: '⭕', sides: 0, color: '#ef4444', realWorldExample: 'Una pelota o una moneda', description: 'Es completamente redondo sin esquinas.' },
  { name: 'Cuadrado', icon: '🟧', sides: 4, color: '#3b82f6', realWorldExample: 'Una ventana o un dado', description: 'Tiene 4 lados exactamente iguales.' },
  { name: 'Triángulo', icon: '🔺', sides: 3, color: '#eab308', realWorldExample: 'Un trozo de pizza o una montaña', description: 'Tiene 3 lados y 3 puntitas.' },
  { name: 'Rectángulo', icon: '🔲', sides: 4, color: '#22c55e', realWorldExample: 'Una puerta o un libro', description: 'Tiene 2 lados largos y 2 cortos.' },
  { name: 'Estrella', icon: '⭐', sides: 10, color: '#f59e0b', realWorldExample: 'Las estrellas de la noche', description: 'Brilla con 5 puntas mágicas.' },
  { name: 'Rombo', icon: '🔷', sides: 4, color: '#8b5cf6', realWorldExample: 'Un cometa volador', description: 'Como un cuadrado inclinado que vuela.' },
  { name: 'Óvalo', icon: '🥚', sides: 0, color: '#ec4899', realWorldExample: 'Un huevo o un espejo', description: 'Un círculo alargado muy suave.' },
  { name: 'Corazón', icon: '💖', sides: 0, color: '#f43f5e', realWorldExample: 'El amor y el cariño', description: 'El símbolo del amor y los abrazos.' },
];

export const ANIMALES_DATA: AnimalItem[] = [
  { name: 'Perro', emoji: '🐶', sound: 'Guau guau', soundText: '¡Guau guau!', habitat: 'En casa', funFact: 'Es el mejor amigo de los niños y mueve la colita cuando está feliz.', bgColor: '#ffe5ec' },
  { name: 'Gato', emoji: '🐱', sound: 'Miau miau', soundText: '¡Miau miau!', habitat: 'En casa', funFact: 'Le encanta dormir al sol y ronronea cuando le haces caricias.', bgColor: '#e3f8ff' },
  { name: 'León', emoji: '🦁', sound: 'Roaaar', soundText: '¡Rrrroooaaarr!', habitat: 'En la sabana', funFact: 'Tiene una gran melena y es conocido como el rey de la selva.', bgColor: '#fff7cc' },
  { name: 'Elefante', emoji: '🐘', sound: 'Barrito', soundText: '¡Fffffrrr!', habitat: 'En la selva', funFact: 'Es el animal terrestre más grande y usa su trompa para beber agua.', bgColor: '#f0e5ff' },
  { name: 'Vaca', emoji: '🐮', sound: 'Muuu', soundText: '¡Muuuuuu!', habitat: 'En la granja', funFact: 'Nos da leche fresca y deliciosa para crecer fuertes y sanos.', bgColor: '#e8f8e8' },
  { name: 'Mono', emoji: '🐵', sound: 'Uu aa', soundText: '¡Uu uu aa aa!', habitat: 'En los árboles', funFact: 'Salta de rama en rama y le encanta comer plátanos.', bgColor: '#fff0df' },
  { name: 'Pato', emoji: '🦆', sound: 'Cuac cuac', soundText: '¡Cuac cuac cuac!', habitat: 'En la laguna', funFact: 'Nada en el agua y tiene patitas con membranas para remar.', bgColor: '#e3f8ff' },
  { name: 'Rana', emoji: '🐸', sound: 'Croac croac', soundText: '¡Croac croac!', habitat: 'En el estanque', funFact: 'Da saltos muy altos y puede respirar dentro y fuera del agua.', bgColor: '#e8f8e8' },
  { name: 'Oso', emoji: '🐻', sound: 'Gruñido', soundText: '¡Grrrr!', habitat: 'En el bosque', funFact: 'Le gusta comer miel dulce y duerme todo el invierno calentito.', bgColor: '#fff0df' },
  { name: 'Tigre', emoji: '🐯', sound: 'Rugido', soundText: '¡Grrr-rugido!', habitat: 'En la selva', funFact: 'Tiene hermosas rayas y es un excelente nadador.', bgColor: '#fff7cc' },
  { name: 'Caballo', emoji: '🐴', sound: 'Relincho', soundText: '¡Hiiii-jiii!', habitat: 'En el campo', funFact: 'Corre muy veloz y puede dormir de pie.', bgColor: '#ffe5ec' },
  { name: 'Oveja', emoji: '🐑', sound: 'Beeee', soundText: '¡Beee beee!', habitat: 'En la granja', funFact: 'Tiene una lana esponjosa y suave como el algodón.', bgColor: '#f0e5ff' },
];
