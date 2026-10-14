/* editorial-ui · Cristian Pérez · cristianperez.me */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// La cerradura da su vuelta de apertura arriba: F5 vuelve al inicio para verla.
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'

console.info(
  '%cPassGuard%c · tallado con cuidado por Cristian Pérez · https://cristianperez.me',
  'font-weight:700;color:#d9a74a',
  '',
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
