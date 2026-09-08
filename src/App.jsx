import { KeyRound, ScanSearch, ShieldCheck, Terminal } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Analyzer } from './components/Analyzer.jsx'
import { Generator } from './components/Generator.jsx'
import { analyzePassword } from './lib/analysis.js'
import { DEFAULT_OPTIONS, generatePassword } from './lib/passwords.js'

const TABS = [
  { id: 'generator', label: 'Generador', icon: KeyRound },
  { id: 'analyzer', label: 'Auditor', icon: ScanSearch },
]

export default function App() {
  const [tab, setTab] = useState('generator')
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  // Inicializador perezoso: la primera clave se genera una sola vez, no en cada render.
  const [password, setPassword] = useState(() => generatePassword(DEFAULT_OPTIONS))
  const [candidate, setCandidate] = useState('')

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

  const auditGenerated = useCallback(() => {
    setCandidate(password)
    setTab('analyzer')
  }, [password])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Backdrop />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 animate-fade-up">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 ring-1 ring-cyan-400/25">
              <ShieldCheck className="size-5.5 text-cyan-300" strokeWidth={2} />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
                PassGuard
              </h1>
              <p className="font-mono text-[11px] text-slate-500">
                Generador y auditor de contraseñas · 100 % local
              </p>
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
            Genera claves con el CSPRNG del navegador y mide su resistencia real con entropía de
            Shannon, escenarios de crackeo y detección de patrones. Ninguna contraseña abandona esta
            pestaña.
          </p>
        </header>

        <nav
          aria-label="Secciones"
          className="glass mb-5 inline-flex w-full max-w-xs gap-1 rounded-xl p-1 animate-fade-up"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/70 ${
                tab === id
                  ? 'bg-white/8 text-slate-50 shadow-sm ring-1 ring-white/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="size-3.5" strokeWidth={2.2} />
              {label}
            </button>
          ))}
        </nav>

        <main className="flex-1 animate-fade-up">
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
        </main>

        <footer className="mt-10 flex flex-col gap-2 border-t border-white/5 pt-5 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5">
            <Terminal className="size-3.5" strokeWidth={2} />
            <span className="font-mono">
              E = L · log₂(R) · caso medio 2<sup>E</sup>/2
            </span>
          </p>
          <p>
            Las estimaciones asumen fuerza bruta sobre un hash rápido. Un KDF lento (bcrypt, scrypt,
            Argon2) multiplica el coste varios órdenes de magnitud.
          </p>
        </footer>
      </div>
    </div>
  )
}

/** Aurora de fondo: dos manchas desenfocadas, sin coste de layout. */
function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-40 -left-32 size-[34rem] rounded-full bg-cyan-500/12 blur-[120px] animate-aurora" />
      <div
        className="absolute -right-40 -bottom-48 size-[38rem] rounded-full bg-violet-600/12 blur-[130px] animate-aurora"
        style={{ animationDelay: '-7s' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_35%,#05070d_100%)]" />
    </div>
  )
}
