/* editorial-ui · Cristian Pérez · cristianperez.me */
import { useLang } from '../hooks/useLang.js'

/**
 * Bloque de texto que, justo después de cambiar de idioma, se revela con un
 * barrido de izquierda a derecha, como una línea recién grabada. En la carga
 * normal y al cambiar de pestaña aparece sin barrido.
 */
export function LangSwap({ children }) {
  const { lang, swapping } = useLang()
  return (
    <span key={lang} className={swapping ? 'lang-swap' : undefined}>
      {children}
    </span>
  )
}
