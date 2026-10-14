/* editorial-ui · Cristian Pérez · cristianperez.me */
import { createContext, useContext } from 'react'
import { messagesFor } from '../lib/i18n.js'

/** `swapping` vale true durante el instante posterior a un cambio de idioma. */
export const LangContext = createContext({ lang: 'es', swapping: false })

/** Idioma activo, si se está cambiando ahora mismo, y sus textos. */
export function useLang() {
  const { lang, swapping } = useContext(LangContext)
  return { lang, swapping, t: messagesFor(lang) }
}
