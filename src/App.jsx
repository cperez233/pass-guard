/* editorial-ui · Cristian Pérez · cristianperez.me */
import { KeyRound, ScanSearch, Terminal } from 'lucide-react'
import { AnimatePresence, MotionConfig, motion, useAnimationControls, useInView } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Analyzer } from './components/Analyzer.jsx'
import { Generator } from './components/Generator.jsx'
import { LockFace } from './components/LockFace.jsx'
import { LangContext } from './hooks/useLang.js'
import { analyzePassword } from './lib/analysis.js'
import { LANGS, detectLang, messagesFor, saveLang } from './lib/i18n.js'
import { DEFAULT_OPTIONS, generatePassword } from './lib/passwords.js'

const TABS = [
  { id: 'generator', icon: KeyRound },
  { id: 'analyzer', icon: ScanSearch },
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
  const [lang, setLang] = useState(detectLang)
  const t = messagesFor(lang)
  const panelFade = useAnimationControls()
  const groundRef = useRef(null)
  const groundInView = useInView(groundRef, { once: true, margin: '0px 0px -10% 0px' })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Idioma: <html lang>, título y descripción siguen a la elección.
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.meta.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description)
  }, [lang, t])

  const changeLang = useCallback(
    (next) => {
      if (next === lang) return
      setLang(next)
      saveLang(next)
      panelFade.start({ opacity: [0.25, 1], transition: { duration: 0.45, ease } })
    },
    [lang, panelFade],
  )

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

  const generatedAnalysis = useMemo(() => analyzePassword(password, lang), [password, lang])
  const candidateAnalysis = useMemo(() => analyzePassword(candidate, lang), [candidate, lang])

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
    <LangContext.Provider value={lang}>
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-svh">
        <Backdrop />

        <div className="relative mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 pt-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-14 lg:px-8">
          <header className="relative mb-8 sm:mb-12">
            <div className="flex items-start justify-between gap-4">
              <p
                className="enter flex items-center gap-2.5 pt-2 text-[15px] font-medium text-steel-400"
                style={{ animationDelay: '40ms' }}
              >
                <KeyMark className="h-4 w-8 shrink-0" />
                <span key={lang} className="lang-swap">
                  {t.eyebrow}
                </span>
              </p>
              <LangSwitch lang={lang} onChange={changeLang} label={t.langLabel} />
            </div>

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
                <span key={lang} className="lang-swap">
                  {t.lede}
                </span>
              </p>
              <div
                className="enter absolute right-0 -bottom-14 hidden w-40 md:block lg:-bottom-28 lg:w-52"
                style={{ animationDelay: '600ms' }}
              >
                <LockFace
                  interactive
                  label={t.lockLabel}
                  analysis={tab === 'generator' ? generatedAnalysis : candidateAnalysis}
                />
              </div>
            </div>
          </header>

          <nav
            aria-label={t.nav}
            className={`enter sticky top-[max(0.75rem,env(safe-area-inset-top))] z-30 mb-5 flex w-full max-w-sm self-start rounded-2xl p-1.5 transition-[box-shadow,background-color] duration-300 sm:mb-6 ${
              scrolled
                ? 'bg-steel-800/[0.98] shadow-[var(--shadow-float)] ring-1 ring-white/10'
                : 'bg-steel-850 ring-1 ring-white/[0.06]'
            }`}
            style={{ animationDelay: '520ms' }}
          >
            {TABS.map(({ id, icon: Icon }) => {
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
                  <span className="relative">{t.tabs[id]}</span>
                </motion.button>
              )
            })}
          </nav>

          <motion.main id="panel" className="relative flex-1" animate={panelFade}>
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
          </motion.main>

          <footer className="mt-16 sm:mt-24">
            {/* Línea de suelo: la llave descansa sobre ella. */}
            <div ref={groundRef} aria-hidden className="relative h-6">
              {/* La llave cae, gira y se asienta sobre la línea una vez, al entrar en vista. */}
              <motion.div
                className="absolute bottom-0 left-1 h-5 w-10 origin-[85%_80%] sm:right-1 sm:left-auto"
                initial={{ y: -34, rotate: -38, opacity: 0 }}
                animate={groundInView ? { y: 4, rotate: 0, opacity: 1 } : undefined}
                transition={{
                  y: { type: 'spring', stiffness: 260, damping: 13 },
                  rotate: { type: 'spring', stiffness: 160, damping: 11, delay: 0.05 },
                  opacity: { duration: 0.2 },
                }}
              >
                <KeyMark className="size-full text-brass-400" />
              </motion.div>
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-white/15 via-white/10 to-transparent sm:from-transparent sm:via-white/10 sm:to-white/15" />
            </div>

            <div className="flex flex-col gap-4 pt-6 text-[14px] leading-relaxed text-steel-500 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
              <p className="flex shrink-0 items-center gap-2 text-steel-400">
                <Terminal className="size-4 shrink-0 text-brass-400" strokeWidth={2} />
                <span className="font-mono">
                  {t.footer.formula} 2<sup>E</sup>/2
                </span>
              </p>
              <p className="max-w-xl sm:text-right">
                {t.footer.note}
              </p>
            </div>

            <p className="mt-6 text-[13px] text-steel-500 sm:mt-8">
              {t.footer.credit}{' '}
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
    </LangContext.Provider>
  )
}

/** Selector de idioma: el pin de latón se desliza a la opción activa. */
function LangSwitch({ lang, onChange, label }) {
  const names = { es: 'Español', en: 'English' }
  return (
    <div
      role="group"
      aria-label={label}
      className="enter relative flex shrink-0 rounded-full bg-steel-850 p-1 ring-1 ring-white/[0.07]"
      style={{ animationDelay: '80ms' }}
    >
      {LANGS.map((code) => {
        const active = code === lang
        return (
          <button
            key={code}
            type="button"
            lang={code}
            title={names[code]}
            aria-label={names[code]}
            aria-pressed={active}
            onClick={() => onChange(code)}
            className={`relative h-8 min-w-11 rounded-full px-3 font-mono text-[13px] font-semibold uppercase tracking-wider transition-colors duration-200 after:absolute after:-inset-y-1.5 after:inset-x-0 after:content-[''] active:scale-95 ${
              active ? 'text-steel-950' : 'text-steel-400 [@media(hover:hover)]:hover:text-steel-100'
            }`}
          >
            {active ? (
              <motion.span
                layoutId="lang-pill"
                transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                className="absolute inset-0 rounded-full bg-brass-400 shadow-[inset_0_1px_0_rgb(255_255_255/0.35)]"
              />
            ) : null}
            <span className="relative">{code}</span>
          </button>
        )
      })}
    </div>
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
