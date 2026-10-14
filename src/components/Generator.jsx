/* editorial-ui · Cristian Pérez · cristianperez.me */
import { ArrowRight, Asterisk, CaseLower, CaseUpper, EyeOff, Hash, Ruler, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { AMBIGUOUS, LENGTH_MAX, LENGTH_MIN, poolSize } from '../lib/passwords.js'
import { KeyBlade } from './KeyBlade.jsx'
import { PasswordDisplay } from './PasswordDisplay.jsx'
import { RollingNumber } from './RollingNumber.jsx'
import { StrengthMeter } from './StrengthMeter.jsx'
import { Card, SectionTitle, Toggle } from './ui.jsx'

const CHARSET_TOGGLES = [
  { key: 'lowercase', label: 'Minúsculas', hint: 'a-z', icon: CaseLower },
  { key: 'uppercase', label: 'Mayúsculas', hint: 'A-Z', icon: CaseUpper },
  { key: 'numbers', label: 'Números', hint: '0-9', icon: Hash },
  { key: 'symbols', label: 'Símbolos', hint: '!@#$%…', icon: Asterisk },
]

const CHARSET_KEYS = CHARSET_TOGGLES.map((toggle) => toggle.key)

/** Posición del "16 recomendado" sobre la escala real del deslizador. */
const RECOMMENDED_PERCENT = ((16 - LENGTH_MIN) / (LENGTH_MAX - LENGTH_MIN)) * 100

export function Generator({ password, options, onOptionChange, onRegenerate, analysis, onAudit }) {
  const activeSets = CHARSET_KEYS.filter((key) => options[key])
  const isOnlyActive = (key) => activeSets.length === 1 && activeSets[0] === key
  const lengthPercent = ((options.length - LENGTH_MIN) / (LENGTH_MAX - LENGTH_MIN)) * 100
  const pool = poolSize(options)

  return (
    <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-5">
      <Card raised className="enter lg:col-span-3" style={{ animationDelay: '120ms' }}>
        <SectionTitle
          icon={ShieldCheck}
          title="Contraseña generada"
          description="Aleatoriedad de crypto.getRandomValues (CSPRNG). Nada se envía a ningún servidor."
        />

        <KeyBlade value={password} className="mb-5 pr-1" />

        <PasswordDisplay value={password} onRegenerate={onRegenerate} />

        <div className="mt-6 border-t border-white/[0.06] pt-5">
          <StrengthMeter analysis={analysis} />

          <button
            type="button"
            onClick={onAudit}
            disabled={!password}
            className="group mt-4 -mb-2 inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-brass-300 transition-colors disabled:opacity-40 [@media(hover:hover)]:hover:text-brass-200"
          >
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 ease-[var(--ease-out-soft)] group-hover:bg-[length:100%_1px] group-focus-visible:bg-[length:100%_1px]">
              Auditar esta contraseña en detalle
            </span>
            <ArrowRight
              className="size-4 shrink-0 transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:translate-x-1"
              strokeWidth={2.5}
            />
          </button>
        </div>
      </Card>

      <Card className="enter lg:col-span-2" style={{ animationDelay: '220ms' }}>
        <SectionTitle
          icon={SlidersHorizontal}
          title="Parámetros"
          description="Cada conjunto activo amplía el alfabeto R y, con él, la entropía."
        />

        <div className="mb-6">
          <div className="mb-4 flex items-end justify-between">
            <label htmlFor="length" className="flex items-center gap-2 text-[15px] font-medium text-steel-200">
              <Ruler className="size-[18px] shrink-0 text-steel-500" strokeWidth={2} />
              Longitud
            </label>
            <span className="font-wide text-[2rem] leading-none font-extrabold tracking-tight text-brass-300">
              <RollingNumber value={options.length} />
            </span>
          </div>

          <div className="relative flex h-11 items-center">
            <div className="absolute inset-x-0 h-2 overflow-hidden rounded-full bg-steel-950 ring-1 ring-inset ring-white/[0.06]">
              <div
                className="absolute inset-0 origin-left bg-gradient-to-r from-brass-500 to-brass-300"
                style={{ transform: `scaleX(${lengthPercent / 100})` }}
              />
            </div>
            <span
              aria-hidden
              className="absolute top-2.5 h-1.5 w-px bg-steel-400/60"
              style={{ left: `${RECOMMENDED_PERCENT}%` }}
            />
            <input
              id="length"
              type="range"
              min={LENGTH_MIN}
              max={LENGTH_MAX}
              value={options.length}
              onChange={(event) => onOptionChange('length', Number(event.target.value))}
              className="relative h-11 w-full cursor-pointer"
              aria-describedby="length-scale"
            />
          </div>

          <div id="length-scale" className="relative mt-0.5 h-4 font-mono text-[13px] text-steel-500">
            <span className="absolute left-0">{LENGTH_MIN}</span>
            <span
              className="absolute -translate-x-[3px] whitespace-nowrap text-steel-400"
              style={{ left: `${RECOMMENDED_PERCENT}%` }}
            >
              16 recomendado
            </span>
            <span className="absolute right-0">{LENGTH_MAX}</span>
          </div>
        </div>

        <div className="grid border-t border-white/[0.06] sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-1">
          {CHARSET_TOGGLES.map(({ key, label, hint, icon }) => (
            <div key={key} className="border-b border-white/[0.06]">
              <Toggle
                icon={icon}
                label={label}
                hint={hint}
                checked={options[key]}
                disabled={isOnlyActive(key)}
                onChange={(value) => onOptionChange(key, value)}
              />
            </div>
          ))}
        </div>

        <div className="border-b border-white/[0.06]">
          <Toggle
            icon={EyeOff}
            label="Excluir caracteres ambiguos"
            hint={AMBIGUOUS.slice(0, 12)}
            checked={options.excludeAmbiguous}
            onChange={(value) => onOptionChange('excludeAmbiguous', value)}
          />
        </div>

        <p className="mt-5 rounded-xl bg-steel-950/70 px-4 py-3.5 font-mono text-[13px] leading-relaxed text-steel-400 ring-1 ring-inset ring-white/[0.05]">
          R = {pool} caracteres · L = {options.length}
          <br />
          E = {options.length} × log₂({pool}) ={' '}
          <span className="font-semibold text-brass-300">
            {(options.length * Math.log2(Math.max(pool, 2))).toFixed(1)} bits
          </span>
        </p>
      </Card>
    </div>
  )
}
