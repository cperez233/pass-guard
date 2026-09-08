/**
 * Generación de contraseñas criptográficamente segura.
 *
 * Toda la aleatoriedad proviene de `crypto.getRandomValues` (CSPRNG del
 * navegador). `Math.random()` NO se usa en ningún punto: su salida es
 * predecible a partir de suficientes muestras y no sirve para material secreto.
 */

export const CHARSETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?/~',
}

/** Caracteres visualmente ambiguos según la tipografía (0/O, 1/l/I, etc.). */
export const AMBIGUOUS = '0OoQD1lIi|`\'";:,.'

export const LENGTH_MIN = 8
export const LENGTH_MAX = 64
export const LENGTH_DEFAULT = 16

export const DEFAULT_OPTIONS = {
  length: LENGTH_DEFAULT,
  lowercase: true,
  uppercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: false,
}

/**
 * Entero aleatorio uniforme en [0, maxExclusive) sin sesgo de módulo.
 *
 * `value % max` sesga los primeros valores cuando 2^32 no es múltiplo de `max`,
 * así que descartamos ("rejection sampling") las muestras del tramo sobrante.
 */
export function secureRandomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new RangeError('maxExclusive debe ser un entero positivo')
  }
  if (maxExclusive === 1) return 0

  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive
  const buffer = new Uint32Array(1)
  let value

  do {
    crypto.getRandomValues(buffer)
    value = buffer[0]
  } while (value >= limit)

  return value % maxExclusive
}

/** Elemento aleatorio de una cadena o array, con la misma fuente segura. */
export function securePick(collection) {
  return collection[secureRandomInt(collection.length)]
}

/** Fisher-Yates con CSPRNG: cada permutación es igual de probable. */
export function secureShuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

const stripAmbiguous = (charset) =>
  [...charset].filter((char) => !AMBIGUOUS.includes(char)).join('')

/** Conjuntos activos según las opciones, ya filtrados de ambigüedades. */
export function buildCharsets(options) {
  const active = []

  for (const key of ['lowercase', 'uppercase', 'numbers', 'symbols']) {
    if (!options[key]) continue
    const charset = options.excludeAmbiguous
      ? stripAmbiguous(CHARSETS[key])
      : CHARSETS[key]
    if (charset.length > 0) active.push({ key, charset })
  }

  return active
}

/** Tamaño del alfabeto R usado en E = L · log2(R). */
export function poolSize(options) {
  return buildCharsets(options).reduce((total, { charset }) => total + charset.length, 0)
}

/**
 * Genera una contraseña garantizando al menos un carácter de cada conjunto
 * activo. Ese refuerzo reduce la entropía teórica en una fracción despreciable
 * (~0.2 bits en 16 caracteres) y evita salidas que fallan políticas de
 * complejidad, así que compensa.
 */
export function generatePassword(options = DEFAULT_OPTIONS) {
  const sets = buildCharsets(options)
  if (sets.length === 0) return ''

  const length = Math.max(sets.length, options.length)
  const pool = sets.map(({ charset }) => charset).join('')

  const characters = sets.map(({ charset }) => securePick(charset))
  while (characters.length < length) {
    characters.push(securePick(pool))
  }

  return secureShuffle(characters).join('')
}
