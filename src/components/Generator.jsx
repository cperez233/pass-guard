import { ArrowRight, Asterisk, CaseLower, CaseUpper, EyeOff, Hash, Ruler, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { AMBIGUOUS, LENGTH_MAX, LENGTH_MIN, poolSize } from '../lib/passwords.js'
import { PasswordDisplay } from './PasswordDisplay.jsx'
import { StrengthMeter } from './StrengthMeter.jsx'
import { Card, SectionTitle, Toggle } from './ui.jsx'

const CHARSET_TOGGLES = [
  { key: 'lowercase', label: 'Minúsculas', hint: 'a-z', icon: CaseLower },
  { key: 'uppercase', label: 'Mayúsculas', hint: 'A-Z', icon: CaseUpper },
  { key: 'numbers', label: 'Números', hint: '0-9', icon: Hash },
  { key: 'symbols', label: 'Símbolos', hint: '!@#$%…', icon: Asterisk },
]

const CHARSET_KEYS = CHARSET_TOGGLES.map((toggle) => toggle.key)

export function Generator({ password, options, onOptionChange, onRegenerate, analysis, onAudit }) {
  const activeSets = CHARSET_KEYS.filter((key) => options[key])
  const isOnlyActive = (key) => activeSets.length === 1 && activeSets[0] === key
  const lengthPercent = ((options.length - LENGTH_MIN) / (LENGTH_MAX - LENGTH_MIN)) * 100

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <SectionTitle
          icon={ShieldCheck}
          title="Contraseña generada"
          description="Aleatoriedad de crypto.getRandomValues (CSPRNG). Nada se envía a ningún servidor."
        />

        <PasswordDisplay value={password} onRegenerate={onRegenerate} />

        <div className="mt-5 rounded-xl border border-white/8 bg-white/2 p-4">
          <StrengthMeter analysis={analysis} />

          <button
            type="button"
            onClick={onAudit}
            disabled={!password}
            className="group mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 transition-colors hover:text-cyan-200 disabled:opacity-40"
          >
            Auditar esta contraseña en detalle
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
          </button>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <SectionTitle
          icon={SlidersHorizontal}
          title="Parámetros"
          description="Cada conjunto activo amplía el alfabeto R y, con él, la entropía."
        />

        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <label htmlFor="length" className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
              <Ruler className="size-3.5 text-slate-500" strokeWidth={2} />
              Longitud
            </label>
            <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 font-mono text-xs font-semibold text-cyan-300 ring-1 ring-cyan-400/25">
              {options.length}
            </span>
          </div>

          <div className="relative flex h-5 items-center">
            <div className="absolute inset-x-0 h-2 rounded-full bg-slate-800 ring-1 ring-inset ring-white/5" />
            <div
              className="absolute h-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-[width] duration-150"
              style={{ width: `${lengthPercent}%` }}
            />
            <input
              id="length"
              type="range"
              min={LENGTH_MIN}
              max={LENGTH_MAX}
              value={options.length}
              onChange={(event) => onOptionChange('length', Number(event.target.value))}
              className="relative h-2 w-full cursor-pointer"
              aria-describedby="length-scale"
            />
          </div>

          <div id="length-scale" className="mt-2 flex justify-between font-mono text-[10px] text-slate-600">
            <span>{LENGTH_MIN}</span>
            <span className="text-slate-500">16 recomendado</span>
            <span>{LENGTH_MAX}</span>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {CHARSET_TOGGLES.map(({ key, label, hint, icon }) => (
            <Toggle
              key={key}
              icon={icon}
              label={label}
              hint={hint}
              checked={options[key]}
              disabled={isOnlyActive(key)}
              onChange={(value) => onOptionChange(key, value)}
            />
          ))}
        </div>

        <div className="mt-2">
          <Toggle
            icon={EyeOff}
            label="Excluir caracteres ambiguos"
            hint={AMBIGUOUS.slice(0, 12)}
            checked={options.excludeAmbiguous}
            onChange={(value) => onOptionChange('excludeAmbiguous', value)}
          />
        </div>

        <p className="mt-4 font-mono text-[11px] leading-relaxed text-slate-500">
          R = {poolSize(options)} caracteres · L = {options.length}
          <br />
          E = {options.length} × log₂({poolSize(options)}) ={' '}
          <span className="text-slate-300">
            {(options.length * Math.log2(Math.max(poolSize(options), 2))).toFixed(1)} bits
          </span>
        </p>
      </Card>
    </div>
  )
}
