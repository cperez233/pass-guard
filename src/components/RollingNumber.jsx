/* editorial-ui · Cristian Pérez · cristianperez.me */
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

const ease = [0.22, 1, 0.36, 1]

/**
 * Número que rueda en la dirección del cambio: si sube entra desde abajo y el
 * anterior sale hacia arriba; si baja, al revés.
 */
export function RollingNumber({ value, className = '' }) {
  // Patrón "estado derivado del render anterior": la dirección se fija al cambiar el valor.
  const [track, setTrack] = useState({ value, direction: 1 })
  if (track.value !== value) {
    const next = Number.parseFloat(value)
    const prev = Number.parseFloat(track.value)
    const direction = Number.isFinite(next) && Number.isFinite(prev) && next < prev ? -1 : 1
    setTrack({ value, direction })
  }
  const { direction } = track

  return (
    <span className={`relative inline-grid overflow-hidden align-bottom tabular-nums ${className}`}>
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.span
          key={String(value)}
          custom={direction}
          className="col-start-1 row-start-1"
          variants={{
            enter: (d) => ({ y: `${d * 90}%`, opacity: 0 }),
            center: { y: '0%', opacity: 1 },
            exit: (d) => ({ y: `${d * -90}%`, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.28, ease }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
