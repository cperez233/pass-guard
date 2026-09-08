import { STRENGTH_LEVELS } from '../lib/analysis.js'

/** Marcas visuales en los umbrales de clasificación (la barra llega a 128 bits). */
const THRESHOLDS = STRENGTH_LEVELS.filter((level) => Number.isFinite(level.max)).map(
  (level) => ({ bits: level.max, percent: (level.max / 128) * 100 }),
)

export function StrengthMeter({ analysis, compact = false }) {
  const { entropy, level, percent, length } = analysis
  const empty = length === 0

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset ${
              empty ? 'bg-slate-500/10 text-slate-400 ring-slate-600/40' : level.chip
            }`}
          >
            {empty ? 'Sin evaluar' : level.label}
          </span>
          {!compact && !empty ? (
            <span className="hidden text-xs text-slate-500 sm:inline">{level.summary}</span>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <span className={`font-mono text-base font-semibold ${empty ? 'text-slate-600' : level.text}`}>
            {entropy.toFixed(1)}
          </span>
          <span className="ml-1 font-mono text-[11px] text-slate-500">bits</span>
        </div>
      </div>

      <div className="relative mt-2.5 h-2 overflow-hidden rounded-full bg-slate-800/80 ring-1 ring-inset ring-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out ${level.bar}`}
          style={{ width: `${empty ? 0 : Math.max(percent, 3)}%` }}
        />

        {THRESHOLDS.map(({ bits, percent: mark }) => (
          <span
            key={bits}
            className="absolute top-0 h-full w-px bg-abyss-900/70"
            style={{ left: `${mark}%` }}
          />
        ))}
      </div>

      {!compact ? (
        <div className="relative mt-1.5 hidden h-3 sm:block">
          {THRESHOLDS.map(({ bits, percent: mark }) => (
            <span
              key={bits}
              className="absolute -translate-x-1/2 font-mono text-[10px] text-slate-600"
              style={{ left: `${mark}%` }}
            >
              {bits}
            </span>
          ))}
          <span className="absolute right-0 font-mono text-[10px] text-slate-600">128+</span>
        </div>
      ) : null}
    </div>
  )
}
