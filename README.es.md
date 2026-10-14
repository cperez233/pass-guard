# PassGuard

[English](README.md) · **Español**

SPA de generación y auditoría de contraseñas. React 19 + Vite + Tailwind CSS v4 + lucide-react + motion.
Todo el procesamiento ocurre en el navegador: ninguna contraseña se envía a un servidor.

## Arranque

```bash
npm install
npm run dev
```

## Arquitectura

```
src/
├── lib/
│   ├── passwords.js   Generación CSPRNG (crypto.getRandomValues), charsets, shuffle
│   ├── analysis.js    Entropía, clasificación, coste de fuerza bruta, patrones débiles
│   ├── levelStyles.js Color de cada nivel de robustez
│   └── i18n.js        Textos en español e inglés y detección del idioma
├── hooks/
│   ├── useCopyToClipboard.js
│   ├── useLang.js                      Idioma activo y sus textos
│   ├── useReducedMotion.js             Preferencia de movimiento reducido
│   └── useTumblers.js                  Efecto de tambores al cambiar la clave (solo visual)
├── components/
│   ├── Generator.jsx / Analyzer.jsx    Vistas de cada pestaña
│   ├── PasswordDisplay.jsx             Salida monoespaciada + copiado (pulsar o mantener)
│   ├── KeyBlade.jsx                    Llave cuyo dentado se talla con la contraseña
│   ├── LockFace.jsx                    Cilindro: vuelta de apertura, anillo que mide la entropía
│   ├── RollingNumber.jsx               Cifras que ruedan en la dirección del cambio
│   ├── StrengthMeter.jsx               Barra de entropía con umbrales
│   └── ui.jsx                          Card, SectionTitle, Toggle, Stat
└── App.jsx            Estado compartido y navegación por pestañas
```

Diseño: acero grafito con acento latón (Archivo, Geist y Geist Mono). Las animaciones usan
`motion` y respetan `prefers-reduced-motion`.

Idioma: español o inglés según el navegador (`es-*` → español, resto → inglés), con selector
ES/EN; la elección se guarda en `localStorage`.

## Criptografía y métricas

- **Aleatoriedad**: `crypto.getRandomValues` con *rejection sampling* para evitar el sesgo de
  módulo, y mezcla Fisher-Yates con la misma fuente. `Math.random()` no se usa en ninguna parte.
- **Entropía**: `E = L · log₂(R)`, donde `R` es el tamaño del alfabeto. En el auditor, `R` se
  infiere de la composición observada asumiendo alfabetos ASCII completos.
- **Clasificación**: Débil (< 40 bits) · Moderada (40-60) · Fuerte (60-80) · Excelente (> 80).
- **Tiempo de crackeo**: caso medio `2^E / 2` intentos, sobre tres escenarios (10³ intentos/s
  online, 10¹⁰ hashes/s en clúster GPU offline, 10¹⁴ hashes/s para un adversario estatal).
- **Penalización por patrones**: secuencias, tramos de teclado, repeticiones, palabras de
  diccionario (con leetspeak) y años reducen hasta un 55 % la entropía efectiva mostrada, porque
  un ataque con reglas prueba esas variantes mucho antes que la fuerza bruta.

Las estimaciones asumen un hash rápido y sin salt fuerte. Un KDF lento (bcrypt, scrypt, Argon2)
multiplica el coste real varios órdenes de magnitud.
