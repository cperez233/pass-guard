import { useCallback, useEffect, useRef, useState } from 'react'

/** Respaldo para contextos sin acceso a la Clipboard API (HTTP plano, iframes). */
function legacyCopy(value) {
  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    return document.execCommand('copy')
  } finally {
    document.body.removeChild(textarea)
  }
}

/**
 * Copia al portapapeles con feedback temporal.
 *
 * `navigator.clipboard` existe pero puede rechazar la promesa (contexto no
 * seguro, iframe sin permiso `clipboard-write`), así que el respaldo se intenta
 * también cuando la API moderna falla, no solo cuando no existe.
 */
export function useCopyToClipboard(resetAfter = 2000) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState(null)
  const timeoutRef = useRef(null)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const copy = useCallback(
    async (value) => {
      if (!value) return false

      let succeeded = false

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value)
          succeeded = true
        }
      } catch {
        succeeded = false
      }

      if (!succeeded) {
        try {
          succeeded = legacyCopy(value)
        } catch {
          succeeded = false
        }
      }

      setError(succeeded ? null : new Error('clipboard-unavailable'))
      setCopied(succeeded)

      if (succeeded) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => setCopied(false), resetAfter)
      }

      return succeeded
    },
    [resetAfter],
  )

  return { copied, error, copy }
}
