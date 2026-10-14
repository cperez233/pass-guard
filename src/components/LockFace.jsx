/* editorial-ui · Cristian Pérez · cristianperez.me */
import { motion } from 'motion/react'
import { useId } from 'react'

/** Giro del rotor según el nivel: con una clave excelente la cerradura abre (90°). */
const TURN = { weak: 0, moderate: 22, strong: 48, excellent: 90 }

/**
 * Cara de un cilindro de cerradura. El rotor (con la ranura de la llave) gira
 * hacia "abierto" a medida que la clave activa gana entropía. Decorativa.
 */
export function LockFace({ analysis, className = '' }) {
  const empty = analysis.length === 0
  // Ids únicos: puede haber dos cilindros en la página y uno oculto con display:none.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const angle = empty ? 0 : (TURN[analysis.level.id] ?? 0)

  return (
    <div aria-hidden className={`relative aspect-square ${className}`}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full">
        <defs>
          <radialGradient id={`lock-steel-${uid}`} cx="40%" cy="35%" r="75%">
            <stop offset="0" stopColor="#2c353b" />
            <stop offset="1" stopColor="#13171a" />
          </radialGradient>
          <linearGradient id={`lock-brass-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f0d59b" />
            <stop offset=".5" stopColor="#d9a74a" />
            <stop offset="1" stopColor="#7d5820" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="98" fill={`url(#lock-steel-${uid})`} stroke="rgb(255 255 255 / .07)" />
        {/* Graduación grabada */}
        {Array.from({ length: 36 }, (_, index) => (
          <line
            key={index}
            x1="100"
            y1="8"
            x2="100"
            y2={index % 9 === 0 ? 20 : 14}
            stroke={index % 9 === 0 ? '#d9a74a' : 'rgb(255 255 255 / .16)'}
            strokeWidth={index % 9 === 0 ? 2.5 : 1.2}
            transform={`rotate(${index * 10} 100 100)`}
          />
        ))}
        <circle cx="100" cy="100" r="70" fill={`url(#lock-brass-${uid})`} />
        <circle cx="100" cy="100" r="70" fill="none" stroke="#5a4220" strokeWidth="2" opacity=".6" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="#f6e2b4" strokeWidth="1" opacity=".35" />
      </svg>

      {/* Rotor: capa HTML aparte para que el giro no repinte el SVG grande. */}
      <motion.div
        className="absolute inset-[24%] rounded-full"
        animate={{ rotate: angle }}
        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
      >
        <svg viewBox="0 0 100 100" className="size-full">
          <circle cx="50" cy="50" r="48" fill="#c99638" />
          <circle cx="50" cy="50" r="48" fill="none" stroke="#7d5820" strokeWidth="1.5" />
          <path
            d="M50 14c4.5 0 6 3 6 6v14l5 5-5 5v12l4 4-4 4v16c0 3-1.5 6-6 6s-6-3-6-6V20c0-3 1.5-6 6-6Z"
            fill="#0b0d0f"
          />
        </svg>
      </motion.div>
    </div>
  )
}
