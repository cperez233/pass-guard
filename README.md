# PassGuard

SPA de generación y auditoría de contraseñas. React 19 + Vite + Tailwind CSS v4 + lucide-react.
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
│   └── analysis.js    Entropía, clasificación, coste de fuerza bruta, patrones débiles
├── hooks/
│   └── useCopyToClipboard.js
├── components/
│   ├── Generator.jsx / Analyzer.jsx    Vistas de cada pestaña
│   ├── PasswordDisplay.jsx             Salida monoespaciada + copiado con feedback
│   ├── StrengthMeter.jsx               Barra de entropía con umbrales
│   └── ui.jsx                          Card, SectionTitle, Toggle, Stat
└── App.jsx            Estado compartido y navegación por pestañas
```

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
