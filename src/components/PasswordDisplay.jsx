import { Check, Copy, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { useCopyToClipboard } from '../hooks/useCopyToClipboard.js'

/** Colorea cada carácter por tipo: leer una clave a simple vista es más fácil así. */
function charClass(char) {
  if (char >= '0' && char <= '9') return 'text-cyan-300'
  if (char >= 'a' && char <= 'z') return 'text-slate-300'
  if (char >= 'A' && char <= 'Z') return 'text-slate-100'
  return 'text-amber-300'
}

export function PasswordDisplay({ value, onRegenerate, busy = false }) {
  const { copied, error, copy } = useCopyToClipboard()
  const [spinning, setSpinning] = useState(false)

  const handleRegenerate = () => {
    setSpinning(true)
    onRegenerate()
    setTimeout(() => setSpinning(false), 450)
  }

  return (
    <div className="relative">
      <div
        className={`relative overflow-hidden rounded-2xl border bg-abyss-950/60 px-4 py-5 transition-colors duration-300 sm:px-5 ${
          copied ? 'border-emerald-400/40' : 'border-white/10'
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/8 via-transparent to-violet-500/8"
        />

        <output
          aria-live="polite"
          aria-label="Contraseña generada"
          className="relative block min-h-14 font-mono text-lg leading-relaxed break-all select-all sm:text-xl"
        >
          {value ? (
            [...value].map((char, index) => (
              // El índice es estable: la cadena se reemplaza entera en cada regeneración.
              <span key={index} className={charClass(char)}>
                {char}
              </span>
            ))
          ) : (
            <span className="text-slate-600">Activa al menos un conjunto de caracteres…</span>
          )}
        </output>

        <div className="relative mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => copy(value)}
            disabled={!value}
            className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/70 disabled:cursor-not-allowed disabled:opacity-40 ${
              copied
                ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/40'
                : 'bg-white/6 text-slate-200 ring-1 ring-white/10 hover:bg-white/10'
            }`}
          >
            {copied ? (
              <>
                <Check className="size-4 animate-pop" strokeWidth={2.5} />
                Copiado al portapapeles
              </>
            ) : (
              <>
                <Copy className="size-4" strokeWidth={2} />
                Copiar contraseña
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRegenerate}
            disabled={busy}
            aria-label="Regenerar contraseña"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500/15 px-4 py-2.5 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-400/30 transition-all duration-200 hover:bg-cyan-500/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400/70"
          >
            <RefreshCw
              className={`size-4 transition-transform duration-500 ${spinning ? 'rotate-[360deg]' : ''}`}
              strokeWidth={2}
            />
            <span className="hidden sm:inline">Regenerar</span>
          </button>
        </div>

        {error ? (
          <p className="relative mt-2 text-[11px] text-rose-400">
            El navegador bloqueó el portapapeles. Selecciona el texto y copia manualmente.
          </p>
        ) : null}
      </div>
    </div>
  )
}
