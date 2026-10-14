# PassGuard

**English** · [Español](README.es.md)

Password generation and auditing SPA. React 19 + Vite + Tailwind CSS v4 + lucide-react + motion.
Everything runs in the browser: no password is ever sent to a server.

## Getting started

```bash
npm install
npm run dev
```

## Architecture

```
src/
├── lib/
│   ├── passwords.js   CSPRNG generation (crypto.getRandomValues), charsets, shuffle
│   ├── analysis.js    Entropy, classification, brute-force cost, weak patterns
│   └── levelStyles.js Colour of each strength level
├── hooks/
│   ├── useCopyToClipboard.js
│   ├── useReducedMotion.js             Reduced-motion preference
│   └── useTumblers.js                  Tumbler effect when the password changes (visual only)
├── components/
│   ├── Generator.jsx / Analyzer.jsx    One view per tab
│   ├── PasswordDisplay.jsx             Monospaced output + copy (tap or hold)
│   ├── KeyBlade.jsx                    Key whose bitting is cut from the password
│   ├── LockFace.jsx                    Lock cylinder that turns with the strength level
│   ├── RollingNumber.jsx               Figures that roll in the direction of change
│   ├── StrengthMeter.jsx               Entropy bar with thresholds
│   └── ui.jsx                          Card, SectionTitle, Toggle, Stat
└── App.jsx            Shared state and tab navigation
```

Design: graphite steel with a brass accent (Archivo, Geist and Geist Mono). Animations use
`motion` and respect `prefers-reduced-motion`.

## Cryptography and metrics

- **Randomness**: `crypto.getRandomValues` with *rejection sampling* to avoid modulo bias, plus a
  Fisher-Yates shuffle from the same source. `Math.random()` is not used anywhere.
- **Entropy**: `E = L · log₂(R)`, where `R` is the alphabet size. In the auditor, `R` is inferred
  from the observed composition, assuming full ASCII alphabets.
- **Classification**: Weak (< 40 bits) · Moderate (40-60) · Strong (60-80) · Excellent (> 80).
- **Crack time**: average case of `2^E / 2` attempts, across three scenarios (10³ attempts/s
  online, 10¹⁰ hashes/s on an offline GPU cluster, 10¹⁴ hashes/s for a nation-state adversary).
- **Pattern penalty**: sequences, keyboard runs, repeats, dictionary words (leetspeak included)
  and years cut the displayed effective entropy by up to 55 %, because a rule-based attack tries
  those variants long before plain brute force.

Estimates assume a fast hash with no strong salt. A slow KDF (bcrypt, scrypt, Argon2) raises the
real cost by several orders of magnitude.
