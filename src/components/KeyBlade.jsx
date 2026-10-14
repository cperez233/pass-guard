/* editorial-ui · Cristian Pérez · cristianperez.me */
import { useId, useMemo } from 'react'
import { useLang } from '../hooks/useLang.js'

/** Profundidad de corte 0-4 por carácter: determinista, la misma clave da la misma llave. */
function cutDepth(char) {
  const code = char.codePointAt(0) ?? 0
  return (code * 7 + (code >> 3)) % 5
}

const BLANK_PINS = 16

/**
 * La llave de PassGuard: el dentado se talla con la contraseña. Cada carácter es
 * un corte; al cambiar la clave, la fresadora recorre la hoja y los dientes se
 * reacomodan en ola de izquierda a derecha. Decorativa: `aria-hidden`.
 */
export function KeyBlade({ value, className = '' }) {
  const chars = useMemo(() => [...value], [value])
  const empty = chars.length === 0
  const { lang } = useLang()
  const gradientId = `bow-brass-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const depths = empty ? Array(BLANK_PINS).fill(0) : chars.map(cutDepth)

  return (
    <div aria-hidden className={`relative flex items-center select-none ${className}`}>
      {/* Cabeza (bow) */}
      <svg viewBox="0 0 64 64" className={`size-14 shrink-0 sm:size-16 ${empty ? 'opacity-40' : ''}`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f3dca6" />
            <stop offset="0.45" stopColor="#d9a74a" />
            <stop offset="1" stopColor="#8a6122" />
          </linearGradient>
        </defs>
        <path
          d="M14 6h28a16 16 0 0 1 16 16v20a16 16 0 0 1-16 16H14A10 10 0 0 1 4 48V16A10 10 0 0 1 14 6Z"
          fill={`url(#${gradientId})`}
        />
        <circle cx="22" cy="32" r="7.5" fill="#101316" />
        <path d="M40 18v28" stroke="#7a561d" strokeWidth="2" strokeLinecap="round" opacity=".55" />
        <path d="M46 18v28" stroke="#7a561d" strokeWidth="2" strokeLinecap="round" opacity=".35" />
      </svg>

      {/* Hombro */}
      <div
        className={`-ml-0.5 h-9 w-2.5 shrink-0 bg-gradient-to-b from-brass-300 via-brass-400 to-brass-500 sm:h-10 ${empty ? 'opacity-40' : ''}`}
      />

      {/* Hoja */}
      <div className={`relative flex min-w-0 flex-1 flex-col [container-type:inline-size] ${empty ? 'opacity-40' : ''}`}>
        <div className="flex h-5 items-end overflow-hidden sm:h-6">
          {depths.map((depth, index) => (
            <span
              key={index}
              className="block h-full min-w-0 flex-1 bg-gradient-to-b from-brass-200 via-brass-300 to-brass-400 transition-transform duration-500 ease-[var(--ease-out-soft)]"
              style={{
                transform: `translateY(${depth * 19}%)`,
                transitionDelay: `${index * (420 / depths.length)}ms`,
                clipPath: 'polygon(0 22%, 50% 0, 100% 22%, 100% 100%, 0 100%)',
              }}
            />
          ))}
        </div>
        <div
          className="relative h-5 bg-gradient-to-b from-brass-400 to-brass-500 sm:h-6"
          style={{ clipPath: 'polygon(0 0, 100% 0, calc(100% - 14px) 100%, 0 100%)' }}
        >
          {/* Ranura (keyway) */}
          <span className="absolute inset-x-0 top-1/2 h-px bg-brass-700/70" />
          <span className="absolute inset-x-0 top-[calc(50%+2px)] h-px bg-brass-200/40" />
        </div>

        {/* Haz de la fresadora: se vuelve a montar con cada clave nueva. */}
        {!empty ? (
          <span
            key={`${value}-${lang}`}
            className="cutter-beam pointer-events-none absolute -top-2 -bottom-1 left-0 w-[3px] rounded-full bg-white"
            style={{
              '--cut-run': 'calc(100cqw)',
              boxShadow: '0 0 10px 2px rgb(255 226 166 / 0.85), 0 0 26px 6px rgb(217 167 74 / 0.45)',
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
