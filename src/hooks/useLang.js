/* editorial-ui · Cristian Pérez · cristianperez.me */
import { createContext, useContext } from 'react'
import { messagesFor } from '../lib/i18n.js'

export const LangContext = createContext('es')

/** Idioma activo y sus textos. */
export function useLang() {
  const lang = useContext(LangContext)
  return { lang, t: messagesFor(lang) }
}
