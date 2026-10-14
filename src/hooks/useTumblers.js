/* editorial-ui · Cristian Pérez · cristianperez.me */
import { useEffect, useState } from 'react'
import { CHARSETS, secureRandomInt } from '../lib/passwords.js'
import { usePrefersReducedMotion } from './useReducedMotion.js'

const GLYPHS = Object.values(CHARSETS).join('')
const TICK_MS = 42

/**
 * Efecto de tambores: al cambiar la clave, cada posición gira por glifos al azar
 * y se asienta de izquierda a derecha. Es solo visual; el valor real ya está en
 * el DOM. Los glifos salen del mismo CSPRNG que la clave (nada de Math.random).
 */
export function useTumblers(value, duration = 560) {
  const reduced = usePrefersReducedMotion()
  const [state, setState] = useState({ value: '', glyphs: null })

  useEffect(() => {
    if (reduced || !value) return undefined

    const chars = [...value]
    const start = performance.now()
    let raf = 0
    let lastTick = -Infinity

    const frame = (now) => {
      const elapsed = now - start
      if (elapsed >= duration) {
        setState({ value, glyphs: null })
        return
      }
      if (now - lastTick >= TICK_MS) {
        lastTick = now
        const glyphs = chars.map((_, index) => {
          const settleAt = duration * (0.25 + 0.75 * (index / Math.max(chars.length - 1, 1)))
          return elapsed >= settleAt ? null : GLYPHS[secureRandomInt(GLYPHS.length)]
        })
        setState({ value, glyphs })
      }
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [value, reduced, duration])

  if (reduced || state.value !== value || !state.glyphs) return null
  return state.glyphs
}
