/* editorial-ui · Cristian Pérez · cristianperez.me */
import { useEffect, useRef, useState } from 'react'
import { useLang } from '../hooks/useLang.js'
import { usePrefersReducedMotion } from '../hooks/useReducedMotion.js'
import { secureRandomInt } from '../lib/passwords.js'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#%&*+=?'
const TICK_MS = 38

/**
 * Texto que, al cambiar de idioma, gira como los tambores de la cerradura y se
 * asienta letra a letra de izquierda a derecha. Cualquier otro cambio (el nivel
 * al escribir, "Copiado") se muestra al instante; con movimiento reducido,
 * también el de idioma.
 */
export function ScrambleText({ text, duration = 520 }) {
  const reduced = usePrefersReducedMotion()
  const { swapping } = useLang()
  const [shown, setShown] = useState(text)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return undefined
    }
    if (!swapping) return undefined

    const chars = [...text]
    const start = performance.now()
    let raf = 0
    let lastTick = -Infinity

    const frame = (now) => {
      const elapsed = now - start
      if (reduced || elapsed >= duration) {
        setShown(text)
        return
      }
      if (now - lastTick >= TICK_MS) {
        lastTick = now
        const next = chars
          .map((char, index) => {
            const settleAt = duration * (0.15 + 0.85 * (index / Math.max(chars.length - 1, 1)))
            if (elapsed >= settleAt || char === ' ') return char
            return GLYPHS[secureRandomInt(GLYPHS.length)]
          })
          .join('')
        setShown(next)
      }
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [text, reduced, duration, swapping])

  return swapping && !reduced ? shown : text
}
