/* editorial-ui · Cristian Pérez · cristianperez.me */
import { STRENGTH_LEVELS } from '../lib/analysis.js'
import { useLang } from '../hooks/useLang.js'
import { levelColor } from '../lib/levelStyles.js'
import { LockFace } from './LockFace.jsx'
import { RollingNumber } from './RollingNumber.jsx'
import { LangSwap } from './LangSwap.jsx'
import { ScrambleText } from './ScrambleText.jsx'

/** Marcas visuales en los umbrales de clasificación (la barra llega a 128 bits). */
const THRESHOLDS = STRENGTH_LEVELS.filter((level) => Number.isFinite(level.max)).map(
  (level) => ({ bits: level.max, percent: (level.max / 128) * 100 }),
)

export function StrengthMeter({ analysis, compact = false }) {
  const { entropy, level, percent, length } = analysis
  const empty = length === 0
  const { t } = useLang()
  const color = levelColor(analysis)
  const fill = empty ? 0 : Math.max(percent, 3) / 100

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span
            className="font-semiwide inline-flex items-center gap-2 text-[15px] font-bold tracking-tight transition-colors duration-500"
            style={{ color }}
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rotate-45 transition-colors duration-500"
              style={{ background: color }}
            />
            <ScrambleText text={empty ? t.meter.empty : level.label} />
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-right leading-none">
          {/* En móvil el cilindro del hero no se ve: aquí acompaña a la cifra. */}
          {!compact ? <LockFace analysis={analysis} className="w-11 md:hidden" /> : null}
          <div>
          <span
            className="font-mono text-[1.9rem] font-semibold tracking-tight transition-colors duration-500 sm:text-4xl"
            style={{ color: empty ? 'var(--color-steel-500)' : color }}
          >
            <RollingNumber value={entropy.toFixed(1)} />
          </span>
          <span className="ml-1.5 font-mono text-[13px] text-steel-500">bits</span>
          </div>
        </div>
      </div>

      {!compact && !empty ? (
        <p className="mt-1.5 text-[14px] leading-snug text-steel-400">
          <LangSwap>{level.summary}</LangSwap>
        </p>
      ) : null}

      {/* Escala: la barra se llena con scaleX (sin animar el ancho). */}
      <div className="relative isolate mt-4 h-2.5 transform-gpu overflow-hidden rounded-full bg-steel-950 ring-1 ring-inset ring-white/[0.06]">
        <div
          className="absolute inset-0 origin-left rounded-full transition-[transform,background-color] duration-700 ease-[var(--ease-out-soft)]"
          style={{ transform: `scaleX(${fill})`, background: color }}
        />

        {THRESHOLDS.map(({ bits, percent: mark }) => (
          <span
            key={bits}
            className="absolute top-0 h-full w-[3px] -translate-x-1/2 bg-steel-900"
            style={{ left: `${mark}%` }}
          />
        ))}
      </div>

      {!compact ? (
        <div className="relative mt-2 h-4">
          {THRESHOLDS.map(({ bits, percent: mark }) => (
            <span
              key={bits}
              className="absolute -translate-x-1/2 font-mono text-[13px] text-steel-500"
              style={{ left: `${mark}%` }}
            >
              {bits}
            </span>
          ))}
          <span className="absolute right-0 font-mono text-[13px] text-steel-500">128+</span>
        </div>
      ) : null}
    </div>
  )
}
