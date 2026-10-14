/* editorial-ui · Cristian Pérez · cristianperez.me */
import { KeyRound, ScanSearch, Terminal } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Analyzer } from './components/Analyzer.jsx'
import { Generator } from './components/Generator.jsx'
import { LockFace } from './components/LockFace.jsx'
import { analyzePassword } from './lib/analysis.js'
import { DEFAULT_OPTIONS, generatePassword } from './lib/passwords.js'

const TABS = [
  { id: 'generator', label: 'Generador', icon: KeyRound },
  { id: 'analyzer', label: 'Auditor', icon: ScanSearch },
]

const ease = [0.22, 1, 0.36, 1]
const TITLE = 'PassGuard'

/** Firma invisible (caracteres de ancho cero) que viaja con el texto del crédito. */
const zw = (text) =>
  '⁠' +
  [...new TextEncoder().encode(text)]
    .map((byte) => byte.toString(2).padStart(8, '0'))
    .join('')
    .replace(/0/g, '​')
    .replace(/1/g, '‌') +
  '⁠'
const INVISIBLE_SIGNATURE = zw('Cristian Pérez · https://cristianperez.me')

export default function App() {
  const [tab, setTab] = useState('generator')
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  // Inicializador perezoso: la primera clave se genera una sola vez, no en cada render.
  const [password, setPassword] = useState(() => generatePassword(DEFAULT_OPTIONS))
  const [candidate, setCandidate] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const regenerate = useCallback(
    (nextOptions = options) => setPassword(generatePassword(nextOptions)),
    [options],
  )

  const handleOptionChange = useCallback(
    (key, value) => {
      const nextOptions = { ...options, [key]: value }
      setOptions(nextOptions)
      // Regenerar al vuelo: los parámetros y el resultado nunca se desincronizan.
      setPassword(generatePassword(nextOptions))
    },
    [options],
  )

  const generatedAnalysis = useMemo(() => analyzePassword(password), [password])
  const candidateAnalysis = useMemo(() => analyzePassword(candidate), [candidate])

  const changeTab = useCallback((next) => {
    setTab(next)
    // Si el usuario ya bajó, el cambio de pestaña lo devuelve al inicio del panel.
    const main = document.getElementById('panel')
    if (main && main.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: main.offsetTop - 88, behavior: reduce ? 'auto' : 'smooth' })
    }
  }, [])

  const auditGenerated = useCallback(() => {
    setCandidate(password)
    changeTab('analyzer')
  }, [password, changeTab])

  const direction = tab === 'analyzer' ? 1 : -1

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-svh">
        <Backdrop />

        <div className="relative mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-14 lg:px-8">
          <header className="relative mb-8 sm:mb-12">
            <p
              className="enter flex items-center gap-2.5 text-[15px] font-medium text-steel-400"
              style={{ animationDelay: '40ms' }}
            >
              <KeyMark className="h-4 w-8 shrink-0" />
              Generador y auditor de contraseñas · 100 % local
            </p>

            <h1
              aria-label={TITLE}
              className="font-wide mt-4 text-[clamp(2.9rem,12.4vw,9.25rem)] leading-[0.92] font-black tracking-[-0.045em] text-steel-100"
            >
              {[...TITLE].map((letter, index) => (
                <span key={index} aria-hidden className="letter-slot">
                  <span
                    className={index >= 4 ? 'text-brass-400' : undefined}
                    style={{ animationDelay: `${120 + index * 45}ms` }}
                  >
                    {letter}
                  </span>
                </span>
              ))}
            </h1>

            <div className="mt-6">
              <p
                className="enter max-w-2xl md:max-w-[calc(100%-12rem)] lg:max-w-2xl text-[17px] leading-relaxed text-steel-300 sm:text-lg"
                style={{ animationDelay: '420ms' }}
              >
                Genera claves con el CSPRNG del navegador y mide su resistencia real con entropía de
                Shannon, escenarios de crackeo y detección de patrones. Ninguna contraseña abandona esta
                pestaña.
              </p>
              <div
                className="enter absolute right-0 -bottom-14 hidden w-40 md:block lg:-bottom-28 lg:w-52"
                style={{ animationDelay: '600ms' }}
              >
                <LockFace analysis={tab === 'generator' ? generatedAnalysis : candidateAnalysis} />
              </div>
            </div>
          </header>

          <nav
            aria-label="Secciones"
            className={`enter sticky top-[max(0.75rem,env(safe-area-inset-top))] z-30 mb-5 flex w-full max-w-sm self-start rounded-2xl p-1.5 transition-[box-shadow,background-color] duration-300 sm:mb-6 ${
              scrolled
                ? 'bg-steel-800/[0.98] shadow-[var(--shadow-float)] ring-1 ring-white/10'
                : 'bg-steel-850 ring-1 ring-white/[0.06]'
            }`}
            style={{ animationDelay: '520ms' }}
          >
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = tab === id
              return (
                <motion.button
                  key={id}
                  type="button"
                  onClick={() => changeTab(id)}
                  aria-current={active ? 'page' : undefined}
                  whileTap={{ scale: 0.97 }}
                  className={`relative flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-semibold transition-colors duration-200 ${
                    active ? 'text-steel-950' : 'text-steel-400 [@media(hover:hover)]:hover:text-steel-100'
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="tab-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-xl bg-brass-400 shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_8px_20px_-10px_rgb(217_167_74/0.7)]"
                    />
                  ) : null}
                  <Icon className="relative size-[18px] shrink-0" strokeWidth={2.2} />
                  <span className="relative">{label}</span>
                </motion.button>
              )
            })}
          </nav>

          <main id="panel" className="relative flex-1">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={tab}
                custom={direction}
                variants={{
                  enter: (d) => ({ opacity: 0, x: d * 28 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d) => ({ opacity: 0, x: d * -28 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease }}
              >
                {tab === 'generator' ? (
                  <Generator
                    password={password}
                    options={options}
                    onOptionChange={handleOptionChange}
                    onRegenerate={regenerate}
                    analysis={generatedAnalysis}
                    onAudit={auditGenerated}
                  />
                ) : (
                  <Analyzer value={candidate} onChange={setCandidate} analysis={candidateAnalysis} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="mt-16 sm:mt-24">
            {/* Línea de suelo: la llave descansa sobre ella. */}
            <div aria-hidden className="relative h-6">
              <KeyMark className="absolute bottom-0 left-0 h-5 w-10 text-brass-400 sm:left-auto sm:right-0" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-white/15 via-white/10 to-transparent sm:from-transparent sm:via-white/10 sm:to-white/15" />
            </div>

            <div className="flex flex-col gap-4 pt-6 text-[14px] leading-relaxed text-steel-500 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
              <p className="flex shrink-0 items-center gap-2 text-steel-400">
                <Terminal className="size-4 shrink-0 text-brass-400" strokeWidth={2} />
                <span className="font-mono">
                  E = L · log₂(R) · caso medio 2<sup>E</sup>/2
                </span>
              </p>
              <p className="max-w-xl sm:text-right">
                Las estimaciones asumen fuerza bruta sobre un hash rápido. Un KDF lento (bcrypt, scrypt,
                Argon2) multiplica el coste varios órdenes de magnitud.
              </p>
            </div>

            <p className="mt-6 text-[13px] text-steel-500 sm:mt-8">
              Tallado con cuidado por{' '}
              <a
                href="https://cristianperez.me"
                target="_blank"
                rel="noopener"
                className="inline-block py-3 text-steel-400 underline decoration-steel-600 underline-offset-4 transition-colors [@media(hover:hover)]:hover:text-brass-300 [@media(hover:hover)]:hover:decoration-brass-400"
              >
                Cristian Pérez
              </a>
              {INVISIBLE_SIGNATURE}
            </p>
          </footer>
        </div>
      </div>
    </MotionConfig>
  )
}

/** Marca de PassGuard: una llave de perfil, la misma que talla el generador. */
function KeyMark({ className = '' }) {
  return (
    <svg aria-hidden viewBox="0 0 40 20" className={className} fill="none">
      <circle cx="7" cy="10" r="5.5" stroke="currentColor" strokeWidth="2.2" className="text-brass-400" />
      <path
        d="M12.5 10H37l-2.2 2.6h-2.4l-1.4 2.4-1.6-2.4h-1.7l-1.3 3-1.6-3H23l-1.2 2.2-1.4-2.2h-7.9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
        className="text-brass-400"
      />
    </svg>
  )
}

/** Fondo: acero grafito con grano y una luz cálida y quieta sobre el banco. */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_80%_-10%,rgb(217_167_74/0.08),transparent_60%),radial-gradient(70%_50%_at_0%_110%,rgb(121_195_198/0.04),transparent_60%)]" />
      <div className="grain absolute inset-0 opacity-70" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass-400/30 to-transparent" />
    </div>
  )
}
