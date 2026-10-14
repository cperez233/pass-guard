/**
 * Analizador de robustez: entropía, clasificación, coste de fuerza bruta y
 * detección de patrones débiles.
 *
 * El análisis es puramente local — la contraseña nunca sale del navegador.
 */

import { messagesFor } from './i18n.js'
import { AMBIGUOUS } from './passwords.js'

/* ------------------------------------------------------------------ *
 * Composición y tamaño del alfabeto (R)
 * ------------------------------------------------------------------ */

const ASCII_SYMBOLS = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~ '

/** Tamaños de alfabeto asumidos por un atacante que conoce la composición. */
const POOL_WEIGHTS = {
  lowercase: 26,
  uppercase: 26,
  numbers: 10,
  symbols: ASCII_SYMBOLS.length, // 33 símbolos ASCII imprimibles + espacio
  extended: 100, // estimación conservadora para caracteres no ASCII
}

export function analyzeComposition(password) {
  const chars = [...password]
  return {
    lowercase: chars.some((c) => c >= 'a' && c <= 'z'),
    uppercase: chars.some((c) => c >= 'A' && c <= 'Z'),
    numbers: chars.some((c) => c >= '0' && c <= '9'),
    symbols: chars.some((c) => ASCII_SYMBOLS.includes(c)),
    extended: chars.some((c) => c.codePointAt(0) > 127),
  }
}

/** R = suma de los alfabetos detectados en la contraseña. */
export function estimatePoolSize(password) {
  const composition = analyzeComposition(password)
  return Object.entries(composition).reduce(
    (total, [key, present]) => (present ? total + POOL_WEIGHTS[key] : total),
    0,
  )
}

/** Entropía teórica de búsqueda exhaustiva: E = L · log2(R). */
export function calculateEntropy(length, pool) {
  if (length <= 0 || pool <= 1) return 0
  return length * Math.log2(pool)
}

/* ------------------------------------------------------------------ *
 * Clasificación por rangos de entropía
 * ------------------------------------------------------------------ */

export const STRENGTH_LEVELS = [
  {
    id: 'weak',
    label: 'Débil',
    max: 40,
    summary: 'Rompible en minutos u horas con hardware doméstico.',
    text: 'text-rose-400',
    ring: 'ring-rose-500/30',
    glow: 'shadow-rose-500/20',
    bar: 'from-rose-600 via-rose-500 to-rose-400',
    chip: 'bg-rose-500/10 text-rose-300 ring-rose-500/30',
  },
  {
    id: 'moderate',
    label: 'Moderada',
    max: 60,
    summary: 'Aceptable solo con límite de intentos; insuficiente offline.',
    text: 'text-amber-400',
    ring: 'ring-amber-500/30',
    glow: 'shadow-amber-500/20',
    bar: 'from-rose-500 via-orange-500 to-amber-400',
    chip: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
  },
  {
    id: 'strong',
    label: 'Fuerte',
    max: 80,
    summary: 'Resiste ataques offline con hardware convencional.',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    bar: 'from-amber-400 via-lime-400 to-emerald-400',
    chip: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  },
  {
    id: 'excellent',
    label: 'Excelente',
    max: Infinity,
    summary: 'Fuera del alcance de la fuerza bruta con la tecnología actual.',
    text: 'text-cyan-300',
    ring: 'ring-cyan-400/30',
    glow: 'shadow-cyan-400/20',
    bar: 'from-emerald-400 via-teal-400 to-cyan-300',
    chip: 'bg-cyan-500/10 text-cyan-200 ring-cyan-400/30',
  },
]

export function classifyEntropy(entropy) {
  return STRENGTH_LEVELS.find((level) => entropy < level.max) ?? STRENGTH_LEVELS.at(-1)
}

/** Posición 0-100 en la barra; 128 bits se toma como tope visual. */
export function entropyToPercent(entropy) {
  return Math.min(100, Math.round((entropy / 128) * 100))
}

/* ------------------------------------------------------------------ *
 * Coste de un ataque de fuerza bruta
 * ------------------------------------------------------------------ */

/**
 * Escenarios de referencia, en intentos por segundo. El escenario principal
 * (`cluster`) asume ~10^10 hashes/s: un clúster de GPUs atacando offline un
 * hash rápido y sin salt fuerte (MD5, SHA-1, NTLM).
 */
export const ATTACK_SCENARIOS = [
  {
    id: 'online',
    label: 'Ataque online con rate limiting',
    detail: '10³ intentos/s · formulario de login protegido',
    rate: 1e3,
  },
  {
    id: 'cluster',
    label: 'Clúster de GPUs offline',
    detail: '10¹⁰ hashes/s · hash rápido (MD5 / SHA-1 / NTLM)',
    rate: 1e10,
    primary: true,
  },
  {
    id: 'nationState',
    label: 'Adversario con recursos estatales',
    detail: '10¹⁴ hashes/s · granja dedicada de ASIC/GPU',
    rate: 1e14,
  },
]

/**
 * Segundos hasta encontrar la clave. Se usa el caso medio (la mitad del
 * espacio, 2^E / 2), que es la métrica honesta: el peor caso duplica la cifra.
 */
export function crackSeconds(entropy, guessesPerSecond) {
  const attempts = Math.pow(2, entropy) / 2
  return attempts / guessesPerSecond
}

const SUPERSCRIPT = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }

const toScientific = (value, yearsWord) => {
  const exponent = Math.floor(Math.log10(value))
  const mantissa = (value / Math.pow(10, exponent)).toFixed(1)
  const superscript = String(exponent)
    .split('')
    .map((d) => SUPERSCRIPT[d] ?? d)
    .join('')
  return `${mantissa} × 10${superscript} ${yearsWord}`
}

/** Notación compacta para recuentos enormes (2^E combinaciones). */
export function formatCount(value, lang = 'es') {
  if (!Number.isFinite(value)) return '∞'
  if (value < 1e6) return Math.round(value).toLocaleString(messagesFor(lang).locale)

  const exponent = Math.floor(Math.log10(value))
  const mantissa = (value / Math.pow(10, exponent)).toFixed(2)
  const superscript = String(exponent)
    .split('')
    .map((digit) => SUPERSCRIPT[digit] ?? digit)
    .join('')
  return `${mantissa} × 10${superscript}`
}

/** Límites de cada unidad; los nombres salen de `i18n.js` en el mismo orden. */
const TIME_UNITS = [
  { limit: 60, divisor: 1 },
  { limit: 3600, divisor: 60 },
  { limit: 86400, divisor: 3600 },
  { limit: 2629800, divisor: 86400 },
  { limit: 31557600, divisor: 2629800 },
]

const YEAR = 31557600

/** Convierte segundos en una etiqueta legible ("3 días", "1,2 × 10¹⁸ años"). */
export function formatDuration(seconds, lang = 'es') {
  const { time, locale } = messagesFor(lang)
  if (!Number.isFinite(seconds)) return time.forever
  if (seconds < 1) return time.instant

  for (const [index, unit] of TIME_UNITS.entries()) {
    if (seconds < unit.limit) {
      const value = Math.round(seconds / unit.divisor)
      const [singular, plural] = time.units[index]
      return `${value} ${value === 1 ? singular : plural}`
    }
  }

  const years = seconds / YEAR
  if (years >= 1e6) return toScientific(years, time.year[1])
  return `${Math.round(years).toLocaleString(locale)} ${Math.round(years) === 1 ? time.year[0] : time.year[1]}`
}

/* ------------------------------------------------------------------ *
 * Detección de patrones débiles
 * ------------------------------------------------------------------ */

const KEYBOARD_ROWS = [
  'qwertyuiop',
  'asdfghjkl',
  'zxcvbnm',
  '1234567890',
  'qwertzuiop',
  'azertyuiop',
]

const COMMON_WORDS = [
  'password', 'passwd', 'contrasena', 'contraseña', 'clave', 'secret', 'admin',
  'administrador', 'root', 'usuario', 'login', 'welcome', 'bienvenido', 'qwerty',
  'iloveyou', 'teamo', 'dragon', 'monkey', 'sunshine', 'princess', 'football',
  'futbol', 'master', 'shadow', 'superman', 'batman', 'hola', 'default', 'test',
  'demo', 'abc123', 'letmein', 'changeme', 'system', 'guest',
  // Contexto predecible: estaciones y meses son la base de las reglas de mutación
  // más rentables en hashcat (palabra + año + símbolo).
  'primavera', 'verano', 'otono', 'otoño', 'invierno',
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
  'septiembre', 'octubre', 'noviembre', 'diciembre',
  'spring', 'summer', 'autumn', 'winter',
  'january', 'february', 'march', 'april', 'june', 'july', 'august',
  'september', 'october', 'november', 'december',
]

/** Años reconocibles (1900-2099): sufijo clásico de las wordlists con reglas. */
const YEAR_PATTERN = /(?<!\d)(?:19|20)\d{2}(?!\d)/g

/** Secuencias ascendentes o descendentes de 4+ (abcd, 4321). */
function findSequential(password) {
  const lower = password.toLowerCase()
  const hits = []

  for (let start = 0; start < lower.length - 3; start += 1) {
    let direction = 0
    let end = start

    while (end + 1 < lower.length) {
      const delta = lower.codePointAt(end + 1) - lower.codePointAt(end)
      if (delta !== 1 && delta !== -1) break
      if (direction === 0) direction = delta
      else if (delta !== direction) break
      end += 1
    }

    if (end - start >= 3) {
      hits.push(lower.slice(start, end + 1))
      start = end - 1
    }
  }

  return hits
}

/** Tramos de teclado de 4+ caracteres (qwer, asdf), en ambos sentidos. */
function findKeyboardRuns(password) {
  const lower = password.toLowerCase()
  const hits = []

  for (const row of KEYBOARD_ROWS) {
    const reversed = [...row].reverse().join('')
    for (let size = Math.min(6, lower.length); size >= 4; size -= 1) {
      for (let i = 0; i + size <= lower.length; i += 1) {
        const chunk = lower.slice(i, i + size)
        if (row.includes(chunk) || reversed.includes(chunk)) hits.push(chunk)
      }
    }
  }

  return [...new Set(hits)]
}

/** Repeticiones (aaa) y bloques repetidos (abcabc). */
function findRepeats(password) {
  const hits = []
  const runs = password.match(/(.)\1{2,}/g)
  if (runs) hits.push(...runs)

  const blocks = password.toLowerCase().match(/(.{2,})\1+/g)
  if (blocks) hits.push(...blocks)

  return [...new Set(hits)]
}

/** Palabras de diccionario, tolerando leetspeak (P4ssw0rd → password). */
function findCommonWords(password) {
  const normalized = password
    .toLowerCase()
    .replace(/[4@]/g, 'a')
    .replace(/[3€]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/0/g, 'o')
    .replace(/[5$]/g, 's')
    .replace(/7/g, 't')

  return COMMON_WORDS.filter((word) => normalized.includes(word))
}

/** Descarta coincidencias contenidas en otra más larga (12345 dentro de 123456). */
function keepMaximal(hits) {
  const unique = [...new Set(hits)].sort((a, b) => b.length - a.length)
  return unique.filter(
    (hit, index) => !unique.slice(0, index).some((longer) => longer.includes(hit)),
  )
}

export function detectPatterns(password) {
  if (!password) {
    return { sequential: [], keyboard: [], repeats: [], words: [], dates: [], all: [] }
  }

  const sequential = keepMaximal(findSequential(password))
  const keyboard = keepMaximal(findKeyboardRuns(password))
  const repeats = keepMaximal(findRepeats(password))
  const words = keepMaximal(findCommonWords(password))
  const dates = keepMaximal(password.match(YEAR_PATTERN) ?? [])

  return {
    sequential,
    keyboard,
    repeats,
    words,
    dates,
    all: keepMaximal([...sequential, ...keyboard, ...repeats, ...words, ...dates]),
  }
}

/* ------------------------------------------------------------------ *
 * Checklist en vivo
 * ------------------------------------------------------------------ */

export function buildChecklist(password, { composition, patterns, length }, lang = 'es') {
  const text = messagesFor(lang).checklist
  const activeSets = ['lowercase', 'uppercase', 'numbers', 'symbols'].filter(
    (key) => composition[key],
  ).length
  const sequenceHits = [...patterns.sequential, ...patterns.keyboard]

  return [
    {
      id: 'length',
      label: text.length.label,
      hint: length >= 16 ? text.length.long : text.length.short,
      passed: length >= 12,
    },
    {
      id: 'mix',
      label: text.mix.label,
      hint: text.mix.hint(activeSets),
      passed: activeSets >= 3,
    },
    {
      id: 'symbols',
      label: text.symbols.label,
      hint: text.symbols.hint,
      passed: composition.symbols,
    },
    {
      id: 'sequential',
      label: text.sequential.label,
      hint: sequenceHits.length
        ? text.sequential.found(sequenceHits.slice(0, 3).join(', '))
        : text.sequential.clean,
      passed: sequenceHits.length === 0,
    },
    {
      id: 'repeats',
      label: text.repeats.label,
      hint: patterns.repeats.length
        ? text.repeats.found(patterns.repeats.slice(0, 3).join(', '))
        : text.repeats.clean,
      passed: patterns.repeats.length === 0,
    },
    {
      id: 'dictionary',
      label: text.dictionary.label,
      hint: patterns.words.length
        ? text.dictionary.found(patterns.words.slice(0, 3).join(', '))
        : text.dictionary.clean,
      passed: patterns.words.length === 0,
    },
    {
      id: 'dates',
      label: text.dates.label,
      hint: patterns.dates.length ? text.dates.found(patterns.dates.join(', ')) : text.dates.clean,
      passed: patterns.dates.length === 0,
    },
  ]
}

/* ------------------------------------------------------------------ *
 * Análisis completo
 * ------------------------------------------------------------------ */

/**
 * La entropía teórica supone una clave aleatoria. Si hay patrones, un atacante
 * usa reglas de diccionario en lugar de fuerza bruta pura, así que aplicamos
 * una penalización sobre la entropía efectiva mostrada.
 */
function patternPenalty(patterns, length) {
  if (length === 0) return 0
  const covered = patterns.all.reduce((total, hit) => total + hit.length, 0)
  const ratio = Math.min(1, covered / length)
  return ratio * 0.55 // hasta un 55 % de la entropía teórica
}

export function analyzePassword(password, lang = 'es') {
  const text = messagesFor(lang)
  const length = [...password].length
  const composition = analyzeComposition(password)
  const pool = estimatePoolSize(password)
  const rawEntropy = calculateEntropy(length, pool)
  const patterns = detectPatterns(password)
  const penalty = patternPenalty(patterns, length)
  const entropy = rawEntropy * (1 - penalty)
  const baseLevel = classifyEntropy(entropy)
  const level = { ...baseLevel, ...text.levels[baseLevel.id] }

  return {
    password,
    length,
    pool,
    composition,
    patterns,
    rawEntropy,
    entropy,
    penalty,
    level,
    percent: entropyToPercent(entropy),
    combinations: Math.pow(2, entropy),
    checklist: buildChecklist(password, { composition, patterns, length }, lang),
    scenarios: ATTACK_SCENARIOS.map((scenario) => ({
      ...scenario,
      ...text.scenarios[scenario.id],
      seconds: crackSeconds(entropy, scenario.rate),
      human: formatDuration(crackSeconds(entropy, scenario.rate), lang),
    })),
  }
}

export { AMBIGUOUS }
