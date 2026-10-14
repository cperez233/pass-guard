/* editorial-ui · Cristian Pérez · cristianperez.me */
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
import { AnimatePresence, motion } from 'motion/react'
import { useId, useState } from 'react'
import { formatCount } from '../lib/analysis.js'
import { levelColor } from '../lib/levelStyles.js'
import { KeyBlade } from './KeyBlade.jsx'
import { RollingNumber } from './RollingNumber.jsx'
import { StrengthMeter } from './StrengthMeter.jsx'
import { Card, SectionTitle, Stat } from './ui.jsx'

const ease = [0.22, 1, 0.36, 1]

const SCENARIO_ICONS = {
  online: Globe,
  cluster: Cpu,
  nationState: Landmark,
}

function PatternChips({ patterns }) {
  return (
    <AnimatePresence initial={false}>
      {patterns.all.length > 0 ? (
        <motion.div
          key="patterns"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35, ease }}
          className="overflow-hidden"
        >
          <div className="mt-5 border-l-2 border-[color:var(--color-weak)] bg-[color:var(--color-weak)]/[0.07] py-4 pr-4 pl-4">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-[color:var(--color-weak)]">
              <ShieldAlert className="size-[18px] shrink-0" strokeWidth={2.2} />
              Fragmentos predecibles detectados
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <AnimatePresence initial={false} mode="popLayout">
                {patterns.all.map((hit) => (
                  <motion.code
                    key={hit}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.22, ease }}
                    className="rounded-md bg-steel-950 px-2 py-1 font-mono text-[14px] text-[#f2b2a8] ring-1 ring-[color:var(--color-weak)]/35"
                  >
                    {hit}
                  </motion.code>
                ))}
              </AnimatePresence>
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-steel-400">
              Un ataque con reglas de diccionario prueba estas variantes antes que la fuerza bruta, así
              que la entropía efectiva mostrada ya está penalizada.
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function Analyzer({ value, onChange, analysis }) {
  const [revealed, setRevealed] = useState(true)
  const inputId = useId()
  const empty = analysis.length === 0
  const color = levelColor(analysis)

  return (
    <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-5">
      <div className="flex flex-col gap-4 sm:gap-5 lg:col-span-3">
        <Card raised className="enter" style={{ animationDelay: '60ms' }}>
          <SectionTitle
            icon={ScanSearch}
            title="Auditar una contraseña"
            description="Escribe o pega una clave. Todo el cálculo ocurre en tu navegador: no hay peticiones de red."
          />

          <KeyBlade value={value} className="mb-5 pr-1" />

          <div className="group relative">
            <Lock
              className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-steel-500 transition-colors group-focus-within:text-brass-400"
              strokeWidth={2}
            />
            <label htmlFor={inputId} className="sr-only">
              Contraseña a evaluar
            </label>
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
              className="min-h-15 w-full rounded-2xl bg-steel-950 py-4 pr-14 pl-12 font-mono text-[17px] text-steel-100 ring-1 ring-white/[0.08] transition-[box-shadow] duration-200 ring-inset placeholder:font-sans placeholder:text-steel-500 focus:ring-2 focus:ring-brass-400/70 focus:outline-none sm:text-lg"
            />
            <button
              type="button"
              onClick={() => setRevealed((current) => !current)}
              aria-label={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute top-1/2 right-2 grid size-11 -translate-y-1/2 place-items-center rounded-xl text-steel-400 transition-[background-color,color,transform] active:scale-95 [@media(hover:hover)]:hover:bg-white/5 [@media(hover:hover)]:hover:text-steel-100"
            >
              {revealed ? (
                <EyeOff className="size-[18px] shrink-0" strokeWidth={2} />
              ) : (
                <Eye className="size-[18px] shrink-0" strokeWidth={2} />
              )}
            </button>
          </div>

          <div className="mt-6 border-t border-white/[0.06] pt-5">
            <StrengthMeter analysis={analysis} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-white/[0.06] pt-5 sm:grid-cols-[1fr_1fr_1fr_1.45fr]">
            <Stat icon={Type} label="Longitud" value={<RollingNumber value={analysis.length} />} unit="car." />
            <Stat
              icon={Fingerprint}
              label="Alfabeto R"
              value={<RollingNumber value={analysis.pool || 0} />}
              unit="símb."
            />
            <Stat
              icon={Binary}
              label="Entropía"
              value={<RollingNumber value={analysis.entropy.toFixed(1)} />}
              unit="bits"
              accent={empty ? 'var(--color-steel-500)' : color}
            />
            <Stat
              icon={Cpu}
              label="Combinaciones"
              value={empty ? '0' : formatCount(analysis.combinations)}
            />
          </div>

          <p className="mt-5 text-[14px] leading-relaxed text-steel-500">
            R se estima desde la composición observada, asumiendo el alfabeto ASCII completo de cada
            tipo presente (26 + 26 + 10 + 33): es la hipótesis que haría un atacante que conoce el
            formato de la clave.
          </p>

          <PatternChips patterns={analysis.patterns} />
        </Card>

        <Card className="enter" style={{ animationDelay: '160ms' }}>
          <SectionTitle
            icon={Cpu}
            title="Coste estimado de un ataque de fuerza bruta"
            description="Caso medio (2^E / 2 intentos). Sin salt fuerte ni KDF lento: el hash marca el ritmo."
          />

          <ul className="border-t border-white/[0.06]">
            {analysis.scenarios.map((scenario) => {
              const Icon = SCENARIO_ICONS[scenario.id]
              return (
                <li
                  key={scenario.id}
                  className={`relative flex items-center gap-3.5 border-b border-white/[0.06] py-4 transition-colors sm:gap-4 ${
                    scenario.primary ? 'bg-brass-400/[0.05] pr-3 pl-4' : 'px-1'
                  }`}
                >
                  {scenario.primary ? (
                    <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-brass-400" />
                  ) : null}
                  <Icon
                    className={`size-5 shrink-0 ${scenario.primary ? 'text-brass-400' : 'text-steel-500'}`}
                    strokeWidth={2}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] leading-snug font-medium text-steel-100">{scenario.label}</p>
                    <p className="mt-0.5 font-mono text-[12.5px] leading-snug text-steel-500">{scenario.detail}</p>
                  </div>

                  <span
                    className={`max-w-[42%] shrink-0 text-right font-mono text-[15px] leading-snug font-semibold sm:text-base ${
                      empty ? 'text-steel-500' : scenario.primary ? 'text-brass-300' : 'text-steel-200'
                    }`}
                  >
                    <RollingNumber value={empty ? '—' : scenario.human} />
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      <Card className="enter lg:sticky lg:top-24 lg:col-span-2" style={{ animationDelay: '240ms' }}>
        <SectionTitle
          icon={CircleCheck}
          title="Checklist de validación"
          description="Comprobaciones en vivo sobre composición y patrones conocidos."
        />

        <ul className="border-t border-white/[0.06]">
          {analysis.checklist.map((item, index) => {
            const state = empty ? 'empty' : item.passed ? 'pass' : 'fail'
            return (
              <li
                key={item.id}
                className={`flex items-start gap-3.5 border-b border-white/[0.06] py-3.5 transition-opacity duration-300 ${
                  empty ? 'opacity-55' : ''
                }`}
              >
                <span className="relative mt-0.5 grid size-5 shrink-0 place-items-center">
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      key={state}
                      initial={{ scale: 0.6, opacity: 0, rotate: -30 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 26, delay: index * 0.035 }}
                      className="grid place-items-center"
                    >
                      {state === 'pass' ? (
                        <CircleCheck className="size-5 text-[color:var(--color-strong)]" strokeWidth={2.2} />
                      ) : (
                        <CircleX
                          className={`size-5 ${state === 'empty' ? 'text-steel-500' : 'text-[color:var(--color-weak)]'}`}
                          strokeWidth={2.2}
                        />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </span>

                <div className="min-w-0">
                  <p
                    className={`text-[15px] leading-snug font-medium transition-colors duration-300 ${
                      empty ? 'text-steel-400' : item.passed ? 'text-steel-100' : 'text-[#f2c3bb]'
                    }`}
                  >
                    {item.label}
                  </p>
                  {!empty ? (
                    <p className="mt-1 text-[14px] leading-relaxed break-words text-steel-400">{item.hint}</p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
