import {
  Binary,
  CircleCheck,
  CircleX,
  Cpu,
  Eye,
  EyeOff,
  Fingerprint,
  Globe,
  Landmark,
  Lock,
  ScanSearch,
  ShieldAlert,
  Type,
} from 'lucide-react'
import { useId, useState } from 'react'
import { formatCount } from '../lib/analysis.js'
import { StrengthMeter } from './StrengthMeter.jsx'
import { Card, SectionTitle, Stat } from './ui.jsx'

const SCENARIO_ICONS = {
  online: Globe,
  cluster: Cpu,
  nationState: Landmark,
}

function PatternChips({ patterns }) {
  if (patterns.all.length === 0) return null

  return (
    <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-300">
        <ShieldAlert className="size-3.5" strokeWidth={2.5} />
        Fragmentos predecibles detectados
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {patterns.all.map((hit) => (
          <code
            key={hit}
            className="rounded-md bg-rose-500/10 px-1.5 py-0.5 font-mono text-[11px] text-rose-200 ring-1 ring-rose-500/25"
          >
            {hit}
          </code>
        ))}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-rose-200/60">
        Un ataque con reglas de diccionario prueba estas variantes antes que la fuerza bruta, así
        que la entropía efectiva mostrada ya está penalizada.
      </p>
    </div>
  )
}

export function Analyzer({ value, onChange, analysis }) {
  const [revealed, setRevealed] = useState(true)
  const inputId = useId()
  const empty = analysis.length === 0

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="flex flex-col gap-4 lg:col-span-3">
        <Card>
          <SectionTitle
            icon={ScanSearch}
            title="Auditar una contraseña"
            description="Escribe o pega una clave. Todo el cálculo ocurre en tu navegador: no hay peticiones de red."
          />

          <div className="relative">
            <Lock
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-600"
              strokeWidth={2}
            />
            <input
              id={inputId}
              type={revealed ? 'text' : 'password'}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder="Introduce la contraseña a evaluar…"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-xl border border-white/10 bg-abyss-950/60 py-3.5 pr-12 pl-11 font-mono text-sm text-slate-100 placeholder:font-sans placeholder:text-slate-600 transition-colors focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
            <button
              type="button"
              onClick={() => setRevealed((current) => !current)}
              aria-label={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300 focus-visible:outline-2 focus-visible:outline-cyan-400/70"
            >
              {revealed ? <EyeOff className="size-4" strokeWidth={2} /> : <Eye className="size-4" strokeWidth={2} />}
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-white/8 bg-white/2 p-4">
            <StrengthMeter analysis={analysis} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Stat icon={Type} label="Longitud" value={analysis.length} unit="car." />
            <Stat icon={Fingerprint} label="Alfabeto R" value={analysis.pool || 0} unit="símb." />
            <Stat
              icon={Binary}
              label="Entropía"
              value={analysis.entropy.toFixed(1)}
              unit="bits"
              accent={empty ? 'text-slate-600' : analysis.level.text}
            />
            <Stat
              icon={Cpu}
              label="Combinaciones"
              value={empty ? '0' : formatCount(analysis.combinations)}
            />
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
            R se estima desde la composición observada, asumiendo el alfabeto ASCII completo de cada
            tipo presente (26 + 26 + 10 + 33): es la hipótesis que haría un atacante que conoce el
            formato de la clave.
          </p>

          <PatternChips patterns={analysis.patterns} />
        </Card>

        <Card>
          <SectionTitle
            icon={Cpu}
            title="Coste estimado de un ataque de fuerza bruta"
            description="Caso medio (2^E / 2 intentos). Sin salt fuerte ni KDF lento: el hash marca el ritmo."
          />

          <ul className="space-y-2">
            {analysis.scenarios.map((scenario) => {
              const Icon = SCENARIO_ICONS[scenario.id]
              return (
                <li
                  key={scenario.id}
                  className={`flex items-center gap-3 rounded-xl border p-3.5 transition-colors ${
                    scenario.primary
                      ? 'border-cyan-400/25 bg-cyan-500/5'
                      : 'border-white/8 bg-white/2'
                  }`}
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                      scenario.primary
                        ? 'bg-cyan-500/15 text-cyan-300'
                        : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    <Icon className="size-4" strokeWidth={2} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-200">{scenario.label}</p>
                    <p className="truncate font-mono text-[10px] text-slate-500">{scenario.detail}</p>
                  </div>

                  <span
                    className={`shrink-0 text-right font-mono text-xs font-semibold ${
                      empty ? 'text-slate-600' : scenario.primary ? 'text-cyan-300' : 'text-slate-300'
                    }`}
                  >
                    {empty ? '—' : scenario.human}
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      <Card className="lg:col-span-2">
        <SectionTitle
          icon={CircleCheck}
          title="Checklist de validación"
          description="Comprobaciones en vivo sobre composición y patrones conocidos."
        />

        <ul className="space-y-1.5">
          {analysis.checklist.map((item) => (
            <li
              key={item.id}
              className={`flex items-start gap-3 rounded-xl border p-3 transition-colors duration-300 ${
                empty
                  ? 'border-white/5 bg-white/2 opacity-50'
                  : item.passed
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-rose-500/20 bg-rose-500/5'
              }`}
            >
              {item.passed && !empty ? (
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-400" strokeWidth={2.2} />
              ) : (
                <CircleX
                  className={`mt-0.5 size-4 shrink-0 ${empty ? 'text-slate-600' : 'text-rose-400'}`}
                  strokeWidth={2.2}
                />
              )}

              <div className="min-w-0">
                <p
                  className={`text-xs font-medium ${
                    empty ? 'text-slate-500' : item.passed ? 'text-emerald-100' : 'text-rose-100'
                  }`}
                >
                  {item.label}
                </p>
                {!empty ? (
                  <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{item.hint}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
