/* editorial-ui · Cristian Pérez · cristianperez.me */
import { Check, Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.js'
import { useTumblers } from '../hooks/useTumblers.js'

/** Colorea cada carácter por tipo: leer una clave a simple vista es más fácil así. */
function charClass(char) {
  if (char >= '0' && char <= '9') return 'text-[#8fcacb]'
  if (char >= 'a' && char <= 'z') return 'text-steel-200'
  if (char >= 'A' && char <= 'Z') return 'text-white font-semibold'
  return 'text-brass-400'
}

export function PasswordDisplay({ value, onRegenerate, busy = false }) {
  const { copied, error, copy } = useCopyToClipboard()
  const [turns, setTurns] = useState(0)
  const tumblers = useTumblers(value)

  const handleRegenerate = () => {
    // Cada pulsación suma una vuelta completa: el icono gira siempre hacia delante.
    setTurns((current) => current + 1)
    onRegenerate()
  }

  return (
    <div className="relative">
      <div
        className={`relative overflow-hidden rounded-2xl bg-steel-950 px-4 pt-5 pb-4 ring-1 transition-[box-shadow] duration-300 ring-inset sm:px-6 sm:pt-6 ${
          copied ? 'ring-[color:var(--color-strong)]/60' : 'ring-white/[0.07]'
        }`}
      >
        <output
          aria-live="polite"
          aria-label="Contraseña generada"
          className="relative block min-h-[1.45em] font-mono text-[1.45rem] leading-[1.45] tracking-[0.02em] break-all select-all sm:text-[1.9rem] lg:text-[2.15rem]"
        >
          {value ? (
            [...value].map((char, index) => {
              const glyph = tumblers?.[index]
              return (
                // El índice es estable: la cadena se reemplaza entera en cada regeneración.
                <span
                  key={index}
                  data-glyph={glyph ?? undefined}
                  className={`${charClass(char)} ${glyph ? 'tumbling' : ''}`}
                >
                  {char}
                </span>
              )
            })
          ) : (
            <span className="font-sans text-lg text-steel-500">Activa al menos un conjunto de caracteres…</span>
          )}
        </output>

        <div className="relative mt-5 flex items-stretch gap-2.5">
          <button
            type="button"
            onClick={() => copy(value)}
            disabled={!value}
            className={`sheen-host relative inline-flex min-h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl px-4 text-[15px] font-semibold transition-[background-color,color,transform,box-shadow] duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${
              copied
                ? 'bg-[color:var(--color-strong)]/15 text-[color:var(--color-strong)] ring-1 ring-[color:var(--color-strong)]/50'
                : 'bg-brass-400 text-steel-950 shadow-[0_10px_24px_-12px_rgb(217_167_74/0.7),inset_0_1px_0_rgb(255_255_255/0.35)] [@media(hover:hover)]:hover:bg-brass-300'
            }`}
          >
            {!copied ? (
              <span
                aria-hidden
                className="sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/45 to-transparent"
              />
            ) : null}
            {copied ? (
              <>
                <Check className="size-[18px] shrink-0 animate-pop" strokeWidth={2.6} />
                Copiado al portapapeles
              </>
            ) : (
              <>
                <Copy className="size-[18px] shrink-0" strokeWidth={2.2} />
                Copiar contraseña
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRegenerate}
            disabled={busy}
            aria-label="Regenerar contraseña"
            className="group inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-xl bg-steel-800 px-4 text-[15px] font-semibold text-steel-100 ring-1 ring-white/10 transition-[background-color,transform] duration-200 active:scale-[0.96] [@media(hover:hover)]:hover:bg-steel-700"
          >
            <RefreshCw
              className="size-[18px] shrink-0 text-brass-400 transition-transform duration-600 ease-[var(--ease-out-soft)]"
              style={{ transform: `rotate(${turns * 360}deg)` }}
              strokeWidth={2.2}
            />
            <span className="hidden sm:inline">Regenerar</span>
          </button>
        </div>

        {error ? (
          <p className="relative mt-3 text-[14px] text-[color:var(--color-weak)]">
            El navegador bloqueó el portapapeles. Selecciona el texto y copia manualmente.
          </p>
        ) : null}
      </div>
    </div>
  )
}
