/* editorial-ui · Cristian Pérez · cristianperez.me */

/**
 * Textos de la interfaz y del análisis en español (por defecto) e inglés.
 * Las funciones reciben los valores dinámicos para que el orden de las
 * palabras pueda cambiar entre idiomas.
 */

export const LANGS = ['es', 'en']
const STORAGE_KEY = 'passguard-lang'

/** Idioma inicial: el guardado, si no el del navegador (español → es, resto → en). */
export function detectLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (LANGS.includes(saved)) return saved
  } catch {
    // Sin almacenamiento (modo privado): se usa el del navegador.
  }
  const preferred = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : []
  return preferred.some((tag) => String(tag).toLowerCase().startsWith('es')) ? 'es' : 'en'
}

export function saveLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // Preferencia solo para esta visita.
  }
}

export const MESSAGES = {
  es: {
    locale: 'es-ES',
    meta: {
      title: 'PassGuard · Generador y Auditor de Contraseñas',
      description:
        'Genera contraseñas con el CSPRNG del navegador y audita su resistencia real. Todo ocurre en tu navegador.',
    },
    langLabel: 'Idioma',
    eyebrow: 'Generador y auditor de contraseñas · 100 % local',
    lede: 'Genera claves con el CSPRNG del navegador y mide su resistencia real con entropía de Shannon, escenarios de crackeo y detección de patrones. Ninguna contraseña abandona esta pestaña.',
    lockLabel: 'Girar la cerradura',
    nav: 'Secciones',
    tabs: { generator: 'Generador', analyzer: 'Auditor' },
    footer: {
      formula: 'E = L · log₂(R) · caso medio',
      note: 'Las estimaciones asumen fuerza bruta sobre un hash rápido. Un KDF lento (bcrypt, scrypt, Argon2) multiplica el coste varios órdenes de magnitud.',
      credit: 'Tallado con cuidado por',
    },
    generator: {
      title: 'Contraseña generada',
      description: 'Aleatoriedad de crypto.getRandomValues (CSPRNG). Nada se envía a ningún servidor.',
      audit: 'Auditar esta contraseña en detalle',
      paramsTitle: 'Parámetros',
      paramsDescription: 'Cada conjunto activo amplía el alfabeto R y, con él, la entropía.',
      length: 'Longitud',
      recommended: '16 recomendado',
      sets: { lowercase: 'Minúsculas', uppercase: 'Mayúsculas', numbers: 'Números', symbols: 'Símbolos' },
      excludeAmbiguous: 'Excluir caracteres ambiguos',
      lastSet: 'Debe quedar al menos un conjunto activo',
      characters: 'caracteres',
    },
    display: {
      output: 'Contraseña generada',
      empty: 'Activa al menos un conjunto de caracteres…',
      copy: 'Copiar contraseña',
      copied: 'Copiado al portapapeles',
      holdHint: 'Pulsa o mantén para copiar',
      regenerate: 'Regenerar',
      regenerateLabel: 'Regenerar contraseña',
      clipboardError: 'El navegador bloqueó el portapapeles. Selecciona el texto y copia manualmente.',
    },
    meter: { empty: 'Sin evaluar' },
    analyzer: {
      title: 'Auditar una contraseña',
      description:
        'Escribe o pega una clave. Todo el cálculo ocurre en tu navegador: no hay peticiones de red.',
      inputLabel: 'Contraseña a evaluar',
      placeholder: 'Introduce la contraseña a evaluar…',
      hide: 'Ocultar contraseña',
      show: 'Mostrar contraseña',
      stats: {
        length: 'Longitud',
        lengthUnit: 'car.',
        pool: 'Alfabeto R',
        poolUnit: 'símb.',
        entropy: 'Entropía',
        combinations: 'Combinaciones',
      },
      poolNote:
        'R se estima desde la composición observada, asumiendo el alfabeto ASCII completo de cada tipo presente (26 + 26 + 10 + 33): es la hipótesis que haría un atacante que conoce el formato de la clave.',
      patternsTitle: 'Fragmentos predecibles detectados',
      patternsNote:
        'Un ataque con reglas de diccionario prueba estas variantes antes que la fuerza bruta, así que la entropía efectiva mostrada ya está penalizada.',
      costTitle: 'Coste estimado de un ataque de fuerza bruta',
      costDescription: 'Caso medio (2^E / 2 intentos). Sin salt fuerte ni KDF lento: el hash marca el ritmo.',
      checklistTitle: 'Checklist de validación',
      checklistDescription: 'Comprobaciones en vivo sobre composición y patrones conocidos.',
    },
    levels: {
      weak: { label: 'Débil', summary: 'Rompible en minutos u horas con hardware doméstico.' },
      moderate: { label: 'Moderada', summary: 'Aceptable solo con límite de intentos; insuficiente offline.' },
      strong: { label: 'Fuerte', summary: 'Resiste ataques offline con hardware convencional.' },
      excellent: { label: 'Excelente', summary: 'Fuera del alcance de la fuerza bruta con la tecnología actual.' },
    },
    scenarios: {
      online: { label: 'Ataque online con rate limiting', detail: '10³ intentos/s · formulario de login protegido' },
      cluster: { label: 'Clúster de GPUs offline', detail: '10¹⁰ hashes/s · hash rápido (MD5 / SHA-1 / NTLM)' },
      nationState: {
        label: 'Adversario con recursos estatales',
        detail: '10¹⁴ hashes/s · granja dedicada de ASIC/GPU',
      },
    },
    checklist: {
      length: {
        label: 'Longitud mínima de 12 caracteres',
        long: 'Excelente: 16+ caracteres.',
        short: 'La longitud es el factor que más entropía aporta.',
      },
      mix: { label: 'Mezcla de al menos 3 tipos de caracteres', hint: (n) => `Detectados ${n} de 4 conjuntos (aA1$).` },
      symbols: { label: 'Incluye símbolos', hint: 'Amplía el alfabeto en 33 caracteres adicionales.' },
      sequential: {
        label: 'Sin secuencias ni patrones de teclado',
        found: (list) => `Patrón detectado: ${list}`,
        clean: 'No se hallaron secuencias tipo 1234 / qwerty / abcd.',
      },
      repeats: {
        label: 'Sin caracteres o bloques repetidos',
        found: (list) => `Repetición detectada: ${list}`,
        clean: 'No hay repeticiones significativas.',
      },
      dictionary: {
        label: 'Sin palabras de diccionario comunes',
        found: (list) => `Término común: ${list}`,
        clean: 'No coincide con términos frecuentes en wordlists.',
      },
      dates: {
        label: 'Sin años ni fechas reconocibles',
        found: (list) => `Año detectado: ${list}`,
        clean: 'Sin sufijos tipo 2024 que las reglas de hashcat prueban primero.',
      },
    },
    time: {
      forever: 'Prácticamente eterno',
      instant: 'Instantáneo',
      units: [
        ['segundo', 'segundos'],
        ['minuto', 'minutos'],
        ['hora', 'horas'],
        ['día', 'días'],
        ['mes', 'meses'],
      ],
      year: ['año', 'años'],
    },
  },

  en: {
    locale: 'en-US',
    meta: {
      title: 'PassGuard · Password Generator and Auditor',
      description:
        'Generate passwords with the browser CSPRNG and audit their real strength. Everything happens in your browser.',
    },
    langLabel: 'Language',
    eyebrow: 'Password generator and auditor · 100% local',
    lede: 'Generate keys with the browser CSPRNG and measure their real strength with Shannon entropy, cracking scenarios and pattern detection. No password ever leaves this tab.',
    lockLabel: 'Turn the lock',
    nav: 'Sections',
    tabs: { generator: 'Generator', analyzer: 'Auditor' },
    footer: {
      formula: 'E = L · log₂(R) · average case',
      note: 'Estimates assume brute force against a fast hash. A slow KDF (bcrypt, scrypt, Argon2) raises the cost by several orders of magnitude.',
      credit: 'Carefully cut by',
    },
    generator: {
      title: 'Generated password',
      description: 'Randomness from crypto.getRandomValues (CSPRNG). Nothing is sent to any server.',
      audit: 'Audit this password in detail',
      paramsTitle: 'Parameters',
      paramsDescription: 'Each active set widens the alphabet R and, with it, the entropy.',
      length: 'Length',
      recommended: '16 recommended',
      sets: { lowercase: 'Lowercase', uppercase: 'Uppercase', numbers: 'Numbers', symbols: 'Symbols' },
      excludeAmbiguous: 'Exclude ambiguous characters',
      lastSet: 'At least one set must stay on',
      characters: 'characters',
    },
    display: {
      output: 'Generated password',
      empty: 'Turn on at least one character set…',
      copy: 'Copy password',
      copied: 'Copied to clipboard',
      holdHint: 'Tap or hold to copy',
      regenerate: 'Regenerate',
      regenerateLabel: 'Regenerate password',
      clipboardError: 'The browser blocked the clipboard. Select the text and copy it manually.',
    },
    meter: { empty: 'Not rated' },
    analyzer: {
      title: 'Audit a password',
      description: 'Type or paste a key. Every calculation happens in your browser: no network requests.',
      inputLabel: 'Password to evaluate',
      placeholder: 'Enter the password to evaluate…',
      hide: 'Hide password',
      show: 'Show password',
      stats: {
        length: 'Length',
        lengthUnit: 'chars',
        pool: 'Alphabet R',
        poolUnit: 'symb.',
        entropy: 'Entropy',
        combinations: 'Combinations',
      },
      poolNote:
        'R is estimated from the observed composition, assuming the full ASCII alphabet of each type present (26 + 26 + 10 + 33): the assumption an attacker who knows the key format would make.',
      patternsTitle: 'Predictable fragments detected',
      patternsNote:
        'A rule-based dictionary attack tries these variants before brute force, so the effective entropy shown is already penalised.',
      costTitle: 'Estimated cost of a brute-force attack',
      costDescription: 'Average case (2^E / 2 attempts). No strong salt or slow KDF: the hash sets the pace.',
      checklistTitle: 'Validation checklist',
      checklistDescription: 'Live checks on composition and known patterns.',
    },
    levels: {
      weak: { label: 'Weak', summary: 'Breakable in minutes or hours with home hardware.' },
      moderate: { label: 'Moderate', summary: 'Acceptable only with attempt limits; not enough offline.' },
      strong: { label: 'Strong', summary: 'Withstands offline attacks with conventional hardware.' },
      excellent: { label: 'Excellent', summary: 'Beyond the reach of brute force with current technology.' },
    },
    scenarios: {
      online: { label: 'Online attack with rate limiting', detail: '10³ attempts/s · protected login form' },
      cluster: { label: 'Offline GPU cluster', detail: '10¹⁰ hashes/s · fast hash (MD5 / SHA-1 / NTLM)' },
      nationState: { label: 'Nation-state adversary', detail: '10¹⁴ hashes/s · dedicated ASIC/GPU farm' },
    },
    checklist: {
      length: {
        label: 'Minimum length of 12 characters',
        long: 'Excellent: 16+ characters.',
        short: 'Length is the factor that adds the most entropy.',
      },
      mix: { label: 'Mix of at least 3 character types', hint: (n) => `${n} of 4 sets detected (aA1$).` },
      symbols: { label: 'Includes symbols', hint: 'Widens the alphabet by 33 extra characters.' },
      sequential: {
        label: 'No sequences or keyboard patterns',
        found: (list) => `Pattern detected: ${list}`,
        clean: 'No 1234 / qwerty / abcd style sequences found.',
      },
      repeats: {
        label: 'No repeated characters or blocks',
        found: (list) => `Repetition detected: ${list}`,
        clean: 'No significant repetitions.',
      },
      dictionary: {
        label: 'No common dictionary words',
        found: (list) => `Common term: ${list}`,
        clean: 'Does not match frequent wordlist terms.',
      },
      dates: {
        label: 'No recognisable years or dates',
        found: (list) => `Year detected: ${list}`,
        clean: 'No 2024-style suffixes that hashcat rules try first.',
      },
    },
    time: {
      forever: 'Practically forever',
      instant: 'Instant',
      units: [
        ['second', 'seconds'],
        ['minute', 'minutes'],
        ['hour', 'hours'],
        ['day', 'days'],
        ['month', 'months'],
      ],
      year: ['year', 'years'],
    },
  },
}

export function messagesFor(lang) {
  return MESSAGES[lang] ?? MESSAGES.es
}
