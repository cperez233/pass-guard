/* editorial-ui · Cristian Pérez · cristianperez.me */
import { motion, useAnimationControls, useInView, useMotionValue, useSpring } from 'motion/react'
import { useEffect, useId, useRef } from 'react'
import { useLang } from '../hooks/useLang.js'
import { levelColor } from '../lib/levelStyles.js'

const TICKS = 36
const ease = [0.22, 1, 0.36, 1]

/** Vuelta de llave completa: gira a "abierto" (90°), hace tope y vuelve al inicio. */
const OPEN_TURN = {
  rotate: [0, 97, 90, 90, 0],
  transition: { duration: 1.7, times: [0, 0.36, 0.44, 0.66, 1], ease },
}

/** Prueba corta al cambiar la clave: medio giro y vuelta. */
const TEST_TURN = {
  rotate: [0, 34, 0],
  transition: { duration: 0.55, times: [0, 0.4, 1], ease },
}

/**
 * Cara de un cilindro de cerradura. Al aparecer da una vuelta de apertura y
 * vuelve a su sitio; el anillo de muescas mide la entropía de la clave activa y
 * se enciende con el color de su nivel. Con `interactive`, se inclina hacia el
 * puntero y gira al pulsarlo.
 */
export function LockFace({ analysis, className = '', interactive = false, label }) {
  const empty = analysis.length === 0
  const color = levelColor(analysis)
  const lit = empty ? 0 : Math.round((analysis.percent / 100) * TICKS)
  // Ids únicos: puede haber dos cilindros en la página y uno oculto con display:none.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')

  const shellRef = useRef(null)
  const rotor = useAnimationControls()
  const pulse = useAnimationControls()
  const mounted = useRef(false)

  // Entrada: la primera vez que se ve, la llave abre y vuelve, con un destello en el tope.
  const seen = useInView(shellRef, { once: true, amount: 0.6 })
  useEffect(() => {
    if (!seen) return
    const delay = interactive ? 0.7 : 0.2
    rotor.start({ ...OPEN_TURN, transition: { ...OPEN_TURN.transition, delay } })
    pulse.start({
      opacity: [0, 0.7, 0],
      scale: [0.94, 1.16, 1.22],
      transition: { duration: 0.8, delay: delay + 1.7 * 0.36, ease },
    })
  }, [seen, interactive, rotor, pulse])

  // Cambio de idioma: la cerradura da una vuelta completa, como al abrir.
  const { lang } = useLang()
  const lastLang = useRef(lang)
  useEffect(() => {
    if (lastLang.current === lang) return
    lastLang.current = lang
    rotor.start(OPEN_TURN)
  }, [lang, rotor])

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    if (analysis.password) rotor.start(TEST_TURN)
  }, [analysis.password, rotor])

  // Inclinación hacia el puntero (solo ratón; en táctil no hay puntero que seguir).
  const tiltX = useMotionValue(0)
  const tiltY = useMotionValue(0)
  const rotateX = useSpring(tiltX, { stiffness: 140, damping: 18 })
  const rotateY = useSpring(tiltY, { stiffness: 140, damping: 18 })

  useEffect(() => {
    if (!interactive || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined
    const onMove = (event) => {
      const box = shellRef.current?.getBoundingClientRect()
      if (!box) return
      const dx = (event.clientX - (box.left + box.width / 2)) / window.innerWidth
      const dy = (event.clientY - (box.top + box.height / 2)) / window.innerHeight
      tiltY.set(Math.max(-1, Math.min(1, dx * 2)) * 12)
      tiltX.set(Math.max(-1, Math.min(1, dy * 2)) * -12)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [interactive, tiltX, tiltY])

  const face = (
    <motion.div
      ref={shellRef}
      className="relative aspect-square w-full"
      style={interactive ? { rotateX, rotateY, transformPerspective: 700 } : undefined}
    >
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
        <circle cx="100" cy="100" r="70" fill={`url(#lock-brass-${uid})`} />
        <circle cx="100" cy="100" r="70" fill="none" stroke="#5a4220" strokeWidth="2" opacity=".6" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="#f6e2b4" strokeWidth="1" opacity=".35" />
      </svg>

      {/* Anillo de muescas: medidor de entropía, en HTML para no repintar el SVG. */}
      {Array.from({ length: TICKS }, (_, index) => {
        const major = index % 9 === 0
        const height = major ? 7 : 4.5
        return (
          <span
            key={index}
            className="absolute top-[4%] left-1/2 rounded-full transition-[background-color] duration-300"
            style={{
              width: major ? 'max(1.5px, 1.4%)' : 'max(1px, 0.9%)',
              height: `${height}%`,
              marginLeft: major ? '-0.7%' : '-0.45%',
              transform: `rotate(${index * 10}deg)`,
              transformOrigin: `50% ${((50 - 4) / height) * 100}%`,
              background: index < lit ? color : major ? 'rgb(255 255 255 / 0.28)' : 'rgb(255 255 255 / 0.13)',
              transitionDelay: `${index * 12}ms`,
            }}
          />
        )
      })}

      {/* Destello del tope al abrir. */}
      <motion.span
        aria-hidden
        initial={{ opacity: 0 }}
        animate={pulse}
        className="pointer-events-none absolute inset-[18%] rounded-full ring-2 ring-brass-300"
      />

      {/* Rotor: capa aparte, gira sin repintar el resto. */}
      <motion.div className="absolute inset-[24%] rounded-full" animate={rotor} initial={{ rotate: 0 }}>
        <svg viewBox="0 0 100 100" className="size-full">
          <circle cx="50" cy="50" r="48" fill="#c99638" />
          <circle cx="50" cy="50" r="48" fill="none" stroke="#7d5820" strokeWidth="1.5" />
          <path
            d="M50 14c4.5 0 6 3 6 6v14l5 5-5 5v12l4 4-4 4v16c0 3-1.5 6-6 6s-6-3-6-6V20c0-3 1.5-6 6-6Z"
            fill="#0b0d0f"
          />
        </svg>
      </motion.div>
    </motion.div>
  )

  if (!interactive) {
    return (
      <div aria-hidden className={className}>
        {face}
      </div>
    )
  }

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={() => rotor.start(OPEN_TURN)}
      whileTap={{ scale: 0.96 }}
      className={`block w-full cursor-pointer rounded-full ${className}`}
    >
      {face}
    </motion.button>
  )
}
